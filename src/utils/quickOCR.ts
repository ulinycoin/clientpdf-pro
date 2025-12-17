import * as Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { detectLanguageAdvanced, type LanguageDetectionResult } from './languageDetector';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Quick OCR for language detection - processes only a small sample
export class QuickOCR {
  private static worker: Tesseract.Worker | null = null;
  private static loadedLanguages: Set<string> = new Set();
  private static isInitializing = false;
  private static initializationPromise: Promise<Tesseract.Worker> | null = null;

  // Initialize a shared worker for quick analysis
  private static async getWorker(): Promise<Tesseract.Worker> {
    // If already initializing, wait for that to complete
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    if (!this.worker) {
      this.isInitializing = true;
      this.initializationPromise = (async () => {
        try {
          this.worker = await Tesseract.createWorker('eng', 1, {
            logger: () => { } // Disable logging for quick analysis
          });
          this.loadedLanguages.add('eng');
          return this.worker;
        } finally {
          this.isInitializing = false;
          this.initializationPromise = null;
        }
      })();
      return this.initializationPromise;
    }
    return this.worker;
  }

  // Load a language into the existing worker
  private static async ensureLanguageLoaded(language: string): Promise<void> {
    if (this.loadedLanguages.has(language)) {
      return; // Language already loaded
    }

    const worker = await this.getWorker();

    console.log(`📥 QuickOCR: Loading language '${language}' into existing worker...`);

    // Load the additional language
    // @ts-expect-error - loadLanguage exists on Worker in Tesseract v5
    await worker.loadLanguage(language);
    // @ts-expect-error - initialize exists on Worker in Tesseract v5
    await worker.initialize(language);

    this.loadedLanguages.add(language);
    console.log(`✅ QuickOCR: Language '${language}' loaded successfully`);
  }

  // Reinitialize worker with a specific language (for recognition)
  private static async setLanguage(language: string): Promise<void> {
    await this.ensureLanguageLoaded(language);
    const worker = await this.getWorker();
    await worker.reinitialize(language);
  }

  // Extract a small sample from PDF for quick analysis
  private static async extractPDFSample(file: File): Promise<HTMLCanvasElement | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (pdf.numPages === 0) return null;

      // Get first page only
      const page = await pdf.getPage(1);
      const scale = 1.0; // Lower scale for quick analysis
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;

      // Only process a portion of the page (top-left quarter)
      const sampleWidth = Math.min(viewport.width, 800);
      const sampleHeight = Math.min(viewport.height, 600);

      canvas.height = sampleHeight;
      canvas.width = sampleWidth;

