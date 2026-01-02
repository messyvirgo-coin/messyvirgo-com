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
npm run watch:css  # Terminal 1: Watch CSS changes
npm run serve      # Terminal 2: Eleventy dev server at http://localhost:8080
```

### Static Server (Alternative)
```bash
python3 -m http.server 3000
```

Open <http://localhost:3000> or <http://localhost:8080> in your browser.

**Testing:** Use browser DevTools (F12) to test responsive layouts at different screen sizes.

## Pages

- **Home** (`index.html`) – Landing page with hero, tokenomics, evolution phases, and swap integration
- **Litepaper** (`litepaper.html`) – Interactive documentation with charts, vesting schedules, and roadmap
- **Build Log** (`buildlog.html`) – Weekly progress tracker with searchable, filterable entries
- **Founder Profiles** (`founder-profiles.html`) – Team member profiles and backgrounds
- **Blog** (`blog/index.njk`) – Blog posts powered by Eleventy

## Structure

```
├── index.html, litepaper.html, buildlog.html, founder-profiles.html
├── _blog/
│   └── _posts/            (Blog post markdown files: YYYY-MM-DD-title.md)
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
- **Google Fonts** (Inter & Playfair Display)

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

Build and test: `npm run build && npm run serve` → visit `http://localhost:8080/blog/`

## Deployment

Static site deployable to GitHub Pages, Netlify, Vercel, or any static host. The `CNAME` file configures the custom domain (www.messyvirgo.com). GitHub Actions automatically builds and deploys on push to `main`. All JavaScript runs client-side—no server required.

## License

- **Code**: MIT (see [LICENSE](./LICENSE))
- **Content & brand assets**: CC BY-NC 4.0 (see [NOTICE](./NOTICE.md) and [CONTENT_LICENSE](./CONTENT_LICENSE.md))
