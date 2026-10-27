"""Unreferenced-push analysis.

A push is unreferenced when no live path executes it, or when a path that
executes it never reads it and it is not the sole true success value of at
most 4 bytes. A key or key-hash immediately followed by OP_ELSE or OP_ENDIF
is referenced when every branch that executes it ends in a signature check
that consumes that same push. BOLT 3 to_local is that shape.
"""

from harness.opcodes import is_op_success, is_push, stack_items_read

OP_IF, OP_NOTIF, OP_ELSE, OP_ENDIF = 0x63, 0x64, 0x67, 0x68


class Op:
    def __init__(self, opcode, payload, push_index):
        self.opcode = opcode
        self.payload = payload
        self.push_index = push_index


class Item:
    def __init__(self, origin, payload, num, truth):
        self.origin = origin
        self.payload = payload
        self.num = num
        self.truth = truth


class Path:
    def __init__(self):
        self.stack = []
        self.executed = set()
        self.referenced = set()
        self.failed = False
        self.saturated = False
        self.sig_refs = set()
        self.hash_refs = set()
        self.stack_unknown = False
        self.unknown_before = set()

    def clone(self):
        other = Path()
        other.stack = list(self.stack)
        other.executed = set(self.executed)
        other.referenced = set(self.referenced)
        other.failed = self.failed
        other.saturated = self.saturated
        other.sig_refs = set(self.sig_refs)
        other.hash_refs = set(self.hash_refs)
        other.stack_unknown = self.stack_unknown
        other.unknown_before = set(self.unknown_before)
        return other


def parse_script(raw):
    ops = []
    i = 0
    push_index = 0
    while i < len(raw):
        opcode = raw[i]
        i += 1
        payload = None
        if opcode == 0x00:
            payload = b""
        elif 1 <= opcode <= 75:
            payload = raw[i:i + opcode]
            if len(payload) != opcode:
                return None
            i += opcode
        elif opcode == 0x4C:
            if i >= len(raw):
                return None
            n = raw[i]
            i += 1
            payload = raw[i:i + n]
            if len(payload) != n:
                return None
            i += n
        elif opcode == 0x4D:
            if i + 2 > len(raw):
                return None
            n = int.from_bytes(raw[i:i + 2], "little")
            i += 2
            payload = raw[i:i + n]
            if len(payload) != n:
                return None
            i += n
        elif opcode == 0x4E:
            if i + 4 > len(raw):
                return None
            n = int.from_bytes(raw[i:i + 4], "little")
            i += 4
            payload = raw[i:i + n]
            if len(payload) != n:
                return None
            i += n
        elif opcode == 0x4F:
            payload = b"\x81"
        elif 0x51 <= opcode <= 0x60:
            payload = bytes([opcode - 0x50])
        idx = None
        if is_push(opcode):
            idx = push_index
            push_index += 1
        ops.append(Op(opcode, payload, idx))
    return ops


def cast_to_bool(payload):
    for i, byte in enumerate(payload):
        if byte != 0:
            if i == len(payload) - 1 and byte == 0x80:
                return False
            return True
    return False


def script_num(payload):
    if payload is None or len(payload) > 4:
        return None
    if len(payload) == 0:
        return 0
    value = int.from_bytes(payload, "little")
    sign_bit = 0x80 << (8 * (len(payload) - 1))
    if payload[-1] & 0x80:
        return -(value & ~sign_bit)
    return value


def pop(path):
    if not path.stack:
        return Item(None, None, None, None)
    return path.stack.pop()


def mark(path, item):
    if item.origin is not None:
        path.referenced.add(item.origin)


def push_item(path, op):
    num = script_num(op.payload)
    truth = cast_to_bool(op.payload) if op.payload is not None else None
    path.stack.append(Item(op.push_index, op.payload, num, truth))
    path.executed.add(op.push_index)


def comp(num=None, truth=None):
    return Item(None, None, num, truth)


def is_pubkey(payload, kind):
    """Pubkey encoding the signature opcode can consume. v0 is 33 or 65; tapscript is 32."""
    if payload is None:
        return False
    if kind == "tapscript":
        return len(payload) == 32
    return len(payload) in (33, 65)


