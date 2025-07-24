import {
  OCROptions,
  OCRProgress,
  OCRResult,
  OCRProcessingOptions,
  ProcessedOCRResult,
  SupportedLanguage,
  OCRError
} from '../types/ocr.types';

// Fallback OCR service when tesseract.js is not available
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

class OCRServiceFallback {
  private isProcessing = false;

  async processOCR(options: OCRProcessingOptions): Promise<ProcessedOCRResult> {
    const { onProgress, onError } = options;

    // Show error that OCR is not available
    const error: OCRError = {
      message: 'OCR functionality is not available. Please install tesseract.js dependency.',
      code: 'OCR_NOT_AVAILABLE',
      details: 'Run: npm install tesseract.js@^5.0.5 --save'
    };

    onError?.(error);
    throw error;
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for fallback
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// Try to import tesseract.js, fallback to mock if not available
let ocrService: any;

try {
  // Dynamic import to handle missing dependency gracefully
  const tesseractModule = await import('tesseract.js');
  const { createWorker } = tesseractModule;

  class OCRService {
    private workers: Map<string, any> = new Map();
    private isProcessing = false;

    // Initialize worker for specific language
    private async initializeWorker(language: string): Promise<any> {
      const existingWorker = this.workers.get(language);
      if (existingWorker) {
        return existingWorker;
      }

      const worker = await createWorker(language);
      this.workers.set(language, worker);
      return worker;
    }

    // Convert PDF to images for OCR processing
    private async pdfToImages(file: File): Promise<ImageData[]> {
      const arrayBuffer = await file.arrayBuffer();
      const { getDocument } = await import('pdfjs-dist');
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const images: ImageData[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2.0;
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

      const result = await worker.recognize(image, {
        rectangle: undefined,
      }, {
        text: true,
        blocks: true,
        hocr: true,
        tsv: true,
      });

      const ocrResult: OCRResult = {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words?.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          }
        })) || [],
        blocks: result.data.blocks?.map((block: any) => ({
          text: block.text,
          confidence: block.confidence,
          bbox: {
            x0: block.bbox.x0,
            y0: block.bbox.y0,
            x1: block.bbox.x1,
            y1: block.bbox.y1,
          },
          words: block.words?.map((word: any) => ({
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
          text: result.data.text,
          confidence: result.data.confidence,
          blocks: result.data.blocks?.map((block: any) => ({
            text: block.text,
            confidence: block.confidence,
            bbox: {
              x0: block.bbox.x0,
              y0: block.bbox.y0,
              x1: block.bbox.x1,
              y1: block.bbox.y1,
            },
            words: block.words?.map((word: any) => ({
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

    // Main OCR processing function
    async processOCR(options: OCRProcessingOptions): Promise<ProcessedOCRResult> {
      if (this.isProcessing) {
        throw new Error('OCR processing is already in progress');
      }

      this.isProcessing = true;
      const startTime = Date.now();

      try {
        const { file, options: ocrOptions, onProgress } = options;

        onProgress?.({
          status: 'initializing',
          progress: 0,
        });

        let images: ImageData[] = [];
        let ocrResult: OCRResult;

        if (file.type === 'application/pdf') {
          onProgress?.({
            status: 'processing',
            progress: 10,
          });

          images = await this.pdfToImages(file);

          onProgress?.({
            status: 'loading language',
            progress: 30,
          });

          const pageResults: OCRResult[] = [];
          for (let i = 0; i < images.length; i++) {
            onProgress?.({
              status: 'recognizing text',
              progress: 30 + (i / images.length) * 60,
              currentPage: i + 1,
              totalPages: images.length,
            });

            const pageResult = await this.processImage(images[i], ocrOptions, onProgress);
            pageResults.push(pageResult);
          }

          ocrResult = {
            text: pageResults.map(r => r.text).join('\n\n'),
            confidence: pageResults.reduce((sum, r) => sum + r.confidence, 0) / pageResults.length,
            words: pageResults.flatMap(r => r.words),
            blocks: pageResults.flatMap(r => r.blocks),
            pages: pageResults.map(r => r.pages[0]),
          };

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
        } else {
          throw new Error('Unsupported file type. Please upload a PDF or image file.');
        }

        onProgress?.({
          status: 'processing',
          progress: 95,
        });

        let processedBlob: Blob | undefined;
        let downloadUrl: string | undefined;

        // For now, just return text
        processedBlob = new Blob([ocrResult.text], { type: 'text/plain' });
        downloadUrl = URL.createObjectURL(processedBlob);

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
        const ocrError: OCRError = {
          message: error instanceof Error ? error.message : 'Unknown OCR error',
          code: 'OCR_PROCESSING_ERROR',
          details: error,
        };

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

    isCurrentlyProcessing(): boolean {
      return this.isProcessing;
    }
  }

  ocrService = new OCRService();

} catch (error) {
  console.warn('tesseract.js not available, using fallback OCR service');
  ocrService = new OCRServiceFallback();
}

export { ocrService };
