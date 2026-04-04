---
name: messyvirgo-weekly-buildlog
description: Adds a new weekly build log entry to the Messy Virgo site at the top of the timeline, repositions the Community CTA once, and updates sitemap lastmod. Use when publishing weekly build updates, adding a build log week, /messy-add-weekly-buildlog, or editing about/buildlog.html for progress summaries.
---

# Messy Virgo weekly build log

## Files

- **Build log source**: `about/buildlog.html` (Eleventy `permalink: /buildlog.html` — not a root-level `buildlog.html`).
- **Sitemap**: `sitemap.xml.njk` — update the `<url>` whose `<loc>` is `https://www.messyvirgo.com/buildlog.html`.

## Input from the user

Prefer this shape (freeform ok if sections are obvious):

1. Week line: `Week of <Month> <D>–<D>, <YYYY>` (en dash in the label).
2. **Marketing**, **Business & Operations**, **Product Development** with bullets.

If unclear, ask for:

- **Display**: `Week of March 2–8, 2026` (en dash between day numbers).
- **`data-week`**: short month, hyphen between days, e.g. `Mar 2-8, 2026`.

**Cross-month weeks**: match existing entries — e.g. `data-week="Feb 23-Mar 1, 2026"` and display `Week of February 23, 2026 – March 1, 2026` (spelled month + en dash around the year break).

## Section order inside each entry

Always this order (reorder user bullets if they paste sections out of order):

1. Marketing — `text-pink-400` heading, `mb-6` wrapper.
2. Business & Operations — `text-orange-400`, `Business &amp; Operations` in the heading, `mb-6` wrapper.
3. Product Development — `text-blue-400`, last block uses `<div>` without `mb-6` on the outer section (same as existing entries).

Copy structure, classes, and nesting from the **current newest** `.buildlog-entry` — do not invent new markup.

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

**Do not** change CTA inner content when moving it — only position.

## Insert workflow (avoid dropping a week)

1. Open `about/buildlog.html`, find `      <div class="buildlog-timeline text-left">`.
2. **Preferred**: Insert the new complete `.buildlog-entry` **immediately after** the opening timeline div, then move the CTA to sit **between** the new entry and the **former** top entry.
3. **Or** replace only the former top entry’s opening tag through its closing `</div>` with: `new entry` + `CTA` + `same former top entry` — never delete the previous week’s full block unless intentionally archiving.
4. Confirm with search: `Community CTA Section` count is **1**.
5. Confirm order: first `.buildlog-entry` is the new week; entry after `</section>` is the previous week.

## Sitemap

In `sitemap.xml.njk`, set `<lastmod>` for the buildlog URL to the **week’s end date** in `YYYY-MM-DD` (Sunday if the week is Mon–Sun, or the user-supplied end date).

## Done criteria

- [ ] First `.buildlog-entry` in the timeline is the new week.
- [ ] CTA directly follows that entry; no duplicate CTA.
- [ ] `data-week` and display line match repo conventions and use en dashes in the visible week line.
- [ ] Build log `lastmod` in `sitemap.xml.njk` matches the week end date.

## Related

- Slash command: `.cursor/commands/messy-add-weekly-buildlog.md` (same workflow; file path is `about/buildlog.html`).
