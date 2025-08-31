import React, { useState } from 'react';
import { toolsSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import AddTextTool from '../../components/organisms/AddTextTool';
import { RelatedToolsSection } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import { useI18n } from '../../hooks/useI18n';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';

const AddTextPDFPage: React.FC = () => {
  const { t } = useI18n();
  const seoData = toolsSEOData.addText;
  const [toolActive, setToolActive] = useState(false);

  // Get FAQ data for SEO schema
  const addTextFAQs = getCombinedFAQs('add-text');

  // Dynamic SEO updates
  useDynamicSEO('addText');

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

  const handleToolComplete = (result: Blob) => {
    console.log('Add text completed:', result);
    
    // Download the processed PDF
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `text-added-${files[0]?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
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
      <ModernUploadZone
        onFilesSelected={handleFileSelect}
        accept="application/pdf"
        acceptedTypes={['application/pdf']}
        multiple={false}
        maxSize={100 * 1024 * 1024}
        disabled={false}
        title={t('tools.addText.uploadTitle')}
        subtitle={t('tools.addText.uploadSubtitle')}
        supportedFormats={t('tools.addText.supportedFormats')}
        icon="✏️"
      />
      
      {/* File List & Start Button */}
      {files.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              ✏️
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                {t('tools.addText.selectedFile')}
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                {t('tools.addText.readyForEditing')}
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
                      {(file.size / 1024 / 1024).toFixed(2)} {t('tools.addText.fileSizeUnit')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title={t('tools.addText.removeFile')}
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
              {t('tools.addText.editPdf')}
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <AddTextTool
      files={files}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="add-text-pdf"
      faqSchema={addTextFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('tools.addText.pageTitle')}
      pageDescription={t('tools.addText.pageDescription')}
      toolComponent={toolComponent}
      breadcrumbKey="add-text-pdf"
      relatedToolsSection={<RelatedToolsSection currentTool="add-text-pdf" />}
    />
  );
};

export default AddTextPDFPage;
