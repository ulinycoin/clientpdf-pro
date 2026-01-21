import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Buffer } from 'buffer';
import mammoth from 'mammoth';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  CommentRangeStart,
  CommentRangeEnd,
} from 'docx';
import type {
  PDFProcessingResult,
  MergeOptions,
  ProgressCallback,
  PDFFileInfo,
  ProcessingError,
  ProtectionSettings,
  ProtectionProgress,
  PDFTextItem
} from '@/types/pdf';
import type {
  ImageConversionOptions,
  ImageConversionResult,
  ConvertedImage,
  ImageConversionProgress
} from '@/types/image.types';
import type {
  FormFieldOptions,
  TextFormField,
  MultilineFormField,
  CheckboxFormField,
  RadioFormField,
  DropdownFormField
} from '@/types/formFields';

import { mergeService } from './MergeService';
import { splitService } from './SplitService';
import { compressionService } from './CompressionService';
import { securityService } from './SecurityService';
import { imageExtractionService } from './ImageExtractionService';
import { pageManipulationService } from './PageManipulationService';

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Polyfill Buffer for JSZip in browser environment
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Buffer = Buffer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Buffer = Buffer;
}

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
    } catch {
      return false;
    }
  }

  /**
   * Render a specific page as an image
   */
  async renderPageAsImage(
    file: File,
    pageNumber: number,
    scale: number = 2.0
  ): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      if (pageNumber < 1 || pageNumber > pdf.numPages) {
        throw new Error(`Page ${pageNumber} out of bounds (1-${pdf.numPages})`);
      }

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to create canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // @ts-expect-error - page.render expects specific context type
      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      return canvas.toDataURL('image/png');
    } catch (error) {
      throw this.createPDFError(error, 'Failed to render page');
    }
  }

  /**
   * Get previews for all pages in a file
   */
  async getPreviews(file: File, scale: number = 0.5): Promise<string[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const previews: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // @ts-expect-error - page.render expects specific context type
        await page.render({
          canvasContext: context,
          viewport
        }).promise;

        previews.push(canvas.toDataURL('image/jpeg', 0.8)); // JPEG is smaller/faster for thumbnails
      }

      return previews;
    } catch (error) {
      console.error('Failed to generate previews', error);
      return [];
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
    return mergeService.mergePDFs(files, onProgress, options);
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
    return splitService.splitPDF(file, mode, options, onProgress);
  }

  /**
   * Compress PDF with specified quality level
   */
  async compressPDF(
    file: File,
    quality: 'low' | 'medium' | 'high',
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    return compressionService.compressPDF(file, quality, onProgress);
  }

  /**
   * Analyze PDF for compression potential
   */
  async analyzeCompression(file: File): Promise<import('@/types/pdf').CompressionAnalysis> {
    return compressionService.analyzeCompression(file);
  }

  /**
   * Protect PDF with password encryption
   */
  async protectPDF(
    file: File,
    settings: ProtectionSettings,
    onProgress?: (progress: ProtectionProgress) => void
  ): Promise<Uint8Array> {
    return securityService.protectPDF(file, settings, onProgress);
  }



  /**
   * Extract PDF pages
   */
  async extractPDF(
    file: File,
    pagesToExtract: number[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    return pageManipulationService.extractPDF(file, pagesToExtract, onProgress);
  }

  /**
   * Delete PDF pages
   */
  async deletePDF(
    file: File,
    pagesToDelete: number[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    return pageManipulationService.deletePDF(file, pagesToDelete, onProgress);
  }

  /**
   * Flatten PDF forms and annotations
   */
  async flattenPDF(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult<Blob>> {
    return securityService.flattenPDF(file, onProgress);
  }

  /**
   * Rotate PDF pages
   */
  async rotatePDF(
    file: File | Blob,
    angle: 0 | 90 | 180 | 270,
    pages: number[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    return pageManipulationService.rotatePDF(file, angle, pages, onProgress);
  }

  /**
   * Extract images from PDF using pdf-lib
   */
  async extractImages(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult<import('@/types/pdf').ExtractedImage[]>> {
    return imageExtractionService.extractImages(file, onProgress);
  }

  /**
   * Remove specific images from PDF by their IDs
   */
  async removeSelectedImages(
    file: File,
    imageIdsToRemove: string[],
    extractedImages: import('@/types/pdf').ExtractedImage[],
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult<Blob>> {
    const imagesToRemoveByPage = new Map<number, Set<string>>();
    extractedImages.forEach(img => {
      if (imageIdsToRemove.includes(img.id)) {
        if (!imagesToRemoveByPage.has(img.pageNumber)) {
          imagesToRemoveByPage.set(img.pageNumber, new Set());
        }
        imagesToRemoveByPage.get(img.pageNumber)!.add(img.filename);
      }
    });

    return pageManipulationService.removeSelectedImages(file, imagesToRemoveByPage, onProgress);
  }




  /**
   * Remove ALL images from PDF
   */
  async removeImages(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult<Blob>> {
    return pageManipulationService.removeImages(file, onProgress);
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

        page.drawImage(image as import('pdf-lib').PDFImage, {
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
      const qualitySettings = QUALITY_SETTINGS[options.quality as keyof typeof QUALITY_SETTINGS];

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
    // const viewport = page.getViewport({ scale: 1 }); // This variable is not used
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
    if (context) {
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      // @ts-expect-error - page.render expects specific context type
      await page.render(renderContext).promise;
    }

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

      case 'range': {
        if (!options.pageRange) return [];
        const { start, end } = options.pageRange;
        const validStart = Math.max(1, Math.min(start, totalPages));
        const validEnd = Math.min(totalPages, Math.max(end, validStart));
        return Array.from(
          { length: validEnd - validStart + 1 },
          (_, i) => validStart + i
        );
      }

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
      // Convert Blob to ArrayBuffer to avoid Buffer.isBuffer issues in browser
      for (const image of images) {
        const arrayBuffer = await image.blob.arrayBuffer();
        zip.file(image.filename, arrayBuffer);
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
   * Convert Word document (.docx) to PDF
   * Uses mammoth to convert DOCX → HTML, then renders HTML as PDF
   * Supports two modes: 'formatted' (with images/tables) and 'text' (text only)
   */
  async wordToPDF(
    file: File,
    onProgress?: ProgressCallback,
    options?: { mode?: 'formatted' | 'text'; quality?: 1 | 2 | 3 }
  ): Promise<PDFProcessingResult> {
    const mode = options?.mode || 'text';
    const quality = options?.quality || 2;

    // Use formatted mode with html2canvas if mode is 'formatted'
    if (mode === 'formatted') {
      return this.wordToPDFFormatted(file, quality, onProgress);
    }

    // Text-only mode (original implementation)
    try {
      onProgress?.(10, 'Reading Word document...');

      // Read Word file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      onProgress?.(25, 'Converting Word to HTML...');

      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      const textContent = html.replace(/<[^>]*>/g, '\n').trim();

      onProgress?.(40, 'Loading font...');

      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Check if text contains non-ASCII characters (Cyrillic, extended Latin, etc.)
      // WinAnsi only supports basic Latin (0x20-0x7E) plus some Western European chars

      // eslint-disable-next-line no-control-regex
      const needsUnicodeFont = /[^\x00-\xFF]/.test(textContent) || /[\u0080-\u024F\u0400-\u04FF]/.test(textContent);
      console.log(`🔤 Text needs Unicode font: ${needsUnicodeFont}`);

      // Load appropriate font
      let font;
      if (needsUnicodeFont) {
        console.log('🌍 Loading Unicode font...');
        try {
          font = await this.loadUnicodeFont(pdfDoc);
          console.log('✅ Unicode font loaded successfully');
        } catch {
          console.warn('⚠️ Failed to load Unicode font, using Helvetica');
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
      } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      onProgress?.(60, 'Creating PDF from text...');

      // Draw text on page
      const fontSize = 12;
      const lines = textContent.split('\n').filter(line => line.trim());
      const lineHeight = fontSize + 4;
      const margin = 50;

      let currentPage = pdfDoc.addPage();
      let { width, height } = currentPage.getSize();
      let yPosition = height - margin;

      for (const line of lines) {
        if (!line.trim()) continue;

        // Check if we need a new page
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage();
          const pageSize = currentPage.getSize();
          width = pageSize.width;
          height = pageSize.height;
          yPosition = height - margin;
        }

        // Wrap line to fit page width
        const maxChars = Math.floor((width - 2 * margin) / (fontSize * 0.5));
        const displayLine = line.substring(0, maxChars);

        try {
          currentPage.drawText(displayLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            color: rgb(0, 0, 0),
            font: font,
          });
        } catch (error) {
          console.warn('Failed to draw line:', error);
        }

        yPosition -= lineHeight;
      }

      onProgress?.(85, 'Generating PDF...');

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

      onProgress?.(100, 'Conversion complete!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: lines.length, // Approximation or track actual pages
          originalSize: file.size,
          processedSize: blob.size,
          processingTime: 0 // Track if needed
        }
      };

    } catch (error) {
      console.error('Word to PDF conversion error:', error);
      return {
        success: false,
        error: this.createPDFError(error, 'Word to PDF conversion failed')
      };
    }
  }

  /**
   * Generates an HTML preview for a Word document using mammoth
   */
  public async getWordPreviewHTML(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement((image) => {
            return image.read("base64").then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`
              };
            });
          })
        }
      );
      return result.value;
    } catch (error) {
      console.error('Word preview generation error:', error);
      throw new Error('Failed to generate preview for Word document');
    }
  }

  /**
   * Convert Word document to PDF with formatting (images, tables, headings)
   * Uses mammoth → HTML → html2canvas → jsPDF
   */
  private async wordToPDFFormatted(
    file: File,
    quality: 1 | 2 | 3,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    try {
      onProgress?.(5, 'Reading Word document...');

      const arrayBuffer = await file.arrayBuffer();

      onProgress?.(15, 'Converting to HTML with images...');

      // Convert DOCX to HTML with image support
      const mammothResult = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement((image) => {
            return image.read("base64").then((imageBuffer) => {
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`
              };
            });
          })
        }
      );

      const html = mammothResult.value;

      onProgress?.(35, 'Rendering document...');

      // Quality settings
      const qualitySettings = {
        1: { scale: 1, imageQuality: 0.7 },
        2: { scale: 1.5, imageQuality: 0.85 },
        3: { scale: 2, imageQuality: 0.95 }
      };
      const settings = qualitySettings[quality as keyof typeof qualitySettings];

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;

      // Create a hidden container for rendering
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: ${pageWidth * 3.78}px;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        padding: 40px;
        box-sizing: border-box;
        background: white;
        color: black;
      `;

      // Add CSS for better formatting
      const styleSheet = `
        <style>
          * { box-sizing: border-box; }
          h1 { font-size: 24pt; font-weight: bold; margin: 20px 0 10px 0; color: #000; }
          h2 { font-size: 18pt; font-weight: bold; margin: 16px 0 8px 0; color: #000; }
          h3 { font-size: 14pt; font-weight: bold; margin: 14px 0 6px 0; color: #000; }
          h4 { font-size: 12pt; font-weight: bold; margin: 12px 0 6px 0; color: #000; }
          p { margin: 8px 0; color: #000; }
          img { max-width: 100%; height: auto; margin: 12px 0; display: block; }
          table { border-collapse: collapse; width: 100%; margin: 16px 0; }
          td, th { border: 1px solid #333; padding: 8px 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          ul, ol { margin: 10px 0; padding-left: 30px; }
          li { margin: 4px 0; }
          strong, b { font-weight: bold; }
          em, i { font-style: italic; }
          a { color: #0066cc; text-decoration: underline; }
          blockquote { margin: 10px 0; padding: 10px 20px; border-left: 4px solid #ccc; background: #f9f9f9; }
        </style>
      `;

      container.innerHTML = styleSheet + html;
      document.body.appendChild(container);

      onProgress?.(55, 'Creating PDF...');

      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(container, {
        scale: settings.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(container);

      onProgress?.(75, 'Generating pages...');

      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const marginX = 10; // mm
      const marginY = 10; // mm
      const contentWidth = pageWidth - (marginX * 2);
      const contentHeight = pageHeight - (marginY * 2);

      // Pixels per mm for the canvas
      const pxPerMm = canvas.width / (pageWidth - (marginX * 2));
      const pageHeightPx = contentHeight * pxPerMm;

      // Calculate number of pages needed
      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        // Calculate slice position
        const sourceY = pageNum * pageHeightPx;
        const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          // Draw the slice from the main canvas
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,  // source
            0, 0, canvas.width, sourceHeight          // destination
          );

          // Convert to image and add to PDF
          const pageImgData = pageCanvas.toDataURL('image/jpeg', settings.imageQuality);
          const sliceHeightMm = sourceHeight / pxPerMm;

          pdf.addImage(pageImgData, 'JPEG', marginX, marginY, contentWidth, sliceHeightMm);
        }

        onProgress?.(75 + (pageNum / totalPages) * 20, `Generating page ${pageNum + 1}/${totalPages}...`);
      }

      onProgress?.(95, 'Finalizing...');

      const pdfBlob = pdf.output('blob');

      onProgress?.(100, 'Conversion complete!');

      return {
        success: true,
        data: pdfBlob,
        metadata: {
          pageCount: totalPages, // Actual page count
          originalSize: file.size,
          processedSize: pdfBlob.size,
          processingTime: 0 // Track if needed
        }
      };

    } catch (error) {
      console.error('Formatted Word to PDF conversion error:', error);
      return {
        success: false,
        error: this.createPDFError(error, 'Word to PDF (formatted) conversion failed')
      };
    }
  }

  /**
   * Load Unicode-compatible font from CDN (supports Cyrillic, Extended Latin, etc.)
   */
  private async loadUnicodeFont(pdfDoc: PDFDocument): Promise<import('pdf-lib').PDFFont> {
    const fontUrls = [
      'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff',
      'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'
    ];

    for (const fontUrl of fontUrls) {
      try {
        console.log(`🔤 Loading font from: ${fontUrl}`);

        const response = await fetch(fontUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'application/font-woff2,application/font-woff,application/font-ttf,*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const fontBytes = await response.arrayBuffer();

        if (fontBytes.byteLength < 1000) {
          throw new Error('Font data too small');
        }

        const font = await pdfDoc.embedFont(fontBytes);
        console.log(`✅ Font loaded successfully from ${fontUrl}`);
        return font;

      } catch (error) {
        console.warn(`❌ Failed to load font from ${fontUrl}:`, error);
        continue;
      }
    }

    throw new Error('All font sources failed');
  }

  /**
   * Convert PDF to Word document (.docx)
   * Uses pdfjs to extract text and images, then docx library to create DOCX
   * Supports options: includeImages, smartHeadings
   */
  async pdfToWord(
    file: File,
    onProgress?: ProgressCallback,
    options?: {
      includeImages?: boolean;
      smartHeadings?: boolean;
      extractImages?: boolean;
      extractComments?: boolean;
    }
  ): Promise<PDFProcessingResult> {
    const includeImages = options?.includeImages ?? true;
    const smartHeadings = options?.smartHeadings ?? true;
    const extractImages = options?.extractImages ?? true;
    const extractComments = options?.extractComments ?? false;

    try {
      onProgress?.(5, 'Reading PDF file...');

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      onProgress?.(10, 'Analyzing document structure...');

      // === SMART HEADING DETECTION: Pre-analyze all pages ===
      // Collect font size statistics across the entire document
      interface FontSizeStats {
        size: number;
        count: number;
        totalChars: number;
      }
      const fontSizeMap = new Map<number, FontSizeStats>();
      let totalTextItems = 0;
      let bodyTextSize: number | undefined;
      const headingSizes: Map<number, 'Heading1' | 'Heading2' | 'Heading3'> = new Map();

      if (smartHeadings && !includeImages) {
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const items = textContent.items as PDFTextItem[];

          for (const item of items) {
            if (item.height && item.str?.trim()) {
              // Round to nearest 0.5 to group similar sizes
              const roundedSize = Math.round(item.height * 2) / 2;
              const existing = fontSizeMap.get(roundedSize);
              if (existing) {
                existing.count++;
                existing.totalChars += item.str.length;
              } else {
                fontSizeMap.set(roundedSize, {
                  size: roundedSize,
                  count: 1,
                  totalChars: item.str.length
                });
              }
              totalTextItems++;
            }
          }
        }

        // Determine body text size (most common size by character count)
        let maxChars = 0;
        bodyTextSize = 12; // Initialize bodyTextSize here
        for (const [size, stats] of fontSizeMap) {
          if (stats.totalChars > maxChars) {
            maxChars = stats.totalChars;
            bodyTextSize = size;
          }
        }

        // Identify heading sizes: larger than body text and relatively rare
        // Sort sizes descending
        const sortedSizes = Array.from(fontSizeMap.values())
          .filter(s => s.size > (bodyTextSize || 0)) // Use bodyTextSize, default to 0 if undefined
          .sort((a, b) => b.size - a.size);

        // Assign heading levels to the top 3 largest sizes that are rare (< 10% of items)
        let headingLevel = 1;
        for (const sizeStats of sortedSizes) {
          if (headingLevel > 3) break;
          // Heading should be rare: less than 10% of text items
          const frequency = sizeStats.count / totalTextItems;
          if (frequency < 0.1) {
            headingSizes.set(sizeStats.size, `Heading${headingLevel}` as 'Heading1' | 'Heading2' | 'Heading3');
            headingLevel++;
          }
        }

        // Store for use in page processing
        // headingSizes and bodyTextSize are available in closure
      }

      onProgress?.(15, 'Extracting content from PDF...');

      // Extract text and images from all pages
      const sections: Paragraph[] = [];
      const allExtractedComments = new Map<string, { numId: number; author: string; text: string }>();
      const matchedComments = new Set<string>();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);

        if (includeImages) {
          // Mode: Render page as image (preserves layout)
          try {
            const scale = 2; // Higher quality
            const viewport = page.getViewport({ scale }); // Renamed from _viewport to viewport
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
              };
              // @ts-expect-error - page.render expects specific context type
              await page.render(renderContext).promise;
              // Convert canvas to PNG blob
              const pngBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92);
              });

              if (pngBlob) {
                const buffer = await pngBlob.arrayBuffer();

                // Calculate dimensions to fit A4 page (width ~595px at 72dpi)
                const maxWidth = 550;
                const maxHeight = 750;
                let width = viewport.width;
                let height = viewport.height;

                if (width > maxWidth) {
                  const ratio = maxWidth / width;
                  width = maxWidth;
                  height = Math.round(height * ratio);
                }
                if (height > maxHeight) {
                  const ratio = maxHeight / height;
                  height = maxHeight;
                  width = Math.round(width * ratio);
                }

                sections.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: new Uint8Array(buffer),
                        transformation: {
                          width: width,
                          height: height,
                        },
                        type: 'png',
                      }),
                    ],
                  })
                );
              }
            }
          } catch (pageImgError) {
            console.warn('Image rendering error on page', pageNum, pageImgError);
          }
        } else {
          // Mode: Extract text with optional embedded images
          const textContent = await page.getTextContent();
          const annotations = extractComments ? await page.getAnnotations() : [];
          const viewport = page.getViewport({ scale: 1.0 });
          const pageWidth = viewport.width;
          const pageHeight = viewport.height;
          const items = textContent.items as PDFTextItem[];

          // Filter for Text (Sticky Note) annotations with content
          interface PDFAnnotation {
            id: string;
            subtype: string;
            contents: string;
            rect: number[];
            author?: string;
          }
          const pageComments = (annotations as unknown as PDFAnnotation[])
            .filter(ann => (ann.subtype === 'Text' || ann.subtype === 'FreeText') && ann.contents)
            .map(ann => ({
              id: ann.id,
              text: ann.contents,
              author: ann.author || 'Author',
              // PDF rect: [x_min, y_min, x_max, y_max], origin at bottom-left
              x: ann.rect[0],
              y: ann.rect[3], // Top edge of the annotation
              yNormalized: 1 - (ann.rect[3] / pageHeight)
            }));

          // Use pre-analyzed heading sizes from document analysis
          // headingSizes and bodyTextSize are available in closure
          const avgFontSize = (typeof bodyTextSize !== 'undefined') ? bodyTextSize : 12;

          // === EXTRACT EMBEDDED IMAGES ===
          interface ExtractedImage {
            data: Uint8Array;
            x: number;
            y: number;
            width: number;
            height: number;
            yNormalized: number; // Y position from top (0-1)
          }
          const pageImages: ExtractedImage[] = [];

          if (extractImages) {
            try {
              const operatorList = await page.getOperatorList();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const objs = (page as any).objs;

              // Track current transformation matrix
              let currentMatrix = [1, 0, 0, 1, 0, 0];
              const matrixStack: number[][] = [];

              for (let i = 0; i < operatorList.fnArray.length; i++) {
                const fn = operatorList.fnArray[i];
                const args = operatorList.argsArray[i];

                // Track transformation matrix changes
                if (fn === 10) { // OPS.save
                  matrixStack.push([...currentMatrix]);
                } else if (fn === 11) { // OPS.restore
                  if (matrixStack.length > 0) {
                    currentMatrix = matrixStack.pop()!;
                  }
                } else if (fn === 12) { // OPS.transform
                  if (args && args.length >= 6) {
                    // Multiply matrices
                    const [a, b, c, d, e, f] = args;
                    const [a2, b2, c2, d2, e2, f2] = currentMatrix;
                    currentMatrix = [
                      a * a2 + b * c2,
                      a * b2 + b * d2,
                      c * a2 + d * c2,
                      c * b2 + d * d2,
                      e * a2 + f * c2 + e2,
                      e * b2 + f * d2 + f2
                    ];
                  }
                }

                // OPS.paintImageXObject = 85, OPS.paintJpegXObject = 82, OPS.paintInlineImageXObject = 84
                if (fn === 85 || fn === 82 || fn === 84) {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let imgData: any = null;

                    if (fn === 84) {
                      // Inline image - data is directly in args
                      imgData = args[0];
                    } else {
                      // XObject image - need to fetch from objs
                      const imgName = args[0];

                      // Try different methods to get image data
                      if (objs._objs && objs._objs.has(imgName)) {
                        imgData = objs._objs.get(imgName).data;
                      } else if (typeof objs.get === 'function') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        imgData = await new Promise<any>((resolve) => {
                          const timeout = setTimeout(() => resolve(null), 1000);
                          try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            objs.get(imgName, (data: any) => {
                              clearTimeout(timeout);
                              resolve(data);
                            });
                          } catch {
                            clearTimeout(timeout);
                            resolve(null);
                          }
                        });
                      }
                    }

                    if (imgData && imgData.width && imgData.height) {
                      // Get position and size from current transformation matrix
                      const imgWidth = Math.abs(currentMatrix[0]) || imgData.width;
                      const imgHeight = Math.abs(currentMatrix[3]) || imgData.height;
                      const imgX = currentMatrix[4] || 0;
                      const imgY = currentMatrix[5] || 0;

                      // Skip very small images (likely decorative)
                      if (imgWidth < 20 || imgHeight < 20) continue;

                      // Convert image data to PNG
                      const canvas = document.createElement('canvas');
                      canvas.width = imgData.width;
                      canvas.height = imgData.height;
                      const ctx = canvas.getContext('2d');

                      if (ctx && imgData.data) {
                        const canvasImageData = ctx.createImageData(imgData.width, imgData.height);
                        const srcData = imgData.data;
                        const dstData = canvasImageData.data;
                        const pixelCount = imgData.width * imgData.height;

                        // Determine format based on data length
                        const bytesPerPixel = srcData.length / pixelCount;

                        if (bytesPerPixel >= 4) {
                          // RGBA format
                          for (let p = 0; p < pixelCount; p++) {
                            dstData[p * 4] = srcData[p * 4];
                            dstData[p * 4 + 1] = srcData[p * 4 + 1];
                            dstData[p * 4 + 2] = srcData[p * 4 + 2];
                            dstData[p * 4 + 3] = srcData[p * 4 + 3];
                          }
                        } else if (bytesPerPixel >= 3) {
                          // RGB format
                          for (let p = 0; p < pixelCount; p++) {
                            dstData[p * 3] = srcData[p * 3];
                            dstData[p * 3 + 1] = srcData[p * 3 + 1];
                            dstData[p * 3 + 2] = srcData[p * 3 + 2];
                            dstData[p * 4 + 3] = 255;
                          }
                        } else if (bytesPerPixel >= 1) {
                          // Grayscale format
                          for (let p = 0; p < pixelCount; p++) {
                            const gray = srcData[p];
                            dstData[p * 4] = gray;
                            dstData[p * 4 + 1] = gray;
                            dstData[p * 4 + 2] = gray;
                            dstData[p * 4 + 3] = 255;
                          }
                        } else {
                          continue; // Unknown format
                        }

                        ctx.putImageData(canvasImageData, 0, 0);

                        const pngBlob = await new Promise<Blob | null>((resolve) => {
                          canvas.toBlob((blob) => resolve(blob), 'image/png', 0.9);
                        });

                        if (pngBlob && pngBlob.size > 500) { // Skip very small images
                          const buffer = await pngBlob.arrayBuffer();

                          // Calculate Y position from top (normalized 0-1)
                          const yFromTop = 1 - (imgY / pageHeight);

                          pageImages.push({
                            data: new Uint8Array(buffer),
                            x: imgX,
                            y: imgY,
                            width: imgWidth,
                            height: imgHeight,
                            yNormalized: Math.max(0, Math.min(1, yFromTop))
                          });
                        }
                      }
                    }
                  } catch (imgError) {
                    // Skip this image if extraction fails
                    console.warn('Failed to extract image:', imgError);
                  }
                }
              }
            } catch (opError) {
              console.warn('Failed to get operator list for images:', opError);
            }
          }

          // === COLUMN DETECTION ===
          // Detect columns by finding vertical gaps in text distribution
          const detectColumns = (textItems: PDFTextItem[], pageWidth: number): number[] => {
            if (textItems.length < 10) return []; // Not enough items to detect columns

            // Collect all X positions with their widths
            const xRanges: Array<{ start: number; end: number }> = [];
            for (const item of textItems) {
              if (!item.str?.trim() || !item.transform) continue;
              const x = item.transform[4];
              const width = item.width || (item.str.length * (item.height || 12) * 0.5);
              xRanges.push({ start: x, end: x + width });
            }

            if (xRanges.length < 10) return [];

            // Create histogram of X coverage (buckets of 10px)
            const bucketSize = 10;
            const numBuckets = Math.ceil(pageWidth / bucketSize);
            const histogram = new Array(numBuckets).fill(0);

            for (const range of xRanges) {
              const startBucket = Math.max(0, Math.floor(range.start / bucketSize));
              const endBucket = Math.min(numBuckets - 1, Math.floor(range.end / bucketSize));
              for (let b = startBucket; b <= endBucket; b++) {
                histogram[b]++;
              }
            }

            // Find gaps (consecutive empty or near-empty buckets)
            const minGapWidth = pageWidth * 0.05; // Minimum 5% of page width
            const threshold = Math.max(2, xRanges.length * 0.02); // Buckets with < 2% of items considered empty

            const gaps: Array<{ start: number; end: number; center: number }> = [];
            let gapStart = -1;

            // Only look for gaps in the middle 80% of the page (10%-90%)
            const startBucket = Math.floor(numBuckets * 0.1);
            const endBucket = Math.floor(numBuckets * 0.9);

            for (let b = startBucket; b <= endBucket; b++) {
              if (histogram[b] <= threshold) {
                if (gapStart === -1) gapStart = b;
              } else {
                if (gapStart !== -1) {
                  const gapEnd = b - 1;
                  const gapWidth = (gapEnd - gapStart + 1) * bucketSize;
                  if (gapWidth >= minGapWidth) {
                    gaps.push({
                      start: gapStart * bucketSize,
                      end: (gapEnd + 1) * bucketSize,
                      center: ((gapStart + gapEnd + 1) / 2) * bucketSize
                    });
                  }
                  gapStart = -1;
                }
              }
            }

            // Close any open gap at the end
            if (gapStart !== -1) {
              const gapEnd = endBucket;
              const gapWidth = (gapEnd - gapStart + 1) * bucketSize;
              if (gapWidth >= minGapWidth) {
                gaps.push({
                  start: gapStart * bucketSize,
                  end: (gapEnd + 1) * bucketSize,
                  center: ((gapStart + gapEnd + 1) / 2) * bucketSize
                });
              }
            }

            // Return column boundaries (centers of gaps)
            // Limit to max 3 columns (2 gaps)
            return gaps.slice(0, 2).map(g => g.center);
          };

          const columnBoundaries = detectColumns(items, pageWidth);

          // Split items into columns
          const splitIntoColumns = (textItems: PDFTextItem[], boundaries: number[]): PDFTextItem[][] => {
            if (boundaries.length === 0) return [textItems];

            const columns: PDFTextItem[][] = [];
            const sortedBoundaries = [0, ...boundaries, Infinity];

            for (let i = 0; i < sortedBoundaries.length - 1; i++) {
              const left = sortedBoundaries[i];
              const right = sortedBoundaries[i + 1];
              const columnItems = textItems.filter(item => {
                if (!item.transform) return false;
                const x = item.transform[4];
                return x >= left && x < right;
              });
              if (columnItems.length > 0) {
                columns.push(columnItems);
              }
            }

            return columns.length > 0 ? columns : [textItems];
          };

          const columns = splitIntoColumns(items, columnBoundaries);

          // Process each column separately
          const processColumn = (columnItems: PDFTextItem[]): Array<{ text: string; fontSize: number; y: number; xStart: number; xEnd: number }> => {
            // Sort items by Y (top to bottom), then by X (left to right)
            const sortedItems = [...columnItems].sort((a, b) => {
              const yA = a.transform ? a.transform[5] : 0;
              const yB = b.transform ? b.transform[5] : 0;
              const yDiff = yB - yA; // Higher Y = higher on page in PDF coordinates
              if (Math.abs(yDiff) > 2) return yDiff;
              const xA = a.transform ? a.transform[4] : 0;
              const xB = b.transform ? b.transform[4] : 0;
              return xA - xB;
            });

            // Group text items by line (same Y position)
            const lines: Array<{ text: string; fontSize: number; y: number; xStart: number; xEnd: number }> = [];
            let currentLine = '';
            let currentFontSize = 0;
            let lastY = -1;
            let lastX = -1;
            let lineXStart = 0;
            let lineXEnd = 0;

            for (let i = 0; i < sortedItems.length; i++) {
              const item = sortedItems[i];
              if (!item.str) continue;

              const itemY = item.transform ? item.transform[5] : 0;
              const itemX = item.transform ? item.transform[4] : 0;
              const itemWidth = item.width || (item.str.length * (item.height || 12) * 0.5);
              const itemHeight = item.height || 12;

              // Check if this is a new line (Y position changed)
              const isNewLine = lastY !== -1 && Math.abs(itemY - lastY) > 2;

              if (isNewLine && currentLine.trim()) {
                lines.push({
                  text: currentLine.trim(),
                  fontSize: currentFontSize,
                  y: lastY,
                  xStart: lineXStart,
                  xEnd: lineXEnd
                });
                currentLine = '';
                currentFontSize = 0;
                lastX = -1;
                lineXStart = itemX;
                lineXEnd = itemX + itemWidth;
              }

              // Track line boundaries
              if (currentLine === '') {
                lineXStart = itemX;
              }
              lineXEnd = itemX + itemWidth;

              // Add space if there's a gap between words on same line
              if (currentLine && lastX !== -1) {
                const gap = itemX - lastX;
                if (gap > itemHeight * 0.3) {
                  currentLine += ' ';
                }
              }

              currentLine += item.str;
              if (item.height) currentFontSize = Math.max(currentFontSize, item.height);
              lastY = itemY;
              lastX = itemX + itemWidth;
            }

            // Add last line
            if (currentLine.trim()) {
              lines.push({
                text: currentLine.trim(),
                fontSize: currentFontSize,
                y: lastY,
                xStart: lineXStart,
                xEnd: lineXEnd
              });
            }

            return lines;
          };

          // Process all columns and combine lines
          const allLines: Array<{ text: string; fontSize: number; y: number; columnIndex: number; xStart: number; xEnd: number }> = [];
          for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            const columnLines = processColumn(columns[colIndex]);
            for (const line of columnLines) {
              allLines.push({ ...line, columnIndex: colIndex });
            }
          }

          // Collect all page elements (paragraphs and images) with Y positions for proper ordering
          interface PageElement {
            type: 'paragraph' | 'image';
            yPosition: number; // Y from top (higher = lower on page in output)
            paragraph?: Paragraph;
            image?: ExtractedImage;
          }
          const pageElements: PageElement[] = [];

          // Add images to page elements
          for (const img of pageImages) {
            pageElements.push({
              type: 'image',
              yPosition: img.yNormalized,
              image: img
            });
          }

          // Group lines into paragraphs, processing columns sequentially
          // (all paragraphs from column 0, then column 1, etc.)
          for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            const columnLines = allLines
              .filter(l => l.columnIndex === colIndex)
              .sort((a, b) => b.y - a.y); // Sort by Y descending (top to bottom)

            let paragraphLines: string[] = [];
            let paragraphFontSize = 0;
            let paragraphXStart = 0;
            let paragraphXEnd = 0;
            let paragraphYStart = 0; // Track Y position for ordering

            for (let i = 0; i < columnLines.length; i++) {
              const line = columnLines[i];
              const nextLine = columnLines[i + 1];

              // Track Y position of first line in paragraph
              if (paragraphLines.length === 0) {
                paragraphYStart = line.y;
              }

              paragraphLines.push(line.text);
              paragraphFontSize = Math.max(paragraphFontSize, line.fontSize);

              // Track paragraph bounds for centering detection
              if (paragraphLines.length === 1) {
                paragraphXStart = line.xStart;
                paragraphXEnd = line.xEnd;
              } else {
                paragraphXStart = Math.min(paragraphXStart, line.xStart);
                paragraphXEnd = Math.max(paragraphXEnd, line.xEnd);
              }

              // Check if paragraph ends (large gap to next line, or end of lines)
              const lineHeight = line.fontSize || 12;
              const gapToNext = nextLine ? Math.abs(line.y - nextLine.y) : 999;
              const isParagraphEnd = !nextLine || gapToNext > lineHeight * 2;

              if (isParagraphEnd && paragraphLines.length > 0) {
                const paraText = paragraphLines.join(' ');
                let headingLevel: 'Heading1' | 'Heading2' | 'Heading3' | undefined;

                // === TEXT ALIGNMENT DETECTION ===
                const lineWidth = paragraphXEnd - paragraphXStart;
                const leftMargin = paragraphXStart;
                const rightMargin = pageWidth - paragraphXEnd;
                const centerThreshold = pageWidth * 0.1; // 10% tolerance for centering
                const rightAlignThreshold = pageWidth * 0.15; // 15% tolerance for right align

                // Check if text is centered (both margins roughly equal)
                const isCentered = Math.abs(leftMargin - rightMargin) < centerThreshold;
                // Check if text is right-aligned (small right margin, large left margin)
                const isRightAligned = rightMargin < rightAlignThreshold && leftMargin > pageWidth * 0.3;
                // Check if text spans most of the page width (justified or left-aligned body text)
                const isFullWidth = lineWidth > pageWidth * 0.7;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let alignment: any;
                if (isCentered && !isFullWidth) {
                  alignment = AlignmentType.CENTER;
                } else if (isRightAligned && !isFullWidth) {
                  alignment = AlignmentType.RIGHT;
                }
                // Left alignment is default, no need to set explicitly

                if (smartHeadings && paragraphFontSize > 0) {
                  // Round font size to match pre-analyzed sizes
                  const roundedFontSize = Math.round(paragraphFontSize * 2) / 2;

                  // First try: use pre-analyzed heading sizes (most accurate)
                  if (headingSizes && headingSizes.has(roundedFontSize)) {
                    headingLevel = headingSizes.get(roundedFontSize);
                  } else {
                    // Fallback: use ratio-based detection
                    const fontRatio = paragraphFontSize / avgFontSize;
                    if (fontRatio >= 1.6) headingLevel = 'Heading1';
                    else if (fontRatio >= 1.3) headingLevel = 'Heading2';
                    else if (fontRatio >= 1.15) headingLevel = 'Heading3';
                  }

                  // Boost: centered short text with larger font is likely a heading
                  const isShortText = paraText.length < 100 && paragraphLines.length <= 2;

                  if (isCentered && isShortText && paragraphFontSize > avgFontSize && !headingLevel) {
                    // Centered short text with larger font → likely Heading2
                    headingLevel = 'Heading2';
                  }
                }

                // === LIST DETECTION ===
                // Check for bullet list patterns: •, -, *, ◦, ▪, ▸, ►, ●, ○
                const bulletPattern = /^\s*([•\-*◦▪▸►●○])\s+(.+)$/;
                // Check for numbered list patterns: 1. 2. 3. or 1) 2) 3) or (1) (2) (3)
                const numberedPattern = /^\s*(?:(\d+)[.):]|\((\d+)\))\s+(.+)$/;

                const bulletMatch = paraText.match(bulletPattern);
                const numberedMatch = paraText.match(numberedPattern);

                // Calculate normalized Y position for ordering
                const paragraphYNormalized = 1 - (paragraphYStart / pageHeight);

                // Match annotations to this paragraph
                let activeCommentId: string | undefined;
                if (extractComments) {
                  const closestAnn = pageComments.find(ann => {
                    // Within range of the paragraph Y
                    const yDist = Math.abs(ann.yNormalized - paragraphYNormalized);
                    return yDist < 0.05 && !matchedComments.has(ann.id);
                  });

                  if (closestAnn) {
                    activeCommentId = closestAnn.id;
                    matchedComments.add(activeCommentId);

                    // Store for global document comments collection
                    const numId = allExtractedComments.size;
                    allExtractedComments.set(activeCommentId, {
                      numId,
                      author: closestAnn.author,
                      text: closestAnn.text
                    });
                  }
                }

                let para: Paragraph;
                const paraChildren: (TextRun | ImageRun | CommentRangeStart | CommentRangeEnd)[] = [];

                if (activeCommentId !== undefined) {
                  const commentData = allExtractedComments.get(activeCommentId)!;
                  paraChildren.push(new CommentRangeStart(commentData.numId));
                }

                if (bulletMatch && !headingLevel) {
                  const listText = bulletMatch[2];
                  paraChildren.push(new TextRun({ text: listText, size: 22 }));

                  if (activeCommentId !== undefined) {
                    paraChildren.push(new CommentRangeEnd(allExtractedComments.get(activeCommentId)!.numId));
                  }

                  para = new Paragraph({
                    children: paraChildren,
                    bullet: { level: 0 },
                    alignment: alignment,
                  });
                } else if (numberedMatch && !headingLevel) {
                  const listText = numberedMatch[3];
                  paraChildren.push(new TextRun({ text: listText, size: 22 }));

                  if (activeCommentId !== undefined) {
                    paraChildren.push(new CommentRangeEnd(allExtractedComments.get(activeCommentId)!.numId));
                  }

                  para = new Paragraph({
                    children: paraChildren,
                    numbering: { reference: 'default-numbering', level: 0 },
                    alignment: alignment,
                  });
                } else {
                  paraChildren.push(new TextRun({
                    text: paraText,
                    size: 22,
                    bold: headingLevel !== undefined,
                  }));

                  if (activeCommentId !== undefined) {
                    paraChildren.push(new CommentRangeEnd(allExtractedComments.get(activeCommentId)!.numId));
                  }

                  para = new Paragraph({
                    children: paraChildren,
                    heading: headingLevel,
                    alignment: alignment,
                  });
                }

                pageElements.push({
                  type: 'paragraph',
                  yPosition: paragraphYNormalized,
                  paragraph: para
                });

                paragraphLines = [];
                paragraphFontSize = 0;
                paragraphXStart = 0;
                paragraphXEnd = 0;
              }
            }
          }

          // Sort all elements by Y position (top to bottom)
          pageElements.sort((a, b) => a.yPosition - b.yPosition);

          // Add elements to sections with proper image handling
          for (const element of pageElements) {
            if (element.type === 'paragraph' && element.paragraph) {
              sections.push(element.paragraph);
            } else if (element.type === 'image' && element.image) {
              // Determine image alignment based on X position
              const img = element.image;
              const imgCenterX = img.x + img.width / 2;
              const pageCenter = pageWidth / 2;

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let imgAlignment = AlignmentType.LEFT as any;
              if (Math.abs(imgCenterX - pageCenter) < pageWidth * 0.15) {
                imgAlignment = AlignmentType.CENTER;
              } else if (imgCenterX > pageCenter + pageWidth * 0.2) {
                imgAlignment = AlignmentType.RIGHT;
              }

              // Scale image to fit Word page width (max ~500px)
              const maxImgWidth = 500;
              const maxImgHeight = 600;
              let scaledWidth = img.width;
              let scaledHeight = img.height;

              if (scaledWidth > maxImgWidth) {
                const ratio = maxImgWidth / scaledWidth;
                scaledWidth = maxImgWidth;
                scaledHeight = Math.round(scaledHeight * ratio);
              }
              if (scaledHeight > maxImgHeight) {
                const ratio = maxImgHeight / scaledHeight;
                scaledHeight = maxImgHeight;
                scaledWidth = Math.round(scaledWidth * ratio);
              }

              // Determine if image should float (for smaller images not centered)
              const isSmallImage = scaledWidth < pageWidth * 0.4;
              const shouldFloat = isSmallImage && imgAlignment !== AlignmentType.CENTER;

              if (shouldFloat) {
                // Floating image with text wrap
                const horizontalPos = img.x < pageWidth / 2 ? 'left' : 'right';
                sections.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: img.data,
                        transformation: {
                          width: scaledWidth,
                          height: scaledHeight,
                        },
                        type: 'png',
                        floating: {
                          horizontalPosition: {
                            relative: 'column',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            align: horizontalPos as any,
                          },
                          verticalPosition: {
                            relative: 'paragraph',
                            offset: 0,
                          },
                          wrap: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            type: 'square' as any,
                            side: 'bothSides',
                          },
                          margins: {
                            top: 100000,
                            bottom: 100000,
                            left: horizontalPos === 'right' ? 200000 : 0,
                            right: horizontalPos === 'left' ? 200000 : 0,
                          },
                        },
                      }),
                    ],
                  })
                );
              } else {
                // Inline image (centered or full-width)
                sections.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: img.data,
                        transformation: {
                          width: scaledWidth,
                          height: scaledHeight,
                        },
                        type: 'png',
                      }),
                    ],
                    alignment: imgAlignment,
                  })
                );
              }
            }
          }
        }

        // Add page break after each page except the last one
        if (pageNum < numPages) {
          sections.push(
            new Paragraph({
              children: [],
              pageBreakBefore: true,
            })
          );
        }

        onProgress?.(15 + (pageNum / numPages) * 60, `Processing page ${pageNum}/${numPages}...`);
      }

      onProgress?.(80, 'Creating Word document...');

      // Create DOCX document with numbering definition for lists
      const doc = new Document({
        numbering: {
          config: [
            {
              reference: 'default-numbering',
              levels: [
                {
                  level: 0,
                  format: 'decimal',
                  text: '%1.',
                  alignment: 'start',
                  style: {
                    paragraph: {
                      indent: { left: 720, hanging: 360 },
                    },
                  },
                },
              ],
            },
          ],
        },
        sections: [
          {
            properties: {},
            children: sections,
          },
        ],
        comments: extractComments ? {
          children: Array.from(allExtractedComments.values()).map(c => ({
            id: c.numId,
            author: c.author,
            initials: c.author.substring(0, 2).toUpperCase(),
            date: new Date(),
            children: [new Paragraph(c.text)],
          }))
        } : undefined
      });

      onProgress?.(90, 'Generating DOCX file...');

      // Generate blob
      const docxBuffer = await Packer.toBlob(doc);

      onProgress?.(100, 'Conversion complete!');

      return {
        success: true,
        data: docxBuffer,
        metadata: {
          pageCount: numPages, // Approximation or track actual pages
          originalSize: file.size,
          processedSize: docxBuffer.size,
          processingTime: 0 // Track if needed
        }
      };

    } catch (error) {
      console.error('PDF to Word conversion error:', error);
      return {
        success: false,
        error: this.createPDFError(error, 'PDF to Word conversion failed')
      };
    }
  }

  /**
   * Find text occurrences in PDF using PDF.js
   */
  async findTextInPDF(
    file: File,
    searchText: string,
    pageNumber?: number
  ): Promise<import('@/types/pdf').TextOccurrence[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const occurrences: import('@/types/pdf').TextOccurrence[] = [];

      const startPage = pageNumber || 1;
      const endPage = pageNumber || pdf.numPages;

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        // Search through text items
        for (const item of textContent.items) {
          if ('str' in item && item.str.toLowerCase().includes(searchText.toLowerCase())) {
            const transform = item.transform;
            const x = transform[4];
            const y = viewport.height - transform[5]; // Convert to top-left origin
            const width = item.width || 100;
            const height = item.height || 20;

            occurrences.push({
              id: `search-${pageNum}-${x}-${y}`,
              pageNumber: pageNum,
              text: item.str,
              mode: 'replace', // Default to replace mode
              x,
              y,
              width,
              height,
            });
          }
        }
      }

      return occurrences;
    } catch (error) {
      console.error('Error finding text in PDF:', error);
      throw this.createPDFError(error, 'Text search failed');
    }
  }

  /**
   * Create a standardized PDF error
   */
  private createPDFError(error: unknown, context: string = 'PDF processing'): ProcessingError {
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

  /**
   * Add form fields to PDF
   * Creates interactive fillable forms with text fields, checkboxes, radio buttons, and dropdowns
   */
  async addFormFieldsToPDF(
    file: File,
    options: FormFieldOptions
  ): Promise<PDFProcessingResult<Blob>> {
    try {
      const { fields, onProgress } = options;

      onProgress?.(10, 'Loading PDF document...');

      // Load the PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      onProgress?.(20, 'Creating form...');

      // Get or create the form
      const form = pdfDoc.getForm();

      // Process each field
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const progress = 20 + (i / fields.length) * 60;
        onProgress?.(progress, `Adding field ${i + 1}/${fields.length}...`);

        // Get the page
        const page = pdfDoc.getPage(field.page);
        const { height: pageHeight } = page.getSize();

        // Convert Y coordinate (canvas uses top-left origin, PDF uses bottom-left)
        const pdfY = pageHeight - field.y - field.height;

        try {
          switch (field.type) {
            case 'text': {
              const textField = field as TextFormField;
              const pdfTextField = form.createTextField(textField.name);
              pdfTextField.addToPage(page, {
                x: textField.x,
                y: pdfY,
                width: textField.width,
                height: textField.height,
              });

              if (textField.defaultValue) {
                pdfTextField.setText(textField.defaultValue);
              }
              if (textField.maxLength) {
                pdfTextField.setMaxLength(textField.maxLength);
              }
              if (textField.fontSize) {
                pdfTextField.defaultUpdateAppearances(await pdfDoc.embedFont(StandardFonts.Helvetica));
              }
              if (textField.required) {
                pdfTextField.enableRequired();
              }
              if (textField.readonly) {
                pdfTextField.enableReadOnly();
              }
              break;
            }

            case 'multiline': {
              const multilineField = field as MultilineFormField;
              const pdfTextField = form.createTextField(multilineField.name);
              pdfTextField.addToPage(page, {
                x: multilineField.x,
                y: pdfY,
                width: multilineField.width,
                height: multilineField.height,
              });
              pdfTextField.enableMultiline();

              if (multilineField.defaultValue) {
                pdfTextField.setText(multilineField.defaultValue);
              }
              if (multilineField.maxLength) {
                pdfTextField.setMaxLength(multilineField.maxLength);
              }
              if (multilineField.fontSize) {
                pdfTextField.defaultUpdateAppearances(await pdfDoc.embedFont(StandardFonts.Helvetica));
              }
              if (multilineField.required) {
                pdfTextField.enableRequired();
              }
              if (multilineField.readonly) {
                pdfTextField.enableReadOnly();
              }
              break;
            }

            case 'checkbox': {
              const checkboxField = field as CheckboxFormField;
              const pdfCheckbox = form.createCheckBox(checkboxField.name);
              pdfCheckbox.addToPage(page, {
                x: checkboxField.x,
                y: pdfY,
                width: checkboxField.width,
                height: checkboxField.height,
              });

              if (checkboxField.checked) {
                pdfCheckbox.check();
              }
              if (checkboxField.required) {
                pdfCheckbox.enableRequired();
              }
              if (checkboxField.readonly) {
                pdfCheckbox.enableReadOnly();
              }
              break;
            }

            case 'radio': {
              const radioField = field as RadioFormField;
              // Check if radio group already exists
              let radioGroup;
              try {
                radioGroup = form.getRadioGroup(radioField.group);
              } catch {
                radioGroup = form.createRadioGroup(radioField.group);
              }

              radioGroup.addOptionToPage(radioField.value, page, {
                x: radioField.x,
                y: pdfY,
                width: radioField.width,
                height: radioField.height,
              });

              if (radioField.selected) {
                radioGroup.select(radioField.value);
              }
              if (radioField.required) {
                radioGroup.enableRequired();
              }
              if (radioField.readonly) {
                radioGroup.enableReadOnly();
              }
              break;
            }

            case 'dropdown': {
              const dropdownField = field as DropdownFormField;
              const pdfDropdown = form.createDropdown(dropdownField.name);
              pdfDropdown.addToPage(page, {
                x: dropdownField.x,
                y: pdfY,
                width: dropdownField.width,
                height: dropdownField.height,
              });

              pdfDropdown.addOptions(dropdownField.options);

              if (dropdownField.selectedIndex !== undefined && dropdownField.options[dropdownField.selectedIndex]) {
                pdfDropdown.select(dropdownField.options[dropdownField.selectedIndex]);
              }
              if (dropdownField.multiSelect) {
                pdfDropdown.enableMultiselect();
              }
              if (dropdownField.required) {
                pdfDropdown.enableRequired();
              }
              if (dropdownField.readonly) {
                pdfDropdown.enableReadOnly();
              }
              break;
            }
          }
        } catch (fieldError) {
          console.warn(`Failed to add field ${field.name}:`, fieldError);
          // Continue with other fields even if one fails
        }
      }

      onProgress?.(85, 'Saving PDF...');

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

      onProgress?.(100, 'Complete');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: pdfDoc.getPageCount(),
          originalSize: file.size,
          processedSize: blob.size,
          processingTime: 0,
        }
      };
    } catch (error) {
      console.warn('Failed to add fields:', error);
      return {
        success: false,
        error: this.createPDFError(error, 'Failed to add form fields')
      };
    }
  }

  /**
   * Edit text in a PDF using a vector-based approach (no rasterization)
   */
  async editTextInPDFVector(
    file: File,
    options: import('@/types/pdf').VectorEditTextOptions,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult<Blob>> {
    const startTime = Date.now();

    try {
      onProgress?.(0, 'Loading PDF...');
      const {
        selections,
        backgroundColor,
        textColor,
        fontSize,
        fontFamily,
        isBold,
        isItalic,
        textOffsetX,
        textOffsetY,
        canvasScale
      } = options;

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      pdfDoc.registerFontkit(fontkit);

      onProgress?.(10, 'Loading fonts...');

      // Map font family to pdf-lib standard fonts
      const fontMap = {
        'Arial': StandardFonts.Helvetica,
        'Helvetica': StandardFonts.Helvetica,
        'Times New Roman': StandardFonts.TimesRoman,
        'Courier New': StandardFonts.Courier,
        'Georgia': StandardFonts.TimesRoman, // No direct match, use Times
        'Verdana': StandardFonts.Helvetica, // No direct match, use Helvetica
      };

      const boldFontMap = {
        'Arial': StandardFonts.HelveticaBold,
        'Helvetica': StandardFonts.HelveticaBold,
        'Times New Roman': StandardFonts.TimesRomanBold,
        'Courier New': StandardFonts.CourierBold,
        'Georgia': StandardFonts.TimesRomanBold,
        'Verdana': StandardFonts.HelveticaBold,
      };

      const italicFontMap = {
        'Arial': StandardFonts.HelveticaOblique,
        'Helvetica': StandardFonts.HelveticaOblique,
        'Times New Roman': StandardFonts.TimesRomanItalic,
        'Courier New': StandardFonts.CourierOblique,
        'Georgia': StandardFonts.TimesRomanItalic,
        'Verdana': StandardFonts.HelveticaOblique,
      };

      const boldItalicFontMap = {
        'Arial': StandardFonts.HelveticaBoldOblique,
        'Helvetica': StandardFonts.HelveticaBoldOblique,
        'Times New Roman': StandardFonts.TimesRomanBoldItalic,
        'Courier New': StandardFonts.CourierBoldOblique,
        'Georgia': StandardFonts.TimesRomanBoldItalic,
        'Verdana': StandardFonts.HelveticaBoldOblique,
      };

      let fontKey = fontMap[fontFamily];
      if (isBold && isItalic) fontKey = boldItalicFontMap[fontFamily];
      else if (isBold) fontKey = boldFontMap[fontFamily];
      else if (isItalic) fontKey = italicFontMap[fontFamily];

      const font = await pdfDoc.embedFont(fontKey);

      // Group selections by page
      const selectionsByPage = new Map<number, typeof selections>();
      for (const sel of selections) {
        if (!selectionsByPage.has(sel.pageNumber)) {
          selectionsByPage.set(sel.pageNumber, []);
        }
        selectionsByPage.get(sel.pageNumber)!.push(sel);
      }

      const totalPagesToProcess = selectionsByPage.size;
      let processedPages = 0;

      onProgress?.(20, `Preparing to edit ${totalPagesToProcess} pages...`);

      // Process each page
      for (const [pageNum, pageSelections] of selectionsByPage.entries()) {
        const page = pdfDoc.getPage(pageNum - 1);
        const { height: pageHeight } = page.getSize();
        const { width: pageWidth } = page.getSize();

        // Get the original page's viewport to calculate scaling
        const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const pdfjsPage = await pdfjsDoc.getPage(pageNum);
        const viewport = pdfjsPage.getViewport({ scale: canvasScale });

        const scaleX = pageWidth / viewport.width;
        const scaleY = pageHeight / viewport.height;

        for (const sel of pageSelections) {
          // Scale selection coordinates from canvas space to PDF space
          const pdfX = sel.x * scaleX;
          const pdfY = pageHeight - (sel.y * scaleY);
          const pdfWidth = sel.width * scaleX;
          const pdfHeight = sel.height * scaleY;

          // Draw background rectangle
          const bgColor = this.hexToRgb(backgroundColor);
          page.drawRectangle({
            x: pdfX,
            y: pdfY - pdfHeight,
            width: pdfWidth,
            height: pdfHeight,
            color: rgb(bgColor.red, bgColor.green, bgColor.blue),
            borderWidth: 0,
          });

          if (sel.mode === 'replace' && sel.text) {
            // Simple word wrap implementation
            const words = sel.text.split(' ');
            const lines: string[] = [];
            let line = '';
            // Adjust starting Y for text baseline and offset
            let currentY = pdfY - (textOffsetY * scaleY) - (fontSize);

            const textWidth = pdfWidth - (textOffsetX * scaleX * 2);
            const txtColor = this.hexToRgb(textColor);
            const alignment = sel.textAlign || 'left';

            // Build lines with word wrapping
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const width = font.widthOfTextAtSize(testLine, fontSize);
              if (width > textWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
              } else {
                line = testLine;
              }
            }
            if (line.trim()) {
              lines.push(line.trim());
            }

            // Draw each line with proper alignment
            for (const lineText of lines) {
              const lineWidth = font.widthOfTextAtSize(lineText, fontSize);
              let lineX = pdfX + (textOffsetX * scaleX);

              // Apply text alignment
              if (alignment === 'center') {
                lineX += (textWidth - lineWidth) / 2;
              } else if (alignment === 'right') {
                lineX += (textWidth - lineWidth);
              }

              page.drawText(lineText, {
                x: lineX,
                y: currentY,
                font,
                size: fontSize,
                color: rgb(txtColor.red, txtColor.green, txtColor.blue),
              });
              currentY -= (fontSize * 1.2); // Move to next line
            }
          }
        }
        processedPages++;
        onProgress?.(
          20 + (processedPages / totalPagesToProcess) * 70,
          `Processing page ${pageNum} (${processedPages}/${totalPagesToProcess})...`
        );
      }

      onProgress?.(90, 'Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      const resultBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      onProgress?.(100, 'Edits applied successfully!');

      return {
        success: true,
        data: resultBlob,
        metadata: {
          pageCount: pdfDoc.getPageCount(),
          originalSize: file.size,
          processedSize: resultBlob.size,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Error editing text in PDF (Vector):', error);
      return {
        success: false,
        error: this.createPDFError(error, 'Vector text edit failed'),
      };
    }
  }

  /**
   * Helper to convert hex color string to RGB object for pdf-lib
   */
  private hexToRgb(hex: string): { red: number; green: number; blue: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { red: 0, green: 0, blue: 0 }; // Default to black
    }
    return {
      red: parseInt(result[1], 16) / 255,
      green: parseInt(result[2], 16) / 255,
      blue: parseInt(result[3], 16) / 255,
    };
  }

  /**
   * Organize PDF pages - reorder, rotate, and delete pages
   */
  /**
   * Organize PDF pages - reorder, rotate, delete, and insert pages from other files
   */
  async organizePDF(
    file: File,
    pageOperations: Array<{
      originalPageNumber: number;
      newPosition: number;
      rotation: number;
    }>,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    return pageManipulationService.organizePDF(file, pageOperations, onProgress);
  }
}

const pdfService = PDFService.getInstance();
export default pdfService;

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

export const flattenPDF = (file: File, onProgress?: ProgressCallback) =>
  pdfService.flattenPDF(file, onProgress);

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
export const wordToPDF = (
  file: File,
  onProgress?: ProgressCallback,
  options?: { mode?: 'formatted' | 'text'; quality?: 1 | 2 | 3 }
) => pdfService.wordToPDF(file, onProgress, options);
export const pdfToWord = (
  file: File,
  onProgress?: ProgressCallback,
  options?: { includeImages?: boolean; smartHeadings?: boolean }
) => pdfService.pdfToWord(file, onProgress, options);
export const addFormFieldsToPDF = (file: File, options: FormFieldOptions) =>
  pdfService.addFormFieldsToPDF(file, options);

export const organizePDF = (
  file: File,
  pageOperations: Array<{
    originalPageNumber: number;
    newPosition: number;
    rotation: number;
  }>,
  onProgress?: ProgressCallback
) => pdfService.organizePDF(file, pageOperations, onProgress);
