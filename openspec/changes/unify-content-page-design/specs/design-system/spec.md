## ADDED Requirements

### Requirement: Semantic-Visual Consistency

The system SHALL ensure that any two UI elements serving the same semantic role render with identical computed visual styling across all non-blog content pages. "Same role" is determined by the element's intent — page title, section heading, subsection heading, lead paragraph, body paragraph, eyebrow label, primary call-to-action, secondary action, feature card, content card, inline link, list item — not by the page it lives on, the surrounding section, or the author's preference. Bespoke variations introduced "just for this section" or "just for this page" MUST be rejected.

#### Scenario: Same role, same style
- **WHEN** two elements on different content pages serve the same semantic role (e.g. both are "primary CTAs", both are "section H2s", both are "feature cards")
- **THEN** their computed styling (size, color, weight, padding, border, radius, hover behavior) MUST be identical

#### Scenario: Author wants a one-off variant
- **WHEN** a contributor wants a heading, card, button, or paragraph that does not exactly match an existing variant defined in this spec
- **THEN** they MUST either reuse the closest defined variant unchanged, or amend this spec to introduce a new named variant; they MUST NOT add inline overrides (`style=""`, ad-hoc Tailwind classes that change color/size/padding) on the page

#### Scenario: Audit by greppable signature
- **WHEN** a reviewer audits the content pages
- **THEN** every primary CTA MUST match the same class signature, every section H2 MUST match the same class signature, every feature card MUST match the same class signature, with no per-page divergence

### Requirement: Single Source of Design Tokens

The system SHALL define all visual design tokens (colors, spacing, radius, type family) exactly once, in `css/base.css` as CSS custom properties under the `:root` selector, and SHALL mirror those tokens into `tailwind.config.js` so the same value is reachable from both CSS contexts and Tailwind utility classes.

#### Scenario: Token defined in both layers
- **WHEN** a contributor reads the canonical accent color `--mv-accent-pink` from `css/base.css`
- **THEN** the same value MUST be available as a Tailwind utility (e.g. `text-mv-pink`, `bg-mv-pink`) via the theme extension in `tailwind.config.js`

#### Scenario: New token added
- **WHEN** a new design token is introduced
- **THEN** it MUST be added first to `css/base.css` as a CSS variable and then mirrored into `tailwind.config.js`; it MUST NOT be added to Tailwind only

#### Scenario: No duplicated hex literals
- **WHEN** a contributor greps the content-page HTML (`index.html`, `litepaper.html`, `messy-virgo-coin.html`, `about/*.html`, `dapps/*.html`, `legal/*.html`) for hex color literals (`#[0-9a-fA-F]{3,8}`)
- **THEN** no matches MUST be found in inline `style=""` attributes or `<style>` blocks; all color references MUST resolve to a Tailwind utility or a CSS variable

### Requirement: Container Width Tiers

The system SHALL provide exactly two outer container widths for non-blog content pages: a wide tier of 80rem (`max-w-content`, aliasing today's `max-w-7xl`) for marketing/dapp/about pages, and a narrow tier of 48rem (`max-w-prose`, aliasing today's `max-w-4xl`) for legal pages and long-form text bodies.

#### Scenario: Wide-tier page
- **WHEN** any of `index.html`, `litepaper.html`, `messy-virgo-coin.html`, `about/*.html`, or `dapps/*.html` is rendered
- **THEN** its outer `<main>` wrapper MUST use the wide container (`max-w-content` or its alias `max-w-7xl`) and MUST be centered with `mx-auto px-4`

#### Scenario: Narrow-tier page
- **WHEN** any of `legal/imprint.html`, `legal/privacy.html`, or `legal/terms.html` is rendered
- **THEN** its outer `<main>` wrapper MUST use the narrow container (`max-w-prose` or its alias `max-w-4xl`) and MUST be centered with `mx-auto px-4`

#### Scenario: No third tier introduced ad hoc
- **WHEN** a contributor proposes a content page using `max-w-5xl`, `max-w-6xl`, or any other width
- **THEN** the proposal MUST be rejected unless this spec is first amended to add a new named tier

### Requirement: Uniform Section Padding

The system SHALL apply uniform vertical padding to the outer page wrapper of every non-blog content page: `py-16` on small viewports and `py-24` on `md` and larger viewports.

#### Scenario: Standard content page
- **WHEN** any non-blog content page is rendered
- **THEN** its outer `<main>` wrapper MUST include the classes `py-16 md:py-24`

