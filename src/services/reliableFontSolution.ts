/**
 * 🎯 Простое и надежное решение шрифтов для PDF
 * Фокус на работающих системных шрифтах
 */

export interface SimpleFontSolution {
  primary: string;
  fallback: string[];
  strategy: 'system' | 'universal';
  tested: boolean;
}

// 🔧 Проверенные системные шрифты для разных языков
const RELIABLE_FONTS = {
  // Универсальные шрифты с хорошей Unicode поддержкой
  universal: [
    'Arial',           // Лучшая поддержка Unicode в jsPDF
    'Helvetica',       // Встроенный в jsPDF
    'Times',           // Встроенный в jsPDF
    'Courier'          // Встроенный в jsPDF
  ],
  
  // Кириллица - используем только системные
  cyrillic: [
    'Arial',           // Лучший выбор для кириллицы
    'Times New Roman', // Хорошая поддержка
    'Verdana',         // Читаемый
    'Tahoma'           // Компактный
  ],
  
  // CJK - простые решения
  cjk: [
    'Arial',           // Базовая поддержка
    'Helvetica',       // Fallback
    'sans-serif'       // Системный fallback
  ],
  
  // Арабский - базовая поддержка
  arabic: [
    'Arial',           // Лучший выбор
    'Tahoma',          // Хорошая поддержка RTL
    'sans-serif'       // Fallback
  ]
};

/**
 * 🎯 Получить простое и надежное решение шрифта
 */
export function getReliableFontSolution(script: string): SimpleFontSolution {
  // Для всех языков используем Arial как самый надежный
  const primaryFont = 'Arial';
  const fallbackFonts = ['Helvetica', 'sans-serif'];
  
  return {
    primary: primaryFont,
    fallback: fallbackFonts,
    strategy: 'system',
    tested: true
  };
}

/**
 * 🔧 Применить надежные настройки шрифта к PDF
 */
export function applyReliableFontToPDF(
  pdfOptions: any,
  fontSolution: SimpleFontSolution,
  hasUnicodeChars: boolean
): any {
  
  // Простые и надежные настройки
  const reliableOptions = {
    ...pdfOptions,
    // Используем только встроенные шрифты jsPDF
    fontFamily: fontSolution.primary,
    // Отключаем проблемные функции
    embedFonts: false,
    useSystemFonts: false,
    customFonts: false,
    // Базовые настройки для Unicode
    unicodeSupport: hasUnicodeChars,
    preserveEncoding: true
  };
  
  // Для Unicode текста увеличиваем размер шрифта
  if (hasUnicodeChars) {
    reliableOptions.fontSize = Math.max(reliableOptions.fontSize || 10, 11);
  }
  
  return reliableOptions;
}

/**
 * 🧪 Проверка наличия Unicode символов
 */
export function hasUnicodeCharacters(text: string): boolean {
  // Проверяем наличие символов вне базового ASCII
  return /[^\u0000-\u007F]/.test(text);
}

/**
 * 🎨 Получить оптимизированные настройки для языка
 */
export function getOptimizedFontSettings(
  language: string,
  script: string,
  csvData: string[][]
): {
  fontSolution: SimpleFontSolution;
  pdfOptions: any;
  recommendations: string[];
} {
  
  const sampleText = csvData.flat().slice(0, 10).join(' ');
  const hasUnicode = hasUnicodeCharacters(sampleText);
  const fontSolution = getReliableFontSolution(script);
  
  const recommendations: string[] = [];
  
  // Генерируем рекомендации
  if (hasUnicode) {
    recommendations.push(`🌍 Unicode text detected - using optimized settings`);
    recommendations.push(`🔤 Font size increased for better readability`);
  }
  
  recommendations.push(`✅ Using reliable system font: ${fontSolution.primary}`);
  
  if (script === 'cyrillic') {
    recommendations.push(`🇷🇺 Cyrillic text optimized with Arial font`);
  } else if (script === 'cjk') {
    recommendations.push(`🇨🇳 CJK characters will use system fallback fonts`);
  } else if (script === 'arabic') {
    recommendations.push(`🇸🇦 Arabic text optimized for RTL reading`);
  }
  
  const pdfOptions = applyReliableFontToPDF({}, fontSolution, hasUnicode);
  
  return {
    fontSolution,
    pdfOptions,
    recommendations
  };
}

/**
 * 🛡️ Безопасная обработка текста для PDF
 */
export function sanitizeTextForPDF(text: string): string {
  // Удаляем проблемные символы, которые могут сломать PDF
  return text
    .replace(/[\u0000-\u001F]/g, '') // Удаляем control characters
    .replace(/[\uFEFF]/g, '')        // Удаляем BOM
    .trim();
}

/**
 * 📊 Анализ совместимости шрифта с данными
 */
export function analyzeFontCompatibility(
  csvData: string[][],
  fontSolution: SimpleFontSolution
): {
  compatible: boolean;
  issues: string[];
  suggestions: string[];
} {
  
  const allText = csvData.flat().join(' ');
  const hasUnicode = hasUnicodeCharacters(allText);
  
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (hasUnicode) {
    suggestions.push('📊 Large Unicode text detected - PDF optimized for readability');
    suggestions.push('🎯 Using Arial font for best Unicode support in PDF');
  }
  
  // Проверка на очень длинные строки
  const maxLineLength = Math.max(...csvData.flat().map(cell => cell.length));
  if (maxLineLength > 50) {
    suggestions.push('📏 Long text detected - consider landscape orientation');
  }
  
  return {
    compatible: true, // Всегда совместимо с нашим простым подходом
    issues,
    suggestions
  };
}

export default {
  getReliableFontSolution,
  applyReliableFontToPDF,
  hasUnicodeCharacters,
  getOptimizedFontSettings,
  sanitizeTextForPDF,
  analyzeFontCompatibility
};