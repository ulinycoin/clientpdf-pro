import { useState, useCallback, useRef, useEffect } from 'react';
import { optimizedOCRService, SUPPORTED_LANGUAGES } from '../services/optimizedOCRService';
import { memoryManager } from '../utils/memoryManager';
import {
  OCROptions,
  OCRProgress,
  ProcessedOCRResult,
  OCRError,
  SupportedLanguage
} from '../types/ocr.types';

interface UseOptimizedOCRReturn {
  // State
  isProcessing: boolean;
  progress: OCRProgress | null;
  result: ProcessedOCRResult | null;
  error: OCRError | null;
  memoryStats: any;

  // Options
  options: OCROptions;
  supportedLanguages: SupportedLanguage[];

  // Actions
  processFile: (file: File) => Promise<void>;
  updateOptions: (newOptions: Partial<OCROptions>) => void;
  resetState: () => void;
  downloadResult: () => void;
  retryLastOperation: () => Promise<void>;

  // Utils
  canProcess: (file: File) => boolean;
  getFileTypeInfo: (file: File) => { isSupported: boolean; type: string; message: string };
  getWorkerPoolStatus: () => { activeWorkers: number; totalWorkers: number; languages: string[] };
  
  // Advanced features
  preloadLanguage: (language: string) => Promise<void>;
  estimateProcessingTime: (file: File) => number;
  analyzeFileComplexity: (file: File) => Promise<{ complexity: 'low' | 'medium' | 'high'; estimatedTime: number; recommendations: string[] }>;
}

const DEFAULT_OPTIONS: OCROptions = {
  language: 'rus',
  preserveLayout: true,
  outputFormat: 'searchable-pdf',
  imagePreprocessing: true,
};

