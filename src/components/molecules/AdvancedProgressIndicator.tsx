import React, { useState, useEffect } from 'react';

export interface ProcessingMetrics {
  progress: number;
  speed: number; // files per second
  efficiency: number; // percentage
  timeRemaining: number; // seconds
  filesProcessed: number;
  totalFiles: number;
  throughput: string; // MB/s
  cpuUsage?: number;
  memoryUsage?: number;
}

export interface AdvancedProgressIndicatorProps {
  metrics: ProcessingMetrics;
  status: 'idle' | 'processing' | 'completed' | 'paused' | 'error';
  title?: string;
  variant?: 'minimal' | 'detailed' | 'dashboard';
  showRealTimeMetrics?: boolean;
  showPrivacyAssurance?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  className?: string;
}

const AdvancedProgressIndicator: React.FC<AdvancedProgressIndicatorProps> = ({
  metrics,
  status,
  title = 'Обработка файлов',
  variant = 'detailed',
  showRealTimeMetrics = true,
  showPrivacyAssurance = true,
  onPause,
  onResume,
  onCancel,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(metrics.progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [metrics.progress]);

  // Pulse effect for processing
  useEffect(() => {
    if (status === 'processing') {
      setPulseActive(true);
      const interval = setInterval(() => {
        setPulseActive(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
    setPulseActive(false);
  }, [status]);

  // Celebration effect on completion
  useEffect(() => {
    if (status === 'completed' && metrics.progress >= 100) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [status, metrics.progress]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}с`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}м ${remainingSeconds}с`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'var(--color-seafoam-green)';
      case 'completed': return 'var(--color-success-action)';
      case 'paused': return 'var(--color-warning)';
      case 'error': return 'var(--color-error)';
      default: return 'var(--color-privacy-accent)';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return `Обработка ${metrics.filesProcessed}/${metrics.totalFiles} файлов...`;
      case 'completed':
        return `Готово! Обработано ${metrics.totalFiles} файлов`;
      case 'paused':
        return 'Обработка приостановлена';
      case 'error':
        return 'Произошла ошибка при обработке';
      default:
        return 'Готово к обработке';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Simple circular progress */}
        <div className="relative w-8 h-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="16"
              fill="none"
              stroke="var(--color-privacy-subtle)"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="16"
              fill="none"
              stroke={getStatusColor()}
              strokeWidth="3"
              strokeDasharray={`${animatedProgress}, 100`}
              className="transition-all duration-500"
            />
          </svg>
          {status === 'completed' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-success-action" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-medium text-privacy-800 dark:text-privacy-200">
            {Math.round(animatedProgress)}%
          </div>
          <div className="text-xs text-gray-700 dark:text-privacy-400">
            {getStatusMessage()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`privacy-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-privacy-800 dark:text-privacy-200">
          {title}
        </h3>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          {status === 'processing' && onPause && (
            <button
              onClick={onPause}
              className="p-2 rounded-lg hover:bg-privacy-100 dark:hover:bg-privacy-800 transition-colors"
              aria-label="Pause processing"
            >
              <svg className="w-4 h-4 text-privacy-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              </svg>
            </button>
          )}
          
          {status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="p-2 rounded-lg hover:bg-privacy-100 dark:hover:bg-privacy-800 transition-colors"
              aria-label="Resume processing"
            >
              <svg className="w-4 h-4 text-privacy-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            </button>
          )}
          
          {onCancel && status !== 'completed' && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Cancel processing"
            >
              <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-privacy-700 dark:text-privacy-300">
            Прогресс
          </span>
          <span className="text-sm font-bold text-privacy-800 dark:text-privacy-200">
            {Math.round(animatedProgress)}%
          </span>
        </div>
        
        <div className="relative w-full h-3 bg-privacy-100 dark:bg-privacy-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              showCelebration ? 'celebration-bounce' : ''
            }`}
            style={{
              width: `${animatedProgress}%`,
              background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}dd)`,
              boxShadow: pulseActive ? `0 0 20px ${getStatusColor()}40` : 'none'
            }}
          />
          
          {/* Shimmer effect */}
          {status === 'processing' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-[shimmer_2s_infinite]" />
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-700 dark:text-privacy-400">
          {getStatusMessage()}
        </p>
        {metrics.timeRemaining > 0 && status === 'processing' && (
          <p className="text-xs text-privacy-500 mt-1">
            Осталось примерно {formatTime(metrics.timeRemaining)}
          </p>
        )}
      </div>

      {/* Real-time Metrics */}
      {showRealTimeMetrics && variant === 'detailed' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-seafoam-600 dark:text-seafoam-400">
              {metrics.speed.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">файлов/сек</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-ocean-600 dark:text-ocean-400">
              {metrics.throughput}
            </div>
            <div className="text-xs text-gray-600">МБ/сек</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-700 dark:text-privacy-400">
              {metrics.efficiency}%
            </div>
            <div className="text-xs text-gray-600">эффективность</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-success-600 dark:text-success-400">
              {metrics.filesProcessed}
            </div>
            <div className="text-xs text-gray-600">обработано</div>
          </div>
        </div>
      )}

      {/* Dashboard variant additional metrics */}
      {variant === 'dashboard' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {metrics.cpuUsage !== undefined && (
            <div className="privacy-card border border-privacy-200 dark:border-privacy-700">
              <div className="text-xs text-privacy-500 mb-1">Использование CPU</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-privacy-100 dark:bg-privacy-800 rounded">
                  <div 
                    className="h-full bg-gradient-to-r from-seafoam-500 to-ocean-500 rounded transition-all duration-300"
                    style={{ width: `${metrics.cpuUsage}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{metrics.cpuUsage}%</span>
              </div>
            </div>
          )}
          
          {metrics.memoryUsage !== undefined && (
            <div className="privacy-card border border-privacy-200 dark:border-privacy-700">
              <div className="text-xs text-privacy-500 mb-1">Память</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-privacy-100 dark:bg-privacy-800 rounded">
                  <div 
                    className="h-full bg-gradient-to-r from-privacy-500 to-seafoam-500 rounded transition-all duration-300"
                    style={{ width: `${metrics.memoryUsage}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{metrics.memoryUsage}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy Assurance */}
      {showPrivacyAssurance && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-privacy-50 dark:bg-privacy-900 rounded-lg text-sm">
          <svg className="w-4 h-4 text-privacy-accent local-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z" />
          </svg>
          <span className="text-privacy-700 dark:text-privacy-300">
            Обрабатывается приватно на вашем устройстве
          </span>
        </div>
      )}

      {/* Celebration Confetti */}
      {showCelebration && status === 'completed' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle absolute"
              style={{
                left: `${20 + (i % 4) * 20}%`,
                animationDelay: `${i * 0.1}s`,
                background: i % 3 === 0 ? 'var(--color-success-action)' : 
                           i % 3 === 1 ? 'var(--color-seafoam-green)' : 'var(--color-ocean-blue)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedProgressIndicator;