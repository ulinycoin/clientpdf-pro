// src/components/SEO/PDFHubHreflang.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PDFHubHreflangProps {
  /** Current PDF Hub page path (e.g., '/pdf-hub', '/pdf-hub/guides') */
  pagePath: string;
  /** Canonical URL for this specific page */
  canonicalUrl: string;
}

/**
 * Hreflang tags for PDF Hub pages
 * Indicates that /pdf-hub content is English-only while other pages support all languages
 */
export const PDFHubHreflang: React.FC<PDFHubHreflangProps> = ({
  pagePath,
  canonicalUrl
}) => {
  return (
    <Helmet>
      {/* PDF Hub is English-only */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Meta to indicate content language */}
      <meta httpEquiv="content-language" content="en" />

      {/* Indicate to search engines that this content is specifically English */}
      <meta name="language" content="English" />

      {/* Robots meta for PDF Hub authority pages */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Article schema hints for authority content */}
      <meta property="article:author" content="LocalPDF Team" />
      <meta property="article:publisher" content="LocalPDF" />
    </Helmet>
  );
};

/**
 * Standard hreflang for multilingual tool pages (non-PDF Hub)
 */
export const StandardHreflang: React.FC<{
  basePath: string;
  currentLanguage: string;
}> = ({ basePath, currentLanguage }) => {
  const supportedLanguages = ['en', 'de', 'fr', 'es', 'ru'];
  const baseUrl = 'https://localpdf.tech';

  return (
    <Helmet>
      {supportedLanguages.map(lang => {
        const href = lang === 'en'
          ? `${baseUrl}${basePath}`
          : `${baseUrl}/${lang}${basePath}`;

        return (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={href}
          />
        );
      })}

      {/* Default language */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}${basePath}`}
      />

      {/* Canonical URL */}
      <link
        rel="canonical"
        href={currentLanguage === 'en'
          ? `${baseUrl}${basePath}`
          : `${baseUrl}/${currentLanguage}${basePath}`
        }
      />
    </Helmet>
  );
};