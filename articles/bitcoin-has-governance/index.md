# Bitcoin Has Governance, and It Is an Informal Oligarchy

## The claim

People often say that nobody governs Bitcoin. It has no chief executive, no board and no foundation that sets its rules, so the usual conclusion is that it has no governance at all.

That conclusion is wrong. Bitcoin's software is maintained in a public repository, and a change reaches the network only if someone merges it. Today five people hold the keys that allow merging, and one of them has merged about half of all pull requests since 2022. They are added and removed by pull request after discussion at a developer meeting, and the written merge rule sets no minimum number of reviews. The people holding that power are identifiable, and their decisions shape what the software does. What is missing is a written rule for how they are chosen, checked or replaced.

This article treats Bitcoin as two layers of governance. The repository layer, where code is written and merged, is an informal oligarchy. The deployment layer, where node operators, miners and businesses decide which software to run, is an unwritten system in which several groups hold vetoes. The argument concentrates on the repository layer, because it is the one with feasible alternatives. Among the forms of governance that could apply there, informal oligarchy ties a single maintainer for the lowest score. Against its closest alternatives, a foundation and a formal oligarchy, its whole shortfall comes from two measures, legibility and credible commitment.

Three terms recur. Bitcoin Core is the reference software, and nearly every node runs either Core or an alternative built from its code. A pull request is a proposed code change, and a merge key is the cryptographic key that lets its holder merge changes into Core's main branch. A node is a computer that checks every block and transaction against the rules.

## Polybius and the modern instruments

Polybius was a second-century BCE Greek historian who set out to explain how Rome rose to power. In Book VI of his Histories he names three pure forms of government, kingship, aristocracy and democracy, and a corrupt twin for each, tyranny, oligarchy and mob rule. Each pure form decays into its twin in a cycle that begins with monarchy and ends in mob rule. Rome slowed the cycle, he argued, by mixing all three. Consuls, the senate and the people each checked the other two.

In his scheme oligarchy is one corruption among three, and the form he praises is the mixture. The question he asks is how power is checked, and this article asks it of Bitcoin.

Two thousand years of political science have added instruments for answering it.

- Robert Michels argued in 1911 that organizations drift toward oligarchy as they grow. The evidence is mixed. A study of 683 wikis supports him, a 1971 test on a state party found little, and Giovanni Sartori called it a bronze law rather than an iron one.
- Jo Freeman showed in 1970 that dropping formal structure leaves informal structure in place, and that the informal kind hides power from anyone who does not know the rules.
- George Tsebelis showed that the more veto players a system has, and the further apart they are, the more stable its policy is and the harder it is to change.
- Albert Hirschman gave exit and voice as the two ways participants discipline an institution.
- Elinor Ostrom found that long-lived shared resources follow common design principles, including clear boundaries, monitoring, graduated sanctions and cheap dispute resolution. Her cases were small and local, so applying her principles to global commons needs adaptation.

## How Bitcoin is governed

Bitcoin's rules are enforced by thousands of independent nodes, but the software those nodes run comes from somewhere. That gives two layers that need separate treatment.

The repository layer maintains the software. Core 32.1, released in October 2026, has 151,004 lines of implementation code and 154,273 lines of tests. The rules that decide whether a block or transaction is valid are 10,122 of those lines, 7% of the implementation. Anyone can submit changes, but only the five merge-key holders can merge them, and their gate covers the other 93% of the code as well as the rules. Nearly every alternative node program is built from Core's code, so decisions made here reach almost every node.

<figure class="chart-preserve">
<img src="charts/rules-stackpng?v=dark2" alt="The rules are 7% of the code, and five keys gate the other 93% too. Consensus rules, 10,122 lines, 7%. Applies and stores the rules, chooses what to relay, 20,366 lines, 13%. Wallet, interface, network, RPC and everything else, 120,516 lines, 80%. Gated by five merge keys. Bitcoin Core 32.1 implementation code, 151,004 lines. Excludes 154,273 lines of tests.">
</figure>

The deployment layer decides which release actually runs. Node operators choose what software to run, miners choose which upgrades to signal for, and businesses such as exchanges and wallet providers decide what to support. Each group can refuse a release.

