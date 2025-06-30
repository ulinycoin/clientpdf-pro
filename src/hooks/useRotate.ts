import { useState } from 'react';
import { PDFProcessingResult } from '../types';
import { RotateService } from '../services/rotateService';

export interface RotateOptions {
  rotation: 90 | 180 | 270;
  pages?: number[]; // 1-based page numbers
}

export const useRotate = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const rotatePDF = async (file: File, options: RotateOptions): Promise<PDFProcessingResult> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(25);

      const rotateOptions = {
        rotation: options.rotation,
        pages: options.pages ? options.pages.map(p => p - 1) : undefined // Convert to 0-based
      };

      setProgress(50);

      const result = await RotateService.rotatePDF(file, rotateOptions);
      
      setProgress(100);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rotation failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        metadata: { originalSize: file.size }
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const getPageInfo = async (file: File) => {
    try {
      return await RotateService.getPageInfo(file);
    } catch (error) {
      console.error('Error getting page info:', error);
      return null;
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  };

  return {
    rotatePDF,
    getPageInfo,
    isProcessing,
    progress,
    error,
    reset
  };
};

export default useRotate;