import React from 'react';
import { clsx } from 'clsx';
import { type Icon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: Icon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn-base';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
      secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    };

    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };

    const iconSizeMap = {
      sm: 12,
      md: 16,
      lg: 18,
    };

    const isDisabled = disabled || loading;

    return (
      <button
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          'group',
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <div
            className={clsx(
              'animate-spin mr-2 border-2 border-current border-t-transparent rounded-full',
              size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
            )}
          />
        )}
        
        {Icon && !loading && iconPosition === 'left' && (
          <Icon
            size={iconSizeMap[size]}
            className={clsx(
              'transition-transform group-hover:scale-105 flex-shrink-0',
              children && 'mr-2'
            )}
          />
        )}
        
        {children}
        
        {Icon && !loading && iconPosition === 'right' && (
          <Icon
            size={iconSizeMap[size]}
            className={clsx(
              'transition-transform group-hover:scale-105 flex-shrink-0',
              children && 'ml-2'
            )}
          />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';