# Image Placeholder Instructions

The website redesign is complete and functional with your existing images. Below are suggestions for future visual enhancements.

---

## Currently Used Images ✓

These files are already in place and working:

1. **messy-banner.jpg** - Hero banner (shown on home page)
2. **messy-mascot.png** - Your anime-themed mascot character
3. **favicons/** - Browser tab icons (already optimized)
   - messy-16x16.png
   - messy-32x32.png
   - messy-apple-touch.png

---

## Optional Enhancements (Future)

### 1. Build Log Page - Hero Icon
**Purpose:** Visual header for the Build Log page
**Location:** Top of buildlog.html
**Specs:**
- Size: 400x400px (display at 200x200px on retina)
- Format: PNG with transparent background
- Theme: Tech/progress visualization OR Messy mascot in "builder mode"
- Color scheme: Match pink (#ff69b4) and gold (#ffd700)

**Design suggestions:**
- Upward arrow/growth chart
- Gears/cogs (technology)
- Rocket/launch (progress)
- Messy wearing a hard hat or blueprint
- Timeline/milestone icons

### 2. Build Log - Category Icons (Optional)
**Purpose:** Visual indicators for each category filter
**Location:** Next to filter badges in buildlog.html
**Specs:**
- Size: 64x64px
- Format: PNG with transparent background
- Style: Consistent with your brand

**Icons needed:**
1. **Development** (Icon: Code brackets, keyboard, or circuit)
   - Color: Blue (#3b82f6)
   - Filename: `icon-development.png`

2. **Marketing** (Icon: Megaphone, speaker, or chart)
   - Color: Pink (#ec4899)
   - Filename: `icon-marketing.png`

3. **Community** (Icon: People, network, or hearts)
   - Color: Green (#22c55e)
   - Filename: `icon-community.png`

4. **AI** (Icon: Robot, brain, or neural network)
   - Color: Purple (#a855f7)
   - Filename: `icon-ai.png`

5. **Infrastructure** (Icon: Server, cloud, or chain)
   - Color: Orange (#f97316)
   - Filename: `icon-infrastructure.png`

### 3. Litepaper - Section Icons (Optional)
**Purpose:** Visual breaks between sections
**Location:** Before each main section in litepaper.html
**Specs:**
- Size: 80x80px
- Format: PNG with transparent background
- Quantity: 1 per section (4-5 icons total)

**Icons suggested:**
1. **Introduction:** Book, scroll, or document
2. **AI Vision:** Brain, gear, or data nodes
3. **Ecosystem:** Network, tokens, or gears
4. **Trust:** Lock, shield, or handshake
5. **Roadmap:** Milestone, compass, or rocket

---

## How to Add Images When Ready

### 1. Save Images
Save your images to the project folder:
```
/messyvirgo-com/
├── images/            (Create this folder)
│   ├── buildlog-hero.png
│   ├── icon-development.png
│   ├── icon-marketing.png
│   ├── icon-community.png
│   ├── icon-ai.png
│   └── icon-infrastructure.png
```

### 2. Update HTML
Example for Build Log hero:
```html
<div class="buildlog-section">
    <img src="/images/buildlog-hero.png" 
         alt="Build Log Progress Tracking" 
         class="buildlog-hero-image">
    <h2>Build Log</h2>
</div>
```

### 3. Update CSS
Add styling in the relevant CSS file:
```css
.buildlog-hero-image {
    max-width: 200px;
    height: auto;
    margin: 2rem auto;
    display: block;
    filter: drop-shadow(0 0 1rem rgba(255, 105, 180, 0.3));
}
```

### 4. For Category Icons
Update buildlog.html filter badges:
```html
<button class="filter-badge" data-category="development">
    <img src="/images/icon-development.png" alt="" class="filter-icon">
    Development
</button>
```

Add to `/css/buildlog.css`:
```css
.filter-icon {
    width: 20px;
    height: 20px;
    margin-right: 0.5rem;
    display: inline-block;
}
```

---

## Image Specifications - Detailed

### Web Optimization
All images should be:
- **Format:** PNG (for transparency) or WebP (modern browsers)
- **Compression:** Optimized using tools like:
  - TinyPNG.com
  - ImageOptim
  - Squoosh.app
- **Target Size:** Under 100KB each for web delivery
- **Dimensions:** 2x size for retina displays (e.g., 800x800 displayed as 400x400)

### Color Palette
Match your brand:
- **Primary:** Pink #ff69b4
- **Secondary:** Gold #ffd700
- **Background:** Dark #0a0a0a (if needed)
- **Accents:** Gradients of pink → gold

### Transparency
- PNG should use transparent background (not white)
- Work seamlessly on dark backgrounds
- Consider blur/glow effects around edges
