# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains TWO distinct applications:

### 1. Website (Astro) - `/website`
**SEO-optimized static landing pages** built with Astro. These pages rank in search engines and drive traffic to the app.

- **Purpose:** SEO landing pages for each PDF tool
- **Tech:** Astro (static site generator)
- **URLs:** `/merge-pdf`, `/split-pdf`, `/compress-pdf`, etc.
- **Links to:** App-SPA via hash routes (`/#merge`, `/#split`)
- **Language:** English only (for now)
- **Build:** `npm run build:web` → `website/dist/`

### 2. App-SPA (React) - `/src`
**Privacy-first, client-side PDF toolkit** built as a hash-based Single Page Application.

- **Purpose:** Actual PDF processing application
- **Tech:** React 19 + TypeScript + Vite
- **URLs:** `/#merge`, `/#split`, `/#compress`, etc. (hash-based routing)
- **Processing:** 100% client-side, no server uploads
- **Optimized bundle:** ~74 KB gzip initial load (was 817 KB)
- **Multi-language:** EN, RU, DE, FR, ES
- **Build:** `npm run build` → `dist/`

**Important:** Website pages are SEO landing pages that redirect users to the app-SPA tools.

## Commands

### Development
```bash
npm run dev:all      # 🚀 Start BOTH app-spa AND website (recommended)
npm run dev          # Start app-spa dev server only (port 3000)
npm run dev:web      # Start website dev server only (port 4321)
```

### Production Build
```bash
npm run build:all    # Build both app-spa and website
npm run build        # Build app-spa for production
npm run build:web    # Build website static pages
npm run preview      # Preview app-spa production build
npm run preview:web  # Preview website production build
```

### Code Quality
```bash
npx tsc --noEmit    # Type check app-spa
npm run lint         # ESLint check
```

## Architecture

### Performance-Critical: Code Splitting & Lazy Loading

**CRITICAL:** This app is heavily optimized for performance. All tool components MUST use React.lazy() and all heavy PDF libraries MUST be in manual chunks.

**Vite Configuration (vite.config.ts:31-44):**
```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],
  'vendor-pdfjs': ['pdfjs-dist'],
  'vendor-ocr': ['tesseract.js'],
}
```

**Tool Loading Pattern (App.tsx:10-18):**
```typescript
// CORRECT ✅
const MergePDF = lazy(() => import('@/components/tools/MergePDF').then(m => ({ default: m.MergePDF })));

// WRONG ❌
import { MergePDF } from '@/components/tools/MergePDF';
```

### Routing System

**Hash Router (useHashRouter.tsx):**
- Uses `window.location.hash` for navigation
- Tool URL format: `/#merge`, `/#split?lang=ru&source=landing`
- Mapping: `TOOL_HASH_MAP` (hash → tool) and `HASH_TOOL_MAP` (tool → hash)
- Preserves query parameters for context tracking

**Navigation Flow:**
1. User clicks tool in Sidebar → `setCurrentTool(tool)` → Updates hash
2. Hash changes → `hashchange` event → Parses hash → Updates `currentTool`
3. App.tsx renders correct lazy-loaded component in `<Suspense>`

### Core Service Architecture

**PDFService (src/services/pdfService.ts):**
- Singleton pattern: `PDFService.getInstance()`
- Uses `pdf-lib` for most operations (merge, split, compress, rotate, delete, extract)
- Uses `pdf-lib-plus-encrypt` for password protection (src/services/pdfService.ts:475-548)
- Uses `pdfjs-dist` for rendering (OCR, preview, watermark)
- Uses `tesseract.js` for OCR text extraction
- All methods return `PDFProcessingResult<T>` with success/error states
- Progress callbacks: `onProgress?: (progress: number, message: string) => void`

**Key Methods:**
- `mergePDFs()` - Combines multiple PDFs, supports custom order and metadata
- `splitPDF()` - 4 modes: 'pages', 'range', 'intervals', 'custom'
- `compressPDF()` - Removes encryption/metadata, optimizes structure
- `protectPDF()` - Password encryption with granular permissions
- `rotatePDF()` - Rotate specific pages by 90/180/270 degrees
- `deletePDF()` - Remove pages (creates new doc with remaining pages)
- `extractPDF()` - Extract specific pages to new PDF
- `imagesToPDF()` - Convert JPG/PNG images to PDF with page size/orientation options

### Type System

**Tool Definition (src/types/index.ts:12-29):**
```typescript
export type Tool =
  | 'merge-pdf' | 'split-pdf' | 'compress-pdf' | 'protect-pdf' | 'ocr-pdf'
  | 'add-text-pdf' | 'watermark-pdf' | 'rotate-pdf' | 'delete-pages-pdf'
  | 'extract-pages-pdf' | 'unlock-pdf' | 'images-to-pdf' | 'pdf-to-images'
  | 'pdf-to-word' | 'word-to-pdf' | 'sign-pdf' | 'flatten-pdf';
```

**Tool Tiers:**
- Tier 1 (Core): merge, split, compress, protect, ocr - Most important, highest priority
- Tier 2 (Edit): add-text, watermark, rotate, delete-pages, extract-pages, unlock
- Tier 3 (Convert): images-to-pdf, pdf-to-images, pdf-to-word, word-to-pdf, sign, flatten

### Implemented Tools (11/17)

✅ **Implemented:**
1. MergePDF - Combine multiple PDFs
2. SplitPDF - Split into pages/ranges/intervals
3. CompressPDF - Reduce file size
4. ProtectPDF - Password protection with permissions
5. OCRPDF - Extract text with Tesseract.js
6. WatermarkPDF - Add watermark overlay
7. RotatePDF - Rotate pages 90/180/270 degrees
8. DeletePagesPDF - Remove specific pages
9. ExtractPagesPDF - Extract pages to new PDF
10. AddTextPDF - Add custom text to PDF pages
11. ImagesToPDF - Convert JPG/PNG images to PDF

