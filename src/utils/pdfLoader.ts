import type { PDFDocumentProxy } from 'pdfjs-dist'

/**
 * Lazy loader для pdfjs-dist с обработкой eval проблем
 * Решает проблему безопасности и производительности
 */
export const loadPDFJS = async () => {
  try {
    // Динамический импорт pdfjs-dist
    const [pdfjs, pdfjsWorker] = await Promise.all([
      import('pdfjs-dist/build/pdf'),
      import('pdfjs-dist/build/pdf.worker.entry')
    ])
    
    // Настройка worker'а для безопасной работы
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default
    
    // Отключаем небезопасные функции
    if (typeof window !== 'undefined') {
      // Патчим eval если он используется внутри pdfjs
      const originalEval = window.eval
      window.eval = () => {
        throw new Error('eval is disabled for security reasons')
      }
      
      // Восстанавливаем после загрузки (если нужно для других частей)
      setTimeout(() => {
        window.eval = originalEval
      }, 100)
    }
    
    return {
      getDocument: pdfjs.getDocument,
      GlobalWorkerOptions: pdfjs.GlobalWorkerOptions,
      version: pdfjs.version
    }
  } catch (error) {
    console.error('Failed to load PDF.js:', error)
    throw new Error('PDF.js loading failed')
  }
}

/**
 * Lazy loader для pdf-lib
 */
export const loadPDFLib = async () => {
  try {
    const pdfLib = await import('pdf-lib')
    return pdfLib
  } catch (error) {
    console.error('Failed to load PDF-lib:', error)
    throw new Error('PDF-lib loading failed')
  }
}

/**
 * Lazy loader для jsPDF + html2canvas
 */
export const loadPDFGenerator = async () => {
  try {
    const [jsPDF, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ])
    
    return {
      jsPDF: jsPDF.jsPDF,
      html2canvas: html2canvas.default
    }
  } catch (error) {
    console.error('Failed to load PDF generator:', error)
    throw new Error('PDF generator loading failed')
  }
}

/**
 * Безопасная загрузка PDF документа с обработкой ошибок
 */
export const safePDFLoader = async (
  file: ArrayBuffer,
  options?: {
    password?: string
    maxPages?: number
  }
): Promise<PDFDocumentProxy> => {
  try {
    const { getDocument } = await loadPDFJS()
    
    const loadingTask = getDocument({
      data: file,
      password: options?.password,
      // Настройки безопасности
      disableAutoFetch: true,
      disableStream: true,
      disableRange: true,
      // Лимиты для производительности
      maxImageSize: 1024 * 1024 * 10, // 10MB для изображений
      isEvalSupported: false, // Отключаем eval
      isOffscreenCanvasSupported: false,
    })
    
    const pdf = await loadingTask.promise
    
    // Проверяем лимиты
    if (options?.maxPages && pdf.numPages > options.maxPages) {
      throw new Error(`PDF has too many pages: ${pdf.numPages} > ${options.maxPages}`)
    }
    
    return pdf
  } catch (error) {
    console.error('PDF loading failed:', error)
    
    if (error instanceof Error) {
      // Обработка специфичных ошибок PDF.js
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The file is not a valid PDF document')
      }
      if (error.message.includes('password')) {
        throw new Error('This PDF is password protected')
      }
      if (error.message.includes('too many pages')) {
        throw error // Пробрасываем как есть
      }
    }
    
    throw new Error('Failed to load PDF file')
  }
}

/**
 * Предзагрузка PDF библиотек при hover/focus
 */
export const preloadPDFLibraries = () => {
  const preloadPromises = [
    loadPDFJS().catch(() => null),
    loadPDFLib().catch(() => null),
  ]
  
  return Promise.allSettled(preloadPromises)
}

/**
 * Проверка поддержки PDF функций в браузере
 */
export const checkPDFSupport = () => {
  const support = {
    webAssembly: typeof WebAssembly !== 'undefined',
    workers: typeof Worker !== 'undefined',
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    arrayBuffer: typeof ArrayBuffer !== 'undefined',
    fileReader: typeof FileReader !== 'undefined',
  }
  
  const isSupported = support.webAssembly && 
                     support.workers && 
                     support.arrayBuffer && 
                     support.fileReader
  
  return {
    isSupported,
    details: support
  }
}

/**
 * Утилита для мониторинга размера файла
 */
export const validatePDFFile = (file: File) => {
  const MAX_SIZE = 100 * 1024 * 1024 // 100MB
  const MIN_SIZE = 100 // 100 bytes
  
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB > 100MB`)
  }
  
  if (file.size < MIN_SIZE) {
    throw new Error('File too small to be a valid PDF')
  }
  
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('File must be a PDF document')
  }
  
  return true
}
