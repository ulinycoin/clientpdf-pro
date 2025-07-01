import { PDFDocument } from 'pdf-lib';
import { 
  PageExtractionOptions, 
  PageExtractionResult, 
  PageExtractionError 
} from '../types/pageExtraction.types';
import { PDFError } from '../types';

export class ExtractPagesService {
  private static instance: ExtractPagesService;

  static getInstance(): ExtractPagesService {
    if (!this.instance) {
      this.instance = new ExtractPagesService();
    }
    return this.instance;
  }

  /**
   * Extract specific pages from a PDF document
   */
  async extractPages(
    file: File, 
    options: PageExtractionOptions,
    onProgress?: (progress: number) => void
  ): Promise<PageExtractionResult> {
    const startTime = Date.now();
    
    try {
      onProgress?.(10);

      // Validate input
      this.validateExtractionOptions(options);
      
      onProgress?.(20);

      // Load source PDF
      const sourceBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourceBuffer);
      const totalPages = sourcePdf.getPageCount();

      onProgress?.(30);

      // Validate page numbers
      this.validatePageNumbers(options.selectedPages, totalPages);

      onProgress?.(40);

      // Create new PDF document
      const newPdf = await PDFDocument.create();

      onProgress?.(50);

      // Copy selected pages
      const sortedPages = [...options.selectedPages].sort((a, b) => a - b);
      const totalPagesToExtract = sortedPages.length;

      for (let i = 0; i < totalPagesToExtract; i++) {
        const pageIndex = sortedPages[i] - 1; // Convert to 0-based index
        
        // Copy page from source to new document
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
        newPdf.addPage(copiedPage);

        // Update progress
        const extractProgress = 50 + (i / totalPagesToExtract) * 40;
        onProgress?.(extractProgress);
      }

      onProgress?.(90);

      // Generate output PDF
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      onProgress?.(100);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        blob,
        extractedPageCount: totalPagesToExtract,
        originalPageCount: totalPages,
        processingTime
      };

    } catch (error) {
      console.error('[ExtractPagesService] Error:', error);
      
      if (error instanceof PageExtractionError) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract pages'
      };
    }
  }

  /**
   * Get PDF page count for preview
   */
  async getPageCount(file: File): Promise<number> {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      return pdf.getPageCount();
    } catch (error) {
      throw new PDFError('Failed to get page count', 'PAGE_COUNT_ERROR');
    }
  }

  /**
   * Get page dimensions for all pages
   */
  async getPageInfo(file: File): Promise<Array<{ pageNumber: number; width: number; height: number }>> {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const pageCount = pdf.getPageCount();
      const pages = pdf.getPages();

      return pages.map((page, index) => ({
        pageNumber: index + 1,
        width: page.getWidth(),
        height: page.getHeight()
      }));
    } catch (error) {
      throw new PDFError('Failed to get page information', 'PAGE_INFO_ERROR');
    }
  }

  /**
   * Parse page range string like "1-5, 8, 10-12" into array of page numbers
   */
  parsePageRange(rangeString: string, totalPages: number): number[] {
    const pages: Set<number> = new Set();
    
    try {
      const ranges = rangeString.split(',').map(s => s.trim());
      
      for (const range of ranges) {
        if (range.includes('-')) {
          // Handle range like "1-5"
          const [start, end] = range.split('-').map(s => parseInt(s.trim()));
          
          if (isNaN(start) || isNaN(end)) {
            throw new PageExtractionError(
              `Invalid range format: ${range}`,
              'INVALID_RANGE'
            );
          }
          
          if (start > end) {
            throw new PageExtractionError(
              `Invalid range: start page (${start}) cannot be greater than end page (${end})`,
              'INVALID_RANGE'
            );
          }
          
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) {
              pages.add(i);
            }
          }
        } else {
          // Handle single page
          const pageNum = parseInt(range);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            pages.add(pageNum);
          }
        }
      }
      
      return Array.from(pages).sort((a, b) => a - b);
    } catch (error) {
      if (error instanceof PageExtractionError) {
        throw error;
      }
      throw new PageExtractionError(
        'Failed to parse page range',
        'INVALID_RANGE',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate suggested filename for extracted pages
   */
  generateFileName(originalFileName: string, selectedPages: number[]): string {
    const baseName = originalFileName.replace(/\.pdf$/i, '');
    
    if (selectedPages.length === 1) {
      return `${baseName}_page_${selectedPages[0]}.pdf`;
    }
    
    if (selectedPages.length <= 3) {
      return `${baseName}_pages_${selectedPages.join('_')}.pdf`;
    }
    
    const first = selectedPages[0];
    const last = selectedPages[selectedPages.length - 1];
    return `${baseName}_pages_${first}-${last}_and_${selectedPages.length - 2}_more.pdf`;
  }

  private validateExtractionOptions(options: PageExtractionOptions): void {
    if (!options.selectedPages || options.selectedPages.length === 0) {
      throw new PageExtractionError(
        'No pages selected for extraction',
        'NO_PAGES_SELECTED'
      );
    }

    const invalidPages = options.selectedPages.filter(page => !Number.isInteger(page) || page < 1);
    if (invalidPages.length > 0) {
      throw new PageExtractionError(
        `Invalid page numbers: ${invalidPages.join(', ')}`,
        'INVALID_PAGES'
      );
    }
  }

  private validatePageNumbers(pageNumbers: number[], totalPages: number): void {
    const invalidPages = pageNumbers.filter(page => page > totalPages);
    if (invalidPages.length > 0) {
      throw new PageExtractionError(
        `Page numbers ${invalidPages.join(', ')} exceed total pages (${totalPages})`,
        'INVALID_PAGES'
      );
    }
  }
}

// Export singleton instance
export const extractPagesService = ExtractPagesService.getInstance();
