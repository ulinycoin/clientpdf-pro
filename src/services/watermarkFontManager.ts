import { PDFDocument, StandardFonts } from 'pdf-lib';

export interface WatermarkFontInfo {
  name: string;
  displayName: string;
  supportsCyrillic: boolean;
  isStandard: boolean;
  url?: string;
}

export interface FontLoadResult {
  font: any;
  fontName: string;
  supportsCyrillic: boolean;
}

export class WatermarkFontManager {
  private static instance: WatermarkFontManager;
  private fontCache = new Map<string, any>();

  static getInstance(): WatermarkFontManager {
    if (!this.instance) {
      this.instance = new WatermarkFontManager();
    }
    return this.instance;
  }

  // Available fonts for watermarks
  private availableFonts: { [key: string]: WatermarkFontInfo } = {
    'Helvetica': {
      name: 'Helvetica',
      displayName: 'Helvetica',
      supportsCyrillic: false,
      isStandard: true
    },
    'Times-Roman': {
      name: 'Times-Roman',
      displayName: 'Times New Roman',
      supportsCyrillic: false,
      isStandard: true
    },
    'Courier': {
      name: 'Courier',
      displayName: 'Courier',
      supportsCyrillic: false,
      isStandard: true
    },
    'DejaVu-Sans': {
      name: 'DejaVu-Sans',
      displayName: 'DejaVu Sans',
      supportsCyrillic: true,
      isStandard: false,
      url: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'
    },
    'PT-Sans': {
      name: 'PT-Sans',
      displayName: 'PT Sans',
      supportsCyrillic: true,
      isStandard: false,
      url: 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KEwA.woff2'
    },
    'Noto-Sans': {
      name: 'Noto-Sans',
      displayName: 'Noto Sans',
      supportsCyrillic: true,
      isStandard: false,
      url: 'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vs.woff2'
    }
  };

  async loadFont(pdfDoc: PDFDocument, fontName: string, text: string): Promise<FontLoadResult> {
    try {
      const fontInfo = this.availableFonts[fontName];
      if (!fontInfo) {
        throw new Error(`Font ${fontName} not found`);
      }

      // Check if we need Cyrillic support
      const needsCyrillic = this.containsCyrillic(text);
      
      // Generate cache key
      const cacheKey = `${fontName}-${Date.now()}`;

      let font;
      let supportsCyrillic = fontInfo.supportsCyrillic;

      if (fontInfo.isStandard) {
        // Load standard font
        font = await this.loadStandardFont(pdfDoc, fontInfo.name);
      } else {
        // Load external font
        try {
          font = await this.loadExternalFont(pdfDoc, fontInfo.url!);
        } catch (error) {
          console.warn(`Failed to load external font ${fontName}, falling back to Helvetica:`, error);
          font = await this.loadStandardFont(pdfDoc, 'Helvetica');
          supportsCyrillic = false;
        }
      }

      // Cache the font
      this.fontCache.set(cacheKey, font);

      return {
        font,
        fontName: fontInfo.displayName,
        supportsCyrillic
      };

    } catch (error) {
      console.warn(`Font loading failed, using Helvetica fallback:`, error);
      
      // Fallback to Helvetica
      const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      return {
        font: fallbackFont,
        fontName: 'Helvetica',
        supportsCyrillic: false
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

  private async loadExternalFont(pdfDoc: PDFDocument, url: string): Promise<any> {
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'force-cache' // Cache fonts aggressively
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }

    const fontBytes = await response.arrayBuffer();
    return await pdfDoc.embedFont(fontBytes);
  }

  // Check if text contains Cyrillic characters
  containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  // Get list of available fonts
  getAvailableFonts(): WatermarkFontInfo[] {
    return Object.values(this.availableFonts);
  }

  // Get font recommendations based on text
  getFontRecommendations(text: string): WatermarkFontInfo[] {
    const needsCyrillic = this.containsCyrillic(text);
    
    if (needsCyrillic) {
      return Object.values(this.availableFonts).filter(font => font.supportsCyrillic);
    } else {
      return Object.values(this.availableFonts);
    }
  }

  // Get best font for text
  getBestFont(text: string): string {
    const needsCyrillic = this.containsCyrillic(text);
    
    if (needsCyrillic) {
      // Prefer DejaVu Sans for Cyrillic text
      return 'DejaVu-Sans';
    } else {
      // Default to Helvetica for Latin text
      return 'Helvetica';
    }
  }

  // Check if font supports the given text
  fontSupportsText(fontName: string, text: string): boolean {
    const fontInfo = this.availableFonts[fontName];
    if (!fontInfo) return false;

    const needsCyrillic = this.containsCyrillic(text);
    return !needsCyrillic || fontInfo.supportsCyrillic;
  }

  // Clear font cache
  clearCache(): void {
    this.fontCache.clear();
  }
}