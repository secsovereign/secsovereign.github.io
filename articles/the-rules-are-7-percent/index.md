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

Tokei parsed **2,698** files and **719,989** code lines. Qt locale files are 103 of those files and **286,741** of those lines. Tokei counts them as TypeScript. They are translations, and the charts below leave them off. Every other parsed file is in exactly one bucket.

The headline is the implementation. Vendored libraries are another 112,703. First-party code, implementation plus tests plus contrib, build, and docs, is **320,545**. Those three figures, 286,741 plus 112,703 plus 320,545, are the 719,989.

---

## II. The tree

<figure class="article-chart chart-intensity">
<div class="chart-heading">Code lines, scaled to the tests</div>
<div class="intensity-row">
<span class="intensity-name">Tests</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">154,273</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Implementation</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:97.9%"></span></div>
<span class="intensity-value">151,004</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Vendored</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:73.1%"></span></div>
<span class="intensity-value">112,703</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Contrib</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:5.9%"></span></div>
<span class="intensity-value">9,062</span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Build and CI</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:4.0%"></span></div>
<span class="intensity-value">6,206</span>
</div>
</div>
</figure>

<figure class="article-chart">
<div class="chart-heading">Code, comments, and blanks, scaled to the implementation</div>
<p class="chart-key"><span class="key-a">Code</span><span class="key-c">Comments and blanks</span></p>
<div class="mix-row"><span class="intensity-name">Implementation</span><div class="mix-scale"><div class="mix-bar" style="width:100%"><span class="mix-code" style="width:70.66%"></span><span class="mix-comment" style="width:17.32%"></span><span class="mix-blank" style="width:12.03%"></span></div><span class="pair-meta">151,004 code · 756 files</span></div></div>
<div class="mix-row"><span class="intensity-name">Tests</span><div class="mix-scale"><div class="mix-bar" style="width:95.7%"><span class="mix-code" style="width:75.44%"></span><span class="mix-comment" style="width:11.29%"></span><span class="mix-blank" style="width:13.27%"></span></div><span class="pair-meta">154,273 code · 921 files</span></div></div>
<div class="mix-row"><span class="intensity-name">Vendored</span><div class="mix-scale"><div class="mix-bar" style="width:67.0%"><span class="mix-code" style="width:78.70%"></span><span class="mix-comment" style="width:12.81%"></span><span class="mix-blank" style="width:8.49%"></span></div><span class="pair-meta">112,703 code · 526 files</span></div></div>
<div class="mix-row"><span class="intensity-name">Docs</span><div class="mix-scale"><div class="mix-bar" style="width:16.3%"><span class="mix-code" style="width:0.00%"></span><span class="mix-comment" style="width:79.86%"></span><span class="mix-blank" style="width:20.14%"></span></div><span class="pair-meta">0 code · 189 files</span></div></div>
<div class="mix-row"><span class="intensity-name">Contrib</span><div class="mix-scale"><div class="mix-bar" style="width:8.1%"><span class="mix-code" style="width:52.46%"></span><span class="mix-comment" style="width:34.95%"></span><span class="mix-blank" style="width:12.59%"></span></div><span class="pair-meta">9,062 code · 97 files</span></div></div>
<div class="mix-row"><span class="intensity-name">Build and CI</span><div class="mix-scale"><div class="mix-bar" style="width:4.7%"><span class="mix-code" style="width:61.52%"></span><span class="mix-comment" style="width:23.96%"></span><span class="mix-blank" style="width:14.51%"></span></div><span class="pair-meta">6,206 code · 106 files</span></div></div>
</figure>

The program carries about as much test code as implementation code. On this release the test pile is the larger of the two. Implementation bodies are 73.8% C++ and 25.6% headers.

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
<figcaption>The crypto bar is that directory. The 10,122 in section IV is a different cut.</figcaption>
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">The rest of the implementation, scaled to the executables</div>
<div class="intensity-row"><span class="intensity-name">Executables</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100.0%"></span></div><span class="intensity-value">3,094</span></div></div>
<div class="intensity-row"><span class="intensity-name">Peer seeds</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:86.6%"></span></div><span class="intensity-value">2,679</span></div></div>
<div class="intensity-row"><span class="intensity-name">Init</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:74.9%"></span></div><span class="intensity-value">2,318</span></div></div>
<div class="intensity-row"><span class="intensity-name">Node interfaces</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:55.6%"></span></div><span class="intensity-value">1,719</span></div></div>
<div class="intensity-row"><span class="intensity-name">Mining templates</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:32.9%"></span></div><span class="intensity-value">1,019</span></div></div>
<div class="intensity-row"><span class="intensity-name">Addresses</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:26.4%"></span></div><span class="intensity-value">816</span></div></div>
<div class="intensity-row"><span class="intensity-name">Logging</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:26.2%"></span></div><span class="intensity-value">812</span></div></div>
<div class="intensity-row"><span class="intensity-name">Interfaces</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:23.7%"></span></div><span class="intensity-value">734</span></div></div>
<div class="intensity-row"><span class="intensity-name">IPC</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:21.6%"></span></div><span class="intensity-value">668</span></div></div>
<div class="intensity-row"><span class="intensity-name">ZMQ</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:20.7%"></span></div><span class="intensity-value">639</span></div></div>
</figure>

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
<figcaption>SHA-1, SHA-3, and SHA-512 are in the rest. The interpreter itself is 1,584 of the 2,772.</figcaption>
</figure>

Core's exported `libbitcoinconsensus` is **4,757** of these lines. The kernel target is a different list, and it still compiles policy and mempool.

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
</figure>

### validation.cpp is mostly the machine around the checks

The file is 4,247 code lines. CheckBlock, ConnectBlock's checks, the subsidy, and BIP30 stay with the rules. The undo write stays with chainstate. MemPoolAccept stays with policy.

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
</figure>

---

## VI. Tests

