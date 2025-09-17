import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Transliterator } from '../utils/transliterator';

export interface FontInfo {
  name: string;
  supports: string[];
  fallback?: string;
  isStandard: boolean;
}

export interface FontLoadResult {
  font: any; // PDF-lib font object
  fontName: string;
  supportsCyrillic: boolean;
  needsTransliteration: boolean;
}

export class FontManager {
  private static instance: FontManager;
  private fontCache = new Map<string, any>();
  private transliterator: Transliterator;

  constructor() {
    this.transliterator = Transliterator.getInstance();
  }

  // Available fonts with their language support
  private availableFonts: { [key: string]: FontInfo } = {
    'Helvetica': {
      name: 'Helvetica',
      supports: ['en', 'fr', 'de', 'es', 'it'],
      isStandard: true
    },
    'Times-Roman': {
      name: 'Times-Roman',
      supports: ['en', 'fr', 'de', 'es', 'it'],
      isStandard: true
    },
    'Courier': {
      name: 'Courier',
      supports: ['en', 'fr', 'de', 'es', 'it'],
      isStandard: true
    },
    // For now, we'll use a fallback approach for Cyrillic
    'Cyrillic-Fallback': {
      name: 'Helvetica', // Will be enhanced later with proper cyrillic fonts
      supports: ['ru', 'uk', 'bg', 'sr'],
      fallback: 'Helvetica',
      isStandard: true
    }
  };

  static getInstance(): FontManager {
    if (!this.instance) {
      this.instance = new FontManager();
    }
    return this.instance;
  }

  async loadFont(pdfDoc: PDFDocument, language: string, isCyrillic: boolean = false): Promise<FontLoadResult> {
    try {
      const selectedFont = this.selectBestFont(language, isCyrillic);

      // Create a document-specific cache key to avoid cross-document font reuse issues
      // PDF-lib font objects are bound to specific documents and can't be reused
      const documentId = Math.random().toString(36).substr(2, 9); // Generate unique ID for each document
      const cacheKey = `${selectedFont}-${language}-${documentId}`;

      let font;
      let fontName = selectedFont;
      let supportsCyrillic = false;
      let needsTransliteration = isCyrillic;

      if (isCyrillic) {
        // For cyrillic languages, try to load a proper Cyrillic font
        try {
          font = await this.loadCyrillicFont(pdfDoc, language);

          // If we successfully loaded a Cyrillic font from Google Fonts, we don't need transliteration
          supportsCyrillic = true;
          needsTransliteration = false;

          console.log(`✅ Cyrillic font loaded successfully for ${language}. No transliteration needed.`);
        } catch (error) {
          console.warn(`⚠️ Failed to load external Cyrillic font: ${error.message}`);
          console.log('🔄 Using improved fallback strategy for Cyrillic text...');
          
          // Better fallback strategy - try Times-Roman first as it has better Unicode support
          try {
            font = await this.loadStandardFont(pdfDoc, 'Times-Roman');
            fontName = 'Times-Roman (fallback)';
            supportsCyrillic = false;
            needsTransliteration = true;
            console.log('✅ Times-Roman font loaded as fallback (will transliterate Cyrillic)');
          } catch (timesError) {
            font = await this.loadStandardFont(pdfDoc, 'Helvetica');
            fontName = 'Helvetica (fallback)';
            supportsCyrillic = false;
            needsTransliteration = true;
            console.log('✅ Helvetica font loaded as last resort (will transliterate Cyrillic)');
          }
        }
      } else {
        // Standard Latin fonts
        font = await this.loadStandardFont(pdfDoc, selectedFont);
        supportsCyrillic = false;
        needsTransliteration = false;
      }

      // Cache the loaded font with metadata (but with document-specific key)
      this.fontCache.set(cacheKey, {
        font,
        supportsCyrillic,
        needsTransliteration
      });

      // Clean up old cache entries to prevent memory leaks
      this.cleanupOldCacheEntries();

      return {
        font,
        fontName,
        supportsCyrillic,
        needsTransliteration
      };

    } catch (error) {
      console.error(`❌ Critical font loading error for ${language}:`, error);
      console.log('🚨 Using emergency fallback font strategy...');

      // Emergency fallback - ensure we always have a working font
      try {
        const emergencyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        return {
          font: emergencyFont,
          fontName: 'Times-Roman (Emergency)',
          supportsCyrillic: false,
          needsTransliteration: isCyrillic
        };
      } catch (timesError) {
        try {
          const emergencyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          return {
            font: emergencyFont,
            fontName: 'Helvetica (Emergency)',
            supportsCyrillic: false,
            needsTransliteration: isCyrillic
          };
        } catch (helveticaError) {
          // If even basic fonts fail, something is seriously wrong
          throw new Error(`Critical font loading failure - cannot load any PDF fonts: ${helveticaError.message}`);
        }
      }
    }
  }

