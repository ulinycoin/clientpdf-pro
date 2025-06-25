/**
 * EnhancedUnicodeFontService.ts
 * Расширенный сервис для работы со шрифтами с полной поддержкой Unicode
 * Решает проблемы отображения латышских, русских и других Unicode символов в PDF
 * 
 * Особенности:
 * - Автоматическое определение языка текста
 * - Выбор оптимального шрифта для контента
 * - Интеллектуальная транслитерация проблемных символов
 * - Поддержка кириллицы через внешние шрифты
 * - Fallback стратегии для максимальной совместимости
 */

import { jsPDF } from 'jspdf';

export interface FontMetrics {
  name: string;
  unicodeSupport: boolean;
  supportedLanguages: string[];
  fallbackRequired: boolean;
  quality: 'excellent' | 'good' | 'basic' | 'poor';
}

export interface TextAnalysis {
  hasLatinExtended: boolean;
  hasCyrillic: boolean;
  hasSpecialChars: boolean;
  detectedLanguages: string[];
  problemChars: string[];
  recommendedFont: string;
  needsTransliteration: boolean;
}

export interface FontSetupResult {
  success: boolean;
  selectedFont: string;
  warnings: string[];
  appliedTransliterations: number;
}

export class EnhancedUnicodeFontService {
  private static loadedFonts = new Set<string>();
  private static fontMetrics = new Map<string, FontMetrics>();
  private static isInitialized = false;

  /**
   * Инициализация сервиса с регистрацией всех доступных шрифтов
   */
  public static initialize(): void {
    if (this.isInitialized) return;

    // Регистрируем доступные шрифты с их характеристиками
    this.fontMetrics.set('helvetica', {
      name: 'helvetica',
      unicodeSupport: false,
      supportedLanguages: ['en', 'basic-latin'],
      fallbackRequired: true,
      quality: 'poor'
    });

    this.fontMetrics.set('times', {
      name: 'times',
      unicodeSupport: true,
      supportedLanguages: ['en', 'ru', 'lv', 'lt', 'pl', 'de', 'fr'],
      fallbackRequired: false,
      quality: 'good'
    });

    this.fontMetrics.set('courier', {
      name: 'courier',
      unicodeSupport: true,
      supportedLanguages: ['en', 'ru', 'lv', 'basic-unicode'],
      fallbackRequired: false,
      quality: 'basic'
    });

    this.isInitialized = true;
    console.log('✅ Enhanced Unicode Font Service initialized');
  }

