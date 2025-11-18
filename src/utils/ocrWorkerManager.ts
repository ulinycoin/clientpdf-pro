/**
 * OCR Worker Manager
 *
 * Manages a persistent Tesseract.js worker that can be reused across multiple OCR operations.
 * Supports dynamic language loading to avoid recreating workers unnecessarily.
 */

import * as Tesseract from 'tesseract.js';

export class OCRWorkerManager {
  private static worker: Tesseract.Worker | null = null;
  private static currentLanguage: string | null = null;
  private static loadedLanguages: Set<string> = new Set();
  private static isInitializing = false;
  private static initializationPromise: Promise<Tesseract.Worker> | null = null;

  /**
   * Get or create a worker for the specified language
   */
  public static async getWorker(language: string): Promise<Tesseract.Worker> {
    // If already initializing, wait for that to complete
    if (this.isInitializing && this.initializationPromise) {
      await this.initializationPromise;
    }

    // If no worker exists, create one
    if (!this.worker) {
      return this.createWorker(language);
    }

    // If worker exists but needs different language, switch to it
    if (this.currentLanguage !== language) {
      await this.switchLanguage(language);
    }

    return this.worker;
  }

  /**
   * Create a new worker with the specified language
   */
  private static async createWorker(language: string): Promise<Tesseract.Worker> {
    this.isInitializing = true;
    this.initializationPromise = (async () => {
      try {
        console.log(`🚀 OCRWorkerManager: Creating worker with language '${language}'`);

        this.worker = await Tesseract.createWorker(language, 1, {
          logger: () => {} // Suppress default logging
        });

        this.currentLanguage = language;
        this.loadedLanguages.add(language);

        console.log(`✅ OCRWorkerManager: Worker created successfully`);

        return this.worker;
      } finally {
        this.isInitializing = false;
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Switch the worker to a different language
   */
  private static async switchLanguage(language: string): Promise<void> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    console.log(`🔄 OCRWorkerManager: Switching from '${this.currentLanguage}' to '${language}'`);

    // If language is not loaded, load it
    if (!this.loadedLanguages.has(language)) {
      console.log(`📥 OCRWorkerManager: Loading new language '${language}'`);
      await this.worker.loadLanguage(language);
      await this.worker.initialize(language);
      this.loadedLanguages.add(language);
    } else {
      // Language already loaded, just reinitialize with it
      console.log(`♻️ OCRWorkerManager: Reusing already loaded language '${language}'`);
      await this.worker.reinitialize(language);
    }

    this.currentLanguage = language;
    console.log(`✅ OCRWorkerManager: Switched to '${language}' successfully`);
  }

  /**
   * Preload multiple languages for faster switching later
   */
  public static async preloadLanguages(languages: string[]): Promise<void> {
    console.log(`📦 OCRWorkerManager: Preloading languages:`, languages.join(', '));

    try {
      // Ensure worker exists (will be created with first language)
      if (!this.worker) {
        await this.getWorker(languages[0]);
      }

      // Load remaining languages
      for (let i = 1; i < languages.length; i++) {
        const lang = languages[i];
        if (!this.loadedLanguages.has(lang) && this.worker) {
          console.log(`📥 OCRWorkerManager: Preloading language '${lang}'`);
          await this.worker.loadLanguage(lang);
          await this.worker.initialize(lang);
          this.loadedLanguages.add(lang);
        }
      }

      // Switch back to first language
      if (this.worker && languages.length > 0 && this.currentLanguage !== languages[0]) {
        await this.worker.reinitialize(languages[0]);
        this.currentLanguage = languages[0];
      }

      console.log(`✅ OCRWorkerManager: Preloaded ${this.loadedLanguages.size} languages`);
    } catch (error) {
      console.warn('❌ OCRWorkerManager: Language preloading failed:', error);
    }
  }

  /**
   * Get information about the current worker state
   */
  public static getWorkerInfo(): {
    isInitialized: boolean;
    currentLanguage: string | null;
    loadedLanguages: string[];
  } {
    return {
      isInitialized: this.worker !== null,
      currentLanguage: this.currentLanguage,
      loadedLanguages: Array.from(this.loadedLanguages),
    };
  }

  /**
   * Terminate the worker and clean up resources
   */
  public static async cleanup(): Promise<void> {
    if (this.worker) {
      console.log('🧹 OCRWorkerManager: Cleaning up worker');
      await this.worker.terminate();
      this.worker = null;
      this.currentLanguage = null;
      this.loadedLanguages.clear();
      console.log('✅ OCRWorkerManager: Cleanup complete');
    }
  }

  /**
   * Force recreate the worker (useful if worker becomes corrupted)
   */
  public static async recreate(language: string): Promise<Tesseract.Worker> {
    console.log('🔄 OCRWorkerManager: Force recreating worker');
    await this.cleanup();
    return this.createWorker(language);
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    OCRWorkerManager.cleanup();
  });
}
