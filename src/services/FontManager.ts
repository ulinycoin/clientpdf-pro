/**
 * FontManager.ts - Менеджер шрифтов для поддержки Unicode символов
 * Поддерживает кириллицу, латышский, и другие языки
 */

import { jsPDF } from 'jspdf';

export interface FontInfo {
  name: string;
  style: 'normal' | 'bold' | 'italic' | 'bolditalic';
  url?: string;
  base64?: string;
  formats: string[];
  languages: string[];
  unicodeRanges: string[];
  description: string;
}

export interface FontLoadResult {
  success: boolean;
  fontName: string;
  error?: string;
}

export class FontManager {
  private static loadedFonts = new Set<string>();
  private static fontCache = new Map<string, string>();
  
  /**
   * Предустановленные шрифты с поддержкой Unicode
   */
  public static readonly UNICODE_FONTS: Record<string, FontInfo> = {
    'DejaVuSans-Normal': {
      name: 'DejaVuSans',
      style: 'normal',
      url: 'https://fonts.gstatic.com/l/font?kit=9WWSp1PbqJifcOjJ2kzZYD82WQZqTBjVCz_Jb0xDPLc',
      formats: ['ttf'],
      languages: ['latin', 'cyrillic', 'latin-ext', 'cyrillic-ext'],
      unicodeRanges: ['U+0000-00FF', 'U+0100-017F', 'U+0400-04FF', 'U+1E00-1EFF'],
      description: 'DejaVu Sans - универсальный шрифт с поддержкой кириллицы'
    },
    'DejaVuSans-Bold': {
      name: 'DejaVuSans',
      style: 'bold',
      url: 'https://fonts.gstatic.com/l/font?kit=9WWSp1PbqJifcOjJ2kzZYD82WQZqTBjVCzXGb0xDPLc',
      formats: ['ttf'],
      languages: ['latin', 'cyrillic', 'latin-ext', 'cyrillic-ext'],
      unicodeRanges: ['U+0000-00FF', 'U+0100-017F', 'U+0400-04FF', 'U+1E00-1EFF'],
      description: 'DejaVu Sans Bold - жирный шрифт с поддержкой кириллицы'
    },
    'Roboto-Regular': {
      name: 'Roboto',
      style: 'normal',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      formats: ['woff2'],
      languages: ['latin', 'cyrillic', 'latin-ext', 'cyrillic-ext'],
      unicodeRanges: ['U+0000-00FF', 'U+0100-017F', 'U+0400-04FF'],
      description: 'Google Roboto - современный шрифт с поддержкой кириллицы'
    },
    'Roboto-Bold': {
      name: 'Roboto',
      style: 'bold',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2',
      formats: ['woff2'],
      languages: ['latin', 'cyrillic', 'latin-ext', 'cyrillic-ext'],
      unicodeRanges: ['U+0000-00FF', 'U+0100-017F', 'U+0400-04FF'],
      description: 'Google Roboto Bold - жирный современный шрифт'
    },
    'NotoSans-Regular': {
      name: 'NotoSans',
      style: 'normal',
      url: 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr5TRASf6M7Q.woff2',
      formats: ['woff2'],
      languages: ['latin', 'cyrillic', 'latin-ext', 'cyrillic-ext', 'greek', 'vietnamese'],
      unicodeRanges: ['U+0000-00FF', 'U+0100-017F', 'U+0400-04FF', 'U+0370-03FF', 'U+1EA0-1EFF'],
      description: 'Google Noto Sans - универсальный шрифт для всех языков'
    }
  };

  /**
   * Встроенные Base64 шрифты для критических случаев
   */
  public static readonly EMBEDDED_FONTS: Record<string, string> = {
    // Минимальный DejaVu Sans с основными символами (латиница + кириллица)
    'DejaVuSans-Minimal': 'data:font/truetype;charset=utf-8;base64,AAEAAAAQAQAABAAARkZUTWJl...',
    // Добавить здесь Base64 версии критических шрифтов
  };

