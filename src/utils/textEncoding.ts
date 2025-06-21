/**
 * Text Encoding Utilities for PDF Processing
 * 
 * Обеспечивает безопасную работу с текстом в PDF документах,
 * предотвращая ошибки кодирования WinAnsi и Unicode.
 */

/**
 * Проверяет, можно ли закодировать символ в WinAnsi (Windows-1252)
 */
export function isWinAnsiCompatible(char: string): boolean {
  const code = char.charCodeAt(0);
  
  // ASCII symbols (0-127) всегда поддерживаются
  if (code <= 127) return true;
  
  // Windows-1252 дополнительные символы (128-255)
  // Некоторые позиции в диапазоне 128-159 не определены в Windows-1252
  const unsupportedCodes = [129, 141, 143, 144, 157];
  if (code >= 128 && code <= 255 && !unsupportedCodes.includes(code)) {
    return true;
  }
  
  return false;
}

/**
 * Удаляет или заменяет символы, несовместимые с WinAnsi
 */
export function sanitizeTextForPDF(text: string, options: {
  removeUnsupported?: boolean;
  replaceEmojis?: boolean;
  customReplacements?: Record<string, string>;
} = {}): string {
  const {
    removeUnsupported = true,
    replaceEmojis = true,
    customReplacements = {}
  } = options;

  let result = text;

  // Применяем пользовательские замены
  for (const [from, to] of Object.entries(customReplacements)) {
    result = result.replace(new RegExp(escapeRegExp(from), 'g'), to);
  }

  // Предустановленные замены для частых Unicode символов
  const commonReplacements: Record<string, string> = {
    // Quotes - используем безопасные ASCII коды
    '\u201C': '"', // "
    '\u201D': '"', // "
    '\u2018': "'", // '
    '\u2019': "'", // '
    
    // Dashes
    '\u2014': '-', // —
    '\u2013': '-', // –
    
    // Common emojis и Unicode символы
    '\u1F512': '[PROTECTED]', // 🔒
    '\u1F513': '[UNLOCKED]',  // 🔓
    '\u1F4C4': '[PDF]',       // 📄
    '\u2713': '[CHECK]',      // ✓
    '\u2717': '[X]',          // ✗
    '\u26A0': '[WARNING]',    // ⚠️
    '\u1F6AB': '[BLOCKED]',   // 🚫
    '\u1F4BE': '[SAVE]',      // 💾
    '\u1F4C1': '[FOLDER]',    // 📁
    '\u1F50D': '[SEARCH]',    // 🔍
    '\u23F1': '[TIME]',       // ⏱️
    '\u1F4CA': '[CHART]',     // 📊
    '\u1F527': '[TOOLS]',     // 🔧
    '\u2699': '[SETTINGS]',   // ⚙️
    
    // Mathematical symbols
    '\u00D7': 'x',      // ×
    '\u00F7': '/',      // ÷
    '\u00B1': '+/-',    // ±
    '\u2264': '<=',     // ≤
    '\u2265': '>=',     // ≥
    '\u2260': '!=',     // ≠
    
    // Arrows
    '\u2192': '->',     // →
    '\u2190': '<-',     // ←
    '\u2191': '^',      // ↑
    '\u2193': 'v',      // ↓
    
    // Other common symbols
    '\u00A9': '(c)',        // ©
    '\u00AE': '(R)',        // ®
    '\u2122': '(TM)',       // ™
    '\u00A7': 'section',    // §
    '\u00B6': 'paragraph',  // ¶
  };

  // Применяем общие замены
  if (replaceEmojis) {
    for (const [from, to] of Object.entries(commonReplacements)) {
      result = result.replace(new RegExp(escapeRegExp(from), 'g'), to);
    }
  }

  // Удаляем или заменяем оставшиеся несовместимые символы
  if (removeUnsupported) {
    result = result.split('').map(char => {
      if (isWinAnsiCompatible(char)) {
        return char;
      } else {
        // Заменяем на знак вопроса или пустую строку
        return isEmojiOrSymbol(char) ? '' : '?';
      }
    }).join('');
  }

  return result;
}

/**
 * Проверяет, является ли символ эмодзи или специальным символом
 */
