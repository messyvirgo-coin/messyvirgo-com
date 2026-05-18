## Context

messyvirgo.com is an Eleventy 11ty site styled with Tailwind CSS. The blog (`_blog/`, `blog/`, `_includes/post.njk`) is mature, opinionated, and explicitly out of scope. The non-blog content pages have grown organically: `index.html` is utility-first Tailwind, `litepaper.html` is built around a custom `.mv-*` class library plus a per-page `litepaper.css`, `about/treasury.html` loads both `buildlog.css` and `litepaper.css`, and the three `legal/*.html` pages embed inline `<style>` blocks with raw hex colors.

A solid token layer already exists in `css/base.css` (CSS custom properties like `--mv-accent-pink`, `--mv-glass-bg`, `--mv-border-radius`) and shared classes (`.text-gradient`, `.glassmorphism`, `.btn-primary`). These are good. The problem is that the tokens are not exposed to Tailwind, and pages have layered alternative systems on top instead of consuming them. We will treat `base.css` as the canonical source, expose the same tokens through `tailwind.config.js`, and fold the per-page CSS files into it.

Stakeholders: site owner (single maintainer). No external consumers of the class names are known.

## Goals / Non-Goals

**Goals:**
- One canonical design schema: same container width, heading scale, card style, button style on every non-blog content page.
- Tokens defined in exactly one place (CSS variables in `base.css`) and surfaced through Tailwind so authors can write either `bg-mv-glass` or use the `.mv-card` class and get the same value.
- Zero per-page CSS files for content pages. `css/litepaper.css`, `css/buildlog.css`, and `css/founder-profiles.css` are merged into `base.css` or replaced with utilities.
- Zero inline `<style>` blocks on content pages.
- Migration that can ship page-by-page without a flag day — partially-migrated pages still render correctly.

**Non-Goals:**
- Redesigning the visual identity. We are aligning what exists, not introducing new colors or fonts.
- Touching the blog. `_blog/`, `blog/`, `_includes/post.njk`, `_includes/fund-update-post.njk`, and the `.prose*` rules in `base.css` stay as-is.
- Building a component library / Storybook. The schema lives in `base.css` + `tailwind.config.js` + a short reference in `openspec/specs/design-system/spec.md`.
- Build-time linting to enforce the schema. Reviewer judgment + the spec is the enforcement mechanism for now.

## Decisions

**D1. CSS variables in `base.css` are the source of truth; Tailwind reads from them.**
Alternative considered: move everything into `tailwind.config.js` and delete the CSS variables. Rejected because the `.text-gradient` and `.glassmorphism` classes already reference the variables, and several CSS-only contexts (e.g. the `linear-gradient` in `.text-gradient`) cannot be expressed cleanly as Tailwind utilities. Keeping variables as the source and mirroring them into Tailwind theme keys lets both worlds use the same numbers.

**D2. Container width tiers: `prose` (narrow) and `content` (wide).**
- `max-w-content` = `80rem` (1280px) — used by all marketing / dapp / about pages. Aliases today's `max-w-7xl`.
- `max-w-prose` = `48rem` (768px) — used by legal pages and any long-form text body. Aliases today's `max-w-4xl` on `legal/*`.
Alternative considered: three tiers (narrow, medium, wide). Rejected — no current page needs a middle tier, and YAGNI. We can add one later if a real use case appears.

**D3. Section padding is uniform: `py-16 md:py-24` on the outer page wrapper.**
Alternative considered: token-based spacing (`py-mv-section`). Rejected — the existing `py-16 md:py-24` is already on the majority of content pages, it's readable in HTML, and a single token doesn't earn its keep when only one section-padding value exists.

**D4. Heading scale is fixed by level and applied via a `.mv-h1` / `.mv-h2` / `.mv-h3` family in `base.css`, not by repeating Tailwind utilities on every heading.**
- `.mv-h1`: `text-4xl md:text-5xl font-bold text-gradient`
- `.mv-h2`: `text-3xl md:text-4xl font-bold text-gradient`
- `.mv-h3`: `text-xl md:text-2xl font-semibold text-white`
Rationale: today the same H2 is styled three different ways across pages. The Tailwind-string approach failed because authors omitted parts of the string. A semantic class is harder to get wrong and trivially auditable. The class compiles down to the same utilities via `@apply`, so we keep utility-first principles without the copy-paste failure mode. The hero on `index.html` is exempted (it intentionally goes larger).

**D5. Card system has exactly two variants: `.mv-card` (standard glassmorphism) and `.mv-card--feature` (hover-glow modifier).**
The current `.glassmorphism`, `.mv-card`, `litepaper-box`, `vision-card`, and `founder-card` all converge on roughly the same look. We collapse them. `.mv-card` is the base; `.mv-card--feature` adds the rotating conic-gradient glow that's currently on `index.html` feature cards. Existing class names (`glassmorphism`, `litepaper-box`, `vision-card`) become aliases that `@apply .mv-card` for one release so partial migration works, then are deleted in a follow-up change.

