/**
 * Static PDF.js utilities for ES modules environment
 * Uses static imports to work around dynamic import issues
 */

// Static imports at the top level
import * as pdfjsModule from 'pdfjs-dist';

// Types
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  getMetadata(): Promise<{ info: any }>;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): any;
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
}

// Initialize worker immediately
const initializeWorker = () => {
  try {
    console.log('🔄 Initializing PDF.js with static import...');
    
    // Log what we have in the module
    console.log('📦 PDF.js module keys:', Object.keys(pdfjsModule));
    console.log('📦 PDF.js module:', pdfjsModule);
    
    // Set up worker
    const version = (pdfjsModule as any).version || '3.11.174';
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    
    if ((pdfjsModule as any).GlobalWorkerOptions) {
      (pdfjsModule as any).GlobalWorkerOptions.workerSrc = workerSrc;
      console.log('✅ Worker configured via GlobalWorkerOptions');
    } else {
      console.log('⚠️ GlobalWorkerOptions not available, will use inline worker');
    }
    
    console.log('🎉 PDF.js static initialization complete');
    return true;
  } catch (error) {
    console.error('❌ PDF.js static initialization failed:', error);
    return false;
  }
};

// Initialize immediately
const workerInitialized = initializeWorker();

/**
 * Load PDF document using static import approach
 */
export async function loadPDFDocument(source: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  console.log('📄 Loading PDF document with static import...');
  
  // Check if we have getDocument function
  const getDocument = (pdfjsModule as any).getDocument;
  if (typeof getDocument !== 'function') {
    // Try to find it in default export
    const defaultExport = (pdfjsModule as any).default;
    if (defaultExport && typeof defaultExport.getDocument === 'function') {
      console.log('✅ Found getDocument in default export');
      return loadWithGetDocument(defaultExport.getDocument, source);
    }
    
    // Log available functions to debug
    console.error('❌ getDocument not found. Available functions:', 
      Object.keys(pdfjsModule).filter(key => typeof (pdfjsModule as any)[key] === 'function')
    );
    
    throw new Error('getDocument function not available in static import');
  }
  
  console.log('✅ Found getDocument in direct export');
  return loadWithGetDocument(getDocument, source);
}

async function loadWithGetDocument(getDocument: Function, source: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  const version = (pdfjsModule as any).version || '3.11.174';
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
  
  // Try with worker configuration
  try {
    const loadingTask = getDocument({
      data: source,
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: false,
      useSystemFonts: true,
      workerSrc: workerSrc
    });
    
    return await loadingTask.promise;
  } catch (error) {
    console.warn('⚠️ Failed with worker config, trying without:', error);
    
    // Fallback without worker config
    const loadingTask = getDocument({
      data: source,
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: false,
      useSystemFonts: true
    });
    
    return await loadingTask.promise;
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
 * Generate thumbnails using static import
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
    console.log('📄 Starting PDF thumbnail generation with static import...');
    
    const arrayBuffer = await fileToArrayBuffer(file);
    console.log('📄 File read, loading PDF document...');
    
    const pdf = await loadPDFDocument(arrayBuffer);
    console.log(`📄 PDF loaded successfully: ${pdf.numPages} pages`);
    
    const thumbnails: Array<{ pageNumber: number; thumbnail: string }> = [];
    const totalPages = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= totalPages; i++) {
      try {
        console.log(`📄 Rendering page ${i}/${totalPages}...`);
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
        thumbnails.push({
          pageNumber: i,
          thumbnail: ''
        });
      }
    }
    
    console.log(`✅ Successfully generated ${thumbnails.length} thumbnails`);
    return thumbnails;
  } catch (error) {
    console.error('❌ Error generating PDF thumbnails with static import:', error);
    throw error;
  }
}

/**
 * Validate PDF file using static import
 */
export async function validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('🔍 Validating PDF file with static import...');
    
    // Check file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File is not a PDF' };
    }
    
    const arrayBuffer = await fileToArrayBuffer(file);
    const pdf = await loadPDFDocument(arrayBuffer);
    
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
  
  if (message.includes('getdocument') || message.includes('not a function') || message.includes('not available')) {
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