import { pdfService } from './pdfService';
import { detectLanguageAdvanced } from '../utils/languageDetector';
import { getTranslations } from '../locales/index';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../types/i18n';

/**
 * Universal Smart PDF Service
 * Provides AI-powered analysis and recommendations for all PDF tools
 */
export class SmartPDFService {
  private static instance: SmartPDFService;
  private version = '1.0.0';
  private currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

  static getInstance(): SmartPDFService {
    if (!this.instance) {
      this.instance = new SmartPDFService();
    }
    return this.instance;
  }

  /**
   * Set the current language for translations
   */
  setLanguage(language: SupportedLanguage): void {
    console.log('🌍 SmartPDFService language changed from', this.currentLanguage, 'to', language);
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
    return this.interpolate(value, params);
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private interpolate(template: string, params?: Record<string, any>): string {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  // === SPLIT PDF AI RECOMMENDATIONS ===

  /**
   * Analyze PDF for optimal splitting strategy
   */
  async analyzePDFForSplit(file: File): Promise<SplitRecommendations> {
    console.log('🧠 Analyzing PDF for split recommendations:', file.name);

    try {
      const pdfInfo = await pdfService.getPDFInfo(file);
      const documentAnalysis = await this.analyzeDocument(file, pdfInfo);

      return this.generateSplitRecommendations(documentAnalysis, pdfInfo);
    } catch (error) {
      console.error('Split analysis failed:', error);
      return this.getFallbackSplitRecommendations(file);
    }
  }

  private generateSplitRecommendations(doc: DocumentAnalysis, pdfInfo: any): SplitRecommendations {
    const strategies: SplitStrategy[] = [];

    // Strategy 1: Page ranges based on content patterns
    if (doc.pages > 10) {
      strategies.push({
        type: 'chapters',
        title: this.t('tools.split.ai.strategies.chapters.title'),
        description: this.t('tools.split.ai.strategies.chapters.description'),
        ranges: this.detectChapterBreaks(doc.pages),
        confidence: 75,
        reasoning: this.t('tools.split.ai.strategies.chapters.reasoning')
      });
    }

    // Strategy 2: Equal parts
    strategies.push({
      type: 'equal',
      title: this.t('tools.split.ai.strategies.equal.title'),
      description: this.t('tools.split.ai.strategies.equal.description'),
      ranges: this.generateEqualParts(doc.pages),
      confidence: 90,
      reasoning: this.t('tools.split.ai.strategies.equal.reasoning')
    });

    // Strategy 3: Single pages for presentation-like docs
    if (doc.type === 'presentation' || doc.pages <= 20) {
      strategies.push({
        type: 'single',
        title: this.t('tools.split.ai.strategies.single.title'),
        description: this.t('tools.split.ai.strategies.single.description'),
        ranges: this.generateSinglePages(doc.pages),
        confidence: 60,
        reasoning: this.t('tools.split.ai.strategies.single.reasoning')
      });
    }

    const warnings = this.generateSplitWarnings(doc);
    const predictions = this.generateSplitPredictions(doc, strategies[0]);

    return {
      strategies,
      warnings,
      predictions,
      recommendedStrategy: strategies[0],
      timestamp: new Date(),
      version: this.version
    };
  }

  private detectChapterBreaks(totalPages: number): PageRange[] {
    // Simple heuristic for detecting logical breaks
    const ranges: PageRange[] = [];
    const avgChapterLength = Math.max(5, Math.floor(totalPages / Math.min(10, totalPages / 3)));

    let start = 1;
    while (start <= totalPages) {
      const end = Math.min(start + avgChapterLength - 1, totalPages);
      ranges.push({ start, end, label: this.t('tools.split.ai.labels.chapter', { number: ranges.length + 1 }) });
      start = end + 1;
    }

    return ranges;
  }

  private generateEqualParts(totalPages: number): PageRange[] {
    const parts = Math.min(5, Math.max(2, Math.ceil(totalPages / 10)));
    const pagesPerPart = Math.ceil(totalPages / parts);
    const ranges: PageRange[] = [];

    for (let i = 0; i < parts; i++) {
      const start = i * pagesPerPart + 1;
      const end = Math.min((i + 1) * pagesPerPart, totalPages);
      if (start <= totalPages) {
        ranges.push({
          start,
          end,
          label: this.t('tools.split.ai.labels.part', { number: i + 1, total: parts })
        });
      }
    }

    return ranges;
  }

  private generateSinglePages(totalPages: number): PageRange[] {
    const ranges: PageRange[] = [];
    for (let i = 1; i <= totalPages; i++) {
      ranges.push({
        start: i,
        end: i,
        label: this.t('tools.split.ai.labels.page', { number: i })
      });
    }
    return ranges;
  }

  // === COMPRESS PDF AI RECOMMENDATIONS ===

  async analyzePDFForCompression(file: File): Promise<CompressionRecommendations> {
    console.log('🧠 Analyzing PDF for compression recommendations:', file.name);

    try {
      const pdfInfo = await pdfService.getPDFInfo(file);
      const documentAnalysis = await this.analyzeDocument(file, pdfInfo);

      return this.generateCompressionRecommendations(documentAnalysis, file);
    } catch (error) {
      console.error('Compression analysis failed:', error);
      return this.getFallbackCompressionRecommendations(file);
    }
  }

  private generateCompressionRecommendations(doc: DocumentAnalysis, file: File): CompressionRecommendations {
    const currentSizePerPage = file.size / doc.pages;
    const strategies: CompressionStrategy[] = [];

    // Strategy 1: Aggressive compression for large files
    if (currentSizePerPage > 500000) { // > 500KB per page
      strategies.push({
        level: 'high',
        title: this.t('tools.compress.ai.strategies.high.title'),
        description: this.t('tools.compress.ai.strategies.high.description'),
        expectedSavings: 70,
        confidence: 85,
        reasoning: this.t('tools.compress.ai.strategies.high.reasoning'),
        tradeoffs: [this.t('tools.compress.ai.tradeoffs.qualityReduction')]
      });
    }

    // Strategy 2: Balanced compression
    strategies.push({
      level: 'medium',
      title: this.t('tools.compress.ai.strategies.medium.title'),
      description: this.t('tools.compress.ai.strategies.medium.description'),
      expectedSavings: 40,
      confidence: 90,
      reasoning: this.t('tools.compress.ai.strategies.medium.reasoning'),
      tradeoffs: [this.t('tools.compress.ai.tradeoffs.minimalQualityLoss')]
    });

    // Strategy 3: Light compression for high-quality docs
    if (doc.quality === 'high') {
      strategies.push({
        level: 'low',
        title: this.t('tools.compress.ai.strategies.low.title'),
        description: this.t('tools.compress.ai.strategies.low.description'),
        expectedSavings: 15,
        confidence: 95,
        reasoning: this.t('tools.compress.ai.strategies.low.reasoning'),
        tradeoffs: []
      });
    }

    const warnings = this.generateCompressionWarnings(doc, file);
    const predictions = this.generateCompressionPredictions(file, strategies[0]);

    return {
      strategies,
      warnings,
      predictions,
      recommendedStrategy: strategies[0],
      currentFileSize: file.size,
      timestamp: new Date(),
      version: this.version
    };
  }

  // === PROTECT PDF AI RECOMMENDATIONS ===

  async analyzePDFForProtection(file: File): Promise<ProtectionRecommendations> {
    console.log('🧠 Analyzing PDF for protection recommendations:', file.name);

    try {
      const pdfInfo = await pdfService.getPDFInfo(file);
      const documentAnalysis = await this.analyzeDocument(file, pdfInfo);

      return this.generateProtectionRecommendations(documentAnalysis, file);
    } catch (error) {
      console.error('Protection analysis failed:', error);
      return this.getFallbackProtectionRecommendations(file);
    }
  }

  private generateProtectionRecommendations(doc: DocumentAnalysis, file: File): ProtectionRecommendations {
    const securityLevels: SecurityLevel[] = [];

    // Basic protection
    securityLevels.push({
      level: 'basic',
      title: this.t('tools.protect.ai.levels.basic.title'),
      description: this.t('tools.protect.ai.levels.basic.description'),
      permissions: ['viewing'],
      restrictions: ['printing', 'copying', 'editing'],
      passwordStrengthRequired: 'medium',
      confidence: 95,
      reasoning: this.t('tools.protect.ai.levels.basic.reasoning')
    });

    // Medium protection for sensitive docs
    if (this.isSensitiveDocument(doc, file)) {
      securityLevels.push({
        level: 'medium',
        title: this.t('tools.protect.ai.levels.medium.title'),
        description: this.t('tools.protect.ai.levels.medium.description'),
        permissions: ['viewing'],
        restrictions: ['printing', 'copying', 'editing', 'extracting', 'commenting'],
        passwordStrengthRequired: 'strong',
        confidence: 85,
        reasoning: this.t('tools.protect.ai.levels.medium.reasoning')
      });
    }

    // High protection for confidential docs
    if (this.isConfidentialDocument(doc, file)) {
      securityLevels.push({
        level: 'high',
        title: this.t('tools.protect.ai.levels.high.title'),
        description: this.t('tools.protect.ai.levels.high.description'),
        permissions: [],
        restrictions: ['viewing', 'printing', 'copying', 'editing', 'extracting', 'commenting'],
        passwordStrengthRequired: 'very-strong',
        confidence: 90,
        reasoning: this.t('tools.protect.ai.levels.high.reasoning')
      });
    }

    const warnings = this.generateProtectionWarnings(doc);
    const suggestions = this.generatePasswordSuggestions(doc);

    return {
      securityLevels,
      warnings,
      suggestions,
      recommendedLevel: securityLevels[0],
      timestamp: new Date(),
      version: this.version
    };
  }

  // === OCR PDF AI RECOMMENDATIONS (ADVANCED) ===

  async analyzePDFForOCR(file: File): Promise<OCRRecommendationsAdvanced> {
    console.log('🧠 Analyzing PDF for OCR recommendations (Advanced):', file.name);

    try {
      // Import OCR service dynamically to avoid circular dependencies
      const { ocrService } = await import('./ocrService');

      // Perform comprehensive analysis
      const [imageQuality, languageDetection, documentStructure] = await Promise.all([
        ocrService.analyzeImageQuality(file),
        ocrService.detectDocumentLanguages(file),
        ocrService.analyzeDocumentStructure(file)
      ]);

      console.log('📊 Analysis results:', { imageQuality, languageDetection, documentStructure });

      return this.generateAdvancedOCRRecommendations(
        file,
        imageQuality,
        languageDetection,
        documentStructure
      );
    } catch (error) {
      console.error('OCR analysis failed:', error);
      return this.getFallbackOCRRecommendationsAdvanced(file);
    }
  }

  private generateAdvancedOCRRecommendations(
    file: File,
    imageQuality: any,
    languageDetection: any,
    documentStructure: any
  ): OCRRecommendationsAdvanced {
    const strategies: OCRStrategyAdvanced[] = [];
    const confidence = Math.round((imageQuality.clarity + imageQuality.contrast + languageDetection.confidence) / 3);

    // Strategy 1: Fast Mode (5-15 sec)
    strategies.push({
      id: 'fast',
      name: this.t('tools.ocr.ai.strategies.fast.title') || 'Fast Mode',
      description: this.t('tools.ocr.ai.strategies.fast.description') || 'Quick OCR with basic settings',
      reasoning: this.t('tools.ocr.ai.strategies.fast.reasoning') || 'Best for high-quality documents with clear text',
      settings: {
        languages: [languageDetection.primary],
        mode: 'fast' as const,
        preserveLayout: false,
        outputFormat: 'text' as const,
        preprocessImage: false
      },
      expectedAccuracy: Math.min(95, imageQuality.clarity),
      expectedTime: Math.max(5, file.size / (1024 * 1024) * 2),
      pros: [
        this.t('tools.ocr.ai.pros.fast') || 'Fastest processing time',
        this.t('tools.ocr.ai.pros.goodForClear') || 'Good for clear documents'
      ],
      cons: [
        this.t('tools.ocr.ai.cons.lowerAccuracy') || 'Lower accuracy on poor quality',
        this.t('tools.ocr.ai.cons.singleLanguage') || 'Single language only'
      ]
    });

    // Strategy 2: Balanced Mode (20-40 sec)
    strategies.push({
      id: 'balanced',
      name: this.t('tools.ocr.ai.strategies.balanced.title') || 'Balanced Mode',
      description: this.t('tools.ocr.ai.strategies.balanced.description') || 'Good balance of speed and accuracy',
      reasoning: this.t('tools.ocr.ai.strategies.balanced.reasoning') || 'Universal mode for most documents',
      settings: {
        languages: [languageDetection.primary, ...(languageDetection.secondary || []).slice(0, 1)],
        mode: 'balanced' as const,
        preserveLayout: true,
        outputFormat: 'text' as const,
        preprocessImage: imageQuality.recommendPreprocessing,
        preprocessOptions: imageQuality.recommendPreprocessing ? {
          denoise: imageQuality.hasNoise,
          deskew: Math.abs(imageQuality.skewAngle) > 2,
          contrast: imageQuality.contrast < 60,
          binarization: false,
          removeBackground: false
        } : undefined
      },
      expectedAccuracy: Math.min(92, imageQuality.clarity + 10),
      expectedTime: Math.max(20, file.size / (1024 * 1024) * 8),
      pros: [
        this.t('tools.ocr.ai.pros.balanced') || 'Good accuracy-speed balance',
        this.t('tools.ocr.ai.pros.preprocessing') || 'Includes preprocessing',
        this.t('tools.ocr.ai.pros.multiLang') || 'Supports 2 languages'
      ],
      cons: [
        this.t('tools.ocr.ai.cons.mediumSpeed') || 'Medium processing time'
      ]
    });

    // Strategy 3: High Accuracy Mode (60-120 sec)
    const needsHighAccuracy = imageQuality.clarity < 70 || imageQuality.contrast < 60 || imageQuality.hasNoise;
    strategies.push({
      id: 'accurate',
      name: this.t('tools.ocr.ai.strategies.accurate.title') || 'High Accuracy Mode',
      description: this.t('tools.ocr.ai.strategies.accurate.description') || 'Maximum accuracy with full preprocessing',
      reasoning: needsHighAccuracy
        ? this.t('tools.ocr.ai.strategies.accurate.reasoningNeeded') || 'Recommended for low-quality documents'
        : this.t('tools.ocr.ai.strategies.accurate.reasoning') || 'Best for critical documents',
      settings: {
        languages: [languageDetection.primary, ...(languageDetection.secondary || []).slice(0, 2)],
        mode: 'accurate' as const,
        preserveLayout: true,
        outputFormat: 'text' as const,
        preprocessImage: true,
        preprocessOptions: {
          denoise: true,
          deskew: true,
          contrast: true,
          binarization: imageQuality.clarity < 50,
          removeBackground: false
        }
      },
      expectedAccuracy: 95,
      expectedTime: Math.max(60, file.size / (1024 * 1024) * 20),
      pros: [
        this.t('tools.ocr.ai.pros.highAccuracy') || 'Highest accuracy',
        this.t('tools.ocr.ai.pros.fullPreprocessing') || 'Full preprocessing',
        this.t('tools.ocr.ai.pros.multiLang3') || 'Up to 3 languages'
      ],
      cons: [
        this.t('tools.ocr.ai.cons.slowest') || 'Slowest processing',
        this.t('tools.ocr.ai.cons.highCPU') || 'High CPU usage'
      ]
    });

    // Strategy 4: Multi-Language Mode (if detected)
    if (languageDetection.mixedLanguages) {
      strategies.push({
        id: 'multilang',
        name: this.t('tools.ocr.ai.strategies.multilang.title') || 'Multi-Language Mode',
        description: this.t('tools.ocr.ai.strategies.multilang.description') || 'Optimized for mixed-language documents',
        reasoning: this.t('tools.ocr.ai.strategies.multilang.reasoning') || 'Document contains multiple languages',
        settings: {
          languages: [languageDetection.primary, ...(languageDetection.secondary || [])],
          mode: 'balanced' as const,
          preserveLayout: true,
          outputFormat: 'text' as const,
          preprocessImage: imageQuality.recommendPreprocessing,
          preprocessOptions: imageQuality.recommendPreprocessing ? {
            denoise: imageQuality.hasNoise,
            deskew: false,
            contrast: imageQuality.contrast < 60,
            binarization: false,
            removeBackground: false
          } : undefined
        },
        expectedAccuracy: 88,
        expectedTime: Math.max(40, file.size / (1024 * 1024) * 15),
        pros: [
          this.t('tools.ocr.ai.pros.multiLang') || 'Handles multiple languages',
          this.t('tools.ocr.ai.pros.goodAccuracy') || 'Good accuracy'
        ],
        cons: [
          this.t('tools.ocr.ai.cons.slowerProcessing') || 'Slower than fast mode',
          this.t('tools.ocr.ai.cons.moreMemory') || 'Uses more memory'
        ]
      });
    }

    // Determine recommended strategy
    let recommendedStrategy: OCRStrategyAdvanced;
    if (needsHighAccuracy) {
      recommendedStrategy = strategies.find(s => s.id === 'accurate')!;
    } else if (languageDetection.mixedLanguages) {
      recommendedStrategy = strategies.find(s => s.id === 'multilang')!;
    } else if (imageQuality.clarity > 80 && !documentStructure.hasColumns) {
      recommendedStrategy = strategies.find(s => s.id === 'fast')!;
    } else {
      recommendedStrategy = strategies.find(s => s.id === 'balanced')!;
    }

    // Generate warnings
    const warnings: AIWarning[] = [];
    if (imageQuality.clarity < 60) {
      warnings.push({
        type: 'quality',
        severity: 'warning',
        message: this.t('tools.ocr.ai.warnings.lowClarity.message') || 'Low image clarity detected',
        suggestion: this.t('tools.ocr.ai.warnings.lowClarity.suggestion') || 'Use High Accuracy mode for better results'
      });
    }

    if (imageQuality.hasNoise) {
      warnings.push({
        type: 'quality',
        severity: 'info',
        message: this.t('tools.ocr.ai.warnings.noise.message') || 'Image noise detected',
        suggestion: this.t('tools.ocr.ai.warnings.noise.suggestion') || 'Preprocessing will improve accuracy'
      });
    }

    if (documentStructure.hasColumns) {
      warnings.push({
        type: 'content',
        severity: 'info',
        message: this.t('tools.ocr.ai.warnings.columns.message') || 'Multi-column layout detected',
        suggestion: this.t('tools.ocr.ai.warnings.columns.suggestion') || 'Enable layout preservation'
      });
    }

    // Generate predictions
    const predictions: OCRPredictionsAdvanced = {
      processingTime: recommendedStrategy.expectedTime,
      accuracy: recommendedStrategy.expectedAccuracy,
      wordCount: Math.round(documentStructure.textDensity * 5),
      requiresPreprocessing: imageQuality.recommendPreprocessing,
      outputSize: `~${Math.round(file.size / (1024 * 10))}KB`
    };

    return {
      confidence,
      recommendedStrategy: recommendedStrategy.id,
      strategies,
      predictions,
      warnings,
      imageQuality,
      languageDetection,
      documentStructure,
      timestamp: new Date(),
      version: this.version
    };
  }

  private generateOCRRecommendations(doc: DocumentAnalysis, file: File): OCRRecommendations {
    const isScanned = doc.type === 'scanned' || doc.estimatedTextDensity === 'low';
    const languages = this.detectDocumentLanguages(doc, file);

    const strategies: OCRStrategy[] = [];

    if (isScanned) {
      // High accuracy for scanned documents
      strategies.push({
        mode: 'high-accuracy',
        title: this.t('tools.ocr.ai.strategies.highAccuracy.title'),
        description: this.t('tools.ocr.ai.strategies.highAccuracy.description'),
        expectedAccuracy: 95,
        processingTime: 'slow',
        languages: languages.slice(0, 2), // Limit to top 2 languages
        confidence: 90,
        reasoning: this.t('tools.ocr.ai.strategies.highAccuracy.reasoning')
      });
    }

    // Balanced approach
    strategies.push({
      mode: 'balanced',
      title: this.t('tools.ocr.ai.strategies.balanced.title'),
      description: this.t('tools.ocr.ai.strategies.balanced.description'),
      expectedAccuracy: 85,
      processingTime: 'medium',
      languages: languages.slice(0, 1),
      confidence: 85,
      reasoning: this.t('tools.ocr.ai.strategies.balanced.reasoning')
    });

    // Fast mode for quick preview
    strategies.push({
      mode: 'fast',
      title: this.t('tools.ocr.ai.strategies.fast.title'),
      description: this.t('tools.ocr.ai.strategies.fast.description'),
      expectedAccuracy: 75,
      processingTime: 'fast',
      languages: ['eng'], // Default to English
      confidence: 70,
      reasoning: this.t('tools.ocr.ai.strategies.fast.reasoning')
    });

    const warnings = this.generateOCRWarnings(doc, isScanned);
    const predictions = this.generateOCRPredictions(doc, strategies[0]);

    return {
      strategies,
      warnings,
      predictions,
      recommendedStrategy: strategies[0],
      detectedLanguages: languages,
      isScannedDocument: isScanned,
      timestamp: new Date(),
      version: this.version
    };
  }

  // === WATERMARK PDF AI RECOMMENDATIONS ===

  async analyzePDFForWatermark(file: File): Promise<WatermarkRecommendations> {
    console.log('🧠 Analyzing PDF for watermark recommendations:', file.name);

    try {
      const pdfInfo = await pdfService.getPDFInfo(file);
      const documentAnalysis = await this.analyzeDocument(file, pdfInfo);

      return this.generateWatermarkRecommendations(documentAnalysis, file);
    } catch (error) {
      console.error('Watermark analysis failed:', error);
      return this.getFallbackWatermarkRecommendations(file);
    }
  }

  private generateWatermarkRecommendations(doc: DocumentAnalysis, file: File): WatermarkRecommendations {
    const placements: WatermarkPlacement[] = [];

    // Center placement for most documents
    placements.push({
      position: 'center',
      title: this.t('tools.watermark.ai.placements.center.title'),
      description: this.t('tools.watermark.ai.placements.center.description'),
      opacity: 0.3,
      rotation: 45,
      confidence: 90,
      reasoning: this.t('tools.watermark.ai.placements.center.reasoning')
    });

    // Header placement for formal documents
    if (this.isFormalDocument(doc, file)) {
      placements.push({
        position: 'header',
        title: this.t('tools.watermark.ai.placements.header.title'),
        description: this.t('tools.watermark.ai.placements.header.description'),
        opacity: 0.5,
        rotation: 0,
        confidence: 75,
        reasoning: this.t('tools.watermark.ai.placements.header.reasoning')
      });
    }

    // Footer placement for reports
    if (doc.type === 'report' || doc.pages > 10) {
      placements.push({
        position: 'footer',
        title: this.t('tools.watermark.ai.placements.footer.title'),
        description: this.t('tools.watermark.ai.placements.footer.description'),
        opacity: 0.4,
        rotation: 0,
        confidence: 80,
        reasoning: this.t('tools.watermark.ai.placements.footer.reasoning')
      });
    }

    const textSuggestions = this.generateWatermarkTextSuggestions(doc, file);
    const warnings = this.generateWatermarkWarnings(doc);

    return {
      placements,
      textSuggestions,
      warnings,
      recommendedPlacement: placements[0],
      timestamp: new Date(),
      version: this.version
    };
  }

  // === SHARED HELPER METHODS ===

  private async analyzeDocument(file: File, pdfInfo: any): Promise<DocumentAnalysis> {
    return {
      id: `doc_${Date.now()}`,
      name: file.name,
      size: file.size,
      pages: pdfInfo.pages,
      created: new Date(file.lastModified),
      modified: new Date(file.lastModified),
      dimensions: pdfInfo.dimensions,
      orientation: this.determineOrientation(pdfInfo.dimensions),
      quality: this.estimateQuality(file, pdfInfo),
      type: this.determineDocumentType(file, pdfInfo),
      language: this.detectLanguage(file.name),
      hasBookmarks: false,
      hasAnnotations: false,
      compression: this.estimateCompression(file, pdfInfo),
      estimatedTextDensity: this.estimateTextDensity(file, pdfInfo)
    };
  }

  private determineOrientation(dimensions: { width: number; height: number }): 'portrait' | 'landscape' | 'mixed' {
    const { width, height } = dimensions;
    if (Math.abs(width - height) < 10) return 'mixed';
    return width > height ? 'landscape' : 'portrait';
  }

  private estimateQuality(file: File, pdfInfo: any): 'high' | 'medium' | 'low' {
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);
    if (sizePerPage > 500000) return 'high';
    if (sizePerPage > 100000) return 'medium';
    return 'low';
  }

  private determineDocumentType(file: File, pdfInfo: any): 'text' | 'scanned' | 'mixed' | 'presentation' | 'report' | 'form' | 'contract' | 'invoice' {
    const filename = file.name.toLowerCase();

    if (filename.includes('contract') || filename.includes('agreement')) return 'contract';
    if (filename.includes('invoice') || filename.includes('bill')) return 'invoice';
    if (filename.includes('form')) return 'form';
    if (filename.includes('report')) return 'report';
    if (filename.includes('presentation') || filename.includes('slide')) return 'presentation';
    if (filename.includes('scan') || filename.includes('scanned')) return 'scanned';

    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);
    if (sizePerPage > 1000000) return 'scanned';
    if (sizePerPage < 50000) return 'text';
    return 'mixed';
  }

