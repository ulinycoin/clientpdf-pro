#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const distPath = 'dist';
const port = 4174; // Different port to avoid conflicts

const routes = [
  { path: '/', fileName: 'index.html', title: 'LocalPDF - Free Privacy-First PDF Tools | Merge, Split, Compress PDFs Online' },
  { path: '/merge-pdf', fileName: 'merge-pdf.html', title: 'Merge PDF Files Free - Combine Multiple PDFs Online | LocalPDF' },
  { path: '/split-pdf', fileName: 'split-pdf.html', title: 'Split PDF Files Free - Extract Pages from PDF Online | LocalPDF' },
  { path: '/compress-pdf', fileName: 'compress-pdf.html', title: 'Compress PDF Files Free - Reduce PDF Size Online | LocalPDF' },
  { path: '/add-text-pdf', fileName: 'add-text-pdf.html', title: 'Add Text to PDF Free - Insert Text in PDF Online | LocalPDF' },
  { path: '/watermark-pdf', fileName: 'watermark-pdf.html', title: 'Add Watermark to PDF Free - PDF Watermark Tool Online | LocalPDF' },
  { path: '/rotate-pdf', fileName: 'rotate-pdf.html', title: 'Rotate PDF Pages Free - Fix PDF Orientation Online | LocalPDF' },
  { path: '/extract-pages-pdf', fileName: 'extract-pages-pdf.html', title: 'Extract PDF Pages Free - Get Specific Pages from PDF | LocalPDF' },
  { path: '/extract-text-pdf', fileName: 'extract-text-pdf.html', title: 'Extract Text from PDF Free - PDF Text Extractor Online | LocalPDF' },
  { path: '/pdf-to-image', fileName: 'pdf-to-image.html', title: 'Convert PDF to Images Free - PDF to JPG/PNG Converter | LocalPDF' },
  { path: '/images-to-pdf', fileName: 'images-to-pdf.html', title: 'Images to PDF Converter Free - JPG/PNG to PDF Online | LocalPDF' },
  { path: '/word-to-pdf', fileName: 'word-to-pdf.html', title: 'Word to PDF Converter Free - DOCX to PDF Online | LocalPDF' },
  { path: '/excel-to-pdf', fileName: 'excel-to-pdf.html', title: 'Excel to PDF Converter Free - XLSX to PDF Online | LocalPDF' },
  { path: '/ocr-pdf', fileName: 'ocr-pdf.html', title: 'OCR PDF Text Recognition Free - Extract Text from PDF & Images | LocalPDF' },
  { path: '/privacy', fileName: 'privacy.html', title: 'Privacy Policy - LocalPDF | 100% Private PDF Processing' },
  { path: '/faq', fileName: 'faq.html', title: 'FAQ - Frequently Asked Questions | LocalPDF' }
];

async function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting preview server...');
    const server = spawn('npx', ['vite', 'preview', '--port', port.toString()], {
      stdio: 'pipe'
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes(`localhost:${port}`)) {
        console.log(`✅ Server running on http://localhost:${port}`);
        setTimeout(() => resolve(server), 2000); // Wait 2 seconds for full startup
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    server.on('error', (error) => {
      console.error(`Failed to start server: ${error}`);
      reject(error);
    });

    // Timeout fallback
    setTimeout(() => resolve(server), 5000);
  });
}

async function prerenderRoutes() {
  let server;

  try {
    // Start preview server
    server = await startPreviewServer();

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('📄 Starting pre-rendering process...');

    for (const route of routes) {
      try {
        console.log(`🔄 Pre-rendering: ${route.path}`);

        const url = `http://localhost:${port}${route.path}`;
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Wait for React to render and SEO components to load
        await page.waitForSelector('#root > *', { timeout: 10000 });

        // Wait a bit more for dynamic content
        await page.waitForTimeout(2000);

        // Get the rendered HTML
        const html = await page.content();

        // Create file path
        const filePath = path.join(distPath, route.fileName);

        // Update title and ensure proper meta tags
        const updatedHtml = html
          .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/,
            `$1${getDescriptionForRoute(route.path)}$2`);

        fs.writeFileSync(filePath, updatedHtml);
        console.log(`✅ Generated: ${route.fileName}`);

      } catch (error) {
        console.error(`❌ Error pre-rendering ${route.path}:`, error.message);

        // Create fallback HTML
        const fallbackHtml = createFallbackHTML(route);
        const filePath = path.join(distPath, route.fileName);
        fs.writeFileSync(filePath, fallbackHtml);
        console.log(`⚠️  Created fallback: ${route.fileName}`);
      }
    }

    await browser.close();
    console.log('🎉 Pre-rendering completed!');

  } catch (error) {
    console.error('💥 Pre-rendering failed:', error);
  } finally {
    // Kill the server
    if (server) {
      server.kill();
      console.log('🛑 Preview server stopped');
    }
  }
}

