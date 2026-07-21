# Who Controls Bitcoin
## The Structural Capture of Bitcoin Core Development

*A reference document for analytical reasoning about Bitcoin governance*

**Note on “one codebase” and node counts.** Reachable-node surveys often split clients (e.g. Bitcoin Core vs Knots; percentages shift with time and methodology). This document uses **99%** and **single lineage** to mean software traceable to the **Bitcoin Core codebase** (the Core project plus Core-derived clients such as Knots that merge upstream), not a claim about every machine running the branded “bitcoind” binary. The structural claim is near-monoculture of that lineage and concentrated merge authority over its upstream.

---

## Contents

- [I. The Premise](#i-the-premise)
- [II. The Governance Reality](#ii-the-governance-reality)
- [III. The Funding Map](#iii-the-funding-map)
- [IV. The Personnel Revolving Door](#iv-the-personnel-revolving-door)
- [V. The Adversarial Layer: When Conflicts Become Visible](#v-the-adversarial-layer-when-conflicts-become-visible)
- [VI. The No-Spec Moat and Why It Matters](#vi-the-no-spec-moat-and-why-it-matters)
- [VII. The Structural Argument in Summary](#vii-the-structural-argument-in-summary)

---

## I. The Premise

Bitcoin is described, by default, as decentralized open-source software maintained by a global community of volunteers. That description is technically accurate and functionally misleading. The network's consensus rules are decentralized. The development of the software that enforces those rules is not. Roughly 99% of economic nodes run software from that single upstream lineage, overwhelmingly the Bitcoin Core project’s releases, with a minority on Core-derived clients such as Knots. A small, interconnected group of funded developers decides what ships in that codebase. A smaller group holds merge authority. The people funding those developers have direct financial interests in specific protocol outcomes. When that funding map is examined alongside the personnel history and the decisions that have and have not been made over sixteen years, what emerges is not a conspiracy but a structural capture vector operating exactly as structural capture vectors operate: through acculturated judgment, financial dependency, and the quiet exclusion of inconvenient arguments from legitimate venues.

This document presents the structural argument in full, supported by the adversarial funding and personnel evidence. It is intended as an analytical reference for reasoning about Bitcoin governance accurately. For a numbered argument map, see *[Bitcoin Governance: Argument Map](/articles/bitcoin-governance-argument-map/)*. For why the structure produces these outcomes without requiring conspiracy, see *[The Social Layer Is the Attack Surface](/articles/bitcoin-social-capture/)*.

---

## II. The Governance Reality

### The Implementation Monopoly

When the same upstream lineage supplies almost all economically relevant consensus nodes, the distinction between Bitcoin the network and “whatever Bitcoin Core’s maintainers ship” becomes practically meaningless. The network enforces what that lineage releases. The consensus rules are what that software encodes. This is not a theoretical concern. CVE-2018-17144, an inflation bug that could have allowed Bitcoin to be created out of thin air, sat in production in Bitcoin Core for eighteen months. A second independent implementation running differential tests against the same blocks would have caught it immediately. The bug was in Core. Core's monopoly is what made it dangerous.

A common objection points to miners: they may run any consensus-compatible software and need not adopt every release. That permission is real; the practiced behavior is not a distributed audit. Industrial mining largely follows operational defaults: pool infrastructure, hosting providers, and routine upgrades to stay compatible with peers and with the dominant client, rather than a deliberate, release-by-release review of consensus changes by the majority of hash rate. A veto almost no one pays the cost to exercise is not the same as decentralized control over what merges.

Bitcoin has never had a formal mathematical specification of its consensus rules. Producing one inside Core's process has been attempted for years without meaningful progress toward an adopted specification. Without a specification, every alternative implementation must reverse-engineer undocumented behavior from Core itself, which means staying architecturally dependent on Core by definition. That is not an accident. Unspecified behavior creates a structural barrier to competition that cannot be resolved without an independent mathematical specification. The absence of a spec is the mechanism that makes the implementation monopoly self-perpetuating.

### The Merge Authority Structure

Sixteen years of Bitcoin Core governance data in [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) document a **PR-weighted contribution Gini coefficient of ~0.851** (and similarly extreme concentration in reviews), with the **top three merger roles accounting for roughly 80%+ of historical merges** in the full-history rollup ([`findings/EXECUTIVE_SUMMARY.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/EXECUTIVE_SUMMARY.md), [`findings/GINI_COEFFICIENT_EXPLANATION.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/GINI_COEFFICIENT_EXPLANATION.md)). **Merge and commit permissions on [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin) are authoritative;** the live roster is currently **five** merge holders (Gloria Zhao no longer holds that role). The structural point is unchanged: **a small, fixed-capacity set** of people can land code in the reference implementation, and **their institutional ties overlap the funding map**, including Chaincode employment, Brink grants, Spiral (Block’s Bitcoin arm), Localhost-style hosts, and similar channels. These are not anonymous volunteers in the aggregate; they are employees and grantees of a **small, identifiable** set of institutions, and those institutions have financial entanglements with commercial operations that benefit from specific protocol directions.

The informal merge authority structure means there is no formal process, no published criteria, and no accountability mechanism for what gets merged and what does not. Core developers disclaim ownership and authority over Bitcoin while exercising exactly that authority through PR closure and moderation. When critics name conflicts of interest on GitHub, they get moderated off. In the 2025 OP_RETURN controversy, someone flagged a conflict of interest in the discussion thread and was banned. That is not the behavior of a commons with no governance. That is governance defending itself.

### What the Quantitative Record Shows

The same research finds extreme merge concentration (Gini on PR-weighted activity ~0.851), high contributor churn (many participants with minimal sustained engagement), near-total voting-bloc cohesion among top reviewers in the dataset, and a pattern of governance paralysis on major protocol improvements that would have reduced dependence on the current institutional infrastructure. Contributor accounts in Section III describe how funding dependency and institutional geography further narrow who sustains engagement in that dataset.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">Historical merge share (Bitcoin Core, full-history rollup)</div>
<div class="stackbar" role="img" aria-label="Top three merger roles accounted for 81 percent of merges; all other contributors 19 percent">
<span class="stack-seg stack-major" style="width:81%">81%</span>
<span class="stack-seg stack-minor" style="width:19%">19%</span>
</div>
<div class="stackbar-legend">
<span><strong style="color:var(--primary)">■</strong> Top 3 merger roles</span>
<span><strong style="color:var(--border)">■</strong> All other contributors</span>
</div>
<dl class="chart-stats">
<div><dt>PR-weighted Gini</dt><dd>~0.851</dd></div>
<div><dt>Merge holders today</dt><dd>5 on bitcoin/bitcoin</dd></div>
</dl>
<figcaption>Merge concentration from <a href="https://github.com/secsovereign/bitcoin-governance-research">Bitcoin Governance Research</a>. A handful of accounts land most code in the reference client.</figcaption>
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">L1 protocol funding per $1T native market cap (approx.)</div>
<div class="intensity-row">
<span class="intensity-name">Bitcoin</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:3.4%"></span></div>
<span class="intensity-value">$4.2M</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Polkadot</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:0.6%"></span></div>
<span class="intensity-value">~$0.7M</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Ethereum</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">~$125M</span>
</div>
</div>
<figcaption>Protocol-layer grants only. Bitcoin ~$8.4M (2023) on ~$2T cap; Polkadot ~$16.8M (2024) on ~$24B cap; Ethereum ~$50M (2024) on ~$400B cap. Normalized for apples-to-apples comparison.</figcaption>
</figure>

<figure class="article-chart chart-gini">
<div class="chart-heading">Concentration indexes (0 = equal share, 1 = one actor)</div>
<div class="intensity-row">
<span class="intensity-name">PR contribution</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:85.1%"></span></div>
<span class="intensity-value">0.851</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">PR reviews</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-review" style="width:92%"></span></div>
<span class="intensity-value">~0.92</span>
</div>
</div>
<figcaption>PR-weighted Gini from <a href="https://github.com/secsovereign/bitcoin-governance-research">Bitcoin Governance Research</a>. Review activity concentrates even more than authorship.</figcaption>
</figure>

<figure class="article-chart chart-stackbar">
<div class="chart-heading">Qualifying contributors: sustained engagement</div>
<div class="stackbar" role="img" aria-label="41 active contributors and 91 inactive of 132 qualifying contributors">
<span class="stack-seg stack-active" style="width:31%">41 active</span>
<span class="stack-seg stack-minor" style="width:69%">91 inactive</span>
</div>
<div class="stackbar-legend">
<span><strong style="color:var(--primary)">■</strong> Active in pipeline</span>
<span><strong style="color:var(--border)">■</strong> Inactive</span>
</div>
<dl class="chart-stats">
<div><dt>Qualifying pool</dt><dd>132 authors</dd></div>
<div><dt>Threshold</dt><dd>≥5 PRs · quality ≥0.3</dd></div>
</dl>
<figcaption>From <a href="https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/CONTRIBUTOR_TIMELINE_ANALYSIS.md"><code>findings/CONTRIBUTOR_TIMELINE_ANALYSIS.md</code></a>. High churn: most participants with meaningful PR history do not stay active.</figcaption>
</figure>

> The oligarchic structure is not a theoretical concern. It is documented across sixteen years of governance data. Reality overrides theory.

---

## III. The Funding Map

### Chaincode Labs

Founded in 2014 by Alex Morcos and Suhas Daftuar, both co-founders of Hudson River Trading, one of the world's largest high-frequency trading firms. Chaincode is self-funded by HRT trading wealth, meaning there are no external investors to disclose, but the entire operation flows from two algorithmic trading billionaires who decided to bankroll the gatekeeper layer of Bitcoin protocol development. Chaincode funds several Bitcoin Core contributors and runs the residency programs that serve as the primary pipeline into Core development.

Alex Morcos sits on the board of Coin Center, the D.C.-based cryptocurrency policy advocacy organization, giving Chaincode direct representation in the regulatory lobbying apparatus. Coin Center was itself seeded with funding from Andreessen Horowitz, Coinbase, Hudson River Trading, and Union Square Ventures. The same wealth that funds Chaincode also seeded the primary Bitcoin policy advocacy arm in Washington.

The Epstein connection is documented in the 2026 document release. A September 2014 email shows Jeremy Rubin introducing Joi Ito and Alex Morcos to Jeffrey Epstein, with Rubin writing that Morcos was a primary donor who helped organize fundraising. A 2016 email shows Rubin explicitly positioning Chaincode to Epstein as a prime example of innovative crypto R&D, with plans for a face-to-face meeting in New York. Epstein's web of influence extended through MIT's Digital Currency Initiative, which in 2015 became the institutional home for Bitcoin Core developers after the Bitcoin Foundation's collapse, with Epstein having donated $525,000 specifically earmarked for the DCI. The rescue of Bitcoin Core's institutional infrastructure after the Foundation's bankruptcy ran through an institution Epstein had directly funded.

### Blockstream

Founded in 2014 by Bitcoin Core developers Gregory Maxwell, Pieter Wuille, Matt Corallo, Jorge Timon, and Mark Friedenbach, alongside Adam Back and venture capitalist Austin Hill. The founding team is literally drawn from the Bitcoin Core maintainer class, creating direct corporate interest in Core's technical direction from day one. Blockstream has raised $651 million at a $3.2 billion valuation across eight rounds, with investors including Reid Hoffman as a board member, Horizons Ventures (Li Ka-shing's fund), AXA Strategic Ventures, Digital Currency Group, Baillie Gifford, and Bitfinex. Jeffrey Epstein appears in investor databases as a Blockstream backer from the 2014 seed round, with that stake later divested due to, in the words of Adam Back, "potential conflict of interest and other concerns."

Blockstream directly employs Bitcoin Core developers. The personnel flow between Blockstream and Chaincode is continuous. Pieter Wuille co-founded Blockstream before moving to Chaincode as a full-time maintainer. Matt Corallo was an early Lightning developer at Blockstream before moving to Chaincode. Brink co-founder Mike Schmidt came from a product manager role at Blockstream. Brink's Director of Operations previously worked at Chaincode. These are not coincidences. They are the personnel structure of a tightly integrated institutional network.

### Brink

Founded in 2020 by John Newbery, who came out of Chaincode Labs, and Mike Schmidt, who came from Blockstream. Seeded by John Pfeffer and Wences Casares. Major subsequent donors include Coinbase ($3.6 million), Jack Dorsey's StartSmall initiative ($5 million over five years), and VanEck (5% of spot Bitcoin ETF profits). **Several** sitting Bitcoin Core maintainers have been funded through Brink. Nearly every developer who has entered the Core maintainer class since 2022 passed through Brink's fellowship or grant programs first. Brink is the primary selection filter for who gets to maintain Bitcoin's reference implementation.

John Pfeffer, one of Brink's founding donors, also invested in Alpen Labs, a ZK rollup project building on Bitcoin. Wences Casares, the other founding donor, also invested in Alpen Labs and is a founding donor to Localhost Research, the organization now housing two Bitcoin Core maintainers. These are people simultaneously funding the developers who govern the base layer and investing in commercial operations whose success depends on how those developers govern it.

Brink documents the first tier. In a later return appearance on The Bitcoin Infinity Show (2026), Jon Atack said he asked a South African contributor how he had become maintainer without a fixed desk at Chaincode, Brink, or Blockstream. Atack quoted the reply: the contributor had rotated through Core-affiliated offices on a roughly three month cycle, visiting every institution and every key person in turn. Atack said that was what needed to be done. Nothing in Core's published process requires office rotation. Developers who will not relocate or stay on the road continuously are filtered out by geography and institutional access before technical merit gets a full hearing.

### OpenSats and the Dorsey Concentration Problem

OpenSats operates with a nine-person volunteer board and presents itself as a decentralized funding vehicle. In 2024 it received $23.6 million in donations, of which $21 million, roughly 90%, came from Jack Dorsey's StartSmall initiative alone.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">OpenSats 2024 donations by source</div>
<div class="stackbar" role="img" aria-label="90 percent from StartSmall, 10 percent from all other donors">
<span class="stack-seg stack-major" style="width:90%">StartSmall 90%</span>
<span class="stack-seg stack-minor" style="width:10%">Other 10%</span>
</div>
<dl class="chart-stats">
<div><dt>StartSmall (Dorsey)</dt><dd>~$21M</dd></div>
<div><dt>Total raised</dt><dd>$23.6M</dd></div>
</dl>
<figcaption>Single-donor concentration in the primary public grant channel.</figcaption>
</figure>

Dorsey's footprint across Bitcoin's governance infrastructure is wider than any other single actor. He is the dominant funder of OpenSats, a major donor to Brink, and the founder of Spiral, which **directly employs at least one Bitcoin Core maintainer with merge access**. He has also donated tens of millions to the Human Rights Foundation's Bitcoin Development Fund and Btrust. That means Dorsey's money touches a sitting maintainer directly through Spiral, the primary developer grant organization at 90% of its funding, and multiple secondary grant channels simultaneously. A single donor with that reach across the governance infrastructure represents a structural concentration of influence that has no parallel in Bitcoin's development history.

Jon Atack has described how that funding map behaves from the contributor side. On [BIS #195](https://www.bitcoininfinityshow.com/bitcoin-core-from-the-inside-jon-atack-bis-195/), Knut Svanholm asked why Atack had withdrawn from co-authorship credit on Svanholm's first Bitcoin book; Atack explained he was pursuing Square Crypto funding and needed to keep a low-controversy public profile. In a later return appearance on The Bitcoin Infinity Show (2026), Atack said that he had self-censored for seven years while grant renewal sat in the background, that Spiral funded him for four years before declining to renew with a stated rationale he described as nonsense, that Maelstrom did not renew in favor of another developer, and that a maintainer and a senior developer went to the OpenSats board and talked about his funding behind his back without naming them on air. Nobody sent a memo about what to avoid. He inferred the lines from who holds the grant keys.

### Localhost Research

Launched in late 2024 with founding donors Mark Casey and Wences Casares and board members Matt Corallo and Denise Terry. The founding team is Mark Erhardt and Ava Chow. **Chow has held Bitcoin Core merge access while housed there.** Casares, as noted above, also seeded Brink and invested in Alpen Labs. Matt Corallo previously worked at Blockstream before moving to Chaincode. Localhost is a **new node** in the network: it **hosts** Core maintainers and is funded by investors with **active** financial interests in protocol-adjacent commercial ventures.

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Institution</th><th>Founded</th><th>Role in Core governance</th><th>Headline figures / ties</th></tr>
</thead>
<tbody>
<tr><td>Chaincode Labs</td><td>2014</td><td>Funds Core contributors; residency pipeline</td><td>HRT self-funded; Morcos on Coin Center board</td></tr>
<tr><td>Blockstream</td><td>2014</td><td>Employs Core developers; L2 commercial interests</td><td>$651M raised; founding team from maintainer class</td></tr>
<tr><td>Brink</td><td>2020</td><td>Grants, fellowships; maintainer selection filter</td><td>Coinbase $3.6M; StartSmall $5M/5yr; VanEck ETF share</td></tr>
<tr><td>OpenSats</td><td>2020</td><td>Primary public grant channel</td><td>$23.6M raised (2024); ~90% StartSmall (Dorsey)</td></tr>
<tr><td>Spiral (Block)</td><td>2021</td><td>Direct employer of Core maintainer(s)</td><td>Dorsey; merge access on payroll</td></tr>
<tr><td>Localhost Research</td><td>2024</td><td>Hosts Core maintainers</td><td>Casares, Casey donors; Chow merge access while housed</td></tr>
</tbody>
</table>
<figcaption>Funding and hosting institutions (§III). Narrative detail and primary sources in subsections above.</figcaption>
</figure>

---

## IV. The Personnel Revolving Door

<figure class="article-chart chart-network">
<div class="chart-heading">Institutional funding map (schematic)</div>
<ul class="fund-network" aria-label="Funding institutions with overlapping personnel and grant paths to Bitcoin Core maintainers">
<li class="net-tier">
<span class="net-node">Chaincode</span>
<span class="net-conn" aria-hidden="true">↔</span>
<span class="net-node">Blockstream</span>
</li>
<li class="net-tier net-tier-bridge"><span class="net-bridge">shared founders · cross-employment</span></li>
<li class="net-tier">
<span class="net-node">Brink</span>
<span class="net-conn" aria-hidden="true">·</span>
<span class="net-node">OpenSats <span class="net-tag">~90% Dorsey</span></span>
</li>
<li class="net-tier net-tier-bridge"><span class="net-bridge">grants · fellowships · board overlap</span></li>
<li class="net-tier">
<span class="net-node">Spiral</span>
<span class="net-conn" aria-hidden="true">·</span>
<span class="net-node">Localhost</span>
</li>
<li class="net-tier net-tier-target">
<span class="net-node net-node-target">Core maintainers · merge access</span>
</li>
</ul>
<figcaption>Schematic, not exhaustive. Shows documented employment, grant, hosting, and donor concentration described in §III–IV.</figcaption>
</figure>

The pattern is not incidental. The people who fund Bitcoin Core development circulate through the same small set of institutions. Blockstream founders become Chaincode employees. Chaincode alumni found Brink. Brink's co-founder came from Blockstream. Brink's operations director came from Chaincode. **Current** merge holders map onto that same map (**Chaincode payroll, Localhost-style hosting, Spiral, Brink-funded paths**) in combinations that shift over time but **do not** dissolve the concentration. The governance research underlying these findings is published in [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research). The people deciding what ships in Bitcoin Core are employees and grantees of institutions whose founders and funders have direct financial interests in specific protocol directions. Contributor accounts of grant pressure and geographic filtering in Section III describe how that map operates from inside the pipeline.

This network is not assembled by explicit coordination. It is assembled by the normal operation of financial incentives, social trust, and institutional gravity. People fund what they understand. They hire from networks they trust. They develop intellectual frameworks that align with the interests of the institutions they work for. No individual needs to be corrupt for the system to produce captured outcomes. The mechanism is structural, not conspiratorial.

> Power without a name is the most dangerous kind. "Bitcoin isn't governable" is the claim that protects the people who already govern it from being held accountable. It is capture that learned to call itself freedom.

---

## V. The Adversarial Layer: When Conflicts Become Visible

### The OP_RETURN Controversy (2025)

In spring 2025, Antoine Poinsot of Chaincode Labs asked Peter Todd to open pull request 32359, which would remove Bitcoin Core's 83-byte OP_RETURN limit. Todd confirmed publicly that he was asked by an active Core developer because ZK rollup projects posting data to the base layer were using unprunable outputs instead of OP_RETURN due to size limits. Prominent public advocates for the change held disclosed financial ties to those commercial users. Community members raised the conflicts in the GitHub discussion thread. When someone flagged a conflict of interest explicitly, they were banned.

Balaji Srinivasan had previously donated $500,000 to Chaincode Labs after losing a high-profile Bitcoin bet in 2023. The thread runs: Balaji donates to Chaincode, Balaji invests in the same rollup ecosystem whose operators fund Core-adjacent developers, base-layer data usage creates operational friction with the existing OP_RETURN limit, a Chaincode developer solicits a PR that would resolve that friction in the operators' favor, the PR is introduced without disclosure of its corporate origin, community members who name the conflict get banned. Every node in the control network fired in the same direction at the same time, in service of a policy change that benefited VC-backed commercial operations with financial ties to the funders of those developers. Bitcoin Core v30 ultimately did remove the OP_RETURN cap.

### Conflicted Advocacy on Blockspace Policy

The OP_RETURN fight exposed a recurring pattern. Figures with equity in base-layer data businesses publicly opposed consensus proposals that would restrict arbitrary embedding, while promoting capacity-expansion proposals such as dynamic block size schemes that would give those businesses more headroom. Testnet and early-mainnet rollup usage had already demonstrated that data-availability demand can consume a significant fraction of Bitcoin bandwidth before full adoption. Policy positions aligned with portfolio exposure without requiring any explicit coordination. For the technical taxonomy of embedding channels and what consensus can close, see *[The Achievable Floor](/articles/the-achievable-floor/)*.

### The Dual Positioning of Brink's Founders

John Pfeffer seeded Brink at founding and invested in Alpen Labs, a competing ZK rollup building on Bitcoin. Wences Casares seeded Brink at founding, invested in Alpen Labs, and is now a founding donor to Localhost Research, which **has housed multiple** Bitcoin Core maintainers. These are people on both sides of the funding-to-grantee pipeline simultaneously, with commercial interests in protocol directions that the grantees they fund are positioned to influence. The conflict of interest is not alleged. It is structural and documented.

---

## VI. The No-Spec Moat and Why It Matters

The most important structural element of the implementation monopoly is the one least discussed. Bitcoin Core has never produced a formal mathematical specification of its consensus rules. This is not an oversight. It is the mechanism that makes the monopoly permanent. Without a specification, any alternative implementation must reverse-engineer undocumented behavior from Core itself. This means every alternative is architecturally dependent on Core by definition. Independent implementations are risky because a single validation bug can cause a chain split. So in practice, alternatives stay close to Core's codebase. Serious non-Core consensus implementations remain a **negligible fraction of deployed nodes** in public crawls, not enough to constitute real implementation competition, while everyone still validates against Core-shaped behavior without an independent spec. The market did not freely choose Core-derived code. It converged on the only option safe enough to run without a specification to validate against.

The "you can just fork it" response to governance critique is a non-answer in this context. A Core fork inherits the same monolithic architecture, the same 300,000 lines of technical debt, the same undocumented consensus behavior, and the same governance capture vectors. New maintainers on the same throne are not a structural fix. The fix is multiple independent implementations with proven consensus compatibility and genuinely different governance structures. That requires a formal specification as the independent standard against which consensus compatibility can be proven. The absence of that specification, over fifteen years, is the structural condition that makes everything else in this document stable. See *[The Social Layer Is the Attack Surface](/articles/bitcoin-social-capture/#vi-the-no-spec-moat-as-predictable-output)* for why the moat persists and *[Argument Map, Part XV](/articles/bitcoin-governance-argument-map/#part-xv-what-alternatives-actually-require)* for what genuine alternatives require.

> Without a formal specification, the "you can fork it" response concedes the governance critique rather than refuting it. It acknowledges the enormous switching cost while offering it as proof that no governance problem exists.

---

## VII. The Structural Argument in Summary

Bitcoin's governance problem is not that bad people made bad decisions. It is that the structure produces captured outcomes regardless of individual intent. The mechanism operates through four interlocking components.

The no-spec moat makes implementation monopoly permanent by design. Without a formal specification, alternatives cannot prove consensus compatibility without depending on Core itself, which means the monopoly is structurally self-perpetuating.

Concentrated merge authority creates a small, identifiable group whose judgments determine what ships in the software that most of the network runs. Those judgments are not made in a vacuum. They are made by people whose salaries come from institutions with financial interests in specific outcomes.

The funding map creates layered conflicts of interest that are rarely disclosed and never institutionally managed. The same small group of funders appears on both sides of the governance relationship simultaneously, funding the developers who govern the base layer and investing in commercial operations whose success depends on how those developers govern it.

When these conflicts are named in public forums, critics are moderated off. This is not incidental. It is the behavior of a power structure defending itself. The combination of undisclosed conflicts, concentrated authority, and active suppression of critics is the operational signature of structural capture.

The consequence is paralysis. Not because nobody at Core is capable, but because the governance structure cannot process improvements that threaten the interests of the institutions funding it. Stagnation on throughput, node cost, and payment-layer competitiveness created space centralized alternatives were happy to fill. Stablecoin transaction volume now exceeds Visa annually. Those are use cases Bitcoin should own. The governance structure left Bitcoin effectively unable to compete for them.

Implementation diversity is the structural fix, not a personnel change at Core. **Swapping one small maintainer cohort for another** without changing the monopoly implementation reproduces the same capture vector. The fix requires multiple independent implementations with proven consensus compatibility and different governance models, built from formal specifications that make the no-spec moat obsolete. That is not a small ask. It is exactly as hard as the governance problem predicts it would be.

---

*This document reflects analysis grounded in 16 years of Bitcoin Core governance data, public funding disclosures, documented personnel history, and primary source materials including GitHub records, funding announcements, and the 2026 Epstein document release. Claims about specific individuals reflect documented institutional affiliations, not allegations of individual misconduct.*