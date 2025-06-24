/**
 * FontManagerEnhanced.ts - Улучшенный менеджер шрифтов с поддержкой кастомных Unicode шрифтов
 * Версия 3.0 - Полная поддержка Unicode через base64 встроенные шрифты
 */

import { jsPDF } from 'jspdf';

// Импортируем base64 версии шрифтов
import { RobotoRegularBase64 } from '../assets/fonts/RobotoRegular';
import { RobotoBoldBase64 } from '../assets/fonts/RobotoBold';
import { DejaVuSansBase64 } from '../assets/fonts/DejaVuSans';

export interface CustomFontInfo {
  name: string;
  style: 'normal' | 'bold' | 'italic' | 'bolditalic';
  weight: number;
  unicodeSupport: string[];
  fontData?: string; // Base64 encoded font
  loaded: boolean;
  description: string;
}

export interface FontLoadResult {
  success: boolean;
  fontName: string;
  error?: string;
}

export class FontManagerEnhanced {
  private static loadedFonts = new Map<string, boolean>();
  private static fontDataCache = new Map<string, string>();
  
  /**
   * База данных встроенных base64 шрифтов
   */
  private static readonly EMBEDDED_FONTS: Record<string, { normal?: string; bold?: string }> = {
    'Roboto': {
      normal: RobotoRegularBase64,
      bold: RobotoBoldBase64
    },
    'DejaVuSans': {
      normal: DejaVuSansBase64,
      bold: DejaVuSansBase64 // Используем обычный для bold пока нет отдельного
    }
  };

