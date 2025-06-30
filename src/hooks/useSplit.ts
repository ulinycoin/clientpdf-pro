import { useState } from 'react';
import { PDFProcessingResult } from '../types';
import { SplitService } from '../services/splitService';

export interface SplitOptions {
  mode: 'all' | 'range' | 'specific';
  startPage?: number;
  endPage?: number;
  specificPages?: number[];
}

export const useSplit = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const splitPDF = async (file: File, options: SplitOptions): Promise<PDFProcessingResult[]> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(25);

      let splitOptions: any = { mode: 'pages' };

      if (options.mode === 'range' && options.startPage && options.endPage) {
        splitOptions = {
          mode: 'range',
          startPage: options.startPage - 1, // Convert to 0-based
          endPage: options.endPage - 1
        };
      } else if (options.mode === 'specific' && options.specificPages) {
        splitOptions = {
          mode: 'pages',
          pages: options.specificPages.map(p => p - 1) // Convert to 0-based
        };
      }

      setProgress(50);

      const results = await SplitService.splitPDF(file, splitOptions);
      
      setProgress(100);
      
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Split failed';
      setError(errorMessage);
      return [{
        success: false,
        error: errorMessage,
        metadata: { originalSize: file.size }
      }];
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  };

  return {
    splitPDF,
    isProcessing,
    progress,
    error,
    reset
  };
};

export default useSplit;