/**
 * MultiLanguageFontService.ts
 * Сервис для автоматической детекции языка и управления шрифтами
 * Интегрируется с существующим EnhancedUnicodeFontService
 */

import { EnhancedUnicodeFontService, TextAnalysis } from '../EnhancedUnicodeFontService';
import { LanguageDetectionResult, FontRecommendation, MultiLanguageSupport } from '../../types/enhanced-csv-pdf.types';

export class MultiLanguageFontService {
  private static readonly SUPPORTED_LANGUAGES: MultiLanguageSupport['supportedLanguages'] = {
    'ru': 'Русский (Кириллица)',
    'lv': 'Latviešu (Латышский)', 
    'lt': 'Lietuvių (Литовский)',
    'et': 'Eesti (Эстонский)',
    'pl': 'Polski (Польский)',
    'de': 'Deutsch (Немецкий)',
    'fr': 'Français (Французский)',
    'es': 'Español (Испанский)',
    'it': 'Italiano (Итальянский)',
    'zh': '中文 (Китайский)',
    'ja': '日本語 (Японский)',
    'ko': '한국어 (Корейский)',
    'ar': 'العربية (Арабский)',
    'hi': 'हिन्दी (Хинди)',
  };

  private static readonly FONT_FAMILIES: MultiLanguageSupport['fontFamilies'] = {
    'latin': ['Inter', 'Roboto', 'Open Sans', 'Lato'],
    'cyrillic': ['Roboto', 'Open Sans', 'PT Sans', 'Fira Sans'],
    'baltic': ['Roboto', 'Open Sans', 'Source Sans Pro'],
    'cjk': ['Noto Sans CJK', 'Source Han Sans', 'Roboto'],
    'arabic': ['Noto Sans Arabic', 'Roboto Arabic'],
    'devanagari': ['Noto Sans Devanagari', 'Roboto Devanagari'],
  };

  // Расширенные паттерны для детекции языков
  private static readonly LANGUAGE_PATTERNS = {
    'ru': /[а-яё]/i,
    'lv': /[āčēģīķļņšūž]/i,
    'lt': /[ąęėįų]/i,
    'et': /[äöüõ]/i,
    'pl': /[ąćęłńóśźż]/i,
    'de': /[äöüß]/i,
    'fr': /[àâçéèêëîïôùûüÿ]/i,
    'es': /[áéíñóúü]/i,
    'it': /[àèéìíîòóù]/i,
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
    'ko': /[\uac00-\ud7af]/,
    'ar': /[\u0600-\u06ff]/,
    'hi': /[\u0900-\u097f]/,
  };

  private static readonly SCRIPT_DIRECTIONS = {
    'ar': 'rtl' as const,
    'he': 'rtl' as const,
    'fa': 'rtl' as const,
    'ur': 'rtl' as const,
  };

  /**
   * Автоматическая детекция языка из CSV данных
   */
  public static detectLanguageFromCSV(csvData: string[][]): LanguageDetectionResult {
    // Собираем весь текст из CSV
    const allText = this.extractTextFromCSV(csvData);
    
    // Анализируем текст с помощью существующего сервиса
    const analysis = EnhancedUnicodeFontService.analyzeText(allText);
    
    // Подсчитываем вхождения каждого языка
    const languageScores = new Map<string, number>();
    const totalChars = allText.length;
    
    for (const [langCode, pattern] of Object.entries(this.LANGUAGE_PATTERNS)) {
      const matches = allText.match(new RegExp(pattern.source, pattern.flags + 'g'));
      const score = matches ? matches.length / totalChars : 0;
      if (score > 0) {
        languageScores.set(langCode, score);
      }
    }

    // Находим язык с наибольшим скором
    let detectedLanguage = 'en'; // по умолчанию английский
    let maxScore = 0;
    let confidence = 0;

    for (const [lang, score] of languageScores) {
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
        confidence = Math.min(score * 100, 95); // максимум 95% уверенности
      }
    }

    // Определяем скрипт
    const script = this.determineScript(detectedLanguage, analysis);
    
    // Определяем направление текста
    const direction = this.SCRIPT_DIRECTIONS[detectedLanguage as keyof typeof this.SCRIPT_DIRECTIONS] || 'ltr';

    // Собираем все поддерживаемые языки из детекции
    const supportedLanguages = Array.from(languageScores.keys());
    if (!supportedLanguages.includes('en')) {
      supportedLanguages.push('en'); // всегда добавляем английский
    }

    console.log('🌍 Language detection result:', {
      detectedLanguage,
      confidence,
      script,
      supportedLanguages,
      textSample: allText.substring(0, 100)
    });

