"""Adversarial scripts, BOLT 3 spends, and the opcode-adjacent data rules.

Old validity is Bitcoin Core v28.1 regtest. New validity is harness.data_rules
plus harness.analyze. Aggregate caps passed into the checker are fixtures.
The BIP leaves those four numbers TBD. The test does not pick a consensus value.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from embit import compact
from embit.ec import PrivateKey
from embit.hashes import hash160, tagged_hash
from embit.script import Script, Witness, p2tr, p2wsh
from embit.transaction import SIGHASH, Transaction, TransactionInput, TransactionOutput
from embit.util import secp256k1

from harness.analyze import immediate_next, live_paths
from harness.bolt3 import (
    funding_2of2,
    offered_htlc,
    push_data,
    to_local,
)
from harness.data_rules import (
    CONTROL_MAX,
    ITEM_CAP,
    MAX_SCRIPT_ELEMENT_SIZE,
    P2A,
    output_template,
    spend_reasons,
    tx_aggregate_ok,
)
from harness.static_fee import floor_met
from harness.test_static import (
    core_accept,
    new_key,
    rpc_txid,
    send_exact,
    setup_chain,
    sign_p2wpkh,
    wallet_mine,
)

# High fixtures so BOLT scripts are judged by the structural rules, not by a
# number the BIP has not set. The fragmentation test uses its own small fixture.
WIDE = {
    "per_input": 50_000,
    "per_tx": 50_000,
    "tapleaf_push": 50_000,
    "witness_script_push": 50_000,
}
RESULTS = []


def record(category, old_valid, new_reasons, classification, detail):
    row = {
        "bip": "permanent-data-channel-closure",
        "category": category,
        "old_valid": old_valid,
        "new_reasons": new_reasons,
        "classification": classification,
        "detail": detail,
    }
    RESULTS.append(row)
    print(f"  {classification:18} {category}: {detail}")


def accept(tx):
    """Mempool first. If policy flags reject, mine the raw tx with generateblock.

    generateblock checks consensus. DISCOURAGE_OP_SUCCESS and similar standardness
    flags are not consensus. A tx that lands in a block is old-rule valid.
    """
    allowed, info = core_accept(tx.serialize().hex())
    if allowed:
        return True, info
    from harness.cli import CliError, cli
    addr = cli("getnewaddress", wallet="harness")
    try:
        block = cli("generateblock", addr, json.dumps([tx.serialize().hex()]))
    except CliError as exc:
        info = dict(info)
        info["consensus-reject"] = str(exc)
        return False, info
    info = dict(info)
    info["consensus-block"] = block.get("hash") if isinstance(block, dict) else block
    return True, info


def fund_spk(spk: Script, value):
    return send_exact(spk.data.hex(), value)


def p2wsh_tx(prev, script, witness_items, value_in, outputs, sequence=0xFFFFFFFF):
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(prev[0]), prev[1], sequence=sequence)],
        vout=[TransactionOutput(v, spk) for v, spk in outputs],
        locktime=0,
    )
    tx.vin[0].witness = Witness(list(witness_items) + [script])
    return tx


def sign_p2wsh(tx, index, key, script, value):
    msg = tx.sighash_segwit(index, Script(script), value, SIGHASH.ALL)
    sig = key.sign(msg).serialize() + bytes([SIGHASH.ALL])
    return sig


def tap_commit(internal, script, siblings, version=0xC0):
    leaf = tagged_hash("TapLeaf", bytes([version]) + compact.to_bytes(len(script)) + script)
    node = leaf
    for sib in siblings:
        pair = node + sib if node < sib else sib + node
        node = tagged_hash("TapBranch", pair)
    x = internal.xonly()
    tweak = tagged_hash("TapTweak", x + node)
    point = secp256k1.ec_pubkey_parse(b"\x02" + x)
    added = secp256k1.ec_pubkey_add(point, tweak)
    sec = secp256k1.ec_pubkey_serialize(added)
    parity = 1 if sec[0] == 0x03 else 0
    control = bytes([version | parity]) + x + b"".join(siblings)
    spk = Script(b"\x51\x20" + sec[1:33])
    return spk, control, sec[1:33]


def sibling_hashes(n):
    out = []
    for i in range(n):
        dummy = bytes([0x51, i])
        out.append(tagged_hash("TapLeaf", bytes([0xC0]) + compact.to_bytes(len(dummy)) + dummy))
    return out


def test_bolt_immediate_false_positive():
    pub_a, pub_b = new_key().sec(), new_key().sec()
    script = to_local(pub_a, 1, pub_b)
    immediate = immediate_next(script, "witness_v0")
    path = live_paths(script, "witness_v0")
    assert immediate == [], immediate
    assert path["unreferenced"] == []
    record(
        "immediate-next-to-local",
        True,
        [],
        "PASS",
        f"next-opcode flags {immediate} on BOLT 3 to_local. "
        f"The revocation pubkey is followed by OP_ELSE and the delayed pubkey by OP_ENDIF. "
        f"Both are script keys, and OP_CHECKSIG after OP_ENDIF consumes the one the branch executes. "
        f"Path analysis flags {path['unreferenced']}.",
    )


def test_lightning_flow():
    # Cooperative close and a unilateral close that carries one HTLC and a CSV to_local.
    fund_key = new_key()
    delay_key = new_key()
    remote = new_key()
    local_htlc = new_key()
    remote_htlc = new_key()
    funding_script = funding_2of2(fund_key.sec(), remote.sec())
    funding_spk = p2wsh(Script(funding_script))
    txid, vout, value = fund_spk(funding_spk, 500_000)
    close_tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[
            TransactionOutput(200_000, p2wsh(Script(b"\x51"))),
            TransactionOutput(299_000, p2tr(new_key().get_public_key())),
        ],
    )
    # p2tr() needs a public key; used only as a template output. Rebuilt below if this throws.
    sig_a = sign_p2wsh(close_tx, 0, fund_key, funding_script, value)
    sig_b = sign_p2wsh(close_tx, 0, remote, funding_script, value)
    close_tx.vin[0].witness = Witness([b"", sig_a, sig_b, funding_script])
    allowed, info = accept(close_tx)
    reasons = spend_reasons("p2wsh", [b"", sig_a, sig_b, funding_script], b"", WIDE)
    fee = value - 499_000
    fee_ok, _ = floor_met(fee, 2, 20, is_coinbase=False, height=300, activation_height=0)
    assert allowed, info
    assert reasons == []
    assert fee_ok
    record(
        "lightning-cooperative-close",
        True,
        reasons,
        "PASS",
        f"2-of-2 funding spend to two template outputs, fee {fee}, "
        f"static floor at 20 sats met ({fee_ok}). core={allowed}.",
    )

    # Fresh channel for the unilateral path. The cooperative tx above was not broadcast,
    # so the same outpoint is still free. Spend it as the commitment instead.
    delay = 1
    local_script = to_local(fund_key.sec(), delay, delay_key.sec())
    preimage = b"\x42" * 32
    htlc_script = offered_htlc(hash160(fund_key.sec()), remote_htlc.sec(), local_htlc.sec(), hash160(preimage), False)
    to_local_value, htlc_value, remote_value = 200_000, 100_000, 150_000
    fee = value - (to_local_value + htlc_value + remote_value)
    commit = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[
            TransactionOutput(to_local_value, p2wsh(Script(local_script))),
            TransactionOutput(htlc_value, p2wsh(Script(htlc_script))),
            TransactionOutput(remote_value, Script(b"\x00\x14" + hash160(remote.sec()))),
        ],
    )
    sig_a = sign_p2wsh(commit, 0, fund_key, funding_script, value)
    sig_b = sign_p2wsh(commit, 0, remote, funding_script, value)
    commit.vin[0].witness = Witness([b"", sig_a, sig_b, funding_script])
    allowed, info = accept(commit)
    assert allowed, info
    assert spend_reasons("p2wsh", commit.vin[0].witness.items, b"", WIDE) == []
    fee_ok, why = floor_met(fee, 3, 20, is_coinbase=False, height=300, activation_height=0)
    assert fee_ok, why
    # Zero-fee clone: same scripts, outputs sum to the input. Fee rule only.
    zero = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[
            TransactionOutput(200_000, p2wsh(Script(local_script))),
            TransactionOutput(100_000, p2wsh(Script(htlc_script))),
            TransactionOutput(value - 300_000, Script(b"\x00\x14" + hash160(remote.sec()))),
        ],
    )
    z_a = sign_p2wsh(zero, 0, fund_key, funding_script, value)
    z_b = sign_p2wsh(zero, 0, remote, funding_script, value)
    zero.vin[0].witness = Witness([b"", z_a, z_b, funding_script])
    z_ok, z_info = accept(zero)
    z_fee_ok, _ = floor_met(0, 3, 20, is_coinbase=False, height=300, activation_height=0)
    assert spend_reasons("p2wsh", zero.vin[0].witness.items, b"", WIDE) == []
    record(
        "lightning-commitment",
        allowed,
        [],
        "PASS",
        f"commitment fee {fee} meets static_fee 20 × 3 outputs. "
        f"scripts pass path analysis. zero-fee clone core={z_ok} {z_info.get('reject-reason')} "
        f"but the fee floor rejects it ({z_fee_ok}). Script rules are not what rejects it.",
    )
    from harness.cli import cli
    cli("sendrawtransaction", commit.serialize().hex())
    wallet_mine(1)

    # Remote claims the offered HTLC with the preimage. This is the on-chain hop.
    htlc_spend = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(rpc_txid(commit)), 1)],
        vout=[TransactionOutput(htlc_value - 1_000, Script(b"\x00\x14" + hash160(remote_htlc.sec())))],
    )
    htlc_sig = sign_p2wsh(htlc_spend, 0, remote_htlc, htlc_script, htlc_value)
    htlc_spend.vin[0].witness = Witness([htlc_sig, preimage, htlc_script])
    allowed, info = accept(htlc_spend)
    reasons = spend_reasons("p2wsh", htlc_spend.vin[0].witness.items, b"", WIDE)
    assert allowed, info
    assert reasons == []
    record(
        "lightning-htlc-preimage",
        True,
        reasons,
        "PASS",
        "offered-HTLC preimage spend (remote claim) accepted by Core and by Rules 12–13.",
    )

    # CSV close of to_local. The commitment has one confirmation; delay is 1.
    wallet_mine(1)
    csv_spend = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(rpc_txid(commit)), 0, sequence=delay)],
        vout=[TransactionOutput(to_local_value - 1_000, Script(b"\x00\x14" + hash160(delay_key.sec())))],
    )
    local_sig = sign_p2wsh(csv_spend, 0, delay_key, local_script, to_local_value)
    csv_spend.vin[0].witness = Witness([local_sig, b"", local_script])
    allowed, info = accept(csv_spend)
    reasons = spend_reasons("p2wsh", csv_spend.vin[0].witness.items, b"", WIDE)
    assert allowed, info
    assert reasons == []
    assert immediate_next(local_script, "witness_v0") == []
    record(
        "lightning-to-local-csv",
        True,
        reasons,
        "PASS",
        "BOLT 3 to_local CSV spend, delay 1, accepted. The branch-end next-opcode rule accepts the script.",
    )


def test_envelopes_and_items(key):
    data = b"\x11" * 200
    envelope = b"\x00\x63" + push_data(data) + b"\x68\x51"
    spk = p2wsh(Script(envelope))
    txid, vout, value = fund_spk(spk, 80_000)
    tx = p2wsh_tx((txid, vout), envelope, [], value, [(value - 500, Script(b"\x51" + b"\x20" + b"\x22" * 32))])
    # OP_TRUE output is not a template. Use a real p2wpkh.
    dest = Script(b"\x00\x14" + hash160(key.sec()))
    tx = p2wsh_tx((txid, vout), envelope, [], value, [(value - 500, dest)])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2wsh", tx.vin[0].witness.items, b"", WIDE)
    assert allowed, info
    assert "unreferenced-push" in reasons
    record(
        "p2wsh-constant-dead-envelope",
        True,
        reasons,
        "CLOSED",
        f"OP_FALSE OP_IF 200-byte push OP_ENDIF OP_TRUE. core accepts. path analysis rejects {reasons}.",
    )

    bare = push_data(b"\x11" * 400)
    txid, vout, value = fund_spk(p2wsh(Script(bare)), 80_000)
    tx = p2wsh_tx((txid, vout), bare, [], value, [(value - 500, dest)])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2wsh", tx.vin[0].witness.items, b"", WIDE)
    assert allowed, info
    assert "unreferenced-push" in reasons
    record(
        "p2wsh-bare-push-script",
        True,
        reasons,
        "CLOSED",
        "400-byte push as the entire witness script is a true cleanstack under Core and unreferenced here.",
    )

    # Witness-item consume-and-ignore, over and under the 256-byte item cap.
    drop_script = b"\x75\x51"
    for size, expect in ((200, []), (300, ["item-cap"])):
        blob = b"\x22" * size
        txid, vout, value = fund_spk(p2wsh(Script(drop_script)), 80_000)
        tx = p2wsh_tx((txid, vout), drop_script, [blob], value, [(value - 500, dest)])
        allowed, info = accept(tx)
        reasons = spend_reasons("p2wsh", tx.vin[0].witness.items, b"", WIDE)
        assert allowed, (size, info)
        assert reasons == expect, (size, reasons)
        record(
            f"witness-item-{size}",
            True,
            reasons,
            "BOUNDED" if size <= ITEM_CAP else "CLOSED",
            f"{size}-byte OP_DROP argument. core accepts (<= {MAX_SCRIPT_ELEMENT_SIZE}). "
            f"Rule 2 reasons={reasons}. Items over {ITEM_CAP} are closed; items under it are not.",
        )

    # CHECKSIGVERIFY wrapper around a dead envelope.
    wrap_key = new_key()
    wrapped = push_data(wrap_key.sec()) + b"\xad\x00\x63" + push_data(data) + b"\x68\x51"
    txid, vout, value = fund_spk(p2wsh(Script(wrapped)), 80_000)
    tx = p2wsh_tx((txid, vout), wrapped, [], value, [(value - 500, dest)])
    sig = sign_p2wsh(tx, 0, wrap_key, wrapped, value)
    tx.vin[0].witness = Witness([sig, wrapped])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2wsh", tx.vin[0].witness.items, b"", WIDE)
    assert allowed, info
    assert "unreferenced-push" in reasons
    record(
        "op_if-inside-checksigverify",
        True,
        reasons,
        "CLOSED",
        "P2WSH CHECKSIGVERIFY then OP_FALSE OP_IF data OP_ENDIF OP_TRUE. Dead arm is unreferenced.",
    )


def test_nested_conditionals(dest):
    """OP_IF / OP_NOTIF nested, executed, and unexecuted. P2WSH so Rule 7 does not apply."""
    data = push_data(b"\x55" * 180)
    # Outer IF taken. Inner OP_NOTIF condition is true, so its then-arm is not taken.
    nested_dead = b"\x51\x63\x51\x64" + data + b"\x67\x51\x68\x68"
    # OP_NOTIF executes the then-arm because the condition is false. DROP reads the push.
    executed_notif = b"\x00\x64" + data + b"\x75\x51\x68"
    # OP_NOTIF sits in an OP_IF arm the constant condition does not take.
    notif_in_dead_if = b"\x00\x63" + data + b"\x64\x51\x68\x67\x51\x68"
    cases = (
        ("nested-unexecuted-notif", nested_dead, "CLOSED", "unreferenced-push"),
        ("executed-notif-drop", executed_notif, "BOUNDED", None),
        ("notif-inside-unexecuted-if", notif_in_dead_if, "CLOSED", "unreferenced-push"),
    )
    for name, script, classification, expect in cases:
        info = live_paths(script, "witness_v0")
        txid, vout, value = fund_spk(p2wsh(Script(script)), 80_000)
        tx = p2wsh_tx((txid, vout), script, [], value, [(value - 500, dest)])
        allowed, core = accept(tx)
        reasons = spend_reasons("p2wsh", tx.vin[0].witness.items, b"", WIDE)
        assert allowed, (name, core)
        assert not info["old_invalid"], (name, info)
        if expect is None:
            assert reasons == [], (name, reasons, info)
        else:
            assert expect in reasons, (name, reasons, info)
        record(
            name,
            True,
            reasons,
            classification,
            f"core accepts. path unreferenced={info['unreferenced']} reasons={reasons}. "
            + (
                "The push is on a live path and OP_DROP reads it, so Rule 12 does not fire. "
                "Rule 13 would bound the bytes; the cap is still TBD."
                if expect is None
                else "No live path executes the push."
            ),
        )


def test_fragmentation():
    # Fixture caps, not the BIP's TBD parameters.
    fixture = dict(WIDE)
    fixture["per_input"] = 250
    fixture["per_tx"] = 250
    drop_script = b"\x75\x51"
    blob = b"\x33" * 200
    one = spend_reasons("p2wsh", [blob, drop_script], b"", fixture)
    two_items = spend_reasons("p2wsh", [blob, blob, b"\x6d\x51"], b"", fixture)
    assert one == []
    assert "per-input-aggregate" in two_items
    assert tx_aggregate_ok([200, 200, 200], 250) is False
    assert tx_aggregate_ok([200], 250) is True
    record(
        "multi-tx-fragmentation",
        True,
        one,
        "PRICED",
        "Fixture per-input/per-tx cap 250 (not a consensus number; the BIP says TBD). "
        "One 200-byte argument passes. Two 200-byte arguments in one input fail the fixture. "
        "Three transactions of 200 bytes each are each under the cap, so Rules 8 and 9 do not "
        "see the 600-byte total. Each transaction still pays static_fee × its outputs. "
        "Cross-transaction fragmentation is priced, not closed. A per-block data cap is not in the BIP.",
    )


def test_p2sh(dest_key):
    key = new_key()
    data = b"\x44" * 400
    assert len(data) < MAX_SCRIPT_ELEMENT_SIZE
    redeem = push_data(data) + b"\x75" + push_data(key.sec()) + b"\xac"
    assert len(redeem) < MAX_SCRIPT_ELEMENT_SIZE
    spk = Script(b"\xa9\x14" + hash160(redeem) + b"\x87")
    txid, vout, value = fund_spk(spk, 90_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 1_000, Script(b"\x00\x14" + hash160(dest_key.sec())))],
    )
    msg = tx.sighash_legacy(0, Script(redeem), SIGHASH.ALL)
    sig = key.sign(msg).serialize() + bytes([SIGHASH.ALL])
    tx.vin[0].script_sig = Script(push_data(sig) + push_data(redeem))
    allowed, info = accept(tx)
    reasons = spend_reasons("p2sh", [], tx.vin[0].script_sig.data, WIDE)
    assert allowed, info
    assert reasons == []
    record(
        "p2sh-redeem-mixed-push",
        True,
        reasons,
        "BOUNDED",
        f"400-byte data push inside the redeemScript, next to a pubkey push, then OP_DROP and OP_CHECKSIG. "
        f"Core accepts. Rules 12–13 do not run on redeemScripts, and Rule 2 exempts the redeem push. "
        f"Pre-existing MAX_SCRIPT_ELEMENT_SIZE is {MAX_SCRIPT_ELEMENT_SIZE}. Not closed by this BIP.",
    )
    # A non-redeem scriptSig push over 256, still under 520.
    arg = b"\x55" * 300
    redeem2 = b"\x75" + push_data(key.sec()) + b"\xac"
    spk2 = Script(b"\xa9\x14" + hash160(redeem2) + b"\x87")
    txid, vout, value = fund_spk(spk2, 90_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 1_000, Script(b"\x00\x14" + hash160(dest_key.sec())))],
    )
    msg = tx.sighash_legacy(0, Script(redeem2), SIGHASH.ALL)
    sig = key.sign(msg).serialize() + bytes([SIGHASH.ALL])
    tx.vin[0].script_sig = Script(push_data(sig) + push_data(arg) + push_data(redeem2))
    allowed, info = accept(tx)
    reasons = spend_reasons("p2sh", [], tx.vin[0].script_sig.data, WIDE)
    assert allowed, info
    assert "scriptsig-item" in reasons
    record(
        "p2sh-scriptsig-argument-300",
        True,
        reasons,
        "CLOSED",
        "300-byte scriptSig argument (not the redeemScript) is valid under Core and rejected by Rule 2.",
    )


def test_taproot_and_annex(dest):
    internal = new_key()
    envelope = b"\x00\x63" + push_data(b"\x66" * 180) + b"\x68\x51"
    spk, control, _x = tap_commit(internal, envelope, [])
    assert len(control) == 33
    txid, vout, value = fund_spk(spk, 70_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    tx.vin[0].witness = Witness([envelope, control])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2tr", [envelope, control], b"", WIDE)
    assert allowed, info
    assert "op_if" in reasons and "unreferenced-push" in reasons
    record(
        "tapscript-op_if-envelope",
        True,
        reasons,
        "CLOSED",
        "Tapscript OP_FALSE OP_IF payload OP_ENDIF OP_TRUE. Core accepts (leaf version 0xc0). "
        "Rule 7 rejects OP_IF anywhere. Rule 10 also flags the dead push.",
    )

    success = bytes([0x50]) + b"\x11" * 80
    spk, control, _x = tap_commit(internal, success, [])
    txid, vout, value = fund_spk(spk, 70_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    tx.vin[0].witness = Witness([success, control])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2tr", [success, control], b"", WIDE)
    assert allowed, info
    assert "op_success" in reasons
    record(
        "tapscript-op_success",
        True,
        reasons,
        "CLOSED",
        "OP_SUCCESS (0x50) plus 80 payload bytes. "
        f"mempool reject-reason={info.get('reject-reason')!r}; "
        f"consensus block={info.get('consensus-block')}. Rule 6 rejects it. "
        "Mempool policy on Core v28.1 discourages OP_SUCCESS; consensus does not.",
    )

    deep = b"\x51"
    sibs = sibling_hashes(8)
    spk, control, _x = tap_commit(internal, deep, sibs)
    assert len(control) == 33 + 32 * 8
    assert len(control) > CONTROL_MAX
    txid, vout, value = fund_spk(spk, 70_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    tx.vin[0].witness = Witness([deep, control])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2tr", [deep, control], b"", WIDE)
    assert allowed, info
    assert "control-block" in reasons
    record(
        "control-block-289",
        True,
        reasons,
        "CLOSED",
        f"control block {len(control)} bytes (8 merkle steps). Core accepts. Rule 5 rejects above {CONTROL_MAX}.",
    )

    # Undefined leaf version 0xc2. BIP 342 treats it as an upgradable success.
    other = b"\x51"
    spk, control, _x = tap_commit(internal, other, [], version=0xC2)
    txid, vout, value = fund_spk(spk, 70_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    tx.vin[0].witness = Witness([other, control])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2tr", [other, control], b"", WIDE)
    assert allowed, info
    assert "tapleaf-version" in reasons
    record(
        "undefined-tapleaf-version",
        True,
        reasons,
        "CLOSED",
        "Leaf version 0xc2 script-path spend. "
        f"mempool reject-reason={info.get('reject-reason')!r}; "
        f"consensus block={info.get('consensus-block')}. Rule 3 rejects it.",
    )

    # Key-path annex. Signature commits to the annex.
    key = new_key()
    tweaked = key.taproot_tweak(b"")
    spk = p2tr(key.get_public_key())
    txid, vout, value = fund_spk(spk, 70_000)
    annex = b"\x50" + b"\x77" * 200
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    msg = tx.sighash_taproot(0, [spk], [value], sighash=SIGHASH.DEFAULT, annex=annex)
    sig = tweaked.schnorr_sign(msg).serialize()
    tx.vin[0].witness = Witness([sig, annex])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2tr", [sig, annex], b"", WIDE)
    assert allowed, info
    assert reasons == ["annex"]
    # Same bytes, not in the annex position. Key-path with two non-annex items is not a
    # key-path under BIP 341, so Core must reject. That is not a bypass.
    reordered = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    reordered.vin[0].witness = Witness([annex, sig])
    re_ok, re_info = accept(reordered)
    record(
        "annex-and-reorder",
        allowed,
        reasons,
        "CLOSED",
        f"key-path annex {len(annex)} bytes, core={allowed}. Rule 4 rejects. "
        f"Moving the 0x50 item off the end makes core reject ({re_ok} {re_info.get('reject-reason')}). "
        f"BIP 341 only treats the last witness item as an annex. Reordering does not produce a "
        f"valid key-path spend.",
    )

    # Script-path smuggle: 0x50-prefixed blob as a stack item, not the annex.
    leaf = b"\x75\x51"  # drop one witness item, then true
    spk, control, _x = tap_commit(key, leaf, [])
    smuggle = b"\x50" + b"\x12" * 200
    txid, vout, value = fund_spk(spk, 70_000)
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[TransactionOutput(value - 800, dest)],
    )
    tx.vin[0].witness = Witness([smuggle, leaf, control])
    allowed, info = accept(tx)
    reasons = spend_reasons("p2tr", tx.vin[0].witness.items, b"", WIDE)
    assert allowed, info
    assert reasons == []  # 201 bytes, under the 256 item cap, not an annex
    big = b"\x50" + b"\x12" * 300
    tx.vin[0].witness = Witness([big, leaf, control])
    # The prevout script doesn't depend on the witness, so the same outpoint can be
    # checked twice with testmempoolaccept. Core may accept the 301-byte item.
    allowed_big, info_big = accept(tx)
    reasons_big = spend_reasons("p2tr", tx.vin[0].witness.items, b"", WIDE)
    record(
        "annex-smuggle-as-argument",
        allowed,
        reasons_big,
        "BOUNDED",
        f"0x50-prefixed stack item in the middle of a script-path spend is not an annex. "
        f"201-byte item core={allowed} and passes Rule 2. "
        f"301-byte item core={allowed_big} {info_big.get('reject-reason')} reasons={reasons_big}. "
        f"Rule 4 does not see it. Rule 2 closes only the part above {ITEM_CAP} bytes.",
    )


def test_templates(dest):
    # Undefined witness v2 output, then an 84-byte OP_RETURN, then bare multisig shape.
    key = new_key()
    spk_in = Script(b"\x00\x14" + hash160(key.sec()))
    txid, vout, value = fund_spk(spk_in, 100_000)
    v2 = b"\x52\x20" + b"\x11" * 32
    opreturn = b"\x6a\x4c" + bytes([81]) + b"\x22" * 81
    assert len(opreturn) == 84
    bare = b"\x52" + push_data(key.sec()) + push_data(key.sec()) + b"\x52\xae"
    tx = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[
            TransactionOutput(20_000, Script(v2)),
            TransactionOutput(0, Script(opreturn)),
            TransactionOutput(20_000, Script(bare)),
            TransactionOutput(value - 20_000 - 20_000 - 2_000, dest),
        ],
    )
    sign_p2wpkh(tx, 0, key, value)
    allowed, info = accept(tx)
    names = [output_template(o.script_pubkey.data) for o in tx.vout]
    assert allowed, info
    assert names[0] is None and names[1] is None and names[2] is None and names[3] == "p2wpkh"
    assert output_template(P2A) == "p2a"
    assert output_template(b"\x6a\x4c" + bytes([80]) + b"\x22" * 80) == "op_return"
    record(
        "output-templates",
        True,
        ["rule-1"],
        "CLOSED",
        f"Core accepted one tx carrying witness v2, an 84-byte OP_RETURN, and bare multisig. "
        f"Rule 1 names them {names}. An 83-byte OP_RETURN and P2A ({P2A.hex()}) match the whitelist. "
        f"core={allowed} {info.get('reject-reason')}.",
    )


def test_p2a_witness(dest):
    key = new_key()
    txid, vout, value = fund_spk(Script(b"\x00\x14" + hash160(key.sec())), 60_000)
    create = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(txid), vout)],
        vout=[
            TransactionOutput(1_000, Script(P2A)),
            TransactionOutput(value - 1_000 - 500, dest),
        ],
    )
    sign_p2wpkh(create, 0, key, value)
    allowed, info = accept(create)
    assert allowed, info
    assert output_template(P2A) == "p2a"
    from harness.cli import cli
    cli("sendrawtransaction", create.serialize().hex())
    wallet_mine(1)
    parent = rpc_txid(create)
    empty = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(parent), 0)],
        vout=[TransactionOutput(500, dest)],
    )
    empty.vin[0].witness = Witness([])
    # A 0-value change would not cover the fee. The anchor is 1000 sats.
    empty.vout[0] = TransactionOutput(500, dest)
    ok_empty, info_empty = accept(empty)
    dirty = Transaction(
        version=2,
        vin=[TransactionInput(bytes.fromhex(parent), 0)],
        vout=[TransactionOutput(500, dest)],
    )
    dirty.vin[0].witness = Witness([b"\x50" + b"\x99" * 100])
    ok_dirty, info_dirty = accept(dirty)
    reasons = spend_reasons("p2a", [b"\x50" + b"\x99" * 100], b"", WIDE)
    assert ok_empty, info_empty
    assert reasons == ["p2a-witness-not-empty"]
    record(
        "p2a-anchor-witness",
        ok_dirty,
        reasons,
        "CLOSED",
        f"P2A create is a Rule 1 template. Empty-witness spend core={ok_empty}. "
        f"101-byte witness on the same output core={ok_dirty} {info_dirty.get('reject-reason')}. "
        f"Rule for P2A is empty witness only ({reasons}). "
        f"Creating the output still pays the static per-output fee; P2A is not fee-exempt.",
    )


def main():
    print("permanent data channel")
    setup_chain()
    test_bolt_immediate_false_positive()
    dest_key = new_key()
    dest = Script(b"\x00\x14" + hash160(dest_key.sec()))
    test_lightning_flow()
    test_envelopes_and_items(dest_key)
    test_nested_conditionals(dest)
    test_fragmentation()
    test_p2sh(dest_key)
    test_taproot_and_annex(dest)
    test_templates(dest)
    test_p2a_witness(dest)
    out = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, "data.json")
    with open(path, "w") as handle:
        json.dump(RESULTS, handle, indent=2)
    print("wrote", path)


if __name__ == "__main__":
    main()
