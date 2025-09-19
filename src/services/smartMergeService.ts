import { pdfService } from './pdfService';
import { detectLanguageAdvanced } from '../utils/languageDetector';
import { getTranslations } from '../locales/index';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../types/i18n';
import {
  DocumentAnalysis,
  CompatibilityAnalysis,
  ContentAnalysis,
  MergeRecommendations,
  MergePrediction,
  SmartMergeAnalysis,
  SmartMergeOptions,
  OrderRecommendation,
  MergeWarning,
  ProcessingTimePrediction,
  SizePrediction,
  QualityForecast,
  PerformanceImpact,
  MergeSettings,
  SuggestedMetadata
} from '../types/smartMerge.types';

/**
 * AI-powered Smart Merge Service
 * Provides intelligent document analysis, recommendations, and predictions for PDF merging
 */
export class SmartMergeService {
  private static instance: SmartMergeService;
  private version = '1.0.0';
  private currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

  /**
   * Set the current language for translations
   */
  setLanguage(language: SupportedLanguage): void {
    console.log('🌍 SmartMergeService language changed from', this.currentLanguage, 'to', language);
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
    if (key.includes('keyword') || key.includes('subject') || key.includes('reasoning')) {
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

  static getInstance(): SmartMergeService {
    if (!this.instance) {
      this.instance = new SmartMergeService();
    }
    return this.instance;
  }

  /**
   * Main entry point: Analyze files and generate smart recommendations
   */
  async analyzeForMerge(
    files: File[],
    options: SmartMergeOptions = this.getDefaultOptions()
  ): Promise<SmartMergeAnalysis> {
    console.log(this.t('tools.smartMerge.analysis.startMessage', { count: files.length }));
    const startTime = Date.now();

    try {
      // 1. Analyze individual documents
      const documents = await this.analyzeDocuments(files, options);

      // 2. Analyze compatibility between documents
      const compatibility = this.analyzeCompatibility(documents);

      // 3. Analyze content and relationships
      const content = await this.analyzeContent(documents, options);

      // 4. Generate intelligent recommendations
      const recommendations = this.generateRecommendations(documents, compatibility, content);

      // 5. Generate predictions
      const predictions = this.generatePredictions(documents, recommendations);

      const analysis: SmartMergeAnalysis = {
        documents,
        compatibility,
        content,
        recommendations,
        predictions,
        timestamp: new Date(),
        version: this.version
      };

      const analysisTime = Date.now() - startTime;
      console.log(this.t('tools.smartMerge.analysis.completedMessage', { time: analysisTime }));

      return analysis;

    } catch (error) {
      console.error(this.t('tools.smartMerge.analysis.failedMessage'), error);
      throw new Error(this.t('tools.smartMerge.analysis.errorPrefix') + ' ' + (error instanceof Error ? error.message : this.t('tools.smartMerge.errors.unknownError')));
    }
  }

  /**
   * Analyze individual PDF documents
   */
  private async analyzeDocuments(
    files: File[],
    options: SmartMergeOptions
  ): Promise<DocumentAnalysis[]> {
    const analyses: DocumentAnalysis[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(this.t('tools.smartMerge.documentAnalysis.analyzing', { current: i + 1, total: files.length, name: file.name }));

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
          language: options.enableLanguageDetection ?
            this.detectLanguage(file.name) : undefined,
          hasBookmarks: false, // TODO: Implement bookmark detection
          hasAnnotations: false, // TODO: Implement annotation detection
          compression: this.estimateCompression(file, pdfInfo),
          estimatedTextDensity: this.estimateTextDensity(file, pdfInfo)
        };

        analyses.push(analysis);

      } catch (error) {
        console.warn(this.t('tools.smartMerge.documentAnalysis.analyzingFailed', { name: file.name }), error);

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
   * Analyze compatibility between documents
   */
  private analyzeCompatibility(documents: DocumentAnalysis[]): CompatibilityAnalysis {
    if (documents.length < 2) {
      return {
        pageSizeConsistency: 'uniform',
        orientationMismatch: false,
        qualityVariance: 'low',
        formatConsistency: 'identical',
        sizeVariancePercentage: 0
      };
    }

    // Analyze page size consistency
    const dimensions = documents.map(d => d.dimensions);
    const pageSizeConsistency = this.analyzePageSizeConsistency(dimensions);

    // Check orientation mismatch
    const orientations = documents.map(d => d.orientation);
    const orientationMismatch = new Set(orientations).size > 1;

    // Analyze quality variance
    const qualities = documents.map(d => d.quality);
    const qualityVariance = this.analyzeQualityVariance(qualities);

    // Analyze format consistency
    const types = documents.map(d => d.type);
    const formatConsistency = this.analyzeFormatConsistency(types);

    // Calculate size variance
    const sizes = documents.map(d => d.size);
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const maxVariance = Math.max(...sizes.map(size => Math.abs(size - avgSize)));
    const sizeVariancePercentage = avgSize > 0 ? (maxVariance / avgSize) * 100 : 0;

    return {
      pageSizeConsistency,
      orientationMismatch,
      qualityVariance,
      formatConsistency,
      sizeVariancePercentage: Math.round(sizeVariancePercentage)
    };
  }

  /**
   * Analyze content and document relationships
   */
  private async analyzeContent(
    documents: DocumentAnalysis[],
    options: SmartMergeOptions
  ): Promise<ContentAnalysis> {
    // Determine document types from file names and characteristics
    const documentTypes = this.identifyDocumentTypes(documents);

    // Generate likely sequence based on various factors
    const likelySequence = this.generateLikelySequence(documents);

    // Check for potential duplicate content (basic heuristic)
    const duplicateContent = this.checkForDuplicates(documents);

    // Determine if documents are related
    const relatedDocuments = this.checkDocumentRelationship(documents);

    // Calculate overall confidence score
    const confidenceScore = this.calculateContentConfidence(
      documents,
      documentTypes,
      relatedDocuments
    );

    return {
      documentTypes,
      likelySequence,
      duplicateContent,
      relatedDocuments,
      confidenceScore
    };
  }

  /**
   * Generate intelligent recommendations
   */
  private generateRecommendations(
    documents: DocumentAnalysis[],
    compatibility: CompatibilityAnalysis,
    content: ContentAnalysis
  ): MergeRecommendations {
    // Generate optimal order recommendation
    const suggestedOrder = this.generateOptimalOrder(documents, content);

    // Generate merge settings
    const mergeSettings = this.generateOptimalSettings(documents, compatibility);

    // Identify potential warnings
    const warnings = this.identifyWarnings(documents, compatibility);

    // Generate suggested metadata
    const suggestedMetadata = this.generateMetadata(documents, content);

    return {
      suggestedOrder,
      mergeSettings,
      warnings,
      suggestedMetadata
    };
  }

  /**
   * Generate predictions about merge outcome
   */
  private generatePredictions(
    documents: DocumentAnalysis[],
    recommendations: MergeRecommendations
  ): MergePrediction {
    const processingTime = this.predictProcessingTime(documents);
    const resultSize = this.predictResultSize(documents);
    const qualityForecast = this.predictQuality(documents, recommendations);
    const performanceImpact = this.predictPerformanceImpact(documents);

    return {
      processingTime,
      resultSize,
      qualityForecast,
      performanceImpact
    };
  }

  // Helper methods for document analysis
  private determineOrientation(dimensions: { width: number; height: number }): 'portrait' | 'landscape' | 'mixed' {
    const { width, height } = dimensions;
    if (Math.abs(width - height) < 10) return 'mixed'; // Square-ish
    return width > height ? 'landscape' : 'portrait';
  }

  private estimateQuality(file: File, pdfInfo: any): 'high' | 'medium' | 'low' {
    // Simple heuristic based on file size per page
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);

    if (sizePerPage > 500000) return 'high';   // >500KB per page
    if (sizePerPage > 100000) return 'medium'; // >100KB per page
    return 'low';
  }

  private determineDocumentType(file: File, pdfInfo: any): 'text' | 'scanned' | 'mixed' | 'presentation' {
    const filename = file.name.toLowerCase();

    // Check filename patterns
    if (filename.includes('scan') || filename.includes('scanned')) return 'scanned';
    if (filename.includes('presentation') || filename.includes('slide')) return 'presentation';

    // Use size heuristics
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);
    if (sizePerPage > 1000000) return 'scanned'; // Very large per page = likely scanned
    if (sizePerPage < 50000) return 'text';      // Small per page = likely text

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

  private estimateCompression(file: File, pdfInfo: any): 'none' | 'low' | 'medium' | 'high' {
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);

    if (sizePerPage > 1000000) return 'none';   // Very large = no compression
    if (sizePerPage > 500000) return 'low';     // Large = low compression
    if (sizePerPage > 100000) return 'medium';  // Medium size = medium compression
    return 'high';                              // Small = high compression
  }

  private estimateTextDensity(file: File, pdfInfo: any): 'low' | 'medium' | 'high' {
    const type = this.determineDocumentType(file, pdfInfo);

    if (type === 'scanned') return 'low';
    if (type === 'text') return 'high';
    return 'medium';
  }

  // Helper methods for compatibility analysis
  private analyzePageSizeConsistency(dimensions: Array<{ width: number; height: number }>): 'uniform' | 'similar' | 'mixed' {
    if (dimensions.length < 2) return 'uniform';

    const first = dimensions[0];
    const tolerance = 10; // pixels

    const allUniform = dimensions.every(d =>
      Math.abs(d.width - first.width) <= tolerance &&
      Math.abs(d.height - first.height) <= tolerance
    );

    if (allUniform) return 'uniform';

    // Check if sizes are at least similar (same standard sizes)
    const standardSizes = this.groupByStandardSizes(dimensions);
    if (standardSizes.length <= 2) return 'similar';

    return 'mixed';
  }

  private groupByStandardSizes(dimensions: Array<{ width: number; height: number }>): string[] {
    const sizes = dimensions.map(d => {
      // Classify into standard sizes (A4, Letter, etc.)
      const area = d.width * d.height;
      if (area > 450000 && area < 550000) return 'A4';
      if (area > 400000 && area < 450000) return 'Letter';
      if (area > 300000 && area < 400000) return 'A5';
      return 'Other';
    });

    return Array.from(new Set(sizes));
  }

  private analyzeQualityVariance(qualities: string[]): 'low' | 'medium' | 'high' {
    const uniqueQualities = new Set(qualities);

    if (uniqueQualities.size === 1) return 'low';
    if (uniqueQualities.size === 2) return 'medium';
    return 'high';
  }

  private analyzeFormatConsistency(types: string[]): 'identical' | 'compatible' | 'problematic' {
    const uniqueTypes = new Set(types);

    if (uniqueTypes.size === 1) return 'identical';

    // Check if all types are compatible
    const compatibleCombinations = [
      ['text', 'mixed'],
      ['text', 'presentation'],
      ['mixed', 'presentation']
    ];

    const typesArray = Array.from(uniqueTypes).sort();
    const isCompatible = compatibleCombinations.some(combo =>
      combo.sort().join(',') === typesArray.join(',')
    );

    return isCompatible ? 'compatible' : 'problematic';
  }

  // Helper methods for content analysis
  private identifyDocumentTypes(documents: DocumentAnalysis[]): string[] {
    const types = new Set<string>();

    documents.forEach(doc => {
      const filename = doc.name.toLowerCase();

      // Identify document types from filename patterns
      if (filename.includes('contract') || filename.includes('agreement')) types.add('contract');
      if (filename.includes('invoice') || filename.includes('bill')) types.add('invoice');
      if (filename.includes('report')) types.add('report');
      if (filename.includes('presentation') || filename.includes('slide')) types.add('presentation');
      if (filename.includes('manual') || filename.includes('guide')) types.add('manual');
      if (filename.includes('form')) types.add('form');

      // Add general type
      types.add(doc.type);
    });

    return Array.from(types);
  }

  private generateLikelySequence(documents: DocumentAnalysis[]): number[] {
    // Generate recommended order based on multiple factors
    const scored = documents.map((doc, index) => ({
      index,
      doc,
      score: this.calculateDocumentScore(doc, documents)
    }));

    // Sort by score (higher score = should come first)
    scored.sort((a, b) => b.score - a.score);

    return scored.map(item => item.index);
  }

  private calculateDocumentScore(doc: DocumentAnalysis, allDocs: DocumentAnalysis[]): number {
    let score = 0;

    // Chronological factor (older documents first)
    const avgDate = allDocs.reduce((sum, d) => sum + d.created.getTime(), 0) / allDocs.length;
    if (doc.created.getTime() < avgDate) score += 10;

    // Size factor (smaller documents first for better navigation)
    if (doc.pages <= 5) score += 15;
    else if (doc.pages <= 20) score += 10;
    else if (doc.pages <= 50) score += 5;

    // Type factor (certain types should come first)
    if (doc.name.toLowerCase().includes('cover') || doc.name.toLowerCase().includes('title')) score += 20;
    if (doc.name.toLowerCase().includes('index') || doc.name.toLowerCase().includes('contents')) score += 18;
    if (doc.name.toLowerCase().includes('introduction') || doc.name.toLowerCase().includes('intro')) score += 16;

    // Quality factor (higher quality first)
    if (doc.quality === 'high') score += 8;
    else if (doc.quality === 'medium') score += 4;

    return score;
  }

  private checkForDuplicates(documents: DocumentAnalysis[]): boolean {
    // Simple duplicate detection based on size and page count
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const doc1 = documents[i];
        const doc2 = documents[j];

        // Check if files are very similar
        const sizeDiff = Math.abs(doc1.size - doc2.size) / Math.max(doc1.size, doc2.size);
        const pageDiff = Math.abs(doc1.pages - doc2.pages);

        if (sizeDiff < 0.05 && pageDiff <= 1) { // 5% size difference, 1 page difference
          return true;
        }
      }
    }

