/**
 * Simple PDF.js wrapper that handles worker initialization differently
 * This approach avoids GlobalWorkerOptions and uses inline worker instead
 */

export interface SimplePDFDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<SimplePDFPage>;
  getMetadata(): Promise<{ info: any }>;
}

export interface SimplePDFPage {
  getViewport(params: { scale: number }): any;
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
}

let pdfjsModule: any = null;

/**
 * Alternative PDF.js initialization that doesn't rely on GlobalWorkerOptions
 */
export async function initSimplePDFJS(): Promise<any> {
  if (pdfjsModule) {
    return pdfjsModule;
  }

  try {
    // Import PDF.js
    const pdfjs = await import('pdfjs-dist');
    
    // For development, we'll use the CDN worker directly in getDocument calls
    console.log('PDF.js loaded successfully');
    pdfjsModule = pdfjs;
    
    return pdfjsModule;
  } catch (error) {
    console.error('Failed to load PDF.js:', error);
    throw new Error('Failed to initialize PDF.js library');
  }
}

/**
 * Load PDF document using inline worker approach
 */
export async function loadSimplePDFDocument(arrayBuffer: ArrayBuffer): Promise<SimplePDFDocument> {
  const pdfjs = await initSimplePDFJS();
  
  // Use inline worker to avoid GlobalWorkerOptions issues
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    verbosity: 0,
    isEvalSupported: false,
    disableFontFace: false,
    useSystemFonts: true,
    // Use worker from CDN directly
    workerSrc: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`
  });
  
  return await loadingTask.promise;
}

/**
 * Alternative approach to generatePDFThumbnails using simple API
 */
export async function generateSimplePDFThumbnails(
  file: File,
  options: {
    scale?: number;
    maxPages?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<Array<{ pageNumber: number; thumbnail: string }>> {
  const { scale = 0.3, maxPages = Infinity, onProgress } = options;
  
  try {
    // Read file
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    // Load PDF
    const pdf = await loadSimplePDFDocument(arrayBuffer);
    
    const thumbnails: Array<{ pageNumber: number; thumbnail: string }> = [];
    const totalPages = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= totalPages; i++) {
      try {
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
        console.warn(`Failed to generate thumbnail for page ${i}:`, pageError);
        thumbnails.push({
          pageNumber: i,
          thumbnail: ''
        });
      }
    }
    
    return thumbnails;
  } catch (error) {
    console.error('Error generating PDF thumbnails:', error);
    throw error;
  }
}

/**
 * Validate PDF file using simple approach
 */
export async function validateSimplePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File is not a PDF' };
    }
    
    // Read and validate
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    const pdf = await loadSimplePDFDocument(arrayBuffer);
    
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