import { useState, useCallback } from 'react';
import { ExtractTextService, ExtractTextOptions, ExtractedTextResult } from '../services/extractTextService';
import { ProcessingResult } from '../types';

interface UseExtractTextReturn {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  result: ProcessingResult<ExtractedTextResult> | null;
  extractText: (file: File, options: ExtractTextOptions) => Promise<void>;
  resetState: () => void;
  getDefaultOptions: () => ExtractTextOptions;
  validateOptions: (options: ExtractTextOptions, totalPages?: number) => { valid: boolean; errors: string[] };
  downloadAsTextFile: (result: ExtractedTextResult, originalFilename: string) => void;
}

export const useExtractText = (): UseExtractTextReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult<ExtractedTextResult> | null>(null);

  const extractTextService = ExtractTextService.getInstance();

  const extractText = useCallback(async (file: File, options: ExtractTextOptions) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setResult(null);

      // Validate options first
      const validation = extractTextService.validateOptions(options);
      if (!validation.valid) {
        throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
      }

      // Process text extraction
      const result = await extractTextService.extractText(
        file,
        options,
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      if (result.success) {
        setResult(result);
      } else {
        setError(result.error || 'Failed to extract text');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract text';
      setError(errorMessage);
      console.error('[useExtractText] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [extractTextService]);

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  const getDefaultOptions = useCallback(() => {
    return extractTextService.getDefaultOptions();
  }, [extractTextService]);

  const validateOptions = useCallback((options: ExtractTextOptions, totalPages?: number) => {
    return extractTextService.validateOptions(options, totalPages);
  }, [extractTextService]);

  const downloadAsTextFile = useCallback((result: ExtractedTextResult, originalFilename: string) => {
    extractTextService.downloadAsTextFile(result, originalFilename);
  }, [extractTextService]);

  return {
    isProcessing,
    progress,
    error,
    result,
    extractText,
    resetState,
    getDefaultOptions,
    validateOptions,
    downloadAsTextFile
  };
};