Tests are 154,273 code lines, about as many as the implementation.

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
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">Test lines by bucket, scaled to everything else</div>
<div class="intensity-row"><span class="intensity-name">The rest</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div><span class="intensity-value">121,558</span></div></div>
<div class="intensity-row"><span class="intensity-name">Adjacent</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:14.7%"></span></div><span class="intensity-value">17,840</span></div></div>
<div class="intensity-row"><span class="intensity-name">Rules</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:12.2%"></span></div><span class="intensity-value">14,875</span></div></div>
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">Rule and adjacent tests, scaled to mempool and policy</div>
<div class="intensity-row"><span class="intensity-name">Mempool and policy</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div><span class="intensity-value">8,073</span></div></div>
<div class="intensity-row"><span class="intensity-name">Mining and indexes</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:83.6%"></span></div><span class="intensity-value">6,746</span></div></div>
<div class="intensity-row"><span class="intensity-name">Rule functional tests</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:66.6%"></span></div><span class="intensity-value">5,375</span></div></div>
<div class="intensity-row"><span class="intensity-name">Named rule unit and fuzz</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:56.0%"></span></div><span class="intensity-value">4,517</span></div></div>
<div class="intensity-row"><span class="intensity-name">Script and tx vectors</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:44.3%"></span></div><span class="intensity-value">3,580</span></div></div>
<div class="intensity-row"><span class="intensity-name">Chainstate unit and fuzz</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:37.4%"></span></div><span class="intensity-value">3,021</span></div></div>
<div class="intensity-row"><span class="intensity-name">Hash and block fuzz</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:17.4%"></span></div><span class="intensity-value">1,403</span></div></div>
</figure>

The long bar is wallet, GUI, P2P transport, lint, and CI. A test that calls the interpreter under another name is in that bar.

---

## VII. Bundled code

Vendored trees sum to 112,703 code lines. **89,312** (79%) are maintained as Bitcoin Core projects. **23,391** (21%) are forks of Google libraries. secp256k1 is most of the first group, and it is 7.6 times the first-party rules.

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
</figure>

Since the projects split, Google has changed leveldb about ten times as much as this fork has. crc32c has barely moved on either side.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Lines changed since the shared ancestor, scaled to Google's leveldb history</div>
<div class="intensity-row">
<span class="intensity-name">leveldb, Google</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value"><span class="diff"><span class="diff-add">+2,335</span><span class="diff-del">−1,886</span></span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">leveldb, the fork</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:10.3%"></span></div>
<span class="intensity-value"><span class="diff"><span class="diff-add">+242</span><span class="diff-del">−194</span></span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">crc32c, Google</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:2.2%"></span></div>
<span class="intensity-value"><span class="diff"><span class="diff-add">+54</span><span class="diff-del">−38</span></span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">crc32c, the fork</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:1.7%"></span></div>
<span class="intensity-value"><span class="diff"><span class="diff-add">+46</span><span class="diff-del">−24</span></span></span>
</div>
</div>
</figure>

Qt, Boost, SQLite, ZeroMQ, Cap'n Proto, qrencode, and systemtap are fetched when the node is built. They are not in this checkout, so they have no line count here.

Public-key checks in `src/pubkey.cpp` call into secp256k1. That library is a Core project, used by other software, and it sits outside the node's own source.

---

## VIII. Who added the lines

**1,122,543** lines were added and **614,627** were deleted. **55%** of what was added was later deleted. Net is added minus deleted. It is not the lines still in the tree. That count is section IX. The filter is code files only. Comments and blanks count. Vendored trees, Qt translations, and build scripts do not.

<figure class="article-chart chart-stackbar">
<div class="chart-heading">Of the lines added to code files, through 26 October 2026</div>
<div class="stackbar" role="img" aria-label="55 percent of added lines were later deleted, 45 percent remain as net">
<span class="stack-seg stack-minor" style="width:54.8%">55% deleted</span>
<span class="stack-seg stack-major" style="width:45.2%">45% net</span>
</div>
<dl class="chart-stats">
<div><dt>Added</dt><dd><span class="diff-add">+1,122,543</span></dd></div>
<div><dt>Deleted</dt><dd><span class="diff-del">−614,627</span></dd></div>
<div><dt>Net</dt><dd><span class="diff-add">+507,916</span></dd></div>
</dl>
</figure>

<p class="chart-heading chart-open">Lines added and deleted, by year</p>
<p class="chart-key"><span class="key-a">Added</span><span class="key-b">Deleted</span></p>

