import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, Share2, RotateCcw, X } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import Button from '../atoms/Button';

interface SuccessNotificationProps {
  title: string;
  message: string;
  downloadUrl?: string;
  downloadFilename?: string;
  onDownload?: () => void;
  onClose?: () => void;
  onReset?: () => void;
  showShare?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
  fileSize?: string;
  processingTime?: string;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  title,
  message,
  downloadUrl,
  downloadFilename,
  onDownload,
  onClose,
  onReset,
  showShare = false,
  autoHide = false,
  autoHideDelay = 5000,
  className = '',
  fileSize,
  processingTime
}) => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Delay for animation
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  const handleShare = async () => {
    if (downloadUrl && navigator.share) {
      try {
        await navigator.share({
          title: downloadFilename || title,
          text: message,
          url: downloadUrl,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(downloadUrl);
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`
      animate-slideIn pdf-processing-card rounded-xl border-l-4 border-green-500 p-6
      bg-gradient-to-r from-green-50 to-emerald-50 ${className}
    `}>
      <div className="flex items-start space-x-4">
        {/* Success Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600 animate-scaleIn" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                {title}
              </h3>
              <p className="text-green-700 text-sm mb-3">
                {message}
              </p>
              
              {/* File Details */}
              {(fileSize || processingTime) && (
                <div className="flex items-center space-x-4 text-xs text-green-600 mb-4">
                  {fileSize && (
                    <span className="flex items-center space-x-1">
                      <span>📄</span>
                      <span>{fileSize}</span>
                    </span>
                  )}
                  {processingTime && (
                    <span className="flex items-center space-x-1">
                      <span>⏱️</span>
                      <span>{processingTime}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-green-600 hover:text-green-800 -mt-2 -mr-2"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Download Button */}
            {(onDownload || downloadUrl) && (
              <Button
                variant="primary"
                size="sm"
                onClick={onDownload}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('common.download')}
              </Button>
            )}

            {/* Share Button */}
            {showShare && downloadUrl && navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('common.share')}
              </Button>
            )}

            {/* Reset/New File Button */}
            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-green-600 hover:bg-green-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('common.processAnother')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar Animation */}
      {autoHide && (
        <div className="mt-4">
          <div className="w-full bg-green-200 rounded-full h-1">
            <div
              className="bg-green-600 h-1 rounded-full transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${autoHideDelay}ms linear forwards`
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SuccessNotification;