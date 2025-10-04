# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude's Role in This Project

You are the **Lead Developer** for LocalPDF, a privacy-first PDF toolkit. Your responsibilities include:

### Core Responsibilities
- **Stay informed** about all project changes and understand the full codebase
- **Propose improvements** to functionality, UI/UX, and project configuration
- **Implement features** only when you have verified understanding and capability
- **Research solutions** using available documentation before making suggestions

### Decision-Making Principles
- Only suggest changes you can **confidently implement**
- When uncertain, **research available documentation** and verify approaches
- **Don't assume capabilities** - always validate technical feasibility first
- Focus on **privacy-first, browser-based** solutions that align with project goals

### Areas of Focus
- **Performance optimization** for client-side PDF processing
- **AI-powered features** for smart document analysis and recommendations
- **UI/UX improvements** following the glass morphism design system
- **Accessibility enhancements** for better user experience
- **SEO and multilingual** optimization across all 5 supported languages (EN, RU, DE, FR, ES)
- **Prerendering infrastructure** - Google Cloud Run + GCS caching for search bots
- **Code quality** improvements and technical debt reduction

## Common Commands

### Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (skips type checking for speed)
- `npm run build:full` - Full production build with sitemap generation and IndexNow submission
- `npm run preview` - Preview production build locally

### SEO & Cache Management
- `./check-bot-cache.sh` - Quick GCS cache health check (recommended daily)
- `node cache-warmer-gcs.cjs all` - Warm all 82 URLs (~7 minutes)
- `node cache-warmer-gcs.cjs tier1` - Warm critical pages only (EN+RU)
- `gcloud storage ls -r gs://localpdf-rendertron-cache/cache/` - View cached files
- `gcloud run services logs read rendertron --region us-central1` - Check Rendertron logs

### Testing and Quality
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint with TypeScript support
- `npm run test` - Run Vitest unit tests in watch mode
- `npm run test:run` - Run unit tests once
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:all` - Run all tests (type-check, unit tests, E2E tests)

### SEO and Deployment
- `npm run generate-multilingual-sitemap` - Generate sitemaps for all supported languages
- `npm run submit-indexnow` - Submit URLs to search engines via IndexNow API
- `npm run deploy` - Deploy to production

## Project Architecture

### Language Support
The application supports 5 languages: English (default), German, French, Spanish, and Russian. All UI text is internationalized using a custom i18n system.

**Key i18n files:**
- `src/locales/` - Contains all translations organized by language
- `src/hooks/useI18n.tsx` - Main internationalization hook
- `src/types/i18n.ts` - TypeScript definitions for translations

### Routing System
Uses React Router with a sophisticated multilingual routing system:
- Default language (English) routes have no prefix: `/merge-pdf`
- Localized routes have language prefix: `/de/merge-pdf`, `/fr/merge-pdf`
- Route configuration in `src/config/routes.ts` with lazy-loaded components
- All page components are in `src/pages/` with tool pages in `src/pages/tools/`

### Component Structure
Follows atomic design principles:
- **Atoms** (`src/components/atoms/`) - Basic UI elements (Button, Icon, ProgressBar)
- **Molecules** (`src/components/molecules/`) - Compound components (UploadSection, ToolCard, LanguageSwitcher)
- **Organisms** (`src/components/organisms/`) - Complex components (Header, Footer, tool implementations)
- **Templates** (`src/components/templates/`) - Page layout templates
- **Pages** (`src/pages/`) - Route components that use templates

### PDF Processing Architecture
This is a browser-based PDF toolkit with client-side processing:

**Core PDF Libraries:**
- `pdf-lib` - Main PDF manipulation library
- `pdfjs-dist` - PDF rendering and text extraction
- `@pdf-lib/fontkit` - Font handling for PDF generation

**Service Layer** (`src/services/`):
- Each PDF operation has a dedicated service (e.g., `splitService.ts`, `mergeService.ts`)
- Services handle the complex PDF operations and error handling
- Browser polyfills in `src/main.tsx` ensure Node.js modules work in browser

**Key Services:**
- `pdfService.ts` - Core PDF operations
- `compressionService.ts` - PDF size optimization
- `ocrService.ts` - OCR text extraction using Tesseract.js
- `fontManager.ts` - Font loading and management
- `imageToPDFService.ts` - Image to PDF conversion

**AI-Powered Services** (Smart Recommendations):
- `smartPDFService.ts` - Universal AI analysis engine (1361 lines) for all PDF tools
  - Supports: Split, Compress, Protect, OCR (Advanced), Watermark
  - Document analysis, quality estimation, language detection
  - Multilingual i18n integration with automatic re-analysis on language change
- `smartMergeService.ts` - Intelligent merge recommendations (order, compatibility)
- `smartCompressionService.ts` - Smart compression level suggestions

**AI Components** (`src/components/molecules/`):
- `SmartMergeRecommendations.tsx` - AI suggestions for Merge PDF
- `SmartSplitRecommendations.tsx` - AI suggestions for Split PDF
- `SmartCompressionRecommendations.tsx` - AI compression optimization
- `SmartProtectionRecommendations.tsx` - AI security recommendations
- `SmartOCRRecommendations.tsx` - AI OCR optimization suggestions

### AI Features & Smart Recommendations
LocalPDF includes AI-powered analysis and recommendations for various PDF operations:

**Core AI Capabilities:**
- **Document Analysis** - Automatic detection of PDF characteristics (pages, size, type)
- **Smart Recommendations** - Context-aware suggestions for optimal settings
- **Quality Predictions** - Estimates of output quality and file size
- **Warning System** - Proactive alerts for potential issues

**Implementation Status:**
- ✅ **Merge PDF** - Intelligent file ordering, compatibility checks, size predictions
- ✅ **Split PDF** - Smart page range suggestions, chapter detection
- ✅ **Compress PDF** - Optimal compression level recommendations
- ✅ **Protect PDF** - Security level suggestions, password strength recommendations
- ✅ **OCR PDF** - Advanced language detection, image quality analysis, preprocessing optimization
- 🔄 **Watermark PDF** - Placement suggestions, text recommendations (partial implementation)

**AI Architecture:**
- Client-side analysis using `smartPDFService.ts` universal engine
- No external AI API calls - all processing happens in browser
- Privacy-first design - documents never leave user's device
- Specialized services per tool for domain-specific intelligence

**Usage Pattern:**
```typescript
// Example: Using Smart Recommendations
import { analyzeDocument } from '@/services/smartPDFService';

