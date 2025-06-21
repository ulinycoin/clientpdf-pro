/**
 * PDF Processing Web Worker
 * 
 * Выполняет тяжелые PDF операции в background thread.
 * Освобождает main thread для UI interactions.
 * Поддерживает progress reporting и cancellation.
 */

import type { PDFLibraries } from '../services/pdfLibraryLoader';

// Types for worker communication
export interface WorkerMessage {
  id: string;
  type: 'INIT' | 'PROCESS' | 'CANCEL' | 'PING';
  payload?: any;
}

export interface WorkerResponse {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS' | 'PONG';
  payload?: any;
  error?: string;
}

export interface PDFProcessingOptions {
  operation: 'merge' | 'split' | 'compress' | 'protect' | 'imagesToPdf';
  files: File[];
  settings?: {
    // Common settings
    quality?: 'low' | 'medium' | 'high';
    removeMetadata?: boolean;
    pageRange?: { start: number; end: number };
    compressionLevel?: number;
    
    // Password protection settings
    mode?: 'protect' | 'unlock';
    password?: string;
    permissions?: {
      allowPrinting?: boolean;
      allowModifying?: boolean;
      allowCopying?: boolean;
      allowAnnotating?: boolean;
      allowFillingForms?: boolean;
      allowDocumentAssembly?: boolean;
    };
  };
}

export interface ProcessingProgress {
  percentage: number;
  message: string;
  status: 'loading' | 'processing' | 'saving' | 'complete' | 'error';
  details?: any;
}

class PDFWorkerManager {
  private worker: Worker | null = null;
  private isInitialized = false;
  private pendingOperations = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: ProcessingProgress) => void;
  }>();

  /**
   * Инициализирует worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      // Создаем worker из отдельного файла
      this.worker = new Worker(
        new URL('../workers/pdfWorker.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Проверяем готовность worker
      await this.pingWorker();
      
      this.isInitialized = true;
      console.log('🔧 PDF Worker initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize PDF Worker:', error);
      throw new Error('PDF Worker initialization failed');
    }
  }

  /**
   * Обрабатывает PDF файлы
   */
  async processFiles(
    options: PDFProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    if (!this.isInitialized || !this.worker) {
      await this.initialize();
    }

    const operationId = this.generateOperationId();
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operationId, {
        resolve,
        reject,
        onProgress
      });

      // Отправляем задачу в worker
      this.worker!.postMessage({
        id: operationId,
        type: 'PROCESS',
        payload: options
      } as WorkerMessage);
    });
  }

  /**
   * Отменяет операцию
   */
  cancelOperation(operationId: string): void {
    if (this.worker && this.pendingOperations.has(operationId)) {
      this.worker.postMessage({
        id: operationId,
        type: 'CANCEL'
      } as WorkerMessage);
      
      this.pendingOperations.delete(operationId);
    }
  }

  /**
   * Завершает работу worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.pendingOperations.clear();
    }
  }

  /**
   * Проверяет доступность worker
   */
  isReady(): boolean {
    return this.isInitialized && !!this.worker;
  }

  private async pingWorker(): Promise<void> {
    if (!this.worker) {
      throw new Error('Worker not available');
    }

    return new Promise((resolve, reject) => {
      const pingId = this.generateOperationId();
      const timeout = setTimeout(() => {
        reject(new Error('Worker ping timeout'));
      }, 5000);

      const handlePong = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id === pingId && event.data.type === 'PONG') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handlePong);
          resolve();
        }
      };

      this.worker.addEventListener('message', handlePong);
      this.worker.postMessage({
        id: pingId,
        type: 'PING'
      } as WorkerMessage);
    });
  }

  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const { id, type, payload, error } = event.data;
    const operation = this.pendingOperations.get(id);

    if (!operation) {
      console.warn('Received message for unknown operation:', id);
      return;
    }

    switch (type) {
      case 'SUCCESS':
        operation.resolve(payload);
        this.pendingOperations.delete(id);
        break;

      case 'ERROR':
        operation.reject(new Error(error || 'Worker operation failed'));
        this.pendingOperations.delete(id);
        break;

      case 'PROGRESS':
        if (operation.onProgress) {
          operation.onProgress(payload);
        }
        break;

      default:
        console.warn('Unknown worker response type:', type);
    }
  }

  private handleWorkerError(error: ErrorEvent): void {
    console.error('PDF Worker error:', error);
    
    // Отклоняем все pending операции
    this.pendingOperations.forEach((operation) => {
      operation.reject(new Error('Worker crashed'));
    });
    this.pendingOperations.clear();

    // Переинициализируем worker
    this.terminate();
  }

  private generateOperationId(): string {
    return `pdf_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const pdfWorkerManager = new PDFWorkerManager();

// Утилиты для измерения производительности
export const WorkerMetrics = {
  measureWorkerOperation: async <T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    console.log(`🔄 Starting worker operation: ${operation}`);
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      console.log(`✅ Worker operation '${operation}' completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Worker operation '${operation}' failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
};
