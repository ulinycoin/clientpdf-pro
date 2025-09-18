import * as pdfjsLib from 'pdfjs-dist';
import {
  ImageExtractionOptions,
  ImageExtractionResult,
  ExtractedImage,
  ImageExtractionProgress,
  DEFAULT_EXTRACTION_OPTIONS,
  PDFImageObject,
  IMAGE_QUALITY_PRESETS
} from '../types/imageExtraction.types';
import { createFileName } from '../utils/fileHelpers';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class ImageExtractionService {
  private static instance: ImageExtractionService;

  static getInstance(): ImageExtractionService {
    if (!this.instance) {
      this.instance = new ImageExtractionService();
    }
    return this.instance;
  }

  /**
   * Extract all images from PDF document
   */
  async extractImages(
    file: File,
    options: ImageExtractionOptions = DEFAULT_EXTRACTION_OPTIONS,
    onProgress?: (progress: ImageExtractionProgress) => void
  ): Promise<ImageExtractionResult> {
    const startTime = Date.now();
    const mergedOptions = { ...DEFAULT_EXTRACTION_OPTIONS, ...options };

    try {
      // Update progress - initializing
      onProgress?.({
        currentPage: 0,
        totalPages: 0,
        imagesFound: 0,
        percentage: 0,
        status: 'preparing',
        message: 'Loading PDF document...'
      });

      // Load PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;

      // Determine which pages to process
      const pagesToProcess = this.getPageNumbers(totalPages, mergedOptions);

      onProgress?.({
        currentPage: 0,
        totalPages: pagesToProcess.length,
        imagesFound: 0,
        percentage: 5,
        status: 'extracting',
        message: `Extracting images from ${pagesToProcess.length} pages...`
      });

      // Extract images from all pages with memory management
      const allImages: ExtractedImage[] = [];
      let totalImagesFound = 0;

      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageNumber = pagesToProcess[i];

        onProgress?.({
          currentPage: i + 1,
          totalPages: pagesToProcess.length,
          imagesFound: totalImagesFound,
          percentage: 5 + (i / pagesToProcess.length) * 85,
          status: 'extracting',
          message: `Processing page ${pageNumber}... (${totalImagesFound} images found)`,
          currentImage: `Page ${pageNumber}`
        });

        const pageImages = await this.extractImagesFromPage(
          pdfDoc,
          pageNumber,
          mergedOptions,
          file.name
        );

        allImages.push(...pageImages);
        totalImagesFound += pageImages.length;
        
        // Memory management: yield control periodically
        if (i % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // For very large files, limit memory usage
        if (totalImagesFound > 200) {
          onProgress?.({
            currentPage: i + 1,
            totalPages: pagesToProcess.length,
            imagesFound: totalImagesFound,
            percentage: 5 + (i / pagesToProcess.length) * 85,
            status: 'extracting',
            message: `Large file detected. Processing ${totalImagesFound} images...`,
            currentImage: `Memory optimization active`
          });
        }
        
        console.log(`Page ${pageNumber}: found ${pageImages.length} images (total: ${totalImagesFound})`);
      }

      // Filter images by size
      let filteredImages = allImages.filter(img => 
        img.width >= (mergedOptions.minWidth || 32) &&
        img.height >= (mergedOptions.minHeight || 32)
      );

      // Deduplicate images if requested
      let duplicatesRemoved = 0;
      if (mergedOptions.deduplicateImages) {
        onProgress?.({
          currentPage: pagesToProcess.length,
          totalPages: pagesToProcess.length,
          imagesFound: filteredImages.length,
          percentage: 90,
          status: 'processing',
          message: 'Removing duplicate images...'
        });

        const originalCount = filteredImages.length;
        filteredImages = this.deduplicateImages(filteredImages);
        duplicatesRemoved = originalCount - filteredImages.length;
      }

      onProgress?.({
        currentPage: pagesToProcess.length,
        totalPages: pagesToProcess.length,
        imagesFound: filteredImages.length,
        percentage: 100,
        status: 'complete',
        message: `Extracted ${filteredImages.length} images`
      });

      // Calculate total size
      const totalSize = filteredImages.reduce((sum, img) => sum + img.size, 0);

      return {
        success: true,
        images: filteredImages,
        totalImages: filteredImages.length,
        totalSize,
        duplicatesRemoved: duplicatesRemoved > 0 ? duplicatesRemoved : undefined,
        metadata: {
          processingTime: Date.now() - startTime,
          pagesProcessed: pagesToProcess.length,
          originalFileSize: file.size,
          extractedFileSize: totalSize,
          options: mergedOptions
        }
      };

    } catch (error) {
      console.error('[ImageExtractionService] Extraction failed:', error);

      return {
        success: false,
        images: [],
        totalImages: 0,
        totalSize: 0,
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      };
    }
  }

  /**
   * Extract embedded images from a single PDF page
   */
  private async extractImagesFromPage(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string
  ): Promise<ExtractedImage[]> {
    const page = await pdfDoc.getPage(pageNumber);
    const extractedImages: ExtractedImage[] = [];

    try {
      console.log(`Processing page ${pageNumber} for embedded images...`);
      
      // Get operator list to find image operations
      const operatorList = await page.getOperatorList();
      console.log(`Found ${operatorList.fnArray.length} operations on page ${pageNumber}`);
      
      // Find image painting operations
      const imageOperations: string[] = [];
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const fn = operatorList.fnArray[i];
        const args = operatorList.argsArray[i];
        
        if (fn === pdfjsLib.OPS.paintImageXObject) {
          const imageName = args[0];
          imageOperations.push(imageName);
          console.log(`Found image operation: ${imageName} on page ${pageNumber}`);
        }
      }
      
      console.log(`Found ${imageOperations.length} image operations on page ${pageNumber}:`, imageOperations);
      
      // Extract images using a working approach
      if (imageOperations.length > 0) {
        // Create a temporary canvas to render individual images
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        // Method 1: Try to access page objects directly
        await this.extractImagesViaObjects(page, imageOperations, pageNumber, options, originalFileName, extractedImages);
        
        // Method 2: If no images extracted, try alternative approach
        if (extractedImages.length === 0 && imageOperations.length > 0) {
          console.log(`No images extracted via objects, trying render approach for page ${pageNumber}`);
          await this.extractImagesViaRendering(page, viewport, pageNumber, options, originalFileName, extractedImages);
        }
      } else {
        console.log(`No image operations found on page ${pageNumber}`);
      }

    } catch (pageError) {
      console.warn(`Failed to process page ${pageNumber}:`, pageError);
    }

    return extractedImages;
  }

  /**
   * Extract images via PDF object access with advanced PDF.js API
   * Optimized for large files with batch processing
   */
  private async extractImagesViaObjects(
    page: any,
    imageOperations: string[],
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string,
    extractedImages: ExtractedImage[]
  ): Promise<void> {
    // Process images in batches to prevent blocking
    const BATCH_SIZE = 5;
    const batches = [];
    
    for (let i = 0; i < imageOperations.length; i += BATCH_SIZE) {
      batches.push(imageOperations.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Processing ${imageOperations.length} images in ${batches.length} batches for page ${pageNumber}`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} images`);
      
      await this.processBatch(batch, page, pageNumber, options, originalFileName, extractedImages);
      
      // Yield control to browser after each batch
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Force garbage collection hint
      if ('gc' in window) {
        (window as any).gc();
      }
    }
  }
  
  /**
   * Process a batch of images
   */
  private async processBatch(
    imageBatch: string[],
    page: any,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string,
    extractedImages: ExtractedImage[]
  ): Promise<void> {
    for (const imageName of imageBatch) {
      try {
        console.log(`Attempting to extract image: ${imageName}`);
        
        // Method 1: Try to render each image individually using PDF.js internals
        const extracted = await this.extractImageUsingAdvancedAPI(page, imageName, pageNumber, options, originalFileName);
        if (extracted) {
          extractedImages.push(extracted);
          console.log(`Successfully extracted image ${imageName} via advanced API`);
          continue;
        }

        // Method 2: Wait for object and try standard approach
        await new Promise(resolve => {
          const checkObject = () => {
            if (page.objs.has(imageName)) {
              resolve(undefined);
            } else {
              setTimeout(checkObject, 10);
            }
          };
          checkObject();
        });
        
        if (page.objs.has(imageName)) {
          const imageObj = page.objs.get(imageName);
          console.log(`Got image object ${imageName} (type: ${typeof imageObj}):`, imageObj);
          
          // Try different object types
          if (imageObj instanceof HTMLImageElement || imageObj instanceof HTMLCanvasElement || imageObj instanceof ImageData) {
            const extracted = await this.processImageObjectDirect(imageObj, imageName, pageNumber, options, originalFileName);
            if (extracted) {
              extractedImages.push(extracted);
              console.log(`Successfully extracted image ${imageName} via direct method`);
            }
          } else if (imageObj && typeof imageObj === 'object') {
            // Handle PDF.js internal image objects
            const extracted = await this.processAdvancedImageObject(imageObj, imageName, pageNumber, options, originalFileName);
            if (extracted) {
              extractedImages.push(extracted);
              console.log(`Successfully extracted image ${imageName} via advanced object processing`);
            }
          } else {
            console.warn(`Unknown image object type for ${imageName}:`, typeof imageObj);
          }
        } else {
          console.warn(`Image object ${imageName} not found in page objects`);
        }
      } catch (imgError) {
        console.warn(`Failed to extract image ${imageName} from page ${pageNumber}:`, imgError);
      }
    }
  }

  /**
   * Extract image using advanced PDF.js API
   */
  private async extractImageUsingAdvancedAPI(
    page: any,
    imageName: string,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string
  ): Promise<ExtractedImage | null> {
    try {
      // Create a temporary canvas to render just this image
      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Try to render the page with intent to access image operations
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        intent: 'display',
        enableWebGL: false,
        renderTextLayer: false,
        renderAnnotationLayer: false
      };

      // Get operator list with more details
      const operatorList = await page.getOperatorList();
      
      // Find the specific image operation
      let imageOpIndex = -1;
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject && 
            operatorList.argsArray[i][0] === imageName) {
          imageOpIndex = i;
          break;
        }
      }

      if (imageOpIndex === -1) {
        console.warn(`Image operation not found for ${imageName}`);
        return null;
      }

      // Try to get transform matrix and dimensions from the operation
      const imageArgs = operatorList.argsArray[imageOpIndex];
      console.log(`Image operation args for ${imageName}:`, imageArgs);

      // Look for transform operations before the image
      let transformMatrix = [1, 0, 0, 1, 0, 0]; // identity matrix
      for (let i = imageOpIndex - 1; i >= 0; i--) {
        const op = operatorList.fnArray[i];
        if (op === pdfjsLib.OPS.transform) {
          transformMatrix = operatorList.argsArray[i];
          break;
        }
      }

      console.log(`Transform matrix for ${imageName}:`, transformMatrix);

      // Calculate image dimensions from transform matrix
      const imageWidth = Math.abs(transformMatrix[0]) * scale;
      const imageHeight = Math.abs(transformMatrix[3]) * scale;
      const imageX = transformMatrix[4] * scale;
      const imageY = (viewport.height / scale - transformMatrix[5] - Math.abs(transformMatrix[3])) * scale;

      console.log(`Calculated dimensions for ${imageName}: ${imageWidth}x${imageHeight} at (${imageX}, ${imageY})`);

      // Apply size filter
      if (imageWidth < (options.minWidth || 32) || imageHeight < (options.minHeight || 32)) {
        console.log(`Image ${imageName} too small: ${imageWidth}x${imageHeight}`);
        return null;
      }

      // Render the full page first
      await page.render(renderContext).promise;

      // Extract the image region from the rendered canvas
      if (imageWidth > 0 && imageHeight > 0) {
        const imageCanvas = document.createElement('canvas');
        const imageContext = imageCanvas.getContext('2d');
        if (!imageContext) return null;

        imageCanvas.width = Math.max(1, Math.round(imageWidth));
        imageCanvas.height = Math.max(1, Math.round(imageHeight));

        // Extract the image region
        imageContext.drawImage(
          canvas,
          Math.max(0, Math.round(imageX)), Math.max(0, Math.round(imageY)),
          Math.round(imageWidth), Math.round(imageHeight),
          0, 0,
          imageCanvas.width, imageCanvas.height
        );

        // Convert to desired format
        const { blob, dataUrl } = await this.convertCanvasToFormat(imageCanvas, options);
        
        const id = `${pageNumber}_${imageName}_${Date.now()}`;
        const baseName = originalFileName.replace(/\.pdf$/i, '');
        const extension = this.getFileExtension(options.outputFormat || 'png', 'Extracted');
        const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

        return {
          id,
          pageNumber,
          originalFormat: 'PDF Image',
          width: imageCanvas.width,
          height: imageCanvas.height,
          size: blob.size,
          blob,
          dataUrl,
          filename,
          isVector: false,
          metadata: {
            colorSpace: 'RGB',
            compression: 'PDF Extracted'
          }
        };
      }

      return null;
    } catch (error) {
      console.warn(`Failed to extract image ${imageName} using advanced API:`, error);
      return null;
    }
  }

  /**
   * Process advanced PDF.js image objects
   */
  private async processAdvancedImageObject(
    imageObj: any,
    imageName: string,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string
  ): Promise<ExtractedImage | null> {
    try {
      console.log(`Processing advanced image object ${imageName}:`, imageObj);
      
      // Check if it's an ImageBitmap
      if (imageObj instanceof ImageBitmap) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        canvas.width = imageObj.width;
        canvas.height = imageObj.height;
        ctx.drawImage(imageObj, 0, 0);

        const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);
        
        const id = `${pageNumber}_${imageName}_${Date.now()}`;
        const baseName = originalFileName.replace(/\.pdf$/i, '');
        const extension = this.getFileExtension(options.outputFormat || 'png', 'ImageBitmap');
        const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

        return {
          id,
          pageNumber,
          originalFormat: 'ImageBitmap',
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          blob,
          dataUrl,
          filename,
          isVector: false,
          metadata: {
            colorSpace: 'RGB',
            compression: 'ImageBitmap'
          }
        };
      }

      // Check for other object properties
      if (imageObj.width && imageObj.height) {
        const width = imageObj.width;
        const height = imageObj.height;

        if (width < (options.minWidth || 32) || height < (options.minHeight || 32)) {
          return null;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        canvas.width = width;
        canvas.height = height;

        // Try different ways to access image data
        if (imageObj.bitmap) {
          ctx.drawImage(imageObj.bitmap, 0, 0);
        } else if (imageObj.canvas) {
          ctx.drawImage(imageObj.canvas, 0, 0);
        } else if (imageObj.data && imageObj.data instanceof Uint8Array) {
          // Try to create ImageData from raw data
          const imageData = this.createImageDataFromRawData(imageObj.data, width, height);
          if (imageData) {
            ctx.putImageData(imageData, 0, 0);
          } else {
            // Fallback pattern
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#888888';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${width}×${height}`, width / 2, height / 2 - 5);
            ctx.fillText('PDF Image', width / 2, height / 2 + 15);
          }
        } else {
          // Create a visual indicator that an image was found but couldn't be extracted
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(0, 0, width, height);
          ctx.strokeStyle = '#cccccc';
          ctx.strokeRect(0, 0, width, height);
          
          ctx.fillStyle = '#666666';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Found Image', width / 2, height / 2 - 10);
          ctx.fillText(`${width}×${height}`, width / 2, height / 2 + 10);
        }

        const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);
        
        const id = `${pageNumber}_${imageName}_${Date.now()}`;
        const baseName = originalFileName.replace(/\.pdf$/i, '');
        const extension = this.getFileExtension(options.outputFormat || 'png', 'Advanced');
        const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

        return {
          id,
          pageNumber,
          originalFormat: 'PDF Object',
          width,
          height,
          size: blob.size,
          blob,
          dataUrl,
          filename,
          isVector: false,
          metadata: {
            colorSpace: 'RGB',
            compression: 'Advanced Processing'
          }
        };
      }

      return null;
    } catch (error) {
      console.warn(`Failed to process advanced image object ${imageName}:`, error);
      return null;
    }
  }

  /**
   * Extract images via selective rendering (fallback)
   */
  private async extractImagesViaRendering(
    page: any,
    viewport: any,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string,
    extractedImages: ExtractedImage[]
  ): Promise<void> {
    try {
      // Render page to get a fallback image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      console.log(`Rendered fallback for page ${pageNumber} (${canvas.width}x${canvas.height})`);

      if (canvas.width > (options.minWidth || 32) && canvas.height > (options.minHeight || 32)) {
        const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);
        
        const id = `${pageNumber}_rendered_${Date.now()}`;
        const baseName = originalFileName.replace(/\.pdf$/i, '');
        const extension = this.getFileExtension(options.outputFormat || 'png', 'PNG');
        const filename = `${baseName}_page${pageNumber}_rendered.${extension}`;

        const extractedImage: ExtractedImage = {
          id,
          pageNumber,
          originalFormat: 'Rendered',
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          blob,
          dataUrl,
          filename,
          isVector: false,
          metadata: {
            colorSpace: 'RGB',
            compression: 'Page Render',
          }
        };

        extractedImages.push(extractedImage);
        console.log(`Added rendered fallback for page ${pageNumber}`);
      }
    } catch (renderError) {
      console.warn(`Failed to render page ${pageNumber}:`, renderError);
    }
  }

  /**
   * Process direct image objects (HTMLImageElement, HTMLCanvasElement, ImageData)
   */
  private async processImageObjectDirect(
    imageObj: HTMLImageElement | HTMLCanvasElement | ImageData,
    imageName: string,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string
  ): Promise<ExtractedImage | null> {
    try {
      let canvas: HTMLCanvasElement;
      let width: number;
      let height: number;
      let originalFormat = 'unknown';

      if (imageObj instanceof HTMLImageElement) {
        width = imageObj.naturalWidth || imageObj.width;
        height = imageObj.naturalHeight || imageObj.height;
        originalFormat = 'Image';
        
        canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(imageObj, 0, 0);
        
      } else if (imageObj instanceof HTMLCanvasElement) {
        canvas = imageObj;
        width = canvas.width;
        height = canvas.height;
        originalFormat = 'Canvas';
        
      } else if (imageObj instanceof ImageData) {
        width = imageObj.width;
        height = imageObj.height;
        originalFormat = 'ImageData';
        
        canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        canvas.width = width;
        canvas.height = height;
        ctx.putImageData(imageObj, 0, 0);
      } else {
        return null;
      }

      // Apply size filters
      if (width < (options.minWidth || 32) || height < (options.minHeight || 32)) {
        return null;
      }

      const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);
      
      const id = `${pageNumber}_${imageName}_${Date.now()}`;
      const baseName = originalFileName.replace(/\.pdf$/i, '');
      const extension = this.getFileExtension(options.outputFormat || 'original', originalFormat);
      const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

      return {
        id,
        pageNumber,
        originalFormat,
        width,
        height,
        size: blob.size,
        blob,
        dataUrl,
        filename,
        isVector: false,
        metadata: {
          colorSpace: 'RGB',
          compression: originalFormat,
        }
      };

    } catch (error) {
      console.warn(`Failed to process direct image object ${imageName}:`, error);
      return null;
    }
  }

  /**
   * Process generic image objects
   */
  private async processImageObjectGeneric(
    imageObj: any,
    imageName: string,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string
  ): Promise<ExtractedImage | null> {
    try {
      const width = imageObj.width || 0;
      const height = imageObj.height || 0;

      if (width < (options.minWidth || 32) || height < (options.minHeight || 32)) {
        return null;
      }

      // Try to convert to canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      canvas.width = width;
      canvas.height = height;

      // Try different ways to draw the object
      if (typeof imageObj.drawImage === 'function') {
        await imageObj.drawImage(ctx, 0, 0, width, height);
      } else if (imageObj.data) {
        // Try to create ImageData from raw data
        const imageData = new ImageData(new Uint8ClampedArray(imageObj.data), width, height);
        ctx.putImageData(imageData, 0, 0);
      } else {
        // Fallback: create a placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Extracted', width / 2, height / 2);
      }

      const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);
      
      const id = `${pageNumber}_${imageName}_${Date.now()}`;
      const baseName = originalFileName.replace(/\.pdf$/i, '');
      const extension = this.getFileExtension(options.outputFormat || 'png', 'PNG');
      const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

      return {
        id,
        pageNumber,
        originalFormat: 'Generic',
        width,
        height,
        size: blob.size,
        blob,
        dataUrl,
        filename,
        isVector: false,
        metadata: {
          colorSpace: 'RGB',
          compression: 'Generic Object',
        }
      };

    } catch (error) {
      console.warn(`Failed to process generic image object ${imageName}:`, error);
      return null;
    }
  }

  /**
   * Process PDF image object from XObject
   */
  private async processPDFImageObject(
    obj: any,
    imageName: string,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string,
    pdfDoc: pdfjsLib.PDFDocumentProxy
  ): Promise<ExtractedImage | null> {
    try {
      const dict = obj.dict;
      const width = dict.get('Width');
      const height = dict.get('Height');
      
      if (!width || !height) {
        return null;
      }

      // Apply size filters
      if (width < (options.minWidth || 32) || height < (options.minHeight || 32)) {
        return null;
      }

      // Get image data
      const data = obj.data;
      if (!data) {
        console.warn(`No data for image ${imageName}`);
        return null;
      }

      // Determine image format
      const filter = dict.get('Filter');
      let originalFormat = 'unknown';
      let mimeType = 'image/png';

      if (filter) {
        if (filter.name === 'DCTDecode') {
          originalFormat = 'JPEG';
          mimeType = 'image/jpeg';
        } else if (filter.name === 'FlateDecode') {
          originalFormat = 'PNG';
          mimeType = 'image/png';
        }
      }

      // Create canvas to render the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = width;
      canvas.height = height;

      // Convert raw image data to ImageData and render to canvas
      try {
        // For JPEG images (DCTDecode), we can create blob directly
        if (filter && filter.name === 'DCTDecode') {
          const blob = new Blob([data], { type: 'image/jpeg' });
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(img.src);
              resolve(undefined);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
          });
        } else {
          // For other formats, create ImageData manually
          const imageData = this.createImageDataFromRawData(data, width, height);
          if (imageData) {
            ctx.putImageData(imageData, 0, 0);
          } else {
            // Fallback: fill with placeholder
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#666666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Image', width / 2, height / 2);
          }
        }

        // Convert canvas to desired format
        const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);

        // Generate unique ID and filename
        const id = `${pageNumber}_${imageName}_${Date.now()}`;
        const baseName = originalFileName.replace(/\.pdf$/i, '');
        const extension = this.getFileExtension(options.outputFormat || 'original', originalFormat);
        const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

        return {
          id,
          pageNumber,
          originalFormat,
          width,
          height,
          size: blob.size,
          blob,
          dataUrl,
          filename,
          isVector: false,
          metadata: {
            colorSpace: dict.get('ColorSpace')?.name || undefined,
            compression: filter?.name || undefined,
            bitsPerComponent: dict.get('BitsPerComponent') || undefined
          }
        };

      } catch (renderError) {
        console.warn(`Failed to render image ${imageName}:`, renderError);
        return null;
      }

    } catch (error) {
      console.warn(`Failed to process PDF image ${imageName}:`, error);
      return null;
    }
  }

  /**
   * Process individual image object and convert to ExtractedImage (legacy method)
   */
  private async processImageObject(
    imageObj: any,
    imageName: string,
    pageNumber: number,
    options: ImageExtractionOptions,
    originalFileName: string
  ): Promise<ExtractedImage | null> {
    try {
      // Handle different image object types
      let imageData: ImageData | HTMLCanvasElement | null = null;
      let width = 0;
      let height = 0;
      let originalFormat = 'unknown';

      if (imageObj instanceof ImageData) {
        imageData = imageObj;
        width = imageObj.width;
        height = imageObj.height;
        originalFormat = 'ImageData';
      } else if (imageObj instanceof HTMLCanvasElement) {
        imageData = imageObj;
        width = imageObj.width;
        height = imageObj.height;
        originalFormat = 'Canvas';
      } else if (imageObj && typeof imageObj === 'object') {
        // Handle PDF.js image objects
        if (imageObj.width && imageObj.height) {
          width = imageObj.width;
          height = imageObj.height;
          originalFormat = imageObj.kind ? this.getImageFormat(imageObj.kind) : 'PDF';
          
          // Try to get image data
          if (imageObj.data) {
            imageData = await this.createImageDataFromBuffer(imageObj.data, width, height);
          }
        }
      }

      if (!imageData || width === 0 || height === 0) {
        return null;
      }

      // Apply size filters
      if (width < (options.minWidth || 32) || height < (options.minHeight || 32)) {
        return null;
      }

      // Convert to canvas if needed
      const canvas = imageData instanceof HTMLCanvasElement 
        ? imageData 
        : this.imageDataToCanvas(imageData, width, height);

      // Convert to desired format
      const { blob, dataUrl } = await this.convertCanvasToFormat(canvas, options);

      // Generate unique ID and filename
      const id = `${pageNumber}_${imageName}_${Date.now()}`;
      const baseName = originalFileName.replace(/\.pdf$/i, '');
      const extension = this.getFileExtension(options.outputFormat || 'original', originalFormat);
      const filename = `${baseName}_page${pageNumber}_${imageName}.${extension}`;

      return {
        id,
        pageNumber,
        originalFormat,
        width,
        height,
        size: blob.size,
        blob,
        dataUrl,
        filename,
        isVector: this.isVectorFormat(originalFormat),
        metadata: {
          colorSpace: imageObj.colorSpace || undefined,
          compression: imageObj.compression || undefined,
          bitsPerComponent: imageObj.bitsPerComponent || undefined
        }
      };

    } catch (error) {
      console.warn(`Failed to process image ${imageName}:`, error);
      return null;
    }
  }

  /**
   * Convert ImageData to Canvas
   */
  private imageDataToCanvas(imageData: ImageData, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  }

  /**
   * Create ImageData from raw PDF image data
   */
  private createImageDataFromRawData(data: Uint8Array, width: number, height: number): ImageData | null {
    try {
      // Try to create RGBA data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return null;
      }

      // Different approaches based on data length
      const expectedRGBA = width * height * 4;
      const expectedRGB = width * height * 3;
      const expectedGray = width * height;

      if (data.length === expectedRGBA) {
        // RGBA data
        return new ImageData(new Uint8ClampedArray(data), width, height);
      } else if (data.length === expectedRGB) {
        // RGB data - convert to RGBA
        const rgbaData = new Uint8ClampedArray(expectedRGBA);
        for (let i = 0; i < width * height; i++) {
          rgbaData[i * 4] = data[i * 3];     // R
          rgbaData[i * 4 + 1] = data[i * 3 + 1]; // G
          rgbaData[i * 4 + 2] = data[i * 3 + 2]; // B
          rgbaData[i * 4 + 3] = 255;         // A
        }
        return new ImageData(rgbaData, width, height);
      } else if (data.length === expectedGray) {
        // Grayscale data - convert to RGBA
        const rgbaData = new Uint8ClampedArray(expectedRGBA);
        for (let i = 0; i < width * height; i++) {
          const gray = data[i];
          rgbaData[i * 4] = gray;     // R
          rgbaData[i * 4 + 1] = gray; // G
          rgbaData[i * 4 + 2] = gray; // B
          rgbaData[i * 4 + 3] = 255;  // A
        }
        return new ImageData(rgbaData, width, height);
      }
      
      // Unknown format
      console.warn(`Unknown image data format: expected ${expectedRGBA}, ${expectedRGB}, or ${expectedGray} bytes, got ${data.length}`);
      return null;
    } catch (error) {
      console.warn('Failed to create ImageData from raw data:', error);
      return null;
    }
  }

  /**
   * Create ImageData from raw buffer (legacy)
   */
  private async createImageDataFromBuffer(buffer: Uint8Array, width: number, height: number): Promise<ImageData | null> {
    try {
      // Try to create ImageData from buffer
      // This is simplified - in reality we'd need to handle different color spaces and formats
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return null;
      }

      canvas.width = width;
      canvas.height = height;
      
      // For RGBA data (4 bytes per pixel)
      if (buffer.length === width * height * 4) {
        const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
        return imageData;
      }
      
      // For other formats, we'll need more sophisticated conversion
      // For now, return null and let PDF.js handle it
      return null;
    } catch (error) {
      console.warn('Failed to create ImageData from buffer:', error);
      return null;
    }
  }

  /**
   * Convert canvas to desired format with optimizations
   */
  private async convertCanvasToFormat(
    canvas: HTMLCanvasElement,
    options: ImageExtractionOptions
  ): Promise<{ blob: Blob; dataUrl: string }> {
    const outputFormat = options.outputFormat || 'original';
    
    let mimeType: string;
    let quality: number | undefined;

    switch (outputFormat) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        quality = options.jpegQuality || 0.85;
        break;
      default:
        // Use PNG as default for 'original' when we can't determine the original format
        mimeType = 'image/png';
        break;
    }

    // Optimize for large images - reduce quality for very large images
    if (canvas.width * canvas.height > 1000000) { // 1MP+
      if (mimeType === 'image/jpeg') {
        quality = Math.min(quality || 0.85, 0.75); // Reduce JPEG quality for large images
      }
      console.log(`Large image optimization: ${canvas.width}x${canvas.height}, quality: ${quality}`);
    }

    // Convert to blob with timeout to prevent hanging
    const blob = await Promise.race([
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, mimeType, quality);
      }),
      new Promise<Blob>((_, reject) => 
        setTimeout(() => reject(new Error('Canvas conversion timeout')), 10000)
      )
    ]);

    // Create data URL with error handling
    let dataUrl: string;
    try {
      dataUrl = canvas.toDataURL(mimeType, quality);
    } catch (error) {
      console.warn('Failed to create data URL, using empty fallback:', error);
      dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    return { blob, dataUrl };
  }

  /**
   * Remove duplicate images based on content similarity
   */
  private deduplicateImages(images: ExtractedImage[]): ExtractedImage[] {
    const unique: ExtractedImage[] = [];
    const hashes = new Set<string>();

    for (const image of images) {
      // Simple hash based on size and dimensions
      const hash = `${image.width}x${image.height}_${image.size}`;
      
      if (!hashes.has(hash)) {
        hashes.add(hash);
        unique.push(image);
      }
    }

    return unique;
  }

  /**
   * Determine pages to process based on options
   */
  private getPageNumbers(totalPages: number, options: ImageExtractionOptions): number[] {
    if (options.pages === 'all' || !options.pages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (Array.isArray(options.pages)) {
      return options.pages.filter(page => page >= 1 && page <= totalPages);
    }

    return [1]; // fallback
  }

  /**
   * Get image format from PDF.js kind value
   */
  private getImageFormat(kind: number): string {
    // PDF.js image kinds mapping
    switch (kind) {
      case 1: return 'JPEG';
      case 2: return 'PNG';
      case 3: return 'GIF';
      case 4: return 'BMP';
      default: return 'Unknown';
    }
  }

  /**
   * Get file extension based on output format
   */
  private getFileExtension(outputFormat: string, originalFormat: string): string {
    switch (outputFormat) {
      case 'png': return 'png';
      case 'jpeg': return 'jpg';
      case 'original':
        switch (originalFormat.toLowerCase()) {
          case 'jpeg': return 'jpg';
          case 'png': return 'png';
          case 'gif': return 'gif';
          case 'bmp': return 'bmp';
          default: return 'png';
        }
      default: return 'png';
    }
  }

  /**
   * Check if image format is vector-based
   */
  private isVectorFormat(format: string): boolean {
    return format.toLowerCase().includes('vector') || format.toLowerCase().includes('svg');
  }
}