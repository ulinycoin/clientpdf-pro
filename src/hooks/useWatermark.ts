import { useState, useCallback } from 'react';
import { WatermarkService, WatermarkOptions } from '../services/watermarkService';
import { downloadBlob, generateFilename } from '../utils/fileHelpers';
import { PDFProcessingResult } from '../types';

interface UseWatermarkReturn {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  result: PDFProcessingResult | null;
  addWatermark: (file: File, options: WatermarkOptions) => Promise<void>;
  resetState: () => void;
  getDefaultOptions: () => WatermarkOptions;
  validateOptions: (options: WatermarkOptions) => { valid: boolean; errors: string[] };
  getPreview: (pageWidth: number, pageHeight: number, options: WatermarkOptions) => { x: number; y: number };
}

export const useWatermark = (): UseWatermarkReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PDFProcessingResult | null>(null);

  const watermarkService = WatermarkService.getInstance();

  const addWatermark = useCallback(async (file: File, options: WatermarkOptions) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setResult(null);

      // Validate options first
      const validation = watermarkService.validateOptions(options);
      if (!validation.valid) {
        throw new Error(`Invalid options: ${validation.errors.join(', ')}`);
      }

      // Process watermark
      const result = await watermarkService.addWatermark(
        file,
        options,
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      if (result.success && result.data) {
        setResult(result);
      } else {
        setError(result.error?.message || 'Failed to add watermark');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add watermark';
      setError(errorMessage);
      console.error('[useWatermark] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [watermarkService]);

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  const getDefaultOptions = useCallback(() => {
    return watermarkService.getDefaultOptions();
  }, [watermarkService]);

  const validateOptions = useCallback((options: WatermarkOptions) => {
    return watermarkService.validateOptions(options);
  }, [watermarkService]);

  const getPreview = useCallback((pageWidth: number, pageHeight: number, options: WatermarkOptions) => {
    return watermarkService.getWatermarkPreview(pageWidth, pageHeight, options);
  }, [watermarkService]);

  return {
    isProcessing,
    progress,
    error,
    result,
    addWatermark,
    resetState,
    getDefaultOptions,
    validateOptions,
    getPreview
  };
};