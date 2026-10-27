"""Diff Appendix A against EvalScript's first stack-depth check."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from harness.opcodes import (
    CORE_FIRST_DEPTH,
    UNMODELED_TAIL,
    parse_grids,
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
    print("first-depth mismatches (appendix prefix vs EvalScript's first stack.size check):")
    for opcode, published, core in mismatches:
        print(f"  {opcode:#04x} appendix={published} evalscript_first_depth={core} {UNMODELED_TAIL.get(opcode, '')}")
    assert [m[0] for m in mismatches] == [0x79, 0x7A]
    print("unmodeled tails beyond the prefix:")
    for opcode, note in sorted(UNMODELED_TAIL.items()):
        print(f"  {opcode:#04x} {note}")
    print("OP_IF / OP_NOTIF: EvalScript pops only when fExec is true. Appendix assigns 1 on purpose.")
    print("opcode diff: no other opcode lacks a prefix")


if __name__ == "__main__":
    main()
