# The Rules Are 7% of the Program

## A line count of Bitcoin Core 32.1

*Release **32.1**, branch `32.x`, commit `f0de87f`, 26 October 2026. Current-tree figures are tokei 14 code lines. History figures are git numstat on non-merge commits.*

The consensus rules are **10,122** code lines. The implementation they sit in is **151,004**. The code that applies those rules, stores the result, or chooses what to relay and mine is **20,366**, twice the rules. The other **120,516** lines are the wallet, the GUI, RPC, P2P transport, and the rest of the node.

A wrong rule forks the network. A policy disagreement does not. The two live in the same program, and the rules are the thin slice. That is the measurement behind *[The Vertical Layer Problem](/articles/the-vertical-layer-problem)* and *[Why Bitcoin Needs a Specification That Humans Can Read](/articles/why-bitcoin-needs-a-specification)*.

---

## Contents

- [I. What was counted](#i-what-was-counted)
- [II. The tree](#ii-the-tree)
- [III. The implementation](#iii-the-implementation)
- [IV. The rules](#iv-the-rules)
- [V. What sits beside the rules](#v-what-sits-beside-the-rules)
- [VI. Tests](#vi-tests)
- [VII. Bundled code](#vii-bundled-code)
- [VIII. Who added the lines](#viii-who-added-the-lines)
- [Where the work went](#where-the-work-went)
- [What changes in the same commit](#what-changes-in-the-same-commit)
- [IX. Who last touched what remains](#ix-who-last-touched-what-remains)
- [Who still edits a system](#who-still-edits-a-system)
- [The size of the contract](#the-size-of-the-contract)
- [X. Patch debt](#x-patch-debt)
- [XI. What the count is for](#xi-what-the-count-is-for)
- [XII. Method](#xii-method)

---

## I. What was counted

Tokei parsed **2,698** files and **719,989** code lines. Every one of those files is in exactly one bucket below. Git tracks 3,020 files. The 322 tokei skipped are 215 text files (31,095 physical lines, mostly Qt forms, CI glue, and licenses) and 107 binary files (4.82 MB). They are not in the code totals.

The headline is the implementation, not the 719,989. Qt locale files are 286,741 of those lines and are translations, counted by tokei as TypeScript. Vendored libraries are another 112,703. First-party code, implementation plus tests plus contrib, build, and docs, is **320,545**.

---

## II. The tree

<figure class="article-chart chart-intensity">
<div class="chart-heading">Code lines tokei counted, scaled to the Qt translations</div>
<div class="intensity-row">
<span class="intensity-name">Translations</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">286,741</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Tests</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:53.8%"></span></div>
<span class="intensity-value">154,273</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Implementation</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:52.7%"></span></div>
<span class="intensity-value">151,004</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Vendored</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:39.3%"></span></div>
<span class="intensity-value">112,703</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Contrib</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:3.2%"></span></div>
<span class="intensity-value">9,062</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Build and CI</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:2.2%"></span></div>
<span class="intensity-value">6,206</span>
</div>
</div>
<figcaption>The 189 markdown files are comments and blanks in this count, 34,921 physical lines, and do not show as code. Comments and blanks bring the parsed tree to 910,653 physical lines. Source: tokei 14 on Bitcoin Core 32.1, <code>f0de87f</code>.</figcaption>
</figure>

| Bucket | Code | Comments | Blanks | Files |
|---|---:|---:|---:|---:|
| Qt translations | 286,741 | 3 | 201 | 103 |
| Tests | 154,273 | 23,091 | 27,145 | 921 |
| Implementation | 151,004 | 37,005 | 25,701 | 756 |
| Vendored | 112,703 | 18,346 | 12,159 | 526 |
| Contrib | 9,062 | 6,037 | 2,174 | 97 |
| Build and CI | 6,206 | 2,417 | 1,464 | 106 |
| Docs | 0 | 27,889 | 7,032 | 189 |

Tests are 50.5% of implementation-plus-tests. Drop the JSON, hex, and HTML fixtures and test code is 141,369, which is 48.4% of implementation plus that test code. The program carries about as much test code as implementation code. On this release the test pile is the larger of the two.

First-party languages, the 320,545: C++ 181,104, Python 69,946, C and C++ headers 43,805, JSON 13,003, build files 10,667, Rust 1,141, other 879. Implementation bodies are 73.8% C++ (111,494) and 25.6% headers (38,669). The other 841 lines are neither.

---

## III. The implementation

Seven hundred fifty-six files. The median file is 66 code lines. Thirty-three files of 1,000 lines or more hold 38.9% of the implementation. Fifty-four files hold half of it.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Implementation code lines, scaled to the wallet</div>
<div class="intensity-row">
<span class="intensity-name">Wallet</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">21,687</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">GUI</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:90.7%"></span></div>
<span class="intensity-value">19,668</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Validation</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:82.7%"></span></div>
<span class="intensity-value">17,926</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">P2P</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:77.8%"></span></div>
<span class="intensity-value">16,880</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">RPC and HTTP</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:76.2%"></span></div>
<span class="intensity-value">16,520</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Support</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:72%"></span></div>
<span class="intensity-value">15,606</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Crypto</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:46.7%"></span></div>
<span class="intensity-value">10,122</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Script</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:44.9%"></span></div>
<span class="intensity-value">9,734</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Mempool</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:38.6%"></span></div>
<span class="intensity-value">8,363</span>
</div>
</div>
<figcaption>Validation here is chain state, indexes, and block storage. It is not the script interpreter. Mempool includes <code>src/policy</code> (2,665). The crypto bar is that directory, not the rule cut in section IV. The bars below 2,000 lines are in the table. Source: tokei on Bitcoin Core 32.1.</figcaption>
</figure>

| Also in the 151,004 | Code |
|---|---:|
| Executables | 3,094 |
| Peer address seeds (`chainparamsseeds.h`) | 2,679 |
| Init | 2,318 |
| Node interfaces | 1,719 |
| Mining templates | 1,019 |
| Addresses | 816 |
| Logging | 812 |
| Interfaces | 734 |
| IPC | 668 |
| ZMQ | 639 |

The largest files are `validation.cpp` (4,247), `net_processing.cpp` (4,220), `wallet.cpp` (3,488), `net.cpp` (3,248), `rpc/blockchain.cpp` (3,172), `chainparamsseeds.h` (2,679), `script/descriptor.cpp` (2,534), and `txgraph.cpp` (2,359).

`src/node` is not all P2P. Block storage and chainstate in that directory are in the validation bar. P2P is the network files only.

---

## IV. The rules

Consensus here means the code that decides whether a block or a transaction is valid. The bundled signature library is outside this split. It is counted in section VII.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">Share of the 151,004 implementation lines</div>
<div class="stackbar" role="img" aria-label="7 percent rules, 13 percent adjacent, 80 percent the rest">
<span class="stack-seg stack-major" style="width:6.7%">7%</span>
<span class="stack-seg stack-knots" style="width:13.5%">13%</span>
<span class="stack-seg stack-minor" style="width:79.8%">80%</span>
</div>
<div class="stackbar-legend">
<span><strong style="color:var(--primary)">■</strong> Rules, 10,122</span>
<span><strong style="color:#3a5a6a">■</strong> Adjacent, 20,366</span>
<span><strong style="color:var(--border)">■</strong> The rest, 120,516</span>
</div>
<figcaption>Exact shares are 6.70%, 13.49%, and 79.81%. The labels are the nearest percents and sum to 100. <code>validation.cpp</code> is the one file split by function.</figcaption>
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">What the 10,122 rule lines are, scaled to the hash code</div>
<div class="intensity-row">
<span class="intensity-name">SHA-256, RIPEMD</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">3,803</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Script interpreter</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:72.9%"></span></div>
<span class="intensity-value">2,772</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">PoW, merkle, deploy</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:34.5%"></span></div>
<span class="intensity-value">1,312</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Keys and integers</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:29.4%"></span></div>
<span class="intensity-value">1,117</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">validation.cpp checks</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:14.8%"></span></div>
<span class="intensity-value">562</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Block and tx types</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:14.6%"></span></div>
<span class="intensity-value">556</span>
</div>
</div>
<figcaption>The hash bar is SHA-256, including the CPU-specific files, plus RIPEMD-160 and the hash wrappers. SHA-1, SHA-3, and SHA-512 are in the rest. The interpreter itself is 1,584 lines. The 2,772 includes its header, script serialization, and the script error codes.</figcaption>
</figure>

Core's exported library, `libbitcoinconsensus`, is **4,757** of these rule lines: the interpreter, script, merkle, transaction checks, hashes, and the basic types. The other **5,365** rule lines are outside it. **3,568** of those are the SHA-256 and RIPEMD-160 implementations. The other **1,797** are proof of work, versionbits, deployments, signet, transaction input checks, the 562 lines in `validation.cpp`, and a handful of headers.

The kernel library is a different list. Its own comment says the list will shrink. The named sources still compile policy and mempool, so the kernel target is not this boundary. `bitcoin_crypto` sums to 5,605 and includes `cleanse.cpp` and `lockedpool.cpp`.

`src/script/solver.h` says the solver is used by policy and the wallet, and not by consensus. Descriptors and miniscript are in the 120,516.

---

## V. What sits beside the rules

Adjacent means the code that applies the rules, stores the result, or chooses what to relay and mine. An index can be wrong without making a block invalid. A policy limit can change without forking.

<figure class="article-chart chart-intensity">
<div class="chart-heading">The 20,366 adjacent lines, scaled to policy and mempool</div>
<div class="intensity-row">
<span class="intensity-name">Policy, mempool</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">8,747</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Chainstate</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:95.1%"></span></div>
<span class="intensity-value">8,318</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Indexes</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:26.1%"></span></div>
<span class="intensity-value">2,282</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Mining templates</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:11.7%"></span></div>
<span class="intensity-value">1,019</span>
</div>
</div>
<figcaption>Chainstate includes the UTXO cache, block storage, undo, chain activation, and 2,645 lines of <code>validation.cpp</code>. Policy includes the fee estimator, cluster mempool, RBF, <code>src/policy</code> (2,665), and 997 lines of <code>validation.cpp</code>.</figcaption>
</figure>

### validation.cpp is mostly the machine around the checks

The file is 4,247 code lines. The split is at function boundaries, comment-stripped, then scaled so the parts still sum to tokei's figure. ConnectBlock's checks stay with the rules. The undo write at the end of that function stays with chainstate. MemPoolAccept stays with policy.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">validation.cpp, 4,247 code lines</div>
<div class="stackbar" role="img" aria-label="Chainstate 2,645, mempool 997, validity checks 562, progress 43">
<span class="stack-seg stack-knots" style="width:62.3%">Chain</span>
<span class="stack-seg stack-active" style="width:23.5%">Pool</span>
<span class="stack-seg stack-major" style="width:13.2%">Rules</span>
<span class="stack-seg stack-minor" style="width:1%"></span>
</div>
<dl class="chart-stats">
<div><dt>Chainstate machine</dt><dd>2,645</dd></div>
<div><dt>Mempool acceptance</dt><dd>997</dd></div>
<div><dt>Validity checks</dt><dd>562</dd></div>
<div><dt>Progress and errors</dt><dd>43</dd></div>
</dl>
<figcaption>CheckBlock, ConnectBlock's checks, the subsidy, and BIP30 are the 562. Progress reporting and FatalError are the 43, and those sit with the rest of the node.</figcaption>
</figure>

---

## VI. Tests

Tests are 154,273 code lines: functional Python 62,437, unit 42,026, fuzz 22,254, fixtures 12,904, bench 6,799, wallet 3,193, lint 1,774, CI 1,135, GUI 1,133, harness 410, IPC 208.

A filename cut that stops at unit tests understates the functional suite. The assignment below puts every test file in one bucket. Rule tests are the named unit and fuzz files, further unit and fuzz of the rule types, the script and transaction vectors, and the functional tests of validity rules, including `p2p_segwit.py` (1,391), `feature_taproot.py` (1,353), and `feature_block.py` (927). Adjacent tests keep the mempool and policy names and add mining, assumeutxo, pruning, indexes, fee estimation, and package RPC. Benchmarks that share those names stay out of the ratio.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Test lines per implementation line, scaled to the rules</div>
<div class="intensity-row">
<span class="intensity-name">Rules</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">1.47</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">The rest</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:68.7%"></span></div>
<span class="intensity-value">1.01</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Adjacent</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:59.9%"></span></div>
<span class="intensity-value">0.88</span>
</div>
</div>
<figcaption>Rules: 14,875 test lines on 10,122 implementation lines. Adjacent: 17,840 on 20,366. The rest of the test tree: 121,558 on 120,516. Adjacent still has more test lines than the rules. The rules have more test lines per line of implementation.</figcaption>
</figure>

| What was counted | Code lines | Bucket |
|---|---:|---|
| Named rule unit and fuzz | 4,517 | Rules |
| Integer, hash, script, and block fuzz | 1,403 | Rules |
| Functional tests of validity rules | 5,375 | Rules |
| `script_tests.json`, tx vectors, `invalid_txs.py` | 3,580 | Rules |
| Mempool, policy, cluster, RBF, package names | 8,073 | Adjacent |
| Mining, assumeutxo, pruning, indexes, package RPC | 6,746 | Adjacent |
| Coins, miner, blockfilter, chainstate unit and fuzz | 3,021 | Adjacent |
| Everything else in the test tree | 121,558 | The rest |

The 3,580 vector lines are `script_tests.json` (2,614), `tx_valid.json` (426), `tx_invalid.json` (313), and `invalid_txs.py` (227). The rest row includes wallet, GUI, P2P transport, lint, and CI. A test that calls the interpreter under a name this list does not use is in that row.

---

## VII. Bundled code

Vendored trees sum to 112,703 code lines. **89,312** (79%) are maintained as Bitcoin Core projects. **23,391** (21%) are forks of Google libraries.

The fork's own patch is small next to what Google changed after the shared ancestor. leveldb in this release is commit `13da2d67` (11 August 2026). Its shared ancestor with Google's main is `0c40829` (5 November 2019). Since that ancestor the fork changed 32 files, +242/−194. Google changed 115 files, +2,335/−1,886. Set side by side at this release, 114 files differ: 1,973 lines are only in the fork and 2,374 are only in Google. Most of the fork's own patch is `util/env_windows.cc` (+88/−39). crc32c is commit `efb8ea04` (30 August 2024), ancestor `21fc8ef` (8 February 2022). The fork changed 15 files, +46/−24, mostly `src/crc32c_arm64.cc` (+22/−12) and the dropped `third_party` submodules. Google changed 8 files, +54/−38. The direct gap is 17 files: 68 lines only in the fork, 62 only in Google. These counts are git numstat, so they include comments and blanks. Google's leveldb tip for the comparison is `bb74ef73` (8 October 2026). Google's crc32c tip is `2bbb3be` (7 April 2025).

<figure class="article-chart chart-intensity">
<div class="chart-heading">Bundled code lines, scaled to libsecp256k1</div>
<div class="intensity-row">
<span class="intensity-name">secp256k1</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">76,503</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">leveldb</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:28.4%"></span></div>
<span class="intensity-value">21,721</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">libmultiprocess</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:7.2%"></span></div>
<span class="intensity-value">5,540</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">minisketch</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:5.9%"></span></div>
<span class="intensity-value">4,534</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">univalue</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:2.7%"></span></div>
<span class="intensity-value">2,033</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">crc32c</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:2.2%"></span></div>
<span class="intensity-value">1,670</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">ctaes</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:0.9%"></span></div>
<span class="intensity-value">702</span>
</div>
</div>
<figcaption>secp256k1 is 7.6 times the 10,122 first-party rule lines. Its README says the primary focus is Bitcoin. leveldb and crc32c are Google forks. univalue is absorbed into this repository and is not in <code>get_subtrees()</code>.</figcaption>
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">Lines changed since the shared ancestor, scaled to Google's leveldb history</div>
<div class="intensity-row">
<span class="intensity-name">leveldb, Google</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">4,221</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">leveldb, the fork</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:10.3%"></span></div>
<span class="intensity-value">436</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">crc32c, Google</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:2.2%"></span></div>
<span class="intensity-value">92</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">crc32c, the fork</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:1.7%"></span></div>
<span class="intensity-value">70</span>
</div>
</div>
<figcaption>Added plus deleted. The leveldb fork's own movement is about a tenth of Google's later history. crc32c's two sides are close, and both are small on this scale.</figcaption>
</figure>

Fetched at build time, and absent from the checkout, so they have no line count here: Qt 6.8.4, Boost 1.91.0, SQLite 3.50.4, ZeroMQ 4.3.5, Cap'n Proto 1.5.0, qrencode 4.1.1, systemtap 5.3. Those are wider-community libraries. `src/bench/nanobench.h` is 2,388 lines of third-party nanobench sitting inside the test tree.

Public-key checks in `src/pubkey.cpp` call into secp256k1. The signature math is a Core project used by other software. It is not part of the node's own source layout, and it is larger than the first-party rules.

---

## VIII. Who added the lines

History is git numstat on non-merge commits, extensions `.cpp`, `.h`, `.hpp`, `.c`, `.cc`, `.py`, and `.rs` only. Comments and blanks are included, so these are not tokei code lines. Vendored prefixes, Qt translations, and build scripts are excluded. Two bulk imports are dropped from the people table and kept in the year chart: sirius-m (46,010 added, 16 commits) and Vinnie Falco (25,695 added, 2 commits).

On that filter, **1,122,543** lines were added and **614,627** were deleted. Deleted over added is **55%**. Net is added minus deleted. It is not the lines still in the tree. That count is section IX.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">Of the lines added to code files, through 26 October 2026</div>
<div class="stackbar" role="img" aria-label="55 percent of added lines were later deleted, 45 percent remain as net">
<span class="stack-seg stack-minor" style="width:54.8%">55% deleted</span>
<span class="stack-seg stack-major" style="width:45.2%">45% net</span>
</div>
<dl class="chart-stats">
<div><dt>Added</dt><dd>1,122,543</dd></div>
<div><dt>Deleted</dt><dd>614,627</dd></div>
<div><dt>Net</dt><dd>507,916</dd></div>
</dl>
<figcaption>33,670 non-merge commits through this release. 26,226 of them touched the filtered code files. The other 7,444 touched only build, docs, translations, or vendored paths.</figcaption>
</figure>

| Year | Added | Deleted | Code commits |
|---:|---:|---:|---:|
| 2009 | 54,844 | 10,686 | 68 |
| 2010 | 65,289 | 62,104 | 218 |
| 2011 | 53,392 | 27,777 | 672 |
| 2012 | 37,038 | 21,369 | 958 |
| 2013 | 59,554 | 20,211 | 688 |
| 2014 | 64,249 | 36,468 | 1,273 |
| 2015 | 49,181 | 21,257 | 1,032 |
| 2016 | 57,430 | 28,521 | 1,400 |
| 2017 | 65,394 | 43,770 | 1,932 |
| 2018 | 56,407 | 34,265 | 1,648 |
| 2019 | 60,527 | 35,236 | 1,785 |
| 2020 | 91,782 | 47,157 | 2,606 |
| 2021 | 86,333 | 50,883 | 2,577 |
| 2022 | 69,544 | 33,989 | 2,134 |
| 2023 | 59,283 | 32,818 | 1,843 |
| 2024 | 78,067 | 44,992 | 2,001 |
| 2025 | 64,429 | 37,866 | 1,865 |
| 2026 | 49,800 | 25,258 | 1,526 |

2026 runs through 26 October. 2010's net is 3,185. The largest net year is 2020, at 44,625. 2009's net, 44,158, is close. Distinct author emails peaked at 152 in 2018 and fell to 79 in 2023. That email count double-counts a person who used two addresses in one year.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Lines added by person, bulk imports omitted, scaled to Pieter Wuille</div>
<div class="intensity-row">
<span class="intensity-name">Pieter Wuille</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">132,987</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Wladimir</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:73.6%"></span></div>
<span class="intensity-value">97,885</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Marco Falke</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:54.5%"></span></div>
<span class="intensity-value">72,530</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Ava Chow</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:45.9%"></span></div>
<span class="intensity-value">61,034</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Satoshi Nakamoto</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:38.1%"></span></div>
<span class="intensity-value">50,604</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Gavin Andresen</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:31.7%"></span></div>
<span class="intensity-value">42,191</span>
</div>
</div>
<figcaption>903 people remain after the bulk-import drop. The top five added 39.5% of kept additions. The top ten added 52.3%. Satoshi Nakamoto's commits in this row use the git author string <code>s_nakamoto</code>. Marco Falke, Gloria Zhao, and Michael Ford are the names in the release notes and in <code>SECURITY.md</code>. The git strings are MarcoFalke, glozow, and fanquake.</figcaption>
</figure>

| Person | Added | Deleted | Net | Commits | Deleted share |
|---|---:|---:|---:|---:|---:|
| Pieter Wuille | 132,987 | 59,517 | 73,470 | 1,703 | 45% |
| Wladimir J. van der Laan | 97,885 | 47,828 | 50,057 | 1,337 | 49% |
| Marco Falke | 72,530 | 61,422 | 11,108 | 2,879 | 85% |
| Ava Chow | 61,034 | 41,384 | 19,650 | 1,274 | 68% |
| Satoshi Nakamoto | 50,604 | 45,881 | 4,723 | 237 | 91% |
| Gavin Andresen | 42,191 | 36,796 | 5,395 | 393 | 87% |
| John Newbery | 24,882 | 26,142 | −1,260 | 749 | 105% |
| Suhas Daftuar | 24,723 | 8,580 | 16,143 | 438 | 35% |
| Russell Yanofsky | 22,958 | 13,286 | 9,672 | 414 | 58% |
| Gloria Zhao | 19,444 | 5,951 | 13,493 | 390 | 31% |
| Michael Ford | 19,053 | 17,676 | 1,377 | 601 | 93% |
| Ryan Ofsky | 17,697 | 6,601 | 11,096 | 272 | 37% |

Michael Ford's code-file net is 1,377 because this filter skips build scripts. His merge share is a different measurement, in *[Who Controls Bitcoin](/articles/bitcoin-governance)*. Line authorship and merge authority are not the same ranking. Pieter Wuille leads additions. The merge log does not.

On a coarser directory sort of the same git lines, tests gained the most net (167,063 of 302,025 added). Validation kept 31,808 of 110,917. The GUI kept 23,077 of 84,779. Crypto kept 8,120 of 27,526. That sort counts all of `src/node` as P2P, so it does not match the 16,880 current P2P bar. The next section uses the same file lists as the bars in section III.

---

## Where the work went

The 55% figure above counts every filtered code file, including tests. Restricted to implementation files, and split with the same system lists as section III, **672,059** lines were added and **431,312** were deleted. **64.2%** of what was added was later deleted. No system has a majority. Wallet is the largest share of lines added, at **14.9%**. Validation is **14.8%**. The top four, wallet, validation, the GUI, and P2P, are **55.3%**.

| System | Added | Deleted | Net | Commits | Share of lines added |
|---|---:|---:|---:|---:|---:|
| Wallet | 100,177 | 71,056 | 29,121 | 4,074 | 14.9% |
| Validation and chain state | 99,577 | 67,991 | 31,586 | 4,295 | 14.8% |
| GUI | 91,333 | 65,302 | 26,031 | 3,070 | 13.6% |
| P2P | 80,675 | 51,106 | 29,569 | 3,382 | 12.0% |
| RPC and HTTP | 63,238 | 39,140 | 24,098 | 3,142 | 9.4% |
| Support and utilities | 59,510 | 33,237 | 26,273 | 2,630 | 8.9% |
| Crypto and primitives | 36,031 | 20,597 | 15,434 | 969 | 5.4% |
| Script | 34,561 | 19,247 | 15,314 | 958 | 5.1% |
| Mempool and policy | 24,463 | 11,426 | 13,037 | 1,093 | 3.6% |

A commit that touches two systems is counted in both, so the commit column is not a partition. The line columns are. Most of these systems later delete between half and seven tenths of what they added. Mempool deletes 47%. The seed header, not in this table, deletes 89% across 39 commits. IPC deletes 21%.

The early years are the GUI. In 2009–2013 the GUI is **28.7%** of implementation lines added. In 2022–2026, through 26 October, validation leads, at **16.2%** of the lines added in that era (25,716 of 158,548). The nets in that era are validation +11,263, mempool +7,504, P2P +7,339, support +6,916, RPC +5,816, wallet +2,061, and the GUI +261. Wallet is the largest tree today because older lines survived. It is not where the recent lines went.

---

## What changes in the same commit

**61.0%** of wallet commits touch no other implementation system, and **13.7%** of them also touch validation. The tight pair is mempool and validation: **36.7%** of mempool commits also edit validation. RPC is the least separate. It is alone in **45.9%** of its commits, and those commits also touch validation **23.6%** of the time and wallet **23.2%**.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Share of a system's commits that touch no other implementation system</div>
<div class="intensity-row">
<span class="intensity-name">GUI</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">66.8%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Wallet</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:91.3%"></span></div>
<span class="intensity-value">61.0%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">P2P</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:90.3%"></span></div>
<span class="intensity-value">60.3%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Validation</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:78.6%"></span></div>
<span class="intensity-value">52.5%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Support</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:74.1%"></span></div>
<span class="intensity-value">49.5%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Crypto</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:73.5%"></span></div>
<span class="intensity-value">49.1%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Script</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:71.9%"></span></div>
<span class="intensity-value">48.0%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">RPC</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:68.7%"></span></div>
<span class="intensity-value">45.9%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Mempool</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:68.1%"></span></div>
<span class="intensity-value">45.5%</span>
</div>
</div>
<figcaption>All history through 32.1. A commit that edits two systems counts once in each. Alone means no other classified implementation system. The last three years, 26 October 2023 through this release, are close for wallet (68% alone) and validation (62%). The GUI moved, from 66.8% alone over the whole history to 47% in that window.</figcaption>
</figure>

| System | Commits | Only this system | Also touches |
|---|---:|---:|---|
| GUI | 3,070 | 66.8% | wallet 17.7% |
| Wallet | 4,074 | 61.0% | RPC 17.9%, validation 13.7% |
| P2P | 3,382 | 60.3% | validation 20.8%, RPC 15.9% |
| Validation | 4,295 | 52.5% | RPC 17.3%, P2P 16.4% |
| Support | 2,630 | 49.5% | validation 23.8%, P2P 20.1% |
| Crypto | 969 | 49.1% | support 26.7%, validation 26.6% |
| Script | 958 | 48.0% | wallet 29.4%, validation 25.9% |
| RPC | 3,142 | 45.9% | validation 23.6%, wallet 23.2% |
| Mempool | 1,093 | 45.5% | validation 36.7%, RPC 20.9% |

---

## IX. Who last touched what remains

`git blame -w` on the 756 implementation files. Each non-blank line goes to the last commit that changed it. `validation.cpp` is split on the same function boundaries as section IV. Comments count, so these totals sit above the tokei code lines: 12,734 non-blank rule lines against 10,122 code lines.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Who last touched the rule lines, scaled to Pieter Wuille</div>
<div class="intensity-row">
<span class="intensity-name">Pieter Wuille</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">44.2%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Jorge Timón</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:28%"></span></div>
<span class="intensity-value">12.4%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Anthony Towns</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:12.3%"></span></div>
<span class="intensity-value">5.4%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Marco Falke</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:8.5%"></span></div>
<span class="intensity-value">3.8%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Cory Fields</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:7.6%"></span></div>
<span class="intensity-value">3.3%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Wladimir</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:7.5%"></span></div>
<span class="intensity-value">3.3%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Johnson Lau</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:6.8%"></span></div>
<span class="intensity-value">3.0%</span>
</div>
</div>
<figcaption>12,734 non-blank lines. Jorge Timón includes the jtimon author string. The median rule line was last touched in 2017. The median adjacent line was last touched in 2023. The median line in the rest of the implementation was last touched in 2021.</figcaption>
</figure>

| Bucket | Non-blank lines | Most of those lines | Share | Median year |
|---|---:|---|---:|---:|
| Rules | 12,734 | Pieter Wuille | 44.2% | 2017 |
| Adjacent | 28,051 | Pieter Wuille | 24.1% | 2023 |
| The rest | 146,731 | Ava Chow | 11.4% | 2021 |

Across all 187,516 non-blank implementation lines, Pieter Wuille last touched 13.9%, Ava Chow 9.1%, Marco Falke 7.6%, and Wladimir J. van der Laan 5.9%. Those four, plus TheCharlatan, Hennadii Stepanov, Russell Yanofsky, and Vasil Dimov, last touched 49.0%. Gloria Zhao is third on the adjacent lines, at 6.9%, and tenth overall.

The rule lines are older than the code around them, and one person last touched 44% of them. The additions table in section VIII is a different question. Satoshi's author string leads a large share of historical additions and is absent from the lines that remain. Who would make the next change is the next section.

---

## Who still edits a system

Over the three years ending 26 October 2026, validation's 798 commits come from 67 author names, and seven people cover half. Lőrinc is 15%. Marco Falke is 10%. TheCharlatan is 9%. Mempool is the concentrated system: Pieter Wuille is 36% and Suhas Daftuar is 12%, just under half together, and three people cover half. Wallet takes three people to reach half. Ava Chow, including commits signed Andrew Chow, is 31% of them.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Largest share of a system's commits, last three years, scaled to mempool</div>
<div class="intensity-row">
<span class="intensity-name">Mempool, Pieter Wuille</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">36%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Wallet, Ava Chow</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:86.1%"></span></div>
<span class="intensity-value">31%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Script, Ava Chow</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:80.6%"></span></div>
<span class="intensity-value">29%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Support, Marco Falke</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:66.7%"></span></div>
<span class="intensity-value">24%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">GUI, Marco Falke</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:55.6%"></span></div>
<span class="intensity-value">20%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">P2P, Gloria Zhao</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:47.2%"></span></div>
<span class="intensity-value">17%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Validation, Lőrinc</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:41.7%"></span></div>
<span class="intensity-value">15%</span>
</div>
</div>
<figcaption>Author dates from 26 October 2023 through this release. The validation bar is the largest person, not a majority. Seven people cover half of validation's commits. No system in the table is one person.</figcaption>
</figure>

| System | Commits | Authors | People to half | Largest share | Top three |
|---|---:|---:|---:|---|---:|
| Validation | 798 | 67 | 7 | Lőrinc 15% | 33% |
| Wallet | 665 | 68 | 3 | Ava Chow 31% | 52% |
| GUI | 197 | 35 | 3 | Marco Falke 20% | 52% |
| P2P | 549 | 60 | 7 | Gloria Zhao 17% | 37% |
| RPC | 562 | 78 | 7 | Marco Falke 15% | 33% |
| Support | 539 | 58 | 5 | Marco Falke 24% | 43% |
| Crypto | 178 | 32 | 5 | Marco Falke 17% | 39% |
| Script | 174 | 35 | 3 | Ava Chow 29% | 52% |
| Mempool | 401 | 40 | 3 | Pieter Wuille 36% | 58% |

Authors are git author-name strings, compared case-insensitively, with Andrew Chow counted as Ava Chow, glozow as Gloria Zhao, and fanquake as Michael Ford. furszy and ismaelsadeeq are the names in the release notes. ismaelsadeeq is 9% of recent mempool commits, third after Pieter Wuille and Suhas Daftuar. RPC has the most names, 78, and seven people to reach half. The GUI is the quiet tree, 197 commits. Pieter Wuille last touched 44% of the rule lines still in the tree, and the median rule line was last touched in 2017. Over these three years his largest share is mempool, at 36%, and he is second on crypto, at 13%.

---

## The size of the contract

At this release the tree exposes **171** RPC methods, **36** P2P message types, and **5** named deployment slots. RPC grew in every era and shed names in every era after 2013. The deployment list gained taproot by the end of 2021. In this release the named slots are bip34, bip65, bip66, csv, and segwit. The taproot rule is still in the script interpreter.

<figure class="article-chart chart-intensity">
<div class="chart-heading">RPC methods at the end of each era, scaled to 32.1</div>
<div class="intensity-row">
<span class="intensity-name">2022–2026</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">171</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">2018–2021</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:91.2%"></span></div>
<span class="intensity-value">156</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">2014–2017</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:69.6%"></span></div>
<span class="intensity-value">119</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">2009–2013</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:42.1%"></span></div>
<span class="intensity-value">72</span>
</div>
</div>
<figcaption>Registered method names, including hidden methods. 2013 and 2017 are the command tables. 2021 and 2026 are <code>RPCHelpMan</code> and <code>RPCMethod</code> constructors.</figcaption>
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">P2P message types at the end of each era, scaled to 32.1</div>
<div class="intensity-row">
<span class="intensity-name">2022–2026</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">36</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">2018–2021</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:94.4%"></span></div>
<span class="intensity-value">34</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">2014–2017</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:72.2%"></span></div>
<span class="intensity-value">26</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">2009–2013</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:58.3%"></span></div>
<span class="intensity-value">21</span>
</div>
</div>
<figcaption>2013 is the messages the network dispatcher receives or sends. From 2017 on, the count is the <code>NetMsgType</code> list. Those two methods meet: 21 messages, drop alert, add the six compact-block and fee-filter names, and the 2017 table is 26.</figcaption>
</figure>

| Era | RPC methods | RPC change | P2P messages | P2P change | Deployment slots | Slot change |
|---|---:|---|---:|---|---:|---|
| 2009–2013 | 72 | +72, −0 | 21 | +21, −0 | 1 | +1, −0 |
| 2014–2017 | 119 | +52, −5 | 26 | +6, −1 | 5 | +4, −0 |
| 2018–2021 | 156 | +53, −16 | 34 | +9, −1 | 6 | +1, −0 |
| 2022–2026 | 171 | +29, −14 | 36 | +2, −0 | 5 | +0, −1 |

2026 ends at this release. P2P additions by 2017 are blocktxn, cmpctblock, feefilter, getblocktxn, sendcmpct, and sendheaders. alert is the removal. By 2021 the new names are addrv2, sendaddrv2, the compact-filter set, and wtxidrelay, and reject is gone. By this release the new names are sendtxrcncl and feature, the BIP 434 negotiation message. RPC removals by 2017 are getgenerate, gethashespersec, getinfo, getwork, and setgenerate. By 2021 the account API is gone, along with addwitnessaddress, bumpfee, estimatefee, and signrawtransaction. By this release the legacy import and dump methods are gone. The 2013 deployment slot is the block-version-2 height-in-coinbase rule, later named bip34. The four added by 2017 are bip65, bip66, csv, and segwit. The one added by 2021 is taproot. testdummy is excluded. Height-field aliases of the same fork are one slot.

Commit-message counts of the words "bug fix" are not a defect rate. Cyclomatic complexity restates the files the line counts already flag as large. Neither is in this article.

---

## X. Patch debt

The January 2026 debt study scores a file from how often it is edited in small diffs and how long it has gone without a large rewrite. This is the same formula, rerun on **17,072** merged pull requests from 3 January 2011 through 12 October 2026. It is a churn score. It is not a bug count. The pull-request dump ends before the 32.1 tag, so the scores do not see merges from 13 October through 26 October.

Counting every path that history ever touched, including files that are gone, **28.2%** score above 50 and the patch-to-refactor ratio is **3.0**. That reproduces the January headline (26.8% and 3.0). RPC is 63% of that wider count.

Restricted to files still in this tree, **15.8%** of files score above 50, and those files hold **10.2%** of current code lines. High-scoring files are smaller than average. Many of the old high scores were paths that no longer exist (`main.cpp`, `ui.cpp`). Among living files the ratio is **3.6** patches per refactor. Wallet is **6.9** to 1. The study's own consensus bucket, 26 files, is patched once per refactor, and 42% of those files still score above 50. That bucket is not the 10,122 rule lines.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Living files scoring above 50, scaled to the study's consensus bucket</div>
<div class="intensity-row">
<span class="intensity-name">Consensus files</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">42.3%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Wallet</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:60.3%"></span></div>
<span class="intensity-value">25.5%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">RPC</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:56.5%"></span></div>
<span class="intensity-value">23.9%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Script</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:44.7%"></span></div>
<span class="intensity-value">18.9%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">GUI</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:34.3%"></span></div>
<span class="intensity-value">14.5%</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Network</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:30%"></span></div>
<span class="intensity-value">12.7%</span>
</div>
</div>
<figcaption>Percent of files still in the tree. RPC's 63% was the count that included deleted paths. Among RPC files that remain, 24% score above 50.</figcaption>
</figure>

The highest living source files on this score are `src/index/base.cpp` (80, 376 lines), `src/rpc/util.cpp` (79.4, 1,249 lines), `src/wallet/walletdb.h` (79.3), `src/interfaces/chain.h` (77.9), and `src/validationinterface.cpp` (72.3).

---

## XI. What the count is for

The rules that have to be specified, audited, and matched by any other implementation are 10,122 code lines, plus a signature library that is larger than they are. The program operators download is the other 93% of the implementation, the tests, and the bundled trees. Treating a release as "the consensus rules" collapses those piles.

*[Don't Trust, Verify](/articles/dont-trust-verify#vi-the-same-system-applied-to-bitcoin-core)* is about that collapse at the review layer. The first independent audit of Bitcoin Core, Quarkslab in September 2025, scoped P2P, mempool, block validation, and chain state. Those are mostly the adjacent lines in section V, plus some of the checks. The interpreter, the hash implementations, and the type of the transaction are the rest of the 10,122, and secp256k1 is another 76,503.

*[Who Controls Bitcoin](/articles/bitcoin-governance)* measures who merges. This article measures who wrote lines and who last touched the lines that remain. The rankings differ. Merge concentration answers who can land a change. The blame in section IX answers whose text is still in the rule files. Both can be true, and neither is a substitute for the other. The sections after that blame answer three further questions. A commit that edits validation and the wallet is one change, and for the wallet that happens 13.7% of the time. Over the last three years, validation's commits are spread across 67 names. The contract a release exposes is the RPC methods, the P2P message types, and the deployment slots.

*[Bitcoin Core: The Biggest Fallacies](/articles/bitcoin-core-the-biggest-fallacies)* argues the client is a monolith because the wallet, the network, and the rules ship together. The line count is the size of that claim. Seven percent is the rules. Eighty percent is the rest of the same binary.

*[What Bitcoin's Stalled Proposals Tell You](/articles/what-bitcoins-stalled-proposals-tell-you)* uses the authorship Gini from the governance research. That Gini is on pull-request authorship. The added-line shares in section VIII are a third cut. Top-five line additions at 39.5% and a historical authorship Gini near 0.85 are the same shape at two resolutions. They are not the same number.

The cost of storing the chain this program validates is a separate account, in *[Full Cost of Running a Bitcoin Node](/articles/full-cost-of-running-a-bitcoin-node)*.

---

## XII. Method

**Snapshot.** Bitcoin Core **32.1**, branch `32.x`, commit `f0de87f040621468b956f01f526a43a010310501`, 26 October 2026, "Merge bitcoin/bitcoin#36658: [32.x] Finalise 32.1". The tag matches the branch tip. Not shallow. 50,657 commits, 16,987 of them merges. Line counts are this release. Authorship is history through this commit.

**Code lines.** tokei 14.0.0. A file is in one bucket. Implementation is `src/` excluding vendored prefixes (`secp256k1`, `leveldb`, `crc32c`, `minisketch`, `univalue`, `libmultiprocess`, `ctaes`), Qt locale, tests, fuzz, bench, markdown, and `CMakeLists.txt`. The system split uses explicit file lists for `src/node`, because that directory is not all P2P. `src/node/mining_args.cpp`, `mining_args.h`, and `mining_types.h` are in mining templates.

**The three-way cut.** Rule files are the SHA-256 and RIPEMD-160 sources, `hash.cpp` and `hash.h`, the script interpreter and script data, `pubkey`, `arith_uint256`, `uint256`, `src/primitives`, `src/consensus`, proof of work, versionbits, deployments, and signet. `validation.cpp` is split by function start, comment-stripped, then scaled from 4,187 raw code-like lines to tokei's 4,247. Adjacent is chainstate and storage, policy and mempool, indexes, and mining templates, including the matching parts of `validation.cpp`. SHA-1, SHA-3, and SHA-512 stay in the rest. The three parts sum to 151,004.

**Tests.** The named rule unit and fuzz files are the earlier filename list (4,517) plus integer, hash, script, and block tests that name a rule type (1,403). Functional rule tests are an explicit basename list: `feature_block`, `feature_taproot`, `feature_segwit`, `feature_cltv`, `feature_csv_activation`, `feature_dersig`, `feature_nulldummy`, `feature_bip68_sequence`, `feature_signet`, `feature_versionbits_warning`, `p2p_segwit`, `p2p_invalid_block`, `p2p_invalid_tx`, `p2p_mutated_blocks`. Adjacent adds an explicit list of mining, assumeutxo, pruning, index, fee, package, and chainstate tests to the mempool and policy filename prefix. A test outside those lists stays in the rest. That undercounts a functional test that exercises the interpreter under another name.

**History.** `git log HEAD --no-merges --numstat`. Renames of the form `{old => new}` are rewritten to the new path. Identity merges achow101 emails, hebasto in the email, and otherwise the dominant display name, casefolded, plus the published aliases: Wladimir's three spellings, Ava Chow and Andrew Chow, Marco Falke and MarcoFalke, Gloria Zhao and glozow, Michael Ford and fanquake, jtimon and Jorge Timón. The tables use the release-note names. Satoshi Nakamoto's row is the <code>s_nakamoto</code> string. People who share only a first name stay separate. Ryan Ofsky and Russell Yanofsky are different people.

**Systems over time.** The same numstat history, implementation paths only, classified with the section III file lists, including the explicit `src/node` split. A path is classified by the name it had in that commit. Vendored trees and tests are out. A commit that touches two systems counts in both commit totals. "Only this system" means the commit touched no other classified implementation system. The three-year window is author dates from 26 October 2023 through this release. Ava Chow includes commits signed Andrew Chow.

**The contract.** RPC names are the command table when that table carries the method name (2013 and 2017) and `RPCHelpMan` / `RPCMethod` constructors when it does not (2021 and this release). Hidden methods are included. P2P names in 2013 are the message strings the network dispatcher in `src/main.cpp`, `src/net.cpp`, and `src/alert.cpp` receives or sends. From 2017 on they are the `NetMsgType` strings. Deployment slots are `DEPLOYMENT_*` enumerators other than testdummy, plus the block-version-2 height rule, with height-field aliases of the same fork collapsed to one name. Era tips are the last commit on this history at the end of 2013 (`aec55a07`), 2017 (`c9439e73`), 2021 (`1831d43e`), and this release.

**Blame.** `git blame -w --line-porcelain` on each implementation file. Whitespace-only changes do not move the line. Blank lines are dropped. The same alias list as the history.

**Debt.** `scripts/analysis/code_turnover_analysis.py` in the Bitcoin Governance Research repository, run on `data/github/prs_raw.jsonl` (25,506 pull requests, 17,072 merged with a date, last merge 12 October 2026). The score weights patch frequency, time since a large rewrite, age of files the script labels consensus, and modifications per estimated line. Change type is a size heuristic: a refactor is a change over 30% of the estimated file or over 200 lines. The script's subsystem labels are filename patterns. They are not the three-way cut in section IV. Living-file membership is the 32.1 tree.

---

## Sources

- Bitcoin Core 32.1, commit [`f0de87f040621468b956f01f526a43a010310501`](https://github.com/bitcoin/bitcoin/commit/f0de87f040621468b956f01f526a43a010310501), branch `32.x`, 26 October 2026
- [tokei](https://github.com/XAMPPRocky/tokei) 14.0.0, file-level report on that tree
- [Bitcoin Governance Research, technical debt analysis](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/TECHNICAL_DEBT_ANALYSIS.md), formula rerun 30 October 2026 on the pull-request dump through 12 October 2026
- *[Who Controls Bitcoin](/articles/bitcoin-governance)*, *[The Vertical Layer Problem](/articles/the-vertical-layer-problem)*, *[Why Bitcoin Needs a Specification That Humans Can Read](/articles/why-bitcoin-needs-a-specification)*, *[Don't Trust, Verify](/articles/dont-trust-verify)*, *[Bitcoin Core: The Biggest Fallacies](/articles/bitcoin-core-the-biggest-fallacies)*, *[What Bitcoin's Stalled Proposals Tell You](/articles/what-bitcoins-stalled-proposals-tell-you)*, *[Full Cost of Running a Bitcoin Node](/articles/full-cost-of-running-a-bitcoin-node)*
