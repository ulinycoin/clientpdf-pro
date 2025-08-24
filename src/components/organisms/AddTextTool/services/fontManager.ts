import { PDFDocument, StandardFonts } from 'pdf-lib';

export interface FontInfo {
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

export class AddTextFontManager {
  private static instance: AddTextFontManager;
  private fontCache = new Map<string, any>();

  static getInstance(): AddTextFontManager {
    if (!this.instance) {
      this.instance = new AddTextFontManager();
    }
    return this.instance;
  }

  // Available fonts for add text tool
  private availableFonts: { [key: string]: FontInfo } = {
    'Arial': {
      name: 'Arial',
      displayName: 'Arial',
      supportsCyrillic: false,
      isStandard: true
    },
    'Helvetica': {
      name: 'Helvetica',
      displayName: 'Helvetica',
      supportsCyrillic: false,
      isStandard: true
    },
    'Times New Roman': {
      name: 'Times-Roman',
      displayName: 'Times New Roman',
      supportsCyrillic: false,
      isStandard: true
    },
    'Courier New': {
      name: 'Courier',
      displayName: 'Courier New',
      supportsCyrillic: false,
      isStandard: true
    },
    'DejaVu Sans': {
      name: 'DejaVu-Sans',
      displayName: 'DejaVu Sans',
      supportsCyrillic: true,
      isStandard: false,
      url: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'
    },
    'PT Sans': {
      name: 'PT-Sans',
      displayName: 'PT Sans',
      supportsCyrillic: true,
      isStandard: false,
      url: 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KEwA.woff2'
    },
    'Noto Sans': {
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
        console.warn(`Font ${fontName} not found, using Arial as fallback`);
        return await this.loadFont(pdfDoc, 'Arial', text);
      }

      // Check if we need Cyrillic support
      const needsCyrillic = this.containsCyrillic(text);
      
      // Generate cache key - use unique ID per document to avoid conflicts
      const documentId = Math.random().toString(36).substr(2, 9);
      const cacheKey = `${fontName}-${documentId}`;

      let font;
      let supportsCyrillic = fontInfo.supportsCyrillic;

      if (fontInfo.isStandard) {
        // Load standard font (these don't support Cyrillic)
        font = await this.loadStandardFont(pdfDoc, fontInfo.name);
        supportsCyrillic = false;
        console.log(`🔤 Loaded standard font: ${fontInfo.displayName}`);
      } else {
        // Load external font with proper error handling
        try {
          console.log(`🔄 Loading external font: ${fontInfo.displayName} from ${fontInfo.url}`);
          font = await this.loadExternalFont(pdfDoc, fontInfo.url!);
          supportsCyrillic = fontInfo.supportsCyrillic;
          console.log(`✅ Successfully loaded ${fontInfo.displayName} with Cyrillic support: ${supportsCyrillic}`);
        } catch (error) {
          console.warn(`⚠️ Failed to load external font ${fontName}:`, error.message);
          console.log('🔄 Falling back to Helvetica...');
          font = await this.loadStandardFont(pdfDoc, 'Helvetica');
          supportsCyrillic = false;
        }
      }

      // Cache the font with metadata
      this.fontCache.set(cacheKey, {
        font,
        supportsCyrillic,
        fontName: fontInfo.displayName
      });

      // Clean up old cache entries to prevent memory leaks
      this.cleanupOldCacheEntries();

      return {
        font,
        fontName: fontInfo.displayName,
        supportsCyrillic
      };

    } catch (error) {
      console.error('❌ Critical error loading font:', error);
      // Ultimate fallback to Helvetica
      const font = await this.loadStandardFont(pdfDoc, 'Helvetica');
      return {
        font,
        fontName: 'Helvetica (Fallback)',
        supportsCyrillic: false
      };
    }
  }

  // Get best font for text (automatically choose Cyrillic font if needed)
  getBestFont(text: string): string {
    const needsCyrillic = this.containsCyrillic(text);
    
    if (needsCyrillic) {
      // Prefer DejaVu Sans for Cyrillic
      return 'DejaVu Sans';
    }
    
    // Default to Arial for Latin text
    return 'Arial';
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
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'force-cache', // Cache fonts aggressively
        headers: {
          'Accept': 'font/woff2,font/woff,font/ttf,application/octet-stream,*/*'
        }
      });

      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type');
      console.log(`🔄 Font response: ${response.status}, Content-Type: ${contentType}`);

      const fontBytes = await response.arrayBuffer();
      console.log(`📋 Font bytes received: ${fontBytes.byteLength} bytes`);

      if (fontBytes.byteLength === 0) {
        throw new Error('Received empty font file');
      }

      const font = await pdfDoc.embedFont(fontBytes);
      console.log('✅ Font successfully embedded in PDF document');
      return font;

    } catch (networkError) {
      // Check if we're offline
      const isOffline = !navigator.onLine || networkError.message.includes('Failed to fetch');
      const errorContext = isOffline ? 'Network unavailable' : 'Font service error';
      
      throw new Error(`${errorContext}: ${networkError.message}`);
    }
  }

  // Check if text contains Cyrillic characters
  containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  // Get list of available fonts
  getAvailableFonts(): FontInfo[] {
    return Object.values(this.availableFonts);
  }

  // Get font options for UI
  getFontOptions(): Array<{ value: string; label: string; supportsCyrillic: boolean }> {
    return Object.entries(this.availableFonts).map(([key, font]) => ({
      value: key,
      label: font.displayName,
      supportsCyrillic: font.supportsCyrillic
    }));
  }

  // Clean up old cache entries to prevent memory leaks
  private cleanupOldCacheEntries(): void {
    const MAX_CACHE_SIZE = 15;
    if (this.fontCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.fontCache.entries());
      const entriesToRemove = entries.slice(0, Math.floor(entries.length / 2));
      entriesToRemove.forEach(([key]) => {
        this.fontCache.delete(key);
      });
      console.log(`🧹 Cleaned up ${entriesToRemove.length} old font cache entries`);
    }
  }
}