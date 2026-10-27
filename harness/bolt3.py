"""BOLT 3 witness scripts used as false-positive checks.

The byte layout follows lightning/bolts 03-transactions.md (to_local,
to_remote with anchors, anchor output, offered HTLC, received HTLC).
"""


def push_data(data: bytes) -> bytes:
    n = len(data)
    if n == 0:
        return b"\x00"
    if n <= 75:
        return bytes([n]) + data
    if n <= 255:
        return b"\x4c" + bytes([n]) + data
    if n <= 65535:
        return b"\x4d" + n.to_bytes(2, "little") + data
    return b"\x4e" + n.to_bytes(4, "little") + data


def push_script_num(n: int) -> bytes:
    if n == 0:
        return b"\x00"
    if 1 <= n <= 16:
        return bytes([0x50 + n])
    if n < 0:
        raise ValueError("negative script numbers are not needed here")
    raw = n.to_bytes((n.bit_length() + 8) // 8, "little")
    if raw[-1] & 0x80:
        raw += b"\x00"
    return push_data(raw)


def funding_2of2(pubkey_a: bytes, pubkey_b: bytes) -> bytes:
    return b"\x52" + push_data(pubkey_a) + push_data(pubkey_b) + b"\x52\xae"


def to_local(revocation_pubkey: bytes, delay: int, delayed_pubkey: bytes) -> bytes:
    return (
        b"\x63"
        + push_data(revocation_pubkey)
        + b"\x67"
        + push_script_num(delay)
        + b"\xb2\x75"
        + push_data(delayed_pubkey)
        + b"\x68\xac"
    )


def to_remote_csv(pubkey: bytes) -> bytes:
    # <pubkey> OP_CHECKSIGVERIFY 1 OP_CHECKSEQUENCEVERIFY
    return push_data(pubkey) + b"\xad\x51\xb2"


def anchor_output(pubkey: bytes) -> bytes:
    # <pubkey> OP_CHECKSIG OP_IFDUP OP_NOTIF OP_16 OP_CSV OP_ENDIF
    return push_data(pubkey) + b"\xac\x73\x64\x60\xb2\x68"


def offered_htlc(revocation_hash: bytes, remote_htlc_pubkey: bytes, local_htlc_pubkey: bytes, payment_hash: bytes, anchors: bool) -> bytes:
    script = (
        b"\x76\xa9" + push_data(revocation_hash) + b"\x87\x63\xac\x67"
        + push_data(remote_htlc_pubkey) + b"\x7c\x82" + push_data(b"\x20") + b"\x87\x64"
        + b"\x75\x52\x7c" + push_data(local_htlc_pubkey) + b"\x52\xae"
        + b"\x67\xa9" + push_data(payment_hash) + b"\x88\xac\x68"
    )
    if anchors:
        script += b"\x51\xb2\x75"
    script += b"\x68"
    return script


def received_htlc(revocation_hash: bytes, remote_htlc_pubkey: bytes, local_htlc_pubkey: bytes, payment_hash: bytes, cltv_expiry: int, anchors: bool) -> bytes:
    script = (
        b"\x76\xa9" + push_data(revocation_hash) + b"\x87\x63\xac\x67"
        + push_data(remote_htlc_pubkey) + b"\x7c\x82" + push_data(b"\x20") + b"\x87\x63"
        + b"\xa9" + push_data(payment_hash) + b"\x88\x52\x7c" + push_data(local_htlc_pubkey) + b"\x52\xae"
        + b"\x67\x75" + push_script_num(cltv_expiry) + b"\xb1\x75\xac\x68"
    )
    if anchors:
        script += b"\x51\xb2\x75"
    script += b"\x68"
    return script
