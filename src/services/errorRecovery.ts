/**
 * Advanced Error Recovery System
 * 
 * Обеспечивает robust error handling с retry mechanisms,
 * fallbacks и user-friendly error reporting.
 */

import React from 'react';

export interface ErrorDetails {
  code: string;
  message: string;
  context?: any;
  timestamp: number;
  userAgent: string;
  url: string;
  stack?: string;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
}

export interface ErrorRecoveryConfig {
  enableRetry: boolean;
  enableFallback: boolean;
  enableUserReporting: boolean;
  logErrors: boolean;
  retryOptions: RetryOptions;
}

// Дефолтная конфигурация
const DEFAULT_CONFIG: ErrorRecoveryConfig = {
  enableRetry: true,
  enableFallback: true,
  enableUserReporting: true,
  logErrors: true,
  retryOptions: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error, attempt) => {
      // Retry на network errors и временных ошибках
      return attempt < 3 && (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('fetch')
      );
    }
  }
};

// Типы ошибок
export enum ErrorType {
  NETWORK = 'NETWORK',
  PDF_PROCESSING = 'PDF_PROCESSING',
  FILE_VALIDATION = 'FILE_VALIDATION',
  MEMORY = 'MEMORY',
  PERMISSION = 'PERMISSION',
  BROWSER_SUPPORT = 'BROWSER_SUPPORT',
  UNKNOWN = 'UNKNOWN'
}

// Категории ошибок для определения стратегии восстановления
export enum ErrorSeverity {
  LOW = 'LOW',         // Можно игнорировать или показать уведомление
  MEDIUM = 'MEDIUM',   // Требует внимания пользователя
  HIGH = 'HIGH',       // Блокирует функциональность
  CRITICAL = 'CRITICAL' // Критическая ошибка приложения
}

export interface ClassifiedError {
  type: ErrorType;
  severity: ErrorSeverity;
  isRetryable: boolean;
  hasFallback: boolean;
  userMessage: string;
  technicalMessage: string;
  suggestedActions: string[];
}

class ErrorClassifier {
  /**
   * Классифицирует ошибку для определения стратегии восстановления
   */
  static classify(error: Error, context?: any): ClassifiedError {
    const message = error.message.toLowerCase();
    const stack = error.stack || '';

    // PDF Processing Errors
    if (message.includes('pdf') || message.includes('password') || message.includes('corrupted')) {
      return this.classifyPDFError(error, context);
    }

    // Network Errors
    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return this.classifyNetworkError(error, context);
    }

    // Memory Errors
    if (message.includes('memory') || message.includes('allocation') || stack.includes('RangeError')) {
      return this.classifyMemoryError(error, context);
    }

    // File Validation Errors
    if (message.includes('file') || message.includes('invalid') || message.includes('format')) {
      return this.classifyFileError(error, context);
    }

    // Browser Support Errors
    if (message.includes('not supported') || message.includes('unsupported')) {
      return this.classifyBrowserError(error, context);
    }

    // Unknown Errors
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: false,
      hasFallback: false,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message,
      suggestedActions: ['Refresh the page', 'Try a different file', 'Contact support']
    };
  }

  private static classifyPDFError(error: Error, context?: any): ClassifiedError {
    const message = error.message.toLowerCase();

    if (message.includes('password') || message.includes('encrypted')) {
      return {
        type: ErrorType.PDF_PROCESSING,
        severity: ErrorSeverity.HIGH,
        isRetryable: false,
        hasFallback: false,
        userMessage: 'This PDF is password protected and cannot be processed.',
        technicalMessage: error.message,
        suggestedActions: ['Remove password protection', 'Use a different PDF']
      };
    }

    if (message.includes('corrupted') || message.includes('invalid')) {
      return {
        type: ErrorType.PDF_PROCESSING,
        severity: ErrorSeverity.HIGH,
        isRetryable: false,
        hasFallback: false,
        userMessage: 'The PDF file appears to be corrupted or invalid.',
        technicalMessage: error.message,
        suggestedActions: ['Try a different PDF file', 'Re-download the original file']
      };
    }

    return {
      type: ErrorType.PDF_PROCESSING,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: true,
      hasFallback: true,
      userMessage: 'There was a problem processing your PDF. We\'ll try again.',
      technicalMessage: error.message,
      suggestedActions: ['Wait a moment for automatic retry', 'Try a smaller file']
    };
  }

  private static classifyNetworkError(error: Error, context?: any): ClassifiedError {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: true,
      hasFallback: true,
      userMessage: 'Network connection issue. Retrying automatically...',
      technicalMessage: error.message,
      suggestedActions: ['Check your internet connection', 'Try again in a moment']
    };
  }

  private static classifyMemoryError(error: Error, context?: any): ClassifiedError {
    return {
      type: ErrorType.MEMORY,
      severity: ErrorSeverity.HIGH,
      isRetryable: false,
      hasFallback: true,
      userMessage: 'The file is too large to process. Please try a smaller file.',
      technicalMessage: error.message,
      suggestedActions: ['Use a smaller PDF file', 'Close other browser tabs', 'Try compressing the PDF first']
    };
  }

  private static classifyFileError(error: Error, context?: any): ClassifiedError {
    return {
      type: ErrorType.FILE_VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      isRetryable: false,
      hasFallback: false,
      userMessage: 'The selected file is not valid or supported.',
      technicalMessage: error.message,
      suggestedActions: ['Check file format', 'Try a different file', 'Ensure file is not corrupted']
    };
  }

  private static classifyBrowserError(error: Error, context?: any): ClassifiedError {
    return {
      type: ErrorType.BROWSER_SUPPORT,
      severity: ErrorSeverity.HIGH,
      isRetryable: false,
      hasFallback: false,
      userMessage: 'Your browser doesn\'t support this feature. Please update your browser.',
      technicalMessage: error.message,
      suggestedActions: ['Update your browser', 'Try a different browser', 'Enable JavaScript']
    };
  }
}

