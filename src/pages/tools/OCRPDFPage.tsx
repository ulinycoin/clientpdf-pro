import React, { useState, useEffect } from 'react';
import { getToolSEOData } from '../../data/seoData';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernOCRTool, RelatedToolsSection } from '../../components/organisms';
import ToolUploadZone from '../../components/molecules/ToolUploadZone';
import { useI18n } from '../../hooks/useI18n';
import { useDynamicSEO } from '../../hooks/useDynamicSEO';
import { useFileUpload } from '../../hooks/useFileUpload';
import { getCombinedFAQs } from '../../data/faqData';
import { Download, CheckCircle, FileText, Eye } from 'lucide-react';

const OCRPDFPage: React.FC = () => {
  const { t, language } = useI18n();
  const seoData = getToolSEOData('ocr', language);
  const [toolActive, setToolActive] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Get FAQ data for SEO schema
  const ocrFAQs = getCombinedFAQs('ocr');
  
  // Dynamic SEO updates
  useDynamicSEO('ocr-pdf');

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    // OCR works with single file
    console.log('OCR handleFileSelect:', selectedFiles);
    const file = selectedFiles[0];
    addFiles([file]);
    setCurrentFile(file);
    console.log('Files after addFiles:', files);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = (ocrResult: any) => {
    if (ocrResult) {
      setResult(ocrResult);
    }
    setToolActive(false);
  };

  const handleReset = () => {
    setResult(null);
    clearFiles();
    setCurrentFile(null);
    setToolActive(false);
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

  const downloadResult = () => {
    if (result && result.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      
      // Generate filename based on the actual output format and MIME type
      const originalName = files[0]?.name || 'document';
      const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
      
      // Determine file extension based on MIME type or output format
      let fileName: string;
      const outputFormat = result.result?.outputFormat || 'text';
      const mimeType = result.mimeType;
      
      console.log('🎯 Download determination:', {
        outputFormat,
        mimeType,
        isEdited: result.result?.isEdited,
        originalOutputFormat: result.result?.originalOutputFormat
      });
      
      if (mimeType === 'application/pdf' || outputFormat === 'searchable-pdf') {
        fileName = `${baseName}_ocr.pdf`;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || outputFormat === 'docx') {
        fileName = `${baseName}_ocr.docx`;
      } else if (mimeType === 'application/rtf' || outputFormat === 'rtf') {
        fileName = `${baseName}_ocr.rtf`;
      } else {
        fileName = `${baseName}_ocr.txt`;
      }
      
      // Add edited suffix if content was modified
      if (result.result?.isEdited) {
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.replace(`.${extension}`, '');
        fileName = `${nameWithoutExt}_edited.${extension}`;
      }
      
      console.log('📥 Downloading file:', fileName);
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Create the tool component based on state
  const toolComponent = (() => {
    // Show results if we have them
    if (result) {
      const processingTime = result.processingTime ? (result.processingTime / 1000).toFixed(1) : '0';
      const confidence = result.result?.confidence ? result.result.confidence.toFixed(1) : '0';
      const wordsFound = result.result?.words?.length || 0;
      const textLength = result.result?.text?.length || 0;
      
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8" data-ocr-results>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-blue-800 dark:text-blue-200">
                  {t('tools.ocr.results.successTitle') || 'OCR Completed Successfully!'}
                  {result.result?.isEdited && (
                    <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                      ✏️ Отредактировано
                    </span>
                  )}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  {t('tools.ocr.results.successDescription') || 'Text has been extracted from your document'}
                  {result.result?.isEdited && (
                    <span className="text-green-600 dark:text-green-400 ml-1">
                      (изменения сохранены)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Results Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{processingTime}s</div>
                <div className="text-xs text-blue-500 dark:text-blue-300">{t('tools.ocr.results.processingTime')}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{confidence}%</div>
                <div className="text-xs text-green-500 dark:text-green-300">{t('tools.ocr.results.confidence')}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{wordsFound}</div>
                <div className="text-xs text-purple-500 dark:text-purple-300">{t('tools.ocr.results.wordsFound')}</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{textLength}</div>
                <div className="text-xs text-orange-500 dark:text-orange-300">Characters</div>
              </div>
            </div>

            {/* Download Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-black dark:text-white">{t('tools.ocr.results.downloadTitle') || 'Download Results'}:</h4>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center text-xl">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-black text-black dark:text-white">
                      {(() => {
                        const originalName = files[0]?.name || 'document';
                        const baseName = originalName.replace(/\.(pdf|jpg|jpeg|png|bmp|tiff|webp)$/i, '');
                        const outputFormat = result.result?.outputFormat || 'text';
                        const mimeType = result.mimeType;
                        
                        let fileName: string;
                        if (mimeType === 'application/pdf' || outputFormat === 'searchable-pdf') {
                          fileName = `${baseName}_ocr.pdf`;
                        } else {
                          fileName = `${baseName}_ocr.txt`;
                        }
                        
                        if (result.result?.isEdited) {
                          const extension = fileName.split('.').pop();
                          const nameWithoutExt = fileName.replace(`.${extension}`, '');
                          fileName = `${nameWithoutExt}_edited.${extension}`;
                        }
                        
                        return fileName;
                      })()}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('tools.ocr.results.readyToDownload') || 'Ready to download'}
                      {result.result?.isEdited && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          ✏️ Отредактировано
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadResult}
                  className="btn-privacy-modern text-sm px-6 py-3 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {(() => {
                    const outputFormat = result.result?.outputFormat || 'text';
                    const mimeType = result.mimeType;
                    
                    if (mimeType === 'application/pdf' || outputFormat === 'searchable-pdf') {
                      return t('tools.ocr.buttons.downloadPdf') || 'Download PDF';
                    } else {
                      return t('tools.ocr.buttons.downloadText') || 'Download Text';
                    }
                  })()}
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-6 mt-6 border-t border-white/20 dark:border-gray-600/20">
              <button
                onClick={handleReset}
                className="btn-privacy-secondary text-lg px-8 py-4"
              >
                {t('tools.ocr.results.rotateAnother') || 'Process Another Document'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show tool if active
    if (toolActive) {
      return (
        <ModernOCRTool
          files={currentFile ? [currentFile] : files}
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
          title={t('tools.ocr.upload.title') || 'OCR Document'}
          subtitle={t('tools.ocr.upload.description') || 'Extract text from PDF and images'}
          supportedFormats={t('tools.ocr.upload.supportedFormats') || 'PDF and images up to 50MB'}
          gradientFrom="cyan-500"
          gradientTo="cyan-600"
          IconComponent={Eye}
          accept="application/pdf,image/*"
          acceptedTypes={['application/pdf', 'image/*']}
          multiple={false}
          maxSize={50 * 1024 * 1024}
          disabled={false}
          toolId="ocr-pdf"
        />
        
        {/* File List & Start Button */}
        {files.length > 0 && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                🔍
              </div>
              <div>
                <h3 className="text-xl font-black text-black dark:text-white">
                  {t('tools.ocr.upload.selectedFile') || 'File Selected for OCR'}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                  {t('tools.ocr.upload.readyToProcess') || 'Ready to extract text from your document'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div>
                      <p className="font-black text-black dark:text-white">{file.name}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(file.size / 1024 / 1024).toFixed(2)} {t('common.fileSizeUnit') || 'MB'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title={t('tools.ocr.upload.removeFile') || 'Remove file'}
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
                {t('tools.ocr.upload.startProcessing') || 'Start OCR Processing'}
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
      toolId="ocr-pdf"
      faqSchema={ocrFAQs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      }))}
      pageTitle={t('tools.ocr.title') || 'OCR PDF'}
      pageDescription={t('tools.ocr.description') || 'Extract text from scanned documents using OCR technology'}
      toolComponent={toolComponent}
      breadcrumbKey="ocr-pdf"
      relatedToolsSection={<RelatedToolsSection currentTool="ocr-pdf" />}
    />
  );
};

export default OCRPDFPage;