/**
 * ExternalFontLoader.ts - Загрузчик внешних шрифтов для поддержки кириллицы
 * Использует TTF шрифты для совместимости с jsPDF
 */

import { jsPDF } from 'jspdf';

export interface ExternalFont {
  name: string;
  url: string;
  format: 'truetype' | 'opentype';
  unicodeRange: string;
  supports: string[];
}

export class ExternalFontLoader {
  private static fontCache = new Map<string, string>();
  private static isLoading = new Set<string>();

  /**
   * Список доступных TTF шрифтов с поддержкой кириллицы
   * Используем только TTF для совместимости с jsPDF
   */
  private static readonly CYRILLIC_FONTS: ExternalFont[] = [
    {
      name: 'DejaVu',
      url: 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf',
      format: 'truetype',
      unicodeRange: 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      supports: ['latin', 'cyrillic']
    },
    {
      name: 'Liberation',
      url: 'https://github.com/liberationfonts/liberation-fonts/raw/main/liberation-fonts-ttf/LiberationSans-Regular.ttf',
      format: 'truetype',
      unicodeRange: 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      supports: ['latin', 'cyrillic']
    }
  ];

  /**
   * Fallback встроенные base64 шрифты (упрощенные версии)
   */
  private static readonly EMBEDDED_FONTS = new Map<string, string>([
    // Базовый TTF шрифт с кириллицей (можно заменить на реальный base64)
    ['Roboto', ''] // Здесь будет base64 данные шрифта
  ]);

  /**
   * Загрузка внешнего шрифта
   */
  public static async loadExternalFont(fontName: string): Promise<string | null> {
    // Проверяем кэш
    if (this.fontCache.has(fontName)) {
      return this.fontCache.get(fontName)!;
    }

    // Проверяем встроенные шрифты
    if (this.EMBEDDED_FONTS.has(fontName)) {
      const embedded = this.EMBEDDED_FONTS.get(fontName)!;
      if (embedded) {
        this.fontCache.set(fontName, embedded);
        return embedded;
      }
    }

    // Проверяем, не загружается ли уже
    if (this.isLoading.has(fontName)) {
      // Ждем завершения загрузки
      await this.waitForFont(fontName);
      return this.fontCache.get(fontName) || null;
    }

    const font = this.CYRILLIC_FONTS.find(f => f.name === fontName);
    if (!font) {
      console.warn(`Font ${fontName} not found in available fonts`);
      return null;
    }

    this.isLoading.add(fontName);

    try {
      console.log(`🔄 Loading external font: ${fontName} from ${font.url}`);
      
      // Загружаем шрифт с таймаутом
      const response = await this.fetchWithTimeout(font.url, 10000);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const fontData = await response.arrayBuffer();
      const base64Font = this.arrayBufferToBase64(fontData);
      
      // Сохраняем в кэш
      this.fontCache.set(fontName, base64Font);
      
      console.log(`✅ Font ${fontName} loaded successfully (${Math.round(fontData.byteLength / 1024)}KB)`);
      return base64Font;

    } catch (error) {
      console.error(`❌ Failed to load font ${fontName}:`, error);
      return null;
    } finally {
      this.isLoading.delete(fontName);
    }
  }

  /**
   * Добавление внешнего шрифта в jsPDF с улучшенной обработкой ошибок
   */
  public static async addFontToPDF(pdf: jsPDF, fontName: string): Promise<boolean> {
    const fontData = await this.loadExternalFont(fontName);
    if (!fontData) {
      console.warn(`❌ No font data available for ${fontName}`);
      return false;
    }

    try {
      // Генерируем уникальное имя файла
      const fontFileName = `${fontName}_${Date.now()}.ttf`;
      
      // Добавляем шрифт в jsPDF
      pdf.addFileToVFS(fontFileName, fontData);
      
      // Пытаемся добавить шрифт с обработкой ошибки unicode cmap
      try {
        pdf.addFont(fontFileName, fontName, 'normal');
        console.log(`✅ Font ${fontName} added to PDF successfully`);
        return true;
      } catch (cmapError) {
        // Если ошибка связана с unicode cmap, пробуем без unicode поддержки
        if (cmapError instanceof Error && cmapError.message.includes('unicode cmap')) {
          console.warn(`⚠️ Unicode cmap error for ${fontName}, trying alternative approach...`);
          
          // Пробуем добавить как обычный шрифт без unicode
          try {
            pdf.addFont(fontFileName, fontName, 'normal', 'StandardEncoding');
            console.log(`✅ Font ${fontName} added to PDF with standard encoding`);
            return true;
          } catch (fallbackError) {
            console.error(`❌ Fallback encoding also failed for ${fontName}:`, fallbackError);
            return false;
          }
        } else {
          throw cmapError;
        }
      }
    } catch (error) {
      console.error(`❌ Failed to add font ${fontName} to PDF:`, error);
      return false;
    }
  }

