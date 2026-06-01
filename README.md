# $MESSY Website

Static website for $MESSY, an AI-powered fund management token on the Base network. The site introduces Messy, a friendly anime-themed guide designed to make complex DeFi and AI concepts accessible to everyone.

**Live Site:** https://www.messyvirgo.com

## Contributing & community

This repo is public for transparency and collaboration, but it is also an **official public-facing website**, so maintainers retain editorial control over what gets merged.

- **Contributing**: see [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Code of Conduct**: see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- **Governance**: see [GOVERNANCE.md](./GOVERNANCE.md)
- **Brand usage**: see [BRAND.md](./BRAND.md)

## Local Preview

### Development Server (Recommended)
```bash
npm ci
npm run dev
```

This runs **Tailwind in watch mode** and the **Eleventy dev server** together (default **http://localhost:8080**). Press `Ctrl+C` once to stop both.

To run them in separate terminals instead:

```bash
npm run watch:css  # Terminal 1
npm run serve      # Terminal 2
```

### Static Server (Alternative)
```bash
python3 -m http.server 3000
```

Open <http://localhost:3000> or <http://localhost:8080> in your browser.

**Testing:** Use browser DevTools (F12) to test responsive layouts at different screen sizes.

## Pages

- **Home** (`index.html`) – Funds-first routing page: hero, research engine, pre-live testing Funds, proof/updates, verify path, live price chart, and swap (`_includes/partials/home-funds-first.njk`)
- **Litepaper** (`litepaper.html`) – AI-native fund OS narrative, tokenomics chart, phased roadmap, and trust summary; **Investment Vehicles** lists Guru.fund links (independent of Phase 3 pre-live Funds); **Trust & transparency** links to **Treasury, Safes & Vesting** for custody and vesting detail
- **Treasury, Safes & Vesting** (`about/treasury.html` → `/treasury.html`) – Safe custody explainer, six-wallet table, interactive vesting chart and allocation schedule, monthly treasury movements
- **Governance & association** (`about/association.html` → `/association.html`) – Association overview and how governance connects to treasury
- **Token** (`messy-virgo-coin.html` → `/messy-virgo-coin`) – Token FAQ and links into treasury for verification
- **Build Log** (`buildlog.html`) – Weekly progress tracker with searchable, filterable entries
- **Founder Profiles** (`founder-profiles.html`) – Team member profiles and backgrounds
- **Blog** (`blog/index.njk`) – Blog posts powered by Eleventy

## Structure

```
├── index.html, litepaper.html, buildlog.html, founder-profiles.html
├── about/                 (Treasury, association, imprint, etc.)
├── _includes/partials/    (Shared nav, footer, etc.)
├── _blog/
│   ├── _posts/            (Blog post markdown files: YYYY-MM-DD-title.md)
│   └── _snapshots/        (Frozen JSON for Fund / Signal update weeks)
├── scripts/
│   ├── publish-fund-update.js
│   └── lib/fetch-fund-update-data.js
├── fund-update.njk        (Live /fund-update/ page)
├── blog/
│   └── index.njk          (Blog listing page)
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
- **Eleventy** (11ty) for blog static site generation
- **Tailwind CSS** (compiled) for styling
- **Vanilla JavaScript** for interactivity
- **Chart.js** (litepaper only) for data visualization
- **Google Fonts** (Inter; Playfair optional via `.font-serif` only if needed)

## Typography

- **Default:** **Inter** for body copy and for **all headings** (`h1`–`h6`) via `css/base.css` (`letter-spacing: -0.025em` on headings).
- **Gradient section titles** (and similar): use **`font-bold font-sans tracking-tight text-gradient`** in markup (same treatment as the homepage hero headline).
- **Optional serif:** the Tailwind **`.font-serif`** utility still maps to **Playfair Display** for rare intentional use; do not use it for standard page titles unless there is a specific reason.
- After changing Tailwind classes in HTML/NJK/MD, run **`npm run build:css`** (see [CONTRIBUTING.md](./CONTRIBUTING.md)).

## Fund / Signal updates (weekly)

Automated weekly posts from Messy Virgo live data:

```bash
npm run fund-update:publish -- --date 2026-05-22
npm run fund-update:publish -- --no-cli                          # API-only (CI)
npm run build
```

- **Archive:** date list at the bottom of each fund-update week (and on `/fund-update/`)
- **Archived week:** `/updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/` (snapshot in `_blog/_snapshots/`)
- **Live mirror:** `/fund-update/` (always current at build time)
- **Fund updates** links in nav/home resolve automatically from `collections.fundUpdates` — no nav patching step

Agent skill: `.cursor/skills/messyvirgo-publish-fund-update/SKILL.md`

## Blog Posts

Create new posts in `_blog/_posts/` using format `YYYY-MM-DD-title.md`:

```markdown
---
title: "Your Post Title"
date: 2024-12-20
description: "Brief description"
tags: [optional, tags]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

Your markdown content here...
```

While editing: keep `npm run dev` running and visit `http://localhost:8080/blog/`. Before a PR, run `npm run build`.

## Deployment

Static site deployable to GitHub Pages, Netlify, Vercel, or any static host. The `CNAME` file configures the custom domain (www.messyvirgo.com). GitHub Actions automatically builds and deploys on push to `main`. All JavaScript runs client-side–no server required.

## License

- **Code**: Apache-2.0 (see [LICENSE](./LICENSE))
- **Content & brand assets**: reserved (all rights reserved), including site copy and blog posts (see [NOTICE](./NOTICE.md))
- **Trademarks/brand usage**: see [BRAND.md](./BRAND.md)
