# $MESSY Website

Static website for $MESSY, an AI-powered fund management token on the Base network. The site introduces Messy, a friendly anime-themed guide designed to make complex DeFi and AI concepts accessible to everyone.

**Live Site:** https://www.messyvirgo.com

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

## Deployment

Static site deployable to GitHub Pages, Netlify, Vercel, or any static host. The `CNAME` file configures the custom domain (www.messyvirgo.com). All JavaScript runs client-side—no server required.
