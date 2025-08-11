import React from 'react';
import { Helmet } from 'react-helmet-async';
import HreflangTags from './HreflangTags';

interface FAQSchemaItem {
  question: string;
  answer: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  structuredData?: object;
  faqSchema?: FAQSchemaItem[];
  noindex?: boolean;
  includeHreflang?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og-image.png',
  ogType = 'website',
  structuredData,
  faqSchema,
  noindex = false,
  includeHreflang = true
}) => {
  // Ensure title includes LocalPDF branding
  const fullTitle = title.includes('LocalPDF') ? title : `${title} | LocalPDF`;

  // Get canonical URL - always use provided canonical URL for consistency
  // This ensures multilingual pages have correct canonical URLs pointing to the English version
  const canonicalUrl = canonical || 'https://localpdf.online';

  // Full image URLs
  const fullOgImage = `https://localpdf.online${ogImage}`;

  // Generate FAQ Schema if provided
  const faqSchemaData = faqSchema && faqSchema.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSchema.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>/g, '') // Strip HTML tags for schema
      }
    }))
  } : null;

  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="author" content="LocalPDF" />

        {/* Robots directive */}
        {noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        )}

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="LocalPDF" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:creator" content="@LocalPDF" />
      <meta name="twitter:site" content="@LocalPDF" />

      {/* Additional SEO Meta Tags */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Mobile Web App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="LocalPDF" />

      {/* Theme */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />

      {/* Performance Hints */}
      <link rel="dns-prefetch" href="//localpdf.online" />
      <link rel="preconnect" href="https://localpdf.online" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* FAQ Schema */}
      {faqSchemaData && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchemaData)}
        </script>
      )}
      </Helmet>
      
      {/* Hreflang Tags */}
      {includeHreflang && <HreflangTags />}
    </>
  );
};

export default SEOHead;
