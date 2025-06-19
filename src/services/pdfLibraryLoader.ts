/**
 * PDF Libraries Lazy Loader
 * 
 * Динамически загружает PDF библиотеки только при необходимости.
 * Кеширует загруженные модули для повторного использования.
 * Предоставляет fallback и error recovery.
 */

interface PDFLibraries {
  pdfLib: typeof import('pdf-lib');
  jsPDF: typeof import('jspdf');
  pdfjsLib: typeof import('pdfjs-dist');
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  libraries: Partial<PDFLibraries>;
}

class PDFLibraryLoader {
  private loadingState: LoadingState = {
    isLoading: false,
    error: null,
    libraries: {}
  };

  private loadingPromise: Promise<PDFLibraries> | null = null;

  /**
   * Загружает все PDF библиотеки асинхронно
   */
  async loadAll(): Promise<PDFLibraries> {
    // Если уже загружаем - возвращаем тот же промис
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Если уже загружены - возвращаем кешированные
    if (this.isAllLoaded()) {
      return this.loadingState.libraries as PDFLibraries;
    }

    this.loadingPromise = this.performLoading();
    return this.loadingPromise;
  }

  /**
   * Загружает конкретную библиотеку
   */
  async loadLibrary<K extends keyof PDFLibraries>(
    libraryName: K
  ): Promise<PDFLibraries[K]> {
    if (this.loadingState.libraries[libraryName]) {
      return this.loadingState.libraries[libraryName] as PDFLibraries[K];
    }

    try {
      const library = await this.importLibrary(libraryName);
      this.loadingState.libraries[libraryName] = library;
      return library;
    } catch (error) {
      const errorMessage = `Failed to load ${libraryName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.loadingState.error = errorMessage;
      throw new Error(errorMessage);
    }
  }

  /**
   * Проверяет статус загрузки
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  /**
   * Проверяет, доступна ли библиотека
   */
  isLibraryLoaded<K extends keyof PDFLibraries>(libraryName: K): boolean {
    return !!this.loadingState.libraries[libraryName];
  }

  /**
   * Предзагружает библиотеки в фоне
   */
  async preloadLibraries(): Promise<void> {
    try {
      await this.loadAll();
    } catch (error) {
      console.warn('PDF libraries preloading failed:', error);
      // Не бросаем ошибку, так как это фоновая загрузка
    }
  }

  /**
   * Очищает кеш (для тестирования)
   */
  clearCache(): void {
    this.loadingState = {
      isLoading: false,
      error: null,
      libraries: {}
    };
    this.loadingPromise = null;
  }

  private async performLoading(): Promise<PDFLibraries> {
    this.loadingState.isLoading = true;
    this.loadingState.error = null;

    try {
      // Загружаем все библиотеки параллельно
      const [pdfLib, jsPDF, pdfjsLib] = await Promise.all([
        this.importLibrary('pdfLib'),
        this.importLibrary('jsPDF'), 
        this.importLibrary('pdfjsLib')
      ]);

      const libraries: PDFLibraries = { pdfLib, jsPDF, pdfjsLib };
      
      this.loadingState.libraries = libraries;
      this.loadingState.isLoading = false;
      
      return libraries;
    } catch (error) {
      this.loadingState.isLoading = false;
      this.loadingState.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async importLibrary<K extends keyof PDFLibraries>(
    libraryName: K
  ): Promise<PDFLibraries[K]> {
    const startTime = performance.now();
    
    try {
      let library: any;

      switch (libraryName) {
        case 'pdfLib':
          library = await import('pdf-lib');
          break;
        case 'jsPDF':
          library = await import('jspdf');
          break;
        case 'pdfjsLib':
          library = await import('pdfjs-dist');
          // Настраиваем worker для pdfjs
          await this.configurePdfjsWorker(library);
          break;
        default:
          throw new Error(`Unknown library: ${libraryName}`);
      }

      const loadTime = performance.now() - startTime;
      console.log(`📚 Loaded ${libraryName} in ${loadTime.toFixed(2)}ms`);
      
      return library;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      console.error(`❌ Failed to load ${libraryName} after ${loadTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  private async configurePdfjsWorker(pdfjsLib: any): Promise<void> {
    try {
      // Настраиваем worker URL для разных окружений
      const isProduction = import.meta.env.PROD;
      const workerUrl = isProduction 
        ? 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        : '/node_modules/pdfjs-dist/build/pdf.worker.mjs';

      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      
      console.log('🔧 PDF.js worker configured:', workerUrl);
    } catch (error) {
      console.warn('⚠️ PDF.js worker configuration failed:', error);
      // Продолжаем без worker (fallback)
    }
  }

  private isAllLoaded(): boolean {
    return !!(
      this.loadingState.libraries.pdfLib &&
      this.loadingState.libraries.jsPDF &&
      this.loadingState.libraries.pdfjsLib
    );
  }
}

// Singleton instance
export const pdfLibraryLoader = new PDFLibraryLoader();

// Export types for consumers
export type { PDFLibraries, LoadingState };

// Helper hooks for React components
export const usePDFLibraries = () => {
  const [state, setState] = React.useState<LoadingState>(
    pdfLibraryLoader.getLoadingState()
  );

  const loadLibraries = React.useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await pdfLibraryLoader.loadAll();
      setState(pdfLibraryLoader.getLoadingState());
    } catch (error) {
      setState(pdfLibraryLoader.getLoadingState());
    }
  }, []);

  const loadSpecificLibrary = React.useCallback(async <K extends keyof PDFLibraries>(
    libraryName: K
  ) => {
    try {
      return await pdfLibraryLoader.loadLibrary(libraryName);
    } catch (error) {
      setState(pdfLibraryLoader.getLoadingState());
      throw error;
    }
  }, []);

  return {
    ...state,
    loadLibraries,
    loadSpecificLibrary,
    isLibraryLoaded: pdfLibraryLoader.isLibraryLoaded.bind(pdfLibraryLoader)
  };
};

// Performance monitoring
export const PDFLibraryMetrics = {
  measureLoadTime: async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      console.log(`⚡ ${operation} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`💥 ${operation} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
};

import React from 'react';
