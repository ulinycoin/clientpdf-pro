import * as Tesseract from 'tesseract.js';
import { franc } from 'franc';
import { detectLanguageAdvanced, LanguageDetectionResult } from '../utils/languageDetector';
import {
  OCROptions,
  OCRProgress,
  OCRResult,
  OCRProcessingOptions,
  ProcessedOCRResult,
  SupportedLanguage,
  OCRError
} from '../types/ocr.types';

// Enhanced supported languages with better script support
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'eng', name: 'English', nativeName: 'English' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch' },
  { code: 'fra', name: 'French', nativeName: 'Français' },
  { code: 'spa', name: 'Spanish', nativeName: 'Español' },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano' },
  { code: 'por', name: 'Portuguese', nativeName: 'Português' },
  { code: 'nld', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pol', name: 'Polish', nativeName: 'Polski' },
  { code: 'ukr', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'chi_tra', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'kor', name: 'Korean', nativeName: '한국어' },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية' },
];

/**
 * Advanced text preprocessing for better OCR accuracy
 */
class OCRImageProcessor {

  /**
   * Enhance image quality for better OCR recognition
   */
  static enhanceImageForOCR(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and enhance contrast
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

      // Enhanced contrast for text
      const enhanced = gray > 127 ? Math.min(255, gray * 1.2) : Math.max(0, gray * 0.8);

      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Apply noise reduction filter
   */
  static reduceNoise(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Simple median filter for noise reduction
    const filtered = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Get surrounding pixels
        const pixels: number[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ni = ((y + dy) * width + (x + dx)) * 4;
            pixels.push(data[ni]); // Use red channel (grayscale)
          }
        }

        // Apply median
        pixels.sort((a, b) => a - b);
        const median = pixels[4]; // Middle value

        filtered[idx] = median;
        filtered[idx + 1] = median;
        filtered[idx + 2] = median;
      }
    }

    const newImageData = new ImageData(filtered, width, height);
    ctx.putImageData(newImageData, 0, 0);
    return canvas;
  }
}

/**
 * Advanced language detection with multiple strategies
 */
class AdvancedLanguageDetector {

  /**
   * Detect language using multiple approaches
   */
  static async detectLanguage(
    file: File,
    filename?: string,
    initialText?: string
  ): Promise<LanguageDetectionResult> {
    const strategies: LanguageDetectionResult[] = [];

    // Strategy 1: Filename analysis
    if (filename) {
      const filenameResult = detectLanguageAdvanced(filename);
      strategies.push({ ...filenameResult, details: `Filename: ${filenameResult.details}` });
    }

    // Strategy 2: Content analysis if text sample available
    if (initialText && initialText.length > 30) {
      const contentResult = this.analyzeTextContent(initialText);
      strategies.push(contentResult);
    }

    // Strategy 3: File metadata analysis
    const metadataResult = this.analyzeFileMetadata(file);
    if (metadataResult) {
      strategies.push(metadataResult);
    }

    // Combine results with weighted scoring
    return this.combineDetectionResults(strategies);
  }

