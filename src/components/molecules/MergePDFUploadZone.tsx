import React, { useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import { useI18n } from '../../hooks/useI18n';

interface MergePDFUploadZoneProps {
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
}

const MergePDFUploadZone: React.FC<MergePDFUploadZoneProps> = ({
  onFilesSelected,
  accept = 'application/pdf',
  acceptedTypes = ['application/pdf'],
  multiple = false,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
  title,
  subtitle,
  supportedFormats = 'PDF files up to 100MB each'
}) => {
  const { shouldAnimate } = useMotionPreferences();
  const { t } = useI18n();
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

  return (
    <div
      id="merge-upload-zone"
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
        group relative overflow-hidden rounded-3xl cursor-pointer
        bg-white/10 dark:bg-white/5 backdrop-blur-xl
        border border-white/20 dark:border-white/10
        ${shouldAnimate ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/20 dark:hover:bg-white/10' : ''}
        ${shouldAnimate ? 'hover:-translate-y-1' : ''}
        shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-500/20
        min-h-[400px]
        ${isDragActive ? 'scale-[1.02] shadow-2xl bg-white/20 dark:bg-white/10' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
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
        id="merge-pdf-file-upload"
        name="file-upload"
        aria-label={t('components.modernUploadZone.accessibility.selectFiles')}
      />

      {/* Glassmorphism Background with Color Accent - same as MergePDF card */}
      <div className="absolute inset-0">
        {/* Blue gradient like MergePDF card */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10" />

        {/* Glass surface */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/2" />

        {/* Floating glass elements */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 dark:bg-white/5 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 dark:bg-white/3 rounded-full blur-lg" />

        {shouldAnimate && !disabled && (
          <>
            <div className="absolute w-1 h-1 bg-blue-400/20 rounded-full gentle-float" style={{left: '20%', top: '20%', animationDelay: '0s'}}></div>
            <div className="absolute w-1 h-1 bg-blue-500/20 rounded-full gentle-float" style={{left: '80%', top: '30%', animationDelay: '1s'}}></div>
          </>
        )}
      </div>

      {/* AI Recommendations Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
          <span className="text-xs">🤖</span>
          <span>AI Recommendations</span>
        </div>
      </div>

      {/* Content - styled like XL MergePDF card */}
      <div className="relative z-10 h-full flex flex-col p-12 justify-center">
        {/* Icon - same as MergePDF card */}
        <div className="mb-8 flex items-center justify-center">
          <div className={`
            w-24 h-24
            flex items-center justify-center
            bg-white/30 dark:bg-white/20 backdrop-blur-md rounded-2xl
            border border-white/30 dark:border-white/20
            shadow-lg shadow-black/10
            ${shouldAnimate ? 'group-hover:scale-110 group-hover:bg-white/40 group-hover:shadow-xl transition-all duration-300' : ''}
            ${isDragActive ? 'scale-110 bg-white/40 shadow-xl' : ''}
          `}>
            {isDragActive ? (
              <svg className="w-12 h-12 text-white animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 16L16 12H13V4H11V12H8L12 16Z"/>
              </svg>
            ) : (
              <FileText className="w-12 h-12 text-white drop-shadow-lg" />
            )}
          </div>
        </div>

        {/* Title and Description - same style as MergePDF card */}
        <div className="text-center space-y-3">
          <h3 className={`
            text-3xl font-bold text-gray-800 dark:text-white drop-shadow-lg
            ${shouldAnimate ? 'group-hover:scale-105 transition-transform duration-300' : ''}
          `}>
            {isDragActive ? t('components.modernUploadZone.dropActive') : title}
          </h3>

          <p className="text-gray-700 dark:text-white/90 leading-relaxed drop-shadow-md mx-auto text-base max-w-sm">
            {subtitle}
          </p>
        </div>


        {/* Supported formats */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-6 mt-6 text-center">
          {supportedFormats}
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <div className={`w-2 h-2 rounded-full bg-success-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('components.modernUploadZone.private')}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('components.modernUploadZone.instantProcessing')}
            </span>
          </div>
        </div>

        {/* Hover Arrow - same as MergePDF card */}
        <div className={`
          absolute bottom-4 right-4
          w-8 h-8 flex items-center justify-center
          bg-white/30 dark:bg-white/20 backdrop-blur-md rounded-full
          border border-white/30 dark:border-white/20
          shadow-lg shadow-black/10
          ${shouldAnimate ? 'transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-white/40 transition-all duration-300' : ''}
        `}>
          <svg
            className="w-4 h-4 text-gray-700 dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MergePDFUploadZone;