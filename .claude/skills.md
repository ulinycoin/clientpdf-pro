# LocalPDF v3.0 Migration Skills

This file defines reusable skills for the LocalPDF v3.0 migration project.

## copy-pdf-services

Copy all PDF services from the old project to pdf-app.

```bash
# Create services directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/services

# Copy all services
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/services/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/services/

# List copied files
echo "Copied services:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/services/
```

## copy-hooks

Copy all React hooks from the old project to pdf-app.

```bash
# Create hooks directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/hooks

# Copy all hooks
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/hooks/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/hooks/

# List copied files
echo "Copied hooks:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/hooks/
```

## copy-types

Copy TypeScript type definitions from the old project to pdf-app.

```bash
# Create types directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/types

# Copy all types
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/types/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/types/

# List copied files
echo "Copied types:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/types/
```

## copy-locales

Copy internationalization files from the old project to pdf-app.

```bash
# Create locales directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/locales

# Copy all locale files
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/locales/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/locales/

# List copied files
echo "Copied locales:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/locales/
```

## copy-tool-pages

Copy all PDF tool pages from the old project to pdf-app.

```bash
# Create pages directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/pages

# Copy all tool pages from tools directory
cp /Users/aleksejs/Desktop/clientpdf-pro/src/pages/tools/*.tsx \
   /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/pages/

# List copied pages
echo "Copied tool pages:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/pages/*.tsx
```

## copy-components

Copy React components from the old project to pdf-app.

```bash
# Create component directories
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/atoms
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/molecules
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/organisms

# Copy components
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/components/atoms/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/atoms/ 2>/dev/null || true

cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/components/molecules/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/molecules/ 2>/dev/null || true

cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/components/organisms/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/organisms/ 2>/dev/null || true

# List copied components
echo "Atoms:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/atoms/ 2>/dev/null || echo "No atoms yet"
echo "Molecules:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/molecules/ 2>/dev/null || echo "No molecules yet"
echo "Organisms:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/components/organisms/ 2>/dev/null || echo "No organisms yet"
```

## install-pdf-libraries

Install all required PDF processing libraries in pdf-app.

```bash
cd /Users/aleksejs/Desktop/Localpdf_v3/pdf-app

echo "Installing core PDF libraries..."
npm install pdf-lib @pdf-lib/fontkit pdfjs-dist pdf-lib-plus-encrypt

echo "Installing OCR library..."
npm install tesseract.js

echo "Installing conversion libraries..."
npm install jspdf docx mammoth xlsx

echo "Installing utilities..."
npm install jszip franc

echo "Installing browser polyfills..."
npm install buffer crypto-browserify stream-browserify path-browserify os-browserify events util

echo "All PDF libraries installed!"
```

## test-marketing-site

Build and test the marketing site.

```bash
cd /Users/aleksejs/Desktop/Localpdf_v3/marketing-site

echo "Running build..."
npm run build

echo ""
echo "Build size:"
du -sh dist/

echo ""
echo "Index.html size:"
ls -lh dist/index.html

echo ""
echo "Starting preview server..."
echo "Visit: http://localhost:4321"
npm run preview
```

## test-pdf-app

Build and test the PDF app.

```bash
cd /Users/aleksejs/Desktop/Localpdf_v3/pdf-app

echo "Running build..."
npm run build

echo ""
echo "Build size:"
du -sh dist/

echo ""
echo "Starting preview server..."
echo "Visit: http://localhost:4173"
npm run preview
```

## check-migration-status

Check the current status of the migration by comparing file counts.

```bash
echo "=== Migration Status ==="
echo ""

echo "PDF Services:"
echo "  Old: $(ls -1 /Users/aleksejs/Desktop/clientpdf-pro/src/services/*.ts 2>/dev/null | wc -l)"
echo "  New: $(ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/services/*.ts 2>/dev/null | wc -l)"
echo ""

echo "Hooks:"
echo "  Old: $(ls -1 /Users/aleksejs/Desktop/clientpdf-pro/src/hooks/* 2>/dev/null | wc -l)"
echo "  New: $(ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/hooks/* 2>/dev/null | wc -l)"
echo ""

echo "Types:"
echo "  Old: $(ls -1 /Users/aleksejs/Desktop/clientpdf-pro/src/types/* 2>/dev/null | wc -l)"
echo "  New: $(ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/types/* 2>/dev/null | wc -l)"
echo ""

echo "Locales:"
echo "  Old: $(ls -1 /Users/aleksejs/Desktop/clientpdf-pro/src/locales/* 2>/dev/null | wc -l)"
echo "  New: $(ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/locales/* 2>/dev/null | wc -l)"
echo ""

echo "Tool Pages:"
echo "  Old: $(ls -1 /Users/aleksejs/Desktop/clientpdf-pro/src/pages/tools/*.tsx 2>/dev/null | wc -l)"
echo "  New: $(ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/pages/*.tsx 2>/dev/null | wc -l)"
echo ""
```

