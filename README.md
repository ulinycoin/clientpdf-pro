# 🚀 LocalPDF - Privacy-First PDF Tools

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Performance](https://img.shields.io/badge/Lighthouse-92%2F100-green.svg)](#performance)

**Modern client-side PDF processing tools with complete privacy protection. Your files never leave your device.**

🌐 **Live Demo**: [localpdf.online](https://localpdf.online)

## ✨ Features

- 🔒 **100% Privacy**: All processing happens in your browser - no server uploads
- ⚡ **Lightning Fast**: Instant processing with optimized PDF libraries
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface built with TailwindCSS
- 🛠️ **Multiple Tools**: Merge, split, compress, and convert PDFs
- 🔄 **Drag & Drop**: Simple file handling with visual feedback
- 🌐 **No Installation**: Works directly in any modern web browser
- 📊 **Progress Tracking**: Real-time feedback for heavy operations
- 🚀 **Lazy Loading**: PDF libraries load on-demand for optimal performance

## 🛠️ Available Tools

| Tool | Description | Status |
|------|-------------|--------|
| **Merge PDF** | Combine multiple PDF files into one | ✅ |
| **Split PDF** | Extract pages or split into separate files | ✅ |
| **Compress PDF** | Reduce file size while maintaining quality | ✅ |
| **Images to PDF** | Convert JPG, PNG, and other images to PDF | ✅ |

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript (strict mode)
- **Build Tool**: Vite 6 with optimized chunking strategy
- **Styling**: TailwindCSS + Framer Motion animations
- **PDF Processing**: pdf-lib + pdfjs-dist (lazy loaded)
- **Architecture**: Atomic Design pattern with performance optimizations
- **State Management**: Custom hooks with React state
- **Deployment**: Vercel with static optimization

## 📊 Performance Metrics

| Metric | Score | Details |
|--------|-------|---------|
| **Lighthouse Performance** | 92/100 | Optimized bundle splitting |
| **Time to Interactive** | 2.1s | Lazy loading implementation |
| **First Contentful Paint** | 1.2s | Critical resource prioritization |
| **Bundle Size (initial)** | ~300KB gzipped | PDF libraries loaded on-demand |
| **Largest Chunk** | <400KB | Granular code splitting |

## 📁 Project Structure

```
src/
├── components/
│   ├── atoms/          # Basic UI components
│   ├── molecules/      # Composed components
│   ├── organisms/      # Complex feature components
│   ├── ui/             # Reusable UI components (Progress, Loading)
│   └── examples/       # Demo components
├── hooks/              # Custom React hooks (usePDFLoader, etc.)
├── utils/              # Utilities (pdfLoader, validation)
├── pages/              # Route components
└── types/              # TypeScript definitions
docs/
├── PERFORMANCE_OPTIMIZATION.md  # Detailed optimization guide
└── API.md                       # Component API documentation
```

## 🚀 Development

### Prerequisites
- Node.js 16+
- npm 8+

### Quick Start
```bash
# Clone the repository (for authorized users only)
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro

# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production with optimizations
npm run build

# Preview production build
npm run preview
```

### Performance Development

For optimal development experience:

```bash
# Type checking in watch mode
npm run type-check

# Lint with performance rules
npm run lint

# Build with bundle analysis
npm run build --analyze
```

## 🔧 Key Optimizations

### 1. Lazy Loading System
```typescript
// PDF libraries load only when needed
import { loadPDFJS, loadPDFLib } from '@/utils/pdfLoader'

const processPDF = async () => {
  const { getDocument } = await loadPDFJS() // Lazy loaded
  // Process PDF
}
```

### 2. Progress Tracking
```typescript
import { usePDFLoader } from '@/hooks/usePDFLoader'
import { PDFLoadingProgress } from '@/components/ui/PDFLoadingProgress'

const { isLoading, progress, error } = usePDFLoader()
// Real-time progress feedback
```

### 3. Smart Preloading
```typescript
// Libraries preload on user interaction
<button 
  onMouseEnter={triggerPreload}
  onClick={handlePDFOperation}
>
  Process PDF
</button>
```

### 4. Optimized Chunking
- **Initial bundle**: ~300KB (core app)
- **PDF viewer**: Lazy loaded (~280KB)
- **PDF editor**: Lazy loaded (~250KB)
- **Utilities**: Shared chunks for optimal caching

## 🔒 Security & Privacy

- **No Data Collection**: We don't collect, store, or transmit your files
- **Client-Side Processing**: All operations happen in your browser
- **No Server Dependencies**: Files never touch our servers
- **eval() Protection**: Security patches for PDF.js eval usage
- **Modern Security**: CSP headers and secure build configuration

## 📚 Documentation

- [📈 Performance Optimization Guide](./docs/PERFORMANCE_OPTIMIZATION.md) - Detailed optimization documentation
- [🔧 API Reference](./docs/API.md) - Component and hook APIs
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 🌟 Why Choose LocalPDF?

| Feature | LocalPDF | Competitors |
|---------|----------|-------------|
| **Privacy** | 100% client-side | Server uploads required |
| **Performance** | Lighthouse 92/100 | Often slower |
| **Speed** | Instant processing | Wait for uploads/downloads |
| **Offline** | Works without internet* | Requires connection |
| **Limits** | Up to 100MB files | Often restricted |
| **Cost** | Completely free | Freemium/paid plans |
| **Bundle Size** | 300KB initial | Often 1MB+ |

*_After initial page load_

## 📄 License & Usage

**⚠️ IMPORTANT: This software is proprietary and protected by copyright.**

### 🔍 What You CAN Do:
- ✅ View and study the code for educational purposes
- ✅ Download and compile for personal evaluation
- ✅ Report bugs and security issues

### ❌ What You CANNOT Do:
- ❌ Use commercially without permission
- ❌ Distribute or sublicense the code
- ❌ Create derivative works or modifications
- ❌ Remove copyright notices
- ❌ Use the "LocalPDF" trademark
- ❌ Host as a competing service

### 💼 Commercial License
For commercial use, enterprise licenses, or custom development:
📧 **Contact**: license@localpdf.online

## 🤝 Contributing

This is a proprietary project. For bug reports or feature suggestions:
- 🐛 [Create an issue](https://github.com/ulinycoin/clientpdf-pro/issues)
- 📧 Contact: support@localpdf.online

### Development Guidelines

When contributing optimizations:
1. Maintain lazy loading patterns
2. Add progress tracking for operations > 1s
3. Implement proper error handling
4. Test with large files (50-100MB)
5. Update performance documentation

## 📞 Support

- 📖 **Documentation**: Available at [localpdf.online/docs](https://localpdf.online/docs)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ulinycoin/clientpdf-pro/issues)
- 💬 **General Support**: support@localpdf.online
- 💼 **Business Inquiries**: business@localpdf.online

---

## ⚖️ Legal Notice

```
Copyright (c) 2024 LocalPDF Team
Licensed under the LocalPDF Source Available License v1.0

This software is proprietary. Unauthorized copying, distribution,
or use is strictly prohibited. See LICENSE file for full terms.
```

**Made with ❤️ for privacy-conscious users worldwide**

[![Powered by Vercel](https://img.shields.io/badge/Powered%20by-Vercel-black.svg)](https://vercel.com)
[![Built with React](https://img.shields.io/badge/Built%20with-React-blue.svg)](https://reactjs.org/)
[![Optimized with Vite](https://img.shields.io/badge/Optimized%20with-Vite-646CFF.svg)](https://vitejs.dev/)
