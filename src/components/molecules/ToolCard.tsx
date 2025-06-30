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
        relative bg-white rounded-lg shadow-md border-2 p-6 
        transition-all duration-200 
        ${!isDisabled ? 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1' : ''}
        ${isDisabled ? 'border-gray-100 bg-gray-50' : ''}
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
      
      {/* Icon */}
      <div className={`text-4xl mb-4 text-center transition-opacity ${isDisabled ? 'opacity-40' : ''}`}>
        {getIconDisplay(icon)}
      </div>
      
      {/* Title */}
      <h3 className={`text-xl font-semibold mb-2 text-center ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className={`text-sm mb-6 text-center leading-relaxed ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
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
    </div>
  );
};

export default ToolCard;