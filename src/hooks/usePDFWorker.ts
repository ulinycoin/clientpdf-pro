/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { pdfWorkerManager, type PDFProcessingOptions, type ProcessingProgress } from '../services/pdfWorkerManager';

export interface UsePDFWorkerReturn {
  isReady: boolean;
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  error: string | null;
  result: Blob | null;
  processFiles: (files: File[], operation: PDFProcessingOptions['operation'], settings?: PDFProcessingOptions['settings']) => Promise<void>;
  resetState: () => void;
  cancelOperation: () => void;
}

/**
 * React hook для работы с PDF Worker
 * Предоставляет удобный интерфейс для обработки PDF файлов в background thread
 */
export const usePDFWorker = (): UsePDFWorkerReturn => {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
  
  // Предотвращаем множественную инициализацию
  const initializationRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(true);

  // Инициализируем worker при монтировании
  useEffect(() => {
    isMountedRef.current = true;

    const initWorker = async () => {
      // Если уже инициализируется, ждем завершения
      if (initializationRef.current) {
        try {
          await initializationRef.current;
          if (isMountedRef.current) {
            setIsReady(true);
          }
        } catch (error) {
          if (isMountedRef.current) {
            console.error('❌ Worker initialization failed:', error);
            setError('Failed to initialize PDF processing. Please refresh the page.');
          }
        }
        return;
      }

      // Создаем новый промис инициализации
      initializationRef.current = (async () => {
        try {
          console.log('🔄 Initializing PDF Worker...');
          await pdfWorkerManager.initialize();
          
          if (isMountedRef.current) {
            setIsReady(true);
            console.log('✅ PDF Worker ready');
          }
        } catch (error) {
          if (isMountedRef.current) {
            console.error('❌ Failed to initialize PDF worker:', error);
            setError('Failed to initialize PDF processing. Please refresh the page.');
          }
          throw error;
        }
      })();

      try {
        await initializationRef.current;
      } catch (error) {
        // Ошибка уже обработана выше
      }
    };

    initWorker();

    // Cleanup при размонтировании
    return () => {
      isMountedRef.current = false;
      if (currentOperationId) {
        pdfWorkerManager.cancelOperation(currentOperationId);
      }
      // НЕ завершаем worker при размонтировании - он может быть нужен другим компонентам
    };
  }, [currentOperationId]);

  /**
   * Сброс состояния (очистка ошибок, результатов, прогресса)
   */
  const resetState = useCallback(() => {
    if (!isMountedRef.current) return;
    setError(null);
    setResult(null);
    setProgress(null);
  }, []);

  /**
   * Отмена текущей операции
   */
  const cancelOperation = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (currentOperationId) {
      pdfWorkerManager.cancelOperation(currentOperationId);
      setCurrentOperationId(null);
      setIsProcessing(false);
      setProgress(null);
      console.log('🛑 Operation cancelled');
    }
  }, [currentOperationId]);

  /**
   * Обработка файлов через PDF Worker
   */
  const processFiles = useCallback(async (
    files: File[],
    operation: PDFProcessingOptions['operation'],
    settings?: PDFProcessingOptions['settings']
  ): Promise<void> => {
    if (!isMountedRef.current) return;

    // Валидация входных данных
    if (!files || files.length === 0) {
      setError('No files selected');
      return;
    }

    if (!isReady) {
      setError('PDF Worker is not ready. Please wait and try again.');
      return;
    }

    // Сброс предыдущего состояния
    resetState();
    setIsProcessing(true);

    try {
      console.log(`🔄 Starting ${operation} operation with ${files.length} files`);

      const options: PDFProcessingOptions = {
        operation,
        files,
        settings: settings || {}
      };

      // Обработчик прогресса
      const handleProgress = (progressData: ProcessingProgress) => {
        if (!isMountedRef.current) return;
        setProgress(progressData);
        console.log(`📊 Progress: ${progressData.percentage.toFixed(1)}% - ${progressData.message}`);
      };

      // Запускаем обработку
      const operationId = `${operation}_${Date.now()}`;
      setCurrentOperationId(operationId);

      const resultBlob = await pdfWorkerManager.processFiles(options, handleProgress);

      if (!isMountedRef.current) return;

      // Успешное завершение
      setResult(resultBlob);
      setProgress({
        percentage: 100,
        message: `${operation} completed successfully!`,
        status: 'complete'
      });

      console.log(`✅ ${operation} operation completed successfully`);

    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`❌ ${operation} operation failed:`, errorMessage);
      
      setError(errorMessage);
      setProgress({
        percentage: 0,
        message: `${operation} failed: ${errorMessage}`,
        status: 'error'
      });
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setCurrentOperationId(null);
      }
    }
  }, [isReady, resetState]);

  return {
    isReady,
    isProcessing,
    progress,
    error,
    result,
    processFiles,
    resetState,
    cancelOperation
  };
};

/**
 * Специализированный хук для отдельных операций
 */
export const usePDFMerge = () => {
  const worker = usePDFWorker();
  
  const mergeFiles = useCallback(async (files: File[]) => {
    await worker.processFiles(files, 'merge');
  }, [worker]);

  return {
    ...worker,
    mergeFiles
  };
};

export const usePDFSplit = () => {
  const worker = usePDFWorker();
  
  const splitFile = useCallback(async (file: File, pageRange?: { start: number; end: number }) => {
    await worker.processFiles([file], 'split', { pageRange });
  }, [worker]);

  return {
    ...worker,
    splitFile
  };
};

export const usePDFCompress = () => {
  const worker = usePDFWorker();
  
  const compressFile = useCallback(async (
    file: File, 
    options?: { quality?: 'low' | 'medium' | 'high'; removeMetadata?: boolean }
  ) => {
    await worker.processFiles([file], 'compress', options);
  }, [worker]);

  return {
    ...worker,
    compressFile
  };
};

export const usePDFProtect = () => {
  const worker = usePDFWorker();
  
  const protectFile = useCallback(async (
    file: File,
    password: string,
    permissions?: {
      allowPrinting?: boolean;
      allowModifying?: boolean;
      allowCopying?: boolean;
      allowAnnotating?: boolean;
      allowFillingForms?: boolean;
      allowDocumentAssembly?: boolean;
    }
  ) => {
    await worker.processFiles([file], 'protect', {
      mode: 'protect',
      password,
      permissions
    });
  }, [worker]);

  const unlockFile = useCallback(async (file: File, password: string) => {
    await worker.processFiles([file], 'protect', {
      mode: 'unlock',
      password
    });
  }, [worker]);

  return {
    ...worker,
    protectFile,
    unlockFile
  };
};

export const usePDFImageConvert = () => {
  const worker = usePDFWorker();
  
  const convertImages = useCallback(async (files: File[]) => {
    await worker.processFiles(files, 'imagesToPdf');
  }, [worker]);

  return {
    ...worker,
    convertImages
  };
};
