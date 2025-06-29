/**
 * EnhancedUnicodeFontService.ts
 * 🛡️ ОБНОВЛЕНО: Добавлен флаг useSystemFonts для принудительного использования системных шрифтов
 * Решает проблемы отображения латышских, русских и других Unicode символов в PDF
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
  preservesCyrillic?: boolean;
}

// 🆕 Добавлен интерфейс с флагом useSystemFonts
export interface FontSetupOptions {
  useSystemFonts?: boolean;
  fontFamily?: string;
  preserveCyrillic?: boolean;
}

export class EnhancedUnicodeFontService {
  private static loadedFonts = new Set<string>();
  private static fontMetrics = new Map<string, FontMetrics>();
  private static isInitialized = false;

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
    
    // Специальные символы и пунктуация
    ['\\u201C', '\"'], ['\\u201D', '\"'], // Умные кавычки
    ['\\u2018', \"'\"], ['\\u2019', \"'\"], // Умные апострофы
    ['\\u2013', '-'], ['\\u2014', '-'], // Тире
    ['\\u2026', '...'], // Многоточие
    ['\\u2116', 'No.'], // Номер
    ['\\u00B0', 'deg'], // Градус
    
    // Символы валют
    ['\\u20AC', 'EUR'], ['\\u00A3', 'GBP'], ['\\u00A5', 'JPY'],
    ['\\u20BD', 'RUB'], ['\\u20B4', 'UAH'],
    
    // Эмодзи (удаляем)
    ['\\u{1F600}', ''], ['\\u{1F601}', ''], ['\\u{1F602}', ''],
    ['\\u{1F603}', ''], ['\\u{1F604}', ''], ['\\u{1F605}', '']
  ]);

  /**
   * Инициализация сервиса
   */
  public static initialize(): void {
    if (this.isInitialized) return;

    // Регистрируем системные шрифты
    this.fontMetrics.set('Arial', {
      name: 'Arial',
      unicodeSupport: true,
      supportedLanguages: ['en', 'ru', 'lv', 'lt', 'pl', 'de', 'fr'],
      fallbackRequired: false,
      quality: 'excellent'
    });

    this.fontMetrics.set('helvetica', {
      name: 'helvetica',
      unicodeSupport: false,
      supportedLanguages: ['en', 'basic-latin'],
      fallbackRequired: true,
      quality: 'good'
    });

    this.fontMetrics.set('times', {
      name: 'times',
      unicodeSupport: true,
      supportedLanguages: ['en', 'ru', 'lv', 'lt', 'pl', 'de', 'fr'],
      fallbackRequired: false,
      quality: 'good'
    });

    this.isInitialized = true;
    console.log('✅ Enhanced Unicode Font Service initialized');
  }

  /**
   * 🛡️ ОБНОВЛЕННЫЙ метод настройки PDF с поддержкой флага useSystemFonts
   */
  public static async setupPDFFont(
    pdf: jsPDF, 
    sampleTexts: string[], 
    options: FontSetupOptions = {}
  ): Promise<FontSetupResult> {
    this.initialize();

    const result: FontSetupResult = {
      success: false,
      selectedFont: 'Arial',
      warnings: [],
      appliedTransliterations: 0,
      preservesCyrillic: false
    };

    try {
      // 🛡️ НОВАЯ ЛОГИКА: Проверяем флаг useSystemFonts
      if (options.useSystemFonts) {
        console.log('🛡️ Using system fonts (reliable mode)');
        
        // Выбираем шрифт из надежных системных
        const systemFont = options.fontFamily || 'Arial';
        
        try {
          // Простая настройка системного шрифта
          pdf.setFont(systemFont, 'normal');
          
          result.success = true;
          result.selectedFont = systemFont;
          result.preservesCyrillic = false; // Системные шрифты не сохраняют кириллицу
          result.warnings.push(`✅ Using reliable system font: ${systemFont}`);
          
          console.log(`✅ System font set successfully: ${systemFont}`);
          return result;
          
        } catch (fontError) {
          console.warn(`⚠️ System font ${systemFont} failed, trying Arial...`);
          
          // Fallback к Arial
          try {
            pdf.setFont('Arial', 'normal');
            result.success = true;
            result.selectedFont = 'Arial';
            result.warnings.push('Fallback to Arial font');
            console.log('✅ Fallback Arial font set successfully');
            return result;
          } catch (arialError) {
            // Последний fallback к helvetica
            pdf.setFont('helvetica', 'normal');
            result.success = true;
            result.selectedFont = 'helvetica';
            result.warnings.push('Fallback to Helvetica font');
            console.log('✅ Final fallback Helvetica font set');
            return result;
          }
        }
      }

      // 🔄 СТАРАЯ ЛОГИКА: Сложные встроенные шрифты (если useSystemFonts = false)
      console.log('🔤 Using complex embedded fonts (compatibility mode)');
      
      // Анализируем текст
      const combinedText = sampleTexts.join(' ');
      const analysis = this.analyzeText(combinedText);

      console.log('🔍 Text analysis:', {
        languages: analysis.detectedLanguages,
        problemChars: analysis.problemChars.length,
        recommendedFont: analysis.recommendedFont,
        needsTransliteration: analysis.needsTransliteration,
        hasCyrillic: analysis.hasCyrillic
      });

      // Проверяем нужна ли поддержка кириллицы
      const needsCyrillic = analysis.hasCyrillic && this.shouldPreserveCyrillic(combinedText);

      if (needsCyrillic) {
        console.log('🔤 Attempting to preserve Cyrillic characters...');
        
        // Попытка встроить кириллический шрифт
        try {
          const { CyrillicFontEmbedded } = await import('./CyrillicFontEmbedded');
          const embeddedResult = CyrillicFontEmbedded.addEmbeddedCyrillicFont(pdf, 'DejaVu-Cyrillic');
          
          if (embeddedResult.success) {
            result.success = true;
            result.selectedFont = embeddedResult.fontName;
            result.preservesCyrillic = true;
            result.warnings.push('Using embedded Cyrillic font: ' + embeddedResult.fontName);
            console.log(`✅ Embedded Cyrillic font loaded: ${embeddedResult.fontName}`);
            return result;
          }
        } catch (error) {
          console.warn('⚠️ Embedded font loading failed:', error);
          result.warnings.push('Embedded fonts failed - using system fonts instead');
          
          // Fallback к системным шрифтам
          pdf.setFont('Arial', 'normal');
          result.success = true;
          result.selectedFont = 'Arial';
          result.preservesCyrillic = false;
          return result;
        }
      }

      // Стандартная логика для не-кириллических языков
      const targetFont = analysis.recommendedFont;
      
      try {
        pdf.setFont(targetFont, 'normal');
        this.loadedFonts.add(targetFont);
        
        result.success = true;
        result.selectedFont = targetFont;
        
        console.log(`✅ Font set successfully: ${targetFont}`);

      } catch (fontError) {
        console.warn(`⚠️ Failed to set ${targetFont}, falling back to Arial...`);
        
        // Fallback к Arial
        pdf.setFont('Arial', 'normal');
        result.selectedFont = 'Arial';
        result.success = true;
        result.warnings.push(`Font ${targetFont} failed, using Arial`);
      }

      // Добавляем предупреждения
      if (analysis.needsTransliteration && !result.preservesCyrillic) {
        result.warnings.push(`${analysis.problemChars.length} characters will be transliterated`);
        result.appliedTransliterations = analysis.problemChars.length;
      }

    } catch (error) {
      console.error('❌ Font setup failed:', error);
      result.warnings.push(`Setup failed: ${error}`);
      
      // Последний fallback
      try {
        pdf.setFont('Arial', 'normal');
        result.selectedFont = 'Arial';
        result.success = true;
        result.warnings.push('Emergency fallback to Arial');
      } catch {
        result.success = false;
        result.warnings.push('All fonts failed');
      }
    }

    return result;
  }

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
        recommendedFont: 'Arial',
        needsTransliteration: false
      };
    }

    const analysis: TextAnalysis = {
      hasLatinExtended: false,
      hasCyrillic: false,
      hasSpecialChars: false,
      detectedLanguages: [],
      problemChars: [],
      recommendedFont: 'Arial',
      needsTransliteration: false
    };

    // Проверяем кириллицу
    if (/[А-я]/u.test(text)) {
      analysis.hasCyrillic = true;
      analysis.detectedLanguages.push('ru');
    }

    // Проверяем расширенную латиницу
    if (/[À-ÿĀ-ž]/.test(text)) {
      analysis.hasLatinExtended = true;
    }

    // Определяем языки по характерным символам
    if (/[āčēģīķļņšūž]/i.test(text)) {
      analysis.detectedLanguages.push('lv'); // Латышский
    }

    // Находим проблемные символы
    const problemChars = new Set<string>();
    for (const char of text) {
      if (this.UNICODE_REPLACEMENTS.has(char)) {
        problemChars.add(char);
      }
    }
    analysis.problemChars = Array.from(problemChars);
    analysis.needsTransliteration = analysis.problemChars.length > 0;

    // Рекомендуем Arial как универсальный шрифт
    analysis.recommendedFont = 'Arial';

    if (analysis.detectedLanguages.length === 0) {
      analysis.detectedLanguages.push('en');
    }

    return analysis;
  }

  /**
   * 🧹 Умная очистка текста с удалением эмодзи
   */
  public static smartCleanText(text: string, preserveCyrillic: boolean = false): string {
    if (!text) return '';

    let cleaned = String(text);

    // Удаляем эмодзи (как рекомендовано)
    cleaned = cleaned.replace(/[\u{1F000}-\u{1FFFF}]/gu, '');
    
    // Применяем замены символов
    for (const [unicode, replacement] of this.UNICODE_REPLACEMENTS) {
      if (cleaned.includes(unicode)) {
        cleaned = cleaned.replace(new RegExp(unicode, 'g'), replacement);
      }
    }

    // Дополнительная очистка
    cleaned = cleaned
      .replace(/[\\u200B-\\u200D\\uFEFF]/g, '') // Невидимые символы
      .replace(/\\s+/g, ' ') // Нормализуем пробелы
      .trim();

    // Если НЕ сохраняем кириллицу, заменяем её
    if (!preserveCyrillic) {
      cleaned = cleaned.replace(/[^\\x20-\\x7E\\u00A0-\\u00FF]/g, '');
    }

    return cleaned.trim();
  }

  /**
   * Определяет стоит ли сохранять кириллицу
   */
  private static shouldPreserveCyrillic(text: string): boolean {
    const cyrillicMatches = text.match(/[а-яё]/gi);
    const totalLetters = text.match(/[a-zA-Zа-яё]/gi);
    
    if (!cyrillicMatches || !totalLetters) {
      return false;
    }
    
    const cyrillicPercentage = cyrillicMatches.length / totalLetters.length;
    return cyrillicPercentage > 0.2;
  }

  /**
   * Очистка кэша
   */
  public static clearCache(): void {
    this.loadedFonts.clear();
    console.log('🧹 Font cache cleared');
  }
}