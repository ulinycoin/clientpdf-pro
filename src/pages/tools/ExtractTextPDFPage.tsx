import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import ExtractTextTool from '../../components/organisms/ExtractTextTool';
import { RelatedToolsSection } from '../../components/organisms';
import { ToolUploadZone } from '../../components/molecules';
import { useI18n } from '../../hooks/useI18n';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const ExtractTextPDFPage: React.FC = () => {
  const { t, language } = useI18n();
  const seoData = getToolSEOData('extractText', language);
  const [toolActive, setToolActive] = useState(false);

  // Get FAQ data for SEO schema
  const extractTextFAQs = getCombinedFAQs('extract-text');

  // Dynamic SEO updates
  useDynamicSEO('extractText');

  // Auto-scroll to upload zone
  useEffect(() => {
    const scrollToUploadZone = () => {
      const uploadZone = document.getElementById('tool-upload-zone');
      if (uploadZone) {
        const rect = uploadZone.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const headerOffset = 120;
        const targetPosition = rect.top + scrollTop - headerOffset;
        const finalPosition = Math.max(0, targetPosition);

        window.scrollTo({
          top: finalPosition,
          behavior: 'smooth'
        });
      }
    };

    const timer = setTimeout(scrollToUploadZone, 800);
    return () => clearTimeout(timer);
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

  const handleToolComplete = (result: any) => {
    console.log('Extract text completed:', result);
    setToolActive(false);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Create the tool component based on state
  const toolComponent = !toolActive ? (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Zone */}
      <ToolUploadZone
        onFilesSelected={handleFileSelect}
        title={t('pages.tools.extractText.uploadTitle')}
        subtitle={t('pages.tools.extractText.uploadSubtitle')}
        supportedFormats={t('pages.tools.extractText.supportedFormats')}
        gradientFrom="rose-500"
        gradientTo="rose-600"
        IconComponent={FileText}
        accept="application/pdf"
        acceptedTypes={['application/pdf']}
        multiple={false}
        maxSize={100 * 1024 * 1024}
        disabled={false}
        toolId="extract-text-pdf"
      />
      
      {/* File List & Start Button */}
      {files.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📝
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                {t('pages.tools.extractText.selectedFile')}
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                {t('pages.tools.extractText.readyToExtract')}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center text-xl">
                    📄
                  </div>
                  <div>
                    <p className="font-black text-black dark:text-white">{file.name}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {(file.size / 1024 / 1024).toFixed(2)} {t('common.fileSizeUnit')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title={t('pages.tools.extractText.removeFile')}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setToolActive(true)}
              className="btn-privacy-modern text-lg px-8 py-4 min-w-[250px] ripple-effect btn-press"
            >
              {t('pages.tools.extractText.extractTextButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <ExtractTextTool
      files={files}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="extract-text-pdf"
      faqSchema={extractTextFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('pages.tools.extractText.pageTitle') || 'Извлечь текст из PDF'}
      pageDescription={t('pages.tools.extractText.pageDescription') || 'Извлекайте весь текстовый контент из PDF документов в удобном формате'}
      toolComponent={toolComponent}
      breadcrumbKey="extract-text-pdf"
      relatedToolsSection={<RelatedToolsSection currentTool="extract-text-pdf" />}
    />
  );
};

export default ExtractTextPDFPage;
