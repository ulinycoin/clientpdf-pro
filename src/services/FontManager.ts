/**
 * FontManager.ts - УЛУЧШЕННЫЙ менеджер шрифтов с Unicode поддержкой
 * Версия 2.0 - с лучшей обработкой символов и кодировок
 */

import { jsPDF } from 'jspdf';

export interface FontInfo {
  name: string;
  style: 'normal' | 'bold' | 'italic' | 'bolditalic';
  unicodeSupport: string[];
  fallbackChars: Record<string, string>;
  description: string;
}

export interface FontLoadResult {
  success: boolean;
  fontName: string;
  error?: string;
}

export class FontManager {
  private static loadedFonts = new Set<string>();
  
  /**
   * Карта замещения символов для проблемных Unicode символов
   */
  private static readonly CHAR_REPLACEMENTS: Record<string, string> = {
    // Латышские символы → ближайшие латинские
    'ā': 'a', 'Ā': 'A',
    'č': 'c', 'Č': 'C', 
    'ē': 'e', 'Ē': 'E',
    'ģ': 'g', 'Ģ': 'G',
    'ī': 'i', 'Ī': 'I',
    'ķ': 'k', 'Ķ': 'K',
    'ļ': 'l', 'Ļ': 'L',
    'ņ': 'n', 'Ņ': 'N',
    'š': 's', 'Š': 'S',
    'ū': 'u', 'Ū': 'U',
    'ž': 'z', 'Ž': 'Z',
    
    // Литовские символы
    'ą': 'a', 'Ą': 'A',
    'ę': 'e', 'Ę': 'E',
    'ė': 'e', 'Ė': 'E',
    'į': 'i', 'Į': 'I',
    'ų': 'u', 'Ų': 'U',
    
    // Польские символы
    'ć': 'c', 'Ć': 'C',
    'ł': 'l', 'Ł': 'L',
    'ń': 'n', 'Ń': 'N',
    'ó': 'o', 'Ó': 'O',
    'ś': 's', 'Ś': 'S',
    'ź': 'z', 'Ź': 'Z',
    'ż': 'z', 'Ż': 'Z',
    
    // Греческие символы → латинские эквиваленты
    'α': 'a', 'Α': 'A',
    'β': 'b', 'Β': 'B', 
    'γ': 'g', 'Γ': 'G',
    'δ': 'd', 'Δ': 'D',
    'ε': 'e', 'Ε': 'E',
    'ζ': 'z', 'Ζ': 'Z',
    'η': 'h', 'Η': 'H',
    'θ': 'th', 'Θ': 'TH',
    'ι': 'i', 'Ι': 'I',
    'κ': 'k', 'Κ': 'K',
    'λ': 'l', 'Λ': 'L',
    'μ': 'm', 'Μ': 'M',
    'ν': 'n', 'Ν': 'N',
    'ξ': 'x', 'Ξ': 'X',
    'ο': 'o', 'Ο': 'O',
    'π': 'p', 'Π': 'P',
    'ρ': 'r', 'Ρ': 'R',
    'σ': 's', 'Σ': 'S',
    'ς': 's',
    'τ': 't', 'Τ': 'T',
    'υ': 'y', 'Υ': 'Y',
    'φ': 'f', 'Φ': 'F',
    'χ': 'ch', 'Χ': 'CH',
    'ψ': 'ps', 'Ψ': 'PS',
    'ω': 'o', 'Ω': 'O',
    
    // Специальные символы валют
    '₽': 'RUB',
    '€': 'EUR',
    '£': 'GBP',
    '$': 'USD',
    
    // Другие проблемные символы
    '–': '-',
    '—': '-',
    ''': "'",
    ''': "'",
    '"': '"',
    '"': '"',
    '…': '...',
    '№': 'No.',
  };

  /**
   * Поддерживаемые шрифты с информацией о Unicode поддержке
   */
  public static readonly SUPPORTED_FONTS: Record<string, FontInfo> = {
    'courier': {
      name: 'courier',
      style: 'normal',
      unicodeSupport: ['latin', 'limited-cyrillic'],
      fallbackChars: {},
      description: 'Courier - моноширинный шрифт с ограниченной Unicode поддержкой'
    },
    'helvetica': {
      name: 'helvetica',
      style: 'normal', 
      unicodeSupport: ['latin', 'limited-cyrillic'],
      fallbackChars: {},
      description: 'Helvetica - базовый шрифт с минимальной Unicode поддержкой'
    },
    'times': {
      name: 'times',
      style: 'normal',
      unicodeSupport: ['latin', 'cyrillic', 'partial-greek'],
      fallbackChars: {},
      description: 'Times Roman - лучший встроенный шрифт для Unicode'
    }
  };

  /**
   * Автоматическое определение языка текста
   */
  public static detectLanguage(text: string): string[] {
    const languages: string[] = [];
    
    // Кириллица (в основном поддерживается Times)
    if (/[\u0400-\u04FF]/.test(text)) {
      languages.push('cyrillic');
    }
    
    // Латинские расширения (плохо поддерживаются встроенными шрифтами)
    if (/[\u0100-\u017F]/.test(text)) {
      languages.push('latin-ext');
    }
    
    // Греческий (частично поддерживается Times)
    if (/[\u0370-\u03FF]/.test(text)) {
      languages.push('greek');
    }
    
    // Базовая латиница (хорошо поддерживается всеми)
    if (/[A-Za-z]/.test(text)) {
      languages.push('latin');
    }
    
    return languages.length > 0 ? languages : ['latin'];
  }

