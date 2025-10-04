import React, { useState, useEffect } from 'react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernMergeTool, RelatedToolsSection } from '../../components/organisms';
import { ModernUploadZone } from '../../components/molecules';
import MergePDFUploadZone from '../../components/molecules/MergePDFUploadZone';
import { SemanticContent, SemanticTitle } from '../../components/molecules/SemanticContent';
import { useI18n } from '../../hooks/useI18n';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { useEntity } from '../../components/providers/EntityProvider';
import { entityHelper } from '../../utils/entityHelpers';

const MergePDFPage: React.FC = () => {
  const { t, language } = useI18n();
  const seoData = getToolSEOData('merge-pdf', language);
  const [toolActive, setToolActive] = useState(false);

  // Get entity data for semantic content
  const { entity, name, description, structuredData, keywords } = useEntity();

  // Get FAQ data for SEO schema
  const mergeFAQs = getCombinedFAQs('merge');

  // Generate AI-optimized FAQ content
  const aiOptimizedContent = entity ? entityHelper.getAIOptimizedContent(entity, language) : null;

  // Dynamic SEO updates
  useDynamicSEO('merge');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  // Auto-scroll to upload zone when page loads
  useEffect(() => {
    const scrollToUploadZone = () => {
      const uploadZone = document.getElementById('merge-upload-zone');

      if (uploadZone) {
        const rect = uploadZone.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const headerOffset = 120; // Space from top
        const targetPosition = rect.top + scrollTop - headerOffset;


        // Ensure we don't scroll above 0
        const finalPosition = Math.max(0, targetPosition);

        window.scrollTo({
          top: finalPosition,
          behavior: 'smooth'
        });
      }
    };

    // Single delayed scroll
    const timer = setTimeout(scrollToUploadZone, 800);
    return () => clearTimeout(timer);
  }, []);

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

  // Create the tool component based on state
  const toolComponent = !toolActive ? (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Zone */}
      <MergePDFUploadZone
        onFilesSelected={handleFileSelect}
        accept="application/pdf"
        acceptedTypes={['application/pdf']}
        multiple={true}
        maxSize={100 * 1024 * 1024}
        disabled={false}
        title={t('pages.tools.merge.uploadTitle')}
        subtitle={t('pages.tools.merge.uploadSubtitle')}
        supportedFormats={t('pages.tools.merge.supportedFormats')}
      />
      
      {/* File List & Start Button */}
      {files.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📄
            </div>
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">
                <SemanticContent
                  entity={entity || 'PDFProcessing'}
                  context="heading"
                  fallback={t('pages.tools.merge.selectedFiles')}
                /> ({files.length})
              </h3>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                <SemanticContent
                  entity={entity || 'PDFProcessing'}
                  context="description"
                  fallback={t('pages.tools.merge.readyToMerge')}
                  maxVariants={1}
                />
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
                      {(file.size / 1024 / 1024).toFixed(2)} {t('pages.tools.merge.fileSizeUnit')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  title={t('pages.tools.merge.removeFile')}
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
              <SemanticContent
                entity={entity || 'PDFProcessing'}
                context="body"
                fallback={t('pages.tools.merge.buttons.startMerging', { count: files.length })}
                maxVariants={1}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <ModernMergeTool
      files={files}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );

  // Enhanced SEO data with entity information
  const enhancedSEOData = {
    ...seoData,
    structuredData: entity ? structuredData : seoData.structuredData,
    keywords: entity ? keywords.primary.join(', ') : seoData.keywords,
    entityData: {
      primaryEntity: entity,
      name,
      description,
      semanticVariants: entity ? entityHelper.getSemanticVariants(entity, language) : []
    }
  };

  // Enhanced FAQ with AI-optimized questions
  const enhancedFAQs = [
    ...mergeFAQs.map(faq => ({
      question: faq.question,
      answer: faq.answer
    })),
    ...(aiOptimizedContent?.conversationalQueries.slice(0, 2).map(query => ({
      question: query,
      answer: description || t('pages.tools.merge.pageDescription')
    })) || [])
  ];

  return (
    <StandardToolPageTemplate
      seoData={enhancedSEOData}
      toolId="merge-pdf"
      faqSchema={enhancedFAQs}
      pageTitle={name ? `${name} - ${t('pages.tools.merge.pageTitle')}` : t('pages.tools.merge.pageTitle')}
      pageDescription={description || t('pages.tools.merge.pageDescription')}
      toolComponent={toolComponent}
      breadcrumbKey="merge-pdf"
      detailedContentKey="pages.tools.merge.detailed"
      relatedToolsSection={<RelatedToolsSection currentTool="merge-pdf" />}
    />
  );
};

export default MergePDFPage;
