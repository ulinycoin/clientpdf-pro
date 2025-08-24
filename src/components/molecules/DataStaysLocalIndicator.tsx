import React, { useEffect, useState } from 'react';

export interface DataStaysLocalIndicatorProps {
  variant?: 'default' | 'compact' | 'hero';
  animated?: boolean;
  showComparison?: boolean;
  className?: string;
}

const DataStaysLocalIndicator: React.FC<DataStaysLocalIndicatorProps> = ({
  variant = 'default',
  animated = true,
  showComparison = false,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 3);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-3 text-sm';
      case 'hero':
        return 'p-8 text-lg';
      default:
        return 'p-6 text-base';
    }
  };

  const getDeviceAnimation = () => {
    if (!animated) return '';
    return currentStep === 0 ? 'scale-110' : currentStep === 1 ? 'scale-105' : 'scale-100';
  };

  const getDataFlowAnimation = () => {
    if (!animated) return 'opacity-60';
    return currentStep === 1 ? 'opacity-100' : 'opacity-60';
  };

  const getShieldAnimation = () => {
    if (!animated) return 'scale-100';
    return currentStep === 2 ? 'scale-110' : 'scale-100';
  };

  return (
    <div className={`privacy-card ${getVariantClasses()} ${className}`}>
      {/* Main Visual */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-20 mx-auto">
          {/* Device Container */}
          <div className={`absolute inset-x-0 bottom-0 w-20 h-12 mx-auto bg-privacy-100 dark:bg-privacy-800 rounded-lg border-2 border-privacy-300 dark:border-privacy-600 transition-transform duration-500 ${getDeviceAnimation()}`}>
            {/* Device Screen */}
            <div className="absolute inset-1 bg-seafoam-100 dark:bg-seafoam-900 rounded border border-seafoam-300 dark:border-seafoam-700">
              {/* Processing Animation */}
              <div className="absolute inset-2 flex items-center justify-center">
                <div className={`w-2 h-2 bg-seafoam-500 rounded-full transition-all duration-300 ${animated && currentStep === 1 ? 'animate-pulse' : ''}`}></div>
              </div>
            </div>
            
            {/* Device Base */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-privacy-300 dark:bg-privacy-600 rounded-full"></div>
          </div>

          {/* Data Flow Circles */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-seafoam-400 rounded-full transition-all duration-500 ${getDataFlowAnimation()}`}
              style={{
                left: '50%',
                top: `${30 + i * 15}%`,
                transform: `translateX(-50%) ${animated && currentStep === 1 ? 'scale(1.2)' : 'scale(1)'}`,
                animationDelay: `${i * 200}ms`
              }}
            >
              {animated && currentStep === 1 && (
                <div className="absolute inset-0 bg-seafoam-400 rounded-full animate-ping"></div>
              )}
            </div>
          ))}

          {/* Circular Boundary */}
          <div className="absolute inset-0 border-2 border-dashed border-privacy-accent rounded-full opacity-60">
            {/* Privacy Shield */}
            <div className={`absolute -top-2 -right-2 transition-transform duration-300 ${getShieldAnimation()}`}>
              <svg className="w-6 h-6 text-privacy-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1M12,7C10.89,7 10,7.89 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9C14,7.89 13.1,7 12,7Z" />
              </svg>
            </div>
          </div>

          {/* Crossed-out Cloud */}
          <div className="absolute -top-4 -left-8 opacity-60">
            <div className="relative">
              <svg className="w-8 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.5,20Q4.22,20 2.61,18.43Q1,16.85 1,14.58Q1,12.63 2.17,11.1Q3.35,9.57 5.25,9.15Q5.88,6.85 7.75,5.43Q9.63,4 12,4Q14.93,4 16.96,6.04Q19,8.07 19,11Q20.73,11.2 21.86,12.5Q23,13.78 23,15.5Q23,17.38 21.69,18.69Q20.38,20 18.5,20H6.5Z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-0.5 bg-red-500 transform rotate-45 origin-center"></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">Не в облако</div>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-privacy-800 dark:text-privacy-200">
          {variant === 'hero' ? 'Ваши данные остаются только у вас' : 'Локальная обработка'}
        </h3>
        
        <p className="text-privacy-600 dark:text-privacy-400 leading-relaxed">
          {variant === 'compact' 
            ? 'Файлы обрабатываются в браузере'
            : variant === 'hero'
            ? 'Все PDF операции выполняются прямо в вашем браузере. Никакие данные не загружаются на серверы или в облако.'
            : 'PDF файлы обрабатываются локально в вашем браузере. Данные никуда не отправляются.'
          }
        </p>

        {/* Features List */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <span className="badge-privacy">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z" />
            </svg>
            100% Приватно
          </span>
          
          <span className="badge-ocean">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
            </svg>
            Без загрузки
          </span>
          
          <span className="badge-privacy">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
            </svg>
            Мгновенно
          </span>
        </div>
      </div>

      {/* Speed Comparison */}
      {showComparison && (
        <div className="mt-4 p-3 bg-privacy-50 dark:bg-privacy-900 rounded-lg">
          <div className="text-xs font-medium text-privacy-700 dark:text-privacy-300 mb-2 text-center">
            Сравнение скорости обработки:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-seafoam-600 font-bold">📱 Локально</div>
              <div className="text-seafoam-500">2-5 секунд</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 line-through">☁️ Облако</div>
              <div className="text-gray-400 line-through">30-60 секунд</div>
            </div>
          </div>
          <div className="text-center mt-2">
            <div className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,12V6.75L9,5.43V11.91L3,12M20,3V11.75L10,11.9V5.21L20,3M3,13L9,13.09V19.9L3,18.75V13M20,13.25V22L10,20.09V13.1L20,13.25Z" />
              </svg>
              В 10-15 раз быстрее!
            </div>
          </div>
        </div>
      )}

      {/* Animation Steps Indicator */}
      {animated && variant !== 'compact' && (
        <div className="flex justify-center space-x-1 mt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                currentStep === i ? 'bg-privacy-accent' : 'bg-privacy-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DataStaysLocalIndicator;