# 🔒 LocalPDF - Privacy-First PDF Toolkit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, privacy-first PDF toolkit that processes everything locally in your browser. No servers, no uploads, no tracking - just pure client-side PDF manipulation.

🌐 **Live Demo**: [https://localpdf.online](https://localpdf.online)

## ✨ Key Features

- 🔒 **100% Privacy** - All PDF processing happens in your browser, files never leave your device
- 🌍 **5 Languages** - Full support for English, German, French, Spanish, and Russian
- ⚡ **16 PDF Tools** - Complete suite for PDF manipulation, conversion, and editing
- 🎨 **Modern UI** - Beautiful glassmorphism design with dark mode support
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🚀 **Fast & Optimized** - Lazy loading, code splitting, and Web Workers for performance
- ♿ **Accessible** - WCAG 2.1 compliant with full keyboard navigation
- 🔍 **SEO Optimized** - Multi-language sitemaps, hreflang tags, and bot prerendering

## 🛠️ Available PDF Tools

### Core Operations
- **Merge PDF** - Combine multiple PDFs into one document
- **Split PDF** - Divide PDF into separate pages or ranges
- **Compress PDF** - Reduce file size while maintaining quality
- **Protect PDF** - Add password protection and set permissions

### Editing Tools
- **Add Text to PDF** - Insert text with custom fonts, sizes, and colors
- **Watermark PDF** - Add text or image watermarks
- **Rotate PDF** - Rotate pages by 90°, 180°, or 270°
- **Extract Pages** - Extract selected pages to a new PDF

### Data Extraction
- **Extract Text** - Extract all text content from PDFs
- **Extract Images** - Save embedded images from PDFs
- **OCR PDF** - Extract text from scanned documents using Tesseract.js

### Conversion Tools
- **Images to PDF** - Convert JPG, PNG, WEBP to PDF
- **Word to PDF** - Convert DOCX documents to PDF
- **Excel to PDF** - Convert XLSX spreadsheets to PDF
- **PDF to Images** - Export PDF pages as JPG/PNG
- **PDF to SVG** - Convert PDF pages to vector SVG

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Project Structure

```
clientpdf-pro/
├── api/                          # Vercel API Routes
│   └── robots.txt.js            # Dynamic robots.txt
│
├── src/
│   ├── components/              # React components (Atomic Design)
│   │   ├── atoms/              # Basic UI elements
│   │   ├── molecules/          # Compound components
│   │   ├── organisms/          # Complex components
│   │   ├── SEO/                # SEO optimization components
│   │   └── providers/          # React Context providers
│   │
│   ├── services/               # PDF processing business logic
│   │   ├── pdfService.ts       # Core PDF operations
│   │   ├── splitService.ts     # PDF splitting
│   │   ├── compressionService.ts
│   │   ├── ocrService.ts       # OCR with Tesseract.js
│   │   └── [14 more services]
│   │
│   ├── pages/                  # Route components
│   │   ├── tools/             # Tool-specific pages
│   │   └── authority/         # SEO authority pages
│   │
│   ├── locales/               # i18n translations
│   │   ├── en/               # English (default)
│   │   ├── de/               # German
│   │   ├── fr/               # French
│   │   ├── es/               # Spanish
│   │   └── ru/               # Russian
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   ├── config/                # App configuration
│   ├── data/                  # Static data
│   ├── utils/                 # Utility functions
│   └── workers/               # Web Workers
│
├── scripts/                   # Build and deployment scripts
├── public/                    # Static assets
└── tests/                     # Test files
```

## 🔧 Development Commands

### Development
```bash
npm run dev              # Start dev server on port 3000
npm run build            # Build for production (fast, skips type-check)
npm run build:full       # Full build with sitemap & IndexNow
npm run preview          # Preview production build
```

### Testing
```bash
npm run type-check       # TypeScript type checking
npm run lint             # ESLint with TypeScript
npm run test             # Vitest unit tests (watch mode)
npm run test:run         # Run unit tests once
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # E2E tests with UI
npm run test:e2e:debug   # Debug E2E tests
npm run test:all         # Run all tests
```

### SEO & Deployment
```bash
npm run generate-multilingual-sitemap  # Generate sitemaps
npm run submit-indexnow                # Submit to search engines
npm run deploy                         # Deploy to production
```

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library with hooks and suspense
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool with ESBuild
- **React Router v6** - Multi-language routing system
- **Tailwind CSS** - Utility-first CSS with custom glassmorphism theme
- **Lucide React** - Modern icon library

### PDF Processing
- **pdf-lib** - Core PDF manipulation
- **pdfjs-dist** - PDF rendering and text extraction
- **@pdf-lib/fontkit** - Font handling for PDFs
- **tesseract.js** - OCR text recognition
- **jspdf** - PDF generation from other formats
- **mammoth** - Word document conversion

### Development & Deployment
- **Vercel** - Edge Runtime hosting and API routes
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🌍 Internationalization (i18n)

LocalPDF supports 5 languages with automatic browser language detection:

- 🇺🇸 English (default) - `/merge-pdf`
- 🇩🇪 German - `/de/merge-pdf`
- 🇫🇷 French - `/fr/merge-pdf`
- 🇪🇸 Spanish - `/es/merge-pdf`
- 🇷🇺 Russian - `/ru/merge-pdf`

### Adding Translations

1. Add translations to `src/locales/{lang}/` following existing structure
2. Update type definitions in `src/types/i18n.ts`
3. Translations are automatically loaded via `useI18n()` hook

```typescript
const { t, currentLanguage } = useI18n();
const title = t('tools.merge.title'); // Returns translated text
```

## 🔒 Privacy & Security

### Privacy-First Architecture
- ✅ **No Server Uploads** - All files processed in browser using Web APIs
- ✅ **No Data Collection** - No tracking, analytics, or personal data storage
- ✅ **Auto-Cleanup** - Files removed from memory after processing
- ✅ **GDPR Compliant** - Fully compliant with EU privacy regulations

### Technical Security
- 🛡️ **CSP Headers** - Content Security Policy protection
- 🔒 **HTTPS Only** - All connections encrypted
- 🚧 **Input Validation** - Strict file type and size validation
- ⚡ **Rate Limiting** - Protection against DoS attacks

## 📊 Performance

### Core Web Vitals
- 🟢 **LCP** (Largest Contentful Paint): < 2.5s
- 🟢 **FID** (First Input Delay): < 100ms
- 🟢 **CLS** (Cumulative Layout Shift): < 0.1
- 🟢 **FCP** (First Contentful Paint): < 1.8s

### Optimization Techniques
- ⚡ **Lazy Loading** - All pages load on demand
- 📦 **Code Splitting** - Separate bundles per route
- 🧵 **Web Workers** - Heavy operations in background threads
- 💾 **Aggressive Caching** - Static assets cached for 1 year
- 🗜️ **Tree Shaking** - Unused code eliminated from bundles

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Follow the existing TypeScript/React patterns
- Use functional components with hooks
- Add proper TypeScript types
- Include unit tests for new features
- Update translations for all 5 languages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) - Excellent PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla's PDF rendering engine
- [Tesseract.js](https://tesseract.projectnaptha.com/) - Pure JavaScript OCR
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icon library

## 📞 Support

- 📧 Email: support@localpdf.online
- 🐛 Issues: [GitHub Issues](https://github.com/ulinycoin/clientpdf-pro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ulinycoin/clientpdf-pro/discussions)

---

<div align="center">

**Made with ❤️ for Privacy**

[Website](https://localpdf.online) • [Blog](https://localpdf.online/blog)

</div>