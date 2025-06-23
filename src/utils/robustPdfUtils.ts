/**
 * Robust PDF.js utilities optimized for Vite + TypeScript
 * Uses the working approach from simplePdfUtils as the primary method
 */

// Type definitions for better TypeScript support
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  getMetadata(): Promise<{ info: any }>;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): any;
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
}

interface PDFJSModule {
  getDocument: (params: any) => { promise: Promise<PDFDocumentProxy> };
  version?: string;
  GlobalWorkerOptions?: { workerSrc?: string };
}

let pdfJSModule: PDFJSModule | null = null;
let initializationAttempted = false;

/**
 * Vite-optimized PDF.js initialization using the proven working method
 */
async function initializePDFJSRobust(): Promise<PDFJSModule> {
  if (pdfJSModule && initializationAttempted) {
    return pdfJSModule;
  }

  initializationAttempted = true;

  try {
    console.log('🔄 Initializing PDF.js (Vite-optimized approach)...');
    
    // Import the module using the approach that works in your environment
    const importedModule = await import('pdfjs-dist');
    
    // Based on your debug results, use the pattern that works
    let pdfjsLib: any = null;
    
    // The working pattern from simplePdfUtils
    pdfjsLib = importedModule.default || importedModule;
    
    // If still no getDocument, try alternative patterns
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
      pdfjsLib = (importedModule as any).pdfjsLib || importedModule;
    }
    
    // Final validation
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
      // Log detailed debug info
      console.error('❌ Available properties:', Object.keys(importedModule));
      console.error('❌ Default export:', importedModule.default ? Object.keys(importedModule.default) : 'none');
      throw new Error('PDF.js getDocument function not accessible');
    }

    console.log('✅ PDF.js getDocument found');

    // Don't rely on GlobalWorkerOptions - use inline worker approach
    const version = pdfjsLib.version || '3.11.174';
    console.log(`✅ PDF.js version: ${version}`);

    pdfJSModule = pdfjsLib;
    console.log('🎉 PDF.js initialization complete (using inline worker approach)');
    return pdfjsLib;

  } catch (error) {
    console.error('❌ PDF.js initialization failed:', error);
    throw new Error(`Failed to initialize PDF.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load a PDF document using inline worker (the proven working approach)
 */
export async function loadPDFDocument(source: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjsLib = await initializePDFJSRobust();
  
  const version = pdfjsLib.version || '3.11.174';
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

  // Use the approach that works - inline worker specification
  return pdfjsLib.getDocument({
    data: source,
    verbosity: 0,
    isEvalSupported: false,
    disableFontFace: false,
    useSystemFonts: true,
    // Always specify worker inline (this is what works in your environment)
    workerSrc: workerSrc
  }).promise;
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
 * Render a PDF page to canvas
 */
export async function renderPDFPage(page: PDFPageProxy, scale: number = 1.0): Promise<string> {
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
  
  try {
    console.log('📄 Starting PDF thumbnail generation...');
    const arrayBuffer = await fileToArrayBuffer(file);
    console.log('📄 File read, loading PDF document...');
    const pdf = await loadPDFDocument(arrayBuffer);
    console.log(`📄 PDF loaded, ${pdf.numPages} pages found`);
    
    const thumbnails: Array<{ pageNumber: number; thumbnail: string }> = [];
    const totalPages = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= totalPages; i++) {
      try {
        console.log(`📄 Rendering page ${i}...`);
        const page = await pdf.getPage(i);
        const thumbnail = await renderPDFPage(page, scale);
        
        thumbnails.push({
          pageNumber: i,
          thumbnail
        });
        
        if (onProgress) {
          onProgress(i, totalPages);
        }
      } catch (pageError) {
        console.warn(`⚠️ Failed to generate thumbnail for page ${i}:`, pageError);
        // Add placeholder for failed pages
        thumbnails.push({
          pageNumber: i,
          thumbnail: ''
        });
      }
    }
    
    console.log(`✅ Generated ${thumbnails.length} thumbnails`);
    return thumbnails;
  } catch (error) {
    console.error('❌ Error generating PDF thumbnails:', error);
    throw error;
  }
}

/**
 * Validate PDF file
 */
export async function validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('🔍 Validating PDF file...');
    
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
    
    console.log(`✅ PDF validation successful: ${pdf.numPages} pages`);
    return { valid: true };
  } catch (error) {
    console.error('❌ PDF validation failed:', error);
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
  
  if (message.includes('invalid pdf') || message.includes('not a pdf')) {
    return 'This file appears to be corrupted or not a valid PDF';
  }
  
  if (message.includes('worker')) {
    return 'PDF worker failed to load. Please check your internet connection';
  }
  
  if (message.includes('getdocument') || message.includes('not a function')) {
    return 'PDF library loading failed. Please refresh the page and try again';
  }
  
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection';
  }
  
  if (message.includes('memory') || message.includes('out of memory')) {
    return 'Not enough memory to process this PDF. Try with a smaller file';
  }
  
  if (message.includes('password') || message.includes('encrypted')) {
    return 'This PDF is password protected. Please unlock it first';
  }
  
  if (message.includes('timeout')) {
    return 'PDF loading timed out. Please try again with a smaller file';
  }
  
  return `Error: ${error.message}`;
}