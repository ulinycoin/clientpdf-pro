# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains TWO distinct applications:

### 1. Website (Astro) - `/website`
**SEO-optimized static landing pages** built with Astro.

- **Purpose:** SEO landing pages for each PDF tool
- **Tech:** Astro (static site generator)
- **URLs:** `/merge-pdf`, `/split-pdf`, `/compress-pdf`, etc.
- **Links to:** App-SPA via hash routes (`/#merge`, `/#split`)
- **Language:** English only
- **Build:** `npm run build:web` → `website/dist/`

### 2. App-SPA (React) - `/src`
**Privacy-first, client-side PDF toolkit** built as a hash-based Single Page Application.

- **Purpose:** Actual PDF processing application
- **Tech:** React 19 + TypeScript + Vite
- **URLs:** `/#merge`, `/#split`, `/#compress`, etc. (hash-based routing)
- **Processing:** 100% client-side, no server uploads
- **Optimized bundle:** ~74 KB gzip initial load
- **Multi-language:** EN, RU, DE, FR, ES
- **Build:** `npm run build` → `dist/`

## Commands

```bash
# Development
npm run dev:all      # Start BOTH app-spa AND website (recommended)
npm run dev          # Start app-spa dev server only (port 3000)
npm run dev:web      # Start website dev server only (port 4321)

# Production Build
npm run build:all    # Build both app-spa and website
npm run build        # Build app-spa for production
npm run build:web    # Build website static pages

# Code Quality
npx tsc --noEmit     # Type check app-spa
npm run lint         # ESLint check
```

## Architecture

### Code Splitting & Lazy Loading (CRITICAL)

All tool components MUST use `React.lazy()` and all heavy PDF libraries MUST be in manual chunks.

**Vite Configuration (vite.config.ts):**
```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],
  'vendor-pdfjs': ['pdfjs-dist'],
  'vendor-ocr': ['tesseract.js'],
}
```

**Tool Loading Pattern (App.tsx):**
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

**Navigation Flow:**
1. User clicks tool in Sidebar → `setCurrentTool(tool)` → Updates hash
2. Hash changes → `hashchange` event → Parses hash → Updates `currentTool`
3. App.tsx renders correct lazy-loaded component in `<Suspense>`

### Core Service Architecture

**PDFService (src/services/pdfService.ts):**
- Singleton pattern: `PDFService.getInstance()`
- Uses `pdf-lib` for most operations
- Uses `pdf-lib-plus-encrypt` for password protection
- Uses `pdfjs-dist` for rendering
- Uses `tesseract.js` for OCR
- All methods return `PDFProcessingResult<T>` with success/error states
- Progress callbacks: `onProgress?: (progress: number, message: string) => void`

### Type System

**Tool Definition (src/types/index.ts):**
```typescript
export type Tool =
  | 'merge-pdf' | 'split-pdf' | 'compress-pdf' | 'protect-pdf' | 'ocr-pdf'
  | 'add-text-pdf' | 'edit-text-pdf' | 'add-form-fields-pdf' | 'watermark-pdf'
  | 'rotate-pdf' | 'delete-pages-pdf' | 'extract-pages-pdf' | 'organize-pdf'
  | 'images-to-pdf' | 'pdf-to-images' | 'pdf-to-word' | 'word-to-pdf'
  | 'sign-pdf' | 'flatten-pdf' | 'extract-images-pdf';
```

**Tool Groups (UI Navigation):**
```typescript
export type ToolGroup = 'all' | 'organize' | 'edit' | 'security' | 'convert';
```

### All 20 Tools

**Organize:** organize-pdf, merge-pdf, split-pdf, extract-pages-pdf, delete-pages-pdf, rotate-pdf
**Edit:** add-text-pdf, edit-text-pdf, add-form-fields-pdf, watermark-pdf, sign-pdf, flatten-pdf
**Security:** protect-pdf, compress-pdf
**Convert:** images-to-pdf, pdf-to-images, pdf-to-word, word-to-pdf, ocr-pdf, extract-images-pdf

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
2. **Add lazy import** in `App.tsx`
3. **Add to render logic** in `App.tsx` Suspense block
4. **Add to Sidebar** in `src/components/layout/Sidebar.tsx`
5. **Add to TOOL_GROUPS** in `src/types/index.ts`
6. **Add translations** to all 5 language files in `src/locales/`
7. **Create SEO page** in `website/src/pages/new-tool.astro`
8. **Verify bundle size** after build (initial load should stay < 100 KB gzip)

