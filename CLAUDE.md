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

### Prerender.io Integration
The project uses Prerender.io for server-side rendering to improve SEO for search engine crawlers:

**Current Setup:**
- **middleware.js** - Edge runtime middleware with bot detection and prerendering
- **Whitelist system** - Only EN + RU languages get scheduled rendering (42 URLs total)
- **Smart filtering** - DE/FR/ES work as SPA, but can get real-time prerendering
- **Cache TTL limitation** - Free plan = 3 days cache expiry (limitation)

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

### Cache Warmer Solution
**Problem:** Prerender.io free plan cache expires after 3 days → Miss (3-4s response) → Bad SEO
**Solution:** Automatic cache warming system → Always Hit (28ms response) → Better SEO

**Implementation:**
- **cache-warmer.cjs** - Node.js script that simulates bot visits to refresh cache
- **.github/workflows/cache-warmer.yml** - GitHub Actions automation (every 12 hours)
- **Smart scheduling** - Tier 1 every 2 days, Tier 2 every 3 days, Tier 3 every 5 days
- **Cost efficiency** - $0 solution vs $90/month Prerender.io upgrade

**Usage:**
```bash
# Manual cache warming
node cache-warmer.cjs tier1    # Critical pages only
node cache-warmer.cjs all      # All URLs
node cache-warmer.cjs auto     # Smart mode (GitHub Actions default)

# Monitoring
node prerender-monitor.cjs check  # Performance analysis
```

**Expected Results:**
- +25-40% organic traffic for EN + RU languages
- 100% cache hit rate for critical pages
- Elimination of 3-4s Miss responses for search bots
- Better Core Web Vitals and SEO ranking

### Monitoring Tools
**prerender-monitor.cjs** - Comprehensive monitoring and analytics:
- **Performance testing** - Response times and prerender rates by tier
- **Cache analysis** - Hit/Miss ratios and recommendations
- **Bot simulation** - Tests with Googlebot user agent
- **Automatic recommendations** - Optimization suggestions based on data

**Key monitoring commands:**
```bash
node prerender-monitor.cjs check    # Full comprehensive check
node prerender-monitor.cjs quick    # Quick API status check
```

**Other diagnostic tools:**
- **test-scheduled-rendering.sh** - Manual curl testing for all 42 URLs
- **prerender-api-manager.cjs** - API automation (requires paid plan)
- **deploy-scheduled-rendering.sh** - One-click deployment script

### API Limitations Encountered
- **Prerender.io API access** requires paid plan ($90/month)
- **Free plan limitations** - 3-day cache TTL, no programmatic scheduled rendering
- **Workaround success** - Cache Warmer provides same benefits at $0 cost

### Documentation Files
- **CACHE_WARMER_GUIDE.md** - Setup and usage instructions for cache warmer
- **SCHEDULED_RENDERING_IMPLEMENTATION.md** - Technical implementation details
- **API_AUTOMATION_GUIDE.md** - API usage guide (for paid plans)
- **PRERENDER_DASHBOARD_SETUP.md** - Manual dashboard configuration
- **MANUAL_SETUP_GUIDE.md** - Step-by-step manual setup instructions

### Implementation History
**Key Commits:**
- **d4d59c1** - Initial scheduled rendering implementation with middleware whitelist
- **c38ff5c** - Cache Warmer solution to solve 3-day cache expiry issue

**Problem Solved:**
User reported that Prerender.io free plan has 3-day cache TTL, causing search bots to get Miss (3-4s) responses after cache expiry, hurting SEO performance.

**Solution Delivered:**
1. **Middleware whitelist** - Smart filtering for EN+RU priority (42 URLs)
2. **Cache Warmer system** - Automatic GitHub Actions to refresh cache every 2 days
3. **Cost optimization** - $0 solution vs $90/month Prerender.io upgrade
4. **Comprehensive monitoring** - Tools to track performance and success metrics

**Current Status:**
- ✅ Middleware configured with EN+RU whitelist
- ✅ Cache Warmer deployed with GitHub Actions automation
- ✅ 100% cache hit rate achievable for critical pages
- ✅ Expected +25-40% organic traffic improvement for EN+RU
- ✅ All solutions working on free Prerender.io plan

When working on this codebase:
1. Always use the path aliases (`@/components`, `@/services`, etc.)
2. Follow the existing i18n patterns when adding new UI text
3. Add translations for all 5 supported languages
4. Test with both light and dark modes
5. Ensure all PDF operations work client-side without server dependencies
6. **Monitor SEO performance** with cache-warmer.cjs and prerender-monitor.cjs
7. **Focus EN + RU** for scheduled rendering, other languages work as SPA
8. **Check Prerender.io dashboard** weekly for cache hit rates and usage