import React, { useState, useEffect } from 'react';
import { toolsSEOData } from '../../data/seoData';
import SEOHead from '../../components/SEO/SEOHead';
import { Header, Footer } from '../../components/organisms';
import RelatedTools from '../../components/common/RelatedTools';
import SplitTool from '../../components/organisms/SplitTool';
import UploadSection from '../../components/molecules/UploadSection';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { PDFProcessingResult } from '../../types';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';

const SplitPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.split;
  const [toolActive, setToolActive] = useState(false);

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

  const handleToolComplete = (results: PDFProcessingResult[]) => {
    console.log('handleToolComplete called with:', results);

    // Download all successful split results
    const successfulResults = results.filter(result => result.success && result.data);
    console.log('Successful results for download:', successfulResults);

    if (successfulResults.length > 0) {
      successfulResults.forEach((result, index) => {
        console.log(`Processing result ${index}:`, result);

        if (result.data instanceof Blob) {
          const originalFilename = files[0]?.name || 'document.pdf';
          let filename: string;

          if (result.metadata?.pageNumber) {
            // Single page
            filename = generateFilename(originalFilename, `page_${result.metadata.pageNumber}`);
          } else if (result.metadata?.startPage && result.metadata?.endPage) {
            // Page range
            filename = generateFilename(originalFilename, `pages_${result.metadata.startPage}-${result.metadata.endPage}`);
          } else {
            // Fallback
            filename = generateFilename(originalFilename, `split_${index + 1}`);
          }

          console.log(`Downloading file ${index}: ${filename}`);

          // Stagger downloads to avoid browser blocking
          setTimeout(() => {
            downloadBlob(result.data as Blob, filename);
          }, index * 200);
        } else {
          console.error('Result data is not a Blob:', result.data);
        }
      });
    } else {
      console.warn('No successful results to download');
    }

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
      />

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
          {/* Page Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pages.tools.split.pageTitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pages.tools.split.pageDescription')}
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
                multiple={false}
                maxSize={100 * 1024 * 1024}
                disabled={false}
                title={t('pages.tools.split.uploadTitle')}
                subtitle="Extract specific pages from your PDF document"
                emoji="✂️"
                supportedFormats="PDF files"
              />

              {files.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 text-lg">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{files[0].name}</p>
                        <p className="text-sm text-gray-500">
                          {(files[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setToolActive(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
{t('pages.tools.split.buttons.startSplitting')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SplitTool
              files={files}
              onComplete={handleToolComplete}
              onClose={handleToolClose}
            />
          )}
        </section>

        {/* Features Section - only show when tool is not active */}
        {!toolActive && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {t('pages.tools.split.features.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('pages.tools.split.features.pageRanges.title')}
                </h3>
                <p className="text-gray-600">
                  {t('pages.tools.split.features.pageRanges.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('pages.tools.split.features.batchProcessing.title')}
                </h3>
                <p className="text-gray-600">
                  {t('pages.tools.split.features.batchProcessing.description')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('pages.tools.split.features.previewMode.title')}
                </h3>
                <p className="text-gray-600">
                  {t('pages.tools.split.features.previewMode.description')}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Related Tools - only show when tool is not active */}
        {!toolActive && (
          <RelatedTools currentTool="split" className="mb-8" />
        )}
      </main>

      <Footer />
    </div>
    </>
  );
};

export default SplitPDFPage;
