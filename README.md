# LocalPDF

<div align="center">

![LocalPDF Logo](https://localpdf.online/favicon-32x32.png)

**Privacy-first PDF tools that work entirely in your browser**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-localpdf.online-blue?style=for-the-badge)](https://localpdf.online)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

*No uploads • No tracking • No limits • Completely free*

[🚀 Try it now](https://localpdf.online) | [🎯 Features](#-features) | [🛠️ Development](#-development) | [🤝 Contributing](#-contributing)

</div>

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

### 📱 **Universal Access**
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Offline Capable**: Core functionality works without internet
- **Responsive Design**: Beautiful UI on any screen size

---

## 🛠️ Features

<div align="center">

| Tool | Description | Key Features |
|------|-------------|--------------|
| 📄 **Merge PDFs** | Combine multiple PDFs into one | Drag-and-drop reordering, preview |
| ✂️ **Split PDFs** | Extract pages or split by ranges | Visual page selection, custom ranges |
| 🗜️ **Compress PDFs** | Reduce file size intelligently | Quality control, size optimization |
| ✍️ **Add Text** | Insert custom text and annotations | Font control, positioning, styling |
| 🏷️ **Add Watermarks** | Protect documents with watermarks | Text/image watermarks, transparency |
| 🔄 **Rotate Pages** | Fix page orientation | 90°, 180°, 270° rotation options |
| 📑 **Extract Pages** | Get specific pages or ranges | Batch extraction, quality preservation |
| 📝 **Extract Text** | Pull text content from PDFs | Smart formatting, OCR support |
| 🖼️ **PDF to Images** | Convert pages to PNG/JPG/WebP | High-quality conversion, batch export |
| 📷 **Images to PDF** | Combine images into PDF | Multiple formats, layout control |
| 📄 **Word to PDF** | Convert DOCX files to PDF | Formatting preservation, fast conversion |
| 📊 **Excel to PDF** | Convert spreadsheets to PDF | Multi-sheet support, auto-sizing |
| 🔍 **OCR Recognition** | Extract text from scanned PDFs | 10+ languages, high accuracy |

</div>

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
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Lint code
npm run lint
```

---

## 🏗️ Architecture

LocalPDF follows a modern, scalable React architecture:

```
src/
├── components/           # Reusable UI components
│   ├── atoms/           # Basic UI elements (Button, Input)
│   ├── molecules/       # Composite components (FileUploader)
│   └── organisms/       # Complex components (PDF tools)
├── features/            # Feature-specific modules
│   └── word-to-pdf/     # Example feature module
├── hooks/               # Custom React hooks
├── services/            # Business logic and API layer
├── utils/               # Utility functions and helpers
├── workers/             # Web Workers for heavy processing
├── locales/             # Internationalization (i18n)
└── types/               # TypeScript type definitions
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **PDF Processing**: PDF-lib, PDF.js, jsPDF
- **Build Tools**: Vite, ESBuild
- **Document Processing**: Mammoth.js (Word), XLSX (Excel)
- **OCR**: Tesseract.js
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

---

## 🌐 Internationalization

LocalPDF supports multiple languages:

- 🇺🇸 English
- 🇷🇺 Russian  
- 🇩🇪 German
- 🇫🇷 French
- 🇪🇸 Spanish

Adding new languages is straightforward - contribute translations in `/src/locales/`.

## 🎨 Twitter Cards & Social Media

LocalPDF includes automatically generated Twitter Card images for better social media sharing:

- **30 unique images**: 6 tools × 5 languages
- **Professional design**: Gradient backgrounds, modern typography
- **Optimized dimensions**: 1200×630px for Twitter, Facebook, LinkedIn
- **Privacy branding**: Clear "Privacy First" messaging

### Generate Twitter Cards
```bash
# Generate all cards
npm run generate-twitter-cards

# Generate missing cards only  
node scripts/generate-missing-cards.js
```

Cards are automatically integrated into page meta tags via the `TwitterCardImage` component.

---

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # Run TypeScript checks
npm run lint             # Lint code
npm run generate-sitemap # Generate SEO sitemap
```

### Development Guidelines

1. **Component Structure**: Follow atomic design principles
2. **TypeScript**: Strict typing for all components and services
3. **Performance**: Use React.memo and useMemo for expensive operations
4. **Accessibility**: Include ARIA labels and semantic HTML
5. **Testing**: Write unit tests for services and integration tests for components

### Adding New Tools

1. Create service in `/src/services/`
2. Create hook in `/src/hooks/`
3. Create component in `/src/components/organisms/`
4. Create page in `/src/pages/tools/`
5. Add routing in `/src/App.tsx`
6. Add translations in `/src/locales/`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports**: Found an issue? [Open a bug report](https://github.com/ulinycoin/clientpdf-pro/issues)
- 💡 **Feature Requests**: Have an idea? [Suggest a feature](https://github.com/ulinycoin/clientpdf-pro/issues)
- 🌍 **Translations**: Help translate LocalPDF into your language
- 📝 **Documentation**: Improve docs, add tutorials, write guides
- 💻 **Code**: Submit pull requests with improvements

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Run `npm run type-check` and `npm run lint`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Follow existing code style and conventions
- Add TypeScript types for all new code
- Write meaningful commit messages
- Update documentation for new features
- Ensure all tests pass

---

## 📊 Performance

LocalPDF is optimized for performance:

- **Bundle Size**: Optimized chunks with tree-shaking
- **Loading**: Lazy loading for tool components
- **Processing**: Web Workers for CPU-intensive tasks
- **Memory**: Efficient file handling and cleanup
- **Caching**: Smart browser caching strategies

---

## 🔒 Security & Privacy

Security and privacy are core principles:

- **Local Processing**: All operations happen in the browser
- **No Uploads**: Files never sent to external servers
- **No Tracking**: Zero analytics or user tracking
- **Open Source**: Full transparency in code and practices
- **CSP Headers**: Content Security Policy implementation
- **HTTPS Only**: Secure connection enforced

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 90+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Mobile Safari | 14+ | ✅ Full support |
| Chrome Mobile | 90+ | ✅ Full support |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [PDF-lib](https://pdf-lib.js.org/) - PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ulinycoin/clientpdf-pro/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ulinycoin/clientpdf-pro/discussions)
- 📧 **Security Issues**: Contact maintainers privately

---

<div align="center">

**Made with ❤️ for privacy-conscious users worldwide**

[⭐ Star this repo](https://github.com/ulinycoin/clientpdf-pro) if you find it useful!

</div>