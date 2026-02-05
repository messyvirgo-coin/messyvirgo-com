# Reviewing repo docs (Website)

This file describes the required community/legal files for this repository and how to review them.

## What this repo is

- Public website repository (HTML/CSS/JS)
- Open code to encourage reuse and contributions
- Brand assets and trademarks are protected

## Required files (must exist)

- `README.md`
  - Quick start (install/run/build)
  - Deployment notes
  - Clear disclaimer: informational only; no financial advice
- `LICENSE`
  - **Apache License 2.0** (code license)
- `NOTICE.md`
  - States: code is Apache-2.0
  - States: Messy Virgo brand assets/trademarks are **not licensed** (reserved)
  - Lists which paths are considered brand assets (e.g. `images/`, `favicons/`, `_blog/_posts/`)
  - “No endorsement” language
- `CODE_OF_CONDUCT.md`
  - Contributor Covenant
  - Contact email for enforcement
- `CONTRIBUTING.md`
  - Issues-first workflow
  - PR checklist (no secrets, test locally)
  - Maintainers / review expectations

## Optional but recommended

- `SECURITY.md`
  - Vulnerability reporting email + response expectations
- `TRADEMARK.md` (or `BRAND.md`)
  - Rules for using name/logo; no confusion/endorsement

## What must NOT be here

- Licenses that don’t match repo intent (e.g. CC BY-NC references if assets are reserved).
- References to files that don’t exist, or instructions for a different repository.

## Review checklist (PR/Release)

- [ ] `LICENSE` matches intended license and year/org name are correct
- [ ] `NOTICE.md` correctly scopes reserved assets and trademarks
- [ ] `CONTRIBUTING.md` matches actual build tooling and commands
- [ ] Contact emails/usernames are correct and monitored
- [ ] No policy docs mention a different repository (copy/paste drift)