<figure class="article-chart chart-line">
<svg viewBox="-48 0 808 248" font-size="14" font-family="system-ui, sans-serif" role="img" aria-label="Lines added and deleted by year, in thousands"><line class="grid" x1="68" y1="214.0" x2="744" y2="214.0"/><text class="ylab" x="58" y="214.0">0</text><line class="grid" x1="68" y1="165.0" x2="744" y2="165.0"/><text class="ylab" x="58" y="165.0">25</text><line class="grid" x1="68" y1="116.0" x2="744" y2="116.0"/><text class="ylab" x="58" y="116.0">50</text><line class="grid" x1="68" y1="67.0" x2="744" y2="67.0"/><text class="ylab" x="58" y="67.0">75</text><line class="grid" x1="68" y1="18.0" x2="744" y2="18.0"/><text class="ylab" x="58" y="18.0">100</text><polyline class="series-a" points="68.0,106.2 107.8,86.6 147.5,110.1 187.3,141.5 227.1,96.4 266.8,88.6 306.6,118.0 346.4,102.3 386.1,86.6 425.9,104.2 465.6,94.4 505.4,33.7 545.2,45.4 584.9,76.8 624.7,98.4 664.5,61.1 704.2,88.6 744.0,116.0"/><circle class="series-a" cx="68.0" cy="106.2" r="3"/><circle class="series-a" cx="107.8" cy="86.6" r="3"/><circle class="series-a" cx="147.5" cy="110.1" r="3"/><circle class="series-a" cx="187.3" cy="141.5" r="3"/><circle class="series-a" cx="227.1" cy="96.4" r="3"/><circle class="series-a" cx="266.8" cy="88.6" r="3"/><circle class="series-a" cx="306.6" cy="118.0" r="3"/><circle class="series-a" cx="346.4" cy="102.3" r="3"/><circle class="series-a" cx="386.1" cy="86.6" r="3"/><circle class="series-a" cx="425.9" cy="104.2" r="3"/><circle class="series-a" cx="465.6" cy="94.4" r="3"/><circle class="series-a" cx="505.4" cy="33.7" r="3"/><circle class="series-a" cx="545.2" cy="45.4" r="3"/><circle class="series-a" cx="584.9" cy="76.8" r="3"/><circle class="series-a" cx="624.7" cy="98.4" r="3"/><circle class="series-a" cx="664.5" cy="61.1" r="3"/><circle class="series-a" cx="704.2" cy="88.6" r="3"/><circle class="series-a" cx="744.0" cy="116.0" r="3"/><polyline class="series-b" points="68.0,192.4 107.8,92.5 147.5,159.1 187.3,172.8 227.1,174.8 266.8,143.4 306.6,172.8 346.4,157.2 386.1,127.8 425.9,147.4 465.6,145.4 505.4,121.9 545.2,114.0 584.9,147.4 624.7,149.3 664.5,125.8 704.2,139.5 744.0,165.0"/><circle class="series-b" cx="68.0" cy="192.4" r="3"/><circle class="series-b" cx="107.8" cy="92.5" r="3"/><circle class="series-b" cx="147.5" cy="159.1" r="3"/><circle class="series-b" cx="187.3" cy="172.8" r="3"/><circle class="series-b" cx="227.1" cy="174.8" r="3"/><circle class="series-b" cx="266.8" cy="143.4" r="3"/><circle class="series-b" cx="306.6" cy="172.8" r="3"/><circle class="series-b" cx="346.4" cy="157.2" r="3"/><circle class="series-b" cx="386.1" cy="127.8" r="3"/><circle class="series-b" cx="425.9" cy="147.4" r="3"/><circle class="series-b" cx="465.6" cy="145.4" r="3"/><circle class="series-b" cx="505.4" cy="121.9" r="3"/><circle class="series-b" cx="545.2" cy="114.0" r="3"/><circle class="series-b" cx="584.9" cy="147.4" r="3"/><circle class="series-b" cx="624.7" cy="149.3" r="3"/><circle class="series-b" cx="664.5" cy="125.8" r="3"/><circle class="series-b" cx="704.2" cy="139.5" r="3"/><circle class="series-b" cx="744.0" cy="165.0" r="3"/><text class="xlab" x="68.0" y="238">09</text><text class="xlab x-minor" x="107.8" y="238">10</text><text class="xlab" x="147.5" y="238">11</text><text class="xlab x-minor" x="187.3" y="238">12</text><text class="xlab" x="227.1" y="238">13</text><text class="xlab x-minor" x="266.8" y="238">14</text><text class="xlab" x="306.6" y="238">15</text><text class="xlab x-minor" x="346.4" y="238">16</text><text class="xlab" x="386.1" y="238">17</text><text class="xlab x-minor" x="425.9" y="238">18</text><text class="xlab" x="465.6" y="238">19</text><text class="xlab x-minor" x="505.4" y="238">20</text><text class="xlab" x="545.2" y="238">21</text><text class="xlab x-minor" x="584.9" y="238">22</text><text class="xlab" x="624.7" y="238">23</text><text class="xlab x-minor" x="664.5" y="238">24</text><text class="xlab" x="704.2" y="238">25</text><text class="xlab x-minor" x="744.0" y="238">26</text></svg>
</figure>

<p class="chart-note">Thousands of lines, rounded. The largest net is 2020, at 44,625. 2010's net is 3,185.</p>

<p class="chart-heading chart-open">Code commits by year</p>

<figure class="article-chart chart-line">
<svg viewBox="-48 0 808 248" font-size="14" font-family="system-ui, sans-serif" role="img" aria-label="Code commits by year"><line class="grid" x1="68" y1="214.0" x2="744" y2="214.0"/><text class="ylab" x="58" y="214.0">0</text><line class="grid" x1="68" y1="148.7" x2="744" y2="148.7"/><text class="ylab" x="58" y="148.7">1,000</text><line class="grid" x1="68" y1="83.3" x2="744" y2="83.3"/><text class="ylab" x="58" y="83.3">2,000</text><line class="grid" x1="68" y1="18.0" x2="744" y2="18.0"/><text class="ylab" x="58" y="18.0">3,000</text><polyline class="series-a" points="68.0,209.6 107.8,199.8 147.5,170.1 187.3,151.4 227.1,169.1 266.8,130.8 306.6,146.6 346.4,122.5 386.1,87.8 425.9,106.3 465.6,97.4 505.4,43.7 545.2,45.6 584.9,74.6 624.7,93.6 664.5,83.3 704.2,92.2 744.0,114.3"/><circle class="series-a" cx="68.0" cy="209.6" r="3"/><circle class="series-a" cx="107.8" cy="199.8" r="3"/><circle class="series-a" cx="147.5" cy="170.1" r="3"/><circle class="series-a" cx="187.3" cy="151.4" r="3"/><circle class="series-a" cx="227.1" cy="169.1" r="3"/><circle class="series-a" cx="266.8" cy="130.8" r="3"/><circle class="series-a" cx="306.6" cy="146.6" r="3"/><circle class="series-a" cx="346.4" cy="122.5" r="3"/><circle class="series-a" cx="386.1" cy="87.8" r="3"/><circle class="series-a" cx="425.9" cy="106.3" r="3"/><circle class="series-a" cx="465.6" cy="97.4" r="3"/><circle class="series-a" cx="505.4" cy="43.7" r="3"/><circle class="series-a" cx="545.2" cy="45.6" r="3"/><circle class="series-a" cx="584.9" cy="74.6" r="3"/><circle class="series-a" cx="624.7" cy="93.6" r="3"/><circle class="series-a" cx="664.5" cy="83.3" r="3"/><circle class="series-a" cx="704.2" cy="92.2" r="3"/><circle class="series-a" cx="744.0" cy="114.3" r="3"/><text class="xlab" x="68.0" y="238">09</text><text class="xlab x-minor" x="107.8" y="238">10</text><text class="xlab" x="147.5" y="238">11</text><text class="xlab x-minor" x="187.3" y="238">12</text><text class="xlab" x="227.1" y="238">13</text><text class="xlab x-minor" x="266.8" y="238">14</text><text class="xlab" x="306.6" y="238">15</text><text class="xlab x-minor" x="346.4" y="238">16</text><text class="xlab" x="386.1" y="238">17</text><text class="xlab x-minor" x="425.9" y="238">18</text><text class="xlab" x="465.6" y="238">19</text><text class="xlab x-minor" x="505.4" y="238">20</text><text class="xlab" x="545.2" y="238">21</text><text class="xlab x-minor" x="584.9" y="238">22</text><text class="xlab" x="624.7" y="238">23</text><text class="xlab x-minor" x="664.5" y="238">24</text><text class="xlab" x="704.2" y="238">25</text><text class="xlab x-minor" x="744.0" y="238">26</text></svg>
</figure>

