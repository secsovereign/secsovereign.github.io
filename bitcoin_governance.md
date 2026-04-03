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

This document presents the structural argument in full, supported by the adversarial funding and personnel evidence. It is intended as an analytical reference for reasoning about Bitcoin governance accurately.

---

## II. The Governance Reality

### The Implementation Monopoly

When the same upstream lineage supplies almost all economically relevant consensus nodes, the distinction between Bitcoin the network and “whatever Bitcoin Core’s maintainers ship” becomes practically meaningless. The network enforces what that lineage releases. The consensus rules are what that software encodes. This is not a theoretical concern. CVE-2018-17144, an inflation bug that could have allowed Bitcoin to be created out of thin air, sat in production in Bitcoin Core for eighteen months. A second independent implementation running differential tests against the same blocks would have caught it immediately. The bug was in Core. Core's monopoly is what made it dangerous.

A common objection points to miners: they may run any consensus-compatible software and need not adopt every release. That permission is real; the practiced behavior is not a distributed audit. Industrial mining largely follows operational defaults: pool infrastructure, hosting providers, and routine upgrades to stay compatible with peers and with the dominant client, rather than a deliberate, release-by-release review of consensus changes by the majority of hash rate. A veto almost no one pays the cost to exercise is not the same as decentralized control over what merges.

Bitcoin has never had a formal mathematical specification of its consensus rules. Producing one inside Core's process has been attempted for years without meaningful progress toward an adopted specification. Without a specification, every alternative implementation must reverse-engineer undocumented behavior from Core itself, which means staying architecturally dependent on Core by definition. That is not an accident. Unspecified behavior creates a structural barrier to competition that cannot be resolved without an independent mathematical specification. The absence of a spec is the mechanism that makes the implementation monopoly self-perpetuating.

### The Merge Authority Structure

Sixteen years of Bitcoin Core governance data in [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) document a **PR-weighted contribution Gini coefficient of ~0.851** (and similarly extreme concentration in reviews), with the **top three merger roles accounting for roughly 80%+ of historical merges** in the full-history rollup (`findings/EXECUTIVE_SUMMARY.md`, `GINI_COEFFICIENT_EXPLANATION.md`). **Merge and commit permissions on [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin) are authoritative;** the live roster is currently **five** merge holders (Gloria Zhao no longer holds that role). The structural point is unchanged: **a small, fixed-capacity set** of people can land code in the reference implementation, and **their institutional ties overlap the funding map**, including Chaincode employment, Brink grants, Spiral (Block’s Bitcoin arm), Localhost-style hosts, and similar channels. These are not anonymous volunteers in the aggregate; they are employees and grantees of a **small, identifiable** set of institutions, and those institutions have financial entanglements with commercial operations that benefit from specific protocol directions.

The informal merge authority structure means there is no formal process, no published criteria, and no accountability mechanism for what gets merged and what does not. Core developers disclaim ownership and authority over Bitcoin while exercising exactly that authority through PR closure and moderation. When critics name conflicts of interest on GitHub, they get moderated off. In the 2025 OP_RETURN controversy, someone flagged a conflict of interest in the discussion thread and was banned. That is not the behavior of a commons with no governance. That is governance defending itself.

### What the Quantitative Record Shows

The same research finds extreme merge concentration (Gini on PR-weighted activity ~0.851), high contributor churn (many participants with minimal sustained engagement), near-total voting-bloc cohesion among top reviewers in the dataset, and a pattern of governance paralysis on major protocol improvements that would have reduced dependence on the current institutional infrastructure.

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

### OpenSats and the Dorsey Concentration Problem

OpenSats operates with a nine-person volunteer board and presents itself as a decentralized funding vehicle. In 2024 it received $23.6 million in donations, of which $21 million, roughly 90%, came from Jack Dorsey's StartSmall initiative alone. Dorsey's footprint across Bitcoin's governance infrastructure is wider than any other single actor. He is the dominant funder of OpenSats, a major donor to Brink, and the founder of Spiral, which **directly employs at least one Bitcoin Core maintainer with merge access**. He has also donated tens of millions to the Human Rights Foundation's Bitcoin Development Fund and Btrust. That means Dorsey's money touches a sitting maintainer directly through Spiral, the primary developer grant organization at 90% of its funding, and multiple secondary grant channels simultaneously. A single donor with that reach across the governance infrastructure represents a structural concentration of influence that has no parallel in Bitcoin's development history.

### Localhost Research

Launched in late 2024 with founding donors Mark Casey and Wences Casares and board members Matt Corallo and Denise Terry. The founding team is Mark Erhardt and Ava Chow. **Chow has held Bitcoin Core merge access while housed there.** Casares, as noted above, also seeded Brink and invested in Alpen Labs. Matt Corallo previously worked at Blockstream before moving to Chaincode. Localhost is a **new node** in the network: it **hosts** Core maintainers and is funded by investors with **active** financial interests in protocol-adjacent commercial ventures.

---

## IV. The Personnel Revolving Door

