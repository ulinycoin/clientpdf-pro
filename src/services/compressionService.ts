import { PDFDocument } from 'pdf-lib';
import { PDFProcessingResult, CompressionOptions, ProgressCallback } from '../types';

export class CompressionService {
  private static instance: CompressionService;

  static getInstance(): CompressionService {
    if (!this.instance) {
      this.instance = new CompressionService();
    }
    return this.instance;
  }

  async compressPDF(
    file: File,
    options: CompressionOptions,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = Date.now();

    try {
      onProgress?.(0, 'Reading PDF file...');

      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      onProgress?.(20, 'Loading PDF document...');

      // Load PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      onProgress?.(40, 'Analyzing document structure...');

      // Get pages count for metadata
      const pageCount = pdfDoc.getPageCount();

      onProgress?.(60, 'Applying compression settings...');

      // Apply compression options
      if (options.removeMetadata) {
        // Remove metadata
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setCreator('');
        pdfDoc.setProducer('');
        pdfDoc.setKeywords([]);
      }

      onProgress?.(80, 'Generating compressed PDF...');

      // Save with compression settings
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: options.optimizeForWeb,
        addDefaultPage: false,
      });

      onProgress?.(100, 'Compression complete!');

      const processingTime = Date.now() - startTime;
      const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      return {
        success: true,
        data: compressedBlob,
        metadata: {
          originalSize: file.size,
          processedSize: compressedBlob.size,
          processingTime,
          pageCount,
          compressionRatio: Math.round((1 - compressedBlob.size / file.size) * 100),
        },
      };
    } catch (error) {
      console.error('[CompressionService] Error:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Compression failed',
          code: 'COMPRESSION_ERROR',
          cause: error,
        },
      };
    }
  }

  // Helper method to estimate compression potential
  estimateCompressionPotential(file: File): number {
    // Very basic estimation based on file size
    if (file.size < 1024 * 1024) { // < 1MB
      return 10; // Low compression potential
    } else if (file.size < 5 * 1024 * 1024) { // < 5MB
      return 30; // Medium compression potential
    } else {
      return 50; // High compression potential
    }
  }

  // Helper method to get recommended settings
  getRecommendedSettings(file: File): CompressionOptions {
    const estimatedPotential = this.estimateCompressionPotential(file);
    
    if (estimatedPotential > 40) {
      return {
        quality: 0.7,
        imageCompression: true,
        removeMetadata: true,
        optimizeForWeb: true,
      };
    } else if (estimatedPotential > 20) {
      return {
        quality: 0.8,
        imageCompression: true,
        removeMetadata: false,
        optimizeForWeb: true,
      };
    } else {
      return {
        quality: 0.9,
        imageCompression: false,
        removeMetadata: false,
        optimizeForWeb: false,
      };
    }
  }
}

// Export singleton instance
export const compressionService = CompressionService.getInstance();