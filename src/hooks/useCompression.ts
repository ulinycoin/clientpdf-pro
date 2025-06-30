import { useState, useCallback } from 'react';
import { UseCompressionResult, CompressionOptions, PDFProcessingResult } from '../types';
import { compressionService } from '../services/compressionService';

export const useCompression = (): UseCompressionResult => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const compress = useCallback(async (
    file: File,
    options: CompressionOptions
  ): Promise<PDFProcessingResult> => {
    setIsCompressing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await compressionService.compressPDF(
        file,
        options,
        (progressValue, message) => {
          setProgress(progressValue);
        }
      );

      if (!result.success) {
        setError(result.error?.message || 'Compression failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'COMPRESSION_ERROR',
          cause: err,
        },
      };
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return {
    compress,
    isCompressing,
    progress,
    error,
  };
};