<figure class="chart-preserve">
<img src="charts/two-layerspng?v=dark2" alt="Five keys propose and the deployment layer disposes. Repository layer, where code is written and merged. Contributors, anyone can submit, then five merge keys, gate every merge, then release, Core and its derivatives. Funding is concentrated. The repository offers a release. Deployment layer, where software is chosen and run, can refuse it. Node operators choose what to run. Miners, four pools mine over 70%. Businesses backed Segwit2x, cancelled. Switching software is cheap. Leaving the consensus rules means leaving the network.">
</figure>

Five merge keys decide what is offered, and nodes, miners and businesses decide what runs. Neither layer is a pure form of governance.

The chart estimates how strongly each layer leans on seven forms, from 0 to 5. Forms overlap, so the scores do not sum to a whole. Technocracy means authority earned through technical track record, rough consensus means open review and signaling, and market and exit means forks and competing software.

<figure class="chart-preserve">
<img src="charts/layer-leanpng?v=dark2" alt="The repository layer leans on informal oligarchy, and deployment leans on exit. Estimated lean from 0, none, to 5, heavy. Informal oligarchy, repository 5, deployment 2. Technocracy, repository 4, deployment 1. Rough consensus, both 3. Plutocracy and patronage, repository 2, deployment 3. Market and exit, repository 2, deployment 4. Written rules, repository 1, deployment 2. Single leader, repository 1, deployment 0.">
</figure>

The repository layer leans on informal oligarchy and technocracy. The deployment layer leans on exit, hashrate and rough consensus. The rest of the article concentrates on the repository layer.

## What the record shows

Nine episodes since 2013 show identifiable people and groups making binding decisions, with no written rule for how.

| Date | What happened | Why it matters |
| --- | --- | --- |
| Sept 2026 | Luke Dashjr, maintainer of an alternative node program built from Core's code, launched a breakaway fork that changed Bitcoin's mining algorithm to BLAKE2b. Miner signaling peaked at 2.53% against a 55% threshold, and no major exchange listed the new coin | Changing the consensus rules means leaving the network everyone else is on. The proposal drew almost no support, so the outcome shows rejection more than the price of leaving |
| Feb 2026 | Maintainer Gloria Zhao removed her merge key and stepped down. No reason was given | Key holders are added and removed by an ordinary pull request, and five remained |
| Jan 2026 | A developer known as sedited was nominated at the regular developer meeting and added as the sixth key holder | Selection runs through a meeting and a pull request, not a published procedure |
| Sept to Oct 2025 | Core version 30 raised the default limit on OP_RETURN, the field that lets a transaction carry arbitrary data. Opponents objected, and the share of reachable nodes running an alternative built from Core's code rose to 25.45% on September 14 | The maintainers settled a contested decision. Switching software over a policy difference was cheap, and about a quarter of reachable nodes did it, but the alternatives enforce the same consensus rules as Core and are built from its code |
| 2021 | Activation of the Taproot upgrade stalled over a technical dispute until a developer proposed a compromise, called Speedy Trial, in a chat room | One developer's proposal broke the deadlock |
| Sept 2018 | A bug in Core, present since version 0.14 in March 2017, was reported on September 17 and proved to let a miner inflate the coin supply. A fix shipped on September 18 after a handful of developers coordinated privately, and it was first described as a denial-of-service fix | The fix was fast, and the disclosure choices were made by a few people. Core's written security policy leaves critical bugs to an ad hoc procedure, and the bug sat in the only reference implementation for about a year and a half |
| Nov 2017 | Segwit2x, a plan backed by miners, exchanges and wallet providers to raise the block size limit, was cancelled after it failed to gain enough support | A coalition of miners and businesses could not force a change through |
| Apr to Aug 2017 | BIP148 proposed a user-activated soft fork to force activation of the SegWit upgrade. Core developers did not merge it because they saw no consensus for it | Users coordinated outside the repository |
| 2013 | A software upgrade accidentally split the network into two chains, and developers and miners coordinated a rollback | A crisis decision was made by coordination, with no formal authority |

