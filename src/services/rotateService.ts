import { PDFDocument, degrees } from 'pdf-lib';
import { PDFProcessingResult, ProcessingError } from '../types';

export class RotateService {
  static async rotatePDF(file: File, options: {
    rotation: 90 | 180 | 270;
    pages?: number[]; // 0-based page indices, if not provided - rotate all pages
  }): Promise<PDFProcessingResult> {
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      // Determine which pages to rotate
      const pagesToRotate = options.pages || Array.from({ length: totalPages }, (_, i) => i);

      // Validate page indices
      const invalidPages = pagesToRotate.filter(pageIndex =>
        pageIndex < 0 || pageIndex >= totalPages
      );

      if (invalidPages.length > 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_PAGES',
            message: `Invalid page numbers: ${invalidPages.map(p => p + 1).join(', ')}`
          },
          metadata: { totalPages }
        };
      }

      // Rotate specified pages
      pagesToRotate.forEach(pageIndex => {
        const page = pdfDoc.getPage(pageIndex);
        page.setRotation(degrees(options.rotation));
      });

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();

      return {
        success: true,
        data: new Blob([modifiedPdfBytes], { type: 'application/pdf' }),
        metadata: {
          originalSize: file.size,
          processedSize: modifiedPdfBytes.length,
          totalPages,
          rotatedPages: pagesToRotate.length,
          rotation: options.rotation
        }
      };

    } catch (error) {
      console.error('Rotate error:', error);
      return {
        success: false,
        error: {
          code: 'ROTATION_FAILED',
          message: error instanceof Error ? error.message : 'Rotation failed'
        },
        metadata: { originalSize: file.size }
      };
    }
  }

  static async getPageInfo(file: File): Promise<{
    totalPages: number;
    pageOrientations: ('portrait' | 'landscape')[];
  } | null> {
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      const pageOrientations: ('portrait' | 'landscape')[] = [];

      for (let i = 0; i < totalPages; i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();

        // Consider rotation when determining orientation
        const rotation = page.getRotation().angle;
        const isRotated90or270 = rotation === 90 || rotation === 270;

        const effectiveWidth = isRotated90or270 ? height : width;
        const effectiveHeight = isRotated90or270 ? width : height;

        pageOrientations.push(effectiveWidth > effectiveHeight ? 'landscape' : 'portrait');
      }

      return {
        totalPages,
        pageOrientations
      };

    } catch (error) {
      console.error('Error getting page info:', error);
      return null;
    }
  }
}

export const rotateService = new RotateService();
