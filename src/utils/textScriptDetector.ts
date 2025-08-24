/**
 * Определение скрипта и языка в тексте для правильного выбора OCR настроек
 */

export interface ScriptDetectionResult {
  script: 'latin' | 'cyrillic' | 'mixed' | 'unknown';
  languages: string[];
  confidence: number;
  stats: {
    latinChars: number;
    cyrillicChars: number;
    digits: number;
    punctuation: number;
    other: number;
    total: number;
    latinRatio: number;
    cyrillicRatio: number;
  };
  recommendedLanguage: string;
  recommendedWhitelist?: string;
}

export class TextScriptDetector {
  // Whitelist для разных типов контента
  private static readonly CYRILLIC_ONLY = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.,!?:;()[]{}«»—–-+=*/\\|@#№$%^&*~ ';
  private static readonly LATIN_ONLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;()[]{}""\'\'—–-+=*/\\|@#$%^&*~ ';
  private static readonly MIXED_CONTENT = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюяABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;()[]{}«»""\'\'—–-+=*/\\|@#№$%^&*~ ';

  /**
   * Анализ текста для определения скрипта
   */
  static analyzeText(text: string): ScriptDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        script: 'unknown',
        languages: [],
        confidence: 0,
        stats: {
          latinChars: 0,
          cyrillicChars: 0,
          digits: 0,
          punctuation: 0,
          other: 0,
          total: 0,
          latinRatio: 0,
          cyrillicRatio: 0,
        },
        recommendedLanguage: 'eng',
        recommendedWhitelist: this.LATIN_ONLY,
      };
    }

    // Подсчет символов по категориям
    const stats = this.analyzeCharacters(text);
    
    // Определение скрипта
    const script = this.determineScript(stats);
    
    // Определение языков
    const languages = this.detectLanguages(text, stats, script);
    
    // Вычисление уверенности
    const confidence = this.calculateConfidence(stats, script);
    
    // Рекомендуемый язык и whitelist
    const { recommendedLanguage, recommendedWhitelist } = this.getRecommendations(script, stats, languages);

    return {
      script,
      languages,
      confidence,
      stats,
      recommendedLanguage,
      recommendedWhitelist,
    };
  }

  /**
   * Анализ символов по категориям
   */
  private static analyzeCharacters(text: string) {
    let latinChars = 0;
    let cyrillicChars = 0;
    let digits = 0;
    let punctuation = 0;
    let other = 0;

    for (const char of text) {
      if (/[A-Za-z]/.test(char)) {
        latinChars++;
      } else if (/[\u0400-\u04FF]/.test(char)) {
        cyrillicChars++;
      } else if (/\d/.test(char)) {
        digits++;
      } else if (/[.,!?:;()[\]{}«»""''—–\-+=*/\\|@#№$%^&*~]/.test(char)) {
        punctuation++;
      } else if (!/\s/.test(char)) {
        other++;
      }
    }

    const total = latinChars + cyrillicChars + digits + punctuation + other;
    const letterTotal = latinChars + cyrillicChars;
    
    return {
      latinChars,
      cyrillicChars,
      digits,
      punctuation,
      other,
      total,
      latinRatio: letterTotal > 0 ? latinChars / letterTotal : 0,
      cyrillicRatio: letterTotal > 0 ? cyrillicChars / letterTotal : 0,
    };
  }

  /**
   * Определение основного скрипта
   */
  private static determineScript(stats: any): 'latin' | 'cyrillic' | 'mixed' | 'unknown' {
    const totalLetters = stats.latinChars + stats.cyrillicChars;
    
    if (totalLetters === 0) {
      return 'unknown';
    }

    // Если больше 90% одного типа символов - чистый скрипт
    if (stats.cyrillicRatio >= 0.9) {
      return 'cyrillic';
    }
    
    if (stats.latinRatio >= 0.9) {
      return 'latin';
    }

    // Если оба типа символов присутствуют значительно - смешанный
    if (stats.cyrillicRatio >= 0.1 && stats.latinRatio >= 0.1) {
      return 'mixed';
    }

    // Иначе определяем по большинству
    return stats.cyrillicRatio > stats.latinRatio ? 'cyrillic' : 'latin';
  }

  /**
   * Определение возможных языков
   */
  private static detectLanguages(text: string, stats: any, script: string): string[] {
    const languages: string[] = [];

    switch (script) {
      case 'cyrillic':
        // Простая эвристика для определения кириллических языков
        if (/[ё]/i.test(text)) {
          languages.push('rus'); // Буква ё характерна для русского
        } else if (/[ї]/.test(text)) {
          languages.push('ukr'); // Буква ї характерна для украинского
        } else {
          languages.push('rus'); // По умолчанию русский
        }
        break;
        
      case 'latin':
        // Простая эвристика для латинских языков
        if (/\b(the|and|is|to|of)\b/i.test(text)) {
          languages.push('eng');
        } else if (/\b(der|die|das|und|ist)\b/i.test(text)) {
          languages.push('deu');
        } else if (/\b(le|la|les|et|est|de)\b/i.test(text)) {
          languages.push('fra');
        } else if (/\b(el|la|los|las|y|es|de)\b/i.test(text)) {
          languages.push('spa');
        } else {
          languages.push('eng'); // По умолчанию английский
        }
        break;
        
      case 'mixed':
        // Для смешанного контента добавляем оба основных языка
        languages.push('rus', 'eng');
        break;
        
      default:
        languages.push('eng');
    }

    return languages;
  }

  /**
   * Вычисление уверенности
   */
  private static calculateConfidence(stats: any, script: string): number {
    const totalLetters = stats.latinChars + stats.cyrillicChars;
    
    if (totalLetters === 0) {
      return 0;
    }

    switch (script) {
      case 'cyrillic':
        return Math.min(0.95, 0.5 + stats.cyrillicRatio * 0.5);
      case 'latin':
        return Math.min(0.95, 0.5 + stats.latinRatio * 0.5);
      case 'mixed':
        // Для смешанного контента уверенность зависит от баланса
        const balance = Math.min(stats.latinRatio, stats.cyrillicRatio);
        return Math.min(0.9, 0.4 + balance * 0.5);
      default:
        return 0.1;
    }
  }

  /**
   * Получение рекомендаций по языку и whitelist
   */
  private static getRecommendations(script: string, stats: any, languages: string[]) {
    let recommendedLanguage: string;
    let recommendedWhitelist: string;

    switch (script) {
      case 'cyrillic':
        recommendedLanguage = languages[0] || 'rus';
        recommendedWhitelist = this.CYRILLIC_ONLY;
        break;
        
      case 'latin':
        recommendedLanguage = languages[0] || 'eng';
        recommendedWhitelist = this.LATIN_ONLY;
        break;
        
      case 'mixed':
        // Для смешанного контента используем комбинированные настройки
        if (stats.cyrillicRatio > stats.latinRatio) {
          recommendedLanguage = 'rus+eng'; // Специальная комбинация
        } else {
          recommendedLanguage = 'eng+rus'; // Специальная комбинация
        }
        recommendedWhitelist = this.MIXED_CONTENT;
        break;
        
      default:
        recommendedLanguage = 'eng';
        recommendedWhitelist = this.LATIN_ONLY;
    }

    return { recommendedLanguage, recommendedWhitelist };
  }

  /**
   * Быстрая проверка на смешанный контент
   */
  static isMixedContent(text: string): boolean {
    if (!text) return false;
    
    const hasLatin = /[A-Za-z]/.test(text);
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    
    return hasLatin && hasCyrillic;
  }

  /**
   * Получить оптимальные настройки Tesseract для текста
   */
  static getTesseractConfig(text: string, defaultLanguage: string = 'rus') {
    const analysis = this.analyzeText(text);
    
    const config: any = {
      tessedit_pageseg_mode: 1, // PSM.AUTO
      tessedit_ocr_engine_mode: 1, // OEM.LSTM_ONLY
      preserve_interword_spaces: '1',
    };

    // Выбор языка и whitelist в зависимости от анализа
    switch (analysis.script) {
      case 'cyrillic':
        config.language = analysis.recommendedLanguage;
        config.tessedit_char_whitelist = analysis.recommendedWhitelist;
        config.tessedit_pageseg_mode = 6; // PSM.SINGLE_BLOCK для кириллицы
        break;
        
      case 'latin':
        config.language = analysis.recommendedLanguage;
        config.tessedit_char_whitelist = analysis.recommendedWhitelist;
        break;
        
      case 'mixed':
        // Для смешанного контента НЕ используем whitelist, чтобы не ограничивать символы
        config.language = 'rus+eng'; // Многоязычный режим
        // НЕ устанавливаем tessedit_char_whitelist для смешанного контента!
        config.tessedit_pageseg_mode = 1; // PSM.AUTO для смешанного контента
        break;
        
      default:
        config.language = defaultLanguage;
        config.tessedit_char_whitelist = defaultLanguage === 'rus' ? this.CYRILLIC_ONLY : this.LATIN_ONLY;
    }

    return {
      config,
      analysis,
    };
  }
}

export default TextScriptDetector;