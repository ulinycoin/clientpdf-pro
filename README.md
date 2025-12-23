# LocalPDF v4.0 💎

**Privacy-first PDF toolkit** - The ultimate client-side document processing suite with "Private Sanctuary" design aesthetics.

🚀 **Zero-Server Processing** - All files stay on your device. Period.
💎 **Private Sanctuary Design** - Premium "Liquid Glass" UI with backlit refraction effects.
🤖 **Neural-Local AI** - Smart features (Merge, Organize, Editor) running 100% locally.

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/ulinycoin/clientpdf-pro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-auto-brightgreen.svg)](https://localpdf.online)

> [!IMPORTANT]
> **Version 4.0 "Private Sanctuary"**: Featuring advanced text reflow, premium table processing, and high-fidelity local OCR.

---

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Start both App (React) and Website (Astro)
npm run dev:all

# Separate servers
npm run dev          # App-SPA (Port 3000)
npm run dev:web      # Website/SEO (Port 4321)
```

## 📱 Premium Tools (21 tools)

### 📊 Table & Data Tools
- **Premium Tables** 💎 - `/#tables` - Convert Excel/CSV to PDF with advanced layout, multi-tab support, and horizontal pagination.

### 📂 Organize & Structure
- **Smart Organize** 🤖 - `/#organize` - AI-powered page reordering, blank page detection, and chapter analysis.
- **Smart Merge** 🤖 - `/#merge` - Intelligent file combination with metadata unification and duplicate detection.
- **Split / Extract / Delete** - Robust page-level manipulation with interactive previews.
- **Rotate PDF** - Batch rotation with 90/180/270 degree support.

### ✏️ Content Editor (Unified)
- **Edit Text** 🤖 - `/#edit-text` - Full text reflow, **Smart Line Detection**, and Unicode/Cyrillic support (Smart Styles 2.0).
- **Add Text / Watermark** - Interactive drag-and-drop positioning and premium typography.
- **Sign / Form Fields** - Secure client-side signing and interactive form creation.

### 🔄 Conversion Power
- **Batch PDF/Word** - Process up to 10 files simultaneously with rich previews.
- **OCR Suite** 🤖 - Multi-language text extraction using local Tesseract.js (WASM).
- **Images to PDF** - Smart image filtering (blur/quality detection) and automatic orientation.

---

## 🔑 Key Features

- **100% Zero-Knowledge** — Files never leave the browser. No telemetry, no logs, no servers.
- **Smart Styles 2.0** — Automatic font fallback and style matching for seamless PDF editing.
- **Liquid Glass UI** — Modern design system with Glassmorphism and SVG refraction (Backlit Liquid Glass).
- **Multi-language (9 Voices)** — EN, RU, DE, FR, ES, JA, IT, PT, ZH with full i18n support.
- **Enterprise SEO** — Astro 5.0 integration with Schema.org (SoftwareApplication) and high-performance RAG-friendly content for AI search (GEO).

---

## 📂 Project Structure

```
├── src/                           # React App-SPA (React 19 + Vite)
│   ├── components/
│   │   ├── tools/                 # Premium PDF tools (lazy loaded)
│   │   ├── smart/                 # Local AI logic (Services)
│   │   └── common/                # Shared UI (Design System)
│   ├── services/
│   │   ├── pdfService.ts          # Core engine (pdf-lib, pdfjs, fontkit)
│   │   └── smart*Service.ts       # Domain-specific logic
│   └── locales/                   # 9 Language packs (JSON)
├── website/                       # Astro 5.0 Marketing & SEO Site
│   ├── src/pages/                 # RAG-optimized SEO landing pages
│   └── public/                    # Social preview images & screenshots
├── src-tauri/                     # Native Desktop wrapper (Experimental)
└── vite.config.ts                 # Granular code splitting (~74 KB initial)
```

---

## 🏗️ Dual-Engine Architecture

1.  **The App (`/src`):** A high-performance React 19 SPA. Uses Hash-routing (`/#tool`) for maximum compatibility and speed. All processing happens in Web Workers and WASM.
2.  **The Oracle (`/website`):** An Astro 5.0 static site serving 30+ SEO-optimized pages. Designed for "Generative Engine Optimization" (GEO) to dominate AI-driven search.

---

## 🧠 Technology Stack

- **Core:** React 19, TypeScript, Vite 6, Tailwind CSS 3
- **PDF Engine:** `pdf-lib` (Creation), `pdfjs-dist` (Analysis/Rendering)
- **local-AI:** `tesseract.js` (OCR), `fontkit` (Typography), `SHA-256` (Deduplication)
- **Style:** Custom "Private Sanctuary" design with vanilla CSS + Backdrop Filters

---

## 🚀 Deployment

### Vercel (Recommended)
This project is optimized for Vercel. Use the following command to build both engines and merge them:
```bash
npm run build:all
```
The output will be in the `dist/` directory, structured for an Astro homepage with the React SPA accessible at `/app`.

### CI/CD
Automated workflows are configured in `.github/workflows/`:
- **CI**: Runs linting, type checking, and component builds on every push/PR.
- **Build Verification**: Ensures the full merged build (`build:all`) completes successfully.

---

**Last updated:** December 23, 2025
**Bundle size:** ~74 KB gzip (Initial) | **Tools:** 21 | **Languages:** 9
