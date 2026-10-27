"""BOLT 3 scripts must survive path analysis and the branch-end next-opcode rule."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from embit.ec import PrivateKey
from embit.hashes import hash160

from harness.analyze import immediate_next, live_paths, push_constant_bytes
from harness.bolt3 import (
    anchor_output,
    funding_2of2,
    offered_htlc,
    push_data,
    received_htlc,
    to_local,
    to_remote_csv,
)

KEYS = [PrivateKey(bytes([i + 1]) + b"\x11" * 31) for i in range(6)]
PUBS = [k.sec() for k in KEYS]


def check(name, script, expect_clean=True):
    path = live_paths(script, "witness_v0")
    immediate = immediate_next(script, "witness_v0")
    print(
        f"{name}: path_unreferenced={path['unreferenced']} "
        f"old_invalid={path['old_invalid']} immediate={immediate} "
        f"push_bytes={push_constant_bytes(script)}"
    )
    if expect_clean:
        assert path["unreferenced"] == [], name
        assert path["old_invalid"] is False, name
    return path, immediate


def main():
    rev = hash160(PUBS[0])
    pay = hash160(b"\x22" * 32)
    local = to_local(PUBS[0], 144, PUBS[1])
    path, immediate = check("to_local", local)
    assert immediate == [], immediate
    check("funding", funding_2of2(PUBS[2], PUBS[3]))
    check("to_remote_csv", to_remote_csv(PUBS[4]))
    check("anchor", anchor_output(PUBS[5]))
    check("offered", offered_htlc(rev, PUBS[2], PUBS[3], pay, False))
    check("offered_anchors", offered_htlc(rev, PUBS[2], PUBS[3], pay, True))
    check("received", received_htlc(rev, PUBS[2], PUBS[3], pay, 500, False))
    check("received_anchors", received_htlc(rev, PUBS[2], PUBS[3], pay, 500, True))

    # Constant-dead envelope. OP_TRUE is the success value. Data is never executed.
    data = b"\x11" * 200
    envelope = b"\x00\x63" + bytes([0x4c, len(data)]) + data + b"\x68\x51"
    env = live_paths(envelope, "witness_v0")
    print("envelope", env)
    assert env["unreferenced"], "dead-arm payload must be unreferenced"
    assert env["old_invalid"] is False

    # Live consume-and-ignore is referenced. The byte cap, not this test, bounds it.
    drop = push_data(data) + b"\x75\x51"
    dropped = live_paths(drop, "witness_v0")
    print("drop", dropped, "bytes", push_constant_bytes(drop))
    assert dropped["parse_error"] is False
    assert dropped["unreferenced"] == []
    assert live_paths(b"\x51", "witness_v0")["unreferenced"] == []

    # Adjacent push that nothing reads.
    junk = b"\x33" * 40
    adjacent = bytes([len(junk)]) + junk + b"\x51\x75\x51"
    adj = live_paths(adjacent, "witness_v0")
    print("adjacent", adj)
    assert adj["unreferenced"]

    # Key before OP_ELSE with no signature check stays invalid.
    key = PUBS[0]
    hanging = b"\x63" + push_data(key) + b"\x67\x51\x68"
    hang_path, hang_immediate = check("hanging-key", hanging, expect_clean=False)
    assert hang_path["unreferenced"], hang_path
    assert hang_immediate, hang_immediate

    # OP_PICK / OP_ROLL read the selected push. That is the OP_DROP bound, not a new reject.
    blob = push_data(b"\x44" * 40)
    picked = live_paths(blob + b"\x00\x79\x75\x75\x51", "witness_v0")
    rolled = live_paths(blob + b"\x00\x7a\x75\x51", "witness_v0")
    assert picked["unreferenced"] == [], picked
    assert rolled["unreferenced"] == [], rolled
    # n = 1 selects a slot below the script push. Do not call that push read.
    missed = live_paths(blob + b"\x51\x79\x75\x51", "witness_v0")
    assert missed["unreferenced"] == [], missed
    buried = b"\x51\x79\x00\x63" + push_data(b"\xab" * 20) + b"\x68\x51"
    assert live_paths(buried, "witness_v0")["unreferenced"]
    extra = funding_2of2(PUBS[2], PUBS[3]) + push_data(b"\x99" * 30) + b"\x61"
    assert live_paths(extra, "witness_v0")["unreferenced"]

    print("analyze: bolt scripts pass; branch-end keys need a signature check")


if __name__ == "__main__":
    main()
