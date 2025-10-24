# Deployment Guide

## Overview

This project consists of two parts:
1. **SEO Website** - Static Astro pages (`/merge-pdf`, `/split-pdf`, etc.)
2. **App-SPA** - React application with hash routing (`/app#merge`, `/app#split`, etc.)

## Build Process

```bash
# Build app-spa
npm run build           # → dist/

# Build website
npm run build:web       # → website/dist/

# Combine builds (optional)
cp -r website/dist/* dist/
```

## Deployment Options

### Option 1: Single Domain (Recommended)

Deploy everything to one domain (e.g., `localpdf.online`):

```
localpdf.online/
├── index.html              # App-SPA entry
├── app → index.html        # Symlink for /app route
├── assets/                 # App-SPA JS/CSS bundles
├── merge-pdf/
│   └── index.html          # SEO page
├── split-pdf/
│   └── index.html          # SEO page
└── ...
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name localpdf.online;
    root /var/www/localpdf;
    index index.html;

    # Serve static SEO pages directly
    location ~ ^/(merge-pdf|split-pdf|compress-pdf|protect-pdf|ocr-pdf|watermark-pdf|rotate-pdf|delete-pages-pdf|extract-pages-pdf) {
        try_files $uri $uri/ $uri.html $uri/index.html =404;
    }

    # Serve app-spa for /app and root
    location /app {
        alias /var/www/localpdf;
        try_files $uri $uri/ /index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache Configuration (.htaccess):**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Serve static tool pages
    RewriteRule ^(merge-pdf|split-pdf|compress-pdf|protect-pdf|ocr-pdf|watermark-pdf|rotate-pdf|delete-pages-pdf|extract-pages-pdf)$ $1/index.html [L]

    # Serve app for /app route
    RewriteRule ^app$ index.html [L]

    # Fallback to app-spa for other routes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|woff|woff2|jpg|png|svg)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>
```

### Option 2: Subdirectory

Deploy app-spa in `/app` subdirectory:

```
localpdf.online/
├── merge-pdf/index.html     # SEO pages at root
├── split-pdf/index.html
└── app/
    ├── index.html           # App-SPA
    └── assets/
```

Update all links in website pages:
- Change `/app#merge` to `/app/#merge`

### Option 3: Separate Domains

Deploy on separate domains:
- **SEO:** `localpdf.online` (Astro static pages)
- **App:** `app.localpdf.online` (React SPA)

Update website links:
- Change `/app#merge` to `https://app.localpdf.online#merge`

## CDN Configuration

If using a CDN (Cloudflare, CloudFront):

1. **Cache SEO pages** - Cache `/merge-pdf`, `/split-pdf`, etc. for 1 day
2. **Don't cache app** - Bypass cache for `/` and `/app` (always serve latest)
3. **Cache static assets** - Cache `/assets/*` for 1 year

## Verification

After deployment, verify:

1. **SEO Pages work:**
   - Visit `https://localpdf.online/merge-pdf`
   - Should see static HTML page
   - Check "Go to Tool" button links to `/app#merge`

2. **App-SPA works:**
   - Visit `https://localpdf.online/app#merge`
   - Should load React application
   - Tool should function properly

3. **Canonical URLs:**
   - View page source of `/merge-pdf`
   - Should contain: `<link rel="canonical" href="https://localpdf.online/merge-pdf" />`

4. **Google Search Console:**
   - Submit sitemap with all tool pages
   - Monitor indexing status

## SEO Checklist

- [ ] Canonical URLs point to correct domain
- [ ] All tool pages return 200 status
- [ ] Meta descriptions are unique (160 chars)
- [ ] Title tags include keywords
- [ ] robots.txt allows crawling
- [ ] Sitemap includes all tool pages
- [ ] Page speed < 2s (use PageSpeed Insights)

## Troubleshooting

### "Go to Tool" button returns 404

**Cause:** App-SPA not configured to handle `/app` route

**Fix:** Add rewrite rule or symlink:
```bash
cd dist
ln -s index.html app
```

### SEO pages not indexing

**Cause:** Canonical URL points to wrong domain

**Fix:** Update `canonicalURL` in each page component:
```astro
const canonicalURL = 'https://your-actual-domain.com/merge-pdf';
```

### App-SPA doesn't load

**Cause:** Base path mismatch

**Fix:** Check `vite.config.ts` base setting:
```ts
export default defineConfig({
  base: '/', // or '/app/' if deployed in subdirectory
})
```

## Performance Tips

1. **Enable gzip/brotli** compression on web server
2. **Use HTTP/2** for faster asset loading
3. **Preload critical assets** in SEO pages
4. **Enable CDN** for global distribution
5. **Monitor Core Web Vitals** with Google Search Console

## Security

- ✅ HTTPS only (redirect HTTP → HTTPS)
- ✅ Set proper CSP headers
- ✅ Enable HSTS header
- ✅ Use SRI for external resources (Google Fonts)
- ✅ Sanitize user inputs in app-spa

## Monitoring

Track these metrics:
- Page load time (< 2s)
- SEO page traffic (Google Analytics)
- Conversion rate (SEO page → App usage)
- Bounce rate on tool pages
- Search rankings for keywords