const analysis = await analyzeDocument(pdfFile);
const recommendations = getToolRecommendations(analysis, 'merge');
// Display AI suggestions to user
```

### Styling System
Uses Tailwind CSS with extensive customization:
- Custom color palette focused on privacy/ocean theme (seafoam, ocean, privacy colors)
- Glass morphism effects and modern animations built into Tailwind config
- Dark mode support with class-based switching
- Custom utility classes for gradient text and glass effects

### File Upload and Processing
- Privacy-first design - all processing happens in browser
- Drag-and-drop file upload with validation
- Progress indicators for long-running operations
- File type validation and size limits per tool

### Type Safety
- TypeScript throughout with custom type definitions
- Each tool has dedicated types in `src/types/`
- Path aliases configured for clean imports (`@/components`, `@/services`, etc.)

## Development Notes

### Browser Polyfills
The application includes extensive Node.js polyfills in `src/main.tsx` to make server-side PDF libraries work in browsers. These polyfills are critical and should not be modified without careful testing.

### Performance Considerations
- All page components are lazy-loaded for better initial load times
- Type checking is skipped during build for faster deployment
- Images and assets are optimized through Vite

### SEO and Analytics
- React Helmet Async for dynamic meta tags
- Vercel Analytics integration
- Automatic sitemap generation for all languages and routes
- IndexNow API integration for search engine updates

### Testing Setup
- Vitest for unit tests with jsdom environment
- Playwright for E2E testing
- Test setup file at `src/tests/setup.ts`

## SEO Infrastructure Solutions

### Rendertron Self-Hosted Solution (Migrated from Prerender.io)
**Migration Date:** October 1, 2025 (commit `1a48f32`)
**Cost Savings:** $1,080/year ($90/month Prerender.io → $0/month Rendertron)

The project uses **self-hosted Rendertron on Render.com** for server-side rendering to improve SEO for search engine crawlers:

**Current Setup:**
- **middleware.js** - Edge runtime middleware with bot detection and Rendertron integration
- **Rendertron service** - Free tier on Render.com: `localpdf-rendertron.onrender.com`
- **Whitelist system** - Only EN + RU languages get scheduled rendering (42 URLs total)
- **Smart filtering** - DE/FR/ES work as SPA, but can get real-time prerendering
- **No authentication** - Rendertron is open-source, no token required
- **Cold start handling** - 30s timeout to handle Render.com free tier 15min sleep

**Key Components:**
```javascript
// Scheduled Rendering Whitelist (middleware.js)
const SCHEDULED_RENDERING_WHITELIST = [
  // Tier 1: Critical (12 URLs) - Homepage + Top 5 tools
  '/', '/merge-pdf', '/split-pdf', '/compress-pdf', '/protect-pdf', '/ocr-pdf',

  // Tier 2: Standard (22 URLs) - All other tools
  '/add-text-pdf', '/watermark-pdf', /* ... other tools ... */

  // Tier 3: Blog (8 URLs) - Featured blog posts
  '/blog', '/blog/complete-guide-pdf-merging-2025', /* ... */
];

