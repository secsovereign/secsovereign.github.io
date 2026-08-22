# The Adversarial Default

## A Defense of Toxic Maximalism

## Contents

- [I. What Being Collaborative Actually Produced](#i-what-being-collaborative-actually-produced)
- [II. What a Softened Culture Costs on the Outside](#ii-what-a-softened-culture-costs-on-the-outside)
- [III. Why Bitcoin Needs This Tone](#iii-why-bitcoin-needs-this-tone)
- [IV. Two Things Called Toxic](#iv-two-things-called-toxic)
- [V. The Fight Is Not Over](#v-the-fight-is-not-over)
- [Sources](#sources)

---

The complaint arrives on schedule. Bitcoin culture is toxic. The maximalists drive away talent. Be nicer. Extend good faith. Grow up.

This article defends the hostile stance, not every insult and not every pile-on. Some of that is noise. **The hostility is mostly correct.** It matches the threat. People asking Bitcoin to soften have not faced what the hostility is defending against.

---

## I. What Being Collaborative Actually Produced

Constructive optimism was already tried. Years of good-faith work inside the process came before the blocksize war and before the OP_RETURN fight. In both cases, people working inside the process lost without ever losing the argument.

The blocksize war did not start because maximalists woke up one morning and decided to be difficult. It followed years of engagement with a process that could be captured, and was. Developers who raised concerns about one dominant codebase, who pays the developers, and who gets to approve code changes were not rewarded for honesty. They were pushed to the margins. Their proposed changes were closed. Their concerns were reframed as attacks on the project.

Taproot sailed through on broad agreement. The fight was mostly about how to turn it on, not whether the rules themselves were a good idea. Soft review treated that as a win. Hard review of what the new surfaces could become was thin.

Taproot removed the old 10,000-byte script ceiling. Together with SegWit's existing witness discount, that made large arbitrary data payloads practical, without real accounting for the cost that would land on every validating node. The Taproot envelope (an `OP_FALSE OP_IF` branch that never runs) was meant as an upgrade hook, not a file store. Ordinals and inscriptions used it anyway. JPEGs and token junk went into the chain. Non-money data is now an estimated 12 to 19 percent of total chain storage. Spam blockspace ran roughly 17 times its pre-inscription baseline. About 29.6 percent of UTXOs are inscription-related while holding only around 415 bitcoin. Every validating node pays for that forever.

The OP_RETURN fight in 2025 ran after that abuse was already real. Ready proposals to close dedicated ways of stuffing non-money data into blocks stalled. Core v30 removed the limit on how much `OP_RETURN` data nodes would forward. The stronger technical case did not win. A small set of funded people with power over Bitcoin Core treated doing nothing on those protections as the default, and treated social pressure as a stand-in for technical debate.

That is the record the hostility is responding to.

---

## II. What a Softened Culture Costs on the Outside

Bitcoin maximalists call scams early and loudly, in exactly the tone critics say Bitcoin needs to drop. In most cases they are right. Ordinary investors who heard those warnings had often been trained to discount the people making them.

[MIT Sloan](https://mitsloan.mit.edu/cfi/anatomy-a-run-terra-luna-crash) estimates the Terra ecosystem collapsed in three days in May 2022 and wiped out about $50 billion in value. Reporting at the time put the Terra/Luna wipe near $45 billion overnight. FTX took customer deposits trusted to an exchange whose founder [Fortune had put on its cover](https://fortune.com/2022/08/01/ftx-crypto-sam-bankman-fried-interview/) as a possible "next Warren Buffett," then went bankrupt in November 2022. The [SEC](https://www.sec.gov/news/press-release/2022-219) later charged that customer funds had been diverted to Alameda without disclosure. Celsius, Voyager, and BlockFi followed the same pattern at smaller scales. The [Chicago Fed](https://www.chicagofed.org/publications/chicago-fed-letter/2023/479) documents withdrawal freezes and bankruptcies across those platforms, with hundreds of thousands of customers owed in each filing.

**The hard stance is a warning system.** When it is loud and consistent, it is harder to run a project that borrows Bitcoin's credibility. When it softens, the warning gets weaker, and ordinary investors pay. Destroyed savings and retirement funds are not abstract. After Terra, reporting documented people describing total loss and mental-health crisis, including thoughts of suicide on public forums ([Time](https://time.com/6177567/terra-ust-crash-crypto/); [Al Jazeera](https://www.aljazeera.com/economy/2022/5/20/after-terra-crash-investors-and-regulators-count-cost-of-crypto)). Those costs fall on people who never asked for a friendlier culture. The same pattern shows up when famous names replace checking the work: reputation becomes cover.

---

## III. Why Bitcoin Needs This Tone

Bitcoin is hard to undo at scale. By the time bugs surface, the damage is often already done.

Bitcoin Core 30.0 and 30.1 had a wallet migration bug that, under specific conditions, could delete all files in the wallet directory when migration of an unnamed legacy `wallet.dat` failed, with no recovery if backups did not exist. Bitcoin Core's own [advisory](https://bitcoincore.org/en/2026/01/05/wallet-migration-bug/) states the risk of fund loss and pulled the affected downloads. The dangerous `fs::remove_all` pattern had been introduced years earlier. In 2024, Core maintainer ryanofsky named the exact risk in code review and recommended a follow-up fix. No follow-up was created. A later change removed an earlier accidental stop that had been blocking the dangerous path. Users lost wallets. The fix landed in [PR #34156](https://github.com/bitcoin/bitcoin/pull/34156) after the bug was reported ([issue #34128](https://github.com/bitcoin/bitcoin/issues/34128)).

CVE-2018-17144 makes the same point for the money rules themselves. An inflation bug that could have created Bitcoin out of thin air sat in the live software for roughly eighteen months before disclosure. Bitcoin Core's [September 20, 2018 notice](https://bitcoincore.org/en/2018/09/20/notice/) documents it. Neither bug was a clever attack. The wallet risk was named a year early and still shipped. The inflation bug sat unused. No mined block used the hole, so a second node program checking the same chain would have agreed with Core. Finding it took someone reading the code, not two clients disagreeing on live blocks. Other clients existed on paper. A fork of Core inherits Core's bugs. Genuinely separate clients hold almost no node share, so neither functions as a real check. Almost everyone ran Core.

Being wrong in Bitcoin costs more than being wrong in most other engineering work. Harsh public pressure on proposed changes, including upgrades that look uncontested, is a rational response. The other option is a nicer culture that is also a more dangerous one.

---

## IV. Two Things Called Toxic

Two different things get called toxic maximalism. Only one of them is a problem Bitcoin should try to fix with manners.

Pointing at frauds that trade on Bitcoin's credibility is a permanent job. There is no other defense against a scam whose main asset is proximity to Bitcoin. That part is not going away, and it should not.

The fighting inside Bitcoin is the part that can shrink. A large share of it exists only because the tools that would end an argument do not.

Bitcoin Core has never produced a clear mathematical write-up of the rules every node must enforce. Fifteen years of capable, well-funded developers on software that secures trillions of dollars, and still no formal specification. There is nothing solid to test an implementation against, and nothing to appeal to when people disagree about what the protocol permits. So fights about what Bitcoin is stay in arguments and reputation instead of settling in code.

Everything also ships as one package. There is no clean way to accept part of a release and reject another part without forking the whole program. That is why a disagreement about any single change becomes a fight about the entire project. The wallet is bundled into the node for the same reason a policy dispute becomes a governance crisis. Separating wallet from node has been recognized as an improvement for over a decade and still sits undone.

Write the specification and split the wallet from the node, and what remains is disagreement about tradeoffs and threat models. That is what people should be fighting about. Ask for civility without building either, and you are asking people to stop paying attention.

---

## V. The Fight Is Not Over

People asking Bitcoin to soften are implying the threat has passed: that governance is mature enough now, and that the hostility is leftover from an earlier, riskier period Bitcoin has outgrown.

None of that is true.

Almost everyone still runs one line of software. Roughly 99% of economic nodes run Bitcoin Core or a program forked from Core, such as Knots. Knots showed that operators will switch over what transactions a node forwards. It is still a Core fork, not a separately written program that decides the money rules on its own. No separately written Bitcoin software, proven to follow the same money rules, has enough of the network running it to matter.

Who pays for Core development is still concentrated. A small number of grant organizations, with documented ties to companies and funds that care about protocol outcomes, still pay most Bitcoin Core development. Who merges code is still concentrated too. Brink's [Engineering Impact Report 2025](https://brink.dev/blog/2026/03/26/engineering-impact-report-2025/) shows one person at one organization merged 56% of all changes to Bitcoin Core in 2025. [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) shows the same shape in the 2022+ window: about half of merges from the top account, about 83% from the top three. The right to merge into Bitcoin Core is still a small fixed set, currently five people on [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin). A subpoena, a regulatory order, or a quiet conversation with that set can still move a protocol change the rest of the network can do little about.

None of the conditions that made the hard culture appropriate have gone away. The trauma that produced it was real. The threat is ongoing. There is still no formal specification. There is still no separately written second Bitcoin client with meaningful node share. Forks of Core that only change what they forward do not close that gap.

**The hard stance is Bitcoin's immune system.** It matches a threat that has not gone away. Asking for civility without the specification and without splitting the wallet from the node is asking the patient to drop the fever before the infection clears. The fever is doing work. Leave it alone until the structure changes. Then we can talk.

---

*Related: [Who Controls Bitcoin](/articles/bitcoin-governance), [The Social Layer Is the Attack Surface](/articles/bitcoin-social-capture), [Why Bitcoin Needs a Specification](/articles/why-bitcoin-needs-a-specification).*

---

## Sources

- [Liu, Makarov, and Schoar, "Anatomy of a Run: The Terra Luna Crash," MIT Sloan CFI](https://mitsloan.mit.edu/cfi/anatomy-a-run-terra-luna-crash). Terra ecosystem collapse in three days, ~$50B valuation wiped
- [Al Jazeera, "After Terra, Luna crashes, regulators count cost of crypto"](https://www.aljazeera.com/economy/2022/5/20/after-terra-crash-investors-and-regulators-count-cost-of-crypto), May 20, 2022. ~$45B Terra/Luna erase; retail savings wiped
- [Time, "What Terra's Crash Means For Crypto and Beyond"](https://time.com/6177567/terra-ust-crash-crypto/), May 2022. Retail losses; public forum reports of suicidal ideation after the crash
- [Fortune, "30-year-old billionaire Sam Bankman-Fried… next Warren Buffett"](https://fortune.com/2022/08/01/ftx-crypto-sam-bankman-fried-interview/), August 1, 2022. Pre-collapse magazine celebration
- [SEC press release 2022-219](https://www.sec.gov/news/press-release/2022-219), December 13, 2022. Charges that FTX customer funds were diverted to Alameda
- [Chicago Fed Letter No. 479, "A Retrospective on the Crypto Runs of 2022"](https://www.chicagofed.org/publications/chicago-fed-letter/2023/479). Celsius, Voyager, BlockFi, FTX withdrawal pauses, bankruptcies, customer counts
- [Bitcoin Core, "Wallet Migration Failure May Delete Unrelated Wallet Files"](https://bitcoincore.org/en/2026/01/05/wallet-migration-bug/), January 5, 2026. Official advisory for Core 30.0 / 30.1
- [bitcoin/bitcoin#34128](https://github.com/bitcoin/bitcoin/issues/34128). Wallet migration deletion bug report
- [bitcoin/bitcoin#34156](https://github.com/bitcoin/bitcoin/pull/34156). Fix removing `fs::remove_all` cleanup
- [Bitcoin Core notice, CVE-2018-17144](https://bitcoincore.org/en/2018/09/20/notice/), September 20, 2018. Inflation bug disclosure
- [Brink Engineering Impact Report 2025](https://brink.dev/blog/2026/03/26/engineering-impact-report-2025/), March 26, 2026. 56% merge concentration
- [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research). Merge concentration, stalled proposals, conflict-resolution findings
