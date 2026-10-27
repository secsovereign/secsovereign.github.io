# Findings

## 2026-10-27 branch-end rule and the four opcodes

The next-opcode rule accepts a P2WSH key (33 or 65 bytes) or key-hash (20 bytes) immediately followed by `OP_ELSE` or `OP_ENDIF` when every branch that executes that push ends in `OP_CHECKSIG`, `OP_CHECKSIGVERIFY`, `OP_CHECKSIGADD`, `OP_CHECKMULTISIG`, or `OP_CHECKMULTISIGVERIFY` and that opcode consumes the same push. BOLT 3 `to_local` is that shape. `immediate_next` on `to_local` is now `[]`. A pubkey before `OP_ELSE` with no signature check stays unreferenced. Regtest Core v28.1 still accepts the cooperative 2-of-2 close, the offered-HTLC preimage spend, and the delay-1 `to_local` CSV spend. The other BOLT scripts (`to_remote` with CSV, the anchor script, both HTLCs) still pass the path walk.

`OP_PICK` and `OP_ROLL` are 2 in both Appendix A grids, the same as `EvalScript`'s first check `stack.size() < 2` (interpreter.cpp around line 838). The tail is: pop `n`; fail if `n < 0` or `n >= stack.size()`; read that slot; `OP_ROLL` removes it; both push it. `OP_CHECKMULTISIG` and `OP_CHECKMULTISIGVERIFY` stay 1 in v0 and 0 in tapscript. The v0 tail pops `3 + nKeys + nSigs` items when `nKeys` is in `0..20` and `nSigs` is in `0..nKeys` (final interpreter index `i`, and the cleanup pops `i` items). `UNMODELED_TAIL` is empty. `OP_IF` / `OP_NOTIF` remain 1 on purpose: Core pops them only while executing.

New unit results, not a status change for any other channel:

- `<data> OP_0 OP_PICK` and `OP_0 OP_ROLL` mark that push read. Rule 12 does not fire. The bytes stay under the TBD Rule 13 cap, the same bound as a live `OP_DROP`. The old prefix of 1 left this push unreferenced, which was a false positive against a script that does read it.
- `OP_1 OP_PICK` under a single script push saturates. It does not call that push read. Core rejects the same `n` when the real stack is shorter than `n`.
- An unread push beside `OP_2 <key> <key> OP_2 OP_CHECKMULTISIG` stays unreferenced.

No other closed, priced, or bounded channel in the suite changed.

Harness: Bitcoin Core v28.1 regtest (`bitcoind` 280100) plus the Python checkers in `harness/`. Consensus-discouraged scripts were mined with `generateblock` after `testmempoolaccept` rejected them. Old-valid means Core accepted the transaction under today's consensus. New-valid means `harness/data_rules.py` and `harness/static_fee.py` accept it. Aggregate caps, `persistence_threshold`, `min_tx_count`, `max_tapleaf_push_bytes`, and `max_witness_script_push_bytes` are still TBD in the BIPs. The fragmentation run uses a fixture cap of 250 bytes. That fixture is not a recommended consensus constant. Provisional `static_fee` endpoints 16 and 20, and provisional `k` in 2–4, are the BIPs' own labeled ranges.

