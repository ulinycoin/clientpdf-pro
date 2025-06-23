/**
 * PDF.js Utility Functions
 * Handles proper initialization and configuration of PDF.js library
 */

import type * as pdfjsLib from 'pdfjs-dist';

let pdfJSInitialized = false;
let pdfJSLib: typeof pdfjsLib | null = null;

/**
 * Initialize PDF.js library with proper worker configuration
 * This should be called before any PDF operations
 */
export async function initializePDFJS(): Promise<typeof pdfjsLib> {
  if (pdfJSInitialized && pdfJSLib) {
    return pdfJSLib;
  }

  try {
    // Dynamically import PDF.js
    pdfJSLib = await import('pdfjs-dist');
    
    // Wait a bit for the module to fully initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try multiple approaches to ensure GlobalWorkerOptions is available
    let globalWorkerOptions = pdfJSLib.GlobalWorkerOptions;
    
    if (!globalWorkerOptions) {
      // Alternative access patterns for different build environments
      globalWorkerOptions = (pdfJSLib as any)?.default?.GlobalWorkerOptions;
    }
    
    if (!globalWorkerOptions) {
      // Last resort: try to access via window object (for some bundlers)
      globalWorkerOptions = (window as any)?.pdfjsLib?.GlobalWorkerOptions;
    }
    
    if (!globalWorkerOptions) {
      console.warn('GlobalWorkerOptions not found, attempting manual setup...');
      // Create a minimal GlobalWorkerOptions if not available
      if (!pdfJSLib.GlobalWorkerOptions) {
        (pdfJSLib as any).GlobalWorkerOptions = {};
      }
      globalWorkerOptions = pdfJSLib.GlobalWorkerOptions;
    }

    // Set worker source with fallback for different environments
    const pdfjsVersion = pdfJSLib.version || '3.11.174';
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

    // Only set if not already set
    if (!globalWorkerOptions.workerSrc) {
      globalWorkerOptions.workerSrc = workerSrc;
      console.log('PDF.js worker configured:', workerSrc);
    }

    pdfJSInitialized = true;
    return pdfJSLib;
  } catch (error) {
    console.error('Failed to initialize PDF.js:', error);
    throw new Error(`PDF.js initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load a PDF document with proper error handling
 */
export async function loadPDFDocument(source: ArrayBuffer | Uint8Array | string): Promise<pdfjsLib.PDFDocumentProxy> {
  const pdfjsLib = await initializePDFJS();
  
  return pdfjsLib.getDocument({
    data: source,
    verbosity: 0, // Reduce console output
    isEvalSupported: false,
    disableFontFace: false,
    useSystemFonts: true,
    // Additional options for better compatibility
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  }).promise;
}

/**
 * Render a PDF page to canvas with proper error handling
 */
export async function renderPDFPage(
  page: pdfjsLib.PDFPageProxy,
  scale: number = 1.0
): Promise<string> {
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Cannot get canvas 2D context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Convert File to ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get PDF metadata and page count
 */
export async function getPDFInfo(file: File): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const pdf = await loadPDFDocument(arrayBuffer);
  
  const metadata = await pdf.getMetadata();
  
  return {
    pageCount: pdf.numPages,
    title: metadata.info?.Title || undefined,
    author: metadata.info?.Author || undefined,
    subject: metadata.info?.Subject || undefined,
    creator: metadata.info?.Creator || undefined,
    producer: metadata.info?.Producer || undefined,
    creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
    modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined,
  };
}

/**
 * Generate thumbnails for PDF pages
 */
export async function generatePDFThumbnails(
  file: File,
  options: {
    scale?: number;
    maxPages?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<Array<{ pageNumber: number; thumbnail: string }>> {
  const { scale = 0.3, maxPages = Infinity, onProgress } = options;
  
  const arrayBuffer = await fileToArrayBuffer(file);
  const pdf = await loadPDFDocument(arrayBuffer);
  
  const thumbnails: Array<{ pageNumber: number; thumbnail: string }> = [];
  const totalPages = Math.min(pdf.numPages, maxPages);
  
  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const thumbnail = await renderPDFPage(page, scale);
      
      thumbnails.push({
        pageNumber: i,
        thumbnail
      });
      
      if (onProgress) {
        onProgress(i, totalPages);
      }
    } catch (error) {
      console.warn(`Failed to generate thumbnail for page ${i}:`, error);
      // Add placeholder for failed pages
      thumbnails.push({
        pageNumber: i,
        thumbnail: ''
      });
    }
  }
  
  return thumbnails;
}

/**
 * Check if a file is a valid PDF
 */
export async function validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File is not a PDF' };
    }
    
    // Try to load the PDF
    const arrayBuffer = await fileToArrayBuffer(file);
    const pdf = await loadPDFDocument(arrayBuffer);
    
    // Check if it has pages
    if (pdf.numPages === 0) {
      return { valid: false, error: 'PDF has no pages' };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid PDF file'
    };
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get user-friendly error message for PDF operations
 */
export function getPDFErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unknown error occurred';
  }
  
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid pdf')) {
    return 'This file appears to be corrupted or not a valid PDF';
  }
  
  if (message.includes('worker')) {
    return 'PDF worker failed to load. Please check your internet connection';
  }
  
  if (message.includes('globalworkeroptions')) {
    return 'PDF viewer initialization failed. Please try refreshing the page';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your internet connection';
  }
  
  if (message.includes('memory')) {
    return 'Not enough memory to process this PDF. Try with a smaller file';
  }
  
  if (message.includes('password') || message.includes('encrypted')) {
    return 'This PDF is password protected. Please unlock it first';
  }
  
  return `Error: ${error.message}`;
}