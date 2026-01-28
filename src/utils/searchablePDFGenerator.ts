/**
 * Searchable PDF Generator
 *
 * Creates a searchable PDF by overlaying invisible OCR text on top of original page images.
 * Uses Tesseract.js hOCR output and pdf-lib to create PDFs that preserve the original appearance
 * while adding searchable and copyable text.
 */

import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { OCRWorkerManager } from './ocrWorkerManager';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface WordBox {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

interface PageOCRData {
  pageNumber: number;
  words: WordBox[];
  pageWidth: number;
  pageHeight: number;
  imageData: string; // Data URL of the page image
}

/**
 * Parse hOCR output to extract word positions and text
 */
function parseHOCR(hocr: string): WordBox[] {
  const words: WordBox[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(hocr, 'text/html');

  // Find all word elements in hOCR
  const wordElements = doc.querySelectorAll('.ocrx_word');

  wordElements.forEach(wordEl => {
    const title = wordEl.getAttribute('title');
    const text = wordEl.textContent?.trim() || '';

    if (!title || !text) return;

    // Parse bbox from title attribute: "bbox x0 y0 x1 y1; x_wconf confidence"
    const bboxMatch = title.match(/bbox (\d+) (\d+) (\d+) (\d+)/);
    const confMatch = title.match(/x_wconf (\d+)/);

    if (bboxMatch) {
      const [, x0, y0, x1, y1] = bboxMatch.map(Number);
      const confidence = confMatch ? Number(confMatch[1]) : 0;

      words.push({
        text,
        bbox: { x0, y0, x1, y1 },
        confidence
      });
    }
  });

  return words;
}

/**
 * Extract image from PDF page
 */
async function extractImageFromPDF(
  file: File,
  pageNum: number,
  scale: number = 2.0
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await (page as any).render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return {
    canvas,
    width: viewport.width,
    height: viewport.height
  };
}

/**
 * Convert image to base64 data URL
 */
function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Add invisible text layer to PDF page
 */
async function addInvisibleTextLayer(
  page: PDFPage,
  words: WordBox[],
  ocrPageWidth: number,
  ocrPageHeight: number
): Promise<void> {
  const { width: pdfWidth, height: pdfHeight } = page.getSize();
  const font = await page.doc.embedFont(StandardFonts.Helvetica);

  // Calculate scale factors to map OCR coordinates to PDF coordinates
  const scaleX = pdfWidth / ocrPageWidth;
  const scaleY = pdfHeight / ocrPageHeight;

  words.forEach(word => {
    // Convert OCR coordinates (top-left origin) to PDF coordinates (bottom-left origin)
    const x = word.bbox.x0 * scaleX;
    const y = pdfHeight - (word.bbox.y1 * scaleY); // Flip Y axis

    const height = (word.bbox.y1 - word.bbox.y0) * scaleY;

    // Calculate font size to fit the bounding box
    const fontSize = height * 0.85; // Slightly smaller than box height

    try {
      // Draw invisible text (opacity = 0, but still selectable/searchable)
      page.drawText(word.text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity: 0, // Invisible but searchable
      });
    } catch (error) {
      console.warn(`Failed to draw word "${word.text}" at (${x}, ${y}):`, error);
    }
  });
}

/**
 * Create a searchable PDF from an original PDF file
 */
export async function createSearchablePDF(
  file: File,
  language: string,
  pagesToProcess: number[],
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(0, 'Initializing OCR engine...');

  // Get reusable worker from manager
  const worker = await OCRWorkerManager.getWorker(language);

  // Create new PDF document
  const pdfDoc = await PDFDocument.create();

  const pageDataArray: PageOCRData[] = [];


  // Step 1: OCR all pages
  for (let i = 0; i < pagesToProcess.length; i++) {
    const pageNum = pagesToProcess[i];
    const pageProgress = (i / pagesToProcess.length) * 50; // First 50% for OCR

    onProgress?.(pageProgress, `OCR processing page ${pageNum}...`);

    // Extract image from PDF
    const { canvas, width, height } = await extractImageFromPDF(file, pageNum, 2.0);

    // Perform OCR with hOCR output
    const { data } = await worker.recognize(canvas, {}, { hocr: true });

    // Parse hOCR to get word positions
    const words = data.hocr ? parseHOCR(data.hocr) : [];

    pageDataArray.push({
      pageNumber: pageNum,
      words,
      pageWidth: width,
      pageHeight: height,
      imageData: canvasToDataURL(canvas)
    });
  }

  // Step 2: Create PDF with images and invisible text
  for (let i = 0; i < pageDataArray.length; i++) {
    const pageData = pageDataArray[i];
    const pageProgress = 50 + (i / pageDataArray.length) * 40; // Next 40% for PDF creation

    onProgress?.(pageProgress, `Creating searchable page ${pageData.pageNumber}...`);

    // Embed the page image
    const imageBytes = await fetch(pageData.imageData).then(res => res.arrayBuffer());
    const image = await pdfDoc.embedJpg(imageBytes);

    // Create page with same dimensions as image
    const page = pdfDoc.addPage([pageData.pageWidth, pageData.pageHeight]);

    // Draw the image to fill the entire page
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageData.pageWidth,
      height: pageData.pageHeight,
    });

    // Add invisible text layer
    await addInvisibleTextLayer(
      page,
      pageData.words,
      pageData.pageWidth,
      pageData.pageHeight
    );
  }

  onProgress?.(90, 'Finalizing PDF...');

  // Don't terminate worker - let manager handle it for reuse

  // Save PDF
  const pdfBytes = await pdfDoc.save();

  onProgress?.(100, 'Searchable PDF created!');

  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

/**
 * Create a searchable PDF from an image file
 */
export async function createSearchablePDFFromImage(
  file: File,
  language: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(0, 'Initializing OCR engine...');

  // Get reusable worker from manager
  const worker = await OCRWorkerManager.getWorker(language);

  // Load image
  const imageUrl = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  onProgress?.(20, 'Performing OCR...');

  // Create canvas from image
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  // Perform OCR with hOCR output
  const { data } = await worker.recognize(canvas, {}, { hocr: true });

  onProgress?.(60, 'Creating searchable PDF...');

  // Parse hOCR
  const words = data.hocr ? parseHOCR(data.hocr) : [];

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([img.width, img.height]);

  // Embed image
  const imageData = canvas.toDataURL('image/jpeg', 0.95);
  const imageBytes = await fetch(imageData).then(res => res.arrayBuffer());
  const image = await pdfDoc.embedJpg(imageBytes);

  // Draw image
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: img.width,
    height: img.height,
  });

  onProgress?.(80, 'Adding text layer...');

  // Add invisible text layer
  await addInvisibleTextLayer(page, words, img.width, img.height);

  onProgress?.(90, 'Finalizing PDF...');

  // Cleanup URL but not worker
  URL.revokeObjectURL(imageUrl);

  // Save PDF
  const pdfBytes = await pdfDoc.save();

  onProgress?.(100, 'Searchable PDF created!');

  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}
