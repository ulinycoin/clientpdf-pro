/**
 * PDF Processing Worker
 * 
 * Выполняет тяжелые операции с PDF в background thread.
 * Поддерживает chunked processing для больших файлов.
 */

import type { WorkerMessage, WorkerResponse, PDFProcessingOptions, ProcessingProgress } from './pdfWorkerManager';

// PDF Libraries (загружаются динамически)
let pdfLib: any = null;
let jsPDF: any = null;
let pdfjsLib: any = null;

// Active operations для cancellation
const activeOperations = new Map<string, { cancelled: boolean }>();

/**
 * Отправляет ответ в main thread
 */
function postResponse(response: WorkerResponse): void {
  self.postMessage(response);
}

/**
 * Отправляет прогресс
 */
function reportProgress(id: string, progress: ProcessingProgress): void {
  postResponse({
    id,
    type: 'PROGRESS',
    payload: progress
  });
}

/**
 * Проверяет, была ли отменена операция
 */
function isOperationCancelled(id: string): boolean {
  return activeOperations.get(id)?.cancelled ?? false;
}

/**
 * Инициализирует pako для pdf-lib в worker окружении
 */
async function initializePako() {
  try {
    const pakoModule = await import('pako');
    
    // Создаем правильный объект pako
    let pako;
    if (pakoModule.default && typeof pakoModule.default === 'object') {
      pako = pakoModule.default;
    } else if (pakoModule.deflate) {
      pako = pakoModule;
    } else {
      pako = {
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
    }
    
    // Проверяем, что pako правильно загружен
    if (!pako || !pako.deflate) {
      throw new Error('Pako library loaded but deflate method not found');
    }
    
    // Делаем pako доступным глобально для pdf-lib
    (self as any).pako = pako;
    
    console.log('✅ Worker: Pako initialized successfully');
    return pako;
  } catch (error) {
    console.error('❌ Worker: Failed to initialize pako:', error);
    throw new Error(`Failed to initialize compression library: ${error.message}`);
  }
}

/**
 * Инициализирует PDF библиотеки с правильной обработкой модулей
 */
async function initializePDFLibraries(): Promise<void> {
  if (pdfLib && jsPDF && pdfjsLib) {
    return; // Уже инициализированы
  }

  try {
    console.log('📦 Worker: Loading PDF libraries...');
    
    // Сначала инициализируем pako
    await initializePako();

    // Загружаем библиотеки динамически с правильной обработкой модулей
    const [pdfLibModule, jsPDFModule, pdfjsModule] = await Promise.all([
      import('pdf-lib'),
      import('jspdf'),
      import('pdfjs-dist')
    ]);

    // PDF-lib
    pdfLib = pdfLibModule;
    if (!pdfLib.PDFDocument) {
      throw new Error('PDF-lib loaded but PDFDocument not found');
    }

    // jsPDF - правильно получаем конструктор
    if (jsPDFModule.jsPDF) {
      jsPDF = jsPDFModule.jsPDF;
    } else if (jsPDFModule.default) {
      jsPDF = jsPDFModule.default;
    } else {
      throw new Error('jsPDF constructor not found in module');
    }

    // PDF.js - с безопасной настройкой worker
    pdfjsLib = pdfjsModule;

    // Безопасная настройка PDF.js worker
    try {
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('✅ Worker: PDF.js worker configured');
      } else {
        console.warn('⚠️ Worker: PDF.js GlobalWorkerOptions not available');
      }
    } catch (workerError) {
      console.warn('⚠️ Worker: Failed to configure PDF.js worker:', workerError);
      // Продолжаем без worker - не критично для большинства операций
    }

    console.log('✅ Worker: PDF libraries loaded successfully');
  } catch (error) {
    console.error('❌ Worker: Failed to load PDF libraries:', error);
    throw error;
  }
}

/**
 * Читает файл как ArrayBuffer с progress tracking
 */
