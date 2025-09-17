import React, { useState, useEffect } from 'react';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { useTranslation } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

const UpdateNotification: React.FC = () => {
  const { t } = useTranslation();
  const { shouldAnimate } = useMotionPreferences();
  const { updateAvailable, isWaitingForUpdate, skipWaiting, updateSW } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable && isWaitingForUpdate) {
      setIsVisible(true);
    }
  }, [updateAvailable, isWaitingForUpdate]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateSW();
      skipWaiting();
    } catch (error) {
      console.error('[UpdateNotification] Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
        border border-seafoam-200/50 dark:border-seafoam-400/30
        rounded-2xl shadow-xl
        transform transition-all duration-300 ease-out
        ${shouldAnimate ? 'animate-slide-up' : ''}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      role="dialog"
      aria-labelledby="update-title"
      aria-describedby="update-description"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-seafoam-400/20 to-ocean-400/20 rounded-2xl blur-sm opacity-60"></div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Update icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white">
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V2.21C12 1.76 11.62 1.5 11.23 1.73L9.12 3.34C8.89 3.5 8.89 3.85 9.12 4.01L11.23 5.62C11.62 5.85 12 5.59 12 5.14V4C15.87 4.14 19 7.35 19 11.24C19 15.22 15.86 18.4 12 18.4C8.14 18.4 5 15.22 5 11.24C5 9.27 5.81 7.47 7.14 6.14C7.39 5.89 7.39 5.46 7.14 5.21L5.86 3.93C5.61 3.68 5.18 3.68 4.93 3.93C3.22 5.64 2.25 7.92 2.25 10.5C2.25 16.78 7.46 22 13.75 22C20.04 22 25.25 16.78 25.25 10.5C25.25 4.22 20.04 -1 13.75 -1C12.89 -1 12.06 -0.87 11.27 -0.63L12 4Z" />
                </svg>
              )}
            </div>
            
            <div>
              <h3 id="update-title" className="font-bold text-black dark:text-white">
                {t('updateNotification.title')}
              </h3>
              <p id="update-description" className="text-sm text-gray-600 dark:text-gray-400">
                {isUpdating 
                  ? t('updateNotification.updating')
                  : t('updateNotification.description')
                }
              </p>
            </div>
          </div>
          
          {/* Close button */}
          {!isUpdating && (
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={t('updateNotification.dismiss')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`
              flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200
              ${isUpdating
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              }
            `}
            aria-describedby="update-description"
          >
            {isUpdating 
              ? t('updateNotification.updating')
              : t('updateNotification.updateButton')
            }
          </button>
          
          {!isUpdating && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              {t('updateNotification.laterButton')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Slide up animation keyframes
const styles = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('update-notification-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'update-notification-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default UpdateNotification;