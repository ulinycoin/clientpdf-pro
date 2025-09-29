import React, { useState, useEffect } from 'react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import PdfToSvgTool from '../../components/organisms/PdfToSvgTool';
import { RelatedToolsSection } from '../../components/organisms';
import { ToolUploadZone } from '../../components/molecules';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { getCombinedFAQs } from '../../data/faqData';
import { Download, CheckCircle, FileType } from 'lucide-react';

const PDFToSvgPage: React.FC = () => {
  const { t, language } = useI18n();
  const seoData = getToolSEOData('pdfToSvg', language);
  const [toolActive, setToolActive] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Get FAQ data for SEO schema
  const pdfToSvgFAQs = getCombinedFAQs('pdf-to-svg');

  // Dynamic SEO updates
  useDynamicSEO('pdf-to-svg');

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
    // PDF to SVG works with single file
    addFiles([selectedFiles[0]]);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = (result: any) => {
    setResult(result);
    setToolActive(false);
  };

  const handleReset = () => {
    setResult(null);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  // Create the tool component based on state
  const toolComponent = (() => {
    // Show results if we have them
    if (result) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-green-800 dark:text-green-200">
                  {t('pages.tools.pdfToSvg.results.successTitle') || 'PDF successfully converted to SVG!'}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  {t('pages.tools.pdfToSvg.results.successDescription') || 'All PDF pages converted to scalable vector graphics'}
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-6 mt-6 border-t border-white/20 dark:border-gray-600/20">
              <button
                onClick={handleReset}
                className="btn-privacy-secondary text-lg px-8 py-4"
              >
                {t('pages.tools.pdfToSvg.results.convertAnotherFile') || 'Convert another file'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show tool if active
    if (toolActive) {
      return (
        <PdfToSvgTool
          initialFile={files[0]}
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
          title={t('pages.tools.pdfToSvg.uploadTitle') || 'Upload PDF file to convert to SVG'}
          subtitle={t('pages.tools.pdfToSvg.uploadSubtitle') || 'Transform PDF pages into scalable vector graphics'}
          supportedFormats={t('pages.tools.pdfToSvg.supportedFormats') || 'PDF files'}
          gradientFrom="fuchsia-500"
          gradientTo="fuchsia-600"
          IconComponent={FileType}
          accept="application/pdf"
          acceptedTypes={['application/pdf']}
          multiple={false}
          maxSize={100 * 1024 * 1024}
          disabled={false}
          toolId="pdf-to-svg"
        />
        
        {/* File List & Start Button */}
        {files.length > 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <Shapes className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black dark:text-white">
                  {t('pages.tools.pdfToSvg.selectedFile', { count: files.length }) || `Selected file (${files.length})`}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  {t('pages.tools.pdfToSvg.readyToConvert') || 'Ready to convert to SVG'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-xl flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div>
                      <p className="font-black text-black dark:text-white">{file.name}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(file.size / 1024 / 1024).toFixed(2)} {t('pages.tools.pdfToSvg.fileSizeUnit') || 'MB'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title={t('pages.tools.pdfToSvg.removeFile') || 'Remove file'}
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
                {t('pages.tools.pdfToSvg.buttons.startConverting') || 'Convert to SVG 📐'}
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
      toolId="pdf-to-svg"
      faqSchema={pdfToSvgFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('pages.tools.pdfToSvg.pageTitle') || 'Convert PDF to SVG for Free - LocalPDF'}
      pageDescription={t('pages.tools.pdfToSvg.pageDescription') || 'Convert PDF pages to SVG vectors. High-quality PDF to SVG conversion with scalable graphics.'}
      toolComponent={toolComponent}
      breadcrumbKey="pdf-to-svg"
      relatedToolsSection={<RelatedToolsSection currentTool="pdf-to-svg" />}
    />
  );
};

export default PDFToSvgPage;