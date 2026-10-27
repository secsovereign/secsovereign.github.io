"""Regtest checks for the static per-output miner fee.

Old-rule acceptance is whatever Bitcoin Core v28.1 regtest accepts.
New-rule acceptance is harness.static_fee. The provisional band is 16 and
20 sats, taken from the BIP, not calibrated here.
"""

import json
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from embit.ec import PrivateKey
from embit.networks import NETWORKS
from embit.script import Witness, p2wpkh, witness_p2wpkh
from embit.transaction import SIGHASH, Transaction, TransactionInput, TransactionOutput
from embit.script import Script, p2pkh_from_p2wpkh

from harness.cli import CliError, cli, ensure_bitcoind
from harness.static_fee import floor_met, product_ok, required_fee

WALLET = "harness"
NET = NETWORKS["regtest"]
ACTIVATION = 0  # rule under test applies at every height
# BIP 433: OP_1 OP_PUSHBYTES_2 0x4e73. The push opcode is 0x02, not 0x20.
P2A = Script(bytes.fromhex("51024e73"))
RESULTS = []


def record(category, old_valid, new_valid, classification, detail, **extra):
    row = {
        "bip": "static-per-output-miner-fee",
        "category": category,
        "old_valid": old_valid,
        "new_valid": new_valid,
        "classification": classification,
        "detail": detail,
    }
    row.update(extra)
    RESULTS.append(row)
    print(f"  {classification:18} {category}: {detail}")


def new_key():
    return PrivateKey(os.urandom(32))


def sats_addr(priv):
    spk = p2wpkh(priv.get_public_key())
    return spk, spk.address(NET)


def rpc_txid(tx):
    return tx.txid().hex()


def sign_p2wpkh(tx, index, priv, value):
    pub = priv.get_public_key()
    script_code = p2pkh_from_p2wpkh(p2wpkh(pub))
    msg = tx.sighash_segwit(index, script_code, value, SIGHASH.ALL)
    sig = priv.sign(msg)
    tx.vin[index].witness = witness_p2wpkh(sig, pub, SIGHASH.ALL)


def core_accept(raw_hex):
    res = cli("testmempoolaccept", json.dumps([raw_hex]))
    return bool(res[0]["allowed"]), res[0]


def send_exact(spk_hex, value_sats):
    """Pay `value_sats` to a script from the wallet. Returns (txid, vout, value)."""
    unspent = cli("listunspent", 1, 9999999, wallet=WALLET)
    if not unspent:
        raise RuntimeError("wallet has no utxos")
    coin = max(unspent, key=lambda u: u["amount"])
    coin_sats = int((Decimal(str(coin["amount"])) * Decimal(10**8)).to_integral_value())
    fee = 2000
    change = coin_sats - value_sats - fee
    if change <= 0:
        raise RuntimeError(f"coin too small: {coin_sats}")
    change_addr = cli("getrawchangeaddress", wallet=WALLET)
    funded = cli(
        "createrawtransaction",
        json.dumps([{"txid": coin["txid"], "vout": coin["vout"]}]),
        json.dumps({change_addr: str(Decimal(change) / Decimal(10**8))}),
    )
    base = Transaction.from_string(funded)
    base.vout.append(TransactionOutput(value_sats, Script(bytes.fromhex(spk_hex))))
    signed = cli("signrawtransactionwithwallet", base.serialize().hex(), wallet=WALLET)
    if not signed["complete"]:
        raise RuntimeError(signed)
    txid = cli("sendrawtransaction", signed["hex"])
    wallet_mine(1)
    raw = tx_details(txid)
    for i, out in enumerate(raw["vout"]):
        if out["scriptPubKey"]["hex"] == spk_hex and int(Decimal(str(out["value"])) * Decimal(10**8)) == value_sats:
            return txid, i, value_sats
    raise RuntimeError("funded output not found")


def tx_details(txid):
    """Confirmed transactions are not in the mempool. The wallet still has the hex."""
    try:
        return cli("getrawtransaction", txid, 1)
    except CliError:
        info = cli("gettransaction", txid, wallet=WALLET)
        decoded = cli("decoderawtransaction", info["hex"])
        decoded["hex"] = info["hex"]
        return decoded


def wallet_mine(n):
    addr = cli("getnewaddress", wallet=WALLET)
    cli("generatetoaddress", str(n), addr, wallet=WALLET)