// Language filtering for EN + RU only
const SCHEDULED_RENDERING_LANGUAGES = ['en', 'ru'];
```

### Cache Warmer Solution (Adapted for Rendertron)
**Problem:** Render.com free tier sleeps after 15min inactivity → Cold start (10-30s) → Bad SEO
**Solution:** Automatic cache warming system → Always warm (5-15s response) → Better SEO

**Implementation:**
- **cache-warmer.cjs** - Node.js script that simulates bot visits to keep Rendertron warm
- **.github/workflows/cache-warmer.yml** - GitHub Actions automation (every 12 hours: 6:00 and 18:00 UTC)
- **Smart scheduling** - Tier 1 every 2 days, Tier 2 every 3 days, Tier 3 every 5 days
- **Cost efficiency** - $0 solution on Render.com free tier

**Usage:**
```bash
# Manual cache warming (works with Rendertron)
node cache-warmer.cjs tier1    # Critical pages only
node cache-warmer.cjs all      # All URLs
node cache-warmer.cjs auto     # Smart mode (GitHub Actions default)

# Monitoring Rendertron health
./monitor-rendertron.sh        # Health check script (30 seconds)
```

**Expected Results:**
- +25-40% organic traffic for EN + RU languages
- 92%+ success rate for cache warming
- Prevention of cold starts for search bots
- Response times: 5-15s (warm) vs 10-30s (cold start)
- Better Core Web Vitals and SEO ranking

### Monitoring Tools
**monitor-rendertron.sh** - Main health check script (recommended weekly):
- ✅ **Service health** - Checks Rendertron is online
- ✅ **Page rendering** - Tests actual page rendering
- ✅ **Middleware integration** - Verifies bot detection works
- ✅ **Response time** - Ensures < 30s response times
- **Usage:** `./monitor-rendertron.sh` (takes 30 seconds)

**Render.com Dashboard** - Real-time monitoring:
- 🔗 https://dashboard.render.com/web/srv-d3ejtk3ipnbc73c0645g
- **Logs** - Monitor renders and errors in real-time
- **Events** - Track deploys, restarts, suspensions
- **Metrics** - CPU/Memory usage (paid plans only)

**GitHub Actions** - Cache Warmer status:
- 🔗 https://github.com/ulinycoin/clientpdf-pro/actions/workflows/cache-warmer.yml
- **Runs** - Every 12 hours (6:00 and 18:00 UTC)
- **Success rate** - Should be ≥80%
- **Artifacts** - Contains logs and JSON results for debugging

### Key Differences: Rendertron vs Prerender.io
| Feature | Prerender.io (old) | Rendertron (current) |
|---------|-------------------|---------------------|
| **Cost** | $90/month (paid) | $0/month (free) |
| **Cache** | 3-day TTL limit | No cache (always fresh) |
| **Speed** | 28ms (hit), 3-4s (miss) | 5-15s (warm), 10-30s (cold) |
| **Auth** | Token required | No auth needed |
| **Limits** | Request limits | No limits on free tier |
| **Control** | SaaS vendor | Self-hosted |
| **Cold starts** | None | 15min inactivity → sleep |

**Migration Benefits:**
- ✅ **Cost savings** - $1,080/year eliminated
- ✅ **Full control** - Self-hosted, open-source
- ✅ **No limits** - Unlimited rendering on free tier
- ⚠️ **Trade-off** - Slower (5-15s vs 28ms), but always fresh content

### Documentation Files
- **RENDERTRON_MONITORING.md** - Comprehensive monitoring guide for Rendertron
- **CACHE_WARMER_GUIDE.md** - Setup and usage instructions for cache warmer
- **SCHEDULED_RENDERING_IMPLEMENTATION.md** - Technical implementation details (legacy)
- **README.md** - Project overview with Rendertron migration details

### Implementation History

**Phase 1: Scheduled Rendering (Dec 2024)**
- **d4d59c1** - Initial scheduled rendering implementation with middleware whitelist
- **Problem:** Needed SEO optimization for critical EN+RU pages

**Phase 2: Cache Warmer (Dec 2024)**
- **c38ff5c** - Cache Warmer solution to solve Prerender.io 3-day cache expiry issue
- **Problem:** Prerender.io free plan cache expires after 3 days → 3-4s Miss responses

**Phase 3: Rendertron Migration (Oct 2025)** ⭐ **DEPRECATED - Replaced by Phase 4**
- **1a48f32** - Migrated from Prerender.io to self-hosted Rendertron on Render.com
- **Problem:** Prerender.io costs $90/month, has request limits, vendor lock-in
- **Solution:** Free self-hosted Rendertron with Cache Warmer preventing cold starts
- **Result:** Deprecated in favor of Google Cloud Run + GCS for better performance

**Phase 4: GCS Caching Implementation (Oct 4, 2025)** ⭐ **CURRENT**
- **Migration:** Moved from Render.com to Google Cloud Run with GCS caching layer
- **Problem:** Render.com had slow responses (5-15s), cold starts, no persistent cache
- **Solution:** Two-tier architecture on Cloud Run with Google Cloud Storage caching

**Architecture:**
```
Request Flow:
1. Bot request → Vercel Middleware (bot detection)
2. Middleware → Cloud Run Rendertron (port 8080)
3. Cache Proxy checks GCS bucket
   └─ Cache HIT → Return in ~175-1250ms
   └─ Cache MISS → Render with Rendertron (port 3000) → Save to GCS → Return in ~4500-6500ms
4. Vercel Edge Cache (1 hour) → Subsequent requests in ~168-686ms
```

**Key Components:**
- **rendertron/cache-proxy.js** (221 lines) - Express server with GCS integration
- **rendertron/start.sh** - Sequential startup script (Rendertron on 3000, Cache Proxy on 8080)
- **rendertron/Dockerfile** - Two-service container with proper PORT management
- **cache-warmer-gcs.cjs** - Automated cache warming for all 113 URLs (5 languages)
- **check-bot-cache.sh** - Quick cache health check script
- **.github/workflows/cache-warmer-gcs.yml** - GitHub Actions automation

**Performance Results:**
1. ✅ **Vercel Edge Cache** (1 hour TTL): **168-686ms** ⚡⚡⚡
2. ✅ **GCS Cache HIT** (24 hour TTL): **175-1250ms** ⚡⚡
3. ✅ **First Render** (cache MISS): **4500-6500ms** ⚡
4. ✅ **Speed improvement**: **28-34x faster** (vs cold render)
5. ✅ **Cache coverage**: **79/82 pages** (96% success rate)

**Cost Breakdown:**
- **Prerender.io** (old): $90/month = $1,080/year
- **Render.com** (Phase 3): $0/month but slow performance
- **Cloud Run + GCS** (current): **~$0.02/month** = **$0.24/year**
- **Total savings**: **$1,079.76/year** (99.98% cost reduction)

**GCS Cache Configuration:**
- Bucket: `localpdf-rendertron-cache`
- TTL: 24 hours (auto-cleanup)
- Size: ~3MB for 79 pages
- Structure: `/cache/{language}/{page}.html`
- Languages: EN (23), RU (22), DE (11), FR (12), ES (11)

**Current Status:**
- ✅ Rendertron deployed on Google Cloud Run (us-central1)
- ✅ GCS caching operational with 96% coverage (79/82 URLs)
- ✅ Cache Warmer running every 6 hours via GitHub Actions
- ✅ Three-tier caching: Vercel Edge (1h) → GCS (24h) → Rendertron
- ✅ Monitoring tools: `./check-bot-cache.sh`, Cloud Run logs, GCS bucket
- ✅ Expected +25-40% organic traffic improvement (all 5 languages)
- ✅ Zero meaningful costs (~$0.02/month)

## Monitoring Bot Activity & SEO Performance

### Quick Health Check (Daily)
```bash
./check-bot-cache.sh
```
Shows: cached pages count, storage size, cache hit test, response times

### Monitoring Tools & Dashboards

**1. Vercel Logs** (Real-time bot detection)
- URL: https://vercel.com/localpdf/logs
- Filters: `user-agent contains "Googlebot"` or `x-prerender-bot: true`
- Headers to watch: `x-cache-status`, `x-prerender-service`

**2. Cloud Run Logs** (Rendertron rendering)
- URL: https://console.cloud.google.com/run/detail/us-central1/rendertron/logs
- Look for: "Cache HIT/MISS", response times, errors
- Project: `localpdf-rendertron`

**3. GCS Bucket** (Cache storage)
- URL: https://console.cloud.google.com/storage/browser/localpdf-rendertron-cache
- Check: file count, last updated timestamps, storage size
- Structure: `/cache/{language}/{page}.html`

**4. Google Search Console** (Indexing & Performance)
- URL: https://search.google.com/search-console
- Tools: URL Inspection, Coverage Report, Performance metrics
- Expected results: 2-4 weeks for traffic improvements

**5. GitHub Actions** (Cache Warmer automation)
- URL: https://github.com/ulinycoin/clientpdf-pro/actions/workflows/cache-warmer-gcs.yml
- Schedule: Every 6 hours (Tier-based warming)
- Success threshold: ≥95%

### Manual Cache Operations

**Warm specific tier:**
```bash
node cache-warmer-gcs.cjs tier1    # Critical pages (EN+RU)
node cache-warmer-gcs.cjs tier2    # Standard tools (EN+RU)
node cache-warmer-gcs.cjs tier3    # DE/FR/ES translations
node cache-warmer-gcs.cjs tier4    # Blog & other pages
node cache-warmer-gcs.cjs all      # All 82 URLs (~7 minutes)
```

**Test specific URL:**
```bash
curl -I "https://localpdf.online/merge-pdf" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)"
# Look for: x-cache-status: HIT
```

### Troubleshooting

**Problem: Cache MISS rate too high**
- Solution: Run `node cache-warmer-gcs.cjs all`
- Check: GCS bucket has recent files (last 24 hours)

**Problem: Slow bot responses (>2s)**
- Check: Vercel Edge Cache expiry (1 hour TTL)
- Check: Cloud Run min-instances=1 (no cold starts)
- Run: `./check-bot-cache.sh` to verify cache health

**Problem: GCS cache files missing**
- Check: Cloud Run service has GCS permissions
- Verify: `localpdf-rendertron-cache` bucket exists
- Test: Render one URL manually via Rendertron endpoint

## Critical Technical Details - GCS Caching System

### Architecture Overview
The prerendering system uses a **two-service architecture** running in a single Docker container on Google Cloud Run:

1. **Rendertron** (Internal, port 3000)
   - Headless Chrome renderer
   - Cloned from GitHub (v3.1.0)
   - Handles actual page rendering (~5s per page)
   - Started in background with health checks

2. **Cache Proxy** (Public, port 8080)
   - Express.js server wrapping Rendertron
   - Checks GCS before rendering
   - Saves successful renders to GCS
   - Returns cached HTML when available

### PORT Management (CRITICAL - DO NOT MODIFY)
The container uses **dual PORT configuration**:

```dockerfile
# Dockerfile sets PORT=8080 for Cloud Run
ENV PORT=8080
ENV RENDERTRON_PORT=3000
```

```bash
# start.sh MUST override PORT for Rendertron
PORT=3000 node build/rendertron.js --port 3000  # Forces port 3000
exec node cache-proxy.js                         # Uses ENV PORT=8080
```

**Why this matters:**
- Cloud Run expects service on PORT=8080 (from ENV)
- Rendertron would default to PORT=8080 without override
- Port conflict causes "EADDRINUSE" error
- Sequential startup prevents race conditions

### File Locations & Key Code

**rendertron/cache-proxy.js** (221 lines)
- Main caching logic
- GCS integration: `@google-cloud/storage`
- Cache key generation: `/cache/{language}/{page}.html`
- TTL check: 24 hours (86400 seconds)
- Headers: `X-Cache-Status`, `X-Cache-Key`, `X-Renderer`

**rendertron/start.sh** (Sequential startup - DO NOT PARALLELIZE)
```bash
# CORRECT order:
1. Start Rendertron in background (PORT=3000)
2. Wait for Rendertron health check (curl localhost:3000)
3. Start Cache Proxy in foreground (exec, PORT=8080)