  private detectLanguage(filename: string): string {
    try {
      const result = detectLanguageAdvanced(filename);
      return result.language;
    } catch {
      return 'eng';
    }
  }

  private estimateCompression(file: File, pdfInfo: any): 'none' | 'low' | 'medium' | 'high' {
    const sizePerPage = file.size / Math.max(pdfInfo.pages, 1);
    if (sizePerPage > 1000000) return 'none';
    if (sizePerPage > 500000) return 'low';
    if (sizePerPage > 100000) return 'medium';
    return 'high';
  }

  private estimateTextDensity(file: File, pdfInfo: any): 'low' | 'medium' | 'high' {
    const type = this.determineDocumentType(file, pdfInfo);
    if (type === 'scanned') return 'low';
    if (type === 'text') return 'high';
    return 'medium';
  }

  // === DOCUMENT TYPE HELPERS ===

  private isSensitiveDocument(doc: DocumentAnalysis, file: File): boolean {
    const sensitiveKeywords = ['confidential', 'private', 'internal', 'restricted', 'contract', 'agreement'];
    return sensitiveKeywords.some(keyword => file.name.toLowerCase().includes(keyword));
  }

  private isConfidentialDocument(doc: DocumentAnalysis, file: File): boolean {
    const confidentialKeywords = ['top secret', 'classified', 'confidential', 'nda'];
    return confidentialKeywords.some(keyword => file.name.toLowerCase().includes(keyword));
  }