The author's analysis of about 17,000 merged Bitcoin Core pull requests through October 2026 adds numbers. It uses GitHub's public record of each merged pull request, with its author, the person who merged it and every recorded review. A self-merge is a maintainer merging their own pull request, and a review is a recorded approval, comment or change request on GitHub.

<figure class="chart-preserve">
<img src="charts/merge-sharepng?v=dark2" alt="Since 2022 one key holder has merged half of all pull requests. Share of the 5,747 pull requests merged since 2022. Top merger 50.2%. Second 20.2%. Third 11.8%. Fourth 5.4%. Fifth 4.6%. All other mergers 7.8%. Top three 82.2%.">
</figure>

- Merging is more concentrated than the key count suggests. Since 2022 one current key holder has merged 50.2% of pull requests and three have merged 82.2%. Merge share is not decision share, since many merges are routine, but it shows where the gate is narrowest.
- The proposal layer is far more open than the code layer. The repository that records Bitcoin Improvement Proposals has 443 distinct mergers and a top-three share of 10.6%, against 23 mergers and 76.4% for Core over its history.
- Maintainers self-merged 25.5% of their merged pull requests, and 45.1% of those self-merges had no recorded review. No written rule sets a minimum number of reviews.
- Practice has improved. Self-merges with no recorded review fell from 83.9% in 2016 to 4.0% so far in 2026.
- Outsiders face a hard start. A contributor's first pull request was merged about 29% of the time over the project's history and about 16% since 2022. Established outsiders with five or more earlier merges are merged about two thirds of the time.
- No written rule says who receives merge keys. The contribution guidelines describe how a key holder judges consensus and say nothing about how keys are granted.
- The files that define the rules drew 169 commits from 31 people over the last three years, and five of them accounted for half. Writing the code is spread more widely than the power to merge it.

Review practice has tightened since 2016, while the self-merge rate stayed high until 2021. The self-merge rate is the share of merged pull requests merged by their own author.

<figure class="chart-preserve">
<img src="charts/self-merge-linepng?v=dark2" alt="Unreviewed self-merges fell from 83.9% to 4.0% between 2016 and 2026. Self-merges with no recorded review start at 83.9% in 2016, pass 30.3% in 2021, and end at 4.0% in partial 2026, shown dashed. Self-merge rate ends at 10.9% in partial 2026. Self-merge rate is the share of merged pull requests merged by their own author.">
</figure>

Funding is concentrated as well. A 1A1z report found that $8.4 million was spent on Bitcoin developers in 2023. Among the eight sponsors that rely only on donations, the top three receive 62.25% of their funding from a single source, Jack Dorsey.

## Measuring a form of governance

Six measures, each with a test someone else can run, score every form from 1 (worst) to 5 (best).

| Measure | What it asks | How to test it |
| --- | --- | --- |
| Capture resistance | How few actors can change the rules | The smallest number of actors whose assent changes the rules, and how concentrated merges are. The Nakamoto coefficient, proposed by Balaji Srinivasan in 2017, applies this idea and is taken as the minimum across subsystems |
| Exit cost | How cheaply participants can leave | The share of economic weight that followed a fork or split, following Hirschman's exit and voice |
| Legibility | Whether participants can see who decided what, under which rule | Two parts, following Freeman. Whether each decision has a named decider, and whether a written rule says who decides and how. Neither part scores 1, one part scores 2 or 3, and both score 4 or 5 |
| Error correction | How fast and cheaply a bad decision is reversed | Time from error to rollback, and who had to agree |
| Credible commitment | How hard it is for rulers to change the rules against participants | The number of veto players and the distance between them, following Tsebelis |
| Decision cost | How much time and effort a decision takes | Time from proposal to decision, and deadlocks, following Buchanan and Tullock's cost trade-off |

Prosperity and freedom are left out. They depend on separating cause from selection effects across countries, and Bitcoin is one case, so the scores cover process quality only.

## Forms that could govern the repository

Seven of nine forms of governance can apply to the repository layer. Real systems combine forms, so each form below is judged as a candidate for that layer alone.

