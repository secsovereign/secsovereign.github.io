"""Diff Appendix A against EvalScript's first stack-depth check."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from harness.opcodes import (
    CORE_FIRST_DEPTH,
    UNMODELED_TAIL,
    cms_pop_count,
    parse_grids,
    pick_roll_rejects,
    stack_items_read,
)

BIP = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "bips",
    "permanent-data-channel-closure",
    "index.md",
)


def main():
    text = open(BIP, encoding="utf-8").read()
    grids = parse_grids(text)
    assert set(grids) == {"witness_v0", "tapscript"}
    for kind, grid in grids.items():
        assert all(v is not None for v in grid), kind
        for opcode in range(256):
            got = stack_items_read(opcode, kind)
            assert got == grid[opcode], (kind, hex(opcode), got, grid[opcode])
    mismatches = []
    for opcode in range(256):
        # The published grid is the witness-v0 table, then tapscript overrides.
        published = stack_items_read(opcode, "witness_v0")
        if opcode == 0xBA:
            # v0 grid is 0. Core's depth-3 check is tapscript-only and is gated
            # by a BAD_OPCODE return before the check.
            core = 0
        else:
            core = CORE_FIRST_DEPTH.get(opcode, 0)
        if published != core:
            mismatches.append((opcode, published, core))
    print("grid matches stack_items_read for all 256 bytes, both kinds")
    assert mismatches == [], mismatches
    assert UNMODELED_TAIL == {}
    # EvalScript OP_PICK / OP_ROLL: depth < 2 fails, then n < 0 or n >= depth after the pop.
    assert pick_roll_rejects(1, 0) is True
    assert pick_roll_rejects(2, 0) is False
    assert pick_roll_rejects(2, 1) is True
    assert pick_roll_rejects(3, 1) is False
    assert pick_roll_rejects(3, -1) is True
    # CHECKMULTISIG final i = 3 + nKeys + nSigs, and the cleanup pops i items.
    assert cms_pop_count(2, 2) == 7
    assert cms_pop_count(0, 0) == 3
    assert cms_pop_count(20, 20) == 43
    assert cms_pop_count(21, 1) is None
    assert cms_pop_count(1, 2) is None
    print("OP_PICK, OP_ROLL, OP_CHECKMULTISIG, OP_CHECKMULTISIGVERIFY: tails match EvalScript")
    print("OP_IF / OP_NOTIF: EvalScript pops only when fExec is true. Appendix assigns 1 on purpose.")
    print("opcode diff: no unmodeled opcode")


if __name__ == "__main__":
    main()
