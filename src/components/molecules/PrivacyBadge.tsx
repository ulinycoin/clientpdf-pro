import React from 'react';
import { Shield, Zap, Heart, Lock, CheckCircle } from 'lucide-react';

interface PrivacyBadgeProps {
  icon: 'shield' | 'zap' | 'heart' | 'lock' | 'check';
  title: string;
  subtitle: string;
  variant?: 'success' | 'primary' | 'blue';
  animated?: boolean;
  className?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  icon,
  title,
  subtitle,
  variant = 'success',
  animated = false,
  className = ''
}) => {
  const IconComponent = {
    shield: Shield,
    zap: Zap,
    heart: Heart,
    lock: Lock,
    check: CheckCircle
  }[icon];

  const variantClasses = {
    success: 'bg-white/70 border-success-200 text-success-700 shadow-soft',
    primary: 'bg-white/70 border-primary-200 text-primary-700 shadow-soft',
    blue: 'bg-white/70 border-blue-200 text-blue-700 shadow-soft'
  };

  const iconColors = {
    success: 'text-success-600',
    primary: 'text-primary-600',
    blue: 'text-blue-600'
  };

  return (
    <div
      className={`
        inline-flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border backdrop-blur-sm
        ${variantClasses[variant]}
        ${animated ? 'trust-badge' : ''}
        pdf-trust-indicator mobile-safe
        transition-all duration-200 hover:scale-105 hover:shadow-medium
        max-w-full flex-shrink-1
        ${className}
      `}
      role="status"
      aria-label={`${title}: ${subtitle}`}
    >
      <div className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-lg shadow-soft ${animated ? 'animate-pulse' : ''}`}>
        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColors[variant]}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-xs sm:text-sm leading-tight truncate">{title}</div>
        <div className="text-xs opacity-80 leading-tight truncate">{subtitle}</div>
      </div>
    </div>
  );
};

export default PrivacyBadge;
