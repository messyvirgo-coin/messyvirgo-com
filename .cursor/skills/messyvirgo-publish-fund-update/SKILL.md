---
name: messyvirgo-publish-fund-update
description: Builds or publishes the weekly Messy Fund Report (Fund / Signal update) from live Messy Virgo API + CLI. Week-story layout with regime path, council strips, Chair notes, and book posture. Writes a frozen snapshot JSON and a minimal post stub under /updates/ (or a draft under /drafts/). Use when the user asks to publish a Fund update, weekly fund report, fund-update:publish, fund-update:draft, or automate the Messy Fund Update series.
---

# Publish Messy Fund Report (weekly)

## When this applies

Weekly **Fund Report** / Fund / Signal proof post for the public micro books in `FUNDS` (`scripts/lib/fetch-fund-update-data.js`): week regime, council week strips, Chair notes, book posture, screening. As of 2026-10-22 that list is Guru Lotus `base04`, `base05`, `base06`, Lagoon `lg-base00`, `lg-base01`, `lg-base02`, `safe-lg-rh01`, and paper book `paper-meme`. Closed books stay in `FUNDS` with `until` so older archives still rebuild.

**Not** the monthly treasury blog (“Every Month, We Buy More…”) — use `publish-blog-post` for that.

**Report version:** `vnext-2026-07-24` (see `REPORT_VERSION` in `scripts/lib/fetch-fund-update-data.js`).

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
| `/drafts/fund-update-week-of-YYYY-MM-DD/` | **Draft preview** (not in collections) | `_drafts/*.snapshot.json` + `fundUpdateDraft: true` |
| `/fund-update/` | **Live mirror** (always current at build) | `_data/fundUpdate.js` → API at build time |
| `/updates/` | Redirect to newest archived week | `updates/index.njk` → `collections.fundUpdates[0]` |
| `/blog/` | Long-form articles only | `collections.blog` (fund updates **excluded**) |

**Collections** (`.eleventy.js`):

- `collections.blog` — `_blog/_posts/*.md` where `layout !== fund-update-post.njk` and `fund-update` tag absent
- `collections.fundUpdates` — same directory, opposite filter; sorted newest-first
- Drafts use `eleventyExcludeFromCollections: true` and load snapshots from `_drafts/` when `fundUpdateDraft` is set

**Nav / homepage** — “Fund updates” and “Latest update” resolve from `collections.fundUpdates[0].url` (fallback `/fund-update/`). No manual nav patching.

## Report contents (vNext)

The snapshot + partials render a **week story**, not a single latest-session dump:

1. **This week at a glance** — rollup highlights (session counts, regime path, movers, signal)
2. **Across the councils** — optional shared themes (soft tape, cautious sizing, …) when ≥2 funds match
3. **Week regime** — regime path from Monday through the publication `--date` (UTC), closing macro brief, soft-tape motif (shared context only — not per-fund bucket %)
4. **Micro funds week scan** — comparison table + fund cards
5. **Per fund** — closing session headline, **week strip** (Mon exec · Tue …), **week-net posture**, mid-week note, **Closing session** Chair notes (incl. that fund’s posture move), full book bar (cash/base/high-beta), top-3 aggregate candidates
6. Agent takeaways + app deep links (Council tabs)

**CLI is required** for week regime path, Chair notes, and accurate week strips. `--no-cli` is API-thin (status/screening/public meetings only).

## Rendering pipeline

```
_blog/_posts/YYYY-MM-DD-messy-fund-update-week-of-YYYY-MM-DD.md   (frontmatter stub only)
  layout: fund-update-post.njk
  fundUpdateSnapshot: "YYYY-MM-DD"
  permalink: /updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/index.html
        ↓
_includes/fund-update-post.njk   (layout: post.njk)
        ↓
_includes/partials/fund-update-styles.njk
_includes/partials/fund-update-content.njk
_includes/partials/fund-update-archive.njk
```

Change report layout or copy in the **partials** or `scripts/lib/fetch-fund-update-data.js` — never hand-write HTML in the markdown stub.

## Commands

From `messyvirgo-com` repo root:

```bash
# Draft preview (writes _drafts/, not /updates/) — preferred before publish
npm run fund-update:draft -- --date 2026-07-23

# Publish to /updates/ (fresh fetch)
npm run fund-update:publish -- --date 2026-07-23

# Promote an approved draft snapshot → /updates/ (no re-fetch)
npm run fund-update:publish -- --date 2026-07-23 --promote

# CI / no Messy CLI auth (degraded week-story)
npm run fund-update:publish -- --date 2026-07-23 --no-cli
```

Then:

```bash
npm run build          # clean + Tailwind + Eleventy
npm run dev            # local preview at http://localhost:8080
```

