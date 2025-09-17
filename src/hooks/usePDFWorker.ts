import { useState, useCallback, useRef, useEffect } from 'react';
import { WorkerMessage, WorkerResponse } from '../workers/pdfWorker';

export interface PDFWorkerHookResult {
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;
  mergePDFs: (files: File[]) => Promise<Blob>;
  compressPDF: (file: File, quality?: number) => Promise<Blob>;
  cancelOperation: () => void;
}

let workerInstance: Worker | null = null;

export const usePDFWorker = (): PDFWorkerHookResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentOperationId = useRef<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((value: Blob) => void) | null>(null);
  const rejectRef = useRef<((reason: Error) => void) | null>(null);

  // Initialize worker
  useEffect(() => {
    if (!workerInstance) {
      try {
        // Create worker from our TypeScript file
        const workerBlob = new Blob([
          `
          import('/src/workers/pdfWorker.ts').then(module => {
            // Worker code is executed here
          });
          `
        ], { type: 'application/javascript' });

        const workerUrl = URL.createObjectURL(workerBlob);
        workerInstance = new Worker(workerUrl, { type: 'module' });

        workerInstance.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const { id, type, data, error, progress: workerProgress } = event.data;

          if (id !== currentOperationId.current) return;

          switch (type) {
            case 'PROGRESS':
              setProgress(workerProgress || 0);
              setProgressMessage(data?.message || '');
              break;

            case 'SUCCESS':
              setIsProcessing(false);
              setProgress(100);
              setProgressMessage('Complete!');
              setError(null);

              if (resolveRef.current && data?.pdfBytes) {
                const blob = new Blob([data.pdfBytes], { type: 'application/pdf' });
                resolveRef.current(blob);
              }

              // Cleanup
              currentOperationId.current = null;
              resolveRef.current = null;
              rejectRef.current = null;
              break;

            case 'ERROR':
              setIsProcessing(false);
              setError(error || 'Unknown error occurred');
              setProgressMessage('');

              if (rejectRef.current) {
                rejectRef.current(new Error(error || 'PDF processing failed'));
              }

              // Cleanup
              currentOperationId.current = null;
              resolveRef.current = null;
              rejectRef.current = null;
              break;
          }
        };

        workerInstance.onerror = (error) => {
          console.error('Worker error:', error);
          setError('Worker initialization failed');
          setIsProcessing(false);
        };

      } catch (error) {
        console.error('Failed to create worker:', error);
        setError('Web Worker not supported');
      }
    }

    workerRef.current = workerInstance;

    return () => {
      // Don't terminate the shared worker instance
    };
  }, []);

  const sendWorkerMessage = useCallback((message: WorkerMessage): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not available'));
        return;
      }

      if (isProcessing) {
        reject(new Error('Another operation is in progress'));
        return;
      }

      setIsProcessing(true);
      setProgress(0);
      setProgressMessage('Starting...');
      setError(null);

      currentOperationId.current = message.id;
      resolveRef.current = resolve;
      rejectRef.current = reject;

      workerRef.current.postMessage(message);
    });
  }, [isProcessing]);

  const mergePDFs = useCallback(async (files: File[]): Promise<Blob> => {
    if (files.length < 2) {
      throw new Error('At least 2 files are required for merging');
    }

    // Convert files to ArrayBuffers
    const fileBuffers = await Promise.all(
      files.map(file => file.arrayBuffer())
    );

    const message: WorkerMessage = {
      id: `merge_${Date.now()}`,
      type: 'MERGE_PDF',
      payload: { files: fileBuffers }
    };

    return sendWorkerMessage(message);
  }, [sendWorkerMessage]);

  const compressPDF = useCallback(async (file: File, quality: number = 0.7): Promise<Blob> => {
    const fileBuffer = await file.arrayBuffer();

    const message: WorkerMessage = {
      id: `compress_${Date.now()}`,
      type: 'COMPRESS_PDF',
      payload: { file: fileBuffer, quality }
    };

    return sendWorkerMessage(message);
  }, [sendWorkerMessage]);

  const cancelOperation = useCallback(() => {
    if (currentOperationId.current && workerRef.current) {
      // Terminate current worker and create new one
      workerRef.current.terminate();
      workerInstance = null;

      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
      setError('Operation cancelled');

      // Cleanup
      currentOperationId.current = null;
      resolveRef.current = null;
      rejectRef.current = null;

      if (rejectRef.current) {
        rejectRef.current(new Error('Operation cancelled by user'));
      }
    }
  }, []);

  return {
    isProcessing,
    progress,
    progressMessage,
    error,
    mergePDFs,
    compressPDF,
    cancelOperation
  };
};
