/**
 * Working PDF.js utilities - exact copy of the proven working approach
 * This matches the simplePdfUtils pattern that works in your environment
 */

// Type definitions
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  getMetadata(): Promise<{ info: any }>;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): any;
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
}

let pdfjsModule: any = null;

/**
 * PDF.js initialization using the EXACT pattern from working simplePdfUtils
 */
async function initWorkingPDFJS(): Promise<any> {
  if (pdfjsModule) {
    return pdfjsModule;
  }

  try {
    console.log('🔄 Using WORKING PDF.js initialization pattern...');
    
    // Import PDF.js with EXACT same pattern as simplePdfUtils
    const importedModule = await import('pdfjs-dist');
    
    // Handle different module export patterns - EXACT copy from simplePdfUtils
    pdfjsModule = importedModule.default || importedModule;
    
    // Ensure we have the getDocument function - EXACT copy from simplePdfUtils
    if (!pdfjsModule || typeof pdfjsModule.getDocument !== 'function') {
      // Try alternative access patterns - EXACT copy from simplePdfUtils
      pdfjsModule = (importedModule as any).pdfjsLib || importedModule;
      
      if (!pdfjsModule || typeof pdfjsModule.getDocument !== 'function') {
        throw new Error('PDF.js getDocument function not found in working utils');
      }
    }
    
    console.log('✅ PDF.js loaded successfully (working pattern)');
    
    return pdfjsModule;
  } catch (error) {
    console.error('❌ Failed to load PDF.js (working pattern):', error);
    throw new Error('Failed to initialize PDF.js library');
  }
}

/**
 * Load PDF document using EXACT approach from working simplePdfUtils
 */
async function loadWorkingPDFDocument(arrayBuffer: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await initWorkingPDFJS();
  
  // Ensure getDocument is available - EXACT copy from simplePdfUtils
  if (typeof pdfjs.getDocument !== 'function') {
    throw new Error('PDF.js getDocument function is not available');
  }
  
  // Use inline worker to avoid GlobalWorkerOptions issues - EXACT copy from simplePdfUtils
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    verbosity: 0,
    isEvalSupported: false,
    disableFontFace: false,
    useSystemFonts: true,
    // Use worker from CDN directly - EXACT copy from simplePdfUtils
    workerSrc: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`
  });
  
  return await loadingTask.promise;
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
 * Generate thumbnails using EXACT working approach
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
    console.log('📄 Starting PDF thumbnail generation (working method)...');
    
    // Read file - EXACT copy from simplePdfUtils
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    console.log('📄 File read, loading PDF...');
    
    // Load PDF - EXACT copy from simplePdfUtils  
    const pdf = await loadWorkingPDFDocument(arrayBuffer);
    
    console.log(`📄 PDF loaded successfully: ${pdf.numPages} pages`);
    
    const thumbnails: Array<{ pageNumber: number; thumbnail: string }> = [];
    const totalPages = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= totalPages; i++) {
      try {
        console.log(`📄 Rendering page ${i}/${totalPages}...`);
        const page = await pdf.getPage(i);
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
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        
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
    console.error('❌ Error generating PDF thumbnails:', error);
    throw error;
  }
}

/**
 * Validate PDF file using working approach
 */
export async function validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('🔍 Validating PDF file (working method)...');
    
    // Check file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File is not a PDF' };
    }
    
    // Read and validate - EXACT copy from simplePdfUtils
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    const pdf = await loadWorkingPDFDocument(arrayBuffer);
    
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
 * Load PDF document for external use
 */
export async function loadPDFDocument(source: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  return loadWorkingPDFDocument(source as ArrayBuffer);
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