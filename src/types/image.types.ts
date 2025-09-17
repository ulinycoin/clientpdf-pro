// Image conversion types for PDF to Image tool
export type ImageFormat = 'png' | 'jpeg';

export type ImageQuality = 'low' | 'medium' | 'high' | 'maximum';

export interface ImageConversionOptions {
  format: ImageFormat;
  quality: ImageQuality;
  pages: 'all' | 'specific' | 'range';
  pageNumbers?: number[];
  pageRange?: {
    start: number;
    end: number;
  };
  resolution?: number; // DPI, default 150
  backgroundColor?: string; // for JPEG format
}

export interface ConvertedImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  filename: string;
  size: number;
}

export interface ImageConversionResult {
  success: boolean;
  images: ConvertedImage[];
  totalPages: number;
  originalSize: number;
  convertedSize: number;
  error?: string;
  metadata?: {
    processingTime: number;
    format: ImageFormat;
    quality: ImageQuality;
    resolution: number;
  };
}

export interface ImageConversionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  status: 'preparing' | 'converting' | 'finalizing' | 'complete' | 'error';
  message?: string;
}

// Quality settings mapping
export const QUALITY_SETTINGS: Record<ImageQuality, { 
  jpegQuality: number; 
  resolution: number; 
  description: string 
}> = {
  low: { 
    jpegQuality: 0.3, 
    resolution: 72, 
    description: 'Smallest file size, basic quality' 
  },
  medium: { 
    jpegQuality: 0.7, 
    resolution: 150, 
    description: 'Balanced size and quality' 
  },
  high: { 
    jpegQuality: 0.9, 
    resolution: 300, 
    description: 'High quality, larger files' 
  },
  maximum: { 
    jpegQuality: 0.95, 
    resolution: 600, 
    description: 'Maximum quality, largest files' 
  }
};

// Format descriptions
export const FORMAT_DESCRIPTIONS: Record<ImageFormat, string> = {
  png: 'High quality with transparency support (larger files)',
  jpeg: 'Smaller file sizes, good for photos (no transparency)'
};
