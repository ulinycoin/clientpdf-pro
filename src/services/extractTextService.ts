import { PDFDocument, PDFPage } from 'pdf-lib';
import { ProcessingResult } from '../types';

export interface ExtractTextOptions {
  includeMetadata: boolean;
  preserveFormatting: boolean;
  pageRange?: {
    start: number;
    end: number;
  };
}

export interface ExtractedTextResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export class ExtractTextService {
  private static instance: ExtractTextService;

  static getInstance(): ExtractTextService {
    if (!this.instance) {
      this.instance = new ExtractTextService();
    }
    return this.instance;
  }

  async extractText(
    file: File,
    options: ExtractTextOptions,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult<ExtractedTextResult>> {
    try {
      onProgress?.(10);

      // Validation
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.type !== 'application/pdf') {
        throw new Error('File must be a PDF');
      }

      onProgress?.(20);

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      onProgress?.(40);

      // Get pages
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // Determine page range
      const startPage = options.pageRange ? Math.max(0, options.pageRange.start - 1) : 0;
      const endPage = options.pageRange ? Math.min(totalPages - 1, options.pageRange.end - 1) : totalPages - 1;

      onProgress?.(50);

      // Extract text from pages
      let extractedText = '';
      
      for (let i = startPage; i <= endPage; i++) {
        const page = pages[i];
        
        try {
          // Note: pdf-lib doesn't have built-in text extraction
          // This is a basic implementation - for production use PDF.js or other libraries
          const pageText = await this.extractTextFromPage(page, i + 1);
          
          if (options.preserveFormatting) {
            extractedText += `--- Page ${i + 1} ---\n${pageText}\n\n`;
          } else {
            extractedText += pageText + '\n';
          }
        } catch (pageError) {
          console.warn(`Could not extract text from page ${i + 1}:`, pageError);
          if (options.preserveFormatting) {
            extractedText += `--- Page ${i + 1} ---\n[Text extraction failed for this page]\n\n`;
          }
        }

        // Update progress
        const pageProgress = 50 + ((i - startPage + 1) / (endPage - startPage + 1)) * 40;
        onProgress?.(pageProgress);
      }

      onProgress?.(90);

      // Extract metadata if requested
      let metadata: ExtractedTextResult['metadata'] = undefined;
      if (options.includeMetadata) {
        try {
          metadata = await this.extractMetadata(pdfDoc);
        } catch (metaError) {
          console.warn('Could not extract metadata:', metaError);
        }
      }

      onProgress?.(100);

      const result: ExtractedTextResult = {
        text: extractedText.trim(),
        pageCount: endPage - startPage + 1,
        metadata
      };

      return {
        success: true,
        data: result,
        metadata: {
          originalSize: file.size,
          finalSize: new Blob([result.text]).size,
          pageCount: totalPages,
          extractedPages: endPage - startPage + 1,
          textLength: result.text.length
        }
      };

    } catch (error) {
      console.error('[ExtractTextService] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract text'
      };
    }
  }

  private async extractTextFromPage(page: PDFPage, pageNumber: number): Promise<string> {
    // NOTE: This is a basic placeholder implementation
    // pdf-lib doesn't have built-in text extraction capabilities
    // For production, you would use PDF.js or other specialized libraries
    
    // For now, return a placeholder that indicates the limitation
    return `[Text extraction from PDF requires additional libraries like PDF.js. This is page ${pageNumber} of the document.]`;
  }

  private async extractMetadata(pdfDoc: PDFDocument): Promise<ExtractedTextResult['metadata']> {
    try {
      // Try to get document info
      const info = pdfDoc.getTitle() || pdfDoc.getAuthor() || pdfDoc.getSubject();
      
      return {
        title: pdfDoc.getTitle() || undefined,
        author: pdfDoc.getAuthor() || undefined,
        subject: pdfDoc.getSubject() || undefined,
        creator: pdfDoc.getCreator() || undefined,
        producer: pdfDoc.getProducer() || undefined,
        creationDate: pdfDoc.getCreationDate() || undefined,
        modificationDate: pdfDoc.getModificationDate() || undefined
      };
    } catch (error) {
      console.warn('Could not extract metadata:', error);
      return undefined;
    }
  }

  // Get default options
  getDefaultOptions(): ExtractTextOptions {
    return {
      includeMetadata: true,
      preserveFormatting: true,
      pageRange: undefined // Extract all pages
    };
  }

  // Validate options
  validateOptions(options: ExtractTextOptions, totalPages?: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.pageRange) {
      if (options.pageRange.start < 1) {
        errors.push('Start page must be 1 or greater');
      }

      if (options.pageRange.end < options.pageRange.start) {
        errors.push('End page must be greater than or equal to start page');
      }

      if (totalPages && options.pageRange.start > totalPages) {
        errors.push(`Start page cannot be greater than total pages (${totalPages})`);
      }

      if (totalPages && options.pageRange.end > totalPages) {
        errors.push(`End page cannot be greater than total pages (${totalPages})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Utility to download extracted text as .txt file
  downloadAsTextFile(result: ExtractedTextResult, originalFilename: string): void {
    const textContent = result.metadata && result.metadata.title 
      ? `Title: ${result.metadata.title}\n` +
        `Author: ${result.metadata.author || 'Unknown'}\n` +
        `Pages: ${result.pageCount}\n` +
        `Extracted: ${new Date().toISOString()}\n` +
        `\n${'='.repeat(50)}\n\n` +
        result.text
      : result.text;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFilename.replace(/\.pdf$/i, '_extracted.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}