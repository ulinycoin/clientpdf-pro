#!/bin/bash

echo "🚀 ClientPDF Pro - Quick Start Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check for TypeScript errors
echo ""
echo "🔍 Checking TypeScript..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed!"
else
    echo "❌ TypeScript errors found. Please fix them before running."
    exit 1
fi

# Start development server
echo ""
echo "🚀 Starting development server..."
echo "📱 Opening http://localhost:5173"
echo "🎯 Look for 'Add Text' tool to test modular AddTextTool"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================"

npm run dev