    return {
      detectedLanguage,
      confidence,
      script,
      direction,
      supportedLanguages,
    };
  }

  /**
   * Получение рекомендаций по шрифтам для обнаруженного языка
   */
  public static getFontRecommendations(
    languageResult: LanguageDetectionResult,
    csvData?: string[][]
  ): FontRecommendation[] {
    const recommendations: FontRecommendation[] = [];
    const { detectedLanguage, script, supportedLanguages } = languageResult;

    // Базовые рекомендации на основе скрипта
    const scriptFonts = this.FONT_FAMILIES[script] || this.FONT_FAMILIES.latin;
    
    // Основная рекомендация для детектированного языка
    recommendations.push({
      primary: this.getBestFontForLanguage(detectedLanguage),
      fallbacks: [...scriptFonts],
      webSafe: ['Arial', 'Times New Roman', 'Courier New'],
      unicodeSupport: this.hasUnicodeSupport(detectedLanguage),
      qualityRating: this.getFontQuality(detectedLanguage),
    });

    // Дополнительные рекомендации для смешанного контента
    if (supportedLanguages.length > 1) {
      // Универсальный шрифт для мультиязычного контента
      recommendations.push({
        primary: 'Roboto',
        fallbacks: ['Open Sans', 'Noto Sans', 'Arial'],
        webSafe: ['Arial', 'sans-serif'],
        unicodeSupport: true,
        qualityRating: 'good',
      });

      // Специализированный шрифт для кириллицы если нужно
      if (supportedLanguages.includes('ru')) {
        recommendations.push({
          primary: 'PT Sans',
          fallbacks: ['Roboto', 'Open Sans', 'DejaVu Sans'],
          webSafe: ['Times New Roman', 'serif'],
          unicodeSupport: true,
          qualityRating: 'excellent',
        });
      }
    }

    // Fallback рекомендация
    recommendations.push({
      primary: 'Arial',
      fallbacks: ['Helvetica', 'sans-serif'],
      webSafe: ['Arial', 'Helvetica', 'sans-serif'],
      unicodeSupport: false,
      qualityRating: 'basic',
    });

    return recommendations;
  }

  /**
   * Проверка поддержки символов в CSV данных
   */
  public static validateUnicodeSupport(
    csvData: string[][],
    selectedFont: string
  ): {
    isSupported: boolean;
    unsupportedChars: string[];
    coverage: number;
    recommendations: string[];
  } {
    const allText = this.extractTextFromCSV(csvData);
    const analysis = EnhancedUnicodeFontService.analyzeText(allText);
    
    // Тестируем выбранный шрифт
    const testResult = EnhancedUnicodeFontService.testFontWithSample(selectedFont, allText);
    
    const recommendations: string[] = [];
    
    if (!testResult.isSupported) {
      recommendations.push('Рассмотрите использование Roboto или Open Sans для лучшей поддержки Unicode');
      
      if (analysis.hasCyrillic) {
        recommendations.push('Для кириллицы рекомендуется PT Sans или DejaVu Sans');
      }
      
      if (analysis.hasLatinExtended) {
        recommendations.push('Для расширенной латиницы используйте Noto Sans или Source Sans Pro');
      }
    }

    // Подсчитываем покрытие
    const totalChars = allText.length;
    const supportedChars = totalChars - analysis.problemChars.length;
    const coverage = totalChars > 0 ? (supportedChars / totalChars) * 100 : 100;

    return {
      isSupported: testResult.isSupported && coverage > 90,
      unsupportedChars: analysis.problemChars,
      coverage,
      recommendations,
    };
  }

  /**
   * Автоматический выбор оптимального шрифта
   */
  public static selectOptimalFont(
    csvData: string[][],
    userPreference?: string
  ): {
    selectedFont: string;
    reasoning: string[];
    alternatives: string[];
    confidence: number;
  } {
    const languageResult = this.detectLanguageFromCSV(csvData);
    const recommendations = this.getFontRecommendations(languageResult);
    
    const reasoning: string[] = [];
    let selectedFont = 'Roboto'; // безопасный по умолчанию
    let confidence = 70;

    // Если пользователь указал предпочтение, проверяем его
    if (userPreference && userPreference !== 'auto') {
      const validation = this.validateUnicodeSupport(csvData, userPreference);
      if (validation.isSupported) {
        selectedFont = userPreference;
        reasoning.push(`Выбран пользовательский шрифт: ${userPreference}`);
        confidence = 90;
      } else {
        reasoning.push(`Пользовательский шрифт ${userPreference} не поддерживает все символы`);
      }
    }

    // Автоматический выбор на основе анализа
    if (selectedFont === 'Roboto' || !userPreference) {
      const primaryRecommendation = recommendations[0];
      selectedFont = primaryRecommendation.primary;
      
      reasoning.push(`Детектирован язык: ${this.SUPPORTED_LANGUAGES[languageResult.detectedLanguage as keyof typeof this.SUPPORTED_LANGUAGES] || languageResult.detectedLanguage}`);
      reasoning.push(`Рекомендован шрифт: ${selectedFont}`);
      reasoning.push(`Качество поддержки: ${primaryRecommendation.qualityRating}`);
      
      confidence = languageResult.confidence;
    }

    // Альтернативы
    const alternatives = recommendations
      .slice(1)
      .map(rec => rec.primary)
      .filter((font, index, arr) => arr.indexOf(font) === index); // уникальные

    return {
      selectedFont,
      reasoning,
      alternatives,
      confidence,
    };
  }

  /**
   * Получение локализованных названий языков
   */
  public static getLanguageDisplayName(languageCode: string): string {
    return this.SUPPORTED_LANGUAGES[languageCode as keyof typeof this.SUPPORTED_LANGUAGES] || languageCode.toUpperCase();
  }

  /**
   * Получение списка поддерживаемых языков
   */
  public static getSupportedLanguages(): Array<{ code: string; name: string; script: string }> {
    return Object.entries(this.SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code,
      name,
      script: this.getScriptForLanguage(code),
    }));
  }

  // Приватные вспомогательные методы

  private static extractTextFromCSV(csvData: string[][]): string {
    return csvData
      .flat()
      .filter(cell => cell && typeof cell === 'string')
      .join(' ')
      .substring(0, 10000); // ограничиваем для производительности
  }

  private static determineScript(
    language: string,
    analysis: TextAnalysis
  ): LanguageDetectionResult['script'] {
    if (analysis.hasCyrillic) return 'cyrillic';
    
    const scriptMap: Record<string, LanguageDetectionResult['script']> = {
      'ar': 'arabic',
      'he': 'arabic',
      'fa': 'arabic',
      'zh': 'cjk',
      'ja': 'cjk',
      'ko': 'cjk',
      'hi': 'devanagari',
      'bn': 'devanagari',
    };

    return scriptMap[language] || (analysis.hasLatinExtended ? 'latin' : 'latin');
  }

  private static getBestFontForLanguage(language: string): string {
    const fontMap: Record<string, string> = {
      'ru': 'PT Sans',
      'lv': 'Roboto',
      'lt': 'Roboto', 
      'et': 'Open Sans',
      'pl': 'Roboto',
      'de': 'Roboto',
      'fr': 'Open Sans',
      'es': 'Roboto',
      'it': 'Open Sans',
      'zh': 'Noto Sans CJK',
      'ja': 'Noto Sans CJK',
      'ko': 'Noto Sans CJK',
      'ar': 'Noto Sans Arabic',
      'hi': 'Noto Sans Devanagari',
    };

    return fontMap[language] || 'Roboto';
  }

  private static hasUnicodeSupport(language: string): boolean {
    const nonUnicodeLanguages = ['en'];
    return !nonUnicodeLanguages.includes(language);
  }

  private static getFontQuality(language: string): FontRecommendation['qualityRating'] {
    const qualityMap: Record<string, FontRecommendation['qualityRating']> = {
      'ru': 'excellent',
      'lv': 'good',
      'lt': 'good',
      'pl': 'good',
      'de': 'excellent',
      'fr': 'excellent',
      'zh': 'good',
      'ja': 'good',
      'ar': 'good',
    };

    return qualityMap[language] || 'basic';
  }

  private static getScriptForLanguage(language: string): string {
    const scriptMap: Record<string, string> = {
      'ru': 'cyrillic',
      'lv': 'latin-extended',
      'lt': 'latin-extended',
      'et': 'latin-extended',
      'pl': 'latin-extended',
      'de': 'latin-extended',
      'fr': 'latin-extended',
      'es': 'latin-extended',
      'it': 'latin-extended',
      'zh': 'cjk',
      'ja': 'cjk',
      'ko': 'cjk',
      'ar': 'arabic',
      'hi': 'devanagari',
    };

    return scriptMap[language] || 'latin';
  }

  /**
   * Кэш для результатов детекции
   */
  private static detectionCache = new Map<string, LanguageDetectionResult>();

  /**
   * Очистка кэша
   */
  public static clearCache(): void {
    this.detectionCache.clear();
    console.log('🧹 MultiLanguageFontService cache cleared');
  }

  /**
   * Получение статистики кэша
   */
  public static getCacheStats(): {
    size: number;
    entries: Array<{ key: string; language: string; confidence: number }>;
  } {
    const entries = Array.from(this.detectionCache.entries()).map(([key, result]) => ({
      key: key.substring(0, 50) + '...',
      language: result.detectedLanguage,
      confidence: result.confidence,
    }));

    return {
      size: this.detectionCache.size,
      entries,
    };
  }
}
