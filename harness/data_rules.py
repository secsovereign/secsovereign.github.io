"""Permanent data-channel rules.

Aggregate caps are arguments. The BIP leaves them TBD; callers pass fixtures
and the test output says so. 256-byte items, 83-byte OP_RETURN, 257-byte
control blocks, and the template bytes are from the BIP.

Pre-existing Core limits cited from script.h at b2c45888:
MAX_SCRIPT_ELEMENT_SIZE = 520, MAX_SCRIPT_SIZE = 10000.
"""

import hashlib

from harness.analyze import live_paths, parse_script, push_constant_bytes
from harness.opcodes import is_op_success

P2A = bytes.fromhex("51024e73")
ITEM_CAP = 256
OPRETURN_MAX = 83
CONTROL_MAX = 257
MAX_SCRIPT_ELEMENT_SIZE = 520
MAX_SCRIPT_SIZE = 10000


def _push_ops(raw):
    ops = parse_script(raw)
    if ops is None:
        return None
    return ops


def is_push_op(opcode):
    return opcode <= 0x4E or opcode == 0x4F or 0x51 <= opcode <= 0x60


def op_return_ok(spk):
    if len(spk) > OPRETURN_MAX or not spk or spk[0] != 0x6A:
        return False
    ops = _push_ops(spk[1:])
    if ops is None or len(ops) > 1:
        return False
    if len(ops) == 1 and not is_push_op(ops[0].opcode):
        return False
    return True


def output_template(spk):
    """Return a name, or None if Rule 1 rejects the scriptPubKey."""
    if op_return_ok(spk):
        return "op_return"
    if spk == P2A:
        return "p2a"
    if (
        len(spk) == 35
        and spk[0] == 33
        and spk[-1] == 0xAC
        and spk[1] in (2, 3)
    ):
        return "p2pk"
    if len(spk) == 67 and spk[0] == 65 and spk[1] == 4 and spk[-1] == 0xAC:
        return "p2pk_uncompressed"
    if spk[:3] == b"\x76\xa9\x14" and spk[-2:] == b"\x88\xac" and len(spk) == 25:
        return "p2pkh"
    if spk[:2] == b"\xa9\x14" and spk[-1:] == b"\x87" and len(spk) == 23:
        return "p2sh"
    if spk[:2] == b"\x00\x14" and len(spk) == 22:
        return "p2wpkh"
    if spk[:2] == b"\x00\x20" and len(spk) == 34:
        return "p2wsh"
    if spk[:2] == b"\x51\x20" and len(spk) == 34:
        return "p2tr"
    return None


def script_sig_pushes(script_sig):
    ops = _push_ops(script_sig)
    if ops is None:
        return None
    if any(not is_push_op(op.opcode) for op in ops):
        return None
    return ops


def witness_view(program, witness):
    """Classify witness items.

    Returns (args, script, control, annex, error).
    `args` are the script-argument items Rules 2, 8, and 9 count.
    """
    items = list(witness)
    if program == "p2a":
        if items:
            return None, None, None, None, "p2a-witness-not-empty"
        return [], None, None, None, None
    if program == "p2wpkh":
        return items, None, None, None, None
    if program == "p2wsh":
        if not items:
            return None, None, None, None, "p2wsh-empty"
        return items[:-1], items[-1], None, None, None
    if program == "p2tr":
        annex = None
        if len(items) >= 2 and items[-1][:1] == b"\x50":
            annex = items[-1]
            items = items[:-1]
            return None, None, None, annex, "annex"
        if len(items) == 1:
            # Key-path signature. Excluded from script-argument totals.
            return [], None, None, None, None
        if len(items) >= 2:
            script, control = items[-2], items[-1]
            return items[:-2], script, control, None, None
        return None, None, None, None, "p2tr-empty"
    return None, None, None, None, "unclassified"


def opcode_bytes(raw):
    """Opcodes successfully read. Truncation stops the walk and sets the flag.

    Core's tapscript OP_SUCCESS scan returns success on the first success
    byte, before a later truncated push would be a parse error.
    """
    found = []
    i = 0
    while i < len(raw):
        opcode = raw[i]
        i += 1
        found.append(opcode)
        if is_op_success(opcode):
            # The rest of the script is not required to parse.
            return found, True
        n = None
        if 1 <= opcode <= 75:
            n = opcode
        elif opcode == 0x4C:
            if i >= len(raw):
                return found, False
            n = raw[i]
            i += 1
        elif opcode == 0x4D:
            if i + 2 > len(raw):
                return found, False
            n = int.from_bytes(raw[i:i + 2], "little")
            i += 2
        elif opcode == 0x4E:
            if i + 4 > len(raw):
                return found, False
            n = int.from_bytes(raw[i:i + 4], "little")
            i += 4
        if n is not None:
            if i + n > len(raw):
                return found, False
            i += n
    return found, True


def script_body_ok(script, kind, push_cap):
    """Rules 6, 7, 10, 11 or 12, 13 depending on kind."""
    reasons = []
    if kind == "tapscript":
        opcodes, complete = opcode_bytes(script)
        if any(is_op_success(opcode) for opcode in opcodes):
            reasons.append("op_success")
        if any(opcode in (0x63, 0x64) for opcode in opcodes):
            reasons.append("op_if")
        if not complete and "op_success" not in reasons:
            reasons.append("script-parse")
    info = live_paths(script, kind)
    if info.get("parse_error"):
        reasons.append("script-parse")
    elif info["unreferenced"]:
        reasons.append("unreferenced-push")
    total = push_constant_bytes(script)
    if total is None:
        reasons.append("script-parse")
    elif push_cap is not None and total > push_cap:
        reasons.append("push-cap")
    return reasons


def spend_reasons(program, witness, script_sig, caps, *, grandfathered=False):
    """Rules 2–13 for one post-activation input. Empty list means the input passes.

    `caps` keys: per_input, per_tx (checked by the caller across inputs),
    tapleaf_push, witness_script_push. None means "not applying that cap"
    which tests must not use when they claim a calibrated value. Pass a
    fixture integer.
    """
    if grandfathered:
        return []
    if program == "p2sh":
        ops = script_sig_pushes(script_sig)
        if ops is None:
            return ["scriptsig-parse"]
        reasons = []
        for op in ops[:-1]:
            if len(op.payload or b"") > ITEM_CAP:
                reasons.append("scriptsig-item")
        # The redeemScript is the last push. Rules 12 and 13 do not apply.
        # Pre-existing consensus still caps it at MAX_SCRIPT_ELEMENT_SIZE.
        return reasons
    args, script, control, annex, error = witness_view(program, witness)
    if error == "annex":
        return ["annex"]
    if error:
        return [error]
    reasons = []
    for item in args:
        if len(item) > ITEM_CAP:
            reasons.append("item-cap")
    if caps.get("per_input") is not None:
        if sum(len(item) for item in args) > caps["per_input"]:
            reasons.append("per-input-aggregate")
    if program == "p2wsh" and script is not None:
        reasons += script_body_ok(script, "witness_v0", caps.get("witness_script_push"))
    if program == "p2tr" and script is not None:
        if control is None or len(control) > CONTROL_MAX:
            reasons.append("control-block")
        if control is not None and len(control) >= 1 and (control[0] & 0xFE) != 0xC0:
            reasons.append("tapleaf-version")
        reasons += script_body_ok(script, "tapscript", caps.get("tapleaf_push"))
    return reasons


def tx_aggregate_ok(arg_lengths, per_tx):
    if per_tx is None:
        return True
    return sum(arg_lengths) <= per_tx


def sha256(data):
    return hashlib.sha256(data).digest()
