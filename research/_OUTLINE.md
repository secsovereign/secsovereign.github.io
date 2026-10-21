# secsov.com governance research page: outline (draft for Joshua)

Status: outline only, for review. Nothing is published. Holds.md A-20261021-FIX ("secsov.com: a governance research page"); the strategy doc §5 lists "SecSov: bio, research page" under Josh decisions.

## Where it would live

- **Repo:** `secsovereign/secsovereign.github.io` (CNAME `secsov.com`, GitHub Pages, branch `main`). MeABzZz has read-only access, so PRs come from the fork `MeABzZz/secsovereign.github.io`.
- **URL:** `https://secsov.com/research`
- **Source:** `research/index.md`, rendered to `research/index.html` by `scripts/build-articles.js` the same way `articles/index.html` and `bips/index.html` are built (needs a small `buildResearchPage()` in that script plus `article.css`; no new styling system).
- **Wiring:**
  - Home page catalog: add `<a class="catalog-more" href="/research">Governance research</a>` next to "All writing" (`index.html:689`) and "All BIPs" (`index.html:700`).
  - The existing bio link "quantitative Bitcoin governance research" points to the GitHub repo. Point it at `/research` instead, and the page links to the repo.
  - `sitemap.xml` and `llms.txt`: add the URL in the build script's sitemap list (around `scripts/build-articles.js:1035`) and the llms "Bitcoin governance" section (`llms.txt:44`).
  - PDF: optional, through the existing `render-pdf`.
- **Data source:** `secsovereign/bitcoin-governance-research` (`findings/EXECUTIVE_SUMMARY.md`, last updated 2026-10-07). The page quotes the findings and links each number to its findings file. No new numbers.

## Voice rules for this page (brand file + holds)

- Governance depth with data. No factoids (H-20261021-2). First person allowed.
- No named callouts of individuals (brand rule). Use roles: "one merge-key holder", "the top three mergers". The research repo uses logins; the page doesn't.
- Every number states its frame: era, channel, and all-time vs 2022+ (per `GOVERNANCE_FRAMES.md`, "Use this before quoting all-time rates").
- Not financial advice. No em dashes. No invented partner logos.

## Page outline

1. **Title and one-line thesis.**
   Working title: "Who Merges Bitcoin: Governance Research".
   Thesis: Bitcoin removed trusted third parties from money; the reference implementation still runs on trusted maintainers. This page measures that.
2. **What was measured (coverage box).**
   - Corpus: 25,122 PRs, 8,890 issues, 51,062 mailing-list emails, 430,613 IRC messages, 4,662 Delving posts, 158,917 Bitcointalk posts, 339 releases.
   - Span: 2010 to 2026. Last refresh: 2026-10-07.
   - Method in one paragraph, linking `RESEARCH_METHODOLOGY.md` and `DATA_SOURCING_AND_REPRODUCIBILITY.md`.
3. **How to read these numbers.** The four frames from `GOVERNANCE_FRAMES.md`:
   - agenda-setting vs decision by era
   - the merge graph as the informal org chart
   - power isn't portable across venues
   - exit as selection
4. **Finding 1: merge authority is concentrated.**
   - Top-3 mergers: about 81% of all merges (all-time).
   - Since 2022, one merger handles about 50% and the top three about 83%.
   - Merge keys ≠ the maintainer roster.
   - Caveat, kept on the page: concentration is not a health rank. After size adjustment Core ranks 3 of 17 and the interval covers zero (`FINAL_READOUT.md`).
5. **Finding 2: self-merge without review.**
   - 25.5% of maintainer-merged PRs are self-merged.
   - 45.1% of those have zero GitHub review objects (11.6% of all maintainer merges).
   - The written rule (`CONTRIBUTING.md`) sets no numeric minimum.
   - The process improved: zero-review merges fell from 30.3% to 3.3% (2012–2020 vs 2021–2025). Show both, so the claim is fair.
6. **Finding 3: newcomers and outsiders.**
   - First-PR outsider merge rate: about 29% all-time, about 16% since 2022.
   - On consensus-sensitive paths: about 35% for outsiders vs 73% for maintainers.
   - Large outsider PRs (≥2k LOC) rarely land.
   - Caveat: established outsiders merge at about 67–71%, and out-group code doesn't fail more (7.0% vs 8.3% fix-forward).
7. **Finding 4: release signing.** 7 unique signers. The top 5 signed 97.2% of signed releases (`RELEASE_SIGNING_ANALYSIS.md`).
8. **Finding 5: stalled proposals.** The docket table from `STALLED_PROPOSALS_REPORT.md`: Dandelion, Erlay, UTXO commitments vs AssumeUTXO, wallet/node separation, package relay, private broadcast. Use its "cite as" wording, and remember the Dandelion framing correction (commit 225e108: "a priority call, not a technical bar").
9. **What this does and does not show.** Descriptive, not proof of intent. Link `CRITICAL_REVIEW_ADVERSARIAL.md` and `STATISTICAL_DEFENSE_RESULTS.md`.
10. **What would change it.** The structural answer: a written spec and implementation diversity. Link the existing essays (Who Controls Bitcoin, Argument Map, The Social Layer Is the Attack Surface, Why Bitcoin Needs a Specification) and thebitcoincommons.org/spec.html. One paragraph, not a pitch.
11. **Reproduce it.** Repo link, the `collect → analyze → report` steps, the data-source table, and how to file a correction.
12. **Disclosures.** The existing initials-only affiliation line (TBC/BLVM, BV, NS, PF), and a note that the author builds a competing implementation.

## Decisions for Joshua before a real draft

1. Do you want the page at all, and is the title OK?
2. Roles only (recommended, per the brand rule) or logins, as in the research repo?
3. All-time or 2022+ as the headline number for merge concentration?
4. Should the bio link go to `/research` instead of the GitHub repo?
5. Wait for a fresh data refresh first? The last one was 2026-10-07.
