#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const distPath = 'dist';
const baseUrl = 'http://localhost:4173'; // Vite preview server

const routes = [
  { path: '/', title: 'LocalPDF - Free Privacy-First PDF Tools | Merge, Split, Compress PDFs Online' },
  { path: '/merge-pdf', title: 'Merge PDF Files Free - Combine Multiple PDFs Online | LocalPDF' },
  { path: '/split-pdf', title: 'Split PDF Files Free - Extract Pages from PDF Online | LocalPDF' },
  { path: '/compress-pdf', title: 'Compress PDF Files Free - Reduce PDF Size Online | LocalPDF' },
  { path: '/add-text-pdf', title: 'Add Text to PDF Free - Insert Text in PDF Online | LocalPDF' },
  { path: '/watermark-pdf', title: 'Add Watermark to PDF Free - PDF Watermark Tool Online | LocalPDF' },
  { path: '/rotate-pdf', title: 'Rotate PDF Pages Free - Fix PDF Orientation Online | LocalPDF' },
  { path: '/extract-pages-pdf', title: 'Extract PDF Pages Free - Get Specific Pages from PDF | LocalPDF' },
  { path: '/extract-text-pdf', title: 'Extract Text from PDF Free - PDF Text Extractor Online | LocalPDF' },
  { path: '/pdf-to-image', title: 'Convert PDF to Images Free - PDF to JPG/PNG Converter | LocalPDF' },
  { path: '/images-to-pdf', title: 'Images to PDF Converter Free - JPG/PNG to PDF Online | LocalPDF' },
  { path: '/word-to-pdf', title: 'Word to PDF Converter Free - DOCX to PDF Online | LocalPDF' },
  { path: '/ocr-pdf', title: 'OCR PDF Text Recognition Free - Extract Text from PDF & Images | LocalPDF' }
];

async function prerenderRoutes() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log('🚀 Starting pre-rendering process...');

  for (const route of routes) {
    try {
      console.log(`📄 Pre-rendering: ${route.path}`);

      await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for React to render
      await page.waitForSelector('#root', { timeout: 10000 });

      // Get the rendered HTML
      const html = await page.content();

      // Create file path
      const fileName = route.path === '/' ? 'index.html' : `${route.path.slice(1)}.html`;
      const filePath = path.join(distPath, fileName);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Update title and meta description
      const updatedHtml = html
        .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
        .replace(/(<meta name="description" content=")[^"]*(")/,
          `$1${getDescriptionForRoute(route.path)}$2`);

      fs.writeFileSync(filePath, updatedHtml);
      console.log(`✅ Generated: ${fileName}`);

    } catch (error) {
      console.error(`❌ Error pre-rendering ${route.path}:`, error.message);
    }
  }

  await browser.close();
  console.log('🎉 Pre-rendering completed!');
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
    '/ocr-pdf': 'Extract text from PDF files and images using advanced OCR technology. Support for 10+ languages including enhanced Russian recognition. 100% private OCR processing.'
  };

  return descriptions[path] || descriptions['/'];
}

// Check if preview server is running, if not, start it
prerenderRoutes().catch(console.error);
