import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface TextToPDFOptions {
  fontSize?: number;
  pageSize?: 'A4' | 'Letter' | 'A3';
  orientation?: 'portrait' | 'landscape';
  margins?: number;
  lineHeight?: number;
}

interface FontLoadResult {
  font: any;
  fontName: string;
  supportsCyrillic: boolean;
  needsTransliteration: boolean;
}

export class TextToPDFGenerator {
  private fontCache = new Map<string, FontLoadResult>();

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
    } = options;

    try {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle(fileName);
      pdfDoc.setAuthor('LocalPDF - OCR Tool');
      pdfDoc.setSubject('OCR Extracted Text');
      pdfDoc.setProducer('LocalPDF');
      pdfDoc.setCreator('LocalPDF OCR');

      // Detect Cyrillic
      const isCyrillic = this.containsCyrillic(text);
      console.log(`🔤 Text contains Cyrillic: ${isCyrillic}`);

      // Load appropriate font
      const fontResult = await this.loadFont(pdfDoc, isCyrillic);
      console.log(`✅ Font loaded: ${fontResult.fontName}`);

      // Prepare text
      let renderText = text;
      if (fontResult.needsTransliteration) {
        renderText = this.transliterateCyrillic(text);
        console.log(`🔄 Text transliterated`);
      }

      // Get page dimensions
      const pageDimensions = this.getPageDimensions(pageSize, orientation);
      const textWidth = pageDimensions.width - 2 * margins;

      // Split text into lines
      const lines = this.wrapTextToLines(renderText, textWidth, fontSize, fontResult.font);
      console.log(`📄 Text split into ${lines.length} lines`);

      // Calculate lines per page
      const lineHeightPoints = fontSize * lineHeight;
      const linesPerPage = Math.floor((pageDimensions.height - 2 * margins) / lineHeightPoints);

      // Add pages and text
      let currentLine = 0;
      while (currentLine < lines.length) {
        const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
        let yPosition = pageDimensions.height - margins;

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
            console.warn(`⚠️ Failed to render line, trying transliteration`);
            const fallbackLine = this.transliterateCyrillic(line);
            try {
              page.drawText(fallbackLine, {
                x: margins,
                y: yPosition,
                size: fontSize,
                font: fontResult.font,
                color: rgb(0, 0, 0),
              });
            } catch (e) {
              console.error(`❌ Even fallback failed`);
            }
          }

          yPosition -= lineHeightPoints;
        }

        currentLine += linesToAdd;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      console.log(`✅ PDF generated: ${blob.size} bytes, ${pdfDoc.getPageCount()} pages`);

      return blob;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async loadFont(pdfDoc: PDFDocument, isCyrillic: boolean): Promise<FontLoadResult> {
    pdfDoc.registerFontkit(fontkit);

    if (isCyrillic) {
      console.log('🌍 Loading Cyrillic font...');

      try {
        const cyrillicFont = await this.loadCyrillicFont(pdfDoc);
        return {
          font: cyrillicFont,
          fontName: 'Roboto (Cyrillic)',
          supportsCyrillic: true,
          needsTransliteration: false
        };
      } catch (error) {
        console.warn(`⚠️ Failed to load Cyrillic font, using transliteration`);
        const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        return {
          font: fallbackFont,
          fontName: 'Helvetica (Fallback)',
          supportsCyrillic: false,
          needsTransliteration: true
        };
      }
    } else {
      const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      return {
        font: standardFont,
        fontName: 'Helvetica',
        supportsCyrillic: false,
        needsTransliteration: false
      };
    }
  }

  private async loadCyrillicFont(pdfDoc: PDFDocument): Promise<any> {
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
        console.log(`✅ Font loaded successfully`);
        return font;

      } catch (error) {
        console.warn(`❌ Failed to load font from ${fontUrl}`);
        continue;
      }
    }

    throw new Error('All font sources failed');
  }

  containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  transliterateCyrillic(text: string): string {
    const map: Record<string, string> = {
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

    return text.split('').map(char => map[char] || char).join('');
  }

  private getPageDimensions(pageSize: string, orientation: string): { width: number; height: number } {
    const sizes = {
      'A4': { width: 595, height: 842 },
      'A3': { width: 842, height: 1191 },
      'Letter': { width: 612, height: 792 }
    };

    const size = sizes[pageSize as keyof typeof sizes] || sizes.A4;

    if (orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }

    return size;
  }

  private wrapTextToLines(text: string, maxWidth: number, fontSize: number, font: any): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push('');
        continue;
      }

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
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length > maxCharsPerLine && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else if (word.length > maxCharsPerLine) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          }

          for (let i = 0; i < word.length; i += maxCharsPerLine - 1) {
            const chunk = word.substring(i, i + maxCharsPerLine - 1);
            lines.push(i + maxCharsPerLine - 1 < word.length ? chunk + '-' : chunk);
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }
}

export const textToPDFGenerator = new TextToPDFGenerator();