| Form | Can it apply | Reason |
| --- | --- | --- |
| Direct democracy, one person one vote | No | Participants are pseudonymous and identities are free to create, so votes cannot be counted |
| Token-weighted voting | No | Bitcoin has no governance token, and studies of DAOs that vote this way find power concentrated, with half of those studied controllable by three or fewer delegates |
| Single maintainer | Yes, at a legitimacy cost | The software allows it, but Satoshi Nakamoto's exit was central to the story that Bitcoin has no ruler |
| Foundation or corporate steward | Yes, with legal exposure | A legal entity is a single target for lawsuits, regulators and lobbying. Individual Core developers were sued in the Tulip Trading case, and an entity would concentrate that exposure |
| Informal oligarchy | Yes, and it is the current form | Five key holders, chosen by pull request and meeting |
| Formal oligarchy | Yes | A committee with published rules for selection, review and removal |
| Elected council | Yes, with limits | Python elected a five-member steering council in 2019, but Bitcoin has no agreed electorate |
| Mixed constitution with written vetoes | Yes | Separate powers for proposers, reviewers and deployers, with written thresholds. Bitcoin Commons, an alternative Bitcoin implementation, uses a five-tier version with signature thresholds |
| Commons governed by Ostrom's principles | Yes, conditional | Needs bounded membership and monitoring, and her cases were small and local |

The two excluded forms need a counted electorate. Every form that survives needs only an accountable group and a written rule, which the repository layer largely lacks.

## Scores

Informal oligarchy ties a single maintainer for the lowest score, 15 of 30. On the other four measures combined, informal oligarchy, the foundation, the formal oligarchy and the single maintainer all score 11, so against the two plural forms its whole shortfall is legibility and credible commitment.

<figure class="chart-preserve">
<img src="charts/radar-formspng?v=dark2" alt="Informal oligarchy ties for last, and its gap is legibility and commitment. Six measures per form, 1 worst to 5 best. Ostrom commons 22 of 30, low confidence. Mixed constitution 21 of 30, low confidence. Foundation steward 19 of 30, low confidence. Elected council 19 of 30, medium confidence. Formal oligarchy 18 of 30, low confidence. Deployment layer today 16 of 30, low confidence. Single maintainer 15 of 30, low confidence. Informal oligarchy, current, 15 of 30, medium confidence. Dashed outline is informal oligarchy, for reference.">
</figure>

Higher is better, and for exit cost and decision cost higher means cheaper. The scores are judgments, and each panel notes how much evidence stands behind it.

The chart isolates the comparison that matters, informal oligarchy against formal oligarchy.

<figure class="chart-preserve">
<img src="charts/formal-gappng?v=dark2" alt="Informal oligarchy trails formal oligarchy only on legibility and commitment. Legibility, informal oligarchy 2, formal oligarchy 4. Credible commitment, informal oligarchy 2, formal oligarchy 3. Capture resistance, both 2. Exit cost, error correction, and decision cost, both 3. Score from 1 worst to 5 best. Higher is better, and for exit cost and decision cost higher means cheaper.">
</figure>

- Exit cost is 3 for every repository form. Switching software over a policy difference is cheap, as the move to alternatives during the version 30 dispute showed. Leaving the consensus rules means leaving the network, and that costs the same whoever maintains the repository. The failed BLAKE2b fork and Segwit2x show weak demand for those changes more than a high price for leaving. The one repository-level lever is a written, independent specification of the rules, which is a design choice separate from the form of governance.
- Informal oligarchy scores 2 on legibility. Each merge is recorded with a name, but no written rule sets a minimum number of reviews or says how merge keys are granted, selection runs through a pull request and a meeting, Core's written security policy leaves critical bugs to an ad hoc procedure, and 45.1% of maintainers' self-merges had no recorded review. Who judged consensus, who objected and who coordinated in private is not recorded. A single maintainer scores 3, because every decision has one obvious author even with no written rule.
- It scores 2 on capture resistance because five keys gate the repository, one key holder has merged half of all pull requests since 2022, and funding is concentrated.
- It scores 3 on error correction because the 2013 rollback worked and a planned deprecation of the option that lets node operators cap OP_RETURN size was reversed on September 30, 2025, after protest. It does not score higher because the 2018 inflation bug sat in the code for about a year and a half and was first described as a denial-of-service fix, and because people affected by a decision have no formal route to challenge it.
- Decision cost also scores 3. The median merged pull request took 3.9 days for maintainers and 6.4 days for everyone else. Speed is the advantage informality usually claims, and here it only ties a formal oligarchy.

**How far to trust the scores.** Every score is a judgment. Only informal oligarchy and the elected council have evidence behind them from Bitcoin or a comparable project. The two highest totals belong to forms untested at Bitcoin's scale, so the order at the top means little, and nothing in the conclusion depends on it. Legibility and credible commitment reward written rules by definition, so any written form beats an unwritten one on those two measures, and the score gap partly restates that. The case that the missing rules matter rests on the record. Keys are granted with no written procedure, merges need no minimum review, and critical bugs go to an ad hoc process. A reader who treats legal exposure as a capture risk would score the foundation's capture resistance at 1, which brings its total to 18, still above informal oligarchy.

## Objections

Four objections test the thesis, and it survives in a narrower form.

| Objection | Strongest form | What survives |
| --- | --- | --- |
| Maintainers only propose | Users and miners decide what runs. In the block size war of 2015 to 2017, companies, miners and prominent developers could not override node operators | The agenda setter still controls the menu. Operators can refuse a release, as about a quarter of reachable nodes did over version 30, but the alternatives they moved to are built from Core's code, so the claim stays scoped to the repository layer |
| Informality shields against legal capture | A legal entity can be sued or compelled. In Tulip Trading the English Court of Appeal ruled in 2023 that it was arguable Bitcoin developers owe fiduciary duties to coin owners, a position Angela Walch had argued in 2019 | Individual developers were sued anyway. This argues for written rules that need no legal entity, such as published signing thresholds, and the foundation's score already prices that exposure |
| Michels' iron law is contested | The evidence that oligarchy is inevitable is mixed | The thesis rests on Bitcoin's own record and does not need inevitability |
| Review practice has improved | Self-merges with no recorded review fell to 4.0% so far in 2026 | The improvement is a norm and no rule requires it. The self-merge rate was 30.3% in 2021 and 10.9% so far in 2026, so it has moved once and can move back |

The surviving claim is narrower than the worst form of governance. At the repository layer, informal oligarchy has the lowest legibility of any form, no written commitment device, and a total tied for last with a single maintainer. That is enough to show that Bitcoin has governance and that its form hides it.

## Conclusion

Bitcoin has governance, and the repository layer is run by an informal oligarchy of five key holders. Its weakness is that the rules are unwritten, which makes power hard to see and hard to hold to account. Capture resistance and exit cost are not where it loses ground. In Polybius's terms the five key holders are an aristocracy with nothing written to keep it from becoming his oligarchy, and the deployment layer is a popular check that can only say no. Rome slowed the cycle by making each power answer to the others, and the repository has no such check written down.

Three written rules would close most of the gap. They are a published procedure for adding and removing key holders, a minimum review requirement for merges, and an independent specification of the consensus rules that other implementations can be checked against. On the scores above, the first two rules raise legibility to 4 and credible commitment to 3, which lifts informal oligarchy to 18, level with a formal oligarchy. None of the three needs a legal entity, a vote or a change of form, and all three fit the current maintainers as they are.

The deployment layer has no formal alternative to compare. Its one tool is refusal. Switching software is cheap, but every alternative it can switch to is built from Core's code, and that calls for separate design work.

## Sources

Sources by topic.

Theory and comparators

