import { pdfService } from './pdfService';
import { detectLanguageAdvanced } from '../utils/languageDetector';
import { getTranslations } from '../locales/index';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../types/i18n';
import {
  DocumentAnalysis,
  ContentAnalysis,
  CompressionRecommendations,
  CompressionPredictions,
  SmartCompressionAnalysis,
  SmartCompressionOptions,
  CompressionWarning,
  ProcessingTimePrediction,
  SizePrediction,
  QualityForecast,
  PerformanceImpact,
  OptimizationSettings,
  ImageAnalysis,
  FontAnalysis,
  MetadataAnalysis,
  StructureAnalysis,
  DetailedContentAnalysis,
  PageAnalysis,
  DEFAULT_COMPRESSION_PRESETS
} from '../types/smartCompression.types';

/**
 * AI-powered Smart Compression Service
 * Provides intelligent document analysis, recommendations, and predictions for PDF compression
 */
export class SmartCompressionService {
  private static instance: SmartCompressionService;
  private version = '1.0.0';
  private currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

  /**
   * Set the current language for translations
   */
  setLanguage(language: SupportedLanguage): void {
    console.log('🌍 SmartCompressionService language changed from', this.currentLanguage, 'to', language);
    this.currentLanguage = language;
  }

  /**
   * Get translation function for current language
   */
  private t(key: string, params?: Record<string, any>): string {
    const translations = getTranslations(this.currentLanguage);
    const value = this.getNestedValue(translations, key);
    if (value === undefined) {
      console.warn(`Translation missing for key: "${key}" in language: "${this.currentLanguage}"`);
      return key;
    }
    const result = this.interpolate(value, params);

    // Debug logging for problematic translations
    if (key.includes('recommendation') || key.includes('strategy') || key.includes('warning')) {
      console.log(`🔤 Translation [${this.currentLanguage}] "${key}": "${result}"`);
    }

    return result;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Interpolate parameters in translation string
   */
  private interpolate(template: string, params?: Record<string, any>): string {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  static getInstance(): SmartCompressionService {
    if (!this.instance) {
      this.instance = new SmartCompressionService();
    }
    return this.instance;
  }

  /**
   * Main entry point: Analyze files and generate smart compression recommendations
   */
  async analyzeForCompression(
    files: File[],
    options: SmartCompressionOptions = this.getDefaultOptions()
  ): Promise<SmartCompressionAnalysis> {
    console.log(this.t('tools.smartCompression.analysis.startMessage', { count: files.length }));
    const startTime = Date.now();

    try {
      // 1. Analyze individual documents
      const documents = await this.analyzeDocuments(files, options);

      // 2. Perform detailed content analysis
      const contentAnalysis = await this.analyzeContent(documents, options);

      // 3. Generate intelligent recommendations
      const recommendations = this.generateRecommendations(documents, contentAnalysis, options);

      // 4. Generate optimization settings
      const optimizations = this.generateOptimalSettings(documents, contentAnalysis, recommendations);

      // 5. Generate predictions
      const predictions = this.generatePredictions(documents, contentAnalysis, optimizations);

      // 6. Identify warnings
      const warnings = this.identifyWarnings(documents, contentAnalysis, optimizations);

      const analysis: SmartCompressionAnalysis = {
        documents,
        contentAnalysis,
        recommendations,
        optimizations,
        predictions,
        warnings,
        timestamp: new Date(),
        version: this.version
      };

      const analysisTime = Date.now() - startTime;
      console.log(this.t('tools.smartCompression.analysis.completedMessage', { time: analysisTime }));

      return analysis;

    } catch (error) {
      console.error(this.t('tools.smartCompression.analysis.failedMessage'), error);
      throw new Error(this.t('tools.smartCompression.analysis.errorPrefix') + ' ' + (error instanceof Error ? error.message : this.t('tools.smartCompression.errors.unknownError')));
    }
  }

  /**
   * Analyze individual PDF documents for compression potential
   */
  private async analyzeDocuments(
    files: File[],
    options: SmartCompressionOptions
  ): Promise<DocumentAnalysis[]> {
    const analyses: DocumentAnalysis[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(this.t('tools.smartCompression.documentAnalysis.analyzing', { current: i + 1, total: files.length, name: file.name }));

      try {
        // Get basic PDF info using existing service
        const pdfInfo = await pdfService.getPDFInfo(file);

        // Analyze file characteristics
        const analysis: DocumentAnalysis = {
          id: `doc_${i}_${Date.now()}`,
          name: file.name,
          size: file.size,
          pages: pdfInfo.pages,
          created: new Date(file.lastModified),
          modified: new Date(file.lastModified),
          dimensions: pdfInfo.dimensions,
          orientation: this.determineOrientation(pdfInfo.dimensions),
          quality: this.estimateQuality(file, pdfInfo),
          type: this.determineDocumentType(file, pdfInfo),
          language: options.enableContentAnalysis ?
            this.detectLanguage(file.name) : undefined,
          hasBookmarks: false, // TODO: Implement bookmark detection
          hasAnnotations: false, // TODO: Implement annotation detection
          compression: this.estimateCurrentCompression(file, pdfInfo),
          estimatedTextDensity: this.estimateTextDensity(file, pdfInfo)
        };

        analyses.push(analysis);

      } catch (error) {
        console.warn(this.t('tools.smartCompression.documentAnalysis.analyzingFailed', { name: file.name }), error);

        // Create fallback analysis
        analyses.push({
          id: `doc_${i}_${Date.now()}_fallback`,
          name: file.name,
          size: file.size,
          pages: 1,
          created: new Date(file.lastModified),
          modified: new Date(file.lastModified),
          dimensions: { width: 595, height: 842 }, // A4 default
          orientation: 'portrait',
          quality: 'medium',
          type: 'mixed',
          hasBookmarks: false,
          hasAnnotations: false,
          compression: 'medium',
          estimatedTextDensity: 'medium'
        });
      }
    }

    return analyses;
  }

  /**
   * Perform detailed content analysis for compression optimization
   */
  private async analyzeContent(
    documents: DocumentAnalysis[],
    options: SmartCompressionOptions
  ): Promise<ContentAnalysis> {
    // For now, provide smart estimation based on document characteristics
    // TODO: Implement deeper PDF structure analysis

    const doc = documents[0]; // Focus on first document for single file compression

    // Estimate content distribution based on document type and characteristics
    let textPercentage = 50;
    let imagePercentage = 30;
    let vectorPercentage = 20;

    if (doc.type === 'text') {
      textPercentage = 80;
      imagePercentage = 10;
      vectorPercentage = 10;
    } else if (doc.type === 'scanned') {
      textPercentage = 5;
      imagePercentage = 90;
      vectorPercentage = 5;
    } else if (doc.type === 'presentation') {
      textPercentage = 30;
      imagePercentage = 50;
      vectorPercentage = 20;
    }

    // Estimate quality based on file size per page
    const sizePerPage = doc.size / Math.max(doc.pages, 1);
    let qualityAssessment: 'high' | 'medium' | 'low' = 'medium';

    if (sizePerPage > 1000000) qualityAssessment = 'high';   // >1MB per page
    else if (sizePerPage < 200000) qualityAssessment = 'low'; // <200KB per page

    // Calculate compression potential based on current compression and content type
    let compressionPotential = 30; // Base potential

    if (doc.compression === 'none') compressionPotential += 40;
    else if (doc.compression === 'low') compressionPotential += 25;
    else if (doc.compression === 'medium') compressionPotential += 15;
    else compressionPotential += 5;

    // Adjust based on content type
    if (doc.type === 'scanned') compressionPotential += 20; // Images compress well
    else if (doc.type === 'text') compressionPotential += 10; // Text has some potential

    compressionPotential = Math.min(80, compressionPotential); // Cap at 80%

    return {
      textPercentage,
      imagePercentage,
      vectorPercentage,
      qualityAssessment,
      compressionPotential,
      currentCompression: doc.compression,
      hasEmbeddedFonts: doc.type !== 'scanned', // Estimate based on type
      hasMetadata: true, // Assume PDFs have metadata
      duplicateObjects: Math.floor(doc.pages * 0.1), // Estimate based on pages
      pageComplexity: this.determinePageComplexity(doc)
    };
  }

  /**
   * Generate intelligent compression recommendations
   */
  private generateRecommendations(
    documents: DocumentAnalysis[],
    contentAnalysis: ContentAnalysis,
    options: SmartCompressionOptions
  ): CompressionRecommendations {
    const doc = documents[0]; // Focus on primary document

    // Determine optimal compression level based on analysis
    let compressionLevel: 'conservative' | 'balanced' | 'aggressive';
    let expectedSizeReduction: number;
    let qualityLossEstimate: number;
    let strategy: string;
    let reasoning: string;

    if (options.prioritizeQuality) {
      // Quality-first approach
      if (contentAnalysis.qualityAssessment === 'high') {
        compressionLevel = 'conservative';
        expectedSizeReduction = Math.min(30, contentAnalysis.compressionPotential * 0.5);
        qualityLossEstimate = 5;
        strategy = this.t('tools.smartCompression.recommendations.strategies.conservative');
        reasoning = this.t('tools.smartCompression.recommendations.reasoning.qualityFirst');
      } else {
        compressionLevel = 'balanced';
        expectedSizeReduction = Math.min(50, contentAnalysis.compressionPotential * 0.7);
        qualityLossEstimate = 15;
        strategy = this.t('tools.smartCompression.recommendations.strategies.balanced');
        reasoning = this.t('tools.smartCompression.recommendations.reasoning.balanced');
      }
    } else {
      // Size-first approach
      if (contentAnalysis.compressionPotential > 50) {
        compressionLevel = 'aggressive';
        expectedSizeReduction = Math.min(70, contentAnalysis.compressionPotential * 0.9);
        qualityLossEstimate = 25;
        strategy = this.t('tools.smartCompression.recommendations.strategies.aggressive');
        reasoning = this.t('tools.smartCompression.recommendations.reasoning.sizeFirst');
      } else {
        compressionLevel = 'balanced';
        expectedSizeReduction = Math.min(40, contentAnalysis.compressionPotential * 0.7);
        qualityLossEstimate = 15;
        strategy = this.t('tools.smartCompression.recommendations.strategies.balanced');
        reasoning = this.t('tools.smartCompression.recommendations.reasoning.balanced');
      }
    }

    // Estimate processing time based on file size and complexity
    const processingTime = this.estimateProcessingTime(doc, compressionLevel);

    // Calculate confidence based on analysis quality
    const confidence = this.calculateRecommendationConfidence(doc, contentAnalysis);

    return {
      compressionLevel,
      expectedSizeReduction: Math.round(expectedSizeReduction),
      qualityLossEstimate: Math.round(qualityLossEstimate),
      processingTime: Math.round(processingTime),
      strategy,
      confidence: Math.round(confidence),
      reasoning
    };
  }

  /**
   * Generate optimal compression settings
   */
  private generateOptimalSettings(
    documents: DocumentAnalysis[],
    contentAnalysis: ContentAnalysis,
    recommendations: CompressionRecommendations
  ): OptimizationSettings {
    const doc = documents[0];
    const isAggressive = recommendations.compressionLevel === 'aggressive';
    const isConservative = recommendations.compressionLevel === 'conservative';

    return {
      imageCompression: contentAnalysis.imagePercentage > 20,
      imageQuality: isConservative ? 90 : isAggressive ? 70 : 85,
      downsampleImages: contentAnalysis.imagePercentage > 30 && !isConservative,
      downsampleDPI: isAggressive ? 150 : 200,
      fontSubsetting: contentAnalysis.hasEmbeddedFonts && !isConservative,
      removeMetadata: isAggressive || (doc.type === 'scanned'),
      removeBookmarks: isAggressive && !doc.hasBookmarks,
      removeAnnotations: isAggressive && !doc.hasAnnotations,
      objectStreamCompression: true, // Generally safe
      removeUnusedObjects: true, // Generally safe
      compressStreams: true, // Generally safe
      linearizeForWeb: contentAnalysis.pageComplexity !== 'complex'
    };
  }

  /**
   * Generate predictions about compression outcome
   */
  private generatePredictions(
    documents: DocumentAnalysis[],
    contentAnalysis: ContentAnalysis,
    optimizations: OptimizationSettings
  ): CompressionPredictions {
    const doc = documents[0];

    const processingTime = this.predictProcessingTime(doc, optimizations);
    const resultSize = this.predictResultSize(doc, contentAnalysis, optimizations);
    const qualityForecast = this.predictQuality(doc, contentAnalysis, optimizations);
    const performanceImpact = this.predictPerformanceImpact(doc, optimizations);

    return {
      processingTime,
      resultSize,
      qualityForecast,
      performanceImpact
    };
  }

  /**
   * Identify potential warnings and issues
   */
  private identifyWarnings(
    documents: DocumentAnalysis[],
    contentAnalysis: ContentAnalysis,
    optimizations: OptimizationSettings
  ): CompressionWarning[] {
    const warnings: CompressionWarning[] = [];
    const doc = documents[0];

    // Quality loss warning
    if (optimizations.imageQuality < 80 && contentAnalysis.imagePercentage > 50) {
      warnings.push({
        type: 'quality_loss',
        severity: 'warning',
        message: this.t('tools.smartCompression.warnings.qualityLoss.title'),
        affectedAreas: ['images'],
        suggestion: this.t('tools.smartCompression.warnings.qualityLoss.suggestion'),
        impact: 'medium',
        autoFix: false
      });
    }

    // Large file processing warning
    if (doc.size > 50 * 1024 * 1024) { // 50MB
      warnings.push({
        type: 'processing_time',
        severity: 'info',
        message: this.t('tools.smartCompression.warnings.largeFile.title'),
        affectedAreas: ['processing'],
        suggestion: this.t('tools.smartCompression.warnings.largeFile.suggestion'),
        impact: 'low',
        autoFix: false
      });
    }

    // Font issues warning
    if (optimizations.fontSubsetting && contentAnalysis.hasEmbeddedFonts) {
      warnings.push({
        type: 'font_issues',
        severity: 'info',
        message: this.t('tools.smartCompression.warnings.fonts.title'),
        affectedAreas: ['fonts'],
        suggestion: this.t('tools.smartCompression.warnings.fonts.suggestion'),
        impact: 'low',
        autoFix: false
      });
    }

    // Metadata removal warning
    if (optimizations.removeMetadata) {
      warnings.push({
        type: 'content_loss',
        severity: 'info',
        message: this.t('tools.smartCompression.warnings.metadata.title'),
        affectedAreas: ['metadata'],
        suggestion: this.t('tools.smartCompression.warnings.metadata.suggestion'),
        impact: 'low',
        autoFix: true
      });
    }

    return warnings;
  }

  // Helper methods for document analysis
  private determineOrientation(dimensions: { width: number; height: number }): 'portrait' | 'landscape' | 'mixed' {
    const { width, height } = dimensions;
    if (Math.abs(width - height) < 10) return 'mixed'; // Square-ish
    return width > height ? 'landscape' : 'portrait';
  }

  private estimateQuality(file: File, pdfInfo: any): 'high' | 'medium' | 'low' {
    // Heuristic based on file size per page
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);

    if (sizePerPage > 1000000) return 'high';   // >1MB per page
    if (sizePerPage > 300000) return 'medium';  // >300KB per page
    return 'low';
  }

  private determineDocumentType(file: File, pdfInfo: any): 'text' | 'scanned' | 'mixed' | 'presentation' {
    const filename = file.name.toLowerCase();

    // Check filename patterns
    if (filename.includes('scan') || filename.includes('scanned')) return 'scanned';
    if (filename.includes('presentation') || filename.includes('slide')) return 'presentation';

    // Use size heuristics
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);
    if (sizePerPage > 2000000) return 'scanned'; // Very large per page = likely scanned
    if (sizePerPage < 100000) return 'text';     // Small per page = likely text

    return 'mixed';
  }

