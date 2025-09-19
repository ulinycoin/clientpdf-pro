// Vercel Edge Function for robots.txt
export const config = {
  runtime: 'edge',
}

export default function handler() {
  const robotsContent = `# LocalPDF Robots.txt - Optimized for PDF Tools Search Engine Visibility
# Privacy-first PDF tools that work entirely in your browser
# Updated: September 2025

User-agent: *
Allow: /

# === SEARCH ENGINE SPECIFIC SETTINGS ===

# Googlebot - Allow aggressive crawling for fast indexing
User-agent: Googlebot
Crawl-delay: 0
Allow: /

# Bingbot - Moderate crawling speed
User-agent: Bingbot
Crawl-delay: 1
Allow: /

# YandexBot - Conservative crawling for European/Russian markets
User-agent: YandexBot
Crawl-delay: 2
Allow: /

# Baiduspider - Chinese search engine
User-agent: Baiduspider
Crawl-delay: 3
Allow: /

# DuckDuckBot - Privacy-focused search engine (aligned with our values)
User-agent: DuckDuckBot
Crawl-delay: 0
Allow: /

# === CONTENT TYPE ALLOWANCES ===

# Explicitly allow PDF files for indexing (important for our niche)
Allow: /*.pdf$

# Allow important assets
Allow: /assets/*.css$
Allow: /assets/*.js$
Allow: /images/
Allow: /icons/

# Allow manifest and service worker files
Allow: /manifest.json
Allow: /sw.js
Allow: /service-worker.js

# === DEVELOPMENT FILES BLOCKING ===

# Block source code and development files
Disallow: /src/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /.claude/
Disallow: /scripts/
Disallow: /.vscode/
Disallow: /.github/

# Block build configuration files
Disallow: /*.config.js$
Disallow: /*.config.ts$
Disallow: /vite.config.ts
Disallow: /tailwind.config.js
Disallow: /postcss.config.js
Disallow: /tsconfig.json
Disallow: /package.json
Disallow: /package-lock.json

# Block source maps and temporary files
Disallow: /*.js.map$
Disallow: /*.css.map$
Disallow: /*.ts$
Disallow: /*.tsx$
Disallow: /*.temp$
Disallow: /*.tmp$

# Block cache and system directories
Disallow: /cache/
Disallow: /.cache/
Disallow: /tmp/
Disallow: /temp/
Disallow: /_vercel/
Disallow: /.well-known/vercel/

# Block API endpoints that shouldn't be indexed
Disallow: /api/
Disallow: /_api/

# Block analytics and tracking files
Disallow: /*.log$
Disallow: /analytics/
Disallow: /tracking/

# === SITEMAP LOCATIONS ===

# Main sitemap with all language versions
Sitemap: https://localpdf.online/sitemap.xml

# IndexNow sitemap for fast indexing
Sitemap: https://localpdf.online/indexnow-sitemap.xml

# === ADDITIONAL GUIDELINES ===

# Default crawl delay for unspecified bots
Crawl-delay: 2

# === TOOL-SPECIFIC NOTES ===
# This site provides 16 privacy-first PDF tools:
# - Merge PDF, Split PDF, Compress PDF
# - Add Text, Watermark, Rotate PDF
# - Extract Pages/Text/Images, PDF to Image/SVG
# - Images/Word/Excel to PDF, Protect PDF, OCR PDF
# All tools work locally in browser without uploads
# Available in 5 languages: EN, DE, FR, ES, RU`;

  return new Response(robotsContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}