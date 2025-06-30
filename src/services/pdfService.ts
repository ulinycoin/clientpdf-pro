import { PDFDocument } from 'pdf-lib';
import { 
  PDFProcessingResult, 
  MergeOptions,
  ProgressCallback
} from '../types';

export class PDFService {
  name = 'PDFService';
  version = '1.0.0';
  
  private static instance: PDFService;

  static getInstance(): PDFService {
    if (!this.instance) {
      this.instance = new PDFService();
    }
    return this.instance;
  }

  isSupported(): boolean {
    return typeof PDFDocument !== 'undefined' && 
           typeof File !== 'undefined' && 
           typeof Blob !== 'undefined';
  }

  /**
   * Validate if file is a valid PDF
   */
  async validateFile(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount() > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get PDF metadata
   */
  async getMetadata(file: File): Promise<{
    pages: number;
    originalSize: number;
    dimensions: { width: number; height: number };
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      let dimensions = { width: 0, height: 0 };
      if (pageCount > 0) {
        const firstPage = pdfDoc.getPage(0);
        const size = firstPage.getSize();
        dimensions = {
          width: Math.round(size.width),
          height: Math.round(size.height)
        };
      }
      
      return {
        pages: pageCount,
        originalSize: file.size,
        dimensions
      };
    } catch (error) {
      throw this.createPDFError(error, 'Failed to get PDF metadata');
    }
  }

  /**
   * Merge multiple PDF files into one
   */
  async mergePDFs(
    files: File[],
    options: MergeOptions = {},
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();
    
    try {
      if (files.length < 2) {
        throw new Error('At least 2 files are required for merging');
      }

      onProgress?.(0, 'Starting merge process...');

      // Create new PDF document
      const mergedPdf = await PDFDocument.create();
      let totalOriginalSize = 0;
      let totalPages = 0;

      // Set metadata if provided
      if (options.metadata) {
        if (options.metadata.title) mergedPdf.setTitle(options.metadata.title);
        if (options.metadata.author) mergedPdf.setAuthor(options.metadata.author);
        if (options.metadata.subject) mergedPdf.setSubject(options.metadata.subject);
      }

      // Determine file order
      const fileOrder = options.order ? 
        options.order.map(index => files[index]).filter(Boolean) : 
        files;

      // Process each file
      for (let i = 0; i < fileOrder.length; i++) {
        const file = fileOrder[i];
        totalOriginalSize += file.size;

        onProgress?.(
          (i / fileOrder.length) * 80, 
          `Processing ${file.name}...`
        );

        try {
          // Load PDF
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          
          // Copy all pages
          const pageIndices = Array.from(
            { length: pdf.getPageCount() }, 
            (_, i) => i
          );
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          
          // Add pages to merged document
          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });

          totalPages += pdf.getPageCount();
        } catch (error) {
          console.warn(`Failed to process file ${file.name}:`, error);
        }
      }

      onProgress?.(90, 'Saving merged PDF...');

      // Save merged PDF
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      onProgress?.(100, 'Merge completed!');

      const processingTime = performance.now() - startTime;

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: totalPages,
          originalSize: totalOriginalSize,
          processedSize: blob.size,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'PDF merge failed')
      };
    }
  }

  /**
   * Create a standardized PDF error
   */
  private createPDFError(error: any, context: string = 'PDF processing') {
    let message = 'An error occurred during PDF processing';
    
    if (error instanceof Error) {
      message = error.message;
      
      const errorText = message.toLowerCase();
      
      if (errorText.includes('invalid') || errorText.includes('corrupt')) {
        message = 'The PDF file is corrupted or invalid';
      } else if (errorText.includes('too large') || errorText.includes('size')) {
        message = 'The file is too large to process';
      } else if (errorText.includes('memory')) {
        message = 'Not enough memory to process the file';
      }
    }
    
    return {
      code: 'PROCESSING_ERROR',
      message: `${context}: ${message}`,
      cause: error
    };
  }
}

// Export singleton instance
export const pdfService = PDFService.getInstance();