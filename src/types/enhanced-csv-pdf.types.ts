/**
 * Enhanced CSV to PDF Types
 * Типы для расширенного интерактивного редактора CSV to PDF
 */

import { CsvParseResult, CsvToPdfOptions } from '../services/converters/CsvToPdfConverter';

// 🆕 Расширенные опции с поддержкой многоязычности
export interface EnhancedCsvToPdfOptions extends CsvToPdfOptions {
  // Языковая поддержка
  language: string;
  autoDetectLanguage: boolean;
  fontFallbackChain: string[];
  
  // Расширенные стили
  colorScheme: 'default' | 'corporate' | 'modern' | 'minimal' | 'dark';
  tableStyle: 'grid' | 'striped' | 'minimal' | 'modern' | 'professional' | 'elegant';
  headerStyle: 'bold' | 'colored' | 'gradient' | 'simple' | 'modern';
  
  // Дополнительные элементы
  subtitle?: string;
  showFooter: boolean;
  watermark?: string;
  logoUrl?: string;
  
  // Интерактивные настройки
  enableHover: boolean;
  showRowHighlight: boolean;
  compactMode: boolean;
}

// Поддерживаемые языки с метаданными
export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  script: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'devanagari';
  direction: 'ltr' | 'rtl';
  primaryFonts: string[];
  fallbackFonts: string[];
  unicodeRange: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageSupport> = {
  'auto': {
    code: 'auto',
    name: 'Auto-detect',
    nativeName: 'Auto-detect',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['auto'],
    fallbackFonts: ['Roboto', 'Arial'],
    unicodeRange: 'U+0000-007F'
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Inter', 'Roboto', 'Open Sans'],
    fallbackFonts: ['Arial', 'Helvetica'],
    unicodeRange: 'U+0000-007F'
  },
  'ru': {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    script: 'cyrillic',
    direction: 'ltr',
    primaryFonts: ['DejaVu Sans', 'PT Sans', 'Roboto'],
    fallbackFonts: ['Times', 'Arial'],
    unicodeRange: 'U+0400-04FF'
  },
  'lv': {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Roboto', 'Open Sans', 'Source Sans Pro'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'lt': {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Roboto', 'Open Sans', 'Source Sans Pro'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'et': {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Roboto', 'Open Sans', 'Source Sans Pro'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'pl': {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Roboto', 'Open Sans', 'Fira Sans'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'de': {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Inter', 'Roboto', 'Open Sans'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Inter', 'Roboto', 'Open Sans'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Inter', 'Roboto', 'Open Sans'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  },
  'it': {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    script: 'latin',
    direction: 'ltr',
    primaryFonts: ['Inter', 'Roboto', 'Open Sans'],
    fallbackFonts: ['Arial', 'Times'],
    unicodeRange: 'U+0100-017F'
  }
};

// Результат детекции языка
export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  fallbackLanguage: string;
  supportedCharacters: number;
  totalCharacters: number;
  warnings: string[];
}

// Конфигурация для живого предпросмотра
export interface LivePreviewConfig {
  autoRefresh: boolean;
  refreshInterval: number; // ms
  maxPreviewRows: number;
  showGridLines: boolean;
  highlightChanges: boolean;
  renderingQuality: 'fast' | 'balanced' | 'high';
}

// Состояние редактора
export interface EditorState {
  activePanel: 'data' | 'style' | 'language' | 'preview';
  isGenerating: boolean;
  lastGenerated: Date | null;
  unsavedChanges: boolean;
  selectedCells: string[];
  currentTemplate: string | null;
}

// Настройки колонок
export interface ColumnConfig {
  id: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  width: number;
  alignment: 'left' | 'center' | 'right';
  visible: boolean;
  format?: string;
  color?: string;
  fontWeight?: 'normal' | 'bold';
}

// Шаблоны стилей
export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  options: Partial<EnhancedCsvToPdfOptions>;
  tags: string[];
  popularity: number;
}

// События редактора
export interface EditorEvents {
  onCellEdit: (rowIndex: number, columnId: string, newValue: any) => void;
  onColumnReorder: (fromIndex: number, toIndex: number) => void;
  onColumnResize: (columnId: string, newWidth: number) => void;
  onRowDelete: (rowIndex: number) => void;
  onRowAdd: () => void;
  onTemplateApply: (templateId: string) => void;
  onExport: (format: 'pdf' | 'preview') => Promise<void>;
}
