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
- **SEO and multilingual** optimization across all 5 supported languages
- **Code quality** improvements and technical debt reduction

## Common Commands

### Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (skips type checking for speed)
- `npm run build:full` - Full production build with sitemap generation and IndexNow submission
- `npm run preview` - Preview production build locally

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

**Phase 3: Rendertron Migration (Oct 2025)** ⭐ **CURRENT**
- **1a48f32** - Migrated from Prerender.io to self-hosted Rendertron on Render.com
- **Problem:** Prerender.io costs $90/month, has request limits, vendor lock-in
- **Solution:** Free self-hosted Rendertron with Cache Warmer preventing cold starts

**Migration Results:**
1. ✅ **Cost savings** - $1,080/year ($90/month → $0/month)
2. ✅ **No limits** - Unlimited rendering on Render.com free tier
3. ✅ **Full control** - Self-hosted, open-source solution
4. ✅ **Cache Warmer adapted** - Now prevents Render.com cold starts (15min sleep)
5. ✅ **92% success rate** - Cache warming keeps Rendertron always warm
6. ⚠️ **Performance trade-off** - 5-15s (warm) vs old 28ms, but always fresh content

**Current Status:**
- ✅ Rendertron deployed on Render.com free tier
- ✅ Middleware configured for EN+RU whitelist (42 URLs)
- ✅ Cache Warmer running every 12 hours via GitHub Actions
- ✅ Health monitoring with `monitor-rendertron.sh`
- ✅ Expected +25-40% organic traffic improvement for EN+RU
- ✅ Zero monthly costs for prerendering infrastructure

When working on this codebase:
1. Always use the path aliases (`@/components`, `@/services`, etc.)
2. Follow the existing i18n patterns when adding new UI text
3. Add translations for all 5 supported languages
4. Test with both light and dark modes
5. Ensure all PDF operations work client-side without server dependencies
6. **Monitor Rendertron health** with `./monitor-rendertron.sh` weekly (30 seconds)
7. **Check GitHub Actions** - Cache Warmer should run every 12 hours with ≥80% success rate
8. **Focus EN + RU** for scheduled rendering (42 URLs), other languages work as SPA
9. **Render.com Dashboard** - Check logs weekly for timeout errors or cold starts
10. **SEO Performance** - Track Google Search Console metrics (2-4 weeks for results)