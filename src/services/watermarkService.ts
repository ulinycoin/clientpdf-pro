import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PDFProcessingResult } from '../types';
import { WatermarkFontManager } from './watermarkFontManager';

export interface WatermarkOptions {
  // Watermark type - text or image
  type: 'text' | 'image';
  
  // Text watermark options
  text: string;
  fontSize: number;
  fontName?: string;
  color: { r: number; g: number; b: number };
  
  // Image watermark options
  imageFile?: File;
  imageWidth?: number; // Width in points (72 points = 1 inch)
  imageHeight?: number; // Height in points
  maintainAspectRatio?: boolean;
  
  // Common options for both text and image
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export class WatermarkService {
  private static instance: WatermarkService;
  private fontManager: WatermarkFontManager;

  constructor() {
    this.fontManager = WatermarkFontManager.getInstance();
  }

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
  ): Promise<PDFProcessingResult> {
    try {
      onProgress?.(10);

      // Validation
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.type !== 'application/pdf') {
        throw new Error('File must be a PDF');
      }

      // Type-specific validation
      if (options.type === 'text' && !options.text.trim()) {
        throw new Error('Watermark text cannot be empty');
      }

      if (options.type === 'image' && !options.imageFile) {
        throw new Error('Image file is required for image watermark');
      }

      onProgress?.(20);

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Register fontkit for custom font support
      pdfDoc.registerFontkit(fontkit);

      onProgress?.(30);

      let font: any = null;
      let supportsCyrillic = false;
      let pdfImage: any = null;
      let imageData: { width: number; height: number } | null = null;

      // Prepare resources based on watermark type
      if (options.type === 'text') {
        // Determine best font based on text and user selection
        const selectedFontName = options.fontName || this.fontManager.getBestFont(options.text);
        
        // Load font with proper Unicode support
        const fontResult = await this.fontManager.loadFont(pdfDoc, selectedFontName, options.text);
        font = fontResult.font;
        supportsCyrillic = fontResult.supportsCyrillic;
      } else if (options.type === 'image' && options.imageFile) {
        // Load image
        const imageArrayBuffer = await options.imageFile.arrayBuffer();
        
        if (options.imageFile.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imageArrayBuffer);
        } else if (options.imageFile.type === 'image/jpeg' || options.imageFile.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(imageArrayBuffer);
        } else {
          throw new Error('Unsupported image format. Use PNG or JPEG.');
        }

        // Get image dimensions and calculate final size
        const imageDims = pdfImage.size();
        imageData = this.calculateImageSize(imageDims, options);
      }