# INCORRECT (causes failures):
- Starting both in background
- Starting Cache Proxy first
- Not waiting for Rendertron ready
```

**rendertron/Dockerfile**
- Base: `node:18-slim`
- Chrome dependencies + curl (for health checks)
- Two npm installs: Rendertron + Cache Proxy
- User permissions: `node:node` (non-root)
- Exposes: 8080 (Cloud Run port)

### GCS Bucket Structure
```
localpdf-rendertron-cache/
└── cache/
    ├── en/
    │   ├── index.html
    │   ├── merge-pdf.html
    │   └── ... (23 files)
    ├── ru/ (22 files)
    ├── de/ (11 files)
    ├── fr/ (12 files)
    └── es/ (11 files)
```

### Deployment Commands (Reference)

**Build new image:**
```bash
cd rendertron
gcloud builds submit --tag gcr.io/localpdf-rendertron/rendertron:latest \
  --project localpdf-rendertron --timeout=10m
```

**Deploy to Cloud Run:**
```bash
gcloud run deploy rendertron \
  --image gcr.io/localpdf-rendertron/rendertron:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60s \
  --max-instances 10 \
  --min-instances 1 \
  --concurrency 80 \
  --set-env-vars NODE_ENV=production,PUPPETEER_TIMEOUT=25000 \
  --project localpdf-rendertron