function createFallbackHTML(route) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${route.title}</title>
  <meta name="description" content="${getDescriptionForRoute(route.path)}">
  <link rel="canonical" href="https://localpdf.online${route.path}">
  <meta name="robots" content="index,follow">
</head>
<body>
  <div id="root">
    <noscript>
      <h1>${route.title.split(' | ')[0]}</h1>
      <p>${getDescriptionForRoute(route.path)}</p>
      <p>This tool requires JavaScript to function. Please enable JavaScript in your browser.</p>
    </noscript>
  </div>
  <script>window.location.href = 'https://localpdf.online${route.path}';</script>
</body>
</html>`;
}

function getDescriptionForRoute(path) {
  const descriptions = {
    '/': '13 powerful PDF tools that work entirely in your browser. Merge, split, compress, add text, watermark, OCR, convert Excel to PDF. 100% private - no uploads, no tracking. Free forever.',
    '/merge-pdf': 'Merge multiple PDF files into one document for free. Fast, secure, and private PDF merging in your browser. No uploads, no registration required.',
    '/split-pdf': 'Split PDF files by pages or ranges for free. Extract specific pages from PDF documents. Private and secure PDF splitting in your browser.',
    '/compress-pdf': 'Compress PDF files to reduce size without losing quality. Free PDF compression tool that works in your browser. No file uploads required.',
    '/add-text-pdf': 'Add custom text to PDF files for free. Insert text, signatures, and annotations. Privacy-first PDF text editor that works in your browser.',
    '/watermark-pdf': 'Add text or image watermarks to PDF files for free. Protect your documents with custom watermarks. Secure PDF watermarking in your browser.',
    '/rotate-pdf': 'Rotate PDF pages 90°, 180°, or 270° for free. Fix document orientation quickly. Private PDF rotation tool that works in your browser.',
    '/extract-pages-pdf': 'Extract specific pages from PDF documents for free. Create new PDFs from selected pages. Fast page extraction in your browser.',
    '/extract-text-pdf': 'Extract text content from PDF files for free. Get plain text from PDF documents. Fast text extraction in your browser without uploads.',
    '/pdf-to-image': 'Convert PDF pages to images for free. Export PDF as JPG, PNG, or WEBP. High-quality PDF to image conversion in your browser.',
    '/images-to-pdf': 'Convert multiple images to PDF for free. Combine JPG, PNG, GIF, WebP images into one PDF document. Privacy-first image to PDF converter in your browser.',
    '/word-to-pdf': 'Convert Word documents to PDF for free. Transform DOCX files to PDF format instantly. Privacy-first Word to PDF conversion in your browser.',
    '/excel-to-pdf': 'Convert Excel files (.xlsx, .xls) to PDF format for free. Support for multiple sheets, wide tables, and international languages. Private conversion in your browser.',
    '/ocr-pdf': 'Extract text from PDF files and images using advanced OCR technology. Support for 10+ languages including enhanced Russian recognition. 100% private OCR processing.',
    '/privacy': 'LocalPDF privacy policy. Learn how we protect your privacy with 100% local PDF processing. No uploads, no tracking, no data collection.',
    '/faq': 'Get answers to common questions about LocalPDF. Learn about our privacy-first PDF tools, browser compatibility, and how to use our features.'
  };

  return descriptions[path] || descriptions['/'];
}

prerenderRoutes().catch(console.error);