      onProgress?.(50);

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Add watermark to each page
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        if (options.type === 'text') {
          // Text watermark
          const textToRender = supportsCyrillic ? options.text : this.sanitizeText(options.text);

          // Calculate position using the actual text that will be rendered
          const position = this.calculateTextPosition(
            options.position,
            width,
            height,
            textToRender,
            options.fontSize,
            font
          );

          // Draw text watermark
          page.drawText(textToRender, {
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
            rotate: degrees(options.rotation)
          });

        } else if (options.type === 'image' && pdfImage && imageData) {
          // Image watermark
          const position = this.calculateImagePosition(
            options.position,
            width,
            height,
            imageData.width,
            imageData.height
          );

          // Draw image watermark
          page.drawImage(pdfImage, {
            x: position.x,
            y: position.y,
            width: imageData.width,
            height: imageData.height,
            opacity: options.opacity / 100,
            rotate: degrees(options.rotation)
          });
        }

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
          watermarkText: options.type === 'text' ? options.text : `Image: ${options.imageFile?.name || 'image'}`
        }
      };

    } catch (error) {
      console.error('[WatermarkService] Error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to add watermark',
          code: 'WATERMARK_ERROR'
        }
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

  /**
   * Calculate image size based on options and maintain aspect ratio
   */
  private calculateImageSize(
    imageDims: { width: number; height: number },
    options: WatermarkOptions
  ): { width: number; height: number } {
    let width = options.imageWidth || 100;
    let height = options.imageHeight || 100;

    if (options.maintainAspectRatio !== false) {
      const aspectRatio = imageDims.width / imageDims.height;
      
      if (options.imageWidth && !options.imageHeight) {
        // Width specified, calculate height
        height = width / aspectRatio;
      } else if (options.imageHeight && !options.imageWidth) {
        // Height specified, calculate width
        width = height * aspectRatio;
      } else if (options.imageWidth && options.imageHeight) {
        // Both specified, maintain aspect ratio by fitting within bounds
        const targetRatio = width / height;
        if (aspectRatio > targetRatio) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
      } else {
        // Neither specified, use default size with original aspect ratio
        if (aspectRatio > 1) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
      }
    }

    return { width, height };
  }

  /**
   * Calculate position for image watermark
   */
  private calculateImagePosition(
    position: WatermarkOptions['position'],
    pageWidth: number,
    pageHeight: number,
    imageWidth: number,
    imageHeight: number
  ): { x: number; y: number } {
    const margin = 50; // Margin from page edges

    switch (position) {
      case 'center':
        return {
          x: (pageWidth - imageWidth) / 2,
          y: (pageHeight - imageHeight) / 2
        };

      case 'top-left':
        return {
          x: margin,
          y: pageHeight - imageHeight - margin
        };

      case 'top-right':
        return {
          x: pageWidth - imageWidth - margin,
          y: pageHeight - imageHeight - margin
        };

      case 'bottom-left':
        return {
          x: margin,
          y: margin
        };

      case 'bottom-right':
        return {
          x: pageWidth - imageWidth - margin,
          y: margin
        };

      default:
        return {
          x: (pageWidth - imageWidth) / 2,
          y: (pageHeight - imageHeight) / 2
        };
    }
  }

  /**
   * Calculate position for text watermark
   */
  private calculateTextPosition(
    position: WatermarkOptions['position'],
    pageWidth: number,
    pageHeight: number,
    text: string,
    fontSize: number,
    font: any
  ): { x: number; y: number } {
    try {
      // Use the provided text as-is (it's already been processed by the caller)
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = fontSize;
      const margin = 50; // Margin from page edges

      switch (position) {
        case 'center':
          return {
            x: (pageWidth - textWidth) / 2,
            y: (pageHeight - textHeight) / 2
          };

        case 'top-left':
          return {
            x: margin,
            y: pageHeight - textHeight - margin
          };

        case 'top-right':
          return {
            x: pageWidth - textWidth - margin,
            y: pageHeight - textHeight - margin
          };

        case 'bottom-left':
          return {
            x: margin,
            y: margin
          };

        case 'bottom-right':
          return {
            x: pageWidth - textWidth - margin,
            y: margin
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
  ): { x: number; y: number; width?: number; height?: number } {
    if (options.type === 'text') {
      // Mock font for preview (rough estimation)
      const mockFont = {
        widthOfTextAtSize: (text: string, size: number) => {
          const sanitizedText = this.sanitizeText(text);
          return sanitizedText.length * size * 0.6;
        }
      };

      return this.calculateTextPosition(
        options.position,
        pageWidth,
        pageHeight,
        options.text,
        options.fontSize,
        mockFont
      );
    } else {
      // Image watermark preview
      const width = options.imageWidth || 100;
      const height = options.imageHeight || 100;
      
      const position = this.calculateImagePosition(
        options.position,
        pageWidth,
        pageHeight,
        width,
        height
      );

      return {
        ...position,
        width,
        height
      };
    }
  }

  // Get default watermark options
  getDefaultOptions(): WatermarkOptions {
    return {
      type: 'text',
      text: 'DRAFT',
      fontSize: 48,
      opacity: 30,
      rotation: 45,
      position: 'center',
      color: { r: 128, g: 128, b: 128 },
      fontName: 'Helvetica',
      // Image defaults
      imageWidth: 100,
      imageHeight: 100,
      maintainAspectRatio: true
    };
  }

  // Validate watermark options
  validateOptions(options: WatermarkOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Common validations
    if (options.opacity < 5 || options.opacity > 100) {
      errors.push('Opacity must be between 5% and 100%');
    }

    if (options.rotation < -360 || options.rotation > 360) {
      errors.push('Rotation must be between -360 and 360 degrees');
    }

    // Type-specific validations
    if (options.type === 'text') {
      if (!options.text.trim()) {
        errors.push('Watermark text cannot be empty');
      }

      if (options.text.length > 50) {
        errors.push('Watermark text is too long (max 50 characters)');
      }

      if (options.fontSize < 8 || options.fontSize > 144) {
        errors.push('Font size must be between 8 and 144');
      }
    } else if (options.type === 'image') {
      if (!options.imageFile) {
        errors.push('Image file is required for image watermark');
      }

      if (options.imageFile && !['image/png', 'image/jpeg', 'image/jpg'].includes(options.imageFile.type)) {
        errors.push('Image must be PNG or JPEG format');
      }

      if (options.imageWidth && (options.imageWidth < 10 || options.imageWidth > 500)) {
        errors.push('Image width must be between 10 and 500 points');
      }

      if (options.imageHeight && (options.imageHeight < 10 || options.imageHeight > 500)) {
        errors.push('Image height must be between 10 and 500 points');
      }
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

  // Get available fonts
  getAvailableFonts() {
    return this.fontManager.getAvailableFonts();
  }

  // Get font recommendations for text
  getFontRecommendations(text: string) {
    return this.fontManager.getFontRecommendations(text);
  }

  // Check if font supports text
  fontSupportsText(fontName: string, text: string): boolean {
    return this.fontManager.fontSupportsText(fontName, text);
  }

  // Get warning message for non-ASCII text (updated logic)
  getNonAsciiWarning(text: string, fontName?: string): string | null {
    if (!text) return null;
    
    const selectedFont = fontName || this.fontManager.getBestFont(text);
    const supportsText = this.fontManager.fontSupportsText(selectedFont, text);
    
    // If font supports the text, no warning needed
    if (supportsText) {
      return null;
    }

    // Check for non-ASCII characters
    if (this.hasNonAsciiCharacters(text)) {
      return 'Select a font that supports these characters or they will be transliterated.';
    }
    
    return null;
  }
}
