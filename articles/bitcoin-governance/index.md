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

Sixteen years of Bitcoin Core governance data in [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) document a **PR-weighted contribution Gini coefficient of ~0.851** (and similarly extreme concentration in reviews), with the **top three merger roles accounting for roughly 80%+ of historical merges** in the full-history rollup ([`findings/EXECUTIVE_SUMMARY.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/EXECUTIVE_SUMMARY.md), [`findings/GINI_COEFFICIENT_EXPLANATION.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/GINI_COEFFICIENT_EXPLANATION.md)). **Merge and commit permissions on [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin) are authoritative;** the live roster is currently **five** merge holders. The structural point is unchanged: **a small, fixed-capacity set** of people can land code in the reference implementation, and **their institutional ties overlap the funding map**, including Chaincode employment, Brink grants, Spiral (Block’s Bitcoin arm), Localhost-style hosts, and similar channels. These are not anonymous volunteers in the aggregate; they are employees and grantees of a **small, identifiable** set of institutions, and those institutions have financial entanglements with commercial operations that benefit from specific protocol directions.

The informal merge authority structure means there is no formal process, no published criteria, and no accountability mechanism for what gets merged and what does not. Core developers disclaim ownership and authority over Bitcoin while exercising exactly that authority through PR closure and moderation. When critics name conflicts of interest on GitHub, they get moderated off. That is not the behavior of a commons with no governance. That is governance defending itself. Section V traces one contested change end to end.

Brink's own [Engineering Impact Report 2025](https://brink.dev/blog/2026/03/26/engineering-impact-report-2025/) documents that Michael Ford ("fanquake") merged 56% of all changes to Bitcoin Core in 2025 and led every major release from v28.1 through v30.0 — published by the institution paying his salary as a funding success. The 2022+ merge window in [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) shows the same shape (~50% top-1, ~83% top-3; [`findings/MERGE_CONCENTRATION_DEPUTIES_REPORT.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/MERGE_CONCENTRATION_DEPUTIES_REPORT.md)). Fanquake also nominated Gloria Zhao for maintainership in June 2022, six months after Zhao had publicly endorsed expanding his GitHub owner permissions, including the ability to block accounts.

### What the Quantitative Record Shows

The same research finds extreme merge concentration (Gini on PR-weighted activity ~0.851), high contributor churn (many participants with minimal sustained engagement), **89.3% voting-bloc cohesion** among top reviewers ([`findings/EXECUTIVE_SUMMARY.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/EXECUTIVE_SUMMARY.md)), and a pattern of governance paralysis on major protocol improvements that would have reduced dependence on the current institutional infrastructure. Review labor is far less concentrated than merge authority: since 2017, the top three reviewers account for roughly **19%** of review volume while the top three mergers account for roughly **90%** ([`findings/REVIEW_ACCESS_OUTCOMES.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/REVIEW_ACCESS_OUTCOMES.md)). Many people review; almost nobody merges. Contributor accounts in Section III describe how funding dependency and institutional geography further narrow who sustains engagement in that dataset.

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

Adam Jonas, Chaincode's current CEO, is documented as the intellectual architect of Brink, not merely a parallel figure. On October 16, 2020 — 38 days before Brink's public launch — Jonas published a post arguing for a trusted nonprofit intermediary to fund Core developers, followed two days later by a detailed operational blueprint including IRS process, approval timelines, and template filings. His closing line was "Please do this." On launch day, Newbery acknowledged Jonas publicly: "Your initial research was what got the whole thing started." That acknowledgment does not appear in any Brink public materials, its IRS filings, or its launch press coverage. Jonas had also been hired into Chaincode by Newbery, his prior professional background being educational program design at the Flatiron School, not Bitcoin development. Newbery's stated reason for hiring him: "Jonas's background is in education. He was working in the Flatiron School and managing teams and projects there." The developer pipeline's chief architect was selected for program design expertise, not technical Bitcoin knowledge.

### Blockstream

