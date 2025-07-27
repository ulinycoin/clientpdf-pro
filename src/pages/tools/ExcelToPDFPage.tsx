import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '../../hooks/useI18n';
import ExcelToPDFTool from '../../components/organisms/ExcelToPDFTool';
import SEOHead from '../../components/SEO/SEOHead';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import RelatedTools from '../../components/common/RelatedTools';

export const ExcelToPDFPage: React.FC = () => {
  const { t } = useI18n();

  const breadcrumbItems = [
    { label: t('seo.tools.excelToPdf.breadcrumbs.home'), href: '/' },
    { label: t('seo.tools.excelToPdf.breadcrumbs.excelToPdf') }
  ];

  const relatedTools = [
    {
      name: 'Word to PDF',
      description: 'Convert Word documents to PDF',
      href: '/tools/word-to-pdf',
      icon: '📄'
    },
    {
      name: 'Image to PDF',
      description: 'Convert images to PDF format',
      href: '/tools/image-to-pdf',
      icon: '🖼️'
    },
    {
      name: 'Merge PDF',
      description: 'Combine multiple PDF files',
      href: '/tools/merge-pdf',
      icon: '📑'
    },
    {
      name: 'Split PDF',
      description: 'Split PDF into separate files',
      href: '/tools/split-pdf',
      icon: '✂️'
    }
  ];

  return (
    <>
      <SEOHead
        title={t('seo.tools.excelToPdf.seo.title')}
        description={t('seo.tools.excelToPdf.seo.description')}
        keywords={t('seo.tools.excelToPdf.seo.keywords')}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: t('seo.tools.excelToPdf.seo.structuredData.name'),
          description: t('seo.tools.excelToPdf.seo.structuredData.description'),
          url: 'https://localpdf.online/tools/excel-to-pdf',
          applicationCategory: 'Utility',
          operatingSystem: 'Any',
          permissions: t('seo.tools.excelToPdf.seo.structuredData.permissions'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        }}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('seo.tools.excelToPdf.pageTitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('seo.tools.excelToPdf.pageDescription')}
            </p>
          </div>

          <ExcelToPDFTool />

          <div className="mt-16">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">
                {t('seo.tools.excelToPdf.howTo.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.howTo.steps.upload.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.howTo.steps.upload.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.howTo.steps.configure.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.howTo.steps.configure.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📥</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.howTo.steps.download.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.howTo.steps.download.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">
                {t('seo.tools.excelToPdf.features.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.features.privacy.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.features.privacy.description')}
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.features.multiSheet.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.features.multiSheet.description')}
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.features.international.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.features.international.description')}
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {t('seo.tools.excelToPdf.features.formatting.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('seo.tools.excelToPdf.features.formatting.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <RelatedTools tools={relatedTools} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExcelToPDFPage;