<p class="chart-note">The peak is 2,606 commits in 2020.</p>

<p class="chart-heading chart-open">Distinct people by year</p>

<figure class="article-chart chart-line">
<svg viewBox="-48 0 808 248" font-size="14" font-family="system-ui, sans-serif" role="img" aria-label="Distinct people by year"><line class="grid" x1="68" y1="214.0" x2="744" y2="214.0"/><text class="ylab" x="58" y="214.0">0</text><line class="grid" x1="68" y1="165.0" x2="744" y2="165.0"/><text class="ylab" x="58" y="165.0">40</text><line class="grid" x1="68" y1="116.0" x2="744" y2="116.0"/><text class="ylab" x="58" y="116.0">80</text><line class="grid" x1="68" y1="67.0" x2="744" y2="67.0"/><text class="ylab" x="58" y="67.0">120</text><line class="grid" x1="68" y1="18.0" x2="744" y2="18.0"/><text class="ylab" x="58" y="18.0">160</text><polyline class="series-a" points="68.0,211.6 107.8,205.4 147.5,149.1 187.3,158.9 227.1,140.5 266.8,73.1 306.6,109.9 346.4,86.6 386.1,60.9 425.9,37.6 465.6,56.0 505.4,49.8 545.2,59.7 584.9,62.1 624.7,120.9 664.5,108.7 704.2,78.0 744.0,85.4"/><circle class="series-a" cx="68.0" cy="211.6" r="3"/><circle class="series-a" cx="107.8" cy="205.4" r="3"/><circle class="series-a" cx="147.5" cy="149.1" r="3"/><circle class="series-a" cx="187.3" cy="158.9" r="3"/><circle class="series-a" cx="227.1" cy="140.5" r="3"/><circle class="series-a" cx="266.8" cy="73.1" r="3"/><circle class="series-a" cx="306.6" cy="109.9" r="3"/><circle class="series-a" cx="346.4" cy="86.6" r="3"/><circle class="series-a" cx="386.1" cy="60.9" r="3"/><circle class="series-a" cx="425.9" cy="37.6" r="3"/><circle class="series-a" cx="465.6" cy="56.0" r="3"/><circle class="series-a" cx="505.4" cy="49.8" r="3"/><circle class="series-a" cx="545.2" cy="59.7" r="3"/><circle class="series-a" cx="584.9" cy="62.1" r="3"/><circle class="series-a" cx="624.7" cy="120.9" r="3"/><circle class="series-a" cx="664.5" cy="108.7" r="3"/><circle class="series-a" cx="704.2" cy="78.0" r="3"/><circle class="series-a" cx="744.0" cy="85.4" r="3"/><text class="xlab" x="68.0" y="238">09</text><text class="xlab x-minor" x="107.8" y="238">10</text><text class="xlab" x="147.5" y="238">11</text><text class="xlab x-minor" x="187.3" y="238">12</text><text class="xlab" x="227.1" y="238">13</text><text class="xlab x-minor" x="266.8" y="238">14</text><text class="xlab" x="306.6" y="238">15</text><text class="xlab x-minor" x="346.4" y="238">16</text><text class="xlab" x="386.1" y="238">17</text><text class="xlab x-minor" x="425.9" y="238">18</text><text class="xlab" x="465.6" y="238">19</text><text class="xlab x-minor" x="505.4" y="238">20</text><text class="xlab" x="545.2" y="238">21</text><text class="xlab x-minor" x="584.9" y="238">22</text><text class="xlab" x="624.7" y="238">23</text><text class="xlab x-minor" x="664.5" y="238">24</text><text class="xlab" x="704.2" y="238">25</text><text class="xlab x-minor" x="744.0" y="238">26</text></svg>
</figure>

<p class="chart-note">The peak is 144 people in 2018. 2023 falls to 76.</p>

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
<figcaption>900 people, after dropping two bulk imports, sirius-m and Vinnie Falco. The top five added 39.5%. The top ten added 52.3%. Satoshi's row is the git string <code>s_nakamoto</code>.</figcaption>
</figure>