The pattern is not incidental. The people who fund Bitcoin Core development circulate through the same small set of institutions. Blockstream founders become Chaincode employees. Chaincode alumni found Brink. Brink's co-founder came from Blockstream. Brink's operations director came from Chaincode. **Current** merge holders map onto that same map (**Chaincode payroll, Localhost-style hosting, Spiral, Brink-funded paths**) in combinations that shift over time but **do not** dissolve the concentration. The governance research underlying these findings is published in [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research). The people deciding what ships in Bitcoin Core are employees and grantees of institutions whose founders and funders have direct financial interests in specific protocol directions.

This network is not assembled by explicit coordination. It is assembled by the normal operation of financial incentives, social trust, and institutional gravity. People fund what they understand. They hire from networks they trust. They develop intellectual frameworks that align with the interests of the institutions they work for. No individual needs to be corrupt for the system to produce captured outcomes. The mechanism is structural, not conspiratorial.

> Power without a name is the most dangerous kind. "Bitcoin isn't governable" is the claim that protects the people who already govern it from being held accountable. It is capture that learned to call itself freedom.

---

## V. The Adversarial Layer: When Conflicts Become Visible

### The OP_RETURN Controversy (2025)

In spring 2025, Antoine Poinsot of Chaincode Labs asked Peter Todd to open pull request 32359, which would remove Bitcoin Core's 83-byte OP_RETURN limit. Todd confirmed publicly that he was asked by an active Core developer because entities like Citrea were using unprunable outputs instead of OP_RETURN due to size limits. Citrea is a ZK rollup that posts data to Bitcoin's base layer. Jameson Lopp, CTO of Casa, was among the most vocal advocates for the change. Community members raised the fact that Lopp is an investor in Citrea's Series A round, which was led by Peter Thiel's Founders Fund with Balaji Srinivasan also participating. When someone flagged the conflict of interest in the GitHub discussion thread, they were banned.

Balaji Srinivasan had previously donated $500,000 to Chaincode Labs after losing a high-profile Bitcoin bet in 2023. The thread runs: Balaji donates to Chaincode, Balaji invests in Citrea alongside Lopp, Citrea's on-chain behavior creates operational friction with the existing OP_RETURN limit, a Chaincode developer solicits a PR that would resolve that friction in Citrea's favor, the PR is introduced without disclosure of its corporate origin, community members who name the conflict get banned. Every node in the control network fired in the same direction at the same time, in service of a policy change that benefited VC-backed commercial operations with financial ties to the funders of those developers. Bitcoin Core v30 ultimately did remove the OP_RETURN cap.

### The Lopp/Citrea/BIP-110 Pattern

Citrea launched its mainnet on January 28, 2026. On testnet, its data-availability usage reached almost 10% of Bitcoin's monthly bandwidth at one point, before full mainnet adoption. One month after Citrea's mainnet launched, Lopp published a piece arguing that BIP-110, the only active proposal that would restrict arbitrary data embedding in Bitcoin transactions, is "reckless and doomed to fail." He is also the author of the Goldiblocks dynamic block size proposal, which would expand Bitcoin's block capacity based on fee levels. Lopp holds equity in a company that by design places significant, ongoing data load on Bitcoin's base layer. He is on public record opposing the proposal that would restrict that behavior and promoting the proposal that would give it more headroom. Every public policy position aligns with his investment portfolio.

### The Dual Positioning of Brink's Founders

John Pfeffer seeded Brink at founding and invested in Alpen Labs, a competing ZK rollup building on Bitcoin. Wences Casares seeded Brink at founding, invested in Alpen Labs, and is now a founding donor to Localhost Research, which **has housed multiple** Bitcoin Core maintainers. These are people on both sides of the funding-to-grantee pipeline simultaneously, with commercial interests in protocol directions that the grantees they fund are positioned to influence. The conflict of interest is not alleged. It is structural and documented.

---

## VI. The No-Spec Moat and Why It Matters

The most important structural element of the implementation monopoly is the one least discussed. Bitcoin Core has never produced a formal mathematical specification of its consensus rules. This is not an oversight. It is the mechanism that makes the monopoly permanent. Without a specification, any alternative implementation must reverse-engineer undocumented behavior from Core itself. This means every alternative is architecturally dependent on Core by definition. Independent implementations are risky because a single validation bug can cause a chain split. So in practice, alternatives stay close to Core's codebase. Serious non-Core consensus implementations remain a **negligible fraction of deployed nodes** in public crawls, not enough to constitute real implementation competition, while everyone still validates against Core-shaped behavior without an independent spec. The market did not freely choose Core-derived code. It converged on the only option safe enough to run without a specification to validate against.

The "you can just fork it" response to governance critique is a non-answer in this context. A Core fork inherits the same monolithic architecture, the same 300,000 lines of technical debt, the same undocumented consensus behavior, and the same governance capture vectors. New maintainers on the same throne are not a structural fix. The fix is multiple independent implementations with proven consensus compatibility and genuinely different governance structures. That requires a formal specification as the independent standard against which consensus compatibility can be proven. The absence of that specification, over fifteen years, is the structural condition that makes everything else in this document stable.

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