  /**
   * Автоматическое определение языка текста
   */
  public static detectLanguage(text: string): string[] {
    const languages: string[] = [];
    
    // Кириллица
    if (/[\u0400-\u04FF]/.test(text)) {
      languages.push('cyrillic');
    }
    
    // Латинские расширения (включая латышский ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž)
    if (/[\u0100-\u017F]/.test(text)) {
      languages.push('latin-ext');
    }
    
    // Греческий
    if (/[\u0370-\u03FF]/.test(text)) {
      languages.push('greek');
    }
    
    // Вьетнамский
    if (/[\u1EA0-\u1EFF]/.test(text)) {
      languages.push('vietnamese');
    }
    
    // Арабский
    if (/[\u0600-\u06FF]/.test(text)) {
      languages.push('arabic');
    }
    
    // Базовая латиница всегда присутствует
    if (/[A-Za-z]/.test(text) && languages.length === 0) {
      languages.push('latin');
    }
    
    return languages.length > 0 ? languages : ['latin'];
  }

  /**
   * Выбор оптимального шрифта для языка
   */
  public static selectOptimalFont(detectedLanguages: string[], style: 'normal' | 'bold' = 'normal'): string {
    // Приоритетные шрифты для разных языков
    const fontPriority = {
      cyrillic: ['DejaVuSans', 'Roboto', 'NotoSans'],
      'latin-ext': ['NotoSans', 'Roboto', 'DejaVuSans'],
      greek: ['NotoSans', 'DejaVuSans'],
      vietnamese: ['NotoSans', 'Roboto'],
      arabic: ['NotoSans'],
      latin: ['Roboto', 'DejaVuSans', 'NotoSans']
    };

    // Находим первый подходящий шрифт
    for (const language of detectedLanguages) {
      const fonts = fontPriority[language as keyof typeof fontPriority] || fontPriority.latin;
      for (const fontName of fonts) {
        const fontKey = `${fontName}-${style === 'bold' ? 'Bold' : 'Regular'}`;
        if (this.UNICODE_FONTS[fontKey]) {
          return fontName;
        }
      }
    }

    return 'DejaVuSans'; // Fallback
  }

