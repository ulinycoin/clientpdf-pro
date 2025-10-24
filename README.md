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

# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

## 📱 Available Tools (11/17 implemented)

### ✅ Core Tools (Tier 1) - 5/5
- **Merge PDF** - `/#merge` - Combine multiple PDF files
- **Split PDF** - `/#split` - Extract pages from PDF
- **Compress PDF** - `/#compress` - Reduce PDF file size
- **Protect PDF** - `/#protect` - Add password protection
- **OCR PDF** - `/#ocr` - Extract text with OCR

### ✅ Edit Tools (Tier 2) - 6/6
- **Watermark PDF** - `/#watermark` - Add watermark to pages
- **Add Text PDF** - `/#add-text` - Add custom text to PDF pages
- **Rotate PDF** - `/#rotate` - Rotate pages by 90/180/270 degrees
- **Delete Pages** - `/#delete-pages` - Remove specific pages
- **Extract Pages** - `/#extract-pages` - Extract pages to new PDF
- **Images to PDF** - `/#images-to-pdf` - Convert JPG/PNG to PDF

### ❌ Not Yet Implemented (6 tools)
- Unlock PDF, PDF to Images, PDF to Word, Word to PDF, Sign PDF, Flatten PDF

---

## 🚀 Performance Metrics

**After optimization (Oct 18, 2025):**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Initial Load** | 817 KB gzip | 74 KB gzip | **-91%** 🔥 |
| **FCP** | ~3s | ~0.5s | **-83%** ⚡ |
| **TTI** | ~8s | ~1.5s | **-81%** 🚀 |

**Bundle Breakdown:**
- Initial: ~74 KB gzip (index + React)
- Tools: 3-4 KB each (lazy loaded)
- PDF libs: 509-95 KB (loaded on demand)

---

## 📚 Documentation

📖 **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Complete development guide:
- Architecture overview
- How to add new tools
- Performance best practices
- Troubleshooting
- Code splitting principles

**Read this before making changes!**

---

## 🛠️ Commands

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run dev:web      # Start website dev server (port 4321)
npm run dev:all      # Start both servers simultaneously

# Production Build
npm run build        # Build app-spa only
npm run build:web    # Build website only
npm run build:all    # Build both (for Vercel deployment)
npm run preview      # Preview production build

# Code Quality
npx tsc --noEmit     # Type check
npm run lint         # Lint code
```

## 🚀 Deployment

### Deploy to Vercel (2 minutes)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

1. Click button above or go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects settings from `vercel.json`
4. Click "Deploy"
5. Done! 🎉

**Quick Start:** [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
**Full Guide:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
**Status:** [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)

---

## 🔑 Key Features

- ✅ **100% client-side processing** - files never leave your device
- ✅ **Code splitting** - tools load on demand
- ✅ **Lazy loading** - optimized for performance
- ✅ **Multi-language** - EN, RU, DE, FR, ES
- ✅ **Dark mode** - automatic theme switching
- ✅ **Hash routing** - works in any environment

---

## 📂 Project Structure

```
localpdf-v3/
├── src/
│   ├── components/
│   │   ├── tools/           # PDF tools (11 implemented)
│   │   ├── layout/          # Sidebar navigation
│   │   └── WelcomeScreen    # Homepage
│   ├── hooks/
│   │   ├── useHashRouter    # Hash-based routing
│   │   └── useI18n          # Internationalization
│   ├── services/            # PDF processing logic
│   ├── locales/             # Translations (5 languages)
│   └── App.tsx              # Main component with lazy loading
├── website/                 # Astro SEO website
│   ├── src/pages/          # SEO landing pages
│   └── public/             # Static assets
├── vite.config.ts           # ⭐ Code splitting config
├── CHANGELOG.md             # Version history
├── GITHUB_SETUP.md          # GitHub push instructions
└── DEVELOPMENT_GUIDE.md     # 📖 Development documentation
```

---

## ⚡ Performance Principles

### 1. Code Splitting
All PDF libraries split into separate chunks:
- `vendor-pdf-lib` (509 KB gzip)
- `vendor-pdfjs` (95 KB gzip)
- `vendor-ocr` (7 KB gzip)

### 2. Lazy Loading
Every tool uses `React.lazy()`:
```typescript
const MergePDF = lazy(() => import('./components/tools/MergePDF'));
```

### 3. On-Demand Loading
Tools and libraries load only when user clicks them.

**Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for details!**

---

## 🚫 Important Notes

### Dual Architecture
This project contains TWO applications:

1. **App-SPA** (`/src`) - React 19 Single Page Application
   - Hash routing: `/#merge`, `/#split`, etc.
   - Client-side PDF processing
   - Multi-language support

2. **Website** (`/website`) - Astro Static Site
   - SEO landing pages: `/merge-pdf`, `/split-pdf`, etc.
   - Links to app-spa tools
   - English only (for now)

### Routing
- **Website**: `/merge-pdf` (SEO page) → Links to app `/#merge`
- **App-SPA**: `/#merge` (actual PDF tool)

---

## 📞 Support

### Documentation
- **Development:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Complete development guide
- **Deployment:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Vercel deployment guide
- **Quick Start:** [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) - 2-minute deployment
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md) - Version history

### Setup Guides
- **GitHub:** [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Push to GitHub
- **Git Status:** [GIT_STATUS.md](./GIT_STATUS.md) - Repository status
- **Deployment Status:** [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Ready to deploy

### Links
- **Main Project:** https://localpdf.online
- **Repository:** https://github.com/ulinycoin/clientpdf-pro

---

## 📋 Version History

- **v3.0.0** (Current) - Complete rewrite with modern architecture
- **v2.x** (Legacy) - Archived in separate repository

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

---

**Built with:** React 19 + TypeScript + Vite + Astro
**Version:** 3.0.0
**Optimized:** October 24, 2025
**Maintainer:** Claude Code
