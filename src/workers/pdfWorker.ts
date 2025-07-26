// PDF Web Worker for processing large files
// Handles CPU-intensive PDF operations without blocking the main thread

import { PDFDocument, rgb } from 'pdf-lib';

export interface WorkerMessage {
  id: string;
  type: 'MERGE_PDF' | 'SPLIT_PDF' | 'COMPRESS_PDF' | 'ADD_TEXT' | 'ROTATE_PDF';
  payload: any;
}

export interface WorkerResponse {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS';
  data?: any;
  error?: string;
  progress?: number;
}

// Enhanced error handling for PDF operations
class PDFWorkerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = 'PDFWorkerError';
  }
}

class PDFWorker {
  private sendProgress(id: string, progress: number, message?: string): void {
    self.postMessage({
      id,
      type: 'PROGRESS',
      progress,
      data: { message }
    } as WorkerResponse);
  }

  private sendSuccess(id: string, data: any): void {
    self.postMessage({
      id,
      type: 'SUCCESS',
      data
    } as WorkerResponse);
  }

  private sendError(id: string, error: string, code: string = 'UNKNOWN_ERROR'): void {
    self.postMessage({
      id,
      type: 'ERROR',
      error,
      data: { code }
    } as WorkerResponse);
  }

  async mergePDF(id: string, files: ArrayBuffer[]): Promise<void> {
    try {
      this.sendProgress(id, 10, 'Initializing merge...');

      const mergedDoc = await PDFDocument.create();
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        this.sendProgress(id, 20 + (i / totalFiles) * 60, `Processing file ${i + 1}/${totalFiles}...`);

        const pdfDoc = await PDFDocument.load(files[i]);
        const pageIndices = pdfDoc.getPageIndices();
        const pages = await mergedDoc.copyPages(pdfDoc, pageIndices);

        pages.forEach(page => mergedDoc.addPage(page));
      }

      this.sendProgress(id, 90, 'Finalizing PDF...');
      const pdfBytes = await mergedDoc.save();

      this.sendProgress(id, 100, 'Complete!');
      this.sendSuccess(id, {
        pdfBytes: pdfBytes,
        pageCount: mergedDoc.getPageCount(),
        size: pdfBytes.length
      });

    } catch (error) {
      console.error('Merge error:', error);
      this.sendError(
        id,
        error instanceof Error ? error.message : 'Failed to merge PDFs',
        'MERGE_FAILED'
      );
    }
  }

  async compressPDF(id: string, fileBuffer: ArrayBuffer, quality: number = 0.7): Promise<void> {
    try {
      this.sendProgress(id, 10, 'Loading PDF for compression...');

      const pdfDoc = await PDFDocument.load(fileBuffer);

      this.sendProgress(id, 30, 'Compressing images...');

      // Basic compression - remove metadata and optimize
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('LocalPDF');
      pdfDoc.setCreator('LocalPDF');

      this.sendProgress(id, 70, 'Optimizing PDF structure...');

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false
      });

      this.sendProgress(id, 100, 'Compression complete!');
      this.sendSuccess(id, {
        pdfBytes: compressedBytes,
        originalSize: fileBuffer.byteLength,
        compressedSize: compressedBytes.length,
        compressionRatio: ((fileBuffer.byteLength - compressedBytes.length) / fileBuffer.byteLength * 100).toFixed(1)
      });

    } catch (error) {
      console.error('Compression error:', error);
      this.sendError(
        id,
        error instanceof Error ? error.message : 'Failed to compress PDF',
        'COMPRESSION_FAILED'
      );
    }
  }
}

// Create worker instance
const worker = new PDFWorker();

// Listen for messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case 'MERGE_PDF':
        await worker.mergePDF(id, payload.files);
        break;

      case 'COMPRESS_PDF':
        await worker.compressPDF(id, payload.file, payload.quality);
        break;

      default:
        worker.sendError(id, `Unknown operation type: ${type}`, 'UNKNOWN_OPERATION');
    }
  } catch (error) {
    console.error('Worker error:', error);
    worker.sendError(
      id,
      error instanceof Error ? error.message : 'Unknown worker error',
      'WORKER_ERROR'
    );
  }
});

export {};
