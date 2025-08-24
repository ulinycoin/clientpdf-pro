import React, { useCallback, useState, useRef } from 'react';

export interface PrivacyDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  title?: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

const PrivacyDropZone: React.FC<PrivacyDropZoneProps> = ({
  onFilesSelected,
  acceptedTypes = ['.pdf'],
  multiple = true,
  maxFiles = 10,
  maxFileSize = 50,
  title = 'Перетащите PDF файлы сюда',
  subtitle = 'или нажмите для выбора файлов',
  icon = 'pdf',
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { validFiles: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach(file => {
      // Check file type
      const isValidType = acceptedTypes.some(type => 
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      
      if (!isValidType) {
        newErrors.push(`${file.name}: неподдерживаемый тип файла`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        newErrors.push(`${file.name}: файл слишком большой (макс. ${maxFileSize}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Check max files limit
    if (validFiles.length > maxFiles) {
      newErrors.push(`Максимум ${maxFiles} файлов за раз`);
      return { validFiles: validFiles.slice(0, maxFiles), errors: newErrors };
    }

    return { validFiles, errors: newErrors };
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsProcessing(true);
    setErrors([]);

    const files = Array.from(e.dataTransfer.files);
    const { validFiles, errors: validationErrors } = validateFiles(files);

    setErrors(validationErrors);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
    
    setIsProcessing(false);
  }, [onFilesSelected, acceptedTypes, maxFiles, maxFileSize]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const { validFiles, errors: validationErrors } = validateFiles(files);

    setErrors(validationErrors);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFilesSelected, acceptedTypes, maxFiles, maxFileSize]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getIcon = () => {
    switch (icon) {
      case 'pdf':
        return (
          <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,6V18H19V6H5Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-seafoam-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          border-2 border-dashed rounded-2xl p-12
          min-h-[300px] flex flex-col items-center justify-center
          ${isDragOver
            ? 'border-seafoam-400 bg-seafoam-50 dark:bg-seafoam-900/20 scale-102'
            : 'border-privacy-300 dark:border-privacy-600 hover:border-seafoam-300 dark:hover:border-seafoam-600'
          }
          ${isProcessing ? 'pointer-events-none' : ''}
          bg-privacy-50/50 dark:bg-privacy-900/30
          backdrop-blur-sm
        `}
      >
        {/* Animated Background Pattern */}
        <div className={`absolute inset-0 opacity-5 transition-opacity duration-500 ${isDragOver ? 'opacity-10' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-seafoam-400 to-ocean-400"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-4">
          {/* Icon with Animation */}
          <div className={`transition-transform duration-300 ${isDragOver ? 'scale-110' : isProcessing ? 'animate-pulse' : ''}`}>
            {getIcon()}
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-privacy-800 dark:text-privacy-200">
              {isProcessing ? 'Подготовка файлов...' : title}
            </h3>
            
            <p className="text-privacy-600 dark:text-privacy-400">
              {isProcessing ? 'Файлы проверяются локально' : subtitle}
            </p>

            {/* File Format Info */}
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {acceptedTypes.map(type => (
                <span key={type} className="badge-ocean text-xs">
                  {type.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Limits Info */}
            <div className="text-xs text-privacy-500 space-y-1">
              <div>Максимум {maxFiles} файл{maxFiles > 1 ? 'ов' : ''} · До {maxFileSize}MB каждый</div>
            </div>
          </div>

          {/* Privacy Assurance */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-privacy-100 dark:bg-privacy-800 rounded-full text-sm">
            <svg className="w-4 h-4 text-privacy-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z" />
            </svg>
            <span className="text-privacy-700 dark:text-privacy-300">
              Файлы остаются на вашем устройстве
            </span>
          </div>

          {/* CTA Button */}
          <button 
            className={`btn-ocean-modern mt-4 ${isProcessing ? 'opacity-50' : ''}`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Обработка...' : 'Выбрать файлы'}
          </button>
        </div>

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-seafoam-500/10 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg font-semibold text-seafoam-700 dark:text-seafoam-300">
                Отпустите для загрузки
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
              </svg>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 p-3 bg-seafoam-50 dark:bg-seafoam-900/20 border border-seafoam-200 dark:border-seafoam-800 rounded-lg text-sm text-seafoam-700 dark:text-seafoam-300">
          <div className="w-4 h-4 border-2 border-seafoam-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Файлы обрабатываются локально на вашем устройстве...</span>
        </div>
      )}
    </div>
  );
};

export default PrivacyDropZone;