#### Scenario: Hero exception
- **WHEN** the `index.html` hero section is rendered
- **THEN** it MAY use larger padding (`pb-28 md:pb-32`) because it is a full-viewport hero, but every section AFTER the hero MUST conform to `py-16 md:py-24`

### Requirement: Heading Scale by Level

The system SHALL render headings with the following computed styles on every non-blog content page, regardless of whether the styles are applied via Tailwind utility strings, a `.mv-h*` semantic class, or `@apply`-based equivalent:

- H1 (page title): `text-4xl md:text-5xl`, `font-bold`, gradient text fill via `.text-gradient`
- H2 (section heading): `text-3xl md:text-4xl`, `font-bold`, gradient text fill via `.text-gradient`
- H3 (subsection heading): `text-xl md:text-2xl`, `font-semibold`, `text-white`

#### Scenario: H3 color is not pink
- **WHEN** any H3 heading is rendered on a non-blog content page
- **THEN** its computed color MUST be `text-white` (`#ffffff` or the canonical white token); it MUST NOT be `text-pink-400` or any other accent color

#### Scenario: H1 and H2 use the gradient
- **WHEN** any H1 or H2 heading is rendered on a non-blog content page
- **THEN** it MUST use the gradient text fill defined by `.text-gradient` in `css/base.css`

#### Scenario: Hero H1 exception
- **WHEN** the `index.html` hero H1 is rendered
- **THEN** it MAY use larger sizing (`text-4xl sm:text-5xl md:text-6xl`) but MUST still use `.text-gradient` and `font-bold`

### Requirement: Body Text, Lead Paragraphs, and Eyebrow Labels

The system SHALL render the following text roles with fixed styling on every non-blog content page:

- **Body paragraph** (default `<p>` in a section): `text-base md:text-lg`, color `var(--mv-text-secondary)` (equivalently `text-mv-text-secondary`), `leading-relaxed`.
- **Lead paragraph** (the first paragraph directly under a section heading that introduces the section): `text-lg md:text-xl`, color `var(--mv-text-muted)`, `leading-relaxed`, `max-w-prose mx-auto`.
- **Eyebrow label** (a short uppercase label rendered above a heading): `text-xs md:text-sm`, `uppercase`, `tracking-wider`, `font-semibold`, color `var(--mv-accent-pink)`.

All three roles MUST be available either as Tailwind utility strings or as `.mv-body` / `.mv-lead` / `.mv-eyebrow` semantic classes in `css/base.css`.

#### Scenario: Body paragraph color and size
- **WHEN** a body `<p>` is rendered inside a section on any non-blog content page
- **THEN** its computed font size MUST be `text-base` (mobile) / `text-lg` (md+), its color MUST resolve to `--mv-text-secondary`, and its line height MUST be `leading-relaxed`

#### Scenario: Lead paragraph distinct from body
- **WHEN** a paragraph immediately follows a section heading and acts as an introductory paragraph
- **THEN** it MUST use the lead styling (`text-lg md:text-xl`, `text-mv-text-muted`, `max-w-prose mx-auto`), not the body styling

#### Scenario: Eyebrow label color is pink
- **WHEN** an eyebrow label is rendered above a heading
- **THEN** its color MUST be the accent pink token; it MUST NOT be gold, white, gray, or any other accent

#### Scenario: No ad-hoc paragraph styling
- **WHEN** a contributor greps content pages for `<p` tags inside sections
- **THEN** each tag MUST carry either no styling classes (relying on the default), or one of the three documented role classes; tags with bespoke size/color overrides (`text-2xl`, `text-pink-300`, etc.) MUST be removed or replaced with a documented role

### Requirement: Card Variants

The system SHALL provide exactly two card variants for non-blog content pages: `.mv-card` (the standard glassmorphism panel) and `.mv-card--feature` (a modifier adding the rotating conic-gradient hover glow). All existing card-like classes (`.glassmorphism`, `.litepaper-box`, `.vision-card`, `.founder-card`) MUST either be deleted or redefined to `@apply .mv-card`.

#### Scenario: Standard card
- **WHEN** a card needs to display content without special emphasis
- **THEN** it MUST use the `.mv-card` class, which provides glassmorphism background, 1px border in `--mv-glass-border`, `--mv-border-radius`, padding `p-6 md:p-8`, and hover transform of `translateY(-8px)` with border accent

#### Scenario: Feature card
- **WHEN** a card needs the rotating conic-gradient hover glow currently used on `index.html` feature cards
- **THEN** it MUST use `.mv-card .mv-card--feature` together; `.mv-card--feature` MUST add only the glow, not redefine the base card

