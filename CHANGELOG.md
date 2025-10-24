# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-10-24

### Added
- Complete rewrite with React 19 + TypeScript + Vite
- Hash-based routing system (useHashRouter)
- 11 PDF tools: MergePDF, SplitPDF, CompressPDF, ProtectPDF, OCRPDF, WatermarkPDF, RotatePDF, DeletePagesPDF, ExtractPagesPDF, AddTextPDF, ImagesToPDF
- Multi-language support (EN, RU, DE, FR, ES)
- Astro-based SEO website integration
- Client-side PDF processing with privacy-first approach
- Progress tracking and error handling for all operations
- Singleton PDFService with comprehensive error handling
- Type-safe tool definitions and state management

### Changed
- **BREAKING:** Complete architectural rewrite, not backward compatible with v2
- **BREAKING:** New routing system (hash-based instead of previous routing)
- **BREAKING:** New component structure and API
- Reduced initial bundle size from 817 KB to ~74 KB gzip (91% reduction)
- Implemented React.lazy() for all tool components
- Added manual chunk splitting for vendor libraries (pdf-lib, pdfjs, tesseract.js)
- Optimized code splitting strategy in vite.config.ts

### Performance
- 91% reduction in initial bundle size (817 KB → 74 KB gzip)
- React.lazy() for all tool components
- Manual chunk splitting for vendor libraries
- Optimized build system with tree-shaking
- Improved loading times and user experience

### Build System
- `npm run build:all` - builds both app-spa and website
- `npm run dev:all` - runs both dev servers
- `npm run build` - build app-spa only
- `npm run build:web` - build website only
- Optimized production builds with proper tree-shaking

### Migration from v2
- v2 code is not preserved in this repository
- This is a fresh start with v3 architecture
- For v2 code, please refer to the archived v2 repository

---

## Version History

### v3.0.0 (Current)
- Modern React 19 architecture
- Performance-optimized with code splitting
- 11 PDF tools implemented
- Multi-language support
- SEO-optimized website integration

### v2.x (Legacy - Archived)
- Previous version with different architecture
- Archived and no longer maintained
- Not available in this repository
