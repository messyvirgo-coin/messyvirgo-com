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

Do not add a Product Development section. Put Fund OS, platform, CLI, engine, and screening notes in a block headed exactly `Founders' project: Fund OS`, in the third person (`The founders' Fund OS` or `The founders`). Do not read platform pull requests, and do not describe those notes as Messy Virgo work. Website, content, and the association's own tools stay under Marketing, Business & Operations, or `Tools and website`.

Private or non-public matters are never included.

## When

- Clock: Asia/Bangkok (ICT, UTC+7).
- Week window: Monday 00:00 through Sunday 24:00 ICT. The entry covers that closed week only.
- Publish target: the following Monday evening, 18:00 to 24:00 ICT.
- Do not include the Monday of the publish day. That Monday starts the next window.
- One `.buildlog-entry` per week. A catch-up is several entries in one change, newest first, not one merged block.

## What to produce

1. Newest entry at the top of `<div class="buildlog-timeline text-left">` in `about/buildlog.html`.
2. Exactly one Community CTA (`<!-- Community CTA Section -->`) directly under that newest entry. Move it. Do not edit its contents.
3. Older entries stay newest-first under the CTA.
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

Sections, in order, about four bullets each. Plain English, about 26 words, no jargon.

1. Marketing (`text-pink-400`, wrapper `mb-6` unless it is the last section)
2. Business &amp; Operations (`text-orange-400`, wrapper `mb-6` unless it is the last section)

There is no Product Development section. When a week reports on Fund OS, add `Founders' project: Fund OS` (`text-founders`) after Marketing and Business. The association's own site tools, if any, use `Tools and website` (`text-blue-400`). The last section uses an outer `<div>` without `mb-6`.

Copy classes from the current newest entry. English. Past tense. A bullet that is not sourced inside the window does not ship.

## Inputs required each week

Deliver these before the draft. If one is missing, skip that claim. Do not fill the gap. Private or non-public matters are never included.

1. **This website repo.**
   - `git log` for the Monday-to-Sunday window, dates in ICT.
   - Blog posts under `_blog/_posts/` whose `date` falls in the window. Read the post. Do not turn a side mention into a claim that Messy Virgo built Fund OS.
   - Fund update stub plus `_blog/_snapshots/<date>-messy-fund-update.snapshot.json` for the Saturday inside the window.
2. **Fund process numbers, quoted, not recomputed.** From the public snapshot fields for that week:
   - total sessions
   - regime path label, worded in plain language
   - which symbol led the public token lists, attributed to the founders' Fund OS
   - a reader note that is itself public
   - If the total does not equal the sum of the outcome counts, publish only the total, or omit the figures. Do not invent the missing outcomes.
   - Do not add NAV, returns, rankings, or holding weights.
3. **Marketing notes for the week**, with a date inside the window and a source (URL, commit, or snapshot field). Skip any row that is not cleared for the public page.
4. **X / YouTube URLs with timestamps** for items you will name (a Market Mood card number and date, a Fund Update announcement, a short). No impression or follower counts. Do not fill a gap in a numbered card series.

Do not read platform pull requests. Do not mine private repositories for bullets.

## Where the inputs are

| Input | Where |
| --- | --- |
| Page, CTA, sitemap | `about/buildlog.html`, `sitemap.xml.njk` |
| Blog and fund stubs | `_blog/_posts/` |
| Fund process numbers | `_blog/_snapshots/*-messy-fund-update.snapshot.json` |
| Public site commits | `git log` on this repo, dates in ICT |
| Live check of a fund page | `https://www.messyvirgo.com/updates/` |

## Exclusion list

Do not publish any of these, even if a source mentions them:

- Any claim that Messy Virgo or the association built, shipped, developed, ran, financed, or owns Fund OS, the platform, the CLI, the Regime Engine, the Fund Engine, the screener, or the stack
- Fund OS performance: NAV, returns, book rankings, holding weights, PnL
- Reach, impressions, follower counts
- Private or non-public matters
- Wallet addresses, secrets, keys, payment amounts, cost figures
- Internal routines and unpublished drafts
- Listing applications that are not confirmed sent

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

Check the dev page at 1280px and 360px: Marketing and Business only, one CTA under the newest week, the previous week directly under the CTA, no horizontal overflow. Screenshot both widths for the PR.

## Done criteria

- First `.buildlog-entry` is the newest Monday–Sunday week.
- `Community CTA Section` appears once, directly after that entry.
- `data-week` and the visible label match the formats above. The label uses `&ndash;`.
- Build log `lastmod` is the newest Sunday.
- Bullets are English, past tense, sourced inside the window, about 26 words, about four per section.
- No Product Development section. No em dash in bullet text.
- The fixed notice and the fixed Fund OS sentence are unchanged, and they appear once.
- `npm run build` exits 0.
- `npm run dev` serves `/buildlog.html`.
- The standalone preview has the new entries and no external URLs in `src` or `href` that the browser fetches on load (no Google fonts, no remote images).
- Draft only until there is an explicit go to push to the default branch and a separate go for the X post. This runbook does not authorize either.
