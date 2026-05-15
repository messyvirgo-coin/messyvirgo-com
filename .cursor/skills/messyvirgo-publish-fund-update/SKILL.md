---
name: messyvirgo-publish-fund-update
description: Publishes a weekly Messy Fund / Signal update from live Messy Virgo API data (and optional CLI). Writes a frozen snapshot JSON and a minimal blog stub. Use when the user asks to publish a Fund update, weekly fund post, fund-update:publish, or automate the Messy Fund Update blog series.
---

# Publish Messy Fund / Signal update

## When this applies

Weekly **Fund / Signal** proof post: three showcase funds, macro, narratives, aggregate signal / risk reject, council outcomes, app links. Strategy: [MESSY-GAP-CLOSING-WEBSITE-STRATEGY.md](../../../MESSY-GAP-CLOSING-WEBSITE-STRATEGY.md) §6 (Concepts workspace).

## Command

From `messyvirgo-com` repo root:

```bash
# Default: today's date, API + CLI council
npm run fund-update:publish

# Specific week + rewire nav/hero "Latest" links
npm run fund-update:publish -- --date 2026-05-22 --update-nav

# CI / no Messy CLI auth
npm run fund-update:publish -- --date 2026-05-22 --no-cli
```

Then: `npm run build` → commit snapshot + post (+ nav files if `--update-nav`).

## What it creates

| Output | Purpose |
| --- | --- |
| `_blog/_snapshots/YYYY-MM-DD-messy-fund-update.snapshot.json` | Frozen data for archived blog URL (rebuild-safe) |
| `_blog/_posts/YYYY-MM-DD-messy-fund-update-week-of-YYYY-MM-DD.md` | Frontmatter stub; body from `fund-update-post.njk` + partials |
| Permalink | `/blog/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/` |

**Live mirror (not snapshotted):** `/fund-update/` uses `_data/fundUpdate.js` at build time.

## Data sources

- **Public API:** `https://api.messyvirgo.com/api/v1/public/*` (funds status, screen aggregates, council sessions, macro, narratives)
- **CLI (optional):** `npx -y @messyvirgo/cli@latest funds council list <fund_id>` for freshest council before public index catches up

Implementation: `scripts/lib/fetch-fund-update-data.js`, `scripts/publish-fund-update.js`.

## After publish

1. Verify locally: `npm run dev` → blog permalink + `/fund-update/`.
2. **X package (manual):** four posts per §6.2 — Fund, macro, token/risk, agent-learning; each links to a specific app route or the update URL.
3. Deploy `main` when ready.

## Do not

- Hand-edit 600+ lines of HTML in the markdown stub — change partials or re-run publish.
- Delete snapshots for past weeks (archived posts depend on them).
- Use `post.njk` layout for Fund updates — use `fund-update-post.njk`.

## Related

- Ordinary blog posts: `.cursor/skills/publish-blog-post/SKILL.md`
- Checklist: Concepts `WEBSITE-IMPLEMENTATION-CHECKLIST.md` rows `X-04`, `FU-*`
