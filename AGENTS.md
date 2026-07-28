# Agent Instructions for messyvirgo-com

This is the public Messy Virgo website: a static Eleventy site using Tailwind CSS, shared custom CSS (`css/base.css` + page-specific files), and vanilla JavaScript.

## Key Files & Boundaries
- **Edit only source**: `*.html`, `about/**/*.html`, `legal/**/*.html`, `dapps/**/*.html`, `blog/**/*.njk`, `_blog/_posts/**/*.md`, `_includes/**/*.njk`, `css/**/*.css`, `js/**/*.js`, and config files.
- Never hand-edit `_site/` (generated) or `css/tailwind.css` (generated; rebuild instead).
- Tailwind content paths are defined in `tailwind.config.js`.

## Commands
- Install: `npm ci`
- Build CSS only: `npm run build:css`
- Full build: `npm run build`
- Preview: `npm run dev` (Tailwind watch + Eleventy at http://localhost:8080), or run `npm run watch:css` and `npm run serve` in separate terminals

## Required Workflow (always follow)
1. Read the relevant source file(s) and nearby examples first.
2. Edit source only.
3. After any Tailwind class, CSS, or config change, run `npm run build:css`.
4. Before handing off, always run `npm run build`.
5. For visual changes, preview with `npm run dev` (or `npm run serve` if CSS is already built) at mobile + desktop widths.

## Typography

- **Inter** is the default for body and headings (`css/base.css` sets `h1`–`h6` to Inter with tight letter-spacing).
- **Marketing / gradient titles:** use **`font-bold font-sans tracking-tight`** with **`text-gradient`** (see `index.html` hero and section `h2` patterns).
- **`.font-serif`** (Playfair) exists for edge cases only; do not revert section titles to Playfair without an explicit product decision.

Detailed rules live in `.cursor/rules/`. Use the specialized skills for blog posts, **Fund / Signal updates** (`messyvirgo-publish-fund-update` — week-story Fund Report `vnext-2026-07-24`, rule `25-messyvirgo-fund-report.mdc`), and weekly build logs. For general page edits, use the `messyvirgo-edit-webpage` skill.

## Public prose (blog + build log)

For `_blog/_posts/**/*.md`, `_drafts/**/*.md`, and `about/buildlog.html` bullet copy: follow `.cursor/rules/16-messyvirgo-public-prose.mdc`.

- **Do not** use em dashes (`—` / `&mdash;`) as clause separators in public prose.
- Prefer periods, commas, colons, parentheses, or short new sentences.
- Aim for a direct human technical voice (technical readers treat dense em-dash cadence as an AI tell).
- Build log **week labels** may keep the existing HTML en dash convention (`July 21&ndash;27`); that exception is for date ranges only, not body bullets.

## Blog post images

Article images are styled globally in `_includes/post.njk` (centered figure, border, caption). In Markdown use `![caption label](/images/blog/file.png)` — **alt text becomes the visible caption**. Place images after a paragraph, not directly under a heading. Full rules: `.cursor/rules/15-messyvirgo-blog-images.mdc`.