  private isFormalDocument(doc: DocumentAnalysis, file: File): boolean {
    const formalKeywords = ['letter', 'official', 'formal', 'certificate', 'diploma'];
    return formalKeywords.some(keyword => file.name.toLowerCase().includes(keyword)) ||
           doc.type === 'contract' || doc.type === 'form';
  }

  private detectDocumentLanguages(doc: DocumentAnalysis, file: File): string[] {
    const filename = file.name.toLowerCase();
    const languages = ['eng']; // Default

    if (filename.includes('русский') || filename.includes('russian')) languages.unshift('rus');
    if (filename.includes('deutsch') || filename.includes('german')) languages.unshift('deu');
    if (filename.includes('français') || filename.includes('french')) languages.unshift('fra');
    if (filename.includes('español') || filename.includes('spanish')) languages.unshift('spa');

    return [...new Set(languages)]; // Remove duplicates
  }

  // === WARNING GENERATORS ===

  private generateSplitWarnings(doc: DocumentAnalysis): AIWarning[] {
    const warnings: AIWarning[] = [];

    if (doc.pages > 100) {
      warnings.push({
        type: 'performance',
        severity: 'warning',
        message: this.t('tools.split.ai.warnings.manyPages.message'),
        suggestion: this.t('tools.split.ai.warnings.manyPages.suggestion')
      });
    }

    if (doc.size > 50 * 1024 * 1024) {
      warnings.push({
        type: 'size',
        severity: 'info',
        message: this.t('tools.split.ai.warnings.largeFile.message'),
        suggestion: this.t('tools.split.ai.warnings.largeFile.suggestion')
      });
    }

    return warnings;
  }

