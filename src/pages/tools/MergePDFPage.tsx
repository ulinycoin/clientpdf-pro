import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import FAQSection from '../../components/common/FAQSection';
import MergeTool from '../../components/organisms/MergeTool';
import UploadSection from '../../components/molecules/UploadSection';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

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

  return (
    <>
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
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          {/* Page Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pages.tools.merge.pageTitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pages.tools.merge.pageDescription')}
            </p>
          </header>

        {/* Tool Section */}
        <section className="mb-12">
          {!toolActive ? (
            <div className="max-w-2xl mx-auto">
              <UploadSection
                onFilesSelected={handleFileSelect}
                accept="application/pdf"
                acceptedTypes={['application/pdf']}
                multiple={true}
                maxSize={100 * 1024 * 1024}
                disabled={false}
                title={t('pages.tools.merge.uploadTitle')}
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
                          {t('pages.tools.merge.buttons.remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setToolActive(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {t('pages.tools.merge.buttons.startMerging', { count: files.length })}
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
        </section>

        {/* How-to Section - only show when tool is not active */}
        {!toolActive && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t('pages.tools.merge.howTo.title')}
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('pages.tools.merge.howTo.steps.upload.title')}</h3>
                    <p className="text-gray-600">{t('pages.tools.merge.howTo.steps.upload.description')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('pages.tools.merge.howTo.steps.arrange.title')}</h3>
                    <p className="text-gray-600">{t('pages.tools.merge.howTo.steps.arrange.description')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('pages.tools.merge.howTo.steps.download.title')}</h3>
                    <p className="text-gray-600">{t('pages.tools.merge.howTo.steps.download.description')}</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>
        )}

        {/* FAQ Section - only show when tool is not active */}
        {!toolActive && (
          <FAQSection
            title="Frequently Asked Questions about PDF Merging"
            faqs={getCombinedFAQs('merge')}
            className="mb-8"
            defaultOpen={false}
          />
        )}

        {/* Related Tools - only show when tool is not active */}
        {!toolActive && (
          <RelatedTools currentTool="merge" className="mb-8" />
        )}
      </main>

      <Footer />
    </div>
    </>
  );
};

export default MergePDFPage;
