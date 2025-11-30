# MESSY Blog

## Adding New Blog Posts

### 1. Create a New Post File
Create a new markdown file in the `_blog/_posts/` directory with the naming convention:
```
YYYY-MM-DD-post-title.md
```

Example: `2024-12-20-new-feature-launch.md`

### 2. Add Front Matter
Each post must start with YAML front matter:
```yaml
---
title: "Your Post Title"
date: 2024-12-20
description: "A brief description of the post for SEO and previews"
tags: [tag1, tag2, tag3]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---
```

**Important fields:**
- `title`: The post headline
- `date`: Publication date (YYYY-MM-DD format)
- `description`: SEO description and preview text
- `tags`: Array of tags (optional)
- `layout`: Always use `post.njk`
- `permalink`: Generates the URL automatically (do not modify)

### 3. Write Your Content
Below the front matter, write your post in Markdown:
```markdown
## Section Heading

Your content here with **bold**, *italic*, and [links](https://example.com).

### Subsection

- Bullet point 1
- Bullet point 2

Code blocks are supported:
\`\`\`javascript
console.log("Hello, MESSY!");
\`\`\`
```

### 4. Full Example Post
```markdown
---
title: "Launch of v2 Due Diligence Engine"
date: 2024-12-20
description: "Announcing the release of our improved Due Diligence Engine with enhanced signal detection"
tags: [product, updates, ai-agents]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

## What's New

We're excited to announce the launch of v2...

### Key Features

- Feature 1
- Feature 2
- Feature 3

Read more on our [X account](https://x.com/MessyVirgoCoin).
```

## Building and Testing

### Local Development
```bash
npm run dev
```

This starts a development server with live reloading at `http://localhost:8080`

### Building for Production
```bash
npm run build
```

Generates the static site in `_site/` directory.

## File Structure
```
_blog/
├── _posts/              # Your markdown blog posts go here
│   └── 2024-12-15-welcome-to-messy-blog.md
└── README.md           # This file

_includes/
└── post.njk            # Post template (do not edit)

blog/
└── index.njk           # Blog listing page template (do not edit)
```

## Auto-Generated Features

- **Blog Index**: Automatically updated at `/blog/`
- **Sitemap**: Blog posts automatically added to `/sitemap.xml`
- **RSS/Feeds**: Can be added in future updates
- **Archive Pages**: Can be added in future updates

## Markdown Formatting

### Headings
```markdown
# H1 (post title auto-generated)
## H2 Main section
### H3 Subsection
```

### Lists
```markdown
- Item 1
- Item 2
  - Nested item

1. First item
2. Second item
```

### Code
```markdown
Inline code: `code here`

Code block:
\`\`\`language
code here
\`\`\`
```

### Links and Images
```markdown
[Link text](https://example.com)
```

Images cannot be added directly but can be embedded via HTML in the sidebar.

### Emphasis
```markdown
**Bold text**
*Italic text*
***Bold italic***
```

## Questions?

Refer to the Eleventy documentation: https://www.11ty.dev/docs/
Or check the GitHub repository for examples.

