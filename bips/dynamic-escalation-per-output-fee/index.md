# Dynamic Escalation of the Per-Output Miner Fee

## Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Specification](#specification)
- [Rationale](#rationale)
- [Backwards Compatibility](#backwards-compatibility)
- [Reference Implementation](#reference-implementation)
- [Calibration Checklist](#calibration-checklist)
- [Security Considerations](#security-considerations)
- [References](#references)
- [Copyright](#copyright)

---

## Abstract

This BIP adds a dynamic escalation layer on top of the static per-output miner fee from its predecessor. It has a hard consensus dependency on *[Static Per-Output Miner Fee](/bips/static-per-output-miner-fee)*: the dynamic rules are inert for any block at or below the static fee BIP's activation height, regardless of this BIP's own signaling or lock-in status. A block that applies dynamic escalation rules before that height is invalid.

The problem is long-run decay. A static satoshi amount fixed under today's conditions becomes trivial as Bitcoin's price and fee levels rise over decades. Without automatic adjustment, the static fee stops working as a real disincentive, and the only fix is another soft fork to raise the constant. Repeated soft forks to update a fixed number create a permanent dependency on governance processes that can be captured, delayed, or blocked.

This BIP specifies a dynamic fee component derived from the 25th percentile fee rate sampled over 288-block windows, smoothed by an exponential moving average, confirmed by multi-window persistence, and bounded by an upward-only rate-of-change cap. The active per-output fee is the maximum of the static fee and the dynamic fee. In normal and high fee conditions the dynamic fee sits above the static fee and tracks economic conditions. In prolonged low-fee regimes the static fee governs and the dynamic component contributes nothing.

This BIP is an optional long-term upgrade. The static fee BIP works fully without it.

---

## Motivation

### The Known Limitation of the Static Fee

The static per-output miner fee closes both the value vector and the count vector of UTXO spam with a permanent, non-recoverable cost per output. It is the main piece of the two-BIP design. It has one known limit, already noted in its security considerations: a fixed satoshi amount decays in real terms as Bitcoin's price and fee levels rise.

At 20 sats per output and current BTC prices, creating 100,000 outputs costs 2 million sats. That is a material cost today. At 10x BTC price it is one-tenth the real cost. At 100x BTC price it approaches noise:

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>BTC price multiple</th><th>Cost of 100k outputs @ 20 sats</th><th>Real deterrent?</th></tr>
</thead>
<tbody>
<tr class="close-yes"><td>1× (today)</td><td>2,000,000 sats</td><td>Material</td></tr>
<tr class="close-partial"><td>10×</td><td>2,000,000 sats (1/10 real cost)</td><td>Weakening</td></tr>
<tr class="close-no"><td>100×</td><td>2,000,000 sats (1/100 real cost)</td><td>Noise</td></tr>
</tbody>
</table>
<figcaption>Nominal sats stay fixed; real economic cost decays as BTC appreciates. Without automatic adjustment, another soft fork is eventually required.</figcaption>
</figure>

The static fee does not need a fix today, but without automatic adjustment it will eventually need a soft fork. That soft fork will face the same political and review surface as any other consensus change, with the extra difficulty of being an explicit fee increase rather than a new capability.

The dynamic escalation layer removes that future dependency. It is calibrated to track multi-decade fee drift, not short-term fee spikes, so it adjusts slowly and predictably rather than reacting to noise.

### Why This Is a Separate BIP

The static fee is simple, small, and high-leverage. Putting the dynamic machinery in the same proposal raises implementation complexity, expands review surface, and raises the chance that neither piece activates. Splitting the proposals means the most important property, a permanent per-output cost, can land in consensus first. This BIP is the optional upgrade that keeps that cost from decaying over time.

Separation also lets the network gain operational experience with the static fee before adding the dynamic layer. If the static fee is enough in practice, the dynamic BIP may not need to activate on the same timeline. If the static fee decays faster than expected because of BTC price appreciation, the dynamic BIP has a clearer and more urgent case.

### Anti-Decay Is the Only Job of the Dynamic Layer

The dynamic component has one job: keep the static fee from becoming economically trivial over decades. It is not meant to respond to short-term spam waves, react to individual fee spikes, or replace the static fee as the primary deterrent. During short-term fee anomalies the dynamic fee should stay stable. During genuine multi-year fee drift it should move up. The design choices below (slow EMA, multi-window persistence, upward-only rate cap) all follow from that single role.

<figure class="article-chart chart-compare">
<div class="chart-heading">Division of labor in the two-BIP design</div>
<div class="compare-cols" role="img" aria-label="Static fee is the permanent floor; dynamic fee prevents long-run decay">
<div class="compare-col compare-open">
<div class="compare-label">Static fee BIP</div>
<ul class="compare-list">
<li>Primary deterrent</li>
<li>Fixed satoshi constant</li>
<li>No sampling / no manipulation surface</li>
<li>Fully functional alone</li>
</ul>
</div>
<div class="compare-col compare-gated">
<div class="compare-label">Dynamic escalation BIP</div>
<ul class="compare-list">
<li>Anti-decay only</li>
<li>Tracks multi-decade fee drift</li>
<li>Can raise above static, never below</li>
<li>Optional long-term upgrade</li>
</ul>
</div>
</div>
<figcaption>Split so the permanent cost can activate first. Dynamic machinery is useful but not urgent.</figcaption>
</figure>

---

## Specification

### Dependency

This BIP is only valid when *[Static Per-Output Miner Fee](/bips/static-per-output-miner-fee)* is active. If the static fee BIP has not activated, this BIP has no effect. Implementations must check for static fee BIP activation before applying dynamic escalation logic.

### Active Fee

The active per-output fee for any given 288-block period is:

```text
active_fee = max(static_fee, dynamic_fee)
```

Where `static_fee` is the constant from the static fee BIP and `dynamic_fee` is computed as specified below. The coinbase accounting formula from the static fee BIP is unchanged except that `static_fee` in that formula is replaced by `active_fee`:

```text
coinbase_value = block_subsidy + sum(tx_fees)
               + (active_fee × count(all non-coinbase outputs in block))
```

During any period in which the dynamic fee falls below or equals the static fee, the active fee equals the static fee and the coinbase accounting matches what the static fee BIP specifies.

### Dynamic Fee Computation

The dynamic fee is computed at each 288-block boundary and cached for the following period. Computation happens only at boundaries, never per block.

<figure class="article-chart chart-flowchart" role="img" aria-label="Dynamic fee pipeline from sample through floor">
<div class="flowchart-ladder" aria-hidden="true">
  <span class="flow-node">p25 sample</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">EMA</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">Persistence</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">Rate cap ↑</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">max(static, dyn)</span>
</div>
</figure>

*Figure: Five-step pipeline. Each layer exists to track multi-decade drift without reacting to short-term fee noise or cheap manipulation.*

#### Step 1: Sample the fee rate

This step is the sole definition of fee sampling in the two-BIP design. The static fee BIP needs no fee sampling; all fee rate computation starts here.

Collect the fee rate for every fee-paying transaction in the previous 288 blocks. Fee rate is in sat/vB using consensus weight (not stripped size). Exclude coinbase transactions. Exclude transactions with zero fee. Fee rate is computed per transaction from that transaction's own fee and weight only, with no package or CPFP attribution: package fee rate is mempool policy and is not observable from block data alone. Per-transaction fee rate keeps the computation reproducible by any node from block data without mempool history.

Compute the 25th percentile of the resulting set using the algorithm in the consensus edge cases checklist (sort order and even-N averaging must match across implementations). If the set has fewer than `min_tx_count` fee-paying transactions, the sample is insufficient and the dynamic fee for the next period is set to zero, so the static fee governs.

#### Step 2: Apply the exponential moving average

```text
p25_ema = α × p25_current + (1 − α) × p25_ema_previous
```

Where `α` is the smoothing parameter. A slow `α` toward 0.1 tracks multi-year fee drift while ignoring short-term spikes. Because the dynamic layer's only job is anti-decay over decades rather than short-term spam response, `α` must be tuned slow. A faster `α` toward 0.3 is appropriate only if sensitivity analysis shows a real benefit from faster response without instability.

#### Step 3: Apply multi-window persistence

```text
if p25_ema_current > persistence_threshold
   and p25_ema_previous > persistence_threshold:
    candidate_dynamic = k × p25_ema_current
else:
    candidate_dynamic = dynamic_fee_previous
```

Where `k` has units of vbytes and converts the p25 EMA (in sat/vB) into a per-output satoshi fee. Dimensionally: (sat/vB) × (vB) = sat. So `k` encodes an assumed typical output size in vbytes, set during calibration to match a representative output across common script types. A single `k` value, rather than per-script-type values, matches the static fee's uniform-per-output design. The resulting `candidate_dynamic` is a satoshi amount per output. A single elevated 288-block window (~2 days) does not move the dynamic fee. An attacker must sustain elevated fee conditions across at least two consecutive windows (~4 days) to produce any upward movement.

#### Step 4: Apply the rate-of-change cap

```text
max_increase = dynamic_fee_previous × (1 + R)
dynamic_fee_new = min(candidate_dynamic, max_increase)
dynamic_fee_new = max(0, dynamic_fee_new)
```

The dynamic fee may not increase by more than `R` percent per 288-block period, no matter what the fee statistic produces. Decreases are uncapped: the dynamic fee falls freely back toward zero when fee conditions normalize, at which point the static fee governs.

#### Step 5: Apply the static fee floor

```text
active_fee = max(static_fee, dynamic_fee_new)
```

### Coinbase Accounting During the Grace Window

The grace window from the static fee BIP does not apply here in the same form, because the dynamic fee changes every 288 blocks rather than once at activation. The coinbase accounting rule for period boundaries is:

During the first `G` blocks of a new 288-block period, the coinbase must account for per-output fees at the previous period's active fee rate. After `G` blocks, the new period's active fee rate applies. That keeps transactions broadcast under the previous rate and confirmed during the boundary window from being invalidated by a mid-flight rate change, and keeps the coinbase calculation unambiguous for everyone.

```text
if block_height < period_start + G:
    fee_rate_for_coinbase = active_fee_previous_period
else:
    fee_rate_for_coinbase = active_fee_current_period
```

### Consensus State

Each node must carry the following state across 288-block period boundaries, in addition to the static fee BIP's activation state:

- `dynamic_fee_previous` (the dynamic fee from the prior period)
- `p25_ema_previous` (the EMA value from the prior period)
- `active_fee_previous` (for grace window coinbase accounting)
- `active_fee_current` (the active fee for the current period)

All values are deterministic from block history and need no external input. Implementations must also retain EMA state snapshots at every period boundary for the most recent 2,016 blocks of boundaries to support reorg recovery, as specified in Security Considerations.

### Parameters

All parameters are consensus parameters adjustable by a future soft fork. Initial values are provisional pending calibration.

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Parameter</th><th>Description</th><th>Provisional value</th></tr>
</thead>
<tbody>
<tr><td><code>k</code></td><td>Multiplier scaling p25 EMA to sat per output (units: vB)</td><td>2-4</td></tr>
<tr><td><code>α</code></td><td>EMA smoothing factor</td><td>0.1-0.3 (tune slow)</td></tr>
<tr><td><code>persistence_threshold</code></td><td>Minimum p25 EMA for a window to count toward persistence</td><td>TBD via calibration</td></tr>
<tr><td><code>R</code></td><td>Maximum upward rate of change per period</td><td>0.25</td></tr>
<tr><td><code>G</code></td><td>Grace window in blocks at period boundaries</td><td>6-12</td></tr>
<tr><td><code>min_tx_count</code></td><td>Minimum fee-paying transactions for a valid sample</td><td>1,000</td></tr>
</tbody>
</table>
<figcaption>Prefer slow <code>α</code> unless sensitivity tables show a real benefit from faster response without instability.</figcaption>
</figure>

### Activation

This BIP is meant to deploy via a soft fork using BIP-8 or BIP-9 style signaling, with a minimum activation window of one year and no mandatory lock-in fallback. Miners who do not signal are not penalized.

This BIP has an explicit consensus dependency: the dynamic escalation rules are inert for any block whose height is less than or equal to the static fee BIP's `activation_height`, regardless of this BIP's own signaling or lock-in status. Even if this BIP's signaling reaches threshold before the static fee BIP activates, no block applies dynamic escalation rules until the static fee BIP is fully active. Implementations must enforce that ordering at the consensus layer, not merely as a deployment convention. A block that applies dynamic escalation rules before the static fee BIP's `activation_height` is invalid.

---

## Rationale

### Why 288 Blocks as the Sample Window

The dynamic fee's job is tracking multi-decade fee drift, not reacting to short-term spam waves. A 288-block (~2 day) window provides enough transactions for a statistically meaningful 25th percentile during active periods, while staying short enough to detect genuine sustained changes without unreasonable lag. Combined with the EMA, the effective response time to sustained fee changes is much longer than 288 blocks regardless of window size.

### Why the 25th Percentile

The 25th percentile represents cheaper legitimate transactions and is less sensitive to outliers than the median. A small number of high-fee transactions cannot push it far upward, which keeps the dynamic fee from pricing out legitimate use during fee spikes driven by monetary activity rather than spam.

### Why EMA Rather Than Hard Window Reset

A hard window reset creates cliff-edge transitions and makes the fee reactive to single-window anomalies. The EMA smooths toward prevailing conditions over many periods, which is the right behavior for a mechanism tracking multi-decade drift rather than reacting to individual events.

### Why Multi-Window Persistence

A single elevated 288-block window is achievable by a moderately funded actor for whom fee spend is an acceptable operating cost. Requiring two consecutive windows doubles the sustained cost and duration of any manipulation attempt. The persistence check adds no per-block computation and is the main defense against short-term fee flooding aimed at ratcheting the dynamic fee upward.

### Why an Upward-Only Rate-of-Change Cap

Even with EMA smoothing and persistence, a sustained campaign could ratchet the dynamic fee upward over many periods. The rate cap bounds how fast that can happen regardless of fee pressure: even a perfectly sustained campaign can raise the dynamic fee by only `R` percent per period, so rapid ratcheting is slow, expensive, and publicly visible on chain. The cap is asymmetric on purpose: the dynamic fee falls freely when pressure stops, so a manipulation attempt does not leave a permanently elevated floor once the attacker withdraws.

### Why k Has Units of Vbytes

The p25 EMA is in sat/vB. To produce a satoshi amount per output, `k` must have units of vbytes. Dimensionally: (sat/vB) × (vB) = sat. So `k` encodes a representative output size assumption. Calibration sets `k` to match the vbyte cost of a typical output across common script types, producing a per-output fee that tracks the real economic cost of output creation as fee rates change. A single `k` value rather than per-script-type values matches the static fee's uniform-per-output model: the externalized cost being priced is per UTXO slot, not per script type.

### Interaction with BIP-110

BIP-110 targets dedicated high-bandwidth data channels. This BIP targets UTXO creation economics. They operate on different surfaces. The dynamic escalation layer does not change the relationship between this proposal and BIP-110 established in the static fee BIP. See *[The Achievable Floor](/articles/the-achievable-floor)* for the channel taxonomy those proposals close.

---

## Backwards Compatibility

The active fee replaces the static fee in the coinbase accounting formula. During any period in which the dynamic fee is below the static fee, the coinbase accounting matches the static fee BIP and no behavioral change occurs. The dynamic layer is additive: it can only raise the active fee above the static fee floor, never below it.

Wallets and fee estimators that already account for the static per-output fee must also track the current period's active fee, which may differ from the static fee during elevated fee conditions. From the user's point of view there is still one fee; wallets present a single total that uses whichever of the two rates is currently active.

---

## Reference Implementation

High-level pseudocode, assuming the static fee BIP is active:

```python
def compute_period_active_fee(last_288_blocks, state):
    # Step 1: sample
    fee_rates = [
        tx.fee_rate for block in last_288_blocks
        for tx in block.transactions
        if tx.fee > 0 and not tx.is_coinbase
    ]
    if len(fee_rates) < MIN_TX_COUNT:
        p25_current = 0
    else:
        p25_current = percentile(fee_rates, 25)

    # Step 2: EMA
    p25_ema = ALPHA * p25_current + (1 - ALPHA) * state.p25_ema_previous

    # Step 3: multi-window persistence
    if (p25_ema > PERSISTENCE_THRESHOLD and
            state.p25_ema_previous > PERSISTENCE_THRESHOLD):
        candidate = K * p25_ema  # sat amount; K has units of vbytes
    else:
        candidate = state.dynamic_fee_previous

    # Step 4: rate-of-change cap (upward only)
    max_increase = state.dynamic_fee_previous * (1 + R)
    dynamic_fee = min(candidate, max_increase)
    dynamic_fee = max(0, dynamic_fee)

    # Step 5: apply static fee floor
    active_fee = max(STATIC_FEE, dynamic_fee)

    # Update state
    state.p25_ema_previous = p25_ema
    state.dynamic_fee_previous = dynamic_fee
    state.active_fee_previous = state.active_fee_current
    state.active_fee_current = active_fee

    return active_fee

def fee_rate_for_coinbase(block_height, period_start, state):
    if block_height < period_start + G:
        return state.active_fee_previous
    return state.active_fee_current

def is_valid_block(block, period_start, state):
    rate = fee_rate_for_coinbase(block.height, period_start, state)
    total_per_output_fees = sum(
        len(tx.outputs) for tx in block.non_coinbase_transactions
    ) * rate
    expected_coinbase = (
        block_subsidy(block.height)
        + sum(tx.fee for tx in block.non_coinbase_transactions)
        + total_per_output_fees
    )
    return block.coinbase_value == expected_coinbase
```

Detailed test vectors, integer arithmetic precision requirements, and edge-case handling will be provided in a future numbered BIP submission.

---

## Calibration Checklist

This checklist is separate from and follows the static fee BIP's calibration. The static fee BIP's calibration must pass before this checklist begins.

### A. Dynamic Parameter Sensitivity

- Sweep `α` in {0.05, 0.1, 0.2, 0.3} × `R` in {0.1, 0.25, 0.5} × `k` in {2, 3, 4} against full chain history.
- For each combination report: number of periods where dynamic fee exceeds static fee; maximum dynamic fee reached; EMA lag to a sustained 10x fee increase; periods required to ratchet 2x under simulated sustained fee pressure.
- Recommend a default parameter tuple only after sensitivity tables exist. Prefer slow `α` unless tables show a real benefit from faster response.
- Calibrate `persistence_threshold` above the noise floor of quiet periods and below the movement threshold for genuine sustained congestion.
- Confirm the dynamic fee sits visibly above the static fee during normal and high fee conditions at the recommended parameters.

### B. Anti-Manipulation Stress Test

- Simulate a moderately funded attacker sustaining elevated p25 fee rates for 2, 4, 8, and 16 consecutive 288-block windows. Report dynamic fee trajectory and cost to the attacker at each duration.
- Confirm the rate-of-change cap prevents rapid ratcheting even under sustained pressure.
- Confirm the dynamic fee falls freely back to the static fee floor once pressure is removed, with no persistent elevation.

### C. Collateral Damage at Dynamic Rates

- Lightning channel opens: confirm the active fee remains negligible at the 95th and 99th percentile of simulated dynamic fee values under historical and projected fee conditions.
- Exchange batch payouts: same analysis.
- Confirm the dynamic fee does not price out legitimate high-output transactions during fee spikes driven by monetary activity rather than spam.

### D. Consensus Edge Cases

- Specify behavior on reorgs crossing 288-block period boundaries: which period's EMA state and active fee apply to disconnected blocks.
- Specify IBD and assumeutxo interaction: EMA state must be fully reconstructable from block history alone without mempool history.
- Specify integer arithmetic precisely (fixed-point representation, rounding direction) so all implementations agree bit-for-bit.
- Define an identical percentile algorithm (sort order, even-N averaging) so all implementations agree bit-for-bit.
- Confirm grace window `G` is sufficient at period boundaries given historical mempool boundary-crossing data.

### E. Exit Criteria

- Recommended (`k`, `α`, `R`, `persistence_threshold`, `G`, `min_tx_count`) published with full sensitivity tables.
- Anti-manipulation stress test B passes at recommended parameters.
- Collateral damage checklist C passes at recommended parameters.
- Consensus edge cases in checklist D resolved and written into Specification.

---

## Security Considerations

**Fee rate manipulation.** Moving the 25th percentile meaningfully requires sustaining elevated transaction volume across a full 288-block window. The three-layer dynamic architecture (EMA, persistence, rate cap) makes rapid ratcheting slow, expensive, and publicly visible on chain. A state-level actor treating fee spend as an operating cost can still move the dynamic fee upward over many periods; the cap bounds how fast, and the fee falls freely once pressure is removed.

**Static fee as irreducible floor.** The dynamic fee can never push the active fee below the static fee. The static fee BIP's security properties are fully preserved regardless of what the dynamic layer does.

**Low-activity window.** If the 288-block sample contains fewer than `min_tx_count` fee-paying transactions, the dynamic fee is set to zero and the static fee governs. That prevents dynamic fee collapse during quiet periods or deliberate low-fee block stuffing.

**Period boundary coinbase accounting.** The grace window rule keeps the coinbase accounting formula unambiguous at every period boundary. The previous period's rate governs the coinbase during the grace window; the new rate governs after. No block can be valid under two different interpretations of the coinbase formula at once.

**Reorg safety.** On a reorg crossing a 288-block period boundary, the EMA state must revert to the correct state for the reorganized chain tip. Implementations must cache EMA state snapshots at every period boundary. The consensus rule is: retain snapshots for the most recent 2,016 blocks (one difficulty adjustment period, about two weeks) of period boundaries. That bounds the cache to at most seven snapshots at any time and covers any reorg that Bitcoin's proof-of-work economics makes plausible, without relying on heuristic depth estimates. A reorg deeper than 2,016 blocks is treated as a chain split requiring operator intervention, consistent with existing Bitcoin consensus assumptions. Implementations that do not retain the required snapshots cannot correctly validate blocks after a deep reorg and must re-sync from a known-good checkpoint.

---

## References

- *[BIP Pre-Proposal: Static Per-Output Miner Fee](/bips/static-per-output-miner-fee)*. This BIP depends on it.
- BIP-110: Reduced Data Temporary Softfork
- *[Full Cost of Running a Bitcoin Node](/articles/full-cost-of-running-a-bitcoin-node)*, v2.4, July 2026.
- Mempool Research UTXO Set Report, May 2025, tip 892385 ([research.mempool.space/utxo-set-report](https://research.mempool.space/utxo-set-report)).
- *[The Achievable Floor](/articles/the-achievable-floor)* (2026).
- *[Bitcoin Is Not a Hard Drive](/articles/bitcoin-not-a-hard-drive)* (2026).
- Lopp, Jameson. "Goldiblocks: A Dynamic Block Size Limit." OP_NEXT 2025.
- Various Delving Bitcoin and bitcoin-dev threads on UTXO bloat and spam mitigation (2023-2026)

---

## Copyright

This document is licensed under the BSD 2-Clause License.
