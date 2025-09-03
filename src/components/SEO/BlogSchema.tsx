import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BlogPost, BlogCategory } from '../../types/blog';

interface BlogSchemaProps {
  type: 'blog' | 'article' | 'category';
  post?: BlogPost;
  posts?: BlogPost[];
  category?: BlogCategory;
  language?: string;
}

export const BlogSchema: React.FC<BlogSchemaProps> = ({
  type,
  post,
  posts = [],
  category,
  language = 'en',
}) => {
  const siteUrl = 'https://localpdf.online';
  const siteName = 'LocalPDF';

  const generateOrganizationSchema = () => ({
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/images/logo.png`,
      width: 200,
      height: 60,
    },
    sameAs: [
      'https://twitter.com/LocalPDF',
      'https://github.com/LocalPDF',
    ],
    description: 'Privacy-first online PDF tools for merging, splitting, compressing, and converting PDFs without uploading to servers.',
  });

  const generateBlogSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteName} Blog`,
    description: 'Expert guides and tutorials about PDF tools and document management',
    url: `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}`,
    inLanguage: language,
    publisher: generateOrganizationSchema(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}`,
    },
    blogPost: posts.map(blogPost => ({
      '@type': 'BlogPosting',
      headline: blogPost.title,
      description: blogPost.excerpt,
      url: `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}/${blogPost.slug}`,
      datePublished: blogPost.publishedAt,
      dateModified: blogPost.updatedAt || blogPost.publishedAt,
      author: {
        '@type': 'Organization',
        name: blogPost.author,
      },
      image: {
        '@type': 'ImageObject',
        url: `${siteUrl}${blogPost.seo.ogImage || '/images/blog-default-og.jpg'}`,
      },
      articleSection: blogPost.category,
      keywords: blogPost.tags,
    })),
  });

  const generateArticleSchema = () => {
    if (!post) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: {
        '@type': 'ImageObject',
        url: `${siteUrl}${post.seo.ogImage || '/images/blog-default-og.jpg'}`,
        width: 1200,
        height: 630,
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: {
        '@type': 'Organization',
        name: post.author,
        url: siteUrl,
      },
      publisher: generateOrganizationSchema(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}/${post.slug}`,
      },
      url: `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}/${post.slug}`,
      articleSection: post.category,
      keywords: post.tags,
      inLanguage: language,
      wordCount: post.content.split(' ').length,
      timeRequired: `PT${post.readingTime}M`,
      articleBody: post.content.replace(/<[^>]*>/g, ''), // Strip HTML for schema
      about: {
        '@type': 'Thing',
        name: 'PDF Tools',
        description: 'Professional PDF processing and document management tools',
      },
      mentions: post.tags.map(tag => ({
        '@type': 'Thing',
        name: tag,
      })),
    };
  };

  const generateCategorySchema = () => {
    if (!category) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Articles`,
      description: category.description,
      url: `${siteUrl}${language === 'en' ? '/blog/category' : `/${language}/blog/category`}/${category.slug}`,
      inLanguage: language,
      publisher: generateOrganizationSchema(),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: posts.length,
        itemListElement: posts.map((blogPost, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'BlogPosting',
            headline: blogPost.title,
            description: blogPost.excerpt,
            url: `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}/${blogPost.slug}`,
            datePublished: blogPost.publishedAt,
            author: {
              '@type': 'Organization',
              name: blogPost.author,
            },
            image: {
              '@type': 'ImageObject',
              url: `${siteUrl}${blogPost.seo.ogImage || '/images/blog-default-og.jpg'}`,
            },
          },
        })),
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: `${siteUrl}${language === 'en' ? '/blog/category' : `/${language}/blog/category`}/${category.slug}`,
          },
        ],
      },
    };
  };

  const generateWebSiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: 'Privacy-first online PDF tools for merging, splitting, compressing, and converting PDFs',
    publisher: generateOrganizationSchema(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}${language === 'en' ? '/blog' : `/${language}/blog`}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: language,
  });

  const getSchema = () => {
    switch (type) {
      case 'blog':
        return [generateWebSiteSchema(), generateBlogSchema()];
      case 'article':
        return [generateWebSiteSchema(), generateArticleSchema()];
      case 'category':
        return [generateWebSiteSchema(), generateCategorySchema()];
      default:
        return [generateWebSiteSchema()];
    }
  };

  const schemas = getSchema().filter(Boolean);

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2),
          }}
        />
      ))}
    </Helmet>
  );
};