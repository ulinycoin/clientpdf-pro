import React from 'react';
import { Link } from 'react-router-dom';
import { ToolCardProps } from '../../types';
import { getToolRoute } from '../../utils/routeHelpers';

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
  const toolRoute = getToolRoute(operationType || '');
  const isDisabled = disabled || comingSoon;

  const getIconDisplay = (iconType: string) => {
    const iconMap = {
      'PDF': '📄',
      'COMPRESS': '🗜️',
      'SPLIT': '✂️',
      'ROTATE': '🔄',
      'WATERMARK': '💧',
      'EXTRACT': '📋',
      'TEXT': '📝',
      'IMAGE': '🖼️',
      'MERGE': '🔗',
      'PAGES': '📄'
    };

    return iconMap[iconType as keyof typeof iconMap] || iconType || '📄';
  };

  // Цветовая психология для PDF-инструментов по вашему описанию
  const getGradientColors = (operationType: string) => {
    const gradientMap = {
      'merge': 'from-blue-500 to-blue-600', // Синий: надежность, технологии
      'split': 'from-blue-600 to-indigo-600', // Синий: основные действия
      'compress': 'from-green-500 to-green-600', // Зеленый: успех, безопасность
      'add-text': 'from-blue-500 to-blue-600', // Синий: технологии
      'watermark': 'from-blue-600 to-cyan-600', // Синий: безопасность
      'rotate': 'from-blue-500 to-purple-600', // Синий с фиолетовым: инновации
      'extract-pages': 'from-blue-600 to-indigo-600', // Синий: технологии
      'extract-text': 'from-green-500 to-emerald-600', // Зеленый: успех
      'pdf-to-image': 'from-blue-500 to-blue-600', // Синий: технологии
      'images-to-pdf': 'from-green-500 to-green-600', // Зеленый: безопасность
      'word-to-pdf': 'from-blue-600 to-indigo-600', // Синий: технологии
      'excel-to-pdf': 'from-emerald-500 to-green-600', // Зеленый: Excel ассоциация
      'ocr-pdf': 'from-purple-500 to-violet-600' // Фиолетовый: инновации
    };

    return gradientMap[operationType as keyof typeof gradientMap] || 'from-blue-500 to-blue-600';
  };

  // If coming soon or disabled, render as div, otherwise as Link
  const CardWrapper = isDisabled ? 'div' : Link;
  const cardProps = isDisabled
    ? {
        className: `
          group relative overflow-hidden rounded-2xl transition-all duration-200
          pdf-tool-card opacity-60 cursor-not-allowed
          ${className}
        `,
        role: "button",
        tabIndex: 0,
        "aria-label": `${title} - ${description}`
      }
    : {
        to: toolRoute,
        className: `
          group relative overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer
          pdf-tool-card hover:shadow-glow
          ${className}
        `,
        role: "button",
        tabIndex: 0,
        "aria-label": `${title} - ${description}`
      };

  return (
    <CardWrapper {...cardProps}>
      {/* Glass effect background с улучшенным дизайном */}
      <div className="pdf-processing-card rounded-2xl p-6 h-full w-full min-h-[180px]">
        {/* Subtle gradient border effect on hover */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200
          bg-gradient-to-r ${getGradientColors(operationType)} p-[1px]
        `}>
          <div className="bg-white rounded-2xl h-full w-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Coming Soon Badge */}
          {comingSoon && (
            <div className="absolute -top-3 -right-3 z-20">
              <span className="bg-gradient-to-r from-warning-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                Скоро
              </span>
            </div>
          )}

          {/* Top section - Icon */}
          <div className="flex justify-center mb-4">
            <div className={`
              w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-medium
              bg-gradient-to-br ${getGradientColors(operationType)}
              transform group-hover:scale-110 transition-all duration-200
              shadow-soft group-hover:shadow-glow
            `}>
              {getIconDisplay(icon)}
            </div>
          </div>

          {/* Middle section - Title and Description */}
          <div className="text-center flex-grow flex flex-col justify-center mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-secondary-600 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {/* Bottom section - Trust indicator */}
          {!isDisabled && (
            <div className="flex items-center justify-center">
              <div className="flex items-center text-xs text-secondary-500 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full mr-2 bg-success-400 pdf-status-indicator"></div>
                <span className="font-medium">Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Subtle hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-blue-600/0 group-hover:from-primary-500/5 group-hover:to-blue-600/10 rounded-2xl transition-all duration-200"></div>
      </div>
    </CardWrapper>
  );
};

export default ToolCard;
