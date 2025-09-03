import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import BlogPageTemplate from '../components/templates/BlogPageTemplate';
import { BlogCard } from '../components/blog/BlogCard';
import { BlogPagination } from '../components/blog/BlogPagination';
import { useBlogCategory, usePaginatedBlogPosts } from '../hooks/useBlogPosts';
import { useI18n } from '../hooks/useI18n';

export const BlogCategoryPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const { t, language } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  
  const { category, loading: categoryLoading, error, notFound } = useBlogCategory(categorySlug!, language);
  
  const {
    posts,
    totalPages,
    totalPosts,
    loading: postsLoading
  } = usePaginatedBlogPosts(currentPage, 12, categorySlug, undefined, language);

  const loading = categoryLoading || postsLoading;

  if (loading && !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 animate-spin border-4 border-seafoam-green border-t-transparent rounded-full" />
            <p className="text-gray-600 dark:text-gray-300">
              {t('blog.category.loading', 'Loading category...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || notFound || !category) {
    return <Navigate to={language === 'en' ? '/blog' : `/${language}/blog`} replace />;
  }

  const seoData = {
    title: t('blog.category.seo.title', `${category.name} Articles - LocalPDF Blog`),
    description: t('blog.category.seo.description', 
      `Discover ${totalPosts} professional ${category.name} articles about PDF tools and document management.`
    ),
    keywords: t('blog.category.seo.keywords', `${category.name}, PDF ${category.name}, ${categorySlug}, tutorials`),
    canonicalUrl: `https://localpdf.online${language === 'en' ? '/blog/category' : `/${language}/blog/category`}/${categorySlug}`,
    ogImage: `/images/blog-category-${categorySlug}.jpg`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Articles`,
      description: category.description,
      url: `https://localpdf.online${language === 'en' ? '/blog/category' : `/${language}/blog/category`}/${categorySlug}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: totalPosts,
        itemListElement: posts.map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            url: `https://localpdf.online${language === 'en' ? '/blog' : `/${language}/blog`}/${post.slug}`,
            datePublished: post.publishedAt,
            author: {
              '@type': 'Organization',
              name: post.author
            }
          }
        }))
      }
    }
  };

  const CategoryComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Header */}
        <header className="text-center mb-12">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <Link 
                  to={language === 'en' ? '/blog' : `/${language}/blog`}
                  className="hover:text-seafoam-green transition-colors"
                >
                  {t('blog.category.breadcrumbs.blog', 'Blog')}
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {category.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('blog.category.title', `${category.name} Articles`)}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {category.description}
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-seafoam-green/10 border border-seafoam-green/20 
                           rounded-full text-seafoam-green font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('blog.category.articlesCount', `${totalPosts} articles`)}
            </div>
          </div>
        </header>

        {/* Articles Grid */}
        {posts.length > 0 ? (
          <>
            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </section>

            {/* Pagination */}
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`${language === 'en' ? '/blog/category' : `/${language}/blog/category`}/${categorySlug}`}
              className="mb-8"
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 opacity-20">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M19 11H5m14-7H5m14 14H5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('blog.category.noArticles', 'No articles in this category yet')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('blog.category.noArticlesDescription', 'Check back soon for new content or browse other categories')}
            </p>
            <Link
              to={language === 'en' ? '/blog' : `/${language}/blog`}
              className="inline-flex items-center px-6 py-3 bg-seafoam-green text-white font-medium 
                       rounded-lg hover:bg-seafoam-green/80 transition-colors"
            >
              {t('blog.category.browseBlog', 'Browse All Articles')}
            </Link>
          </div>
        )}

        {/* Back to Blog */}
        <nav>
          <Link
            to={language === 'en' ? '/blog' : `/${language}/blog`}
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm 
                     border border-white/20 rounded-lg text-seafoam-green font-medium
                     hover:bg-white/15 hover:text-ocean-blue transition-all"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('blog.category.backToBlog', 'Back to All Articles')}
          </Link>
        </nav>
      </div>
    </div>
  );

  return (
    <BlogPageTemplate
      seoData={seoData}
      toolId={`blog-category-${categorySlug}`}
      pageTitle={t('blog.category.pageTitle', `${category.name} Articles`)}
      pageDescription={category.description}
      blogComponent={<CategoryComponent />}
    />
  );
};

export default BlogCategoryPage;