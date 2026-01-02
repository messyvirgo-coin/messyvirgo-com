# Contributing to messyvirgo.com (website repo)

Thanks for your interest in contributing to Messy Virgo.

This repo is the **public website** for `messyvirgo.com`. It’s public for transparency and collaboration, but it is also an **official communication channel**—so the maintainers retain editorial control over what gets merged.

## Ground rules

- **Be respectful**: follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
- **Keep it public-safe**: do not include secrets, personal data, private links, or confidential information.
- **Prefer clarity over cleverness**: write for readers outside your context.
- **No financial advice**: avoid content that reads like trading/investment recommendations.
- **No implied endorsement**: don’t use the site/repo to promote third parties as “partnered/endorsed” unless maintainers explicitly approve it.

## What kinds of contributions we welcome

- **Typos & broken links**
- **Accessibility improvements** (contrast, labels, keyboard nav, reduced motion)
- **Performance improvements** (smaller assets, simpler JS/CSS)
- **Bug fixes** in UI behavior
- **Blog posts** (in `_blog/_posts/`) that match the site’s voice and purpose
- **Docs improvements** (README, build notes)

## Contribution boundaries (important)

This repository is public, but:

- **Not every PR will be accepted**, even if it’s well-made.
- **Non-members/non-maintainers** are welcome to open issues with suggestions. PRs from non-maintainers may be accepted for clearly beneficial fixes, but may also be declined or requested to proceed with a maintainer sponsor.
- The maintainers may request edits or rewrites to keep messaging consistent and reduce legal/communications risk.

## Quick start (local preview)

Install dependencies:

```bash
npm ci
```

Run the recommended dev workflow:

```bash
npm run watch:css  # Terminal 1
npm run serve      # Terminal 2 (Eleventy at http://localhost:8080)
```

### Important: don’t edit generated output

- `_site/` is **generated**. Please don’t hand-edit it.
- Make changes in the source files (e.g. `index.html`, `_includes/`, `blog/`, `_blog/_posts/`, `css/`, `js/`) and run `npm run build` to regenerate output.

## Blog posts

Blog posts live in `_blog/_posts/`.

- Follow the instructions in `_blog/README.md`.
- Keep posts factual and mission-aligned; avoid claims that could be interpreted as financial advice.

## Pull request checklist

- **Explain intent**: what problem does this solve and who is the audience?
- **Keep PRs focused**: one topic per PR when possible.
- **Test locally**: confirm `npm run build` works and pages render in a browser.
- **No secrets**: double-check you didn’t add keys, tokens, personal emails, or private URLs.
- **Respect licensing/brand**: see [NOTICE](./NOTICE.md) and [BRAND](./BRAND.md).

## Maintainers

- `@messy-michael`
- `@MessyFranco`


