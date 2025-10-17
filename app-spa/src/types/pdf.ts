// PDF Processing Types for SPA

export interface PDFFileInfo {
  pages: number;
  originalSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface PDFProcessingResult {
  success: boolean;
  data?: Blob;
  error?: ProcessingError;
  metadata?: {
    pageCount: number;
    originalSize: number;
    processedSize: number;
    processingTime: number;
  };
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: string;
}

export interface MergeOptions {
  order?: number[];
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export type ProgressCallback = (progress: number, message: string) => void;

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  info?: PDFFileInfo;
  error?: string;
}