Founded in 2014 by Bitcoin Core developers Gregory Maxwell, Pieter Wuille, Matt Corallo, Jorge Timon, and Mark Friedenbach, alongside Adam Back and venture capitalist Austin Hill. The founding team is literally drawn from the Bitcoin Core maintainer class, creating direct corporate interest in Core's technical direction from day one. Blockstream has raised $651 million at a $3.2 billion valuation across eight rounds, with investors including Reid Hoffman as a board member, Horizons Ventures (Li Ka-shing's fund), AXA Strategic Ventures, Digital Currency Group, Baillie Gifford, and Bitfinex. Jeffrey Epstein appears in investor databases as a Blockstream backer from the 2014 seed round, with that stake later divested due to, in the words of Adam Back, "potential conflict of interest and other concerns."

Blockstream directly employs Bitcoin Core developers. The personnel flow between Blockstream and Chaincode is continuous. Pieter Wuille co-founded Blockstream before moving to Chaincode as a full-time maintainer. Matt Corallo was an early Lightning developer at Blockstream before moving to Chaincode. Brink co-founder Mike Schmidt came from a product manager role at Blockstream. Brink's Director of Operations previously worked at Chaincode. These are not coincidences. They are the personnel structure of a tightly integrated institutional network.

### Brink

Founded in 2020 by John Newbery, who came out of Chaincode Labs, and Mike Schmidt, who came from Blockstream. Seeded by John Pfeffer and Wences Casares. Major subsequent donors include Coinbase ($3.6 million), Jack Dorsey's StartSmall initiative ($5 million over five years), and VanEck (5% of spot Bitcoin ETF profits). **Several** sitting Bitcoin Core maintainers have been funded through Brink. Nearly every developer who has entered the Core maintainer class since 2022 passed through Brink's fellowship or grant programs first. Brink is the primary selection filter for who gets to maintain Bitcoin's reference implementation.

Brink's Executive Director cited an independent grant committee as the governance safeguard for funding decisions, naming its members publicly on multiple occasions including Mike Schmidt, Gloria Zhao, Christian Decker, and David Harding. Zhao sat on the grant committee from March 2023 to March 2025 while simultaneously receiving Brink funding — a documented conflict of interest that was never formally managed. The committee's existence is contradicted by Brink's own federal filings: Schedule O of every IRS Form 990 from FY2020 through FY2023 states "The Organization did not have committees." The FY2023 filing carrying that declaration was submitted to the IRS in November 2024, ten months after Schmidt had publicly named the committee's members. Schmidt's explanation — that the committee is "Non-Governing" and therefore outside the 990's reporting requirement — is accompanied by the confirmation from Brink board member Jonathan Bier that no grant committee recommendation has ever been rejected.

Brink's founding decision, the selection of Gloria Zhao as its first fellow in December 2020, was made by a three-person board: Newbery, Schmidt, and Harding. Newbery had recruited Zhao, introduced her to the network, arranged her first meetings, and mentored her through nine months of development work before casting one of the three votes that made her Brink's first fellow. No conflict-of-interest process was followed. Two board members confirmed independently that no recusal was suggested or occurred. Harding, the third board member, had five months later co-designed the campaign to remove Luke Dashjr as BIP editor — a campaign Newbery publicly ACKed on the mailing list.

In December 2021, Newbery departed from both Brink and Bitcoin Core. According to two independent sources, the departure was not voluntary. Brink's IRS filing for FY2021 records the anomaly: Newbery received $359,044 in compensation that year — the largest single payment in Brink's documented history — compared to $0 the prior year. Schmidt's explanation is that this was deferred founding compensation. Whether any portion constitutes severance for an involuntary departure has not been confirmed or denied on the record.

John Pfeffer, one of Brink's founding donors, also invested in Alpen Labs, a ZK rollup project building on Bitcoin. Wences Casares, the other founding donor, also invested in Alpen Labs and is a founding donor to Localhost Research, the organization now housing two Bitcoin Core maintainers. These are people simultaneously funding the developers who govern the base layer and investing in commercial operations whose success depends on how those developers govern it.

Brink documents the first tier. In a later return appearance on The Bitcoin Infinity Show (2026), Jon Atack said he asked a South African contributor how he had become maintainer without a fixed desk at Chaincode, Brink, or Blockstream. Atack quoted the reply: the contributor had rotated through Core-affiliated offices on a roughly three month cycle, visiting every institution and every key person in turn. Nothing in Core's published process requires office rotation. Developers who will not relocate or stay on the road continuously are filtered out by geography and institutional access before technical merit gets a full hearing.

