import React, { ButtonHTMLAttributes } from 'react';
import { useLocalizedText } from '../context/LocalizationProvider';

interface LocalizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  textKey: string;
  namespace?: string;
  fallbackText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingTextKey?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const LocalizedButton: React.FC<LocalizedButtonProps> = ({
  textKey,
  namespace = 'common',
  fallbackText,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingTextKey = 'status.processing',
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const { t } = useLocalizedText(namespace);

  const getVariantClasses = () => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300`;
      case 'outline':
        return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const buttonText = loading 
    ? t(loadingTextKey, 'Processing...') 
    : t(textKey, fallbackText || textKey);

  const LoadingIcon = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderContent = () => {
    const showIcon = (icon && !loading) || loading;
    const currentIcon = loading ? <LoadingIcon /> : icon;
    
    if (!showIcon) {
      return buttonText;
    }

    if (iconPosition === 'right') {
      return (
        <span className="flex items-center justify-center space-x-2">
          <span>{buttonText}</span>
          {currentIcon}
        </span>
      );
    }

    return (
      <span className="flex items-center justify-center space-x-2">
        {currentIcon}
        <span>{buttonText}</span>
      </span>
    );
  };

  return (
    <button
      className={`${getVariantClasses()} ${getSizeClasses()} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {children || renderContent()}
    </button>
  );
};

export default LocalizedButton;