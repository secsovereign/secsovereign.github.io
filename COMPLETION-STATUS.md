# Completion status

Channels are the five rows in [The Achievable Floor, §II](/articles/the-achievable-floor#ii-taxonomy-of-channels-by-cost). Status is for the three pre-proposals together. Caps marked TBD in the data BIP are not treated as closed. Provisional `static_fee` is the published 16–20 sat band, not a calibrated constant.

## Dedicated — mixed

- **CLOSED.** `OP_RETURN` whose `scriptPubKey` is longer than 83 bytes. Bare multisig and every non-template `scriptPubKey`, including undefined witness versions at creation. Constant-dead envelopes (`OP_FALSE OP_IF`, nested untaken `OP_NOTIF`, `OP_IF` after `OP_CHECKSIGVERIFY`). Tapscript `OP_IF` and `OP_NOTIF` anywhere, executed or not. A witness script that is only an unread push.
- **BOUNDED.** A push a live path reads and then ignores (`OP_DROP`, executed `OP_NOTIF` plus `OP_DROP`). Rules 11 and 13 cap those bytes. Both caps are TBD, so the bound is not a number yet. P2SH redeemScripts are outside Rules 12–13. Existing consensus still limits an element to 520 bytes and a script to 10,000 (`script.h` at `b2c45888`). A redeemScript that mixes a data push with a real pubkey push stays valid under this BIP inside those limits.
- **PRICED.** Splitting a payload across transactions so each one sits under Rules 8 and 9. Each transaction pays `static_fee × n_outputs` from its own inputs. There is no per-block data cap.
- **OPEN.** Coinbase `scriptSig` / extraNonce. The data BIP leaves it out of scope. Coinbase outputs created after activation still have to match Rule 1. The static fee exempts the coinbase transaction, so a miner can fan out coinbase outputs without paying the floor.

## Unenforced — closed, with one bounded leftover

- **CLOSED.** Spending an undefined witness version or an undefined Tapleaf version. Creating those outputs is already outside Rule 1. `OP_SUCCESS` anywhere in a tapscript, including a byte Core returns success on before the rest of the script would parse. A Taproot annex (last witness item beginning with `0x50` when the stack has at least two items). A control block longer than 257 bytes. A non-empty witness on a P2A output. Core v28.1 still accepts that witness; BIP 433 emptiness is policy there.
- **BOUNDED.** A `0x50`-prefixed witness item that is not last. BIP 341 does not treat it as an annex, and moving a real annex off the end makes the key-path spend invalid under today's rules. Rule 2 caps that item at 256 bytes. Bytes at or under 256 remain.

## Expensive — BOUNDED

Grinding a hash or a key until the embedded bits land in a payment field. The bound is compute, which the article already treats as the cost of this channel. None of the three BIPs adds a consensus check on preimage search.

## Near-free — OPEN

A fake 32-byte x-only key is a valid P2TR template under Rule 1. The output pays the static per-output fee and the dust economics in §VI. The fee prices the output. It does not make the 32 bytes fail a script check. The article's "~2 trial attempts" figure is unchanged and was not remeasured.

## Free — OPEN

P2PKH, P2WPKH, P2SH, and P2WSH hashes, amounts, `nSequence`, `nLockTime`, and ordering. These are the fields a payment uses. The data rules do not reject a hash that happens to carry data. The static fee prices every new output, including one whose 20-byte hash is fake. That is a price, not a validity rule on the hash itself, so this channel stays open.
