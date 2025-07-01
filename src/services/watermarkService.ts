import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
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

      // Load font with Unicode support
      let font;
      try {
        // Try to use a font that supports more characters
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      } catch (fontError) {
        console.warn('[WatermarkService] Font loading failed, using fallback');
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
      
      onProgress?.(50);

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Add watermark to each page
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate position with safe text handling
        const position = this.calculatePosition(
          options.position, 
          width, 
          height, 
          options.text, 
          options.fontSize, 
          font
        );

        // Sanitize text for pdf-lib compatibility
        const sanitizedText = this.sanitizeText(options.text);

        // Draw watermark with corrected rotation
        page.drawText(sanitizedText, {
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
          rotate: degrees(options.rotation) // Convert degrees to radians
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

  /**
   * Sanitize text to handle non-ASCII characters
   * Replace unsupported characters with ASCII equivalents
   */
  private sanitizeText(text: string): string {
    // Map of common non-ASCII characters to ASCII equivalents
    const charMap: { [key: string]: string } = {
      // Cyrillic to Latin transliteration
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '"', 'ы': 'y', 'ь': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya',
      
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
      'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH',
      'Ъ': '"', 'Ы': 'Y', 'Ь': "'", 'Э': 'E', 'Ю': 'YU', 'Я': 'YA',
      
      // Common special characters
      'à': 'a', 'á': 'a', 'ä': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o',
      'õ': 'o', 'ö': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ý': 'y', 'ÿ': 'y',
      
      'À': 'A', 'Á': 'A', 'Ä': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
      'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O',
      'Õ': 'O', 'Ö': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y'
    };

    // Replace characters using the map
    let sanitized = text;
    for (const [nonAscii, ascii] of Object.entries(charMap)) {
      sanitized = sanitized.replace(new RegExp(nonAscii, 'g'), ascii);
    }

    // Remove any remaining non-ASCII characters
    return sanitized.replace(/[^\x00-\x7F]/g, '?');
  }

  private calculatePosition(
    position: WatermarkOptions['position'],
    pageWidth: number,
    pageHeight: number,
    text: string,
    fontSize: number,
    font: any
  ): { x: number; y: number } {
    try {
      // Use sanitized text for width calculation
      const sanitizedText = this.sanitizeText(text);
      const textWidth = font.widthOfTextAtSize(sanitizedText, fontSize);
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
    } catch (error) {
      console.warn('[WatermarkService] Position calculation failed, using center:', error);
      // Fallback to center position
      return {
        x: pageWidth / 2,
        y: pageHeight / 2
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
      widthOfTextAtSize: (text: string, size: number) => {
        const sanitizedText = this.sanitizeText(text);
        return sanitizedText.length * size * 0.6;
      }
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

  // Check if text contains non-ASCII characters
  hasNonAsciiCharacters(text: string): boolean {
    return /[^\x00-\x7F]/.test(text);
  }

  // Get warning message for non-ASCII text
  getNonAsciiWarning(text: string): string | null {
    if (this.hasNonAsciiCharacters(text)) {
      return 'Your text contains non-ASCII characters that will be transliterated to ASCII equivalents for PDF compatibility.';
    }
    return null;
  }
}