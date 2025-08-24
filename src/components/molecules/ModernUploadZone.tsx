import React, { useRef, useState } from 'react';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface ModernUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  title: string;
  subtitle: string;
  supportedFormats?: string;
  icon?: string;
}

const ModernUploadZone: React.FC<ModernUploadZoneProps> = ({
  onFilesSelected,
  accept = 'application/pdf',
  acceptedTypes = ['application/pdf'],
  multiple = false,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
  title,
  subtitle,
  supportedFormats = 'PDF files up to 100MB each',
  icon = '📄'
}) => {
  const { shouldAnimate } = useMotionPreferences();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFiles = (fileArray: File[]): File[] => {
    const validFiles = fileArray.filter(file => {
      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          return fileExtension === type.toLowerCase();
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      });

      // Check file size
      const isValidSize = file.size <= maxSize;
      
      return isValidType && isValidSize;
    });

    return validFiles.slice(0, maxFiles);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      event.target.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const formatMaxSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}МБ`;
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`
        relative group cursor-pointer transition-all duration-300
        bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg 
        border-2 border-dashed rounded-3xl p-12 text-center
        ${isDragActive 
          ? 'border-seafoam-400 bg-seafoam-50/50 dark:bg-seafoam-900/20 scale-[1.02] shadow-xl' 
          : 'border-privacy-300 dark:border-privacy-600 hover:border-seafoam-400 dark:hover:border-seafoam-500'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-xl hover:scale-[1.01]'
        }
        ${shouldAnimate ? 'transform-gpu' : ''}
        focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:border-seafoam-500
      `}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id="modern-file-upload"
        name="file-upload"
        aria-label="Выбрать файлы для загрузки"
      />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-seafoam-200/10 to-ocean-200/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-privacy-200/10 to-seafoam-200/10 rounded-full blur-lg"></div>
        
        {shouldAnimate && !disabled && (
          <>
            <div className="absolute w-1 h-1 bg-seafoam-400/20 rounded-full gentle-float" style={{left: '20%', top: '20%', animationDelay: '0s'}}></div>
            <div className="absolute w-1 h-1 bg-ocean-400/20 rounded-full gentle-float" style={{left: '80%', top: '30%', animationDelay: '1s'}}></div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon with animation */}
        <div className="mb-8">
          <div className={`
            w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-lg
            bg-gradient-to-br from-seafoam-500 to-ocean-500 text-white
            transform transition-all duration-300
            ${isDragActive ? 'scale-110 shadow-2xl' : 'group-hover:scale-105'}
            ${shouldAnimate ? 'celebration-bounce' : ''}
          `}>
            {isDragActive ? '🎯' : icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-black dark:text-white mb-4">
          {isDragActive ? 'Отпустите файлы здесь' : title}
        </h3>

        {/* Subtitle */}
        <p className="text-gray-800 dark:text-gray-100 font-medium mb-8 text-lg leading-relaxed">
          {subtitle}
        </p>

        {/* CTA Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`
            btn-privacy-modern text-lg px-8 py-4 mb-8 
            ${shouldAnimate ? 'ripple-effect btn-press' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isDragActive ? 'Загрузить файлы' : 'Выбрать файлы'}
        </button>

        {/* Supported formats */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-6">
          {supportedFormats}
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <div className={`w-2 h-2 rounded-full bg-success-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              100% Приватно
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-seafoam-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Мгновенная обработка
            </span>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-seafoam-500/10 dark:bg-seafoam-400/10 rounded-3xl flex items-center justify-center">
          <div className="text-seafoam-600 dark:text-seafoam-400 text-6xl animate-bounce">
            ⬇
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernUploadZone;