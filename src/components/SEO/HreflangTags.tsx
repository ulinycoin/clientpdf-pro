import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface HreflangTagsProps {
  currentPath?: string;
}

const HreflangTags: React.FC<HreflangTagsProps> = ({ currentPath }) => {
  const location = useLocation();
  const path = currentPath || location.pathname;
  
  // Extract the base path without language prefix
  const getBasePath = (pathname: string): string => {
    // Remove language prefix if present
    const cleanPath = pathname.replace(/^\/(?:de|fr|es|ru)(?:\/|$)/, '/');
    return cleanPath === '/' ? '/' : cleanPath;
  };

  const basePath = getBasePath(path);
  const baseUrl = 'https://localpdf.online';

  // Ensure URLs are canonical and properly formatted
  const ensureCanonical = (url: string): string => {
    // Remove trailing slash except for root
    if (url !== baseUrl && url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url;
  };

  // Generate hreflang URLs for all supported languages
  const hreflangLinks = [
    {
      lang: 'en',
      url: ensureCanonical(basePath === '/' ? baseUrl : `${baseUrl}${basePath}`)
    },
    {
      lang: 'de', 
      url: ensureCanonical(basePath === '/' ? `${baseUrl}/de` : `${baseUrl}/de${basePath}`)
    },
    {
      lang: 'fr',
      url: ensureCanonical(basePath === '/' ? `${baseUrl}/fr` : `${baseUrl}/fr${basePath}`)
    },
    {
      lang: 'es',
      url: ensureCanonical(basePath === '/' ? `${baseUrl}/es` : `${baseUrl}/es${basePath}`)
    },
    {
      lang: 'ru',
      url: ensureCanonical(basePath === '/' ? `${baseUrl}/ru` : `${baseUrl}/ru${basePath}`)
    },
    {
      lang: 'x-default',
      url: ensureCanonical(basePath === '/' ? baseUrl : `${baseUrl}${basePath}`)
    }
  ];

  return (
    <Helmet>
      {hreflangLinks.map(({ lang, url }) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={url}
        />
      ))}
    </Helmet>
  );
};

export default HreflangTags;