## run-both-dev

Start both development servers simultaneously.

```bash
# This skill helps you remember to run both servers
echo "To run both dev servers, open TWO terminals:"
echo ""
echo "Terminal 1 - Marketing Site:"
echo "  cd /Users/aleksejs/Desktop/Localpdf_v3/marketing-site"
echo "  npm run dev"
echo "  → http://localhost:3000"
echo ""
echo "Terminal 2 - PDF App:"
echo "  cd /Users/aleksejs/Desktop/Localpdf_v3/pdf-app"
echo "  npm run dev"
echo "  → http://localhost:3001"
echo ""
echo "Note: This skill just shows instructions. Run the commands in separate terminals."
```

## copy-utils

Copy utility functions from the old project to pdf-app.

```bash
# Create utils directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/utils

# Copy all utils
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/utils/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/utils/ 2>/dev/null || echo "No utils to copy"

# List copied files
echo "Copied utils:"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/utils/ 2>/dev/null || echo "No utils directory"
```

## copy-data

Copy data files to marketing site (for static pages).

```bash
# Create data directory if it doesn't exist
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/marketing-site/src/data

# Copy relevant data files (not all - some are for pdf-app)
cp /Users/aleksejs/Desktop/clientpdf-pro/src/data/faqData.ts \
   /Users/aleksejs/Desktop/Localpdf_v3/marketing-site/src/data/faqData.ts 2>/dev/null || true

cp /Users/aleksejs/Desktop/clientpdf-pro/src/data/seoData.ts \
   /Users/aleksejs/Desktop/Localpdf_v3/marketing-site/src/data/seoData.ts 2>/dev/null || true

cp /Users/aleksejs/Desktop/clientpdf-pro/src/data/toolsData.ts \
   /Users/aleksejs/Desktop/Localpdf_v3/marketing-site/src/data/toolsData.ts 2>/dev/null || true

echo "Copied data files to marketing site"
ls -1 /Users/aleksejs/Desktop/Localpdf_v3/marketing-site/src/data/ 2>/dev/null || echo "No data yet"
```

## migration-quickstart

Run all essential copy operations in sequence (one-time setup).

```bash
echo "=== LocalPDF v3.0 Migration Quickstart ==="
echo ""
echo "This will copy all essential files from clientpdf-pro to Localpdf_v3"
echo ""

# Copy services
echo "[1/6] Copying PDF services..."
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/services
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/services/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/services/

# Copy hooks
echo "[2/6] Copying hooks..."
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/hooks
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/hooks/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/hooks/

# Copy types
echo "[3/6] Copying types..."
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/types
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/types/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/types/

# Copy locales
echo "[4/6] Copying locales..."
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/locales
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/locales/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/locales/

# Copy utils
echo "[5/6] Copying utils..."
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/utils
cp -r /Users/aleksejs/Desktop/clientpdf-pro/src/utils/* \
      /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/utils/ 2>/dev/null || true

# Copy tool pages
echo "[6/6] Copying tool pages..."
mkdir -p /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/pages
cp /Users/aleksejs/Desktop/clientpdf-pro/src/pages/tools/*.tsx \
   /Users/aleksejs/Desktop/Localpdf_v3/pdf-app/src/pages/

echo ""
echo "✅ Migration quickstart complete!"
echo ""
echo "Next steps:"
echo "1. Run: cd /Users/aleksejs/Desktop/Localpdf_v3/pdf-app && npm install"
echo "2. Install PDF libraries (use 'install-pdf-libraries' skill)"
echo "3. Add browser polyfills to pdf-app/src/main.tsx"
echo "4. Test: npm run dev"
```