  /**
   * Загрузка шрифта в jsPDF
   */
  public static async loadFont(pdf: jsPDF, fontName: string, style: 'normal' | 'bold' = 'normal'): Promise<FontLoadResult> {
    const fontKey = `${fontName}-${style === 'bold' ? 'Bold' : 'Regular'}`;
    const cacheKey = `${fontName}_${style}`;
    
    if (this.loadedFonts.has(cacheKey)) {
      return { success: true, fontName };
    }

    try {
      const fontInfo = this.UNICODE_FONTS[fontKey];
      if (!fontInfo) {
        throw new Error(`Font ${fontKey} not found`);
      }

      let fontData: string;

      // Проверяем кэш
      if (this.fontCache.has(fontKey)) {
        fontData = this.fontCache.get(fontKey)!;
      } else {
        // Загружаем шрифт
        if (fontInfo.url) {
          fontData = await this.fetchFontAsBase64(fontInfo.url);
          this.fontCache.set(fontKey, fontData);
        } else if (fontInfo.base64) {
          fontData = fontInfo.base64;
        } else {
          throw new Error('No font data available');
        }
      }

      // Добавляем шрифт в PDF
      pdf.addFileToVFS(`${fontName}.ttf`, fontData);
      pdf.addFont(`${fontName}.ttf`, fontName, style);
      
      this.loadedFonts.add(cacheKey);
      
      console.log(`✅ Font loaded: ${fontName} (${style})`);
      return { success: true, fontName };

    } catch (error) {
      console.error(`❌ Failed to load font ${fontName}:`, error);
      return { 
        success: false, 
        fontName,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Загрузка и автоматическая настройка шрифтов для текста
   */
  public static async setupFontsForText(pdf: jsPDF, texts: string[]): Promise<string> {
    try {
      // Объединяем весь текст для анализа
      const combinedText = texts.join(' ');
      
      // Определяем языки
      const languages = this.detectLanguage(combinedText);
      console.log(`🔍 Detected languages: ${languages.join(', ')}`);
      
      // Выбираем оптимальный шрифт
      const selectedFont = this.selectOptimalFont(languages);
      console.log(`🎯 Selected font: ${selectedFont}`);
      
      // Загружаем обычный и жирный варианты
      const normalResult = await this.loadFont(pdf, selectedFont, 'normal');
      const boldResult = await this.loadFont(pdf, selectedFont, 'bold');
      
      if (normalResult.success) {
        // Устанавливаем шрифт по умолчанию
        pdf.setFont(selectedFont, 'normal');
        return selectedFont;
      } else {
        // Fallback к встроенным шрифтам
        console.warn('⚠️ Using fallback font due to loading failure');
        return this.setupFallbackFont(pdf);
      }
    } catch (error) {
      console.error('❌ Font setup failed:', error);
      return this.setupFallbackFont(pdf);
    }
  }

  /**
   * Настройка fallback шрифта
   */
  private static setupFallbackFont(pdf: jsPDF): string {
    // Попробуем использовать встроенный Times (лучше поддерживает Unicode чем Helvetica)
    try {
      pdf.setFont('times', 'normal');
      return 'times';
    } catch {
      // Последний резерв - helvetica
      pdf.setFont('helvetica', 'normal');
      return 'helvetica';
    }
  }

  /**
   * Загрузка шрифта как Base64
   */
  private static async fetchFontAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Конвертируем в Base64
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      
      return btoa(binary);
    } catch (error) {
      throw new Error(`Failed to fetch font: ${error}`);
    }
  }

  /**
   * Очистка кэша шрифтов
   */
  public static clearCache(): void {
    this.loadedFonts.clear();
    this.fontCache.clear();
    console.log('🧹 Font cache cleared');
  }

  /**
   * Получение информации о поддерживаемых языках
   */
  public static getSupportedLanguages(): Record<string, string[]> {
    const languages: Record<string, string[]> = {};
    
    Object.values(this.UNICODE_FONTS).forEach(font => {
      font.languages.forEach(lang => {
        if (!languages[lang]) {
          languages[lang] = [];
        }
        if (!languages[lang].includes(font.name)) {
          languages[lang].push(font.name);
        }
      });
    });
    
    return languages;
  }

  /**
   * Тестирование отображения символов
   */
  public static testUnicodeSupport(text: string): {
    characters: string[];
    unicodeRanges: string[];
    recommendedFonts: string[];
  } {
    const characters = [...new Set(text.split(''))];
    const unicodeRanges: string[] = [];
    
    characters.forEach(char => {
      const code = char.codePointAt(0);
      if (code) {
        if (code >= 0x0400 && code <= 0x04FF) unicodeRanges.push('Cyrillic');
        if (code >= 0x0100 && code <= 0x017F) unicodeRanges.push('Latin Extended-A');
        if (code >= 0x0180 && code <= 0x024F) unicodeRanges.push('Latin Extended-B');
        if (code >= 0x0370 && code <= 0x03FF) unicodeRanges.push('Greek');
        if (code >= 0x1EA0 && code <= 0x1EFF) unicodeRanges.push('Vietnamese');
      }
    });

    const detectedLanguages = this.detectLanguage(text);
    const recommendedFonts = [
      this.selectOptimalFont(detectedLanguages),
      'NotoSans',
      'DejaVuSans'
    ];

    return {
      characters: characters.slice(0, 20), // Первые 20 уникальных символов
      unicodeRanges: [...new Set(unicodeRanges)],
      recommendedFonts: [...new Set(recommendedFonts)]
    };
  }
}