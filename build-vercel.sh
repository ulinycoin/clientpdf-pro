#!/bin/bash

# Build script for Vercel deployment
# This script builds both app-spa and website, then merges them

set -e  # Exit on error

echo "🚀 Building LocalPDF v3 for Vercel"
echo "===================================="
echo ""

# Step 1: Build app-spa (React)
echo "📦 Step 1/3: Building app-spa..."
npm run build
echo "✅ App-spa built successfully"
echo ""

# Step 2: Build website (Astro)
echo "📦 Step 2/3: Building website..."
npm run build:web
echo "✅ Website built successfully"
echo ""

# Step 3: Merge builds
echo "📦 Step 3/3: Merging builds..."

# Copy website files into dist, preserving app-spa files
# This ensures SEO pages are at root while keeping app-spa at /
rsync -av --ignore-existing website/dist/ dist/

# Copy specific files that should be overridden
cp -f website/dist/robots.txt dist/robots.txt 2>/dev/null || true
cp -f website/dist/sitemap.xml dist/sitemap.xml 2>/dev/null || true
cp -f website/dist/manifest.json dist/manifest.json 2>/dev/null || true

# Copy website public files
if [ -d "website/public" ]; then
    cp -r website/public/* dist/ 2>/dev/null || true
fi

echo "✅ Builds merged successfully"
echo ""

# Step 4: Verify structure
echo "📋 Deployment structure:"
echo "========================"
ls -1 dist/ | head -20
echo ""

echo "✅ Build completed successfully!"
echo ""
echo "Output directory: dist/"
echo "Ready for deployment to Vercel 🎉"
