import React, { useEffect } from 'react';
import { SEOHead } from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import ImageToPDFToolWrapper from '../../components/organisms/ImageToPDFToolWrapper';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import TwitterCardImage from '../../components/TwitterCardImage/TwitterCardImage';
import { toolsSEOData } from '../../data/seoData';
import { useI18n } from '../../hooks/useI18n';

const ImageToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.imagesToPdf;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col">
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
      />
      <TwitterCardImage toolId="images-to-pdf" />

      <Header />

      <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t('pages.tools.imageToPdf.breadcrumbs.home'), href: '/' },
            { label: t('pages.tools.imageToPdf.breadcrumbs.imageToPdf'), href: '/images-to-pdf' }
          ]}
          className="mb-6"
        />

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pages.tools.imageToPdf.pageTitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pages.tools.imageToPdf.pageDescription')}
            </p>
          </div>

          {/* Tool Component */}
          <ImageToPDFToolWrapper />

          {/* Features Section */}
          <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {t('pages.tools.imageToPdf.features.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.features.private.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.features.private.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.features.formats.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.features.formats.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.features.customizable.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.features.customizable.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.features.fast.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.features.fast.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.features.free.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.features.free.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.features.crossPlatform.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.features.crossPlatform.description')}
                </p>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {t('pages.tools.imageToPdf.howTo.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.howTo.steps.upload.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.howTo.steps.upload.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.howTo.steps.customize.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.howTo.steps.customize.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.tools.imageToPdf.howTo.steps.download.title')}</h3>
                <p className="text-gray-600">
                  {t('pages.tools.imageToPdf.howTo.steps.download.description')}
                </p>
              </div>
            </div>
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default ImageToPDFPage;
