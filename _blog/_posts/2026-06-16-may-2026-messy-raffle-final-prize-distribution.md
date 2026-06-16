---
title: "May 2026 MESSY Raffle: Final Prize Distribution"
seoTitle: "May 2026 MESSY Raffle Prize Distribution"
date: 2026-06-16
description: "Full transparent accounting of how 2,000,000 MESSY from the May 2026 raffle is distributed across five eligible community wallets — rules, exclusions, and the final prize table."
tags: [messy-virgo, raffle, dao, messy-token, transparency]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

*Published for transparency ahead of the June 15, 2026 snapshot and community payout.*

This post documents how **2,000,000 $MESSY** from the [May 2026 raffle](/blog/2026/05/messy-virgo-may-raffle-rules-terms/) is distributed across eligible community wallets — eligibility rules, exclusions, and the final prize table.

## Eligibility rules applied

The [May 2026 campaign](/blog/2026/05/messy-virgo-may-raffle-rules-terms/) required wallets to:

1. **Buy $MESSY on a DEX on Base** during May 1–31, 2026
2. **Stay net buyers** through the month (buys ≥ sells + transfers out)
3. **Hold at least 80%** of peak May balance at the June 15 snapshot

Tickets per qualifying buy: `tickets = buy_usd − 100` (minimum $100 per transaction).

We reviewed **44 qualifying buy transactions** across **13 unique wallet patterns** using on-chain MESSY `Transfer` logs on Base ([`0x09f87f948c88848363b124c9099cbb58e4cc7cb6`](https://basescan.org/token/0x09f87f948c88848363b124c9099cbb58e4cc7cb6)). A wallet entered the community prize pool only if it passed both checks:

| Rule | Requirement |
|------|-------------|
| **Net buyer** | May DEX buys ≥ May DEX sells + transfers out |
| **80% hold** | June 15 balance ≥ 80% of peak May balance |

## Allocation vs. original draw format

The [published terms](/blog/2026/05/messy-virgo-may-raffle-rules-terms/) described **25 tiered winners** drawn at random, weighted by tickets (1st: 1,000,000 MESSY; 2nd–5th: 250,000 each; 6th–25th: 50,000 each).

After the May audit, **fewer than 25 community-eligible wallets** qualified (team wallets excluded per terms). The DAO is distributing prizes as **one award per eligible wallet**, ranked by raffle tickets (highest to lowest): rank 1 receives **1,000,000 MESSY**; ranks 2–5 each receive **250,000 MESSY**. Positions 6–25 have no eligible winners.

Per the terms' **Changes and Termination** section, the campaign could have been cancelled if fewer than 10 eligible wallets qualified at snapshot; the DAO chose this tiered rank allocation instead and publishes it here as the material change, effective upon publication.

**Prize pool:** 3,000,000 MESSY originally allocated; **2,000,000 MESSY** distributed across **5** eligible community wallets (**9,529.29** community tickets total).

## Final prize table

| Rank | Wallet | Tickets | Prize (MESSY) | Share of distributed |
|:----:|--------|--------:|--------------:|---------------------:|
| 1 | [`0xccb…38a5`](https://basescan.org/address/0xccb8360a8adda140bcc1c995f8e1a1e4da4438a5) | 5,880.76 | **1,000,000** | 50.00% |
| 2 | [`0x040…7db3`](https://basescan.org/address/0x0401ec1041110d7954db70c4d8c882e9f06e7db3) | 1,344.26 | **250,000** | 12.50% |
| 3 | [`0xd7f…cb66`](https://basescan.org/address/0xd7f60e1ada97fba042feddc1251b45bbe6c9cb66) | 1,241.29 | **250,000** | 12.50% |
| 4 | [`0x194…0c18`](https://basescan.org/address/0x194604e7c329eca5ef88df77e947129cc2ca0c18) | 969.73 | **250,000** | 12.50% |
| 5 | [`0xad5…3be8`](https://basescan.org/address/0xad5f0f856f9bb8cb4724eeb56aebf80a97593be8) | 93.25 | **250,000** | 12.50% |

## Excluded wallets

The following addresses are **not** in the community prize pool:

| Label | Address |
|-------|---------|
| Team member wallet | [`0x584b03538c1c34cf58604964f7165300814c0e42`](https://basescan.org/address/0x584b03538c1c34cf58604964f7165300814c0e42) |
| Team member and fund manager | [`0x1b69c4a788ad8f940e624341ab45c731d01190de`](https://basescan.org/address/0x1b69c4a788ad8f940e624341ab45c731d01190de) |
| Protocol controller | [`0x91041d881ed55a225e3497ea298026465ce65fe8`](https://basescan.org/address/0x91041d881ed55a225e3497ea298026465ce65fe8) |
| Qualifying swap tx.from (holds no $MESSY) | [`0x00000000de6a614f1ad2c4553ff7508671788da6`](https://basescan.org/address/0x00000000de6a614f1ad2c4553ff7508671788da6) |
| Qualifying swap tx.from (holds no $MESSY) | [`0x025a9c987abc1d04f15335e0d2f8dde3e246a7ae`](https://basescan.org/address/0x025a9c987abc1d04f15335e0d2f8dde3e246a7ae) |
| Qualifying swap tx.from (holds no $MESSY) | [`0xf0523316cf23ef167d874fa030b2214280e38ee6`](https://basescan.org/address/0xf0523316cf23ef167d874fa030b2214280e38ee6) |
| Qualifying swap tx.from (holds no $MESSY) | [`0xef896ef08ff145bc4b457174edece658ea902df7`](https://basescan.org/address/0xef896ef08ff145bc4b457174edece658ea902df7) |

Team-associated wallets are excluded per the [official raffle terms](/blog/2026/05/messy-virgo-may-raffle-rules-terms/). The four `tx.from` addresses generated tickets from qualifying May swaps but hold no $MESSY at those addresses — tokens settled elsewhere — so they are excluded from payouts.

## What happens next

- **June 15, 2026** — Final eligibility snapshot (net buyer + 80% hold)
- **Publish** — Confirm no changes to the table above; update this post if snapshot alters eligibility
- **Distribute** — Send MESSY on-chain to each wallet within 30 days of snapshot, per original terms
- **Verify** — Payout transaction hashes will be published alongside this table

Full rules: [May 2026 raffle terms](/blog/2026/05/messy-virgo-may-raffle-rules-terms/). This distribution is reproducible from on-chain MESSY `Transfer` logs on Base and the May 2026 raffle audit (`qualifiers.json`, `eligibility-summary.json`, `prize-distribution.json`, `AUDIT.md`).

*Contract: `0x09f87f948c88848363b124c9099cbb58e4cc7cb6` on Base.*
