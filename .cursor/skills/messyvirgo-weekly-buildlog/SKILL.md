---
name: messyvirgo-weekly-buildlog
description: Adds a new weekly build log entry to the Messy Virgo site at the top of the timeline, repositions the Community CTA once, and updates sitemap lastmod. Use when publishing weekly build updates, adding a build log week, /messy-add-weekly-buildlog, or editing about/buildlog.html for progress summaries.
---

# Messy Virgo weekly build log

## Files

- **Build log source**: `about/buildlog.html` (Eleventy `permalink: /buildlog.html` – not a root-level `buildlog.html`).
- **Sitemap**: `sitemap.xml.njk` – update the `<url>` whose `<loc>` is `https://www.messyvirgo.com/buildlog.html`.

## Week window

As of the October 2026 catch-up, a build log week is **Monday through Sunday** (ICT, UTC+7). Publish on **Monday evening** for the week that just ended. Do not include Monday of the publish day, and do not start the next week early.

- **Display** (same month): `Week of October 19&ndash;25, 2026`
- **`data-week`**: `Oct 19-25, 2026` (short month, hyphen, no en dash)
- **Sitemap `lastmod`**: that Sunday, `YYYY-MM-DD` (example `2026-10-25`)

A catch-up is still **one `.buildlog-entry` per week**, newest first, not one merged block. The Community CTA sits directly under the newest entry only.

Full inputs, exclusion list, preview commands, and done checks: `docs/weekly-build-log-runbook.md`.

## Input from the user

Prefer this shape (freeform ok if sections are obvious):

1. Week line: `Week of <Month> <D>–<D>, <YYYY>` (en dash in the label). Monday–Sunday.
2. **Marketing**, **Business & Operations**, **Product Development** with bullets. About four bullets per section. Every bullet needs a source inside the week. Past tense. No em dash in the bullet text.

If the week line is missing, use Monday–Sunday for the week that ended the day before a Monday-evening publish. Still ask when a bullet has no source.

- **Display**: `Week of October 5&ndash;11, 2026` (en dash between day numbers).
- **`data-week`**: short month, hyphen between days, e.g. `Oct 5-11, 2026`.

**Cross-month weeks**: match existing entries – e.g. `data-week="Feb 23-Mar 1, 2026"` and display `Week of February 23, 2026 – March 1, 2026` (spelled month + en dash around the year break). Same rule if a Monday–Sunday week crosses a month.

## Section order inside each entry

Always this order (reorder user bullets if they paste sections out of order):

1. Marketing – `text-pink-400` heading, `mb-6` wrapper.
2. Business & Operations – `text-orange-400`, `Business &amp; Operations` in the heading, `mb-6` wrapper.
3. Product Development – `text-blue-400`, last block uses `<div>` without `mb-6` on the outer section (same as existing entries).

Copy structure, classes, and nesting from the **current newest** `.buildlog-entry` – do not invent new markup.

## Public prose for bullets

Follow `.cursor/rules/16-messyvirgo-public-prose.mdc` for Marketing / Business / Product bullet copy:

- Prefer periods/commas/colons over `&mdash;` clause separators in `<li>` text.
- Keep week **display** labels on the existing en dash HTML convention (`Week of July 21&ndash;27, 2026`).

## HTML snippet pattern

Each week is one `.buildlog-entry`:

- Root: `<div class="buildlog-entry fade-in" data-week="...">`
- Card: `<div class="mv-card buildlog-entry-card">` → header (`buildlog-entry-week`) → `buildlog-entry-content` → `buildlog-entry-body`
- Each section: `<div class="mb-6">` or final section plain `<div>`, `<h4 class="...">`, `<ul><li>...</li></ul>`
- Escape `&` in copy as `&amp;` where needed (e.g. “Liquidity &amp; Market-Making”).

## Community CTA placement

- Marker: `<!-- Community CTA Section -->` through closing `</section>` of `buildlog-hero`.
- There must be **exactly one** CTA in the timeline.
- Order inside `<div class="buildlog-timeline text-left">`:
  1. Newest `.buildlog-entry`
  2. CTA `section`
  3. All older `.buildlog-entry` blocks (newest-first)

**Do not** change CTA inner content when moving it – only position.

## Insert workflow (avoid dropping a week)

1. Open `about/buildlog.html`, find `      <div class="buildlog-timeline text-left">`.
2. **Preferred**: Insert the new complete `.buildlog-entry` **immediately after** the opening timeline div, then move the CTA to sit **between** the new entry and the **former** top entry.
3. **Or** replace only the former top entry’s opening tag through its closing `</div>` with: `new entry` + `CTA` + `same former top entry` – never delete the previous week’s full block unless intentionally archiving.
4. Confirm with search: `Community CTA Section` count is **1**.
5. Confirm order: first `.buildlog-entry` is the newest week; the entry after `</section>` is the next week down. On a multi-week catch-up that is the previous new week, not the old top of the log.

## Sitemap

In `sitemap.xml.njk`, set `<lastmod>` for the buildlog URL to the **week’s Sunday** in `YYYY-MM-DD`. When several weeks are inserted together, `lastmod` is the Sunday of the newest entry only.

## Done criteria

- [ ] First `.buildlog-entry` in the timeline is the new week.
- [ ] CTA directly follows that entry; no duplicate CTA.
- [ ] `data-week` and display line match repo conventions and use en dashes in the visible week line.
- [ ] Build log `lastmod` in `sitemap.xml.njk` matches the newest week’s Sunday.
- [ ] Bullet text is past tense, sourced inside that Monday–Sunday window, and has no em dash. About four bullets per section. Exclusions and commands: `docs/weekly-build-log-runbook.md`.

