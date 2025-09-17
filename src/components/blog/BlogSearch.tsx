import React, { useState, useRef, useEffect } from 'react';
import { BlogPost } from '../../types/blog';
import { BlogCard } from './BlogCard';
import { useBlogSearch } from '../../hooks/useBlogSearch';
import { useI18n } from '../../hooks/useI18n';

interface BlogSearchProps {
  onSearchChange?: (query: string) => void;
  className?: string;
}

export const BlogSearch: React.FC<BlogSearchProps> = ({
  onSearchChange,
  className = '',
}) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    searchResults,
    isSearching,
    hasResults,
    hasQuery,
    searchHistory,
    setQuery,
    performSearch,
    clearSearch,
  } = useBlogSearch();

  // Handle search input
  const handleSearchInput = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
    setIsExpanded(value.length > 0);
  };

  // Handle search from history
  const handleHistorySearch = (historyQuery: string) => {
    performSearch(historyQuery);
    setIsExpanded(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('blog.search.placeholder', 'Search articles by title, content, or tags...')}
          value={query}
          onChange={(e) => handleSearchInput(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="w-full px-5 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 
                   rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-seafoam-green/50 focus:bg-white/15 
                   transition-all duration-300"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {isSearching && (
            <div className="w-4 h-4 animate-spin border-2 border-seafoam-green border-t-transparent rounded-full" />
          )}
          
          {hasQuery && !isSearching && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 
                       backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50 
                       max-h-96 overflow-y-auto">
          
          {/* No query - show search history */}
          {!hasQuery && searchHistory.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('blog.search.recentSearches', 'Recent Searches')}
              </h4>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((historyQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistorySearch(historyQuery)}
                    className="flex items-center w-full px-3 py-2 text-left text-sm 
                             text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 
                             dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {historyQuery}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasQuery && (
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 animate-spin border-2 border-seafoam-green border-t-transparent rounded-full mr-3" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('blog.search.searching', 'Searching...')}
                  </span>
                </div>
              ) : hasResults ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('blog.search.results', `Found ${searchResults.length} results for "${query}"`)}
                    </h4>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {searchResults.slice(0, 5).map((post) => (
                      <div key={post.slug} onClick={() => setIsExpanded(false)}>
                        <BlogCard post={post} compact />
                      </div>
                    ))}
                    
                    {searchResults.length > 5 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            // Navigate to full search results page
                            setIsExpanded(false);
                          }}
                          className="text-sm text-seafoam-green hover:text-ocean-blue font-medium transition-colors"
                        >
                          {t('blog.search.viewAll', `View all ${searchResults.length} results`)} →
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-20">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-1.01-5.912-2.62l-.15-.165a7.96 7.96 0 010-10.43C7.56 1.01 9.66 0 12 0a7.96 7.96 0 017.662 5.785l-.15.165A7.962 7.962 0 0112 15z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('blog.search.noResults', `No articles found for "${query}"`)}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    {t('blog.search.noResultsHint', 'Try different keywords or check spelling')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search tips when no query */}
          {!hasQuery && searchHistory.length === 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('blog.search.tips.title', 'Search Tips')}
              </h4>
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <p>• {t('blog.search.tips.keywords', 'Use specific keywords like "PDF merge" or "compression"')}</p>
                <p>• {t('blog.search.tips.tags', 'Search by tags using #tutorial or #guide')}</p>
                <p>• {t('blog.search.tips.categories', 'Try category names like "tutorials" or "tips"')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};