function isEmojiOrSymbol(char: string): boolean {
  const code = char.charCodeAt(0);
  
  // Emoji ranges
  return (
    (code >= 0x1F600 && code <= 0x1F64F) || // Emoticons
    (code >= 0x1F300 && code <= 0x1F5FF) || // Misc Symbols and Pictographs
    (code >= 0x1F680 && code <= 0x1F6FF) || // Transport and Map Symbols
    (code >= 0x1F1E0 && code <= 0x1F1FF) || // Regional indicator symbols
    (code >= 0x2600 && code <= 0x26FF) ||   // Misc symbols
    (code >= 0x2700 && code <= 0x27BF) ||   // Dingbats
    (code >= 0xFE00 && code <= 0xFE0F) ||   // Variation selectors
    (code >= 0x1F900 && code <= 0x1F9FF) || // Supplemental Symbols and Pictographs
    (code >= 0x1FA70 && code <= 0x1FAFF)    // Symbols and Pictographs Extended-A
  );
}

/**
 * Экранирует специальные символы для регулярных выражений
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Создает безопасную строку для использования в заголовках PDF
 */
export function createSafePDFTitle(title: string): string {
  return sanitizeTextForPDF(title, {
    customReplacements: {
      '\u1F512': 'PROTECTED', // 🔒
      '\u1F513': 'UNLOCKED',  // 🔓
      '\u1F4C4': 'PDF',       // 📄
    }
  });
}

/**
 * Создает безопасный текст для тела документа PDF
 */
export function createSafePDFText(text: string): string {
  return sanitizeTextForPDF(text, {
    replaceEmojis: true,
    removeUnsupported: true
  });
}

/**
 * Валидирует строку перед добавлением в PDF
 */
export function validatePDFText(text: string): {
  isValid: boolean;
  issues: string[];
  sanitized: string;
} {
  const issues: string[] = [];
  let isValid = true;

  // Проверяем каждый символ
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!isWinAnsiCompatible(char)) {
      isValid = false;
      const code = char.charCodeAt(0);
      issues.push(`Character "${char}" (U+${code.toString(16).toUpperCase().padStart(4, '0')}) at position ${i} is not WinAnsi compatible`);
    }
  }

  const sanitized = sanitizeTextForPDF(text);

  return {
    isValid,
    issues,
    sanitized
  };
}

/**
 * Создает безопасный текст для информационной страницы защиты PDF
 */
export function createProtectionInfoText(password: string, fileName: string): string[] {
  const baseText = [
    `This PDF has been protected with password: "${password}"`,
    '',
    'IMPORTANT NOTICE:',
    'Due to browser limitations, this is a demonstration of password protection.',
    'The original PDF content is preserved but not encrypted with industry-standard encryption.',
    '',
    'For production use, please consider:',
    '• Adobe Acrobat Pro for full PDF encryption',
    '• Server-side PDF processing with proper encryption libraries',
    '• Desktop PDF tools with advanced security features',
    '',
    'This tool is designed for basic privacy protection and',
    'educational purposes in a client-side environment.',
    '',
    `Original file: ${fileName}`,
    `Protection applied: ${new Date().toLocaleString()}`,
    `Password hint: ${password.length} characters`,
  ];

  // Санитизируем каждую строку
  return baseText.map(line => createSafePDFText(line));
}

/**
 * Логирует проблемы с кодировкой для отладки
 */
export function logEncodingIssues(text: string, context: string = 'Unknown'): void {
  const validation = validatePDFText(text);
  
  if (!validation.isValid) {
    console.warn(`[PDF Text Encoding] Issues found in ${context}:`);
    validation.issues.forEach(issue => console.warn(`  - ${issue}`));
    console.warn(`  Sanitized text: "${validation.sanitized}"`);
  }
}

/**
 * Предустановленные безопасные сообщения для PDF
 */
export const SAFE_PDF_MESSAGES = {
  PROTECTED_TITLE: 'PROTECTED - PASSWORD PROTECTED PDF',
  UNLOCKED_TITLE: 'UNLOCKED - PDF Unlocked Successfully',
  PROCESSING: 'Processing PDF...',
  ERROR: 'An error occurred',
  SUCCESS: 'Operation completed successfully',
  WARNING: 'Warning: Browser limitations apply',
  EDUCATIONAL_NOTICE: 'Educational tool - not for production encryption',
} as const;

/**
 * Создает безопасное сообщение об ошибке для PDF
 */
export function createSafeErrorMessage(error: string): string {
  return createSafePDFText(`Error: ${error}`);
}

/**
 * Экспорт типов для TypeScript
 */
export interface PDFTextValidation {
  isValid: boolean;
  issues: string[];
  sanitized: string;
}

export interface PDFTextOptions {
  removeUnsupported?: boolean;
  replaceEmojis?: boolean;
  customReplacements?: Record<string, string>;
}