      // @ts-expect-error - RenderParameters type definition might be outdated/strict requiring canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      return canvas;
    } catch (error) {
      console.warn('Failed to extract PDF sample:', error);
      return null;
    }
  }

  // Extract sample from image
  private static async extractImageSample(file: File): Promise<HTMLCanvasElement | null> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;

          // Process only a sample portion for speed
          const maxSize = 800;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

          canvas.width = Math.min(img.width * scale, maxSize);
          canvas.height = Math.min(img.height * scale, maxSize);

          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas);
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.warn('Failed to extract image sample:', error);
      return null;
    }
  }

  // Perform quick OCR analysis for language detection
  public static async quickAnalyzeForLanguage(file: File): Promise<LanguageDetectionResult> {
    console.log('🔍 QuickOCR: Starting analysis for file:', file.name, 'Type:', file.type);

    try {
      let sampleCanvas: HTMLCanvasElement | null = null;

      // Extract sample based on file type
      if (file.type === 'application/pdf') {
        console.log('📄 QuickOCR: Processing PDF file');
        sampleCanvas = await this.extractPDFSample(file);
      } else if (file.type.startsWith('image/')) {
        console.log('🖼️ QuickOCR: Processing image file');
        sampleCanvas = await this.extractImageSample(file);
      }

      if (!sampleCanvas) {
        console.log('❌ QuickOCR: Failed to extract canvas, using filename detection');
        // Fallback to filename-only detection
        return detectLanguageAdvanced(file.name);
      }

      console.log('✅ QuickOCR: Canvas extracted, size:', sampleCanvas.width + 'x' + sampleCanvas.height);

      // Pre-analysis: Check filename for language hints
      const filenameHints = detectLanguageAdvanced(file.name);
      console.log('📝 QuickOCR: Filename suggests:', filenameHints.language, '(confidence:', filenameHints.confidence + ')');

      // Multi-language OCR strategy
      let extractedText = '';
      let bestLanguage = 'eng';
      let bestConfidence = 0;


      // Strategy: Try up to 2 languages based on confidence
      // 1. If filename has high confidence → try that language + English
      // 2. If filename has medium/low confidence → try English only (then use Franc)

      const languagesToTry: string[] = [];

      if (filenameHints.confidence === 'high' && filenameHints.language !== 'eng') {
        // High confidence from filename - try both native language and English
        languagesToTry.push(filenameHints.language, 'eng');
        console.log(`🎯 QuickOCR: High confidence from filename - will try: ${filenameHints.language}, eng`);
      } else {
        // Low/medium confidence or English - start with English
        languagesToTry.push('eng');
        console.log('🎯 QuickOCR: Will try: eng (then analyze content)');
      }

      // Try each language
      for (const lang of languagesToTry) {
        console.log(`🔤 QuickOCR: Starting ${lang.toUpperCase()} OCR analysis`);

        try {
          await this.setLanguage(lang);
          const worker = await this.getWorker();

          const result = await worker.recognize(sampleCanvas);
          const text = result.data.text?.slice(0, 500) || '';
          const confidence = result.data.confidence || 0;

          console.log(`📝 QuickOCR: ${lang.toUpperCase()} text preview:`, text.substring(0, 100) + '...');
          console.log(`📊 QuickOCR: ${lang.toUpperCase()} confidence:`, confidence.toFixed(1) + '%');

          // Keep track of best result
          if (confidence > bestConfidence) {
            bestLanguage = lang;
            bestConfidence = confidence;
            extractedText = text;
          }
        } catch (error) {
          console.warn(`❌ QuickOCR: ${lang.toUpperCase()} OCR failed:`, error);
        }
      }

      console.log(`✅ QuickOCR: Best initial result: ${bestLanguage.toUpperCase()} (confidence: ${bestConfidence.toFixed(1)}%)`);

      // Ensure we're back on English for future operations
      await this.setLanguage('eng');

      // If we only tried English and confidence is low, use Franc to suggest another language
      if (languagesToTry.length === 1 && bestConfidence < 80) {
        console.log('⚠️ QuickOCR: Low confidence from English OCR - analyzing content with Franc');

        // Quick Franc analysis to suggest a better language
        const quickFrancResult = detectLanguageAdvanced(file.name, extractedText);

        console.log('🔍 QuickOCR: Franc suggests:', quickFrancResult.language, '(confidence:', quickFrancResult.confidence + ')');

        // If Franc has high confidence and suggests non-English, try that language
        if (quickFrancResult.confidence === 'high' &&
          quickFrancResult.language !== 'eng' &&
          quickFrancResult.language !== bestLanguage) {

          console.log(`🌐 QuickOCR: Trying ${quickFrancResult.language.toUpperCase()} based on Franc suggestion`);

          try {
            await this.setLanguage(quickFrancResult.language);
            const worker = await this.getWorker();

            const result = await worker.recognize(sampleCanvas);
            const text = result.data.text?.slice(0, 500) || '';
            const confidence = result.data.confidence || 0;

            console.log(`📝 QuickOCR: ${quickFrancResult.language.toUpperCase()} text preview:`, text.substring(0, 100) + '...');
            console.log(`📊 QuickOCR: ${quickFrancResult.language.toUpperCase()} confidence:`, confidence.toFixed(1) + '%');

            // Use Franc-suggested language if it's significantly better
            if (confidence > bestConfidence + 5) {
              console.log(`✅ QuickOCR: Using ${quickFrancResult.language.toUpperCase()} result (better quality)`);
              bestLanguage = quickFrancResult.language;
              bestConfidence = confidence;
              extractedText = text;
            }

            // Switch back to English
            await this.setLanguage('eng');

          } catch (error) {
            console.warn(`❌ QuickOCR: ${quickFrancResult.language.toUpperCase()} OCR failed:`, error);
            await this.setLanguage('eng');
          }
        }
      }

      // Use the best extracted text for final language detection
      console.log('🎯 QuickOCR: Using text for final language detection');
      console.log('🎯 QuickOCR: Best language from OCR:', bestLanguage, '(confidence:', bestConfidence.toFixed(1) + '%)');

      const finalResult = file.type.startsWith('image/') ?
        detectLanguageAdvanced('content_analysis.txt', extractedText) :
        detectLanguageAdvanced(file.name, extractedText);

      // If OCR tried a non-English language and had good confidence, trust it over Franc
      if (bestLanguage !== 'eng' && bestConfidence >= 75) {
        console.log('✅ QuickOCR: Using OCR-detected language:', bestLanguage, '(high OCR confidence)');
        finalResult.language = bestLanguage;
        finalResult.confidence = 'high';
        finalResult.detectionMethods.push('ocr_native_model');
        finalResult.details = `Detected ${bestLanguage} via OCR with native language model (confidence: ${bestConfidence.toFixed(1)}%)`;
      }

      console.log('🏁 QuickOCR: Final detection result:', finalResult);
      return finalResult;

    } catch (error) {
      console.error('💥 QuickOCR: Analysis failed:', error);
      // Fallback to filename-only detection
      return detectLanguageAdvanced(file.name);
    }
  }

  // Preload commonly used languages for faster switching
  public static async preloadLanguages(languages: string[]): Promise<void> {
    console.log(`📦 QuickOCR: Preloading languages:`, languages.join(', '));

    try {
      await this.getWorker(); // Ensure worker is initialized

      for (const lang of languages) {
        if (!this.loadedLanguages.has(lang)) {
          await this.ensureLanguageLoaded(lang);
        }
      }

      console.log(`✅ QuickOCR: All languages preloaded successfully`);
    } catch (error) {
      console.warn('❌ QuickOCR: Language preloading failed:', error);
    }
  }

  // Get list of currently loaded languages
  public static getLoadedLanguages(): string[] {
    return Array.from(this.loadedLanguages);
  }

  // Check if worker is initialized
  public static isInitialized(): boolean {
    return this.worker !== null;
  }

  // Clean up worker when done
  public static async cleanup(): Promise<void> {
    if (this.worker) {
      console.log('🧹 QuickOCR: Cleaning up worker');
      await this.worker.terminate();
      this.worker = null;
      this.loadedLanguages.clear();
    }
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    QuickOCR.cleanup();
  });
}
