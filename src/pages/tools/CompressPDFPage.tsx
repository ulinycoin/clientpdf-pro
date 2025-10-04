import React, { useState, useEffect } from 'react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernCompressionTool, RelatedToolsSection } from '../../components/organisms';
import ToolUploadZone from '../../components/molecules/ToolUploadZone';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { PDFProcessingResult } from '../../types';
import { Download, CheckCircle, FileDown } from 'lucide-react';

const CompressPDFPage: React.FC = () => {
  const { t, language } = useI18n();
  const seoData = getToolSEOData('compress', language);
  const [toolActive, setToolActive] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  // Get FAQ data for SEO schema
  const compressFAQs = getCombinedFAQs('compress');

  // Dynamic SEO updates
  useDynamicSEO('compress');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    // Compression tool works with single file
    addFiles([selectedFiles[0]]);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = (result: any) => {
    // ModernCompressionTool passes PDFProcessingResult, not Blob directly
    if (result && result.success && result.data) {
      setResult(result.data as Blob);
    } else if (result instanceof Blob) {
      // Fallback if it's already a Blob
      setResult(result);
    }
    setToolActive(false);

    // Auto-scroll to results after compression is complete
    setTimeout(() => {
      const resultsSection = document.querySelector('[data-results-section]');
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleReset = () => {
    setResult(null);
    clearFiles();
  };

  const downloadFile = () => {
    if (result && result instanceof Blob) {
      try {
        const url = URL.createObjectURL(result);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename for compressed file
        const originalName = files[0]?.name || 'document';
        const baseName = originalName.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_compressed.pdf`;
        
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    } else {
      console.error('No valid blob result available for download');
    }
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Auto scroll to upload zone on component mount
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

  // Create the tool component based on state
  const toolComponent = (() => {
    // Show results if we have them
    if (result) {
      const originalSize = files[0]?.size || 0;
      const compressedSize = result.size;
      
      return (
        <div className="max-w-4xl mx-auto space-y-8" data-results-section>
          {/* Success Header */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-green-800 dark:text-green-200">
                  {t('tools.compress.successTitle')}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  {originalSize > 0 && compressedSize > 0
                    ? `${t('tools.compress.sizeReduced')} ${(originalSize / 1024 / 1024).toFixed(2)} ${t('tools.compress.fileSizeUnit')} ${t('tools.compress.to')} ${(compressedSize / 1024 / 1024).toFixed(2)} ${t('tools.compress.fileSizeUnit')}`
                    : t('tools.compress.readyForDownload')
                  }
                </p>
              </div>
            </div>

            {/* Download Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-black dark:text-white">{t('tools.compress.downloadCompressed')}</h4>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-xl flex items-center justify-center text-xl">
                    🗜️
                  </div>
                  <div>
                    <p className="font-black text-black dark:text-white">
                      {files[0]?.name ? files[0].name.replace(/\.pdf$/i, '_compressed.pdf') : 'compressed.pdf'}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {compressedSize > 0 ? `${(compressedSize / 1024 / 1024).toFixed(2)} ${t('tools.compress.fileSizeUnit')}` : t('tools.compress.readyForDownload')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadFile}
                  className="btn-privacy-modern text-sm px-6 py-3 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('tools.compress.download')}
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-6 mt-6 border-t border-white/20 dark:border-gray-600/20">
              <button
                onClick={handleReset}
                className="btn-privacy-secondary text-lg px-8 py-4"
              >
                {t('tools.compress.compressAnother')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show tool if active
    if (toolActive) {
      return (
        <ModernCompressionTool
          files={files}
          onComplete={handleToolComplete}
          onClose={handleToolClose}
        />
      );
    }

    // Show upload interface
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Upload Zone */}
        <ToolUploadZone
          onFilesSelected={handleFileSelect}
          title={t('tools.compress.uploadTitle')}
          subtitle={t('tools.compress.uploadSubtitle')}
          supportedFormats={t('tools.compress.supportedFormats')}
          gradientFrom="green-500"
          gradientTo="green-600"
          IconComponent={FileDown}
          accept="application/pdf"
          acceptedTypes={['application/pdf']}
          multiple={false}
          maxSize={100 * 1024 * 1024}
          disabled={false}
          toolId="compress-pdf"
        />
        
        {/* File List & Start Button */}
        {files.length > 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                🗜️
              </div>
              <div>
                <h3 className="text-xl font-black text-black dark:text-white">
                  {t('tools.compress.selectedFile')} ({files.length})
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  {t('tools.compress.readyToCompress')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800 dark:to-orange-700 rounded-xl flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div>
                      <p className="font-black text-black dark:text-white">{file.name}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(file.size / 1024 / 1024).toFixed(2)} {t('tools.compress.fileSizeUnit')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title={t('tools.compress.removeFile')}
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
                {t('tools.compress.compressPdfFile')} 🗜️
              </button>
            </div>
          </div>
        )}
      </div>
    );
  })();

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="compress-pdf"
      faqSchema={compressFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('tools.compress.pageTitle')}
      pageDescription={t('tools.compress.pageDescription')}
      toolComponent={toolComponent}
      breadcrumbKey="compress-pdf"
      detailedContentKey="tools.compress.detailed"
      relatedToolsSection={<RelatedToolsSection currentTool="compress-pdf" />}
    />
  );
};

export default CompressPDFPage;