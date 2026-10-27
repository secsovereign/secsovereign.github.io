"""Integer checks for dynamic escalation. No chain statistics."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from harness.dynamic_fee import (
    Params,
    State,
    candidate_dynamic,
    fee_rate_milli,
    first_computation_height,
    legacy_candidate,
    percentile_25,
    required_fee,
    step_period,
    vsize,
)

# Fixture only. The BIP leaves persistence_threshold TBD.
THRESHOLD = 5_000  # 5 sat/vB in milli-sat/vB
STATIC = 20


def rates(milli, n=1000):
    return [milli] * n


def test_vsize_and_own_fee():
    assert vsize(39541) == 9886
    assert vsize(39542) == 9886
    # Parent is priced on its own fee and weight. The child's fee is not added.
    parent = fee_rate_milli(20, 400)  # vsize 100, rate 200 milli-sat/vB
    child = fee_rate_milli(150_240, 400)
    package = fee_rate_milli(20 + 150_240, 800)
    assert parent == 200
    assert child == (150_240 * 1000) // 100
    assert package == ((20 + 150_240) * 1000) // 200
    assert package != parent
    assert fee_rate_milli(0, 400) is None


def test_percentile():
    assert percentile_25([1]) == 1
    # N=4, index floor(3*25/100)=0. The lowest element, as specified.
    assert percentile_25([10, 20, 30, 40]) == 10
    sample = list(range(1000))  # 0..999
    # index floor(999*25/100)=floor(249.75)=249
    assert percentile_25(sample) == 249


def test_k_products():
    # p25 EMA in milli-sat/vB. candidate = k * ema / 1000.
    assert (2 * 5_000) // 1000 == 10
    assert (4 * 5_000) // 1000 == 20
    assert (2 * 10_000) // 1000 == 20
    assert (4 * 10_000) // 1000 == 40
    # k=2 at 5 sat/vB is below static 16 and 20, so max() stays on the static fee.
    assert max(16, 10) == 16
    assert max(20, 10) == 20
    assert max(20, 40) == 40


def test_ema_truncation():
    params = Params(k=2, alpha_n=100, persistence_threshold=THRESHOLD)
    state = State(STATIC)
    # First window cannot raise: previous EMA is 0, which is not above threshold.
    out = step_period(rates(10_000), state, STATIC, params)
    assert out["p25"] == 10_000
    assert out["p25_ema"] == (100 * 10_000) // 1000  # 1000
    assert out["candidate"] == 0
    assert out["dynamic_fee"] == 0
    assert out["active_fee"] == STATIC


def test_two_windows_then_cap():
    params = Params(k=4, alpha_n=100, persistence_threshold=1)
    state = State(STATIC)
    # threshold 1 so the second window can pass persistence. Fixture, not TBD.
    first = step_period(rates(50_000), state, STATIC, params)
    assert first["dynamic_fee"] == 0  # previous EMA was 0
    second = step_period(rates(50_000), state, STATIC, params)
    # ema = (100*50000 + 900*1000) / 1000 = 5000+900 = 5900? 
    # previous ema after first window: (100*50000 + 900*0)/1000 = 5000
    assert first["p25_ema"] == 5_000
    # second ema = (100*50000 + 900*5000)/1000 = 5000 + 4500 = 9500
    assert second["p25_ema"] == 9_500
    # raw candidate = 4 * 9500 / 1000 = 38
    # cap_base = max(0, 20) = 20; max_increase = 20 + 5 = 25
    assert second["candidate"] == 38
    assert second["max_increase"] == 25
    assert second["dynamic_fee"] == 25
    assert second["active_fee"] == 25
    third = step_period(rates(50_000), state, STATIC, params)
    # cap_base = max(25, 20) = 25; max_increase = 25 + 6 = 31
    assert third["max_increase"] == 31
    assert third["dynamic_fee"] == 31


def test_legacy_else_freezes():
    """Published else-branch keeps the elevated fee after the sample collapses."""
    params = Params(k=4, alpha_n=1000, persistence_threshold=THRESHOLD)
    # alpha 1000 means EMA equals the current sample. Easier to read.
    state = State(STATIC)
    state.p25_ema_previous = 20_000  # already warm, above threshold
    state.dynamic_fee_previous = 80
    state.active_fee_current = 80
    state.active_fee_previous = STATIC
    # One quiet thick sample at 1 sat/vB = 1000 milli, below threshold 5000.
    quiet = rates(1_000)
    frozen = step_period(quiet, State(STATIC), STATIC, params, candidate_fn=legacy_candidate)
    # Rebuild state the legacy function will mutate. Use a dedicated state.
    del frozen
    held = State(STATIC)
    held.p25_ema_previous = 20_000
    held.dynamic_fee_previous = 80
    held.active_fee_previous = STATIC
    held.active_fee_current = 80
    out = step_period(quiet, held, STATIC, params, candidate_fn=legacy_candidate)
    assert out["candidate"] == 80  # held, not recomputed
    assert out["dynamic_fee"] == 80
    # A second quiet window still holds, because the else branch never looks at the low EMA.
    out2 = step_period(quiet, held, STATIC, params, candidate_fn=legacy_candidate)
    assert out2["dynamic_fee"] == 80


def test_corrected_fall():
    params = Params(k=4, alpha_n=1000, persistence_threshold=THRESHOLD)
    state = State(STATIC)
    state.p25_ema_previous = 20_000
    state.dynamic_fee_previous = 80
    state.active_fee_current = 80
    state.active_fee_previous = STATIC
    out = step_period(rates(1_000), state, STATIC, params)
    # ema = 1000 (alpha 1000). raw = 4*1000/1000 = 4.
    # persistence fails (1000 is not > 5000). candidate = min(80, 4) = 4.
    assert out["p25_ema"] == 1_000
    assert out["candidate"] == 4
    assert out["dynamic_fee"] == 4
    assert out["active_fee"] == STATIC  # max(20, 4)
    # A single high window must not raise: previous ema is now 1000, not above 5000.
    spike = step_period(rates(50_000), state, STATIC, params)
    assert spike["dynamic_fee"] == 4 or spike["candidate"] <= 4
    # candidate = min(4, raw_high) = 4, so it does not raise.
    assert spike["candidate"] == 4
    assert spike["dynamic_fee"] == 4


def test_raise_still_needs_two_windows():
    params = Params(k=4, alpha_n=1000, persistence_threshold=THRESHOLD)
    state = State(STATIC)
    first = step_period(rates(20_000), state, STATIC, params)
    assert first["dynamic_fee"] == 0
    second = step_period(rates(20_000), state, STATIC, params)
    # ema stays 20000 because alpha is 1000 and the sample is constant.
    # After first, ema previous becomes 20000. Second persistence passes.
    # raw = 4*20000/1000 = 80. cap from 0 is static 20 → max 25.
    assert second["candidate"] == 80
    assert second["dynamic_fee"] == 25


def test_thin_sample_holds():
    params = Params(k=4, alpha_n=100, persistence_threshold=THRESHOLD, min_tx_count=1000)
    state = State(STATIC)
    state.dynamic_fee_previous = 40
    state.p25_ema_previous = 12_000
    state.active_fee_current = 40
    state.active_fee_previous = STATIC
    out = step_period([100] * 999, state, STATIC, params)
    assert out["held"] is True
    assert out["dynamic_fee"] == 40
    assert state.p25_ema_previous == 12_000
    assert state.active_fee_previous == 40  # grace window tracks the held fee
    assert state.active_fee_current == 40


def test_grace_and_activation():
    state = State(STATIC)
    state.active_fee_previous = 20
    state.active_fee_current = 25
    # G=6 fixture, inside the BIP's provisional 6-12.
    assert required_fee(288, 288, state, 6) == 20
    assert required_fee(293, 288, state, 6) == 20
    assert required_fee(294, 288, state, 6) == 25
    assert first_computation_height(1000) == 1152
    assert first_computation_height(1152) == 1152
    assert first_computation_height(0) == 0


def test_decrease_while_still_above_threshold():
    params = Params(k=4, alpha_n=1000, persistence_threshold=1_000)
    state = State(STATIC)
    state.p25_ema_previous = 30_000
    state.dynamic_fee_previous = 100
    state.active_fee_current = 100
    # 2 sat/vB = 2000 milli, still above threshold 1000.
    # raw = 4*2000/1000 = 8. Persistence passes. Uncapped fall to 8.
    out = step_period(rates(2_000), state, STATIC, params)
    assert out["candidate"] == 8
    assert out["dynamic_fee"] == 8
    assert out["active_fee"] == STATIC


def main():
    test_vsize_and_own_fee()
    test_percentile()
    test_k_products()
    test_ema_truncation()
    test_two_windows_then_cap()
    test_legacy_else_freezes()
    test_corrected_fall()
    test_raise_still_needs_two_windows()
    test_thin_sample_holds()
    test_grace_and_activation()
    test_decrease_while_still_above_threshold()
    # candidate_dynamic is the function the period step uses by default.
    assert candidate_dynamic(100, State(STATIC), Params(2, 100, 1)) == 0
    print("dynamic fee: all integer checks passed")
    print("legacy else-branch freezes an 80 sat dynamic fee across two quiet 1000-tx windows")
    print("corrected branch falls that case to raw=4, active fee back to static 20")
    print("k=2 at 5000 milli-sat/vB -> 10 sats, below static 16 and 20")
    print("k=4 at 10000 milli-sat/vB -> 40 sats, above static 20, then the rate cap applies")


if __name__ == "__main__":
    main()
