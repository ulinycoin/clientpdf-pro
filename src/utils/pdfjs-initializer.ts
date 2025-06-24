/**
 * PDF.js utility for reliable initialization
 * Handles different versions and browser environments
 */

interface PDFJSLib {
  getDocument: (src: any) => { promise: Promise<any> };
  GlobalWorkerOptions?: { workerSrc: string };
  workerSrc?: string;
}

class PDFJSInitializer {
  private static instance: PDFJSInitializer;
  private pdfjs: PDFJSLib | null = null;
  private initialized = false;
  private initPromise: Promise<PDFJSLib> | null = null;

  private constructor() {}

  static getInstance(): PDFJSInitializer {
    if (!PDFJSInitializer.instance) {
      PDFJSInitializer.instance = new PDFJSInitializer();
    }
    return PDFJSInitializer.instance;
  }

  async initialize(): Promise<PDFJSLib> {
    // Return existing instance if already initialized
    if (this.initialized && this.pdfjs) {
      return this.pdfjs;
    }

    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start new initialization
    this.initPromise = this.loadPDFJS();
    
    try {
      this.pdfjs = await this.initPromise;
      this.initialized = true;
      return this.pdfjs;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  private async loadPDFJS(): Promise<PDFJSLib> {
    console.log('🔄 Initializing PDF.js...');

    let pdfjs: PDFJSLib;

    // Strategy 1: Dynamic import
    try {
      pdfjs = await import('pdfjs-dist');
      console.log('✅ PDF.js loaded via dynamic import');
    } catch (error) {
      console.warn('⚠️ Dynamic import failed:', error);
      
      // Strategy 2: Global object
      if ((window as any).pdfjsLib) {
        pdfjs = (window as any).pdfjsLib;
        console.log('✅ PDF.js loaded from global object');
      } else {
        throw new Error('PDF.js library not available');
      }
    }

    // Configure worker
    await this.configureWorker(pdfjs);

    return pdfjs;
  }

  private async configureWorker(pdfjs: PDFJSLib): Promise<void> {
    console.log('🔄 Configuring PDF.js worker...');

    const workerPaths = [
      '/pdf.worker.js', // Local worker
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js' // CDN fallback
    ];

    for (const workerPath of workerPaths) {
      try {
        // Test if worker path is accessible
        if (workerPath.startsWith('http')) {
          // For CDN, just use it
          this.setWorkerSrc(pdfjs, workerPath);
          console.log(`✅ Worker configured: ${workerPath}`);
          return;
        } else {
          // For local worker, test if it exists
          const response = await fetch(workerPath, { method: 'HEAD' });
          if (response.ok) {
            this.setWorkerSrc(pdfjs, workerPath);
            console.log(`✅ Worker configured: ${workerPath}`);
            return;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Worker path failed: ${workerPath}`, error);
        continue;
      }
    }

    console.warn('⚠️ No worker configured, PDF.js will run without worker');
  }

  private setWorkerSrc(pdfjs: PDFJSLib, workerSrc: string): void {
    // Modern PDF.js versions
    if (pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    }
    // Legacy PDF.js versions  
    else if ('workerSrc' in pdfjs) {
      (pdfjs as any).workerSrc = workerSrc;
    }
    // Fallback for very old versions
    else {
      (window as any).pdfjsWorker = workerSrc;
    }
  }

  // Create document with enhanced options
  async createDocument(data: ArrayBuffer, options: any = {}): Promise<any> {
    const pdfjs = await this.initialize();

    const config = {
      data,
      // Enhanced font and character map support
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
      // Disable worker if not properly configured
      disableWorker: !this.hasWorker(pdfjs),
      // Merge user options
      ...options
    };

    console.log('🔄 Creating PDF document with config:', {
      dataSize: data.byteLength,
      hasWorker: !config.disableWorker,
      cMapUrl: config.cMapUrl
    });

    const loadingTask = pdfjs.getDocument(config);
    return loadingTask.promise;
  }

  private hasWorker(pdfjs: PDFJSLib): boolean {
    return !!(
      (pdfjs.GlobalWorkerOptions && pdfjs.GlobalWorkerOptions.workerSrc) ||
      (pdfjs as any).workerSrc ||
      (window as any).pdfjsWorker
    );
  }

  // Reset instance (useful for testing or error recovery)
  reset(): void {
    this.pdfjs = null;
    this.initialized = false;
    this.initPromise = null;
  }

  // Get current status
  getStatus(): { initialized: boolean; hasWorker: boolean } {
    return {
      initialized: this.initialized,
      hasWorker: this.pdfjs ? this.hasWorker(this.pdfjs) : false
    };
  }
}

// Export singleton instance
export const pdfJSInitializer = PDFJSInitializer.getInstance();

// Export convenient functions
export const initializePDFJS = () => pdfJSInitializer.initialize();
export const createPDFDocument = (data: ArrayBuffer, options?: any) => 
  pdfJSInitializer.createDocument(data, options);
export const resetPDFJS = () => pdfJSInitializer.reset();
export const getPDFJSStatus = () => pdfJSInitializer.getStatus();