/**
 * enhanced-csv-pdf.types.ts
 * 🔧 Типы для расширенной системы CSV to PDF с живым предпросмотром
 * 
 * Обновленные интерфейсы для поддержки:
 * - Многоязычности и автодетекции языка
 * - Живого предпросмотра PDF
 * - Расширенных настроек шрифтов
 * - Интерактивного редактирования
 */

import { CsvParseResult, CsvToPdfOptions } from '../services/converters/CsvToPdfConverter';

// 🌍 Языковая поддержка
export interface LanguageDetectionResult {
  code: string;
  name: string;
  confidence: number;
  script: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'devanagari';
  direction: 'ltr' | 'rtl';
  suggestedFonts: string[];
}

export interface MultiLanguageSupport {
  supportedLanguages: {
    'auto': 'Auto-detect';
    'en': 'English';
    'ru': 'Русский (Кириллица)';
    'lv': 'Latviešu (Латышский)';
    'lt': 'Lietuvių (Литовский)';
    'et': 'Eesti (Эстонский)';
    'pl': 'Polski (Польский)';
    'de': 'Deutsch (Немецкий)';
    'fr': 'Français (Французский)';
    'es': 'Español (Испанский)';
    'it': 'Italiano (Итальянский)';
    'pt': 'Português (Португальский)';
    'nl': 'Nederlands (Голландский)';
    'sv': 'Svenska (Шведский)';
    'no': 'Norsk (Норвежский)';
    'da': 'Dansk (Датский)';
    'fi': 'Suomi (Финский)';
    'zh': '中文 (Китайский)';
    'ja': '日本語 (Японский)';
    'ko': '한국어 (Корейский)';
    'ar': 'العربية (Арабский)';
    'hi': 'हिन्दी (Хинди)';
    'th': 'ไทย (Тайский)';
    'vi': 'Tiếng Việt (Вьетнамский)';
  };
  
  fontFamilies: {
    'latin': ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro'];
    'cyrillic': ['Roboto', 'Open Sans', 'PT Sans', 'Fira Sans', 'DejaVu Sans'];
    'baltic': ['Roboto', 'Open Sans', 'Source Sans Pro', 'Lato'];
    'cjk': ['Noto Sans CJK', 'Source Han Sans', 'Roboto', 'Microsoft YaHei'];
    'arabic': ['Noto Sans Arabic', 'Roboto Arabic', 'Amiri', 'Scheherazade'];
    'devanagari': ['Noto Sans Devanagari', 'Roboto Devanagari', 'Mangal'];
    'thai': ['Noto Sans Thai', 'Roboto Thai', 'Sarabun'];
  };
  
  autoDetection: {
    detectLanguageFromCSV: boolean;
    suggestOptimalFont: boolean;
    fallbackChain: string[];
    confidenceThreshold: number;
  };
}

// 🎨 Расширенные опции PDF
export interface EnhancedPdfOptions extends CsvToPdfOptions {
  // Языковые настройки
  selectedLanguage?: string;
  selectedFont?: string;
  fontFamily?: string;
  preserveUnicode?: boolean;
  enableFallbackFonts?: boolean;
  
  // Живой предпросмотр
  livePreview?: {
    enabled: boolean;
    updateDelay: number;
    quality: 'low' | 'medium' | 'high';
    cacheEnabled: boolean;
  };
  
  // Расширенная стилизация
  styling?: {
    theme: 'default' | 'modern' | 'corporate' | 'academic' | 'minimal';
    colorScheme: 'light' | 'dark' | 'auto';
    headerBackground?: string;
    headerTextColor?: string;
    alternateRowColors?: boolean;
    borderStyle: 'none' | 'thin' | 'medium' | 'thick';
    cornerRadius?: number;
  };
  
  // Брендинг
  branding?: {
    logo?: File | string;
    watermark?: string;
    footer?: string;
    companyName?: string;
  };
  
  // Метаданные
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
  };
}

// 📊 Состояние редактора
export interface EditorState {
  currentView: 'upload' | 'edit' | 'style' | 'preview' | 'export';
  
  // Данные
  csvFile: File | null;
  parseResult: CsvParseResult | null;
  editedData?: any[][];
  hasUnsavedChanges: boolean;
  
  // Языки и шрифты
  detectedLanguage: LanguageDetectionResult | null;
  availableFonts: FontInfo[];
  loadedFonts: Set<string>;
  
  // Предпросмотр
  previewState: {
    isGenerating: boolean;
    lastGenerated: Date | null;
    error: string | null;
    warnings: string[];
    pdfUrl: string | null;
    currentPage: number;
    totalPages: number;
    zoomLevel: number;
  };
  
  // Настройки
  options: EnhancedPdfOptions;
  
  // UI состояния
  isLoading: boolean;
  processingStage: 'idle' | 'parsing' | 'analyzing' | 'generating' | 'exporting';
  progress: number;
  
  // Функции
  features: {
    autoLanguageDetection: boolean;
    livePreview: boolean;
    enhancedFonts: boolean;
    dragDropEditing: boolean;
    smartTemplates: boolean;
    collaborativeEditing: boolean;
  };
}

// 🔤 Информация о шрифтах
export interface FontInfo {
  name: string;
  displayName: string;
  family: string;
  supportedLanguages: string[];
  supportedScripts: string[];
  unicodeRanges: string[];
  quality: 'excellent' | 'good' | 'basic' | 'poor';
  source: 'system' | 'web' | 'embedded' | 'external';
  fileSize?: number;
  loadingTime?: number;
  fallbacks: string[];
  specimen?: string; // Образец текста для предпросмотра
}

// 🎯 События и действия
export interface EditorAction {
  type: 
    | 'SET_FILE'
    | 'SET_PARSE_RESULT'
    | 'UPDATE_OPTIONS'
    | 'CHANGE_VIEW'
    | 'SET_LANGUAGE'
    | 'SET_FONT'
    | 'UPDATE_DATA'
    | 'GENERATE_PREVIEW'
    | 'EXPORT_PDF'
    | 'RESET_EDITOR'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'UPDATE_PROGRESS';
  
  payload?: any;
  meta?: {
    timestamp: Date;
    userId?: string;
    sessionId?: string;
  };
}

// 🚀 Хуки и контекст
export interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  
  // Методы
  uploadFile: (file: File) => Promise<void>;
  updateOptions: (options: Partial<EnhancedPdfOptions>) => void;
  changeLanguage: (language: string) => void;
  changeFont: (font: string) => void;
  updateData: (rowIndex: number, columnIndex: number, value: any) => void;
  generatePreview: (force?: boolean) => Promise<void>;
  exportPDF: () => Promise<Blob>;
  resetEditor: () => void;
  
  // Утилиты
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  validateData: () => ValidationResult[];
}

// ✅ Результаты валидации
export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  row?: number;
  column?: number;
  field?: string;
  suggestion?: string;
}

// 📈 Аналитика и метрики
export interface PerformanceMetrics {
  parseTime: number;
  languageDetectionTime: number;
  fontLoadTime: number;
  previewGenerationTime: number;
  exportTime: number;
  totalRows: number;
  totalColumns: number;
  fileSize: number;
  outputSize: number;
  memoryUsage?: number;
}

// 🎨 Шаблоны документов
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
  category: 'business' | 'academic' | 'financial' | 'creative' | 'technical';
  options: Partial<EnhancedPdfOptions>;
  supportedLanguages: string[];
  tags: string[];
  popularity: number;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 🔧 Конфигурация системы
export interface SystemConfig {
  maxFileSize: number;
  supportedFormats: string[];
  defaultOptions: EnhancedPdfOptions;
  performance: {
    previewDebounceTime: number;
    maxConcurrentPreviews: number;
    cacheTimeout: number;
    workerPoolSize: number;
  };
  features: {
    enableAnalytics: boolean;
    enableTelemetry: boolean;
    enableCaching: boolean;
    enableExperimentalFeatures: boolean;
  };
  limits: {
    maxRows: number;
    maxColumns: number;
    maxCellLength: number;
    maxPreviewPages: number;
  };
}

// 📱 Responsive состояния
export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
}

// 🔄 История изменений
export interface ChangeHistoryEntry {
  id: string;
  timestamp: Date;
  action: EditorAction;
  previousState?: Partial<EditorState>;
  newState?: Partial<EditorState>;
  canUndo: boolean;
  description: string;
}

// 🌟 Экспортируемые типы для использования в компонентах
export type {
  LanguageDetectionResult,
  MultiLanguageSupport,
  EnhancedPdfOptions,
  EditorState,
  FontInfo,
  EditorAction,
  EditorContextValue,
  ValidationResult,
  PerformanceMetrics,
  DocumentTemplate,
  SystemConfig,
  ResponsiveState,
  ChangeHistoryEntry
};

// 🎯 Константы
export const SUPPORTED_LANGUAGES = [
  'auto', 'en', 'ru', 'lv', 'lt', 'et', 'pl', 'de', 'fr', 'es', 'it', 'pt',
  'nl', 'sv', 'no', 'da', 'fi', 'zh', 'ja', 'ko', 'ar', 'hi', 'th', 'vi'
] as const;

export const FONT_CATEGORIES = [
  'latin', 'cyrillic', 'baltic', 'cjk', 'arabic', 'devanagari', 'thai'
] as const;

export const DOCUMENT_THEMES = [
  'default', 'modern', 'corporate', 'academic', 'minimal'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type FontCategory = typeof FONT_CATEGORIES[number];
export type DocumentTheme = typeof DOCUMENT_THEMES[number];