import React, { useEffect } from 'react';
import { SEOHead } from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import SimpleOCRTool from '../../components/organisms/SimpleOCRTool';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { toolsSEOData } from '../../data/seoData';
import { useI18n } from '../../hooks/useI18n';

const OCRPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.ocrPdf;

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

      <Header />

      <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t('pages.tools.ocr.breadcrumbs.home'), href: '/' },
            { label: t('pages.tools.ocr.breadcrumbs.ocr'), href: '/ocr-pdf' }
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pages.tools.ocr.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.tools.ocr.pageDescription')}
          </p>
        </div>

        {/* Main OCR Tool */}
        <SimpleOCRTool />

        {/* Quick Features */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.ocr.features.private.title')}</h3>
              <p className="text-sm text-gray-600">{t('pages.tools.ocr.features.private.description')}</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🇷🇺</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.ocr.features.russian.title')}</h3>
              <p className="text-sm text-gray-600">{t('pages.tools.ocr.features.russian.description')}</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.ocr.features.fast.title')}</h3>
              <p className="text-sm text-gray-600">{t('pages.tools.ocr.features.fast.description')}</p>
            </div>
          </div>
        </div>

        {/* Supported Languages */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {t('pages.tools.ocr.languages.title')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm">
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇷🇺</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.russian')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇺🇸</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.english')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇩🇪</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.german')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇫🇷</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.french')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇪🇸</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.spanish')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇮🇹</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.italian')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇵🇱</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.polish')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇺🇦</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.ukrainian')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇳🇱</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.dutch')}</span>
            </div>
            <div className="p-2 bg-white rounded border">
              <span className="text-lg block mb-1">🇵🇹</span>
              <span className="font-medium">{t('pages.tools.ocr.languages.items.portuguese')}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OCRPDFPage;
