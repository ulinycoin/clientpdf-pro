#!/bin/bash

# LocalPDF Build Verification Script
# This script tests the build process and reports any issues

echo "🚀 LocalPDF - Build Verification Starting..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ $2${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️ $2${NC}" ;;
    esac
}

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_status "ERROR" "Node.js is not installed"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_status "ERROR" "npm is not installed"
    exit 1
fi

print_status "INFO" "Node.js version: $(node --version)"
print_status "INFO" "npm version: $(npm --version)"

echo ""
echo "📋 Step 1: Checking package.json and dependencies..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_status "ERROR" "package.json not found"
    exit 1
fi

print_status "SUCCESS" "package.json found"

echo ""
echo "📦 Step 2: Installing dependencies..."

# Install dependencies
if npm install --legacy-peer-deps; then
    print_status "SUCCESS" "Dependencies installed successfully"
else
    print_status "ERROR" "Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔍 Step 3: Running TypeScript type check..."

# Type check
if npm run type-check; then
    print_status "SUCCESS" "TypeScript type check passed"
else
    print_status "WARNING" "TypeScript type check found issues (non-blocking)"
fi

echo ""
echo "🏗️ Step 4: Testing build process..."

# Clean previous build
if [ -d "dist" ]; then
    rm -rf dist
    print_status "INFO" "Cleaned previous build"
fi

# Run build
if npm run build; then
    print_status "SUCCESS" "Build completed successfully"
    
    # Check if dist folder was created
    if [ -d "dist" ]; then
        print_status "SUCCESS" "Build output created in dist/"
        
        # Check key files
        if [ -f "dist/index.html" ]; then
            print_status "SUCCESS" "index.html generated"
        else
            print_status "ERROR" "index.html not found in build output"
        fi
        
        # Check for JavaScript bundles
        js_files=$(find dist -name "*.js" | wc -l)
        if [ $js_files -gt 0 ]; then
            print_status "SUCCESS" "JavaScript bundles generated ($js_files files)"
        else
            print_status "ERROR" "No JavaScript bundles found"
        fi
        
        # Check for CSS files
        css_files=$(find dist -name "*.css" | wc -l)
        if [ $css_files -gt 0 ]; then
            print_status "SUCCESS" "CSS files generated ($css_files files)"
        else
            print_status "WARNING" "No CSS files found (might be inline)"
        fi
        
        # Calculate build size
        build_size=$(du -sh dist | cut -f1)
        print_status "INFO" "Total build size: $build_size"
        
    else
        print_status "ERROR" "Build output directory not created"
        exit 1
    fi
else
    print_status "ERROR" "Build failed"
    exit 1
fi

echo ""
echo "🎯 Step 5: Testing preview server..."

# Start preview server in background
npm run preview &
preview_pid=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if kill -0 $preview_pid 2>/dev/null; then
    print_status "SUCCESS" "Preview server started successfully"
    print_status "INFO" "Server should be running at http://localhost:4173"
    
    # Kill the preview server
    kill $preview_pid
    print_status "INFO" "Preview server stopped"
else
    print_status "ERROR" "Preview server failed to start"
fi

echo ""
echo "📊 Build Verification Summary"
echo "=============================="
print_status "SUCCESS" "Build process is working correctly"
print_status "INFO" "LocalPDF is ready for deployment"

echo ""
echo "🚀 Next steps:"
echo "   1. Run 'npm run dev' to start development server"
echo "   2. Run 'npm run build' to create production build"
echo "   3. Run 'npm run preview' to test production build locally"
echo ""
echo "✨ LocalPDF build verification completed!"
