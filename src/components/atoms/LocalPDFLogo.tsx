import React from 'react';

interface LocalPDFLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textPosition?: 'right' | 'bottom';
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}

const LocalPDFLogo: React.FC<LocalPDFLogoProps> = ({
  size = 'md',
  showText = true,
  textPosition = 'right',
  className = '',
  variant = 'default'
}) => {
  // Size mapping
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const logoSize = typeof size === 'number' ? size : sizeMap[size];
  const textSize = logoSize * 0.4;

  // Get the appropriate logo file based on size
  const getLogoSrc = () => {
    if (showText && logoSize >= 200) {
      // Use complete logo for large sizes with text
      if (logoSize >= 600) {
        return '/logos/localpdf-complete-800x600.png';
      } else {
        return '/logos/localpdf-complete-400x300.png';
      }
    } else {
      // Use shield-only logo for headers and icons
      if (logoSize >= 96) {
        return '/logos/localpdf-header-96x96.png';
      } else if (logoSize >= 64) {
        return '/logos/localpdf-header-64x64.png';
      } else if (logoSize >= 48) {
        return '/logos/localpdf-header-48x48.png';
      } else if (logoSize >= 32) {
        return '/logos/localpdf-header-32x32.png';
      } else if (logoSize >= 24) {
        return '/logos/localpdf-header-32x32.png'; // Will be scaled down
      } else {
        return '/logos/localpdf-favicon-16x16.png';
      }
    }
  };

  const logoSrc = getLogoSrc();
  const isCompleteLogo = logoSrc.includes('complete');


  return (
    <div className={`flex items-center ${textPosition === 'bottom' ? 'flex-col' : 'flex-row'} ${className}`}>
      <img
        src={logoSrc}
        alt="LocalPDF Logo"
        width={logoSize}
        height={isCompleteLogo ? (logoSize * 0.75) : logoSize}
        className="flex-shrink-0"
        style={{
          width: logoSize,
          height: isCompleteLogo ? (logoSize * 0.75) : logoSize,
          objectFit: 'contain'
        }}
        fetchpriority="high"
        loading="eager"
        onError={(e) => {
          // Fallback to a working logo
          (e.target as HTMLImageElement).src = '/logos/localpdf-header-32x32.png';
        }}
      />

      {showText && !isCompleteLogo && (
        <div
          className={`
            ${textPosition === 'right' ? 'ml-3' : 'mt-2'}
            ${textPosition === 'bottom' ? 'text-center' : ''}
          `}
          style={{ fontSize: `${textSize}px` }}
        >
          <div
            className="font-bold leading-tight text-primary-600"
          >
            localpdf.online
          </div>
          {logoSize >= 48 && (
            <div
              className="text-xs opacity-75 leading-tight text-secondary-600"
              style={{
                fontSize: `${textSize * 0.6}px`
              }}
            >
              Privacy-first PDF toolkit
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocalPDFLogo;