export interface OCROptions {
  language: string;
  preserveLayout: boolean;
  outputFormat: 'text' | 'pdf' | 'searchable-pdf' | 'docx' | 'rtf';
  imagePreprocessing: boolean;
}

export interface OCRProgress {
  status: 'recognizing text' | 'loading language' | 'initializing' | 'processing' | 'complete' | 'retrying';
  progress: number;
  currentPage?: number;
  totalPages?: number;
  message?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  blocks: OCRBlock[];
  pages: OCRPage[];
  outputFormat?: 'text' | 'pdf' | 'searchable-pdf' | 'docx' | 'rtf';
  originalOutputFormat?: 'text' | 'pdf' | 'searchable-pdf' | 'docx' | 'rtf';
  isEdited?: boolean;
  error?: string;
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  words: OCRWord[];
}

export interface OCRPage {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export interface OCRError {
  message: string;
  code: string;
  details?: any;
}

export interface OCRProcessingOptions {
  file: File;
  options: OCROptions;
  onProgress?: (progress: OCRProgress) => void;
  onError?: (error: OCRError) => void;
}

export interface ProcessedOCRResult {
  originalFile: File;
  result: OCRResult;
  processedBlob: Blob;
  downloadUrl: string;
  processingTime: number;
  mimeType?: string;
}

// === ADVANCED OCR TYPES ===

export interface ImagePreprocessingOptions {
  denoise: boolean;           // Шумоподавление
  deskew: boolean;            // Исправление наклона
  contrast: boolean;          // Улучшение контраста
  binarization: boolean;      // Бинаризация (черно-белое)
  removeBackground: boolean;  // Удаление фона
}

export interface ImageQualityAnalysis {
  resolution: number;        // DPI
  clarity: number;          // 0-100, четкость
  contrast: number;         // 0-100, контрастность
  skewAngle: number;        // Градусы наклона
  isScanned: boolean;       // Скан или фото
  hasNoise: boolean;        // Наличие шума
  recommendPreprocessing: boolean;
  suggestedOptions: ImagePreprocessingOptions;
}

export interface LanguageDetectionResult {
  primary: string;           // Основной язык (ISO code)
  secondary?: string[];      // Дополнительные языки
  confidence: number;        // 0-100
  script: string;           // 'latin', 'cyrillic', 'chinese', etc.
  mixedLanguages: boolean;  // Документ на нескольких языках
  recommendedTesseractLangs: string; // 'eng+rus+deu'
}

export interface DocumentStructure {
  hasColumns: boolean;       // Колонки
  hasTables: boolean;        // Таблицы
  hasImages: boolean;        // Изображения
  hasHandwriting: boolean;   // Рукописный текст
  layout: 'single' | 'double' | 'complex';
  textDensity: number;       // 0-100, плотность текста
  averageFontSize: number;   // Средний размер шрифта
}

export interface AdvancedOCROptions {
  languages: string[];           // ['eng', 'rus', 'deu']
  mode: 'fast' | 'balanced' | 'accurate';
  preserveLayout: boolean;       // Сохранять форматирование
  outputFormat: 'text' | 'markdown' | 'json' | 'hocr';
  preprocessImage: boolean;
  preprocessOptions?: ImagePreprocessingOptions;
  pageSegmentationMode?: number; // Tesseract PSM
}

export interface AdvancedOCRResult extends OCRResult {
  wordCount: number;
  processingTime: number;
  languages: string[];
  structure?: DocumentStructure;
  warnings: string[];
}
