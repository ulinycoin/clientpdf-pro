interface ProgressBarProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
  className?: string
  label?: string
}

const ProgressBar = ({
  progress,
  size = 'md',
  color = 'blue',
  showPercentage = true,
  className = '',
  label
}: ProgressBarProps) => {
  // Ограничиваем прогресс между 0 и 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  const backgroundColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100'
  }

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
      
      <div className={`w-full ${backgroundColorClasses[color]} rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar