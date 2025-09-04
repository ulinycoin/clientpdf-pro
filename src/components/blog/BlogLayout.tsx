import React, { useState } from 'react';
import { BlogHeader } from './BlogHeader';
import { BlogCard } from './BlogCard';
import { BlogSidebar } from './BlogSidebar';
import { BlogSearch } from './BlogSearch';
import { BlogPagination } from './BlogPagination';
import { useBlogPosts, usePaginatedBlogPosts } from '../../hooks/useBlogPosts';
import { useI18n } from '../../hooks/useI18n';

interface BlogLayoutProps {
  category?: string;
  tag?: string;
  initialSearchQuery?: string;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({
  category,
  tag,
  initialSearchQuery = '',
}) => {
  const { t, currentLanguage } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  
  const { categories, featuredPosts, recentPosts, loading: postsLoading } = useBlogPosts();
  
  const {
    posts,
    totalPages,
    totalPosts,
    hasNextPage,
    hasPrevPage,
    loading: paginationLoading
  } = usePaginatedBlogPosts(currentPage, 9, category, tag, currentLanguage);

  const loading = postsLoading || paginationLoading;

  // Filter posts by search query if provided
  const displayPosts = searchQuery 
    ? posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(postTag => postTag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  const baseUrl = React.useMemo(() => {
    let url = currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`;
    if (category) url += `/category/${category}`;
    if (tag) url += `?tag=${tag}`;
    return url;
  }, [currentLanguage, category, tag]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get page title based on context
  const getPageTitle = () => {
    if (category) {
      return t('blog.layout.categoryTitle', `${category.charAt(0).toUpperCase() + category.slice(1)} Articles`);
    }
    if (tag) {
      return t('blog.layout.tagTitle', `Articles tagged with "${tag}"`);
    }
    if (searchQuery) {
      return t('blog.layout.searchTitle', `Search results for "${searchQuery}"`);
    }
    return t('blog.layout.title', 'PDF Expert Blog');
  };

  const getPageDescription = () => {
    if (category) {
      return t('blog.layout.categoryDescription', `Explore ${category} articles and tutorials`);
    }
    if (tag) {
      return t('blog.layout.tagDescription', `All articles related to ${tag}`);
    }
    if (searchQuery) {
      return t('blog.layout.searchDescription', `Found ${displayPosts.length} articles matching your search`);
    }
    return t('blog.layout.description', 'Professional guides, tutorials, and insights about PDF tools and document management.');
  };

  if (loading && displayPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50">
        <BlogHeader 
          title={getPageTitle()}
          description={getPageDescription()}
          showSearch={false}
        />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 animate-spin border-4 border-seafoam-green border-t-transparent rounded-full" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('blog.layout.loading', 'Loading articles...')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      <BlogHeader 
        title={getPageTitle()}
        description={getPageDescription()}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">

            {/* Featured Posts (only on main blog page, not in search/category) */}
            {!category && !tag && !searchQuery && featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-sandy-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {t('blog.layout.featured', 'Featured Articles')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <BlogCard key={post.slug} post={post} featured />
                  ))}
                </div>
              </section>
            )}

            {/* Results Info */}
            {(searchQuery || category || tag) && (
              <div className="mb-6 p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    {searchQuery && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t('blog.layout.searchResults', `${displayPosts.length} results for "${searchQuery}"`)}
                      </p>
                    )}
                    {category && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t('blog.layout.categoryResults', `${displayPosts.length} articles in ${category}`)}
                      </p>
                    )}
                    {tag && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t('blog.layout.tagResults', `${displayPosts.length} articles tagged with "${tag}"`)}
                      </p>
                    )}
                  </div>
                  
                  {(searchQuery || category || tag) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                        // Navigate to main blog page
                        window.location.href = currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`;
                      }}
                      className="text-sm text-seafoam-green hover:text-ocean-blue transition-colors"
                    >
                      {t('blog.layout.clearFilters', 'Clear filters')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {displayPosts.length > 0 ? (
              <>
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-ocean-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    {searchQuery || category || tag 
                      ? t('blog.layout.results', 'Results')
                      : t('blog.layout.latestArticles', 'Latest Articles')
                    }
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayPosts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </section>

                {/* Pagination */}
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={baseUrl}
                  className="mb-8"
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('blog.layout.noArticles', 'No articles found')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery 
                    ? t('blog.layout.noSearchResults', 'Try different keywords or browse our categories')
                    : t('blog.layout.noArticlesInCategory', 'No articles available in this category yet')
                  }
                </p>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <BlogSidebar 
            categories={categories}
            recentPosts={recentPosts}
          />
        </div>
      </div>
    </div>
  );
};