#### Scenario: No third card style
- **WHEN** a contributor introduces a card with bespoke padding, border radius, or background
- **THEN** it MUST be either reframed as `.mv-card` (or `.mv-card .mv-card--feature`) or escalated to a spec amendment

### Requirement: Clickable Pattern Selection

The system SHALL select the click pattern by user intent and then style it with the canonical class for that pattern. The three patterns are not interchangeable, and one MUST NOT be styled to look like another:

- **Button** — a discrete action (submit, open modal, navigate to a primary destination): rendered as `<button>` or `<a>` with `.btn .btn-primary` or `.btn .btn-secondary`.
- **Clickable card** — an entire content block whose whole surface navigates to a detail page: rendered as `<a class="mv-card">…</a>` (or an `<a>` wrapping the `.mv-card`). The whole card is the click target; no nested `.btn` inside it.
- **Inline link** — a single phrase within prose that navigates somewhere: rendered as a bare `<a>` (no `.btn`, no `.mv-card`), inheriting the global underline-on-hover from `css/base.css`.

#### Scenario: Card that links uses the card pattern
- **WHEN** a whole content block on any content page navigates to another page on click
- **THEN** it MUST be marked up as an `<a>` carrying `.mv-card` (and optionally `.mv-card--feature`); it MUST NOT be a `<button>` styled like a card, and it MUST NOT contain a nested `.btn` as the click target

#### Scenario: Primary CTA is a button, never a card
- **WHEN** a page presents a primary call-to-action
- **THEN** it MUST be a `<button>` or `<a class="btn btn-primary">`; it MUST NOT be a `.mv-card` re-styled with button colors

#### Scenario: Inline link is unstyled beyond the global rule
- **WHEN** a phrase inside prose links to another page
- **THEN** it MUST be a bare `<a>` with no `.btn` or `.mv-card` class; it inherits the global underline-on-hover behavior

#### Scenario: No mixing of click classes
- **WHEN** a contributor greps for elements carrying both `.btn` and `.mv-card`
- **THEN** no matches MUST be found

### Requirement: Button API

The system SHALL provide button styling exclusively through the `.btn`, `.btn-primary`, and `.btn-secondary` classes defined in `css/base.css`. Content pages MUST NOT redefine button styling via inline Tailwind strings, inline `style` attributes, or page-specific CSS.

#### Scenario: Primary action button
- **WHEN** a page renders a primary call-to-action button
- **THEN** the element MUST carry the classes `btn btn-primary` and MUST NOT carry overriding utility classes that change background-color, padding, or border-radius

#### Scenario: Secondary action button
- **WHEN** a page renders a secondary action button
- **THEN** the element MUST carry the classes `btn btn-secondary` under the same constraints

### Requirement: No Per-Page Stylesheets for Content Pages

The system SHALL NOT load any page-specific stylesheet from a non-blog content page. After this change, `css/litepaper.css`, `css/buildlog.css`, and `css/founder-profiles.css` MUST be deleted from the repository and MUST NOT be referenced by any `<link rel="stylesheet">` tag on a content page.

#### Scenario: Grep finds no per-page CSS link
- **WHEN** a contributor greps the content pages for `litepaper.css`, `buildlog.css`, or `founder-profiles.css`
- **THEN** no matches MUST be found

#### Scenario: New page needs custom styling
- **WHEN** a new content page is added that needs styling not covered by `base.css` + Tailwind
- **THEN** the new styling MUST be added to `css/base.css` (and `tailwind.config.js` if it introduces a new token), not to a new page-specific stylesheet

### Requirement: No Inline Style Blocks on Content Pages

The system SHALL NOT contain `<style>` blocks inside the `<head>` or `<body>` of any non-blog content page. All styling MUST come from the linked stylesheets (`css/base.css`, `css/tailwind.css`) or inline Tailwind utility classes.

#### Scenario: Grep finds no `<style>` tag
- **WHEN** a contributor greps content pages for the literal string `<style`
- **THEN** no matches MUST be found in `index.html`, `litepaper.html`, `messy-virgo-coin.html`, `about/*.html`, `dapps/*.html`, or `legal/*.html`

### Requirement: Mobile-First and Touch-Optimized

The system SHALL be designed mobile-first and optimized for touch on every non-blog content page. Every page MUST render correctly at a 320 CSS-pixel viewport width, MUST NOT introduce horizontal scrolling at any viewport ≥320px, and MUST treat every interactive element as touch-first rather than hover-first.

#### Scenario: No horizontal overflow at 320px
- **WHEN** any non-blog content page is rendered at a viewport width of 320 CSS pixels
- **THEN** the document MUST NOT produce a horizontal scrollbar, and no content MUST be clipped by the viewport edge