  /**
   * Выбор оптимального шрифта для языка
   */
  public static selectOptimalFont(detectedLanguages: string[]): string {
    // Для всех языков используем Courier как наиболее стабильный
    // Times имеет проблемы с кодировкой, Helvetica - ограниченную поддержку
    if (detectedLanguages.includes('cyrillic')) {
      return 'courier'; // Courier лучше обрабатывает кириллицу чем Times
    }
    
    if (detectedLanguages.includes('latin-ext') || detectedLanguages.includes('greek')) {
      return 'courier'; // Courier + замещение символов
    }
    
    return 'courier'; // Courier как универсальный выбор
  }

  /**
   * Очистка и нормализация текста для PDF
   */
  public static sanitizeTextForPDF(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let cleanText = text;
    
    // Применяем замещения символов
    Object.entries(this.CHAR_REPLACEMENTS).forEach(([unicode, replacement]) => {
      cleanText = cleanText.replace(new RegExp(unicode, 'g'), replacement);
    });
    
    // Удаляем или заменяем оставшиеся проблемные символы
    cleanText = cleanText
      // Заменяем невидимые символы
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Заменяем символы, которые могут вызвать проблемы
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0400-\u04FF]/g, '?')
      // Нормализуем пробелы
      .replace(/\s+/g, ' ')
      .trim();

    return cleanText;
  }

  /**
   * Загрузка шрифта в jsPDF
   */
  public static async loadFont(pdf: jsPDF, fontName: string, style: 'normal' | 'bold' = 'normal'): Promise<FontLoadResult> {
    const cacheKey = `${fontName}_${style}`;
    
    if (this.loadedFonts.has(cacheKey)) {
      return { success: true, fontName };
    }

    try {
      // Проверяем доступность шрифта
      if (!this.SUPPORTED_FONTS[fontName]) {
        throw new Error(`Font ${fontName} not supported`);
      }

      // Устанавливаем шрифт
      pdf.setFont(fontName, style);
      this.loadedFonts.add(cacheKey);
      
      console.log(`✅ Font set: ${fontName} (${style})`);
      return { success: true, fontName };

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
   * Настройка шрифтов для текста с автоматической очисткой
   */
  public static async setupFontsForText(pdf: jsPDF, texts: string[]): Promise<string> {
    try {
      // Очищаем и объединяем весь текст
      const cleanTexts = texts.map(text => this.sanitizeTextForPDF(text));
      const combinedText = cleanTexts.join(' ');
      
      // Определяем языки
      const languages = this.detectLanguage(combinedText);
      console.log(`🔍 Detected languages: ${languages.join(', ')}`);
      
      // Выбираем шрифт
      const selectedFont = this.selectOptimalFont(languages);
      console.log(`🎯 Selected font: ${selectedFont}`);
      
      // Загружаем шрифт
      const result = await this.loadFont(pdf, selectedFont, 'normal');
      
      if (result.success) {
        pdf.setFont(selectedFont, 'normal');
        return selectedFont;
      } else {
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
    try {
      pdf.setFont('courier', 'normal');
      console.log(`✅ Fallback font set: courier`);
      return 'courier';
    } catch {
      try {
        pdf.setFont('helvetica', 'normal');
        console.log(`✅ Final fallback font set: helvetica`);
        return 'helvetica';
      } catch {
        console.error(`❌ All fonts failed`);
        return 'helvetica';
      }
    }
  }

  /**
   * Очистка кэша шрифтов
   */
  public static clearCache(): void {
    this.loadedFonts.clear();
    console.log('🧹 Font cache cleared');
  }

  /**
   * Получение информации о поддерживаемых языках
   */
  public static getSupportedLanguages(): Record<string, string[]> {
    return {
      'latin': ['courier', 'helvetica', 'times'],
      'cyrillic': ['courier', 'times'],
      'latin-ext': ['courier'], // с заменой символов
      'greek': ['courier'], // с заменой символов
    };
  }

  /**
   * Тестирование текста и предложение исправлений
   */
  public static analyzeAndFixText(text: string): {
    original: string;
    cleaned: string;
    replacements: Array<{from: string, to: string}>;
    recommendedFont: string;
    issues: string[];
  } {
    const original = text;
    const cleaned = this.sanitizeTextForPDF(text);
    const languages = this.detectLanguage(text);
    const recommendedFont = this.selectOptimalFont(languages);
    
    // Находим замещения
    const replacements: Array<{from: string, to: string}> = [];
    Object.entries(this.CHAR_REPLACEMENTS).forEach(([from, to]) => {
      if (original.includes(from)) {
        replacements.push({ from, to });
      }
    });

    // Анализируем проблемы
    const issues: string[] = [];
    if (languages.includes('latin-ext')) {
      issues.push('Латинские расширения заменены на базовые символы');
    }
    if (languages.includes('greek')) {
      issues.push('Греческие символы заменены на латинские эквиваленты');
    }
    if (languages.includes('cyrillic')) {
      issues.push('Кириллица может отображаться неправильно в некоторых шрифтах');
    }
    if (original !== cleaned) {
      issues.push('Текст был очищен от проблемных символов');
    }

    return {
      original,
      cleaned,
      replacements,
      recommendedFont,
      issues
    };
  }
}