import * as pdfjsLib from 'pdfjs-dist';
import { 
  ImageConversionOptions, 
  ImageConversionResult, 
  ConvertedImage, 
  ImageConversionProgress,
  QUALITY_SETTINGS,
  ImageFormat
} from '../types/image.types';
import { createFileName } from '../utils/fileHelpers';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class PdfToImageService {
  private static instance: PdfToImageService;

  static getInstance(): PdfToImageService {
    if (!this.instance) {
      this.instance = new PdfToImageService();
    }
    return this.instance;
  }

  /**
   * Convert PDF pages to images
   */
  async convertToImages(
    file: File, 
    options: ImageConversionOptions,
    onProgress?: (progress: ImageConversionProgress) => void
  ): Promise<ImageConversionResult> {
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

        const convertedImage = await this.convertPage(
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
          processingTime: Date.now() - startTime,
          format: options.format,
          quality: options.quality,
          resolution: qualitySettings.resolution
        }
      };

    } catch (error) {
      console.error('[PdfToImageService] Conversion failed:', error);
      
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
  private async convertPage(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    options: ImageConversionOptions,
    resolution: number,
    originalFileName: string
  ): Promise<ConvertedImage> {
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
  private canvasToBlob(canvas: HTMLCanvasElement, options: ImageConversionOptions): Promise<Blob> {
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
  private getPageNumbers(totalPages: number, options: ImageConversionOptions): number[] {
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
   * Create ZIP file with multiple images
   */
  async createZipFile(images: ConvertedImage[], filename: string): Promise<Blob> {
    // For now, we'll implement a simple solution without JSZip
    // In a real implementation, you might want to add JSZip dependency
    // This is a placeholder that creates a single blob
    
    if (images.length === 1) {
      return images[0].blob;
    }

    // For multiple images, we'll need to either:
    // 1. Add JSZip dependency
    // 2. Create individual downloads
    // 3. Use browser's native APIs
    
    // For now, return the first image and log a note
    console.warn('Multiple image ZIP creation not implemented yet. Returning first image.');
    return images[0].blob;
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
}