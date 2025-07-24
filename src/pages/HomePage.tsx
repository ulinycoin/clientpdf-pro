import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation, useI18n } from '../hooks/useI18n';
import {
  Header,
  Footer,
  ToolsGrid
} from '../components/organisms';
import PrivacyBadge from '../components/molecules/PrivacyBadge';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();

  return (
    <>
      <Helmet>
        <title>LocalPDF - {t('home.hero.subtitle')} | Free Privacy-First PDF Tools</title>
        <meta name="description" content={`${t('home.hero.description')} - ${t('home.hero.descriptionSecondary')}`} />
        <meta name="robots" content="index, follow" />
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

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Enhanced Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Enhanced Hero Header */}
          <div className="text-center mb-16 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
            </div>

            {/* Main hero content */}
            <div className="relative px-8 py-8">
              {/* Main title with gradient */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-gradient-blue">
                  {t('home.hero.title')}
                </span>
                <br />
                <span className="text-secondary-800 text-2xl md:text-3xl font-semibold">
                  {t('home.hero.subtitle')}
                </span>
              </h1>

              {/* Enhanced description */}
              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-secondary-700 mb-4 leading-relaxed">
                  {t('home.hero.description')}
                </p>
                <p className="text-lg text-secondary-600">
                  {t('home.hero.descriptionSecondary')}
                </p>
              </div>

              {/* Enhanced feature highlights */}
              <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                <PrivacyBadge
                  icon="shield"
                  title="Your files never leave your device"
                  subtitle="100% local processing"
                  variant="success"
                  animated={true}
                />
                <PrivacyBadge
                  icon="zap"
                  title="Lightning fast processing"
                  subtitle="No server delays"
                  variant="primary"
                />
                <PrivacyBadge
                  icon="heart"
                  title="Completely free, no limits"
                  subtitle="Open source forever"
                  variant="blue"
                />
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-secondary-500">
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-success-500 rounded-full pdf-status-indicator"></span>
                  <span>No registration required</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full pdf-status-indicator"></span>
                  <span>Works offline</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full pdf-status-indicator"></span>
                  <span>Open source</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <ToolsGrid disabledTools={[]} />
        </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