class RetryManager {
  /**
   * Выполняет операцию с retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    const config = { ...DEFAULT_CONFIG.retryOptions, ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Проверяем, нужно ли retry
        if (attempt === config.maxAttempts || 
            !config.retryCondition?.(lastError, attempt)) {
          throw lastError;
        }

        // Уведомляем о retry
        onRetry?.(attempt, lastError);

        // Exponential backoff delay
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class ErrorReporter {
  private static errorQueue: ErrorDetails[] = [];
  private static isReporting = false;

  /**
   * Логирует ошибку для анализа
   */
  static logError(error: Error, context?: any): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: error.name || 'UnknownError',
      message: error.message,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error.stack
    };

    // Добавляем в очередь для отправки
    this.errorQueue.push(errorDetails);

    // Логируем в консоль для разработки
    if (process.env.NODE_ENV === 'development') {
      console.group('🐛 Error Report');
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Details:', errorDetails);
      console.groupEnd();
    }

    // Отправляем в background (если настроена аналитика)
    this.flushErrors();

    return errorDetails;
  }

  /**
   * Отправляет накопленные ошибки
   */
  private static async flushErrors(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      const errors = [...this.errorQueue];
      this.errorQueue = [];

      // В будущем здесь можно добавить отправку в Sentry, LogRocket и т.д.
      // await this.sendToAnalytics(errors);
      
      console.log(`📊 Reported ${errors.length} errors`);
    } catch (error) {
      console.warn('Failed to report errors:', error);
      // Возвращаем ошибки в очередь
      this.errorQueue.unshift(...this.errorQueue);
    } finally {
      this.isReporting = false;
    }
  }
}

/**
 * Основной класс для error recovery
 */
export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig;

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Обрабатывает ошибку с полным recovery flow
   */
  async handleError<T>(
    error: Error,
    context?: any,
    fallbackOperation?: () => Promise<T>
  ): Promise<{ result?: T; recovered: boolean; classification: ClassifiedError }> {
    // Классифицируем ошибку
    const classification = ErrorClassifier.classify(error, context);

    // Логируем ошибку
    if (this.config.logErrors) {
      ErrorReporter.logError(error, { ...context, classification });
    }

    // Пытаемся восстановиться
    let result: T | undefined;
    let recovered = false;

    // Fallback strategy
    if (this.config.enableFallback && classification.hasFallback && fallbackOperation) {
      try {
        result = await fallbackOperation();
        recovered = true;
        console.log('✅ Recovered using fallback operation');
      } catch (fallbackError) {
        console.warn('⚠️ Fallback operation also failed:', fallbackError);
      }
    }

    return { result, recovered, classification };
  }

  /**
   * Выполняет операцию с retry и error handling
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context?: any,
    fallbackOperation?: () => Promise<T>
  ): Promise<T> {
    try {
      if (this.config.enableRetry) {
        return await RetryManager.executeWithRetry(
          operation,
          this.config.retryOptions,
          (attempt, error) => {
            console.log(`⏳ Retry attempt ${attempt} for:`, error.message);
          }
        );
      } else {
        return await operation();
      }
    } catch (error) {
      const recovery = await this.handleError(error as Error, context, fallbackOperation);
      
      if (recovery.recovered && recovery.result !== undefined) {
        return recovery.result;
      }

      // Если не удалось восстановиться, пробрасываем ошибку
      throw error;
    }
  }

  /**
   * Создает user-friendly error message
   */
  createUserMessage(error: Error, context?: any): {
    title: string;
    message: string;
    actions: string[];
    severity: ErrorSeverity;
  } {
    const classification = ErrorClassifier.classify(error, context);

    return {
      title: this.getErrorTitle(classification.type),
      message: classification.userMessage,
      actions: classification.suggestedActions,
      severity: classification.severity
    };
  }

  private getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.PDF_PROCESSING:
        return 'PDF Processing Error';
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.FILE_VALIDATION:
        return 'File Error';
      case ErrorType.MEMORY:
        return 'Memory Error';
      case ErrorType.PERMISSION:
        return 'Permission Error';
      case ErrorType.BROWSER_SUPPORT:
        return 'Browser Support Error';
      default:
        return 'Unexpected Error';
    }
  }
}

