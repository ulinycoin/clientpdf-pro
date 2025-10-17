import { PDFDocument } from 'pdf-lib';
import type {
  PDFProcessingResult,
  MergeOptions,
  ProgressCallback,
  PDFFileInfo,
  ProcessingError
} from '@/types/pdf';

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
  async validatePDF(file: File): Promise<boolean> {
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
  async getPDFInfo(file: File): Promise<PDFFileInfo> {
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
    onProgress?: ProgressCallback,
    options: MergeOptions = {}
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
   * Download a file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Format time in human readable format
   */
  formatTime(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}m`;
  }

  /**
   * Create a standardized PDF error
   */
  private createPDFError(error: any, context: string = 'PDF processing'): ProcessingError {
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
      details: error instanceof Error ? error.stack : String(error)
    };
  }
}

// Export singleton instance as default
const pdfService = PDFService.getInstance();
export default pdfService;

// Named exports for compatibility
export { pdfService };
export type { PDFFileInfo, PDFProcessingResult };
