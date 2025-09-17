import jsPDF from 'jspdf';
import { PDFProcessingResult, ProgressCallback } from '../types';

export interface ImageToPDFOptions {
  pageSize: 'A4' | 'Letter' | 'Auto' | 'Custom';
  orientation: 'Portrait' | 'Landscape';
  layout: 'FitToPage' | 'ActualSize' | 'FitWidth' | 'FitHeight';
  margin: number; // in points (1 inch = 72 points)
  quality: number; // 0.1 to 1.0
  backgroundColor?: string;
  imagesPerPage?: number; // For multi-image layouts
}

export interface ImageInfo {
  file: File;
  width: number;
  height: number;
  dataUrl: string;
}

class ImageToPDFService {
  name = 'ImageToPDFService';
  version = '1.0.0';

  private static instance: ImageToPDFService;

  static getInstance(): ImageToPDFService {
    if (!this.instance) {
      this.instance = new ImageToPDFService();
    }
    return this.instance;
  }

  /**
   * Check if the service is supported
   */
  isSupported(): boolean {
    return typeof jsPDF !== 'undefined' &&
           typeof File !== 'undefined' &&
           typeof Blob !== 'undefined' &&
           typeof Image !== 'undefined';
  }

  /**
   * Convert images to PDF using jsPDF
   */
  async convertImagesToPDF(
    imageFiles: File[],
    options: ImageToPDFOptions,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();

    try {
      onProgress?.(0, 'Initializing PDF creation...');

      // Validate inputs
      this.validateInputs(imageFiles, options);

      onProgress?.(10, 'Processing images...');

      // Load and process all images
      const imageInfos = await this.loadImages(imageFiles, onProgress);

      onProgress?.(40, 'Creating PDF document...');

      // Get page dimensions
      const pageSize = this.getOptimalPageSize(imageInfos, options);
      
      // Create PDF document with jsPDF
      const pdf = new jsPDF({
        orientation: options.orientation === 'Landscape' ? 'landscape' : 'portrait',
        unit: 'pt',
        format: options.pageSize === 'Letter' ? 'letter' : 'a4'
      });

      onProgress?.(50, 'Adding images to pages...');

      // Add images to PDF
      await this.addImagesToPDFWithJsPDF(pdf, imageInfos, options, onProgress);

      onProgress?.(90, 'Finalizing PDF...');

      // Generate PDF blob
      const pdfBlob = pdf.output('blob');
      const processingTime = performance.now() - startTime;

      onProgress?.(100, 'PDF created successfully!');

      return {
        success: true,
        data: pdfBlob,
        metadata: {
          pageCount: imageInfos.length, // Each image = one page in jsPDF
          originalSize: imageFiles.reduce((sum, file) => sum + file.size, 0),
          processedSize: pdfBlob.size,
          processingTime,
          imageCount: imageFiles.length,
          compressionRatio: this.calculateCompressionRatio(imageFiles, pdfBlob)
        }
      };

    } catch (error) {
      console.error('Images to PDF conversion error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error during conversion',
          code: 'CONVERSION_FAILED'
        }
      };
    }
  }

  /**
   * Get optimal page dimensions for given images
   */
  getOptimalPageSize(images: ImageInfo[], options: ImageToPDFOptions): { width: number; height: number } {
    const pageSizes = {
      A4: { width: 595, height: 842 },
      Letter: { width: 612, height: 792 }
    };

    if (options.pageSize === 'A4' || options.pageSize === 'Letter') {
      const size = pageSizes[options.pageSize];
      return options.orientation === 'Landscape'
        ? { width: size.height, height: size.width }
        : size;
    }

    if (options.pageSize === 'Auto' && images.length > 0) {
      // Calculate optimal size based on largest image
      const maxImage = images.reduce((max, img) =>
        (img.width * img.height > max.width * max.height) ? img : max
      );

      const aspectRatio = maxImage.width / maxImage.height;
      const baseWidth = 595; // A4 width as base

      return {
        width: baseWidth,
        height: baseWidth / aspectRatio
      };
    }

    // Default to A4
    return pageSizes.A4;
  }

  /**
   * Load and process images
   */
  private async loadImages(
    imageFiles: File[],
    onProgress?: ProgressCallback
  ): Promise<ImageInfo[]> {
    const imageInfos: ImageInfo[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const progressPercent = 10 + (i / imageFiles.length) * 30;

      onProgress?.(progressPercent, `Processing image ${i + 1}/${imageFiles.length}...`);

      try {
        const imageInfo = await this.loadSingleImage(file);
        imageInfos.push(imageInfo);
      } catch (error) {
        console.warn(`Failed to load image ${file.name}:`, error);
        throw new Error(`Failed to load image "${file.name}". Please ensure it's a valid image file.`);
      }
    }

    return imageInfos;
  }

  /**
   * Load a single image file
   */
  private async loadSingleImage(file: File): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
      // Additional file validation
      if (!file || file.size === 0) {
        reject(new Error(`File "${file?.name || 'unknown'}" is empty or invalid`));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error(`File "${file.name}" is not a valid image file`));
        return;
      }

      const reader = new FileReader();
      
      // Set timeout for file reading (30 seconds)
      const timeout = setTimeout(() => {
        reader.abort();
        reject(new Error(`Timeout reading file "${file.name}"`));
      }, 30000);

      reader.onload = (event) => {
        clearTimeout(timeout);
        
        const result = event.target?.result;
        if (!result || typeof result !== 'string') {
          reject(new Error(`Failed to read file "${file.name}" as data URL`));
          return;
        }

        const img = new Image();
        
        // Set timeout for image loading (10 seconds)
        const imgTimeout = setTimeout(() => {
          reject(new Error(`Timeout loading image "${file.name}"`));
        }, 10000);

        img.onload = () => {
          clearTimeout(imgTimeout);
          
          // Validate image dimensions
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            reject(new Error(`Invalid image dimensions for "${file.name}"`));
            return;
          }

          resolve({
            file,
            width: img.naturalWidth,
            height: img.naturalHeight,
            dataUrl: result
          });
        };

        img.onerror = () => {
          clearTimeout(imgTimeout);
          reject(new Error(`Failed to load image "${file.name}" - corrupted or unsupported format`));
        };

        try {
          img.src = result;
        } catch (error) {
          clearTimeout(imgTimeout);
          reject(new Error(`Failed to set image source for "${file.name}"`));
        }
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to read file "${file.name}"`));
      };

      reader.onabort = () => {
        clearTimeout(timeout);
        reject(new Error(`File reading aborted for "${file.name}"`));
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Failed to start reading file "${file.name}"`));
      }
    });
  }

  /**
   * Add images to PDF document using jsPDF
   */
  private async addImagesToPDFWithJsPDF(
    pdf: jsPDF,
    imageInfos: ImageInfo[],
    options: ImageToPDFOptions,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const margin = (options.margin || 36) * 0.75; // Convert to jsPDF units (pt to mm conversion)

    for (let i = 0; i < imageInfos.length; i++) {
      const imageInfo = imageInfos[i];
      const progressPercent = 50 + (i / imageInfos.length) * 40;

      onProgress?.(progressPercent, `Adding image ${i + 1}/${imageInfos.length} to PDF...`);

      // Add new page for each image (except the first one)
      if (i > 0) {
        pdf.addPage();
      }

      // Get page dimensions in points
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      try {
        // Calculate image dimensions based on layout option
        const imageDimensions = this.calculateImageDimensionsForJsPDF(
          imageInfo,
          { 
            width: pageWidth - 2 * margin, 
            height: pageHeight - 2 * margin 
          },
          options.layout
        );

        // Center the image on the page
        const x = (pageWidth - imageDimensions.width) / 2;
        const y = (pageHeight - imageDimensions.height) / 2;

        // Add background color if specified
        if (options.backgroundColor && options.backgroundColor !== 'white') {
          const bgColor = this.parseColorForJsPDF(options.backgroundColor);
          pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        // Add image to PDF
        const format = this.getImageFormat(imageInfo.file);
        pdf.addImage(
          imageInfo.dataUrl,
          format,
          x,
          y,
          imageDimensions.width,
          imageDimensions.height
        );

        // Add filename annotation if requested
        if (options.layout !== 'FitToPage') {
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(imageInfo.file.name, margin, pageHeight - margin / 2);
        }

      } catch (error) {
        console.warn(`Failed to add image ${imageInfo.file.name}:`, error);
        
        // Add error placeholder
        pdf.setFontSize(12);
        pdf.setTextColor(255, 0, 0);
        pdf.text(
          `Error loading: ${imageInfo.file.name}`, 
          pageWidth / 2, 
          pageHeight / 2,
          { align: 'center' }
        );
      }
    }
  }

  /**
   * Calculate image dimensions based on layout option
   */
  private calculateImageDimensions(
    imageInfo: ImageInfo,
    availableSpace: { width: number; height: number },
    layout: string
  ): { width: number; height: number } {
    const { width: imgWidth, height: imgHeight } = imageInfo;
    const { width: maxWidth, height: maxHeight } = availableSpace;

    switch (layout) {
      case 'ActualSize':
        return { width: imgWidth, height: imgHeight };

      case 'FitWidth':
        const widthRatio = maxWidth / imgWidth;
        return {
          width: maxWidth,
          height: imgHeight * widthRatio
        };

      case 'FitHeight':
        const heightRatio = maxHeight / imgHeight;
        return {
          width: imgWidth * heightRatio,
          height: maxHeight
        };

      case 'FitToPage':
      default:
        const scaleRatio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        return {
          width: imgWidth * scaleRatio,
          height: imgHeight * scaleRatio
        };
    }
  }

  /**
   * Parse color string to jsPDF rgb values (0-255)
   */
  private parseColorForJsPDF(colorString: string): { r: number; g: number; b: number } {
    const colors: { [key: string]: { r: number; g: number; b: number } } = {
      white: { r: 255, g: 255, b: 255 },
      black: { r: 0, g: 0, b: 0 },
      gray: { r: 128, g: 128, b: 128 },
      lightgray: { r: 230, g: 230, b: 230 }
    };

    return colors[colorString.toLowerCase()] || colors.white;
  }

  /**
   * Get image format for jsPDF
   */
  private getImageFormat(file: File): string {
    const type = file.type.toLowerCase();
    if (type.includes('png')) return 'PNG';
    if (type.includes('jpeg') || type.includes('jpg')) return 'JPEG';
    if (type.includes('gif')) return 'GIF';
    if (type.includes('webp')) return 'WEBP';
    return 'JPEG'; // Default fallback
  }

  /**
   * Calculate image dimensions for jsPDF
   */
  private calculateImageDimensionsForJsPDF(
    imageInfo: ImageInfo,
    availableSpace: { width: number; height: number },
    layout: string
  ): { width: number; height: number } {
    const { width: imgWidth, height: imgHeight } = imageInfo;
    const { width: maxWidth, height: maxHeight } = availableSpace;

    switch (layout) {
      case 'ActualSize':
        // Convert pixels to points (rough conversion)
        return { 
          width: imgWidth * 0.75, 
          height: imgHeight * 0.75 
        };

      case 'FitWidth':
        const widthRatio = maxWidth / (imgWidth * 0.75);
        return {
          width: maxWidth,
          height: (imgHeight * 0.75) * widthRatio
        };

      case 'FitHeight':
        const heightRatio = maxHeight / (imgHeight * 0.75);
        return {
          width: (imgWidth * 0.75) * heightRatio,
          height: maxHeight
        };

      case 'FitToPage':
      default:
        const scaleRatio = Math.min(
          maxWidth / (imgWidth * 0.75), 
          maxHeight / (imgHeight * 0.75)
        );
        return {
          width: (imgWidth * 0.75) * scaleRatio,
          height: (imgHeight * 0.75) * scaleRatio
        };
    }
  }

  /**
   * Calculate compression ratio
   */
  private calculateCompressionRatio(imageFiles: File[], pdfBlob: Blob): number {
    const totalImageSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    return totalImageSize > 0 ? pdfBlob.size / totalImageSize : 1;
  }

  /**
   * Validate inputs
   */
  private validateInputs(imageFiles: File[], options: ImageToPDFOptions): void {
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error('No images provided for conversion');
    }

    if (imageFiles.length > 100) {
      throw new Error('Too many images. Maximum 100 images per PDF.');
    }

    // Check file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = imageFiles.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      throw new Error(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Supported formats: JPEG, PNG, GIF, WebP`);
    }

    // Check total size (limit to 500MB)
    const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (totalSize > maxSize) {
      throw new Error('Total image size too large. Maximum 500MB per conversion.');
    }

    // Validate options
    if (options.quality && (options.quality < 0.1 || options.quality > 1.0)) {
      throw new Error('Quality must be between 0.1 and 1.0');
    }

    if (options.margin && (options.margin < 0 || options.margin > 144)) {
      throw new Error('Margin must be between 0 and 144 points (2 inches)');
    }
  }
}

// Export singleton instance
const imageToPDFService = ImageToPDFService.getInstance();
export default imageToPDFService;
