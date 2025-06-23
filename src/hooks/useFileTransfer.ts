/**
 * Hook for managing file transfer between pages using sessionStorage
 * Provides functionality to store and retrieve pending files for processing
 */

import { useState, useEffect, useCallback } from 'react';

interface PendingFileData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface UsePendingFileResult {
  pendingFile: PendingFileData | null;
  clearPendingFile: () => void;
  setPendingFile: (file: File) => void;
  hasPendingFile: boolean;
}

const PENDING_FILE_KEY = 'pendingFile';

export const usePendingFile = (): UsePendingFileResult => {
  const [pendingFile, setPendingFileState] = useState<PendingFileData | null>(null);

  // Load pending file from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PENDING_FILE_KEY);
      if (stored) {
        const fileData = JSON.parse(stored) as PendingFileData;
        setPendingFileState(fileData);
      }
    } catch (error) {
      console.warn('Failed to load pending file from sessionStorage:', error);
      // Clear invalid data
      sessionStorage.removeItem(PENDING_FILE_KEY);
    }
  }, []);

  // Clear pending file from both state and storage
  const clearPendingFile = useCallback(() => {
    setPendingFileState(null);
    sessionStorage.removeItem(PENDING_FILE_KEY);
  }, []);

  // Set pending file and store in sessionStorage
  const setPendingFile = useCallback((file: File) => {
    const fileData: PendingFileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    try {
      sessionStorage.setItem(PENDING_FILE_KEY, JSON.stringify(fileData));
      setPendingFileState(fileData);
    } catch (error) {
      console.warn('Failed to store pending file in sessionStorage:', error);
      // Still update state even if storage fails
      setPendingFileState(fileData);
    }
  }, []);

  return {
    pendingFile,
    clearPendingFile,
    setPendingFile,
    hasPendingFile: pendingFile !== null,
  };
};

/**
 * Hook for managing quick actions based on file type
 */
export const useFileQuickActions = () => {
  const getQuickActionForFile = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
    const isCSV = ['csv', 'tsv', 'txt'].includes(extension || '');
    const isPDF = file.type === 'application/pdf';

    if (isImage) {
      return {
        action: 'Convert to PDF',
        route: '/images-to-pdf',
        icon: 'ImageIcon',
        description: 'Convert your image to PDF format'
      };
    }

    if (isCSV) {
      return {
        action: 'Convert to PDF',
        route: '/csv-to-pdf',
        icon: 'BarChart3',
        description: 'Transform your data into a PDF table'
      };
    }

    if (isPDF) {
      return {
        action: 'Edit PDF',
        route: '/merge-pdf',
        icon: 'Scissors',
        description: 'Merge, split, or compress your PDF'
      };
    }

    // Default action for unknown file types
    return {
      action: 'Process File',
      route: '/merge-pdf',
      icon: 'FileText',
      description: 'Process your file with our tools'
    };
  }, []);

  const getFileIcon = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
    const isCSV = ['csv', 'tsv', 'txt'].includes(extension || '');
    const isPDF = file.type === 'application/pdf';

    if (isPDF) return '📄';
    if (isImage) return '🖼️';
    if (isCSV) return '📊';
    return '📄';
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  return {
    getQuickActionForFile,
    getFileIcon,
    formatFileSize,
  };
};

/**
 * Hook for managing file upload suggestions and recommendations
 */
export const useFileRecommendations = () => {
  const getRecommendationsForFiles = useCallback((files: File[]) => {
    const fileTypes = files.map(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
      const isCSV = ['csv', 'tsv', 'txt'].includes(extension || '');
      const isPDF = file.type === 'application/pdf';

      return { file, isPDF, isImage, isCSV, extension };
    });

    const recommendations = [];

    // Check for multiple PDFs
    const pdfFiles = fileTypes.filter(f => f.isPDF);
    if (pdfFiles.length > 1) {
      recommendations.push({
        type: 'merge',
        title: 'Merge PDFs',
        description: `Combine your ${pdfFiles.length} PDF files into one document`,
        route: '/merge-pdf',
        priority: 1
      });
    }

    // Check for multiple images
    const imageFiles = fileTypes.filter(f => f.isImage);
    if (imageFiles.length > 1) {
      recommendations.push({
        type: 'images-to-pdf',
        title: 'Create PDF from Images',
        description: `Convert your ${imageFiles.length} images into a single PDF`,
        route: '/images-to-pdf',
        priority: 2
      });
    }

    // Check for CSV files
    const csvFiles = fileTypes.filter(f => f.isCSV);
    if (csvFiles.length > 0) {
      recommendations.push({
        type: 'csv-to-pdf',
        title: 'Convert CSV to PDF',
        description: `Transform your data into professional PDF tables`,
        route: '/csv-to-pdf',
        priority: 3
      });
    }

    // Check for mixed file types
    const hasMultipleTypes = [
      pdfFiles.length > 0,
      imageFiles.length > 0,
      csvFiles.length > 0
    ].filter(Boolean).length > 1;

    if (hasMultipleTypes) {
      recommendations.push({
        type: 'workflow',
        title: 'Suggested Workflow',
        description: 'Process different file types separately for best results',
        route: '/',
        priority: 4
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }, []);

  return {
    getRecommendationsForFiles,
  };
};
