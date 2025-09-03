import React from 'react';
import { useI18n } from '../../hooks/useI18n';

interface BlogHeaderProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  title,
  description,
  showSearch = true,
  onSearchChange,
  searchQuery = '',
}) => {
  const { t } = useI18n();

  const defaultTitle = t('blog.header.title', 'PDF Expert Blog');
  const defaultDescription = t('blog.header.description', 
    'Professional guides, tutorials, and insights about PDF tools and document management.'
  );

  return (
    <div className="bg-gradient-to-r from-seafoam-green via-ocean-blue to-seafoam-green py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          {title || defaultTitle}
        </h1>
        
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          {description || defaultDescription}
        </p>

        {showSearch && (
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={t('blog.header.searchPlaceholder', 'Search articles...')}
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 
                         rounded-full text-white placeholder-white/70 focus:outline-none 
                         focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
              />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg 
                  className="w-5 h-5 text-white/70" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>

            <div className="mt-4 text-white/70 text-sm">
              {t('blog.header.searchHint', 'Search by title, category, or tags')}
            </div>
          </div>
        )}
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};