/**
 * 🌍 Элегантная система автодетекции языков и шрифтов
 * Простая, но умная - именно то, что нужно
 */

export interface LanguageInfo {
  language: string;
  script: 'latin' | 'cyrillic' | 'cjk' | 'arabic' | 'devanagari';
  confidence: number;
  recommendedFont: string;
  direction: 'ltr' | 'rtl';
  emoji: string;
  displayName: string;
}

export interface FontInfo {
  family: string;
  weight: string;
  style: string;
  fallbacks: string[];
  supports: string[];
}

// 🎯 Умные паттерны для детекции
const LANGUAGE_PATTERNS = {
  // Кириллические языки
  cyrillic: {
    regex: /[\u0400-\u04FF]/g,
    languages: {
      russian: { 
        chars: /[АЁІЇЎЮЯаёііїўюя]/g, 
        name: 'Русский', 
        emoji: '🇷🇺',
        font: 'PT Sans' 
      },
      latvian: { 
        chars: /[ĀāĒēĢģĪīĶķĻļŅņŌōŖŗŠšŪūŽž]/g, 
        name: 'Latviešu', 
        emoji: '🇱🇻',
        font: 'Roboto' 
      },
      lithuanian: { 
        chars: /[ĄąČčĘęĖėĮįŠšŲųŪūŽž]/g, 
        name: 'Lietuvių', 
        emoji: '🇱🇹',
        font: 'Source Sans Pro' 
      }
    }
  },
  
  // CJK языки
  cjk: {
    regex: /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF]/g,
    languages: {
      chinese: { 
        chars: /[\u4E00-\u9FFF]/g, 
        name: '中文', 
        emoji: '🇨🇳',
        font: 'Noto Sans CJK SC' 
      },
      japanese: { 
        chars: /[\u3040-\u309F\u30A0-\u30FF]/g, 
        name: '日本語', 
        emoji: '🇯🇵',
        font: 'Noto Sans CJK JP' 
      },
      korean: { 
        chars: /[\uAC00-\uD7AF]/g, 
        name: '한국어', 
        emoji: '🇰🇷',
        font: 'Noto Sans CJK KR' 
      }
    }
  },
  
  // Арабские языки
  arabic: {
    regex: /[\u0600-\u06FF\u0750-\u077F]/g,
    languages: {
      arabic: { 
        chars: /[\u0600-\u06FF]/g, 
        name: 'العربية', 
        emoji: '🇸🇦',
        font: 'Noto Sans Arabic' 
      }
    }
  },
  
  // Девангари (хинди и др.)
  devanagari: {
    regex: /[\u0900-\u097F]/g,
    languages: {
      hindi: { 
        chars: /[\u0900-\u097F]/g, 
        name: 'हिन्दी', 
        emoji: '🇮🇳',
        font: 'Noto Sans Devanagari' 
      }
    }
  },
  
  // Латинские языки
  latin: {
    regex: /[a-zA-Z]/g,
    languages: {
      english: { 
        chars: /[a-zA-Z]/g, 
        name: 'English', 
        emoji: '🇺🇸',
        font: 'Inter' 
      },
      german: { 
        chars: /[äöüßÄÖÜ]/g, 
        name: 'Deutsch', 
        emoji: '🇩🇪',
        font: 'Roboto' 
      },
      french: { 
        chars: /[àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/g, 
        name: 'Français', 
        emoji: '🇫🇷',
        font: 'Open Sans' 
      }
    }
  }
};

// 🎨 Рекомендованные шрифты по скриптам
const FONT_RECOMMENDATIONS = {
  latin: ['Inter', 'Roboto', 'Open Sans', 'Lato'],
  cyrillic: ['PT Sans', 'Roboto', 'Open Sans', 'Fira Sans'],
  cjk: ['Noto Sans CJK', 'Source Han Sans', 'Roboto'],
  arabic: ['Noto Sans Arabic', 'Amiri', 'Roboto Arabic'],
  devanagari: ['Noto Sans Devanagari', 'Roboto Devanagari']
};

/**
 * 🔍 Умная детекция языка из CSV данных
 */