def setup_chain():
    ensure_bitcoind()
    wallets = cli("listwallets")
    if WALLET not in wallets:
        try:
            cli("createwallet", WALLET)
        except CliError:
            cli("loadwallet", WALLET)
    height = cli("getblockcount")
    if height < 101:
        wallet_mine(101 - height)


def make_tx(inputs, outputs):
    """inputs: list of (txid_hex, vout, sequence). outputs: list of (value, Script)."""
    vin = [
        TransactionInput(bytes.fromhex(txid), vout, sequence=seq)
        for txid, vout, seq in inputs
    ]
    vout = [TransactionOutput(v, spk) for v, spk in outputs]
    return Transaction(version=2, vin=vin, vout=vout, locktime=0)


def core_and_floor(raw_tx, tx_fee, n_outputs, category, detail, *, expect_core=True):
    raw = raw_tx.serialize().hex()
    try:
        allowed, info = core_accept(raw)
    except CliError as exc:
        allowed, info = False, {"reject-reason": str(exc)}
    if expect_core and not allowed:
        record(category, False, None, "SETUP", f"core rejected: {info}. {detail}")
        return info
    news = {}
    for static_fee in (16, 20):
        ok, why = floor_met(
            tx_fee, n_outputs, static_fee,
            is_coinbase=False, height=200, activation_height=ACTIVATION,
        )
        news[static_fee] = (ok, why)
    # Classification is about the fee rule, not about Core.
    both_reject = (not news[16][0]) and (not news[20][0])
    both_accept = news[16][0] and news[20][0]
    if both_reject:
        klass = "CLOSED"
    elif both_accept:
        klass = "PASS"
    else:
        klass = "BAND"
    record(
        category,
        allowed,
        {"16": news[16][0], "20": news[20][0]},
        klass,
        f"{detail} core={allowed} fee={tx_fee} n={n_outputs} "
        f"at16={news[16][1]} at20={news[20][1]}",
        fee=tx_fee,
        n_outputs=n_outputs,
        vsize=None,
    )
    return info