  /**
   * Информация о поддерживаемых кастомных шрифтах
   */
  public static readonly CUSTOM_FONTS: Record<string, CustomFontInfo> = {
    'Roboto': {
      name: 'Roboto',
      style: 'normal',
      weight: 400,
      unicodeSupport: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext'],
      loaded: false,
      description: 'Roboto - современный шрифт с полной Unicode поддержкой'
    },
    'DejaVuSans': {
      name: 'DejaVuSans',
      style: 'normal',
      weight: 400,
      unicodeSupport: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'arabic'],
      loaded: false,
      description: 'DejaVu Sans - открытый шрифт с широкой Unicode поддержкой'
    }
  };

  /**
   * Встроенные шрифты jsPDF (fallback)
   */
  public static readonly BUILTIN_FONTS: Record<string, CustomFontInfo> = {
    'helvetica': {
      name: 'helvetica',
      style: 'normal',
      weight: 400,
      unicodeSupport: ['latin'],
      loaded: true,
      description: 'Helvetica - встроенный шрифт с базовой поддержкой'
    },
    'times': {
      name: 'times',
      style: 'normal',
      weight: 400,
      unicodeSupport: ['latin'],
      loaded: true,
      description: 'Times - встроенный шрифт с базовой поддержкой'
    },
    'courier': {
      name: 'courier',
      style: 'normal',
      weight: 400,
      unicodeSupport: ['latin'],
      loaded: true,
      description: 'Courier - моноширинный встроенный шрифт'
    }
  };

  /**
   * Загрузка кастомного шрифта в jsPDF
   */
  public static async loadCustomFont(
    pdf: jsPDF, 
    fontName: string, 
    style: 'normal' | 'bold' = 'normal'
  ): Promise<FontLoadResult> {
    const cacheKey = `${fontName}_${style}`;
    
    // Проверяем кэш
    if (this.loadedFonts.has(cacheKey) && this.loadedFonts.get(cacheKey)) {
      return { success: true, fontName };
    }

    try {
      // Проверяем наличие встроенного base64 шрифта
      const embeddedFont = this.EMBEDDED_FONTS[fontName];
      if (!embeddedFont || !embeddedFont[style]) {
        throw new Error(`Font ${fontName} (${style}) not found in embedded fonts`);
      }

      const fontData = embeddedFont[style];
      if (!fontData) {
        throw new Error(`Font data for ${fontName} (${style}) is empty`);
      }

      // Добавляем шрифт в jsPDF
      const fontId = `${fontName}-${style}`;
      pdf.addFileToVFS(`${fontId}.ttf`, fontData);
      pdf.addFont(`${fontId}.ttf`, fontName, style);
      
      // Устанавливаем шрифт
      pdf.setFont(fontName, style);
      
      // Сохраняем в кэш
      this.loadedFonts.set(cacheKey, true);
      console.log(`✅ Custom font loaded: ${fontName} (${style})`);
      
      return { success: true, fontName };

    } catch (error) {
      console.error(`❌ Failed to load custom font ${fontName}:`, error);
      return { 
        success: false, 
        fontName,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Автоматическое определение языка текста
   */
  public static detectLanguages(text: string): string[] {
    const languages: string[] = [];
    
    // Кириллица
    if (/[\u0400-\u04FF]/.test(text)) {
      languages.push('cyrillic');
    }
    
    // Латинские расширения
    if (/[\u0100-\u017F]/.test(text)) {
      languages.push('latin-ext');
    }
    
    // Греческий
    if (/[\u0370-\u03FF]/.test(text)) {
      languages.push('greek');
    }
    
    // Арабский
    if (/[\u0600-\u06FF]/.test(text)) {
      languages.push('arabic');
    }
    
    // Иврит
    if (/[\u0590-\u05FF]/.test(text)) {
      languages.push('hebrew');
    }
    
    // CJK (китайский, японский, корейский)
    if (/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(text)) {
      languages.push('cjk');
    }
    
    // Базовая латиница
    if (/[A-Za-z]/.test(text)) {
      languages.push('latin');
    }
    
    return languages.length > 0 ? languages : ['latin'];
  }

  /**
   * Выбор оптимального шрифта для языков
   */
  public static selectOptimalFont(languages: string[]): { fontName: string; useCustom: boolean } {
    // Проверяем нужны ли кастомные шрифты
    const needsCustomFont = languages.some(lang => 
      ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'arabic', 'hebrew', 'cjk', 'latin-ext'].includes(lang)
    );

    if (!needsCustomFont) {
      // Для базовой латиницы можем использовать встроенные шрифты
      return { fontName: 'helvetica', useCustom: false };
    }

    // Для специальных языков выбираем подходящий кастомный шрифт
    if (languages.includes('arabic') || languages.includes('hebrew')) {
      return { fontName: 'DejaVuSans', useCustom: true };
    }
    
    if (languages.includes('cjk')) {
      // Для CJK нужен специальный шрифт (пока используем DejaVuSans)
      return { fontName: 'DejaVuSans', useCustom: true };
    }
    
    // Для остальных случаев используем Roboto
    return { fontName: 'Roboto', useCustom: true };
  }

  /**
   * Настройка шрифтов для текста с автоматическим выбором
   */
  public static async setupFontsForText(
    pdf: jsPDF, 
    texts: string[],
    preferredFont?: string
  ): Promise<string> {
    try {
      // Объединяем весь текст для анализа
      const combinedText = texts.join(' ');
      
      // Определяем языки
      const languages = this.detectLanguages(combinedText);
      console.log(`🔍 Detected languages: ${languages.join(', ')}`);
      
      // Выбираем оптимальный шрифт
      const { fontName, useCustom } = preferredFont 
        ? { fontName: preferredFont, useCustom: !this.BUILTIN_FONTS[preferredFont] }
        : this.selectOptimalFont(languages);
      
      console.log(`🎯 Selected font: ${fontName} (custom: ${useCustom})`);
      
      if (useCustom) {
        // Загружаем кастомный шрифт
        const normalResult = await this.loadCustomFont(pdf, fontName, 'normal');
        
        // Пробуем загрузить bold версию
        await this.loadCustomFont(pdf, fontName, 'bold').catch(() => {
          console.log(`⚠️ Bold version of ${fontName} not available`);
        });
        
        if (normalResult.success) {
          return fontName;
        } else {
          // Fallback к встроенным шрифтам
          return this.setupBuiltinFont(pdf);
        }
      } else {
        // Используем встроенный шрифт
        return this.setupBuiltinFont(pdf, fontName);
      }
      
    } catch (error) {
      console.error('❌ Font setup failed:', error);
      return this.setupBuiltinFont(pdf);
    }
  }

  /**
   * Настройка встроенного шрифта
   */
  private static setupBuiltinFont(pdf: jsPDF, fontName: string = 'helvetica'): string {
    try {
      pdf.setFont(fontName, 'normal');
      console.log(`✅ Builtin font set: ${fontName}`);
      return fontName;
    } catch {
      // Final fallback
      pdf.setFont('helvetica', 'normal');
      console.log(`✅ Final fallback font set: helvetica`);
      return 'helvetica';
    }
  }

  /**
   * Проверка поддержки текста выбранным шрифтом
   */
  public static validateTextSupport(text: string, fontName: string): {
    supported: boolean;
    unsupportedChars: string[];
    recommendation?: string;
  } {
    const languages = this.detectLanguages(text);
    const fontInfo = { ...this.CUSTOM_FONTS, ...this.BUILTIN_FONTS }[fontName];
    
    if (!fontInfo) {
      return { 
        supported: false, 
        unsupportedChars: [],
        recommendation: 'Use Roboto or DejaVuSans for better Unicode support'
      };
    }

    // Проверяем поддержку языков
    const unsupportedLanguages = languages.filter(lang => 
      !fontInfo.unicodeSupport.includes(lang)
    );

    if (unsupportedLanguages.length === 0) {
      return { supported: true, unsupportedChars: [] };
    }

    // Находим проблемные символы
    const unsupportedChars = new Set<string>();
    const chars = text.split('');
    
    chars.forEach(char => {
      const charCode = char.charCodeAt(0);
      
      // Проверяем диапазоны Unicode
      if (unsupportedLanguages.includes('cyrillic') && charCode >= 0x0400 && charCode <= 0x04FF) {
        unsupportedChars.add(char);
      }
      if (unsupportedLanguages.includes('greek') && charCode >= 0x0370 && charCode <= 0x03FF) {
        unsupportedChars.add(char);
      }
      // ... другие проверки
    });

    return {
      supported: false,
      unsupportedChars: Array.from(unsupportedChars),
      recommendation: `Font ${fontName} doesn't support: ${unsupportedLanguages.join(', ')}. Use DejaVuSans or Roboto instead.`
    };
  }

  /**
   * Получение информации о всех доступных шрифтах
   */
  public static getAvailableFonts(): Array<CustomFontInfo & { isBuiltin: boolean }> {
    const customFonts = Object.values(this.CUSTOM_FONTS).map(font => ({
      ...font,
      isBuiltin: false
    }));
    
    const builtinFonts = Object.values(this.BUILTIN_FONTS).map(font => ({
      ...font,
      isBuiltin: true
    }));
    
    return [...customFonts, ...builtinFonts];
  }

  /**
   * Очистка кэша шрифтов
   */
  public static clearCache(): void {
    this.loadedFonts.clear();
    this.fontDataCache.clear();
    console.log('🧹 Font cache cleared');
  }
}