Article [§VI](/articles/the-achievable-floor#vi-the-actual-floor) was recomputed from the article's own inputs. Every cell matches (OP_RETURN 1,039/1,024 = 1.01; envelope (43+256)/1,024 = 0.29; P2WPKH dust 294 from `3000 × 98 / 1000`; P2TR dust 330 from `3000 × 110 / 1000`; fee columns at 10, 50, and 100 sat/vB). No article table was edited. The §III row label still says "Taproot envelope push cap". The mechanism in that section's prose, in §VII, and in the data BIP is Tapscript `OP_IF` / `OP_NOTIF` invalidation.

## False positives

BOLT 3 `to_local` puts the revocation pubkey before `OP_ELSE` and the delayed pubkey before `OP_ENDIF`. Both pushes are script keys, and `OP_CHECKSIG` consumes the one the branch executes. The branch-end rule accepts them. The path walk flags none. Regtest accepted the delay-1 CSV spend.

Scripts the new rules accept, and Core accepts: 2-of-2 funding spend (cooperative close, fee 1,000, two outputs, static floor at 20 met), commitment with `to_local`, offered HTLC, and a P2WPKH remote output (fee 50,000 meets 20 × 3), offered-HTLC preimage spend, `to_remote` with CSV, anchor `OP_IFDUP`, received HTLC, 83-byte `OP_RETURN`, P2A creation (`51024e73`), and an empty-witness P2A spend. The harness builds these BOLT 3 scripts and spends them. It does not run a Lightning daemon, and it does not forward an HTLC across a second channel.

Tapscript `OP_IF` anywhere is rejected, including a branch a wallet meant to execute. The data BIP already states that Taproot Miniscript and taproot-channel HTLC leaves must split. That is an intentional compatibility break. The regtest envelope contains the opcode. A separate monetary tapscript with `OP_CHECKSIG` inside `OP_IF` was not signed.

## Bypass categories

| Category | Old rules | New rules | Status |
|---|---|---|---|
| P2WSH `OP_FALSE OP_IF` 200-byte push `OP_ENDIF` | Core accepts | `unreferenced-push` | CLOSED |
| Same envelope inside `OP_CHECKSIGVERIFY` | Core accepts | `unreferenced-push` | CLOSED |
| Nested `OP_IF` whose inner `OP_NOTIF` arm is not taken | Core accepts | `unreferenced-push` | CLOSED |
| `OP_NOTIF` inside an `OP_IF` arm the constant does not take | Core accepts | `unreferenced-push` | CLOSED |
| Executed `OP_NOTIF` with `OP_DROP` of a 180-byte push | Core accepts | no script reason under the wide fixture | BOUNDED by TBD Rule 13 |
| Tapscript `OP_IF` envelope, leaf version `0xc0` | Core accepts | Rule 7 and Rule 10 | CLOSED |
| 400-byte push as the entire P2WSH script | Core accepts (cleanstack) | `unreferenced-push` | CLOSED |
| 200-byte witness argument to `OP_DROP` | Core accepts (≤ 520) | Rule 2 silent | BOUNDED |
| 300-byte witness argument to `OP_DROP` | Core accepts (≤ 520) | `item-cap` | CLOSED above 256 |
| Adjacent unreferenced push beside a push `OP_DROP` reads | analyzer flags indexes 0 and 2 | `unreferenced-push` | CLOSED. Unit case in `test_analyze.py`; the read push stays |
| `OP_SUCCESS` `0x50` plus 80 bytes | Mempool: `OP_SUCCESSx reserved for soft-fork upgrades`. `generateblock` included it | Rule 6 | CLOSED. Policy already discourages it; consensus does not |
| Control block 289 bytes (8 merkle steps) | Core accepts | Rule 5 | CLOSED above 257 |
| Tapleaf version `0xc2` | Mempool: version reserved. `generateblock` included it | Rule 3 | CLOSED |
| Key-path annex, 201 bytes, last stack item | Core accepts | Rule 4 | CLOSED |
| Same `0x50` item moved off the end | Core rejects: invalid Taproot control block size | not a valid key-path spend | CLOSED. Reordering does not defeat classification |
| `0x50`-prefixed middle script-path argument, 201 bytes | Core accepts | Rule 4 does not see it; Rule 2 passes | BOUNDED |
| Same argument, 301 bytes | Core accepts | `item-cap` | CLOSED above 256 |
| Witness v2 output, 84-byte `OP_RETURN`, bare multisig | Core accepts with `acceptnonstdtxn=1` | Rule 1 | CLOSED |
| 83-byte `OP_RETURN` and P2A `51024e73` | Core accepts | Rule 1 matches | legitimate; kept |
| P2A spend with a 101-byte witness | Core accepts. BIP 433 emptiness is policy in v28.1 | `p2a-witness-not-empty` | CLOSED |
| P2SH redeemScript: 400-byte data, pubkey, `OP_DROP`, `OP_CHECKSIG` | Core accepts | Rules 12–13 do not run; redeem push exempt from Rule 2 | BOUNDED by `MAX_SCRIPT_ELEMENT_SIZE` 520 and `MAX_SCRIPT_SIZE` 10000 (`script.h` at `b2c45888`) |
| 300-byte `scriptSig` push that is not the redeemScript | Core accepts | Rule 2 | CLOSED |
| Two 200-byte arguments in one input, fixture cap 250 | each item ≤ 256 | per-input aggregate fails | BOUNDED once a cap is set. 250 is a fixture |
| Three transactions of 200 bytes each | each passes the fixture | Rules 8–9 do not see the 600-byte total | PRICED by `static_fee × n_outputs` on each transaction. No per-block data cap is in the BIP |
| Parent `tx_fee = 20`, 2 outputs, child fee 150,240 | Core accepts both | parent misses 16×2 and 20×2 | CLOSED as a fee bypass. Package fee does not count |
| Parent `tx_fee = 0`, 3 outputs, one P2A | Core accepts | misses the floor at 16 and at 20 | CLOSED. BOLT 3 `zero_fee_commitments` and `option_anchors` must put the floor on the commitment |
| 100×100 P2WPKH | weight 39,541 then 39,542; vsize 9,886 both | floor 1,600 at 16 sats, 2,000 at 20 | fee math holds. Core accepted 1,599, 1,600, and 2,000. The floor rejects 1,599 at both endpoints, accepts 1,600 only at 16, accepts 2,000 at both. A 1 sat/vB fee is 9,886 sats and clears both. Measured transactions, not a chain statistic |
| Dynamic persistence else-branch | integer fixture, not a chain | old candidate stays 80; replacement falls to 4 and `active_fee` returns to static 20 | fixed in the dynamic BIP. Fixtures: `k = 4`, `alpha_n = 1000`, threshold 5,000 milli-sat/vB, previous dynamic 80, two windows of 1,000 rates at 1,000 milli-sat/vB |
| `k` at the stated corners | derived | products 10, 20, 20, and 40 sats | at `k = 2` and 5 sat/vB the scaled value is 10, below both static endpoints, so `active_fee` stays on `static_fee` |

A path with more than 64 states, or a `CHECKMULTISIG` whose `nKeys` or `nSigs` is not a script constant, does not flag leftovers on that path. A push no live path executes is still unreferenced. Rules 11 and 13 still count push bytes. No saturation script was broadcast. That residual is BOUNDED by the TBD push caps, and untested as a concrete transaction.

Coinbase `scriptSig` is out of scope. Coinbase outputs still face Rule 1. The static fee exempts the coinbase transaction, so output fan-out there is miner-dependent. The unit checker covers the exemption. A custom coinbase was not mined.

## Appendix A against `EvalScript`

Source: Bitcoin Core commit `b2c45888`, the commit named in the data BIP. `stack_items_read` matches both published 256-byte grids. `test_opcodes.py` checks every byte.

`OP_PICK`, `OP_ROLL`, `OP_CHECKMULTISIG`, and `OP_CHECKMULTISIGVERIFY` are modeled. See the entry at the top of this file. `OP_IF` / `OP_NOTIF` stay 1 on purpose: Core pops them only when `fExec` is set, and the path walk uses the condition. Disabled v0 opcodes return 0 before the switch. `OP_CHECKSIGADD` is 3 in tapscript and 0 in v0. `0xff` is not an `OP_SUCCESS` byte.