  private async loadStandardFont(pdfDoc: PDFDocument, fontName: string): Promise<any> {
    switch (fontName) {
      case 'Times-Roman':
        return await pdfDoc.embedFont(StandardFonts.TimesRoman);
      case 'Courier':
        return await pdfDoc.embedFont(StandardFonts.Courier);
      case 'Helvetica':
      default:
        return await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
  }

  private async loadCyrillicFont(pdfDoc: PDFDocument, language: string): Promise<any> {
    try {
      // Use a verified working Cyrillic font URL from Google Fonts
      // This is the actual URL for Noto Sans with Cyrillic support
      const fontUrl = 'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vs.woff2';

      console.log(`Loading Noto Sans Cyrillic font for ${language}...`);

      const response = await fetch(fontUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'application/font-woff2,application/font-woff,application/font-ttf,*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
      }

      const fontBytes = await response.arrayBuffer();
      const font = await pdfDoc.embedFont(fontBytes);

      console.log(`✅ Successfully loaded Noto Sans Cyrillic for ${language}`);
      return font;

    } catch (error) {
      console.warn(`Failed to load Noto Sans for ${language}, trying DejaVu Sans:`, error.message);

      try {
        // Fallback: Try DejaVu Sans which has excellent Cyrillic support
        const fallbackUrl = 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';

        const response = await fetch(fallbackUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'application/font-woff2,application/font-woff,application/font-ttf,*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`Fallback font failed: ${response.status} ${response.statusText}`);
        }

        const fontBytes = await response.arrayBuffer();
        const font = await pdfDoc.embedFont(fontBytes);

        console.log(`✅ Successfully loaded DejaVu Sans for ${language}`);
        return font;

      } catch (fallbackError) {
        console.warn(`DejaVu Sans failed, trying PT Sans:`, fallbackError.message);

        try {
          // Last attempt: PT Sans from Google Fonts (designed for Cyrillic)
          const lastResortUrl = 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KEwA.woff2';

          const response = await fetch(lastResortUrl, {
            mode: 'cors',
            headers: {
              'Accept': 'application/font-woff2,application/font-woff,application/font-ttf,*/*'
            }
          });

          if (!response.ok) {
            throw new Error(`PT Sans failed: ${response.status} ${response.statusText}`);
          }

          const fontBytes = await response.arrayBuffer();
          const font = await pdfDoc.embedFont(fontBytes);

          console.log(`✅ Successfully loaded PT Sans for ${language}`);
          return font;

        } catch (lastError) {
          console.warn(`All external fonts failed:`, lastError.message);

          // Check if we're offline
          const isOffline = !navigator.onLine || error.message.includes('Failed to fetch');
          if (isOffline) {
            console.warn('🌐 App appears to be offline. Using Helvetica with transliteration.');
          }

          // Last resort: use Helvetica (will require transliteration)
          throw new Error(`Unable to load Cyrillic fonts. ${isOffline ? 'Check internet connection.' : 'Font service unavailable.'}`);
        }
      }
    }
  }

  private selectBestFont(language: string, isCyrillic: boolean): string {
    if (isCyrillic) {
      return 'Cyrillic-Fallback';
    }

    // For Latin languages, prefer Helvetica
    return 'Helvetica';
  }

  // Get font recommendations for a language
  getFontRecommendations(language: string, isCyrillic: boolean): string[] {
    if (isCyrillic) {
      return ['DejaVu Sans', 'Times New Roman', 'Arial Unicode MS', 'Helvetica'];
    }

    switch (language) {
      case 'en':
        return ['Helvetica', 'Times-Roman', 'Courier'];
      case 'fr':
      case 'de':
      case 'es':
      case 'it':
        return ['Helvetica', 'Times-Roman'];
      default:
        return ['Helvetica'];
    }
  }

  // Check if a font supports a specific language
  supportsLanguage(fontName: string, language: string): boolean {
    const fontInfo = this.availableFonts[fontName];
    return fontInfo ? fontInfo.supports.includes(language) : false;
  }

  // Get fallback font for a language
  getFallbackFont(language: string, isCyrillic: boolean): string {
    if (isCyrillic) {
      return 'Helvetica'; // Basic fallback
    }
    return 'Helvetica';
  }

  // Validate text can be rendered with selected font
  validateTextForFont(text: string, fontName: string): {
    canRender: boolean;
    unsupportedChars: string[];
    recommendation: string;
  } {
    // Basic validation - in full implementation would check actual font capabilities
    const cyrillicRegex = /[\u0400-\u04FF]/g;
    const cyrillicChars = text.match(cyrillicRegex) || [];

    const fontInfo = this.availableFonts[fontName];
    const supportsCyrillic = fontInfo && fontInfo.supports.some(lang =>
      ['ru', 'uk', 'bg', 'sr'].includes(lang)
    );

    if (cyrillicChars.length > 0 && !supportsCyrillic) {
      return {
        canRender: false,
        unsupportedChars: cyrillicChars,
        recommendation: 'Use Cyrillic-compatible font or transliterate text'
      };
    }

    return {
      canRender: true,
      unsupportedChars: [],
      recommendation: 'Font is compatible'
    };
  }

  // Clear font cache
  clearCache(): void {
    this.fontCache.clear();
  }

  // Clean up old cache entries to prevent memory leaks
  private cleanupOldCacheEntries(): void {
    // Keep only recent entries (limit cache size to prevent memory leaks)
    const MAX_CACHE_SIZE = 20;
    if (this.fontCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.fontCache.entries());
      // Remove oldest entries (first half)
      const entriesToRemove = entries.slice(0, Math.floor(entries.length / 2));
      entriesToRemove.forEach(([key]) => {
        this.fontCache.delete(key);
      });
      console.log(`🧹 Cleaned up ${entriesToRemove.length} old font cache entries`);
    }
  }
}
