# LocalPDF Website (Astro)

SEO-optimized static website for LocalPDF tool pages.

## Overview

This is the **SEO landing site** built with Astro. It generates static HTML pages for each PDF tool that rank well in search engines and drive traffic to the app-spa.

**Key Difference:**
- **Website** (`/website`) - SEO pages with static content → Links to app-spa
- **App-SPA** (`/src`) - Actual PDF processing application with hash routing

## Structure

```
website/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro      # Header + Footer layout
│   └── pages/
│       ├── merge-pdf.astro        # /merge-pdf → /#merge
│       ├── split-pdf.astro        # /split-pdf → /#split
│       ├── compress-pdf.astro     # /compress-pdf → /#compress
│       ├── protect-pdf.astro      # /protect-pdf → /#protect
│       ├── ocr-pdf.astro          # /ocr-pdf → /#ocr
│       ├── watermark-pdf.astro    # /watermark-pdf → /#watermark
│       ├── rotate-pdf.astro       # /rotate-pdf → /#rotate
│       ├── delete-pages-pdf.astro # /delete-pages-pdf → /#delete-pages
│       └── extract-pages-pdf.astro # /extract-pages-pdf → /#extract-pages
└── README.md                      # This file
```

## Commands

```bash
# Development
npm run dev:web          # Start Astro dev server (port 4321)

# Production
npm run build:web        # Build static HTML pages
npm run preview:web      # Preview production build
```

## How It Works

1. **User visits** `/merge-pdf` (SEO page)
2. **Reads content** about the tool, benefits, how-to
3. **Clicks** "Go to Tool" button
4. **Redirected** to `/app#merge` (app-spa tool)
5. **Uses tool** - processes PDF in browser

## SEO Optimization

Each page includes:

- ✅ **Canonical URL** - `<link rel="canonical" href="https://localpdf.online/merge-pdf" />`
- ✅ **Proper links** - Links to `/app#merge` instead of `/#merge`
- ✅ **Meta descriptions** - Unique for each tool (160 chars)
- ✅ **Title tags** - Optimized with keywords
- ✅ **Semantic HTML** - Proper heading hierarchy
- ✅ **Prefetch hint** - Preloads app for faster navigation

## Page Structure

All pages now use the **ToolPage component** for consistency:

**ToolPage.astro** (`website/src/components/ToolPage.astro`)
- Accepts props: `toolId`, `title`, `description`, `benefits`, `steps`
- Automatically adds canonical URL
- Prefetches app for faster navigation
- Generates proper `/app#tool` links

**Example usage:**
```astro
<ToolPage
  toolId="merge-pdf"
  title="Merge PDF Online"
  metaDescription="..."
  description="..."
  benefits={["⚡ Fast", "🔒 Private", "🆓 Free"]}
  steps={["Upload", "Process", "Download"]}
/>
```

Each tool page renders:

1. **Hero Section**
   - Tool title (H1)
   - Description paragraph
   - 3 benefit cards
   - CTA button → links to `/app#tool`

2. **How It Works**
   - Numbered step list
   - Privacy note

3. **Header/Footer** (from BaseLayout)
   - Logo
   - Navigation
   - Footer links

## SEO Optimization

- ✅ Semantic HTML
- ✅ Meta descriptions (160 chars)
- ✅ Optimized titles
- ✅ Fast static pages
- ✅ Mobile-responsive
- ✅ Clean URLs (/merge-pdf, not /#merge)

## Adding New Tool Page

1. Create `/website/src/pages/new-tool.astro`
2. Copy structure from existing page
3. Update:
   - `title` and `description` (SEO)
   - Tool title, description, benefits
   - CTA button `href` to `/#tool-hash`
4. Build and deploy

## Deployment

### Option 1: Separate Deployment

Deploy website and app separately:
- Website: `/merge-pdf`, `/split-pdf`, etc. → SEO pages
- App: `/app` → React SPA with hash routing

### Option 2: Combined Build

Merge both builds into one deployment:

```bash
# Build both parts
npm run build           # App-SPA → dist/
npm run build:web       # Website → website/dist/

# Copy website into app dist
cp -r website/dist/* dist/

# Deploy dist/ folder
```

Result:
- `/` → App-SPA entry point (index.html)
- `/merge-pdf/` → SEO page for merge tool
- `/split-pdf/` → SEO page for split tool
- `/app` → Redirect to `/` (or symlink index.html)

**Important:** Configure your web server to:
1. Serve `/merge-pdf` as static HTML
2. Serve `/app#merge` using the app-spa index.html
3. Handle hash routing properly

## Notes

- Pages are English-only (for now)
- All "Go to Tool" buttons link to app-spa hash routes
- App-spa is embedded at root `/` with hash routing
- No JavaScript needed for SEO pages (pure HTML/CSS)
