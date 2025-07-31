import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toolsSEOData, homepageSEOData, pagesSEOData } from '@/data/seoData';

// Enhanced SEO Head component for dynamic updates
export const useDynamicSEO = (toolKey?: keyof typeof toolsSEOData) => {
  const location = useLocation();

  useEffect(() => {
    const updateSEO = () => {
      const path = location.pathname;
      let seoData;

      // Determine SEO data based on route
      if (path === '/') {
        seoData = homepageSEOData;
      } else if (toolKey && toolsSEOData[toolKey]) {
        seoData = toolsSEOData[toolKey];
      } else if (path === '/privacy' && pagesSEOData.privacy) {
        seoData = pagesSEOData.privacy;
      } else if (path === '/faq' && pagesSEOData.faq) {
        seoData = pagesSEOData.faq;
      } else {
        return; // No SEO data found
      }

      // Update document title
      document.title = seoData.title.includes('LocalPDF')
        ? seoData.title
        : `${seoData.title} | LocalPDF`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', seoData.description);
      }

      // Update canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && seoData.canonical) {
        canonical.setAttribute('href', seoData.canonical);
      }

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');

      if (ogTitle) ogTitle.setAttribute('content', document.title);
      if (ogDescription) ogDescription.setAttribute('content', seoData.description);
      if (ogUrl && seoData.canonical) ogUrl.setAttribute('content', seoData.canonical);

      // Update Twitter Card
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');

      if (twitterTitle) twitterTitle.setAttribute('content', document.title);
      if (twitterDescription) twitterDescription.setAttribute('content', seoData.description);

      // Add structured data if available
      if (seoData.structuredData) {
        // Remove existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
        if (existingScript) {
          existingScript.remove();
        }

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic', 'true');
        script.textContent = JSON.stringify(seoData.structuredData);
        document.head.appendChild(script);
      }
    };

    updateSEO();
  }, [location.pathname, toolKey]);
};
