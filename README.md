# $MESSY Website

Static website for $MESSY, an AI-powered fund management token on the Base network. The site introduces Messy, a friendly anime-themed guide designed to make complex DeFi and AI concepts accessible to everyone.

**Live Site:** https://www.messyvirgo.com

## Overview

$MESSY is an innovative project that combines artificial intelligence with decentralized finance (DeFi) to create accessible, AI-driven fund management. The project features:

- **AI-Powered Analysis**: Narrative and on-chain analysis capabilities
- **Reflexive Tokenomics**: 4.95% transaction tax with reflections and treasury allocation
- **Investment Funds**: $MESSYBASED (Base) and $MESSYFUND (Ethereum)
- **Staged Evolution**: From culture engine to autonomous trader to DAO governance

## Local Preview

Serve from the repository root:

```bash
python3 -m http.server 3000
```

Open <http://localhost:3000> in your browser.

**Optional:** Live-reload with browser-sync:
```bash
npm exec --yes browser-sync start --server --files "*.html, *.css, *.js"
```

**Testing:** Use browser DevTools (F12) to test responsive layouts at different screen sizes.

## Pages

- **Home** (`index.html`) – Landing page with hero, tokenomics, evolution phases, and swap integration
- **Litepaper** (`litepaper.html`) – Interactive documentation with charts, vesting schedules, and roadmap
- **Build Log** (`buildlog.html`) – Weekly progress tracker with searchable, filterable entries
- **Founder Profiles** (`founder-profiles.html`) – Team member profiles and backgrounds

## Structure

```
├── index.html, litepaper.html, buildlog.html, founder-profiles.html
├── css/
│   ├── tailwind.css       (Tailwind utilities)
│   ├── base.css           (Shared design system)
│   ├── litepaper.css      (Litepaper-specific)
│   ├── buildlog.css       (Build Log-specific)
│   └── founder-profiles.css
├── js/
│   ├── main.js            (Shared functionality)
│   ├── litepaper.js       (Charts, vesting)
│   └── buildlog.js        (Filters, search)
├── images/                (Banner, mascot, avatars)
├── favicons/              (Brand icons)
├── sitemap.xml            (SEO)
└── robots.txt             (Crawler instructions)
```

## Key Features

- **Modern Design**: Dark theme with glassmorphism, gradient text, and aurora animations
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Interactive Elements**: Scroll progress bar, fade-in animations, tooltips, charts
- **SEO Optimized**: Meta tags, structured data, sitemap, and robots.txt
- **External Integrations**: Links to Aerodrome DEX, GeckoTerminal, DEXTools, and Guru Fund

## Technology Stack

- **HTML5** with semantic markup
- **Tailwind CSS** via CDN for styling
- **Vanilla JavaScript** for interactivity
- **Chart.js** (litepaper only) for data visualization
- **Google Fonts** (Inter & Playfair Display)

## Design System

The site uses a **utilities-first approach** with Tailwind CSS + a minimal custom design system:

### Styling Architecture

1. **`/css/tailwind.css`** - Tailwind utility classes for layout, spacing, typography
2. **`/css/base.css`** - Shared design tokens, components, and global styles:
   - CSS variables (`--mv-*`) for colors, glassmorphism, spacing
   - Shared components (`.mv-page-header`, `.mv-card`, `.glassmorphism`)
   - Global animations (aurora background, fade-in, card glow)
   - Navigation, buttons, links, footer styles
3. **Page-specific CSS** - Only unique, page-specific components:
   - `founder-profiles.css` - Founder card layouts and avatars
   - `litepaper.css` - Timeline, vesting chart, trust cards
   - `buildlog.css` - Build log entries and timeline

### Design Tokens (CSS Variables)

All color and style tokens are defined in `/css/base.css` under `:root`:

```css
--mv-bg-dark: #0a0a0a;
--mv-text-primary: #e5e7eb;
--mv-text-muted: #9ca3af;
--mv-accent-pink: #ff69b4;
--mv-accent-gold: #ffd700;
--mv-glass-bg: rgba(255, 255, 255, 0.05);
--mv-border-radius: 8px;
```

### Shared Components

- **`.mv-page-header`** - Standard page header (used on all 3 content pages)
- **`.mv-card`** - Glassmorphism card with hover effects
- **`.text-gradient`** - Pink-to-gold gradient text
- **`.glassmorphism`** - Glass-blur backdrop effect

### Adding New Content

**Build Log:** Add new entries in `buildlog.html` by copying a sample week entry and updating dates, titles, achievements, and category tags.

**Styles:** 
- For colors/tokens: Edit CSS variables in `/css/base.css` (`:root` section)
- For shared components: Add to `/css/base.css`
- For page-specific styles: Edit the relevant page CSS file
- Prefer Tailwind utilities in HTML over custom CSS

**Meta Tags:** Update `<title>` and `<meta name="description">` in each HTML file's `<head>` section.

## Deployment

Static site deployable to GitHub Pages, Netlify, Vercel, or any static host. The `CNAME` file configures the custom domain (www.messyvirgo.com). All JavaScript runs client-side—no server required.
