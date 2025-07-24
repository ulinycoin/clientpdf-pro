import React from 'react';
import { ProgressBarProps } from '../../types';

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  value, // Allow both progress and value props
  size = 'md',
  color = 'blue',
  showPercentage = true,
  className = '',
  label,
  animated = false // Add animated support
}: ProgressBarProps) => {
  // Use value if provided, otherwise progress, default to 0
  const actualProgress = value ?? progress ?? 0;

  // Ограничиваем прогресс между 0 и 100
  const normalizedProgress = Math.min(Math.max(actualProgress, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  const backgroundColorClasses: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100'
  }

  // Fallback to blue if color not found
  const safeColor = (color && colorClasses[color]) ? color : 'blue';

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(normalizedProgress)}%</span>
          )}
        </div>
      )}

      <div className={`w-full ${backgroundColorClasses[safeColor]} rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[safeColor]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
