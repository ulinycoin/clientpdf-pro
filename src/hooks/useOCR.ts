import { useState, useCallback, useRef } from 'react';
import { ocrService, SUPPORTED_LANGUAGES } from '../services/ocrService';
import {
  OCROptions,
  OCRProgress,
  ProcessedOCRResult,
  OCRError,
  SupportedLanguage
} from '../types/ocr.types';

interface UseOCRReturn {
  // State
  isProcessing: boolean;
  progress: OCRProgress | null;
  result: ProcessedOCRResult | null;
  error: OCRError | null;

  // Options
  options: OCROptions;
  supportedLanguages: SupportedLanguage[];

  // Actions
  processFile: (file: File) => Promise<void>;
  updateOptions: (newOptions: Partial<OCROptions>) => void;
  resetState: () => void;
  downloadResult: (format?: string) => Promise<void>;

  // Utils
  canProcess: (file: File) => boolean;
  getFileTypeInfo: (file: File) => { isSupported: boolean; type: string; message: string };
}

const DEFAULT_OPTIONS: OCROptions = {
  language: 'eng',
  preserveLayout: true,
  outputFormat: 'searchable-pdf',
  imagePreprocessing: true,
};

export const useOCR = (): UseOCRReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [result, setResult] = useState<ProcessedOCRResult | null>(null);
  const [error, setError] = useState<OCRError | null>(null);
  const [options, setOptions] = useState<OCROptions>(DEFAULT_OPTIONS);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if file can be processed
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

    return supportedTypes.includes(file.type) && file.size < 50 * 1024 * 1024; // 50MB limit
  }, []);

  // Get file type information
  const getFileTypeInfo = useCallback((file: File) => {
    if (!file) {
      return { isSupported: false, type: '', message: 'No file selected' };
    }

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const isSupported = canProcess(file);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);

    if (!isSupported) {
      if (file.size > 50 * 1024 * 1024) {
        return {
          isSupported: false,
          type: file.type,
          message: `File too large (${sizeInMB}MB). Maximum size is 50MB.`
        };
      }
      return {
        isSupported: false,
        type: file.type,
        message: 'Unsupported file type. Please upload PDF or image files.'
      };
    }

    if (isPDF) {
      return {
        isSupported: true,
        type: 'PDF',
        message: `PDF file (${sizeInMB}MB) - Will extract text from all pages`
      };
    }

    if (isImage) {
      return {
        isSupported: true,
        type: 'Image',
        message: `Image file (${sizeInMB}MB) - Will extract text from image`
      };
    }

    return { isSupported: false, type: file.type, message: 'Unknown file type' };
  }, [canProcess]);

  // Process file with OCR
  const processFile = useCallback(async (file: File): Promise<void> => {
    if (!canProcess(file)) {
      setError({
        message: 'File cannot be processed',
        code: 'UNSUPPORTED_FILE',
        details: getFileTypeInfo(file)
      });
      return;
    }

    if (isProcessing) {
      setError({
        message: 'Another OCR process is already running',
        code: 'PROCESSING_IN_PROGRESS'
      });
      return;
    }

    // Reset previous state
    setError(null);
    setResult(null);
    setProgress(null);
    setIsProcessing(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Use simple, reliable OCR service
      console.log('🚀 Starting OCR processing with:', options.language || 'eng');

      const processedResult = await ocrService.processOCR({
        file,
        options,
        onProgress: (progressData) => {
          setProgress(progressData);
        },
        onError: (ocrError) => {
          setError(ocrError);
        }
      });

      setResult(processedResult);
      setProgress({
        status: 'complete',
        progress: 100
      });

    } catch (err) {
      const error: OCRError = {
        message: err instanceof Error ? err.message : 'OCR processing failed',
        code: 'OCR_PROCESSING_ERROR',
        details: err
      };
      setError(error);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [canProcess, getFileTypeInfo, isProcessing, options]);

  // Update OCR options
  const updateOptions = useCallback((newOptions: Partial<OCROptions>) => {
    setOptions(prev => ({
      ...prev,
      ...newOptions
    }));
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);

    // Cancel any ongoing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Download result
  const downloadResult = useCallback(async (format?: string) => {
    if (!result) return;

    const downloadFormat = format || options.outputFormat;
    const originalName = result.originalFile.name;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

    // If downloading the same format that was processed, use existing blob
    if (downloadFormat === result.result.outputFormat && result.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;

      switch (downloadFormat) {
        case 'text':
          link.download = `${nameWithoutExt}_ocr.txt`;
          break;
        case 'searchable-pdf':
          link.download = `${nameWithoutExt}_searchable.pdf`;
          break;
        case 'docx':
          link.download = `${nameWithoutExt}_ocr.docx`;
          break;
        case 'rtf':
          link.download = `${nameWithoutExt}_ocr.rtf`;
          break;
        default:
          link.download = `${nameWithoutExt}_ocr.txt`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Otherwise, generate the format on-the-fly
    try {
      const text = result.result.text || '';
      let blob: Blob;
      let filename: string;

      switch (downloadFormat) {
        case 'text':
          blob = new Blob([text], { type: 'text/plain' });
          filename = `${nameWithoutExt}_ocr.txt`;
          break;

        case 'docx': {
          const { documentGenerator } = await import('../utils/documentGenerator');
          const metadata = {
            confidence: result.result.confidence,
            processingTime: result.processingTime,
            wordsCount: result.result.words?.length || 0,
            language: options.language,
            originalFileName: originalName
          };
          blob = await documentGenerator.generateDOCX(text, metadata, {
            title: `${nameWithoutExt} - OCR Results`,
            includeMetadata: true
          });
          filename = `${nameWithoutExt}_ocr.docx`;
          break;
        }

        case 'rtf': {
          const { documentGenerator } = await import('../utils/documentGenerator');
          const metadata = {
            confidence: result.result.confidence,
            processingTime: result.processingTime,
            wordsCount: result.result.words?.length || 0,
            language: options.language,
            originalFileName: originalName
          };
          blob = documentGenerator.generateRTF(text, metadata, {
            title: `${nameWithoutExt} - OCR Results`,
            includeMetadata: true
          });
          filename = `${nameWithoutExt}_ocr.rtf`;
          break;
        }

        case 'json': {
          const { documentGenerator } = await import('../utils/documentGenerator');
          const metadata = {
            confidence: result.result.confidence,
            processingTime: result.processingTime,
            wordsCount: result.result.words?.length || 0,
            language: options.language,
            originalFileName: originalName
          };
          blob = documentGenerator.generateJSON(text, metadata, {
            title: `${nameWithoutExt} - OCR Results`,
            includeMetadata: true
          });
          filename = `${nameWithoutExt}_ocr.json`;
          break;
        }

        case 'markdown': {
          const { documentGenerator } = await import('../utils/documentGenerator');
          const metadata = {
            confidence: result.result.confidence,
            processingTime: result.processingTime,
            wordsCount: result.result.words?.length || 0,
            language: options.language,
            originalFileName: originalName
          };
          blob = documentGenerator.generateMarkdown(text, metadata, {
            title: `${nameWithoutExt} - OCR Results`,
            includeMetadata: true
          });
          filename = `${nameWithoutExt}_ocr.md`;
          break;
        }

        case 'searchable-pdf':
        default: {
          const { textToPDFGenerator } = await import('../utils/textToPDFGenerator');
          blob = await textToPDFGenerator.generatePDF(text, `${nameWithoutExt}_ocr`, {
            fontSize: 11,
            pageSize: 'A4',
            orientation: 'portrait',
            margins: 50,
            lineHeight: 1.4
          });
          filename = `${nameWithoutExt}_searchable.pdf`;
          break;
        }
      }

      // Download the generated blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate download:', error);
      // Fallback to text
      const text = result.result.text || 'Failed to extract text';
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${nameWithoutExt}_ocr.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [result, options.outputFormat, options.language]);

  return {
    // State
    isProcessing,
    progress,
    result,
    error,

    // Options
    options,
    supportedLanguages: SUPPORTED_LANGUAGES,

    // Actions
    processFile,
    updateOptions,
    resetState,
    downloadResult,

    // Utils
    canProcess,
    getFileTypeInfo,
  };
};
