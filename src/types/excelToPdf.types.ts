export interface ExcelCell {
  value: string | number | Date | null;
  type: 'string' | 'number' | 'date' | 'boolean' | 'formula';
  formatting?: CellFormatting;
}

export interface CellFormatting {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  border?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export interface ExcelColumn {
  width?: number;
  hidden?: boolean;
}

export interface ExcelRow {
  height?: number;
  hidden?: boolean;
}

export interface ExcelSheet {
  name: string;
  data: ExcelCell[][];
  columns?: ExcelColumn[];
  rows?: ExcelRow[];
  metadata?: SheetMetadata;
}

export interface SheetMetadata {
  totalColumns: number;
  totalRows: number;
  maxWidth: number;
  detectedLanguages: string[];
  hasWideTable: boolean;
}

export interface ExcelWorkbook {
  sheets: ExcelSheet[];
  metadata: WorkbookMetadata;
}

export interface WorkbookMetadata {
  fileName: string;
  fileSize: number;
  totalSheets: number;
  detectedLanguages: string[];
  requiresSpecialFont: boolean;
  estimatedPdfSize: number;
}

export interface ConversionOptions {
  selectedSheets: string[];
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  fontSize: number;
  fontFamily: string;
  includeSheetNames: boolean;
  handleWideTablesWith: 'scale' | 'break' | 'overflow';
  outputFormat: 'single-pdf' | 'separate-pdfs';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface FontSubset {
  name: string;
  subset: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'mixed';
  languages: string[];
  size: number;
  loaded: boolean;
}

export interface ConversionProgress {
  stage: 'parsing' | 'analyzing' | 'loading-fonts' | 'generating' | 'complete';
  progress: number;
  currentSheet?: string;
  message: string;
}

export interface ConversionResult {
  success: boolean;
  pdfFiles?: Array<{
    name: string;
    data: Uint8Array;
    sheetName?: string;
  }>;
  error?: string;
  warnings?: string[];
  metadata?: {
    totalPages: number;
    fileSize: number;
    processingTime: number;
  };
}

export interface LanguageDetectionResult {
  primaryLanguage: string;
  confidence: number;
  detectedLanguages: Array<{
    language: string;
    confidence: number;
    script: string;
  }>;
  requiredFontSubsets: string[];
}
