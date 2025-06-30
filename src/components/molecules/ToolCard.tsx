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

  const isDisabled = disabled || comingSoon;

  return (
    <div 
      className={`
        relative bg-white rounded-lg shadow-md border border-gray-200 p-6 
        transition-all duration-200 hover:shadow-lg hover:border-blue-300
        ${isDisabled ? 'opacity-60' : 'hover:-translate-y-1'}
        ${className}
      `}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      
      {/* Icon */}
      <div className="text-4xl mb-4 text-center">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 text-center line-height-relaxed">
        {description}
      </p>
      
      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleClick}
          disabled={isDisabled}
          variant={comingSoon ? 'outline' : 'primary'}
          size="md"
          fullWidth
        >
          {comingSoon ? 'Coming Soon' : disabled ? 'Upload Files First' : 'Start'}
        </Button>
      </div>
      
      {/* Disabled Overlay */}
      {disabled && !comingSoon && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">📁</div>
            <p className="text-sm text-gray-600 font-medium">
              Upload PDF files to use this tool
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCard;