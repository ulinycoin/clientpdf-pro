// Image extraction types for Extract Images from PDF tool
export interface ImageExtractionOptions {
  pages?: number[] | 'all';
  minWidth?: number;
  minHeight?: number;
  outputFormat?: 'original' | 'png' | 'jpeg';
  jpegQuality?: number; // 0.1 to 1.0 for JPEG compression
  includeVectorImages?: boolean;
  deduplicateImages?: boolean; // Remove duplicate images
}

export interface ExtractedImage {
  id: string;
  pageNumber: number;
  originalFormat: string;
  width: number;
  height: number;
  size: number; // in bytes
  blob: Blob;
  dataUrl: string; // for preview
  filename: string;
  isVector?: boolean; // true if vector-based image
  metadata?: {
    colorSpace?: string;
    compression?: string;
    bitsPerComponent?: number;
  };
}

export interface ImageExtractionResult {
  success: boolean;
  images: ExtractedImage[];
  totalImages: number;
  totalSize: number;
  duplicatesRemoved?: number;
  error?: string;
  metadata?: {
    processingTime: number;
    pagesProcessed: number;
    originalFileSize: number;
    extractedFileSize: number;
    options: ImageExtractionOptions;
  };
}

export interface ImageExtractionProgress {
  currentPage: number;
  totalPages: number;
  imagesFound: number;
  currentImage?: string;
  percentage: number;
  status: 'preparing' | 'extracting' | 'processing' | 'finalizing' | 'complete' | 'error';
  message?: string;
}

// Supported output formats
export type ImageOutputFormat = 'original' | 'png' | 'jpeg';

// Quality settings for image extraction
export interface ImageQualitySettings {
  jpegQuality: number;
  description: string;
}

export const IMAGE_QUALITY_PRESETS: Record<string, ImageQualitySettings> = {
  low: {
    jpegQuality: 0.3,
    description: 'Smallest file size, basic quality'
  },
  medium: {
    jpegQuality: 0.7,
    description: 'Balanced size and quality'
  },
  high: {
    jpegQuality: 0.9,
    description: 'High quality, larger files'
  },
  maximum: {
    jpegQuality: 0.95,
    description: 'Maximum quality, largest files'
  }
};

// Format descriptions for user interface
export const OUTPUT_FORMAT_DESCRIPTIONS: Record<ImageOutputFormat, string> = {
  original: 'Keep original format (JPEG, PNG, etc.)',
  png: 'Convert all to PNG (lossless, supports transparency)',
  jpeg: 'Convert all to JPEG (smaller files, no transparency)'
};

// Default extraction options
export const DEFAULT_EXTRACTION_OPTIONS: ImageExtractionOptions = {
  pages: 'all',
  minWidth: 32,
  minHeight: 32,
  outputFormat: 'original',
  jpegQuality: 0.85,
  includeVectorImages: true,
  deduplicateImages: true
};

// Image type detection based on PDF object
export interface PDFImageObject {
  name: string;
  width: number;
  height: number;
  kind: number;
  data?: Uint8Array;
  bitmap?: ImageBitmap;
}

// Internal processing types
export interface ImageExtractionState {
  isProcessing: boolean;
  progress: ImageExtractionProgress | null;
  result: ImageExtractionResult | null;
  selectedImages: string[]; // IDs of selected images
  previewImages: string[]; // Data URLs for preview
}