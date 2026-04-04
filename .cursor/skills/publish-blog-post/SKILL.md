---
name: publish-blog-post
description: Creates a new MESSY blog post from textual input in _blog/_posts with correct Eleventy front matter, filename, and Markdown body. Use when the user wants to publish or add a blog post, draft a post from notes, convert text into a _posts entry, or mentions _blog/_posts or the MESSY blog.
---

# Publish MESSY blog post

## When this applies

The user supplies (or you infer) post content—notes, a draft, bullet outline, or full prose. Your job is to add **one new file** under `_blog/_posts/` that matches existing posts and `_blog/README.md`.

## File naming

- Pattern: `YYYY-MM-DD-slug.md` in `_blog/_posts/`.
- **Date**: Use the publication date the user gives; if none, use the conversation’s authoritative “today” date.
- **Slug**: Lowercase, hyphenated ASCII, no leading/trailing hyphens. Derive from the title (e.g. `why-99-percent-of-tokens-get-nuked-and-how-messy-built-a-lifeboat`). Avoid `%`, em dashes in the filename (use words or hyphens). Collapse repeated hyphens.

## Front matter (required)

Use this shape exactly. **Do not change** `layout` or `permalink`.

```yaml
---
title: "Human-readable title"
date: YYYY-MM-DD
description: "One or two sentences for SEO and listing previews."
tags: [tag-one, tag-two]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---
```

- **title**: Quoted string; can include punctuation (e.g. `%`, em dash) in the title itself—filename slug stays ASCII-safe.
- **description**: Concrete summary of the post; not clickbait; matches opening sections.
- **tags**: Lowercase, hyphenated topics consistent with recent posts (e.g. `messy-virgo`, product areas). Omit or use `[]` only if the user explicitly wants no tags; otherwise infer 2–5 tags from content.

## Body (Markdown)

- **Do not** use a single `#` heading for the post title; the template supplies the title. Start sections with `##` / `###` like existing posts.
- Preserve the user’s voice; fix obvious typos and broken Markdown.
- Use standard Markdown: lists, **bold**, *italic*, links, fenced code blocks with language tags when applicable.
- For images and Eleventy specifics, follow `_blog/README.md`.

## Workflow

1. Confirm title, date, and intent from the user (infer only when obvious).
2. Choose slug and filename; ensure no collision with an existing `_blog/_posts/*.md` file (same date + slug).
3. Write front matter, then the body separated by `---` closing the front matter.
4. Save only the new post file unless the user asks for README or template edits.

## Verification

- After adding the file, optionally run `npm run dev` from the repo root and open `/blog/` to confirm the post appears (see `_blog/README.md`).
- Do not claim the site builds successfully without running the command when the user cares about verification.

## Reference

- Conventions and build commands: `_blog/README.md` (repository root)
- Examples: `_blog/_posts/*.md`
