# Testing Guide - MESSY Blog Implementation

## Quick Start Testing

### Option 1: Full Development Server (Recommended)

Open **two terminal windows**:

**Terminal 1 - Watch CSS:**
```bash
npm run watch:css
```

**Terminal 2 - Eleventy Dev Server:**
```bash
npm run serve
```

This will:
- Watch CSS changes and rebuild automatically
- Start Eleventy dev server at `http://localhost:8080`
- Auto-reload when you make changes

### Option 2: Build and Serve Static Files

If you just want to build and test the static files:

```bash
# Build everything
npm run build

# Then serve the _site directory using any static server
# For example, using Python:
cd _site
python3 -m http.server 8080
```

## Testing Checklist

### ✅ 1. Verify Blog Index Page
1. Open browser to: `http://localhost:8080/blog/`
2. Check that:
   - Page loads correctly
   - Shows "MESSY Blog" heading
   - Displays the sample blog post card
   - Navigation bar includes "Blog" link
   - Mobile menu works

### ✅ 2. Test Individual Blog Post
1. Click on the blog post in the listing page
2. Or navigate directly to: `http://localhost:8080/blog/2024/12/welcome-to-the-messy-blog/`
3. Verify:
   - Post title displays correctly
   - Date shows properly
   - Markdown content renders correctly
   - Navigation works
   - "Back to Blog" link works

### ✅ 3. Check Navigation Integration
1. Visit each main page:
   - `http://localhost:8080/` (Home)
   - `http://localhost:8080/litepaper/`
   - `http://localhost:8080/buildlog/`
   - `http://localhost:8080/founder-profiles/`
2. On each page, verify:
   - "Blog" link appears in navigation
   - Clicking "Blog" takes you to `/blog/`
   - Mobile menu includes Blog link

### ✅ 4. Test Adding a New Blog Post

Create a test post:

```bash
# Create a new post file
cat > _blog/_posts/2024-12-20-test-post.md << 'EOF'
---
title: "Test Blog Post"
date: 2024-12-20
description: "This is a test post to verify the blog system works correctly"
tags: [test, development]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

## Testing the Blog System

This is a **test post** to verify that:
- New posts can be added
- Markdown rendering works
- Tags display correctly

### Features to Check

- Lists work
- **Bold text** works
- *Italic text* works
- [Links work](https://example.com)

> Blockquotes work too!

```javascript
// Code blocks work
console.log("Hello, MESSY!");
```
EOF
```

Then:
- Stop and restart `npm run serve` (or wait for auto-reload)
- Visit `http://localhost:8080/blog/`
- You should see your new test post appear
- Click it to view the full post

### ✅ 5. Verify Sitemap

1. Open: `http://localhost:8080/sitemap.xml`
2. Check that it includes:
   - Home page (`/`)
   - All static pages (`/litepaper/`, `/buildlog/`, etc.)
   - Blog index (`/blog/`)
   - All blog posts (should include your test post if added)

### ✅ 6. Check Responsive Design

1. Open browser DevTools (F12)
2. Test mobile view (toggle device toolbar)
3. Verify:
   - Navigation menu works on mobile
   - Blog cards stack properly
   - All content is readable on small screens

### ✅ 7. Test Build Output

```bash
# Clean build
rm -rf _site
npm run build

# Check generated files
ls -la _site/blog/
ls -la _site/blog/2024/12/
```

Expected output:
- `_site/blog/index.html` (blog listing)
- `_site/blog/2024/12/welcome-to-the-messy-blog/index.html` (sample post)
- `_site/sitemap.xml` (sitemap)

## Common Issues & Solutions

### Issue: Blog posts not appearing
- **Solution**: Check that markdown files are in `_blog/_posts/` with correct naming: `YYYY-MM-DD-title.md`
- **Solution**: Verify frontmatter is correct (must start and end with `---`)

### Issue: CSS not updating
- **Solution**: Make sure `npm run watch:css` is running in a separate terminal
- **Solution**: Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

### Issue: Build errors
- **Solution**: Check `.eleventyignore` - files might need to be excluded
- **Solution**: Verify all required dependencies are installed: `npm install`

### Issue: Navigation links broken
- **Solution**: Check that all links use `/path/` format (trailing slash for directories)
- **Solution**: Verify links don't have `.html` extensions

## Testing Markdown Features

Create a post with various markdown features to test:

```markdown
---
title: "Markdown Test"
date: 2024-12-20
description: "Testing all markdown features"
tags: [test]
layout: post.njk
permalink: /blog/{{ page.date | dateFilter }}/{{ title | slugify }}/index.html
---

# H1 Heading
## H2 Heading
### H3 Heading

**Bold text** and *italic text*

- Bullet list item 1
- Bullet list item 2
  - Nested item

1. Numbered list
2. Second item

[Link text](https://example.com)

> Blockquote text

\`\`\`javascript
// Code block
function test() {
  console.log("test");
}
\`\`\`

Inline `code` example
```

## Next Steps After Testing

Once everything works locally:

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add Eleventy blog integration"
   ```

2. **Push to GitHub**:
   ```bash
   git push origin feature/blog
   ```

3. **Set up GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or your deployment branch)
   - Folder: `/` (root) - GitHub Actions will deploy from `_site/`

4. **Or use GitHub Actions**:
   - The workflow will automatically build and deploy on push
   - Check Actions tab in GitHub repository

## Quick Test Commands

```bash
# Build once
npm run build

# Build and verify
npm run build && ls -la _site/blog/

# Clean and rebuild
rm -rf _site && npm run build

# Check sitemap
cat _site/sitemap.xml | grep -c "<url>"

# Count generated HTML files
find _site -name "*.html" | wc -l
```

---

**Happy Testing!** 🚀