  private detectLanguage(filename: string): string {
    try {
      const result = detectLanguageAdvanced(filename);
      return result.language;
    } catch {
      return 'eng'; // Default to English
    }
  }

  private estimateCurrentCompression(file: File, pdfInfo: any): 'none' | 'low' | 'medium' | 'high' {
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);

    if (sizePerPage > 2000000) return 'none';   // Very large = no compression
    if (sizePerPage > 800000) return 'low';     // Large = low compression
    if (sizePerPage > 200000) return 'medium';  // Medium size = medium compression
    return 'high';                              // Small = high compression
  }

  private estimateTextDensity(file: File, pdfInfo: any): 'low' | 'medium' | 'high' {
    const type = this.determineDocumentType(file, pdfInfo);

    if (type === 'scanned') return 'low';
    if (type === 'text') return 'high';
    return 'medium';
  }

  private determinePageComplexity(doc: DocumentAnalysis): 'simple' | 'moderate' | 'complex' {
    const sizePerPage = doc.size / Math.max(doc.pages, 1);

    if (doc.type === 'text' && sizePerPage < 100000) return 'simple';
    if (doc.type === 'scanned' || sizePerPage > 1000000) return 'complex';
    return 'moderate';
  }

  private estimateProcessingTime(doc: DocumentAnalysis, level: string): number {
    // Base time calculation
    const baseTime = 2; // 2 seconds base
    const sizeFactor = (doc.size / (1024 * 1024)) * 0.15; // 0.15s per MB
    const pageFactor = doc.pages * 0.1; // 0.1s per page

    // Complexity multiplier
    let complexityMultiplier = 1;
    if (level === 'aggressive') complexityMultiplier = 1.5;
    else if (level === 'conservative') complexityMultiplier = 0.8;

    return Math.max(1, (baseTime + sizeFactor + pageFactor) * complexityMultiplier);
  }

  private calculateRecommendationConfidence(doc: DocumentAnalysis, contentAnalysis: ContentAnalysis): number {
    let confidence = 70; // Base confidence

    // Higher confidence for clear document types
    if (doc.type === 'text' || doc.type === 'scanned') confidence += 15;

    // Higher confidence for high compression potential
    if (contentAnalysis.compressionPotential > 50) confidence += 10;

    // Higher confidence for good quality assessment
    if (contentAnalysis.qualityAssessment !== 'low') confidence += 5;

    return Math.min(95, confidence);
  }

  // Prediction helper methods
  private predictProcessingTime(doc: DocumentAnalysis, optimizations: OptimizationSettings): ProcessingTimePrediction {
    const totalPages = doc.pages;
    const totalSize = doc.size;

    // Base time + various processing factors
    const baseTime = 1.5; // 1.5 seconds base
    const sizeFactor = (totalSize / (1024 * 1024)) * 0.2; // 0.2s per MB
    const pageFactor = totalPages * 0.05; // 0.05s per page

    // Additional time for intensive operations
    let intensiveOperations = 0;
    if (optimizations.imageCompression) intensiveOperations += 1;
    if (optimizations.downsampleImages) intensiveOperations += 0.5;
    if (optimizations.fontSubsetting) intensiveOperations += 0.5;

    const estimated = Math.max(1, baseTime + sizeFactor + pageFactor + intensiveOperations);

    return {
      estimated,
      range: {
        min: estimated * 0.8,
        max: estimated * 1.4
      },
      factors: {
        fileSize: sizeFactor,
        imageCount: optimizations.imageCompression ? 1 : 0,
        pageComplexity: pageFactor,
        compressionLevel: intensiveOperations,
        systemPerformance: 1 // Normalized
      },
      confidence: 80
    };
  }

  private predictResultSize(doc: DocumentAnalysis, contentAnalysis: ContentAnalysis, optimizations: OptimizationSettings): SizePrediction {
    const originalSize = doc.size;
    let estimatedReduction = 0;

    // Calculate reduction from various optimizations
    if (optimizations.imageCompression) {
      const imageReduction = (contentAnalysis.imagePercentage / 100) * originalSize * 0.3; // 30% image reduction
      estimatedReduction += imageReduction;
    }

    if (optimizations.compressStreams) {
      estimatedReduction += originalSize * 0.05; // 5% from stream compression
    }

    if (optimizations.removeMetadata) {
      estimatedReduction += Math.min(originalSize * 0.01, 50000); // Up to 50KB or 1%
    }

    if (optimizations.removeUnusedObjects) {
      estimatedReduction += originalSize * 0.03; // 3% from cleanup
    }

    const resultSize = Math.round(originalSize - estimatedReduction);
    const sizeReduction = Math.round((estimatedReduction / originalSize) * 100);

    return {
      resultSize: Math.max(originalSize * 0.1, resultSize), // Minimum 10% of original
      sizeReduction,
      comparison: {
        originalSize,
        estimatedSize: resultSize,
        savings: estimatedReduction
      },
      breakdown: {
        imageReduction: optimizations.imageCompression ? estimatedReduction * 0.6 : 0,
        streamCompression: optimizations.compressStreams ? estimatedReduction * 0.2 : 0,
        metadataRemoval: optimizations.removeMetadata ? Math.min(50000, originalSize * 0.01) : 0,
        fontOptimization: optimizations.fontSubsetting ? estimatedReduction * 0.1 : 0,
        objectCleanup: optimizations.removeUnusedObjects ? estimatedReduction * 0.1 : 0
      },
      confidence: 75
    };
  }

  private predictQuality(doc: DocumentAnalysis, contentAnalysis: ContentAnalysis, optimizations: OptimizationSettings): QualityForecast {
    let visualImpact = 0;
    const risks: string[] = [];

    // Calculate impact from image compression
    if (optimizations.imageCompression && contentAnalysis.imagePercentage > 30) {
      const qualityImpact = (100 - optimizations.imageQuality) * (contentAnalysis.imagePercentage / 100);
      visualImpact += qualityImpact;

      if (optimizations.imageQuality < 80) {
        risks.push(this.t('tools.smartCompression.predictions.quality.risks.imageQuality'));
      }
    }

    // Impact from downsampling
    if (optimizations.downsampleImages && optimizations.downsampleDPI < 200) {
      visualImpact += 10;
      risks.push(this.t('tools.smartCompression.predictions.quality.risks.downsampling'));
    }

    // Font impact
    if (optimizations.fontSubsetting) {
      visualImpact += 2;
      risks.push(this.t('tools.smartCompression.predictions.quality.risks.fonts'));
    }

    const score = Math.max(0, 100 - visualImpact);

    let overall: QualityForecast['overall'];
    if (score >= 90) overall = 'excellent';
    else if (score >= 75) overall = 'good';
    else if (score >= 60) overall = 'acceptable';
    else if (score >= 40) overall = 'degraded';
    else overall = 'poor';

    return {
      overall,
      visualImpact: Math.round(visualImpact),
      factors: {
        imageQuality: optimizations.imageCompression ? (100 - visualImpact) : 100,
        fontRendering: optimizations.fontSubsetting ? 90 : 100,
        vectorGraphics: 95, // Generally preserved
        layoutPreservation: optimizations.linearizeForWeb ? 98 : 100
      },
      risks,
      score: Math.round(score)
    };
  }

  private predictPerformanceImpact(doc: DocumentAnalysis, optimizations: OptimizationSettings): PerformanceImpact {
    const totalSize = doc.size;

    // Determine memory usage
    let memoryUsage: PerformanceImpact['memoryUsage'];
    if (totalSize > 100 * 1024 * 1024) memoryUsage = 'high';   // >100MB
    else if (totalSize > 25 * 1024 * 1024) memoryUsage = 'medium'; // >25MB
    else memoryUsage = 'low';

    // CPU intensive operations
    const cpuIntensive = optimizations.imageCompression ||
                        optimizations.downsampleImages ||
                        optimizations.fontSubsetting;

    // Calculate browser load (0-100)
    const browserLoad = Math.min(100, (totalSize / (75 * 1024 * 1024)) * 100);

    // Determine processing strategy
    let processingStrategy: PerformanceImpact['processingStrategy'];
    if (totalSize > 100 * 1024 * 1024 && cpuIntensive) {
      processingStrategy = 'chunked';
    } else if (cpuIntensive) {
      processingStrategy = 'multi-pass';
    } else {
      processingStrategy = 'single-pass';
    }

    // Battery impact for mobile devices
    let batteryImpact: PerformanceImpact['batteryImpact'];
    if (cpuIntensive && totalSize > 50 * 1024 * 1024) {
      batteryImpact = 'significant';
    } else if (cpuIntensive || totalSize > 25 * 1024 * 1024) {
      batteryImpact = 'moderate';
    } else {
      batteryImpact = 'minimal';
    }

    return {
      memoryUsage,
      cpuIntensive,
      browserLoad: Math.round(browserLoad),
      recommendedChunkSize: processingStrategy === 'chunked' ? 2 : undefined,
      processingStrategy,
      batteryImpact
    };
  }

  /**
   * Get default options for smart compression analysis
   */
  private getDefaultOptions(): SmartCompressionOptions {
    return {
      enableContentAnalysis: true,
      enableImageAnalysis: true,
      enableQualityPrediction: true,
      enablePerformanceOptimization: true,
      maxAnalysisTime: 8000, // 8 seconds max
      prioritizeQuality: false, // Default to balanced approach
      deviceType: 'desktop' // Default assumption
    };
  }

  /**
   * Get compression preset by name
   */
  getCompressionPreset(name: string) {
    return DEFAULT_COMPRESSION_PRESETS.find(preset => preset.name === name);
  }

  /**
   * Get all available compression presets
   */
  getAvailablePresets() {
    return DEFAULT_COMPRESSION_PRESETS;
  }
}

// Export singleton instance
export const smartCompressionService = SmartCompressionService.getInstance();