  private generateCompressionWarnings(doc: DocumentAnalysis, file: File): AIWarning[] {
    const warnings: AIWarning[] = [];

    if (doc.quality === 'high') {
      warnings.push({
        type: 'quality',
        severity: 'warning',
        message: this.t('tools.compress.ai.warnings.highQuality.message'),
        suggestion: this.t('tools.compress.ai.warnings.highQuality.suggestion')
      });
    }

    if (doc.type === 'scanned') {
      warnings.push({
        type: 'content',
        severity: 'info',
        message: this.t('tools.compress.ai.warnings.scanned.message'),
        suggestion: this.t('tools.compress.ai.warnings.scanned.suggestion')
      });
    }

    return warnings;
  }

  private generateProtectionWarnings(doc: DocumentAnalysis): AIWarning[] {
    const warnings: AIWarning[] = [];

    if (doc.hasAnnotations) {
      warnings.push({
        type: 'content',
        severity: 'info',
        message: this.t('tools.protect.ai.warnings.annotations.message'),
        suggestion: this.t('tools.protect.ai.warnings.annotations.suggestion')
      });
    }

    return warnings;
  }

  private generateOCRWarnings(doc: DocumentAnalysis, isScanned: boolean): AIWarning[] {
    const warnings: AIWarning[] = [];

    if (!isScanned && doc.estimatedTextDensity === 'high') {
      warnings.push({
        type: 'content',
        severity: 'info',
        message: this.t('tools.ocr.ai.warnings.hasText.message'),
        suggestion: this.t('tools.ocr.ai.warnings.hasText.suggestion')
      });
    }

    if (doc.pages > 50) {
      warnings.push({
        type: 'performance',
        severity: 'warning',
        message: this.t('tools.ocr.ai.warnings.manyPages.message'),
        suggestion: this.t('tools.ocr.ai.warnings.manyPages.suggestion')
      });
    }

    return warnings;
  }

