import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFProcessingResult } from '../types';

export interface ToolState {
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;
  result: PDFProcessingResult | PDFProcessingResult[] | null;
}

export interface ToolConfig {
  enableProgress?: boolean;
  enableError?: boolean;
  autoReset?: boolean;
  maxRetries?: number;
}

export interface UseToolStateResult {
  // State
  state: ToolState;
  
  // Actions
  startProcessing: (message?: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  setError: (error: string | Error) => void;
  setResult: (result: PDFProcessingResult | PDFProcessingResult[]) => void;
  reset: () => void;
  clearError: () => void;
  
  // Utilities
  isIdle: boolean;
  hasError: boolean;
  hasResult: boolean;
  canProcess: boolean;
  
  // Advanced
  retry: () => Promise<void>;
  abort: () => void;
  executeWithRetry: (operation: () => Promise<void>) => Promise<void>;
}

export function useToolState(
  config: ToolConfig = {}
): UseToolStateResult {
  const {
    enableProgress = true,
    enableError = true,
    autoReset = false,
    maxRetries = 3
  } = config;

  // Main state
  const [state, setState] = useState<ToolState>({
    isProcessing: false,
    progress: 0,
    progressMessage: '',
    error: null,
    result: null
  });

  // Internal refs for advanced features
  const abortController = useRef<AbortController | null>(null);
  const retryCount = useRef(0);
  const lastOperation = useRef<(() => Promise<void>) | null>(null);

  // Auto-reset when processing completes
  useEffect(() => {
    if (autoReset && !state.isProcessing && (state.result || state.error)) {
      const timer = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.isProcessing, state.result, state.error, autoReset]);

  const startProcessing = useCallback((message: string = 'Processing...') => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      progressMessage: message,
      error: null,
      result: null
    }));

    // Create new abort controller
    abortController.current = new AbortController();
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    if (!enableProgress) return;
    
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      progressMessage: message || prev.progressMessage
    }));
  }, [enableProgress]);

  const setError = useCallback((error: string | Error) => {
    if (!enableError) return;
    
    const errorMessage = error instanceof Error ? error.message : error;
    
    setState(prev => ({
      ...prev,
      isProcessing: false,
      error: errorMessage,
      progress: 0
    }));

    // Clear abort controller
    abortController.current = null;
  }, [enableError]);

  const setResult = useCallback((result: PDFProcessingResult | PDFProcessingResult[]) => {
    setState(prev => ({
      ...prev,
      isProcessing: false,
      result,
      progress: 100,
      progressMessage: 'Completed!',
      error: null
    }));

    // Clear abort controller
    abortController.current = null;
    retryCount.current = 0; // Reset retry count on success
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      progressMessage: '',
      error: null,
      result: null
    });

    // Clear abort controller
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }

    retryCount.current = 0;
    lastOperation.current = null;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  const abort = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      isProcessing: false,
      progress: 0,
      progressMessage: 'Cancelled',
      error: 'Operation was cancelled'
    }));
  }, []);

  const retry = useCallback(async () => {
    if (!lastOperation.current || retryCount.current >= maxRetries) {
      return;
    }

    retryCount.current += 1;
    clearError();
    
    try {
      await lastOperation.current();
    } catch (error) {
      setError(error as Error);
    }
  }, [maxRetries, clearError, setError]);

  // Store operation for retry functionality
  const executeWithRetry = useCallback(async (operation: () => Promise<void>) => {
    lastOperation.current = operation;
    retryCount.current = 0;
    
    try {
      await operation();
    } catch (error) {
      setError(error as Error);
    }
  }, [setError]);

  // Computed values
  const isIdle = !state.isProcessing && !state.error && !state.result;
  const hasError = Boolean(state.error);
  const hasResult = Boolean(state.result);
  const canProcess = !state.isProcessing;

  return {
    state,
    startProcessing,
    updateProgress,
    setError,
    setResult,
    reset,
    clearError,
    retry,
    abort,
    executeWithRetry,
    isIdle,
    hasError,
    hasResult,
    canProcess
  };
}

// Hook for simplified progress tracking
export function useProgress(initialValue: number = 0) {
  const [progress, setProgress] = useState(initialValue);
  const [message, setMessage] = useState('');

  const updateProgress = useCallback((value: number, msg?: string) => {
    setProgress(Math.max(0, Math.min(100, value)));
    if (msg !== undefined) {
      setMessage(msg);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(initialValue);
    setMessage('');
  }, [initialValue]);

  return {
    progress,
    message,
    updateProgress,
    setMessage,
    reset,
    isComplete: progress >= 100
  };
}

// Hook for error handling with retry logic
export function useErrorHandler(maxRetries: number = 3) {
  const [error, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastOperationRef = useRef<(() => Promise<void>) | null>(null);

  const setError = useCallback((error: string | Error) => {
    const message = error instanceof Error ? error.message : error;
    setErrorState(message);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const canRetry = retryCount < maxRetries && Boolean(lastOperationRef.current);

  const retry = useCallback(async () => {
    if (!canRetry || !lastOperationRef.current) return;

    setRetryCount(prev => prev + 1);
    clearError();

    try {
      await lastOperationRef.current();
      setRetryCount(0); // Reset on success
    } catch (err) {
      setError(err as Error);
    }
  }, [canRetry, clearError, setError]);

  const executeWithRetry = useCallback(async (operation: () => Promise<void>) => {
    lastOperationRef.current = operation;
    setRetryCount(0);
    clearError();

    try {
      await operation();
    } catch (err) {
      setError(err as Error);
    }
  }, [clearError, setError]);

  return {
    error,
    retryCount,
    maxRetries,
    canRetry,
    setError,
    clearError,
    retry,
    executeWithRetry,
    hasError: Boolean(error)
  };
}