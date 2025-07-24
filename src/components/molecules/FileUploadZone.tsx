import React, { useRef, useState } from 'react';
import { FileUploadZoneProps } from '../../types';
import Button from '../atoms/Button';
import { Upload, Shield, Zap, FileText } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

const FileUploadZone: React.FC<FileUploadZoneProps> = (props) => {
  const {
    onFilesSelected,
    onFileUpload, // Legacy alias
    accept = 'application/pdf',
    acceptedTypes = ['application/pdf'],
    multiple = true,
    maxFiles = 10,
    maxSize = 50 * 1024 * 1024, // 50MB
    disabled = false,
    className = '',
    children
  } = props;
  
  const { t } = useI18n();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use onFilesSelected if available, otherwise fall back to onFileUpload
  const handleFilesSelected = onFilesSelected || onFileUpload;

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFiles = (fileArray: File[]) => {
    const validFiles = fileArray.filter(file => {
      return acceptedTypes.some(type => {
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
    });

    if (validFiles.length !== fileArray.length) {
      const invalidCount = fileArray.length - validFiles.length;
      alert(t('components.fileUploadZone.alerts.unsupportedFiles', { 
        count: invalidCount.toString(), 
        formats: acceptedTypes.join(', ') 
      }));
    }

    if (validFiles.length > 0) {
      const limitedFiles = validFiles.slice(0, maxFiles);
      if (limitedFiles.length !== validFiles.length) {
        alert(t('components.fileUploadZone.alerts.fileLimit', { 
          count: maxFiles.toString() 
        }));
      }
      return limitedFiles;
    }
    return [];
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        handleFilesSelected?.(validFiles);
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
        handleFilesSelected?.(validFiles);
      }
    }
  };

  const acceptAttribute = acceptedTypes.join(',');

  const formatMaxSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)}MB`;
  };

  return (
    <div className={className}>
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
        aria-label={t('components.fileUploadZone.accessibility.uploadArea')}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 min-h-[48px] touch-manipulation
          pdf-processing-card backdrop-blur-sm
          ${isDragActive 
            ? 'border-primary-400 bg-primary-50/50 file-upload-active' 
            : 'border-secondary-300 hover:border-primary-400'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-primary-50/30 hover:scale-[1.01] hover:shadow-soft'
          }
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        `}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttribute}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="file-upload-input"
          name="file-upload"
          aria-label={t('components.fileUploadZone.accessibility.selectFiles')}
          title={t('components.fileUploadZone.accessibility.selectFiles')}
        />

        {/* Content */}
        {children ? (
          children
        ) : (
          <>
            {/* Upload Icon with animation */}
            <div className="mb-6">
              <div className={`
                w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 
                flex items-center justify-center text-white text-2xl
                transform transition-all duration-200
                ${isDragActive ? 'scale-110 animate-bounce' : 'group-hover:scale-105'}
                shadow-soft hover:shadow-glow
              `}>
                {isDragActive ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
            </div>

            {/* Main Text */}
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {isDragActive ? t('components.fileUploadZone.dropActive') : t('components.fileUploadZone.chooseFiles')}
            </h3>

            {/* Subtitle */}
            <p className="text-secondary-600 mb-6 text-sm leading-relaxed">
              {t('components.fileUploadZone.dragAndDrop')}<br />
              <span className="text-xs">{t('components.fileUploadZone.maxFileSize', { size: formatMaxSize(maxSize) })}</span>
            </p>

            {/* Action Button */}
            <Button
              variant="primary"
              size="lg"
              disabled={disabled}
              onClick={(e) => {
                e?.stopPropagation();
                handleClick();
              }}
              aria-label={t('components.fileUploadZone.accessibility.selectFiles')}
              title={t('components.fileUploadZone.accessibility.selectFiles')}
              className="mb-6"
            >
              {t('components.fileUploadZone.selectFiles')}
            </Button>
          </>
        )}

        {/* Trust-First Features */}
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-success-600">
            <Shield className="w-4 h-4" />
            <span className="font-medium">{t('components.fileUploadZone.trustFeatures.private')}</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-600">
            <Zap className="w-4 h-4" />
            <span className="font-medium">{t('components.fileUploadZone.trustFeatures.fast')}</span>
          </div>
          <div className="flex items-center space-x-2 text-secondary-600">
            <span className="text-base">💯</span>
            <span className="font-medium">{t('components.fileUploadZone.trustFeatures.free')}</span>
          </div>
        </div>
      </div>

      {/* Trust Message */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-lg border border-success-200">
          <Shield className="w-4 h-4 text-success-600" />
          <p className="text-xs text-success-700 font-medium">
            {t('components.fileUploadZone.trustMessage')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;
