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

Bitcoin spam debate blurs two layers. Consensus forces every validating node to accept whatever is in a valid block, monkey jpegs included. Relay and storage are policy. No node must relay a transaction before confirmation, and no node must keep storing everything after validation. Pruning exists because storage is optional.

Pruning costs self-sovereignty. A pruned node cannot re-verify the full chain from its own copy without asking another node. Pruning also does not remove initial sync cost. Every pruned node still downloads and validates the full chain history, including non-monetary data, during initial block download. The spam passes through every new node at first sync whether that node keeps the data afterward. Bandwidth and validation time at sync are permanent costs on every participant who joins. Pruning shifts when storage is paid. It does not eliminate the download.

Refusing to relay is not banning. A transaction that pays enough fee reaches the chain through some miner or permissive node, whatever one operator's mempool policy says. Policy limits on OP_RETURN and similar fields can be raised, lowered, or dropped by whoever runs the defaults. Consensus caps bind every participant or fail to activate.

The fight is usually about consensus capture, forking risk, and who decides which use cases are legitimate. For OP_RETURN and data-embedding politics, see *[Who Controls Bitcoin, §V](/articles/bitcoin-governance/#v-the-adversarial-layer-when-conflicts-become-visible)* and *[Argument Map, Parts VI–VII and XXII](/articles/bitcoin-governance-argument-map/#part-vi-forced-participation)*.

Set politics aside. If consensus could change freely, how low can arbitrary data be pushed, and where is the hard limit?

Spam has a workable definition. A spam transaction has no monetary settlement function and pushes costs permanently onto every validating node with no recovery path. Lightning channel opens and closes have settlement functions. Timelocked outputs and multisig setups have settlement functions. A JPEG in a Taproot envelope does not. That follows from Bitcoin's design as a distributed consensus state machine whose validity depends on the complete chain of prior state transitions. Using the settlement layer as a subsidized data bus imposes externalities on a system not built to carry them. Demands for an impossible alternative definition are rhetorical, not technical. The definition was always available.

## II. Taxonomy of Channels by Cost

Data reaches the chain through channels that vary widely in cost. Fee per vbyte is only part of it. Operators can also filter or refuse to relay a channel, which is a business risk separate from fee math. Rollups posting data availability to the base layer are the current example.

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

The main one is any field that holds a hash rather than the preimage, such as P2PKH or P2WPKH destinations, HTLC preimage commitments, and P2SH or P2WSH script hashes. A fake 20 or 32 byte string looks the same as a real hash. Pay-to-Fake-Key and Pay-to-Fake-Multisig predate OP_RETURN. The 2010 WikiLeaks Cablegate dump used this method.

Inviscription chunks ciphertext into hash locks, multisig pubkey slots, or CLTV values. The key may appear in a later transaction or never on-chain.

Output amounts are free too. Consensus cannot tell whether a chosen value encodes data or is just a payment. Published attacks use matrix decomposition on amounts to raise embedding rate.

Structural fields add more. nSequence carries four bytes in the disable-flag range; nLockTime four more under the same condition; input and output order is unconstrained. Closing any of these means dictating how people structure valid transactions. The same trade as amounts is worse usability, not a spam fix.

**Near-free channels** cost a bounded number of trial attempts.

Taproot's 32 byte x-only pubkey field is the standard example. Roughly half of all 32 byte strings are valid x-coordinates on secp256k1. A chosen payload embedded as a fake pubkey takes about two attempts on average.

The same property applies across ordinary address fields. Published blockchain measurements put achievable scale in the hundreds of kilobytes.

**Expensive channels** scale as two to the power of the number of chosen bits. Grinding a private key or signature nonce until the result hits a target pattern is the same math as vanity addresses, pointed at arbitrary targets.

**Unenforced channels** have no content validation today.

Undefined witness versions and OP_SUCCESS opcodes are upgrade hooks. Consensus treats anything after an OP_SUCCESS byte in Tapscript as valid regardless of content. The Taproot annex is a witness element excluded from the signature hash, with no constraint on its contents. Data there need not look like a hash or pubkey.

**Dedicated channels** carry no monetary function, or hold large uninterpreted script data.

OP_RETURN is an output with no spending condition. Core v30 relay policy allows up to 100,000 bytes of aggregate `OP_RETURN` `scriptPubKey` per transaction, with multiple outputs, while consensus places no byte cap. The Taproot envelope pushes data inside an `OP_FALSE OP_IF` branch that never executes. SegWit's witness discount and Taproot's removal of the 10,000 byte tapscript ceiling made large envelope payloads practical.

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

Closable and unclosable channels are not the same problem. OP_RETURN embedding and Taproot envelope embedding are closable at consensus. Out-of-band submission to mining pools, private peering between miners, and direct transaction injection are not closable at consensus without redesigning mining architecture. The honest claim after closing closable channels is that some spam may still reach blocks through paths consensus cannot shut. That is not an argument against closing the channels consensus can shut. It is a category error to treat them as one objection.

Dedicated and unenforced channels can close at consensus. Neither carries monetary function Bitcoin needs.

A consensus hard cap on OP_RETURN closes bulk dedicated-data outputs and binds every participant. Policy limits bind only operators who choose to run them.

Cap data in non-executing script branches, including the `OP_FALSE OP_IF` envelope, without touching legitimate large witness use. Multisig, Lightning, and covenant scripts do not hide logic in branches that never run.

Restrict witness versions, disallow or cap the annex, cap control block size.

A dynamic minimum output value tied to fee rate prices output count when bytes inside each output are nearly free to embed.

Higher baseline fees make every measure bite harder.

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
<tr class="close-partial"><td>UTXO set commitments</td><td>Permanent storage burden (§V)</td><td>Parallel; not required for above</td></tr>
<tr class="close-partial"><td>Selective sync (assumeUTXO-style)</td><td>Initial block download cost</td><td>After commitments live</td></tr>
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
    <span class="flow-node">Grinding limit</span>
  </div>
</div>
</figure>

*Figure: §III closes OP_RETURN, envelope, annex, control block, and min-output channels. §IV fields cannot.*

## IV. Why the Free Channels Resist Closure

You cannot close free or near-free channels without breaking payments or barely raising cost.

**Curve-membership checks on pubkey fields** fail for the same reason. Near-free grinding means a validity filter blocks almost nothing.

**Requiring the real pubkey, or a zero-knowledge proof of one, at output creation** closes hash-based channels but ends hash-then-reveal privacy for every user. P2PKH and P2WPKH withhold the pubkey until spend time in case discrete log breaks. Bad trade for a spam fix.

The zero-knowledge variant keeps privacy but still fails. Grind a real keypair until its hash encodes a payload, and add SNARK verification to every payment.

**The amount channel** costs the attacker nothing. Sequence numbers, locktimes, and input or output ordering are the same.

Canonical denomination removes low-order bits, not the channel. The attacker still picks which multiple. Across 21 million bitcoin, coarsening still leaves tens of bits per output at the cost of payment precision for every user.

Canonical ordering or fixed sequence and locktime values run into the same limit. There is no single correct value, only a range. One mandated choice breaks ordinary wallet use.

**Homomorphic amount commitments**, as in Liquid and Mimblewimble, hide amounts but kill supply auditability.

Inscriptions, BRC-20, and Rune issuance pay fees and look like ordinary payments at consensus. Users will pay to keep using them. Politics gets harder; the channels stay open.

Bitcoin was built for payments, not token registries, inscriptions, or bulk data availability. The free fields exist because payments need them.

## V. Custody of Data That Already Exists

Sections I–IV are about new data. Storage for data already on chain is a separate problem.

Fake hash outputs stay in the UTXO set until spent. Without the preimage, no one knows whether an output will ever move. Inscription outputs already dominate UTXO count with almost no monetary value.

UTXO set commitments let a node hold a root hash and verify spends through inclusion proofs the spender supplies. Every node no longer carries the full set; only spenders who need to prove ownership do. Utreexo is one design. A consensus-committed root in the block header removes dependence on bridge nodes.

Selective sync applies the same idea to bootstrap. Validate from headers, proof of work, and a UTXO commitment, without full historical witness data.

Some production designs resolve the root through peer consensus rather than a consensus-committed value. That requires trusting a sampled peer majority.

## VI. The Actual Floor

OP_RETURN, the Taproot envelope, undefined witness versions, and the annex can close at consensus. Payments do not need them.

Dedicated and witness-discounted channels drove bandwidth. What remains is built into payment design. That is hash fields, amounts, sequence, locktime, and ordering. Close those and you lose hash-then-reveal privacy, satoshi precision, or supply auditability. UTXO commitments fix storage for old data; they do not stop new embedding.

Hidden data capacity is structural. In Bitcoin the carrying fields are security requirements.

The blockspace impact is measured, not guessed. A full chain scan across 912,723 blocks and roughly 1.235 billion transactions yields specific numbers. Spam's share of blockspace intensified about 17-fold relative to its pre-inscription baseline. Non-monetary data accounts for an estimated 12 to 19% of total chain storage. 29.6% of all UTXOs are inscription-related, holding about 415 BTC in total value per Mempool Research. Blocks ran between 91 and 97% full across multiple weeks in 2026. The negligible-impact claim requires ignoring documented methodology and published measurements.

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

The OP_RETURN cap and envelope push cap are straightforward. They subtract from valid transaction shapes. Witness version, annex, and control block caps need language for reopening a version or redefining a placeholder later. The dynamic minimum output value needs a fee-rate reference and update cadence; static dust thresholds already run as policy on several implementations. Consensus caps on dedicated embedding channels do not close every free input-side channel. Inputs still carry low-cost fields such as nSequence, nLockTime, and ordering. A dynamic minimum output value, recomputed on a fee-rate percentile schedule, closes those channels indirectly. Inputs spend previously created outputs. If new outputs carry a minting cost at consensus, exploiting input-side free fields requires spending outputs that were not free to create. The floor does not ban input fields directly. It removes the economic incentive to mint outputs for free and then encode through inputs. Dedicated-channel caps and a dynamic output floor are complementary, not competing proposals.

UTXO commitments and selective sync are more involved, mainly on trust model tightening.

Each §III measure can soft-fork independently or together. Selective sync waits on commitments. Grandfather outputs that would fail a new rule.

Policy tools (mempool heuristics, envelope detection, pool multipliers) stay useful and non-binding. Enough fee still reaches a miner that does not enforce them. Only consensus binds everyone.

## VIII. Conclusion

Even if consensus could change without a political fight, arbitrary data cannot reach zero. Payments still need hash addresses, flexible amounts, and auditable supply.

Off-chain data and unrevealed Taproot leaves are out of scope.

The §III caps belong in a formal spec. The [Bitcoin Commons consensus spec](https://thebitcoincommons.org/spec.html) is the reference.
