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

When working on this codebase:
1. Always use the path aliases (`@/components`, `@/services`, etc.)
2. Follow the existing i18n patterns when adding new UI text
3. Add translations for all 5 supported languages
4. Test with both light and dark modes
5. Ensure all PDF operations work client-side without server dependencies