---
title: "We picked the right tokens. That was the easy half."
seoTitle: "Messy Virgo: Right Tokens, Hard Execution"
date: 2026-08-01
description: "A correct token decision can still become a poor trade. Here's what the last few weeks taught us about the distance between deciding to buy and actually being in the position, and what we built in response."
tags: [fund-operations, execution, ai-funds, decision-pipeline, risk-management]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

*What the last few weeks taught us about the distance between a good decision and a good trade.*

---

For quite a while, our attention went where you'd expect it to go. Better evidence. Better screening. Better agents. A council that deliberates properly, disagrees properly, and reaches a conclusion it can defend. Get the intelligence right, the thinking went, and the outcome follows.

Then we started putting real money through it, in small sizes, on small funds. And we learned something that doesn't show up in any backtest: **a correct decision can still become a poor trade.**

Not because the token was wrong. Because of everything that happens between "we should buy this" and "this is now in the fund."

That gap has been the whole of our work for the last few weeks. Here's what's in it.

---

## What a micro-cap trade actually is

If you buy a large-cap asset on a major exchange, you're buying into a deep, continuous order book. The price on the screen is, for practical purposes, the price you get. That's the mental model almost everyone brings to crypto. It's quietly the model most software built for it brings too.

It holds up well at the top of the market. It degrades fast at the bottom.

A micro- or mid-cap token doesn't have *a* price. It has a price *per venue*: those venues are pools of liquidity scattered across different blockchains, run by different exchanges, each holding a different amount of the token. The "market price" you see quoted is a blend of places, and you can only trade in some of them.

So the questions that decide whether a trade works aren't only *is this a good token?* They're:

- Is there a venue **on the chain we operate** that holds enough of it?
- What's the actual path from what we hold to what we want: one hop, or three?
- What do we receive if we send *this exact amount*, right now, through *that exact path*?
- And the one that matters most: **if we buy it, can we get back out?**

Each of those is answerable. None of them is answerable from a price feed.

---

## Three ways the map disagrees with the territory

These aren't checks anyone skips out of carelessness. They're failure modes that only become visible at the small end of the market, where the usual abstractions stop being safe.

**Liquidity is not one number.** A token can look perfectly adequately traded in aggregate and still be close to untradeable on the specific chain and venue you're executing on. Market data aggregates across venues; your transaction does not. We hit a case where the global picture was healthy and the pool actually reachable from our position held less than a thousand dollars. Nothing about the token was wrong. The cost was paid on entry, before the position had a chance to be right or wrong at all. It was paid because "how liquid is this?" and "how liquid is this *to us, here, now*?" are different questions with different answers.

**Some venues are adversarial.** We found a pool quoting an excellent price on a well-known asset. It was priced against a counterfeit version of the token it claimed to be paired against: a real pool, real contract, real quote, describing a trade that would have handed over something for nothing. From the outside it didn't look suspicious. It looked like the best available route, which is precisely what made it dangerous. Route selection that optimises purely for the best quote will walk straight into this every time.

**Exit is harder to price than entry, and it matters more.** Entry cost is measurable: you hold the asset you're spending, so you can ask for a real quote. Exit is a hypothetical sale of a position you don't own yet, and on thin tokens it can cost substantially more than getting in, occasionally enough to erase the gain that justified the position. Measuring it properly took real work. Not measuring it means booking a cost you'll only discover when you try to leave.

![Tracing a route between isolated pools of liquidity, where not every bridge reaches the other side.](/images/blog/right-tokens-liquidity-map.png)

---

## What we built in response

All of this now happens **before** a transaction is ever prepared for signing, on every leg of every trade.

**Eligibility, separate from quality.** Passing research makes a token a candidate, not a trade. It clears a second bar independently: does a venue exist, on our chain, with enough depth for the size we intend, in *both* directions?

**A priced route, not a market price.** We ask the venues themselves for the real path, then price the trade the way it will actually execute: amount in, hops, amount out.

**Two-sided cost.** Exit is measured, not assumed. If we can't measure the way out, we don't take the position. There's deliberately no "we'll work it out later" branch, because later is after the money is committed.

**Divergence checks.** We compare the price on the chain we're trading against the wider market, and compare what the plan expected against what the prepared transaction actually delivers. Disagreement past a tolerance is treated as a signal, not a rounding error.

**A price on uncertainty.** Some tokens behave unusually: a fee charged on every transfer, mechanics we haven't verified. Where we can't establish the true cost, we assume a punitive one rather than an optimistic one. Sometimes that assumption alone is what kills the trade. That's the intent.

**Simulation.** The prepared transaction is dry-run before anyone is asked to sign. This catches things no amount of price analysis would: last week it caught an integration pointing at the wrong contract on the wrong chain, a trade that would simply have failed on-chain and burned the fee. It never reached a person, because it never got past simulation.

None of this makes the fund smarter. It makes the fund honest about what acting on being smart actually costs.

---

## Where autonomy actually comes from

We're building toward fund operations that run autonomously. We're also not going to tell you an AI decides and you find out afterwards. Those sound contradictory. They aren't, and the distinction is the most important design decision we've made.

**The human doesn't approve every transaction forever. The human approves the boundaries.**

Autonomy here isn't the system deciding *instead of* you. It's you defining a mandate: what may be traded, in what size, at what cost, with what tolerance for slippage and uncertainty, deliberately, in advance, and switching it on explicitly. That delegation is itself a human decision. It's narrow, it's inspectable, and it's revocable.

Inside those boundaries, the system can act. That's the point of drawing them.

Outside them, it stops. And this is the part that makes the whole arrangement trustworthy rather than decorative: **the guardrails are not advisory, and the agents cannot argue their way past them.** When a prepared trade breaches a cost tolerance, or the price on-chain disagrees with the wider market, or the true cost of a token can't be established, the run parks and asks for a person, *even when standing authority to execute already exists*. That happened this week. The authority was there. The gate held anyway, and a human made the call.

A system permitted to route around its own safety checks doesn't have safety checks. It has suggestions.

So responsibility doesn't leave the human. It moves: from approving each transaction, to defining the conditions under which transactions are allowed at all, and being told clearly whenever reality falls outside them. That's a real transfer of work. It is not a transfer of accountability, and we'd be wary of anyone offering you that.

Today, the human confirms more often than they eventually will. That's not the end state. It's the current rung, and every rung above it has to be earned in public, with a person's hand on the switch.

![Inside the boundary the system acts on its own; outside it, a flagged transaction waits for a hand on the switch.](/images/blog/right-tokens-human-switch.png)

---

## The learning, stated plainly

Selecting the right tokens is necessary. It's nowhere near sufficient.

For funds operating at the small end of the market, execution isn't a technical detail downstream of the investment decision. It's a large part of the decision itself. A token you can't enter efficiently and can't reliably exit isn't an opportunity, however good the thesis is. That single reframing has changed more about our system in the last few weeks than any improvement to the research that precedes it.

It cost us something to learn, and it shows in the curves of our test funds. Small funds, deliberately, and this is exactly what they're for.

---

*Messy Virgo is an AI-assisted fund operations platform. Nothing here is financial advice. Our test funds are exactly that: tests. Their performance reflects a system under active development.*
