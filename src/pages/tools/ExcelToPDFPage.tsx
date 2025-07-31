import React, { useEffect } from 'react';
import { SEOHead } from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import ExcelToPDFTool from '../../components/organisms/ExcelToPDFTool';
import { Breadcrumbs } from '../../components/common';
import { RelatedTools } from '../../components/common';
import FAQSection from '../../components/common/FAQSection';
import { toolsSEOData } from '../../data/seoData';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import { getCombinedFAQs } from '../../data/faqData';

const ExcelToPDFPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const seoData = toolsSEOData.excelToPdf;

  // Get FAQ data for SEO schema
  const excelFAQs = getCombinedFAQs('excel-to-pdf');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const breadcrumbItems = [
    { label: t('common.home'), href: '/' },
    { label: t('tools.excelToPdf.title'), href: '/excel-to-pdf' }
  ];

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
        faqSchema={excelFAQs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))}
      />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              <span className="text-gradient-blue">{t('tools.excelToPdf.title')}</span>
            </h1>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              {t('tools.excelToPdf.pageDescription')}
            </p>
          </div>

          <ExcelToPDFTool />

          {/* How-to Section */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('tools.excelToPdf.howToTitle')}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('tools.excelToPdf.uploadTitle')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('tools.excelToPdf.uploadDescription')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('tools.excelToPdf.configureTitle')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('tools.excelToPdf.configureDescription')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('tools.excelToPdf.downloadTitle')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('tools.excelToPdf.downloadDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQSection
            title="Frequently Asked Questions about Excel to PDF Conversion"
            faqs={excelFAQs}
            className="mb-8"
            defaultOpen={false}
          />

          <RelatedTools currentTool="excel-to-pdf" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ExcelToPDFPage;
