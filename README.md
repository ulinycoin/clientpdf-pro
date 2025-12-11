# LocalPDF v3.0

**Privacy-first PDF toolkit** - Hash-based Single Page Application with AI-powered Smart Features

🚀 **Optimized for performance** - 91% smaller bundle with code splitting and lazy loading
🤖 **AI-powered analysis** - Smart features run 100% locally in your browser

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/ulinycoin/clientpdf-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-auto-brightgreen.svg)](https://localpdf.online)

> **Note:** This is version 3.0 - a complete rewrite with modern architecture. For v2 legacy code, see archived repository.
>
> **Auto-deploy:** Pushes to `main` branch automatically deploy to production via Vercel.

---

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Start both app and website
npm run dev:all

# Or start separately
npm run dev          # App-SPA on port 3000
npm run dev:web      # Website on port 4321
```

## 📱 Available Tools (20 tools)

### 📂 Organize Tools
- **Organize Pages** 🤖 - `/#organize` - Drag & drop page reordering with Smart Analysis (blank pages, duplicates, rotation issues)
- **Merge PDF** 🤖 - `/#merge` - Combine multiple PDF files with Smart Merge (date extraction, duplicate detection)
- **Split PDF** - `/#split` - Split by structure, page ranges, or file size
- **Extract Pages** - `/#extract-pages` - Extract specific pages to new PDF
- **Delete Pages** - `/#delete-pages` - Remove unwanted pages
- **Rotate PDF** - `/#rotate` - Rotate pages by 90/180/270 degrees

### ✏️ Edit Tools
- **Add Text PDF** - `/#add-text` - Add custom text with fonts and colors
- **Edit Text PDF** - `/#edit-text` - Edit existing text in PDF
- **Add Form Fields** - `/#add-form-fields` - Add interactive form fields
- **Watermark PDF** - `/#watermark` - Add text/image watermarks
- **Sign PDF** - `/#sign` - Add digital signatures
- **Flatten PDF** - `/#flatten` - Flatten forms and annotations

### 🔒 Security Tools
- **Protect PDF** - `/#protect` - Add password protection (40-256 bit)
- **Compress PDF** - `/#compress` - Reduce file size intelligently

### 🔄 Convert Tools
- **Images to PDF** 🤖 - `/#images-to-pdf` - Convert JPG/PNG to PDF with Smart Image Filter
- **PDF to Images** - `/#pdf-to-images` - Export pages as JPG/PNG
- **PDF to Word** - `/#pdf-to-word` - Convert PDF to DOCX
- **Word to PDF** - `/#word-to-pdf` - Convert DOCX to PDF
- **OCR PDF** - `/#ocr` - Extract text with multi-language OCR
- **Extract Images** - `/#extract-images` - Extract embedded images

🤖 = **AI-powered Smart Features** (100% local, no external API calls)

---

## 🛠️ Commands

```bash
# Development
npm run dev          # App-SPA dev server (port 3000)
npm run dev:web      # Website dev server (port 4321)
npm run dev:all      # Both servers simultaneously

# Production
npm run build        # Build app-spa
npm run build:web    # Build website
npm run build:all    # Build both

# Code Quality
npx tsc --noEmit     # Type check
npm run lint         # Lint code
```

---

## 🔑 Key Features

- **100% client-side** — files never leave your device, fully private
- **AI-powered Smart Features** — automatic analysis runs locally in browser
  - Smart Merge: date extraction, duplicate detection, sort suggestions
  - Smart Organize: blank pages, duplicates, chapters, rotation issues
  - Smart Image Filter: low-quality detection, blur/contrast analysis
- **Code splitting** — tools load on demand (~74 KB initial, -91% from v2)
- **Multi-language** — EN, RU, DE, FR, ES with full i18n support
- **Dark mode** — automatic theme switching with Tailwind CSS
- **Hash routing** — SEO-friendly, works anywhere without server config
- **OCR support** — multi-language text extraction with Tesseract.js

---

## 📂 Project Structure

```
├── src/                           # React App-SPA (React 19.1.2 + TypeScript)
│   ├── components/
│   │   ├── tools/                 # 20 PDF tool components (lazy loaded)
│   │   ├── smart/                 # AI-powered UI panels
│   │   └── layout/                # Sidebar, TopBar, etc.
│   ├── services/
│   │   ├── pdfService.ts          # Core PDF operations (pdf-lib, pdfjs-dist)
│   │   ├── smartMergeService.ts   # Smart Merge AI logic
│   │   ├── smartOrganizeService.ts # Smart Organize AI logic
│   │   └── smartImageService.ts   # Smart Image Filter AI logic
│   ├── hooks/                     # useHashRouter, useI18n, useSharedFile
│   ├── locales/                   # 5 language JSON files (EN, RU, DE, FR, ES)
│   └── types/                     # TypeScript definitions
├── website/                       # Astro static site generator
│   ├── src/
│   │   ├── pages/                 # 20+ SEO landing pages
│   │   ├── content/blog/          # Blog articles (MDX)
│   │   └── components/            # Astro components
│   └── public/                    # Static assets
├── src-tauri/                     # Tauri desktop app (optional)
├── vite.config.ts                 # Code splitting + chunk optimization
├── tailwind.config.js             # Custom theme (ocean-*, privacy-*)
└── CLAUDE.md                      # AI assistant development guide
```

---

## 🏗️ Dual Architecture

This project contains **TWO applications**:

### 1. App-SPA (`/src`) - React 19.1.2 + TypeScript + Vite
- **Hash routing:** `/#merge`, `/#split`, `/#organize`, etc.
- **100% client-side:** All PDF processing in browser (pdf-lib, pdfjs-dist, tesseract.js)
- **AI-powered:** Smart features with local analysis (no external APIs)
- **Code splitting:** React.lazy() + manual chunks (~74 KB initial load)
- **Multi-language:** 5 languages with useI18n hook
- **State management:** React hooks only (no Redux/Zustand)

### 2. Website (`/website`) - Astro 5 Static Site Generator
- **20+ SEO landing pages:** `/merge-pdf`, `/split-pdf`, `/organize-pdf`, etc.
- **Schema.org markup:** Rich snippets for Google search
- **Blog system:** MDX articles with automatic sitemap
- **Performance:** Static HTML, optimized for Core Web Vitals
- **Links to App-SPA:** Each page has "Go to Tool" button → hash route

### URL Flow
```
User searches "merge pdf"
  ↓
Lands on /merge-pdf (SEO landing page)
  ↓
Clicks "Go to Tool" button
  ↓
Navigates to /#merge (React app loads tool)
```

---

## 📞 Links & Documentation

- **Production:** https://localpdf.online
- **Repository:** https://github.com/ulinycoin/clientpdf-pro
- **Development Roadmap:** [ROADMAP.md](./ROADMAP.md)
- **AI Development Guide:** [CLAUDE.md](./CLAUDE.md)
- **Issues & Feedback:** https://github.com/ulinycoin/clientpdf-pro/issues

---

## 🧠 Technology Stack

**Frontend:**
- React 19.1.2 + TypeScript + Vite 6
- Tailwind CSS 3 (custom theme)
- Hash-based routing (custom `useHashRouter`)

**PDF Processing:**
- `pdf-lib` + `@pdf-lib/fontkit` - PDF creation/editing
- `pdf-lib-plus-encrypt` - Password protection
- `pdfjs-dist` - PDF rendering and text extraction
- `tesseract.js` - OCR with multi-language support

**SEO & Content:**
- Astro 5 - Static site generator
- MDX - Blog articles
- Schema.org - Structured data

**AI Features:**
- 100% client-side analysis (no external APIs)
- SHA-256 hashing for duplicate detection
- Multi-language pattern recognition (EN, DE, FR, ES, RU)
- Image quality analysis (blur, contrast, sharpness)

---

**Tools:** 20 PDF tools (3 with AI) | **Languages:** 5 | **SEO Pages:** 20+ | **Bundle:** ~74 KB gzip
**Last updated:** December 2025
