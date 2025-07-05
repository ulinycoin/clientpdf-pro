import React from 'react';
import { useLocalizedText } from '../context/LocalizationProvider';

interface LocalizedProgressBarProps {
  progress: number; // 0-100
  status?: 'idle' | 'processing' | 'completed' | 'error';
  showPercentage?: boolean;
  showStatus?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  customStatusText?: string;
}

const LocalizedProgressBar: React.FC<LocalizedProgressBarProps> = ({
  progress,
  status = 'idle',
  showPercentage = true,
  showStatus = true,
  className = '',
  size = 'md',
  customStatusText
}) => {
  const { t } = useLocalizedText('common');

  const getStatusText = () => {
    if (customStatusText) return customStatusText;
    
    switch (status) {
      case 'processing':
        return t('status.processing');
      case 'completed':
        return t('status.completed');
      case 'error':
        return t('status.failed');
      default:
        return t('status.ready');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {(showStatus || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showStatus && (
            <span className={`text-sm font-medium ${
              status === 'error' ? 'text-red-600' : 'text-gray-700'
            }`}>
              {getStatusText()}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${getSizeClasses()}`}>
        <div
          className={`${getSizeClasses()} rounded-full transition-all duration-300 ease-out ${getStatusColor()}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Optional inner glow effect */}
          {status === 'processing' && (
            <div className="h-full w-full bg-white opacity-20 rounded-full animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Additional status indicator */}
      {status === 'processing' && (
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {t('status.processing')}
        </div>
      )}
      
      {status === 'completed' && (
        <div className="flex items-center mt-2 text-xs text-green-600">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {t('status.completed')}
        </div>
      )}
      
      {status === 'error' && (
        <div className="flex items-center mt-2 text-xs text-red-600">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {t('status.failed')}
        </div>
      )}
    </div>
  );
};

export default LocalizedProgressBar;