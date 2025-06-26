/**
 * Language Detection Service
 * Автоматическое определение языка из CSV данных с интеграцией существующей шрифтовой системы
 */

import { EnhancedUnicodeFontService, TextAnalysis } from '../EnhancedUnicodeFontService';
import { SUPPORTED_LANGUAGES, LanguageDetectionResult, LanguageSupport } from '../../types/enhanced-csv-pdf.types';
import { CsvParseResult } from '../converters/CsvToPdfConverter';

export class LanguageDetectionService {
  private static readonly SAMPLE_SIZE = 1000; // Количество символов для анализа
  private static readonly CONFIDENCE_THRESHOLD = 0.7; // Минимальная уверенность для автодетекции

  /**
   * Определение языка из CSV данных
   */
  static detectLanguageFromCSV(csvData: CsvParseResult): LanguageDetectionResult {
    // Собираем образец текста из headers и данных
    const sampleText = this.extractSampleText(csvData);
    
    // Используем существующий EnhancedUnicodeFontService для анализа
    const textAnalysis = EnhancedUnicodeFontService.analyzeText(sampleText);
    
    return this.analyzeLanguagePatterns(sampleText, textAnalysis);
  }

  /**
   * Извлечение образца текста из CSV данных
   */
  private static extractSampleText(csvData: CsvParseResult): string {
    const textParts: string[] = [];
    
    // Добавляем заголовки (важны для определения языка)
    textParts.push(csvData.headers.join(' '));
    
    // Добавляем образцы данных из каждой колонки
    const sampleRows = Math.min(50, csvData.data.length);
    
    for (let i = 0; i < sampleRows; i++) {
      const row = csvData.data[i];
      for (const header of csvData.headers) {
        const value = row[header];
        if (value && typeof value === 'string' && value.trim().length > 0) {
          textParts.push(String(value).trim());
        }
      }
    }
    
    // Ограничиваем размер образца
    const fullText = textParts.join(' ');
    return fullText.length > this.SAMPLE_SIZE 
      ? fullText.substring(0, this.SAMPLE_SIZE)
      : fullText;
  }

  /**
   * Анализ языковых паттернов с использованием существующей системы
   */
  private static analyzeLanguagePatterns(text: string, textAnalysis: TextAnalysis): LanguageDetectionResult {
    const result: LanguageDetectionResult = {
      detectedLanguage: 'en',
      confidence: 0,
      fallbackLanguage: 'en',
      supportedCharacters: 0,
      totalCharacters: text.length,
      warnings: []
    };

    // Используем детекцию из EnhancedUnicodeFontService
    const detectedLanguages = textAnalysis.detectedLanguages;
    
    if (detectedLanguages.length === 0) {
      result.detectedLanguage = 'en';
      result.confidence = 0.8; // Высокая уверенность для базового английского
      result.supportedCharacters = text.replace(/[^\x20-\x7E]/g, '').length;
    } else {
      // Выбираем наиболее вероятный язык
      const primaryLanguage = detectedLanguages[0];
      result.detectedLanguage = this.mapToSupportedLanguage(primaryLanguage);
      
      // Рассчитываем уверенность на основе анализа символов
      result.confidence = this.calculateConfidence(text, result.detectedLanguage);
      result.supportedCharacters = this.countSupportedCharacters(text, result.detectedLanguage);
      
      // Устанавливаем fallback
      result.fallbackLanguage = detectedLanguages.length > 1 
        ? this.mapToSupportedLanguage(detectedLanguages[1])
        : 'en';
    }

    // Добавляем предупреждения
    if (textAnalysis.problemChars.length > 0) {
      result.warnings.push(`${textAnalysis.problemChars.length} characters may need transliteration`);
    }

    if (result.confidence < this.CONFIDENCE_THRESHOLD) {
      result.warnings.push(`Low confidence detection (${(result.confidence * 100).toFixed(1)}%)`);
    }

    if (textAnalysis.hasCyrillic && result.detectedLanguage !== 'ru') {
      result.warnings.push('Cyrillic characters detected but not Russian language selected');
    }

    return result;
  }

  /**
   * Сопоставление языка с поддерживаемыми языками
   */
  private static mapToSupportedLanguage(detectedLang: string): string {
    const mapping: Record<string, string> = {
      'ru': 'ru',
      'lv': 'lv',
      'lt': 'lt',
      'pl': 'pl',
      'de': 'de',
      'fr': 'fr',
      'es': 'es',
      'it': 'it',
      'en': 'en'
    };

    return mapping[detectedLang] || 'en';
  }