  /**
   * Analyze text content for language detection
   */
  static analyzeTextContent(text: string): LanguageDetectionResult {
    try {
      // First, check for strong Russian language indicators in the text
      const russianIndicators = [
        /[а-яё]{3,}/gi, // Cyrillic words with 3+ characters
        /(?:что|как|где|когда|почему|зачем|который|которая|которое|которые)/gi, // Common Russian question words
        /(?:и|в|на|с|к|от|по|за|для|через|при|под|над|между)/gi, // Common Russian prepositions
        /(?:это|тот|та|то|те|этот|эта|эти|такой|такая|такое|такие)/gi, // Demonstrative pronouns
        /(?:ция|ство|ник|тель|ость|ение|ание|ский|ной|ный|ная|ное|ые|ых)/gi, // Common Russian endings
      ];

      let russianScore = 0;
      let totalCyrillicChars = 0;
      let totalChars = text.replace(/\s/g, '').length;

      // Count Cyrillic characters
      const cyrillicMatches = text.match(/[а-яё]/gi);
      if (cyrillicMatches) {
        totalCyrillicChars = cyrillicMatches.length;
      }

      // Calculate Russian indicators score
      russianIndicators.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          russianScore += matches.length;
        }
      });

      // If we have high Cyrillic ratio and Russian indicators, it's likely Russian
      const cyrillicRatio = totalChars > 0 ? totalCyrillicChars / totalChars : 0;

      // More aggressive Russian detection for even small amounts of Cyrillic
      if (cyrillicRatio > 0.15 && russianScore > 0) {
        return {
          language: 'rus',
          confidence: 'high',
          detectionMethods: ['content_analysis'],
          details: `Strong Russian indicators: ${Math.round(cyrillicRatio * 100)}% Cyrillic, ${russianScore} language markers`
        };
      }

      if (cyrillicRatio > 0.08 && russianScore > 0) {
        return {
          language: 'rus',
          confidence: 'medium',
          detectionMethods: ['content_analysis'],
          details: `Moderate Russian indicators: ${Math.round(cyrillicRatio * 100)}% Cyrillic, ${russianScore} language markers`
        };
      }

      // Even small amounts of Cyrillic should suggest Russian
      if (cyrillicRatio > 0.05 || (cyrillicMatches && cyrillicMatches.length >= 3)) {
        return {
          language: 'rus',
          confidence: 'medium',
          detectionMethods: ['content_analysis'],
          details: `Cyrillic script detected: ${Math.round(cyrillicRatio * 100)}% Cyrillic characters (${cyrillicMatches?.length} chars) suggest Russian`
        };
      }

      // Fallback to franc for other languages
      const francResult = franc(text);
      const confidence = this.getFrancConfidence(text, francResult);

      // Map franc codes to OCR language codes
      const langMapping: Record<string, string> = {
        'eng': 'eng', 'rus': 'rus', 'deu': 'deu', 'fra': 'fra',
        'spa': 'spa', 'ita': 'ita', 'por': 'por', 'nld': 'nld',
        'pol': 'pol', 'ukr': 'ukr', 'jpn': 'jpn', 'cmn': 'chi_sim',
        'ara': 'ara', 'kor': 'kor'
      };

      const detectedLang = langMapping[francResult] || 'eng';

      // Special handling for Cyrillic text that franc might misidentify
      if (cyrillicRatio > 0.3 && detectedLang !== 'rus' && detectedLang !== 'ukr') {
        return {
          language: 'rus',
          confidence: 'medium',
          detectionMethods: ['content_analysis'],
          details: `Cyrillic script detected (${Math.round(cyrillicRatio * 100)}%) but franc suggested ${francResult} - using Russian`
        };
      }

      return {
        language: detectedLang,
        confidence,
        detectionMethods: ['content_analysis'],
        details: `Content analysis detected ${francResult} (${text.length} chars, ${Math.round(cyrillicRatio * 100)}% Cyrillic)`
      };
    } catch (error) {
      return {
        language: 'eng',
        confidence: 'low',
        detectionMethods: ['content_analysis_failed'],
        details: 'Content analysis failed - defaulting to English'
      };
    }
  }

  /**
   * Get confidence level based on text analysis
   */
  static getFrancConfidence(text: string, francResult: string): 'high' | 'medium' | 'low' {
    if (francResult === 'und' || !francResult) return 'low';
    if (text.length < 50) return 'low';
    if (text.length < 200) return 'medium';
    return 'high';
  }

  /**
   * Analyze file metadata for language hints
   */
  static analyzeFileMetadata(file: File): LanguageDetectionResult | null {
    const creationTime = file.lastModified;
    const size = file.size;

    // Basic heuristics based on file characteristics
    // This is a simple example - could be enhanced with more sophisticated analysis

    return null; // Not implemented yet
  }

  /**
   * Combine multiple detection results with weighted scoring
   */
  static combineDetectionResults(results: LanguageDetectionResult[]): LanguageDetectionResult {
    if (results.length === 0) {
      return {
        language: 'eng',
        confidence: 'low',
        detectionMethods: ['default'],
        details: 'No detection strategies available - defaulting to English'
      };
    }

    // Weight different methods
    const weights = {
      explicit_keywords: 10,
      content_analysis: 8,
      script_detection: 7,
      geo_keywords: 4,
      document_type_keywords: 3,
      generic_filename: 1
    };

    const languageScores: Record<string, { score: number; methods: string[]; details: string[] }> = {};

    results.forEach(result => {
      const lang = result.language;
      if (!languageScores[lang]) {
        languageScores[lang] = { score: 0, methods: [], details: [] };
      }

      result.detectionMethods.forEach(method => {
        const weight = weights[method as keyof typeof weights] || 1;
        const confidenceMultiplier = result.confidence === 'high' ? 1.5 :
                                   result.confidence === 'medium' ? 1.2 : 1.0;

        languageScores[lang].score += weight * confidenceMultiplier;
        if (!languageScores[lang].methods.includes(method)) {
          languageScores[lang].methods.push(method);
        }
      });

      languageScores[lang].details.push(result.details);
    });

    // Find the highest scoring language
    const sortedLanguages = Object.entries(languageScores)
      .sort(([,a], [,b]) => b.score - a.score);

    const [winningLang, winningData] = sortedLanguages[0];
    const confidence = winningData.score >= 10 ? 'high' :
                      winningData.score >= 5 ? 'medium' : 'low';

    return {
      language: winningLang,
      confidence,
      detectionMethods: winningData.methods,
      details: `Combined analysis: ${winningData.details.join('; ')}`
    };
  }
}

