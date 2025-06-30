import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ProcessingResult } from '../types';

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: { r: number; g: number; b: number };
}

export class WatermarkService {
  private static instance: WatermarkService;

  static getInstance(): WatermarkService {
    if (!this.instance) {
      this.instance = new WatermarkService();
    }
    return this.instance;
  }

  async addWatermark(
    file: File, 
    options: WatermarkOptions,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    try {
      onProgress?.(10);

      // Validation
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.type !== 'application/pdf') {
        throw new Error('File must be a PDF');
      }

      if (!options.text.trim()) {
        throw new Error('Watermark text cannot be empty');
      }

      onProgress?.(20);

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      onProgress?.(40);

      // Load font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      onProgress?.(50);

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Add watermark to each page
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate position
        const position = this.calculatePosition(
          options.position, 
          width, 
          height, 
          options.text, 
          options.fontSize, 
          font
        );

        // Draw watermark
        page.drawText(options.text, {
          x: position.x,
          y: position.y,
          size: options.fontSize,
          font: font,
          color: rgb(
            options.color.r / 255,
            options.color.g / 255,
            options.color.b / 255
          ),
          opacity: options.opacity / 100,
          rotate: {
            angle: options.rotation,
            origin: { x: position.x, y: position.y }
          }
        });

        // Update progress
        const pageProgress = 50 + (i / totalPages) * 40;
        onProgress?.(pageProgress);
      }

      onProgress?.(90);

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      onProgress?.(100);

      return {
        success: true,
        data: blob,
        metadata: {
          originalSize: file.size,
          finalSize: blob.size,
          compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1),
          pageCount: totalPages,
          watermarkApplied: true,
          watermarkText: options.text
        }
      };

    } catch (error) {
      console.error('[WatermarkService] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add watermark'
      };
    }
  }

  private calculatePosition(
    position: WatermarkOptions['position'],
    pageWidth: number,
    pageHeight: number,
    text: string,
    fontSize: number,
    font: any
  ): { x: number; y: number } {
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    switch (position) {
      case 'center':
        return {
          x: (pageWidth - textWidth) / 2,
          y: (pageHeight - textHeight) / 2
        };
      
      case 'top-left':
        return {
          x: 50,
          y: pageHeight - textHeight - 50
        };
      
      case 'top-right':
        return {
          x: pageWidth - textWidth - 50,
          y: pageHeight - textHeight - 50
        };
      
      case 'bottom-left':
        return {
          x: 50,
          y: 50
        };
      
      case 'bottom-right':
        return {
          x: pageWidth - textWidth - 50,
          y: 50
        };
      
      default:
        return {
          x: (pageWidth - textWidth) / 2,
          y: (pageHeight - textHeight) / 2
        };
    }
  }

  // Utility method to get preview of watermark position
  getWatermarkPreview(
    pageWidth: number = 595, 
    pageHeight: number = 842, 
    options: WatermarkOptions
  ): { x: number; y: number } {
    // Mock font for preview (rough estimation)
    const mockFont = {
      widthOfTextAtSize: (text: string, size: number) => text.length * size * 0.6
    };

    return this.calculatePosition(
      options.position,
      pageWidth,
      pageHeight,
      options.text,
      options.fontSize,
      mockFont
    );
  }

  // Get default watermark options
  getDefaultOptions(): WatermarkOptions {
    return {
      text: 'DRAFT',
      fontSize: 48,
      opacity: 30,
      rotation: 45,
      position: 'center',
      color: { r: 128, g: 128, b: 128 }
    };
  }

  // Validate watermark options
  validateOptions(options: WatermarkOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.text.trim()) {
      errors.push('Watermark text cannot be empty');
    }

    if (options.text.length > 50) {
      errors.push('Watermark text is too long (max 50 characters)');
    }

    if (options.fontSize < 8 || options.fontSize > 144) {
      errors.push('Font size must be between 8 and 144');
    }

    if (options.opacity < 5 || options.opacity > 100) {
      errors.push('Opacity must be between 5% and 100%');
    }

    if (options.rotation < -360 || options.rotation > 360) {
      errors.push('Rotation must be between -360 and 360 degrees');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}