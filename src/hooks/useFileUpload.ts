import { useState, useCallback } from 'react';
import { UseFileUploadResult } from '../types';

export interface FileUploadOptions {
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
}

export const useFileUpload = (options?: FileUploadOptions): UseFileUploadResult => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    // Use accepted types from options, default to PDF for backward compatibility
    const acceptedTypes = options?.acceptedTypes || ['application/pdf'];
    const maxFiles = options?.maxFiles || 100;
    const maxSize = options?.maxSize || 100 * 1024 * 1024; // 100MB default
    
    // Filter files based on accepted types
    const validFiles = newFiles.filter(file => {
      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      });
      
      // Check file size
      const isValidSize = file.size <= maxSize && file.size > 0;
      
      return isValidType && isValidSize;
    });
    
    setFiles(prevFiles => {
      // Avoid duplicates by checking file names and sizes
      const existingFiles = new Set(
        prevFiles.map(f => `${f.name}-${f.size}`)
      );
      
      const uniqueNewFiles = validFiles.filter(
        file => !existingFiles.has(`${file.name}-${file.size}`)
      );
      
      // Limit total files
      const totalFiles = [...prevFiles, ...uniqueNewFiles];
      return totalFiles.slice(0, maxFiles);
    });
  }, [options]);

  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone entirely
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  return {
    files,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};