/**
 * Utility functions for file operations
 */

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// File validation
export const validatePDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

export const validateFileSize = (file: File, maxSizeInMB: number = 100): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// File download utilities
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Filename generation utilities
export const generateFilename = (
  operation: string,
  originalName?: string,
  timestamp?: boolean
): string => {
  const cleanOperation = operation.toLowerCase().replace(/\s+/g, '_');
  const baseFilename = originalName 
    ? originalName.replace(/\.pdf$/i, '') 
    : 'document';
  
  const timestampSuffix = timestamp 
    ? `_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`
    : '';
    
  return `${baseFilename}_${cleanOperation}${timestampSuffix}.pdf`;
};

// File reading utilities
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as DataURL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// File list utilities
export const sortFilesByName = (files: File[]): File[] => {
  return [...files].sort((a, b) => a.name.localeCompare(b.name));
};

export const sortFilesBySize = (files: File[]): File[] => {
  return [...files].sort((a, b) => a.size - b.size);
};

export const sortFilesByDate = (files: File[]): File[] => {
  return [...files].sort((a, b) => a.lastModified - b.lastModified);
};

// File extension utilities
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const changeFileExtension = (filename: string, newExtension: string): string => {
  const baseName = filename.slice(0, filename.lastIndexOf('.'));
  return `${baseName}.${newExtension}`;
};

// MIME type utilities
export const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// Batch file operations
export const processBatchFiles = async <T>(
  files: File[],
  processor: (file: File, index: number) => Promise<T>,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);
    
    try {
      const result = await processor(file, i);
      results.push(result);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw error;
    }
  }
  
  onProgress?.(files.length, files.length, 'Complete');
  return results;
};

// Memory management utilities
export const createObjectURL = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

// File comparison utilities
export const filesAreEqual = (file1: File, file2: File): boolean => {
  return file1.name === file2.name && 
         file1.size === file2.size && 
         file1.lastModified === file2.lastModified;
};

export const removeDuplicateFiles = (files: File[]): File[] => {
  const seen = new Set<string>();
  return files.filter(file => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Error handling utilities
export const getFileErrorMessage = (error: unknown, filename?: string): string => {
  const fileContext = filename ? ` for file "${filename}"` : '';
  
  if (error instanceof Error) {
    return `${error.message}${fileContext}`;
  }
  
  if (typeof error === 'string') {
    return `${error}${fileContext}`;
  }
  
  return `An unknown error occurred${fileContext}`;
};