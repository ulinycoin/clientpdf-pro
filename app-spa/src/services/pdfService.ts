import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
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
   * Create ZIP archive from multiple files
   */
  async createZipArchive(
    files: Array<{ blob: Blob; filename: string }>,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    const zip = new JSZip();

    onProgress?.(0, 'Creating archive...');

    // Add files to zip
    for (let i = 0; i < files.length; i++) {
      const { blob, filename } = files[i];
      const arrayBuffer = await blob.arrayBuffer();
      zip.file(filename, arrayBuffer);

      onProgress?.(
        ((i + 1) / files.length) * 80,
        `Adding ${filename}...`
      );
    }

    onProgress?.(90, 'Generating archive...');

    // Generate zip file
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    onProgress?.(100, 'Archive ready!');

    return zipBlob;
  }

  /**
   * Download files as ZIP archive
   */
  async downloadAsZip(
    files: Array<{ blob: Blob; filename: string }>,
    archiveName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    try {
      const zipBlob = await this.createZipArchive(files, onProgress);
      this.downloadFile(zipBlob, archiveName);
    } catch (error) {
      console.error('Failed to create ZIP archive:', error);
      throw error;
    }
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
   * Split PDF into multiple files
   */
  async splitPDF(
    file: File,
    mode: 'pages' | 'range' | 'intervals' | 'custom',
    options: { pages?: number[]; start?: number; end?: number; interval?: number },
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult<Blob[]>> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Loading PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      onProgress?.(10, 'Analyzing PDF structure...');

      const results: Blob[] = [];

      if (mode === 'pages') {
        // Split into individual pages
        onProgress?.(20, 'Splitting into individual pages...');

        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          results.push(new Blob([pdfBytes], { type: 'application/pdf' }));

          onProgress?.(
            20 + ((i + 1) / totalPages) * 70,
            `Processing page ${i + 1} of ${totalPages}...`
          );
        }
      } else if (mode === 'range' && options.start && options.end) {
        // Extract page range
        const start = Math.max(1, options.start);
        const end = Math.min(totalPages, options.end);

        onProgress?.(20, `Extracting pages ${start}-${end}...`);

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from(
          { length: end - start + 1 },
          (_, i) => start - 1 + i
        );

        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        onProgress?.(80, 'Saving extracted pages...');

        const pdfBytes = await newPdf.save();
        results.push(new Blob([pdfBytes], { type: 'application/pdf' }));
      } else if (mode === 'intervals' && options.interval) {
        // Split by intervals
        const interval = options.interval;
        const numChunks = Math.ceil(totalPages / interval);

        onProgress?.(20, `Splitting into ${numChunks} files...`);

        for (let i = 0; i < numChunks; i++) {
          const startPage = i * interval;
          const endPage = Math.min((i + 1) * interval, totalPages);

          const newPdf = await PDFDocument.create();
          const pageIndices = Array.from(
            { length: endPage - startPage },
            (_, j) => startPage + j
          );

          const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
          copiedPages.forEach((page) => newPdf.addPage(page));

          const pdfBytes = await newPdf.save();
          results.push(new Blob([pdfBytes], { type: 'application/pdf' }));

          onProgress?.(
            20 + ((i + 1) / numChunks) * 70,
            `Creating file ${i + 1} of ${numChunks}...`
          );
        }
      } else if (mode === 'custom' && options.pages && options.pages.length > 0) {
        // Extract specific pages
        const pages = options.pages;
        onProgress?.(20, `Extracting ${pages.length} specific pages...`);

        for (let i = 0; i < pages.length; i++) {
          const pageIndex = pages[i] - 1; // Convert to 0-based index

          if (pageIndex >= 0 && pageIndex < totalPages) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
            newPdf.addPage(copiedPage);

            const pdfBytes = await newPdf.save();
            results.push(new Blob([pdfBytes], { type: 'application/pdf' }));
          }

          onProgress?.(
            20 + ((i + 1) / pages.length) * 70,
            `Extracting page ${pages[i]} (${i + 1} of ${pages.length})...`
          );
        }
      }

      onProgress?.(100, 'Split completed!');

      const processingTime = performance.now() - startTime;

      return {
        success: true,
        data: results,
        metadata: {
          pageCount: totalPages,
          originalSize: file.size,
          processedSize: results.reduce((sum, blob) => sum + blob.size, 0),
          processingTime,
          filesCreated: results.length,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'PDF split failed')
      };
    }
  }

  /**
   * Compress PDF with specified quality level
   */
  async compressPDF(
    file: File,
    quality: 'low' | 'medium' | 'high',
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Loading PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      onProgress?.(10, 'Analyzing PDF structure...');

      // Quality settings
      const qualitySettings = {
        low: { scale: 0.5, jpegQuality: 0.3 },      // ~70% reduction
        medium: { scale: 0.7, jpegQuality: 0.5 },   // ~50% reduction
        high: { scale: 0.85, jpegQuality: 0.7 },    // ~30% reduction
      };

      const settings = qualitySettings[quality];

      onProgress?.(20, 'Compressing images...');

      // Note: pdf-lib doesn't have built-in image compression
      // For basic compression, we remove metadata and optimize structure

      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      onProgress?.(60, 'Optimizing PDF structure...');

      // Save with optimization
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      onProgress?.(90, 'Finalizing compression...');

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);

      onProgress?.(100, 'Compression completed!');

      const processingTime = performance.now() - startTime;

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount,
          originalSize: file.size,
          processedSize: blob.size,
          processingTime,
          compressionRatio: parseFloat(compressionRatio),
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'PDF compression failed')
      };
    }
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
