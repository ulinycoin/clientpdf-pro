import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  variant?: 'default' | 'success' | 'error';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  message,
  variant = 'default',
  showPercentage = true,
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const variantStyles = {
    default: 'bg-ocean-500',
    success: 'bg-success-500',
    error: 'bg-error-500',
  };

  const containerStyles = {
    default: 'bg-ocean-100 dark:bg-ocean-900/20',
    success: 'bg-success-100 dark:bg-success-900/20',
    error: 'bg-error-100 dark:bg-error-900/20',
  };

  return (
    <div className="progress-bar w-full">
      {/* Progress bar container */}
      <div className={`relative h-3 rounded-full overflow-hidden ${containerStyles[variant]}`}>
        {/* Progress fill */}
        <div
          className={`h-full transition-all duration-300 ease-out ${variantStyles[variant]}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Progress info */}
      <div className="flex items-center justify-between mt-2">
        {/* Message */}
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}

        {/* Percentage */}
        {showPercentage && (
          <p className="text-sm font-medium text-gray-900 dark:text-white ml-auto">
            {Math.round(clampedProgress)}%
          </p>
        )}
      </div>
    </div>
  );
};
