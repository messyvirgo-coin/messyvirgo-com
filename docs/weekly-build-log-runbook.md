# Weekly Build Log Runbook

Public page: `about/buildlog.html` (permalink `/buildlog.html`).
Skill: `.cursor/skills/messyvirgo-weekly-buildlog/SKILL.md`.
Prose: `.cursor/rules/16-messyvirgo-public-prose.mdc`.

This runbook is the Monday-evening procedure. It is not a public page. `docs/` and `preview/` are listed in `.eleventyignore`.

## Ownership

The page already carries a fixed top notice and one fixed sentence. Do not edit either, and do not add a second copy.

Notice:

> Earlier editions of this Build Log were corrected on 28 October 2026 so that Fund OS is no longer described as work by Messy Virgo.

Sentence:

> Fund OS is developed independently by the founders Franco and Michael. Messy Virgo reports on it and publishes the weekly Fund Update. Messy Virgo did not develop Fund OS and holds no rights to it. A licence for the association has not been decided.

Never describe Fund OS, the platform, the CLI, the Regime Engine, the Fund Engine, the screener, or the stack as Messy Virgo work. Do not write that Messy Virgo built, shipped, developed, ran, financed, or owns them. Frame that work as the founders' independent work. A report is allowed in the third person, for example "the founders' Fund OS". Messy Virgo may say that it published the weekly Fund Update or posted about it.

Do not add a Product Development section. Put Fund OS process changes in a block headed exactly `Founders' project: Fund OS`, in the third person (`The founders' Fund OS` or `The founders`), described by effect, never by performance. Never describe those notes as Messy Virgo work. x402 Token Checker and x402 products are Messy Virgo products: they go under Business & Operations, not Marketing. Internal marketing process improvements go under Marketing. Website and Fund Update changes go under Business & Operations. The association's own site tools, if any, use `Tools and website`.

## When

- Clock: Asia/Bangkok (ICT, UTC+7).
- Week window: Monday 00:00 through Sunday 24:00 ICT. The entry covers that closed week only.
- Publish target: the following Monday evening, 18:00 to 24:00 ICT.
- Do not include the Monday of the publish day. That Monday starts the next window.
- One `.buildlog-entry` per week. A catch-up is several entries in one change, newest first, not one merged block.

## What to produce