  private generateWatermarkWarnings(doc: DocumentAnalysis): AIWarning[] {
    const warnings: AIWarning[] = [];

    if (doc.quality === 'low') {
      warnings.push({
        type: 'quality',
        severity: 'warning',
        message: this.t('tools.watermark.ai.warnings.lowQuality.message'),
        suggestion: this.t('tools.watermark.ai.warnings.lowQuality.suggestion')
      });
    }

    return warnings;
  }

  // === PREDICTION GENERATORS ===

  private generateSplitPredictions(doc: DocumentAnalysis, strategy: SplitStrategy): SplitPredictions {
    const outputFiles = strategy.ranges.length;
    const avgFileSize = doc.size / outputFiles;
    const processingTime = Math.max(2, doc.pages * 0.1 + outputFiles * 0.5);

    return {
      outputFiles,
      avgFileSize,
      processingTime,
      confidence: strategy.confidence
    };
  }

  private generateCompressionPredictions(file: File, strategy: CompressionStrategy): CompressionPredictions {
    const savings = Math.round(file.size * (strategy.expectedSavings / 100));
    const newSize = file.size - savings;
    const processingTime = Math.max(3, (file.size / (1024 * 1024)) * 0.5);

    return {
      originalSize: file.size,
      estimatedSize: newSize,
      estimatedSavings: savings,
      processingTime,
      confidence: strategy.confidence
    };
  }

