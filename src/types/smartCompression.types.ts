// AI-powered Smart Compression Types
// Types for intelligent PDF compression with content analysis and optimization recommendations

export interface DocumentAnalysis {
  id: string;
  name: string;
  size: number;
  pages: number;
  created: Date;
  modified: Date;
  dimensions: { width: number; height: number };
  orientation: 'portrait' | 'landscape' | 'mixed';
  quality: 'high' | 'medium' | 'low';
  type: 'text' | 'scanned' | 'mixed' | 'presentation';
  language?: string;
  hasBookmarks: boolean;
  hasAnnotations: boolean;
  compression: 'none' | 'low' | 'medium' | 'high';
  estimatedTextDensity: 'low' | 'medium' | 'high';
}

export interface ContentAnalysis {
  textPercentage: number; // 0-100
  imagePercentage: number; // 0-100
  vectorPercentage: number; // 0-100
  qualityAssessment: 'high' | 'medium' | 'low';
  compressionPotential: number; // 0-100% potential size reduction
  currentCompression: 'none' | 'low' | 'medium' | 'high';
  hasEmbeddedFonts: boolean;
  hasMetadata: boolean;
  duplicateObjects: number; // estimated count of duplicate objects
  pageComplexity: 'simple' | 'moderate' | 'complex';
}

export interface CompressionRecommendations {
  compressionLevel: 'conservative' | 'balanced' | 'aggressive';
  expectedSizeReduction: number; // percentage 0-100
  qualityLossEstimate: number; // 0-100, 0 = no loss, 100 = significant loss
  processingTime: number; // estimated seconds
  strategy: string; // human-readable explanation of the strategy
  confidence: number; // 0-100
  reasoning: string; // explanation of why this approach was recommended
}

export interface OptimizationSettings {
  imageCompression: boolean;
  imageQuality: number; // 1-100, JPEG quality level
  downsampleImages: boolean;
  downsampleDPI: number; // target DPI for images
  fontSubsetting: boolean;
  removeMetadata: boolean;
  removeBookmarks: boolean;
  removeAnnotations: boolean;
  objectStreamCompression: boolean;
  removeUnusedObjects: boolean;
  compressStreams: boolean;
  linearizeForWeb: boolean;
}

export interface CompressionWarning {
  type: 'quality_loss' | 'compatibility_risk' | 'processing_time' | 'size_limit' | 'content_loss' | 'font_issues';
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedAreas: string[]; // which parts of document are affected
  suggestion: string;
  autoFix?: boolean;
  impact: 'low' | 'medium' | 'high'; // impact on final result
}

export interface ProcessingTimePrediction {
  estimated: number; // seconds
  range: { min: number; max: number };
  factors: {
    fileSize: number;
    imageCount: number;
    pageComplexity: number;
    compressionLevel: number;
    systemPerformance: number;
  };
  confidence: number; // 0-100
}

export interface SizePrediction {
  resultSize: number; // estimated bytes after compression
  sizeReduction: number; // percentage reduction
  comparison: {
    originalSize: number;
    estimatedSize: number;
    savings: number; // bytes saved
  };
  breakdown: {
    imageReduction: number; // bytes
    streamCompression: number; // bytes
    metadataRemoval: number; // bytes
    fontOptimization: number; // bytes
    objectCleanup: number; // bytes
  };
  confidence: number;
}

export interface QualityForecast {
  overall: 'excellent' | 'good' | 'acceptable' | 'degraded' | 'poor';
  visualImpact: number; // 0-100, how much visual quality is affected
  factors: {
    imageQuality: number; // 0-100
    fontRendering: number; // 0-100
    vectorGraphics: number; // 0-100
    layoutPreservation: number; // 0-100
  };
  risks: string[]; // potential quality risks
  score: number; // 0-100 overall quality score
}

export interface PerformanceImpact {
  memoryUsage: 'low' | 'medium' | 'high';
  cpuIntensive: boolean;
  browserLoad: number; // 0-100
  recommendedChunkSize?: number; // for large files
  processingStrategy: 'single-pass' | 'multi-pass' | 'chunked';
  batteryImpact: 'minimal' | 'moderate' | 'significant'; // for mobile devices
}

export interface CompressionPredictions {
  resultSize: SizePrediction;
  qualityForecast: QualityForecast;
  processingTime: ProcessingTimePrediction;
  performanceImpact: PerformanceImpact;
}

export interface SmartCompressionAnalysis {
  documents: DocumentAnalysis[];
  contentAnalysis: ContentAnalysis;
  recommendations: CompressionRecommendations;
  optimizations: OptimizationSettings;
  predictions: CompressionPredictions;
  warnings: CompressionWarning[];
  timestamp: Date;
  version: string;
}

// UI Component Props
export interface SmartCompressionRecommendationsProps {
  files: File[];
  analysis?: SmartCompressionAnalysis;
  onApplyRecommendations: (settings: OptimizationSettings) => void;
  onApplyStrategy: (strategy: CompressionRecommendations) => void;
  onCustomizeSettings: (settings: Partial<OptimizationSettings>) => void;
  isProcessing?: boolean;
  className?: string;
}

