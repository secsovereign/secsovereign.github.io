# Bitcoin Core: The Biggest Fallacies

## Inspired by [Jude Nelson's 2014 analysis of systemd](http://judecnelson.blogspot.com/2014/09/systemd-biggest-fallacies.html)

## Contents

- [Fallacy 1: Contributor count](#fallacy-1-bitcoin-core-has-hundreds-of-contributors-therefore-it-is-not-controlled-by-a-small-group)
- [Fallacy 2: Adoption proves merit](#fallacy-2-widespread-adoption-proves-technical-merit)
- [Fallacy 3: Critics dislike change](#fallacy-3-critics-of-bitcoin-core-just-dont-like-change)
- [Fallacy 4: Not monolithic](#fallacy-4-bitcoin-core-is-not-monolithic)
- [Fallacy 5: Rough consensus](#fallacy-5-rough-consensus-governs-bitcoin-core-decisions)
- [Fallacy 6: Technical merits alone](#fallacy-6-you-should-judge-bitcoin-core-on-technical-merits-alone)
- [Fallacy 7: Conservative by design](#fallacy-7-bitcoin-core-is-conservative-by-design-and-thats-a-feature)
- [Fallacy 8: Reviewer resources](#fallacy-8-spreading-reviewer-resources-across-multiple-implementations-weakens-bitcoin)
- [Conclusion](#conclusion)

---

There is a set of arguments that appears repeatedly in defense of Bitcoin Core's implementation monopoly. This post is meant to serve as a repository of those arguments and to explain why they are logically invalid. I will direct people here when they appear.

This is not a criticism of Bitcoin Core or its contributors. The question of whether Bitcoin Core is good or bad can only be answered relative to a particular node operator's requirements. The governance critique here is also separable from any opinion about Bitcoin's consensus rules. **This is not an argument that Bitcoin is broken.** It is an argument that these specific defenses of Core's implementation monopoly do not survive logical scrutiny. For the numbered argument map, see *[Bitcoin Governance: Argument Map](/articles/bitcoin-governance-argument-map)*. For narrative evidence and funding maps, see *[Who Controls Bitcoin](/articles/bitcoin-governance)*.

---

### Fallacy 1: "Bitcoin Core has hundreds of contributors, therefore it is not controlled by a small group"

This is a non sequitur. **Contributor count and governance concentration are independent measurements**, and conflating them is either naive or deliberate misdirection.

Analysis of 23,478 pull requests, 433,048 IRC messages, and 16 years of data tells a different story. The top three contributors control 81.1% of all merges, with Wladimir J. van der Laan at 34.8%, Michael Ford at 25.8%, and Marco Falke at 20.5%. The Gini coefficient of contribution is 0.851, which is 74% higher than US income inequality. Power is not distributing over time but calcifying: top 10 control increased from 42.7% to 49.8% over the analysis period. Of 7,604 contributors across the project's history, 87.7% have exited with no activity in the past year. The contributor count is not the governance count, and one does not imply the other.

### Fallacy 1.1: "The process has improved, therefore the structural problem is being addressed"

Process improvements are real. Zero-review merges dropped by 88.7% and response times improved by 73%. These are genuine workflow gains. The self-merge rate, however, has held stable at 26.5%. The review weight bias between maintainers and non-maintainers has held stable at 5.5 to 1. Top 10 control increased. The Gini coefficient is essentially unchanged. The oligarchy got more efficient at processing pull requests and the concentration of authority did not move. **Those are two different things.**

### Fallacy 1.2: "Maintainers are just janitors, not decision-makers"

This framing appeared in mainstream Bitcoin commentary as early as 2018 and has been repeated since. The data does not support it. Maintainers self-merge 26.5% of their own pull requests, and 46.1% of those self-merges carry zero reviews. One historical maintainer self-merged 77.1% of his own pull requests. Merge authority over the only implementation that 99% of economic nodes run **is not a janitorial function** by any honest definition of the term.

---

### Fallacy 2: "Widespread adoption proves technical merit"

This is a self-serving bias. It assumes that the mechanism of adoption was active preference rather than the absence of alternatives, and that assumption does not hold up.

No credible alternative implementation exists. Bitcoin Knots is a Core fork. Btcd abandoned active development and is not positioned to confront Bitcoin Core. Libbitcoin has been slow to develop and remains unreleased. It abandoned the UTXO set and mempool, requiring ecosystem retooling and accepting isolation. Running Bitcoin Core is not a positive selection on merit. It is the predictable outcome of path dependency, exchange requirements, and wallet vendor defaults. Adoption through switching cost is not adoption through technical merit, and treating it as such is begging the question.

### Fallacy 2.1: "Alternative implementations exist, therefore there is no monopoly"

The existence of alternatives on paper is not the same as viable alternatives in practice. Forking Bitcoin Core inherits 300,000+ lines of monolithic C++, 17 years of technical debt, and the same governance capture vectors under new management. Without a formal specification floating above the implementation, any alternative must reverse-engineer undocumented behavior from the reference client itself, which makes the reference client the de facto specification by default. The lack of a specification protects the incumbent by making independent implementation structurally more expensive than it would otherwise need to be. To date, no alternative implementation has successfully replicated Bitcoin Core's consensus implementation entirely unless it is directly forked from Bitcoin Core.

---

### Fallacy 3: "Critics of Bitcoin Core just don't like change"

This is an ad hominem that routes around the substantive argument by attacking the character or motivation of the critic rather than the content of the criticism.

Jon Atack has been a Bitcoin Core contributor since 2019, a BIP editor, and a developer. In March 2026, he stated on record that maintainer selection involved favoritism and double standards, that preferred successors were picked and groomed explicitly, and that the record would speak for itself when laid out. He stated directly that the ship has sailed for someone like him to make change from within Core because the entrenched are entrenched. These are the words of a longtime insider with no competing implementation to promote, not the words of someone who dislikes change.

Beyond Atack, 31 Bitcoin Core developers signed an open letter against the OP_RETURN change and were overridden. Developers were banned from GitHub for raising a documented conflict of interest involving a contributor with a direct financial stake in the outcome. Luke Dashjr was removed from the Bitcoin Core security list after a decade of contribution with no documented process and no appeal. The pattern is insiders with documented grievances, not outsiders resistant to progress.

---

### Fallacy 4: "Bitcoin Core is not monolithic"

Bitcoin Core is approximately 300,000 lines of C++ in which the wallet, networking layer, consensus engine, and RPC interface are entangled rather than independently composable. The fact that it has internal modules does not make it non-monolithic any more than the Linux kernel's loadable modules make it non-monolithic. Modularity and monolithism are independent properties and a codebase can be both simultaneously.

The deeper issue is that no formal specification exists above what Bitcoin Core ships. When 99% of nodes run a single codebase, the reference client and the protocol become functionally identical regardless of what anyone claims about their separability. The absence of a specification is not a neutral technical choice. It protects the incumbent by ensuring that any alternative implementation must reverse-engineer undocumented behavior rather than implement against an independent mathematical standard.

---

### Fallacy 5: "Rough consensus governs Bitcoin Core decisions"

Rough consensus is defined and invoked by the same maintainers who close pull requests, which means there is no external arbiter, no defined threshold, and no appeal mechanism. Bitcoin Core's CONTRIBUTING.md states that the final arbiter of what constitutes sufficient consensus is the judgement of the maintainers. That is not a governance rule. That is unlimited discretion with a rule-shaped wrapper around it.

The voting bloc data exposes the problem. Reviewers vote together 89.3% of the time, with 214 distinct blocs showing greater than 80% cohesion across decisions. The top two active maintainers agreed with each other on 100% of their shared decisions. If the people deliberating are already that coordinated before deliberation begins, invoking rough consensus as a legitimizing mechanism is circular. The outcome is not emerging from the process. The process is ratifying an outcome that was already decided.

---

### Fallacy 6: "You should judge Bitcoin Core on technical merits alone"

Judging software on technical merits alone requires a formal specification that defines precisely what the software does and does not do, and a formal proof that the implementation satisfies that specification. Bitcoin Core has neither. In the absence of both, developer trustworthiness, funding relationships, governance behavior, and conflicts of interest are not irrelevant considerations to be excluded from the analysis.

Their track record is not reassuring. A Bitcoin Core maintainer had their security compromised while holding merge access to infrastructure securing over $1 trillion in network value, and the community response was effectively silence. A wallet deletion bug shipped to production. The OP_RETURN change was merged over documented opposition that included a signed letter from 31 contributors, with at least one developer banned from the GitHub repository for pointing out that a contributor pushing the change was affiliated with a for-profit project that directly benefited from it. These are not external attacks on the project. They are governance failures that originated inside the structure itself. For the same reputation-over-verification pattern applied to hardware wallets, see *[Don't Trust, Verify](/articles/dont-trust-verify)*. For why irreversible stakes make a softer culture the wrong prescription while those failures continue, see *[The Adversarial Default](/articles/the-adversarial-default)*.

---

### Fallacy 7: "Bitcoin Core is conservative by design, and that's a feature"

The conservation of consensus rules is a genuine and important property of Bitcoin. What gets conflated with it, consistently and conveniently, is the conservation of the implementation itself. These are two distinct things and treating them as the same thing is either confused or dishonest.

Wallet and node separation has had universal agreement among contributors for approximately 12 years and has not shipped. UTXO commitments have been research-complete since 2014, would reduce the initial block download burden for new nodes by approximately 98%, and have not shipped. Every year that UTXO commitments do not ship, every new node operator pays the full cost of downloading 17+ years of chain history including all spam and bloat that UTXO commitments would have made irrelevant. That cost compounds with every passing year and every new participant — quantified in *[Full Cost of Running a Bitcoin Node](/articles/full-cost-of-running-a-bitcoin-node)*. The governance structure cannot distinguish between a proposal that is contested on the merits and a proposal that has unanimous agreement, and the practical result is that nothing ships either way. For the evidence dossier on stalled improvements, see *[What Bitcoin's Stalled Proposals Tell You](/articles/what-bitcoins-stalled-proposals-tell-you)*.

---

### Fallacy 8: "Spreading reviewer resources across multiple implementations weakens Bitcoin"

This argument assumes that the global pool of qualified reviewers is fixed and that diverting any portion of it to alternative implementations reduces the total security of the network. Atack addressed this directly in March 2026, describing it as a collectivist framing that treats the pie as a fixed size to be divided rather than something that can grow. His point was that developers who cannot be productive in Bitcoin Core's social environment for whatever reason, whether personal situation, work style, or geography, could contribute productively in a different organizational context. Welcoming them into alternative implementations grows the total reviewer pool rather than redistributing a fixed one.

Bitcoin Core's power nexus sits in approximately three or four locations across the US, UK, and a handful of European cities. The developer population capable of contributing to Bitcoin infrastructure is global, and the constraint on participation is not a shortage of qualified people but a set of structural and social barriers that the current governance model imposes and benefits from maintaining.

---

## Conclusion

This post will be updated as additional fallacies appear, and I will direct people here when these arguments come up in discussion.

Bitcoin was designed to eliminate the need for trusted intermediaries in money. **Its reference implementation is governed by a small, concentrated group of them.**

---

## Sources

- [Bitcoin Governance Research](https://github.com/secsovereign/bitcoin-governance-research) — merge concentration, Gini, voting-bloc data cited in Fallacies 1–2 and 5
- [Jon Atack, Plan B Forum (Rumble)](https://rumble.com/v75tyny-bitcoin-code-governance-jon-atack-plan-forum.html) — maintainer selection and governance dynamics
- [Jude C. Nelson, "Systemd: The Biggest Fallacies"](http://judecnelson.blogspot.com/2014/09/systemd-biggest-fallacies.html) — template for this article's structure
