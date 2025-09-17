import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BlogPost } from '../../types/blog';

interface BlogSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  article?: BlogPost;
  language?: string;
}

export const BlogSEO: React.FC<BlogSEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage = '/images/blog-default-og.jpg',
  article,
  language = 'en',
}) => {
  const isArticle = Boolean(article);
  const siteName = 'LocalPDF';
  const siteUrl = 'https://localpdf.online';
  
  // Generate hreflang alternatives for blog
  const generateHreflangUrls = (basePath: string) => {
    const languages = ['en', 'de', 'fr', 'es', 'ru'];
    return languages.map(lang => ({
      lang: lang === 'en' ? 'x-default' : lang,
      href: lang === 'en' ? `${siteUrl}${basePath}` : `${siteUrl}/${lang}${basePath}`,
    }));
  };

  const basePath = article ? `/blog/${article.slug}` : '/blog';
  const hreflangUrls = generateHreflangUrls(basePath);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content={article?.author || siteName} />
      <meta name="language" content={language} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Hreflang for multilingual support */}
      {hreflangUrls.map(({ lang, href }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl || `${siteUrl}${basePath}`} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : `${language}_${language.toUpperCase()}`} />

      {/* Article-specific Open Graph */}
      {article && (
        <>
          <meta property="article:author" content={article.author} />
          <meta property="article:published_time" content={article.publishedAt} />
          {article.updatedAt && (
            <meta property="article:modified_time" content={article.updatedAt} />
          )}
          <meta property="article:section" content={article.category} />
          {article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@LocalPDF" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      <meta name="twitter:creator" content={article?.author || '@LocalPDF'} />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#4ECDC4" />
      <meta name="msapplication-TileColor" content="#4ECDC4" />
      <meta name="application-name" content={siteName} />
      
      {/* Blog-specific meta tags */}
      {article && (
        <>
          <meta name="article:reading_time" content={`${article.readingTime}`} />
          <meta name="keywords" content={article.tags.join(', ')} />
        </>
      )}

      {/* Structured Data will be handled by BlogSchema component */}
    </Helmet>
  );
};