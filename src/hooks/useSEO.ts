// src/hooks/useSEO.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  schemaData?: object;
  noindex?: boolean;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  schemaData,
  noindex = false
}: SEOProps) => {
  const location = useLocation();

  useEffect(() => {
    // Get current full URL
    const currentUrl = `https://localpdf.online${location.pathname}`;
    
    // Update title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      updateMetaTag('description', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // CRITICAL FIX: Update canonical URL for each page
    const canonicalUrl = canonical || currentUrl;
    updateCanonicalTag(canonicalUrl);

    // Update Open Graph tags
    updateOpenGraphTags(title, description, canonicalUrl, ogImage);

    // Update robots meta tag
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
    updateMetaTag('robots', robotsContent);

    // Add or update Schema.org data
    if (schemaData) {
      updateSchemaData(schemaData);
    }

    // Cleanup function
    return () => {
      // Don't remove canonical on cleanup - let next page set it
    };
  }, [title, description, keywords, canonical, ogImage, schemaData, noindex, location.pathname]);
};

// Helper function to update meta tags
const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};

// CRITICAL: Fix canonical tag update
const updateCanonicalTag = (href: string) => {
  // Remove existing canonical tag
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) {
    existingCanonical.remove();
  }
  
  // Create new canonical tag
  const canonicalTag = document.createElement('link');
  canonicalTag.setAttribute('rel', 'canonical');
  canonicalTag.setAttribute('href', href);
  document.head.appendChild(canonicalTag);
};

// Update Open Graph tags
const updateOpenGraphTags = (title?: string, description?: string, url?: string, image?: string) => {
  if (title) {
    updateMetaTag('og:title', title, 'property');
  }
  
  if (description) {
    updateMetaTag('og:description', description, 'property');
  }
  
  if (url) {
    updateMetaTag('og:url', url, 'property');
  }
  
  if (image) {
    updateMetaTag('og:image', image, 'property');
  }

  // Update Twitter Card tags
  if (title) {
    updateMetaTag('twitter:title', title, 'property');
  }
  
  if (description) {
    updateMetaTag('twitter:description', description, 'property');
  }
  
  if (image) {
    updateMetaTag('twitter:image', image, 'property');
  }
};

// Update Schema.org structured data
const updateSchemaData = (schemaData: object) => {
  const schemaId = 'page-schema';
  
  // Remove existing schema for this page
  const existingSchema = document.getElementById(schemaId);
  if (existingSchema) {
    existingSchema.remove();
  }
  
  // Add new schema
  const script = document.createElement('script');
  script.id = schemaId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schemaData);
  document.head.appendChild(script);
};

// Export for direct use in components
export { updateMetaTag, updateCanonicalTag, updateSchemaData };