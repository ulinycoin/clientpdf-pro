import React, { useEffect, useState } from 'react';

export interface LocalProcessingIndicatorProps {
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDevice?: boolean;
  message?: string;
  estimatedTime?: number;
  className?: string;
}

const LocalProcessingIndicator: React.FC<LocalProcessingIndicatorProps> = ({
  progress,
  status,
  size = 'md',
  showDevice = true,
  message,
  estimatedTime,
  className = ''
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Pulse effect for processing state
  useEffect(() => {
    if (status === 'processing') {
      setPulseActive(true);
      const interval = setInterval(() => {
        setPulseActive(prev => !prev);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setPulseActive(false);
    }
  }, [status]);

  const sizeConfig = {
    sm: { 
      container: 'w-16 h-16', 
      icon: 'w-6 h-6',
      stroke: 2,
      text: 'text-xs'
    },
    md: { 
      container: 'w-24 h-24', 
      icon: 'w-8 h-8',
      stroke: 3,
      text: 'text-sm'
    },
    lg: { 
      container: 'w-32 h-32', 
      icon: 'w-10 h-10',
      stroke: 4,
      text: 'text-base'
    },
    xl: { 
      container: 'w-40 h-40', 
      icon: 'w-12 h-12',
      stroke: 5,
      text: 'text-lg'
    }
  };

  const config = sizeConfig[size];
  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : size === 'lg' ? 58 : 74;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'var(--color-seafoam-green)';
      case 'completed':
        return 'var(--color-success-action)';
      case 'error':
        return 'var(--color-error)';
      default:
        return 'var(--color-privacy-accent)';
    }
  };

  const getDeviceIcon = () => {
    if (!showDevice) return null;
    
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${pulseActive ? 'animate-pulse' : ''}`}>
        <div className={`${config.icon} flex items-center justify-center`}>
          {/* Device/Processor Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-full h-full"
            style={{ color: getStatusColor() }}
          >
            <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={config.stroke} />
            <rect x="9" y="9" width="6" height="6" strokeWidth={config.stroke} />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeWidth={config.stroke} />
            {status === 'processing' && (
              <>
                {/* Animated processing dots */}
                <circle cx="7" cy="7" r="0.5" fill="currentColor">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s" />
                </circle>
                <circle cx="12" cy="7" r="0.5" fill="currentColor">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                </circle>
                <circle cx="17" cy="7" r="0.5" fill="currentColor">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s" />
                </circle>
              </>
            )}
          </svg>
        </div>
      </div>
    );
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'processing':
        return `Обрабатывается локально${estimatedTime ? ` · ${estimatedTime}с` : ''}`;
      case 'completed':
        return 'Готово! Данные не покидали устройство';
      case 'error':
        return 'Ошибка обработки';
      default:
        return 'Готово к локальной обработке';
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Circular Progress Ring */}
      <div className={`relative ${config.container}`}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius * 100 / (size === 'sm' ? 64 : size === 'md' ? 96 : size === 'lg' ? 128 : 160)}
            stroke="var(--color-privacy-subtle)"
            strokeWidth={config.stroke}
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius * 100 / (size === 'sm' ? 64 : size === 'md' ? 96 : size === 'lg' ? 128 : 160)}
            stroke={getStatusColor()}
            strokeWidth={config.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: pulseActive ? 'drop-shadow(0 0 8px currentColor)' : 'none',
            }}
          />
        </svg>
        
        {/* Device Icon */}
        {getDeviceIcon()}
        
        {/* Progress Percentage */}
        {status !== 'idle' && (
          <div className={`absolute inset-0 flex items-end justify-center pb-1 ${config.text} font-medium`}
               style={{ color: getStatusColor() }}>
            {status === 'completed' ? '✓' : `${Math.round(displayProgress)}%`}
          </div>
        )}
      </div>

      {/* Status Message */}
      <div className={`text-center ${config.text} text-privacy-600 dark:text-privacy-300 max-w-xs`}>
        <div className="font-medium">{getStatusMessage()}</div>
        
        {/* Privacy Indicator */}
        {status === 'processing' && (
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-privacy-500">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1M12,7C10.89,7 10,7.89 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9C14,7.89 13.1,7 12,7Z" />
            </svg>
            <span>Приватно на устройстве</span>
          </div>
        )}
      </div>

      {/* Local vs Cloud Comparison (when processing) */}
      {status === 'processing' && estimatedTime && (
        <div className="text-xs text-privacy-500 text-center space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-seafoam-600">📱 Локально: {estimatedTime}с</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 line-through">☁️ Облако: {estimatedTime * 15}с</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalProcessingIndicator;