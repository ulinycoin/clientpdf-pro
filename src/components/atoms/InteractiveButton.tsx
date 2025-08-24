import React, { forwardRef } from 'react';
import { useMicroInteractions } from '../../hooks/useMicroInteractions';
import { useCelebration } from '../../hooks/useCelebration';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  celebration?: boolean;
  celebrationType?: 'confetti' | 'checkmark' | 'sparkles';
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  celebration = false,
  celebrationType = 'confetti',
  hapticFeedback = true,
  rippleEffect = true,
  children,
  leftIcon,
  rightIcon,
  onClick,
  disabled,
  className = '',
  ...props
}, ref) => {
  const { shouldAnimate } = useMotionPreferences();
  const { celebrate } = useCelebration();
  
  const microInteractions = useMicroInteractions({
    duration: 200,
    intensity: 'moderate',
    haptic: hapticFeedback && shouldAnimate,
    sound: false
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Trigger ripple effect
    if (rippleEffect && shouldAnimate) {
      microInteractions.triggerRipple(event);
    }

    // Trigger celebration if enabled
    if (celebration) {
      celebrate(celebrationType, {
        position: { 
          x: event.clientX, 
          y: event.clientY 
        }
      });
    }

    onClick?.(event);
  };

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      primary: `
        bg-gradient-to-r from-seafoam-500 to-ocean-500 
        hover:from-seafoam-600 hover:to-ocean-600
        text-white border-transparent shadow-md
        hover:shadow-lg active:shadow-sm
        disabled:from-gray-400 disabled:to-gray-500
      `,
      secondary: `
        bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
        text-gray-700 dark:text-gray-300 shadow-sm
        hover:bg-gray-50 dark:hover:bg-gray-700
        hover:border-gray-400 dark:hover:border-gray-500
        hover:shadow-md active:shadow-sm
        disabled:bg-gray-100 disabled:text-gray-400
      `,
      success: `
        bg-gradient-to-r from-green-500 to-emerald-500
        hover:from-green-600 hover:to-emerald-600
        text-white border-transparent shadow-md
        hover:shadow-lg active:shadow-sm
        disabled:from-gray-400 disabled:to-gray-500
      `,
      error: `
        bg-gradient-to-r from-red-500 to-rose-500
        hover:from-red-600 hover:to-rose-600
        text-white border-transparent shadow-md
        hover:shadow-lg active:shadow-sm
        disabled:from-gray-400 disabled:to-gray-500
      `,
      ghost: `
        bg-transparent text-gray-700 dark:text-gray-300 border-transparent
        hover:bg-gray-100 dark:hover:bg-gray-800
        hover:text-gray-900 dark:hover:text-gray-100
        disabled:text-gray-400
      `
    };
    return variants[variant];
  };

  // Size styles
  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
      xl: 'px-8 py-4 text-lg rounded-2xl'
    };
    return sizes[size];
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
  );

  const combinedClasses = `
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${microInteractions.getHoverClasses()}
    ${microInteractions.getPressedClasses()}
    ${microInteractions.getActiveClasses()}
    ${microInteractions.getFocusClasses()}
    font-medium border transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-60
    relative overflow-hidden
    ${loading ? 'cursor-wait' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      ref={ref}
      className={combinedClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...microInteractions}
      {...props}
    >
      {/* Background gradient overlay for glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
      
      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </div>
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </button>
  );
});

InteractiveButton.displayName = 'InteractiveButton';

export default InteractiveButton;