import React, { useCallback, useState } from 'react';
import { useLocalizedText } from '../context/LocalizationProvider';

interface LocalizedFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  className?: string;
  icon?: string;
  titleKey?: string;
  descriptionKey?: string;
}

const LocalizedFileUpload: React.FC<LocalizedFileUploadProps> = ({
  onFilesSelected,
  accept = '.pdf',
  multiple = false,
  maxSize = 100 * 1024 * 1024, // 100MB default
  className = '',
  icon = '📄',
  titleKey = 'messages.selectPdfFiles',
  descriptionKey = 'messages.dragDropFiles'
}) => {
  const { t } = useLocalizedText('common');
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      // Check file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(t('messages.invalidFileType'));
        continue;
      }
      
      // Check file size
      if (file.size > maxSize) {
        setError(t('messages.fileTooLarge'));
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  }, [maxSize, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);
    
    const files = validateFiles(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files) {
      const files = validateFiles(e.target.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected, validateFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="text-6xl">{icon}</div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t(titleKey)}
            </h3>
            <p className={`text-sm ${
              error ? 'text-red-600' : 'text-gray-600'
            }`}>
              {error || t(descriptionKey)}
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            {accept} • {multiple ? t('messages.multipleFiles', 'Multiple files') : t('messages.singleFile', 'Single file')} • 
            {t('messages.maxSize', 'Max')} {Math.round(maxSize / (1024 * 1024))}MB
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default LocalizedFileUpload;