def is_branch_key(payload, kind):
    """Key or key-hash that may sit immediately before OP_ELSE / OP_ENDIF."""
    if payload is None:
        return False
    if kind == "tapscript":
        return len(payload) in (20, 32)
    return len(payload) in (20, 33, 65)


def note_hash(path, item):
    if item.origin is not None and item.payload is not None and len(item.payload) == 20:
        path.hash_refs.add(item.origin)


def note_sig(path, item, kind):
    if item.origin is not None and is_pubkey(item.payload, kind):
        path.sig_refs.add(item.origin)
    path.sig_refs |= path.hash_refs


def split_conditional(ops, start):
    depth = 0
    else_at = None
    for j in range(start, len(ops)):
        opcode = ops[j].opcode
        if opcode in (OP_IF, OP_NOTIF):
            depth += 1
        elif opcode == OP_ELSE and depth == 1:
            if else_at is not None:
                return None
            else_at = j
        elif opcode == OP_ENDIF:
            depth -= 1
            if depth == 0:
                if else_at is None:
                    return ops[start + 1:j], [], j + 1
                return ops[start + 1:else_at], ops[else_at + 1:j], j + 1
    return None


def apply(op, path, kind):
    """Return the successor paths. An empty list is not used; failure sets path.failed."""
    if path.failed or path.saturated:
        return [path]
    opcode = op.opcode
    if is_push(opcode):
        push_item(path, op)
        return [path]
    if kind == "tapscript" and opcode in (0xAE, 0xAF):
        path.failed = True
        return [path]
    if opcode == 0xBA and kind != "tapscript":
        path.failed = True
        return [path]
    if kind == "witness_v0" and stack_items_read(opcode, kind) == 0 and opcode in {
        0x7E, 0x7F, 0x80, 0x81, 0x83, 0x84, 0x85, 0x86, 0x8D, 0x8E, 0x95, 0x96, 0x97, 0x98, 0x99,
    }:
        path.failed = True
        return [path]

    def pop_n(n):
        items = []
        for _ in range(n):
            item = pop(path)
            mark(path, item)
            items.append(item)
        return items

    # Rearrangements and inspect-only opcodes used by BOLT 3 and standard scripts.
    if opcode == 0x76:  # DUP
        item = path.stack[-1] if path.stack else pop(path)
        mark(path, item)
        if path.stack:
            path.stack.append(item)
        else:
            path.stack.append(item)
        return [path]
    if opcode == 0x73:  # IFDUP
        item = path.stack[-1] if path.stack else pop(path)
        mark(path, item)
        if not path.stack:
            path.stack.append(item)
        if item.truth is True:
            path.stack.append(item)
            return [path]
        if item.truth is False:
            return [path]
        yes = path.clone()
        yes.stack[-1] = Item(item.origin, item.payload, item.num, True)
        yes.stack.append(yes.stack[-1])
        no = path
        no.stack[-1] = Item(item.origin, item.payload, item.num, False)
        return [yes, no]
    if opcode == 0x7C:  # SWAP
        b, a = pop(path), pop(path)
        mark(path, b)
        mark(path, a)
        path.stack.append(b)
        path.stack.append(a)
        return [path]
    if opcode == 0x75:  # DROP
        mark(path, pop(path))
        return [path]
    if opcode == 0x6D:  # 2DROP
        mark(path, pop(path))
        mark(path, pop(path))
        return [path]
    if opcode == 0x82:  # SIZE
        item = path.stack[-1] if path.stack else pop(path)
        mark(path, item)
        if not path.stack:
            path.stack.append(item)
        length = len(item.payload) if item.payload is not None else None
        path.stack.append(comp(num=length))
        return [path]
    if opcode in (0xB1, 0xB2):  # CLTV, CSV
        item = path.stack[-1] if path.stack else pop(path)
        mark(path, item)
        if not path.stack:
            path.stack.append(item)
        return [path]
    if opcode in (0x6A,):  # RETURN
        path.failed = True
        return [path]
    if opcode in (0x61, 0xB0, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xAB):
        return [path]
    if opcode == 0x69:  # VERIFY
        item = pop(path)
        mark(path, item)
        if item.truth is False:
            path.failed = True
        return [path]
    if opcode in (0x87, 0x88):  # EQUAL, EQUALVERIFY
        b, a = pop(path), pop(path)
        mark(path, b)
        mark(path, a)
        truth = None
        if a.payload is not None and b.payload is not None:
            truth = a.payload == b.payload
        elif a.num is not None and b.num is not None:
            truth = a.num == b.num
        note_hash(path, a)
        note_hash(path, b)
        if opcode == 0x88:
            if truth is False:
                path.failed = True
            return [path]
        path.stack.append(comp(truth=truth))
        return [path]
    if opcode in (0xAC, 0xAD):  # CHECKSIG, CHECKSIGVERIFY. Top is the pubkey.
        pubkey = pop(path)
        sig = pop(path)
        mark(path, pubkey)
        mark(path, sig)
        note_sig(path, pubkey, kind)
        if opcode == 0xAD:
            return [path]
        path.stack.append(comp())
        return [path]
    if opcode == 0xBA:  # CHECKSIGADD. Top is the pubkey.
        pubkey = pop(path)
        num = pop(path)
        sig = pop(path)
        mark(path, pubkey)
        mark(path, num)
        mark(path, sig)
        note_sig(path, pubkey, kind)
        path.stack.append(comp())
        return [path]
    if opcode in (0x79, 0x7A):  # PICK, ROLL. Depth check is 2, then n, then the slot.
        def stack_lost():
            # Keep walking later opcodes. Pushes already on the stack are not
            # guessed; pushes after this point still count.
            if not path.stack_unknown:
                path.unknown_before = set(path.executed)
                path.stack_unknown = True
            path.stack = [comp()]
            return [path]

        if len(path.stack) < 2:
            return stack_lost()
        n_item = pop(path)
        mark(path, n_item)
        n = n_item.num
        if n is not None and n < 0:
            path.failed = True
            return [path]
        if n is None or n >= len(path.stack):
            return stack_lost()
        index = len(path.stack) - 1 - n
        item = path.stack[index]
        mark(path, item)
        if opcode == 0x7A:
            del path.stack[index]
        path.stack.append(Item(item.origin, item.payload, item.num, item.truth))
        return [path]
    if opcode in (0xAE, 0xAF):
        # nKeys, that many keys, nSigs, that many sigs, then the dummy.
        nkeys_item = pop(path)
        mark(path, nkeys_item)
        nkeys = nkeys_item.num
        if nkeys is None or nkeys < 0 or nkeys > 20:
            path.saturated = True
            return [path]
        for _ in range(nkeys):
            key = pop(path)
            mark(path, key)
            note_sig(path, key, kind)
        nsigs_item = pop(path)
        mark(path, nsigs_item)
        nsigs = nsigs_item.num
        if nsigs is None or nsigs < 0 or nsigs > nkeys:
            path.saturated = True
            return [path]
        for _ in range(nsigs):
            mark(path, pop(path))
        mark(path, pop(path))
        path.sig_refs |= path.hash_refs
        if opcode == 0xAE:
            path.stack.append(comp(truth=True))
        return [path]
    if opcode in (0xA6, 0xA7, 0xA8, 0xA9, 0xAA):
        mark(path, pop(path))
        path.stack.append(comp())
        return [path]
    # Generic: pop the appendix prefix and push a computed value.
    n = stack_items_read(opcode, kind)
    if n == 0 and opcode not in (OP_IF, OP_NOTIF, OP_ELSE, OP_ENDIF):
        # Unknown or failing opcode with no stack effect. Treat as a script failure
        # so a data payload cannot hide behind an undefined byte.
        if opcode not in (0x74,):  # DEPTH pushes the size and reads no item
            path.failed = True
            return [path]
        path.stack.append(comp())
        return [path]
    if opcode == 0x74:
        path.stack.append(comp())
        return [path]
    pop_n(n)
    path.stack.append(comp())
    return [path]


