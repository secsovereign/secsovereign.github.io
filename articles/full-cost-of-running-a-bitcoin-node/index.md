# Full Cost of Running a Bitcoin Node

*Methodology and Accounting · Version 2.4 · July 2026*

## Contents

- [I. Overview](#i-overview)
- [II. Representative Node Profiles](#ii-representative-node-profiles)
- [III. Cost Categories](#iii-cost-categories)
- [IV. Total Monthly Cost](#iv-total-monthly-cost)
- [V. Network-Level Aggregation](#v-network-level-aggregation)
- [VI. The Opportunity Cost of Node Density](#vi-the-opportunity-cost-of-node-density)
- [VII. Non-Monetary Data: Cost Distribution](#vii-non-monetary-data-cost-distribution)
- [VIII. Limitations](#viii-limitations)
- [IX. Sources](#ix-sources)

---

## I. Overview

Running a Bitcoin full node has six cost categories: hardware depreciation, bandwidth, power, learning time, ongoing maintenance, and opportunity cost of capital. Hardware alone is only a slice of the total. Operator time (setup plus upkeep) is usually the largest line item, though maintenance hours vary a lot and are shown as low / mid / high ranges.

This document defines each category, how it is estimated, the monthly and annual cost for one representative node, and the aggregate across the network. It also covers what lower node density costs everyone else: weaker security and worse performance when the node count falls.

Version 2.4 shifts the midpoint from a U.S. professional upper bound to a **median worldwide estimate**. Operator time uses a blended global median (~$30-40/hr in 2024-26), not U.S. BLS software-developer wages. The U.S. professional rate (~$75-78/hr) stays only as a high-end static scenario. Maintenance is still 1.0 hour/month at the midpoint for steady-state Profile A operators. After hobbyists, automation, and lower-wage regions, the worldwide median is likely lower still.

**Data.** Historical chain size, block size, and median transaction fees come from blockchain.info public chart APIs (year-end samples). Reachable-peer history comes from the KIT DSN Bitcoin Network Monitor. Hardware and RAM prices use retail series (storagediskprices.com, TrendForce, Stanford DAM, McCallum/jcmit). Electricity uses EIA U.S. residential averages as a hardware-power anchor. Operator hourly rates in the automated series use the worldwide median path; U.S. BLS rates appear only in high-end static scenarios. BTC opportunity uses CoinLore annual price averages.

---

## II. Representative Node Profiles

Aggregation needs clear point estimates. The document uses two profiles: a home operator and a VPS operator. VPS hosting does not remove cost. It rearranges it.

### Profile A: Home Operator (Primary)

A typical worldwide median operator is technically literate (comfortable with software, not a Bitcoin specialist), running a full archival node on a mini-PC with flat-rate or unmetered broadband where available. This sits in the middle: not a hobbyist who values time at zero, and not a high-diligence U.S. professional who manually verifies every release at full BLS wages.

Variance is large. Experienced hobbyists, operators in lower-wage regions, and heavily automated setups often report much lower effective cost than this midpoint. The model aims at a median for aggregation, not a ceiling.

Listening operators add relay capacity and eclipse resistance. Non-listening nodes validate locally but do not serve peers, so their ongoing bandwidth is lower. All per-node figures in the category sections use Profile A unless noted otherwise.

### Profile B: VPS Operator

A full archival node needs roughly 700-750GB storage as of mid-2026, 8GB RAM minimum, and adequate CPU. Entry-level $5-10/month VPS plans are not enough. A realistic archival setup is about 4 vCPU, 8-16GB RAM, and 800GB-1TB storage: roughly $30-50/month on Hetzner (EU), $40-80 on Vultr, $50-100 on DigitalOcean.

<figure class="article-chart chart-compare">
<div class="chart-heading">Home vs VPS (mid, monthly)</div>
<div class="compare-cols" role="img" aria-label="Home operator about 70 dollars per month operating; VPS about 84 dollars">
<div class="compare-col compare-open">
<div class="compare-label">Home (Profile A, 2026)</div>
<ul class="compare-list">
<li>Operating ~$70/mo automated</li>
<li>Hardware amortized once</li>
<li>~$960 hardware over 5 years</li>
<li>Same learning + maintenance</li>
</ul>
</div>
<div class="compare-col compare-gated">
<div class="compare-label">VPS (Hetzner mid)</div>
<ul class="compare-list">
<li>~$84/mo ($40 sub + time)</li>
<li>Subscription has no endpoint</li>
<li>~$2,400 sub over 5 years</li>
<li>Same learning + maintenance</li>
</ul>
</div>
</div>
<figcaption>VPS saves upfront capital but costs more over five years. Hosting changes how you pay; it does not erase the bill.</figcaption>
</figure>

---

## III. Cost Categories

### Category 1: Hardware Depreciation

The monthly cost of owning the hardware, spread over useful life.

**Storage.** A pruned node stores roughly 15-20GB after IBD; a full archival node stores ~700-750GB as of mid-2026. Pruning is a post-IBD state: every operator still downloads the full chain on first sync. Post-IBD growth runs ~70-90GB/year. At $200/TB NVMe, a replacement within five years adds roughly $3.33/month. Falling media prices (roughly 15-20%/year for consumer NVMe lately) offset some of the chain growth on this line.

**RAM.** Chainstate is ~7-12GB on disk. Minimum 8GB RAM reserved; 16GB recommended. At $20/GB over 5 years, 8GB reserved is ~$2.67/month.

**Compute.** Midpoint ~$350 for a competent home build, or ~$5.83/month over 5 years.

**Monthly hardware depreciation (full node, NVMe, including replacement):** about $13-18 at mid-2026 prose anchors; **$11.67/month** in the 2026 automated model.

### Category 2: Bandwidth

IBD is the same for pruned and archival operators (~690-740GB one-time). Ongoing listening relay commonly uses 150-400GB/month. For a representative operator on unlimited broadband, marginal cost is ~$5-15/month if the connection already exists, or $15-40 if it would not exist otherwise. Automated 2026 profile: **$10/month**.

### Category 3: Power

Raspberry Pi ~$1/month; mini-PC ~$5/month; desktop ~$12/month at ~$0.15-0.18/kWh EIA residential averages. Automated 2026 profile: **$4.58/month**.

### Category 4: Learning Cost (One-Time, Amortized)

Time to reach reliable first operation for a technically literate non-specialist: roughly 10-20 hours. Packaged products (Start9, Umbrel, RaspiBlitz) ease install work but do not remove networking, verification, or monitoring. They can raise effective cost when "turnkey" expectations meet real failure modes.

| Scenario | Hours | Rate | Amortized/mo |
|---|---|---|---|
| Low (experienced) | 8 | $35/hr | $5 |
| Mid (worldwide) | 15 | $35/hr | $9 |
| High (U.S. diligence) | 25 | $100/hr | $42 |

Automated 2026 profile: **$8.75/month**.

### Category 5: Ongoing Maintenance

Updates, verification, troubleshooting, monitoring. Midpoint **1.0 hour/month** at ~$35/hr worldwide median, or **$35/month**. High static scenario: 2 hours at $75/hr. Many steady-state operators with automation report 30-60 minutes/month or less.

### Category 6: Opportunity Cost of Capital

Capital locked in hardware instead of BTC. Static era bars use a fixed 20%/year on hardware value. The automated yearly series uses actual BTC year-over-year return on that year's hardware capital (floored at zero in down years). **Operating charts exclude opportunity** so bull-year spikes do not warp the operating trend. 2026 automated year-over-year opportunity is $0.

---

## IV. Total Monthly Cost

### Static snapshot (illustrative)

Rounded anchors for a new Profile A operator today. Mid uses worldwide median wages. High uses U.S. professional time rates. Do not compare these rows bit-for-bit to the automated 2026 profile ($69.99/mo operating).

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Category</th><th>Low</th><th>Mid</th><th>High</th></tr>
</thead>
<tbody>
<tr><td>Hardware</td><td>$13</td><td>$12</td><td>$18</td></tr>
<tr><td>Bandwidth</td><td>$5</td><td>$10</td><td>$40</td></tr>
<tr><td>Power</td><td>$1</td><td>$5</td><td>$12</td></tr>
<tr><td>Learning (amortized)</td><td>$5</td><td>$9</td><td>$42</td></tr>
<tr><td>Maintenance</td><td>$18</td><td>$35</td><td>$150</td></tr>
<tr><td>Opportunity (fixed 20%)</td><td>$8</td><td>$16</td><td>$25</td></tr>
<tr><td>Operating subtotal</td><td>$42</td><td>~$71</td><td>$262</td></tr>
<tr><td>All-in</td><td>$50</td><td>~$87</td><td>$287</td></tr>
</tbody>
</table>
<figcaption>Static anchors for intuition. Automated 2026 operating cost is $69.99/month.</figcaption>
</figure>

### Automated 2026 operating composition

<figure class="article-chart chart-stackbar">
<div class="chart-heading">One listening node, operating cost (2026 automated)</div>
<div class="stackbar" role="img" aria-label="Maintenance 50 percent, bandwidth 14 percent, hardware 17 percent, learning 12 percent, power 7 percent">
<span class="stack-seg stack-major" style="width:50%">Maint</span>
<span class="stack-seg stack-knots" style="width:17%">HW</span>
<span class="stack-seg stack-minor" style="width:14%">BW</span>
<span class="stack-seg stack-active" style="width:12.5%">Learn</span>
<span class="stack-seg stack-minor" style="width:6.5%">Pwr</span>
</div>
<dl class="chart-stats">
<div><dt>Maintenance</dt><dd>$35.00</dd></div>
<div><dt>Hardware</dt><dd>$11.67</dd></div>
<div><dt>Bandwidth</dt><dd>$10.00</dd></div>
<div><dt>Learning</dt><dd>$8.75</dd></div>
<div><dt>Power</dt><dd>$4.58</dd></div>
<div><dt>Total</dt><dd>$69.99/mo</dd></div>
</dl>
<figcaption>Operator time (learning + maintenance) is ~$44/month, larger than hardware, bandwidth, and power combined.</figcaption>
</figure>

### Time-varying series (selected years)

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Year</th><th>Hardware</th><th>Power</th><th>Learning</th><th>Maint.</th><th>Bandwidth</th><th>Operating</th></tr>
</thead>
<tbody>
<tr><td>2012</td><td>$8.93</td><td>$6.07</td><td>$3.07</td><td>$11.50</td><td>$5.00</td><td>$34.57</td></tr>
<tr><td>2016</td><td>$11.23</td><td>$4.58</td><td>$4.17</td><td>$18.75</td><td>$8.00</td><td>$46.73</td></tr>
<tr><td>2020</td><td>$8.37</td><td>$3.36</td><td>$6.07</td><td>$24.50</td><td>$10.00</td><td>$52.29</td></tr>
<tr><td>2023</td><td>$7.07</td><td>$4.09</td><td>$8.25</td><td>$33.00</td><td>$10.00</td><td>$62.40</td></tr>
<tr><td>2026</td><td>$11.67</td><td>$4.58</td><td>$8.75</td><td>$35.00</td><td>$10.00</td><td>$69.99</td></tr>
</tbody>
</table>
<figcaption>Operating cost roughly doubled from 2012 to 2026 at worldwide median wages. Combined operator time exceeds hardware every year shown.</figcaption>
</figure>

Era stacked comparison (fixed 20% opportunity on hardware, so the mix across eras is not warped by year-over-year returns):

| Era | Hardware | Operator time | Other operating | Opportunity (20%) | All-in |
|---|---|---|---|---|---|
| 2012 | $8.93 | $14.57 | $11.07 | $8.93 | $43.50 |
| 2018 | $9.63 | $25.65 | $12.76 | $9.63 | $57.67 |
| 2024 | $7.78 | $42.50 | $14.21 | $7.78 | $72.27 |
| 2026 | $11.67 | $43.75 | $14.58 | $11.67 | $81.66 |

Hardware-only estimates (~$6.80/month storage+RAM at mid-2026 media prices) leave out the dominant time categories. A non-signaling node costs **$64.99/month** operating in the 2026 automated model (lower relay bandwidth).

---

## V. Network-Level Aggregation

**Listening nodes** accept inbound connections and take part in relay. Bitnodes tracked roughly 15,000-20,000 through April 2026 (service offline May 2026). Aggregates use midpoint **17,500**. KIT DSN reachable-peer history uses a different method and is not directly comparable.

**Non-signaling full nodes** sit behind NAT or firewalls. Community estimates put total full nodes at roughly 2-3× the listening count, or ~45,000-80,000, midpoint **~60,000**. They enforce consensus but do not add relay capacity.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Annual operating cost vs Core development spend (2026)</div>
<div class="intensity-row">
<span class="intensity-name">Listening</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:31%"></span></div>
<span class="intensity-value">$14.7M</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Full pop.</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">$47.8M</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Core dev</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:19%"></span></div>
<span class="intensity-value">~$9M</span>
</div>
</div>
<figcaption>Listening: $69.99/mo × 17,500. Full population: blended $66.45/mo × ~60,000. Core spend ~$9M (2025-26 public statements). Ratio is illustrative; a hobbyist-heavy population implies a lower effective aggregate.</figcaption>
</figure>

Plausible bands: listening ~$8-30M/year; full population ~$25-80M/year. On an operating basis, node operators absorb several times Core development spend, with no formal governance stake and no payback when protocol decisions raise their costs.

---

## VI. The Opportunity Cost of Node Density

Individual operators bear the costs above. Density loss hits every Bitcoin holder.

**IBD propagation.** Fewer listening peers means slower sync for new operators, more abandonment, and further density loss. The feedback is uneven: cutting nodes from a thin network hurts more than adding nodes to a dense one helps.

**Eclipse surface.** Attack cost scales with the ratio of attacker-controlled peers to honest peers. Every listening node that exits because cost no longer makes sense makes eclipse attacks a bit cheaper for everyone left.

**Propagation redundancy.** Thinner networks push relay onto fewer well-connected supernodes. That is centralization at the relay layer even when validation stays formally decentralized.

Putting an exact dollar figure on security loss is out of scope. For scale: a 1% market-cap discount on a ~$2T asset is $20B, against ~$48M/year full-population operating cost in this model.

---

## VII. Non-Monetary Data: Cost Distribution

Every full node stores and downloads historical chain data whether or not the operator cares about non-monetary use. For the design case against treating Bitcoin as general-purpose storage, see *[Bitcoin Is Not a Hard Drive](/articles/bitcoin-not-a-hard-drive)*. For which embedding channels consensus can close, see *[The Achievable Floor](/articles/the-achievable-floor)*.

### UTXO set burden

Mempool Research (May 2025, tip 892385): **29.6%** of UTXOs are inscription-related (51,188,145 of 173,190,861), holding only 415.16 BTC total (mean 811 sats). Roughly 3.3GB of every node's ~11GB chainstate is inscription-related. Inscription UTXOs are spendable, so the share can fall if they are spent, but spent outputs stay in chain history and still load IBD.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">UTXO set by count (May 2025)</div>
<div class="stackbar" role="img" aria-label="29.6 percent inscription-related UTXOs">
<span class="stack-seg stack-major" style="width:29.6%">29.6%</span>
<span class="stack-seg stack-minor" style="width:70.4%">70.4%</span>
</div>
<div class="stackbar-legend">
<span><strong style="color:var(--primary)">■</strong> Inscription-related</span>
<span><strong style="color:var(--border)">■</strong> Other</span>
</div>
</figure>

### Chain storage burden

Baseline subtraction (pre-Ordinals ~435GB end-2022, organic ~50-60GB/yr vs actual growth to 700-750GB): non-monetary data is about **12-19%** of chain size, or **~85-140GB**. Fees from that activity went to miners. Node operators absorbed permanent storage and bandwidth.

### Ongoing per-node burden (automated)

Ongoing monthly non-monetary burden inside operating cost (storage depreciation + relay × flow-share + UTXO amortization; excludes operator time):

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Year</th><th>Chain share</th><th>Flow share</th><th>UTXO share</th><th>NM $/mo</th><th>% of operating</th></tr>
</thead>
<tbody>
<tr><td>2023</td><td>7.5%</td><td>30%</td><td>8%</td><td>$4.65</td><td>7.5%</td></tr>
<tr><td>2024</td><td>12.5%</td><td>38%</td><td>18%</td><td>$6.31</td><td>9.8%</td></tr>
<tr><td>2025</td><td>15.6%</td><td>32%</td><td>29.6%</td><td>$6.05</td><td>9.0%</td></tr>
<tr><td>2026</td><td>14.6%</td><td>28%</td><td>29.6%</td><td>$5.52</td><td>7.9%</td></tr>
</tbody>
</table>
<figcaption>2026 snapshot with fixed mid shares: $5.54/mo inside $69.99/mo (~$4.0M/yr across ~60,000 nodes).</figcaption>
</figure>

One-time / cohort research estimates: $17-28 per node in storage capital for 85-140GB at $200/TB. Across 9,000-12,000 new nodes/year, collective inscription IBD bandwidth is about 765GB-1.68TB annually.

These figures motivate consensus pricing of UTXO creation in the *[Static Per-Output Miner Fee](/bips/static-per-output-miner-fee)* pre-proposal.

---

## VIII. Limitations

- **Medians, not ceilings.** Hobbyists, automation, and lower-wage regions often incur far less.
- **Time cost is high-variance and subjective.** Hours are self-reported; many operators would not treat imputed wages as a cash cost.
- **Infrastructure anchors are partly U.S./EU.** Metered international bandwidth can be higher; free hosting lower.
- **Node counts are uncertain.** Bitnodes went offline May 2026; the non-signaling multiplier is not directly measured.
- **Successful operators only.** Abandoned setups understate population learning cost.
- **Non-monetary value of running a node** (privacy, sovereignty, education) is not subtracted from expense.
- **Aggregates are order-of-magnitude** ($25-80M full-population band).

---

## IX. Sources

- blockchain.info chart APIs (chain size, fees)
- KIT DSN Bitcoin Network Monitor (reachable peers)
- storagediskprices.com / TrendForce / Stanford DAM / McCallum DRAM (media prices)
- EIA residential electricity averages
- CoinLore BTC annual averages
- Jameson Lopp node benchmarks (2023, 2025)
- Mempool Research UTXO Set Report, May 2025, tip 892385
- bitcoin.org full node documentation
- 1A1z report on Core funding (2023); Brink / Mike Schmidt public statements (2025-26 Core spend ~$9M)
- Blockspace Weekly / Galaxy / Mononaut fee-share commentary (2023-25)
- Hetzner / Vultr / DigitalOcean VPS pricing (mid-2026)