**D6. Buttons keep the existing `.btn` + `.btn-primary` / `.btn-secondary` API.**
It already works and is consistent. The migration is to delete the ad-hoc inline button styles on `index.html` and `messy-virgo-coin.html` that bypass it.

**D7. Legal pages get a single shared `.prose-legal` rule in `base.css` and use Tailwind utilities for layout.**
Replaces the three near-identical inline `<style>` blocks. `.prose-legal` styles `h2`, `h3`, `p`, `ul`, `a`, `strong` inside the legal content area only, using the canonical tokens (no hex colors).

**D8. Mobile-first and touch-optimized are non-negotiable.**
The site already has partial touch optimization (`.btn` gets a 44px min size below 768px, and `prefers-reduced-motion` is handled), but it is incomplete: clickable cards have no enforced hit-area minimum, hover-only affordances (card lift, dropdown reveal) have no `:active` / `:focus-visible` counterparts, and there's no rule preventing horizontal overflow at narrow viewports. We extend the spec to make these explicit, and during migration every page is verified at a 320px viewport with the browser's touch emulation on. Two implementation notes: (1) `:focus-visible` selectors are added alongside every `:hover` selector in `base.css`, mirroring the same visual state, and (2) the existing `min-height: 44px / min-width: 44px` rule in the `@media (max-width: 768px)` block is broadened from `.btn, button` to every interactive role (`.btn, button, a.mv-card, .nav-link, [role="button"]`). We do NOT pursue a separate mobile stylesheet — the same Tailwind responsive prefixes (`md:`, `lg:`) carry the design from mobile up.

**D9. Semantic-visual consistency is the overarching rule.**
Every requirement in the spec exists to enforce one principle: if two elements play the same role, they must look the same. Concretely this means: no page may introduce a one-off heading size, a bespoke paragraph color, a card padding that differs from `.mv-card`, or a button colored differently from `.btn-primary` — even "just for this section". When a real new variant is needed, it earns a name in the spec (e.g. `.mv-card--feature` already does). Three click patterns — button, clickable card, inline link — are picked by intent and then styled with the canonical class for that pattern; they are never blended (no card-shaped buttons, no button-shaped cards). This decision is the lens through which every PR touching a content page should be reviewed.

**D10. Migration order optimizes for visibility and risk reduction.**
1. Schema land: extend `tailwind.config.js`, expand `base.css` with the new heading + card + prose-legal rules, alias the old class names. Ship — no visual change yet.
2. Legal pages first: smallest, lowest risk, biggest visual win (removes the inline `<style>` blocks).
3. About pages: `treasury` (delete double CSS load), `association` (delete `litepaper.css` load), `founder-profiles` (fold custom CSS), `buildlog`.
4. Dapps pages: 6 files, similar template, batch migration.
5. Top-level pages: `messy-virgo-coin`, `litepaper` (the big one), `index` (last because it's the most exposed and already mostly conformant).
6. Cleanup: delete `css/litepaper.css`, `css/buildlog.css`, `css/founder-profiles.css`; remove alias classes from `base.css`.

## Risks / Trade-offs

- **[Risk] Visual regression on `litepaper.html` when removing `litepaper.css`** → Mitigation: migrate that page last; before/after screenshot diff at each step; aliases keep the old class names live during the transition so a single-page migration cannot break neighboring pages.
- **[Risk] Tailwind theme keys drift from CSS variables over time** → Mitigation: a short comment in both `base.css` and `tailwind.config.js` cross-references the other, and the spec scenarios assert the parity. A linter would be stronger; we'll accept review discipline for v1.
- **[Risk] Semantic heading classes (`.mv-h1`) feel un-Tailwindish to future contributors** → Mitigation: the spec documents the decision and the alternative we rejected; the classes are `@apply`'d Tailwind utilities, so the underlying styling is still inspectable in DevTools as Tailwind classes.
- **[Trade-off] Two-step deletion (alias, then remove)** adds one extra change. Worth it because it lets us migrate one page per PR instead of one giant atomic PR.
- **[Risk] We forget to migrate a page** → Mitigation: `tasks.md` lists every file explicitly; final task verifies no remaining references to deleted CSS files or class aliases via grep.

## Migration Plan

Implemented in `tasks.md`. Summary: ship the schema first (additive, no breakage), migrate pages in low-risk-first order, delete the aliases and per-page CSS files in a final cleanup task. Each page migration is independently verifiable — open the page, confirm container width / heading colors / card style match the spec.

Rollback: each step is a single commit; reverting any one commit returns that page to its prior state without breaking others, because aliases stay in place until the final cleanup.

## Open Questions

- None blocking. If the `.mv-h*` semantic-class approach (D4) proves awkward during migration, we can switch to a documented Tailwind-string convention without changing the spec's visible contract (the H2 still has to be `text-3xl md:text-4xl font-bold text-gradient`); the spec is written in terms of computed style, not class names, for exactly this reason.
