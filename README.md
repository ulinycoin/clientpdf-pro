# LocalPDF v2.0

<div align="center">

![LocalPDF Logo](https://localpdf.online/favicon-32x32.png)

**Privacy-first PDF tools that work entirely in your browser**
*Now with full multilingual support in 5 languages*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-localpdf.online-blue?style=for-the-badge)](https://localpdf.online)
[![Version](https://img.shields.io/badge/Version-2.0-brightgreen?style=for-the-badge)](https://github.com/ulinycoin/clientpdf-pro/releases)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

*No uploads • No tracking • No limits • Completely free*

[🚀 Try it now](https://localpdf.online) | [🎯 Features](#-features) | [🌍 Languages](#-multilingual-support) | [🛠️ Development](#-development) | [🤝 Contributing](#-contributing)

</div>

---

## 🆕 What's New in v2.0

### 🌍 **Full Multilingual Support**
- **5 Languages**: English, German, French, Spanish, Russian
- **76 SEO Pages**: Complete localization for all tools and pages
- **Smart URL Routing**: `/de/merge-pdf` automatically displays German interface
- **Language Switching**: Seamless language switching with URL preservation

### 🎨 **Modern Design Overhaul**
- **Glassmorphism UI**: Beautiful modern design with blur effects
- **Template Architecture**: Unified design system across all tools
- **Responsive Excellence**: Optimized for all device sizes
- **Accessibility First**: WCAG 2.1 compliant interface

### 🏗️ **Enhanced Architecture**
- **Modular Translations**: Organized localization system
- **Template-Driven Tools**: Consistent UX across all 14+ tools
- **Performance Optimized**: Faster loading and processing
- **TypeScript Enhanced**: Improved type safety and development experience

---

## 🎯 Why LocalPDF?

LocalPDF revolutionizes PDF processing by bringing professional tools directly to your browser - **no server uploads required**.

### 🔒 **Privacy First**
- **100% Local Processing**: Your files never leave your device
- **No Data Collection**: Zero tracking, analytics, or user data storage
- **No Registration**: Start using immediately without accounts

### ⚡ **Lightning Fast**
- **Modern Architecture**: Built with React 18 + TypeScript
- **Web Workers**: Handle large files without blocking the UI
- **Optimized Performance**: Smart chunking and lazy loading

### 🌐 **Universal Access**
- **Multilingual**: Full support for 5 languages with smart detection
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Offline Capable**: Core functionality works without internet
- **Responsive Design**: Beautiful UI on any screen size

---

## 🛠️ Features

<div align="center">

| Tool | Description | v2.0 Enhancements |
|------|-------------|------------------|
| 📄 **Merge PDFs** | Combine multiple PDFs into one | Multilingual UI, enhanced preview |
| ✂️ **Split PDFs** | Extract pages or split by ranges | Improved visual selection |
| 🗜️ **Compress PDFs** | Reduce file size intelligently | Better compression algorithms |
| ✍️ **Add Text** | Insert custom text and annotations | Multi-language font support |
| 🏷️ **Add Watermarks** | Protect documents with watermarks | Enhanced positioning system |
| 🔄 **Rotate Pages** | Fix page orientation | Batch rotation options |
| 📑 **Extract Pages** | Get specific pages or ranges | Improved batch processing |
| 📝 **Extract Text** | Pull text content from PDFs | Enhanced OCR accuracy |
| 🖼️ **PDF to Images** | Convert pages to PNG/JPG/WebP | Higher quality output |
| 📷 **Images to PDF** | Combine images into PDF | **NEW:** Fixed file upload, better layout control |
| 📄 **Word to PDF** | Convert DOCX files to PDF | Improved formatting preservation |
| 📊 **Excel to PDF** | Convert spreadsheets to PDF | Enhanced multi-sheet support |
| 🔍 **OCR Recognition** | Extract text from scanned PDFs | **NEW:** Support for 10+ languages including Cyrillic |

</div>

---

## 🌍 Multilingual Support

LocalPDF v2.0 features complete multilingual support with smart language detection:

<div align="center">

| Language | Code | Status | URL Example |
|----------|------|---------|-------------|
| 🇺🇸 English | `en` | ✅ Complete | `localpdf.online/merge-pdf` |
| 🇩🇪 German | `de` | ✅ Complete | `localpdf.online/de/merge-pdf` |
| 🇫🇷 French | `fr` | ✅ Complete | `localpdf.online/fr/merge-pdf` |
| 🇪🇸 Spanish | `es` | ✅ Complete | `localpdf.online/es/merge-pdf` |
| 🇷🇺 Russian | `ru` | ✅ Complete | `localpdf.online/ru/merge-pdf` |

</div>

### Language Features

- **Automatic Detection**: Browser language preference detection
- **URL-Based Routing**: Clean URLs for each language
- **SEO Optimized**: 76 pre-rendered pages for search engines
- **Context Preservation**: Language switching maintains current page/tool
- **Native Typography**: Proper font rendering for all languages

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern browser (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+)

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

### Building for Production

```bash
# Build optimized bundle with multilingual support
npm run build

# Build with SSG (Static Site Generation)
npm run build:ssg

# Generate multilingual sitemap
npm run generate-multilingual-sitemap

# Preview production build
npm run preview

# Run type checking
npm run type-check
```

---

## 🏗️ Architecture v2.0

LocalPDF v2.0 features a completely redesigned architecture:

```
src/
├── components/              # Reusable UI components
│   ├── atoms/              # Basic UI elements (Button, Input)
│   ├── molecules/          # Composite components (ModernUploadZone)
│   ├── organisms/          # Complex components (PDF tools)
│   └── templates/          # Page templates (StandardToolPageTemplate)
├── locales/                # Multilingual translations (NEW v2.0)
│   ├── en/                # English translations
│   ├── de/                # German translations  
│   ├── fr/                # French translations
│   ├── es/                # Spanish translations
│   └── ru/                # Russian translations
├── hooks/                  # Custom React hooks
│   └── useI18n.tsx        # Internationalization hook (NEW v2.0)
├── services/               # Business logic and API layer
├── utils/                  # Utility functions and helpers
├── features/               # Feature-specific modules
└── types/                  # TypeScript type definitions
    └── i18n.ts            # Translation types (NEW v2.0)
```

### Key Technologies v2.0

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Internationalization**: Custom i18n system with URL routing
- **Design System**: Template-driven architecture with glassmorphism
- **PDF Processing**: PDF-lib, PDF.js, jsPDF
- **Build Tools**: Vite with multilingual SSG support
- **Document Processing**: Mammoth.js (Word), XLSX (Excel)
- **OCR**: Tesseract.js with multilingual support
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

### Template-Driven Architecture (NEW v2.0)

All tools now use a unified template system:

```typescript
<StandardToolPageTemplate
  seoData={seoData}
  toolId="merge-pdf"
  pageTitle={t('pages.tools.merge.pageTitle')}
  pageDescription={t('pages.tools.merge.pageDescription')}
  toolComponent={<ModernMergeTool />}
  breadcrumbKey="merge-pdf"
/>
```

**Benefits:**
- ✅ Consistent UI/UX across all tools
- ✅ Automatic multilingual support for new tools
- ✅ Simplified maintenance and updates
- ✅ SEO consistency across all languages

---

## 🌐 Internationalization System

### Translation Structure

```typescript
// Example translation structure
export const en = {
  common: {
    buttons: { /* shared buttons */ },
    labels: { /* common labels */ }
  },
  pages: {
    tools: {
      merge: {
        pageTitle: "Merge PDF Files Online",
        description: "Combine multiple PDF files..."
      }
    }
  }
}
```

### Adding New Languages

1. Create new language directory in `/src/locales/`
2. Copy structure from `/src/locales/en/`
3. Translate all strings
4. Add language to `/src/locales/index.ts`
5. Update routing in `/src/App.tsx`
6. Add to Vite config for SSG

### Adding New Translations

1. Add key to English locale first
2. Use translation key in component: `t('pages.tools.merge.title')`
3. Add same key to all other languages
4. TypeScript will enforce consistency

---

## 🎨 Design System v2.0

### Color Palette

```css
/* Ocean Palette (NEW v2.0) */
--color-seafoam-green: #4ECDC4;  /* Primary brand */
--color-ocean-blue: #45B7D1;     /* Secondary */ 
--color-sandy-beige: #F4E4BC;    /* Accent */

/* Privacy-focused variants */
--color-privacy-accent: var(--color-seafoam-green);
--color-privacy-subtle: rgba(78, 205, 196, 0.1);
```

### Component Standards

- **Glassmorphism**: Blur effects with transparency
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA labels and semantic HTML
- **Dark Mode**: Automatic dark/light theme switching
- **Animation**: Subtle micro-interactions

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                          # Start development server
npm run build                        # Build for production  
npm run build:ssg                   # Build with Static Site Generation
npm run preview                     # Preview production build

# Quality Assurance
npm run type-check                  # TypeScript validation
npm run lint                        # Code linting

# Multilingual & SEO
npm run generate-multilingual-sitemap   # Generate SEO sitemap
npm run prerender-multilingual          # Pre-render all language pages
npm run submit-indexnow                 # Submit sitemap to search engines
```

### Development Guidelines v2.0

1. **Template First**: Use StandardToolPageTemplate for all tools
2. **Multilingual**: Add translations for all new strings
3. **TypeScript**: Strict typing with i18n type safety
4. **Performance**: Lazy loading and code splitting
5. **Accessibility**: WCAG 2.1 compliance
6. **Testing**: Unit tests for services and components

### Adding New Tools (v2.0 Process)

1. Create service in `/src/services/`
2. Create hook in `/src/hooks/`
3. Create tool component in `/src/components/organisms/`
4. Create page using StandardToolPageTemplate
5. Add translations to all 5 languages
6. Add routing for all languages in `/src/App.tsx`
7. Update Vite config for SSG support

---

## 🔄 Migration from v1.0

### Breaking Changes

- **URL Structure**: Language prefixes now required (e.g., `/de/merge-pdf`)
- **Translation Keys**: New hierarchical structure
- **Component Props**: StandardToolPageTemplate replaces individual layouts
- **Build Process**: New multilingual build system

### Migration Guide

1. **URLs**: Update bookmarks - `/merge-pdf` → `/merge-pdf` (EN) or `/de/merge-pdf` (DE)
2. **Bookmarks**: Old URLs redirect automatically
3. **API**: No changes - all processing still client-side
4. **Data**: No user data migration needed (privacy-first!)

---

## 🤝 Contributing

We welcome contributions to LocalPDF v2.0! Here's how you can help:

### Priority Areas for v2.0

- 🌍 **More Languages**: Help add support for additional languages
- 🎨 **Design Improvements**: Enhance the glassmorphism interface
- 🔧 **Tool Features**: Add new PDF processing capabilities
- 📱 **Mobile UX**: Improve mobile user experience
- ♿ **Accessibility**: Enhance WCAG compliance

### Translation Contributions

We especially need help with:
- **Proofreading**: Review existing translations for accuracy
- **New Languages**: Add support for Portuguese, Italian, Japanese, Chinese
- **Context**: Improve context-specific translations
- **Technical Terms**: Ensure accurate PDF/technical terminology

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow v2.0 architecture patterns
4. Add translations for new strings
5. Test in multiple languages
6. Run `npm run type-check` and `npm run lint`
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

---

## 📊 Performance v2.0

Performance improvements in v2.0:

- **Bundle Optimization**: 25% smaller initial bundle
- **Lazy Loading**: Language-specific chunk loading
- **SSG**: Pre-rendered pages for faster initial load
- **Modern Build**: Vite-powered build system
- **Tree Shaking**: Improved dead code elimination

### Metrics

| Metric | v1.0 | v2.0 | Improvement |
|--------|------|------|-------------|
| Initial Load | 650KB | 485KB | 25% faster |
| Language Switch | 200ms | 50ms | 75% faster |
| SEO Pages | 17 | 76 | 347% more |
| Languages | 2 | 5 | 150% more |

---

## 🔒 Security & Privacy v2.0

Enhanced security features:

- **Content Security Policy**: Stricter CSP headers
- **Multilingual Privacy**: Privacy policy in all languages
- **GDPR Compliance**: Enhanced compliance documentation
- **Local Processing**: Still 100% local - enhanced with multilingual support
- **No Tracking**: Zero analytics across all language versions

---

## 📱 Browser Support v2.0

| Browser | Version | Status | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full support | All languages |
| Firefox | 90+ | ✅ Full support | All languages |
| Safari | 14+ | ✅ Full support | All languages |
| Edge | 90+ | ✅ Full support | All languages |
| Mobile Safari | 14+ | ✅ Full support | Responsive design |
| Chrome Mobile | 90+ | ✅ Full support | Touch optimized |

---

## 📈 SEO & Discoverability v2.0

Major SEO improvements:

- **76 Pre-rendered Pages**: 5 languages × 15+ pages each
- **Hreflang Tags**: Proper international SEO
- **Multilingual Sitemaps**: Search engine optimization
- **Meta Descriptions**: Localized for each language
- **Open Graph**: Social media sharing in all languages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Core Libraries
- [PDF-lib](https://pdf-lib.js.org/) - PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine

### v2.0 Special Thanks
- **Translators**: Community contributors for multilingual support
- **Designers**: UI/UX feedback for glassmorphism interface
- **Testers**: Cross-language testing and feedback

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ulinycoin/clientpdf-pro/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ulinycoin/clientpdf-pro/discussions)
- 🌍 **Translation Help**: Contact for localization assistance
- 📧 **Security Issues**: Contact maintainers privately

---

## 📝 Changelog v2.0

### 🆕 Added
- **Complete multilingual support** for 5 languages
- **Modern glassmorphism design** system
- **Template-driven architecture** for consistency
- **76 pre-rendered SEO pages** for better discoverability
- **Enhanced Image to PDF** tool with fixed file uploads
- **Multilingual OCR** support with Cyrillic languages
- **Smart URL routing** with language detection
- **Modular translation system** for maintainability

### 🔄 Changed
- **Redesigned all tool interfaces** with unified template
- **Improved performance** with better code splitting
- **Enhanced accessibility** with WCAG 2.1 compliance
- **Modernized build system** with Vite optimizations

### 🐛 Fixed
- **Image to PDF upload issues** resolved
- **Translation key display** instead of translated text
- **404 page localization** completed
- **Cross-language navigation** bugs fixed

---

<div align="center">

**Made with ❤️ for privacy-conscious users worldwide**
*Now available in 5 languages!*

[⭐ Star this repo](https://github.com/ulinycoin/clientpdf-pro) if you find it useful!

**LocalPDF v2.0** - *Privacy-First PDF Tools, Now Globally Accessible*

</div>