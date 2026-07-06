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

Most public debate about spam on Bitcoin collapses a distinction that actually matters. Consensus rules force every validating node to accept whatever is inside a valid block, monkey jpegs included, while relay and storage sit on the policy side of the line and remain fully discretionary, since nothing forces a node to relay a transaction before it confirms, and nothing forces a node to keep storing everything after validation either. Pruning exists precisely because that requirement isn't absolute.

But pruning isn't a free discard, it's a trade. A pruned node has given up the ability to independently re-verify the full history of the chain from its own copy, and re-establishing that ability means asking some other node for the data back, which is an external dependency and a trust assumption that didn't exist while the node held the data itself. That's a real cost paid in self-sovereignty, not a loophole in the rule that storage is discretionary. Storage is optional, and giving it up is not costless.

This distinction is where the argument usually goes wrong, because people talk as though refusing to relay something is the same as banning it, when it isn't. A transaction that pays enough fee will find a path onto the chain through some miner or some more permissive node regardless of what any individual operator's mempool policy says. Policy limits on dedicated data fields like OP_RETURN can be raised, lowered, or abandoned entirely by whoever runs the defaults, while proposals to enforce similar caps at consensus bind every participant or fail to activate. The gap between what policy discourages and what consensus permits has been the recurring fault line in every round of this debate.