#### Scenario: Minimum touch target size
- **WHEN** any interactive element (`.btn`, `<a>` link, `<button>`, clickable `.mv-card`, nav item, mobile-menu toggle, form input) is rendered on a viewport ≤768px wide
- **THEN** its hit area MUST be at least 44 CSS pixels in both dimensions (matching the existing rule in `css/base.css` for `.btn`, extended to every interactive element)

#### Scenario: Adjacent tap targets are spaced
- **WHEN** two interactive elements are rendered next to each other on a viewport ≤768px wide
- **THEN** they MUST have at least 8 CSS pixels of gap between their hit areas

#### Scenario: No hover-only affordances
- **WHEN** an interactive element exposes a visual state on `:hover` (card lift, button glow, link underline, dropdown reveal)
- **THEN** an equivalent visual state MUST also be exposed on `:active` and `:focus-visible` so touch users (who do not generate `:hover`) and keyboard users receive the same feedback

#### Scenario: Body text legible on mobile
- **WHEN** body text is rendered on a viewport ≤768px wide
- **THEN** its computed font size MUST be at least 16 CSS pixels (1rem), and its line-height MUST be at least 1.5, so it is readable without zoom

#### Scenario: Form inputs do not trigger iOS zoom
- **WHEN** a form input (`<input>`, `<select>`, `<textarea>`) is rendered on any viewport
- **THEN** its computed font size MUST be at least 16 CSS pixels (Safari iOS auto-zooms inputs with smaller fonts on focus, which breaks layout)

#### Scenario: Sticky elements respect safe areas
- **WHEN** a sticky element (the navbar, the scroll-progress bar, any fixed modal) is rendered on a device with a notch or rounded corners
- **THEN** it MUST respect iOS safe-area insets via `env(safe-area-inset-*)` (or equivalent) so content is not occluded

#### Scenario: Mobile navigation reachable with one thumb
- **WHEN** the mobile menu toggle is rendered on a viewport ≤768px wide
- **THEN** it MUST be positioned within thumb reach of a one-handed grip (top-right or bottom of the screen), its hit area MUST meet the 44px minimum, and tapping it MUST open the menu without requiring hover

#### Scenario: Tables and wide content scroll horizontally inside their container, not the page
- **WHEN** a wide element (table, code block, image) exceeds the viewport width
- **THEN** it MUST scroll horizontally within its own container (`overflow-x: auto`), not push the page into horizontal overflow

#### Scenario: Reduced motion respected
- **WHEN** the user's OS reports `prefers-reduced-motion: reduce`
- **THEN** card lift, button scale, aurora animation, and any other transition longer than 0.01ms MUST be disabled (already enforced in `css/base.css`; this scenario MUST remain true after the migration)

### Requirement: Blog Scope Exclusion

The system's design schema SHALL apply only to non-blog content pages. The Eleventy blog (`_blog/`, `blog/`), the post layout `_includes/post.njk`, the fund-update post layout `_includes/fund-update-post.njk`, and the `.prose*` rules in `css/base.css` are out of scope.

#### Scenario: Blog post page rendered
- **WHEN** any blog post page (under `blog/` or rendered via `_includes/post.njk`) is rendered
- **THEN** this spec's container, heading, card, and button requirements MUST NOT be enforced against it

#### Scenario: Schema change touches blog files
- **WHEN** an implementation task under this spec is reviewed
- **THEN** it MUST NOT modify `_blog/`, `blog/`, `_includes/post.njk`, `_includes/fund-update-post.njk`, or the `.prose*` rules in `css/base.css`

### Requirement: Legal Page Prose Styling

The system SHALL provide a single shared `.prose-legal` rule in `css/base.css` for the body content of legal pages, replacing the inline `<style>` blocks currently in `legal/imprint.html`, `legal/privacy.html`, and `legal/terms.html`. `.prose-legal` MUST style `h2`, `h3`, `p`, `ul`, `a`, and `strong` descendants using the canonical CSS variables (no hex literals).

#### Scenario: Legal page uses .prose-legal
- **WHEN** any of `legal/imprint.html`, `legal/privacy.html`, or `legal/terms.html` is rendered
- **THEN** its body content wrapper MUST carry the `.prose-legal` class and MUST NOT contain a local `<style>` block

#### Scenario: .prose-legal uses canonical tokens
- **WHEN** a contributor inspects the `.prose-legal` rule in `css/base.css`
- **THEN** every color value MUST reference a `--mv-*` CSS variable; no hex literal MUST appear inside the rule
