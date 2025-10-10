import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  PageOperation,
  AnnotationElement,
  WatermarkConfig,
  PageNumberConfig,
  BackgroundConfig,
  MetadataConfig,
} from '../types/editPDF.types';
import { WatermarkService } from './watermarkService';
import { WatermarkFontManager } from './watermarkFontManager';

interface ProcessDocumentConfig {
  pageOperations: PageOperation[];
  annotations: AnnotationElement[];
  watermark: WatermarkConfig;
  pageNumbers: PageNumberConfig;
  background: BackgroundConfig;
  metadata: MetadataConfig;
  selectedPages?: number[]; // Array of selected page indices
  pages?: any[]; // PageState[] - current page order including blank pages
}

export class EditService {
  name = 'EditService';
  version = '1.0.0';
  private watermarkService: WatermarkService;
  private fontManager: WatermarkFontManager;

  constructor() {
    this.watermarkService = WatermarkService.getInstance();
    this.fontManager = WatermarkFontManager.getInstance();
  }

  async processDocument(
    originalFile: File,
    config: ProcessDocumentConfig
  ): Promise<Blob> {
    try {
      // 1. Load original PDF
      const arrayBuffer = await originalFile.arrayBuffer();
      let pdfDoc = await PDFDocument.load(arrayBuffer);

      // 2. Apply page operations
      pdfDoc = await this.applyPageOperations(pdfDoc, config.pageOperations, config.pages);

      // 3. Apply background (if enabled)
      if (config.background.enabled) {
        // TODO: Implement background application
      }

      // 4. Render annotations
      if (config.annotations.length > 0) {
        // TODO: Implement annotation rendering
      }

      // 5. Add watermark (if enabled)
      if (config.watermark.enabled && config.watermark.text.trim()) {
        pdfDoc = await this.applyWatermark(pdfDoc, config.watermark, config.selectedPages);
      }

      // 6. Add page numbers (if enabled)
      if (config.pageNumbers.enabled) {
        pdfDoc = await this.addPageNumbers(pdfDoc, config.pageNumbers, config.selectedPages);
      }

      // 7. Set metadata
      this.setMetadata(pdfDoc, config.metadata);

      // 8. Save and return
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('EditService: Failed to process document:', error);
      throw new Error('Failed to process PDF document');
    }
  }

