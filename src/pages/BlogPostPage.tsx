import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import BlogPageTemplate from '../components/templates/BlogPageTemplate';
import { BlogCard } from '../components/blog/BlogCard';
import { useSimpleBlogPost } from '../hooks/useSimpleBlog';
import { formatDate, generateBlogUrl } from '../utils/blogUtils';
import { useI18n } from '../hooks/useI18n';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, currentLanguage } = useI18n();
  
  const { post, relatedPosts, loading, notFound } = useSimpleBlogPost(slug!, currentLanguage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 animate-spin border-4 border-seafoam-green border-t-transparent rounded-full" />
            <p className="text-gray-600 dark:text-gray-300">
              {t('blog.post.loading', 'Loading article...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to={currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`} replace />;
  }

  const seoData = {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.tags.join(', '),
    canonicalUrl: post.seo.canonicalUrl || `https://localpdf.online${generateBlogUrl(post.slug, currentLanguage)}`,
    ogImage: post.seo.ogImage || '/images/blog-default-og.jpg',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.seo.ogImage || '/images/blog-default-og.jpg',
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Organization',
        name: post.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'LocalPDF',
        logo: {
          '@type': 'ImageObject',
          url: 'https://localpdf.online/images/logo.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://localpdf.online${generateBlogUrl(post.slug, currentLanguage)}`
      },
      articleSection: post.category,
      keywords: post.tags,
      wordCount: post.content.split(' ').length,
      timeRequired: `PT${post.readingTime}M`
    }
  };

  const ArticleComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <Link 
                  to={currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`}
                  className="hover:text-seafoam-green transition-colors"
                >
                  {t('blog.post.breadcrumbs.blog', 'Blog')}
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link
                  to={`${currentLanguage === 'en' ? '/blog/category' : `/${currentLanguage}/blog/category`}/${post.category}`}
                  className="hover:text-seafoam-green transition-colors capitalize"
                >
                  {post.category}
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {post.title}
                </span>
              </li>
            </ol>
          </nav>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.author}
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.publishedAt, currentLanguage)}
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime} {t('blog.post.minRead', 'min read')}
            </div>

            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <div className="flex items-center text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('blog.post.updated', `Updated ${formatDate(post.updatedAt, currentLanguage)}`)}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`${currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`}?tag=${tag}`}
                  className="inline-block px-3 py-1 text-sm font-medium text-seafoam-green 
                           bg-seafoam-green/10 border border-seafoam-green/20 rounded-full
                           hover:bg-seafoam-green/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Article Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('blog.post.publishedBy', 'Published by')} <span className="font-medium">{post.author}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.publishedAt, currentLanguage)}
                {post.updatedAt && post.updatedAt !== post.publishedAt && (
                  <span> • {t('blog.post.lastUpdated', `Updated ${formatDate(post.updatedAt, currentLanguage)}`)}</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Share buttons */}
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-seafoam-green 
                               bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
            </div>
          </div>
        </footer>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-ocean-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('blog.post.relatedArticles', 'Related Articles')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <nav className="mb-8">
          <Link
            to={currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`}
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm 
                     border border-white/20 rounded-lg text-seafoam-green font-medium
                     hover:bg-white/15 hover:text-ocean-blue transition-all"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('blog.post.backToBlog', 'Back to Blog')}
          </Link>
        </nav>
      </div>
    </div>
  );

  return (
    <BlogPageTemplate
      seoData={seoData}
      toolId={`blog-${post.slug}`}
      pageTitle={post.title}
      pageDescription={post.excerpt}
      blogComponent={<ArticleComponent />}
    />
  );
};

export default BlogPostPage;