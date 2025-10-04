import * as Tesseract from 'tesseract.js';
import { PDFDocument, rgb } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { postProcessOCRText } from '../utils/ocrPostProcessing';
import { documentGenerator } from '../utils/documentGenerator';
import { textToPDFGenerator } from '../utils/textToPDFGenerator';
import {
  OCROptions,
  OCRProgress,
  OCRResult,
  OCRProcessingOptions,
  ProcessedOCRResult,
  SupportedLanguage,
  OCRError,
  ImagePreprocessingOptions,
  ImageQualityAnalysis,
  LanguageDetectionResult,
  DocumentStructure,
  AdvancedOCROptions,
  AdvancedOCRResult
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

  // Convert PDF to images for OCR processing with enhanced error handling and logging
  private async pdfToImages(file: File): Promise<ImageData[]> {
    console.log(`📄 Starting PDF to images conversion:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      console.log(`✅ PDF file loaded as ArrayBuffer:`, {
        byteLength: arrayBuffer.byteLength
      });

      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file is empty');
      }

      // Load PDF document
      console.log(`🔍 Loading PDF document with pdf.js...`);
      const pdf = await getDocument({ 
        data: arrayBuffer,
        // Add worker and compatibility options for better reliability
        verbosity: 0, // Reduce console spam
        isEvalSupported: false // Security setting
      }).promise;

      console.log(`✅ PDF document loaded successfully:`, {
        numPages: pdf.numPages,
        fingerprints: pdf.fingerprints
      });

      if (pdf.numPages === 0) {
        throw new Error('PDF has no pages to process');
      }

      const images: ImageData[] = [];

      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          console.log(`🔍 Processing PDF page ${pageNum}/${pdf.numPages}...`);
          
          const page = await pdf.getPage(pageNum);
          
          // Use higher scale for better OCR accuracy, but not too high to avoid memory issues
          const scale = Math.min(2.5, Math.max(1.5, 1200 / Math.max(page.view[2], page.view[3])));
          console.log(`📐 Using scale factor: ${scale} for page ${pageNum}`);
          
          const viewport = page.getViewport({ scale });
          
          console.log(`📏 Page ${pageNum} viewport:`, {
            width: viewport.width,
            height: viewport.height,
            scale: scale
          });

          // Create canvas with proper dimensions
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error(`Failed to get 2D context for page ${pageNum}`);
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Set canvas background to white for better OCR
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Render page to canvas
          console.log(`🎨 Rendering page ${pageNum} to canvas...`);
          const renderTask = page.render({
            canvasContext: context,
            viewport: viewport,
            // Add rendering options for better quality
            intent: 'print' // Better quality for OCR
          });

          await renderTask.promise;
          console.log(`✅ Page ${pageNum} rendered successfully`);

          // Get image data from canvas
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          console.log(`📊 Image data extracted for page ${pageNum}:`, {
            width: imageData.width,
            height: imageData.height,
            dataLength: imageData.data.length
          });

          // Validate image data
          if (imageData.width === 0 || imageData.height === 0) {
            console.warn(`⚠️ Page ${pageNum} has zero dimensions, skipping`);
            continue;
          }

          // Check if image has any content (not completely white/transparent)
          const hasContent = this.validateImageContent(imageData);
          if (!hasContent) {
            console.warn(`⚠️ Page ${pageNum} appears to be blank, but including anyway`);
          }

          images.push(imageData);
          console.log(`✅ Page ${pageNum} successfully converted to ImageData`);

        } catch (pageError) {
          console.error(`❌ Failed to process page ${pageNum}:`, pageError);
          throw new Error(`Failed to convert page ${pageNum}: ${pageError.message}`);
        }
      }

      console.log(`🎉 PDF conversion completed successfully:`, {
        totalPages: pdf.numPages,
        convertedPages: images.length,
        averageSize: images.length > 0 ? Math.round(images.reduce((sum, img) => sum + img.data.length, 0) / images.length) : 0
      });

      if (images.length === 0) {
        throw new Error('No pages could be converted to images');
      }

      return images;

    } catch (error) {
      console.error(`❌ PDF to images conversion failed:`, {
        fileName: file.name,
        error: error.message,
        stack: error.stack
      });

      // Provide more specific error messages
      if (error.message?.includes('Invalid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document. Please check the file and try again.');
      } else if (error.message?.includes('password')) {
        throw new Error('This PDF is password protected. Please use an unprotected PDF file.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error while processing PDF. Please check your internet connection.');
      } else {
        throw new Error(`Failed to process PDF: ${error.message}. Please try a different PDF file.`);
      }
    }
  }

  // Validate if image contains actual content (not blank)
  private validateImageContent(imageData: ImageData): boolean {
    const { data } = imageData;
    let nonWhitePixels = 0;
    const sampleSize = Math.min(data.length, 10000); // Sample first ~2500 pixels

    for (let i = 0; i < sampleSize; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Check if pixel is not white/transparent
      if (a > 0 && (r < 250 || g < 250 || b < 250)) {
        nonWhitePixels++;
        if (nonWhitePixels > 10) {
          return true; // Found enough content, early exit
        }
      }
    }

    return nonWhitePixels > 5; // At least some non-white pixels
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
    
    let processedInput: File | HTMLCanvasElement;
    
    // Handle different input types
    if (image instanceof File) {
      console.log(`📁 Processing File input: ${image.name}`);
      
      // Preprocess File images for better accuracy
      try {
        processedInput = await this.preprocessImage(image);
        console.log(`✅ Image preprocessed successfully`);
      } catch (preprocessError) {
        console.warn(`⚠️ Image preprocessing failed, using original:`, preprocessError);
        processedInput = image;
      }
    } else {
      // Convert ImageData to Canvas for Tesseract.js
      console.log(`🖼️ Converting ImageData to Canvas:`, {
        width: image.width,
        height: image.height,
        dataLength: image.data.length
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas 2D context for ImageData conversion');
      }
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Put ImageData onto canvas
      ctx.putImageData(image, 0, 0);
      
      console.log(`✅ ImageData converted to Canvas:`, {
        width: canvas.width,
        height: canvas.height
      });
      
      processedInput = canvas;
    }
    
    const worker = await this.initializeWorker(options.language);
    
    console.log(`🔍 OCR Service - Starting recognition with processed input`);

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
      result = await worker.recognize(processedInput, recognitionOptions, outputOptions);
      
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
          result = await worker.recognize(image, recognitionOptions, alternativeOptions);
          
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

    // Check if we need Cyrillic support
    const hasText = ocrResult.text || '';
    const isCyrillic = textToPDFGenerator.containsCyrillic(hasText);
    console.log(`🔤 Text analysis: Cyrillic detected: ${isCyrillic}`);

    // Load appropriate font using textToPDFGenerator
    const fontResult = await (textToPDFGenerator as any).loadFont(pdfDoc, isCyrillic);
    console.log(`✅ Font loaded for searchable PDF: ${fontResult.fontName}, supports Cyrillic: ${fontResult.supportsCyrillic}`);

    for (let i = 0; i < images.length; i++) {
      const page = pdfDoc.addPage([images[i].width, images[i].height]);
      const pageResult = ocrResult.pages[i] || ocrResult.pages[0];

      // Add invisible text layer for searchability
      const pageWords = pageResult.blocks?.flatMap(block => block.words || []) || [];
      console.log(`🔍 Adding ${pageWords.length} words to page ${i + 1} for searchability`);
      console.log(`📊 Page ${i + 1} OCR data:`, {
        blocks: pageResult.blocks?.length || 0,
        totalText: pageResult.text?.substring(0, 100) + '...',
        confidence: pageResult.confidence
      });

      // If no word-level data, fall back to simple text placement
      if (pageWords.length === 0 && pageResult.text) {
        console.log('⚠️ No word bounding boxes found, using simple text overlay');
        let textToRender = pageResult.text;
        
        // Apply transliteration if needed
        if (fontResult.needsTransliteration && textToRender) {
          textToRender = textToPDFGenerator.transliterateCyrillic(textToRender);
          console.log('🔄 Applied transliteration to searchable text');
        }
        
        page.drawText(textToRender, {
          x: 50,
          y: images[i].height - 50,
          size: 12,
          font: fontResult.font,
          color: rgb(0, 0, 0),
          opacity: 0, // Invisible for production (was 0.1 for testing)
        });
      } else {
        pageWords.forEach((word, wordIndex) => {
          if (word && word.bbox && word.text) {
            const fontSize = Math.abs(word.bbox.y1 - word.bbox.y0) * 0.8;
            console.log(`📝 Word ${wordIndex}: "${word.text}" at (${word.bbox.x0},${word.bbox.y0}) size:${fontSize}`);
            
            let wordText = word.text;
            
            // Apply transliteration if needed
            if (fontResult.needsTransliteration && wordText) {
              wordText = textToPDFGenerator.transliterateCyrillic(wordText);
            }
            
            page.drawText(wordText, {
              x: word.bbox.x0,
              y: images[i].height - word.bbox.y1,
              size: fontSize > 0 ? fontSize : 12, // Ensure positive font size
              font: fontResult.font,
              color: rgb(0, 0, 0),
              opacity: 0, // Invisible for production (was 0.1 for testing)
            });
          }
        });
      }

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

          // SMART APPROACH: Try to extract text directly first (for text-based PDFs)
          console.log('🔍 Checking if PDF contains extractable text...');
          const extractedText = await this.tryExtractTextFromPDF(file);

          if (extractedText && extractedText.trim().length > 50) {
            // PDF has good text content - use it directly!
            console.log('✅ PDF contains extractable text! Using direct extraction instead of OCR');
            console.log(`📝 Extracted ${extractedText.length} characters directly from PDF`);

            onProgress?.({
              status: 'complete',
              progress: 100,
            });

            // Return result without OCR
            ocrResult = {
              text: extractedText,
              confidence: 99, // High confidence for direct text extraction
              words: extractedText.split(/\s+/).map(text => ({ text, confidence: 99, bbox: { x0: 0, y0: 0, x1: 0, y1: 0 } })),
              blocks: [{ text: extractedText, confidence: 99, bbox: { x0: 0, y0: 0, x1: 0, y1: 0 }, words: [] }],
              pages: [{
                text: extractedText,
                confidence: 99,
                blocks: [],
                dimensions: { width: 0, height: 0 }
              }],
            };
          } else {
            // No extractable text - need OCR
            console.log('📸 PDF has no extractable text (scanned document), using OCR...');
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

            // Combine results with page separators
            const combinedText = pageResults.map((r, index) => {
              const pageNum = index + 1;
              const separator = '═'.repeat(60);
              return `${separator}\nPAGE ${pageNum}\n${separator}\n\n${this.smartFormatText(r.text)}`;
            }).join('\n\n');

            ocrResult = {
              text: combinedText,
              confidence: pageResults.reduce((sum, r) => sum + r.confidence, 0) / pageResults.length,
              words: pageResults.flatMap(r => r.words),
              blocks: pageResults.flatMap(r => r.blocks),
              pages: pageResults.map(r => r.pages[0]),
            };
          }

        } catch (pdfError) {
          console.error('❌ PDF processing failed:', {
            fileName: file.name,
            fileSize: file.size,
            error: pdfError.message,
            stack: pdfError.stack
          });
          
          // Provide more user-friendly error messages for PDF issues
          let errorMessage = 'Failed to process PDF file.';
          
          if (pdfError.message?.includes('Invalid PDF')) {
            errorMessage = 'The uploaded file is not a valid PDF document. Please check the file format and try again.';
          } else if (pdfError.message?.includes('password')) {
            errorMessage = 'This PDF is password protected. Please use an unprotected PDF file.';
          } else if (pdfError.message?.includes('empty')) {
            errorMessage = 'The PDF file appears to be empty or corrupted.';
          } else if (pdfError.message?.includes('No pages could be converted')) {
            errorMessage = 'Unable to extract readable content from the PDF. The file may contain only images or be corrupted.';
          } else if (pdfError.message?.includes('network') || pdfError.message?.includes('fetch')) {
            errorMessage = 'Network error while processing PDF. Please check your internet connection and try again.';
          } else {
            errorMessage = `PDF processing error: ${pdfError.message}. Please try a different PDF file.`;
          }
          
          throw new Error(errorMessage);
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
              // No images means we extracted text directly from PDF
              console.log('📄 Creating text-based PDF from extracted text');
              const pdfText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted.';

              // Use textToPDFGenerator to create a clean PDF
              const originalName = file.name.replace(/\.[^/.]+$/, '');
              processedBlob = await textToPDFGenerator.generatePDF(
                pdfText,
                `${originalName}_ocr`,
                {
                  fontSize: 11,
                  pageSize: 'A4',
                  orientation: 'portrait',
                  margins: 50,
                  lineHeight: 1.4
                }
              );
              downloadUrl = URL.createObjectURL(processedBlob);
              console.log('✅ Text-based PDF created successfully');
            }
          } catch (pdfCreationError) {
            console.error('❌ PDF creation failed, falling back to text file:', pdfCreationError);
            // Fallback to text format if PDF creation fails
            const fallbackText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted.';
            processedBlob = new Blob([fallbackText], { type: 'text/plain' });
            downloadUrl = URL.createObjectURL(processedBlob);
          }
          break;

        case 'docx':
          try {
            console.log('📄 Creating DOCX document from OCR result');
            const docxText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
            
            // Prepare metadata for document
            const metadata = {
              confidence: ocrResult.confidence,
              processingTime: 0, // Will be set later
              wordsCount: ocrResult.words?.length || 0,
              language: ocrOptions.language,
              originalFileName: file.name
            };
            
            processedBlob = await documentGenerator.generateDOCX(
              docxText,
              metadata,
              {
                title: `${file.name.replace(/\.[^/.]+$/, '')} - OCR Results`,
                author: 'LocalPDF OCR Tool',
                subject: 'OCR Extracted Text',
                fontSize: 11,
                fontFamily: 'Times New Roman',
                includeMetadata: true
              }
            );
            
            downloadUrl = URL.createObjectURL(processedBlob);
            console.log('✅ DOCX document created successfully:', processedBlob.size, 'bytes');
          } catch (docxError) {
            console.error('❌ DOCX creation failed, falling back to text:', docxError);
            const fallbackText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
            processedBlob = new Blob([fallbackText], { type: 'text/plain' });
            downloadUrl = URL.createObjectURL(processedBlob);
          }
          break;

        case 'rtf':
          try {
            console.log('📄 Creating RTF document from OCR result');
            const rtfText = ocrResult.text && ocrResult.text.trim() ? ocrResult.text : 'No text was extracted from the image. Please try a clearer image or different language setting.';
            
            // Prepare metadata for document
            const metadata = {
              confidence: ocrResult.confidence,
              processingTime: 0, // Will be set later
              wordsCount: ocrResult.words?.length || 0,
              language: ocrOptions.language,
              originalFileName: file.name
            };
            
            processedBlob = documentGenerator.generateRTF(
              rtfText,
              metadata,
              {
                title: `${file.name.replace(/\.[^/.]+$/, '')} - OCR Results`,
                author: 'LocalPDF OCR Tool',
                fontSize: 11,
                fontFamily: 'Times New Roman',
                includeMetadata: true
              }
            );
            
            downloadUrl = URL.createObjectURL(processedBlob);
            console.log('✅ RTF document created successfully:', processedBlob.size, 'bytes');
          } catch (rtfError) {
            console.error('❌ RTF creation failed, falling back to text:', rtfError);
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

      // Determine MIME type based on the actual blob type
      let mimeType = processedBlob.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        // Fallback MIME type determination
        switch (ocrOptions.outputFormat) {
          case 'searchable-pdf':
            mimeType = 'application/pdf';
            break;
          case 'docx':
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'rtf':
            mimeType = 'application/rtf';
            break;
          default:
            mimeType = 'text/plain';
        }
      }

      return {
        originalFile: file,
        result: {
          ...ocrResult,
          outputFormat: ocrOptions.outputFormat,
          originalOutputFormat: ocrOptions.outputFormat // Save original choice for later reference
        },
        processedBlob,
        downloadUrl,
        processingTime,
        mimeType,
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

  // === ADVANCED OCR METHODS ===

  /**
   * Analyze image quality and provide preprocessing recommendations
   */
  async analyzeImageQuality(file: File): Promise<ImageQualityAnalysis> {
    console.log('🔍 Analyzing image quality:', file.name);

    try {
      const img = await this.loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      // Calculate DPI (approximate based on image dimensions)
      const resolution = Math.round((width + height) / 2 / 8.5); // Assuming 8.5" average dimension

      // Analyze clarity (edge detection approximation)
      const clarity = this.calculateClarity(data, width, height);

      // Analyze contrast
      const contrast = this.calculateContrast(data);

      // Detect skew angle (simplified)
      const skewAngle = this.detectSkewAngle(data, width, height);

      // Determine if scanned or photo
      const isScanned = resolution > 150 && clarity > 60;

      // Check for noise
      const hasNoise = this.detectNoise(data);

      // Generate preprocessing recommendations
      const recommendPreprocessing = clarity < 70 || contrast < 50 || hasNoise || Math.abs(skewAngle) > 2;

      const suggestedOptions: ImagePreprocessingOptions = {
        denoise: hasNoise,
        deskew: Math.abs(skewAngle) > 2,
        contrast: contrast < 60,
        binarization: clarity < 50,
        removeBackground: false
      };

      const analysis: ImageQualityAnalysis = {
        resolution,
        clarity,
        contrast,
        skewAngle,
        isScanned,
        hasNoise,
        recommendPreprocessing,
        suggestedOptions
      };

      console.log('✅ Image quality analysis complete:', analysis);
      return analysis;

    } catch (error) {
      console.error('❌ Image quality analysis failed:', error);
      // Return default analysis
      return {
        resolution: 150,
        clarity: 60,
        contrast: 60,
        skewAngle: 0,
        isScanned: true,
        hasNoise: false,
        recommendPreprocessing: false,
        suggestedOptions: {
          denoise: false,
          deskew: false,
          contrast: false,
          binarization: false,
          removeBackground: false
        }
      };
    }
  }

  /**
   * Detect document languages with content analysis
   */
  async detectDocumentLanguages(file: File): Promise<LanguageDetectionResult> {
    console.log('🌍 Detecting document languages:', file.name);

    try {
      // Start with filename-based hints
      const filename = file.name.toLowerCase();
      let primary = 'eng';
      let script: 'latin' | 'cyrillic' | 'chinese' = 'latin';
      let confidence = 50; // Low confidence from filename alone
      const secondary: string[] = [];
      let mixedLanguages = false;

      // Check filename for language hints (low confidence)
      if (filename.includes('rus') || filename.includes('russian') || filename.includes('русск')) {
        primary = 'rus';
        script = 'cyrillic';
        confidence = 70;
      } else if (filename.includes('deu') || filename.includes('german') || filename.includes('deutsch')) {
        primary = 'deu';
        confidence = 70;
      } else if (filename.includes('fra') || filename.includes('french') || filename.includes('français')) {
        primary = 'fra';
        confidence = 70;
      } else if (filename.includes('spa') || filename.includes('spanish') || filename.includes('español')) {
        primary = 'spa';
        confidence = 70;
      }

      // Try QuickOCR for actual content analysis (high confidence)
      try {
        console.log('🔍 Attempting quick content analysis for language detection...');
        const { QuickOCR } = await import('../utils/quickOCR');
        const contentDetection = await QuickOCR.quickAnalyzeForLanguage(file);

        console.log('✅ Content detection result:', contentDetection);

        // Always use content detection, adjust confidence based on QuickOCR result
        primary = contentDetection.language;

        // Convert string confidence to number
        if (contentDetection.confidence === 'high') {
          confidence = 95;
        } else if (contentDetection.confidence === 'medium') {
          confidence = 75;
        } else {
          confidence = 60; // low confidence from content analysis
        }

        // Determine script from detected language
        if (primary === 'rus' || primary === 'ukr' || primary === 'bul') {
          script = 'cyrillic';
        } else if (primary === 'chi_sim' || primary === 'chi_tra' || primary === 'jpn' || primary === 'kor') {
          script = 'chinese';
        } else {
          script = 'latin';
        }

        console.log('🎯 Using content-based detection:', { primary, script, confidence, details: contentDetection.details });
      } catch (quickOCRError) {
        console.warn('⚠️ QuickOCR analysis failed, using filename-based detection:', quickOCRError);
      }

      // Check for multiple languages
      if (filename.includes('multi') || filename.includes('bilingual')) {
        mixedLanguages = true;
        secondary.push('eng');
        if (primary !== 'rus') secondary.push('rus');
      }

      const recommendedTesseractLangs = mixedLanguages
        ? `${primary}+${secondary.join('+')}`
        : primary;

      const result: LanguageDetectionResult = {
        primary,
        secondary: secondary.length > 0 ? secondary : undefined,
        confidence,
        script,
        mixedLanguages,
        recommendedTesseractLangs
      };

      console.log('✅ Final language detection:', result);
      return result;

    } catch (error) {
      console.error('❌ Language detection failed:', error);
      return {
        primary: 'eng',
        confidence: 50,
        script: 'latin',
        mixedLanguages: false,
        recommendedTesseractLangs: 'eng'
      };
    }
  }

  /**
   * Analyze document structure
   */
  async analyzeDocumentStructure(file: File): Promise<DocumentStructure> {
    console.log('📊 Analyzing document structure:', file.name);

    try {
      const img = await this.loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { width, height } = imageData;

      // Detect layout based on aspect ratio and dimensions
      const aspectRatio = width / height;
      let layout: 'single' | 'double' | 'complex' = 'single';

      if (aspectRatio > 1.5) {
        layout = 'double'; // Wide format suggests multiple columns
      }

      // Estimate text density (simplified)
      const textDensity = this.estimateTextDensity(imageData);

      // Detect columns (simplified heuristic)
      const hasColumns = aspectRatio > 1.3 || width > 2000;

      // Estimate font size
      const averageFontSize = Math.round(Math.max(10, Math.min(14, height / 60)));

      const structure: DocumentStructure = {
        hasColumns,
        hasTables: false, // Would need more complex analysis
        hasImages: false, // Would need more complex analysis
        hasHandwriting: false, // Would need ML model
        layout,
        textDensity,
        averageFontSize
      };

      console.log('✅ Document structure analysis complete:', structure);
      return structure;

    } catch (error) {
      console.error('❌ Document structure analysis failed:', error);
      return {
        hasColumns: false,
        hasTables: false,
        hasImages: false,
        hasHandwriting: false,
        layout: 'single',
        textDensity: 50,
        averageFontSize: 12
      };
    }
  }

  /**
   * Perform advanced OCR with full options
   */
  async performAdvancedOCR(
    file: File,
    options: AdvancedOCROptions,
    onProgress?: (progress: number) => void
  ): Promise<AdvancedOCRResult> {
    console.log('🚀 Starting advanced OCR:', options);
    const startTime = Date.now();

    try {
      // Apply preprocessing if requested
      let processedFile = file;
      if (options.preprocessImage && options.preprocessOptions) {
        processedFile = await this.applyPreprocessing(file, options.preprocessOptions);
      }

      // Convert advanced options to standard OCR options
      const standardOptions: OCROptions = {
        language: options.languages.join('+'),
        preserveLayout: options.preserveLayout,
        outputFormat: 'text',
        imagePreprocessing: options.preprocessImage
      };

      // Process with standard OCR
      const result = await this.processImage(processedFile, standardOptions, (progress) => {
        onProgress?.(progress.progress);
      });

      // Build advanced result
      const processingTime = Date.now() - startTime;
      const wordCount = result.text.split(/\s+/).filter(w => w.length > 0).length;

      const advancedResult: AdvancedOCRResult = {
        ...result,
        wordCount,
        processingTime,
        languages: options.languages,
        warnings: []
      };

      console.log('✅ Advanced OCR complete:', advancedResult);
      return advancedResult;

    } catch (error) {
      console.error('❌ Advanced OCR failed:', error);
      throw error;
    }
  }

  /**
   * Apply image preprocessing
   */
  private async applyPreprocessing(
    file: File,
    options: ImagePreprocessingOptions
  ): Promise<File> {
    console.log('🔧 Applying preprocessing:', options);

    try {
      const img = await this.loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply preprocessing steps
      if (options.contrast) {
        imageData = this.enhanceContrast(imageData);
      }

      if (options.denoise) {
        imageData = this.applyDenoise(imageData);
      }

      if (options.binarization) {
        imageData = this.applyBinarization(imageData);
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert back to file
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/png');
      });

      return new File([blob], file.name, { type: 'image/png' });

    } catch (error) {
      console.warn('⚠️ Preprocessing failed, using original:', error);
      return file;
    }
  }

  // === IMAGE PROCESSING HELPERS ===

  private async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateClarity(data: Uint8ClampedArray, width: number, height: number): number {
    // Simplified edge detection for clarity measurement
    let edgeStrength = 0;
    const sampleSize = Math.min(10000, data.length / 4);

    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
      if (idx + width * 4 < data.length) {
        const current = data[idx];
        const below = data[idx + width * 4];
        edgeStrength += Math.abs(current - below);
      }
    }

    return Math.min(100, (edgeStrength / sampleSize) * 2);
  }

  private calculateContrast(data: Uint8ClampedArray): number {
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }
    return Math.round((max - min) / 255 * 100);
  }

  private detectSkewAngle(data: Uint8ClampedArray, width: number, height: number): number {
    // Simplified skew detection - would need Hough transform for accuracy
    return 0; // Placeholder
  }

  private detectNoise(data: Uint8ClampedArray): boolean {
    // Simple noise detection based on variance
    let sum = 0, count = 0;
    for (let i = 0; i < Math.min(10000, data.length); i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += gray;
      count++;
    }
    const mean = sum / count;

    let variance = 0;
    for (let i = 0; i < Math.min(10000, data.length); i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      variance += Math.pow(gray - mean, 2);
    }
    variance /= count;

    return variance > 2000; // High variance suggests noise
  }

  private estimateTextDensity(imageData: ImageData): number {
    const { data } = imageData;
    let darkPixels = 0;
    const sampleSize = Math.min(10000, data.length / 4);

    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (gray < 128) darkPixels++;
    }

    return Math.round((darkPixels / sampleSize) * 100);
  }

  private enhanceContrast(imageData: ImageData): ImageData {
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));
      data[i] = data[i + 1] = data[i + 2] = enhanced;
    }
    return imageData;
  }

  private applyDenoise(imageData: ImageData): ImageData {
    // Simplified median filter
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const neighbors = [
          data[idx], data[idx - 4], data[idx + 4],
          data[idx - width * 4], data[idx + width * 4]
        ];
        neighbors.sort((a, b) => a - b);
        const median = neighbors[2];
        newData[idx] = newData[idx + 1] = newData[idx + 2] = median;
      }
    }

    return new ImageData(newData, width, height);
  }

  private applyBinarization(imageData: ImageData): ImageData {
    const { data } = imageData;
    // Otsu's method approximation
    const threshold = 128; // Simplified

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const binary = gray > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = binary;
    }

    return imageData;
  }

  /**
   * Try to extract text directly from PDF (for text-based PDFs)
   * Returns null if PDF contains no extractable text (scanned document)
   */
  private async tryExtractTextFromPDF(file: File): Promise<string | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      // Extract text from all pages with smart formatting
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Add page separator
        if (pageNum > 1) {
          fullText += '\n\n' + '═'.repeat(60) + '\n';
          fullText += `PAGE ${pageNum}\n`;
          fullText += '═'.repeat(60) + '\n\n';
        } else {
          fullText += '═'.repeat(60) + '\n';
          fullText += `PAGE 1\n`;
          fullText += '═'.repeat(60) + '\n\n';
        }

        // Smart text extraction with positioning awareness
        const items = textContent.items as any[];
        let lastY = 0;
        let pageText = '';

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const text = item.str;
          const y = item.transform[5]; // Y coordinate

          // Detect line breaks based on Y position
          if (lastY !== 0 && Math.abs(y - lastY) > 3) {
            pageText += '\n';
          }

          // Add space between words if needed
          if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ') && text.trim()) {
            pageText += ' ';
          }

          pageText += text;
          lastY = y;
        }

        // Smart paragraph detection and formatting
        pageText = this.smartFormatText(pageText);
        fullText += pageText;
      }

      // Clean up excessive whitespace
      fullText = fullText.replace(/\n{4,}/g, '\n\n\n');

      if (fullText.length > 0) {
        console.log(`✅ Extracted ${fullText.length} characters from ${pdf.numPages} pages`);
        return fullText;
      }

      console.log('⚠️ PDF contains no extractable text');
      return null;

    } catch (error) {
      console.error('❌ Failed to extract text from PDF:', error);
      return null;
    }
  }

  /**
   * Smart text formatting - detects paragraphs, headings, lists
   */
  private smartFormatText(text: string): string {
    // Split into lines
    let lines = text.split('\n').map(line => line.trim());
    let formatted = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const nextLine = lines[i + 1] || '';

      // Detect headings (short lines followed by content, or ALL CAPS)
      const isHeading = (
        (line.length < 60 && nextLine.length > 60) ||
        (line === line.toUpperCase() && line.length > 3 && line.length < 80 && /^[А-ЯA-Z\s\d.,!?:;-]+$/.test(line))
      );

      // Detect list items
      const isListItem = /^[\-•·●○▪▫]/.test(line) || /^\d+[\.\)]/.test(line) || /^[a-zа-я][\.\)]/.test(line);

      if (isHeading) {
        // Add spacing before heading
        if (formatted.length > 0) {
          formatted += '\n\n';
        }
        formatted += line + '\n';
        inList = false;
      } else if (isListItem) {
        if (!inList && formatted.length > 0) {
          formatted += '\n';
        }
        formatted += line + '\n';
        inList = true;
      } else {
        // Regular paragraph
        if (inList) {
          formatted += '\n';
          inList = false;
        }

        // Check if this continues previous line
        const shouldContinue = formatted.length > 0 &&
                               !formatted.endsWith('\n\n') &&
                               !formatted.endsWith('.\n') &&
                               !formatted.endsWith('!\n') &&
                               !formatted.endsWith('?\n') &&
                               !formatted.endsWith(':\n') &&
                               line.length > 0 &&
                               line[0] === line[0].toLowerCase();

        if (shouldContinue && formatted.endsWith('\n')) {
          // Continue on same line
          formatted = formatted.slice(0, -1) + ' ' + line + '\n';
        } else {
          formatted += line + '\n';
        }
      }
    }

    return formatted;
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
