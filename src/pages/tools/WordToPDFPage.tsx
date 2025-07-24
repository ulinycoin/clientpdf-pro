import React, { useEffect } from 'react';
import { SEOHead } from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import { WordToPDFTool } from '../../features/word-to-pdf';
import { Breadcrumbs } from '../../components/common';
import { RelatedTools } from '../../components/common';
import { toolsSEOData } from '../../data/seoData';
import { useI18n } from '../../hooks/useI18n';

const WordToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.wordToPdf;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const breadcrumbItems = [
    { label: t('pages.tools.wordToPdf.breadcrumbs.home'), href: '/' },
    { label: t('pages.tools.wordToPdf.breadcrumbs.wordToPdf'), href: '/word-to-pdf' }
  ];

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
      />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pages.tools.wordToPdf.pageTitle')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('pages.tools.wordToPdf.pageDescription')}
            </p>
          </div>

          <WordToPDFTool />

          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('pages.tools.wordToPdf.howTo.title')}</h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.howTo.steps.choose.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.howTo.steps.choose.description')}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.howTo.steps.convert.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.howTo.steps.convert.description')}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.howTo.steps.download.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.howTo.steps.download.description')}</p>
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('pages.tools.wordToPdf.features.title')}</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.features.privacy.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.features.privacy.description')}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.features.fast.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.features.fast.description')}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.features.compatible.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.features.compatible.description')}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('pages.tools.wordToPdf.features.quality.title')}</h4>
                    <p className="text-gray-600 text-sm">{t('pages.tools.wordToPdf.features.quality.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RelatedTools currentTool="word-to-pdf" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WordToPDFPage;
