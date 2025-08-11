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

  // Generate hreflang URLs for all supported languages
  const hreflangLinks = [
    {
      lang: 'en',
      url: basePath === '/' ? baseUrl : `${baseUrl}${basePath}`
    },
    {
      lang: 'de', 
      url: basePath === '/' ? `${baseUrl}/de` : `${baseUrl}/de${basePath}`
    },
    {
      lang: 'fr',
      url: basePath === '/' ? `${baseUrl}/fr` : `${baseUrl}/fr${basePath}`
    },
    {
      lang: 'es',
      url: basePath === '/' ? `${baseUrl}/es` : `${baseUrl}/es${basePath}`
    },
    {
      lang: 'ru',
      url: basePath === '/' ? `${baseUrl}/ru` : `${baseUrl}/ru${basePath}`
    },
    {
      lang: 'x-default',
      url: basePath === '/' ? baseUrl : `${baseUrl}${basePath}`
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