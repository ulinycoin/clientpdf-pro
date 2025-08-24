export interface WordToPDFOptions {
  preserveFormatting?: boolean;
  convertImages?: boolean;
  embedFonts?: boolean;
  pageMargins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface WordToPDFResult {
  pdfBlob: Blob;
  fileName: string;
  metadata: {
    pageCount: number;
    fileSize: number;
    processingTime: number;
  };
}

export interface WordProcessingProgress {
  step: 'parsing' | 'converting' | 'formatting' | 'finalizing';
  progress: number;
  message?: string;
}