// Singleton instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// React Hook для error handling в компонентах
export const useErrorRecovery = () => {
  const [error, setError] = React.useState<ClassifiedError | null>(null);
  const [isRecovering, setIsRecovering] = React.useState(false);

  const handleError = React.useCallback(async (
    error: Error,
    context?: any,
    fallbackOperation?: () => Promise<any>
  ) => {
    setIsRecovering(true);
    
    try {
      const recovery = await errorRecoveryManager.handleError(
        error,
        context,
        fallbackOperation
      );

      if (recovery.recovered) {
        setError(null);
        return recovery.result;
      } else {
        setError(recovery.classification);
        throw error;
      }
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const executeWithRecovery = React.useCallback(async <T>(
    operation: () => Promise<T>,
    context?: any,
    fallbackOperation?: () => Promise<T>
  ): Promise<T> => {
    setIsRecovering(true);
    setError(null);

    try {
      return await errorRecoveryManager.executeWithRecovery(
        operation,
        context,
        fallbackOperation
      );
    } catch (error) {
      const classification = ErrorClassifier.classify(error as Error, context);
      setError(classification);
      throw error;
    } finally {
      setIsRecovering(false);
    }
  }, []);

  return {
    error,
    isRecovering,
    handleError,
    clearError,
    executeWithRecovery
  };
};

// Utility functions
export const createRetryableOperation = <T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
) => {
  return () => RetryManager.executeWithRetry(operation, options);
};

export const withErrorRecovery = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: {
    context?: any;
    fallback?: (...args: T) => Promise<R>;
    retryOptions?: Partial<RetryOptions>;
  }
) => {
  return async (...args: T): Promise<R> => {
    return errorRecoveryManager.executeWithRecovery(
      () => fn(...args),
      options?.context,
      options?.fallback ? () => options.fallback!(...args) : undefined
    );
  };
};

// Memory management utilities
export const MemoryManager = {
  /**
   * Проверяет доступность памяти
   */
  checkMemoryAvailability(): {
    available: boolean;
    estimatedLimit: number;
    usage: number;
  } {
    // @ts-ignore - experimental API
    const memory = (navigator as any).memory;
    
    if (memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = memory;
      const usage = (usedJSHeapSize / jsHeapSizeLimit) * 100;
      
      return {
        available: usage < 80, // Считаем критичным использование >80%
        estimatedLimit: jsHeapSizeLimit,
        usage: usedJSHeapSize
      };
    }

    // Fallback для браузеров без Memory API
    return {
      available: true,
      estimatedLimit: 2 * 1024 * 1024 * 1024, // 2GB estimation
      usage: 0
    };
  },

  /**
   * Принудительно вызывает garbage collection (если доступно)
   */
  forceGarbageCollection(): void {
    // @ts-ignore - только в развитии с --expose-gc флагом
    if (typeof window.gc === 'function') {
      window.gc();
      console.log('🗑️ Forced garbage collection');
    }
  },

  /**
   * Освобождает память от больших объектов
   */
  releaseMemory(objects: any[]): void {
    objects.forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          delete obj[key];
        });
      }
    });
    
    // Даем браузеру время для GC
    setTimeout(() => {
      this.forceGarbageCollection();
    }, 100);
  }
};

console.log('🛡️ Error Recovery System initialized');
