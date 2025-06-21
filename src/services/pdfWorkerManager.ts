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
  private initializationPromise: Promise<void> | null = null;
  private pendingOperations = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: ProcessingProgress) => void;
  }>();

  /**
   * Инициализирует worker
   */
  async initialize(): Promise<void> {
    // Если уже инициализирован, возвращаем
    if (this.isInitialized && this.worker) {
      return;
    }

    // Если уже инициализируется, ждем завершения
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Создаем промис инициализации
    this.initializationPromise = this.doInitialization();
    
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async doInitialization(): Promise<void> {
    try {
      console.log('🔄 Creating PDF Worker...');
      
      // Создаем worker из отдельного файла
      this.worker = new Worker(
        new URL('../workers/pdfWorker.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Проверяем готовность worker с увеличенным таймаутом
      await this.pingWorker();
      
      this.isInitialized = true;
      console.log('✅ PDF Worker initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize PDF Worker:', error);
      
      // Очищаем неудачный worker
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
      
      throw new Error(`PDF Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Обрабатывает PDF файлы
   */
  async processFiles(
    options: PDFProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    // Убеждаемся что worker инициализирован
    if (!this.isInitialized || !this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('Worker not available after initialization');
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
      
      const operation = this.pendingOperations.get(operationId);
      if (operation) {
        operation.reject(new Error('Operation cancelled'));
        this.pendingOperations.delete(operationId);
      }
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
      this.initializationPromise = null;
      
      // Отклоняем все pending операции
      this.pendingOperations.forEach((operation) => {
        operation.reject(new Error('Worker terminated'));
      });
      this.pendingOperations.clear();
      
      console.log('🛑 PDF Worker terminated');
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
      
      // Увеличенный timeout для медленных устройств
      const timeout = setTimeout(() => {
        this.worker?.removeEventListener('message', handlePong);
        reject(new Error('Worker ping timeout - worker may be busy loading libraries'));
      }, 15000); // Увеличено до 15 секунд

      const handlePong = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id === pingId && event.data.type === 'PONG') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handlePong);
          resolve();
        }
      };

      this.worker.addEventListener('message', handlePong);
      
      // Отправляем ping
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
      // Это может быть PONG ответ на ping - не выводим warning
      if (type !== 'PONG') {
        console.warn('Received message for unknown operation:', id, type);
      }
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
      operation.reject(new Error(`Worker crashed: ${error.message || 'Unknown error'}`));
    });
    this.pendingOperations.clear();

    // Сбрасываем состояние worker
    this.isInitialized = false;
    this.initializationPromise = null;
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
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