- Polybius and the mixed constitution, [The Collector](https://www.thecollector.com/polybius-ancient-historian-rome/) and [Thornton](https://montesquieu.unibo.it/article/view/5144)
- [Michels and oligarchy](https://www.encyclopedia.com/topic/iron_law_of_oligarchy.aspx), [Shaw and Hill on 683 wikis](https://arxiv.org/pdf/1407.0323), [Pahl 1971](https://digitalcommons.morris.umn.edu/jmas/vol37/iss2/18) and [Sartori](https://pressbooks.pub/cisi/?p=62)
- [Freeman, The Tyranny of Structurelessness notes](https://ferd.ca/notes/paper-the-tyranny-of-structurelessness.html)
- [Veto players, Tsebelis overview](https://core-prod.cambridgecore.org/core/books/formal-models-of-domestic-politics/veto-players/FAD5549C08C6188A9CE6B71E6DB5D60D)
- [Exit and voice in open source, Viseur and Charleux](https://esploro.umontpellier.fr/esploro/outputs/conferenceProceeding/Open-Source-Communities-and-Forks-A/99148160209311)
- [Ostrom, design principles overview](https://www.ecologyandsociety.org/vol15/iss4/art38/) and [Rozas et al. on global commons](https://www.frontiersin.org/article/10.3389/fbloc.2021.577680)
- [Nakamoto coefficient, Spark glossary](https://www.spark.money/glossary/decentralization)
- [DAO voting concentration, empirical study](https://arxiv.org/pdf/2302.12125)
- Developers as fiduciaries, [Walch](https://commons.stmarytx.edu/facarticles/613), [Tulip Trading v van der Laan, EWCA Civ 83 (2023)](https://caselaw.nationalarchives.gov.uk/ewca/civ/2023/83) and [Tulip Trading analysis](https://thebarristergroup.co.uk/blog/the-tulip-trading-case-and-the-future-of-liability-in-web3-and-blockchain-networks)
- [Python steering council, LWN](https://lwn.net/Articles/777997/rss)

Bitcoin episodes

- [Zhao leaves, crypto.news](https://crypto.news/bitcoin-core-maintainers-face-shake-up-as-gloria-zhao-revokes-pgp-key/). [sedited added, btcpp insider](https://insider.btcpp.dev/p/bitcoin-core-adds-new-maintainer)
- [BLAKE2b fork, BeInCrypto](https://beincrypto.com/bitcoin-hard-fork-failed-adam-back/) and [CryptoRank](https://cryptorank.io/news/feed/75b12-bitcoin-hard-fork-dashjr-fake-bitcoins)
- [Core v30, Cointelegraph](https://cointelegraph.com/magazine/bitcoin-upgrade-core-developers). [OP_RETURN deprecation reversed, pull request 33453](https://github.com/bitcoin/bitcoin/pull/33453) and [Protos](https://protos.com/bitcoin-core-drops-op_return-deprecation-hours-before-v30-release). [Alternative node share, Bitcoin.com](https://news.bitcoin.com/nl/bitcoin-knots-versterkt-greep-vangt-meer-dan-een-kwart-van-netwerk-nodes/)
- [Taproot activation, Speedy Trial glossary](https://www.learnbitcoin.com/glossary/speedy-trial)
- [Segwit2x, Fortune](https://fortune.com/crypto/2017/11/12/bitcoin-upheavel-segwit2x-fork). [BIP148, BIP text](https://github.com/bitcoin/bips/blob/master/bip-0148.mediawiki)
- [2013 fork and governance overview, Oxford Business Law Blog](https://blogs.law.ox.ac.uk/business-law-blog/blog/2021/12/coming-battle-over-bitcoin-governance)
- [Funding, 1A1z, Funding Bitcoin](http://1a1z.com/fund.html) and [No Bullshit Bitcoin coverage](https://nobsbitcoin.com/bitcoin-core-development-funded-with-8-4m-in-2023-report)
- [Mining pool concentration, GN Crypto, June 2026 snapshot](https://www.gncrypto.news/news/four-pools-control-over-70-percent-bitcoin-hashrate/)
- Line counts for Core 32.1, [The Rules Are 7% of the Program](/articles/the-rules-are-7-percent)

Dataset. The merge, review and outsider figures come from the author's [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) analysis of Core's pull request history, built from GitHub's public record of 16,811 merged pull requests. A self-merge is a merge by the pull request's author, and a review is any recorded approval, comment or change request. The Bitcoin Commons design comes from its governance documents.
