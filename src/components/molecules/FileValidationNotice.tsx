import React from 'react';
import { AlertCircle, FileX, CheckCircle, Info } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface FileValidationNoticeProps {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  details?: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  className?: string;
}

const FileValidationNotice: React.FC<FileValidationNoticeProps> = ({
  type,
  title,
  message,
  details,
  onDismiss,
  showIcon = true,
  className = ''
}) => {
  const { t } = useI18n();

  const typeStyles = {
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-600',
      iconComponent: AlertCircle
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-600',
      iconComponent: FileX
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-600',
      iconComponent: Info
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-600',
      iconComponent: CheckCircle
    }
  };

  const currentStyle = typeStyles[type];
  const IconComponent = currentStyle.iconComponent;

  return (
    <div className={`
      rounded-xl border p-4 ${currentStyle.container} ${className}
      animate-slideIn transform transition-all duration-300
    `}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className={`flex-shrink-0 ${currentStyle.icon}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {title}
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            {message}
          </p>
          {details && (
            <p className="text-xs mt-2 opacity-75 font-medium">
              {details}
            </p>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`
              flex-shrink-0 p-1 rounded-lg transition-colors
              ${currentStyle.icon} hover:bg-white/50
            `}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default FileValidationNotice;