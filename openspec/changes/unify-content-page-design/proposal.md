## Why

The messyvirgo.com content pages (everything outside the Eleventy blog) have drifted into four overlapping styling systems: utility-first Tailwind, custom `.mv-*` classes in `css/base.css`, per-page CSS files (`litepaper.css`, `buildlog.css`, `founder-profiles.css`), and inline `<style>` blocks on the legal pages with raw hex colors. The result is visible inconsistency across pages — different container widths (`max-w-7xl` vs `max-w-4xl` vs `max-w-5xl`), heading colors that vary by page (H3 is `text-pink-400` on the litepaper but `text-white` elsewhere), card variants that don't share padding or borders, and section padding that ranges from `py-12` to `pb-28 md:pb-32`. The litepaper page is the most visible offender; `about/treasury.html` loads both `buildlog.css` and `litepaper.css`; legal pages use hex colors that no longer match the Tailwind palette. We need a single source of truth and to migrate the content pages onto it before we add any more pages.

## What Changes

- Define and document a unified design schema for all non-blog content pages, covering: design tokens (colors, spacing, radius, type scale), layout primitives (container widths, section padding), heading styles per level, body / lead / eyebrow text styles, a single card system with named variants, button styles, and a click-pattern selection rule (button vs clickable card vs inline link).
- Enforce the overarching principle of **semantic-visual consistency**: any two elements serving the same role (CTA, feature card, section heading, body paragraph, etc.) must render with identical computed styling across pages. One-off variations are forbidden; new variants must earn a name in the spec.
- Enforce **mobile-first, touch-optimized** behavior as a first-class spec requirement: every page must render at 320px without horizontal overflow, every interactive element must have a 44×44px minimum hit area on viewports ≤768px, every hover affordance must have an `:active` / `:focus-visible` counterpart so touch users get the same feedback, body text must be ≥16px on mobile, form inputs ≥16px to prevent iOS auto-zoom, and sticky elements must respect iOS safe-area insets.
- Promote the existing `css/base.css` tokens (`--mv-*` CSS variables) to the canonical source, extend `tailwind.config.js` so the same tokens are reachable as Tailwind utilities (e.g. `bg-mv-glass`, `text-mv-pink`, `max-w-content`), and remove duplicate definitions.
- Consolidate component CSS: fold `css/litepaper.css`, `css/buildlog.css`, and `css/founder-profiles.css` into `css/base.css` (or delete them where the same effect can be achieved with the canonical utilities) so no content page loads a page-specific stylesheet.
- Replace inline `<style>` blocks on `legal/imprint.html`, `legal/privacy.html`, `legal/terms.html` with shared utilities and a narrow `.prose-legal` rule in `base.css`.
- Migrate every non-blog content page to the schema: `index.html`, `litepaper.html`, `messy-virgo-coin.html`, `fund-update.njk` wrapper (not the post body), `about/association.html`, `about/buildlog.html`, `about/founder-profiles.html`, `about/treasury.html`, all six `dapps/*.html` pages, and all three `legal/*.html` pages.
- **BREAKING** (internal only): the custom class names `mv-page-header`, `mv-card`, `litepaper-box`, `vision-grid`, `vision-card`, `founder-card`, `buildlog-page`, `litepaper-page` either disappear or are redefined to alias the canonical tokens. Any external embed that depended on these classes would break — none are known to exist.
- Out of scope: the Eleventy blog (`_blog/`, `blog/`, `_includes/post.njk`, `_includes/fund-update-post.njk`, blog `.prose` rules) — these stay as-is per user direction.

## Capabilities

### New Capabilities
- `design-system`: The canonical design tokens, layout primitives, heading scale, card variants, and button styles used by every non-blog content page on messyvirgo.com. Defines both the visual contract (what every page must look like) and the implementation contract (which CSS variables, Tailwind utilities, and shared classes pages are allowed to use).

### Modified Capabilities
<!-- None: no existing OpenSpec specs to modify; this is the first spec in the repo. -->

## Impact

- **Code**: every file listed under "What Changes"; `css/base.css`; `tailwind.config.js`; possibly deletion of `css/litepaper.css`, `css/buildlog.css`, `css/founder-profiles.css`.
- **Build**: Tailwind rebuild required after `tailwind.config.js` changes; no new dependencies.
- **Blog**: untouched. Blog post layout, fund-update post body, and blog `.prose` rules remain as-is.
- **Risk**: visual regression on migrated pages. Mitigated by migrating one page at a time with a before/after screenshot check, and by keeping the existing `.mv-*` class names as aliases during the migration so partially-migrated pages still render.
- **No external API or data contract changes.**
