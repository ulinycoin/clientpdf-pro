/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

// src/services/pdfLibraryLoader.ts

// Кэш для загруженных библиотек
const libraryCache = new Map<string, any>();

// Флаги состояния загрузки
const loadingState = new Map<string, Promise<any>>();

/**
 * Инициализация pako для pdf-lib
 */
async function initializePako() {
  try {
    // Проверяем, не загружен ли уже pako
    if (typeof window !== 'undefined' && (window as any).pako) {
      return (window as any).pako;
    }

    // Импортируем pako с правильной обработкой модулей
    const pakoModule = await import('pako');
    
    // Создаем объект со всеми необходимыми методами для pdf-lib
    const pako = {
      deflate: pakoModule.deflate || pakoModule.default?.deflate,
      inflate: pakoModule.inflate || pakoModule.default?.inflate,
      deflateRaw: pakoModule.deflateRaw || pakoModule.default?.deflateRaw,
      inflateRaw: pakoModule.inflateRaw || pakoModule.default?.inflateRaw,
      gzip: pakoModule.gzip || pakoModule.default?.gzip,
      ungzip: pakoModule.ungzip || pakoModule.default?.ungzip,
      Deflate: pakoModule.Deflate || pakoModule.default?.Deflate,
      Inflate: pakoModule.Inflate || pakoModule.default?.Inflate,
      constants: pakoModule.constants || pakoModule.default?.constants,
    };
    
    // Делаем pako доступным глобально
    if (typeof window !== 'undefined') {
      (window as any).pako = pako;
    }
    
    return pako;
  } catch (error) {
    console.error('Failed to initialize pako:', error);
    throw new Error('Failed to initialize compression library');
  }
}

/**
 * Загружает библиотеку pdf-lib с ленивой загрузкой
 */
export async function loadPDFLib() {
  const cacheKey = 'pdf-lib';
  
  // Проверяем кэш
  if (libraryCache.has(cacheKey)) {
    return libraryCache.get(cacheKey);
  }
  
  // Проверяем, не загружается ли уже
  if (loadingState.has(cacheKey)) {
    return loadingState.get(cacheKey);
  }
  
  // Создаем промис загрузки
  const loadingPromise = (async () => {
    try {
      // Сначала инициализируем pako
      await initializePako();
      
      // Затем загружаем pdf-lib
      const pdfLib = await import('pdf-lib');
      
      // Кэшируем результат
      libraryCache.set(cacheKey, pdfLib);
      loadingState.delete(cacheKey);
      
      return pdfLib;
    } catch (error) {
      loadingState.delete(cacheKey);
      console.error('Failed to load pdf-lib:', error);
      throw new Error('Failed to load PDF processing library');
    }
  })();
  
  loadingState.set(cacheKey, loadingPromise);
  return loadingPromise;
}

/**
 * Загружает библиотеку jsPDF с ленивой загрузкой
 */
export async function loadJsPDF() {
  const cacheKey = 'jspdf';
  
  if (libraryCache.has(cacheKey)) {
    return libraryCache.get(cacheKey);
  }
  
  if (loadingState.has(cacheKey)) {
    return loadingState.get(cacheKey);
  }
  
  const loadingPromise = (async () => {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      libraryCache.set(cacheKey, { jsPDF });
      loadingState.delete(cacheKey);
      
      return { jsPDF };
    } catch (error) {
      loadingState.delete(cacheKey);
      console.error('Failed to load jsPDF:', error);
      throw new Error('Failed to load PDF generation library');
    }
  })();
  
  loadingState.set(cacheKey, loadingPromise);
  return loadingPromise;
}

/**
 * Загружает библиотеку pdfjs-dist с ленивой загрузкой
 */
export async function loadPDFJS() {
  const cacheKey = 'pdfjs';
  
  if (libraryCache.has(cacheKey)) {
    return libraryCache.get(cacheKey);
  }
  
  if (loadingState.has(cacheKey)) {
    return loadingState.get(cacheKey);
  }
  
  const loadingPromise = (async () => {
    try {
      // Динамический импорт с настройкой worker
      const pdfjsLib = await import('pdfjs-dist');
      
      // Настройка worker для pdfjs
      const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      
      libraryCache.set(cacheKey, pdfjsLib);
      loadingState.delete(cacheKey);
      
      return pdfjsLib;
    } catch (error) {
      loadingState.delete(cacheKey);
      console.error('Failed to load PDF.js:', error);
      throw new Error('Failed to load PDF viewing library');
    }
  })();
  
  loadingState.set(cacheKey, loadingPromise);
  return loadingPromise;
}

/**
 * Загружает библиотеку html2canvas с ленивой загрузкой
 */
export async function loadHtml2Canvas() {
  const cacheKey = 'html2canvas';
  
  if (libraryCache.has(cacheKey)) {
    return libraryCache.get(cacheKey);
  }
  
  if (loadingState.has(cacheKey)) {
    return loadingState.get(cacheKey);
  }
  
  const loadingPromise = (async () => {
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      libraryCache.set(cacheKey, html2canvas);
      loadingState.delete(cacheKey);
      
      return html2canvas;
    } catch (error) {
      loadingState.delete(cacheKey);
      console.error('Failed to load html2canvas:', error);
      throw new Error('Failed to load HTML to canvas library');
    }
  })();
  
  loadingState.set(cacheKey, loadingPromise);
  return loadingPromise;
}

/**
 * Предзагружает все PDF библиотеки
 */
export async function preloadAllLibraries() {
  try {
    await Promise.all([
      loadPDFLib(),
      loadJsPDF(),
      loadPDFJS(),
      loadHtml2Canvas()
    ]);
  } catch (error) {
    console.error('Failed to preload PDF libraries:', error);
  }
}

/**
 * Очищает кэш библиотек (для тестирования или при нехватке памяти)
 */
export function clearLibraryCache() {
  libraryCache.clear();
  loadingState.clear();
}