def run(ops, states, kind):
    i = 0
    while i < len(ops):
        op = ops[i]
        if op.opcode in (OP_IF, OP_NOTIF):
            parts = split_conditional(ops, i)
            if parts is None:
                for state in states:
                    state.failed = True
                return states
            then_ops, else_ops, nxt = parts
            spawned = []
            for state in states:
                if state.failed:
                    spawned.append(state)
                    continue
                cond = pop(state)
                mark(state, cond)
                known = cond.truth
                if known is None and cond.payload is not None:
                    known = cast_to_bool(cond.payload)
                if known is None:
                    spawned.extend(run(then_ops, [state.clone()], kind))
                    spawned.extend(run(else_ops, [state], kind))
                else:
                    take_then = known if op.opcode == OP_IF else (not known)
                    live = then_ops if take_then else else_ops
                    spawned.extend(run(live, [state], kind))
            states = spawned
            i = nxt
            continue
        if op.opcode in (OP_ELSE, OP_ENDIF):
            for state in states:
                state.failed = True
            return states
        spawned = []
        for state in states:
            spawned.extend(apply(op, state, kind))
        states = spawned
        i += 1
        if len(states) > 64:
            for state in states:
                state.saturated = True
            return states
    return states


def _exempt_success(path):
    if len(path.stack) != 1:
        return
    item = path.stack[0]
    if item.origin is None or item.payload is None:
        return
    if len(item.payload) <= 4 and cast_to_bool(item.payload):
        path.referenced.add(item.origin)


