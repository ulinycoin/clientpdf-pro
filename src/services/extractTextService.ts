import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { PDFProcessingResult } from '../types';
import { TextFormatter, TextFormattingOptions } from './textFormatter';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ExtractTextOptions {
  includeMetadata: boolean;
  preserveFormatting: boolean;
  pageRange?: {
    start: number;
    end: number;
  };
  // New formatting options
  enableSmartFormatting: boolean;
  formattingLevel: 'minimal' | 'standard' | 'advanced';
}

export interface ExtractedTextResult {
  text: string;
  formattedText?: string;
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
  formatting?: {
    applied: boolean;
    changes: string[];
    level: string;
  };
}

export class ExtractTextService {
  private static instance: ExtractTextService;
  private textFormatter: TextFormatter;

  static getInstance(): ExtractTextService {
    if (!this.instance) {
      this.instance = new ExtractTextService();
    }
    return this.instance;
  }

  constructor() {
    this.textFormatter = TextFormatter.getInstance();
  }

  async extractText(
    file: File,
    options: ExtractTextOptions,
    onProgress?: (progress: number) => void
  ): Promise<PDFProcessingResult<ExtractedTextResult>> {
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

      // Load PDF with PDF.js for text extraction
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument(arrayBuffer).promise;

      onProgress?.(30);

      // Get total pages
      const totalPages = pdfDocument.numPages;

      // Determine page range
      const startPage = options.pageRange ? Math.max(1, options.pageRange.start) : 1;
      const endPage = options.pageRange ? Math.min(totalPages, options.pageRange.end) : totalPages;

      onProgress?.(40);

      // Extract text from pages
      let extractedText = '';

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();

          // Extract text items and join them
          const pageText = textContent.items
            .map((item: any) => {
              // Handle different text item types
              if ('str' in item) {
                return item.str;
              }
              return '';
            })
            .join(' ')
            .trim();

          if (options.preserveFormatting) {
            extractedText += `--- Page ${pageNum} ---\n${pageText || '[No text found on this page]'}\n\n`;
          } else {
            if (pageText) {
              extractedText += pageText + '\n';
            }
          }
        } catch (pageError) {
          console.warn(`Could not extract text from page ${pageNum}:`, pageError);
          if (options.preserveFormatting) {
            extractedText += `--- Page ${pageNum} ---\n[Text extraction failed for this page]\n\n`;
          }
        }

        // Update progress
        const pageProgress = 40 + ((pageNum - startPage + 1) / (endPage - startPage + 1)) * 40;
        onProgress?.(pageProgress);
      }

      onProgress?.(85);

      // Apply smart formatting if enabled
      let formattedText: string | undefined;
      let formattingInfo: ExtractedTextResult['formatting'] | undefined;

      if (options.enableSmartFormatting && extractedText.trim()) {
        const formattingOptions = this.getFormattingOptions(options.formattingLevel);

        // Get preview of changes
        const preview = this.textFormatter.previewFormatting(extractedText, formattingOptions);

        // Apply formatting
        formattedText = this.textFormatter.formatText(extractedText, formattingOptions);

        formattingInfo = {
          applied: true,
          changes: preview.changes,
          level: options.formattingLevel
        };
      }

      onProgress?.(90);

      // Extract metadata if requested
      let metadata: ExtractedTextResult['metadata'] = undefined;
      if (options.includeMetadata) {
        try {
          metadata = await this.extractMetadataWithPDFJS(pdfDocument);
        } catch (metaError) {
          console.warn('Could not extract metadata:', metaError);
        }
      }

      // Clean up PDF.js document
      pdfDocument.destroy();

      onProgress?.(100);

      const finalText = extractedText.trim();
      const displayText = formattedText || finalText;

      const result: ExtractedTextResult = {
        text: displayText || '[No text could be extracted from this PDF]',
        formattedText: formattedText !== finalText ? formattedText : undefined,
        pageCount: endPage - startPage + 1,
        metadata,
        formatting: formattingInfo
      };

      return {
        success: true,
        data: result,
        metadata: {
          originalSize: file.size,
          finalSize: new Blob([result.text]).size,
          pageCount: totalPages,
          extractedPages: endPage - startPage + 1,
          textLength: result.text.length,
          hasText: finalText.length > 0,
          formattingApplied: options.enableSmartFormatting,
          formattingLevel: options.formattingLevel
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

  private getFormattingOptions(level: ExtractTextOptions['formattingLevel']): TextFormattingOptions {
    switch (level) {
      case 'minimal':
        return this.textFormatter.getMinimalOptions();

      case 'advanced':
        return {
          ...this.textFormatter.getDefaultOptions(),
          detectHeadings: true,
          preserveListStructure: true
        };

      case 'standard':
      default:
        return this.textFormatter.getDefaultOptions();
    }
  }

  private async extractMetadataWithPDFJS(pdfDocument: any): Promise<ExtractedTextResult['metadata']> {
    try {
      const metadata = await pdfDocument.getMetadata();
      const info = metadata.info;

      return {
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined
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
      pageRange: undefined, // Extract all pages
      enableSmartFormatting: true,
      formattingLevel: 'standard'
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
    let textContent = result.text;

    // Add enhanced metadata header if available
    if (result.metadata || result.formatting) {
      const metadataLines = [
        '📄 PDF TEXT EXTRACTION RESULT',
        '=' .repeat(50),
        result.metadata?.title ? `Title: ${result.metadata.title}` : null,
        result.metadata?.author ? `Author: ${result.metadata.author}` : null,
        result.metadata?.subject ? `Subject: ${result.metadata.subject}` : null,
        result.metadata?.creator ? `Creator: ${result.metadata.creator}` : null,
        result.metadata?.producer ? `Producer: ${result.metadata.producer}` : null,
        result.metadata?.creationDate ? `Created: ${result.metadata.creationDate.toLocaleString()}` : null,
        result.metadata?.modificationDate ? `Modified: ${result.metadata.modificationDate.toLocaleString()}` : null,
        `Pages extracted: ${result.pageCount}`,
        `Text length: ${result.text.length.toLocaleString()} characters`,
        result.formatting?.applied ? `Smart formatting: ${result.formatting.level} level` : null,
        result.formatting?.changes ? `Formatting changes: ${result.formatting.changes.join(', ')}` : null,
        `Extraction date: ${new Date().toLocaleString()}`,
        '',
        '=' .repeat(50),
        ''
      ].filter(Boolean);

      textContent = metadataLines.join('\n') + '\n' + result.text;
    }

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

  // Utility to check if PDF contains extractable text
  async checkIfPDFHasText(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument(arrayBuffer).promise;

      // Check first few pages for text
      const pagesToCheck = Math.min(3, pdfDocument.numPages);

      for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        const hasText = textContent.items.some((item: any) =>
          'str' in item && item.str.trim().length > 0
        );

        if (hasText) {
          pdfDocument.destroy();
          return true;
        }
      }

      pdfDocument.destroy();
      return false;
    } catch (error) {
      console.warn('Error checking PDF text content:', error);
      return false; // Assume no text if we can't check
    }
  }
}
