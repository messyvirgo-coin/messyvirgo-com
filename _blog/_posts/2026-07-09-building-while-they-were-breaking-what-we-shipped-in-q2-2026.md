---
title: "Building While They Were Breaking: What We Shipped in Q2 2026"
seoTitle: "Q2 2026: Messy Virgo Build Recap"
date: 2026-07-09
description: "Liquidations, rage quits, and another quarter of AI hype — while Messy shipped 600+ commits, a public proof stack, and the first governed path from screening to council to execution."
tags: [messy-virgo, q2-2026, ai-funds, build-log, transparency, ai-council]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

*By Messy Virgo — July 9, 2026*

Q2 2026 was not a quiet quarter in crypto. Liquidations stacked up. Builders rage-quit on X. Every other project promised autonomous agents by Friday.

We kept shipping anyway.

This is not a victory lap. It is a receipt — what landed in git, on the blog, and in public fund surfaces between April 1 and June 30, 2026, and why it matters if you care about AI-managed funds that can actually be trusted.

> **Note:** Our funds remain **pre-live** and **human-reviewed**. Q2 advanced the workflow; it did not flip a switch to autonomous production capital. Proof before autonomy — always.

---

## The quarter in one sentence

Messy Virgo turned its AI fund thesis into a **public proof stack**: staged screening with dated artifacts, recurring fund updates, governed council sessions, and a decision-to-execution bridge — all inspectable on the website while the code kept moving underneath.

![Messy at the workbench: building AI fund infrastructure while the market broke — wrench in hand, charts on screen, proof over hype.](/images/blog/q2-2026-building-while-they-were-breaking.png)

---

## By the numbers

Evidence from git history across our core repos (`messyvirgo-platform`, `messyvirgo-com`, `messyvirgo-org`) for Q2 2026:

| Metric | Q2 total |
| :----- | :------- |
| **Commits (all three repos)** | **617** |
| **Platform commits** | **531** |
| **Website commits** | **80** |
| **Platform commit growth** | Apr **92** → May **156** → Jun **283** |
| **Commit themes (platform)** | council **138** · fund **81** · cli **59** · web **44** · agent **38** · screening **27** |

On the public surface we also shipped **13 weekly [build log](/buildlog.html) entries**, **16 fund-update cycles**, multiple long-form essays, and monthly treasury transparency posts — not as marketing filler, but as the proof layer the homepage promises: *Funds are the product. Research tools are the engine. Updates are the proof.*

---

## April: Screening became a workflow

The quarter opened with a structural shift: screening stopped being a concept deck and became a **dated operating pipeline**.

We published the two-part screening series — [Part 1: from catalog to daily substrate](/blog/2026/04/messy-virgo-screening-part-1-how-we-prepare-the-market-before-a-fund-screens/) and [Part 2: daily runs, aggregates, and configurable playbooks](/blog/2026/04/messy-virgo-screening-part-2-daily-runs-aggregates-and-configurable-playbooks/) — describing how Messy prepares the market before a fund ever screens:

- Monthly **token catalog** maintenance
- Weekly **context refresh** (macro, narrative, security)
- **Daily due diligence** on hundreds of Base tokens
- **Saved screening runs** and **aggregate candidate views** per fund sleeve

Platform work matched the story: token catalog split from weekly screening, per-sleeve UTC run days, aggregation presets, and inspection surfaces for historical comparability.

**Why it mattered:** A fund agent cannot be audited if its inputs are ad hoc. April gave Messy **repeatable artifacts** — the same question, the same date, the same shortlist, week after week.

---

## May: The proof layer went live

May was about making the engine visible.

### Public fund surfaces

We established the weekly **[Fund Update](/fund-update/)** rhythm on the website — frozen snapshots of macro regime, narrative momentum, screening aggregates, and (later) council notes. Guru Lotus read-only fund views landed. The homepage reframed around a simple sequence: **research engine → pre-live funds → allocation logic → future AI-managed funds**.

### AI evals, not AI demos

On May 23 we published [How We Benchmark AI Agents Before Production](/blog/2026/05/how-we-benchmark-ai-agents-before-production/) — documenting **three-cycle, production-path evals** for context news across **eight model configurations**, selecting **Claude Haiku 4.5** for operational fit (memory, repair friction, recall, runtime stability) rather than one-off prose quality.

Many projects demo outputs. We documented how a model survives the **workflow around** those outputs.

### Transparency as product

The monthly **[Every Month, We Buy More Of The Same Token You Hold](/blog/2026/06/every-month-we-buy-more-of-the-same-token-you-hold-may/)** series continued — May costs settled without DAO token dumps, with co-founders ending the month with **more MESSY exposure**, not less.

We also shipped trust and governance copy updates, [May raffle rules](/blog/2026/05/messy-virgo-may-raffle-rules-terms/), and the long-horizon essay [An AI End-State: What Messy Virgo Becomes](/blog/2026/05/an-ai-end-state-what-messy-virgo-becomes/).

