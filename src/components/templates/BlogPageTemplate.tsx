import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ModernHeader,
  ModernFooter
} from '../organisms';
import SEOHead from '../SEO/SEOHead';
import TwitterCardImage from '../TwitterCardImage/TwitterCardImage';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
  schema: any;
}

export interface BlogPageTemplateProps {
  // SEO Props
  seoData: SEOData;
  toolId: string;
  
  // Page Content
  pageTitle: string;
  pageDescription: string;
  blogComponent: React.ReactNode;
  
  // Layout Props
  className?: string;
}

const BlogPageTemplate: React.FC<BlogPageTemplateProps> = ({
  seoData,
  toolId,
  pageTitle,
  pageDescription,
  blogComponent,
  className = ""
}) => {
  
  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={seoData.canonicalUrl} />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoData.canonicalUrl} />
        <meta property="og:image" content={seoData.ogImage || '/images/blog-default-og.jpg'} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage || '/images/blog-default-og.jpg'} />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify(seoData.schema)}
        </script>
      </Helmet>
      
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonicalUrl}
        ogImage={seoData.ogImage || '/images/blog-default-og.jpg'}
        structuredData={seoData.schema}
      />
      
      <TwitterCardImage />
      
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 ${className}`}>
        <ModernHeader />
        
        <main className="pt-20">
          {/* Blog Content - No extra headers or sections */}
          <div className="relative">
            {blogComponent}
          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default BlogPageTemplate;