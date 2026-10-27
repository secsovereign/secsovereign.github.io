"""Dynamic per-output fee. Integer arithmetic matches the specification.

`persistence_threshold`, `k`, `alpha_n`, and `G` are harness fixtures when
the BIP marks them provisional or TBD. Tests name the fixture. They are
not calibrated consensus constants.

The persistence else-branch in this module is the corrected one: a failed
persistence check must not raise the fee, and it must not freeze an
elevated fee after the sample falls. See the dynamic BIP change log.
"""

ALPHA_DEN = 1000
RATE_SCALE = 1000
PERIOD = 288


def vsize(weight):
    return (weight + 3) // 4


def fee_rate_milli(tx_fee, weight):
    """Own-transaction rate. None if the tx is excluded from the sample."""
    if tx_fee <= 0:
        return None
    size = vsize(weight)
    if size <= 0:
        raise ValueError("weight must produce a positive vsize")
    return (tx_fee * RATE_SCALE) // size


def percentile_25(rates):
    if not rates:
        raise ValueError("empty sample")
    ordered = sorted(rates)
    n = len(ordered)
    return ordered[(n - 1) * 25 // 100]


class Params:
    def __init__(self, k, alpha_n, persistence_threshold, r_num=1, r_den=4, g=6, min_tx_count=1000):
        self.k = k
        self.alpha_n = alpha_n
        self.persistence_threshold = persistence_threshold
        self.r_num = r_num
        self.r_den = r_den
        self.g = g
        self.min_tx_count = min_tx_count


class State:
    def __init__(self, static_fee):
        self.p25_ema_previous = 0
        self.dynamic_fee_previous = 0
        self.active_fee_previous = static_fee
        self.active_fee_current = static_fee


def legacy_candidate(p25_ema, state, params):
    """The published else-branch: hold dynamic_fee_previous when persistence fails."""
    if (
        p25_ema > params.persistence_threshold
        and state.p25_ema_previous > params.persistence_threshold
    ):
        return (params.k * p25_ema) // RATE_SCALE
    return state.dynamic_fee_previous


def candidate_dynamic(p25_ema, state, params):
    """Persistence gates a raise. A lower scaled EMA is taken immediately."""
    raw = (params.k * p25_ema) // RATE_SCALE
    if (
        p25_ema > params.persistence_threshold
        and state.p25_ema_previous > params.persistence_threshold
    ):
        return raw
    return min(state.dynamic_fee_previous, raw)


def apply_cap(candidate, state, static_fee, params):
    cap_base = max(state.dynamic_fee_previous, static_fee)
    max_increase = cap_base + (cap_base * params.r_num) // params.r_den
    dynamic_fee = min(candidate, max_increase)
    if dynamic_fee < 0:
        dynamic_fee = 0
    return dynamic_fee, max_increase


def step_period(rates, state, static_fee, params, *, candidate_fn=candidate_dynamic):
    """Advance one boundary. `rates` excludes coinbase and zero-fee txs."""
    if len(rates) < params.min_tx_count:
        state.active_fee_previous = state.active_fee_current
        return {
            "held": True,
            "active_fee": state.active_fee_current,
            "dynamic_fee": state.dynamic_fee_previous,
            "p25_ema": state.p25_ema_previous,
        }
    p25 = percentile_25(rates)
    p25_ema = (
        params.alpha_n * p25 + (ALPHA_DEN - params.alpha_n) * state.p25_ema_previous
    ) // ALPHA_DEN
    candidate = candidate_fn(p25_ema, state, params)
    dynamic_fee, max_increase = apply_cap(candidate, state, static_fee, params)
    active = max(static_fee, dynamic_fee)
    state.p25_ema_previous = p25_ema
    state.dynamic_fee_previous = dynamic_fee
    state.active_fee_previous = state.active_fee_current
    state.active_fee_current = active
    return {
        "held": False,
        "p25": p25,
        "p25_ema": p25_ema,
        "candidate": candidate,
        "max_increase": max_increase,
        "dynamic_fee": dynamic_fee,
        "active_fee": active,
    }


def required_fee(height, period_start, state, g):
    if height < period_start + g:
        return state.active_fee_previous
    return state.active_fee_current


def period_start_for(height):
    return (height // PERIOD) * PERIOD


def first_computation_height(activation_height):
    """First block of the first 288-block period that begins at or after activation."""
    start = period_start_for(activation_height)
    if start < activation_height:
        start += PERIOD
    return start


def dynamic_floor_active(height, static_activation, dynamic_activation):
    """False when this BIP adds nothing beyond the static fee (or nothing at all)."""
    if height <= static_activation:
        return False
    return height >= first_computation_height(dynamic_activation)