  /**
   * Расширенная карта символьных замен для различных языков
   */
  private static readonly UNICODE_REPLACEMENTS = new Map<string, string>([
    // Латышские диакритические знаки
    ['ā', 'a'], ['Ā', 'A'],
    ['č', 'c'], ['Č', 'C'],
    ['ē', 'e'], ['Ē', 'E'],
    ['ģ', 'g'], ['Ģ', 'G'],
    ['ī', 'i'], ['Ī', 'I'],
    ['ķ', 'k'], ['Ķ', 'K'],
    ['ļ', 'l'], ['Ļ', 'L'],
    ['ņ', 'n'], ['Ņ', 'N'],
    ['š', 's'], ['Š', 'S'],
    ['ū', 'u'], ['Ū', 'U'],
    ['ž', 'z'], ['Ž', 'Z'],
    
    // Литовские символы
    ['ą', 'a'], ['Ą', 'A'],
    ['ę', 'e'], ['Ę', 'E'],
    ['ė', 'e'], ['Ė', 'E'],
    ['į', 'i'], ['Į', 'I'],
    ['ų', 'u'], ['Ų', 'U'],
    
    // Польские символы
    ['ć', 'c'], ['Ć', 'C'],
    ['ł', 'l'], ['Ł', 'L'],
    ['ń', 'n'], ['Ń', 'N'],
    ['ó', 'o'], ['Ó', 'O'],
    ['ś', 's'], ['Ś', 'S'],
    ['ź', 'z'], ['Ź', 'Z'],
    ['ż', 'z'], ['Ż', 'Z'],
    
    // Немецкие умлауты
    ['ä', 'ae'], ['Ä', 'Ae'],
    ['ö', 'oe'], ['Ö', 'Oe'],
    ['ü', 'ue'], ['Ü', 'Ue'],
    ['ß', 'ss'],
    
    // Французские диакритики
    ['à', 'a'], ['À', 'A'],
    ['â', 'a'], ['Â', 'A'],
    ['ç', 'c'], ['Ç', 'C'],
    ['é', 'e'], ['É', 'E'],
    ['è', 'e'], ['È', 'E'],
    ['ê', 'e'], ['Ê', 'E'],
    ['ë', 'e'], ['Ë', 'E'],
    ['î', 'i'], ['Î', 'I'],
    ['ï', 'i'], ['Ï', 'I'],
    ['ô', 'o'], ['Ô', 'O'],
    ['ù', 'u'], ['Ù', 'U'],
    ['û', 'u'], ['Û', 'U'],
    ['ü', 'u'], ['Ü', 'U'],
    ['ÿ', 'y'], ['Ÿ', 'Y'],
    
    // Русские символы (кириллица) - полная транслитерация
    ['а', 'a'], ['А', 'A'],
    ['б', 'b'], ['Б', 'B'],
    ['в', 'v'], ['В', 'V'],
    ['г', 'g'], ['Г', 'G'],
    ['д', 'd'], ['Д', 'D'],
    ['е', 'e'], ['Е', 'E'],
    ['ё', 'yo'], ['Ё', 'Yo'],
    ['ж', 'zh'], ['Ж', 'Zh'],
    ['з', 'z'], ['З', 'Z'],
    ['и', 'i'], ['И', 'I'],
    ['й', 'y'], ['Й', 'Y'],
    ['к', 'k'], ['К', 'K'],
    ['л', 'l'], ['Л', 'L'],
    ['м', 'm'], ['М', 'M'],
    ['н', 'n'], ['Н', 'N'],
    ['о', 'o'], ['О', 'O'],
    ['п', 'p'], ['П', 'P'],
    ['р', 'r'], ['Р', 'R'],
    ['с', 's'], ['С', 'S'],
    ['т', 't'], ['Т', 'T'],
    ['у', 'u'], ['У', 'U'],
    ['ф', 'f'], ['Ф', 'F'],
    ['х', 'h'], ['Х', 'H'],
    ['ц', 'ts'], ['Ц', 'Ts'],
    ['ч', 'ch'], ['Ч', 'Ch'],
    ['ш', 'sh'], ['Ш', 'Sh'],
    ['щ', 'sch'], ['Щ', 'Sch'],
    ['ъ', ''], ['Ъ', ''],
    ['ы', 'y'], ['Ы', 'Y'],
    ['ь', ''], ['Ь', ''],
    ['э', 'e'], ['Э', 'E'],
    ['ю', 'yu'], ['Ю', 'Yu'],
    ['я', 'ya'], ['Я', 'Ya'],
    
    // Специальные символы и пунктуация (используем Unicode коды)
    ['\u201C', '"'], ['\u201D', '"'], // Умные кавычки
    ['\u2018', "'"], ['\u2019', "'"], // Умные апострофы
    ['\u2013', '-'], ['\u2014', '-'], // Тире
    ['\u2026', '...'], // Многоточие
    ['\u2116', 'No.'], // Номер
    ['\u00B0', 'deg'], // Градус
    ['\u00B1', '+/-'], // Плюс-минус
    ['\u00D7', 'x'], // Умножение
    ['\u00F7', '/'], // Деление
    
    // Символы валют
    ['\u20AC', 'EUR'], ['\u00A3', 'GBP'], ['\u00A5', 'JPY'],
    ['\u20BD', 'RUB'], ['\u20B4', 'UAH'], ['\u20BF', 'BTC'],
    
    // Математические символы
    ['\u2264', '<='], ['\u2265', '>='], ['\u2260', '!='],
    ['\u2248', '~='], ['\u221E', 'inf'], ['\u221A', 'sqrt'],
    
    // Греческие буквы (часто встречаются в научных текстах)
    ['\u03B1', 'alpha'], ['\u03B2', 'beta'], ['\u03B3', 'gamma'],
    ['\u03B4', 'delta'], ['\u03B5', 'epsilon'], ['\u03B8', 'theta'],
    ['\u03BB', 'lambda'], ['\u03BC', 'mu'], ['\u03C0', 'pi'],
    ['\u03C3', 'sigma'], ['\u03C6', 'phi'], ['\u03C9', 'omega']
  ]);

