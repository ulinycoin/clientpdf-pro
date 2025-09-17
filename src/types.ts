// Core PDF Types
export interface PDFFile extends File {
  readonly type: 'application/pdf';
}

export interface PDFProcessingResult<T = Blob> {
  success: boolean;
  data?: T;
  error?: PDFError;
  metadata?: OperationMetadata;
}

export interface PDFError {
  message: string;
  code: string;
  cause?: unknown;
}

export interface OperationMetadata {
  originalSize?: number;
  processedSize?: number;
  processingTime?: number;
  pageCount?: number;
  [key: string]: unknown;
}

// Progress Callback
export type ProgressCallback = (progress: number, message?: string) => void;

// Merge Tool Types
export interface MergeToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
  className?: string;
}

export interface MergeOptions {
  order?: number[];
  bookmarks?: boolean;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    [key: string]: unknown;
  };
}

// Compression Tool Types
export interface CompressionToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
  className?: string;
}

export interface CompressionOptions {
  quality: number; // 0.1 to 1.0
  imageCompression?: boolean;
  removeMetadata?: boolean;
  optimizeForWeb?: boolean;
}

// Hook Types
export interface UseCompressionResult {
  compress: (file: File, options: CompressionOptions) => Promise<PDFProcessingResult>;
  isCompressing: boolean;
  progress: number;
  error: string | null;
}

// Re-export component types from main types file for backwards compatibility
export * from './types/index';
export * from './types/wordToPdf.types';
