---
name: messyvirgo-publish-fund-update
description: Publishes a weekly Messy Fund / Signal update from live Messy Virgo API data (and optional CLI). Writes a frozen snapshot JSON and a minimal post stub under /updates/ (not /blog/). Use when the user asks to publish a Fund update, weekly fund post, fund-update:publish, or automate the Messy Fund Update series.
---

# Publish Messy Fund / Signal update

## When this applies

Weekly **Fund / Signal** proof post: Guru Lotus Funds on Base (read-only), macro, narratives, screening aggregates, council context, app links.

**Not** the monthly treasury blog (“Every Month, We Buy More…”) — use `publish-blog-post` for that.

## Must not appear on `/blog/`

Fund updates are **proof-track snapshots**, not blog articles. When publishing a new week:

- **Permalink** must be `/updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/` only — never `/blog/...`
- **Layout** must be `fund-update-post.njk` — never `post.njk` with blog permalink
- **Tag** must include `fund-update` (publish script sets this) so `collections.blog` excludes the file
- **Do not** create `blog/YYYY/MM/messy-fund-update-week-of-.../index.njk` redirect stubs for new weeks (legacy only for May 2026 migration)
- **Do not** link the new week from the blog article grid — only the separate “Fund updates” proof-track card on `/blog/`

`npm run build` **fails** if a fund update leaks into `collections.blog` or uses a `/blog/` permalink.

## Site structure (important)

Fund updates were **split out of the blog** (May 2026). They are a separate proof track, not long-form articles.

| Route | Purpose | Data source |
| --- | --- | --- |
| `/updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/` | **Archived week** (canonical, shareable) | Frozen `_blog/_snapshots/*.json` via `fundUpdateSnapshot` |
| `/fund-update/` | **Live mirror** (always current at build) | `_data/fundUpdate.js` → API at build time |
| `/updates/` | Redirect to newest archived week | `updates/index.njk` → `collections.fundUpdates[0]` |
| `/blog/` | Long-form articles only | `collections.blog` (fund updates **excluded**) |

**Collections** (`.eleventy.js`):

- `collections.blog` — `_blog/_posts/*.md` where `layout !== fund-update-post.njk` and `fund-update` tag absent
- `collections.fundUpdates` — same directory, opposite filter; sorted newest-first

**Nav / homepage** — “Fund updates” and “Latest update” resolve from `collections.fundUpdates[0].url` (fallback `/fund-update/`). No manual nav patching.

**Blog index** — Fund updates appear in the separate “proof track” cards, not the article grid.

## Rendering pipeline

```
_blog/_posts/YYYY-MM-DD-messy-fund-update-week-of-YYYY-MM-DD.md   (frontmatter stub only)
  layout: fund-update-post.njk
  fundUpdateSnapshot: "YYYY-MM-DD"
  permalink: /updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/index.html
        ↓
_includes/fund-update-post.njk   (layout: post.njk)
        ↓
_includes/post.njk               (fund-update header, SEO, “Latest update” / “Archived snapshot” badges)
        ↓
partials/fund-update-styles.njk  (fu-* layout CSS; shell uses mv-* design system)
partials/fund-update-content.njk (report body; {% set fu = fu or fundUpdate %})
partials/fund-update-archive.njk (compact week list at bottom)
```

- **Archived weeks:** `eleventyComputed.fu` loads `_blog/_snapshots/{fundUpdateSnapshot}-messy-fund-update.snapshot.json`
- **Live `/fund-update/`:** `fund-update.njk` sets `showAutogenNotice = true`; content reads global `fundUpdate` from `_data/fundUpdate.js`

Change report layout or copy in the **partials** or `scripts/lib/fetch-fund-update-data.js` — never hand-write HTML in the markdown stub.

## Command

From `messyvirgo-com` repo root:

```bash
# Default: today's date, API + CLI council
npm run fund-update:publish

# Specific week (use the week's end / publication date)
npm run fund-update:publish -- --date 2026-06-06

# CI / no Messy CLI auth
npm run fund-update:publish -- --date 2026-06-06 --no-cli
```

Then:

```bash
npm run build          # clean + Tailwind + Eleventy
npm run dev            # local preview at http://localhost:8080
```

`npm run build` runs `scripts/clean-site.js` first — do not skip it before verifying.

## What publish creates

| Output | Purpose |
| --- | --- |
| `_blog/_snapshots/YYYY-MM-DD-messy-fund-update.snapshot.json` | Frozen data for that week's URL (required for rebuilds) |
| `_blog/_posts/YYYY-MM-DD-messy-fund-update-week-of-YYYY-MM-DD.md` | Frontmatter stub; body from partials + snapshot |

Publish script does **not** create legacy `/blog/...` redirect stubs. Those exist only for weeks that were briefly live under `/blog/` before the migration (`blog/2026/05/messy-fund-update-week-of-*/index.njk`). New weeks use `/updates/` only — no redirect file needed.

## Data sources

- **Public API:** `https://api.messyvirgo.com/api/v1/public/*` (funds status, screen aggregates, council meetings, macro, narratives)
- **Funds:** Guru Lotus (read-only NAV) — `messybased` (`mvf-guru-messybased`), `messyinfra` (`mvf-guru-messyinfra`); Guru micro test (workflow-traded, council-gated target changes) — `base01` (`mvf-base01`), `base02` (`mvf-base02`), and from **2026-07-10** also `base04` (`mvf-base04`), `base05` (`mvf-base05`). `base03` (`mvf-base03`) is private dev-only for council/rotation testing and is excluded from public fund updates. Funds with a `since` date are omitted from archived weeks before that date.
- **CLI (optional):** `npx -y @messyvirgo/cli@0.31.0 funds council list <fund_id>` for freshest council before public index catches up

Implementation: `scripts/lib/fetch-fund-update-data.js`, `scripts/publish-fund-update.js`.

**Note:** Public council list is `GET /api/v1/public/funds/{fund_id}/council/meetings` (compact meeting presentation). The old `/council/sessions` list is not public.

## After publish (local)

1. `npm run build` then `npm run dev`
2. Open archived week: `/updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/`
3. Confirm: archive list at bottom, “Latest update” badge on newest week only, `/fund-update/` live mirror builds
4. Confirm week is **absent** from `/blog/` article grid (still listed in proof-track card)

## Optional manual steps

- **`sitemap.xml.njk`:** update `<lastmod>` on the `/fund-update/` `<url>` to the new week's date (archived weeks are auto-included via `collections.fundUpdates` loop)
- **Deploy:** push `main` only when the user explicitly approves — never publish without permission

## Do not

- Add fund updates to the **blog article list** on `/blog/` (grid uses `collections.blog` only)
- Create **`blog/.../messy-fund-update...`** redirect files for new weeks
- Hand-edit snapshot JSON to “fix” display — re-run `fund-update:publish` for that date
- Delete past snapshots (archived URLs depend on them)
- Use `post.njk` layout or `/blog/{{ page.date | dateFilter }}/...` permalink for Fund updates
- Use `publish-blog-post` for this series
- Patch nav, homepage, or blog index Fund-update links manually
- Commit or push without user approval when they asked for preview-only

## Related

- Long-form articles: `.cursor/skills/publish-blog-post/SKILL.md`
- Conventions: `_blog/README.md`, `README.md` § Fund / Signal updates
- Weekly build logs: `.cursor/skills/messyvirgo-weekly-buildlog/SKILL.md`