  /**
   * Анализ текста для определения языков и проблемных символов
   */
  public static analyzeText(text: string): TextAnalysis {
    if (!text) {
      return {
        hasLatinExtended: false,
        hasCyrillic: false,
        hasSpecialChars: false,
        detectedLanguages: ['en'],
        problemChars: [],
        recommendedFont: 'helvetica',
        needsTransliteration: false
      };
    }

    const analysis: TextAnalysis = {
      hasLatinExtended: false,
      hasCyrillic: false,
      hasSpecialChars: false,
      detectedLanguages: [],
      problemChars: [],
      recommendedFont: 'helvetica',
      needsTransliteration: false
    };

    // Проверяем расширенную латиницу (диакритики)
    if (/[À-ÿĀ-žА-я]/.test(text)) {
      analysis.hasLatinExtended = true;
    }

    // Проверяем кириллицу
    if (/[А-я]/u.test(text)) {
      analysis.hasCyrillic = true;
      analysis.detectedLanguages.push('ru');
    }

    // Определяем конкретные языки по характерным символам
    if (/[āčēģīķļņšūž]/i.test(text)) {
      analysis.detectedLanguages.push('lv'); // Латышский
    }
    if (/[ąęėįų]/i.test(text)) {
      analysis.detectedLanguages.push('lt'); // Литовский
    }
    if (/[ąćęłńóśźż]/i.test(text)) {
      analysis.detectedLanguages.push('pl'); // Польский
    }
    if (/[äöüß]/i.test(text)) {
      analysis.detectedLanguages.push('de'); // Немецкий
    }
    if (/[àâçéèêëîïôùûüÿ]/i.test(text)) {
      analysis.detectedLanguages.push('fr'); // Французский
    }

    // Проверяем специальные символы
    if (/[\u201C\u201D\u2018\u2019\u2013\u2014\u2026\u2116\u00B0\u00B1\u00D7\u00F7\u20AC\u00A3\u00A5\u20BD]/.test(text)) {
      analysis.hasSpecialChars = true;
    }

    // Находим проблемные символы
    const problemChars = new Set<string>();
    for (const char of text) {
      if (this.UNICODE_REPLACEMENTS.has(char)) {
        problemChars.add(char);
      }
    }
    analysis.problemChars = Array.from(problemChars);

    // Определяем нужна ли транслитерация
    analysis.needsTransliteration = analysis.problemChars.length > 0;

    // Рекомендуем шрифт
    analysis.recommendedFont = this.selectOptimalFont(analysis);

    // Если нет специфических языков, добавляем английский
    if (analysis.detectedLanguages.length === 0) {
      analysis.detectedLanguages.push('en');
    }

    return analysis;
  }

  /**
   * Выбор оптимального шрифта на основе анализа текста
   */
  private static selectOptimalFont(analysis: TextAnalysis): string {
    // Если есть кириллица, предпочитаем Times (лучшая поддержка)
    if (analysis.hasCyrillic) {
      return 'times';
    }

    // Для расширенной латиницы тоже Times
    if (analysis.hasLatinExtended) {
      return 'times';
    }

    // Для базового английского текста можно использовать любой
    return 'helvetica';
  }

