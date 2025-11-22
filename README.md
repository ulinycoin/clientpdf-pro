# LocalPDF v3.0

**Privacy-first PDF toolkit** - Hash-based Single Page Application

🚀 **Optimized for performance** - 91% smaller bundle with code splitting and lazy loading

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
- **Organize Pages** - `/#organize` - Drag & drop page reordering
- **Merge PDF** - `/#merge` - Combine multiple PDF files
- **Split PDF** - `/#split` - Extract pages from PDF
- **Compress PDF** - `/#compress` - Reduce PDF file size

### ✏️ Edit Tools
- **Watermark PDF** - `/#watermark` - Add watermark to pages
- **Add Text PDF** - `/#add-text` - Add custom text to PDF pages
- **Edit Text PDF** - `/#edit-text` - Edit existing text in PDF
- **Add Form Fields** - `/#add-form-fields` - Add interactive form fields
- **Rotate PDF** - `/#rotate` - Rotate pages by 90/180/270 degrees
- **Delete Pages** - `/#delete-pages` - Remove specific pages
- **Extract Pages** - `/#extract-pages` - Extract pages to new PDF

### 🔒 Security Tools
- **Protect PDF** - `/#protect` - Add password protection
- **Sign PDF** - `/#sign` - Add digital signatures
- **Flatten PDF** - `/#flatten` - Flatten form fields and annotations
- **OCR PDF** - `/#ocr` - Extract text with OCR

### 🔄 Convert Tools
- **Images to PDF** - `/#images-to-pdf` - Convert JPG/PNG to PDF
- **PDF to Images** - `/#pdf-to-images` - Export pages as images
- **PDF to Word** - `/#pdf-to-word` - Convert PDF to DOCX
- **Word to PDF** - `/#word-to-pdf` - Convert DOCX to PDF
- **Extract Images** - `/#extract-images` - Extract/remove images from PDF

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

- **100% client-side** — files never leave your device
- **Code splitting** — tools load on demand (~74 KB initial, -91% from v2)
- **Multi-language** — EN, RU, DE, FR, ES
- **Dark mode** — automatic theme switching
- **Hash routing** — works in any environment

---

## 📂 Project Structure

```
├── src/                     # React App-SPA
│   ├── components/tools/    # 20 PDF tool components
│   ├── services/            # PDF processing logic
│   └── locales/             # 5 language files
├── website/                 # Astro SEO website
│   └── src/pages/           # 20+ landing pages
├── vite.config.ts           # Code splitting config
└── CLAUDE.md                # AI assistant instructions
```

---

## 🏗️ Dual Architecture

This project contains **TWO applications**:

### 1. App-SPA (`/src`) - React 19 + TypeScript + Vite
- Hash routing: `/#merge`, `/#split`, `/#organize`, etc.
- 100% client-side PDF processing
- Multi-language support (EN, RU, DE, FR, ES)
- Tool grouping with horizontal navigation

### 2. Website (`/website`) - Astro Static Site
- 20+ SEO landing pages: `/merge-pdf`, `/split-pdf`, etc.
- Each page links to corresponding app tool
- Optimized for search engines

### URL Flow
```
User searches "merge pdf" → Lands on /merge-pdf (SEO) → Clicks "Go to Tool" → /#merge (App)
```

---

## 📞 Links & Documentation

- **Production:** https://localpdf.online
- **Repository:** https://github.com/ulinycoin/clientpdf-pro
- **Development Guide:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **AI Instructions:** [CLAUDE.md](./CLAUDE.md)

---

**Built with:** React 19 + TypeScript + Vite + Astro
**Tools:** 20 PDF tools | **Languages:** 5 | **SEO Pages:** 20+
**Last updated:** November 2025