// Service Options
export interface SmartCompressionOptions {
  enableContentAnalysis: boolean;
  enableImageAnalysis: boolean;
  enableQualityPrediction: boolean;
  enablePerformanceOptimization: boolean;
  maxAnalysisTime: number; // milliseconds
  targetSizeReduction?: number; // percentage, guides recommendations
  prioritizeQuality: boolean; // vs prioritizing size reduction
  deviceType: 'desktop' | 'tablet' | 'mobile'; // affects processing strategy
}

// Advanced Analysis Types
export interface ImageAnalysis {
  count: number;
  totalSize: number; // bytes
  averageSize: number;
  formats: string[]; // JPEG, PNG, etc.
  averageDPI: number;
  compressionOpportunity: number; // 0-100%
  qualityDistribution: {
    high: number; // count
    medium: number;
    low: number;
  };
}

export interface FontAnalysis {
  embeddedFonts: string[];
  fontSizeTotal: number; // bytes
  subsetOpportunity: number; // 0-100%
  duplicateFonts: string[];
  unusedFonts: string[];
}

export interface MetadataAnalysis {
  hasTitle: boolean;
  hasAuthor: boolean;
  hasSubject: boolean;
  hasKeywords: boolean;
  hasCreationDate: boolean;
  customProperties: number;
  estimatedSize: number; // bytes
  removalSafety: 'safe' | 'caution' | 'risky';
}

export interface StructureAnalysis {
  objectCount: number;
  streamObjects: number;
  duplicateObjects: number;
  unusedObjects: number;
  crossReferenceSize: number; // bytes
  cleanupPotential: number; // 0-100%
}

export interface DetailedContentAnalysis extends ContentAnalysis {
  images: ImageAnalysis;
  fonts: FontAnalysis;
  metadata: MetadataAnalysis;
  structure: StructureAnalysis;
  pageAnalysis: PageAnalysis[];
}

export interface PageAnalysis {
  pageNumber: number;
  size: number; // bytes contribution
  complexity: 'simple' | 'moderate' | 'complex';
  hasImages: boolean;
  imageCount: number;
  hasVectors: boolean;
  textDensity: number; // 0-100
  compressionPotential: number; // 0-100
}

// Events
export interface SmartCompressionEvent {
  type: 'analysis_started' | 'analysis_completed' | 'compression_started' | 'compression_progress' | 'compression_completed';
  data: any;
  timestamp: Date;
  progress?: number; // 0-100 for progress events
}

export type SmartCompressionEventHandler = (event: SmartCompressionEvent) => void;

// Result Types
export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // 0-1, where 0.5 means 50% size reduction
  processingTime: number; // seconds
  qualityScore: number; // 0-100
  warnings: CompressionWarning[];
  appliedOptimizations: string[];
  settings: OptimizationSettings;
}

// Preset Types
export interface CompressionPreset {
  name: string;
  description: string;
  settings: OptimizationSettings;
  targetSizeReduction: number;
  qualityImpact: 'minimal' | 'low' | 'medium' | 'high';
  useCase: string; // "web", "print", "archive", "email"
}

export const DEFAULT_COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    name: 'web-optimized',
    description: 'Optimized for web viewing with fast loading',
    settings: {
      imageCompression: true,
      imageQuality: 85,
      downsampleImages: true,
      downsampleDPI: 150,
      fontSubsetting: true,
      removeMetadata: true,
      removeBookmarks: false,
      removeAnnotations: false,
      objectStreamCompression: true,
      removeUnusedObjects: true,
      compressStreams: true,
      linearizeForWeb: true
    },
    targetSizeReduction: 40,
    qualityImpact: 'low',
    useCase: 'web'
  },
  {
    name: 'print-quality',
    description: 'Maintains high quality for printing',
    settings: {
      imageCompression: true,
      imageQuality: 95,
      downsampleImages: false,
      downsampleDPI: 300,
      fontSubsetting: true,
      removeMetadata: false,
      removeBookmarks: false,
      removeAnnotations: false,
      objectStreamCompression: true,
      removeUnusedObjects: true,
      compressStreams: true,
      linearizeForWeb: false
    },
    targetSizeReduction: 20,
    qualityImpact: 'minimal',
    useCase: 'print'
  },
  {
    name: 'maximum-compression',
    description: 'Aggressive compression for smallest file size',
    settings: {
      imageCompression: true,
      imageQuality: 70,
      downsampleImages: true,
      downsampleDPI: 120,
      fontSubsetting: true,
      removeMetadata: true,
      removeBookmarks: true,
      removeAnnotations: true,
      objectStreamCompression: true,
      removeUnusedObjects: true,
      compressStreams: true,
      linearizeForWeb: true
    },
    targetSizeReduction: 70,
    qualityImpact: 'high',
    useCase: 'archive'
  }
];