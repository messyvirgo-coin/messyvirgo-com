# Weekly Build Log Runbook

Public page: `about/buildlog.html` (permalink `/buildlog.html`).
Skill: `.cursor/skills/messyvirgo-weekly-buildlog/SKILL.md`.
Prose: `.cursor/rules/16-messyvirgo-public-prose.mdc`.

This runbook is the Monday-evening procedure. It is not a public page. `docs/` and `preview/` are listed in `.eleventyignore`.

## When

- Clock: Asia/Bangkok (ICT, UTC+7).
- Week window: Monday 00:00 through Sunday 24:00 ICT. The entry covers that closed week only.
- Publish target: the following Monday evening, 18:00 to 24:00 ICT.
- Do not include the Monday of the publish day. That Monday starts the next window.
- One `.buildlog-entry` per week. A catch-up is several entries in one change, newest first, not one merged block.
- The week of 26 October to 1 November 2026 is the first window after the October 2026 catch-up. It belongs in the Monday 2 November 2026 draft.

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

Sections, in order, about four bullets each:

1. Marketing (`text-pink-400`, wrapper `mb-6`)
2. Business &amp; Operations (`text-orange-400`, wrapper `mb-6`)
3. Product Development (`text-blue-400`, outer `<div>` without `mb-6`)

Copy classes from the current newest entry. English. Past tense. A bullet that is not sourced inside the window does not ship.

## Inputs required each week

Deliver these before the draft. If one is missing, skip that claim. Do not fill the gap.

1. **Site repo** `messyvirgo-coin/messyvirgo-com` (this repo).
   - `git log --since='<Monday 00:00 ICT>' --until='<next Monday 00:00 ICT>' --date=iso-strict --pretty=format:'%h %ad %s'`
   - Blog posts under `_blog/_posts/` whose `date` falls in the window. Read the post. Do not promote a side mention that is on the exclusion list.
   - Fund update stub plus `_blog/_snapshots/<date>-messy-fund-update.snapshot.json` for the Saturday inside the window.
2. **Fund process numbers, quoted, not recomputed.** From `weeklyRollup` and `weeklyHighlights` and `sessionContext.weekPath.label` and `signalExample`:
   - total sessions, executed, holds
   - regime path label
   - which symbol led aggregate screens
   - a reader note that is itself public (for example a new book joining the suite)
   - Do not add NAV, returns, rankings, or a sum you calculated to explain a gap in the quoted counts.
3. **Platform releases and merged PRs** in `messyvirgo-coin/messyvirgo-platform`.
   - Assign each merged PR to the week by `merged_at` converted to ICT.
   - Describe a change in the public log only after it is in a release. A PR merged inside the window but not yet in a release waits.
   - If the repo is not readable from the agent, fall back to release `published_at` in ICT and write that limitation in the PR body. Do not guess a merge minute you cannot see.
   - Monday releases just after 00:00 ICT can contain Sunday merges. When merge time is unknown, do not describe that one-PR release unless its title is already in the input file.
4. **Marketing input file**, one per week, not stored in this repo today:
   - Path on the marketing side: `build-log/BUILD-LOG-INPUTS-<YYYY-MM-DD>_<YYYY-MM-DD>.md`
   - Column `oeff.`: use `j` only. Use `?` only when the task explicitly allows that item. Never use `n`.
   - Each row needs a date inside the window and a source (URL, commit, snapshot field).
5. **Virgo Alpha OS** (`MessyFranco/virgo-alpha-os`), only if something merged inside the window.
   - Public wording is process only: guided paper-review wizard, OpenSpec as the change workflow, deploy locked until a backtest is saved.
   - No code, no performance, no auth secrets, no allowlists.
6. **X / YouTube URLs with timestamps** for items you will name (Market Mood card number and date, Fund Update announcement, a short). No impression or follower counts.

## Where the inputs are

