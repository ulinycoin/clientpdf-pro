import React, { memo } from 'react';
import { ProgressBarProps } from '../../types';

const ProgressBar: React.FC<ProgressBarProps> = memo(({
  progress,
  value, // Allow both progress and value props
  size = 'md',
  color = 'blue',
  showPercentage = true,
  className = '',
  label,
  animated = false
}: ProgressBarProps) => {
  // Use value if provided, otherwise progress, default to 0
  const actualProgress = value ?? progress ?? 0;

  // Ограничиваем прогресс между 0 и 100
  const normalizedProgress = Math.min(Math.max(actualProgress, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  } as const;

  // Улучшенные градиенты для лучшего визуального эффекта
  const colorClasses: Record<string, string> = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
  };

  const backgroundColorClasses: Record<string, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    purple: 'bg-purple-50',
    indigo: 'bg-indigo-50'
  };

  // Fallback to blue if color not found
  const safeColor = (color && colorClasses[color]) ? color : 'blue';

  // Определяем цвет текста в зависимости от прогресса
  const getProgressColor = () => {
    if (normalizedProgress < 30) return 'text-red-600';
    if (normalizedProgress < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 truncate pr-2">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`text-sm font-semibold ${getProgressColor()} min-w-[3rem] text-right`}>
              {Math.round(normalizedProgress)}%
            </span>
          )}
        </div>
      )}

      <div className={`
        w-full ${backgroundColorClasses[safeColor]}
        rounded-full overflow-hidden ${sizeClasses[size]}
        shadow-inner border border-gray-100
      `}>
        <div
          className={`
            ${colorClasses[safeColor]} ${sizeClasses[size]}
            rounded-full transition-all duration-500 ease-out
            ${animated ? 'animate-pulse shadow-lg' : ''}
            ${normalizedProgress > 0 ? 'shadow-sm' : ''}
          `}
          style={{
            width: `${normalizedProgress}%`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Световой эффект для активной полосы */}
          {normalizedProgress > 0 && (
            <div className="h-full w-full bg-white opacity-20 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Дополнительная информация для длительных операций */}
      {animated && normalizedProgress > 0 && normalizedProgress < 100 && (
        <div className="mt-1">
          <div className="flex items-center text-xs text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
            Обработка файла...
          </div>
        </div>
      )}
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
