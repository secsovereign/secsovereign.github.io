"""Static per-output miner fee, as specified.

`static_fee` is the provisional band endpoint under test (16 or 20).
It is not a calibrated consensus constant. The BIP leaves the constant
pending calibration.
"""

UINT64_MAX = (1 << 64) - 1


def product_ok(static_fee, n_outputs):
    """False when static_fee × n_outputs does not fit in uint64."""
    if n_outputs < 0 or static_fee < 0:
        return False
    if static_fee == 0:
        return True
    return n_outputs <= UINT64_MAX // static_fee


def floor_met(tx_fee, n_outputs, static_fee, *, is_coinbase, height, activation_height):
    """Return (valid, reason).

    Package and CPFP fees are not arguments. The caller passes one
    transaction's own tx_fee.
    """
    if height < activation_height or is_coinbase:
        return True, "exempt"
    if not product_ok(static_fee, n_outputs):
        return False, "uint64-overflow"
    required = static_fee * n_outputs
    if tx_fee < required:
        return False, "fee-below-floor"
    return True, "ok"


def required_fee(n_outputs, static_fee):
    if not product_ok(static_fee, n_outputs):
        raise OverflowError("static_fee × n_outputs exceeds uint64")
    return static_fee * n_outputs