1. Newest entry at the top of `<div class="buildlog-timeline text-left">` in `about/buildlog.html`.
2. Exactly one Community CTA (`<!-- Community CTA Section -->`) directly under that newest entry. Move it. Do not edit its contents.
3. Older entries stay newest-first under the CTA. Never edit or correct older entries. Only add the new week.
4. `sitemap.xml.njk`: `<lastmod>` for `https://www.messyvirgo.com/buildlog.html` is the Sunday of the newest entry (`YYYY-MM-DD`).
5. Optional local reading file: `preview/buildlog-draft-YYYY-MM-DD.html` (the publish Monday's date). Static HTML, CSS in a `<style>` block, the new entries on top, no external font, script, or image requests.

## Label format

Same month:

- Visible: `Week of October 19&ndash;25, 2026`
- `data-week`: `Oct 19-25, 2026`

Cross-month, matching older entries:

- Visible: `Week of September 30, 2026 &ndash; October 4, 2026`
- `data-week`: `Sep 30-Oct 4, 2026`

The en dash is only for the week label. Bullet text uses periods, commas, colons, or parentheses. No em dash (`—` / `&mdash;`).

Sections, in order. About four bullets per section is the target, not a quota. Fewer strong bullets beat four weak ones. Do not pad. Plain English, past tense. About 26 to 31 words is fine. Substance beats brevity. No em dash in bullet text. Do not use the name Franco in a new entry. Do not write `pp`.

Every bullet names a concrete change or finding and why it matters to readers or holders. Summarize a recurring change into one bullet. Name a date only for a single notable event.

Forbidden: activity counts (for example "we posted six" of anything), cleanup notes, single-ticker screening filler, and padding to hit a quota.

Reference example: the entry `Week of November 2&ndash;8, 2026`.

Before writing, inventory first. Build a fact file with one source per bullet. Sources: go-records, the X post log, the clip plan, merged pull requests in `messyvirgo-coin/messyvirgo-platform`, `messyvirgo-coin/messyvirgo-com`, and `MessyFranco/Dashboard`, product and ops files of the week, and the Fund Update snapshot. Only verified claims. Do not embellish a pull request title. Verify a product price or scope on the live endpoint. If a source cannot be reached, say so. Do not guess.

Self-check each bullet: "Would a holder find this interesting and does it show real progress?" Replace or drop a bullet that fails.

1. Marketing (`text-pink-400`, wrapper `mb-6` unless it is the last section). Real marketing, including internal marketing process improvements: video format, independent quality checks, and the reach method.
2. Business &amp; Operations (`text-orange-400`, wrapper `mb-6` unless it is the last section). Product and operations, including the x402 Token Checker and x402 products (Messy Virgo products, not marketing), the website, the Fund Update, and tools.

There is no Product Development section. When a week reports on Fund OS, add `Founders' project: Fund OS` (`text-founders`) after Marketing and Business. The association's own site tools, if any, use `Tools and website` (`text-blue-400`). The last section uses an outer `<div>` without `mb-6`.

Copy classes from the current newest entry. English. Past tense. A bullet that is not sourced inside the window does not ship.

## Inputs required each week

Inventory first. One source per bullet. If a source is missing, skip that claim. Do not fill the gap. Do not guess.

1. **go-records, the X post log, and the clip plan** for the Monday-to-Sunday window (ICT).
2. **Merged pull requests** in `messyvirgo-coin/messyvirgo-platform`, `messyvirgo-coin/messyvirgo-com`, and `MessyFranco/Dashboard` whose merge time falls inside the window (convert UTC to ICT). Describe the effect. Do not embellish the title.
3. **Product and ops files of the week.** For a product price or scope, verify the live endpoint.
4. **This website repo.** `git log` for the window. Blog posts under `_blog/_posts/` whose `date` falls in the window. Do not turn a side mention into a claim that Messy Virgo built Fund OS.
5. **Fund Update snapshot** `_blog/_snapshots/<date>-messy-fund-update.snapshot.json` for the Saturday inside the window. Quote process numbers. Do not recompute them. If the total does not equal the sum of the outcome counts, publish only the total, or omit the figures. Do not invent the missing outcomes.
6. **Founders' block only:** Fund OS process changes from `messyvirgo-coin/messyvirgo-platform`, described by effect. A public snapshot may supply the session total. Do not add performance.

## Where the inputs are

| Input | Where |
| --- | --- |
| Page, CTA, sitemap | `about/buildlog.html`, `sitemap.xml.njk` |
| Blog and fund stubs | `_blog/_posts/` |
| Fund process numbers | `_blog/_snapshots/*-messy-fund-update.snapshot.json` |
| Public site commits | `git log` on this repo, dates in ICT |
| Live check of a fund page | `https://www.messyvirgo.com/updates/` |
| Founders' block | `messyvirgo-coin/messyvirgo-platform` merged PRs, plus the Fund Update snapshot for process totals |

## Exclusion list

Only these. Do not add stricter bans.

- Credentials and keys
- Server, security, and access details
- Exact Token Checker scoring logic
- Fund OS performance: NAV, returns, book rankings, holding weights, PnL
- Raid2Earn, volume bots, wallets
- BANG LULU
- Contract or private legal matters
- The name Franco in a new entry
- The abbreviation `pp`
- Any claim that Messy Virgo or the association built, shipped, developed, ran, financed, or owns Fund OS, the platform, the CLI, the Regime Engine, the Fund Engine, the screener, or the stack

Internal marketing process improvements are in scope. A public product price is in scope when the live endpoint confirms it. A contract address is not a wallet.

## Local preview commands

From the repo root:

```bash
npm ci
npm run build:css
npm run build
npm run dev
```

Then open `http://localhost:8080/buildlog.html`.

`npm run dev` is Tailwind watch plus Eleventy on port 8080. If CSS is already built, `npm run serve` is enough for a second look.

Also open `preview/buildlog-draft-YYYY-MM-DD.html` directly in a browser. That file must render with no network.

Check the dev page at 1280px and 360px: Marketing, Business & Operations, plus the Founders' block when the week reports on Fund OS, one CTA under the newest week, the previous week directly under the CTA, no horizontal overflow. Screenshot both widths for the PR.

## Done criteria

- First `.buildlog-entry` is the newest Monday–Sunday week. Never edit or correct older entries. Only add the new week.
- `Community CTA Section` appears once, directly after that entry.
- `data-week` and the visible label match the formats above. The label uses `&ndash;`.
- Build log `lastmod` is the newest Sunday.
- Bullets are English, past tense, sourced inside the window, about 26 to 31 words when that serves the substance. About four per section is the target, not a quota. Each bullet names a change or finding and why it matters. No activity counts, cleanup notes, or single-ticker screening filler.
- Inventory first, one source per bullet. Self-check: "Would a holder find this interesting and does it show real progress?" The reference entry is `Week of November 2&ndash;8, 2026`.
- No Product Development section. No em dash in bullet text.
- The fixed notice and the fixed Fund OS sentence are unchanged, and they appear once.
- `npm run build` exits 0.
- `npm run dev` serves `/buildlog.html`.
- The standalone preview has the new entries and no external URLs in `src` or `href` that the browser fetches on load (no Google fonts, no remote images).
- Draft only until there is an explicit go to push to the default branch and a separate go for the X post. This runbook does not authorize either.