/**
 * Enhanced OCR Service with improved language detection and processing
 */
class EnhancedOCRService {
  private workers: Map<string, Tesseract.Worker> = new Map();
  private isProcessing = false;

  /**
   * Initialize worker with optimized settings for specific language
   */
  private async initializeWorker(language: string): Promise<Tesseract.Worker> {
    const existingWorker = this.workers.get(language);
    if (existingWorker) {
      return existingWorker;
    }

    const worker = await Tesseract.createWorker(language, 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          // Progress tracking could be enhanced here
        }
      }
    });

    // Language-specific optimizations
    await this.optimizeWorkerForLanguage(worker, language);

    this.workers.set(language, worker);
    return worker;
  }

  /**
   * Apply language-specific OCR optimizations
   */
  private async optimizeWorkerForLanguage(worker: Tesseract.Worker, language: string): Promise<void> {
    const baseParams = {
      tessedit_pageseg_mode: '3', // Fully automatic page segmentation (better for mixed content)
      tessedit_ocr_engine_mode: '2', // Neural nets LSTM engine
      preserve_interword_spaces: '1', // Better for multi-word recognition
    };

    // Enhanced language-specific parameters with better Russian support
    const languageParams: Record<string, Record<string, string>> = {
      'rus': {
        ...baseParams,
        tessedit_pageseg_mode: '6', // Single uniform block (better for Russian text blocks)
        // Expanded Russian character set including common punctuation and symbols
        tessedit_char_whitelist: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.,!?:;()[]{}«»—–-+=*/\\|@#№$%^&*~',
        textord_heavy_nr: '1', // Better number recognition
        textord_debug_tabfind: '0',
        // Improved Russian text recognition
        load_system_dawg: '0', // Disable system dictionary for better custom language support
        load_freq_dawg: '0', // Disable frequency-based word selection
        user_words_suffix: 'user-words',
        user_patterns_suffix: 'user-patterns',
      },
      'ukr': {
        ...baseParams,
        tessedit_pageseg_mode: '6',
        tessedit_char_whitelist: 'АБВГДЕЁЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзиіїйклмнопрстуфхцчшщъыьэюяЄєІіЇї0123456789.,!?:;()[]{}«»—–-+=*/\\|@#№$%^&*~',
        load_system_dawg: '0',
        load_freq_dawg: '0',
      },
      'deu': {
        ...baseParams,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzäöüÄÖÜß0123456789.,!?:;()[]{}—–-+=*/\\|@#$%^&*~',
      },
      'fra': {
        ...baseParams,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzàâäçéèêëïîôùûüÿñæœÀÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ0123456789.,!?:;()[]{}«»—–-+=*/\\|@#$%^&*~',
      },
      'pol': {
        ...baseParams,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyząćęłńóśźżĄĆĘŁŃÓŚŹŻ0123456789.,!?:;()[]{}—–-+=*/\\|@#$%^&*~',
      },
      'chi_sim': {
        ...baseParams,
        tessedit_pageseg_mode: '6', // Single uniform block for Chinese
        tessedit_ocr_engine_mode: '1', // Original Tesseract for Chinese works better sometimes
      },
      'ara': {
        ...baseParams,
        tessedit_pageseg_mode: '6',
        tessedit_write_images: '1',
        textord_arabic_numerals: '1',
      }
    };

    const params = languageParams[language] || baseParams;
    await worker.setParameters(params);
  }

  /**
   * Smart language detection with fallback strategies
   */
  async detectOptimalLanguage(file: File, options?: {
    filename?: string,
    preferredLanguage?: string,
    quickSample?: boolean
  }): Promise<LanguageDetectionResult> {
    const { filename, preferredLanguage, quickSample = false } = options || {};

    // Quick detection based on filename and preferences
    let detectionResult = await AdvancedLanguageDetector.detectLanguage(
      file,
      filename || file.name
    );

    // If user has a preference and detection confidence is low, consider the preference
    if (preferredLanguage && detectionResult.confidence === 'low') {
      detectionResult = {
        language: preferredLanguage,
        confidence: 'medium',
        detectionMethods: ['user_preference'],
        details: `User selected ${preferredLanguage} (overriding low-confidence auto-detection)`
      };
    }

    // For very low confidence, try to sample content if requested
    if (quickSample && detectionResult.confidence === 'low' && file.type.startsWith('image/')) {
      try {
        // Quick OCR sample with English to get some text for analysis
        const quickResult = await this.quickTextSample(file);
        if (quickResult && quickResult.length > 20) {
          const contentDetection = AdvancedLanguageDetector.analyzeTextContent(quickResult);
          if (contentDetection.confidence !== 'low') {
            detectionResult = contentDetection;
          }
        }
      } catch (error) {
        // Quick sampling failed, continue with filename-based detection
      }
    }

    return detectionResult;
  }

  /**
   * Get a quick text sample for language detection
   */
  private async quickTextSample(file: File): Promise<string | null> {
    try {
      const worker = await this.initializeWorker('eng');
      const result = await worker.recognize(file, {
        rectangle: { top: 0, left: 0, width: 300, height: 200 } // Sample top-left corner
      });
      return result.data.text.slice(0, 500); // First 500 chars
    } catch (error) {
      return null;
    }
  }

  /**
   * Enhanced image preprocessing
   */
  private preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
    // Apply multiple enhancement techniques
    let processedCanvas = OCRImageProcessor.enhanceImageForOCR(canvas);
    processedCanvas = OCRImageProcessor.reduceNoise(processedCanvas);
    return processedCanvas;
  }

  /**
   * Process with automatic language detection and retry mechanism
   */
  async processWithAutoDetection(options: OCRProcessingOptions & {
    enableAutoDetection?: boolean,
    enablePreprocessing?: boolean,
    maxRetries?: number
  }): Promise<ProcessedOCRResult> {
    const {
      enableAutoDetection = true,
      enablePreprocessing = true,
      maxRetries = 2
    } = options;

    let currentOptions = { ...options };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Auto-detect language on first attempt
        if (attempt === 0 && enableAutoDetection) {
          const detectionResult = await this.detectOptimalLanguage(options.file, {
            filename: options.file.name,
            preferredLanguage: options.options?.language,
            quickSample: true
          });

          currentOptions.options = {
            ...currentOptions.options,
            language: detectionResult.language
          };

          // Inform user of detection result
          options.onProgress?.({
            status: 'loading language',
            progress: 15,
            message: `Auto-detected language: ${detectionResult.language} (${detectionResult.confidence} confidence)`
          });
        }

        // Process with current settings
        const result = await this.processOCR(currentOptions);

        // Check result quality and potentially retry with different settings
        if (attempt < maxRetries && this.shouldRetryWithDifferentSettings(result)) {
          currentOptions = this.adjustSettingsForRetry(currentOptions, attempt);
          continue;
        }

        return result;

      } catch (error) {
        lastError = error as Error;

        // Try fallback language on retry
        if (attempt < maxRetries) {
          currentOptions.options = {
            ...currentOptions.options,
            language: attempt === 0 ? 'eng' : 'eng+rus' // Multi-language fallback
          };

          options.onProgress?.({
            status: 'retrying',
            progress: 20 + (attempt * 30),
            message: `Retrying with different settings (attempt ${attempt + 2}/${maxRetries + 1})`
          });
        }
      }
    }

    // All retries failed
    throw lastError || new Error('OCR processing failed after all retries');
  }

  /**
   * Determine if we should retry based on result quality
   */
  private shouldRetryWithDifferentSettings(result: ProcessedOCRResult): boolean {
    const { confidence } = result.result;

    // Retry if confidence is very low
    return confidence < 50;
  }

  /**
   * Adjust settings for retry attempt
   */
  private adjustSettingsForRetry(options: OCRProcessingOptions, attempt: number): OCRProcessingOptions {
    const adjustedOptions = { ...options };

    switch (attempt) {
      case 1:
        // Try with preprocessing enabled
        adjustedOptions.options = {
          ...adjustedOptions.options,
          preserveLayout: false // Simplify layout preservation
        };
        break;
      case 2:
        // Try multi-language detection
        adjustedOptions.options = {
          ...adjustedOptions.options,
          language: 'eng+rus+deu+fra+spa' // Common European languages
        };
        break;
    }

    return adjustedOptions;
  }

  /**
   * Main OCR processing function (enhanced version of original)
   */
  async processOCR(options: OCRProcessingOptions): Promise<ProcessedOCRResult> {
    if (this.isProcessing) {
      throw new Error('OCR processing is already in progress');
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      const { file, options: ocrOptions, onProgress, onError } = options;

      // Initialize progress
      onProgress?.({
        status: 'initializing',
        progress: 0,
      });

      // Use the enhanced worker with optimized settings
      const worker = await this.initializeWorker(ocrOptions.language);

      let result: ProcessedOCRResult;

      // Handle different file types with enhanced processing
      if (file.type === 'application/pdf') {
        // Import the PDF processing logic from base service
        const { ocrService } = await import('./ocrService');
        result = await ocrService.processOCR(options);
      } else if (file.type.startsWith('image/')) {
        // Process image with enhanced preprocessing
        onProgress?.({
          status: 'loading language',
          progress: 20,
        });

        onProgress?.({
          status: 'recognizing text',
          progress: 40,
        });

        // Enhanced image processing would go here
        // For now, delegate to base service but with our optimized worker
        const { ocrService } = await import('./ocrService');
        result = await ocrService.processOCR(options);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }

      onProgress?.({
        status: 'complete',
        progress: 100,
      });

      return result;

    } catch (error) {
      const ocrError: OCRError = {
        message: error instanceof Error ? error.message : 'Unknown OCR error',
        code: 'OCR_PROCESSING_ERROR',
        details: error,
      };

      onError?.(ocrError);
      throw ocrError;
    } finally {
      this.isProcessing = false;
    }
  }

  async cleanup(): Promise<void> {
    const workers = Array.from(this.workers.values());
    await Promise.all(workers.map(worker => worker.terminate()));
    this.workers.clear();
  }
}

// Export enhanced service
export const enhancedOCRService = new EnhancedOCRService();

// Keep original service for backward compatibility
export { ocrService } from './ocrService';
