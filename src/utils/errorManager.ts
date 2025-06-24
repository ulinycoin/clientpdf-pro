/**
 * Centralized Error Handling & Notification System
 * Production-ready error management with user-friendly messages
 */

import toast from 'react-hot-toast';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  FILE_PROCESSING = 'FILE_PROCESSING',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  SYSTEM = 'SYSTEM',
  PDF_LIBRARY = 'PDF_LIBRARY',
  MEMORY = 'MEMORY',
  BROWSER_COMPATIBILITY = 'BROWSER_COMPATIBILITY'
}

// Severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error interface for structured error handling
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  details?: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, Record<string, string>> = {
  [ErrorType.FILE_PROCESSING]: {
    default: 'Failed to process the file. Please try again.',
    corrupt: 'The file appears to be corrupted. Please try a different file.',
    unsupported: 'This file type is not supported.',
    tooLarge: 'The file is too large. Please try a smaller file (max 100MB).',
    empty: 'The file appears to be empty.',
    password: 'This PDF is password-protected. Please use an unprotected file.',
  },
  [ErrorType.VALIDATION]: {
    default: 'Invalid input. Please check your data and try again.',
    fileType: 'Please select a valid file type.',
    required: 'This field is required.',
    format: 'Invalid file format.',
  },
  [ErrorType.NETWORK]: {
    default: 'Network error. Please check your connection and try again.',
    offline: 'You appear to be offline. Some features may not work.',
    timeout: 'Request timed out. Please try again.',
  },
  [ErrorType.PERMISSION]: {
    default: 'Permission denied. Please check your browser settings.',
    fileAccess: 'Cannot access file. Please grant permission and try again.',
    clipboard: 'Cannot access clipboard. Please copy manually.',
  },
  [ErrorType.SYSTEM]: {
    default: 'A system error occurred. Please refresh the page and try again.',
    memory: 'Not enough memory to complete this operation.',
    storage: 'Storage quota exceeded. Please free up space.',
  },
  [ErrorType.PDF_LIBRARY]: {
    default: 'PDF processing error. Please try again with a different file.',
    loadFailed: 'Failed to load PDF processing library.',
    parseFailed: 'Failed to parse PDF file.',
    renderFailed: 'Failed to render PDF.',
  },
  [ErrorType.MEMORY]: {
    default: 'Not enough memory to complete this operation. Try with a smaller file.',
    outOfMemory: 'Out of memory. Please close other tabs and try again.',
    quota: 'Storage quota exceeded.',
  },
  [ErrorType.BROWSER_COMPATIBILITY]: {
    default: 'Your browser may not support this feature.',
    fileApi: 'File API not supported in your browser.',
    worker: 'Web Workers not supported in your browser.',
  }
};

// Error recovery suggestions
const RECOVERY_SUGGESTIONS: Record<ErrorType, string[]> = {
  [ErrorType.FILE_PROCESSING]: [
    'Try a different file',
    'Ensure the file is not corrupted',
    'Check the file size (max 100MB)',
    'Use an unprotected PDF'
  ],
  [ErrorType.VALIDATION]: [
    'Check your input format',
    'Ensure all required fields are filled',
    'Use supported file types'
  ],
  [ErrorType.NETWORK]: [
    'Check your internet connection',
    'Try refreshing the page',
    'Disable browser extensions temporarily'
  ],
  [ErrorType.PERMISSION]: [
    'Grant file access permission',
    'Check browser security settings',
    'Try using a different browser'
  ],
  [ErrorType.SYSTEM]: [
    'Refresh the page',
    'Clear browser cache',
    'Close other tabs to free memory',
    'Try using an incognito window'
  ],
  [ErrorType.PDF_LIBRARY]: [
    'Try a different PDF file',
    'Refresh the page to reload libraries',
    'Check if the PDF is valid'
  ],
  [ErrorType.MEMORY]: [
    'Close other browser tabs',
    'Try with a smaller file',
    'Restart your browser',
    'Free up system memory'
  ],
  [ErrorType.BROWSER_COMPATIBILITY]: [
    'Update your browser',
    'Try a different browser',
    'Enable required browser features'
  ]
};

class ErrorManager {
  private static instance: ErrorManager;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * Create a structured error from any error object
   */
  createError(
    error: any,
    type: ErrorType = ErrorType.SYSTEM,
    context?: Record<string, any>
  ): AppError {
    const severity = this.determineSeverity(type, error);
    const userMessage = this.getUserFriendlyMessage(type, error);
    
    const appError: AppError = {
      type,
      severity,
      message: error?.message || 'Unknown error',
      userMessage,
      details: error?.details || error?.stack,
      timestamp: new Date(),
      stack: error?.stack,
      context,
      recoverable: this.isRecoverable(type),
      retryable: this.isRetryable(type)
    };

    this.logError(appError);
    return appError;
  }

