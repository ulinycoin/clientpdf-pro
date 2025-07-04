# 🏗️ LocalPDF Build Guide

This document provides comprehensive instructions for building and deploying LocalPDF.

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For cloning the repository

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro
npm run quick-start
```

### 2. Verify Build Process
```bash
npm run verify-build
```

This will run our comprehensive build verification script that tests:
- Dependencies installation
- TypeScript type checking
- Build process
- Output validation
- Preview server

## 📦 Available Scripts

### Development
- `npm run dev` - Start development server (localhost:3000)
- `npm run type-check` - Run TypeScript type checking
- `npm run type-check:watch` - Watch mode for TypeScript checking

### Building
- `npm run build` - Standard build for production
- `npm run build:production` - Build with type checking first
- `npm run preview` - Preview production build locally
- `npm run clean` - Clean build directory

### Testing & Verification
- `npm run verify-build` - Comprehensive build verification
- `npm run test:addtext` - Test AddTextTool compilation
- `npm run seo:check` - Run Lighthouse SEO audit

### Analysis
- `npm run build:analyze` - Build with bundle analysis

## 🛠️ Build Configuration

### TypeScript Configuration
- **Strict mode**: Enabled with gradual adoption
- **Path mapping**: Configured for cleaner imports
- **Target**: ES2020 for modern browser support

### Vite Configuration
- **Bundle splitting**: Separate chunks for vendors
- **Optimized dependencies**: Pre-bundled for faster builds
- **Error handling**: Shows critical errors while allowing builds
- **Path aliases**: Support for `@/` imports

### Build Optimizations
- **Code splitting**: Automatic vendor chunk separation
- **Tree shaking**: Removes unused code
- **Minification**: Using esbuild for speed
- **CSS optimization**: Tailwind CSS purging

## 🏭 Production Deployment

### Build for Production
```bash
# Clean build with verification
npm run clean
npm run build:production

# Verify build output
ls -la dist/
```

### Expected Build Output
```
dist/
├── index.html          # Main HTML file
├── assets/
│   ├── index-[hash].js # Main application bundle
│   ├── react-vendor-[hash].js
│   ├── pdf-vendor-[hash].js
│   └── index-[hash].css
├── vite.svg           # Favicon
└── robots.txt         # SEO robots file
```

### Deployment Options

#### 1. GitHub Pages
```bash
npm run build
# Upload dist/ contents to gh-pages branch
```

#### 2. Vercel
```bash
npm run build
# Deploy dist/ folder to Vercel
```

#### 3. Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

#### 4. Static File Server
```bash
npm run build
cp -r dist/* /path/to/web/server/
```

## 🔧 Troubleshooting

### Common Build Issues

#### 1. TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Common fixes:
# - Update import paths
# - Check component exports
# - Verify type definitions
```

#### 2. Missing Dependencies
```bash
# Reinstall with legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 3. Build Fails
```bash
# Clean and rebuild
npm run clean
npm run build

# Check for specific errors in console
npm run build 2>&1 | tee build.log
```

#### 4. Import Resolution Issues
```bash
# Verify path aliases in vite.config.ts and tsconfig.json
# Check that all imports use correct paths
```

### Performance Issues

#### Bundle Size Too Large
```bash
# Analyze bundle
npm run build:analyze

# Common solutions:
# - Enable code splitting
# - Remove unused dependencies
# - Use dynamic imports for large components
```

#### Slow Build Times
```bash
# Check for:
# - Large node_modules
# - Unnecessary file watching
# - TypeScript strict checks
```

## 📊 Build Metrics

### Target Performance
- **Bundle size**: < 500KB gzipped
- **Build time**: < 30 seconds
- **Lighthouse score**: > 90
- **First Contentful Paint**: < 2 seconds

### Current Status
✅ TypeScript compilation: Working
✅ Vite build process: Optimized
✅ Bundle splitting: Configured
✅ SEO optimization: Complete
✅ All 9 PDF tools: Functional

## 🔍 Debugging Build Issues

### Enable Verbose Logging
```bash
# TypeScript verbose
npx tsc --noEmit --listFiles

# Vite verbose
npx vite build --debug

# Build with all warnings
NODE_ENV=development npm run build
```

### Check Specific Components
```bash
# Test specific tool compilation
npm run test:addtext

# Verify imports
npx tsc --noEmit --showConfig
```

## 🚀 Continuous Integration

### GitHub Actions (Example)
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm install --legacy-peer-deps
    - run: npm run verify-build
    - run: npm run build:production
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [React Best Practices](https://react.dev/learn)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💡 Tips for Contributors

1. **Always run type-check before committing**
2. **Use the verify-build script to test changes**
3. **Keep bundle size under 500KB**
4. **Follow the established import patterns**
5. **Update this guide when adding new build steps**

---

For build issues, please check the [known issues](.claude/known-issues.md) or create a GitHub issue.
