/**
 * Optimized PDF Processor Component
 * 
 * Использует lazy loading, Web Workers и error recovery
 * для максимальной производительности и UX.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FileText, Upload, Download, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';

// Error recovery
import { useErrorRecovery, ErrorSeverity } from '@services/errorRecovery';
import { MemoryManager } from '@services/errorRecovery';

// Types
export interface PDFProcessorProps {
  files: File[];
  operation: 'merge' | 'split' | 'compress' | 'imagesToPdf';
  settings?: {
    quality?: 'low' | 'medium' | 'high';
    removeMetadata?: boolean;
    pageRange?: { start: number; end: number };
  };
  onComplete?: (result: Blob, metadata?: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface ProcessingState {
  status: 'idle' | 'loading' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  result?: Blob;
  metadata?: any;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const OptimizedPDFProcessor: React.FC<PDFProcessorProps> = ({
  files,
  operation,
  settings = {},
  onComplete,
  onError,
  className
}) => {
  // State management
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const [isLibrariesLoaded, setIsLibrariesLoaded] = useState(false);
  const [memoryInfo, setMemoryInfo] = useState(MemoryManager.checkMemoryAvailability());
  
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const workerRef = useRef<any>(null);
  const librariesRef = useRef<any>(null);

  // Error recovery hook
  const { error, isRecovering, executeWithRecovery, clearError } = useErrorRecovery();

  // Memoized file validation
  const fileValidation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      errors.push('No files selected');
      return { isValid: false, errors, warnings };
    }

    // Size validation
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (totalSize > maxSize) {
      errors.push(`Total file size (${formatFileSize(totalSize)}) exceeds limit (${formatFileSize(maxSize)})`);
    }

    // Memory check
    if (!memoryInfo.available) {
      warnings.push('Low memory detected. Consider closing other tabs or using smaller files.');
    }

    // Operation-specific validation
    switch (operation) {
      case 'merge':
        if (files.length < 2) {
          errors.push('Merge operation requires at least 2 files');
        }
        break;
      case 'split':
      case 'compress':
        if (files.length !== 1) {
          errors.push(`${operation} operation requires exactly 1 file`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [files, operation, memoryInfo]);

  // Load PDF libraries on mount
  useEffect(() => {
    let isMounted = true;

    const loadLibraries = async () => {
      try {
        setState(prev => ({
          ...prev,
          status: 'loading',
          message: 'Loading PDF processing libraries...',
          progress: 10
        }));

        // Dynamic import с error handling
        const [pdfLibraryModule, workerModule] = await Promise.all([
          import('@services/pdfLibraryLoader').catch(() => null),
          import('@services/pdfWorkerManager').catch(() => null)
        ]);

        if (!isMounted) return;

        if (pdfLibraryModule && workerModule) {
          librariesRef.current = pdfLibraryModule.pdfLibraryLoader;
          workerRef.current = workerModule.pdfWorkerManager;

          setState(prev => ({
            ...prev,
            progress: 50,
            message: 'Initializing PDF workers...'
          }));

          // Preload libraries
          await librariesRef.current?.preloadLibraries();

          if (isMounted) {
            setIsLibrariesLoaded(true);
            setState(prev => ({
              ...prev,
              status: 'idle',
              progress: 0,
              message: 'Ready to process files'
            }));
          }
        } else {
          throw new Error('Failed to load PDF libraries');
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            status: 'error',
            message: 'Failed to load PDF libraries'
          }));
          onError?.(error as Error);
        }
      }
    };

    loadLibraries();

    return () => {
      isMounted = false;
      // Cleanup abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [onError]);

  // Monitor memory usage
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryInfo(MemoryManager.checkMemoryAvailability());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Process files function
  const processFiles = useCallback(async () => {
    if (!isLibrariesLoaded || !fileValidation.isValid) {
      return;
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({
        ...prev,
        status: 'processing',
        progress: 0,
        message: 'Starting processing...'
      }));

      const result = await executeWithRecovery(
        async () => {
          // Check if we should use worker or main thread
          const useWorker = shouldUseWorker();
          
          if (useWorker && workerRef.current) {
            return await processWithWorker();
          } else {
            return await processInMainThread();
          }
        },
        { operation, files: files.map(f => f.name) }, // context
        async () => {
          // Fallback: try main thread if worker fails
          console.log('🔄 Falling back to main thread processing');
          return await processInMainThread();
        }
      );

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        message: 'Processing completed successfully!',
        result
      }));

      onComplete?.(result);

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        progress: 0,
        message: 'Processing failed'
      }));
      onError?.(error as Error);
    }
  }, [isLibrariesLoaded, fileValidation, executeWithRecovery, files, operation, settings, onComplete, onError]);

  // Determine if we should use Web Worker
  const shouldUseWorker = useCallback((): boolean => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const largeFileThreshold = 10 * 1024 * 1024; // 10MB
    
    return (
      totalSize > largeFileThreshold ||
      files.length > 5 ||
      operation === 'merge' ||
      !memoryInfo.available
    );
  }, [files, operation, memoryInfo]);

  // Process with Web Worker
  const processWithWorker = useCallback(async (): Promise<Blob> => {
    if (!workerRef.current) {
      throw new Error('Worker not available');
    }

    return new Promise((resolve, reject) => {
      const progressHandler = (progressData: any) => {
        setState(prev => ({
          ...prev,
          progress: progressData.percentage,
          message: progressData.message
        }));
      };

      workerRef.current.processFiles(
        {
          operation,
          files,
          settings
        },
        progressHandler
      ).then(resolve).catch(reject);
    });
  }, [operation, files, settings]);

  // Process in main thread (fallback)
  const processInMainThread = useCallback(async (): Promise<Blob> => {
    if (!librariesRef.current) {
      throw new Error('PDF libraries not loaded');
    }

    setState(prev => ({
      ...prev,
      message: 'Loading PDF libraries...',
      progress: 10
    }));

    const libraries = await librariesRef.current.loadAll();

    setState(prev => ({
      ...prev,
      message: 'Processing files...',
      progress: 30
    }));

    // Simple processing logic (основная логика остается та же)
    switch (operation) {
      case 'merge':
        return await mergePDFs(libraries, files);
      case 'compress':
        return await compressPDF(libraries, files[0], settings);
      case 'split':
        return await splitPDF(libraries, files[0], settings);
      case 'imagesToPdf':
        return await imagesToPDF(libraries, files);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }, [operation, files, settings]);

  // Cancel processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      message: 'Processing cancelled'
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      message: ''
    });
    clearError();
  }, [clearError]);

  // Render methods
  const renderValidationErrors = () => {
    if (fileValidation.isValid) return null;

    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
        </div>
        <ul className="text-sm text-red-700 space-y-1">
          {fileValidation.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderValidationWarnings = () => {
    if (fileValidation.warnings.length === 0) return null;

    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          {fileValidation.warnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderProgress = () => {
    if (state.status === 'idle') return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{state.message}</span>
          {state.status === 'processing' && (
            <button
              onClick={cancelProcessing}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              {
                'bg-blue-600': state.status === 'loading' || state.status === 'processing',
                'bg-green-600': state.status === 'complete',
                'bg-red-600': state.status === 'error'
              }
            )}
            style={{ width: `${state.progress}%` }}
          />
        </div>
        
        {state.status === 'processing' && (
          <div className="mt-2 text-xs text-gray-500">
            {state.progress}% completed • Using {shouldUseWorker() ? 'Web Worker' : 'Main Thread'}
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (state.status !== 'complete' || !state.result) return null;

    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">Processing Complete</span>
          </div>
          <button
            onClick={() => {
              const url = URL.createObjectURL(state.result!);
              const a = document.createElement('a');
              a.href = url;
              a.download = `processed-${operation}-${Date.now()}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>
        </div>
        {state.metadata && (
          <div className="mt-2 text-xs text-green-700">
            Size: {formatFileSize(state.result.size)}
          </div>
        )}
      </div>
    );
  };

  const renderMemoryInfo = () => {
    if (memoryInfo.available) return null;

    return (
      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center text-sm text-orange-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          Low memory detected ({Math.round(memoryInfo.usage / 1024 / 1024)}MB used)
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className={clsx('w-full max-w-2xl mx-auto', className)}>
      {/* Memory Info */}
      {renderMemoryInfo()}
      
      {/* Validation Errors */}
      {renderValidationErrors()}
      
      {/* Validation Warnings */}
      {renderValidationWarnings()}
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-red-700">{error.userMessage}</p>
          {error.suggestedActions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-600 font-medium">Suggested actions:</p>
              <ul className="text-xs text-red-600 mt-1 space-y-1">
                {error.suggestedActions.map((action, index) => (
                  <li key={index}>• {action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Progress */}
      {renderProgress()}
      
      {/* Result */}
      {renderResult()}
      
      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={processFiles}
          disabled={
            !isLibrariesLoaded ||
            !fileValidation.isValid ||
            state.status === 'processing' ||
            state.status === 'loading' ||
            isRecovering
          }
          className={clsx(
            'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors',
            {
              'bg-blue-600 hover:bg-blue-700': 
                isLibrariesLoaded && fileValidation.isValid && state.status === 'idle',
              'bg-gray-400 cursor-not-allowed': 
                !isLibrariesLoaded || !fileValidation.isValid || state.status !== 'idle'
            }
          )}
        >
          {(state.status === 'processing' || state.status === 'loading' || isRecovering) && (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          )}
          {state.status === 'loading' ? 'Loading...' :
           state.status === 'processing' ? 'Processing...' :
           isRecovering ? 'Recovering...' :
           `Process ${operation.charAt(0).toUpperCase() + operation.slice(1)}`}
        </button>
      </div>
      
      {/* Reset Button */}
      {(state.status === 'complete' || state.status === 'error') && (
        <div className="flex justify-center mt-3">
          <button
            onClick={reset}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Process Another File
          </button>
        </div>
      )}
    </div>
  );
};

// Placeholder processing functions (simplified versions)
async function mergePDFs(libraries: any, files: File[]): Promise<Blob> {
  const { PDFDocument } = libraries.pdfLib;
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function compressPDF(libraries: any, file: File, settings: any): Promise<Blob> {
  const { PDFDocument } = libraries.pdfLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const compressedBytes = await pdf.save({
    useObjectStreams: settings.quality !== 'high'
  });
  
  return new Blob([compressedBytes], { type: 'application/pdf' });
}

async function splitPDF(libraries: any, file: File, settings: any): Promise<Blob> {
  const { PDFDocument } = libraries.pdfLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  const newPdf = await PDFDocument.create();
  const [page] = await newPdf.copyPages(pdf, [0]);
  newPdf.addPage(page);
  
  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function imagesToPDF(libraries: any, files: File[]): Promise<Blob> {
  const { jsPDF } = libraries;
  const pdf = new jsPDF();
  
  // Simplified implementation
  const pdfBytes = pdf.output('blob');
  return pdfBytes;
}

export default OptimizedPDFProcessor;
