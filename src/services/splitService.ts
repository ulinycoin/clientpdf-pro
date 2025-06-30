import { PDFDocument } from 'pdf-lib';
import { PDFProcessingResult, CompressionSettings } from '../types';

export class SplitService {
  static async splitPDF(file: File, options: { 
    mode: 'pages' | 'range';
    pages?: number[];
    startPage?: number;
    endPage?: number;
  }): Promise<PDFProcessingResult[]> {
    try {
      const pdfBytes = await file.arrayBuffer();
      const originalDoc = await PDFDocument.load(pdfBytes);
      const totalPages = originalDoc.getPageCount();
      
      if (options.mode === 'pages' && options.pages) {
        // Split specific pages
        const results: PDFProcessingResult[] = [];
        
        for (const pageIndex of options.pages) {
          if (pageIndex < 0 || pageIndex >= totalPages) {
            results.push({
              success: false,
              error: `Page ${pageIndex + 1} does not exist`,
              metadata: { pageNumber: pageIndex + 1 }
            });
            continue;
          }
          
          const newDoc = await PDFDocument.create();
          const [copiedPage] = await newDoc.copyPages(originalDoc, [pageIndex]);
          newDoc.addPage(copiedPage);
          
          const pdfBytes = await newDoc.save();
          
          results.push({
            success: true,
            data: new Blob([pdfBytes], { type: 'application/pdf' }),
            metadata: {
              pageNumber: pageIndex + 1,
              originalSize: file.size,
              processedSize: pdfBytes.length,
              totalPages: 1
            }
          });
        }
        
        return results;
      }
      
      if (options.mode === 'range') {
        // Split page range
        const startPage = options.startPage || 0;
        const endPage = options.endPage || totalPages - 1;
        
        if (startPage < 0 || endPage >= totalPages || startPage > endPage) {
          return [{
            success: false,
            error: 'Invalid page range',
            metadata: { totalPages }
          }];
        }
        
        const newDoc = await PDFDocument.create();
        const pageIndices = Array.from(
          { length: endPage - startPage + 1 }, 
          (_, i) => startPage + i
        );
        
        const copiedPages = await newDoc.copyPages(originalDoc, pageIndices);
        copiedPages.forEach(page => newDoc.addPage(page));
        
        const pdfBytes = await newDoc.save();
        
        return [{
          success: true,
          data: new Blob([pdfBytes], { type: 'application/pdf' }),
          metadata: {
            startPage: startPage + 1,
            endPage: endPage + 1,
            totalPages: pageIndices.length,
            originalSize: file.size,
            processedSize: pdfBytes.length
          }
        }];
      }
      
      // Split into individual pages (default)
      const results: PDFProcessingResult[] = [];
      
      for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(originalDoc, [i]);
        newDoc.addPage(copiedPage);
        
        const pdfBytes = await newDoc.save();
        
        results.push({
          success: true,
          data: new Blob([pdfBytes], { type: 'application/pdf' }),
          metadata: {
            pageNumber: i + 1,
            totalPages: 1,
            originalSize: file.size,
            processedSize: pdfBytes.length
          }
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('Split error:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Split failed',
        metadata: { originalSize: file.size }
      }];
    }
  }
}

export const splitService = new SplitService();