**Why it mattered:** May proved Messy could run a **public operating cadence** — not just ship features behind a login.

---

## June: The council became real

June was the defining month.

### The decision pipeline went public

We published the two-part decision pipeline arc:

1. [Part 1: The AI Investment Council](/blog/2026/06/messy-virgo-decision-pipeline-part-1-the-ai-investment-council/) — PM agents, risk function, chair, motions, votes, recorded resolutions
2. [Part 2: The Decision-to-Execution Bridge](/blog/2026/06/messy-virgo-decision-pipeline-part-2-the-decision-to-execution-bridge/) — the deliberate gap between *what the fund should hold* and *what trades are safe to execute right now*

The bridge is the part most AI trading stacks skip. We did not.

### Workflow-traded micro test funds

By the [June 27 fund update](/updates/2026/06/messy-fund-update-week-of-2026-06-27/), Guru workflow-traded micro test funds (`mvf-base01`, `mvf-base02`) were surfacing in public:

- **Council session counts** and rotation outcomes
- **Full council minutes** on fund pages
- **Screening → council review → signed execution** as a named path

Platform commits in June concentrated on council runtime, board-minutes protocols, session inspector UI, Guru Lotus execution bridging, macro analyst strategy, Velora route selection, and PM agent tooling — **138** Q2 commit subjects mentioning `council` alone.

### Strategy and positioning essays

June content also included [If AI Can Build Anything, Why Isn't Everyone Rich?](/blog/2026/06/if-ai-can-build-anything-why-isnt-everyone-rich/), [Why Messy Virgo Is Built to Last](/blog/2026/06/why-messy-virgo-is-built-to-last-a-structural-analysis-of-competitive-advantage/), [State of the Stack](/blog/2026/06/state-of-the-stack-who-owns-the-future-of-ai-driven-crypto-funds/), and the trilogy capstone [In a World Where AI Builds Everything, Trust Is the Only Moat](/blog/2026/06/in-a-world-where-ai-builds-everything-trust-is-the-only-moat/).

**Why it mattered:** June is where Messy's core claim shifted from *AI-assisted crypto research* toward **governed AI fund operations with inspectable decision records**.

---

## Transparency and governance (the non-agentic wins)

Not every Q2 milestone was a model release. Some of the most credibility-building work was operational:

- **Monthly treasury transparency** — [April](/blog/2026/04/every-month-we-buy-more-of-the-same-token-you-hold/), [May](/blog/2026/06/every-month-we-buy-more-of-the-same-token-you-hold-may/), and on-chain [June treasury movements](/treasury.html)
- **[May raffle final distribution](/blog/2026/06/may-2026-messy-raffle-final-prize-distribution/)** — reproducible allocation methodology for **2,000,000 MESSY** across eligible wallets
- **Swiss association updates** — registered office relocation to Glattbrugg and governance copy aligned across the site

For a project claiming AI-managed funds, **how you handle treasury, legal consistency, and community accounting** is part of the product — not a footnote.

---

## What we did not claim

Worth stating plainly:

- We did **not** launch fully autonomous production capital in Q2
- We did **not** remove the human approval gate before execution
- We did **not** ask holders to trust a black box

The homepage still says funds are **pre-live** and **human-reviewed**. The decision-to-execution material says the same. The right framing for Q2 is: **major progress toward AI-managed funds, with more of the workflow proven in public**.

---

## Where to dig in

If you want the primary sources:

| Surface | Link |
| :------ | :--- |
| **Weekly build log** | [/buildlog.html](/buildlog.html) |
| **Latest fund update** | [/fund-update/](/fund-update/) |
| **Screening series** | [Part 1](/blog/2026/04/messy-virgo-screening-part-1-how-we-prepare-the-market-before-a-fund-screens/) · [Part 2](/blog/2026/04/messy-virgo-screening-part-2-daily-runs-aggregates-and-configurable-playbooks/) |
| **Decision pipeline** | [Part 1](/blog/2026/06/messy-virgo-decision-pipeline-part-1-the-ai-investment-council/) · [Part 2](/blog/2026/06/messy-virgo-decision-pipeline-part-2-the-decision-to-execution-bridge/) |
| **AI eval discipline** | [Benchmarking agents before production](/blog/2026/05/how-we-benchmark-ai-agents-before-production/) |
| **Treasury** | [/treasury.html](/treasury.html) |

---

## Q3 starts here

Q2 closed with CLI-native council runs, Guru full-exit execution, paper-provider parity, recency-weighted screening, and the first version of a **seven-rule holding-review doctrine** for exit discipline — documented in the [June 30 – July 6 build log](/buildlog.html).

The market will keep breaking things. We will keep shipping the verification layer.

If you are an allocator, a builder, or a holder who wants to see the work — not the pitch — the proof stack is public. Start with the [build log](/buildlog.html) and the [latest fund update](/fund-update/). That is the quarter, in the open.
