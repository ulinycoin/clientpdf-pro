import { useState, useCallback } from 'react';
import { 
  PDFProcessingResult, 
  ProgressCallback 
} from '../types';
import { 
  PasswordProtectionOptions, 
  PDFSecurityInfo, 
  UsePasswordProtectionResult 
} from '../types/security.types';
import pdfPasswordService from '../services/pdfPasswordService';

/**
 * Custom hook for PDF password protection operations
 * Manages state and provides methods for protecting/unprotecting PDFs
 */
export const usePasswordProtection = (): UsePasswordProtectionResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [securityInfo, setSecurityInfo] = useState<PDFSecurityInfo | null>(null);

  // Progress callback handler
  const handleProgress: ProgressCallback = useCallback((value: number, message?: string) => {
    setProgress(value);
    if (message) {
      console.log(`[PDF Password Protection] ${message} (${Math.round(value)}%)`);
    }
  }, []);

  /**
   * Protect PDF with password
   */
  const protectPDF = useCallback(async (
    file: File, 
    options: PasswordProtectionOptions
  ): Promise<PDFProcessingResult> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Selected file is not a PDF');
      }

      // Check file size (limit to 50MB for browser processing)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 50MB.');
      }

      // Process the PDF
      const result = await pdfPasswordService.protectPDF(
        file,
        options,
        handleProgress
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Password protection failed');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'PROTECTION_FAILED'
        }
      };
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [handleProgress]);

  /**
   * Remove password protection from PDF
   */
  const removePDFPassword = useCallback(async (
    file: File, 
    password: string
  ): Promise<PDFProcessingResult> => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Validate inputs
      if (file.type !== 'application/pdf') {
        throw new Error('Selected file is not a PDF');
      }

      if (!password || password.trim().length === 0) {
        throw new Error('Password is required to remove protection');
      }

      // Check file size
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 50MB.');
      }

      // Process the PDF
      const result = await pdfPasswordService.removePDFPassword(
        file,
        password,
        handleProgress
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Password removal failed');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'REMOVAL_FAILED'
        }
      };
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [handleProgress]);

  /**
   * Analyze PDF security information
   */
  const analyzeSecurityInfo = useCallback(async (file: File): Promise<void> => {
    try {
      if (file.type !== 'application/pdf') {
        throw new Error('Selected file is not a PDF');
      }

      const info = await pdfPasswordService.analyzePDFSecurity(file);
      setSecurityInfo(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Security analysis failed';
      setError(errorMessage);
      setSecurityInfo(null);
    }
  }, []);

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
    setSecurityInfo(null);
  }, []);

  return {
    protectPDF,
    removePDFPassword,
    isProcessing,
    progress,
    error,
    securityInfo,
    analyzeSecurityInfo,
    clearError,
    reset
  };
};

export default usePasswordProtection;