    return false;
  }

  private checkDocumentRelationship(documents: DocumentAnalysis[]): boolean {
    if (documents.length < 2) return false;

    // Check if filenames suggest they are related
    const names = documents.map(d => d.name.toLowerCase());

    // Look for common patterns
    const patterns = [
      /part[\s_-]*\d+/,
      /chapter[\s_-]*\d+/,
      /section[\s_-]*\d+/,
      /volume[\s_-]*\d+/,
      /\d+[\s_-]*of[\s_-]*\d+/
    ];

    const hasSequentialPattern = patterns.some(pattern =>
      names.filter(name => pattern.test(name)).length >= 2
    );

    if (hasSequentialPattern) return true;

    // Check for common base names
    const baseNames = names.map(name => {
      // Remove common suffixes and numbers
      return name.replace(/[\s_-]*\d+[\s_-]*.*$/, '')
                 .replace(/[\s_-]*(part|chapter|section|vol|volume).*$/, '');
    });

    const uniqueBaseNames = new Set(baseNames);
    return uniqueBaseNames.size < documents.length * 0.7; // 70% threshold
  }

  private calculateContentConfidence(
    documents: DocumentAnalysis[],
    documentTypes: string[],
    relatedDocuments: boolean
  ): number {
    let confidence = 50; // Base confidence

    // Higher confidence for related documents
    if (relatedDocuments) confidence += 25;

    // Higher confidence for uniform document types
    if (documentTypes.length <= 2) confidence += 15;

    // Higher confidence for reasonable number of documents
    if (documents.length >= 2 && documents.length <= 10) confidence += 10;

    return Math.min(100, confidence);
  }

  // Helper methods for generating recommendations
  private generateOptimalOrder(
    documents: DocumentAnalysis[],
    content: ContentAnalysis
  ): OrderRecommendation {
    // Use the likely sequence from content analysis
    const order = content.likelySequence;

    // Determine the algorithm used
    let algorithm: OrderRecommendation['algorithm'] = 'content-based';
    let reasoning = this.t('tools.smartMerge.order.reasoningTexts.contentBased');

    // Check if it's primarily chronological
    const chronologicalOrder = documents
      .map((doc, index) => ({ doc, index }))
      .sort((a, b) => a.doc.created.getTime() - b.doc.created.getTime())
      .map(item => item.index);

    if (JSON.stringify(order) === JSON.stringify(chronologicalOrder)) {
      algorithm = 'chronological';
      reasoning = this.t('tools.smartMerge.order.reasoningTexts.chronological');
    }

    // Calculate navigation quality score
    const score = this.calculateNavigationScore(order, documents);

    return {
      fileIds: order.map(String),
      reasoning,
      confidence: content.confidenceScore,
      algorithm,
      score
    };
  }

  private calculateNavigationScore(order: number[], documents: DocumentAnalysis[]): number {
    let score = 50; // Base score

    // Check for logical progression
    const orderedDocs = order.map(i => documents[i]);

    // Bonus for consistent page sizes
    const pageSizes = orderedDocs.map(d => d.dimensions);
    if (this.analyzePageSizeConsistency(pageSizes) === 'uniform') score += 20;

    // Bonus for consistent quality
    const qualities = orderedDocs.map(d => d.quality);
    if (new Set(qualities).size === 1) score += 15;

    // Bonus for size progression (smaller to larger is often better)
    const sizes = orderedDocs.map(d => d.pages);
    const isIncreasing = sizes.every((size, i) => i === 0 || size >= sizes[i - 1]);
    if (isIncreasing) score += 15;

    return Math.min(100, score);
  }

  private generateOptimalSettings(
    documents: DocumentAnalysis[],
    compatibility: CompatibilityAnalysis
  ): MergeSettings {
    return {
      preserveBookmarks: documents.some(d => d.hasBookmarks),
      bookmarkStrategy: documents.length > 5 ? 'separate' : 'merge',
      handleAnnotations: documents.some(d => d.hasAnnotations) ? 'preserve' : 'merge',
      pageNumbering: 'continuous',
      qualityOptimization: compatibility.qualityVariance === 'high' ? 'balance' : 'preserve-best'
    };
  }

  private identifyWarnings(
    documents: DocumentAnalysis[],
    compatibility: CompatibilityAnalysis
  ): MergeWarning[] {
    const warnings: MergeWarning[] = [];

    // Size mismatch warning
    if (compatibility.pageSizeConsistency === 'mixed') {
      warnings.push({
        type: 'size_mismatch',
        severity: 'warning',
        message: this.t('tools.smartMerge.warnings.sizeMismatch.title'),
        affectedFiles: documents.map(d => d.id),
        suggestion: this.t('tools.smartMerge.warnings.sizeMismatch.suggestion'),
        autoFix: false
      });
    }

    // Orientation mismatch warning
    if (compatibility.orientationMismatch) {
      warnings.push({
        type: 'orientation_mismatch',
        severity: 'info',
        message: this.t('tools.smartMerge.warnings.orientationMismatch.title'),
        affectedFiles: documents.filter(d => d.orientation === 'landscape').map(d => d.id),
        suggestion: this.t('tools.smartMerge.warnings.orientationMismatch.suggestion'),
        autoFix: false
      });
    }

    // Quality variance warning
    if (compatibility.qualityVariance === 'high') {
      warnings.push({
        type: 'quality_variance',
        severity: 'warning',
        message: this.t('tools.smartMerge.warnings.qualityVariance.title'),
        affectedFiles: documents.filter(d => d.quality === 'low').map(d => d.id),
        suggestion: this.t('tools.smartMerge.warnings.qualityVariance.suggestion'),
        autoFix: false
      });
    }

    // Large file warning
    const totalSize = documents.reduce((sum, d) => sum + d.size, 0);
    if (totalSize > 50 * 1024 * 1024) { // 50MB
      warnings.push({
        type: 'size_mismatch',
        severity: 'info',
        message: this.t('tools.smartMerge.warnings.largeFile.title'),
        affectedFiles: documents.filter(d => d.size > 10 * 1024 * 1024).map(d => d.id),
        suggestion: this.t('tools.smartMerge.warnings.largeFile.suggestion'),
        autoFix: false
      });
    }

    return warnings;
  }

  private generateMetadata(
    documents: DocumentAnalysis[],
    content: ContentAnalysis
  ): SuggestedMetadata {
    // Generate intelligent metadata based on document analysis
    const firstDoc = documents[0];
    const baseName = firstDoc.name.replace(/\.(pdf|PDF)$/, '');

    // Generate title
    let title = this.t('tools.smartMerge.metadata.generated.defaultTitle');
    if (content.relatedDocuments) {
      const commonName = this.extractCommonName(documents.map(d => d.name));
      title = commonName ? this.t('tools.smartMerge.metadata.generated.completeDocument', { name: commonName }) : this.t('tools.smartMerge.metadata.generated.mergedCollection', { name: baseName });
    } else {
      title = this.t('tools.smartMerge.metadata.generated.mergedCollection', { name: baseName });
    }

    // Generate subject
    const documentTypes = content.documentTypes.filter(type =>
      !['text', 'mixed', 'scanned', 'presentation'].includes(type)
    );
    const subject = documentTypes.length > 0
      ? this.t('tools.smartMerge.metadata.generated.subjectCollection', { types: documentTypes.join(', ') })
      : this.t('tools.smartMerge.metadata.generated.subjectDefault');

    // Generate keywords
    const keywords = [
      ...documentTypes,
      this.t('tools.smartMerge.metadata.generated.keywordMerged'),
      this.t('tools.smartMerge.metadata.generated.keywordCollection'),
      documents.length > 1 ? this.t('tools.smartMerge.metadata.generated.keywordMultiDocument') : this.t('tools.smartMerge.metadata.generated.keywordDocument')
    ].filter(Boolean);

    return {
      title,
      author: this.t('tools.smartMerge.metadata.generated.authorDefault'),
      subject,
      keywords,
      reasoning: content.relatedDocuments
        ? this.t('tools.smartMerge.metadata.generated.reasoningRelated', { count: documents.length })
        : this.t('tools.smartMerge.metadata.generated.reasoningMixed', { count: documents.length }),
      confidence: content.confidenceScore
    };
  }

  private extractCommonName(filenames: string[]): string | null {
    if (filenames.length < 2) return null;

    // Find common prefix
    const first = filenames[0];
    let commonLength = 0;

    for (let i = 0; i < first.length; i++) {
      if (filenames.every(name => name[i] === first[i])) {
        commonLength = i + 1;
      } else {
        break;
      }
    }

    if (commonLength < 3) return null;

    const common = first.substring(0, commonLength);
    // Clean up common name (remove trailing separators)
    return common.replace(/[\s_-]+$/, '');
  }

  // Helper methods for predictions
  private predictProcessingTime(documents: DocumentAnalysis[]): ProcessingTimePrediction {
    // Empirical formula based on file characteristics
    const totalPages = documents.reduce((sum, d) => sum + d.pages, 0);
    const totalSize = documents.reduce((sum, d) => sum + d.size, 0);
    const fileCount = documents.length;

    // Base time + size factor + page factor + file count factor
    const baseTime = 2; // 2 seconds base
    const sizeFactor = (totalSize / (1024 * 1024)) * 0.1; // 0.1s per MB
    const pageFactor = totalPages * 0.05; // 0.05s per page
    const fileFactor = fileCount * 0.5; // 0.5s per file

    const estimated = Math.max(1, baseTime + sizeFactor + pageFactor + fileFactor);

    return {
      estimated,
      range: {
        min: estimated * 0.7,
        max: estimated * 1.5
      },
      factors: {
        fileCount: fileFactor,
        totalSize: sizeFactor,
        complexity: pageFactor,
        systemPerformance: 1 // Normalized
      },
      confidence: 75
    };
  }

  private predictResultSize(documents: DocumentAnalysis[]): SizePrediction {
    const totalInputSize = documents.reduce((sum, d) => sum + d.size, 0);

    // PDF merge typically has minimal compression
    // Estimate 95-105% of original size due to structural overhead
    const compressionFactor = 0.98; // Slight compression due to duplicate removal
    const overhead = totalInputSize * 0.03; // 3% overhead for merge structure

    const estimated = Math.round(totalInputSize * compressionFactor + overhead);
    const compression = ((totalInputSize - estimated) / totalInputSize) * 100;

    return {
      estimated,
      compression: Math.round(compression),
      comparison: {
        totalInputSize,
        estimatedOutput: estimated,
        savings: totalInputSize - estimated
      },
      confidence: 85
    };
  }

  private predictQuality(
    documents: DocumentAnalysis[],
    recommendations: MergeRecommendations
  ): QualityForecast {
    // Analyze quality factors
    const qualities = documents.map(d => d.quality);
    const hasLowQuality = qualities.includes('low');
    const hasMixedQuality = new Set(qualities).size > 1;

    // Calculate quality score
    let score = 80; // Base quality score

    if (hasLowQuality) score -= 20;
    if (hasMixedQuality) score -= 10;
    if (recommendations.warnings.length > 2) score -= 15;

    // Determine overall quality
    let overall: QualityForecast['overall'];
    if (score >= 85) overall = 'excellent';
    else if (score >= 70) overall = 'good';
    else if (score >= 55) overall = 'acceptable';
    else overall = 'poor';

    const potentialIssues: string[] = [];
    if (hasLowQuality) potentialIssues.push('Some documents have low quality');
    if (hasMixedQuality) potentialIssues.push('Quality inconsistency across documents');

    return {
      overall,
      factors: {
        pageSizeUniformity: recommendations.warnings.find(w => w.type === 'size_mismatch') ? 60 : 90,
        compressionLoss: 95, // Minimal compression loss in PDF merge
        contentPreservation: 98 // High content preservation
      },
      potentialIssues,
      score: Math.max(0, Math.min(100, score))
    };
  }

  private predictPerformanceImpact(documents: DocumentAnalysis[]): PerformanceImpact {
    const totalSize = documents.reduce((sum, d) => sum + d.size, 0);
    const totalPages = documents.reduce((sum, d) => sum + d.pages, 0);

    // Determine memory usage
    let memoryUsage: PerformanceImpact['memoryUsage'];
    if (totalSize > 100 * 1024 * 1024) memoryUsage = 'high';   // >100MB
    else if (totalSize > 20 * 1024 * 1024) memoryUsage = 'medium'; // >20MB
    else memoryUsage = 'low';

    // Calculate browser load (0-100)
    const browserLoad = Math.min(100, (totalSize / (50 * 1024 * 1024)) * 100);

    // Determine processing strategy
    let processingStrategy: PerformanceImpact['processingStrategy'];
    let recommendedBatchSize: number | undefined;

    if (totalSize > 100 * 1024 * 1024 || totalPages > 500) {
      processingStrategy = 'sequential';
      recommendedBatchSize = 2;
    } else if (totalSize > 50 * 1024 * 1024 || documents.length > 5) {
      processingStrategy = 'hybrid';
      recommendedBatchSize = 3;
    } else {
      processingStrategy = 'parallel';
    }

    return {
      memoryUsage,
      browserLoad: Math.round(browserLoad),
      recommendedBatchSize,
      processingStrategy
    };
  }

  /**
   * Get default options for smart merge analysis
   */
  private getDefaultOptions(): SmartMergeOptions {
    return {
      enableContentAnalysis: true,
      enableLanguageDetection: true,
      enableQualityAnalysis: true,
      enablePerformanceOptimization: true,
      maxAnalysisTime: 10000 // 10 seconds max
    };
  }
}

// Export singleton instance
export const smartMergeService = SmartMergeService.getInstance();