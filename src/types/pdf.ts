// PDF Processing Types for SPA

export interface CompressionAnalysis {
  isImageHeavy: boolean;
  recommendedQuality: 'low' | 'medium' | 'high';
  savingPotential: 'high' | 'medium' | 'low';
  insights: Array<{ key: string; params?: Record<string, unknown> }>;
}

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
    imagesExtracted?: number; // For image extraction
  };
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: unknown;
}

export interface MergeOptions {
  order?: number[];
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

// Defining PDFTextItem manually to avoid dependency on specific pdfjs-dist internal paths
export interface PDFTextItem {
  str: string;
  dir?: string;
  width?: number;
  height?: number;
  transform?: number[]; // [scaleX, skewY, skewX, scaleY, translateX, translateY]
  fontName?: string;
  hasEOL?: boolean;
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

export interface TextOccurrence {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  pageNumber: number;
  mode: 'replace' | 'cover'; // 'replace' = replace with text, 'cover' = just paint over
  textAlign?: 'left' | 'center' | 'right';
  originalX?: number;
  originalY?: number;
  originalWidth?: number;
  originalHeight?: number;
}

export interface ExtractedImage {
  id: string;
  blob?: Blob; // Optional if we have data
  data?: Uint8Array; // Raw data
  filename: string;
  width: number;
  height: number;
  pageNumber: number;
  format: 'jpg' | 'png';
  extension: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
}

export interface VectorEditTextOptions {
  selections: TextOccurrence[];
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: 'Arial' | 'Helvetica' | 'Times New Roman' | 'Courier New' | 'Georgia' | 'Verdana';
  isBold: boolean;
  isItalic: boolean;
  textOffsetX: number;
  textOffsetY: number;
  canvasScale: number; // To properly scale coordinates back
}

export interface TextReplaceOptions {
  backgroundColor: string;    // Hex color for background rectangle
  textColor: string;          // Hex color for new text
  fontSize: number;           // Font size in pixels
  dpi: number;                // DPI for canvas rendering (72, 150, 300)
}
