import * as Tesseract from 'tesseract.js';
import { PDFDocument, rgb } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist';
import { postProcessOCRText } from '../utils/ocrPostProcessing';
import {
  OCROptions,
  OCRProgress,
  OCRResult,
  OCRProcessingOptions,
  ProcessedOCRResult,
  SupportedLanguage,
  OCRError
} from '../types/ocr.types';

// Supported languages for OCR
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
];

class OCRService {
  private workers: Map<string, Tesseract.Worker> = new Map();
  private isProcessing = false;

  // Initialize worker for specific language
  private async initializeWorker(language: string): Promise<Tesseract.Worker> {
    const existingWorker = this.workers.get(language);
    if (existingWorker) {
      return existingWorker;
    }

    const worker = await Tesseract.createWorker(language);
    this.workers.set(language, worker);
    return worker;
  }

  // Convert PDF to images for OCR processing
  private async pdfToImages(file: File): Promise<ImageData[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const images: ImageData[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = 2.0; // Higher scale for better OCR accuracy
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      images.push(imageData);
    }

    return images;
  }

  // Process image with OCR
  private async processImage(
    image: ImageData | File,
    options: OCROptions,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    const worker = await this.initializeWorker(options.language);

    // Base parameters for all languages
    const baseParameters = {
      tessedit_create_hocr: '1',
      tessedit_create_tsv: '1',
      tessedit_ocr_engine_mode: '2', // Neural nets LSTM engine
      preserve_interword_spaces: '1', // ВАЖНО: всегда сохраняем пробелы между словами
      tessedit_write_images: '0',
      user_defined_dpi: '300', // Высокое DPI для лучшего качества
    };

    // Language-specific optimizations
    if (options.language === 'rus') {
      worker.setParameters({
        ...baseParameters,
        tessedit_char_whitelist: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.,!?:;()[]{}«»—–-+=*/\\|@#№$%^&*~ ',
        textord_heavy_nr: '1',
        load_system_dawg: '0',
        load_freq_dawg: '0',
        tessedit_pageseg_mode: '6', // Лучше для русского текста
        textord_tabfind_find_tables: '0', // Отключаем поиск таблиц для лучшего распознавания пробелов
        textord_single_height_mode: '1', // Улучшает распознавание строк одинаковой высоты
        textord_force_make_prop_words: '1', // Принудительное создание пропорциональных слов
        textord_chopper_test: '1', // Включаем тестирование разделителя слов
      });
    } else if (options.language === 'ukr') {
      worker.setParameters({
        ...baseParameters,
        tessedit_char_whitelist: 'АБВГДЕЁЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзиіїйклмнопрстуфхцчшщъыьэюяЄєІіЇї0123456789.,!?:;()[]{}«»—–-+=*/\\|@#№$%^&*~ ',
        load_system_dawg: '0',
        load_freq_dawg: '0',
        tessedit_pageseg_mode: '6',
        textord_tabfind_find_tables: '0',
        textord_single_height_mode: '1',
        textord_force_make_prop_words: '1',
        textord_chopper_test: '1',
      });
    } else {
      // Для других языков (английский, немецкий и т.д.)
      worker.setParameters({
        ...baseParameters,
        tessedit_pageseg_mode: options.preserveLayout ? '6' : '3',
      });
    }

    const result = await worker.recognize(image, {
      rectangle: undefined,
    }, {
      text: true,
      blocks: true,
      hocr: true,
      tsv: true,
    });

    // Process results into our format with post-processing
    const rawText = result.data.text;
    const processedText = postProcessOCRText(rawText, options.language);

    const ocrResult: OCRResult = {
      text: processedText,
      confidence: result.data.confidence,
      words: result.data.words?.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: {
          x0: word.bbox.x0,
          y0: word.bbox.y0,
          x1: word.bbox.x1,
          y1: word.bbox.y1,
        }
      })) || [],
      blocks: result.data.blocks?.map(block => ({
        text: postProcessOCRText(block.text, options.language), // Также обрабатываем текст блоков
        confidence: block.confidence,
        bbox: {
          x0: block.bbox.x0,
          y0: block.bbox.y0,
          x1: block.bbox.x1,
          y1: block.bbox.y1,
        },
        words: block.words?.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          }
        })) || []
      })) || [],
      pages: [{
        text: processedText,
        confidence: result.data.confidence,
        blocks: result.data.blocks?.map(block => ({
          text: postProcessOCRText(block.text, options.language),
          confidence: block.confidence,
          bbox: {
            x0: block.bbox.x0,
            y0: block.bbox.y0,
            x1: block.bbox.x1,
            y1: block.bbox.y1,
          },
          words: block.words?.map(word => ({
            text: word.text,
            confidence: word.confidence,
            bbox: {
              x0: word.bbox.x0,
              y0: word.bbox.y0,
              x1: word.bbox.x1,
              y1: word.bbox.y1,
            }
          })) || []
        })) || [],
        dimensions: {
          width: result.data.imageWidth || 0,
          height: result.data.imageHeight || 0,
        }
      }]
    };

    return ocrResult;
  }

  // Create searchable PDF from OCR result
  private async createSearchablePDF(
    originalFile: File,
    ocrResult: OCRResult,
    images: ImageData[]
  ): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < images.length; i++) {
      const page = pdfDoc.addPage([images[i].width, images[i].height]);
      const pageResult = ocrResult.pages[i] || ocrResult.pages[0];

      // Add invisible text layer for searchability
      const pageWords = pageResult.blocks?.flatMap(block => block.words || []) || [];
      console.log(`🔍 Adding ${pageWords.length} words to page ${i + 1} for searchability`);

      pageWords.forEach(word => {
        if (word && word.bbox && word.text) {
          const fontSize = Math.abs(word.bbox.y1 - word.bbox.y0) * 0.8;
          page.drawText(word.text, {
            x: word.bbox.x0,
            y: images[i].height - word.bbox.y1,
            size: fontSize > 0 ? fontSize : 12, // Ensure positive font size
            color: rgb(0, 0, 0),
            opacity: 0, // Invisible text
          });
        }
      });

      // Add the original image as background
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = images[i].width;
      canvas.height = images[i].height;
      ctx.putImageData(images[i], 0, 0);

      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(resolve as any, 'image/png');
      });

      const imageBytes = await imageBlob.arrayBuffer();
      const image = await pdfDoc.embedPng(imageBytes);

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: images[i].width,
        height: images[i].height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // Main OCR processing function
  async processOCR(options: OCRProcessingOptions): Promise<ProcessedOCRResult> {
    if (this.isProcessing) {
      throw new Error('OCR processing is already in progress');
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      const { file, options: ocrOptions, onProgress, onError } = options;

      console.log('🔍 OCR Service - Starting processing:', {
        fileName: file.name,
        fileType: file.type,
        language: ocrOptions.language,
        outputFormat: ocrOptions.outputFormat,
        hasOnError: typeof onError === 'function',
        hasOnProgress: typeof onProgress === 'function'
      });

      // Initialize progress
      onProgress?.({
        status: 'initializing',
        progress: 0,
      });

      let images: ImageData[] = [];
      let ocrResult: OCRResult;

      // Handle different file types
      if (file.type === 'application/pdf') {
        try {
          onProgress?.({
            status: 'processing',
            progress: 10,
          });

          console.log('🔍 Converting PDF to images...');
          images = await this.pdfToImages(file);
          console.log('✅ PDF converted to images:', images.length, 'pages');

          onProgress?.({
            status: 'loading language',
            progress: 30,
          });

          // Process each page
          const pageResults: OCRResult[] = [];
          for (let i = 0; i < images.length; i++) {
            try {
              onProgress?.({
                status: 'recognizing text',
                progress: 30 + (i / images.length) * 60,
                currentPage: i + 1,
                totalPages: images.length,
              });

              console.log(`🔍 Processing page ${i + 1}/${images.length}...`);
              const pageResult = await this.processImage(images[i], ocrOptions, onProgress);
              pageResults.push(pageResult);
              console.log(`✅ Page ${i + 1} processed, confidence: ${pageResult.confidence}%`);
            } catch (pageError) {
              console.error(`❌ Error processing page ${i + 1}:`, pageError);
              throw pageError;
            }
          }

          // Combine results
          ocrResult = {
            text: pageResults.map(r => r.text).join('\n\n'),
            confidence: pageResults.reduce((sum, r) => sum + r.confidence, 0) / pageResults.length,
            words: pageResults.flatMap(r => r.words),
            blocks: pageResults.flatMap(r => r.blocks),
            pages: pageResults.map(r => r.pages[0]),
          };

        } catch (pdfError) {
          console.error('❌ PDF processing failed:', pdfError);
          throw pdfError;
        }

      } else if (file.type.startsWith('image/')) {
        onProgress?.({
          status: 'loading language',
          progress: 20,
        });

        onProgress?.({
          status: 'recognizing text',
          progress: 40,
        });

        ocrResult = await this.processImage(file, ocrOptions, onProgress);

        // For searchable PDF creation, we need to convert image to ImageData
        if (ocrOptions.outputFormat === 'searchable-pdf') {
          const img = new Image();
          const imageUrl = URL.createObjectURL(file);

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              images.push(imageData);

              URL.revokeObjectURL(imageUrl);
              resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
          });
        }
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }

      onProgress?.({
        status: 'processing',
        progress: 95,
      });

      // Generate output based on format
      let processedBlob: Blob;
      let downloadUrl: string;

      switch (ocrOptions.outputFormat) {
        case 'text':
          processedBlob = new Blob([ocrResult.text], { type: 'text/plain' });
          downloadUrl = URL.createObjectURL(processedBlob);
          break;

        case 'searchable-pdf':
          try {
            if (images.length > 0) {
              console.log('🔍 Creating searchable PDF with', images.length, 'images');
              processedBlob = await this.createSearchablePDF(file, ocrResult, images);
              downloadUrl = URL.createObjectURL(processedBlob);
              console.log('✅ Searchable PDF created successfully');
            } else {
              console.warn('⚠️ No images available for searchable PDF, falling back to text');
              // Fallback to text if no images available
              processedBlob = new Blob([ocrResult.text], { type: 'text/plain' });
              downloadUrl = URL.createObjectURL(processedBlob);
            }
          } catch (pdfCreationError) {
            console.error('❌ Searchable PDF creation failed, falling back to text:', pdfCreationError);
            // Fallback to text format if PDF creation fails
            processedBlob = new Blob([ocrResult.text], { type: 'text/plain' });
            downloadUrl = URL.createObjectURL(processedBlob);
          }
          break;

        default:
          processedBlob = new Blob([ocrResult.text], { type: 'text/plain' });
          downloadUrl = URL.createObjectURL(processedBlob);
      }

      onProgress?.({
        status: 'complete',
        progress: 100,
      });

      const processingTime = Date.now() - startTime;

      return {
        originalFile: file,
        result: ocrResult,
        processedBlob,
        downloadUrl,
        processingTime,
      };

    } catch (error) {
      console.error('❌ OCR Service - Processing failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fileName: options.file?.name,
        fileType: options.file?.type,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        fullError: error
      });

      // Log the full error object to understand what's happening
      console.error('Full error object:', error);

      const ocrError: OCRError = {
        message: error instanceof Error ? error.message : 'Unknown OCR error',
        code: 'OCR_PROCESSING_ERROR',
        details: error,
      };

      // Safely call onError if provided
      try {
        if (options.onError && typeof options.onError === 'function') {
          console.log('🔧 OCR Service - Calling onError callback');
          options.onError(ocrError);
        } else {
          console.warn('⚠️ OCR Service - No onError callback provided');
        }
      } catch (callbackError) {
        console.error('💥 OCR Service - Error in onError callback:', callbackError);
      }

      throw ocrError;
    } finally {
      this.isProcessing = false;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    const workers = Array.from(this.workers.values());
    await Promise.all(workers.map(worker => worker.terminate()));
    this.workers.clear();
  }

  // Get processing status
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

export const ocrService = new OCRService();
