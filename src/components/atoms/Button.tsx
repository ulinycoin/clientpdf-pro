import React from 'react';
import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 touch-manipulation';

  // Психология цвета для PDF-инструментов
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-soft hover:scale-[1.02] hover:shadow-medium active:scale-[0.98] hover:from-blue-600 hover:to-blue-700',
    secondary: 'bg-white border border-secondary-200 text-secondary-700 shadow-soft hover:bg-secondary-50 hover:border-secondary-300 hover:scale-[1.01]',
    outline: 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-blue-300 hover:text-blue-700 focus-visible:ring-secondary-500 transition-all duration-200',
    ghost: 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 hover:scale-[1.02]',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-soft hover:scale-[1.02] hover:shadow-medium hover:from-red-600 hover:to-red-700'
  };

  // Touch-оптимизированные размеры
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]'
  };

  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-soft' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
