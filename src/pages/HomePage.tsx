import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation, useI18n } from '../hooks/useI18n';
// Cache bust v1
import {
  ModernHeader,
  ModernFooter,
  BentoToolsGrid,
  InteractiveHeroSection,
  PrivacyBenefitsSection,
  QuickStartSection
} from '../components/organisms';
// Removed PrivacyBadge - using InteractiveHeroSection instead

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  

  return (
    <>
      <Helmet>
        <title>LocalPDF - {t('home.hero.subtitle')} | Free Privacy-First PDF Tools</title>
        <meta name="description" content={`${t('home.hero.description')} - ${t('home.hero.descriptionSecondary')}`} />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="34adca022b79f1a0" />
        <link rel="canonical" href="https://localpdf.online/" />

        {/* Open Graph */}
        <meta property="og:title" content={`LocalPDF - ${t('home.hero.subtitle')}`} />
        <meta property="og:description" content={t('home.hero.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://localpdf.online/" />
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
        {/* Enhanced Interactive Hero Section */}
        <InteractiveHeroSection
          title={t('home.hero.title')}
          subtitle={t('home.hero.subtitle')}
          description={t('home.hero.description')}
          showStats={true}
          animated={true}
        />

        {/* Bento Tools Grid - Modern asymmetric design */}
        <BentoToolsGrid />

        {/* Privacy Benefits Section */}
        <PrivacyBenefitsSection animated={true} />

        {/* Quick Start Guide Section */}
        <QuickStartSection animated={true} />

        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default HomePage;