  /**
   * Настройка PDF с внешним шрифтом для кириллицы
   */
  public static async setupPDFWithCyrillicFont(pdf: jsPDF, preferredFont: string = 'DejaVu'): Promise<{
    success: boolean;
    fontName: string;
    method: string;
  }> {
    try {
      console.log(`🔤 Attempting to setup Cyrillic font: ${preferredFont}`);
      
      const success = await this.addFontToPDF(pdf, preferredFont);
      
      if (success) {
        try {
          pdf.setFont(preferredFont, 'normal');
          console.log(`✅ Successfully set font to ${preferredFont}`);
          return {
            success: true,
            fontName: preferredFont,
            method: 'External TTF font loaded'
          };
        } catch (setFontError) {
          console.warn(`⚠️ Font added but failed to set: ${setFontError}`);
          // Fallback к helvetica
          pdf.setFont('helvetica', 'normal');
          return {
            success: false,
            fontName: 'helvetica',
            method: 'Font added but failed to set, fallback to helvetica'
          };
        }
      } else {
        // Пробуем альтернативные шрифты
        for (const altFont of this.CYRILLIC_FONTS) {
          if (altFont.name !== preferredFont) {
            console.log(`🔄 Trying alternative font: ${altFont.name}`);
            const altSuccess = await this.addFontToPDF(pdf, altFont.name);
            if (altSuccess) {
              try {
                pdf.setFont(altFont.name, 'normal');
                return {
                  success: true,
                  fontName: altFont.name,
                  method: `Alternative external font: ${altFont.name}`
                };
              } catch (altSetError) {
                console.warn(`⚠️ Alternative font ${altFont.name} failed to set:`, altSetError);
                continue;
              }
            }
          }
        }
        
        // Все внешние шрифты не сработали - fallback к встроенному
        console.warn(`⚠️ All external fonts failed, falling back to helvetica`);
        pdf.setFont('helvetica', 'normal');
        return {
          success: false,
          fontName: 'helvetica',
          method: 'All external fonts failed, fallback to built-in helvetica'
        };
      }
    } catch (error) {
      console.error('❌ Font setup completely failed:', error);
      try {
        pdf.setFont('helvetica', 'normal');
      } catch (fallbackError) {
        console.error('❌ Even helvetica fallback failed:', fallbackError);
      }
      return {
        success: false,
        fontName: 'helvetica',
        method: 'Complete failure, emergency fallback'
      };
    }
  }

  /**
   * Fetch с таймаутом
   */
  private static async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        mode: 'cors',
        cache: 'force-cache' // Кэшируем шрифты
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Ожидание завершения загрузки шрифта
   */
  private static async waitForFont(fontName: string): Promise<void> {
    let attempts = 0;
    const maxAttempts = 50; // 5 секунд максимум
    
    while (this.isLoading.has(fontName) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
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
    console.log('🔄 Preloading Cyrillic fonts...');
    
    const popularFonts = ['DejaVu']; // Только один надежный шрифт
    
    const promises = popularFonts.map(async (font) => {
      try {
        await this.loadExternalFont(font);
        console.log(`✅ Preloaded: ${font}`);
      } catch (error) {
        console.warn(`⚠️ Failed to preload ${font}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
    console.log('✅ Font preloading completed');
  }

  /**
   * Проверка доступности шрифта
   */
  public static async testFont(fontName: string): Promise<boolean> {
    try {
      const fontData = await this.loadExternalFont(fontName);
      return fontData !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получение информации о кэше
   */
  public static getCacheInfo(): {
    cachedFonts: string[];
    cacheSizeKB: number;
    loading: string[];
  } {
    const cacheSizeKB = Array.from(this.fontCache.values())
      .reduce((total, font) => total + (font.length * 0.75 / 1024), 0); // Приблизительный размер base64
    
    return {
      cachedFonts: Array.from(this.fontCache.keys()),
      cacheSizeKB: Math.round(cacheSizeKB),
      loading: Array.from(this.isLoading)
    };
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