Contributors outside the funded pipeline describe a parallel filter: grant renewal pressure, inferred editorial lines, and decline after raising objections the institutions find inconvenient. See [§V](#suppression-and-exclusion) for documented cases.

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

The 2140 Foundation, another organization appearing on "decentralization" slides, adds a further data point. Its co-founder thanked OpenSats, HRF, and Schmidt personally by name at its launch event: "as a personal shoutout I also want to mention Mike Schmidt from Brink." The organization cited as evidence of funding diversification credited Brink's director for its existence. Its primary sponsor is OKX, which also funds Brink, Vinteum, and direct grants to individual developers including Amiti Uttarwar and Marco Falke. One exchange funder; multiple logos on the same slide.

### Localhost Research

Launched in late 2024 with founding donors Mark Casey and Wences Casares and board members Matt Corallo and Denise Terry. Casares is simultaneously a founding donor to Brink, an investor in Alpen Labs (a ZK-rollup project), and now a founding donor to Localhost — the same funder appearing at both ends of the funding pipeline across multiple institutions. Casey is also a founding donor to Brink. Two logos on any decentralization slide; two funders behind both. Corallo, who sits on Localhost's board, previously co-founded Chaincode's developer residency before handing it to Newbery, worked at Blockstream, and is now a Spiral employee — connecting Localhost's governance directly into the full institutional chain. Localhost co-founder Ava Chow held Bitcoin Core merge access while housed there; Localhost co-founder Mark Erhardt ("Murch") co-hosts the Bitcoin Optech weekly podcast with Brink's Executive Director Mike Schmidt.

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

### The Connective Tissue

Bitcoin Optech serves a function the institutional table does not fully capture. Founded in 2018 and seeded by Wences Casares, John Pfeffer, and Alex Morcos — the same funders who would later seed Brink — Optech operates as the primary technical communication infrastructure of the network. Its weekly newsletter and recap podcast are co-hosted by Mike Schmidt (Brink's Executive Director) and Mark Erhardt ("Murch," Chaincode employee and Localhost co-founder). Steve Lee, Optech's co-founder, described its political function explicitly at founding: it was built in part to facilitate the "post-SegWit2X healing process." It is simultaneously a technical newsletter and an institutional bridge. The same two people who appear across the most consequential governance decisions — Schmidt at Brink, Murch at Chaincode and Localhost — share a microphone every week, framing the development narrative for the broader ecosystem. When the OP_RETURN uncap direction was set at the May 1, 2025 IRC meeting, Murch offered Optech as the communications vehicle before the meeting had ended. Schmidt hosted the Optech podcast the following week, presenting the change as a neutral technical correction. The communications infrastructure and the governance infrastructure are operated by the same personnel.

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

The mechanism operating behind the revolving door is documented in primary sources with unusual specificity. The Optech dinner series, co-founded and organized by Newbery, functioned as a recruitment venue. Amiti Uttarwar met Newbery at an Optech dinner in early 2019 — she had previously applied to Chaincode's residency and been rejected. After the dinner, she applied again and was accepted, to a cohort Newbery himself co-organized. Her first grant from Xapo was, by her own account, arranged by Newbery and Jonas. Her Chaincode mentor during the residency, AJ Towns, was simultaneously her manager at Xapo. The mentorship relationship converted directly into an employment relationship at the same institution.

Gloria Zhao's recruitment followed a parallel track. She had applied to Chaincode in 2019 and been rejected. By the end of 2019 she had decided to leave the blockchain space entirely and was planning to remove any mention of blockchain from her resume. In January 2020, Jonas cold-emailed her. Her initial response was "nah, nah, I'm good. I'm done." Jonas followed up by phone. She told him directly she was not interested. He arranged a Stanford meeting anyway. She agreed to attend partly out of curiosity. At that meeting she met Newbery and Uttarwar. Nine months of mentorship from Newbery followed, conducted in the same city. In December 2020, Newbery cast one of three votes to make her Brink's first fellow, without recusal despite recruiting and mentoring her. She became a Bitcoin Core maintainer nineteen months later.

Matt Corallo articulated the pipeline's governing principle publicly in April 2018, calling for Bitcoin community outreach to underrepresented groups, framing it as evidence-based quality improvement. He explicitly blocked a critic who called this "social-Marxist ideology." The same year he launched Chaincode's developer residency, he described recruitment as finding "alignment socially over time." When challenged in March 2026 about whether DEI had ever influenced a funding decision, he stated the criteria were intelligence, commitment, and contribution history. Both female residents of the 2019 Chaincode residency had full-time funding within weeks of completing it. No male resident did, except one who was offered a position at Chaincode directly.

[Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) quantifies the outsider side of that pipeline: first-PR contributors merge roughly **16%** of the time since 2022, while established outsiders with five or more prior merges merge roughly **68%** ([`findings/MAINTAINER_PREMIUM_REPORT.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/MAINTAINER_PREMIUM_REPORT.md)). The gate is entry and large novel work, not a blanket block on outside contribution once established.

This network is not assembled by explicit coordination. It is assembled by the normal operation of financial incentives, social trust, and institutional gravity. People fund what they understand. They hire from networks they trust. They develop intellectual frameworks that align with the interests of the institutions they work for. No individual needs to be corrupt for the system to produce captured outcomes. The mechanism is structural, not conspiratorial.

> Power without a name is the most dangerous kind. "Bitcoin isn't governable" is the claim that protects the people who already govern it from being held accountable. It is capture that learned to call itself freedom.

---

## V. The Adversarial Layer: When Conflicts Become Visible

The funding map in Section III is not a static diagram. When a protocol change would benefit institutions already on that map, the same personnel, communication channels, and informal merge authority can move faster than the structure moves on improvements that threaten those interests. The 2025–2026 OP_RETURN controversy is the clearest documented case: a relay-policy change that benefited VC-backed base-layer data businesses, traced from a 2023 documentation amendment through merge over broad opposition. For PR-level chronology, see [hodlonaut's CAPTURE series](https://www.citadel21.com/the-merge) and [Antoine Poinsot's account](https://antoinep.com/posts/relay_policy_drama/). For measured blockspace impact, see *[The Achievable Floor, §VI](/articles/the-achievable-floor/#vi-the-actual-floor)*.

### The OP_RETURN Arc

**Documentation and framing (2023).** In June 2023, Marco Falke — newly funded by OKCoin and Paradigm — filed PR #27832, narrowing the documented scope of `-datacarriersize` from all data carrier transactions to `scriptPubKey` outputs only. Witness and script-path inscription fields were left outside the setting's documented scope. Falke filed it; AJ Towns and Greg Sanders ACKed; Gloria Zhao reviewed it; fanquake merged it over a NACK from Peter Todd. The change was not surfaced in Bitcoin Optech's recap podcast the week it merged — hosted by Brink's Executive Director. That same month, Zhao and Murch published an Optech series arguing that on-chain data publication cannot be prevented and should not live permanently in the UTXO set. The rhetorical frame deployed against Luke Dashjr's filter patch in 2024 was published before the patch existed.

**Filter patch and CVE (2023–2024).** Dashjr filed PR #28408 in September 2023 to extend `-datacarriersize` to witness and script-path data. He was not told the documentation had been narrowed four months earlier. The bypass was assigned [CVE-2023-50428](https://nvd.nist.gov/vuln/detail/CVE-2023-50428) in December 2023. When an external contributor filed a revert in January 2024, Towns, Falke, and Zhao closed it the same day. Zhao, Murch, and Towns then rejected Dashjr's filter patch using the post-amendment definition as baseline — without disclosing that the definition had changed. GitHub Issue #29187, Core's formal record of the CVE, remained open until October 2024, when Ava Chow closed it as "completed" without fixing the underlying code.

**Administrative sweep (October 2024).** The day Antoine Poinsot joined Chaincode Labs, he posted that the CVE record was being abused and should close. The next day, at a closed CoreDev PR session, Chow closed fourteen PRs in one afternoon — including inscription-related filter patches and Issue #29187. A Chaincode engineer banned an external critic within minutes. The NIST classification was extinguished administratively, not technically.

**Commission and advocacy (spring 2025).** Poinsot proposed dropping OP_RETURN limits on bitcoin-dev in April 2025, naming a ZK rollup project in the founding footnote. Peter Todd filed PR #32359 at Poinsot's request without payment disclosure. Prominent advocates for the change held disclosed financial ties to base-layer data businesses; comments requesting disclosure on the PR thread were marked ABUSE or OFF-TOPIC and hidden.

**Merge (May–June 2025).** The May 1 IRC meeting set direction toward uncap. Sanders filed PR #32406 the next day and had it locked to collaborators within seconds of announcement. A letter signed by 31 Core contributors reframed the existing 83-byte limit as "censorship" three days before merge. Gloria Zhao — who had rejoined Chaincode on March 31 — merged PR #32406 on June 9 over 21 Concept NACKs. That ratio is not an anomaly in the research corpus: roughly **52%** of identified PR conflicts still merge ([`findings/CONFLICT_RESOLUTION_ANALYSIS.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/CONFLICT_RESOLUTION_ANALYSIS.md)). Non-standard OP_RETURNs on chain jumped from roughly thirty in the four months before the public campaign to over thirteen thousand in May 2025 alone, showing the prior relay rule had real deterrence effect until the campaign announced its removal.

### Conflicted Advocacy on Blockspace Policy

The OP_RETURN fight exposed a recurring pattern, not a one-off. Figures with equity in base-layer data businesses publicly opposed consensus proposals that would restrict arbitrary embedding, while promoting capacity-expansion proposals such as dynamic block size schemes that would give those businesses more headroom. Testnet and early-mainnet rollup usage had already demonstrated that data-availability demand can consume a significant fraction of Bitcoin bandwidth before full adoption. Policy positions aligned with portfolio exposure without requiring explicit coordination. After a funded rollup reached mainnet, the same pattern continued: opposition to BIP-110 alongside advocacy for block capacity expansion. For the technical taxonomy of embedding channels and what consensus can close, see *[The Achievable Floor](/articles/the-achievable-floor/)*.

### The Dual Positioning of Brink's Founders

John Pfeffer seeded Brink at founding and invested in Alpen Labs, a competing ZK rollup building on Bitcoin. Wences Casares seeded Brink at founding, invested in Alpen Labs, and is now a founding donor to Localhost Research, which **has housed multiple** Bitcoin Core maintainers. These are people on both sides of the funding-to-grantee pipeline simultaneously, with commercial interests in protocol directions that the grantees they fund are positioned to influence. The conflict of interest is not alleged. It is structural and documented.

### Suppression and Exclusion

The suppression mechanism used in the OP_RETURN controversy had a documented origin. In May 2024, Chaincode CEO Adam Jonas authored Bitcoin Core's moderation guidelines — confirmed by IRC logs where maintainer Ava Chow told the weekly developer meeting: "ajonas wrote some moderation guidelines as a place for us to start thinking about this topic." In the same meeting, a contributor named pinheadmz revealed he had already tested the guidelines against comments from the datacarrier size policy debate using ChatGPT. Jonas published a governance framework in October 2024 codifying the principle that "those with 'skin in the game' should ultimately have the loudest voices," endorsing Signal groups as preferred coordination and dismissing public IRC as having "showed limited utility and were eventually abandoned."

[Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) finds that closed-unmerged PRs most often die from **non-engagement**, not explicit NACK: the plurality close with **no formal review**, and in a high-prep outsider sample roughly **45%** never received one ([`findings/REVIEW_ACCESS_OUTCOMES.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/REVIEW_ACCESS_OUTCOMES.md), [`findings/MAINTAINER_PREMIUM_REPORT.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/MAINTAINER_PREMIUM_REPORT.md)). Silence is a governance outcome.

Three independent contributors who raised concerns the network found inconvenient experienced the same sequence: dismissal, sidelining, and a decline from which none fully recovered.

Jon Atack was among the five most prolific Bitcoin Core contributors globally by commit count in 2020 and 2021, despite contributing without affiliation to Chaincode, Brink, or any network institution. On [BIS #195](https://www.bitcoininfinityshow.com/bitcoin-core-from-the-inside-jon-atack-bis-195/), he explained withdrawing from co-authorship credit while pursuing Square Crypto funding to keep a low-controversy profile. In a later return appearance on The Bitcoin Infinity Show (2026), he described self-censoring for seven years while grant renewal sat in the background, Spiral declining to renew after four years, and a maintainer and senior developer going to the OpenSats board about his funding without telling him. His Brink grant application in June 2021 was rejected by phone two days after he raised a substantive objection to a PR Newbery had co-authored — an objection later vindicated. His contributions fell from top-four globally to near-silence. He described the result as "permanent doghouse status" extending to contributors who appeared friendly to him.

Vasil Dimov proposed himself as P2P and Networking maintainer in August 2022. He had built Bitcoin Core's privacy networking infrastructure including BIP155, Tor v3, and I2P support. Broad concept ACKs followed; his PR sat open for five months without comment from fanquake or Gloria Zhao despite direct public requests by name. In January 2023, achow101 switched from Concept ACK to NACK after consulting unnamed contributors privately. A cascade of retractions followed. Zhao posted her first substantive comment — five months in — framing opposition as a Brink conflict-of-interest concern, while herself a Brink grantee. Dimov closed the PR himself. The area he proposed to maintain has had no dedicated maintainer since.

Luke Dashjr has been Bitcoin's longest-serving BIP editor since 2012. In April 2021, Brink founding board member David Harding posted a formal plan including a call for Dashjr's resignation; Newbery ACKed within hours despite the motivating dispute already being resolved. Harding stated he would "continue to bring it up in every appropriate venue for years, if need be." On the OP_RETURN PRs in 2024 and 2025, Dashjr was muted. When he named a conflict of interest in a GitHub discussion thread, the commenter who supported his disclosure request was banned.

Atack summarized the pattern at PlanB Forum in early 2026: maintainerships are "practically pre-decided" by existing maintainers, and contributors who question the process get "moved out of the project."

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

The consequence is paralysis and, when paralysis fails to protect institutional interests, directed action. When the governance structure cannot process improvements that threaten the interests of the institutions funding it, those improvements die in review. [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) documents the pattern in named dossiers: Erlay's full-protocol implementation set shows **0/7** matched PRs merged; Dandelion's Core implementation PR closed unmerged after roughly eleven months ([`findings/STALLED_PROPOSALS_REPORT.md`](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/STALLED_PROPOSALS_REPORT.md)). When the governance structure can be moved to serve those interests — as in the OP_RETURN uncap, commissioned without disclosure by a Chaincode engineer and merged by a Chaincode employee over 21 Concept NACKs — it moves in weeks. The same structure that stalled a qualified contributor's maintainer nomination for five months through undisclosed private consultations merged the OP_RETURN uncap in 38 days from mailing list post to merge. The 56% merge concentration is no longer an estimate. It is published by Brink in its own Engineering Impact Report. Stagnation on throughput, node cost, and payment-layer competitiveness created space centralized alternatives were happy to fill. Stablecoin transaction volume now exceeds Visa annually. Those are use cases Bitcoin should own. The governance structure left Bitcoin effectively unable to compete for them.

Implementation diversity is the structural fix, not a personnel change at Core. **Swapping one small maintainer cohort for another** without changing the monopoly implementation reproduces the same capture vector. The fix requires multiple independent implementations with proven consensus compatibility and different governance models, built from formal specifications that make the no-spec moat obsolete. That is not a small ask. It is exactly as hard as the governance problem predicts it would be.

---

## Further Reading

- hodlonaut, "CAPTURE Article 1: The Network," Citadel21, March 27, 2026. https://www.citadel21.com/the-network
- hodlonaut, "CAPTURE Article 2: The Lever," Citadel21, April 29, 2026. https://www.citadel21.com/the-lever
- hodlonaut, "CAPTURE Article 3: The Merge," Citadel21, June 15, 2026. https://www.citadel21.com/the-merge
- hodlonaut, X thread on Mike Schmidt's decentralization slide, July 21, 2026. https://x.com/hodlonaut/status/2079539699106943365
- Brink Engineering Impact Report 2025, March 26, 2026. https://brink.dev/blog/2026/03/26/engineering-impact-report-2025/
- Adam Jonas, "Evolution of Bitcoin Core Priority Projects," October 31, 2024. https://adamjonas.com/bitcoin-core-priority-projects
- Antoine Poinsot, "Relay policy drama," antoinep.com. https://antoinep.com/posts/relay_policy_drama/
- Renaud Cuny, "Three Years of Spam," Blockspace Weekly, December 2025. https://blockspaceweekly.substack.com/p/issue-3-three-years-of-spam
- CVE-2023-50428, National Vulnerability Database. https://nvd.nist.gov/vuln/detail/CVE-2023-50428

*This document reflects analysis grounded in 16 years of Bitcoin Core governance data, public funding disclosures, documented personnel history, and primary source materials including GitHub records, funding announcements, and the 2026 Epstein document release. Claims about specific individuals reflect documented institutional affiliations, not allegations of individual misconduct.*