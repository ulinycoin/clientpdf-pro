/**
 * Enhanced types for the new interactive CSV to PDF editor
 * Extends existing types while maintaining compatibility
 */

import { CsvParseResult, CsvToPdfOptions } from '../services/converters/CsvToPdfConverter';

// 🆕 Language and Font Support
export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  script: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'devanagari' | 'mixed';
  direction: 'ltr' | 'rtl';
  supportedLanguages: string[];
}

export interface FontRecommendation {
  primary: string;
  fallbacks: string[];
  webSafe: string[];
  unicodeSupport: boolean;
  qualityRating: 'excellent' | 'good' | 'basic' | 'poor';
}

export interface MultiLanguageSupport {
  supportedLanguages: {
    'ru': 'Русский (Кириллица)';
    'lv': 'Latviešu (Латышский)';
    'lt': 'Lietuvių (Литовский)';
    'et': 'Eesti (Эстонский)';
    'pl': 'Polski (Польский)';
    'de': 'Deutsch (Немецкий)';
    'fr': 'Français (Французский)';
    'es': 'Español (Испанский)';
    'it': 'Italiano (Итальянский)';
    'zh': '中文 (Китайский)';
    'ja': '日本語 (Японский)';
    'ko': '한국어 (Корейский)';
    'ar': 'العربية (Арабский)';
    'hi': 'हिन्दी (Хинди)';
  };
  
  fontFamilies: {
    'latin': ['Inter', 'Roboto', 'Open Sans', 'Lato'];
    'cyrillic': ['Roboto', 'Open Sans', 'PT Sans', 'Fira Sans'];
    'baltic': ['Roboto', 'Open Sans', 'Source Sans Pro'];
    'cjk': ['Noto Sans CJK', 'Source Han Sans', 'Roboto'];
    'arabic': ['Noto Sans Arabic', 'Roboto Arabic'];
    'devanagari': ['Noto Sans Devanagari', 'Roboto Devanagari'];
  };
  
  autoDetection: {
    detectLanguageFromCSV: boolean;
    suggestOptimalFont: boolean;
    fallbackChain: string[];
  };
}

// 🎨 Enhanced PDF Styling Options
export interface EnhancedCsvToPdfOptions extends CsvToPdfOptions {
  // Visual styling
  theme: 'professional' | 'modern' | 'minimal' | 'colorful' | 'custom';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    headerText: string;
    alternateRowBg?: string;
  };
  
  // Typography
  fontConfig: {
    family: string;
    size: number;
    headerSize: number;
    lineHeight: number;
    letterSpacing: number;
  };
  
  // Layout and spacing
  layout: {
    cellPadding: number;
    rowHeight: number;
    columnSpacing: number;
    borderWidth: number;
    borderRadius: number;
  };
  
  // Branding
  branding?: {
    logo?: File | string;
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    logoSize: { width: number; height: number };
    companyName?: string;
    footer?: string;
  };
  
  // Language and localization
  language: string;
  textDirection: 'ltr' | 'rtl';
  preserveUnicode: boolean;
  fontEmbedding: boolean;
}

// 📊 Live Preview State
export interface LivePreviewState {
  isGenerating: boolean;
  lastGenerated: Date | null;
  pdfBlob: Blob | null;
  pdfPages: number;
  generationTime: number;
  error: string | null;
  warnings: string[];
}

// 🔄 Real-time Data Editing
export interface EditableCell {
  rowIndex: number;
  columnIndex: number;
  originalValue: any;
  editedValue: any;
  isEditing: boolean;
  hasChanges: boolean;
  validationError?: string;
}

export interface DataTableState {
  editableCells: Map<string, EditableCell>;
  selectedCells: Set<string>;
  columnOrder: string[];
  hiddenColumns: Set<string>;
  columnWidths: Map<string, number>;
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc';
  } | null;
  filterConfig: Map<string, string>;
}

// 🎭 Template System
export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'academic' | 'personal' | 'government';
  preview: string; // base64 image
  options: Partial<EnhancedCsvToPdfOptions>;
  tags: string[];
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateGallery {
  featured: PdfTemplate[];
  categories: Record<string, PdfTemplate[]>;
  userTemplates: PdfTemplate[];
  recentlyUsed: PdfTemplate[];
}