Preview URLs:

- Draft: `/drafts/fund-update-week-of-YYYY-MM-DD/`
- Published: `/updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/`

`npm run build` runs `scripts/clean-site.js` first — do not skip it before verifying.

## What publish creates

| Mode | Output |
| --- | --- |
| `--draft` | `_drafts/YYYY-MM-DD-messy-fund-update.snapshot.json` + `_drafts/fund-update-draft-YYYY-MM-DD.md` |
| publish | `_blog/_snapshots/YYYY-MM-DD-messy-fund-update.snapshot.json` + `_blog/_posts/YYYY-MM-DD-messy-fund-update-week-of-YYYY-MM-DD.md` |
| `--promote` | Copies draft snapshot into `_blog/_snapshots/` and writes the published post stub |

Publish script does **not** create legacy `/blog/...` redirect stubs.

The script validates `reportVersion`, warns if CLI week-story fields are missing, and prints a coverage summary (funds, sessions, Chair notes, strips, net posture).

## Data sources

- **Public API:** `https://api.messyvirgo.com/api/v1/public/*` (funds status, screen aggregates, council meetings, macro, narratives)
- **Funds:** `FUNDS` in `scripts/lib/fetch-fund-update-data.js`. A book is included only when `since` is unset or on/before `--date`, and `until` is unset or on/after `--date`. Read-only Guru Lotus books (`group: "guru"`) are not in that list. `base03` is not in that list. Current rows: `base01`/`base02` through `until` 2026-08-15; `base04`/`base05` from 2026-07-10; `base06` from 2026-07-27; `lg-base01` from 2026-08-18; `lg-base02` from 2026-08-19; `lg-base00` from 2026-09-27; `safe-lg-rh01` from 2026-09-29; `paper-meme` from 2026-10-22.
- **CLI (required for full report):** `@messyvirgo/cli@0.50.0` (`MESSY_CLI_SPEC` in `scripts/lib/fetch-fund-update-data.js`). The fetch script shells out with `npx -y` and inherits the process environment. Headless auth is below.
  - `funds council list <fund_id>` — week strip / session counts
  - `funds council get <fund_id> <session_id>` — Chair notes, locked posture, regime samples
  - `funds council artifact <fund_id> <uuid>` — session-frozen macro/narrative briefs
  - Fallback only when session-frozen context is missing: `context macros get --as-of <date>` and `context narratives list --as-of <date>`

Implementation: `scripts/lib/fetch-fund-update-data.js`, `scripts/publish-fund-update.js`. `package.json` scripts: `fund-update:draft` → `publish-fund-update.js --draft`, `fund-update:publish` → `publish-fund-update.js`.

**Note:** Public council list is `GET /api/v1/public/funds/{fund_id}/council/meetings`. Prefer CLI for week coverage.

## After publish (local)

1. `npm run build` then `npm run dev`
2. Open archived week: `/updates/YYYY/MM/messy-fund-update-week-of-YYYY-MM-DD/`
3. Confirm: week regime path (no week-level cash/base %), per-fund week strips + net posture, Closing session Chair notes, cash/base in book bar, archive list, “Latest update” badge on newest week only
4. Confirm week is **absent** from `/blog/` article grid

## Recommended agent workflow

Interactive local runs:

1. `npm run fund-update:draft -- --date YYYY-MM-DD`
2. Preview draft URL; iterate on fetch/partials if needed; re-run draft
3. On approval: `npm run fund-update:publish -- --date YYYY-MM-DD --promote` **or** fresh `fund-update:publish`
4. `npm run build` + verify
5. Commit / push **only** when the user explicitly asks

Unattended cloud runs use **Cloud agent / headless run** and stop at a draft pull request. They do not publish.

## Cloud agent / headless run

Next Saturday a cloud agent can produce the full weekly **draft** with no one at the keyboard. Open the `messyvirgo-com` repo by itself and run every command from that repo root.

### Inputs

- Publication `--date` (`YYYY-MM-DD`). The script’s week window is Monday through that date (UTC). The weekly post uses the Saturday date.
- Node `^22.13.0` or `^24.0.0` (CLI `engines` in `@messyvirgo/cli@0.50.0`).
- `MESSYVIRGO_ACCESS_TOKEN`: the CLI `api_key` from a completed wallet login. Required for Chair notes, week strips, net posture, and the regime path. `scripts/lib/fetch-fund-update-data.js` does not read a dotenv file. `execSync` inherits the environment, so the variable must already be set when the draft command starts. Do not put the token in the repo, the PR, or the shell command line.
- `MESSYVIRGO_API_URL`: optional. When `MESSYVIRGO_ACCESS_TOKEN` is set and this variable is omitted, the CLI uses `https://api.messyvirgo.com` (`PRODUCTION_API_URL` in `@messyvirgo/cli@0.50.0` `dist/lib/connection.js`). `MESSYVIRGO_API_URL` is ignored unless `MESSYVIRGO_ACCESS_TOKEN` is also set.
- The token’s account needs a grant on each fund being read, or the `admin` or `fund_creator` role. `context macros get` and `context narratives list` answer `403 CONTEXT_REQUIRES_FUND_ACCESS` without that. Council commands need a grant on that fund (CLI README, Auth and Config).

### How the token is obtained

Source: `@messyvirgo/cli@0.50.0` README “Auth and Config”, `dist/commands/auth/login.js`, and `dist/lib/connection.js`.

1. On a machine that can open a browser, run `npx -y @messyvirgo/cli@0.50.0 auth init --profile default --api-url https://api.messyvirgo.com`. `auth login` is the same wallet flow.
2. The CLI posts `/api/v1/auth/cli-device/start`, then polls `/api/v1/auth/cli-device/poll` until the wallet approves.
3. The poll field `api_key` is the token. The CLI stores it as profile `apiKey`, with `apiUrl`, in `config.json` under `~/.config/messyvirgo/`, or `$XDG_CONFIG_HOME/messyvirgo/`, or `$MESSYVIRGO_CONFIG_HOME/`. `auth status` reports whether a key is present. It does not print the key.
4. Copy that `api_key` into the cloud agent secret `MESSYVIRGO_ACCESS_TOKEN`. Env override mode then ignores any stored profile.

### Lifetime

- The pending browser device login expires after the server’s `expires_in` seconds. The CLI does not hardcode that duration. Its login tests use 600 seconds. After that the CLI returns `AUTH_LOGIN_EXPIRED` and the login has to be started again.
- The stored `api_key` has no expiry field in this CLI. The package README says the browser login code expires quickly, and the stored token stays usable until logout or server-side revocation. `auth logout` posts `/api/v1/auth/cli-device/revoke-current`. The same session can be revoked from Account Settings, CLI sessions, in the web app.

### Commands

```bash
npm ci
npm run fund-update:draft -- --date YYYY-MM-DD
npm run build
```

Preview `http://localhost:8080/drafts/fund-update-week-of-YYYY-MM-DD/`. Do not run `fund-update:publish` or `--promote`.

### Success checks

The draft command prints:

```text
version  → vnext-2026-07-24
coverage → <funds> funds · <sessions> week sessions · Chair notes <chairs>/<funds> · strips <strips>/<funds> · net posture <nets>/<funds>
regime   → <week path>
```

Accept the draft only when all of these hold:

- `version` is `vnext-2026-07-24`
- `funds` is greater than 0 and matches `fundsForAsOf` for that date (8 books on or after 2026-10-22)
- `sessions` is greater than 0
- Chair notes, strips, and net posture are each `<funds>/<funds>` (Chair notes non-empty on every fund, a week strip present on every fund)
- a `regime →` line is printed
- the log has no `sessionContext unavailable` warning

If a check fails, stop. Leave the missing Chair notes, strips, and regime path empty. Do not pass `--no-cli` for this unattended full draft.

### Stop

Commit only `_drafts/YYYY-MM-DD-messy-fund-update.snapshot.json` and `_drafts/fund-update-draft-YYYY-MM-DD.md`. Secrets-scan the diff. Push and open a **draft** pull request. Do not merge, deploy, or publish under `/updates/`.

## Optional manual steps

- **`sitemap.xml.njk`:** update `<lastmod>` on the `/fund-update/` `<url>` to the new week's date (archived weeks are auto-included via `collections.fundUpdates` loop)
- **Deploy:** push `main` only when the user explicitly approves — never publish without permission

## Do not

- Add fund updates to the **blog article list** on `/blog/`
- Create **`blog/.../messy-fund-update...`** redirect files for new weeks
- Hand-edit snapshot JSON to “fix” display — re-run draft/publish for that date
- Delete past snapshots (archived URLs depend on them)
- Use `post.njk` layout or `/blog/...` permalink for Fund updates
- Use `publish-blog-post` for this series
- Commit or push without user approval when they asked for preview-only
- Publish with `--no-cli` when the user expects Chair notes / week regime (warn first)
- Put one fund’s cash/base/high-beta % into the **week regime** block (`postureIntent`) — that belongs per fund only

## Related

- Long-form articles: `.cursor/skills/publish-blog-post/SKILL.md`
- Conventions: `_blog/README.md`, `README.md` § Fund / Signal updates
- Weekly build logs: `.cursor/skills/messyvirgo-weekly-buildlog/SKILL.md`
