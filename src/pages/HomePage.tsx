import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation, useI18n } from '../hooks/useI18n';
// Cache bust v2 - Mobile optimization
import {
  ModernHeader,
  ModernFooter,
  BentoToolsGrid,
  PrivacyBenefitsSection,
  QuickStartSection
} from '../components/organisms';
// Removed InteractiveHeroSection - using static hero for mobile performance

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for performance optimization
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Generate canonical URL based on language
  // Remove trailing slash to match query parameter URLs and prevent duplicate content
  const canonicalUrl = currentLanguage === 'en'
    ? 'https://localpdf.online'
    : `https://localpdf.online/${currentLanguage}`;

  return (
    <>
      <Helmet>
        <title>LocalPDF - {t('home.hero.subtitle')} | Free Privacy-First PDF Tools</title>
        <meta name="description" content={`${t('home.hero.description')} - ${t('home.hero.descriptionSecondary')}`} />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="34adca022b79f1a0" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`LocalPDF - ${t('home.hero.subtitle')}`} />
        <meta property="og:description" content={t('home.hero.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://localpdf.online/og-image.png" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`LocalPDF - ${t('home.hero.subtitle')}`} />
        <meta name="twitter:description" content={t('home.hero.description')} />
        <meta name="twitter:image" content="https://localpdf.online/twitter-image.png" />

        {/* Additional SEO */}
        <meta name="keywords" content="PDF tools, merge PDF, split PDF, compress PDF, privacy-first, local processing, free PDF tools, browser PDF editor" />
        <meta name="author" content="LocalPDF" />
        <meta name="language" content={currentLanguage} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "LocalPDF",
            "description": t('home.hero.description'),
            "url": "https://localpdf.online",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "permissions": "browser",
            "isAccessibleForFree": true,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Merge PDF files",
              "Split PDF documents",
              "Compress PDF files",
              "Add text to PDF",
              "Add watermarks",
              "Rotate PDF pages",
              "Extract pages",
              "Extract text",
              "PDF to images",
              "Images to PDF",
              "Word to PDF",
              "OCR recognition"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex flex-col">
      <ModernHeader />

      <main className="flex-grow">
        {/* Static Hero Section for Mobile Performance (80+ score target) */}
        <section className="relative overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent leading-tight px-2">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-200 mb-6 sm:mb-8 px-2">
                {t('home.hero.subtitle')}
              </p>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                {t('home.hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Bento Tools Grid - Modern asymmetric design */}
        <BentoToolsGrid />


        {/* Privacy Benefits Section - Disable animations on mobile */}
        <PrivacyBenefitsSection animated={!isMobile} />

        {/* Quick Start Guide Section - Disable animations on mobile */}
        <QuickStartSection animated={!isMobile} />

        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default HomePage;