def test_arithmetic():
    assert required_fee(100, 16) == 1600
    assert required_fee(100, 20) == 2000
    assert required_fee(1000, 16) == 16000
    assert required_fee(100_000, 20) == 2_000_000
    assert product_ok(20, 32_258)
    assert not product_ok(20, (1 << 64) // 20 + 1)
    ok, why = floor_met(0, 0, 20, is_coinbase=False, height=1, activation_height=0)
    assert ok and why == "ok"
    ok, why = floor_met(0, 5, 20, is_coinbase=True, height=1, activation_height=0)
    assert ok and why == "exempt"
    ok, why = floor_met(0, 5, 20, is_coinbase=False, height=1, activation_height=10)
    assert ok and why == "exempt"
    ok, why = floor_met(19, 1, 20, is_coinbase=False, height=10, activation_height=10)
    assert not ok
    record(
        "arithmetic",
        None,
        True,
        "SPEC",
        "100×16=1600, 100×20=2000, 100000×20=2000000; uint64 overflow rejects; "
        "coinbase and pre-activation exempt; n_outputs=0 meets the product",
    )


def test_empty_vout():
    # One input, no outputs. Pre-existing consensus, not the fee rule.
    unspent = cli("listunspent", 1, 9999999, wallet=WALLET)
    coin = unspent[0]
    tx = make_tx([(coin["txid"], coin["vout"], 0xFFFFFFFF)], [])
    # Unsigned, but CheckTransaction runs before signatures in testmempoolaccept.
    allowed, info = core_accept(tx.serialize().hex())
    reason = info.get("reject-reason", "")
    record(
        "zero-output",
        allowed,
        "fee-formula-would-pass",
        "PRE-EXISTING",
        f"core reject-reason={reason!r}. The fee formula holds for n_outputs=0 "
        f"({required_fee(0, 20)} sats) but CheckTransaction already rejects empty vout. "
        f"The n_outputs=0 case is not a spendable exemption.",
    )


def _our_utxo(value):
    priv = new_key()
    spk = p2wpkh(priv.get_public_key())
    txid, vout, sats = send_exact(spk.data.hex(), value)
    return priv, txid, vout, sats


def test_band_and_coinjoin():
    priv = new_key()
    pub = priv.get_public_key()
    spk = p2wpkh(pub)
    # 100 outputs the wallet pays to us, then one transaction spends them all.
    amt = Decimal("0.001")
    outputs = {spk.address(NET): str(amt)}
    # sendmany once with 100 keys of the same address is one output.
    # Create 100 distinct keys so there are 100 inputs.
    keys = [new_key() for _ in range(100)]
    pay = {}
    spks = []
    for k in keys:
        s = p2wpkh(k.get_public_key())
        spks.append(s)
        pay[s.address(NET)] = "0.001"
    txid = cli("sendmany", "", json.dumps(pay), wallet=WALLET)
    wallet_mine(1)
    raw = tx_details(txid)
    utxos = []
    for vout, out in enumerate(raw["vout"]):
        hexspk = out["scriptPubKey"]["hex"]
        for k, s in zip(keys, spks):
            if hexspk == s.data.hex():
                sats = int((Decimal(str(out["value"])) * Decimal(10**8)).to_integral_value())
                utxos.append((k, txid, vout, sats))
    assert len(utxos) == 100, len(utxos)
    total_in = sum(u[3] for u in utxos)

    def build(fee):
        each, rem = divmod(total_in - fee, 100)
        assert each > 0
        outputs = []
        for i in range(100):
            val = each + (1 if i < rem else 0)
            outputs.append((val, p2wpkh(keys[i % 100].get_public_key())))
        tx = make_tx([(u[1], u[2], 0xFFFFFFFF) for u in utxos], outputs)
        for i, u in enumerate(utxos):
            sign_p2wpkh(tx, i, u[0], u[3])
        return tx

    # Measure the exactly-2000-sat transaction. Signature grinding makes vsize
    # a property of this construction.
    tx2000 = build(2000)
    decoded = cli("decoderawtransaction", tx2000.serialize().hex())
    vsize = decoded["vsize"]
    weight = decoded["weight"]
    assert decoded["vout"].__len__() == 100
    rate16 = Decimal(1600) / Decimal(vsize)
    rate20 = Decimal(2000) / Decimal(vsize)
    record(
        "coinjoin-100-output-fee-math",
        None,
        None,
        "MEASURED",
        f"100 P2WPKH inputs, 100 P2WPKH outputs, Core v28.1 decoderawtransaction "
        f"vsize={vsize} weight={weight}. Provisional floor 1600 sats "
        f"({rate16:.6f} sat/vB) or 2000 sats ({rate20:.6f} sat/vB). "
        f"Signer is embit ECDSA with low-R grinding. Not a chain statistic.",
        vsize=vsize,
        weight=weight,
        rate16=str(rate16),
        rate20=str(rate20),
    )

    for fee, label in ((1599, "below-both"), (1600, "exact-16"), (2000, "exact-20"), (2001, "overpay")):
        tx = build(fee)
        allowed, info = core_accept(tx.serialize().hex())
        at16, w16 = floor_met(fee, 100, 16, is_coinbase=False, height=300, activation_height=0)
        at20, w20 = floor_met(fee, 100, 20, is_coinbase=False, height=300, activation_height=0)
        if fee < 1600:
            klass = "CLOSED"
        elif fee < 2000:
            klass = "BAND"
        else:
            klass = "PASS"
        record(
            f"coinjoin-100-{label}",
            allowed,
            {"16": at16, "20": at20},
            klass,
            f"fee={fee} core_allowed={allowed} reason={info.get('reject-reason')} "
            f"at16={w16} at20={w20}. A 1 sat/vB weight fee on vsize {vsize} is "
            f"{vsize} sats, which is above both provisional floors, so a normally "
            f"fee'd 100-output transaction is not rejected.",
        )


def test_cpfp_independent():
    priv, txid, vout, sats = _our_utxo(100_000)
    # 2 outputs, fee 20 sats: below 16×2=32 and below 20×2=40.
    anchor_value = 240
    other = sats - 20 - anchor_value
    assert other > 0
    parent = make_tx(
        [(txid, vout, 0xFFFFFFFF)],
        [(other, p2wpkh(priv.get_public_key())), (anchor_value, P2A)],
    )
    sign_p2wpkh(parent, 0, priv, sats)
    parent_fee = 20
    assert sats - other - anchor_value == parent_fee
    allowed, info = core_accept(parent.serialize().hex())
    at16, _ = floor_met(parent_fee, 2, 16, is_coinbase=False, height=300, activation_height=0)
    at20, _ = floor_met(parent_fee, 2, 20, is_coinbase=False, height=300, activation_height=0)
    assert not at16 and not at20

    # Child spends the anchor plus a fresh wallet-funded input and pays a large fee.
    child_priv, ctxid, cvout, csats = _our_utxo(200_000)
    # Broadcast parent so the child has a prevout Core can see. testmempoolaccept
    # of the child alone needs the parent in the mempool or a chain.
    if allowed:
        cli("sendrawtransaction", parent.serialize().hex())
    child_out = 50_000
    # inputs: anchor 240 + csats. fee = 240+csats-50000.
    child = make_tx(
        [
            (rpc_txid(parent), 1, 0xFFFFFFFF),
            (ctxid, cvout, 0xFFFFFFFF),
        ],
        [(child_out, p2wpkh(child_priv.get_public_key()))],
    )
    # Anchor input has an empty witness. P2A is unencumbered at consensus in Core 28.
    child.vin[0].witness = Witness([])
    sign_p2wpkh(child, 1, child_priv, csats)
    child_fee = anchor_value + csats - child_out
    try:
        child_ok, child_info = core_accept(child.serialize().hex())
    except CliError as exc:
        child_ok, child_info = False, {"reject-reason": str(exc)}
    child16, _ = floor_met(child_fee, 1, 16, is_coinbase=False, height=300, activation_height=0)
    # The parent is judged only on parent_fee. Adding child_fee must not flip it.
    rescued16, _ = floor_met(parent_fee + child_fee, 2, 16, is_coinbase=False, height=300, activation_height=0)
    record(
        "cpfp-package-independent",
        allowed and child_ok,
        {"parent16": at16, "parent20": at20, "child16": child16, "naive_sum_would_pass": rescued16},
        "CLOSED",
        f"parent fee {parent_fee} < 32 and < 40 with 2 outputs, core_parent={allowed} "
        f"{info.get('reject-reason')}. child fee {child_fee} core_child={child_ok} "
        f"{child_info.get('reject-reason')}. Summing the child into the parent would "
        f"clear the floor ({rescued16}) and is not the rule. P2A script={P2A.data.hex()}.",
    )


def test_zero_fee_parent():
    priv, txid, vout, sats = _our_utxo(50_000)
    # Three outputs, fee 0. BOLT zero_fee_commitments shape, values not a real channel.
    a, b, c = 20_000, 20_000, 10_000
    assert a + b + c == sats
    parent = make_tx(
        [(txid, vout, 0xFFFFFFFF)],
        [
            (a, p2wpkh(priv.get_public_key())),
            (b, p2wpkh(new_key().get_public_key())),
            (c, P2A),
        ],
    )
    sign_p2wpkh(parent, 0, priv, sats)
    allowed, info = core_accept(parent.serialize().hex())
    at16, _ = floor_met(0, 3, 16, is_coinbase=False, height=300, activation_height=0)
    at20, _ = floor_met(0, 3, 20, is_coinbase=False, height=300, activation_height=0)
    record(
        "zero-fee-anchor-parent",
        allowed,
        {"16": at16, "20": at20},
        "CLOSED",
        f"fee 0, 3 outputs including P2A {c} sats. core={allowed} "
        f"{info.get('reject-reason')}. A child spend of the anchor cannot supply "
        f"the parent's floor. BOLT 3 zero_fee_commitments must put "
        f"static_fee×n_outputs on the commitment itself.",
    )


def test_p2a_spend_empty():
    priv, txid, vout, sats = _our_utxo(80_000)
    # Creation pays a fee above the floor so creation itself is not the question.
    anchor = 240
    change = sats - 1000 - anchor
    create = make_tx(
        [(txid, vout, 0xFFFFFFFF)],
        [(change, p2wpkh(priv.get_public_key())), (anchor, P2A)],
    )
    sign_p2wpkh(create, 0, priv, sats)
    create_fee = 1000
    ok16, _ = floor_met(create_fee, 2, 16, is_coinbase=False, height=300, activation_height=0)
    assert ok16
    allowed, info = core_accept(create.serialize().hex())
    record(
        "p2a-create-pays-floor",
        allowed,
        True,
        "PASS",
        f"P2A output is not fee-exempt. create fee {create_fee} for 2 outputs "
        f"meets 16 and 20. core={allowed} {info.get('reject-reason')}.",
    )
    if not allowed:
        return
    cli("sendrawtransaction", create.serialize().hex())
    # Empty-witness spend of the anchor, plus a funding input so the child has value.
    fund_priv, ftxid, fvout, fsats = _our_utxo(50_000)
    spend = make_tx(
        [(rpc_txid(create), 1, 0xFFFFFFFF), (ftxid, fvout, 0xFFFFFFFF)],
        [(fsats + anchor - 500, p2wpkh(fund_priv.get_public_key()))],
    )
    spend.vin[0].witness = Witness([])
    sign_p2wpkh(spend, 1, fund_priv, fsats)
    allowed_s, info_s = core_accept(spend.serialize().hex())
    # Non-empty witness on the same prevout. Core 28 consensus treats a 2-byte
    # witness v1 program as anyone-can-spend, so extra witness items are not a
    # consensus failure. Policy may still reject them.
    dirty = make_tx(
        [(rpc_txid(create), 1, 0xFFFFFFFF), (ftxid, fvout, 0xFFFFFFFF)],
        [(fsats + anchor - 500, p2wpkh(fund_priv.get_public_key()))],
    )
    dirty.vin[0].witness = Witness([b"\x50" + b"\x11" * 80])
    sign_p2wpkh(dirty, 1, fund_priv, fsats)
    try:
        allowed_d, info_d = core_accept(dirty.serialize().hex())
    except CliError as exc:
        allowed_d, info_d = False, {"reject-reason": str(exc)}
    record(
        "p2a-empty-witness-spend",
        allowed_s,
        "empty-witness-only",
        "PASS" if allowed_s else "SETUP",
        f"empty witness core={allowed_s} {info_s.get('reject-reason')}. "
        f"80-byte annex-tagged witness on the P2A input core={allowed_d} "
        f"{info_d.get('reject-reason')}. Spend-side emptiness is a data-channel "
        f"rule; this test only checks the fee BIP still charges the child for "
        f"its own outputs (fee 500, 1 output, floor met).",
    )


def test_opreturn_counts():
    priv, txid, vout, sats = _our_utxo(40_000)
    # 83-byte scriptPubKey: OP_RETURN PUSHDATA1 80 <80 bytes> = 1+1+1+80 = 83.
    payload = b"\x22" * 80
    opreturn = Script(b"\x6a\x4c" + bytes([80]) + payload)
    assert len(opreturn.data) == 83
    change = sats - 30 - 0
    tx = make_tx(
        [(txid, vout, 0xFFFFFFFF)],
        [(change, p2wpkh(priv.get_public_key())), (0, opreturn)],
    )
    sign_p2wpkh(tx, 0, priv, sats)
    fee = 30
    allowed, info = core_accept(tx.serialize().hex())
    at16, w16 = floor_met(fee, 2, 16, is_coinbase=False, height=300, activation_height=0)
    # 30 < 32, so even a small OP_RETURN tx misses a 16-sat floor.
    record(
        "opreturn-counts-as-output",
        allowed,
        {"16": at16},
        "CLOSED" if not at16 else "PASS",
        f"OP_RETURN scriptPubKey length {len(opreturn.data)} is an output. "
        f"fee {fee} with 2 outputs: {w16}. core={allowed} {info.get('reject-reason')}. "
        f"OP_RETURN is not exempt.",
    )


def test_coinbase_exempt_unit():
    ok, why = floor_met(0, 50, 20, is_coinbase=True, height=500, activation_height=0)
    record(
        "coinbase-exempt",
        None,
        ok,
        "MINER-DEPENDENT",
        f"checker returns {why} for a coinbase with 50 outputs and tx_fee 0. "
        f"Only the miner can create that transaction. Not broadcast: Core builds "
        f"the coinbase inside generatetoaddress.",
    )


def main():
    print("static per-output fee")
    setup_chain()
    info = cli("getnetworkinfo")
    print("  core", info["version"], "blocks", cli("getblockcount"))
    test_arithmetic()
    test_empty_vout()
    test_coinbase_exempt_unit()
    test_band_and_coinjoin()
    test_cpfp_independent()
    test_zero_fee_parent()
    test_p2a_spend_empty()
    test_opreturn_counts()
    out = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, "static.json")
    with open(path, "w") as f:
        json.dump(RESULTS, f, indent=2)
    print("wrote", path)
    failed = [r for r in RESULTS if r["classification"] == "SETUP"]
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
