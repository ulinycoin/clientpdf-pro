/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

import { useRef, useCallback } from 'react';

export interface UseInstantFileSelectionOptions {
  acceptedTypes?: string[];
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export interface UseInstantFileSelectionReturn {
  openFileDialog: () => void;
  isSupported: boolean;
  supportedFormats: string[];
}

/**
 * Hook for instant file selection using system dialog
 * 
 * This hook provides a clean way to trigger system file dialogs
 * and handle file selection with validation and error handling.
 * 
 * @param options Configuration options for file selection
 * @returns Functions and state for file selection
 */
export const useInstantFileSelection = (
  options: UseInstantFileSelectionOptions = {}
): UseInstantFileSelectionReturn => {
  const {
    acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.csv', '.txt', '.tsv'],
    multiple = true,
    onFilesSelected,
    onError,
    maxSize = 100 * 1024 * 1024, // 100MB default
    maxFiles = 10
  } = options;

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // Create hidden input element if it doesn't exist
  const ensureHiddenInput = useCallback(() => {
    if (!hiddenInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.multiple = multiple;
      input.accept = acceptedTypes.join(',');
      
      // Add event listener for file selection
      input.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        const files = Array.from(target.files || []);
        
        if (files.length === 0) return;

        // Validate files
        const validationResult = validateFiles(files);
        if (validationResult.error) {
          onError?.(validationResult.error);
          return;
        }

        // Call success callback
        onFilesSelected?.(files);
        
        // Reset input to allow selecting the same file again
        target.value = '';
      });
      
      document.body.appendChild(input);
      hiddenInputRef.current = input;
    }
    return hiddenInputRef.current;
  }, [acceptedTypes, multiple, onFilesSelected, onError]);

  // Validate selected files
  const validateFiles = useCallback((files: File[]) => {
    // Check file count
    if (files.length > maxFiles) {
      return {
        error: `Maximum ${maxFiles} files allowed. You selected ${files.length} files.`,
        validFiles: []
      };
    }

    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
        return;
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = acceptedTypes.some(type => 
        type.toLowerCase() === fileExtension || 
        file.type.startsWith(type.replace('.', '').replace('*', ''))
      );

      if (!isValidType) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      validFiles.push(file);
    });

    return {
      error: errors.length > 0 ? errors.join(', ') : null,
      validFiles
    };
  }, [acceptedTypes, maxSize, maxFiles]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    try {
      const input = ensureHiddenInput();
      input.click();
    } catch (error) {
      onError?.('Failed to open file dialog. Please try again.');
    }
  }, [ensureHiddenInput, onError]);

  // Check if file selection is supported
  const isSupported = typeof window !== 'undefined' && 'File' in window;

  // Get list of supported formats for display
  const supportedFormats = acceptedTypes.map(type => type.replace('.', '').toUpperCase());

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (hiddenInputRef.current) {
      document.body.removeChild(hiddenInputRef.current);
      hiddenInputRef.current = null;
    }
  }, []);

  // Auto-cleanup effect would be added by the consumer component

  return {
    openFileDialog,
    isSupported,
    supportedFormats
  };
};

/**
 * Utility function to format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Utility function to get file icon based on file type
 */
export const getFileTypeIcon = (file: File | string): string => {
  const filename = typeof file === 'string' ? file : file.name;
  if (!filename) return '📄';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'txt':
    case 'csv':
    case 'tsv':
      return '📊';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'webp':
      return '🖼️';
    default:
      return '📄';
  }
};

/**
 * Utility function to detect file type category
 */
export const getFileCategory = (file: File): 'pdf' | 'image' | 'document' | 'data' | 'unknown' => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension || '')) return 'image';
  if (['doc', 'docx', 'txt'].includes(extension || '')) return 'document';
  if (['csv', 'tsv'].includes(extension || '')) return 'data';
  
  return 'unknown';
};