## Adding AI/Smart Features to Tools

AI features enhance tools with automatic analysis and suggestions. All AI runs **100% locally in browser** - no external API calls.

### Architecture Pattern

```
src/services/smart{Feature}Service.ts  → Analysis logic (singleton)
src/components/smart/Smart{Feature}Panel.tsx → UI component
src/components/tools/{Tool}.tsx → Integration point
```

### Existing Smart Features

| Feature | Tool | Service | Capabilities |
|---------|------|---------|--------------|
| **Smart Merge** | merge-pdf | `smartMergeService.ts` | Date extraction, duplicate detection, sort suggestions |
| **Smart Organize** | organize-pdf | `smartOrganizeService.ts` | Blank page detection, duplicates, chapters, rotation issues |

### Step-by-Step: Adding a Smart Feature

1. **Create service** in `src/services/smart{Feature}Service.ts`:
   ```typescript
   // Singleton pattern
   class Smart{Feature}Service {
     private static instance: Smart{Feature}Service;
     static getInstance(): Smart{Feature}Service { ... }

     // Main analysis method
     async analyze(input: InputType): Promise<AnalysisResult> { ... }
   }
   ```

2. **Create UI panel** in `src/components/smart/Smart{Feature}Panel.tsx`:
   ```typescript
   interface Smart{Feature}PanelProps {
     analysisResult: AnalysisResult | null;
     isAnalyzing: boolean;
     onAction: (action: ActionType) => void;
     enabled: boolean;
     onToggle: (enabled: boolean) => void;
   }
   ```

3. **Integrate into tool component**:
   - Import service and panel
   - Add state: `analysisResult`, `isAnalyzing`, `smartEnabled`
   - Call `service.analyze()` after file upload
   - Render `<Smart{Feature}Panel />` in UI
   - Handle quick actions (bulk operations)

4. **Add translations** to all 5 locale files:
   ```json
   "smart{Feature}": {
     "title": "Smart {Feature}",
     "analyzing": "Analyzing...",
     "quickActions": "Quick Actions",
     ...
   }
   ```

5. **Update SEO page** in `website/src/pages/{tool}.astro`:
   - Add to `keywords`
   - Add to `benefits[]`
   - Add to `features[]`
   - Update `steps[]`
   - Add FAQs about the feature
   - Update `howToSchema`

6. **Create blog article** in `website/src/content/blog/smart-{feature}-....mdx`:
   - Explain the feature
   - List capabilities
   - Include real-world use cases
   - Emphasize privacy (local processing)

### Technical Guidelines for AI Features

- **Use PDF.js** (`pdfjs-dist`) for text extraction and page analysis
- **Use SHA-256 hashing** for duplicate detection (via `crypto.subtle.digest`)
- **Support multiple languages** in pattern detection (EN, DE, FR, ES, RU)
- **Never flag image-only pages as blank** - always check for images first
- **Provide toggle** to enable/disable the feature
- **Show confidence scores** where applicable
- **Keep analysis fast** - typically < 1 second for 100 pages

### Privacy Requirements

- **NO external API calls** - all analysis runs in browser
- **NO data collection** - nothing sent to servers
- **Works offline** - after initial page load

## Important Constraints

1. **NEVER import tool components directly** - Always use `React.lazy()`
2. **NEVER add PDF libraries without adding to manualChunks** in vite.config.ts
3. **Hash routing only** - Don't use react-router or browser routing
4. **Client-side only** - No API calls, everything runs in browser
5. **Always check bundle size** after changes: `npm run build`

## Path Aliases

Configured in vite.config.ts:
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

### URL Flow
```
User searches "merge pdf" → /merge-pdf (SEO) → "Go to Tool" → /#merge (App)
```

### All SEO Pages (20+)
Located in `website/src/pages/`:
- organize-pdf, merge-pdf, split-pdf, compress-pdf
- protect-pdf, ocr-pdf, watermark-pdf, rotate-pdf
- add-text-pdf, edit-text-pdf, add-form-fields-pdf
- delete-pages-pdf, extract-pages-pdf
- images-to-pdf, pdf-to-images, pdf-to-word, word-to-pdf
- sign-pdf, flatten-pdf, extract-images-pdf

### ToolPage Component
Reusable component for all SEO pages: `website/src/components/ToolPage.astro`
- Props: `toolId`, `title`, `metaDescription`, `description`, `benefits[]`, `steps[]`

## Links

- **Production:** https://localpdf.online
- **Repository:** https://github.com/ulinycoin/clientpdf-pro
