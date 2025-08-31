import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Home, Search, FileText } from 'lucide-react';
import { useTranslation, useI18n } from '../hooks/useI18n';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  
  // Helper function to create localized paths
  const getLocalizedPath = (path: string) => {
    if (currentLanguage === 'en') {
      return path;
    }
    return `/${currentLanguage}${path}`;
  };
  
  const popularTools = [
    { name: t('tools.merge.title'), path: getLocalizedPath('/merge-pdf'), icon: '🔗', description: t('tools.merge.description') },
    { name: t('tools.split.title'), path: getLocalizedPath('/split-pdf'), icon: '✂️', description: t('tools.split.description') },
    { name: t('tools.compress.title'), path: getLocalizedPath('/compress-pdf'), icon: '🗜️', description: t('tools.compress.description') },
    { name: t('tools.addText.title'), path: getLocalizedPath('/add-text-pdf'), icon: '📝', description: t('tools.addText.description') }
  ];

  return (
    <>
      <Helmet>
        <title>{t('pages.notFound.title')} - LocalPDF | Free Privacy-First PDF Tools</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore LocalPDF's free privacy-first PDF tools for merging, splitting, compressing, and editing PDF files." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://localpdf.online/404" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Page Not Found - LocalPDF" />
        <meta property="og:description" content="Explore LocalPDF's free privacy-first PDF tools for all your document needs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://localpdf.online/404" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Page Not Found - LocalPDF" />
        <meta name="twitter:description" content="Explore LocalPDF's free privacy-first PDF tools." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* 404 Hero Section */}
            <div className="mb-12">
              <div className="text-8xl font-bold text-blue-600 mb-4 opacity-20">
                404
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                {t('pages.notFound.title')}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('pages.notFound.description')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to={getLocalizedPath("/")}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                {t('pages.notFound.backHome')}
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>

            {/* Popular Tools Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
                <Search className="w-6 h-6 mr-3 text-blue-600" />
                Try Our Popular PDF Tools
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularTools.map((tool, index) => (
                  <Link
                    key={index}
                    to={tool.path}
                    className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {tool.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Why LocalPDF Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Why Choose LocalPDF?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="text-center">
                  <div className="text-2xl mb-3">🔒</div>
                  <h3 className="font-semibold text-gray-800 mb-2">100% Private</h3>
                  <p className="text-sm text-gray-600">
                    All processing happens in your browser. Your files never leave your device.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Lightning Fast</h3>
                  <p className="text-sm text-gray-600">
                    Modern web technology ensures quick processing without server delays.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-3">🆓</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Completely Free</h3>
                  <p className="text-sm text-gray-600">
                    No subscriptions, no limits, no hidden costs. All tools are free forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Need help? Check out our{' '}
                <Link to={getLocalizedPath("/faq")} className="text-blue-600 hover:underline">
                  FAQ page
                </Link>{' '}
                or learn about our{' '}
                <Link to={getLocalizedPath("/privacy")} className="text-blue-600 hover:underline">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;