def live_paths(raw, kind):
    """Return a dict describing unreferenced push indexes.

    `kind` is `witness_v0` or `tapscript`.
    """
    ops = parse_script(raw)
    if ops is None:
        return {"parse_error": True, "unreferenced": [], "old_invalid": True}
    indexes = [op.push_index for op in ops if op.push_index is not None]
    if kind == "tapscript" and any(is_op_success(op.opcode) for op in ops):
        return {
            "parse_error": False,
            "op_success": True,
            "unreferenced": indexes,
            "old_invalid": False,
            "push_count": len(indexes),
        }
    states = run(ops, [Path()], kind)
    live = [state for state in states if not state.failed]
    if not live:
        return {
            "parse_error": False,
            "op_success": False,
            "unreferenced": [],
            "old_invalid": True,
            "push_count": len(indexes),
        }
    bad = set()
    executed_somewhere = set()
    for state in live:
        executed_somewhere |= state.executed
        if state.saturated:
            continue
        _exempt_success(state)
        unread = state.executed - state.referenced
        if state.stack_unknown:
            unread -= state.unknown_before
        bad |= unread
    for index in indexes:
        if index not in executed_somewhere:
            bad.add(index)
    return {
        "parse_error": False,
        "op_success": False,
        "unreferenced": sorted(bad),
        "old_invalid": False,
        "push_count": len(indexes),
    }


def sig_qualified(raw, kind):
    """Push indexes a signature opcode consumes on every live path that executes them."""
    ops = parse_script(raw)
    if ops is None:
        return set()
    states = run(ops, [Path()], kind)
    live = [state for state in states if not state.failed]
    indexes = [op.push_index for op in ops if op.push_index is not None]
    good = set()
    for index in indexes:
        touched = [state for state in live if index in state.executed]
        if touched and all((not state.saturated) and index in state.sig_refs for state in touched):
            good.add(index)
    return good


def immediate_next(raw, kind):
    """Next opcode, plus the branch-end exception for a consumed key or key-hash.

    OP_ELSE and OP_ENDIF read nothing. A key or key-hash directly in front of
    either one is still accepted when every branch that executes it ends in a
    signature check against that same push. Any other unread next-opcode is
    rejected, including a non-key before OP_ELSE and a key the signature
    check never consumes.
    """
    ops = parse_script(raw)
    if ops is None:
        return []
    qualified = sig_qualified(raw, kind)
    bad = []
    for i, op in enumerate(ops):
        if op.push_index is None:
            continue
        if i + 1 >= len(ops):
            bad.append(op.push_index)
            continue
        nxt = ops[i + 1]
        if nxt.push_index is not None:
            continue
        if nxt.opcode in (OP_ELSE, OP_ENDIF) and is_branch_key(op.payload, kind) and op.push_index in qualified:
            continue
        if stack_items_read(nxt.opcode, kind) == 0:
            bad.append(op.push_index)
    return bad


def push_constant_bytes(raw):
    """Payload bytes of every push, including the one-byte encoding of OP_1..OP_16."""
    ops = parse_script(raw)
    if ops is None:
        return None
    total = 0
    for op in ops:
        if op.push_index is None:
            continue
        total += len(op.payload or b"")
    return total
