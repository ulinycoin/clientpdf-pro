/**
 * Utility functions for PDF-specific operations
 */

import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

// PDF validation utilities
export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

export const validatePDFBuffer = async (buffer: ArrayBuffer): Promise<boolean> => {
  try {
    await PDFDocument.load(buffer);
    return true;
  } catch {
    return false;
  }
};

// PDF information extraction
export const getPDFInfo = async (file: File) => {
  try {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer);
    
    return {
      pageCount: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
      keywords: pdfDoc.getKeywords(),
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// PDF page utilities
export const getPageDimensions = (page: PDFPage) => {
  const { width, height } = page.getSize();
  return { width, height };
};

export const rotatePage = (page: PDFPage, degrees: number) => {
  page.setRotation({ type: 'degrees', angle: degrees });
};

// PDF creation utilities
export const createBlankPDF = async (width: number = 612, height: number = 792): Promise<PDFDocument> => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage([width, height]);
  return pdfDoc;
};

export const addWatermark = async (
  pdfDoc: PDFDocument,
  text: string,
  options: {
    fontSize?: number;
    opacity?: number;
    color?: [number, number, number];
    rotation?: number;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  } = {}
) => {
  const {
    fontSize = 50,
    opacity = 0.3,
    color = [0.5, 0.5, 0.5],
    rotation = -45,
    position = 'center'
  } = options;

  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    let x: number, y: number;
    
    switch (position) {
      case 'top-left':
        x = 50;
        y = height - 50;
        break;
      case 'top-right':
        x = width - 50;
        y = height - 50;
        break;
      case 'bottom-left':
        x = 50;
        y = 50;
        break;
      case 'bottom-right':
        x = width - 50;
        y = 50;
        break;
      case 'center':
      default:
        x = width / 2;
        y = height / 2;
        break;
    }
    
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      color: rgb(color[0], color[1], color[2]),
      opacity,
      rotate: { type: 'degrees', angle: rotation },
    });
  }
  
  return pdfDoc;
};

// PDF optimization utilities
export const optimizePDF = async (
  pdfDoc: PDFDocument,
  options: {
    removeMetadata?: boolean;
    useObjectStreams?: boolean;
    addDefaultPage?: boolean;
  } = {}
): Promise<Uint8Array> => {
  const {
    removeMetadata = false,
    useObjectStreams = true,
    addDefaultPage = false
  } = options;
  
  if (removeMetadata) {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
    pdfDoc.setKeywords([]);
  }
  
  return pdfDoc.save({
    useObjectStreams,
    addDefaultPage,
  });
};

// PDF splitting utilities
export const extractPages = async (
  sourcePdf: PDFDocument,
  pageIndices: number[]
): Promise<PDFDocument> => {
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, pageIndices);
  
  pages.forEach(page => newPdf.addPage(page));
  
  return newPdf;
};

export const splitPDFByPageCount = async (
  pdfDoc: PDFDocument,
  pagesPerFile: number
): Promise<PDFDocument[]> => {
  const totalPages = pdfDoc.getPageCount();
  const chunks: PDFDocument[] = [];
  
  for (let i = 0; i < totalPages; i += pagesPerFile) {
    const pageIndices = Array.from(
      { length: Math.min(pagesPerFile, totalPages - i) },
      (_, index) => i + index
    );
    
    const chunk = await extractPages(pdfDoc, pageIndices);
    chunks.push(chunk);
  }
  
  return chunks;
};

// PDF merging utilities
export const mergePDFs = async (pdfDocs: PDFDocument[]): Promise<PDFDocument> => {
  const mergedPdf = await PDFDocument.create();
  
  for (const pdfDoc of pdfDocs) {
    const pageIndices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
    const pages = await mergedPdf.copyPages(pdfDoc, pageIndices);
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  return mergedPdf;
};

// PDF security utilities
export const isPasswordProtected = async (buffer: ArrayBuffer): Promise<boolean> => {
  try {
    await PDFDocument.load(buffer);
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    return errorMessage.includes('password') || errorMessage.includes('encrypted');
  }
};

// PDF format utilities
export const convertBlobToPDF = async (blob: Blob): Promise<PDFDocument> => {
  const buffer = await blob.arrayBuffer();
  return PDFDocument.load(buffer);
};

export const convertPDFToBlob = async (pdfDoc: PDFDocument): Promise<Blob> => {
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Error handling utilities
export const getPDFErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('password') || message.includes('encrypted')) {
      return 'This PDF is password protected. Please use an unprotected PDF file.';
    }
    
    if (message.includes('corrupted') || message.includes('invalid')) {
      return 'This PDF file appears to be corrupted or invalid.';
    }
    
    if (message.includes('unsupported')) {
      return 'This PDF format is not supported. Please try a different file.';
    }
    
    return `PDF processing error: ${error.message}`;
  }
  
  return 'An unknown error occurred while processing the PDF file.';
};

// Page range utilities
export const parsePageRange = (range: string, totalPages: number): number[] => {
  const indices: number[] = [];
  const parts = range.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
      const startPage = Math.max(1, Math.min(start, totalPages));
      const endPage = Math.max(startPage, Math.min(end || totalPages, totalPages));
      
      for (let i = startPage; i <= endPage; i++) {
        if (!indices.includes(i - 1)) {
          indices.push(i - 1); // Convert to 0-based index
        }
      }
    } else {
      const pageNum = parseInt(trimmed);
      if (pageNum >= 1 && pageNum <= totalPages && !indices.includes(pageNum - 1)) {
        indices.push(pageNum - 1); // Convert to 0-based index
      }
    }
  }
  
  return indices.sort((a, b) => a - b);
};

// Quality assessment utilities
export const estimatePDFComplexity = async (pdfDoc: PDFDocument): Promise<'low' | 'medium' | 'high'> => {
  const pageCount = pdfDoc.getPageCount();
  
  if (pageCount <= 5) return 'low';
  if (pageCount <= 50) return 'medium';
  return 'high';
};

// Memory usage utilities
export const calculateMemoryUsage = (files: File[]): number => {
  return files.reduce((total, file) => total + file.size, 0);
};

export const isMemoryUsageSafe = (files: File[], maxMemoryMB: number = 500): boolean => {
  const totalSize = calculateMemoryUsage(files);
  const maxMemoryBytes = maxMemoryMB * 1024 * 1024;
  return totalSize <= maxMemoryBytes;
};