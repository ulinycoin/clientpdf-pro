import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface TextToPDFOptions {
  fontSize?: number;
  pageSize?: 'A4' | 'Letter' | 'A3';
  orientation?: 'portrait' | 'landscape';
  margins?: number; // in points
  lineHeight?: number; // multiplier
  fontFamily?: 'Helvetica' | 'Times' | 'Courier';
}

export interface FontLoadResult {
  font: any;
  fontName: string;
  supportsCyrillic: boolean;
  needsTransliteration: boolean;
}

export class TextToPDFGenerator {
  private fontCache = new Map<string, FontLoadResult>();

  /**
   * Generate PDF from text with proper UTF-8 and Cyrillic support
   * Smart page splitting: splits text by PAGE markers if present
   */
  async generatePDF(
    text: string,
    fileName: string = 'document',
    options: TextToPDFOptions = {}
  ): Promise<Blob> {
    const {
      fontSize = 11,
      pageSize = 'A4',
      orientation = 'portrait',
      margins = 50,
      lineHeight = 1.4,
      fontFamily = 'Helvetica'
    } = options;

    try {
      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Set PDF metadata
      pdfDoc.setTitle(fileName);
      pdfDoc.setAuthor('LocalPDF - OCR Tool');
      pdfDoc.setSubject('OCR Extracted Text');
      pdfDoc.setKeywords(['ocr', 'pdf', 'text', 'localpdf']);
      pdfDoc.setProducer('LocalPDF - Privacy-first PDF tools');
      pdfDoc.setCreator('LocalPDF OCR');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      // Detect if text contains Cyrillic characters
      const isCyrillic = this.containsCyrillic(text);
      console.log(`🔤 Text contains Cyrillic: ${isCyrillic}`);

      // Load appropriate font
      const fontResult = await this.loadFont(pdfDoc, isCyrillic);
      console.log(`✅ Font loaded: ${fontResult.fontName}, supports Cyrillic: ${fontResult.supportsCyrillic}`);

      // Prepare text for rendering
      let renderText = text;
      if (fontResult.needsTransliteration) {
        renderText = this.transliterateCyrillic(text);
        console.log(`🔄 Text transliterated for compatibility`);
      }

      // Get page dimensions
      const pageDimensions = this.getPageDimensions(pageSize, orientation);
      const textWidth = pageDimensions.width - 2 * margins;
      const textHeight = pageDimensions.height - 2 * margins;

      // Check if text has PAGE markers (OCR output with page separators)
      const hasPageMarkers = /═+\nPAGE \d+\n═+/.test(renderText);

      if (hasPageMarkers) {
        console.log('📑 Detected PAGE markers - splitting text by original pages');
        await this.generatePDFWithPageMarkers(pdfDoc, renderText, fontResult, pageDimensions, margins, fontSize, lineHeight);
      } else {
        console.log('📄 No PAGE markers - using standard pagination');
        await this.generatePDFStandard(pdfDoc, renderText, fontResult, pageDimensions, margins, fontSize, lineHeight);
      }

      // Generate PDF blob
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false, // Better compatibility
        addDefaultPage: false,
        objectsPerTick: 50
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      console.log(`✅ PDF generated: ${blob.size} bytes, ${pdfDoc.getPageCount()} pages`);

      return blob;

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF with PAGE markers - each marked page becomes a PDF page
   */
  private async generatePDFWithPageMarkers(
    pdfDoc: PDFDocument,
    text: string,
    fontResult: FontLoadResult,
    pageDimensions: { width: number; height: number },
    margins: number,
    fontSize: number,
    lineHeight: number
  ): Promise<void> {
    // Split text by page separators
    const pagePattern = /═+\nPAGE \d+\n═+\n\n?/g;
    const pages = text.split(pagePattern).filter(p => p.trim());

    console.log(`📄 Split into ${pages.length} pages by PAGE markers`);

    const textWidth = pageDimensions.width - 2 * margins;
    const textHeight = pageDimensions.height - 2 * margins;
    const lineHeightPoints = fontSize * lineHeight;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageText = pages[pageIndex];

      // Split page text into lines that fit the page width
      const lines = this.wrapTextToLines(pageText, textWidth, fontSize, fontResult.font);

      // Add new PDF page
      const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
      let yPosition = pageDimensions.height - margins;

      // Add lines to this page
      for (const line of lines) {
        // Check if we've run out of space
        if (yPosition < margins) {
          console.warn(`⚠️ Page ${pageIndex + 1} content exceeds page height, truncating`);
          break;
        }

        try {
          page.drawText(line, {
            x: margins,
            y: yPosition,
            size: fontSize,
            font: fontResult.font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.warn(`⚠️ Failed to render line on page ${pageIndex + 1}`, error);
        }

        yPosition -= lineHeightPoints;
      }

      console.log(`✅ Page ${pageIndex + 1} rendered with ${lines.length} lines`);
    }
  }

  /**
   * Generate PDF with standard pagination - fills pages by line count
   */
  private async generatePDFStandard(
    pdfDoc: PDFDocument,
    text: string,
    fontResult: FontLoadResult,
    pageDimensions: { width: number; height: number },
    margins: number,
    fontSize: number,
    lineHeight: number
  ): Promise<void> {
    const textWidth = pageDimensions.width - 2 * margins;
    const textHeight = pageDimensions.height - 2 * margins;

    // Split text into lines that fit the page width
    const lines = this.wrapTextToLines(text, textWidth, fontSize, fontResult.font);
    console.log(`📄 Text split into ${lines.length} lines`);

    // Calculate lines per page
    const lineHeightPoints = fontSize * lineHeight;
    const linesPerPage = Math.floor(textHeight / lineHeightPoints);
    console.log(`📏 ${linesPerPage} lines per page, line height: ${lineHeightPoints}pt`);

    // Add pages and text
    let currentLine = 0;
    while (currentLine < lines.length) {
      // Add new page
      const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);

      // Calculate starting Y position (top of page minus top margin)
      let yPosition = pageDimensions.height - margins;

      // Add lines to this page
      const linesToAdd = Math.min(linesPerPage, lines.length - currentLine);
      for (let i = 0; i < linesToAdd; i++) {
        const line = lines[currentLine + i];

        try {
          page.drawText(line, {
            x: margins,
            y: yPosition,
            size: fontSize,
            font: fontResult.font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.warn(`⚠️ Failed to render line: "${line.substring(0, 50)}..."`, error);
          // Try with fallback transliteration
          const fallbackLine = this.transliterateCyrillic(line);
          try {
            page.drawText(fallbackLine, {
              x: margins,
              y: yPosition,
              size: fontSize,
              font: fontResult.font,
              color: rgb(0, 0, 0),
            });
          } catch (fallbackError) {
            console.error(`❌ Even fallback failed for line`, fallbackError);
          }
        }

        yPosition -= lineHeightPoints;
      }

      currentLine += linesToAdd;
      console.log(`📄 Page ${Math.ceil(currentLine / linesPerPage)} completed (lines ${currentLine - linesToAdd + 1}-${currentLine})`);
    }
  }

  /**
   * Load font with Cyrillic support
   */
  private async loadFont(pdfDoc: PDFDocument, isCyrillic: boolean): Promise<FontLoadResult> {
    const cacheKey = `${isCyrillic ? 'cyrillic' : 'latin'}-${Date.now()}`;

    if (this.fontCache.has(cacheKey)) {
      return this.fontCache.get(cacheKey)!;
    }

    // Register fontkit for external font support
    pdfDoc.registerFontkit(fontkit);

    let fontResult: FontLoadResult;

    if (isCyrillic) {
      console.log('🌍 Loading Cyrillic-compatible font...');
      
      try {
        // Try to load external Cyrillic font
        const cyrillicFont = await this.loadCyrillicFont(pdfDoc);
        fontResult = {
          font: cyrillicFont,
          fontName: 'Roboto (Cyrillic)',
          supportsCyrillic: true,
          needsTransliteration: false
        };
        console.log('✅ External Cyrillic font loaded successfully');
      } catch (error) {
        console.warn(`⚠️ Failed to load external Cyrillic font, using fallback: ${error}`);
        
        // Fallback to standard font with transliteration
        try {
          const fallbackFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          fontResult = {
            font: fallbackFont,
            fontName: 'Times-Roman (Fallback)',
            supportsCyrillic: false,
            needsTransliteration: true
          };
        } catch (timesError) {
          const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          fontResult = {
            font: helveticaFont,
            fontName: 'Helvetica (Emergency Fallback)',
            supportsCyrillic: false,
            needsTransliteration: true
          };
        }
      }
    } else {
      // Standard font for Latin text
      console.log('📝 Loading standard font for Latin text');
      const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontResult = {
        font: standardFont,
        fontName: 'Helvetica',
        supportsCyrillic: false,
        needsTransliteration: false
      };
    }

    // Cache the result
    this.fontCache.set(cacheKey, fontResult);
    return fontResult;
  }

  /**
   * Load external Cyrillic font
   */
  private async loadCyrillicFont(pdfDoc: PDFDocument): Promise<any> {
    const fontUrls = [
      'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff',
      'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'
    ];

    for (const fontUrl of fontUrls) {
      try {
        console.log(`🔤 Attempting to load font from: ${fontUrl}`);
        
        const response = await fetch(fontUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'application/font-woff2,application/font-woff,application/font-ttf,*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const fontBytes = await response.arrayBuffer();
        
        if (fontBytes.byteLength < 1000) {
          throw new Error('Font data too small');
        }

        const font = await pdfDoc.embedFont(fontBytes);
        console.log(`✅ Successfully loaded external font`);
        return font;

      } catch (error) {
        console.warn(`❌ Failed to load font from ${fontUrl}:`, error);
        continue;
      }
    }

    throw new Error('All external font sources failed');
  }

  /**
   * Check if text contains Cyrillic characters
   */
  containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  /**
   * Transliterate Cyrillic text to Latin characters
   */
  transliterateCyrillic(text: string): string {
    const cyrillicMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO',
      'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH',
      'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
    };

    return text.split('').map(char => cyrillicMap[char] || char).join('');
  }

  /**
   * Get page dimensions based on size and orientation
   */
  private getPageDimensions(pageSize: string, orientation: string): { width: number; height: number } {
    const pageSizes = {
      'A4': { width: 595, height: 842 },
      'A3': { width: 842, height: 1191 },
      'Letter': { width: 612, height: 792 }
    };

    const size = pageSizes[pageSize as keyof typeof pageSizes] || pageSizes.A4;

    if (orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }

    return size;
  }

  /**
   * Wrap text to fit page width
   */
  private wrapTextToLines(text: string, maxWidth: number, fontSize: number, font: any): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push(''); // Empty line for paragraph breaks
        continue;
      }

      // Estimate character width (rough approximation)
      const avgCharWidth = fontSize * 0.6;
      const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

      if (paragraph.length <= maxCharsPerLine) {
        lines.push(paragraph);
        continue;
      }

      // Word wrap
      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        // Check if adding this word would exceed the line length
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length > maxCharsPerLine && currentLine) {
          // Start new line
          lines.push(currentLine);
          currentLine = word;
        } else if (word.length > maxCharsPerLine) {
          // Word is too long, split it
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          }
          
          // Split long word
          for (let i = 0; i < word.length; i += maxCharsPerLine - 1) {
            const chunk = word.substring(i, i + maxCharsPerLine - 1);
            lines.push(i + maxCharsPerLine - 1 < word.length ? chunk + '-' : chunk);
          }
        } else {
          currentLine = testLine;
        }
      }

      // Add remaining text
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }
}

// Export singleton instance
export const textToPDFGenerator = new TextToPDFGenerator();