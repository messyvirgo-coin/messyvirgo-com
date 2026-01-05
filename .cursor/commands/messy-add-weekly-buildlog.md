# Add Weekly Build Log Entry (messyvirgo-com)

## Goal
Add a **new weekly build log entry** to `buildlog.html` at the **top of the timeline**, ensure the **Community CTA section** appears **immediately after the newest entry**, and update the sitemap to reflect the buildlog page modification date.

## Input (you must ask me for this first)
Ask the user to paste a weekly summary in this structure (freeform text is ok as long as the sections are clear):

- Week of December 15–21, 2025
- Marketing
  - bullets...
- Business & Operations
  - bullets...
- Product Development
  - bullets...

If the user doesn’t provide the week range in both forms, ask:
- the display label: `Week of <Month> <D>–<D>, <YYYY>` (note the en dash)
- the `data-week` attribute: `<Mon> <D>-<D>, <YYYY>` (example: `Dec 15-21, 2025`)

## Rules / Formatting
- Keep **exactly** the existing HTML structure and Tailwind classes used by other entries.
- Use an **en dash** in the displayed week line: `December 15–21, 2025`.
- Keep the `data-week` attribute format consistent with other entries, e.g. `Dec 15-21, 2025`.
- Preserve indentation style used in `buildlog.html`.
- Bullet lists must be `<ul><li>...</li></ul>` under each section.

## Steps
1. Open `buildlog.html` and find the buildlog timeline container:
   - `      <div class="buildlog-timeline text-left">`
2. Ensure the **Community CTA Section** exists only once:
   - It starts with `<!-- Community CTA Section -->`
   - It ends with `</section>`
3. Insert a new entry **immediately after** the opening timeline div (so it becomes the newest entry):

   - Wrapper:
     - `<div class="buildlog-entry fade-in" data-week="...">`
     - `<div class="mv-card buildlog-entry-card"> ...`
   - Sections inside the entry body, in this order:
     - Marketing (pink)
     - Business & Operations (orange)
     - Product Development (blue)

4. Move the **Community CTA Section** so it appears **right after** the newly inserted entry (between the newest entry and the next entry).
   - Do not change CTA content, only its position.
5. Verify the next entry after CTA is the previous newest buildlog entry (the one that used to be at the top).
6. Update the sitemap (`sitemap.xml.njk`) to reflect the buildlog page update:
   - Find the buildlog.html entry in the sitemap
   - Update the `<lastmod>` date to the end date of the week being added (format: `YYYY-MM-DD`, e.g., `2026-01-04` for the week ending January 4, 2026)

## Done criteria
- The newest week is the **first** `.buildlog-entry` in the timeline.
- The CTA section is placed **directly after** the newest entry.
- No duplicate CTA sections.
- HTML remains valid and consistent with existing entries.
- The sitemap's buildlog.html entry has been updated with the correct `<lastmod>` date (end date of the week being added).