export function detectLanguage(data: string[][]): LanguageInfo {
  // Объединяем все текстовые данные
  const allText = data.flat().join(' ').slice(0, 1000); // Первая 1000 символов для анализа
  
  if (!allText.trim()) {
    return getDefaultLanguage();
  }
  
  // Ищем самый вероятный язык
  let bestMatch: LanguageInfo = getDefaultLanguage();
  let maxScore = 0;
  
  for (const [scriptName, scriptData] of Object.entries(LANGUAGE_PATTERNS)) {
    const scriptMatches = allText.match(scriptData.regex);
    if (!scriptMatches) continue;
    
    const scriptScore = scriptMatches.length / allText.length;
    
    // Ищем конкретный язык внутри скрипта
    for (const [langKey, langData] of Object.entries(scriptData.languages)) {
      const langMatches = allText.match(langData.chars);
      const langScore = langMatches ? 
        scriptScore + (langMatches.length / allText.length) * 0.5 : 
        scriptScore;
      
      if (langScore > maxScore) {
        maxScore = langScore;
        bestMatch = {
          language: langKey,
          script: scriptName as any,
          confidence: Math.min(0.95, langScore * 2),
          recommendedFont: langData.font,
          direction: scriptName === 'arabic' ? 'rtl' : 'ltr',
          emoji: langData.emoji,
          displayName: langData.name
        };
      }
    }
  }
  
  return bestMatch;
}

/**
 * 🎯 Получить рекомендованные шрифты для скрипта
 */
export function getRecommendedFonts(script: string): string[] {
  return FONT_RECOMMENDATIONS[script as keyof typeof FONT_RECOMMENDATIONS] || FONT_RECOMMENDATIONS.latin;
}

/**
 * 🔧 Проверить доступность шрифта в браузере
 */
export async function checkFontAvailability(fontFamily: string): Promise<boolean> {
  if (!document.fonts) return false;
  
  try {
    await document.fonts.load(`12px "${fontFamily}"`);
    return document.fonts.check(`12px "${fontFamily}"`);
  } catch {
    return false;
  }
}

/**
 * 📊 Получить статистику языков в данных
 */
export function getLanguageStats(data: string[][]): Array<{
  language: string;
  percentage: number;
  count: number;
  emoji: string;
}> {
  const allText = data.flat().join(' ');
  const stats: Array<{ language: string; percentage: number; count: number; emoji: string }> = [];
  
  for (const [scriptName, scriptData] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const [langKey, langData] of Object.entries(scriptData.languages)) {
      const matches = allText.match(langData.chars);
      if (matches) {
        stats.push({
          language: langData.name,
          percentage: (matches.length / allText.length) * 100,
          count: matches.length,
          emoji: langData.emoji
        });
      }
    }
  }
  
  return stats.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
}

/**
 * ⚡ Быстрая детекция для превью
 */
export function quickLanguageDetect(text: string): { script: string; emoji: string; confidence: number } {
  const sample = text.slice(0, 100);
  
  if (/[\u0400-\u04FF]/.test(sample)) {
    return { script: 'cyrillic', emoji: '🇷🇺', confidence: 0.8 };
  }
  if (/[\u4E00-\u9FFF]/.test(sample)) {
    return { script: 'cjk', emoji: '🇨🇳', confidence: 0.9 };
  }
  if (/[\u0600-\u06FF]/.test(sample)) {
    return { script: 'arabic', emoji: '🇸🇦', confidence: 0.9 };
  }
  if (/[\u0900-\u097F]/.test(sample)) {
    return { script: 'devanagari', emoji: '🇮🇳', confidence: 0.9 };
  }
  
  return { script: 'latin', emoji: '🌍', confidence: 0.6 };
}

/**
 * 🎨 Получить оптимальные настройки PDF для языка
 */
export function getOptimalPDFSettings(languageInfo: LanguageInfo) {
  const baseSettings = {
    fontFamily: languageInfo.recommendedFont,
    direction: languageInfo.direction,
    fontSize: 10,
    lineHeight: 1.4
  };
  
  // Специфичные настройки для разных скриптов
  switch (languageInfo.script) {
    case 'cjk':
      return { ...baseSettings, fontSize: 11, lineHeight: 1.6 };
    case 'arabic':
      return { ...baseSettings, fontSize: 12, lineHeight: 1.8, textAlign: 'right' };
    case 'devanagari':
      return { ...baseSettings, fontSize: 11, lineHeight: 1.7 };
    default:
      return baseSettings;
  }
}

// 🎯 Дефолтный язык
function getDefaultLanguage(): LanguageInfo {
  return {
    language: 'auto',
    script: 'latin',
    confidence: 0.5,
    recommendedFont: 'Inter',
    direction: 'ltr',
    emoji: '📄',
    displayName: 'Auto-detect'
  };
}

export default {
  detectLanguage,
  getRecommendedFonts,
  checkFontAvailability,
  getLanguageStats,
  quickLanguageDetect,
  getOptimalPDFSettings
};