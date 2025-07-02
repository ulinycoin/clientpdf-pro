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
    const iconMap = {
      'PDF': '📄',
      'COMPRESS': '🗜️', 
      'SPLIT': '✂️',
      'ROTATE': '🔄',
      'WATERMARK': '🏷️',
      'EXTRACT': '📋',
      'TEXT': '📝',
      'IMAGE': '🖼️',
      'MERGE': '📑',
      'PAGES': '📄'
    };
    
    return iconMap[iconType as keyof typeof iconMap] || iconType || '📄';
  };

  const isDisabled = disabled || comingSoon;

  return (
    <div 
      className={`
        relative bg-white rounded-xl shadow-md border-2 p-6 
        transition-all duration-300 ease-in-out
        ${!isDisabled ? 'border-gray-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-2 cursor-pointer' : ''} 
        ${isDisabled ? 'border-gray-100 bg-gray-50' : ''}
        ${className}
        flex flex-col justify-between h-full
      `}
      onClick={!isDisabled ? handleClick : undefined}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Coming Soon
          </span>
        </div>
      )}
      
      {/* Top Section */}
      <div className="flex-grow">
        {/* Icon */}
        <div className={`text-5xl mb-4 text-center transition-all duration-300 ${isDisabled ? 'opacity-40' : 'transform hover:scale-110'}`}>
          {getIconDisplay(icon)}
        </div>
        
        {/* Title */}
        <h3 className={`text-xl font-bold mb-3 text-center ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </h3>
        
        {/* Description */}
        <p className={`text-sm mb-4 text-center leading-relaxed ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
      
      {/* Bottom Section - Action Button */}
      <div className="mt-auto">
        <Button
          onClick={handleClick}
          disabled={isDisabled}
          variant={comingSoon ? 'outline' : disabled ? 'outline' : 'primary'}
          size="md"
          fullWidth
          className="transition-all duration-200"
        >
          {comingSoon ? 'Coming Soon' : disabled ? 'Upload PDF First' : 'Start Processing'}
        </Button>
      </div>
    </div>
  );
};

export default ToolCard;