<figure class="article-chart">
<div class="chart-heading">Lines added and deleted by person, scaled to Pieter Wuille</div>
<p class="chart-key"><span class="key-a">Added</span><span class="key-b">Deleted</span></p>
<div class="pair-row"><span class="intensity-name">Pieter Wuille</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:100.0%"></span></div><span class="pair-num add">+132,987</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:44.8%"></span></div><span class="pair-num del">−59,517</span></div><span class="pair-meta">net +73,470 · 1,703 commits · deletes 45%</span></div></div>
<div class="pair-row"><span class="intensity-name">Wladimir J. van der Laan</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:73.6%"></span></div><span class="pair-num add">+97,885</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:36.0%"></span></div><span class="pair-num del">−47,828</span></div><span class="pair-meta">net +50,057 · 1,337 commits · deletes 49%</span></div></div>
<div class="pair-row"><span class="intensity-name">Marco Falke</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:54.5%"></span></div><span class="pair-num add">+72,530</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:46.2%"></span></div><span class="pair-num del">−61,422</span></div><span class="pair-meta">net +11,108 · 2,879 commits · deletes 85%</span></div></div>
<div class="pair-row"><span class="intensity-name">Ava Chow</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:45.9%"></span></div><span class="pair-num add">+61,034</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:31.1%"></span></div><span class="pair-num del">−41,384</span></div><span class="pair-meta">net +19,650 · 1,274 commits · deletes 68%</span></div></div>
<div class="pair-row"><span class="intensity-name">Satoshi Nakamoto</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:38.1%"></span></div><span class="pair-num add">+50,604</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:34.5%"></span></div><span class="pair-num del">−45,881</span></div><span class="pair-meta">net +4,723 · 237 commits · deletes 91%</span></div></div>
<div class="pair-row"><span class="intensity-name">Gavin Andresen</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:31.7%"></span></div><span class="pair-num add">+42,191</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:27.7%"></span></div><span class="pair-num del">−36,796</span></div><span class="pair-meta">net +5,395 · 393 commits · deletes 87%</span></div></div>
<div class="pair-row"><span class="intensity-name">John Newbery</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:18.7%"></span></div><span class="pair-num add">+24,882</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:19.7%"></span></div><span class="pair-num del">−26,142</span></div><span class="pair-meta">net −1,260 · 749 commits · deletes 105%</span></div></div>
<div class="pair-row"><span class="intensity-name">Suhas Daftuar</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:18.6%"></span></div><span class="pair-num add">+24,723</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:6.5%"></span></div><span class="pair-num del">−8,580</span></div><span class="pair-meta">net +16,143 · 438 commits · deletes 35%</span></div></div>
<div class="pair-row"><span class="intensity-name">Russell Yanofsky</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:17.3%"></span></div><span class="pair-num add">+22,958</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:10.0%"></span></div><span class="pair-num del">−13,286</span></div><span class="pair-meta">net +9,672 · 414 commits · deletes 58%</span></div></div>
<div class="pair-row"><span class="intensity-name">Gloria Zhao</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:14.6%"></span></div><span class="pair-num add">+19,444</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:4.5%"></span></div><span class="pair-num del">−5,951</span></div><span class="pair-meta">net +13,493 · 390 commits · deletes 31%</span></div></div>
<div class="pair-row"><span class="intensity-name">Michael Ford</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:14.3%"></span></div><span class="pair-num add">+19,053</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:13.3%"></span></div><span class="pair-num del">−17,676</span></div><span class="pair-meta">net +1,377 · 601 commits · deletes 93%</span></div></div>
<div class="pair-row"><span class="intensity-name">Ryan Ofsky</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:13.3%"></span></div><span class="pair-num add">+17,697</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:5.0%"></span></div><span class="pair-num del">−6,601</span></div><span class="pair-meta">net +11,096 · 272 commits · deletes 37%</span></div></div>
</figure>

Michael Ford's small net skips build scripts. His merge share is a different ranking, in *[Who Controls Bitcoin](/articles/bitcoin-governance)*.

---

## Where the work went

The 55% figure above counts every filtered code file, including tests. Restricted to implementation files, and split with the same system lists as section III, **672,059** lines were added and **431,312** were deleted. **64.2%** of what was added was later deleted. No system has a majority. Wallet is the largest share of lines added, at **14.9%**. Validation is **14.8%**. The top four, wallet, validation, the GUI, and P2P, are **55.3%**.

<figure class="article-chart">
<div class="chart-heading">Implementation lines added and deleted, scaled to the wallet</div>
<p class="chart-key"><span class="key-a">Added</span><span class="key-b">Deleted</span></p>
<div class="pair-row"><span class="intensity-name">Wallet</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:100.0%"></span></div><span class="pair-num add">+100,177</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:70.9%"></span></div><span class="pair-num del">−71,056</span></div><span class="pair-meta">net +29,121 · 4,074 commits · 14.9%</span></div></div>
<div class="pair-row"><span class="intensity-name">Validation</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:99.4%"></span></div><span class="pair-num add">+99,577</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:67.9%"></span></div><span class="pair-num del">−67,991</span></div><span class="pair-meta">net +31,586 · 4,295 commits · 14.8%</span></div></div>
<div class="pair-row"><span class="intensity-name">GUI</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:91.2%"></span></div><span class="pair-num add">+91,333</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:65.2%"></span></div><span class="pair-num del">−65,302</span></div><span class="pair-meta">net +26,031 · 3,070 commits · 13.6%</span></div></div>
<div class="pair-row"><span class="intensity-name">P2P</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:80.5%"></span></div><span class="pair-num add">+80,675</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:51.0%"></span></div><span class="pair-num del">−51,106</span></div><span class="pair-meta">net +29,569 · 3,382 commits · 12.0%</span></div></div>
<div class="pair-row"><span class="intensity-name">RPC and HTTP</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:63.1%"></span></div><span class="pair-num add">+63,238</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:39.1%"></span></div><span class="pair-num del">−39,140</span></div><span class="pair-meta">net +24,098 · 3,142 commits · 9.4%</span></div></div>
<div class="pair-row"><span class="intensity-name">Support</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:59.4%"></span></div><span class="pair-num add">+59,510</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:33.2%"></span></div><span class="pair-num del">−33,237</span></div><span class="pair-meta">net +26,273 · 2,630 commits · 8.9%</span></div></div>
<div class="pair-row"><span class="intensity-name">Crypto</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:36.0%"></span></div><span class="pair-num add">+36,031</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:20.6%"></span></div><span class="pair-num del">−20,597</span></div><span class="pair-meta">net +15,434 · 969 commits · 5.4%</span></div></div>
<div class="pair-row"><span class="intensity-name">Script</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:34.5%"></span></div><span class="pair-num add">+34,561</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:19.2%"></span></div><span class="pair-num del">−19,247</span></div><span class="pair-meta">net +15,314 · 958 commits · 5.1%</span></div></div>
<div class="pair-row"><span class="intensity-name">Mempool</span><div><div class="pair-line"><div class="pair-track"><span class="pair-fill add" style="width:24.4%"></span></div><span class="pair-num add">+24,463</span></div><div class="pair-line"><div class="pair-track"><span class="pair-fill del" style="width:11.4%"></span></div><span class="pair-num del">−11,426</span></div><span class="pair-meta">net +13,037 · 1,093 commits · 3.6%</span></div></div>
<figcaption>A commit that touches two systems is counted in both commit totals. The lines are a partition.</figcaption>
</figure>

