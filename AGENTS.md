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
- Preview: run `npm run watch:css` and `npm run serve` in separate terminals (`npm run dev` is Eleventy-only and does not rebuild Tailwind)

## Required Workflow (always follow)
1. Read the relevant source file(s) and nearby examples first.
2. Edit source only.
3. After any Tailwind class, CSS, or config change, run `npm run build:css`.
4. Before handing off, always run `npm run build`.
5. For visual changes, preview with `npm run serve` (mobile + desktop).

Detailed rules live in `.cursor/rules/`. Use the specialized skills for blog posts and weekly build logs. For general page edits, use the `messyvirgo-edit-webpage` skill.