```

**Why min-instances=1:**
- Prevents cold starts (Cloud Run keeps 1 instance warm)
- Worth the cost (~$5/month vs $0) for consistent performance
- Without it: first request takes 10-30s for cold start

### Known Issues & Solutions

**Issue: 4 redirect errors (308) in cache warmer**
- URLs: `/ru/`, `/de/`, `/fr/`, `/es/` (root language pages)
- Cause: Next.js redirects root language URLs to non-trailing slash
- Impact: Harmless - these URLs redirect anyway
- Solution: None needed, expected behavior

**Issue: Cache HIT rate low after deploy**
- Cause: GCS bucket empty, needs warming
- Solution: Run `node cache-warmer-gcs.cjs all` after deploy
- Takes: ~7 minutes for all 82 URLs
- Result: 96% success rate (79/82 URLs cached)

**Issue: Slow bot responses despite cache**
- Check: Vercel Edge Cache (1 hour TTL) - might be expired
- Check: GCS cache age (24 hour TTL) - might need re-warming
- Fix: Cache Warmer runs every 6 hours automatically

### Performance Expectations

**Normal operation:**
- Vercel Edge Cache HIT: **168-686ms** (most common)
- GCS Cache HIT: **175-1250ms** (after Edge expires)
- Cache MISS (first render): **4500-6500ms** (rare after warming)

**If seeing slower times:**
- >2s consistently = Check min-instances=1 setting
- >10s = Possible cold start (min-instances=0)
- >30s = Timeout/failure (check Cloud Run logs)

When working on this codebase:
1. Always use the path aliases (`@/components`, `@/services`, etc.)
2. Follow the existing i18n patterns when adding new UI text
3. Add translations for all 5 supported languages
4. Test with both light and dark modes
5. Ensure all PDF operations work client-side without server dependencies
6. **Monitor cache health** with `./check-bot-cache.sh` daily or weekly
7. **Check GitHub Actions** - Cache Warmer should run every 6 hours with ≥95% success rate
8. **All languages optimized** - EN, RU, DE, FR, ES all get GCS caching (79/82 URLs)
9. **Cloud Run Dashboard** - Service should have min-instances=1, no cold starts
10. **SEO Performance** - Track Google Search Console metrics (2-4 weeks for results)
11. **Never modify** cache-proxy.js PORT logic or start.sh sequential startup without testing
12. **Before modifying Rendertron** - Read this section again, especially PORT management