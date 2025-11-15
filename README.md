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

Serve the project from the repository root:

```bash
python3 -m http.server 3000
```

Then open <http://localhost:3000> in your browser.

Optional live-reload workflow:

```bash
npm exec --yes browser-sync start --server --files "*.html, *.css, *.js"
```

## Structure

- `index.html` – Main landing page with hero section, tokenomics, evolution phases, funds, and swap integration
- `litepaper.html` – Interactive litepaper with detailed project information, vesting schedules, and roadmap
- `CNAME` – Custom domain configuration for www.messyvirgo.com
- `favicons/` – Favicon assets for various platforms
- `messy-banner.jpg` – Hero banner image
- `messy-mascot.png` – Messy mascot image

## Key Features

- **Modern Design**: Dark theme with glassmorphism effects, gradient text, and aurora animations
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Interactive Elements**: Scroll progress bar, fade-in animations, tooltips, and modal dialogs
- **Tokenomics Visualization**: Detailed breakdown of supply, taxes, and vesting schedules
- **External Integrations**: Links to Aerodrome DEX, GeckoTerminal charts, DEXTools, and Guru Fund

## Technology Stack

- **HTML5** with semantic markup
- **Tailwind CSS** via CDN for styling
- **Vanilla JavaScript** for interactivity
- **Chart.js** (litepaper only) for data visualization
- **Google Fonts** (Inter & Playfair Display)

## Deployment

This is a static site that can be deployed to any static hosting service (GitHub Pages, Netlify, Vercel, etc.). The `CNAME` file indicates it's configured for custom domain hosting.
