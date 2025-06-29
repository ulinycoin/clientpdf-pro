/**
 * Enhanced CSV to PDF Editor Types
 * 
 * Типизация для интерактивного редактора CSV в PDF с расширенной
 * поддержкой языков, живым предпросмотром и стилизацией
 */

import { LanguageInfo } from '../services/elegantLanguageDetection';

// ========================================
// ОСНОВНЫЕ ТИПЫ ДАННЫХ
// ========================================

export interface EditableCSVData {
  headers: string[];
  rows: string[][];
  metadata: {
    rowCount: number;
    columnCount: number;
    title?: string;
    language?: LanguageInfo;
    originalFilename?: string;
    encoding?: string;
    delimiter?: string;
  };
}

export interface CellReference {
  row: number; // -1 для заголовков
  col: number;
}

export interface EditHistoryEntry {
  action: 'edit' | 'add-row' | 'delete-row' | 'add-column' | 'delete-column';
  data: EditableCSVData;
  timestamp: Date;
  cellRef?: CellReference;
  oldValue?: string;
  newValue?: string;
}

// ========================================
// СТИЛИ И ТЕМЫ
// ========================================

export interface ThemeColors {
  header: string;
  text: string;
  border: string;
  background: string;
  accent?: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  emoji: string;
  description?: string;
}

export interface StyleOptions {
  theme: 'clean' | 'modern' | 'minimal' | 'professional' | 'colorful';
  fontSize: number;
  fontFamily: string;
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  colors: ThemeColors;
  spacing: {
    cellPadding: number;
    lineHeight: number;
    margins: number;
    borderWidth?: number;
  };
  typography: {
    headerWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
  };
}

export interface CellStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  borderStyle?: 'none' | 'thin' | 'medium' | 'thick';
  borderColor?: string;
}

export interface CellRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

// ========================================
// PDF ПРЕДПРОСМОТР
// ========================================

export interface PDFPreviewState {
  isGenerating: boolean;
  pdfUrl: string | null;
  error: string | null;
  warnings: string[];
  lastGenerated: Date | null;
  zoom: number;
  currentPage: number;
  totalPages: number;
  fileSize?: number;
  generationTime?: number;
}

export interface PDFGenerationOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  fontSize: number;
  fontFamily: string;
  useSystemFonts: boolean;
  embedFonts: boolean;
  preserveCyrillic: boolean;
  unicodeSupport: boolean;
  
  // Стилизация
  theme: string;
  colors: ThemeColors;
  spacing: StyleOptions['spacing'];
  
  // Заголовки и метаданные
  title: string;
  includeRowNumbers: boolean;
  fitToPage: boolean;
  
  // Поля и отступы
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  
  // Стили таблицы
  tableStyle: 'grid' | 'minimal' | 'bordered';
  headerStyle: 'normal' | 'bold' | 'colored';
  
  // Цвета
  headerBackgroundColor: string;
  borderColor: string;
  textColor: string;
  backgroundColor?: string;
}

// ========================================
// ЯЗЫКИ И ШРИФТЫ
// ========================================

export interface LanguageConfig {
  name: string;
  script: 'latin' | 'cyrillic' | 'latin-extended' | 'cjk' | 'arabic' | 'devanagari';
  direction: 'ltr' | 'rtl';
  emoji: string;
  commonWords?: string[];
  fontRecommendations?: string[];
}

export interface FontSolution {
  primary: string;
  fallbacks: string[];
  strategy: 'system' | 'embedded' | 'web' | 'hybrid';
  reliability: 'high' | 'medium' | 'low';
  unicodeSupport: boolean;
  preservesCyrillic?: boolean;
}

export interface LanguageAnalysis {
  language: LanguageInfo;
  config?: LanguageConfig;
  optimalSettings: Partial<PDFGenerationOptions>;
  fontRecommendations: string[];
  fontSolution: FontSolution;
  confidence: number;
  detectedScript: string;
}

// ========================================
// ИНТЕРФЕЙС И ВЗАИМОДЕЙСТВИЕ
// ========================================

export interface EditorMode {
  activeTab: 'data' | 'style' | 'preview' | 'export';
  splitView: boolean;
  previewSize: 'small' | 'medium' | 'large';
  showAdvancedOptions?: boolean;
  compactMode?: boolean;
}

export interface EditorState {
  csvData: EditableCSVData;
  editingCell: CellReference | null;
  editValue: string;
  selectedRange: CellRange | null;
  history: EditHistoryEntry[];
  historyIndex: number;
  isDirty: boolean;
  lastSaved?: Date;
}

export interface StyleState {
  options: StyleOptions;
  cellStyles: { [key: string]: CellStyle }; // "row-col" -> CellStyle
  selectedRange: CellRange | null;
  clipboardStyle?: CellStyle;
}

// ========================================
// CALLBACKS И СОБЫТИЯ
// ========================================

export interface EditorCallbacks {
  onDataChange?: (data: EditableCSVData) => void;
  onStyleChange?: (options: StyleOptions) => void;
  onExport?: (blob: Blob, filename: string) => void;
  onError?: (error: string, context?: any) => void;
  onWarning?: (warning: string) => void;
  onLanguageDetected?: (analysis: LanguageAnalysis) => void;
  onPDFGenerated?: (pdfUrl: string, metadata: any) => void;
}

export interface EditorActions {
  // Данные
  editCell: (row: number, col: number, value: string) => void;
  addRow: (index?: number) => void;
  deleteRow: (index: number) => void;
  addColumn: (index?: number, name?: string) => void;
  deleteColumn: (index: number) => void;
  
  // История
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Стили
  applyStyle: (range: CellRange, style: Partial<CellStyle>) => void;
  clearStyles: (range?: CellRange) => void;
  copyStyle: (range: CellRange) => void;
  pasteStyle: (range: CellRange) => void;
  
  // Выделение
  selectRange: (range: CellRange) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // PDF
  generatePDF: () => Promise<void>;
  regeneratePDF: () => Promise<void>;
  exportPDF: (filename?: string) => Promise<void>;
  
  // Утилиты
  resetToDefaults: () => void;
  loadTemplate: (template: StyleOptions) => void;
  saveAsTemplate: (name: string) => void;
}

// ========================================
// ШАБЛОНЫ И ПРЕСЕТЫ
// ========================================

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string; // base64 image или URL
  styleOptions: StyleOptions;
  tags?: string[];
  author?: string;
  createdAt?: Date;
  downloads?: number;
  rating?: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  templates: StyleTemplate[];
}

// ========================================
// ЭКСПОРТ И НАСТРОЙКИ
// ========================================

export interface ExportOptions {
  format: 'pdf';
  filename?: string;
  includeMetadata: boolean;
  compression: 'none' | 'low' | 'medium' | 'high';
  embedFonts: boolean;
  pdfVersion: '1.4' | '1.5' | '1.6' | '1.7';
  permissions?: {
    printing: boolean;
    copying: boolean;
    editing: boolean;
    annotating: boolean;
  };
}

export interface EditorPreferences {
  autoSave: boolean;
  autoSaveInterval: number; // секунды
  defaultTheme: string;
  defaultLanguage: string;
  showTooltips: boolean;
  compactMode: boolean;
  splitViewDefault: boolean;
  zoomLevel: number;
  
  // Производительность
  debounceDelay: number;
  maxHistoryEntries: number;
  enableAnimations: boolean;
  preloadFonts: boolean;
  
  // Языки и локализация
  uiLanguage: string;
  autoDetectLanguage: boolean;
  preferSystemFonts: boolean;
  fallbackEncoding: string;
}

// ========================================
// HOOKS И UTILITIES
// ========================================

export interface UseEditorReturn {
  // Состояние
  editorState: EditorState;
  styleState: StyleState;
  pdfState: PDFPreviewState;
  editorMode: EditorMode;
  languageAnalysis: LanguageAnalysis | null;
  
  // Действия
  actions: EditorActions;
  
  // Утилиты
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  validationErrors: string[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, data: EditableCSVData) => boolean;
}

export interface DataValidation {
  rules: ValidationRule[];
  errors: { [field: string]: string[] };
  warnings: { [field: string]: string[] };
  isValid: boolean;
}

// ========================================
// РЕАЛЬНОЕ ВРЕМЯ И COLLABORATION (будущее)
// ========================================

export interface CollaborationState {
  isEnabled: boolean;
  users: CollaborationUser[];
  currentUser: CollaborationUser;
  cursors: { [userId: string]: CellReference };
  selections: { [userId: string]: CellRange };
  conflicts: CollaborationConflict[];
}

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  permissions: CollaborationPermissions;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canStyle: boolean;
  canExport: boolean;
  canShare: boolean;
  canInvite: boolean;
}

export interface CollaborationConflict {
  id: string;
  cellRef: CellReference;
  users: string[];
  values: { [userId: string]: string };
  timestamp: Date;
  resolved: boolean;
}

// ========================================
// АНАЛИТИКА И МЕТРИКИ
// ========================================

export interface EditorAnalytics {
  sessionId: string;
  startTime: Date;
  actions: AnalyticsAction[];
  performance: PerformanceMetrics;
  userBehavior: UserBehaviorMetrics;
}

export interface AnalyticsAction {
  type: string;
  timestamp: Date;
  duration?: number;
  metadata?: any;
}

export interface PerformanceMetrics {
  pdfGenerationTimes: number[];
  averagePdfGenerationTime: number;
  memoryUsage: number;
  renderingTimes: number[];
  errorCount: number;
  warningCount: number;
}

export interface UserBehaviorMetrics {
  totalEdits: number;
  themeSwitches: number;
  pdfGenerations: number;
  exports: number;
  undoRedoUsage: number;
  preferredTab: string;
  sessionDuration: number;
  featureUsage: { [feature: string]: number };
}

// ========================================
// ЛОКАЛИЗАЦИЯ
// ========================================

export interface Localization {
  language: string;
  region: string;
  texts: LocalizationTexts;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currency: string;
}

export interface LocalizationTexts {
  [key: string]: string | LocalizationTexts;
}

// ========================================
// КОНСТАНТЫ И ENUM-ы
// ========================================

export const SUPPORTED_LANGUAGES = [
  'en', 'ru', 'lv', 'lt', 'et', 'pl', 'de', 'fr', 
  'es', 'it', 'zh', 'ja', 'ko', 'ar', 'hi'
] as const;

export const SUPPORTED_SCRIPTS = [
  'latin', 'cyrillic', 'latin-extended', 'cjk', 
  'arabic', 'devanagari'
] as const;

export const THEME_NAMES = [
  'clean', 'modern', 'minimal', 'professional', 'colorful'
] as const;

export const PAGE_SIZES = [
  'a4', 'a3', 'letter', 'legal'
] as const;

export const FONT_STRATEGIES = [
  'system', 'embedded', 'web', 'hybrid'
] as const;

export const EDITOR_TABS = [
  'data', 'style', 'preview', 'export'
] as const;

// ========================================
// UTILITY TYPES
// ========================================

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type SupportedScript = typeof SUPPORTED_SCRIPTS[number];
export type ThemeName = typeof THEME_NAMES[number];
export type PageSize = typeof PAGE_SIZES[number];
export type FontStrategy = typeof FONT_STRATEGIES[number];
export type EditorTab = typeof EDITOR_TABS[number];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ========================================
// ЭКСПОРТ ОСНОВНЫХ ТИПОВ
// ========================================

export {
  // Основные интерфейсы
  type EditableCSVData,
  type StyleOptions, 
  type PDFPreviewState,
  type LanguageAnalysis,
  type EditorCallbacks,
  type EditorActions,
  
  // Вспомогательные типы
  type CellReference,
  type CellRange,
  type Theme,
  type LanguageConfig,
  type FontSolution,
  
  // Типы для hooks
  type UseEditorReturn,
  type DataValidation,
  
  // Шаблоны и пресеты
  type StyleTemplate,
  type TemplateCategory,
  
  // Настройки
  type ExportOptions,
  type EditorPreferences
};