  /**
   * Handle error and show appropriate user notification
   */
  handleError(
    error: any,
    type: ErrorType = ErrorType.SYSTEM,
    context?: Record<string, any>,
    showToast: boolean = true
  ): AppError {
    const appError = this.createError(error, type, context);
    
    if (showToast) {
      this.showErrorToast(appError);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('App Error:', appError);
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD && appError.severity !== ErrorSeverity.LOW) {
      this.reportError(appError);
    }

    return appError;
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, options?: any) {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#ffffff',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10b981',
      },
      ...options
    });
  }

  /**
   * Show info notification
   */
  showInfo(message: string, options?: any) {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
      ...options
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, options?: any) {
    toast(message, {
      duration: 5000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#ffffff',
      },
      ...options
    });
  }

  /**
   * Show loading notification
   */
  showLoading(message: string): string {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#ffffff',
      }
    });
  }

  /**
   * Dismiss loading notification
   */
  dismissLoading(toastId: string, successMessage?: string) {
    if (successMessage) {
      toast.success(successMessage, { id: toastId });
    } else {
      toast.dismiss(toastId);
    }
  }

  /**
   * Show error toast with recovery suggestions
   */
  private showErrorToast(appError: AppError) {
    const suggestions = RECOVERY_SUGGESTIONS[appError.type];
    const suggestionText = suggestions && suggestions.length > 0 
      ? `\n\nTry: ${suggestions[0]}` 
      : '';

    toast.error(appError.userMessage + suggestionText, {
      duration: appError.severity === ErrorSeverity.CRITICAL ? 8000 : 6000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#ffffff',
        maxWidth: '400px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      }
    });
  }

  /**
   * Determine error severity based on type and error details
   */
  private determineSeverity(type: ErrorType, error: any): ErrorSeverity {
    // Critical errors that break core functionality
    if (type === ErrorType.SYSTEM || type === ErrorType.MEMORY) {
      return ErrorSeverity.CRITICAL;
    }

    // High priority errors that prevent feature use
    if (type === ErrorType.PDF_LIBRARY || type === ErrorType.BROWSER_COMPATIBILITY) {
      return ErrorSeverity.HIGH;
    }

    // Medium priority errors that can be worked around
    if (type === ErrorType.FILE_PROCESSING || type === ErrorType.PERMISSION) {
      return ErrorSeverity.MEDIUM;
    }

    // Low priority errors (validation, network issues)
    return ErrorSeverity.LOW;
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(type: ErrorType, error: any): string {
    const messages = ERROR_MESSAGES[type];
    
    // Try to match specific error patterns
    const errorMsg = error?.message?.toLowerCase() || '';
    
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return messages.timeout || messages.default;
    }
    
    if (errorMsg.includes('memory') || errorMsg.includes('quota')) {
      return ERROR_MESSAGES[ErrorType.MEMORY].outOfMemory;
    }
    
    if (errorMsg.includes('permission') || errorMsg.includes('denied')) {
      return messages.fileAccess || messages.default;
    }
    
    if (errorMsg.includes('corrupt') || errorMsg.includes('invalid')) {
      return messages.corrupt || messages.default;
    }
    
    return messages.default;
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(type: ErrorType): boolean {
    return ![ErrorType.SYSTEM, ErrorType.BROWSER_COMPATIBILITY].includes(type);
  }

  /**
   * Check if operation can be retried
   */
  private isRetryable(type: ErrorType): boolean {
    return [ErrorType.NETWORK, ErrorType.PDF_LIBRARY].includes(type);
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError) {
    this.errorLog.unshift(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  /**
   * Report error to monitoring service (implement based on your needs)
   */
  private reportError(error: AppError) {
    // Example: Send to error tracking service
    // You can integrate with services like Sentry, LogRocket, etc.
    
    try {
      // Basic error reporting - replace with your monitoring service
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: error.severity === ErrorSeverity.CRITICAL,
          error_type: error.type,
          error_severity: error.severity
        });
      }
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats() {
    const byType = this.errorLog.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    const bySeverity = this.errorLog.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      recent: this.errorLog.slice(0, 5)
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorManager = ErrorManager.getInstance();

// Convenience functions for common use cases
export const handleFileError = (error: any, context?: Record<string, any>) =>
  errorManager.handleError(error, ErrorType.FILE_PROCESSING, context);

export const handleValidationError = (error: any, context?: Record<string, any>) =>
  errorManager.handleError(error, ErrorType.VALIDATION, context);

export const handleNetworkError = (error: any, context?: Record<string, any>) =>
  errorManager.handleError(error, ErrorType.NETWORK, context);

export const handlePDFError = (error: any, context?: Record<string, any>) =>
  errorManager.handleError(error, ErrorType.PDF_LIBRARY, context);

export const showSuccess = (message: string, options?: any) =>
  errorManager.showSuccess(message, options);

export const showInfo = (message: string, options?: any) =>
  errorManager.showInfo(message, options);

export const showWarning = (message: string, options?: any) =>
  errorManager.showWarning(message, options);

export const showLoading = (message: string) =>
  errorManager.showLoading(message);

export const dismissLoading = (toastId: string, successMessage?: string) =>
  errorManager.dismissLoading(toastId, successMessage);
