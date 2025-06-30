import { useState, useCallback } from 'react';
import { UseFileUploadResult } from '../types';

export const useFileUpload = (): UseFileUploadResult => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    // Filter only PDF files
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    setFiles(prevFiles => {
      // Avoid duplicates by checking file names and sizes
      const existingFiles = new Set(
        prevFiles.map(f => `${f.name}-${f.size}`)
      );
      
      const uniqueNewFiles = pdfFiles.filter(
        file => !existingFiles.has(`${file.name}-${file.size}`)
      );
      
      return [...prevFiles, ...uniqueNewFiles];
    });
  }, []);

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