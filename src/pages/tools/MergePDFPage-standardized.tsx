import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import { Breadcrumbs } from '../../components/common';
import RelatedTools from '../../components/common/RelatedTools';
import FAQSection from '../../components/common/FAQSection';
import MergeTool from '../../components/organisms/MergeTool';
import UploadSection from '../../components/molecules/UploadSection';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

/**
 * MergePDFPage - Стандартизированная страница объединения PDF
 * Приведена к единому стандарту на основе ExcelToPDFPage
 */
const MergePDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.merge;
  const [toolActive, setToolActive] = useState(false);

  // Get FAQ data for SEO schema
  const mergeFAQs = getCombinedFAQs('merge');

  // Dynamic SEO updates
  useDynamicSEO('merge');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = () => {
    setToolActive(false);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // СТАНДАРТНЫЕ breadcrumbs
  const breadcrumbItems = [
    { label: t('common.home'), href: '/' },
    { label: t('tools.merge.title'), href: '/merge-pdf' }
  ];

  return (
    <>
      {/* СТАНДАРТНЫЙ SEO HEAD */}
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
        faqSchema={mergeFAQs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))}
      />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        {/* СТАНДАРТНЫЙ HEADER */}
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          {/* СТАНДАРТНЫЕ BREADCRUMBS */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* СТАНДАРТНЫЙ PAGE TITLE & DESCRIPTION */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              <span className="text-gradient-blue">{t('tools.merge.title')}</span>
            </h1>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              {t('tools.merge.pageDescription')}
            </p>
          </div>

          {/* TOOL COMPONENT - только показываем, когда инструмент не активен, или активный инструмент */}
          {!toolActive ? (
            <div className="max-w-2xl mx-auto mb-12">
              <UploadSection
                onFilesSelected={handleFileSelect}
                accept="application/pdf"
                acceptedTypes={['application/pdf']}
                multiple={true}
                maxSize={100 * 1024 * 1024}
                disabled={false}
                title="Upload PDF Files to Merge"
                subtitle="Combine multiple PDFs into one document"
                emoji="📄"
                supportedFormats="PDF files"
              />

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-lg">📄</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setToolActive(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start Merging ({files.length} files)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <MergeTool
              files={files}
              onComplete={handleToolComplete}
              onClose={handleToolClose}
            />
          )}

          {/* СТАНДАРТНЫЙ HOW-TO SECTION - только показываем, когда инструмент не активен */}
          {!toolActive && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {t('tools.merge.howTo.title')}
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📤</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.howTo.steps.upload.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('tools.merge.howTo.steps.upload.description')}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⚙️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.howTo.steps.configure.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('tools.merge.howTo.steps.configure.description')}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📥</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.howTo.steps.download.title')}</h3>
                    <p className="text-gray-600 text-sm">
                      {t('tools.merge.howTo.steps.download.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* СТАНДАРТНЫЙ FEATURES SECTION - только показываем, когда инструмент не активен */}
          {!toolActive && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {t('tools.merge.features.title')}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Feature 1 - Privacy */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🔒</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.features.privacy.title')}</h3>
                      <p className="text-gray-600 text-sm">{t('tools.merge.features.privacy.description')}</p>
                    </div>
                  </div>

                  {/* Feature 2 - Fast */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.features.fast.title')}</h3>
                      <p className="text-gray-600 text-sm">{t('tools.merge.features.fast.description')}</p>
                    </div>
                  </div>

                  {/* Feature 3 - Quality */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.features.quality.title')}</h3>
                      <p className="text-gray-600 text-sm">{t('tools.merge.features.quality.description')}</p>
                    </div>
                  </div>

                  {/* Feature 4 - Free */}
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🆓</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{t('tools.merge.features.free.title')}</h3>
                      <p className="text-gray-600 text-sm">{t('tools.merge.features.free.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* СТАНДАРТНЫЙ FAQ SECTION - только показываем, когда инструмент не активен */}
          {!toolActive && (
            <FAQSection
              title={t('tools.merge.faqTitle')}
              faqs={mergeFAQs}
              className="mb-8"
              defaultOpen={false}
            />
          )}

          {/* СТАНДАРТНЫЙ RELATED TOOLS - только показываем, когда инструмент не активен */}
          {!toolActive && (
            <RelatedTools currentTool="merge" className="mb-8" />
          )}
        </main>

        {/* СТАНДАРТНЫЙ FOOTER */}
        <Footer />
      </div>
    </>
  );
};

export default MergePDFPage;