  private generateOCRPredictions(doc: DocumentAnalysis, strategy: OCRStrategy): OCRPredictions {
    const processingTimeMultiplier = strategy.mode === 'fast' ? 1 : strategy.mode === 'balanced' ? 2 : 3;
    const processingTime = Math.max(5, doc.pages * processingTimeMultiplier);
    const estimatedTextLength = doc.pages * (strategy.expectedAccuracy / 100) * 500; // 500 chars per page average

    return {
      processingTime,
      estimatedAccuracy: strategy.expectedAccuracy,
      estimatedTextLength,
      confidence: strategy.confidence
    };
  }

  // === FALLBACK METHODS ===

  private getFallbackSplitRecommendations(file: File): SplitRecommendations {
    return {
      strategies: [{
        type: 'equal',
        title: this.t('tools.split.ai.fallback.title'),
        description: this.t('tools.split.ai.fallback.description'),
        ranges: [{ start: 1, end: 1, label: this.t('tools.split.ai.fallback.label') }],
        confidence: 50,
        reasoning: this.t('tools.split.ai.fallback.reasoning')
      }],
      warnings: [],
      predictions: { outputFiles: 1, avgFileSize: file.size, processingTime: 2, confidence: 50 },
      recommendedStrategy: {} as any,
      timestamp: new Date(),
      version: this.version
    };
  }

