import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'

interface PDFLoadingProgressProps {
  isLoading: boolean
  progress: number
  error?: string | null
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'detailed'
}

export const PDFLoadingProgress: React.FC<PDFLoadingProgressProps> = ({
  isLoading,
  progress,
  error,
  message = 'Loading PDF tools...',
  className,
  size = 'md',
  variant = 'default'
}) => {
  if (!isLoading && !error && progress === 0) {
    return null
  }
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const containerClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  
  const getProgressMessage = () => {
    if (error) return error
    if (progress === 100) return 'Ready!'
    if (progress >= 70) return 'Almost ready...'
    if (progress >= 50) return 'Loading PDF editor...'
    if (progress >= 30) return 'Loading PDF viewer...'
    if (progress > 0) return 'Initializing...'
    return message
  }
  
  const getProgressColor = () => {
    if (error) return 'bg-red-500'
    if (progress === 100) return 'bg-green-500'
    return 'bg-blue-500'
  }
  
  const getIcon = () => {
    if (error) return <AlertCircle className={clsx(iconSizes[size], 'text-red-500')} />
    if (progress === 100) return <CheckCircle2 className={clsx(iconSizes[size], 'text-green-500')} />
    return <Loader2 className={clsx(iconSizes[size], 'text-blue-500 animate-spin')} />
  }
  
  if (variant === 'minimal') {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        {getIcon()}
        <span className="text-sm text-gray-600">{getProgressMessage()}</span>
      </div>
    )
  }
  
  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={clsx(
          'bg-white border border-gray-200 rounded-lg shadow-sm',
          containerClasses[size],
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              PDF Tools Loading
            </h4>
            <p className="text-xs text-gray-500">
              {getProgressMessage()}
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">
            {progress}%
          </span>
        </div>
        
        <div className="relative">
          <div className={clsx(
            'w-full bg-gray-200 rounded-full overflow-hidden',
            sizeClasses[size]
          )}>
            <motion.div
              className={clsx(
                'h-full rounded-full transition-colors duration-300',
                getProgressColor()
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.5,
                ease: 'easeOut'
              }}
            />
          </div>
          
          {/* Shimmer effect */}
          {isLoading && progress < 100 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </div>
      </motion.div>
    )
  }
  
  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        'flex items-center gap-3 p-3 bg-gray-50 rounded-lg border',
        className
      )}
    >
      {getIcon()}
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700">
            {getProgressMessage()}
          </span>
          <span className="text-xs text-gray-500">
            {progress}%
          </span>
        </div>
        
        <div className={clsx(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <motion.div
            className={clsx(
              'h-full rounded-full',
              getProgressColor()
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Компонент для отображения статуса загрузки с автоскрытием
 */
interface PDFLoadingToastProps extends PDFLoadingProgressProps {
  autoHide?: boolean
  duration?: number
  onHide?: () => void
}

export const PDFLoadingToast: React.FC<PDFLoadingToastProps> = ({
  autoHide = true,
  duration = 3000,
  onHide,
  ...props
}) => {
  React.useEffect(() => {
    if (autoHide && props.progress === 100 && !props.error) {
      const timer = setTimeout(() => {
        onHide?.()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [autoHide, props.progress, props.error, duration, onHide])
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <PDFLoadingProgress
        {...props}
        variant="detailed"
        className="shadow-lg"
      />
    </motion.div>
  )
}

/**
 * Компонент полноэкранного загрузчика для критических операций
 */
interface PDFLoadingOverlayProps extends PDFLoadingProgressProps {
  title?: string
  description?: string
  allowCancel?: boolean
  onCancel?: () => void
}

export const PDFLoadingOverlay: React.FC<PDFLoadingOverlayProps> = ({
  title = 'Processing PDF',
  description = 'Please wait while we prepare your document...',
  allowCancel = false,
  onCancel,
  ...props
}) => {
  if (!props.isLoading && !props.error) {
    return null
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
        
        <PDFLoadingProgress
          {...props}
          variant="detailed"
          size="lg"
          className="mb-6"
        />
        
        {allowCancel && (
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * Компонент для inline загрузки в формах
 */
interface PDFLoadingInlineProps {
  isLoading: boolean
  progress: number
  error?: string | null
  successMessage?: string
}

export const PDFLoadingInline: React.FC<PDFLoadingInlineProps> = ({
  isLoading,
  progress,
  error,
  successMessage = 'PDF tools loaded successfully'
}) => {
  if (!isLoading && !error && progress !== 100) {
    return null
  }
  
  return (
    <div className="mt-2">
      {isLoading && (
        <PDFLoadingProgress
          isLoading={isLoading}
          progress={progress}
          error={error}
          variant="minimal"
          size="sm"
        />
      )}
      
      {!isLoading && progress === 100 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-green-600"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">{successMessage}</span>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-red-600"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Hook для управления состоянием toast уведомлений
 */
export const usePDFLoadingToast = () => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [toastProps, setToastProps] = React.useState<PDFLoadingProgressProps>({
    isLoading: false,
    progress: 0
  })
  
  const showToast = React.useCallback((props: PDFLoadingProgressProps) => {
    setToastProps(props)
    setIsVisible(true)
  }, [])
  
  const hideToast = React.useCallback(() => {
    setIsVisible(false)
  }, [])
  
  const ToastComponent = React.useCallback(() => {
    if (!isVisible) return null
    
    return (
      <PDFLoadingToast
        {...toastProps}
        onHide={hideToast}
      />
    )
  }, [isVisible, toastProps, hideToast])
  
  return {
    showToast,
    hideToast,
    ToastComponent
  }
}
