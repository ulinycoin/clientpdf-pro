import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { DocumentContent, ConversionSettings } from '../types/wordToPdf.types';
import { FontManager } from './fontManager';
import { LanguageDetector } from './languageDetector';
import { Transliterator } from '../utils/transliterator';

export class PDFGenerator {
  private fontManager: FontManager;
  private languageDetector: LanguageDetector;
  private transliterator: Transliterator;

  constructor() {
    this.fontManager = FontManager.getInstance();
    this.languageDetector = LanguageDetector.getInstance();
    this.transliterator = Transliterator.getInstance();
  }
  async createPDF(content: DocumentContent, settings: ConversionSettings): Promise<Uint8Array> {
    try {
      // Create new PDF document
      const pdfDoc = await PDFDocument.create();

      // Register fontkit for custom font support
      pdfDoc.registerFontkit(fontkit);

      // Set page size
      const pageSize = this.getPageSize(settings.pageSize);

      // Add first page
      let page = pdfDoc.addPage(pageSize);
      let { width, height } = page.getSize();

      // Page margins - use settings or defaults
      const margins = settings.margins || { top: 20, right: 20, bottom: 20, left: 20 };
      const margin = {
        top: margins.top * 2.83, // Convert mm to points (1mm = 2.83pt)
        right: margins.right * 2.83,
        bottom: margins.bottom * 2.83,
        left: margins.left * 2.83
      };

      const contentWidth = width - margin.left - margin.right;
      const contentHeight = height - margin.top - margin.bottom;

      // Detect document language and load appropriate font
      const documentLanguage = content.metadata?.language || 'en';
      const isCyrillic = content.metadata?.isCyrillic || false;

      console.log(`📝 Document analysis:`, {
        language: documentLanguage,
        isCyrillic: isCyrillic,
        detectedLanguages: content.metadata?.detectedLanguages,
        firstParagraph: content.paragraphs[0]?.text?.substring(0, 50)
      });

      const fontResult = await this.fontManager.loadFont(pdfDoc, documentLanguage, isCyrillic);
      const font = fontResult.font;
      const needsTransliteration = fontResult.needsTransliteration;
      const supportsCyrillic = fontResult.supportsCyrillic;

      console.log(`🔤 Font loading result:`, {
        fontName: fontResult.fontName,
        supportsCyrillic: supportsCyrillic,
        needsTransliteration: needsTransliteration
      });

      if (isCyrillic) {
        if (supportsCyrillic && !needsTransliteration) {
          console.log('✅ Using native Cyrillic font support - original text will be preserved.');
        } else if (needsTransliteration) {
          console.warn('⚠️ Cyrillic text will be transliterated to Latin characters for PDF compatibility.');
        }
      }

      const fontSize = settings.fontSize || 12;
      const lineHeight = fontSize * 1.2;

      // Track current position
      let currentY = height - margin.top;

      // Render paragraphs
      for (const paragraph of content.paragraphs) {
        if (!paragraph.text.trim()) continue;

        // Apply transliteration only if needed - do this BEFORE any text processing
        let textToRender = paragraph.text;
        if (needsTransliteration && this.transliterator.hasCyrillic(paragraph.text)) {
          textToRender = this.transliterator.smartTransliterate(paragraph.text);

          // Verify no cyrillic characters remain
          if (this.transliterator.hasCyrillic(textToRender)) {
            console.warn('Cyrillic characters still present after transliteration, applying fallback');
            textToRender = this.transliterator.transliterate(textToRender);
          }

          console.log(`Transliterated: "${paragraph.text.substring(0, 50)}..." -> "${textToRender.substring(0, 50)}..."`);
        } else if (supportsCyrillic) {
          // Use original text when we have proper Cyrillic font support
          console.log(`Using original Cyrillic text: "${paragraph.text.substring(0, 50)}..."`);

          // Debug: Check what characters we're actually trying to render
          const uniqueChars = [...new Set(paragraph.text.split(''))].slice(0, 20);
          console.log(`🔤 Characters in text:`, uniqueChars.join(' '), `(codes: ${uniqueChars.map(c => c.charCodeAt(0)).join(', ')})`);
        }

        // Split text into words for proper wrapping
        const words = textToRender.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;

          // Pre-validate text for encoding issues before width calculation
          const safeTestLine = this.sanitizeTextForPDF(testLine, supportsCyrillic);

          try {
            const textWidth = font.widthOfTextAtSize(safeTestLine, fontSize);

            if (textWidth <= contentWidth) {
              currentLine = safeTestLine;
            } else {
              // Draw current line if it exists
              if (currentLine) {
                // Check if we need a new page
                if (currentY - lineHeight < margin.bottom) {
                  page = pdfDoc.addPage(pageSize);
                  currentY = height - margin.top;
                }

                // Final validation before drawing
                const finalSafeLine = this.sanitizeTextForPDF(currentLine, supportsCyrillic);
                page.drawText(finalSafeLine, {
                  x: margin.left,
                  y: currentY,
                  size: fontSize,
                  font: font,
                  color: rgb(0, 0, 0)
                });

                currentY -= lineHeight;
              }

              // Start new line with current word (also sanitized)
              currentLine = this.sanitizeTextForPDF(word, supportsCyrillic);
            }
          } catch (encodingError) {
            console.warn('Text encoding error:', encodingError, 'for text:', testLine);

            // Apply comprehensive character sanitization
            const emergencySafeLine = this.emergencySanitizeText(testLine);

            try {
              const textWidth = font.widthOfTextAtSize(emergencySafeLine, fontSize);

              if (textWidth <= contentWidth) {
                currentLine = emergencySafeLine;
              } else {
                if (currentLine) {
                  if (currentY - lineHeight < margin.bottom) {
                    page = pdfDoc.addPage(pageSize);
                    currentY = height - margin.top;
                  }

                  page.drawText(this.sanitizeTextForPDF(currentLine, supportsCyrillic), {
                    x: margin.left,
                    y: currentY,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0)
                  });

                  currentY -= lineHeight;
                }
                currentLine = this.emergencySanitizeText(word);
              }
            } catch (finalError) {
              console.error('Final encoding error, skipping problematic text:', finalError);
              // Skip this word entirely if all sanitization fails
              continue;
            }
          }
        }

        // Draw remaining text
        if (currentLine) {
          // Check if we need a new page
          if (currentY - lineHeight < margin.bottom) {
            page = pdfDoc.addPage(pageSize);
            currentY = height - margin.top;
          }

          // Final safety check for encoding
          try {
            const finalText = this.sanitizeTextForPDF(currentLine, supportsCyrillic);
            page.drawText(finalText, {
              x: margin.left,
              y: currentY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0)
            });
          } catch (encodingError) {
            console.error('Final encoding error, applying emergency sanitization');
            const emergencyText = this.emergencySanitizeText(currentLine);
            page.drawText(emergencyText, {
              x: margin.left,
              y: currentY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0)
            });
          }

          currentY -= lineHeight;
        }

        // Add paragraph spacing
        currentY -= lineHeight * 0.5;
      }

      // Generate PDF bytes with compression settings
      const saveOptions: any = {};
      if (settings.compression) {
        // Enable compression for smaller file size
        saveOptions.compress = true;
        saveOptions.addDefaultPage = false;
      }

      const pdfBytes = await pdfDoc.save(saveOptions);

      console.log(`📄 PDF generated successfully:`, {
        pageSize: settings.pageSize,
        fontSize: fontSize,
        margins: margins,
        compression: settings.compression,
        finalSize: `${Math.round(pdfBytes.length / 1024)} KB`,
        pageCount: pdfDoc.getPageCount()
      });

      return pdfBytes;

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  private getPageSize(size: string): [number, number] {
    switch (size) {
      case 'A4':
        return [595, 842];
      case 'Letter':
        return [612, 792];
      case 'A3':
        return [842, 1191];
      default:
        return [595, 842]; // Default to A4
    }
  }

  /**
   * Sanitize text for PDF encoding, handling special characters that may cause WinAnsi errors
   */
  private sanitizeTextForPDF(text: string, supportsCyrillic: boolean = false): string {
    if (!text) return '';

    let sanitized = text;

    // Define character replacements for common problematic symbols
    const charReplacements: { [key: string]: string } = {
      // Mathematical symbols
      '\u2260': '!=',      // Not equal ≠
      '\u00B1': '+/-',     // Plus-minus ±
      '\u00D7': 'x',       // Multiplication ×
      '\u00F7': '/',       // Division ÷
      '\u2264': '<=',      // Less than or equal ≤
      '\u2265': '>=',      // Greater than or equal ≥
      '\u2248': '~=',      // Approximately equal ≈
      '\u221E': 'infinity', // Infinity ∞
      '\u221A': 'sqrt',    // Square root √
      '\u2211': 'sum',     // Summation ∑
      '\u220F': 'prod',    // Product ∏
      '\u0394': 'delta',   // Delta ∆
      '\u2202': 'd',       // Partial derivative ∂
      '\u222B': 'integral', // Integral ∫

      // Typography symbols
      '\u201C': '"',      // Smart quotes left "
      '\u201D': '"',      // Smart quotes right "
      '\u2018': "'",      // Smart apostrophe left '
      '\u2019': "'",      // Smart apostrophe right '
      '\u2026': '...',    // Ellipsis …
      '\u2013': '-',      // En dash –
      '\u2014': '--',     // Em dash —
      '\u00A7': 'section', // Section symbol §
      '\u00B6': 'para',    // Paragraph symbol ¶
      '\u2020': '+',       // Dagger †
      '\u2021': '++',      // Double dagger ‡

      // Currency symbols (except basic $ and €)
      '\u00A3': 'GBP',     // Pound £
      '\u00A5': 'JPY',     // Yen ¥
      '\u20BD': 'RUB',     // Ruble ₽
      '\u20B4': 'UAH',     // Hryvnia ₴

      // Emoji replacements (common ones)
      '\uD83D\uDE00': ':)',    // 😀 grinning face
      '\uD83D\uDE01': ':D',    // 😁 beaming face
      '\uD83D\uDE02': ':D',    // 😂 face with tears of joy
      '\uD83D\uDE0D': '<3',    // 😍 smiling face with heart-eyes
      '\uD83D\uDE0E': 'B)',    // 😎 smiling face with sunglasses
      '\uD83D\uDE18': ':*',    // 😘 face blowing a kiss
      '\uD83D\uDE1C': ';P',    // 😜 winking face with tongue
      '\uD83D\uDE22': ':(',    // 😢 crying face
      '\uD83D\uDE2D': 'T_T',   // 😭 loudly crying face
      '\uD83D\uDE31': ':O',    // 😱 face screaming in fear
      '\uD83D\uDE4F': '+',     // 🙏 folded hands
      '\uD83D\uDC4D': '+1',    // 👍 thumbs up
      '\uD83D\uDC4E': '-1',    // 👎 thumbs down
      '\uD83D\uDCAA': '*flex*', // 💪 flexed biceps
      '\u2764\uFE0F': '<3',    // ❤️ red heart
      '\uD83D\uDC96': '<3',    // 💖 sparkling heart
      '\uD83D\uDD25': '*fire*', // 🔥 fire
      '\u2B50': '*',           // ⭐ star
      '\uD83C\uDF89': '*party*', // 🎉 party popper

      // Arrow symbols
      '\u2190': '<-',      // ← leftwards arrow
      '\u2191': '^',       // ↑ upwards arrow
      '\u2192': '->',      // → rightwards arrow
      '\u2193': 'v',       // ↓ downwards arrow
      '\u2194': '<->',     // ↔ left right arrow
      '\u21D0': '<=',      // ⇐ leftwards double arrow
      '\u21D2': '=>',      // ⇒ rightwards double arrow

      // Check marks and crosses
      '\u2713': 'v',       // ✓ check mark
      '\u2714': 'V',       // ✔ heavy check mark
      '\u2717': 'x',       // ✗ ballot x
      '\u2718': 'X',       // ✘ heavy ballot x
      '\u2705': '[v]',     // ✅ white heavy check mark
      '\u274C': '[X]',     // ❌ cross mark
      '\u274E': '[X]',     // ❎ negative squared cross mark

      // Other symbols
      '\u00B0': 'deg',     // Degree °
      '\u2122': '(TM)',    // Trademark ™
      '\u00AE': '(R)',     // Registered ®
      '\u00A9': '(C)',     // Copyright ©
      '\u00BC': '1/4',     // Fractions ¼
      '\u00BD': '1/2',     // ½
      '\u00BE': '3/4',     // ¾
      '\u03B1': 'alpha',   // Greek letters α
      '\u03B2': 'beta',    // β
      '\u03B3': 'gamma',   // γ
      '\u03B4': 'delta',   // δ
      '\u03C0': 'pi',      // π
      '\u03C3': 'sigma',   // σ
      '\u03C9': 'omega'    // ω
    };

    // Apply character replacements
    for (const [original, replacement] of Object.entries(charReplacements)) {
      sanitized = sanitized.replace(new RegExp(escapeRegExp(original), 'g'), replacement);
    }

    // Handle Cyrillic text if font doesn't support it
    if (!supportsCyrillic && this.transliterator.hasCyrillic(sanitized)) {
      sanitized = this.transliterator.smartTransliterate(sanitized);
    }

    // Remove any remaining problematic Unicode characters
    // Keep basic Latin, Cyrillic (if supported), numbers, punctuation, and whitespace
    const allowedPattern = supportsCyrillic
      ? /[^\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0400-\u04FF\u2000-\u206F]/g
      : /[^\u0000-\u007F\u0080-\u00FF\u0100-\u017F]/g;

    sanitized = sanitized.replace(allowedPattern, '?');

    return sanitized;
  }

  /**
   * Emergency text sanitization - removes all non-basic characters
   */
  private emergencySanitizeText(text: string): string {
    if (!text) return '';

    // Apply all character replacements first
    let sanitized = this.sanitizeTextForPDF(text, false);

    // Apply transliteration for any remaining Cyrillic
    if (this.transliterator.hasCyrillic(sanitized)) {
      sanitized = this.transliterator.transliterate(sanitized);
    }

    // Keep only basic ASCII characters, numbers, and common punctuation
    sanitized = sanitized.replace(/[^\u0020-\u007E]/g, '?');

    // Clean up multiple question marks
    sanitized = sanitized.replace(/\?+/g, '?');

    // Remove question marks at word boundaries (artifacts from replacements)
    sanitized = sanitized.replace(/\s\?\s/g, ' ');
    sanitized = sanitized.replace(/^\?+|\?+$/g, '');

    return sanitized.trim();
  }
}

/**
 * Utility function to escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