  private getFallbackCompressionRecommendations(file: File): CompressionRecommendations {
    return {
      strategies: [{
        level: 'medium',
        title: this.t('tools.compress.ai.fallback.title'),
        description: this.t('tools.compress.ai.fallback.description'),
        expectedSavings: 30,
        confidence: 50,
        reasoning: this.t('tools.compress.ai.fallback.reasoning'),
        tradeoffs: []
      }],
      warnings: [],
      predictions: {
        originalSize: file.size,
        estimatedSize: Math.round(file.size * 0.7),
        estimatedSavings: Math.round(file.size * 0.3),
        processingTime: 5,
        confidence: 50
      },
      recommendedStrategy: {} as any,
      currentFileSize: file.size,
      timestamp: new Date(),
      version: this.version
    };
  }

  private getFallbackProtectionRecommendations(file: File): ProtectionRecommendations {
    return {
      securityLevels: [{
        level: 'basic',
        title: this.t('tools.protect.ai.fallback.title'),
        description: this.t('tools.protect.ai.fallback.description'),
        permissions: ['viewing'],
        restrictions: ['printing', 'copying'],
        passwordStrengthRequired: 'medium',
        confidence: 50,
        reasoning: this.t('tools.protect.ai.fallback.reasoning')
      }],
      warnings: [],
      suggestions: [],
      recommendedLevel: {} as any,
      timestamp: new Date(),
      version: this.version
    };
  }

  private getFallbackOCRRecommendations(file: File): OCRRecommendations {
    return {
      strategies: [{
        mode: 'balanced',
        title: this.t('tools.ocr.ai.fallback.title'),
        description: this.t('tools.ocr.ai.fallback.description'),
        expectedAccuracy: 80,
        processingTime: 'medium',
        languages: ['eng'],
        confidence: 50,
        reasoning: this.t('tools.ocr.ai.fallback.reasoning')
      }],
      warnings: [],
      predictions: { processingTime: 10, estimatedAccuracy: 80, estimatedTextLength: 1000, confidence: 50 },
      recommendedStrategy: {} as any,
      detectedLanguages: ['eng'],
      isScannedDocument: true,
      timestamp: new Date(),
      version: this.version
    };
  }

  private getFallbackOCRRecommendationsAdvanced(file: File): OCRRecommendationsAdvanced {
    return {
      confidence: 50,
      recommendedStrategy: 'balanced',
      strategies: [{
        id: 'balanced',
        name: 'Balanced Mode',
        description: 'Standard OCR processing',
        reasoning: 'Analysis unavailable, using default settings',
        settings: {
          languages: ['eng'],
          mode: 'balanced',
          preserveLayout: true,
          outputFormat: 'text',
          preprocessImage: false
        },
        expectedAccuracy: 80,
        expectedTime: 30,
        pros: ['Standard processing'],
        cons: ['No optimization']
      }],
      predictions: {
        processingTime: 30,
        accuracy: 80,
        wordCount: 500,
        requiresPreprocessing: false,
        outputSize: '~10KB'
      },
      warnings: [],
      imageQuality: {
        resolution: 150,
        clarity: 60,
        contrast: 60,
        skewAngle: 0,
        isScanned: true,
        hasNoise: false,
        recommendPreprocessing: false,
        suggestedOptions: {
          denoise: false,
          deskew: false,
          contrast: false,
          binarization: false,
          removeBackground: false
        }
      },
      languageDetection: {
        primary: 'eng',
        confidence: 50,
        script: 'latin',
        mixedLanguages: false,
        recommendedTesseractLangs: 'eng'
      },
      documentStructure: {
        hasColumns: false,
        hasTables: false,
        hasImages: false,
        hasHandwriting: false,
        layout: 'single',
        textDensity: 50,
        averageFontSize: 12
      },
      timestamp: new Date(),
      version: this.version
    };
  }

  private getFallbackWatermarkRecommendations(file: File): WatermarkRecommendations {
    return {
      placements: [{
        position: 'center',
        title: this.t('tools.watermark.ai.fallback.title'),
        description: this.t('tools.watermark.ai.fallback.description'),
        opacity: 0.3,
        rotation: 45,
        confidence: 50,
        reasoning: this.t('tools.watermark.ai.fallback.reasoning')
      }],
      textSuggestions: [this.t('tools.watermark.ai.fallback.textSuggestion')],
      warnings: [],
      recommendedPlacement: {} as any,
      timestamp: new Date(),
      version: this.version
    };
  }

  // === ADDITIONAL HELPERS ===

  private generatePasswordSuggestions(doc: DocumentAnalysis): string[] {
    const suggestions = [
      this.t('tools.protect.ai.passwords.suggestion1'),
      this.t('tools.protect.ai.passwords.suggestion2'),
      this.t('tools.protect.ai.passwords.suggestion3')
    ];

    if (doc.type === 'contract') {
      suggestions.unshift(this.t('tools.protect.ai.passwords.contractSuggestion'));
    }

    return suggestions;
  }

  private generateWatermarkTextSuggestions(doc: DocumentAnalysis, file: File): string[] {
    const baseName = file.name.replace(/\.(pdf|PDF)$/, '');

    return [
      this.t('tools.watermark.ai.textSuggestions.confidential'),
      this.t('tools.watermark.ai.textSuggestions.draft'),
      this.t('tools.watermark.ai.textSuggestions.copy'),
      baseName,
      this.t('tools.watermark.ai.textSuggestions.internal')
    ];
  }
}

