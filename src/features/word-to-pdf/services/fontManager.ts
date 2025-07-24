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
      const fontName = this.selectBestFont(language, isCyrillic);

      // Check cache first
      const cacheKey = `${fontName}-${language}`;
      if (this.fontCache.has(cacheKey)) {
        const cachedData = this.fontCache.get(cacheKey);
        return {
          font: cachedData.font,
          fontName,
          supportsCyrillic: cachedData.supportsCyrillic,
          needsTransliteration: cachedData.needsTransliteration
        };
      }

      let font;
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
          console.warn(`Failed to load Cyrillic font, falling back to standard font with transliteration`);
          font = await this.loadStandardFont(pdfDoc, 'Helvetica');
          supportsCyrillic = false;
          needsTransliteration = true;
        }
      } else {
        // Standard Latin fonts
        font = await this.loadStandardFont(pdfDoc, fontName);
        supportsCyrillic = false;
        needsTransliteration = false;
      }

      // Cache the loaded font with metadata
      this.fontCache.set(cacheKey, {
        font,
        supportsCyrillic,
        needsTransliteration
      });

      return {
        font,
        fontName,
        supportsCyrillic,
        needsTransliteration
      };

    } catch (error) {
      console.warn(`Failed to load font for ${language}, using fallback:`, error);

      // Fallback to Helvetica
      const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      return {
        font: fallbackFont,
        fontName: 'Helvetica',
        supportsCyrillic: false,
        needsTransliteration: isCyrillic
      };
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
        mode: 'cors'
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
          mode: 'cors'
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
            mode: 'cors'
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
}
