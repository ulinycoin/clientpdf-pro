import React, { ReactNode } from 'react';
import { useTranslation } from '../../hooks/useI18n';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

interface ToolContainerProps {
  title: string;
  description?: string;
  files: File[];
  onClose: () => void;
  children: ReactNode;
  
  // Processing state
  isProcessing?: boolean;
  progress?: number;
  progressMessage?: string;
  
  // Error handling
  error?: string | null;
  onErrorDismiss?: () => void;
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  
  // Configuration
  showFileList?: boolean;
  showProgress?: boolean;
  showActions?: boolean;
  className?: string;
}

export const ToolContainer: React.FC<ToolContainerProps> = ({
  title,
  description,
  files,
  onClose,
  children,
  isProcessing = false,
  progress = 0,
  progressMessage = '',
  error = null,
  onErrorDismiss,
  primaryAction,
  secondaryAction,
  showFileList = true,
  showProgress = true,
  showActions = true,
  className = ''
}) => {
  const { t } = useTranslation();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={`glass rounded-2xl shadow-soft border border-white/20 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            <span className="text-gradient-blue">{title}</span>
          </h2>
          {description && (
            <p className="text-secondary-600">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isProcessing}
          className="text-secondary-500 hover:text-secondary-700"
        >
          ✕
        </Button>
      </div>

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center mr-2">
              📁
            </span>
            {t('common.files')} ({files.length})
          </h3>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 pdf-processing-card rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
                    <span className="text-error-600 text-lg">📄</span>
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{file.name}</p>
                    <p className="text-sm text-secondary-500">
                      {formatFileSize(file.size)} • PDF {t('common.file')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                  <span className="text-xs text-success-600">{t('common.ready')}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 pdf-processing-card border-l-4 border-primary-500 rounded-xl">
            <p className="text-sm text-primary-700">
              📊 {t('common.size')}: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))} • 
              {files.length} {files.length === 1 ? t('common.file') : t('common.files')}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mb-6">
        {children}
      </div>

      {/* Progress */}
      {showProgress && isProcessing && (
        <div className="mb-6">
          <ProgressBar
            value={progress}
            className="mb-3"
            animated={true}
          />
          <p className="text-sm text-secondary-600 text-center">
            {progressMessage || t('common.processing')}...
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 pdf-processing-card border-l-4 border-error-500 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-error-600">⚠️</span>
              </div>
              <div>
                <h4 className="text-error-800 font-semibold mb-1">
                  {t('common.error')}
                </h4>
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            </div>
            {onErrorDismiss && (
              <button
                onClick={onErrorDismiss}
                className="text-error-400 hover:text-error-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (primaryAction || secondaryAction) && (
        <div className="flex justify-end space-x-3">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              disabled={isProcessing || secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="primary"
              onClick={primaryAction.onClick}
              disabled={isProcessing || primaryAction.disabled}
              loading={primaryAction.loading || isProcessing}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-center space-x-6 text-xs text-secondary-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-success-500 rounded-full"></span>
            <span>Your files never leave your device</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolContainer;