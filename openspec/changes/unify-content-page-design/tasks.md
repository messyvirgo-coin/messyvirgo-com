## 1. Schema foundation (no visual change)

- [ ] 1.1 Extend `tailwind.config.js`: add `theme.extend.maxWidth.content = '80rem'` and `theme.extend.maxWidth.prose = '48rem'`; add `theme.extend.colors.mv` mirroring the `--mv-*` CSS variables (`pink`, `gold`, `bg-dark`, `text-primary`, `text-secondary`, `text-muted`, `glass`, `glass-hover`, `glass-border`)
- [ ] 1.2 Add `.mv-h1`, `.mv-h2`, `.mv-h3` semantic classes to `css/base.css` using `@apply` of the Tailwind utilities defined in spec requirement "Heading Scale by Level"
- [ ] 1.2a Add `.mv-body`, `.mv-lead`, `.mv-eyebrow` semantic classes to `css/base.css` matching spec requirement "Body Text, Lead Paragraphs, and Eyebrow Labels"
- [ ] 1.3 Refactor `.mv-card` in `css/base.css` to be the canonical card; add `.mv-card--feature` modifier that adds only the rotating conic-gradient glow (move the relevant rules out of `.card-glow-container`)
- [ ] 1.4 Add alias rules in `css/base.css`: `.glassmorphism`, `.litepaper-box`, `.vision-card`, `.founder-card` each `@apply .mv-card` so partially-migrated pages keep rendering
- [ ] 1.5 Add `.prose-legal` rule to `css/base.css` covering `h2, h3, p, ul, a, strong` descendants using only `--mv-*` variables (no hex literals)
- [ ] 1.6 Touch-optimize `css/base.css`: broaden the existing `@media (max-width: 768px) { min-height: 44px; min-width: 44px }` rule from `.btn, button` to include `a.mv-card`, `.nav-link`, `[role="button"]`, and form inputs; add `:focus-visible` and `:active` selectors next to every `:hover` rule (card lift, button glow, dropdown reveal, nav link); add `input, select, textarea { font-size: 16px }` (or `1rem`) to prevent iOS auto-zoom; add `padding-top: env(safe-area-inset-top)` to the sticky `#navbar` rule
- [ ] 1.7 Run `npm run build` (or the project's Tailwind build command) and verify no errors; spot-check `index.html` in the browser at 320px width AND on desktop to confirm zero visual change

## 2. Legal pages (smallest, highest visual win)

- [ ] 2.1 Migrate `legal/imprint.html`: remove the inline `<style>` block, add `.prose-legal` to the content wrapper, replace `max-w-4xl` with `max-w-prose` (or leave `max-w-4xl` if the alias is preferred), confirm `py-16 md:py-24` on the outer wrapper
- [ ] 2.2 Migrate `legal/privacy.html`: same steps as 2.1
- [ ] 2.3 Migrate `legal/terms.html`: same steps as 2.1
- [ ] 2.4 Visual check all three legal pages in the browser; confirm headings, paragraph color, link underline behavior match the design

## 3. About pages

- [ ] 3.1 Migrate `about/treasury.html`: remove `<link>` to `css/buildlog.css` AND `css/litepaper.css`, remove `body class="buildlog-page"`, replace any `mv-card litepaper-box` with `mv-card`, ensure headings use `.mv-h2` / `.mv-h3` or the equivalent utility strings
- [ ] 3.2 Migrate `about/association.html`: remove `<link>` to `css/litepaper.css`, remove `body class="litepaper-page"`, replace `mv-card litepaper-box` and `vision-grid` / `vision-card` with `.mv-card` (using a Tailwind grid wrapper for the layout)
- [ ] 3.3 Migrate `about/founder-profiles.html`: remove `<link>` to `css/founder-profiles.css`, port `.founder-grid`, `.founder-card`, `.founder-avatar`, `.founder-info`, `.founder-quote` into either Tailwind utilities or scoped rules in `base.css` (prefer utilities; only fall back to `base.css` for the avatar-mask shape)
- [ ] 3.4 Migrate `about/buildlog.html`: align container width, section padding, heading classes, and card variant to the schema
- [ ] 3.5 Visual check all four about pages

## 4. Dapps pages

- [ ] 4.1 Migrate `dapps/crypto-macro-economics-report.html` to the schema (container, padding, headings, cards, buttons)
- [ ] 4.2 Migrate `dapps/crypto-token-performance-signals.html`
- [ ] 4.3 Migrate `dapps/crypto-token-security-signals.html`
- [ ] 4.4 Migrate `dapps/crypto-token-social-signals.html`
- [ ] 4.5 Migrate `dapps/crypto-token-technical-analysis.html`
- [ ] 4.6 Migrate `dapps/market-vibe-daily-base-app.html`
- [ ] 4.7 Visual check all six dapps pages; confirm they are visually consistent with each other

## 5. Top-level pages

- [ ] 5.1 Migrate `messy-virgo-coin.html`: replace any inline button restyling with `.btn .btn-primary` / `.btn .btn-secondary`; ensure section H2s use the canonical heading style; collapse the bespoke card padding to `.mv-card`
- [ ] 5.2 Migrate `litepaper.html`: this is the big one — remove `<link>` to `css/litepaper.css`, remove `body class="litepaper-page"`, replace every `mv-section`, `mv-card litepaper-box`, `vision-grid`, `vision-card`, `ecosytem-grid` with the schema equivalents; fix the rogue `text-pink-400` H3 (spec requirement "H3 color is not pink"); container stays `max-w-content`
- [ ] 5.3 Migrate `index.html`: replace the ad-hoc card padding (`py-12 px-8`) with `.mv-card` (and `.mv-card--feature` where the hover glow is needed); keep the hero exception per spec; ensure post-hero sections conform to `py-16 md:py-24`
- [ ] 5.4 Migrate the `fund-update.njk` wrapper (only the outer layout pieces it owns — NOT the `_includes/fund-update-post.njk` body, which is blog scope)
- [ ] 5.5 Visual check `index.html`, `messy-virgo-coin.html`, `litepaper.html`, and the fund-update page; compare against the screenshots captured before step 1

## 6. Cleanup and enforcement

- [ ] 6.1 Delete `css/litepaper.css`, `css/buildlog.css`, `css/founder-profiles.css`
- [ ] 6.2 Remove the alias rules added in 1.4 from `css/base.css` (`.glassmorphism` may stay if other code relies on it — confirm via grep first)
- [ ] 6.3 Grep enforcement: `grep -rE '<style' index.html litepaper.html messy-virgo-coin.html about/ dapps/ legal/` returns no matches
- [ ] 6.4 Grep enforcement: `grep -rE 'max-w-(5xl|6xl)' index.html litepaper.html messy-virgo-coin.html about/ dapps/ legal/` returns no matches (only `max-w-7xl`/`max-w-content`, `max-w-4xl`/`max-w-prose`, and the hero `max-w-4xl` on `index.html` are allowed)
- [ ] 6.5 Grep enforcement: `grep -rE 'litepaper\.css|buildlog\.css|founder-profiles\.css' .` returns no matches outside `openspec/` and git history
- [ ] 6.6 Grep enforcement: `grep -rE '#[0-9a-fA-F]{3,8}' index.html litepaper.html messy-virgo-coin.html about/ dapps/ legal/` returns no hex literals inside `style=""` attributes or `<style>` blocks (matches inside JSON-LD structured data or `<img>` URLs are fine)
- [ ] 6.6a Grep enforcement (semantic-visual consistency): every primary CTA across content pages matches a single class signature (`btn btn-primary`); every section H2 matches a single signature; every feature card matches a single signature. Diff the unique signatures with `grep -hoE 'class="[^"]*btn-primary[^"]*"' ... | sort -u` and assert exactly one variant.
- [ ] 6.6b Grep enforcement (no blended click patterns): `grep -rE 'class="[^"]*\bbtn\b[^"]*\bmv-card\b' index.html litepaper.html messy-virgo-coin.html about/ dapps/ legal/` returns no matches (no element carries both `.btn` and `.mv-card`)
- [ ] 6.7 Run `npm run build`; open every migrated page in a browser one final time; confirm visual consistency
- [ ] 6.8 Mobile/touch verification: open every migrated page in Chrome DevTools at 320×568 (iPhone SE), 390×844 (iPhone 14), and 768×1024 (iPad portrait); confirm no horizontal scrollbar appears, every CTA / clickable card / nav item has a 44×44 hit area (use DevTools "Show rulers" + element box model), the mobile menu opens on tap, and no content is occluded by the navbar or iOS safe area
- [ ] 6.9 Mobile/touch verification: with DevTools "Emulate CSS prefers-reduced-motion: reduce" enabled, confirm aurora animation, card lift, and button scale are all suppressed across migrated pages
- [ ] 6.10 Mobile/touch verification: focus every interactive element by keyboard (Tab) and confirm a visible `:focus-visible` state matches the `:hover` state (so touch users tapping the element get equivalent feedback via `:active`)
- [ ] 6.11 Archive this change with `openspec archive unify-content-page-design`
