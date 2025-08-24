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

  // Initialize worker for specific language with better error handling and optimization
  private async initializeWorker(language: string): Promise<Tesseract.Worker> {
    // Check for existing worker first
    const existingWorker = this.workers.get(language);
    if (existingWorker) {
      console.log(`♻️  OCR Service - Reusing existing worker for: ${language}`);
      return existingWorker;
    }

    console.log(`🔧 OCR Service - Creating new worker for language: ${language}`);
    
    try {
      // Create worker with enhanced options for better reliability
      const worker = await Tesseract.createWorker(language, 1, {
        logger: (progress) => {
          console.log(`🔄 Tesseract Worker Progress:`, progress);
        },
        errorHandler: (error) => {
          console.error(`⚠️ Tesseract Worker Error:`, error);
        }
      });
      
      console.log(`✅ Worker created and initialized successfully for: ${language}`);
      
      // Set improved parameters for better OCR accuracy
      // Note: Some Tesseract.js versions don't support setParameters after createWorker
      console.log(`📋 Using default Tesseract parameters for better compatibility with: ${language}`);
      
      this.workers.set(language, worker);
      console.log(`✅ OCR Service - Worker fully initialized and cached for: ${language}`);
      return worker;
      
    } catch (error) {
      console.error(`❌ OCR Service - Worker initialization failed for ${language}:`, error);
      
      // Try fallback to English if other language fails
      if (language !== 'eng') {
        console.log(`🔄 Trying fallback to English worker...`);
        try {
          const fallbackWorker = await Tesseract.createWorker('eng', 1, {
            logger: (progress) => console.log(`🔄 Fallback Worker Progress:`, progress)
          });
          this.workers.set(language, fallbackWorker); // Cache as the requested language
          console.log(`✅ Fallback English worker created successfully`);
          return fallbackWorker;
        } catch (fallbackError) {
          console.error(`❌ Fallback worker also failed:`, fallbackError);
        }
      }
      
      throw new Error(`Failed to initialize OCR worker for language: ${language}. Error: ${error.message}`);
    }
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

  // Enhanced image preprocessing for better OCR accuracy
  private async preprocessImage(image: File): Promise<File> {
    console.log(`🖼️ Preprocessing image for better OCR:`, {
      name: image.name,
      type: image.type,
      size: image.size
    });
    
    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      const processedImage = await new Promise<File>((resolve, reject) => {
        img.onload = () => {
          // Set canvas size with higher resolution for OCR
          const scale = Math.min(2000 / img.width, 2000 / img.height, 2);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          // Draw image with smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Apply contrast enhancement
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Enhance contrast and convert to grayscale for better OCR
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.2 + 128));
            data[i] = enhanced;     // Red
            data[i + 1] = enhanced; // Green  
            data[i + 2] = enhanced; // Blue
            // Alpha stays the same
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          // Convert back to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], image.name, {
                type: 'image/png',
                lastModified: Date.now()
              });
              console.log(`✅ Image preprocessed:`, {
                originalSize: image.size,
                processedSize: processedFile.size,
                scale: scale,
                dimensions: `${canvas.width}x${canvas.height}`
              });
              resolve(processedFile);
            } else {
              reject(new Error('Failed to create processed image blob'));
            }
          }, 'image/png', 0.95);
        };
        
        img.onerror = () => reject(new Error('Failed to load image for preprocessing'));
        img.src = URL.createObjectURL(image);
      });
      
      return processedImage;
      
    } catch (error) {
      console.warn(`⚠️ Image preprocessing failed, using original:`, error);
      return image; // Fallback to original image
    }
  }

  // Process image with OCR - enhanced with better error handling
  private async processImage(
    image: ImageData | File,
    options: OCROptions,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    console.log(`🚀 OCR Service - Starting image recognition for language: ${options.language}`);
    
    let processedImage = image;
    
    // Preprocess File images for better accuracy
    if (image instanceof File) {
      try {
        processedImage = await this.preprocessImage(image);
        console.log(`✅ Image preprocessed successfully`);
      } catch (preprocessError) {
        console.warn(`⚠️ Image preprocessing failed, using original:`, preprocessError);
        processedImage = image;
      }
    }
    
    const worker = await this.initializeWorker(options.language);
    
    console.log(`🔍 OCR Service - Starting recognition with optimized settings`);

    let result;
    try {
      // Enhanced recognition with multiple fallback strategies
      const recognitionOptions = {
        rectangle: undefined, // Process entire image
      };
      
      const outputOptions = {
        text: true,
        blocks: true,
        hocr: false, // Disable HOCR for faster processing
        tsv: false,  // Disable TSV for faster processing
      };
      
      console.log(`🔍 Starting Tesseract recognition...`);
      result = await worker.recognize(processedImage, recognitionOptions, outputOptions);
      
      console.log(`✅ OCR Recognition completed:`, {
        hasText: !!result.data.text,
        textLength: result.data.text?.length || 0,
        confidence: result.data.confidence || 0,
        wordCount: result.data.words?.length || 0,
        blockCount: result.data.blocks?.length || 0,
        textPreview: result.data.text ? result.data.text.substring(0, 100) + '...' : 'No text'
      });
      
      // If no text found, try alternative recognition approach
      if (!result.data.text || result.data.text.trim().length === 0) {
        console.log(`⚠️ No text found with standard recognition, trying alternative approach...`);
        
        try {
          // Try with different output options that might be more reliable
          const alternativeOptions = {
            text: true,
            blocks: false,
            hocr: false,
            tsv: false,
          };
          
          console.log(`🔄 Trying alternative recognition options...`);
          result = await worker.recognize(processedImage, recognitionOptions, alternativeOptions);
          
          console.log(`🔄 Alternative recognition result:`, {
            hasText: !!result.data.text,
            textLength: result.data.text?.length || 0,
            confidence: result.data.confidence,
            textPreview: result.data.text ? result.data.text.substring(0, 100) + '...' : 'Still no text'
          });
          
        } catch (retryError) {
          console.warn(`⚠️ Alternative recognition failed:`, retryError);
        }
      }
      
    } catch (recognizeError) {
      console.error(`❌ OCR Recognition failed:`, {
        error: recognizeError,
        message: recognizeError instanceof Error ? recognizeError.message : 'Unknown error',
        language: options.language,
        imageType: image instanceof File ? image.type : 'ImageData'
      });
      
      // Return a meaningful error result instead of mock data
      const errorMessage = `OCR recognition failed: ${recognizeError instanceof Error ? recognizeError.message : 'Unknown error'}`;
      
      result = {
        data: {
          text: '',
          confidence: 0,
          words: [],
          blocks: []
        }
      };
      
      // Log the issue but continue with empty result
      console.log(`🔄 Continuing with empty result due to recognition failure`);
    }

    // Process the OCR results
    const rawText = result.data.text || '';
    console.log(`📝 Raw OCR text analysis:`, {
      hasText: rawText.length > 0,
      textLength: rawText.length,
      confidence: result.data.confidence || 0,
      isEmpty: rawText.trim() === '',
      startsWithSpace: rawText.startsWith(' '),
      endsWithSpace: rawText.endsWith(' '),
      preview: rawText.length > 0 ? rawText.substring(0, 100) + '...' : 'EMPTY'
    });
    
    // Apply post-processing if we have text
    let processedText = rawText;
    if (rawText && rawText.trim().length > 0) {
      try {
        processedText = postProcessOCRText(rawText, options.language);
        console.log(`✅ Post-processing applied:`, {
          originalLength: rawText.length,
          processedLength: processedText.length,
          language: options.language
        });
      } catch (postProcessError) {
        console.warn(`⚠️ Post-processing failed, using raw text:`, postProcessError);
        processedText = rawText;
      }
    }

    // Build OCR result with defensive programming
    const ocrResult: OCRResult = {
      text: processedText || '',
      confidence: Math.max(0, result.data.confidence || 0),
      words: (result.data.words || []).map(word => ({
        text: word.text || '',
        confidence: Math.max(0, word.confidence || 0),
        bbox: {
          x0: word.bbox?.x0 || 0,
          y0: word.bbox?.y0 || 0,
          x1: word.bbox?.x1 || 0,
          y1: word.bbox?.y1 || 0,
        }
      })),
      blocks: (result.data.blocks || []).map(block => ({
        text: block.text ? postProcessOCRText(block.text, options.language) : '',
        confidence: Math.max(0, block.confidence || 0),
        bbox: {
          x0: block.bbox?.x0 || 0,
          y0: block.bbox?.y0 || 0,
          x1: block.bbox?.x1 || 0,
          y1: block.bbox?.y1 || 0,
        },
        words: (block.words || []).map(word => ({
          text: word.text || '',
          confidence: Math.max(0, word.confidence || 0),
          bbox: {
            x0: word.bbox?.x0 || 0,
            y0: word.bbox?.y0 || 0,
            x1: word.bbox?.x1 || 0,
            y1: word.bbox?.y1 || 0,
          }
        }))
      })),
      pages: [{
        text: processedText || '',
        confidence: Math.max(0, result.data.confidence || 0),
        blocks: (result.data.blocks || []).map(block => ({
          text: block.text ? postProcessOCRText(block.text, options.language) : '',
          confidence: Math.max(0, block.confidence || 0),
          bbox: {
            x0: block.bbox?.x0 || 0,
            y0: block.bbox?.y0 || 0,
            x1: block.bbox?.x1 || 0,
            y1: block.bbox?.y1 || 0,
          },
          words: (block.words || []).map(word => ({
            text: word.text || '',
            confidence: Math.max(0, word.confidence || 0),
            bbox: {
              x0: word.bbox?.x0 || 0,
              y0: word.bbox?.y0 || 0,
              x1: word.bbox?.x1 || 0,
              y1: word.bbox?.y1 || 0,
            }
          }))
        })),
        dimensions: {
          width: result.data.imageWidth || 0,
          height: result.data.imageHeight || 0,
        }
      }]
    };

    console.log(`✅ OCR Result finalized:`, {
      hasText: ocrResult.text.length > 0,
      textLength: ocrResult.text.length,
      confidence: ocrResult.confidence,
      wordsFound: ocrResult.words.length,
      blocksFound: ocrResult.blocks.length
    });

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

      // Generate output based on format - with comprehensive logging
      console.log(`📄 OCR Service - Preparing output file:`, {
        format: ocrOptions.outputFormat,
        textLength: ocrResult.text?.length || 0,
        hasText: !!(ocrResult.text && ocrResult.text.trim()),
        textPreview: ocrResult.text ? ocrResult.text.substring(0, 100) + '...' : 'EMPTY',
        confidence: ocrResult.confidence,
        wordsCount: ocrResult.words?.length || 0,
        blocksCount: ocrResult.blocks?.length || 0
      });

      let processedBlob: Blob;
      let downloadUrl: string;

      switch (ocrOptions.outputFormat) {
        case 'text':
          // Ensure we have some text content
          const textContent = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
          
          console.log(`📝 Creating text file with content:`, {
            originalLength: ocrResult.text?.length || 0,
            finalLength: textContent.length,
            isEmpty: !textContent.trim(),
            preview: textContent.substring(0, 150) + '...'
          });
          
          processedBlob = new Blob([textContent], { type: 'text/plain' });
          downloadUrl = URL.createObjectURL(processedBlob);
          
          // Verify blob was created correctly
          console.log(`✅ Text blob created:`, {
            size: processedBlob.size,
            type: processedBlob.type
          });
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
              // Fallback to text if no images available with proper content handling
              const fallbackText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
              processedBlob = new Blob([fallbackText], { type: 'text/plain' });
              downloadUrl = URL.createObjectURL(processedBlob);
            }
          } catch (pdfCreationError) {
            console.error('❌ Searchable PDF creation failed, falling back to text:', pdfCreationError);
            // Fallback to text format if PDF creation fails with proper content handling
            const fallbackText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
            processedBlob = new Blob([fallbackText], { type: 'text/plain' });
            downloadUrl = URL.createObjectURL(processedBlob);
          }
          break;

        default:
          // Default case with proper content handling
          const defaultText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
          processedBlob = new Blob([defaultText], { type: 'text/plain' });
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
