# The Achievable Floor: What Consensus Can and Cannot Close on Arbitrary Data

## Contents

- [I. Framing the Problem](#i-framing-the-problem)
- [II. Taxonomy of Channels by Cost](#ii-taxonomy-of-channels-by-cost)
- [III. What Consensus Can Actually Close](#iii-what-consensus-can-actually-close)
- [IV. Why the Free Channels Resist Closure](#iv-why-the-free-channels-resist-closure)
- [V. Custody of Data That Already Exists](#v-custody-of-data-that-already-exists)
- [VI. The Actual Floor](#vi-the-actual-floor)
- [VII. Implementation Path](#vii-implementation-path)
- [VIII. Conclusion](#viii-conclusion)

---

## I. Framing the Problem

Bitcoin spam debate blurs **two layers.** Consensus forces every validating node to accept whatever is in a valid block, monkey jpegs included. **Relay and storage are policy.** No node must relay a transaction before confirmation, and no node must keep storing everything after validation. Pruning exists because storage is optional.

Pruning costs self-sovereignty. A pruned node cannot re-verify the full chain from its own copy without asking another node. Pruning also does not remove initial sync cost. Every pruned node still downloads and validates the full chain history, including non-monetary data, during initial block download. The spam passes through every new node at first sync whether that node keeps the data afterward. Bandwidth and validation time at sync are permanent costs on every participant who joins. **Pruning shifts when storage is paid. It does not eliminate the download.**

**Refusing to relay is not banning.** A transaction that pays enough fee reaches the chain through some miner or permissive node, whatever one operator's mempool policy says. Policy limits on `OP_RETURN` and similar fields can be raised, lowered, or dropped by whoever runs the defaults. **Consensus caps bind every participant or fail to activate.**

The fight is usually about consensus capture, forking risk, and who decides which use cases are legitimate. For OP_RETURN and data-embedding politics, see *[Who Controls Bitcoin, §V](/articles/bitcoin-governance#v-the-adversarial-layer-when-conflicts-become-visible)* and *[Argument Map, Parts VI–VII and XXII](/articles/bitcoin-governance-argument-map#part-vi-forced-participation)*.

Set politics aside. If consensus could change freely, how low can arbitrary data be pushed, and where is the hard limit?

Spam has a workable definition. A spam transaction has no monetary settlement function and pushes costs permanently onto every validating node with no recovery path. Lightning channel opens and closes have settlement functions. Timelocked outputs and multisig setups have settlement functions. A JPEG in a Taproot envelope does not. That follows from how Bitcoin works: every validating node must process the full chain history to know current balances. Using the payment layer as a cheap bulk data store pushes costs onto a network built for transfers, not file hosting. For the full case against non-monetary embedding, see *[Bitcoin Is Not a Hard Drive](/articles/bitcoin-not-a-hard-drive)*. Demands for an impossible alternative definition are rhetorical, not technical. **The definition was always available.**

## II. Taxonomy of Channels by Cost

Data reaches the chain through channels that vary widely in cost. Fee per vbyte is only part of it. Operators can also filter or refuse to relay transactions that use a given path, which is a business risk separate from fee math. Rollups posting data availability to the base layer are the current example.

The ladder below is technical cost only.

<figure class="article-chart chart-flowchart" role="img" aria-label="Channel cost ladder from free to dedicated embedding channels">
<div class="flowchart-ladder" aria-hidden="true">
  <span class="flow-node">Free</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">Near-free</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">Expensive</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">Unenforced</span>
  <span class="flow-arrow" aria-hidden="true">→</span>
  <span class="flow-node">Dedicated</span>
</div>
</figure>

*Figure: Channel cost ladder. Consensus can close the top tiers without touching monetary fields.*

**Free channels** cost nothing beyond the transaction fee.

The main one is any field that stores a hash of a key or script rather than revealing the key or script itself, such as P2PKH or P2WPKH destinations, HTLC hash locks, and P2SH or P2WSH script hashes. A fake 20 or 32 byte string looks the same as a real hash. Pay-to-Fake-Key and Pay-to-Fake-Multisig predate `OP_RETURN`. The 2010 WikiLeaks Cablegate dump used this method.

Inviscription splits encrypted data across hash-locked outputs, multisig key slots, or timelock fields. The decryption key may appear in a later transaction or never on-chain.

Output amounts are free too. Consensus cannot tell whether a chosen value encodes data or is just a payment. Attackers can embed data in the satoshi values of outputs, not only in scripts or witness data.

Structural fields add more. `nSequence` and `nLockTime` can each carry a few bytes of arbitrary data. Input and output order is unconstrained. Consensus could force fixed values for all of these, but that would break how ordinary wallets build transactions. **You would harm normal payments without stopping spam**, the same problem as trying to ban flexible output amounts.

**Near-free channels** cost a bounded number of trial attempts.

Taproot's 32 byte x-only pubkey field is the standard example. Roughly half of all 32 byte strings are valid public-key coordinates on Bitcoin's curve. A chosen payload embedded as a fake pubkey takes about two random tries on average.

The same property applies across ordinary address fields. Published blockchain measurements put achievable scale in the hundreds of kilobytes.

**Expensive channels** require brute-force search. The attacker keeps trying random keys or signatures until one matches a desired bit pattern. Cost grows exponentially with how many bits they want to fix. Vanity addresses use the same trick, pointed at arbitrary targets.

**Unenforced channels** have no content validation today.

Undefined witness versions and OP_SUCCESS opcodes are upgrade hooks. Consensus treats anything after an OP_SUCCESS byte in Tapscript as valid regardless of content. The Taproot annex is extra witness data excluded from the signature that authorizes the spend, with no constraint on its contents. Data there need not look like a hash or pubkey.

**Dedicated channels** carry no monetary function, or hold large uninterpreted script data.

OP_RETURN is an output with no spending condition. Core v30 relay policy allows up to 100,000 bytes of aggregate `OP_RETURN` `scriptPubKey` per transaction, with multiple outputs, while consensus places no byte cap. In June 2023, PR #27832 narrowed the documented scope of `-datacarriersize` from all data carrier transactions to `scriptPubKey` outputs only, leaving witness and script-path inscription fields outside the setting's documented scope before Core v30 removed the relay cap in 2025. The Taproot envelope pushes data inside an `OP_FALSE OP_IF` branch that never executes. SegWit's witness discount and Taproot's removal of the 10,000 byte tapscript ceiling made large envelope payloads practical.

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Channel</th><th>Embedding cost</th><th>Closable at consensus?</th><th>Cost to close</th></tr>
</thead>
<tbody>
<tr class="close-yes"><td>Dedicated</td><td>Fee-paid, large payloads</td><td>Yes</td><td>None for monetary function</td></tr>
<tr class="close-yes"><td>Unenforced</td><td>Low; no validation yet</td><td>Yes</td><td>Narrow upgrade hooks</td></tr>
<tr class="close-partial"><td>Expensive</td><td>Exponential with chosen bits</td><td>No</td><td>Cost is the only limit</td></tr>
<tr class="close-partial"><td>Near-free</td><td>~2 trial attempts</td><td>Partial</td><td>Filters are ineffective</td></tr>
<tr class="close-no"><td>Free</td><td>None beyond tx fee</td><td>No</td><td>Sacrifices privacy, precision, or auditability</td></tr>
</tbody>
</table>
<figcaption>Closability by channel type</figcaption>
</figure>

## III. What Consensus Can Actually Close

Closable and unclosable channels are not the same problem. `OP_RETURN` embedding and Taproot envelope embedding are closable at consensus. Out-of-band submission to mining pools, private peering between miners, and direct transaction injection are not closable at consensus without redesigning mining architecture. The honest claim after closing closable channels is that some spam may still reach blocks through paths consensus cannot shut. **That is not an argument against closing the channels consensus can shut.** It is a mistake to treat those as the same objection.

Dedicated and unenforced channels can close at consensus. Neither carries monetary function Bitcoin needs.

A consensus hard cap on OP_RETURN closes bulk dedicated-data outputs and binds every participant. Policy limits bind only operators who choose to run them.

Cap data in non-executing script branches, including the `OP_FALSE OP_IF` envelope, without touching legitimate large witness use. Multisig, Lightning, and covenant (future spending-rule) scripts do not hide logic in branches that never run.

Restrict witness versions, disallow or cap the annex, cap control block size.

A dynamic minimum output value tied to fee rate raises the cost of creating many small outputs when the bytes inside each output are nearly free to fill with data.

Higher baseline fees make every measure bite harder.

The rows below close dedicated and unenforced embedding channels. **Two optional measures in §V address data already on chain:** selective sync (less history to replay when a node first joins) and UTXO set commitments (less set state to store afterward). They are independent of each other and of the caps here.

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Consensus measure</th><th>Channel closed</th><th>Independent soft fork?</th></tr>
</thead>
<tbody>
<tr class="close-yes"><td>OP_RETURN hard byte cap</td><td>Dedicated (OP_RETURN outputs)</td><td>Yes</td></tr>
<tr class="close-yes"><td>Taproot envelope push cap</td><td>Dedicated (OP_FALSE OP_IF branches)</td><td>Yes</td></tr>
<tr class="close-yes"><td>Witness version restriction</td><td>Unenforced (OP_SUCCESS hooks)</td><td>Yes</td></tr>
<tr class="close-yes"><td>Annex disallow or cap</td><td>Unenforced (Taproot annex)</td><td>Yes</td></tr>
<tr class="close-yes"><td>Control block size cap</td><td>Unenforced (deep Merkle path hiding)</td><td>Yes</td></tr>
<tr class="close-yes"><td>Dynamic minimum output value</td><td>Low-value UTXO spam (output count)</td><td>Yes</td></tr>
<tr class="close-partial"><td>UTXO set commitments</td><td>Permanent storage burden for data already on chain (§V)</td><td>Parallel; not required for §III caps</td></tr>
<tr class="close-partial"><td>Selective sync</td><td>Initial block download cost (§V)</td><td>Independent; not required for §III caps or commitments</td></tr>
</tbody>
</table>
<figcaption>Closable measures. §IV fields omitted because monetary design requires them.</figcaption>
</figure>

<figure class="article-chart chart-flowchart" role="img" aria-label="Consensus-closable channels versus the irreducible embedding floor">
<div class="flowchart-layers" aria-hidden="true">
  <div class="flowchart-row">
    <span class="flow-node">Closable at consensus</span>
    <span class="flow-arrow" aria-hidden="true">→</span>
    <span class="flow-node">Higher cost</span>
  </div>
  <p class="flow-link">fee market</p>
  <div class="flowchart-row">
    <span class="flow-node">Structural fields</span>
    <span class="flow-arrow" aria-hidden="true">→</span>
    <span class="flow-node">Brute-force limit</span>
  </div>
</div>
</figure>

*Figure: §III closes OP_RETURN, envelope, annex, control block, and min-output channels. §IV fields cannot.*

## IV. Why the Free Channels Resist Closure

You cannot close free or near-free channels without breaking payments or barely raising cost.

**Checking whether a fake pubkey is a valid curve point** fails for the same reason. With near-free channels, an attacker can keep trying random values until almost any payload passes the check, so the filter blocks almost nothing.

**Requiring the real pubkey, or a zero-knowledge proof of one, at output creation** closes hash-based channels but ends hash-then-reveal privacy for every user. P2PKH and P2WPKH withhold the pubkey until spend time so funds stay safe if the cryptography behind the address is ever broken. **That protects all users; giving it up to chase spam would be a bad trade.**

The zero-knowledge variant keeps privacy but still fails. An attacker can brute-force a real keypair until its hash encodes a payload, and every payment would need extra zero-knowledge verification overhead.

**The amount channel** costs the attacker nothing. Sequence numbers, locktimes, and input or output ordering work the same way.

Rounding all amounts to coarser units removes some low bits, not the channel. The attacker still picks which multiple to use. Across 21 million bitcoin, coarsening still leaves tens of bits per output at the cost of payment precision for every user.

Fixing input order or mandating single sequence and locktime values run into the same limit. There is no single correct value, only a range. One mandated choice breaks ordinary wallet use.

**Encrypted amount schemes**, as in Liquid and Mimblewimble, hide amounts on chain but remove the ability for anyone to audit total supply.

Inscriptions, BRC-20, and Rune issuance pay fees and look like ordinary payments at consensus. Users will pay to keep using them. Politics gets harder; the channels stay open.

Bitcoin was built for payments, not token registries, inscriptions, or bulk data availability. The free fields exist because payments need them.

## V. Custody of Data That Already Exists

Sections I–IV are about new data reaching the chain. **Two separate problems remain for data already stored:** how much history a new node must download at first sync, and how much UTXO state every node must keep afterward.

### Selective sync (initial block download)

Today, a full node replays the entire chain from genesis: every block, every transaction, every witness, including years of non-monetary data. **Selective sync** means a node can become usable faster by starting from a recent checkpoint or loaded UTXO snapshot, validating forward from there, and optionally verifying older history in the background.

Bitcoin Core's AssumeUTXO path is one example: load a snapshot file, trust a hash baked into the release (or your own verified snapshot), then catch up to the tip. Other designs start from headers and proof of work at a chosen height without requiring a UTXO commitment scheme. **Selective sync does not require UTXO commitments.** It addresses bandwidth and validation time at join, not whether embedding fields stay open for new transactions.

### UTXO set commitments (ongoing storage)

Fake hash outputs stay in the UTXO set until spent. Without the preimage, no one knows whether an output will ever move. Inscription outputs already dominate UTXO count with almost no monetary value.

UTXO set commitments let a node hold a root hash and verify spends through inclusion proofs the spender supplies. Every node no longer carries the full set locally; spenders supply what is needed to prove ownership. Utreexo is one design. A consensus-committed root in the block header removes dependence on bridge nodes.

Some production designs ask peers to agree on the root rather than committing it in consensus rules. That requires trusting that most peers report the same value. **This is a storage and proof model, not the same thing as selective sync**, though a node could use both.

## VI. The Actual Floor

OP_RETURN, the Taproot envelope, undefined witness versions, and the annex can close at consensus. Payments do not need them.

Dedicated and witness-discounted (cheaper per byte) channels drove bandwidth. What remains is built into payment design: hash fields, amounts, sequence, locktime, and ordering. Close those and you lose hash-then-reveal privacy, satoshi precision, or supply auditability. **UTXO commitments can reduce how much old state each node stores; selective sync can reduce how much history a new node must replay. Neither removes the embedding floor in §IV.**

Some embedding capacity is built into payment fields on purpose. **Those fields exist for security and privacy, not as spare storage.**

The blockspace impact is measured, not guessed. A full chain scan across 912,723 blocks and roughly 1.235 billion transactions finds spam's share of blockspace intensified about 17-fold relative to its pre-inscription baseline. Non-monetary data accounts for an estimated 12 to 19% of total chain storage; 29.6% of all UTXOs are inscription-related, holding about 415 BTC in total value per Mempool Research. Blocks ran between 91 and 97% full across multiple weeks in 2026. After Core v30 removed the relay cap on `OP_RETURN`, [Renaud Cuny's December 2025 analysis](https://blockspaceweekly.substack.com/p/issue-3-three-years-of-spam) found large OP_RETURN activity activating immediately while inscription witness data continued at scale, roughly 36% of blockspace non-financial as of December 2025. The policy change opened a new channel without closing the old one. The negligible-impact claim requires ignoring documented methodology and published measurements. For the governance timeline behind removing the relay cap, see *[Who Controls Bitcoin, §V](/articles/bitcoin-governance#v-the-adversarial-layer-when-conflicts-become-visible)*.

### Cost per embedded byte

Structural arithmetic on §II channel sizes, BIP141 accounting, and Core v30 relay defaults. Not chain measurements.

**Payload density.** Core v30 defaults `-datacarriersize` to **100,000 bytes** of aggregate `OP_RETURN` `scriptPubKey` per transaction. Consensus imposes no byte cap. Both dedicated rows use **1,024 bytes** of payload. The per-transaction vsize limit binds before the datacarrier limit. The hash row uses 20 bytes per fake P2WPKH output; the near-free row uses 32 bytes per fake P2TR pubkey (§II).

**Witness discount (BIP141).** Witness bytes count one weight unit; non-witness four. Envelope payload sits in witness. Hash and pubkey payloads in `scriptPubKey` are non-witness and cost four times the vbyte rate per embedded byte.

**Marginal vbytes.** An `OP_RETURN` with a 1,024-byte push is 1,039 vbytes (8-byte value, 3-byte varint, 1,028-byte script). P2WPKH with a 20-byte fake hash is 31 vbytes. P2TR with a 32-byte fake pubkey is 43 vbytes. Envelope at 1,024 witness payload bytes is 43 vbytes of output plus 256 vbytes of witness (wrapper and spend overhead omitted; full minimal spend ≈377 vbytes).

**§III floor.** Dust defaults at 3 sat/vbyte (`DUST_RELAY_TX_FEE = 3000` sat/kvB) are 294 sat for P2WPKH-shaped outputs and 330 sat for P2TR-shaped. `OP_RETURN` outputs are zero-value and omitted. Dedicated rows show fee cost only; hash and pubkey rows add the dust floor because embedding mints spendable-looking outputs.

<figure class="article-chart">
<table class="chart-matrix">
<thead>
<tr><th>Channel</th><th>Payload bytes (spec)</th><th>vbytes / embedded byte</th><th>sats / byte @ 10 sat/vB</th><th>@ 50 sat/vB</th><th>@ 100 sat/vB</th></tr>
</thead>
<tbody>
<tr><td>OP_RETURN (dedicated)</td><td>1,024</td><td>1.01</td><td>10.1</td><td>50.7</td><td>101.5</td></tr>
<tr><td>Taproot envelope (dedicated)</td><td>1,024</td><td>0.29</td><td>2.9</td><td>14.6</td><td>29.2</td></tr>
<tr class="close-partial"><td>P2WPKH fake hash (free, §III floor)</td><td>20</td><td>1.55</td><td>30.2</td><td>92.2</td><td>169.7</td></tr>
<tr class="close-partial"><td>P2TR fake pubkey (near-free, §III floor)</td><td>32</td><td>1.34</td><td>23.8</td><td>77.5</td><td>144.7</td></tr>
</tbody>
</table>
<figcaption>BIP141 accounting, Core v30 `-datacarriersize` (100k), dust at 3 sat/vB. Fee columns: (vbytes × rate + dust where applicable) ÷ payload bytes.</figcaption>
</figure>

Closing dedicated channels does not make embedding cheaper. It removes witness-discounted envelopes and bulk `OP_RETURN`, and forces data into hash and pubkey outputs with a dust floor on each. At every fee rate in the table, hash and pubkey rows cost more per byte than `OP_RETURN` at 1,024 bytes.

Policy and fees still matter. Consensus can close high-bandwidth channels and lift per-node storage load. Zero arbitrary data means stripping payment properties Bitcoin needs. The realistic goal is to keep non-monetary use costly and unwelcome.

## VII. Implementation Path

The OP_RETURN cap and envelope push cap are straightforward. They subtract from valid transaction shapes. Witness version, annex, and control block caps need language for reopening a version or redefining a placeholder later. The dynamic minimum output value needs a fee-rate reference and update cadence; static dust thresholds already run as policy on several implementations.

Consensus caps on dedicated embedding channels do not close every cheap field on the input side. Inputs still carry low-cost fields such as `nSequence`, `nLockTime`, and ordering. A dynamic minimum output value, recomputed on a fee-rate schedule, closes those paths indirectly: inputs spend outputs created earlier. If new outputs carry a minting cost at consensus, encoding through input-side fields requires spending outputs that were not free to create. The floor does not ban input fields directly. It removes the incentive to mint cheap outputs and then reuse them as encoders. Dedicated-channel caps and a dynamic output floor are complementary, not competing proposals.

**Selective sync and UTXO commitments are separate optional layers.** Each §III embedding cap can soft-fork on its own. Selective sync improves how fast a new node can join; UTXO commitments change how much set state a node must retain. Neither is a prerequisite for the other. Grandfather outputs that would fail a new rule.

Policy tools (mempool heuristics, envelope detection, pool multipliers) stay useful and non-binding. Enough fee still reaches a miner that does not enforce them. **Only consensus binds everyone.**

## VIII. Conclusion

Even if consensus could change without a political fight, **arbitrary data cannot reach zero.** Payments still need hash addresses, flexible amounts, and auditable supply.

Off-chain data and Taproot script branches that were never published are out of scope.

The §III caps belong in a formal spec. The [Bitcoin Commons consensus spec](https://thebitcoincommons.org/spec.html) is the reference. For why a human-readable specification matters as governance infrastructure, see *[Why Bitcoin Needs a Specification](/articles/why-bitcoin-needs-a-specification)*.
