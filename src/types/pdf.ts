// PDF Processing Types for SPA

export interface PDFFileInfo {
  pages: number;
  originalSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface PDFProcessingResult<T = Blob> {
  success: boolean;
  data?: T;
  error?: ProcessingError;
  metadata?: {
    pageCount: number;
    originalSize: number;
    processedSize: number;
    processingTime: number;
    compressionRatio?: number; // Percentage reduction
    filesCreated?: number; // For split operations
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

// Protection Types
export interface ProtectionSettings {
  userPassword?: string;      // Password to open document
  ownerPassword?: string;     // Password to change permissions
  encryption: 'aes128' | 'aes256';
  permissions: {
    printing: 'none' | 'lowResolution' | 'highResolution';
    modifying: boolean;
    copying: boolean;
    annotating: boolean;
    fillingForms: boolean;
    contentAccessibility: boolean;
    documentAssembly: boolean;
  };
}

export interface PasswordStrength {
  score: number;              // 0-4 (weak-strong)
  feedback: string[];         // Improvement recommendations
  isValid: boolean;           // Minimum requirements met
}

export interface ProtectionProgress {
  stage: 'analyzing' | 'encrypting' | 'finalizing' | 'complete' | 'preparing';
  progress: number;           // 0-100
  message: string;
}

// Edit Text Types
export interface TextOccurrence {
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextReplaceOptions {
  backgroundColor: string;    // Hex color for background rectangle
  textColor: string;          // Hex color for new text
  fontSize: number;           // Font size in pixels
  dpi: number;                // DPI for canvas rendering (72, 150, 300)
}
