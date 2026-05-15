---
name: messyvirgo-edit-webpage
description: Edit existing Messy Virgo website pages safely while preserving Eleventy, Tailwind, shared CSS, SEO, responsive behavior, and build verification. Use when changing page copy, sections, layout, styling, metadata, navigation, or general website content outside the blog-post and weekly-buildlog specialist workflows.
---

# Edit Messy Virgo Webpage

Follow AGENTS.md + the three `.cursor/rules/` files. This skill provides the actionable checklist for general page edits.

## First Checks
1. Identify source file + public URL (respect `permalink` front matter).
2. Blog post? → use `publish-blog-post`. Weekly build log? → use `messyvirgo-weekly-buildlog`.
3. Read nearby/similar pages first for markup & class consistency.

## Core Edit Rules
- Edit source only (never `_site/`).
- Preserve shared includes (`head-common`, `nav`, `footer`).
- Reuse patterns: `.mv-page-header`, `.mv-section`, `.mv-card`, `.glassmorphism`, `.text-gradient`, `.fade-in`, `.btn*`.
- Maintain dark visual system, pink/gold accents, Inter typography (including section titles; `font-sans tracking-tight` with `text-gradient` where used).
- Copy: factual, public-safe. No financial advice, promises, secrets, or private data.
- External links: `target="_blank" rel="noopener noreferrer"`.
- Images: meaningful `alt` text.

## CSS / Tailwind (see rule 20)
- Tailwind utilities for layout/spacing.
- Shared styles → `css/base.css`; page-only → existing page CSS file.
- Never hand-edit `css/tailwind.css`.
- Any Tailwind class / CSS / config change → `npm run build:css`.

## SEO / Metadata (new or major edits)
- Verify `<title>`, meta description, OG/Twitter tags, canonical under `https://www.messyvirgo.com/`, structured data.
- Update `sitemap.xml.njk` when needed.

## Verification (mandatory before handoff)
1. `npm run build`
2. Visual change? → `npm run dev` (or `npm run serve` if Tailwind is already watching) + check mobile/desktop widths on the local URL.
3. `git status --short` should show only intentional source changes (+ generated `css/tailwind.css` if applicable).

## Done Criteria
- Source-only changes.
- Styling matches nearby pages.
- No responsive issues (overflow, overlap, clipped text).
- `npm run build` passes.
- Response states what changed + which verification commands ran.