❌ **Not Implemented:** unlock-pdf, pdf-to-images, pdf-to-word, word-to-pdf, sign-pdf, flatten-pdf

### Internationalization

**useI18n Hook:**
- Translation files: `src/locales/{en,ru,de,fr,es}.json`
- Usage: `const { t, language, setLanguage } = useI18n()`
- Translation keys: `t('tools.merge-pdf.name')`, `t('common.processing')`
- Language persisted to localStorage

### State Management

**No global state library** - Uses React hooks:
- `useHashRouter` - Routing and URL context
- `useI18n` - Language and translations
- `useSharedFile` - File sharing between tools (via localStorage)
- Local component state with `useState`

### Styling

- **Tailwind CSS** with custom color palette
- Dark mode via `dark:` classes
- Custom colors: `ocean-*`, `privacy-*` (defined in tailwind.config.js)
- Responsive: mobile-first with `lg:`, `md:` breakpoints

## Adding a New Tool

1. **Create component** in `src/components/tools/NewTool.tsx`
2. **Add lazy import** in `App.tsx`:
   ```typescript
   const NewTool = lazy(() => import('@/components/tools/NewTool').then(m => ({ default: m.NewTool })));
   ```
3. **Add to render logic** in `App.tsx` Suspense block
4. **Add to Sidebar** in `src/components/layout/Sidebar.tsx:13-36`
5. **Add translations** to all 5 language files in `src/locales/`
6. **Verify bundle size** after build (initial load should stay < 100 KB gzip)

## Important Constraints

1. **NEVER import tool components directly** - Always use `React.lazy()`
2. **NEVER add PDF libraries without adding to manualChunks** in vite.config.ts
3. **Hash routing only** - Don't use react-router or browser routing
4. **Client-side only** - No API calls, everything runs in browser
5. **No SEO optimization** - This is for the main app, not app-spa
6. **Always check bundle size** after changes: `npm run build | grep gzip`

## Path Aliases

Configured in vite.config.ts:13-21:
```
@ → ./src
@/components → ./src/components
@/hooks → ./src/hooks
@/utils → ./src/utils
@/types → ./src/types
@/services → ./src/services
@/locales → ./src/locales
```

## Website + App Integration

### How They Work Together

1. **User finds tool via Google** → Lands on `/merge-pdf` (Astro SEO page)
2. **Reads about the tool** → SEO content, benefits, instructions
3. **Clicks "Go to Tool"** → Redirected to `/#merge` (React app)
4. **Uses the tool** → Processes PDF in browser with app-spa

### URL Structure

**Website (SEO):**
- `/merge-pdf` - Static HTML page about merging PDFs
- `/split-pdf` - Static HTML page about splitting PDFs
- `/compress-pdf` - Static HTML about compression
- etc.

**App-SPA (Tool):**
- `/app#merge` - Actual merge PDF tool (or `/#merge` if app is at root)
- `/app#split` - Actual split PDF tool
- `/app#compress` - Actual compress PDF tool
- etc.

**Important:** SEO pages link to `/app#tool` to separate static pages from the SPA. Each page includes:
- Canonical URL (`<link rel="canonical" href="https://localpdf.online/merge-pdf" />`)
- Prefetch hint for faster app loading
- Proper semantic HTML structure

### Deployment Strategy

Both parts can be deployed together:
```
dist/
├── index.html          # App-SPA entry point
├── assets/             # App-SPA JS/CSS bundles
├── merge-pdf/
│   └── index.html      # SEO page for merge
├── split-pdf/
│   └── index.html      # SEO page for split
└── ...
```

Copy website build output into app-spa dist:
```bash
npm run build           # Build app-spa
npm run build:web       # Build website
cp -r website/dist/* dist/   # Merge builds
```

## Tool Pages (Website)

All tool pages follow the same structure:

1. **BaseLayout** (`website/src/layouts/BaseLayout.astro`)
   - Header with logo and navigation
   - Footer with copyright
   - Global styles

2. **Page Components** (`website/src/pages/*.astro`)
   - Tool hero section (title, description, benefits)
   - "Go to Tool" button → links to `/#tool-hash`
   - "How it works" section
   - Privacy note

3. **Implemented Pages** (using ToolPage component):
   - ✅ `/merge-pdf` → `/app#merge`
   - ✅ `/split-pdf` → `/app#split`
   - ✅ `/compress-pdf` → `/app#compress`
   - ✅ `/protect-pdf` → `/app#protect`
   - ✅ `/ocr-pdf` → `/app#ocr`
   - ✅ `/watermark-pdf` → `/app#watermark`
   - ✅ `/rotate-pdf` → `/app#rotate`
   - ✅ `/delete-pages-pdf` → `/app#delete-pages`
   - ✅ `/extract-pages-pdf` → `/app#extract-pages`
   - ✅ `/add-text-pdf` → `/app#add-text`
   - ✅ `/images-to-pdf` → `/app#images-to-pdf`

4. **ToolPage Component** (`website/src/components/ToolPage.astro`)
   - Reusable component for all tool pages
   - Automatically handles canonical URLs, prefetching, SEO
   - Props: `toolId`, `title`, `metaDescription`, `description`, `benefits[]`, `steps[]`

## Related Documentation

- **website/README.md** - Website-specific documentation (Astro)
- **DEVELOPMENT_GUIDE.md** - App-SPA development guide (Russian)
- **README.md** - Project overview, performance metrics
- Main app repository: https://github.com/ulinycoin/clientpdf-pro
- Production site: https://localpdf.online
