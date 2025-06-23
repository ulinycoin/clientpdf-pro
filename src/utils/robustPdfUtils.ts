/**
 * Robust PDF.js utilities with multiple compatibility approaches
 * Handles various PDF.js import patterns across different build systems
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
 * Robust PDF.js initialization with multiple fallback strategies
 */
async function initializePDFJSRobust(): Promise<PDFJSModule> {
  if (pdfJSModule && initializationAttempted) {
    return pdfJSModule;
  }

  initializationAttempted = true;

  try {
    console.log('🔄 Initializing PDF.js...');
    
    // Import the module
    const importedModule = await import('pdfjs-dist');
    
    // Try multiple access patterns to find getDocument
    let pdfjsLib: any = null;
    
    // Pattern 1: Direct access
    if (typeof importedModule.getDocument === 'function') {
      pdfjsLib = importedModule;
      console.log('✅ PDF.js found via direct access');
    }
    // Pattern 2: Default export
    else if (importedModule.default && typeof importedModule.default.getDocument === 'function') {
      pdfjsLib = importedModule.default;
      console.log('✅ PDF.js found via default export');
    }
    // Pattern 3: Named export
    else if ((importedModule as any).pdfjsLib && typeof (importedModule as any).pdfjsLib.getDocument === 'function') {
      pdfjsLib = (importedModule as any).pdfjsLib;
      console.log('✅ PDF.js found via named export');
    }
    // Pattern 4: Nested in default
    else if (importedModule.default && (importedModule.default as any).pdfjsLib) {
      pdfjsLib = (importedModule.default as any).pdfjsLib;
      console.log('✅ PDF.js found via nested default');
    }
    
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
      // Log available properties for debugging
      console.error('❌ PDF.js getDocument not found. Available properties:', Object.keys(importedModule));
      throw new Error('PDF.js getDocument function not found in any export pattern');
    }

    // Set up worker (optional, will use inline if this fails)
    try {
      const version = pdfjsLib.version || '3.11.174';
      const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        console.log('✅ PDF.js worker configured:', workerSrc);
      } else {
        console.warn('⚠️ GlobalWorkerOptions not available, will use inline worker');
      }
    } catch (workerError) {
      console.warn('⚠️ Worker setup failed, will use inline worker:', workerError);
    }

    pdfJSModule = pdfjsLib;
    console.log('🎉 PDF.js initialization complete');
    return pdfjsLib;

  } catch (error) {
    console.error('❌ PDF.js initialization failed:', error);
    throw new Error(`Failed to initialize PDF.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load a PDF document with automatic worker fallback
 */
export async function loadPDFDocument(source: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjsLib = await initializePDFJSRobust();
  
  const version = pdfjsLib.version || '3.11.174';
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

  // Try with GlobalWorkerOptions first, then fallback to inline worker
  try {
    return await pdfjsLib.getDocument({
      data: source,
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: false,
      useSystemFonts: true
    }).promise;
  } catch (workerError) {
    console.warn('⚠️ PDF loading with GlobalWorkerOptions failed, trying inline worker:', workerError);
    
    // Fallback: use inline worker
    return await pdfjsLib.getDocument({
      data: source,
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: false,
      useSystemFonts: true,
      workerSrc: workerSrc
    }).promise;
  }
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
      } catch (pageError) {
        console.warn(`⚠️ Failed to generate thumbnail for page ${i}:`, pageError);
        // Add placeholder for failed pages
        thumbnails.push({
          pageNumber: i,
          thumbnail: ''
        });
      }
    }
    
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