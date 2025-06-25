/**
 * FontService.ts - Сервис для работы с внешними шрифтами
 * Загружает шрифты с полной Unicode поддержкой из Google Fonts CDN
 */

import { jsPDF } from 'jspdf';

export interface FontConfig {
  name: string;
  url: string;
  style: 'normal' | 'bold' | 'italic' | 'bolditalic';
  weight: number;
  format: 'truetype' | 'woff' | 'woff2';
  unicodeRanges?: string[];
}

export class FontService {
  private static loadedFonts = new Map<string, boolean>();
  
  /**
   * Конфигурация шрифтов с CDN URL
   * Используем прямые ссылки на TTF файлы для совместимости с jsPDF
   */
  private static readonly FONT_CONFIGS: Record<string, FontConfig> = {
    'NotoSans': {
      name: 'NotoSans',
      url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
      style: 'normal',
      weight: 400,
      format: 'truetype',
      unicodeRanges: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext']
    },
    'NotoSans-Bold': {
      name: 'NotoSans',
      url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf',
      style: 'bold',
      weight: 700,
      format: 'truetype',
      unicodeRanges: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext']
    },
    'OpenSans': {
      name: 'OpenSans',
      url: 'https://github.com/googlefonts/opensans/raw/main/fonts/ttf/OpenSans-Regular.ttf',
      style: 'normal',
      weight: 400,
      format: 'truetype',
      unicodeRanges: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek']
    },
    'OpenSans-Bold': {
      name: 'OpenSans',
      url: 'https://github.com/googlefonts/opensans/raw/main/fonts/ttf/OpenSans-Bold.ttf',
      style: 'bold',
      weight: 700,
      format: 'truetype',
      unicodeRanges: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek']
    }
  };

  /**
   * Загрузка шрифта из URL и конвертация в base64
   */
  private static async fetchFontAsBase64(url: string): Promise<string> {
    try {
      console.log(`📥 Fetching font from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Конвертируем blob в base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            // Убираем префикс data:font/ttf;base64,
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert font to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Failed to fetch font:', error);
      throw error;
    }
  }

  /**
   * Загрузка и регистрация шрифта в jsPDF
   */
  public static async loadFont(
    pdf: jsPDF, 
    fontName: string, 
    style: 'normal' | 'bold' = 'normal'
  ): Promise<boolean> {
    const configKey = style === 'bold' ? `${fontName}-Bold` : fontName;
    const cacheKey = `${fontName}_${style}`;
    
    // Проверяем кэш
    if (this.loadedFonts.has(cacheKey)) {
      return true;
    }

    const fontConfig = this.FONT_CONFIGS[configKey];
    if (!fontConfig) {
      console.warn(`⚠️ Font configuration not found for: ${configKey}`);
      return false;
    }

    try {
      // Загружаем шрифт
      const fontBase64 = await this.fetchFontAsBase64(fontConfig.url);
      
      // Добавляем шрифт в jsPDF
      const fontId = `${fontName}-${style}`;
      pdf.addFileToVFS(`${fontId}.ttf`, fontBase64);
      pdf.addFont(`${fontId}.ttf`, fontName, style);
      
      // Устанавливаем шрифт
      pdf.setFont(fontName, style);
      
      // Сохраняем в кэш
      this.loadedFonts.set(cacheKey, true);
      
      console.log(`✅ Font loaded successfully: ${fontName} (${style})`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to load font ${fontName}:`, error);
      return false;
    }
  }

  /**
   * Попытка загрузить подходящий шрифт для текста
   */
  public static async loadBestFontForText(
    pdf: jsPDF,
    text: string,
    preferredFont?: string
  ): Promise<string> {
    // Определяем какие языки присутствуют в тексте
    const hasLatin = /[A-Za-z]/.test(text);
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    const hasGreek = /[\u0370-\u03FF]/.test(text);
    const hasExtendedLatin = /[\u0100-\u017F]/.test(text);
    
    // Выбираем подходящий шрифт
    let selectedFont = preferredFont || 'NotoSans';
    
    // Если есть специальные символы, используем Noto Sans
    if (hasCyrillic || hasGreek || hasExtendedLatin) {
      selectedFont = 'NotoSans';
    }
    
    // Пробуем загрузить выбранный шрифт
    const normalLoaded = await this.loadFont(pdf, selectedFont, 'normal');
    
    if (!normalLoaded) {
      // Fallback к встроенным шрифтам
      console.warn('⚠️ Failed to load custom font, using built-in font');
      pdf.setFont('helvetica', 'normal');
      return 'helvetica';
    }
    
    // Пробуем загрузить bold версию (не критично если не получится)
    await this.loadFont(pdf, selectedFont, 'bold').catch(() => {
      console.log(`ℹ️ Bold version of ${selectedFont} not available`);
    });
    
    return selectedFont;
  }

  /**
   * Предварительная загрузка всех шрифтов (для оптимизации)
   */
  public static async preloadFonts(pdf: jsPDF): Promise<void> {
    const fonts = ['NotoSans', 'OpenSans'];
    const styles: Array<'normal' | 'bold'> = ['normal', 'bold'];
    
    const promises: Promise<boolean>[] = [];
    
    for (const font of fonts) {
      for (const style of styles) {
        promises.push(
          this.loadFont(pdf, font, style).catch(() => false)
        );
      }
    }
    
    await Promise.all(promises);
    console.log('✅ Font preloading completed');
  }

  /**
   * Очистка кэша шрифтов
   */
  public static clearCache(): void {
    this.loadedFonts.clear();
    console.log('🧹 Font cache cleared');
  }

  /**
   * Получение информации о загруженных шрифтах
   */
  public static getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts.keys());
  }

  /**
   * Проверка поддержки языков шрифтом
   */
  public static checkLanguageSupport(fontName: string, text: string): {
    supported: boolean;
    unsupportedRanges: string[];
  } {
    const fontConfig = this.FONT_CONFIGS[fontName] || this.FONT_CONFIGS[`${fontName}-Bold`];
    
    if (!fontConfig || !fontConfig.unicodeRanges) {
      return { supported: false, unsupportedRanges: ['unknown'] };
    }
    
    const unsupportedRanges: string[] = [];
    
    // Проверяем различные диапазоны Unicode
    if (/[\u0400-\u04FF]/.test(text) && !fontConfig.unicodeRanges.includes('cyrillic')) {
      unsupportedRanges.push('cyrillic');
    }
    
    if (/[\u0370-\u03FF]/.test(text) && !fontConfig.unicodeRanges.includes('greek')) {
      unsupportedRanges.push('greek');
    }
    
    if (/[\u0100-\u017F]/.test(text) && !fontConfig.unicodeRanges.includes('latin-ext')) {
      unsupportedRanges.push('latin-ext');
    }
    
    return {
      supported: unsupportedRanges.length === 0,
      unsupportedRanges
    };
  }
}