  /**
   * Расчет уверенности определения языка
   */
  private static calculateConfidence(text: string, language: string): number {
    const languageInfo = SUPPORTED_LANGUAGES[language];
    if (!languageInfo) return 0;

    let matchingChars = 0;
    const totalChars = text.length;

    // Проверяем соответствие Unicode диапазонам
    for (const char of text) {
      const charCode = char.charCodeAt(0);
      
      if (this.isCharInLanguageRange(charCode, languageInfo)) {
        matchingChars++;
      }
    }

    // Базовая уверенность на основе соответствия символов
    let confidence = totalChars > 0 ? matchingChars / totalChars : 0;

    // Бонус за специфические символы языка
    if (language === 'ru' && /[а-яё]/i.test(text)) {
      confidence += 0.2;
    } else if (language === 'lv' && /[āčēģīķļņšūž]/i.test(text)) {
      confidence += 0.3;
    } else if (language === 'lt' && /[ąęėįų]/i.test(text)) {
      confidence += 0.3;
    } else if (language === 'pl' && /[ąćęłńóśźż]/i.test(text)) {
      confidence += 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Проверка, входит ли символ в диапазон языка
   */
  private static isCharInLanguageRange(charCode: number, languageInfo: LanguageSupport): boolean {
    // Базовая латиница (ASCII)
    if (charCode >= 32 && charCode <= 126) return true;
    
    switch (languageInfo.script) {
      case 'cyrillic':
        return (charCode >= 0x0400 && charCode <= 0x04FF) || // Кириллица
               (charCode >= 0x0500 && charCode <= 0x052F);   // Расширенная кириллица
               
      case 'latin':
        return (charCode >= 32 && charCode <= 126) ||      // Базовая латиница
               (charCode >= 0x00A0 && charCode <= 0x00FF) || // Latin-1
               (charCode >= 0x0100 && charCode <= 0x017F) || // Расширенная латиница A
               (charCode >= 0x0180 && charCode <= 0x024F);   // Расширенная латиница B
               
      default:
        return charCode >= 32 && charCode <= 126;
    }
  }

  /**
   * Подсчет поддерживаемых символов
   */
  private static countSupportedCharacters(text: string, language: string): number {
    const languageInfo = SUPPORTED_LANGUAGES[language];
    if (!languageInfo) return 0;

    let supportedCount = 0;
    for (const char of text) {
      if (this.isCharInLanguageRange(char.charCodeAt(0), languageInfo)) {
        supportedCount++;
      }
    }

    return supportedCount;
  }

  /**
   * Получение рекомендаций по шрифтам для языка
   */
  static getFontRecommendations(language: string): {
    primary: string[];
    fallback: string[];
    webSafe: string[];
  } {
    const languageInfo = SUPPORTED_LANGUAGES[language];
    
    if (!languageInfo) {
      return {
        primary: ['Roboto', 'Arial'],
        fallback: ['Helvetica', 'sans-serif'],
        webSafe: ['Arial', 'Helvetica', 'sans-serif']
      };
    }

    return {
      primary: languageInfo.primaryFonts,
      fallback: languageInfo.fallbackFonts,
      webSafe: ['Arial', 'Times', 'Courier New']
    };
  }

  /**
   * Проверка поддержки языка
   */
  static isLanguageSupported(languageCode: string): boolean {
    return languageCode in SUPPORTED_LANGUAGES;
  }

  /**
   * Получение списка всех поддерживаемых языков
   */
  static getAllSupportedLanguages(): LanguageSupport[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  /**
   * Получение информации о языке
   */
  static getLanguageInfo(languageCode: string): LanguageSupport | null {
    return SUPPORTED_LANGUAGES[languageCode] || null;
  }

  /**
   * Автоматический выбор оптимального шрифта для языка
   */
  static getOptimalFont(language: string, availableFonts: string[] = []): string {
    const languageInfo = SUPPORTED_LANGUAGES[language];
    
    if (!languageInfo) return 'Roboto';

    // Ищем пересечение с доступными шрифтами
    for (const font of languageInfo.primaryFonts) {
      if (availableFonts.length === 0 || availableFonts.includes(font)) {
        return font;
      }
    }

    // Fallback к системным шрифтам
    for (const font of languageInfo.fallbackFonts) {
      if (availableFonts.length === 0 || availableFonts.includes(font)) {
        return font;
      }
    }

    return 'Roboto'; // Безопасный fallback
  }

  /**
   * Валидация текста для языка
   */
  static validateTextForLanguage(text: string, language: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const result = {
      isValid: true,
      issues: [] as string[],
      suggestions: [] as string[]
    };

    const detection = this.detectLanguageFromCSV({
      data: [{ text }],
      headers: ['text'],
      rowCount: 1,
      columnCount: 1,
      encoding: 'UTF-8',
      delimiter: ',',
      errors: [],
      columnTypes: { text: 'text' },
      preview: []
    });

    if (detection.detectedLanguage !== language && detection.confidence > 0.8) {
      result.issues.push(`Text appears to be in ${detection.detectedLanguage}, not ${language}`);
      result.suggestions.push(`Consider changing language to ${detection.detectedLanguage}`);
    }

    if (detection.warnings.length > 0) {
      result.issues.push(...detection.warnings);
    }

    if (detection.supportedCharacters / detection.totalCharacters < 0.9) {
      result.isValid = false;
      result.issues.push('Many characters may not display correctly');
      result.suggestions.push('Enable transliteration or choose a different font');
    }

    return result;
  }
}