  private async applyPageOperations(
    pdfDoc: PDFDocument,
    operations: PageOperation[],
    pages?: any[] // PageState[] from state
  ): Promise<PDFDocument> {
    // Create new document for the result
    const resultDoc = await PDFDocument.create();

    // If pages state is provided, use it directly (handles blank pages + external PDFs)
    if (pages) {
      for (const page of pages) {
        if (page.isDeleted) continue;

        if (page.originalIndex === -1) {
          // This is a blank page - create new blank page
          const blankPage = resultDoc.addPage([595, 842]); // A4 size in points

          // Apply rotation if any
          if (page.rotation && page.rotation !== 0) {
            const degrees = page.rotation as 0 | 90 | 180 | 270;
            blankPage.setRotation({ type: 'degrees', angle: degrees });
          }
        } else if (page.externalPDF) {
          // This is a page from an external PDF (merged)
          const externalArrayBuffer = await page.externalPDF.file.arrayBuffer();
          const externalPdfDoc = await PDFDocument.load(externalArrayBuffer);
          const [copiedPage] = await resultDoc.copyPages(externalPdfDoc, [page.externalPDF.pageIndex]);

          // Apply rotation if any
          if (page.rotation && page.rotation !== 0) {
            const degrees = page.rotation as 0 | 90 | 180 | 270;
            copiedPage.setRotation({ type: 'degrees', angle: degrees });
          }

          resultDoc.addPage(copiedPage);
        } else {
          // Regular page from original document
          const [copiedPage] = await resultDoc.copyPages(pdfDoc, [page.originalIndex]);

          // Apply rotation if any
          if (page.rotation && page.rotation !== 0) {
            const degrees = page.rotation as 0 | 90 | 180 | 270;
            copiedPage.setRotation({ type: 'degrees', angle: degrees });
          }

          resultDoc.addPage(copiedPage);
        }
      }

      return resultDoc;
    }

    // Fallback: old logic with operations (deprecated)
    const totalPages = pdfDoc.getPageCount();
    let pageIndices = Array.from({ length: totalPages }, (_, i) => i);
    const rotations = new Map<number, number>();
    const deleted = new Set<number>();

    // Apply each operation
    for (const op of operations) {
      switch (op.type) {
        case 'rotate':
          if (op.rotation) {
            const currentRotation = rotations.get(op.pageIndex) || 0;
            rotations.set(op.pageIndex, (currentRotation + op.rotation) % 360);
          }
          break;

        case 'delete':
          deleted.add(op.pageIndex);
          break;

        case 'reorder':
          if (op.targetIndex !== undefined) {
            const [movedPage] = pageIndices.splice(op.pageIndex, 1);
            pageIndices.splice(op.targetIndex, 0, movedPage);
          }
          break;

        case 'duplicate':
          pageIndices.splice(op.pageIndex + 1, 0, op.pageIndex);
          break;
      }
    }

    // Copy pages in final order, skipping deleted ones
    for (const pageIndex of pageIndices) {
      if (deleted.has(pageIndex)) continue;

      const [copiedPage] = await resultDoc.copyPages(pdfDoc, [pageIndex]);

      const rotation = rotations.get(pageIndex);
      if (rotation && rotation !== 0) {
        const degrees = rotation as 0 | 90 | 180 | 270;
        copiedPage.setRotation({ type: 'degrees', angle: degrees });
      }

      resultDoc.addPage(copiedPage);
    }

    return resultDoc;
  }

  private async addPageNumbers(
    pdfDoc: PDFDocument,
    config: PageNumberConfig,
    selectedPages?: number[]
  ): Promise<PDFDocument> {
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNumber = i + config.startNumber;

      // Page numbers always use applyToPages config (all/odd/even)
      // Ignore selectedPages - numbering selected pages only makes no sense
      if (!this.shouldApplyToPage(i, totalPages, config.applyToPages)) {
        continue;
      }

      // Format the page number text
      const text = config.format
        .replace('{n}', String(pageNumber))
        .replace('{total}', String(totalPages));

      // Calculate position
      const { width, height } = page.getSize();
      const position = this.calculatePageNumberPosition(
        config.position,
        width,
        height,
        config.fontSize
      );

      // Convert hex color to RGB
      const hexColor = config.color.startsWith('#') ? config.color : `#${config.color}`;
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      // Draw page number
      page.drawText(text, {
        x: position.x,
        y: position.y,
        size: config.fontSize,
        color: rgb(r / 255, g / 255, b / 255),
      });
    }