| Input | Where |
| --- | --- |
| Page, CTA, sitemap | `about/buildlog.html`, `sitemap.xml.njk` |
| Blog and fund stubs | `_blog/_posts/` |
| Fund process numbers | `_blog/_snapshots/*-messy-fund-update.snapshot.json` |
| Public site commits | `git log` on this repo, dates in ICT |
| Platform releases and merge times | GitHub `messyvirgo-coin/messyvirgo-platform` (private; needs repo access) |
| Virgo Alpha OS merges | GitHub `MessyFranco/virgo-alpha-os` (private; needs repo access) |
| Marketing rows with `oeff.` | Marketing workspace file named above. Not in this repo. |
| Live check of a fund page | `https://www.messyvirgo.com/updates/2026/10/messy-fund-update-week-of-<date>/` |

## Exclusion list

Do not publish any of these, even if a source mentions them:

- Fund OS performance: NAV, returns, book rankings, holding weights, PnL
- Reach, impressions, follower counts
- BANG LULU, Cleondris, Framingo
- Holding structure, domicile, location-as-legal-seat, taxes
- Wallet addresses, secrets, keys, payment amounts, cost figures
- Internal routines, incident files, acceptance rates, VPS audits, dashboards
- Raid2Earn, rewards internals, Telegram announcements that are drafts or unverified posts
- Listing applications that are not confirmed sent
- Pull requests that are not in a release. As of 27 October 2026 that includes platform PRs 2035 through 2042. Re-check the open set every week. The numbers will change.
- Virgo Alpha OS code, performance, or work that merged after Sunday

If a file says "unbelegt", do not write it as done.

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

Check the dev page at 1280px width: three sections per new week, one CTA under the newest week, the previous week directly under the CTA, no horizontal overflow. Screenshot that view for the PR.

## Done criteria

- First `.buildlog-entry` is the newest Monday–Sunday week.
- `Community CTA Section` appears once, directly after that entry.
- `data-week` and the visible label match the formats above. The label uses `&ndash;`.
- Build log `lastmod` is the newest Sunday.
- Bullets are English, past tense, sourced inside the window, about four per section.
- No em dash in bullet text.
- `npm run build` exits 0.
- `npm run dev` serves `/buildlog.html`.
- The standalone preview has the new entries and no external URLs in `src` or `href` that the browser fetches on load (no Google fonts, no remote images).
- Draft only until there is an explicit go to push to the default branch and a separate go for the X post. This runbook does not authorize either.

## What is still missing before this can run unattended

Recorded after the 27 October 2026 catch-up:

1. Read access to `messyvirgo-coin/messyvirgo-platform` for release notes and `merged_at`. This agent received HTTP 404. Product lines in the October catch-up follow release publish dates from the 27 October fact base, not a fresh merge-time query.
2. Read access to `MessyFranco/virgo-alpha-os`. Wizard, OpenSpec, and the deploy lock were merged 26–27 October 2026, outside the three closed weeks, so they are not in this draft. The next Monday draft needs the repo.
3. A per-week marketing file `build-log/BUILD-LOG-INPUTS-<from>_<to>.md` with the `oeff.` column, dropped somewhere this repo can read. The 27 October fact base was one bundle for 5–27 October, not three weekly files, and it does not live in the site repo.
4. A public-safe wording sheet for platform release titles. The fact base says that file was not found.
5. X API access for card-level checks. The connector returned `client-not-enrolled` on 27 October 2026. Public web mirrors covered some posts. They are not a stable input.
6. A yes/no on `?` rows (for example the volume-VPS security recheck). Until that yes is written in the weekly input, leave them out.
7. Confirm whether SolidProof KYC on the founders page (commits 4 October 2026, 20:06–20:27 ICT, after the last published log) should be backfilled. It is outside 5–25 October, so this draft omits it.
8. Explicit go, separate from the draft, before merging to the default branch and before the X announcement. The X post summarizes the live page, not one bullet, and only after the page is actually public.
