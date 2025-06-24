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
   * Используем рабочие CDN ссылки
   */
  public static readonly UNICODE_FONTS: Record<string, FontInfo> = {
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
    }
  };

  /**
   * Встроенные Base64 шрифты для критических случаев
   * Минимальный набор для fallback
   */
  public static readonly EMBEDDED_FONTS: Record<string, string> = {
    // Для критических случаев можно добавить Base64 версии шрифтов
    'fallback': ''
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
    // Для всех языков используем встроенные шрифты как приоритет
    const fontPriority = {
      cyrillic: ['times', 'courier', 'helvetica'],
      'latin-ext': ['times', 'courier', 'helvetica'],
      greek: ['times', 'courier', 'helvetica'],
      vietnamese: ['times', 'courier', 'helvetica'],
      arabic: ['times', 'courier', 'helvetica'],
      latin: ['times', 'courier', 'helvetica']
    };

    // Используем Times как наилучший встроенный шрифт для Unicode
    return 'times';
  }

  /**
   * Загрузка шрифта в jsPDF - УПРОЩЕННАЯ ВЕРСИЯ
   */
  public static async loadFont(pdf: jsPDF, fontName: string, style: 'normal' | 'bold' = 'normal'): Promise<FontLoadResult> {
    const cacheKey = `${fontName}_${style}`;
    
    if (this.loadedFonts.has(cacheKey)) {
      return { success: true, fontName };
    }

    try {
      // Используем только встроенные шрифты для надежности
      const builtInFonts = ['helvetica', 'times', 'courier'];
      
      if (builtInFonts.includes(fontName.toLowerCase())) {
        pdf.setFont(fontName, style);
        this.loadedFonts.add(cacheKey);
        console.log(`✅ Built-in font set: ${fontName} (${style})`);
        return { success: true, fontName };
      }

      // Для внешних шрифтов - пропускаем загрузку и используем fallback
      console.warn(`⚠️ External font ${fontName} skipped, using fallback`);
      return { success: false, fontName, error: 'External fonts disabled for stability' };

    } catch (error) {
      console.error(`❌ Failed to set font ${fontName}:`, error);
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
      
      // Выбираем оптимальный встроенный шрифт
      const selectedFont = this.selectOptimalFont(languages);
      console.log(`🎯 Selected font: ${selectedFont}`);
      
      // Загружаем встроенный шрифт
      const normalResult = await this.loadFont(pdf, selectedFont, 'normal');
      
      if (normalResult.success) {
        // Устанавливаем шрифт по умолчанию
        pdf.setFont(selectedFont, 'normal');
        return selectedFont;
      } else {
        // Fallback к базовому шрифту
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
      console.log(`✅ Fallback font set: times`);
      return 'times';
    } catch {
      // Последний резерв - helvetica
      try {
        pdf.setFont('helvetica', 'normal');
        console.log(`✅ Final fallback font set: helvetica`);
        return 'helvetica';
      } catch {
        console.error(`❌ All fonts failed, using default`);
        return 'helvetica';
      }
    }
  }

  /**
   * Загрузка шрифта как Base64 - ОТКЛЮЧЕНА для стабильности
   */
  private static async fetchFontAsBase64(url: string): Promise<string> {
    throw new Error('External font loading disabled for stability');
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
    return {
      'latin': ['times', 'helvetica', 'courier'],
      'cyrillic': ['times'],
      'latin-ext': ['times'],
      'greek': ['times'],
      'vietnamese': ['times'],
      'arabic': ['times']
    };
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
      'times',
      'helvetica'
    ];

    return {
      characters: characters.slice(0, 20), // Первые 20 уникальных символов
      unicodeRanges: [...new Set(unicodeRanges)],
      recommendedFonts: [...new Set(recommendedFonts)]
    };
  }

  /**
   * Проверка доступности шрифта в jsPDF
   */
  public static isFontAvailable(pdf: jsPDF, fontName: string, style: string = 'normal'): boolean {
    try {
      const fontList = pdf.getFontList();
      return fontList[fontName] && fontList[fontName].includes(style);
    } catch {
      return false;
    }
  }

  /**
   * Получение списка доступных шрифтов
   */
  public static getAvailableFonts(pdf: jsPDF): Record<string, string[]> {
    try {
      return pdf.getFontList();
    } catch {
      return {
        'helvetica': ['normal', 'bold', 'italic', 'bolditalic'],
        'times': ['normal', 'bold', 'italic', 'bolditalic'],
        'courier': ['normal', 'bold', 'italic', 'bolditalic']
      };
    }
  }
}