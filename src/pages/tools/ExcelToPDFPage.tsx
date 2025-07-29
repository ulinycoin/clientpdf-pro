import React, { useEffect } from 'react';
import { SEOHead } from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import ExcelToPDFTool from '../../components/organisms/ExcelToPDFTool';
import { Breadcrumbs } from '../../components/common';
import { RelatedTools } from '../../components/common';
import { toolsSEOData } from '../../data/seoData';
import { useTranslation, useI18n } from '../../hooks/useI18n';

const ExcelToPDFPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const seoData = toolsSEOData.excelToPdf;

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
              {t('tools.excelToPdf.description')} - Convert your Excel spreadsheets to professional PDF documents with support for multiple sheets, wide tables, and international text. All processing happens locally for maximum privacy.
            </p>
          </div>

          <ExcelToPDFTool />

          <div className="mt-12 max-w-4xl mx-auto">
            <div className="pdf-processing-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                How to Convert Excel to PDF
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Upload Excel File</h3>
                  <p className="text-secondary-600 text-sm">
                    Select your Excel file (.xlsx or .xls) from your device. Files are processed locally for maximum privacy.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Configure Settings</h3>
                  <p className="text-secondary-600 text-sm">
                    Choose which sheets to convert, set orientation, and adjust formatting options to match your needs.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📥</span>
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Download PDF</h3>
                  <p className="text-secondary-600 text-sm">
                    Get your converted PDF files instantly. Each sheet can be saved as a separate PDF or combined into one.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/20 pt-8">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  Why Choose LocalPDF Excel Converter?
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                        🔒
                      </span>
                      100% Private & Secure
                    </h4>
                    <p className="text-secondary-600 text-sm">
                      Your Excel files never leave your device. All conversion happens locally in your browser for maximum privacy and security.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        ⚡
                      </span>
                      Lightning Fast Processing
                    </h4>
                    <p className="text-secondary-600 text-sm">
                      Convert Excel files to PDF instantly without waiting for uploads or downloads. Works offline too.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        📋
                      </span>
                      Multiple Formats Support
                    </h4>
                    <p className="text-secondary-600 text-sm">
                      Works with both .xlsx and .xls files. Supports multiple sheets, complex formulas, and international text.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2 flex items-center">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        🆓
                      </span>
                      Completely Free
                    </h4>
                    <p className="text-secondary-600 text-sm">
                      No limits, no watermarks, no hidden fees. Convert unlimited Excel files to PDF for free, forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RelatedTools currentTool="excel-to-pdf" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ExcelToPDFPage;