// === TYPE DEFINITIONS ===

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
  type: 'text' | 'scanned' | 'mixed' | 'presentation' | 'report' | 'form' | 'contract' | 'invoice';
  language?: string;
  hasBookmarks: boolean;
  hasAnnotations: boolean;
  compression: 'none' | 'low' | 'medium' | 'high';
  estimatedTextDensity: 'low' | 'medium' | 'high';
}

export interface AIWarning {
  type: 'performance' | 'quality' | 'content' | 'size';
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion: string;
}

// Split PDF Types
export interface PageRange {
  start: number;
  end: number;
  label: string;
}

export interface SplitStrategy {
  type: 'chapters' | 'equal' | 'single' | 'custom';
  title: string;
  description: string;
  ranges: PageRange[];
  confidence: number;
  reasoning: string;
}

export interface SplitPredictions {
  outputFiles: number;
  avgFileSize: number;
  processingTime: number;
  confidence: number;
}

export interface SplitRecommendations {
  strategies: SplitStrategy[];
  warnings: AIWarning[];
  predictions: SplitPredictions;
  recommendedStrategy: SplitStrategy;
  timestamp: Date;
  version: string;
}

// Compression PDF Types
export interface CompressionStrategy {
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedSavings: number;
  confidence: number;
  reasoning: string;
  tradeoffs: string[];
}

export interface CompressionPredictions {
  originalSize: number;
  estimatedSize: number;
  estimatedSavings: number;
  processingTime: number;
  confidence: number;
}

export interface CompressionRecommendations {
  strategies: CompressionStrategy[];
  warnings: AIWarning[];
  predictions: CompressionPredictions;
  recommendedStrategy: CompressionStrategy;
  currentFileSize: number;
  timestamp: Date;
  version: string;
}

// Protect PDF Types
export interface SecurityLevel {
  level: 'basic' | 'medium' | 'high';
  title: string;
  description: string;
  permissions: string[];
  restrictions: string[];
  passwordStrengthRequired: 'weak' | 'medium' | 'strong' | 'very-strong';
  confidence: number;
  reasoning: string;
}

export interface ProtectionRecommendations {
  securityLevels: SecurityLevel[];
  warnings: AIWarning[];
  suggestions: string[];
  recommendedLevel: SecurityLevel;
  timestamp: Date;
  version: string;
}

// OCR PDF Types
export interface OCRStrategy {
  mode: 'fast' | 'balanced' | 'high-accuracy';
  title: string;
  description: string;
  expectedAccuracy: number;
  processingTime: 'fast' | 'medium' | 'slow';
  languages: string[];
  confidence: number;
  reasoning: string;
}

export interface OCRPredictions {
  processingTime: number;
  estimatedAccuracy: number;
  estimatedTextLength: number;
  confidence: number;
}

export interface OCRRecommendations {
  strategies: OCRStrategy[];
  warnings: AIWarning[];
  predictions: OCRPredictions;
  recommendedStrategy: OCRStrategy;
  detectedLanguages: string[];
  isScannedDocument: boolean;
  timestamp: Date;
  version: string;
}

// Watermark PDF Types
export interface WatermarkPlacement {
  position: 'center' | 'header' | 'footer' | 'corner';
  title: string;
  description: string;
  opacity: number;
  rotation: number;
  confidence: number;
  reasoning: string;
}

export interface WatermarkRecommendations {
  placements: WatermarkPlacement[];
  textSuggestions: string[];
  warnings: AIWarning[];
  recommendedPlacement: WatermarkPlacement;
  timestamp: Date;
  version: string;
}

// Advanced OCR Types
export interface OCRStrategyAdvanced {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  settings: {
    languages: string[];
    mode: 'fast' | 'balanced' | 'accurate';
    preserveLayout: boolean;
    outputFormat: 'text' | 'markdown' | 'json' | 'hocr';
    preprocessImage: boolean;
    preprocessOptions?: {
      denoise: boolean;
      deskew: boolean;
      contrast: boolean;
      binarization: boolean;
      removeBackground: boolean;
    };
  };
  expectedAccuracy: number;
  expectedTime: number;
  pros: string[];
  cons: string[];
}

export interface OCRPredictionsAdvanced {
  processingTime: number;
  accuracy: number;
  wordCount: number;
  requiresPreprocessing: boolean;
  outputSize: string;
}

export interface OCRRecommendationsAdvanced {
  confidence: number;
  recommendedStrategy: string;
  strategies: OCRStrategyAdvanced[];
  predictions: OCRPredictionsAdvanced;
  warnings: AIWarning[];
  imageQuality: {
    resolution: number;
    clarity: number;
    contrast: number;
    skewAngle: number;
    isScanned: boolean;
    hasNoise: boolean;
    recommendPreprocessing: boolean;
    suggestedOptions: {
      denoise: boolean;
      deskew: boolean;
      contrast: boolean;
      binarization: boolean;
      removeBackground: boolean;
    };
  };
  languageDetection: {
    primary: string;
    secondary?: string[];
    confidence: number;
    script: string;
    mixedLanguages: boolean;
    recommendedTesseractLangs: string;
  };
  documentStructure: {
    hasColumns: boolean;
    hasTables: boolean;
    hasImages: boolean;
    hasHandwriting: boolean;
    layout: 'single' | 'double' | 'complex';
    textDensity: number;
    averageFontSize: number;
  };
  timestamp: Date;
  version: string;
}

// Export singleton instance
export const smartPDFService = SmartPDFService.getInstance();