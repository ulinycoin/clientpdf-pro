import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernWordToPDFTool, RelatedToolsSection } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const WordToPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.wordToPdf;
  const [toolActive, setToolActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get FAQ data for SEO schema
  const wordToPdfFAQs = getCombinedFAQs('word-to-pdf');

  // Dynamic SEO updates
  useDynamicSEO('word-to-pdf');

  const handleFileSelect = (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (file) {
      setSelectedFile(file);
      setToolActive(true);
    }
  };

  const handleToolComplete = () => {
    setToolActive(false);
    setSelectedFile(null);
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Create the tool component based on state
  const toolComponent = !toolActive ? (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Zone */}
      <ModernUploadZone
        onFilesSelected={handleFileSelect}
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        acceptedTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx']}
        multiple={false}
        maxFiles={1}
        maxSize={100 * 1024 * 1024}
        disabled={false}
        title={t('pages.tools.wordToPdf.uploadTitle')}
        subtitle={t('pages.tools.wordToPdf.uploadSubtitle')}
        supportedFormats={t('pages.tools.wordToPdf.supportedFormats')}
      />

      {/* File Selected & Start Button */}
      {selectedFile && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📝
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                {t('pages.tools.wordToPdf.tool.fileInfo.fileName')}: {selectedFile.name}
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                {Math.round(selectedFile.size / 1024)} KB - {t('pages.tools.wordToPdf.tool.fileInfo.microsoftWord')}
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center text-xl">
                📝
              </div>
              <div>
                <p className="font-black text-black dark:text-white">{selectedFile.name}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title={t('pages.tools.wordToPdf.tool.buttons.chooseDifferent')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setToolActive(true)}
              className="btn-privacy-modern text-lg px-8 py-4 min-w-[250px] ripple-effect btn-press"
            >
              {t('pages.tools.wordToPdf.tool.buttons.convertToPdf')} 📄
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <ModernWordToPDFTool 
      initialFile={selectedFile}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="word-to-pdf"
      faqSchema={wordToPdfFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('pages.tools.wordToPdf.pageTitle')}
      pageDescription={t('pages.tools.wordToPdf.pageDescription')}
      toolComponent={toolComponent}
      breadcrumbKey="word-to-pdf"
      relatedToolsSection={<RelatedToolsSection currentTool="word-to-pdf" />}
    />
  );
};

export default WordToPDFPage;