The early years are the GUI. In 2009–2013 the GUI is **28.7%** of implementation lines added. In 2022–2026, through 26 October, validation leads, at **16.2%**. Wallet is the largest tree today because older lines survived.

---

## What changes in the same commit

**61.0%** of wallet commits touch no other implementation system, and **13.7%** of them also touch validation. The tight pair is mempool and validation: **36.7%** of mempool commits also edit validation. RPC is the least separate. It is alone in **45.9%** of its commits, and those commits also touch validation **23.6%** of the time and wallet **23.2%**.

<figure class="article-chart chart-intensity">
<div class="chart-heading">Share of a system's commits that touch no other implementation system</div>
<div class="intensity-row">
<span class="intensity-name">GUI</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div>
<span class="intensity-value">66.8%<span class="pair-meta">3,070 commits · wallet 17.7%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Wallet</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:91.3%"></span></div>
<span class="intensity-value">61.0%<span class="pair-meta">4,074 commits · RPC 17.9%, validation 13.7%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">P2P</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:90.3%"></span></div>
<span class="intensity-value">60.3%<span class="pair-meta">3,382 commits · validation 20.8%, RPC 15.9%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Validation</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:78.6%"></span></div>
<span class="intensity-value">52.5%<span class="pair-meta">4,295 commits · RPC 17.3%, P2P 16.4%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Support</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:74.1%"></span></div>
<span class="intensity-value">49.5%<span class="pair-meta">2,630 commits · validation 23.8%, P2P 20.1%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Crypto</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:73.5%"></span></div>
<span class="intensity-value">49.1%<span class="pair-meta">969 commits · support 26.7%, validation 26.6%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Script</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:71.9%"></span></div>
<span class="intensity-value">48.0%<span class="pair-meta">958 commits · wallet 29.4%, validation 25.9%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">RPC</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:68.7%"></span></div>
<span class="intensity-value">45.9%<span class="pair-meta">3,142 commits · validation 23.6%, wallet 23.2%</span></span>
</div>
</div>
<div class="intensity-row">
<span class="intensity-name">Mempool</span>
<div class="intensity-wrap">
<div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:68.1%"></span></div>
<span class="intensity-value">45.5%<span class="pair-meta">1,093 commits · validation 36.7%, RPC 20.9%</span></span>
</div>
</div>
</figure>

In the last three years the GUI fell to 47% alone. Wallet stayed near 68%, and validation near 62%.

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
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">Largest share of the lines that remain, scaled to the rules</div>
<div class="intensity-row"><span class="intensity-name">Rules, Pieter Wuille</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100.0%"></span></div><span class="intensity-value">44.2% · 2017</span></div></div>
<div class="intensity-row"><span class="intensity-name">Adjacent, Pieter Wuille</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:54.5%"></span></div><span class="intensity-value">24.1% · 2023</span></div></div>
<div class="intensity-row"><span class="intensity-name">The rest, Ava Chow</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:25.8%"></span></div><span class="intensity-value">11.4% · 2021</span></div></div>
</figure>

Pieter Wuille last touched 13.9% of all 187,516 non-blank implementation lines, against 44.2% of the rules. Satoshi's author string leads a large share of historical additions and is absent from the lines that remain. Who would make the next change is the next section.

---

## Who still edits a system

Over the three years ending 26 October 2026, validation's 798 commits come from 66 people, and seven of them cover half. Lőrinc is 15%. Marco Falke is 10%. TheCharlatan, including commits signed sedited, is 9%. Mempool is the concentrated system: Pieter Wuille is 36% and Suhas Daftuar is 12%, just under half together, and three people cover half. Wallet takes three people to reach half. Ava Chow, including commits signed Andrew Chow, is 31% of them.

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
</figure>

<figure class="article-chart chart-intensity">
<div class="chart-heading">People editing each system, last three years, scaled to RPC</div>
<div class="intensity-row"><span class="intensity-name">RPC</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100.0%"></span></div><span class="intensity-value">73<span class="pair-meta">7 to half · top three 33% · 562 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Validation</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:90.4%"></span></div><span class="intensity-value">66<span class="pair-meta">7 to half · top three 34% · 798 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Wallet</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:86.3%"></span></div><span class="intensity-value">63<span class="pair-meta">3 to half · top three 52% · 665 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">P2P</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:79.5%"></span></div><span class="intensity-value">58<span class="pair-meta">7 to half · top three 37% · 549 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Support</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:79.5%"></span></div><span class="intensity-value">58<span class="pair-meta">5 to half · top three 43% · 539 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Mempool</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:54.8%"></span></div><span class="intensity-value">40<span class="pair-meta">3 to half · top three 58% · 401 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">GUI</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:46.6%"></span></div><span class="intensity-value">34<span class="pair-meta">3 to half · top three 52% · 197 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Script</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:46.6%"></span></div><span class="intensity-value">34<span class="pair-meta">3 to half · top three 52% · 174 commits</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Crypto</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:43.8%"></span></div><span class="intensity-value">32<span class="pair-meta">5 to half · top three 39% · 178 commits</span></span></div></div>
</figure>

The rule files are their own count. In the same three years, **169** commits touch them, from **31** people, and **five** cover half. Marco Falke is 18%. Anthony Towns and Lőrinc are the next two, and the three together hold 42%. Pieter Wuille's 44.2% is the text that remains, and the median of those lines is 2017. These recent commits are a different list. The 562 check lines inside `validation.cpp` are left out of this count. That file is mostly chainstate and mempool.

<figure class="article-chart chart-intensity">
<div class="chart-heading">People to cover half the commits, last three years, scaled to validation</div>
<div class="intensity-row"><span class="intensity-name">Validation</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:100%"></span></div><span class="intensity-value">7<span class="pair-meta">66 people · Lőrinc 15%</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Rule files</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill" style="width:71.4%"></span></div><span class="intensity-value">5<span class="pair-meta">31 people · Marco Falke 18%</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Mempool</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:42.9%"></span></div><span class="intensity-value">3<span class="pair-meta">40 people · Pieter Wuille 36%</span></span></div></div>
<div class="intensity-row"><span class="intensity-name">Wallet</span><div class="intensity-wrap"><div class="intensity-track" aria-hidden="true"><span class="intensity-fill intensity-alt" style="width:42.9%"></span></div><span class="intensity-value">3<span class="pair-meta">63 people · Ava Chow 31%</span></span></div></div>
</figure>

