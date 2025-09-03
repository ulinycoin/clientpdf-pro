import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export const BlogPagination: React.FC<BlogPaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl,
  className = '',
}) => {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className={`flex justify-center ${className}`} aria-label="Pagination Navigation">
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            to={getPageUrl(currentPage - 1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                     bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg
                     hover:bg-white/15 hover:text-seafoam-green transition-all"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('blog.pagination.previous', 'Previous')}
          </Link>
        ) : (
          <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 
                         bg-gray-100/20 border border-gray-300/20 rounded-lg cursor-not-allowed">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('blog.pagination.previous', 'Previous')}
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Link
                key={pageNumber}
                to={getPageUrl(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all
                  ${isActive
                    ? 'text-white bg-seafoam-green border-seafoam-green shadow-md'
                    : 'text-gray-600 dark:text-gray-300 bg-white/10 backdrop-blur-sm border-white/20 ' +
                      'hover:bg-white/15 hover:text-seafoam-green hover:border-seafoam-green/50'
                  }`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            to={getPageUrl(currentPage + 1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                     bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg
                     hover:bg-white/15 hover:text-seafoam-green transition-all"
          >
            {t('blog.pagination.next', 'Next')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 
                         bg-gray-100/20 border border-gray-300/20 rounded-lg cursor-not-allowed">
            {t('blog.pagination.next', 'Next')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>

      {/* Page Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('blog.pagination.showing', `Page ${currentPage} of ${totalPages}`)}
        </p>
      </div>
    </nav>
  );
};