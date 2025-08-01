export interface OCROptions {
  language: string;
  preserveLayout: boolean;
  outputFormat: 'text' | 'pdf' | 'searchable-pdf';
  imagePreprocessing: boolean;
}

export interface OCRProgress {
  status: 'recognizing text' | 'loading language' | 'initializing' | 'processing' | 'complete';
  progress: number;
  currentPage?: number;
  totalPages?: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  blocks: OCRBlock[];
  pages: OCRPage[];
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
}
