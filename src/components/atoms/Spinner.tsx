import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorStyles = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  return (
    <motion.div
      className={cn(
        'border-2 border-t-transparent rounded-full',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};
