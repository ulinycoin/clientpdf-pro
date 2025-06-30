import React from 'react';
import { ToolCardProps } from '../../types';
import Button from '../atoms/Button';

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  operationType,
  disabled = false,
  comingSoon = false,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled && !comingSoon) {
      onClick(operationType);
    }
  };

  const getIconDisplay = (iconType: string) => {
    switch (iconType) {
      case 'PDF':
        return '📄';
      case 'COMPRESS':
        return '🗜️';
      case 'SPLIT':
        return '✂️';
      case 'ROTATE':
        return '🔄';
      case 'WATERMARK':
        return '🏷️';
      case 'EXTRACT':
        return '📋';
      case 'TEXT':
        return '📝';
      case 'IMAGE':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const isDisabled = disabled || comingSoon;

  return (
    <div 
      className={`
        relative bg-white rounded-lg shadow-md border border-gray-200 p-6 
        transition-all duration-200 hover:shadow-lg
        ${!isDisabled ? 'hover:border-blue-300 hover:-translate-y-1' : ''}
        ${isDisabled ? 'opacity-75' : ''}
        ${className}
      `}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      
      {/* Icon - Always visible */}
      <div className="text-4xl mb-4 text-center">
        {getIconDisplay(icon)}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
        {description}
      </p>
      
      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleClick}
          disabled={isDisabled}
          variant={comingSoon ? 'outline' : disabled ? 'outline' : 'primary'}
          size="md"
          fullWidth
        >
          {comingSoon ? 'Coming Soon' : disabled ? 'Upload PDF Files' : 'Start'}
        </Button>
      </div>
      
      {/* Disabled Overlay - Subtle version */}
      {disabled && !comingSoon && (
        <div className="absolute inset-0 bg-white bg-opacity-60 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
          <div className="text-center p-4">
            <div className="text-3xl mb-3 opacity-60">📁</div>
            <p className="text-sm text-gray-700 font-medium">
              Upload PDF files first
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCard;