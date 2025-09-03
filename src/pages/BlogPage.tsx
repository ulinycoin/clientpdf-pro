import React from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogPageTemplate from '../components/templates/BlogPageTemplate';
import { BlogLayout } from '../components/blog/BlogLayout';
import { useI18n } from '../hooks/useI18n';

export const BlogPage: React.FC = () => {
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();
  
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const searchQuery = searchParams.get('search') || '';

  const seoData = {
    title: t('blog.page.seo.title', 'PDF Expert Blog - Tips, Tutorials & Guides | LocalPDF'),
    description: t('blog.page.seo.description', 
      'Professional PDF tutorials, expert tips, and comprehensive guides. Learn advanced PDF techniques, workflows, and best practices from LocalPDF experts.'
    ),
    keywords: t('blog.page.seo.keywords', 
      'PDF tutorials, PDF tips, PDF guides, document management, PDF tools, compression, merge, conversion, security'
    ),
    canonicalUrl: `https://localpdf.online${language === 'en' ? '/blog' : `/${language}/blog`}`,
    ogImage: '/images/blog-og-image.jpg',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'LocalPDF Blog',
      description: 'Expert guides and tutorials about PDF tools and document management',
      url: `https://localpdf.online${language === 'en' ? '/blog' : `/${language}/blog`}`,
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
        '@id': `https://localpdf.online${language === 'en' ? '/blog' : `/${language}/blog`}`
      }
    }
  };

  const pageTitle = category 
    ? t('blog.page.categoryTitle', `${category.charAt(0).toUpperCase() + category.slice(1)} Articles`)
    : tag 
    ? t('blog.page.tagTitle', `Articles tagged "${tag}"`)
    : searchQuery 
    ? t('blog.page.searchTitle', `Search: "${searchQuery}"`)
    : t('blog.page.title', 'PDF Expert Blog');

  const pageDescription = category
    ? t('blog.page.categoryDescription', `Discover professional ${category} articles and tutorials`)
    : tag
    ? t('blog.page.tagDescription', `All articles related to ${tag}`)
    : searchQuery
    ? t('blog.page.searchDescription', `Search results for "${searchQuery}"`)
    : t('blog.page.description', 'Professional guides, tutorials, and insights about PDF tools');

  return (
    <BlogPageTemplate
      seoData={seoData}
      toolId="blog"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      blogComponent={
        <BlogLayout 
          category={category || undefined}
          tag={tag || undefined}
          initialSearchQuery={searchQuery}
        />
      }
    />
  );
};

export default BlogPage;