The debate is almost always fought as a political question: consensus capture, forking risk, whether a minority of node operators get to decide which use cases count as legitimate. That framing is real, but it sits on top of a harder technical question. For the governance and adversarial context behind OP_RETURN, BIP-110, and data-embedding politics, see *[Who Controls Bitcoin, §V](/articles/bitcoin-governance/#v-the-adversarial-layer-when-conflicts-become-visible)* and *[Argument Map, Parts VI–VII](/articles/bitcoin-governance-argument-map/#part-vi-forced-participation)*.

That question still matters even in a world where the political fight is over, where every participant agrees tomorrow to change consensus however a majority wants.

That harder question is this: if consensus could be changed without political friction, how low could arbitrary data on Bitcoin actually be pushed, and where is the hard limit?

## II. Taxonomy of Channels by Cost

Arbitrary data reaches the chain through channels that differ enormously in cost. Whether consensus can close a channel depends on that cost. The per-vbyte fee is only part of the picture. There is also the risk of building a business on a channel that node operators may come to treat as hostile, filter, or route around. Rollup and other L2 projects posting data availability to Bitcoin's base layer are the clearest current example. The bytes may clear at prevailing fee rates, but the business depends on a channel operators may refuse to treat as ordinary Bitcoin use.

That second risk does not show up in any fee calculation. It works like a deprecated dependency in a software project: not a hard blocker today, but a liability any serious builder has to price in. The taxonomy below tracks technical cost only. Fee math alone will not tell you what gets built when the politics turn against a channel.

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

*Figure: Channel cost ladder. Embedding cost rises toward dedicated fields; consensus can close the top tiers without touching monetary fields.*

**Free channels** cost nothing beyond the ordinary fee of sending a transaction.

The first is any field that holds a hash of something rather than the thing itself: a P2PKH or P2WPKH destination, an HTLC preimage commitment, a P2SH or P2WSH script hash. A hash reveals nothing about its preimage by design. A fake 20 or 32 byte string chosen at random looks the same as the hash of a real spending condition. This is documented as Pay-to-Fake-Key and Pay-to-Fake-Multisig in the academic literature. It predates OP_RETURN as the dominant method of data insertion. The 2010 WikiLeaks Cablegate dump was spread across the chain this way.

A more refined version, called Inviscription, generalizes the same idea. Ciphertext is chunked and disguised as ordinary-looking hash locks, multisig pubkey slots, or CLTV timestamp values. A later transaction can carry the decryption key, or the plaintext may never appear on-chain at all.

Output amounts belong in the same category. An output's value is a number the spender chooses freely within their balance. Nothing in consensus can tell whether a chosen amount carries hidden meaning or is just a payment, because spending your own money in any legitimate amount is always valid. Published attacks encode data in amounts using matrix decomposition to raise the embedding rate.

Alongside amounts sit structural choices every transaction already has to make. The nSequence field on each input carries four free bytes once set into the disable-flag range, with no timelock meaning. nLockTime offers another four free bytes under the same condition. Working constructions for embedding data through nLockTime have been published. The order of inputs and outputs is also a free choice. Nothing about validity requires any particular order, so ordering alone can carry payload bits scaling with the number of inputs or outputs. None of these can be closed without dictating how people structure their own valid transactions. That is the same trade the amount channel forces: a hit to usability and fungibility, not a targeted spam fix.

**Near-free channels** cost a small, bounded number of trial attempts rather than serious compute.

Taproot's 32 byte x-only public key field works this way. Roughly half of all possible 32 byte strings are valid x-coordinates on secp256k1. An attacker embedding a chosen payload as a fake public key needs on average about two attempts, not an exponential search.

The same property extends across ordinary address fields generally. Published measurements against real blockchain data put the achievable scale in the hundreds of kilobytes. This is a wide channel, not one confined to a single field type.

**Expensive channels** scale exponentially with the number of chosen bits. Grinding a real private key or signature nonce until the resulting public key or signature hits a target bit pattern costs roughly two to the power of the number of targeted bits. Vanity address generation already uses this technique for memorable prefixes. The same grinding repointed at arbitrary targets is expensive by design.

**Unenforced channels** are fields where consensus applies no validation to contents in the first place.

Undefined witness versions and the OP_SUCCESS opcode family exist as upgrade hooks. Future soft forks can attach new spending rules to new witness program types without a hard fork. Consensus currently treats anything following an OP_SUCCESS byte in Tapscript as automatically valid regardless of content. The point is to leave room for opcodes that do not exist yet. Data placed there need not resemble a hash, a pubkey, or anything else. It satisfies no test whatsoever.

The Taproot annex is a witness stack element reserved for future use and excluded from the signature hash by design. It sits in the same category, present in a transaction's witness with essentially no constraint on its contents today. Both unenforced categories are far less constrained than the free channels above, not because forging them is cheap, but because nothing currently checks them at all.

**Dedicated channels** are fields built to carry no monetary function, or general-purpose script space that happens to hold large uninterpreted data.

OP_RETURN is the clearest example: an output whose entire purpose is a return value with no spending condition. The Taproot envelope pattern pushes data inside an OP_FALSE OP_IF branch that never executes. That is the script-level equivalent. SegWit's four-to-one witness discount and Taproot's removal of the old 10,000 byte tapscript ceiling made it viable.

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
<figcaption>Closability matrix by channel type</figcaption>
</figure>

## III. What Consensus Can Actually Close

The dedicated channels are the ones an unrestricted consensus authority can close outright, because nothing about their function needs preserving. The unenforced channels are close behind, closable not because the data they carry is expensive to produce, but because the validation gap that leaves them open is itself a temporary design choice rather than a permanent structural necessity.

Moving OP_RETURN from policy to consensus, with a small hard byte cap enforced as a block validity rule, closes the largest and cheapest channel immediately and binds every participant. Policy limits bind only the operators who choose to run them.

The Taproot envelope closes with a size cap on data pushed inside script branches that provably never execute, including the OP_FALSE OP_IF pattern, without touching legitimate uses of large witness data. Real multisig, Lightning, and covenant scripts do not hide their logic in branches that never run.

The unenforced channels close by narrowing the upgrade hooks that leave them open, not removing them permanently. Restricting spends to currently-defined witness versions closes the OP_SUCCESS gap while leaving room for future soft forks to define new versions when needed. The annex can be disallowed outright or capped like any other witness field. A bounded control block size limit closes a related gap: an oversized control block lets a spender claim an implausibly deep Taproot Merkle path and hide bytes disguised as path-proof data.

A dynamic minimum output value, tied to the prevailing fee rate and enforced at consensus, raises the cost of creating large numbers of low-value outputs. That matters for the UTXO set even when the bytes inside each output are nearly free to embed, because it prices output count, not just output content.

None of these changes have to do the whole job alone. Sustained demand for block space raises the baseline fee rate everyone competes against, and every consensus change above bites harder as that baseline rises. The consensus changes set the ceiling. A healthy fee market pushes the floor up underneath.

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
<figcaption>Section III closable measures. Free-channel fields (§IV) are not listed; they are structural, not oversights.</figcaption>
</figure>

<figure class="article-chart chart-flowchart" role="img" aria-label="Consensus-closable channels versus the irreducible embedding floor">
<div class="flowchart-layers" aria-hidden="true">
  <div class="flowchart-row">
    <span class="flow-node">Closable at consensus</span>
    <span class="flow-arrow" aria-hidden="true">→</span>
    <span class="flow-node">Raises ceiling</span>
  </div>
  <p class="flow-link">fee market</p>
  <div class="flowchart-row">
    <span class="flow-node">Irreducible floor</span>
    <span class="flow-arrow" aria-hidden="true">→</span>
    <span class="flow-node">Grinding limit</span>
  </div>
</div>
</figure>

*Figure: Two layers. Section III closes OP_RETURN, envelope, annex, control block, and min-output channels; Section IV fields (hashes, amounts, sequence, locktime, ordering) are structural requirements, not oversights.*

## IV. Why the Free Channels Resist Closure

Every attempt to close the free and near-free channels either fails to raise cost meaningfully or succeeds only by removing something Bitcoin needs for reasons unrelated to spam.

**Curve-membership checks on pubkey fields** sound like they should close the fake pubkey channel. They do not. Near-free grinding means a validity requirement filters out almost nothing. The attacker just tries the next candidate string.

**Requiring the real pubkey, or a zero-knowledge proof of one, at output creation** would close the hash-based channels properly. A fake hash can no longer be picked freely once its preimage has to be proven. But this removes hash-then-reveal address privacy for every user on the network permanently. P2PKH and P2WPKH addresses withhold the public key until spend time precisely to limit exposure to an adversary who might later break the discrete log problem. Giving that up to shrink a spam channel gets worse, not better, as that timeline approaches.

The zero-knowledge version preserves privacy but still does not fully close the channel. Nothing stops someone from generating a real keypair for free and grinding it until its hash encodes a payload. That lands back on the exponential-cost floor rather than zero, now with a permanent SNARK verification burden added to every ordinary payment on the network.

**The amount channel** is the hardest to close because it costs the attacker nothing. The transaction-structure channels alongside it, sequence numbers, locktimes, and input or output ordering, resist closure for the same reason.

Canonical denomination, forcing all output amounts to round to some fixed unit, removes the low-order bits as a channel but not the channel itself. The attacker still chooses which multiple. Across a 21 million bitcoin supply that remains tens of bits of free payload per output even after coarsening, paid for entirely in lost payment precision for every ordinary user.

Forcing canonical ordering or fixed sequence and locktime values would close those channels the same way denomination closes part of the amount channel. But none of these fields has a "correct" value consensus can check against, only a legitimate range the spender is free to move within. Mandating a single canonical choice removes flexibility real wallets and use cases rely on for reasons unrelated to spam.

**Hiding amounts behind homomorphic commitments**, as confidential transaction designs like Liquid and Mimblewimble do, is the only mechanism that actually removes visible amounts as a channel. It trades away supply auditability, one of the properties Bitcoin was built around, for a channel far smaller in stakes than what would be given up to close it.

This isn't only attackers exploiting a gap, either. A real share of current arbitrary-data activity, inscriptions, BRC-20 and Rune issuance, pays meaningful fees and competes for block space on the same terms as ordinary transactions. That payment is real, but it doesn't make the activity monetary use of Bitcoin in any sense that matters to the spam question: a high fee buys inclusion, not legitimacy. What it does do is complicate the politics of closing channels, because much of what rides through free and near-free fields is already fee-paid rather than free-riding. That doesn't change which channels are closable. It reinforces why they resist closure for two reasons: at the consensus layer they look like ordinary payments, and plenty of users will pay market rates to keep using them anyway.

The distinction is familiar in any other engineering context. You can store hierarchical data in a tabular database, and you can store tabular data in a tree database. Neither is impossible. Both are the wrong tool for the job, and any decent engineer will call it scope creep and flag it. Bitcoin's free and near-free channels are the same kind of mismatch: the protocol offers fields that can carry arbitrary bits because monetary transactions require those degrees of freedom, not because Bitcoin was built to be a data availability layer, a token registry, or a media host. That the embedding is possible does not make it appropriate.

## V. Custody of Data That Already Exists

Everything discussed so far concerns how much new data can be created and at what cost. A separate problem sits underneath it entirely, the permanent storage burden every node already carries for data that has been written regardless of how it got there.

Outputs constructed to be indistinguishable from real, someday spendable outputs, including every fake hash-based output described above, have to be retained in the active UTXO set forever by every node, since no one can tell without the preimage whether a given output will ever be spent. This isn't a hypothetical burden. Inscription-related outputs already dominate the UTXO set by count while holding almost nothing in monetary value, the exact asymmetry the free channels above are built to make unavoidable.

UTXO set commitments solve this directly. A node can hold just a root hash of the entire UTXO set, updated every block, and verify spends through inclusion proofs the spender supplies. That turns a cost every node must pay forever into a cost paid only by whoever wants to prove ownership. Utreexo is one concrete design for this. It does not require adding the commitment to consensus to function, though putting it in the block header removes the need to trust bridge nodes for proof construction.

This is a different kind of fix from anything in Section III. Rather than reducing how much data exists, it removes the requirement that every node personally carry all of it forever. Selective sync extends the same logic to initial bootstrap cost, letting a new node validate from headers, proof of work, and a UTXO commitment without downloading the full historical witness data behind it, the direction assumeUTXO style bootstrapping already points.

The trust question underneath this isn't a distant hypothetical, it's a live design problem with approaches already in production. One pattern uses a sparse Merkle tree with incremental updates and spend-time inclusion proofs, exactly the mechanism described above, but resolves the trust question through peer consensus rather than a pure consensus-committed root, a node queries a diverse set of peers, spread across autonomous systems, countries, and subnets to avoid a single vantage point dominating the answer, and accepts a commitment once enough of them agree on it.

That's a real trust assumption: honest majority among a sampled set of peers, not the self-verifying property the mechanism sounds like it offers. It works in practice, but closing the gap to zero added trust is still unfinished work.

## VI. The Actual Floor

Putting the preceding sections together gives a less comforting answer than most people want.

The dedicated channels, OP_RETURN and the Taproot envelope pattern, can be closed at consensus without harming Bitcoin's monetary function. Neither does anything worth keeping. The unenforced channels, undefined witness versions and the annex, can be closed too. They're open only because validation hasn't caught up to the design yet, not because the spending rules depend on them today. Narrow them now; reopen a specific version later when there's a real use for it.

The near-free and expensive channels shrink under consensus pressure but were never the main bandwidth problem. The free channels are different: hash fields in ordinary payment scripts, amounts in ordinary outputs. These are not bugs off to the side of Bitcoin's design. They are the design. Closing them fully means giving up hash-then-reveal privacy, satoshi-level payment precision, or supply auditability, each of which earns its place in the protocol for reasons unrelated to spam. UTXO commitments address a separate problem: the permanent storage cost of data already on chain, no matter how cheaply it got there.

The floor that remains is open, not merely expensive. Information theory sets the limit, not a lack of political will. Any system where one party controls fields a verifier cannot fully constrain will carry some hidden-data capacity. In Bitcoin, those fields are security requirements, not oversights.

That limit is on what consensus can eliminate, not a reason to stop pushing. Policy heuristics, fee pressure, and refusing to treat tokens, inscriptions, or rollup bulk data as normal Bitcoin use still matter, even where bytes can still be embedded in principle. The consensus changes outlined above close the highest-bandwidth channels and lift the mandatory storage burden on every node. Driving arbitrary data to zero would require stripping properties Bitcoin needs for other reasons. That cannot happen at the consensus layer. What remains achievable is keeping non-monetary use expensive, filtered, and unwelcome enough that it never becomes what Bitcoin is for.

## VII. Implementation Path

Each closable change needs a formal specification before implementation, stated precisely enough that independent implementations can verify the same rules. The OP_RETURN cap and the envelope push cap are the most straightforward, both strict subtractions from currently valid transaction shapes rather than redefinitions of an entire validity class.

The witness version restriction, annex restriction, and control block size cap are similarly straightforward subtractions, though each needs explicit language for how a future soft fork reopens a specific witness version or redefines the annex when the placeholder is actually needed, so the temporary narrowing doesn't quietly become permanent by omission. The dynamic minimum output value needs a precisely specified fee rate reference point and update cadence to avoid introducing new manipulation surface around the moment a block is mined, though the shape of the rule isn't unprecedented, a static version of the same idea, a fixed dust threshold paired with a minimum fee rate, already runs as a policy-layer spam filter on several node implementations today. Making it dynamic and consensus-enforced is a matter of tying the existing thresholds to a live fee rate reference rather than inventing the mechanism from nothing.

UTXO commitments and selective sync are the most involved of the group. What remains open is tightening the trust model underneath the accumulator designs already running in production, moving from peer consensus toward a commitment a node can verify on its own.

The OP_RETURN cap, envelope push cap, witness version and annex restrictions, control block cap, and dynamic minimum output value are independent of one another and of the UTXO custody work, so any of them can be specified and activated on its own or bundled into a single coordinated soft fork. UTXO commitment work has no dependency on the others and can proceed in parallel. Selective sync is the one exception to that independence, it depends on commitments being live first, since it relies on the commitment as the trust anchor new nodes bootstrap from.

Backward compatibility follows the ordinary soft fork pattern, every proposed change is a restriction on what counts as valid, never an expansion, so old nodes continue to see all new blocks as valid subsets of what they already accept, with explicit grandfathering needed for any already-confirmed output that would fail a newly introduced rule.

Everything above sits at the consensus layer and none of it competes with the policy-layer tools already in use today, mempool heuristics, envelope pattern detection, fee-rate multipliers applied by individual pools. Those tools remain useful and cost nothing to keep running alongside the changes here.

But they're non-binding by construction, a transaction that pays enough fee still finds inclusion through whichever miner or node chooses not to enforce a given heuristic, which is the same relay-versus-consensus gap Section I opens with. Policy raises the cost of getting past the least permissive participant. Only consensus raises the cost of getting past all of them at once, which is why the changes in this section, not the policy layer, are what actually move the floor.

## VIII. Conclusion

Even if Bitcoin could change its consensus rules without political friction, arbitrary data could not be driven to zero. The channels that would survive are the ones the protocol needs for other reasons: hash-based addresses, flexible output amounts, auditable supply.

This analysis covers only what lands on the base chain. Data kept off-chain and never published sits outside the floor, as does a Taproot leaf built but never revealed. Consensus can only govern what actually hits the chain.

The closable changes deserve formal specification, written clearly enough that independent implementations can verify the same rules. That matters for adopting caps on OP_RETURN, envelope pushes, and the rest, and for being honest about what those caps do not close. A spec that claims too much falls apart the first time someone maps it against the free channels in Section II.