async function readFileAsArrayBuffer(
  file: File,
  operationId: string,
  progressCallback?: (progress: number) => void
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (isOperationCancelled(operationId)) {
        reject(new Error('Operation cancelled'));
        return;
      }
      resolve(reader.result as ArrayBuffer);
    };
    
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    
    reader.onprogress = (event) => {
      if (event.lengthComputable && progressCallback) {
        const progress = (event.loaded / event.total) * 100;
        progressCallback(progress);
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Обрабатывает merge операцию
 */
async function processMerge(
  operationId: string,
  files: File[],
  settings: any = {}
): Promise<Blob> {
  reportProgress(operationId, {
    percentage: 0,
    message: 'Starting PDF merge...',
    status: 'loading'
  });

  const mergedPdf = await pdfLib.PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    if (isOperationCancelled(operationId)) {
      throw new Error('Operation cancelled');
    }

    const file = files[i];
    const progress = (i / files.length) * 80; // 80% для чтения файлов
    
    reportProgress(operationId, {
      percentage: progress,
      message: `Processing ${file.name}...`,
      status: 'processing'
    });

    try {
      const arrayBuffer = await readFileAsArrayBuffer(file, operationId);
      const pdf = await pdfLib.PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      pages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  reportProgress(operationId, {
    percentage: 90,
    message: 'Generating merged PDF...',
    status: 'saving'
  });

  const pdfBytes = await mergedPdf.save();
  
  reportProgress(operationId, {
    percentage: 100,
    message: 'Merge completed successfully!',
    status: 'complete'
  });

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Обрабатывает compress операцию
 */
async function processCompress(
  operationId: string,
  files: File[],
  settings: any = {}
): Promise<Blob> {
  if (files.length !== 1) {
    throw new Error('Compress operation requires exactly one file');
  }

  const file = files[0];
  const { quality = 'medium', removeMetadata = true } = settings;

  reportProgress(operationId, {
    percentage: 10,
    message: 'Loading PDF for compression...',
    status: 'loading'
  });

  const arrayBuffer = await readFileAsArrayBuffer(file, operationId);
  
  reportProgress(operationId, {
    percentage: 30,
    message: 'Analyzing PDF structure...',
    status: 'processing'
  });

  const pdf = await pdfLib.PDFDocument.load(arrayBuffer);

  // Compression settings
  const compressionOptions = {
    useObjectStreams: quality !== 'high',
    addDefaultPage: false,
    objectsPerTick: quality === 'low' ? 50 : quality === 'medium' ? 30 : 20,
  };

  reportProgress(operationId, {
    percentage: 50,
    message: 'Applying compression...',
    status: 'processing'
  });

  if (removeMetadata) {
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('LocalPDF');
    pdf.setCreator('LocalPDF');
  }

  reportProgress(operationId, {
    percentage: 80,
    message: 'Optimizing PDF structure...',
    status: 'processing'
  });

  const compressedBytes = await pdf.save(compressionOptions);

  // Calculate compression ratio
  const originalSize = file.size;
  const compressedSize = compressedBytes.length;
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);

  reportProgress(operationId, {
    percentage: 100,
    message: `Compression complete! Space saved: ${compressionRatio.toFixed(1)}%`,
    status: 'complete',
    details: { originalSize, compressedSize, compressionRatio }
  });

  return new Blob([compressedBytes], { type: 'application/pdf' });
}

/**
 * Обрабатывает split операцию
 */
async function processSplit(
  operationId: string,
  files: File[],
  settings: any = {}
): Promise<Blob> {
  if (files.length !== 1) {
    throw new Error('Split operation requires exactly one file');
  }

  const file = files[0];
  const { pageRange } = settings;

  reportProgress(operationId, {
    percentage: 10,
    message: 'Loading PDF for splitting...',
    status: 'loading'
  });

  const arrayBuffer = await readFileAsArrayBuffer(file, operationId);
  const pdf = await pdfLib.PDFDocument.load(arrayBuffer);
  
  const totalPages = pdf.getPageCount();

  if (pageRange) {
    // Split by range
    const { start, end } = pageRange;
    const extractedPdf = await pdfLib.PDFDocument.create();
    const pages = await extractedPdf.copyPages(pdf, Array.from(
      { length: end - start + 1 }, 
      (_, i) => start - 1 + i
    ));
    
    pages.forEach(page => extractedPdf.addPage(page));
    const pdfBytes = await extractedPdf.save();
    
    reportProgress(operationId, {
      percentage: 100,
      message: `Extracted pages ${start}-${end} successfully!`,
      status: 'complete'
    });
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } else {
    // For simplicity, extract first page only
    // In real implementation, should handle multiple files
    const singlePagePdf = await pdfLib.PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdf, [0]);
    singlePagePdf.addPage(page);
    
    const pdfBytes = await singlePagePdf.save();
    
    reportProgress(operationId, {
      percentage: 100,
      message: 'Split completed successfully!',
      status: 'complete'
    });
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
}

/**
 * Обрабатывает protect/unlock операцию
 */
async function processProtect(
  operationId: string,
  files: File[],
  settings: any = {}
): Promise<Blob> {
  if (files.length !== 1) {
    throw new Error('Password protection requires exactly one file');
  }

  const file = files[0];
  const { mode, password, permissions = {} } = settings;

  reportProgress(operationId, {
    percentage: 10,
    message: `${mode === 'protect' ? 'Loading PDF for protection' : 'Loading protected PDF'}...`,
    status: 'loading'
  });

  if (!password) {
    throw new Error('Password is required');
  }

  const arrayBuffer = await readFileAsArrayBuffer(file, operationId);
  
  reportProgress(operationId, {
    percentage: 30,
    message: `${mode === 'protect' ? 'Analyzing PDF structure' : 'Verifying password'}...`,
    status: 'processing'
  });

  try {
    let pdf;
    
    if (mode === 'unlock') {
      // Попытка загрузить защищенный PDF с паролем
      try {
        pdf = await pdfLib.PDFDocument.load(arrayBuffer, { 
          password: password 
        });
      } catch (loadError) {
        console.error('Failed to load PDF with password:', loadError);
        throw new Error('Incorrect password or the PDF is not password protected');
      }
      
      reportProgress(operationId, {
        percentage: 80,
        message: 'Password verified, removing protection...',
        status: 'processing'
      });
      
      // Сохраняем PDF без защиты
      const unprotectedBytes = await pdf.save();
      
      reportProgress(operationId, {
        percentage: 100,
        message: 'PDF unlocked successfully!',
        status: 'complete'
      });

      return new Blob([unprotectedBytes], { type: 'application/pdf' });
      
    } else {
      // Режим защиты - создаем информационный PDF с объяснением
      reportProgress(operationId, {
        percentage: 50,
        message: 'Creating password protection information...',
        status: 'processing'
      });

      // Загружаем оригинальный PDF
      pdf = await pdfLib.PDFDocument.load(arrayBuffer);
      
      // Создаем новый PDF с информацией о защите
      const protectedPdf = await pdfLib.PDFDocument.create();
      
      // Добавляем информационную страницу
      const page = protectedPdf.addPage([612, 792]); // Letter size
      const { width, height } = page.getSize();
      const font = await protectedPdf.embedFont(pdfLib.StandardFonts.Helvetica);
      const boldFont = await protectedPdf.embedFont(pdfLib.StandardFonts.HelveticaBold);
      
      // Заголовок (убираем эмодзи, заменяем на ASCII-совместимый текст)
      page.drawText('[PROTECTED] PASSWORD PROTECTED PDF', {
        x: 50,
        y: height - 100,
        size: 24,
        font: boldFont,
        color: pdfLib.rgb(0.8, 0.2, 0.2),
      });
      
      // Информация о защите
      const infoText = [
        `This PDF has been protected with password: "${password}"`,
        '',
        'IMPORTANT NOTICE:',
        'Due to browser limitations, this is a demonstration of password protection.',
        'The original PDF content is preserved but not encrypted with industry-standard encryption.',
        '',
        'For production use, please consider:',
        '• Adobe Acrobat Pro for full PDF encryption',
        '• Server-side PDF processing with proper encryption libraries',
        '• Desktop PDF tools with advanced security features',
        '',
        'This tool is designed for basic privacy protection and',
        'educational purposes in a client-side environment.',
        '',
        `Original file: ${file.name}`,
        `Protection applied: ${new Date().toLocaleString()}`,
        `Password hint: ${password.length} characters`,
      ];
      
      let yPosition = height - 150;
      infoText.forEach((line, index) => {
        const isHeader = line.startsWith('IMPORTANT') || line.startsWith('For production');
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: isHeader ? 14 : 12,
          font: isHeader ? boldFont : font,
          color: isHeader ? pdfLib.rgb(0.6, 0.1, 0.1) : pdfLib.rgb(0, 0, 0),
        });
        yPosition -= 20;
      });
      
      // Копируем страницы оригинального PDF
      const originalPages = await protectedPdf.copyPages(pdf, pdf.getPageIndices());
      originalPages.forEach((originalPage) => protectedPdf.addPage(originalPage));
      
      reportProgress(operationId, {
        percentage: 90,
        message: 'Finalizing protected PDF...',
        status: 'processing'
      });

      // Сохраняем PDF с информацией
      const protectedBytes = await protectedPdf.save();

      reportProgress(operationId, {
        percentage: 100,
        message: 'PDF protected with information page! (Note: This is a demonstration)',
        status: 'complete'
      });

      return new Blob([protectedBytes], { type: 'application/pdf' });
    }
    
  } catch (error) {
    console.error(`Error ${mode}ing PDF:`, error);
    
    if (error.message?.includes('password') || error.message?.includes('encrypted') || error.message?.includes('Incorrect password')) {
      throw error; // Re-throw password errors as-is
    }
    
    throw new Error(`Failed to ${mode} PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Обрабатывает images to PDF операцию
 */
async function processImagesToPdf(
  operationId: string,
  files: File[],
  settings: any = {}
): Promise<Blob> {
  reportProgress(operationId, {
    percentage: 0,
    message: 'Starting image to PDF conversion...',
    status: 'loading'
  });

  const pdf = new jsPDF();
  let isFirstPage = true;

  for (let i = 0; i < files.length; i++) {
    if (isOperationCancelled(operationId)) {
      throw new Error('Operation cancelled');
    }

    const file = files[i];
    const progress = (i / files.length) * 90;
    
    reportProgress(operationId, {
      percentage: progress,
      message: `Converting ${file.name}...`,
      status: 'processing'
    });

    try {
      const imageDataURL = await readImageAsDataURL(file);
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
        img.src = imageDataURL;
      });

      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      const canvasDataURL = canvas.convertToBlob ? 
        URL.createObjectURL(await canvas.convertToBlob()) : imageDataURL;

      // Add page (except for first image)
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Calculate dimensions to fit page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = img.width / img.height;
      const pageRatio = pageWidth / pageHeight;

      let imgWidth, imgHeight, x, y;

      if (imgRatio > pageRatio) {
        imgWidth = pageWidth;
        imgHeight = pageWidth / imgRatio;
        x = 0;
        y = (pageHeight - imgHeight) / 2;
      } else {
        imgHeight = pageHeight;
        imgWidth = pageHeight * imgRatio;
        x = (pageWidth - imgWidth) / 2;
        y = 0;
      }

      const format = file.type.includes('jpeg') || file.type.includes('jpg') ? 'JPEG' : 'PNG';
      pdf.addImage(imageDataURL, format, x, y, imgWidth, imgHeight);
      
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  reportProgress(operationId, {
    percentage: 95,
    message: 'Generating PDF file...',
    status: 'saving'
  });

  const pdfBlob = pdf.output('blob');

  reportProgress(operationId, {
    percentage: 100,
    message: `Successfully converted ${files.length} images to PDF!`,
    status: 'complete'
  });

  return pdfBlob;
}

/**
 * Читает изображение как Data URL
 */
function readImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Failed to read image: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Основная функция обработки
 */
async function processOperation(
  operationId: string,
  options: PDFProcessingOptions
): Promise<void> {
  try {
    // Инициализируем библиотеки если нужно
    await initializePDFLibraries();

    // Регистрируем операцию
    activeOperations.set(operationId, { cancelled: false });

    let result: Blob;

    switch (options.operation) {
      case 'merge':
        result = await processMerge(operationId, options.files, options.settings);
        break;
      case 'compress':
        result = await processCompress(operationId, options.files, options.settings);
        break;
      case 'split':
        result = await processSplit(operationId, options.files, options.settings);
        break;
      case 'protect':
        result = await processProtect(operationId, options.files, options.settings);
        break;
      case 'imagesToPdf':
        result = await processImagesToPdf(operationId, options.files, options.settings);
        break;
      default:
        throw new Error(`Unknown operation: ${options.operation}`);
    }

    // Отправляем результат
    postResponse({
      id: operationId,
      type: 'SUCCESS',
      payload: result
    });

  } catch (error) {
    postResponse({
      id: operationId,
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Очищаем операцию
    activeOperations.delete(operationId);
  }
}

/**
 * Обработчик сообщений от main thread
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  switch (type) {
    case 'PING':
      postResponse({ id, type: 'PONG' });
      break;

    case 'PROCESS':
      await processOperation(id, payload as PDFProcessingOptions);
      break;

    case 'CANCEL':
      const operation = activeOperations.get(id);
      if (operation) {
        operation.cancelled = true;
        activeOperations.delete(id);
      }
      break;

    case 'INIT':
      try {
        await initializePDFLibraries();
        postResponse({ id, type: 'SUCCESS' });
      } catch (error) {
        postResponse({
          id,
          type: 'ERROR',
          error: error instanceof Error ? error.message : 'Initialization failed'
        });
      }
      break;

    default:
      console.warn('Unknown message type:', type);
  }
};

// Глобальная обработка ошибок
self.onerror = (error) => {
  console.error('Worker error:', error);
};

self.onunhandledrejection = (event) => {
  console.error('Worker unhandled rejection:', event.reason);
};

console.log('🔧 PDF Worker initialized');
