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
            logger: () => {} // Disable logging for quick analysis
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
    await worker.loadLanguage(language);
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

      await page.render({
        canvasContext: context,
        viewport: viewport
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

      // For images, try Russian OCR first to avoid misdetection
      let extractedText = '';
      let shouldTryRussian = false;

      if (file.type.startsWith('image/')) {
        console.log('🖼️ QuickOCR: Image file detected - trying Russian OCR first');
        shouldTryRussian = true;
      } else {
        // For PDFs, try English first
        const worker = await this.getWorker();
        console.log('🔤 QuickOCR: Starting English OCR analysis');

        const englishResult = await worker.recognize(sampleCanvas);

        extractedText = englishResult.data.text?.slice(0, 500) || '';
        console.log('📝 QuickOCR: Extracted text preview:', extractedText.substring(0, 100) + '...');

        // If we detect Cyrillic characters, try again with Russian OCR
        const cyrillicMatches = extractedText.match(/[а-яё]/gi);
        const cyrillicRatio = extractedText.length > 0 ? (cyrillicMatches?.length || 0) / extractedText.length : 0;

        console.log('🔍 QuickOCR: Cyrillic analysis - ratio:', Math.round(cyrillicRatio * 100) + '%');

        shouldTryRussian = cyrillicRatio > 0.05 || (cyrillicMatches && cyrillicMatches.length >= 3);
      }

      if (shouldTryRussian) {
        console.log('🇷🇺 QuickOCR: Trying Russian OCR with existing worker');
        try {
          // Use the existing worker, just switch to Russian
          await this.setLanguage('rus');
          const worker = await this.getWorker();

          const russianResult = await worker.recognize(sampleCanvas);

          const russianText = russianResult.data.text?.slice(0, 500) || '';
          console.log('🇷🇺 QuickOCR: Russian OCR result preview:', russianText.substring(0, 100) + '...');

          // Use Russian-extracted text if it's better quality
          if (russianText.length > extractedText.length * 0.8) {
            console.log('✅ QuickOCR: Using Russian OCR result');
            return detectLanguageAdvanced(file.name, russianText);
          }

          // Switch back to English for future use
          await this.setLanguage('eng');
        } catch (russianError) {
          console.warn('❌ QuickOCR: Russian OCR failed:', russianError);
          // Try to switch back to English in case of error
          try {
            await this.setLanguage('eng');
          } catch (e) {
            // If this fails, worker might be corrupted, cleanup and recreate
            await this.cleanup();
          }
        }
      }

      // Use the extracted text for language detection
      console.log('🎯 QuickOCR: Using text for final language detection');
      const finalResult = file.type.startsWith('image/') ?
        detectLanguageAdvanced('content_analysis.txt', extractedText) :
        detectLanguageAdvanced(file.name, extractedText);

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
