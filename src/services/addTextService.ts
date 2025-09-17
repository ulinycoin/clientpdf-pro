import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { 
  TextElement, 
  AddTextOptions, 
  AddTextResult, 
  TextElementValidation 
} from '../types/addText.types';

type FontFamily = 'Helvetica' | 'Times-Roman' | 'Courier';

export class AddTextService {
  private static instance: AddTextService;

  static getInstance(): AddTextService {
    if (!this.instance) {
      this.instance = new AddTextService();
    }
    return this.instance;
  }

  /**
   * Add text elements to PDF
   */
  async addTextToPDF(
    file: File,
    options: AddTextOptions,
    onProgress?: (progress: number) => void
  ): Promise<AddTextResult> {
    try {
      onProgress?.(5);

      // Validation
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Invalid PDF file');
      }

      if (!options.elements || options.elements.length === 0) {
        throw new Error('No text elements to add');
      }

      onProgress?.(10);

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      onProgress?.(20);

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Validate all elements
      for (const element of options.elements) {
        const validation = this.validateTextElement(element, totalPages);
        if (!validation.isValid) {
          throw new Error(`Invalid text element: ${validation.errors.join(', ')}`);
        }
      }

      onProgress?.(30);

      // Group elements by page for efficient processing
      const elementsByPage = this.groupElementsByPage(options.elements);

      // Load fonts
      const fonts = await this.loadFonts(pdfDoc);

      onProgress?.(40);

      // Process each page
      let processedElements = 0;
      for (const [pageNumber, elements] of elementsByPage.entries()) {
        const page = pages[pageNumber - 1]; // Convert to 0-based index
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Add text elements to this page
        for (const element of elements) {
          await this.addTextElementToPage(
            page,
            element,
            fonts,
            { width: pageWidth, height: pageHeight }
          );
          processedElements++;

          // Update progress
          const elementProgress = 40 + (processedElements / options.elements.length) * 50;
          onProgress?.(elementProgress);
        }
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
          pageCount: totalPages,
          textElementsAdded: options.elements.length,
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('[AddTextService] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add text to PDF'
      };
    }
  }

  /**
   * Load fonts for PDF
   */
  private async loadFonts(pdfDoc: PDFDocument) {
    return {
      Helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
      'Helvetica-Bold': await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      'Helvetica-Oblique': await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      'Helvetica-BoldOblique': await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
      'Times-Roman': await pdfDoc.embedFont(StandardFonts.TimesRoman),
      'Times-Bold': await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
      'Times-Italic': await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
      'Times-BoldItalic': await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic),
      Courier: await pdfDoc.embedFont(StandardFonts.Courier),
      'Courier-Bold': await pdfDoc.embedFont(StandardFonts.CourierBold),
      'Courier-Oblique': await pdfDoc.embedFont(StandardFonts.CourierOblique),
      'Courier-BoldOblique': await pdfDoc.embedFont(StandardFonts.CourierBoldOblique)
    };
  }

  /**
   * Add single text element to page
   */
  private async addTextElementToPage(
    page: any,
    element: TextElement,
    fonts: any,
    pageDimensions: { width: number; height: number }
  ): Promise<void> {
    try {
      // Sanitize text for pdf-lib compatibility
      const sanitizedText = this.sanitizeText(element.text);

      // Get appropriate font
      const fontKey = this.getFontKey(element);
      const font = fonts[fontKey] || fonts.Helvetica;

      // Convert coordinates (PDF coordinate system has origin at bottom-left)
      const pdfX = element.x;
      const pdfY = pageDimensions.height - element.y; // Flip Y coordinate

      // Draw text
      page.drawText(sanitizedText, {
        x: pdfX,
        y: pdfY,
        size: element.fontSize,
        font: font,
        color: rgb(
          element.color.r / 255,
          element.color.g / 255,
          element.color.b / 255
        ),
        opacity: element.opacity / 100,
        rotate: degrees(element.rotation),
        maxWidth: element.maxWidth
      });

    } catch (error) {
      console.error('[AddTextService] Error adding text element:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to add text element: ${errorMessage}`);
    }
  }

  /**
   * Get font key based on element properties
   */
  private getFontKey(element: TextElement): string {
    let fontKey = element.fontFamily;
    
    if (element.isBold && element.isItalic) {
      if (element.fontFamily === 'Helvetica') fontKey += '-BoldOblique';
      else if (element.fontFamily === 'Times-Roman') fontKey = 'Times-BoldItalic';
      else if (element.fontFamily === 'Courier') fontKey += '-BoldOblique';
    } else if (element.isBold) {
      if (element.fontFamily === 'Helvetica') fontKey += '-Bold';
      else if (element.fontFamily === 'Times-Roman') fontKey = 'Times-Bold';
      else if (element.fontFamily === 'Courier') fontKey += '-Bold';
    } else if (element.isItalic) {
      if (element.fontFamily === 'Helvetica') fontKey += '-Oblique';
      else if (element.fontFamily === 'Times-Roman') fontKey = 'Times-Italic';
      else if (element.fontFamily === 'Courier') fontKey += '-Oblique';
    }

    return fontKey;
  }

  /**
   * Group elements by page number
   */
  private groupElementsByPage(elements: TextElement[]): Map<number, TextElement[]> {
    const grouped = new Map<number, TextElement[]>();
    
    for (const element of elements) {
      const pageNumber = element.pageNumber;
      if (!grouped.has(pageNumber)) {
        grouped.set(pageNumber, []);
      }
      grouped.get(pageNumber)!.push(element);
    }

    return grouped;
  }

  /**
   * Sanitize text to handle non-ASCII characters
   */
  private sanitizeText(text: string): string {
    // Use the same sanitization as watermark service
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

    let sanitized = text;
    for (const [nonAscii, ascii] of Object.entries(charMap)) {
      sanitized = sanitized.replace(new RegExp(nonAscii, 'g'), ascii);
    }

    return sanitized.replace(/[^\x00-\x7F]/g, '?');
  }

  /**
   * Validate text element
   */
  validateTextElement(element: TextElement, totalPages: number): TextElementValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!element.text.trim()) {
      errors.push('Text cannot be empty');
    }

    if (element.text.length > 500) {
      errors.push('Text is too long (max 500 characters)');
    }

    // Page number
    if (element.pageNumber < 1 || element.pageNumber > totalPages) {
      errors.push(`Page number ${element.pageNumber} is out of range (1-${totalPages})`);
    }

    // Font size
    if (element.fontSize < 6 || element.fontSize > 200) {
      errors.push('Font size must be between 6 and 200');
    }

    // Opacity
    if (element.opacity < 10 || element.opacity > 100) {
      errors.push('Opacity must be between 10% and 100%');
    }

    // Position validation (rough bounds check)
    if (element.x < 0 || element.y < 0) {
      errors.push('Position coordinates must be positive');
    }

    if (element.x > 2000 || element.y > 2000) {
      warnings.push('Position might be outside typical page bounds');
    }

    // Color validation
    const { r, g, b } = element.color;
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      errors.push('Color values must be between 0 and 255');
    }

    // Non-ASCII character warning
    if (/[^\x00-\x7F]/.test(element.text)) {
      warnings.push('Text contains non-ASCII characters that will be converted');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get default options
   */
  getDefaultOptions(): AddTextOptions {
    return {
      elements: [],
      defaultFontSize: 14,
      defaultColor: { r: 0, g: 0, b: 0 },
      defaultFont: 'Helvetica',
      defaultOpacity: 100
    };
  }

  /**
   * Create new text element
   */
  createTextElement(
    text: string,
    x: number,
    y: number,
    pageNumber: number,
    options?: Partial<TextElement>
  ): TextElement {
    return {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      x,
      y,
      pageNumber,
      fontSize: options?.fontSize || 14,
      color: options?.color || { r: 0, g: 0, b: 0 },
      fontFamily: options?.fontFamily || 'Helvetica',
      opacity: options?.opacity || 100,
      rotation: options?.rotation || 0,
      isBold: options?.isBold || false,
      isItalic: options?.isItalic || false,
      textAlign: options?.textAlign || 'left',
      maxWidth: options?.maxWidth,
      createdAt: Date.now(),
      ...options
    };
  }

  /**
   * Check if text contains non-ASCII characters
   */
  hasNonAsciiCharacters(text: string): boolean {
    return /[^\x00-\x7F]/.test(text);
  }

  /**
   * Get font options for UI
   */
  getFontOptions() {
    return [
      { value: 'Helvetica' as FontFamily, label: 'Helvetica', preview: 'Modern sans-serif font' },
      { value: 'Times-Roman' as FontFamily, label: 'Times Roman', preview: 'Classic serif font' },
      { value: 'Courier' as FontFamily, label: 'Courier', preview: 'Monospace font' }
    ];
  }

  /**
   * Get text presets for quick formatting
   */
  getTextPresets() {
    return [
      {
        name: 'Heading',
        fontSize: 24,
        color: { r: 0, g: 0, b: 0 },
        fontFamily: 'Helvetica' as FontFamily,
        isBold: true,
        isItalic: false
      },
      {
        name: 'Subheading',
        fontSize: 18,
        color: { r: 64, g: 64, b: 64 },
        fontFamily: 'Helvetica' as FontFamily,
        isBold: true,
        isItalic: false
      },
      {
        name: 'Body Text',
        fontSize: 12,
        color: { r: 0, g: 0, b: 0 },
        fontFamily: 'Times-Roman' as FontFamily,
        isBold: false,
        isItalic: false
      },
      {
        name: 'Note',
        fontSize: 10,
        color: { r: 128, g: 128, b: 128 },
        fontFamily: 'Helvetica' as FontFamily,
        isBold: false,
        isItalic: true
      },
      {
        name: 'Code',
        fontSize: 11,
        color: { r: 64, g: 64, b: 64 },
        fontFamily: 'Courier' as FontFamily,
        isBold: false,
        isItalic: false
      }
    ];
  }
}