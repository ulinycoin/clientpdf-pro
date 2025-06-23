/**
 * CDN-based PDF.js utilities
 * Uses PDF.js directly from CDN to bypass npm package issues
 */

// Global PDF.js interface
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

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

let pdfJSInitialized = false;
let pdfJSInitializing = false;

/**
 * Load PDF.js from CDN
 */
async function loadPDFJSFromCDN(): Promise<any> {
  if (pdfJSInitialized && window.pdfjsLib) {
    return window.pdfjsLib;
  }

  if (pdfJSInitializing) {
    // Wait for ongoing initialization
    while (pdfJSInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return window.pdfjsLib;
  }

  pdfJSInitializing = true;

  try {
    console.log('🔄 Loading PDF.js from CDN...');

    // Load PDF.js script from CDN
    const pdfJSVersion = '3.11.174';
    const scriptUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJSVersion}/pdf.min.js`;
    
    await new Promise<void>((resolve, reject) => {
      // Check if already loaded
      if (window.pdfjsLib) {
        console.log('✅ PDF.js already loaded from previous CDN load');
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      
      script.onload = () => {
        console.log('✅ PDF.js script loaded from CDN');
        
        // Wait a bit for the global to be available
        const checkGlobal = () => {
          if (window.pdfjsLib) {
            console.log('✅ window.pdfjsLib is available');
            resolve();
          } else {
            console.log('⏳ Waiting for window.pdfjsLib...');
            setTimeout(checkGlobal, 100);
          }
        };
        
        checkGlobal();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load PDF.js from CDN');
        reject(new Error('Failed to load PDF.js from CDN'));
      };

      // Add to document
      document.head.appendChild(script);
    });

    // Configure worker
    const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJSVersion}/pdf.worker.min.js`;
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      console.log('✅ PDF.js worker configured:', workerUrl);
    } else {
      console.warn('⚠️ GlobalWorkerOptions not available, will use inline worker');
    }

    pdfJSInitialized = true;
    pdfJSInitializing = false;
    
    console.log('🎉 PDF.js CDN initialization complete');
    console.log('📦 Available functions:', Object.keys(window.pdfjsLib));
    
    return window.pdfjsLib;

  } catch (error) {
    pdfJSInitializing = false;
    console.error('❌ PDF.js CDN initialization failed:', error);
    throw error;
  }
}

/**
 * Load PDF document using CDN PDF.js
 */
export async function loadPDFDocument(source: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjsLib = await loadPDFJSFromCDN();
  
  if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
    throw new Error('PDF.js not properly loaded from CDN');
  }

  console.log('📄 Loading PDF document with CDN PDF.js...');

  // Try with GlobalWorkerOptions first
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: source,
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: false,
      useSystemFonts: true
    });
    
    return await loadingTask.promise;
  } catch (error) {
    console.warn('⚠️ Failed with GlobalWorkerOptions, trying inline worker:', error);
    
    // Fallback with inline worker
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const loadingTask = pdfjsLib.getDocument({
      data: source,
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: false,
      useSystemFonts: true,
      workerSrc: workerUrl
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
 * Generate thumbnails using CDN PDF.js
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
    console.log('📄 Starting PDF thumbnail generation with CDN PDF.js...');
    
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
    
    console.log(`✅ Successfully generated ${thumbnails.length} thumbnails using CDN`);
    return thumbnails;
  } catch (error) {
    console.error('❌ Error generating PDF thumbnails with CDN:', error);
    throw error;
  }
}

/**
 * Validate PDF file using CDN PDF.js
 */
export async function validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('🔍 Validating PDF file with CDN PDF.js...');
    
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
  
  if (message.includes('not properly loaded') || message.includes('getdocument') || message.includes('not a function')) {
    return 'PDF library failed to load from CDN. Please check your internet connection and try again';
  }
  
  if (message.includes('network') || message.includes('failed to fetch') || message.includes('failed to load')) {
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