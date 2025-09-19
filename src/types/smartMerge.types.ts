// AI-powered Smart Merge Types
// Types for intelligent PDF merge with document analysis and recommendations

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

export interface CompatibilityAnalysis {
  pageSizeConsistency: 'uniform' | 'similar' | 'mixed';
  orientationMismatch: boolean;
  qualityVariance: 'low' | 'medium' | 'high';
  formatConsistency: 'identical' | 'compatible' | 'problematic';
  sizeVariancePercentage: number;
}

export interface ContentAnalysis {
  documentTypes: string[];
  likelySequence: number[];
  duplicateContent: boolean;
  relatedDocuments: boolean;
  confidenceScore: number;
}

export interface MergeWarning {
  type: 'size_mismatch' | 'quality_variance' | 'orientation_mismatch' | 'content_overlap' | 'compatibility';
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedFiles: string[];
  suggestion: string;
  autoFix?: boolean;
}

export interface OrderRecommendation {
  fileIds: string[];
  reasoning: string;
  confidence: number; // 0-100
  algorithm: 'chronological' | 'alphabetical' | 'size' | 'content-based' | 'user-pattern';
  score: number; // Navigation quality score
}

export interface MergeSettings {
  preserveBookmarks: boolean;
  bookmarkStrategy: 'merge' | 'separate' | 'rename';
  handleAnnotations: 'preserve' | 'merge' | 'remove';
  pageNumbering: 'continuous' | 'restart' | 'none';
  qualityOptimization: 'preserve-best' | 'balance' | 'compress';
}

export interface SuggestedMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  reasoning: string;
  confidence: number;
}

export interface MergeRecommendations {
  suggestedOrder: OrderRecommendation;
  mergeSettings: MergeSettings;
  warnings: MergeWarning[];
  suggestedMetadata: SuggestedMetadata;
  alternativeOrders?: OrderRecommendation[];
}

export interface ProcessingTimePrediction {
  estimated: number; // seconds
  range: { min: number; max: number };
  factors: {
    fileCount: number;
    totalSize: number;
    complexity: number;
    systemPerformance: number;
  };
  confidence: number; // 0-100
}

export interface SizePrediction {
  estimated: number; // bytes
  compression: number; // percentage
  comparison: {
    totalInputSize: number;
    estimatedOutput: number;
    savings: number;
  };
  confidence: number;
}

export interface QualityForecast {
  overall: 'excellent' | 'good' | 'acceptable' | 'poor';
  factors: {
    pageSizeUniformity: number;
    compressionLoss: number;
    contentPreservation: number;
  };
  potentialIssues: string[];
  score: number; // 0-100
}

export interface PerformanceImpact {
  memoryUsage: 'low' | 'medium' | 'high';
  browserLoad: number; // 0-100
  recommendedBatchSize?: number;
  processingStrategy: 'sequential' | 'parallel' | 'hybrid';
}

export interface MergePrediction {
  processingTime: ProcessingTimePrediction;
  resultSize: SizePrediction;
  qualityForecast: QualityForecast;
  performanceImpact: PerformanceImpact;
}

export interface SmartMergeAnalysis {
  documents: DocumentAnalysis[];
  compatibility: CompatibilityAnalysis;
  content: ContentAnalysis;
  recommendations: MergeRecommendations;
  predictions: MergePrediction;
  timestamp: Date;
  version: string;
}

// UI Component Props
export interface SmartMergeRecommendationsProps {
  files: File[];
  analysis?: SmartMergeAnalysis;
  onApplyOrder: (order: string[]) => void;
  onApplyMetadata: (metadata: SuggestedMetadata) => void;
  onApplySettings: (settings: MergeSettings) => void;
  isProcessing?: boolean;
  className?: string;
}

// Service Options
export interface SmartMergeOptions {
  enableContentAnalysis: boolean;
  enableLanguageDetection: boolean;
  enableQualityAnalysis: boolean;
  enablePerformanceOptimization: boolean;
  maxAnalysisTime: number; // milliseconds
}

// Events
export interface SmartMergeEvent {
  type: 'analysis_started' | 'analysis_completed' | 'recommendation_applied' | 'prediction_updated';
  data: any;
  timestamp: Date;
}

export type SmartMergeEventHandler = (event: SmartMergeEvent) => void;