export const useOptimizedOCR = (): UseOptimizedOCRReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [result, setResult] = useState<ProcessedOCRResult | null>(null);
  const [error, setError] = useState<OCRError | null>(null);
  const [options, setOptions] = useState<OCROptions>(DEFAULT_OPTIONS);
  const [memoryStats, setMemoryStats] = useState<any>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Update memory stats periodically
  useEffect(() => {
    const updateMemoryStats = () => {
      setMemoryStats(memoryManager.getStats());
    };

    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Enhanced file validation
  const canProcess = useCallback((file: File): boolean => {
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/bmp',
      'image/tiff',
      'image/tif',
      'image/webp'
    ];

    const maxSize = 100 * 1024 * 1024; // 100MB limit (increased for better quality)
    const minSize = 1024; // 1KB minimum

    return supportedTypes.includes(file.type) && 
           file.size >= minSize && 
           file.size <= maxSize;
  }, []);

  // Enhanced file type information
  const getFileTypeInfo = useCallback((file: File) => {
    if (!file) {
      return { isSupported: false, type: '', message: 'No file selected' };
    }

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const isSupported = canProcess(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);

    if (!isSupported) {
      if (file.size > 100 * 1024 * 1024) {
        return {
          isSupported: false,
          type: file.type,
          message: `File too large (${sizeInMB}MB). Maximum size is 100MB.`
        };
      }
      if (file.size < 1024) {
        return {
          isSupported: false,
          type: file.type,
          message: 'File too small. Minimum size is 1KB.'
        };
      }
      return {
        isSupported: false,
        type: file.type,
        message: 'Unsupported file type. Please upload PDF or image files (JPEG, PNG, BMP, TIFF, WebP).'
      };
    }

    if (isPDF) {
      return {
        isSupported: true,
        type: 'PDF',
        message: `PDF document (${sizeInMB}MB) - Will extract text from all pages with enhanced accuracy`
      };
    }

    if (isImage) {
      return {
        isSupported: true,
        type: 'Image',
        message: `Image file (${sizeInMB}MB) - Will extract text using optimized OCR processing`
      };
    }

    return { isSupported: false, type: file.type, message: 'Unknown file type' };
  }, [canProcess]);

  // Estimate processing time based on file characteristics
  const estimateProcessingTime = useCallback((file: File): number => {
    const baseTimePerMB = file.type === 'application/pdf' ? 8 : 12; // seconds
    const sizeInMB = file.size / (1024 * 1024);
    
    // Factor in language complexity
    const languageMultiplier = options.language === 'rus' ? 1.3 : 1.0; // Russian is more complex
    
    // Factor in preprocessing
    const preprocessingMultiplier = options.imagePreprocessing ? 1.2 : 1.0;
    
    const estimatedTime = Math.max(5, Math.ceil(sizeInMB * baseTimePerMB * languageMultiplier * preprocessingMultiplier));
    
    return estimatedTime;
  }, [options.language, options.imagePreprocessing]);

  // Analyze file complexity for better processing strategy
  const analyzeFileComplexity = useCallback(async (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    let complexity: 'low' | 'medium' | 'high' = 'medium';
    const recommendations: string[] = [];

    // Size-based complexity
    if (sizeInMB > 50) {
      complexity = 'high';
      recommendations.push('Large file detected - consider splitting into smaller sections for faster processing');
    } else if (sizeInMB > 10) {
      complexity = 'medium';
      recommendations.push('Medium-sized file - processing will take moderate time');
    } else {
      complexity = 'low';
      recommendations.push('Small file - should process quickly');
    }

    // PDF-specific analysis
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { getDocument } = await import('pdfjs-dist');
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        
        if (pdf.numPages > 20) {
          complexity = 'high';
          recommendations.push(`Large PDF with ${pdf.numPages} pages - consider processing in batches`);
        } else if (pdf.numPages > 5) {
          complexity = complexity === 'low' ? 'medium' : complexity;
          recommendations.push(`Multi-page PDF (${pdf.numPages} pages) - will process sequentially`);
        }
      } catch (error) {
        recommendations.push('Could not analyze PDF structure - using default complexity');
      }
    }

    // Language-specific recommendations
    if (options.language === 'rus') {
      recommendations.push('Russian language selected - optimized for Cyrillic characters');
    }

    if (options.imagePreprocessing) {
      recommendations.push('Image preprocessing enabled - will enhance text clarity');
    }

    const estimatedTime = estimateProcessingTime(file);

    return {
      complexity,
      estimatedTime,
      recommendations
    };
  }, [options.language, options.imagePreprocessing, estimateProcessingTime]);

  // Enhanced error handling with retry logic
  const handleProcessingError = useCallback((error: any): OCRError => {
    let errorCode = 'OCR_PROCESSING_ERROR';
    let message = 'OCR processing failed';
    let recoverable = true;

    if (error.message?.includes('Worker initialization timeout')) {
      errorCode = 'WORKER_TIMEOUT';
      message = 'OCR engine initialization timed out. Please check your internet connection.';
    } else if (error.message?.includes('Language data')) {
      errorCode = 'LANGUAGE_DOWNLOAD_FAILED';
      message = 'Failed to download language data. Please check your internet connection and retry.';
    } else if (error.message?.includes('Memory')) {
      errorCode = 'MEMORY_ERROR';
      message = 'Insufficient memory for processing. Try closing other tabs or reducing file size.';
      recoverable = false;
    } else if (error.message?.includes('All OCR strategies failed')) {
      errorCode = 'ALL_STRATEGIES_FAILED';
      message = 'Text recognition failed with all available methods. The document may not contain readable text.';
    }

    return {
      message,
      code: errorCode,
      details: error,
      recoverable
    };
  }, []);

  // Enhanced processing function with retry logic
  const processFile = useCallback(async (file: File): Promise<void> => {
    if (!canProcess(file)) {
      setError({
        message: 'File cannot be processed',
        code: 'UNSUPPORTED_FILE',
        details: getFileTypeInfo(file),
        recoverable: false
      });
      return;
    }

    if (isProcessing) {
      setError({
        message: 'Another OCR process is already running',
        code: 'PROCESSING_IN_PROGRESS',
        recoverable: true
      });
      return;
    }

    // Store file for retry functionality
    lastFileRef.current = file;
    retryCountRef.current = 0;

    await executeProcessing(file);
  }, [canProcess, getFileTypeInfo, isProcessing, options]);

  // Execute processing with enhanced error handling
  const executeProcessing = useCallback(async (file: File): Promise<void> => {
    // Reset previous state
    setError(null);
    setResult(null);
    setProgress(null);
    setIsProcessing(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      console.log('🚀 Enhanced OCR: Starting processing with optimized service', {
        file: file.name,
        language: options.language,
        retry: retryCountRef.current
      });

      const processedResult = await optimizedOCRService.processOCR({
        file,
        options,
        onProgress: (progressData) => {
          setProgress({
            ...progressData,
            estimatedTimeRemaining: progressData.progress > 0 ? 
              Math.ceil((100 - progressData.progress) / progressData.progress * 2) : undefined
          });
        },
        onError: (ocrError) => {
          const enhancedError = handleProcessingError(ocrError);
          setError(enhancedError);
        }
      });

      setResult(processedResult);
      setProgress({
        status: 'complete',
        progress: 100
      });

      // Register result blob URL for memory management
      if (processedResult.downloadUrl) {
        memoryManager.registerBlobUrl(processedResult.downloadUrl, `result-${Date.now()}`);
      }

      console.log('✅ Enhanced OCR: Processing completed successfully');

    } catch (err) {
      const enhancedError = handleProcessingError(err);
      
      // Implement retry logic for recoverable errors
      if (enhancedError.recoverable && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`🔄 Enhanced OCR: Retrying processing (attempt ${retryCountRef.current}/${maxRetries})`);
        
        // Wait before retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Retry with same file
        await executeProcessing(file);
        return;
      }

      setError({
        ...enhancedError,
        retryCount: retryCountRef.current
      });
      
      console.error('❌ Enhanced OCR: Processing failed after retries:', enhancedError);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [options, handleProcessingError]);

  // Retry last operation
  const retryLastOperation = useCallback(async (): Promise<void> => {
    if (!lastFileRef.current) {
      setError({
        message: 'No previous operation to retry',
        code: 'NO_RETRY_AVAILABLE',
        recoverable: false
      });
      return;
    }

    retryCountRef.current = 0; // Reset retry count
    await executeProcessing(lastFileRef.current);
  }, [executeProcessing]);

  // Preload language for faster processing
  const preloadLanguage = useCallback(async (language: string): Promise<void> => {
    try {
      console.log(`🔄 Enhanced OCR: Preloading language ${language}`);
      // This will initialize the worker if not already done
      await optimizedOCRService.processOCR({
        file: new File([''], 'dummy.txt', { type: 'text/plain' }),
        options: { ...options, language },
        onProgress: () => {},
        onError: () => {}
      }).catch(() => {}); // Ignore errors from dummy processing
      
      console.log(`✅ Enhanced OCR: Language ${language} preloaded`);
    } catch (error) {
      console.warn(`⚠️ Enhanced OCR: Failed to preload language ${language}:`, error);
    }
  }, [options]);

  // Update OCR options with validation
  const updateOptions = useCallback((newOptions: Partial<OCROptions>) => {
    setOptions(prev => {
      const updated = { ...prev, ...newOptions };
      
      // Validate language
      if (newOptions.language && !SUPPORTED_LANGUAGES.find(lang => lang.code === newOptions.language)) {
        console.warn(`⚠️ Enhanced OCR: Invalid language ${newOptions.language}, keeping ${prev.language}`);
        updated.language = prev.language;
      }
      
      console.log('🔧 Enhanced OCR: Options updated:', updated);
      return updated;
    });
  }, []);

  // Reset all state with cleanup
  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
    lastFileRef.current = null;
    retryCountRef.current = 0;

    // Cancel any ongoing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clean up temporary memory resources
    memoryManager.releaseResourcesByType('canvas');
    
    console.log('🧹 Enhanced OCR: State reset and memory cleaned');
  }, []);

  // Enhanced download with better filename generation
  const downloadResult = useCallback(() => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.downloadUrl;

    // Generate intelligent filename
    const originalName = result.originalFile.name;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const languageCode = options.language.toUpperCase();

    switch (options.outputFormat) {
      case 'text':
        link.download = `${nameWithoutExt}_OCR_${languageCode}_${timestamp}.txt`;
        break;
      case 'searchable-pdf':
        link.download = `${nameWithoutExt}_Searchable_${languageCode}_${timestamp}.pdf`;
        break;
      default:
        link.download = `${nameWithoutExt}_OCR_${languageCode}_${timestamp}.txt`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('📥 Enhanced OCR: File downloaded:', link.download);
  }, [result, options.outputFormat, options.language]);

  // Get worker pool status for debugging
  const getWorkerPoolStatus = useCallback(() => {
    return optimizedOCRService.getPoolStatus();
  }, []);

  return {
    // State
    isProcessing,
    progress,
    result,
    error,
    memoryStats,

    // Options
    options,
    supportedLanguages: SUPPORTED_LANGUAGES,

    // Actions
    processFile,
    updateOptions,
    resetState,
    downloadResult,
    retryLastOperation,

    // Utils
    canProcess,
    getFileTypeInfo,
    getWorkerPoolStatus,

    // Advanced features
    preloadLanguage,
    estimateProcessingTime,
    analyzeFileComplexity,
  };
};

export default useOptimizedOCR;