    return pdfDoc;
  }

  private shouldApplyToPage(
    pageIndex: number,
    totalPages: number,
    applyToPages: 'all' | 'odd' | 'even' | number[]
  ): boolean {
    if (applyToPages === 'all') return true;
    if (applyToPages === 'odd') return pageIndex % 2 === 0;
    if (applyToPages === 'even') return pageIndex % 2 === 1;
    if (Array.isArray(applyToPages)) return applyToPages.includes(pageIndex);
    return false;
  }

  private calculatePageNumberPosition(
    position: PageNumberConfig['position'],
    pageWidth: number,
    pageHeight: number,
    fontSize: number
  ): { x: number; y: number } {
    const margin = 30;
    const positions: Record<string, { x: number; y: number }> = {
      'top-left': { x: margin, y: pageHeight - margin },
      'top-center': { x: pageWidth / 2, y: pageHeight - margin },
      'top-right': { x: pageWidth - margin, y: pageHeight - margin },
      'middle-left': { x: margin, y: pageHeight / 2 },
      'middle-center': { x: pageWidth / 2, y: pageHeight / 2 },
      'middle-right': { x: pageWidth - margin, y: pageHeight / 2 },
      'bottom-left': { x: margin, y: margin },
      'bottom-center': { x: pageWidth / 2, y: margin },
      'bottom-right': { x: pageWidth - margin, y: margin },
    };

    return positions[position] || positions['bottom-center'];
  }

  private async applyWatermark(
    pdfDoc: PDFDocument,
    config: WatermarkConfig,
    selectedPages?: number[]
  ): Promise<PDFDocument> {
    const pages = pdfDoc.getPages();

    // Register fontkit for custom font support
    pdfDoc.registerFontkit(fontkit);

    // Convert hex color to RGB
    const hexColor = config.color.startsWith('#') ? config.color : `#${config.color}`;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Load font with proper Unicode support using fontManager
    const bestFontName = this.fontManager.getBestFont(config.text);
    const fontResult = await this.fontManager.loadFont(pdfDoc, bestFontName, config.text);
    const font = fontResult.font;
    const supportsCyrillic = fontResult.supportsCyrillic;

    // Sanitize text if font doesn't support it
    const textToRender = supportsCyrillic ? config.text : this.sanitizeText(config.text);

    // Apply watermark to each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      // If selectedPages is provided, only apply to selected pages
      if (selectedPages && selectedPages.length > 0) {
        if (!selectedPages.includes(i)) {
          continue;
        }
      } else {
        // Otherwise use applyToPages config
        if (!this.shouldApplyToPage(i, pages.length, config.applyToPages)) {
          continue;
        }
      }

      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(textToRender, config.fontSize);

      let x: number, y: number;

      // Calculate position based on config
      if (config.position === 'diagonal') {
        // Center for diagonal watermark
        x = width / 2 - (textWidth * Math.cos((config.angle * Math.PI) / 180)) / 2;
        y = height / 2;
      } else {
        // Use position setting from config
        const margin = 50;
        switch (config.position) {
          case 'center':
            x = (width - textWidth) / 2;
            y = height / 2;
            break;
          case 'top-left':
            x = margin;
            y = height - margin - config.fontSize;
            break;
          case 'top-right':
            x = width - textWidth - margin;
            y = height - margin - config.fontSize;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'bottom-right':
            x = width - textWidth - margin;
            y = margin;
            break;
          default:
            x = (width - textWidth) / 2;
            y = height / 2;
        }
      }

      page.drawText(textToRender, {
        x,
        y,
        size: config.fontSize,
        font,
        color: rgb(r / 255, g / 255, b / 255),
        opacity: config.opacity / 100,
        rotate: { type: 'degrees' as const, angle: config.angle },
      });
    }

    return pdfDoc;
  }

  private sanitizeText(text: string): string {
    // Map of common non-ASCII characters to ASCII equivalents
    const charMap: { [key: string]: string } = {
      // Cyrillic to Latin transliteration
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '"', 'ы': 'y', 'ь': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya',

      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
      'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH',
      'Ъ': '"', 'Ы': 'Y', 'Ь': "'", 'Э': 'E', 'Ю': 'YU', 'Я': 'YA',
    };

    // Replace characters using the map
    let sanitized = text;
    for (const [nonAscii, ascii] of Object.entries(charMap)) {
      sanitized = sanitized.replace(new RegExp(nonAscii, 'g'), ascii);
    }

    // Remove any remaining non-ASCII characters
    return sanitized.replace(/[^\x00-\x7F]/g, '?');
  }

  private setMetadata(pdfDoc: PDFDocument, metadata: MetadataConfig): void {
    if (metadata.title) pdfDoc.setTitle(metadata.title);
    if (metadata.author) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords) pdfDoc.setKeywords([metadata.keywords]);
    if (metadata.creator) pdfDoc.setCreator(metadata.creator);
    if (metadata.producer) pdfDoc.setProducer(metadata.producer);
  }
}

export const editService = new EditService();
