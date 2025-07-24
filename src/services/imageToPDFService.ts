import { PDFDocument, rgb } from 'pdf-lib';
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
    return typeof PDFDocument !== 'undefined' &&
           typeof File !== 'undefined' &&
           typeof Blob !== 'undefined' &&
           typeof Image !== 'undefined';
  }

  /**
   * Convert images to PDF
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

      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Set document metadata
      pdfDoc.setTitle('Images to PDF - Created by LocalPDF');
      pdfDoc.setAuthor('LocalPDF');
      pdfDoc.setCreator('LocalPDF Image Converter');
      pdfDoc.setProducer('LocalPDF v1.0');

      onProgress?.(50, 'Adding images to pages...');

      // Add images to PDF based on layout options
      await this.addImagesToPDF(pdfDoc, imageInfos, options, onProgress);

      onProgress?.(90, 'Finalizing PDF...');

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const processingTime = performance.now() - startTime;

      onProgress?.(100, 'PDF created successfully!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: pdfDoc.getPageCount(),
          originalSize: imageFiles.reduce((sum, file) => sum + file.size, 0),
          processedSize: blob.size,
          processingTime,
          imageCount: imageFiles.length,
          compressionRatio: this.calculateCompressionRatio(imageFiles, blob)
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
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          resolve({
            file,
            width: img.naturalWidth,
            height: img.naturalHeight,
            dataUrl: event.target?.result as string
          });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Add images to PDF document
   */
  private async addImagesToPDF(
    pdfDoc: PDFDocument,
    imageInfos: ImageInfo[],
    options: ImageToPDFOptions,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const pageSize = this.getOptimalPageSize(imageInfos, options);
    const margin = options.margin || 36; // Default 0.5 inch margin

    for (let i = 0; i < imageInfos.length; i++) {
      const imageInfo = imageInfos[i];
      const progressPercent = 50 + (i / imageInfos.length) * 40;

      onProgress?.(progressPercent, `Adding image ${i + 1}/${imageInfos.length} to PDF...`);

      // Create new page
      const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

      // Add background color if specified
      if (options.backgroundColor) {
        const bgColor = this.parseColor(options.backgroundColor);
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageSize.width,
          height: pageSize.height,
          color: bgColor
        });
      }

      // Embed image
      let image;
      try {
        if (imageInfo.file.type.includes('png')) {
          image = await pdfDoc.embedPng(imageInfo.dataUrl);
        } else {
          image = await pdfDoc.embedJpg(imageInfo.dataUrl);
        }
      } catch (error) {
        console.warn(`Failed to embed image ${imageInfo.file.name}, trying alternative format...`);
        // Try converting to JPEG as fallback
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();

        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imageInfo.dataUrl;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const jpegDataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.8);
        image = await pdfDoc.embedJpg(jpegDataUrl);
      }

      // Calculate image dimensions based on layout option
      const imageDimensions = this.calculateImageDimensions(
        imageInfo,
        { width: pageSize.width - 2 * margin, height: pageSize.height - 2 * margin },
        options.layout
      );

      // Center the image on the page
      const x = (pageSize.width - imageDimensions.width) / 2;
      const y = (pageSize.height - imageDimensions.height) / 2;

      // Draw image on page
      page.drawImage(image, {
        x,
        y,
        width: imageDimensions.width,
        height: imageDimensions.height
      });

      // Add image filename as annotation (optional)
      if (options.layout !== 'FitToPage') {
        page.drawText(imageInfo.file.name, {
          x: margin,
          y: margin / 2,
          size: 8,
          color: rgb(0.5, 0.5, 0.5)
        });
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
   * Parse color string to rgb values
   */
  private parseColor(colorString: string) {
    // Simple color parsing - can be extended
    const colors: { [key: string]: { r: number; g: number; b: number } } = {
      white: { r: 1, g: 1, b: 1 },
      black: { r: 0, g: 0, b: 0 },
      gray: { r: 0.5, g: 0.5, b: 0.5 },
      lightgray: { r: 0.9, g: 0.9, b: 0.9 }
    };

    const color = colors[colorString.toLowerCase()] || colors.white;
    return rgb(color.r, color.g, color.b);
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
