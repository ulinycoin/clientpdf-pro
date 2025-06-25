/**
 * ExternalFontLoader.ts - Загрузчик внешних шрифтов для поддержки кириллицы
 * Использует Google Fonts или другие CDN для получения шрифтов с кириллицей
 */

import { jsPDF } from 'jspdf';

export interface ExternalFont {
  name: string;
  url: string;
  format: 'truetype' | 'opentype' | 'woff' | 'woff2';
  unicodeRange: string;
  supports: string[];
}

export class ExternalFontLoader {
  private static fontCache = new Map<string, string>();
  private static isLoading = new Set<string>();

  /**
   * Список доступных шрифтов с поддержкой кириллицы
   */
  private static readonly CYRILLIC_FONTS: ExternalFont[] = [
    {
      name: 'Roboto',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      format: 'woff2',
      unicodeRange: 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      supports: ['latin', 'cyrillic']
    },
    {
      name: 'Open Sans',
      url: 'https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4nY1M2xLER.woff2',
      format: 'woff2',
      unicodeRange: 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      supports: ['latin', 'cyrillic']
    },
    {
      name: 'PT Sans',
      url: 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KExcOPIDU.woff2',
      format: 'woff2',
      unicodeRange: 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      supports: ['latin', 'cyrillic']
    }
  ];

  /**
   * Загрузка внешнего шрифта
   */
  public static async loadExternalFont(fontName: string): Promise<string | null> {
    // Проверяем кэш
    if (this.fontCache.has(fontName)) {
      return this.fontCache.get(fontName)!;
    }

    // Проверяем, не загружается ли уже
    if (this.isLoading.has(fontName)) {
      return null;
    }

    const font = this.CYRILLIC_FONTS.find(f => f.name === fontName);
    if (!font) {
      console.warn(`Font ${fontName} not found in available fonts`);
      return null;
    }

    this.isLoading.add(fontName);

    try {
      // Загружаем шрифт
      const response = await fetch(font.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status}`);
      }

      const fontData = await response.arrayBuffer();
      const base64Font = this.arrayBufferToBase64(fontData);
      
      // Сохраняем в кэш
      this.fontCache.set(fontName, base64Font);
      
      console.log(`✅ Font ${fontName} loaded successfully`);
      return base64Font;

    } catch (error) {
      console.error(`❌ Failed to load font ${fontName}:`, error);
      return null;
    } finally {
      this.isLoading.delete(fontName);
    }
  }

  /**
   * Добавление внешнего шрифта в jsPDF
   */
  public static async addFontToPDF(pdf: jsPDF, fontName: string): Promise<boolean> {
    const fontData = await this.loadExternalFont(fontName);
    if (!fontData) {
      return false;
    }

    try {
      // Добавляем шрифт в jsPDF
      pdf.addFileToVFS(`${fontName}.ttf`, fontData);
      pdf.addFont(`${fontName}.ttf`, fontName, 'normal');
      
      console.log(`✅ Font ${fontName} added to PDF`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add font ${fontName} to PDF:`, error);
      return false;
    }
  }

  /**
   * Настройка PDF с внешним шрифтом для кириллицы
   */
  public static async setupPDFWithCyrillicFont(pdf: jsPDF, preferredFont: string = 'Roboto'): Promise<{
    success: boolean;
    fontName: string;
    method: string;
  }> {
    try {
      const success = await this.addFontToPDF(pdf, preferredFont);
      
      if (success) {
        pdf.setFont(preferredFont, 'normal');
        return {
          success: true,
          fontName: preferredFont,
          method: 'External font loaded'
        };
      } else {
        // Fallback к встроенному шрифту
        pdf.setFont('helvetica', 'normal');
        return {
          success: false,
          fontName: 'helvetica',
          method: 'Fallback to built-in font'
        };
      }
    } catch (error) {
      console.error('Font setup failed:', error);
      pdf.setFont('helvetica', 'normal');
      return {
        success: false,
        fontName: 'helvetica',
        method: 'Error fallback'
      };
    }
  }

  /**
   * Конвертация ArrayBuffer в Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Получение списка доступных шрифтов
   */
  public static getAvailableFonts(): string[] {
    return this.CYRILLIC_FONTS.map(font => font.name);
  }

  /**
   * Предзагрузка популярных шрифтов
   */
  public static async preloadFonts(): Promise<void> {
    const popularFonts = ['Roboto', 'Open Sans'];
    
    const promises = popularFonts.map(font => this.loadExternalFont(font));
    await Promise.allSettled(promises);
    
    console.log('✅ Popular Cyrillic fonts preloaded');
  }

  /**
   * Очистка кэша шрифтов
   */
  public static clearCache(): void {
    this.fontCache.clear();
    this.isLoading.clear();
    console.log('🧹 Font cache cleared');
  }
}