Two git names that share an email are one person. RPC has the most people, 73. The GUI is the quiet tree, 197 commits.

---

## The size of the contract

At this release the tree exposes **171** RPC methods, **36** P2P message types, and **5** named deployment slots. Named slots went 1, 5, 6, then 5. Taproot left the named list. The rule is still in the interpreter.

<p class="chart-heading chart-open">RPC methods and P2P message types, end of each era</p>
<p class="chart-key"><span class="key-a">RPC methods</span><span class="key-b">P2P messages</span></p>

<figure class="article-chart chart-line">
<svg viewBox="-48 0 808 248" font-size="14" font-family="system-ui, sans-serif" role="img" aria-label="RPC methods and P2P message types at the end of each era"><line class="grid" x1="68" y1="214.0" x2="744" y2="214.0"/><text class="ylab" x="58" y="214.0">0</text><line class="grid" x1="68" y1="165.0" x2="744" y2="165.0"/><text class="ylab" x="58" y="165.0">50</text><line class="grid" x1="68" y1="116.0" x2="744" y2="116.0"/><text class="ylab" x="58" y="116.0">100</text><line class="grid" x1="68" y1="67.0" x2="744" y2="67.0"/><text class="ylab" x="58" y="67.0">150</text><line class="grid" x1="68" y1="18.0" x2="744" y2="18.0"/><text class="ylab" x="58" y="18.0">200</text><polyline class="series-a" points="68.0,143.4 293.3,97.4 518.7,61.1 744.0,46.4"/><circle class="series-a" cx="68.0" cy="143.4" r="3"/><circle class="series-a" cx="293.3" cy="97.4" r="3"/><circle class="series-a" cx="518.7" cy="61.1" r="3"/><circle class="series-a" cx="744.0" cy="46.4" r="3"/><polyline class="series-b" points="68.0,193.4 293.3,188.5 518.7,180.7 744.0,178.7"/><circle class="series-b" cx="68.0" cy="193.4" r="3"/><circle class="series-b" cx="293.3" cy="188.5" r="3"/><circle class="series-b" cx="518.7" cy="180.7" r="3"/><circle class="series-b" cx="744.0" cy="178.7" r="3"/><text class="xlab" x="68.0" y="238">2013</text><text class="xlab" x="293.3" y="238">2017</text><text class="xlab" x="518.7" y="238">2021</text><text class="xlab" x="744.0" y="238">2026</text></svg>
</figure>

---

## X. Patch debt

The January 2026 debt study scores a file from how often it is edited in small diffs and how long it has gone without a large rewrite. This is the same formula, rerun on **17,072** merged pull requests through 12 October 2026. It is a churn score. It is not a bug count.

Counting every path that history ever touched, including files that are gone, **28.2%** score above 50 and the patch-to-refactor ratio is **3.0**. RPC is 63% of that wider count.

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
</figure>

---

## XI. What the count is for

The rules that have to be specified, audited, and matched by any other implementation are 10,122 code lines, plus a signature library that is larger than they are. The program operators download is the other 93% of the implementation, the tests, and the bundled trees. Treating a release as "the consensus rules" collapses those piles.

