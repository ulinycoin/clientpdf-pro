// SVG conversion types for PDF to SVG tool
export type SvgFormat = 'svg';

export type SvgQuality = 'low' | 'medium' | 'high' | 'maximum';

export type SvgConversionMethod = 'canvas' | 'vector';

export interface SvgConversionOptions {
  format: SvgFormat;
  quality: SvgQuality;
  method: SvgConversionMethod;
  pages: 'all' | 'specific' | 'range';
  pageNumbers?: number[];
  pageRange?: {
    start: number;
    end: number;
  };
  resolution?: number; // DPI, default 150
  includeText?: boolean; // Include text elements
  includeImages?: boolean; // Include embedded images
  backgroundColor?: string; // Background color
  scale?: number; // Scale factor, default 1.0
}

export interface ConvertedSvg {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  svgContent: string; // Raw SVG content for preview
  filename: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface SvgConversionResult {
  success: boolean;
  svgs: ConvertedSvg[];
  totalPages: number;
  originalSize: number;
  convertedSize: number;
  error?: string;
  metadata?: {
    processingTime: number;
    format: SvgFormat;
    quality: SvgQuality;
    method: SvgConversionMethod;
    resolution: number;
    scale: number;
  };
}

export interface SvgConversionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  status: 'preparing' | 'converting' | 'finalizing' | 'complete' | 'error';
  message?: string;
}

// Quality settings mapping for SVG conversion
export const SVG_QUALITY_SETTINGS: Record<SvgQuality, { 
  resolution: number; 
  scale: number;
  description: string 
}> = {
  low: { 
    resolution: 72, 
    scale: 1.0,
    description: 'Basic quality, smaller files' 
  },
  medium: { 
    resolution: 150, 
    scale: 1.5,
    description: 'Balanced quality and size' 
  },
  high: { 
    resolution: 300, 
    scale: 2.0,
    description: 'High quality, detailed vectors' 
  },
  maximum: { 
    resolution: 600, 
    scale: 3.0,
    description: 'Maximum quality, largest files' 
  }
};

// Conversion method descriptions
export const SVG_METHOD_DESCRIPTIONS: Record<SvgConversionMethod, string> = {
  canvas: 'Canvas-based conversion - fast but rasterized content',
  vector: 'Vector extraction - slower but true scalable vectors (future feature)'
};

// Format descriptions
export const SVG_FORMAT_DESCRIPTIONS: Record<SvgFormat, string> = {
  svg: 'Scalable Vector Graphics - resolution independent, ideal for graphics'
};