  /**
   * Умная очистка и транслитерация текста - УЛУЧШЕННАЯ ВЕРСИЯ
   */
  public static smartCleanText(text: string, preserveCyrillic: boolean = false): string {
    if (!text) return '';

    let cleaned = String(text);
    let replacementCount = 0;

    // Если нужно сохранить кириллицу, пропускаем её транслитерацию
    const replacements = preserveCyrillic ? 
      this.getNonCyrillicReplacements() : 
      this.UNICODE_REPLACEMENTS;

    // Применяем замены
    for (const [unicode, replacement] of replacements) {
      if (cleaned.includes(unicode)) {
        cleaned = cleaned.replace(new RegExp(unicode, 'g'), replacement);
        replacementCount++;
      }
    }

    // Дополнительная очистка для лучшей читаемости
    cleaned = cleaned
      // Удаляем невидимые символы
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Убираем двойные вопросительные знаки
      .replace(/\?\?+/g, '?')
      // Убираем вопросительные знаки в начале/конце слов
      .replace(/\b\?+/g, '')
      .replace(/\?+\b/g, '')
      // Очищаем последовательности типа "?alpha?epsilon"
      .replace(/\?[a-z]+\?/g, '')
      // Нормализуем пробелы
      .replace(/\s+/g, ' ')
      .trim();

    // Если НЕ сохраняем кириллицу, заменяем её на пустую строку
    if (!preserveCyrillic) {
      cleaned = cleaned.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');
    }

    // Финальная очистка
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Получает замены без кириллицы
   */
  private static getNonCyrillicReplacements(): Map<string, string> {
    const nonCyrillicReplacements = new Map<string, string>();
    
    for (const [key, value] of this.UNICODE_REPLACEMENTS) {
      // Пропускаем кириллические символы
      if (!/[а-яё]/i.test(key)) {
        nonCyrillicReplacements.set(key, value);
      }
    }
    
    return nonCyrillicReplacements;
  }

  /**
   * Определяет стоит ли сохранять кириллицу
   */
  private static shouldPreserveCyrillic(text: string): boolean {
    // Подсчитываем процент кириллических символов
    const cyrillicMatches = text.match(/[а-яё]/gi);
    const totalLetters = text.match(/[a-zA-Zа-яё]/gi);
    
    if (!cyrillicMatches || !totalLetters) {
      return false;
    }
    
    const cyrillicPercentage = cyrillicMatches.length / totalLetters.length;
    
    // Если больше 20% текста - кириллица, пытаемся сохранить
    return cyrillicPercentage > 0.2;
  }

  /**
   * Настройка PDF с оптимальным шрифтом - ОБНОВЛЕНО для поддержки кириллицы
   */
  public static async setupPDFFont(pdf: jsPDF, sampleTexts: string[]): Promise<FontSetupResult> {
    this.initialize();

    const result: FontSetupResult = {
      success: false,
      selectedFont: 'helvetica',
      warnings: [],
      appliedTransliterations: 0
    };

    try {
      // Анализируем весь текст
      const combinedText = sampleTexts.join(' ');
      const analysis = this.analyzeText(combinedText);

      console.log('🔍 Text analysis:', {
        languages: analysis.detectedLanguages,
        problemChars: analysis.problemChars.length,
        recommendedFont: analysis.recommendedFont,
        needsTransliteration: analysis.needsTransliteration,
        hasCyrillic: analysis.hasCyrillic
      });

      // 🆕 НОВОЕ: Проверяем нужна ли поддержка кириллицы
      const needsCyrillic = analysis.hasCyrillic && this.shouldPreserveCyrillic(combinedText);

      if (needsCyrillic) {
        console.log('🔤 Attempting to preserve Cyrillic characters...');
        
        // Попытка 1: Внешний шрифт с кириллицей
        try {
          const { ExternalFontLoader } = await import('./ExternalFontLoader');
          const fontResult = await ExternalFontLoader.setupPDFWithCyrillicFont(pdf, 'Roboto');
          
          if (fontResult.success) {
            result.success = true;
            result.selectedFont = fontResult.fontName;
            result.warnings.push('Using external Cyrillic font: ' + fontResult.fontName);
            console.log(`✅ External Cyrillic font loaded: ${fontResult.fontName}`);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ External font loading failed:', error);
        }

        // Попытка 2: Встроенная поддержка кириллицы
        try {
          const { CyrillicFontService } = await import('./CyrillicFontService');
          const cyrillicResult = CyrillicFontService.setupCyrillicSupport(pdf);
          
          if (cyrillicResult.success) {
            result.success = true;
            result.selectedFont = cyrillicResult.selectedFont;
            result.warnings.push('Using built-in Cyrillic support');
            console.log(`✅ Built-in Cyrillic support enabled`);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ Built-in Cyrillic support failed:', error);
        }

        // Если кириллица не поддерживается, предупреждаем пользователя
        result.warnings.push('Cyrillic characters will be transliterated due to font limitations');
      }

      // Стандартная логика выбора шрифта (как было раньше)
      const targetFont = analysis.recommendedFont;
      
      try {
        // Настройка Unicode поддержки для jsPDF
        this.enableUnicodeSupport(pdf);
        
        // Устанавливаем шрифт
        pdf.setFont(targetFont, 'normal');
        this.loadedFonts.add(targetFont);
        
        result.success = true;
        result.selectedFont = targetFont;
        
        console.log(`✅ Font set successfully: ${targetFont}`);

      } catch (fontError) {
        console.warn(`⚠️ Failed to set ${targetFont}, falling back...`);
        result.warnings.push(`Font ${targetFont} failed, using fallback`);
        
        // Fallback к helvetica
        pdf.setFont('helvetica', 'normal');
        result.selectedFont = 'helvetica';
        result.success = true;
      }

      // Добавляем предупреждения
      if (analysis.needsTransliteration && !needsCyrillic) {
        result.warnings.push(`${analysis.problemChars.length} characters will be transliterated`);
        result.appliedTransliterations = analysis.problemChars.length;
      }

      if (analysis.detectedLanguages.length > 1) {
        result.warnings.push(`Multiple languages detected: ${analysis.detectedLanguages.join(', ')}`);
      }

    } catch (error) {
      console.error('❌ Font setup failed:', error);
      result.warnings.push(`Setup failed: ${error}`);
      
      // Последний fallback
      try {
        pdf.setFont('helvetica', 'normal');
        result.selectedFont = 'helvetica';
        result.success = true;
      } catch {
        result.success = false;
        result.warnings.push('All fonts failed');
      }
    }

    return result;
  }

  /**
   * Включение поддержки Unicode в jsPDF
   */
  private static enableUnicodeSupport(pdf: jsPDF): void {
    try {
      // Доступ к внутреннему API jsPDF для Unicode
      const pdfInternal = (pdf as any).internal;
      
      if (pdfInternal) {
        // Включаем поддержку UTF-8
        pdfInternal.pdfEscape = function(text: string, flags: any) {
          return this.utf8encode(text);
        };
        
        // Настраиваем кодировку
        pdfInternal.unicode = {
          enabled: true,
          encoding: 'UTF-8'
        };
      }
      
      console.log('✅ Unicode support enabled in jsPDF');
    } catch (error) {
      console.warn('⚠️ Could not enable Unicode support:', error);
    }
  }

  /**
   * Получение статистики по шрифтам
   */
  public static getFontStats(): {
    availableFonts: string[];
    loadedFonts: string[];
    recommendations: string[];
  } {
    this.initialize();
    
    const availableFonts = Array.from(this.fontMetrics.keys());
    const loadedFonts = Array.from(this.loadedFonts);
    
    const recommendations = [
      'Use Times Roman for multilingual content',
      'Courier provides good monospace Unicode support',
      'Helvetica is basic but universally compatible',
      'Always test with sample text containing special characters'
    ];

    return {
      availableFonts,
      loadedFonts,
      recommendations
    };
  }

  /**
   * Тестирование шрифта с образцом текста
   */
  public static testFontWithSample(fontName: string, sampleText: string): {
    isSupported: boolean;
    issues: string[];
    cleanedText: string;
    analysis: TextAnalysis;
  } {
    this.initialize();
    
    const analysis = this.analyzeText(sampleText);
    const cleanedText = this.smartCleanText(sampleText);
    const fontInfo = this.fontMetrics.get(fontName);
    
    const issues: string[] = [];
    let isSupported = true;

    if (!fontInfo) {
      issues.push(`Font ${fontName} is not registered`);
      isSupported = false;
    } else {
      if (analysis.hasCyrillic && !fontInfo.supportedLanguages.includes('ru')) {
        issues.push('Cyrillic characters may not display correctly');
        isSupported = false;
      }
      
      if (analysis.hasLatinExtended && fontInfo.quality === 'poor') {
        issues.push('Extended Latin characters may need transliteration');
      }
    }

    if (analysis.problemChars.length > 0) {
      issues.push(`${analysis.problemChars.length} characters will be transliterated`);
    }

    return {
      isSupported,
      issues,
      cleanedText,
      analysis
    };
  }

  /**
   * Очистка кэша
   */
  public static clearCache(): void {
    this.loadedFonts.clear();
    console.log('🧹 Font cache cleared');
  }
}