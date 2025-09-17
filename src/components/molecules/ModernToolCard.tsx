import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import { getToolRoute } from '../../utils/routeHelpers';

export interface ModernToolCardProps {
  title: string;
  description: string;
  icon: string;
  operationType: string;
  disabled?: boolean;
  comingSoon?: boolean;
  featured?: boolean;
  onClick?: () => void;
  className?: string;
}

const ModernToolCard: React.FC<ModernToolCardProps> = ({
  title,
  description,
  icon,
  operationType,
  disabled = false,
  comingSoon = false,
  featured = false,
  onClick,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const { shouldAnimate } = useMotionPreferences();
  const baseToolRoute = getToolRoute(operationType || '');
  const isDisabled = disabled || comingSoon;

  // Helper function to create localized tool route
  const getLocalizedToolRoute = () => {
    if (currentLanguage === 'en') {
      return baseToolRoute;
    }
    return `/${currentLanguage}${baseToolRoute}`;
  };

  // Modern SVG icons for PDF tools
  const getModernIcon = (iconType: string) => {
    const iconSVGs = {
      'MERGE': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6v-2z"/>
          <path d="M8.5 15L12 18.5L15.5 15M8.5 9L12 5.5L15.5 9" opacity="0.7"/>
        </svg>
      ),
      'SPLIT': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M19 13H5v-2h14v2z"/>
          <path d="M14 16L12 18L10 16M14 8L12 6L10 8"/>
          <rect x="3" y="4" width="6" height="16" rx="2" opacity="0.5"/>
          <rect x="15" y="4" width="6" height="16" rx="2" opacity="0.5"/>
        </svg>
      ),
      'COMPRESS': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M20 6h-2.5L15 3.5V2h-2v1.5L10.5 6H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM12 18l-4-4h3V9h2v5h3l-4 4z"/>
        </svg>
      ),
      'TEXT': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
          <circle cx="19" cy="17" r="3" opacity="0.7"/>
          <path d="M18 16h2v2h-2v-2z" fill="white"/>
        </svg>
      ),
      'WATERMARK': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 2.57 2.01 4.65 4.63 4.74.08-.02.17-.03.25-.03s.17.01.25.03c2.62-.09 4.63-2.17 4.63-4.74C16.75 4.13 14.62 2 12 2z" opacity="0.7"/>
          <path d="M12 12.5c-1.25 0-2.5.5-2.5 1.25v7.5h5v-7.5c0-.75-1.25-1.25-2.5-1.25z"/>
          <path d="M6 18h12v4H6v-4z" opacity="0.5"/>
        </svg>
      ),
      'ROTATE': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/>
          <path d="M18.76 7.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
          <rect x="8" y="8" width="8" height="8" rx="1" opacity="0.3"/>
        </svg>
      ),
      'PAGES': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M16 1H8C6.9 1 6 1.9 6 3v14l3-3 3 3 3-3 3 3V3c0-1.1-.9-2-2-2z"/>
          <path d="M20 7H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" opacity="0.7"/>
          <rect x="6" y="9" width="10" height="2" opacity="0.5"/>
          <rect x="6" y="13" width="10" height="2" opacity="0.5"/>
        </svg>
      ),
      'EXTRACT': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" opacity="0.3"/>
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
          <path d="M14 8h4l-4-4v4z" opacity="0.7"/>
          <rect x="8" y="12" width="6" height="2"/>
          <rect x="8" y="16" width="4" height="2"/>
        </svg>
      ),
      'IMAGE': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z"/>
          <circle cx="9" cy="9" r="2" fill="white"/>
          <path d="m15.5 11-4.5 6-2-2.5L5 18h14l-3.5-7z" fill="white"/>
        </svg>
      ),
      'OCR': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M20 6H12l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" opacity="0.3"/>
          <circle cx="15" cy="15" r="4"/>
          <path d="M13.5 13.5l3 3 1.5-1.5" stroke="white" strokeWidth="1.5" fill="none"/>
          <rect x="6" y="10" width="6" height="2" opacity="0.7"/>
          <rect x="6" y="14" width="4" height="2" opacity="0.7"/>
        </svg>
      ),
      'PDF_TO_SVG': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity="0.5"/>
          <path d="M14 8h4l-4-4v4z" opacity="0.7"/>
          <path d="M12 10L8 14h3v4h2v-4h3l-4-4z"/>
          <circle cx="16" cy="16" r="6" opacity="0.8"/>
          <path d="M13 13h6l-3 6-3-6z" fill="white"/>
          <circle cx="16" cy="15" r="1" fill="white"/>
        </svg>
      ),
      'EXTRACT_IMAGES': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity="0.3"/>
          <path d="M14 8h4l-4-4v4z" opacity="0.7"/>
          <rect x="7" y="11" width="10" height="7" rx="1" opacity="0.5"/>
          <circle cx="9" cy="13" r="1" fill="white"/>
          <path d="m11.5 14.5-1.5 2-1-1.5L7 17h6l-1.5-2.5z" fill="white"/>
          <path d="M16 4L20 8L16 12L14 10L16 8L14 6L16 4Z" opacity="0.8"/>
        </svg>
      ),
      'PROTECT': (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" opacity="0.3"/>
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          <circle cx="12" cy="8.5" r="2" fill="white"/>
          <path d="M10 12h4v2h-4v-2z" fill="white" opacity="0.8"/>
        </svg>
      )
    };

    return iconSVGs[iconType as keyof typeof iconSVGs] || (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
        <path d="M14 8h4l-4-4v4z"/>
      </svg>
    );
  };

  // Modern gradient colors aligned with privacy-first theme
  const getGradientStyle = (operationType: string) => {
    const gradientMap = {
      'merge': 'from-seafoam-500 to-ocean-500',
      'split': 'from-ocean-500 to-seafoam-600', 
      'compress': 'from-privacy-600 to-seafoam-500',
      'add-text': 'from-seafoam-400 to-ocean-500',
      'watermark': 'from-ocean-400 to-privacy-500',
      'rotate': 'from-seafoam-500 to-privacy-600',
      'extract-pages': 'from-privacy-500 to-ocean-500',
      'extract-text': 'from-seafoam-600 to-privacy-500',
      'pdf-to-image': 'from-ocean-500 to-seafoam-500',
      'pdf-to-svg': 'from-purple-500 to-indigo-500',
      'images-to-pdf': 'from-seafoam-500 to-ocean-600',
      'word-to-pdf': 'from-privacy-600 to-seafoam-400',
      'excel-to-pdf': 'from-seafoam-400 to-privacy-600',
      'extract-images-from-pdf': 'from-purple-500 to-pink-500',
      'ocr-pdf': 'from-ocean-600 to-privacy-500',
      'protect-pdf': 'from-red-500 to-orange-500'
    };

    return gradientMap[operationType as keyof typeof gradientMap] || 'from-seafoam-500 to-ocean-500';
  };

  // Card wrapper logic - use explicit conditional rendering to fix TypeScript issues
  const cardClassName = `group relative overflow-hidden ${className} ${
    isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
  }`;

  const cardContent = (
      <div className={`
        privacy-card h-full min-h-[200px] p-6 relative overflow-hidden bg-white/90 dark:bg-gray-800/90
        transition-all duration-300
        ${!isDisabled ? 'hover:shadow-xl hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-700' : ''}
        ${featured ? 'ring-2 ring-seafoam-400 ring-opacity-50' : ''}
        ${shouldAnimate ? '' : 'transform-none hover:transform-none'}
      `}>
        
        {/* Coming Soon Badge */}
        {comingSoon && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {t('common.comingSoon')}
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {featured && !comingSoon && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-gradient-to-r from-seafoam-500 to-ocean-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ★ {t('common.featured')}
            </div>
          </div>
        )}

        {/* Modern Icon */}
        <div className="flex justify-center mb-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center text-white p-4
            bg-gradient-to-br ${getGradientStyle(operationType)}
            shadow-lg group-hover:shadow-xl
            ${shouldAnimate && !isDisabled ? 'group-hover:scale-110 group-hover:rotate-3' : ''}
            transition-all duration-300
          `}>
            {getModernIcon(icon)}
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3 relative z-10">
          <h3 className="text-lg font-black text-black dark:text-white group-hover:text-seafoam-600 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Status Indicator */}
        {!isDisabled && (
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-600/50">
              <div className={`w-2 h-2 rounded-full bg-green-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                {t('common.readyToUse')}
              </span>
            </div>
          </div>
        )}

        {/* Hover Effect Overlay */}
        {!isDisabled && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-seafoam-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        )}

        {/* Subtle floating particles for enhanced tools */}
        {featured && shouldAnimate && !isDisabled && (
          <>
            <div className="absolute top-4 right-4 w-1 h-1 bg-seafoam-400/60 rounded-full gentle-float" style={{animationDelay: '0s'}} />
            <div className="absolute bottom-6 left-4 w-1 h-1 bg-ocean-400/60 rounded-full gentle-float" style={{animationDelay: '1s'}} />
          </>
        )}
      </div>
    );

  // Return conditional rendering based on isDisabled
  return isDisabled ? (
    <div
      className={cardClassName}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${description}`}
    >
      {cardContent}
    </div>
  ) : (
    <Link
      to={getLocalizedToolRoute()}
      className={cardClassName}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${description}`}
    >
      {cardContent}
    </Link>
  );
};

export default ModernToolCard;