// 🧠 Smart Recommendations
export interface SmartRecommendation {
  type: 'font' | 'layout' | 'color' | 'template' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  action: {
    type: 'apply' | 'suggest' | 'configure';
    data: any;
  };
  reasoning: string[];
  impact: 'low' | 'medium' | 'high';
}

// 🎯 Performance Metrics
export interface PerformanceMetrics {
  parseTime: number;
  renderTime: number;
  memoryUsage: number;
  pdfSize: number;
  totalTime: number;
  optimizations: string[];
  warnings: string[];
}

// 🌍 Internationalization
export interface I18nConfig {
  currentLanguage: string;
  availableLanguages: string[];
  translations: Record<string, Record<string, string>>;
  dateFormats: Record<string, string>;
  numberFormats: Record<string, Intl.NumberFormatOptions>;
  rtlLanguages: string[];
}

// 📱 Responsive Layout
export interface ViewportConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  splitViewEnabled: boolean;
  previewPanelWidth: number;
}

// 🔧 Advanced Configuration
export interface AdvancedConfig {
  performance: {
    enableWebWorkers: boolean;
    chunkSize: number;
    maxMemoryUsage: number;
    enableCaching: boolean;
  };
  
  accessibility: {
    enableHighContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    enableScreenReader: boolean;
    keyboardNavigation: boolean;
  };
  
  debugging: {
    enableConsoleLogging: boolean;
    showPerformanceMetrics: boolean;
    enableErrorBoundaries: boolean;
  };
}

// 🎪 Main Enhanced Editor State
export interface EnhancedCSVEditorState {
  // Core data
  csvFile: File | null;
  parseResult: CsvParseResult | null;
  
  // UI state
  currentView: 'upload' | 'edit' | 'style' | 'preview' | 'export';
  isLoading: boolean;
  
  // Interactive editing
  dataTableState: DataTableState;
  
  // PDF configuration
  pdfOptions: EnhancedCsvToPdfOptions;
  
  // Live preview
  previewState: LivePreviewState;
  
  // Templates and themes
  selectedTemplate: PdfTemplate | null;
  availableTemplates: TemplateGallery;
  
  // Language and fonts
  languageDetection: LanguageDetectionResult | null;
  fontRecommendations: FontRecommendation[];
  
  // Smart features
  recommendations: SmartRecommendation[];
  
  // Performance and metrics
  metrics: PerformanceMetrics | null;
  
  // Configuration
  i18nConfig: I18nConfig;
  viewportConfig: ViewportConfig;
  advancedConfig: AdvancedConfig;
}

// 📤 Export Configuration
export interface ExportConfig {
  format: 'pdf' | 'multiple-pdf' | 'pdf-with-attachments';
  filename: string;
  includeMeta: boolean;
  embedFonts: boolean;
  optimize: boolean;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  passwordProtect?: {
    enabled: boolean;
    password: string;
    permissions: {
      print: boolean;
      copy: boolean;
      modify: boolean;
      annotate: boolean;
    };
  };
}

// 🎨 Theme Definitions
export interface ThemeDefinition {
  id: string;
  name: string;
  category: 'business' | 'creative' | 'academic' | 'minimal';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Utility types
export type CellIdentifier = `${number}-${number}`;
export type UpdateCellPayload = {
  rowIndex: number;
  columnIndex: number;
  value: any;
};
export type ColumnReorderPayload = {
  fromIndex: number;
  toIndex: number;
};

// Default configurations
export const DEFAULT_ENHANCED_OPTIONS: EnhancedCsvToPdfOptions = {
  // Inherited from base options
  orientation: 'landscape',
  pageSize: 'legal',
  fontSize: 8,
  tableStyle: 'grid',
  headerStyle: 'bold',
  fitToPage: true,
  includeRowNumbers: false,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 10,
  marginRight: 10,
  fontFamily: 'auto',
  
  // Enhanced options
  theme: 'professional',
  colorScheme: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937',
    headerBg: '#F3F4F6',
    headerText: '#374151',
    alternateRowBg: '#F9FAFB',
  },
  fontConfig: {
    family: 'Inter',
    size: 8,
    headerSize: 9,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  layout: {
    cellPadding: 8,
    rowHeight: 32,
    columnSpacing: 1,
    borderWidth: 1,
    borderRadius: 0,
  },
  language: 'auto',
  textDirection: 'ltr',
  preserveUnicode: true,
  fontEmbedding: true,
};