*[Don't Trust, Verify](/articles/dont-trust-verify#vi-the-same-system-applied-to-bitcoin-core)* is about that collapse at the review layer. The first independent audit of Bitcoin Core, Quarkslab in September 2025, scoped P2P, mempool, block validation, and chain state. Those are mostly the adjacent lines in section V, plus some of the checks. The interpreter, the hash implementations, and the type of the transaction are the rest of the 10,122, and secp256k1 is another 76,503.

*[Who Controls Bitcoin](/articles/bitcoin-governance)* measures who merges. This article measures who wrote lines and who last touched the lines that remain. The rankings differ. Merge concentration answers who can land a change. The blame in section IX answers whose text is still in the rule files. Both can be true, and neither is a substitute for the other. The later sections answer three further questions. Wallet commits also touch validation 13.7% of the time. Over the last three years, the rule files' 169 commits come from 31 people, and five cover half. Validation's wider tree comes from 66. A release exposes 171 RPC methods, 36 P2P message types, and 5 deployment slots.

*[Bitcoin Core: The Biggest Fallacies](/articles/bitcoin-core-the-biggest-fallacies)* argues the client is a monolith because the wallet, the network, and the rules ship together. The line count is the size of that claim. Seven percent is the rules. Eighty percent is the rest of the same binary.

*[What Bitcoin's Stalled Proposals Tell You](/articles/what-bitcoins-stalled-proposals-tell-you)* uses the authorship Gini from the governance research. That Gini is on pull-request authorship. The added-line shares in section VIII are a third cut. Top-five line additions at 39.5% and a historical authorship Gini near 0.85 are the same shape at two resolutions. They are not the same number.

The cost of storing the chain this program validates is a separate account, in *[Full Cost of Running a Bitcoin Node](/articles/full-cost-of-running-a-bitcoin-node)*.

---

## XII. Method

**Snapshot.** Bitcoin Core **32.1**, branch `32.x`, commit `f0de87f040621468b956f01f526a43a010310501`, 26 October 2026, "Merge bitcoin/bitcoin#36658: [32.x] Finalise 32.1". The tag matches the branch tip. Not shallow. 50,657 commits, 16,987 of them merges. Line counts are this release. Authorship is history through this commit.

**Code lines.** tokei 14.0.0. A file is in one bucket. Implementation is `src/` excluding vendored prefixes (`secp256k1`, `leveldb`, `crc32c`, `minisketch`, `univalue`, `libmultiprocess`, `ctaes`), Qt locale, tests, fuzz, bench, markdown, and `CMakeLists.txt`. The system split uses explicit file lists for `src/node`, because that directory is not all P2P. `src/node/mining_args.cpp`, `mining_args.h`, and `mining_types.h` are in mining templates.

**Forks.** leveldb in this release is `13da2d67` (11 August 2026). The shared ancestor with Google is `0c40829` (5 November 2019). The Google tip in the comparison is `bb74ef73` (8 October 2026). crc32c is `efb8ea04` (30 August 2024), ancestor `21fc8ef` (8 February 2022), Google tip `2bbb3be` (7 April 2025). The bars are git numstat and include comments and blanks.

**The three-way cut.** Rule files are the SHA-256 and RIPEMD-160 sources, `hash.cpp` and `hash.h`, the script interpreter and script data, `pubkey`, `arith_uint256`, `uint256`, `src/primitives`, `src/consensus`, proof of work, versionbits, deployments, and signet. `validation.cpp` is split by function start, comment-stripped, then scaled from 4,187 raw code-like lines to tokei's 4,247. Adjacent is chainstate and storage, policy and mempool, indexes, and mining templates, including the matching parts of `validation.cpp`. SHA-1, SHA-3, and SHA-512 stay in the rest. The three parts sum to 151,004.

**Tests.** The named rule unit and fuzz files are the earlier filename list (4,517) plus integer, hash, script, and block tests that name a rule type (1,403). Functional rule tests are an explicit basename list: `feature_block`, `feature_taproot`, `feature_segwit`, `feature_cltv`, `feature_csv_activation`, `feature_dersig`, `feature_nulldummy`, `feature_bip68_sequence`, `feature_signet`, `feature_versionbits_warning`, `p2p_segwit`, `p2p_invalid_block`, `p2p_invalid_tx`, `p2p_mutated_blocks`. Adjacent adds an explicit list of mining, assumeutxo, pruning, index, fee, package, and chainstate tests to the mempool and policy filename prefix. A test outside those lists stays in the rest. That undercounts a functional test that exercises the interpreter under another name.

**History.** `git log HEAD --no-merges --numstat`. Renames of the form `{old => new}` are rewritten to the new path. Identity merges every pair of git names that share an email, and one name that used two addresses, plus the published aliases: Wladimir's three spellings, Ava Chow and Andrew Chow, Marco Falke and MarcoFalke, Gloria Zhao and glozow, Michael Ford and fanquake, jtimon and Jorge Timón. The tables use the release-note names. Satoshi Nakamoto's row is the <code>s_nakamoto</code> string. People who share only a first name stay separate. Ryan Ofsky and Russell Yanofsky are different people.

**Systems over time.** The same numstat history, implementation paths only, classified with the section III file lists, including the explicit `src/node` split. A path is classified by the name it had in that commit. Vendored trees and tests are out. A commit that touches two systems counts in both commit totals. "Only this system" means the commit touched no other classified implementation system. The three-year window is author dates from 26 October 2023 through this release. The people column merges git names that share an email, and the same published aliases as the history.

**Rule-file editors.** The same window and the same person merge. A commit counts once when it touches a file in the section IV rule list: the SHA-256 and RIPEMD-160 sources, `hash.cpp` and `hash.h`, the script interpreter and script data, `pubkey`, `arith_uint256`, `uint256`, `src/primitives`, `src/consensus`, proof of work, versionbits, deployments, and signet. `validation.cpp` is left out. Its 562 check lines share the file with chainstate and mempool.

**The contract.** RPC names are the command table when that table carries the method name (2013 and 2017) and `RPCHelpMan` / `RPCMethod` constructors when it does not (2021 and this release). Hidden methods are included. P2P names in 2013 are the message strings the network dispatcher in `src/main.cpp`, `src/net.cpp`, and `src/alert.cpp` receives or sends. From 2017 on they are the `NetMsgType` strings. Deployment slots are `DEPLOYMENT_*` enumerators other than testdummy, plus the block-version-2 height rule, with height-field aliases of the same fork collapsed to one name. Era tips are the last commit on this history at the end of 2013 (`aec55a07`), 2017 (`c9439e73`), 2021 (`1831d43e`), and this release.

**Blame.** `git blame -w --line-porcelain` on each implementation file. Whitespace-only changes do not move the line. Blank lines are dropped. The same alias list as the history.

**Debt.** `scripts/analysis/code_turnover_analysis.py` in the Bitcoin Governance Research repository, run on `data/github/prs_raw.jsonl` (25,506 pull requests, 17,072 merged with a date, last merge 12 October 2026). The score weights patch frequency, time since a large rewrite, age of files the script labels consensus, and modifications per estimated line. Change type is a size heuristic: a refactor is a change over 30% of the estimated file or over 200 lines. The script's subsystem labels are filename patterns. They are not the three-way cut in section IV. Living-file membership is the 32.1 tree.

---

## Sources

- Bitcoin Core 32.1, commit [`f0de87f040621468b956f01f526a43a010310501`](https://github.com/bitcoin/bitcoin/commit/f0de87f040621468b956f01f526a43a010310501), branch `32.x`, 26 October 2026
- [tokei](https://github.com/XAMPPRocky/tokei) 14.0.0, file-level report on that tree
- [Bitcoin Governance Research, technical debt analysis](https://github.com/secsovereign/bitcoin-governance-research/blob/master/findings/TECHNICAL_DEBT_ANALYSIS.md), formula rerun 30 October 2026 on the pull-request dump through 12 October 2026
- *[Who Controls Bitcoin](/articles/bitcoin-governance)*, *[The Vertical Layer Problem](/articles/the-vertical-layer-problem)*, *[Why Bitcoin Needs a Specification That Humans Can Read](/articles/why-bitcoin-needs-a-specification)*, *[Don't Trust, Verify](/articles/dont-trust-verify)*, *[Bitcoin Core: The Biggest Fallacies](/articles/bitcoin-core-the-biggest-fallacies)*, *[What Bitcoin's Stalled Proposals Tell You](/articles/what-bitcoins-stalled-proposals-tell-you)*, *[Full Cost of Running a Bitcoin Node](/articles/full-cost-of-running-a-bitcoin-node)*
