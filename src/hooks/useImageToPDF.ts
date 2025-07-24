import { useState, useCallback } from 'react';
import { PDFProcessingResult, ProgressCallback } from '../types';
import imageToPDFService, { ImageToPDFOptions } from '../services/imageToPDFService';

export interface UseImageToPDFResult {
  convertImages: (imageFiles: File[], options: ImageToPDFOptions) => Promise<PDFProcessingResult>;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook for converting images to PDF
 */
export const useImageToPDF = (): UseImageToPDFResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Progress callback handler
  const handleProgress: ProgressCallback = useCallback((value: number, message?: string) => {
    setProgress(Math.min(100, Math.max(0, value)));
    if (message) {
      console.log(`[Image to PDF] ${message} (${Math.round(value)}%)`);
    }
  }, []);

  /**
   * Convert images to PDF
   */
  const convertImages = useCallback(async (
    imageFiles: File[],
    options: ImageToPDFOptions
  ): Promise<PDFProcessingResult> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Validate browser support
      if (!imageToPDFService.isSupported()) {
        throw new Error('Image to PDF conversion is not supported in this browser');
      }

      // Validate input files
      if (!imageFiles || imageFiles.length === 0) {
        throw new Error('Please select at least one image file');
      }

      // Check for empty files
      const emptyFiles = imageFiles.filter(file => file.size === 0);
      if (emptyFiles.length > 0) {
        throw new Error(`Some files appear to be empty: ${emptyFiles.map(f => f.name).join(', ')}`);
      }

      // Process with service
      const result = await imageToPDFService.convertImagesToPDF(
        imageFiles,
        options,
        handleProgress
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Image to PDF conversion failed');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during image conversion';
      setError(errorMessage);
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'CONVERSION_FAILED'
        }
      };
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [handleProgress]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    convertImages,
    isProcessing,
    progress,
    error,
    clearError,
    reset
  };
};

export default useImageToPDF;
