import * as pdfjsLib from 'pdfjs-dist';
import {
  SvgConversionOptions,
  SvgConversionResult,
  ConvertedSvg,
  SvgConversionProgress,
  SVG_QUALITY_SETTINGS,
  SvgFormat
} from '../types/svgConversion.types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class PdfToSvgService {
  private static instance: PdfToSvgService;

  static getInstance(): PdfToSvgService {
    if (!this.instance) {
      this.instance = new PdfToSvgService();
    }
    return this.instance;
  }

  /**
   * Convert PDF pages to SVG
   */
  async convertToSvg(
    file: File,
    options: SvgConversionOptions,
    onProgress?: (progress: SvgConversionProgress) => void
  ): Promise<SvgConversionResult> {
    const startTime = Date.now();

    try {
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
      const pagesToConvert = this.getPageNumbers(totalPages, options);

      onProgress?.({
        currentPage: 0,
        totalPages: pagesToConvert.length,
        percentage: 5,
        status: 'converting',
        message: `Converting ${pagesToConvert.length} pages to SVG...`
      });

      // Convert pages
      const convertedSvgs: ConvertedSvg[] = [];
      const qualitySettings = SVG_QUALITY_SETTINGS[options.quality];

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNumber = pagesToConvert[i];

        onProgress?.({
          currentPage: i + 1,
          totalPages: pagesToConvert.length,
          percentage: 5 + (i / pagesToConvert.length) * 90,
          status: 'converting',
          message: `Converting page ${pageNumber} to SVG...`
        });

        const convertedSvg = await this.convertPageToSvg(
          pdfDoc,
          pageNumber,
          options,
          qualitySettings.resolution,
          qualitySettings.scale,
          file.name
        );

        convertedSvgs.push(convertedSvg);
      }

      onProgress?.({
        currentPage: pagesToConvert.length,
        totalPages: pagesToConvert.length,
        percentage: 100,
        status: 'complete',
        message: 'SVG conversion complete!'
      });

      // Calculate sizes
      const originalSize = file.size;
      const convertedSize = convertedSvgs.reduce((sum, svg) => sum + svg.size, 0);

      return {
        success: true,
        svgs: convertedSvgs,
        totalPages,
        originalSize,
        convertedSize,
        metadata: {
          processingTime: Date.now() - startTime,
          format: options.format,
          quality: options.quality,
          method: options.method,
          resolution: qualitySettings.resolution,
          scale: qualitySettings.scale
        }
      };

    } catch (error) {
      console.error('[PdfToSvgService] Conversion failed:', error);

      return {
        success: false,
        svgs: [],
        totalPages: 0,
        originalSize: file.size,
        convertedSize: 0,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      };
    }
  }

  /**
   * Convert single PDF page to SVG
   */
  private async convertPageToSvg(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    options: SvgConversionOptions,
    resolution: number,
    scale: number,
    originalFileName: string
  ): Promise<ConvertedSvg> {
    // Get page
    const page = await pdfDoc.getPage(pageNumber);

    // Calculate scale for desired resolution and quality
    const viewport = page.getViewport({ scale: 1 });
    const calculatedScale = (resolution / 72) * scale; // 72 DPI is the default
    const scaledViewport = page.getViewport({ scale: calculatedScale });

    // Use canvas-based conversion approach for now
    // In the future, we could implement vector extraction here
    if (options.method === 'vector') {
      // Future implementation: extract actual vectors from PDF
      console.warn('Vector extraction not yet implemented, falling back to canvas method');
    }

    // Create canvas for SVG generation
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Set background color if specified
    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Render page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };

    await page.render(renderContext).promise;

    // Convert canvas to SVG
    const { svgContent, blob, dataUrl } = await this.canvasToSvg(
      canvas, 
      options,
      scaledViewport.width,
      scaledViewport.height
    );

    // Generate filename
    const baseName = originalFileName.replace(/\.pdf$/i, '');
    const filename = `${baseName}_page_${pageNumber}.svg`;

    return {
      pageNumber,
      blob,
      dataUrl,
      svgContent,
      filename,
      size: blob.size,
      dimensions: {
        width: scaledViewport.width,
        height: scaledViewport.height
      }
    };
  }

  /**
   * Convert canvas to SVG with specified options
   */
  private async canvasToSvg(
    canvas: HTMLCanvasElement, 
    options: SvgConversionOptions,
    width: number,
    height: number
  ): Promise<{ svgContent: string; blob: Blob; dataUrl: string }> {
    // Convert canvas to data URL (base64 image)
    const canvasDataUrl = canvas.toDataURL('image/png');

    // Create SVG content with embedded image
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>PDF Page converted to SVG</title>
  <desc>Generated by LocalPDF - PDF to SVG converter</desc>
  ${options.backgroundColor ? `<rect width="100%" height="100%" fill="${options.backgroundColor}"/>` : ''}
  <image x="0" y="0" width="${width}" height="${height}" 
         xlink:href="${canvasDataUrl}" 
         preserveAspectRatio="none"/>
</svg>`;

    // Create blob from SVG content
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    
    // Create data URL for preview
    const dataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

    return { svgContent, blob, dataUrl };
  }

  /**
   * Get array of page numbers to convert based on options
   */
  private getPageNumbers(totalPages: number, options: SvgConversionOptions): number[] {
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
   * Download single SVG
   */
  downloadSvg(svg: ConvertedSvg): void {
    const url = URL.createObjectURL(svg.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = svg.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Download all SVGs as separate files
   */
  downloadAllSvgs(svgs: ConvertedSvg[]): void {
    svgs.forEach((svg, index) => {
      // Add small delay between downloads to avoid browser blocking
      setTimeout(() => {
        this.downloadSvg(svg);
      }, index * 100);
    });
  }

  /**
   * Create ZIP file with multiple SVGs (future implementation)
   */
  async createZipFile(svgs: ConvertedSvg[], filename: string): Promise<Blob> {
    // For now, we'll implement a simple solution without JSZip
    // In a real implementation, you might want to add JSZip dependency
    // This is a placeholder that creates a single blob

    if (svgs.length === 1) {
      return svgs[0].blob;
    }

    // For multiple SVGs, we'll need to either:
    // 1. Add JSZip dependency
    // 2. Create individual downloads
    // 3. Use browser's native APIs

    // For now, return the first SVG and log a note
    console.warn('Multiple SVG ZIP creation not implemented yet. Returning first SVG.');
    return svgs[0].blob;
  }

  /**
   * Optimize SVG content by removing unnecessary elements
   */
  private optimizeSvgContent(svgContent: string): string {
    // Basic SVG optimization (remove comments, unnecessary whitespace, etc.)
    return svgContent
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();
  }

  /**
   * Validate SVG conversion options
   */
  validateOptions(options: SvgConversionOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate resolution
    if (options.resolution && (options.resolution < 72 || options.resolution > 600)) {
      errors.push('Resolution must be between 72 and 600 DPI');
    }

    // Validate scale
    if (options.scale && (options.scale < 0.1 || options.scale > 5.0)) {
      errors.push('Scale must be between 0.1 and 5.0');
    }

    // Validate page range
    if (options.pages === 'range' && options.pageRange) {
      if (options.pageRange.start > options.pageRange.end) {
        errors.push('Page range start must be less than or equal to end');
      }
      if (options.pageRange.start < 1) {
        errors.push('Page range start must be at least 1');
      }
    }

    // Validate specific pages
    if (options.pages === 'specific' && (!options.pageNumbers || options.pageNumbers.length === 0)) {
      errors.push('At least one page number must be specified for specific page selection');
    }

    return { valid: errors.length === 0, errors };
  }
}