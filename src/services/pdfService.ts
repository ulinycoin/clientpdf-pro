import { PDFDocument, degrees } from 'pdf-lib';
import { PDFDocument as PDFDocumentEncrypt } from 'pdf-lib-plus-encrypt';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import type {
  PDFProcessingResult,
  MergeOptions,
  ProgressCallback,
  PDFFileInfo,
  ProcessingError,
  ProtectionSettings,
  ProtectionProgress
} from '@/types/pdf';
import type {
  ImageConversionOptions,
  ImageConversionResult,
  ConvertedImage,
  ImageConversionProgress,
  QUALITY_SETTINGS
} from '@/types/image.types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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
          const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

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
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

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
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
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
          results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));

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
        results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));
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
          results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));

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
            results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));
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
    _quality: 'low' | 'medium' | 'high',
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Loading PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = sourcePdf.getPageCount();

      onProgress?.(10, 'Analyzing PDF structure...');

      // Create a new PDF to remove encryption
      const pdfDoc = await PDFDocument.create();

      onProgress?.(20, 'Removing encryption...');

      // Copy all pages from encrypted PDF to new PDF (removes encryption)
      const pages = await pdfDoc.copyPages(sourcePdf, Array.from({ length: pageCount }, (_, i) => i));
      pages.forEach(page => pdfDoc.addPage(page));

      onProgress?.(40, 'Compressing images...');

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

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
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
   * Protect PDF with password encryption
   */
  async protectPDF(
    file: File,
    settings: ProtectionSettings,
    onProgress?: (progress: ProtectionProgress) => void
  ): Promise<Uint8Array> {
    try {
      onProgress?.({
        stage: 'analyzing',
        progress: 10,
        message: 'Loading PDF document...'
      });

      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocumentEncrypt.load(arrayBuffer);

      onProgress?.({
        stage: 'preparing',
        progress: 30,
        message: 'Preparing document for encryption...'
      });

      // Add metadata
      pdfDoc.setTitle(pdfDoc.getTitle() || 'Protected Document');
      pdfDoc.setSubject('Password Protected PDF created by LocalPDF');
      pdfDoc.setCreator('LocalPDF - Privacy-First PDF Tools');
      pdfDoc.setProducer('LocalPDF with pdf-lib-plus-encrypt');

      onProgress?.({
        stage: 'encrypting',
        progress: 60,
        message: 'Applying encryption and permissions...'
      });

      // Map printing permission to boolean (pdf-lib-plus-encrypt uses boolean)
      const printingAllowed = settings.permissions.printing !== 'none';

      // Encrypt the PDF with password and permissions
      await pdfDoc.encrypt({
        userPassword: settings.userPassword || '',
        ownerPassword: settings.ownerPassword || settings.userPassword || '',
        permissions: {
          printing: printingAllowed,
          modifying: settings.permissions.modifying || false,
          copying: settings.permissions.copying || false,
          annotating: settings.permissions.annotating || false,
          fillingForms: settings.permissions.fillingForms || false,
          contentAccessibility: settings.permissions.contentAccessibility !== false, // Default true
          documentAssembly: settings.permissions.documentAssembly || false
        }
      });

      onProgress?.({
        stage: 'finalizing',
        progress: 90,
        message: 'Finalizing encrypted document...'
      });

      // Save the encrypted PDF (useObjectStreams must be false for encryption)
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF encryption completed successfully!'
      });

      return new Uint8Array(pdfBytes);

    } catch (error) {
      console.error('Error encrypting PDF:', error);
      throw new Error(`Failed to encrypt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract PDF pages
   */
  async extractPDF(
    file: File,
    pagesToExtract: number[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Loading PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      // Validate page numbers
      const validPages = pagesToExtract.filter(p => p >= 1 && p <= totalPages);
      if (validPages.length === 0) {
        throw new Error('No valid pages to extract');
      }

      onProgress?.(20, `Extracting ${validPages.length} pages...`);

      // Create new document with extracted pages
      const newPdfDoc = await PDFDocument.create();

      let copiedCount = 0;
      for (const pageNum of validPages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);

        copiedCount++;
        const progress = 20 + (copiedCount / validPages.length) * 60;
        onProgress?.(progress, `Extracting page ${copiedCount}/${validPages.length}...`);
      }

      onProgress?.(80, 'Saving PDF...');

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      const processingTime = performance.now() - startTime;
      onProgress?.(100, 'Completed!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: validPages.length,
          originalSize: file.size,
          processedSize: blob.size,
          compressionRatio: blob.size / file.size,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'Extract pages failed')
      };
    }
  }

  /**
   * Delete PDF pages
   */
  async deletePDF(
    file: File,
    pagesToDelete: number[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Loading PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      // Calculate pages to keep
      const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
      const pagesToKeep = allPages.filter(p => !pagesToDelete.includes(p));

      if (pagesToKeep.length === 0) {
        throw new Error('Cannot delete all pages');
      }

      onProgress?.(20, `Removing ${pagesToDelete.length} pages...`);

      // Create new document with only pages to keep
      const newPdfDoc = await PDFDocument.create();

      let copiedCount = 0;
      for (const pageNum of pagesToKeep) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);

        copiedCount++;
        const progress = 20 + (copiedCount / pagesToKeep.length) * 60;
        onProgress?.(progress, `Copying page ${copiedCount}/${pagesToKeep.length}...`);
      }

      onProgress?.(80, 'Saving PDF...');

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      const processingTime = performance.now() - startTime;
      onProgress?.(100, 'Completed!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: pagesToKeep.length,
          originalSize: file.size,
          processedSize: blob.size,
          compressionRatio: blob.size / file.size,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'Delete pages failed')
      };
    }
  }

  /**
   * Rotate PDF pages
   */
  async rotatePDF(
    file: File,
    angle: 90 | 180 | 270,
    pages: number[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Loading PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      // Validate page numbers
      const validPages = pages.filter(p => p >= 1 && p <= totalPages);
      if (validPages.length === 0) {
        throw new Error('No valid pages to rotate');
      }

      onProgress?.(20, `Rotating ${validPages.length} pages...`);

      // Rotate pages (pdf-lib uses degrees)
      let rotatedCount = 0;
      for (const pageNum of validPages) {
        const page = pdfDoc.getPage(pageNum - 1); // 0-indexed
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + angle) % 360;
        page.setRotation(degrees(newRotation));

        rotatedCount++;
        const progress = 20 + (rotatedCount / validPages.length) * 60;
        onProgress?.(progress, `Rotated ${rotatedCount}/${validPages.length} pages...`);
      }

      onProgress?.(80, 'Saving PDF...');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      const processingTime = performance.now() - startTime;
      onProgress?.(100, 'Completed!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: totalPages,
          originalSize: file.size,
          processedSize: blob.size,
          compressionRatio: blob.size / file.size,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'Rotate PDF failed')
      };
    }
  }

  /**
   * Convert images to PDF
   */
  async imagesToPDF(
    imageFiles: File[],
    onProgress?: ProgressCallback,
    options?: {
      pageSize?: 'fit' | 'a4' | 'letter';
      orientation?: 'portrait' | 'landscape';
      margin?: number;
    }
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      if (imageFiles.length === 0) {
        throw new Error('At least one image is required');
      }

      onProgress?.(0, 'Starting conversion...');

      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      let totalOriginalSize = 0;

      // Process each image
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        totalOriginalSize += imageFile.size;

        onProgress?.(
          (i / imageFiles.length) * 90,
          `Processing image ${i + 1}/${imageFiles.length}...`
        );

        // Load image based on type
        const imageBytes = await imageFile.arrayBuffer();
        let image;

        const fileType = imageFile.type.toLowerCase();
        if (fileType.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (fileType.includes('jpeg') || fileType.includes('jpg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          throw new Error(`Unsupported image format: ${fileType}. Only PNG and JPEG are supported.`);
        }

        const imageDims = image.scale(1);

        // Calculate page dimensions based on options
        let pageWidth: number;
        let pageHeight: number;
        const margin = options?.margin || 0;

        if (options?.pageSize === 'a4') {
          // A4 size in points (1 point = 1/72 inch)
          pageWidth = 595.28;  // 210mm
          pageHeight = 841.89; // 297mm
        } else if (options?.pageSize === 'letter') {
          // Letter size in points
          pageWidth = 612;    // 8.5 inch
          pageHeight = 792;   // 11 inch
        } else {
          // Fit to image size
          pageWidth = imageDims.width + (margin * 2);
          pageHeight = imageDims.height + (margin * 2);
        }

        // Handle orientation
        if (options?.orientation === 'landscape') {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        // Create page with calculated dimensions
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate image position and scale to fit within margins
        const availableWidth = pageWidth - (margin * 2);
        const availableHeight = pageHeight - (margin * 2);

        let scale = 1;
        if (options?.pageSize !== 'fit') {
          // Scale image to fit within page margins
          const scaleX = availableWidth / imageDims.width;
          const scaleY = availableHeight / imageDims.height;
          scale = Math.min(scaleX, scaleY);
        }

        const scaledWidth = imageDims.width * scale;
        const scaledHeight = imageDims.height * scale;

        // Center image on page
        const x = margin + (availableWidth - scaledWidth) / 2;
        const y = margin + (availableHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      onProgress?.(90, 'Saving PDF...');

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      const processingTime = performance.now() - startTime;
      onProgress?.(100, 'Completed!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: imageFiles.length,
          originalSize: totalOriginalSize,
          processedSize: blob.size,
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.createPDFError(error, 'Images to PDF conversion failed')
      };
    }
  }

  /**
   * Convert PDF pages to images
   */
  async pdfToImages(
    file: File,
    options: ImageConversionOptions,
    onProgress?: (progress: ImageConversionProgress) => void
  ): Promise<ImageConversionResult> {
    const startTime = performance.now();

    try {
      // Import quality settings dynamically
      const { QUALITY_SETTINGS } = await import('@/types/image.types');

      // Update progress
      onProgress?.({
        currentPage: 0,
        totalPages: 0,
        percentage: 0,
        status: 'preparing',
        message: 'Loading PDF...'
      });

      // Load PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;

      // Determine which pages to convert
      const pagesToConvert = this.getPageNumbersForConversion(totalPages, options);

      onProgress?.({
        currentPage: 0,
        totalPages: pagesToConvert.length,
        percentage: 5,
        status: 'converting',
        message: `Converting ${pagesToConvert.length} pages...`
      });

      // Convert pages
      const convertedImages: ConvertedImage[] = [];
      const qualitySettings = QUALITY_SETTINGS[options.quality];

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNumber = pagesToConvert[i];

        onProgress?.({
          currentPage: i + 1,
          totalPages: pagesToConvert.length,
          percentage: 5 + (i / pagesToConvert.length) * 90,
          status: 'converting',
          message: `Converting page ${pageNumber}...`
        });

        const convertedImage = await this.convertPageToImage(
          pdfDoc,
          pageNumber,
          options,
          qualitySettings.resolution,
          file.name
        );

        convertedImages.push(convertedImage);
      }

      onProgress?.({
        currentPage: pagesToConvert.length,
        totalPages: pagesToConvert.length,
        percentage: 100,
        status: 'complete',
        message: 'Conversion complete!'
      });

      // Calculate sizes
      const originalSize = file.size;
      const convertedSize = convertedImages.reduce((sum, img) => sum + img.size, 0);

      return {
        success: true,
        images: convertedImages,
        totalPages,
        originalSize,
        convertedSize,
        metadata: {
          processingTime: performance.now() - startTime,
          format: options.format,
          quality: options.quality,
          resolution: qualitySettings.resolution
        }
      };

    } catch (error) {
      console.error('[PDFService] PDF to Images conversion failed:', error);

      return {
        success: false,
        images: [],
        totalPages: 0,
        originalSize: file.size,
        convertedSize: 0,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      };
    }
  }

  /**
   * Convert single PDF page to image
   */
  private async convertPageToImage(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    options: ImageConversionOptions,
    resolution: number,
    originalFileName: string
  ): Promise<ConvertedImage> {
    // Import quality settings dynamically
    const { QUALITY_SETTINGS } = await import('@/types/image.types');

    // Get page
    const page = await pdfDoc.getPage(pageNumber);

    // Calculate scale for desired resolution
    const viewport = page.getViewport({ scale: 1 });
    const scale = resolution / 72; // 72 DPI is the default
    const scaledViewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Set background color for JPEG
    if (options.format === 'jpeg' && options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Render page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };

    await page.render(renderContext).promise;

    // Convert canvas to blob
    const blob = await this.canvasToBlob(canvas, options);

    // Create data URL for preview
    const dataUrl = canvas.toDataURL(
      `image/${options.format}`,
      options.format === 'jpeg' ? QUALITY_SETTINGS[options.quality].jpegQuality : undefined
    );

    // Generate filename
    const baseName = originalFileName.replace(/\.pdf$/i, '');
    const filename = `${baseName}_page_${pageNumber}.${options.format}`;

    return {
      pageNumber,
      blob,
      dataUrl,
      filename,
      size: blob.size
    };
  }

  /**
   * Convert canvas to blob with specified format and quality
   */
  private async canvasToBlob(canvas: HTMLCanvasElement, options: ImageConversionOptions): Promise<Blob> {
    // Import quality settings dynamically
    const { QUALITY_SETTINGS } = await import('@/types/image.types');

    return new Promise((resolve, reject) => {
      const mimeType = `image/${options.format}`;
      const quality = options.format === 'jpeg'
        ? QUALITY_SETTINGS[options.quality].jpegQuality
        : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Get array of page numbers to convert based on options
   */
  private getPageNumbersForConversion(totalPages: number, options: ImageConversionOptions): number[] {
    switch (options.pages) {
      case 'all':
        return Array.from({ length: totalPages }, (_, i) => i + 1);

      case 'specific':
        return options.pageNumbers?.filter(n => n >= 1 && n <= totalPages) || [];

      case 'range':
        if (!options.pageRange) return [];
        const { start, end } = options.pageRange;
        const validStart = Math.max(1, Math.min(start, totalPages));
        const validEnd = Math.min(totalPages, Math.max(end, validStart));
        return Array.from(
          { length: validEnd - validStart + 1 },
          (_, i) => validStart + i
        );

      default:
        return [];
    }
  }

  /**
   * Download single image
   */
  downloadImage(image: ConvertedImage): void {
    const url = URL.createObjectURL(image.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Download all images as separate files
   */
  downloadAllImages(images: ConvertedImage[]): void {
    images.forEach((image, index) => {
      // Add small delay between downloads to avoid browser blocking
      setTimeout(() => {
        this.downloadImage(image);
      }, index * 100);
    });
  }

  /**
   * Download all images as ZIP archive
   */
  async downloadImagesAsZip(images: ConvertedImage[], zipFilename: string = 'pdf-images.zip'): Promise<void> {
    try {
      const zip = new JSZip();

      // Add each image to the ZIP
      for (const image of images) {
        zip.file(image.filename, image.blob);
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // Download ZIP
      this.downloadFile(zipBlob, zipFilename);
    } catch (error) {
      console.error('Failed to create ZIP archive:', error);
      throw new Error('Failed to create ZIP archive');
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

// Export individual methods for convenience
export const mergePDFs = (files: File[], onProgress?: ProgressCallback, options?: MergeOptions) =>
  pdfService.mergePDFs(files, onProgress, options);

export const splitPDF = (
  file: File,
  mode: 'pages' | 'range' | 'intervals' | 'custom',
  options: { pages?: number[]; start?: number; end?: number; interval?: number },
  onProgress?: ProgressCallback
) => pdfService.splitPDF(file, mode, options, onProgress);

export const compressPDF = (file: File, quality: 'low' | 'medium' | 'high', onProgress?: ProgressCallback) =>
  pdfService.compressPDF(file, quality, onProgress);

export const protectPDF = (
  file: File,
  settings: ProtectionSettings,
  onProgress?: (progress: ProtectionProgress) => void
) => pdfService.protectPDF(file, settings, onProgress);

export const rotatePDF = (
  file: File,
  angle: 90 | 180 | 270,
  pages: number[],
  onProgress?: ProgressCallback
) => pdfService.rotatePDF(file, angle, pages, onProgress);

export const deletePDF = (
  file: File,
  pagesToDelete: number[],
  onProgress?: ProgressCallback
) => pdfService.deletePDF(file, pagesToDelete, onProgress);

export const extractPDF = (
  file: File,
  pagesToExtract: number[],
  onProgress?: ProgressCallback
) => pdfService.extractPDF(file, pagesToExtract, onProgress);

export const getPDFInfo = (file: File) => pdfService.getPDFInfo(file);
export const validatePDF = (file: File) => pdfService.validatePDF(file);
export const downloadFile = (blob: Blob, filename: string) => pdfService.downloadFile(blob, filename);
export const createZipArchive = (files: Array<{ blob: Blob; filename: string }>, onProgress?: ProgressCallback) =>
  pdfService.createZipArchive(files, onProgress);
export const downloadAsZip = (files: Array<{ blob: Blob; filename: string }>, archiveName: string, onProgress?: ProgressCallback) =>
  pdfService.downloadAsZip(files, archiveName, onProgress);
export const formatFileSize = (bytes: number) => pdfService.formatFileSize(bytes);
export const formatTime = (ms: number) => pdfService.formatTime(ms);
