"""Appendix A `stack_items_read`, checked against Bitcoin Core.

Source: `EvalScript` in interpreter.cpp and `IsOpSuccess` in script.cpp at
commit b2c45888fde06429e86913fab5e7b7a075f091c3 (the commit the BIP cites).
"""

# First `stack.size() < N` check in EvalScript, before any data-dependent pop.
# Opcodes that fail or push before touching the stack are 0.
# First `stack.size() < N` check. OP_PICK and OP_ROLL are 2, matching Appendix A.
CORE_FIRST_DEPTH = {
    0x63: 1,  # OP_IF, only when executing
    0x64: 1,  # OP_NOTIF, only when executing
    0x69: 1,
    0x6B: 1,
    0x6D: 2,
    0x6E: 2,
    0x6F: 3,
    0x70: 4,
    0x71: 6,
    0x72: 4,
    0x73: 1,
    0x75: 1,
    0x76: 1,
    0x77: 2,
    0x78: 2,
    0x79: 2,
    0x7A: 2,
    0x7B: 3,
    0x7C: 2,
    0x7D: 2,
    0x82: 1,
    0x87: 2,
    0x88: 2,
    0x8B: 1,
    0x8C: 1,
    0x8F: 1,
    0x90: 1,
    0x91: 1,
    0x92: 1,
    0x93: 2,
    0x94: 2,
    0x9A: 2,
    0x9B: 2,
    0x9C: 2,
    0x9D: 2,
    0x9E: 2,
    0x9F: 2,
    0xA0: 2,
    0xA1: 2,
    0xA2: 2,
    0xA3: 2,
    0xA4: 2,
    0xA5: 3,
    0xA6: 1,
    0xA7: 1,
    0xA8: 1,
    0xA9: 1,
    0xAA: 1,
    0xAC: 2,
    0xAD: 2,
    0xAE: 1,  # first check only; cms_pop_count is the tail
    0xAF: 1,
    0xB1: 1,  # flags on; the NOP2 fallback is not modeled
    0xB2: 1,
    0xBA: 3,  # tapscript. v0 fails before the check.
}

# Tail formulas now live in pick_roll_rejects and cms_pop_count. Nothing is left unmodeled.
UNMODELED_TAIL = {}

MAX_PUBKEYS_PER_MULTISIG = 20


def pick_roll_rejects(depth_before, n):
    """True when EvalScript rejects OP_PICK / OP_ROLL.

    interpreter.cpp around line 838: `stack.size() < 2` before the pop, then
    `n < 0 || n >= stack.size()` after popping n. `depth_before` includes n.
    """
    if depth_before < 2:
        return True
    depth_after = depth_before - 1
    return n < 0 or n >= depth_after


def cms_pop_count(nkeys, nsigs):
    """Items CHECKMULTISIG pops, or None when Core rejects the counts.

    Final `i` in the interpreter is `3 + nKeys + nSigs`. The cleanup pops
    `i - 1` argument items and then the dummy, which is `i` pops:
    nKeys, the keys, nSigs, the signatures, and the dummy. Tapscript returns
    before this. `nkeys` must be in 0..20 and `nsigs` in 0..nkeys.
    """
    if nkeys < 0 or nkeys > MAX_PUBKEYS_PER_MULTISIG:
        return None
    if nsigs < 0 or nsigs > nkeys:
        return None
    return 3 + nkeys + nsigs

DISABLED_V0 = {
    0x7E, 0x7F, 0x80, 0x81,  # CAT SUBSTR LEFT RIGHT
    0x83, 0x84, 0x85, 0x86,  # INVERT AND OR XOR
    0x8D, 0x8E,              # 2MUL 2DIV
    0x95, 0x96, 0x97, 0x98, 0x99,  # MUL DIV MOD LSHIFT RSHIFT
}

# Non-zero rows of the named table. Everything else is 0 after the early steps.
NAMED = {
    0x63: 1, 0x64: 1, 0x69: 1, 0x6B: 1, 0x6D: 2, 0x6E: 2, 0x6F: 3,
    0x70: 4, 0x71: 6, 0x72: 4, 0x73: 1, 0x75: 1, 0x76: 1, 0x77: 2,
    0x78: 2, 0x79: 2, 0x7A: 2, 0x7B: 3, 0x7C: 2, 0x7D: 2, 0x82: 1,
    0x87: 2, 0x88: 2, 0x8B: 1, 0x8C: 1, 0x8F: 1, 0x90: 1, 0x91: 1,
    0x92: 1, 0x93: 2, 0x94: 2, 0x9A: 2, 0x9B: 2, 0x9C: 2, 0x9D: 2,
    0x9E: 2, 0x9F: 2, 0xA0: 2, 0xA1: 2, 0xA2: 2, 0xA3: 2, 0xA4: 2,
    0xA5: 3, 0xA6: 1, 0xA7: 1, 0xA8: 1, 0xA9: 1, 0xAA: 1,
    0xAC: 2, 0xAD: 2, 0xAE: 1, 0xAF: 1, 0xB1: 1, 0xB2: 1,
}


def is_op_success(opcode):
    """Bitcoin Core IsOpSuccess, script.cpp, cited commit."""
    return (
        opcode == 80 or opcode == 98
        or 126 <= opcode <= 129
        or 131 <= opcode <= 134
        or 137 <= opcode <= 138
        or 141 <= opcode <= 142
        or 149 <= opcode <= 153
        or 187 <= opcode <= 254
    )


def is_push(opcode):
    return opcode <= 0x4E or opcode == 0x4F or 0x51 <= opcode <= 0x60


def stack_items_read(opcode, kind):
    """Appendix A steps 1–6. `kind` is 'tapscript' or 'witness_v0'."""
    if kind == "tapscript" and is_op_success(opcode):
        return 0
    if kind == "tapscript" and opcode in (0xAE, 0xAF):
        return 0
    if opcode == 0xBA:
        return 3 if kind == "tapscript" else 0
    if kind == "witness_v0" and opcode in DISABLED_V0:
        return 0
    if is_push(opcode):
        return 0
    return NAMED.get(opcode, 0)


def parse_grids(markdown):
    """Read the two Appendix A grids. Returns {'witness_v0': [256], 'tapscript': [256]}."""
    lines = markdown.splitlines()
    grids = {}
    current = None
    for line in lines:
        if "WITNESS_V0" in line and line.startswith("**"):
            current = "witness_v0"
            grids[current] = [None] * 256
            continue
        if line.startswith("**`TAPSCRIPT`"):
            current = "tapscript"
            grids[current] = [None] * 256
            continue
        if current is None or not line.startswith("| `"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        label = cells[0].strip("`")
        if not label.endswith("_"):
            continue
        row = int(label[0], 16)
        values = []
        for cell in cells[1:]:
            cell = cell.strip("`")
            if cell == "":
                continue
            values.append(int(cell))
        if len(values) != 16:
            continue
        for col, value in enumerate(values):
            grids[current][row * 16 + col] = value
    return grids
