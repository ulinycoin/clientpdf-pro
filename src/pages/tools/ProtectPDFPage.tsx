import React, { useState, useRef, useEffect } from 'react';
import { StandardToolPageTemplate } from '../../components/templates';
import { ModernProtectTool } from '../../components/organisms/ModernProtectTool';
import { ModernUploadZone } from '../../components/molecules';
import { useI18n } from '../../hooks/useI18n';
import { useFileUpload } from '../../hooks/useFileUpload';
import { checkFileSize, FILE_SIZE_LIMITS } from '../../services/protectService';

// For now using a simple SEO data object - will be added to seoData.ts later
const seoData = {
  title: "Protect PDF with Password - Secure PDF Documents Online",
  description: "Add password protection and security restrictions to your PDF documents. Control printing, copying, and editing permissions with military-grade encryption.",
  keywords: "PDF password protection, secure PDF, encrypt PDF, PDF security, password protect documents, PDF permissions, document security",
  canonical: "/protect-pdf",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF Password Protection Tool",
    "description": "Secure your PDF documents with password protection and access restrictions",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "permissions": "browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
};

const ProtectPDFPage: React.FC = () => {
  const { t } = useI18n();
  const [toolActive, setToolActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState<{level: string, warning: string | null} | null>(null);
  
  // Refs для прокрутки к различным секциям
  const selectedFileRef = useRef<HTMLDivElement>(null);
  const toolSectionRef = useRef<HTMLDivElement>(null);

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0]; // Only take the first file for protection
      
      // Check file size and show warning if needed
      const sizeCheck = checkFileSize(file.size);
      setFileSizeWarning(sizeCheck);
      
      // Block files that exceed the hard limit
      if (sizeCheck.level === 'exceeded') {
        alert(sizeCheck.warning);
        return;
      }
      
      setSelectedFile(file);
      addFiles([file]);
      // Don't activate tool immediately - let user see file preview and warnings first
      // setToolActive(true); - moved to button click handler
    }
  };

  const handleToolComplete = () => {
    setToolActive(false);
    setSelectedFile(null);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
    setSelectedFile(null);
    clearFiles();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setToolActive(false);
    clearFiles();
  };

  // Автоматическая прокрутка к секции выбранного файла когда файл загружен
  useEffect(() => {
    if (selectedFile && selectedFileRef.current) {
      // Добавляем небольшую задержку для плавности
      setTimeout(() => {
        selectedFileRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [selectedFile]);

  // Create the tool component based on state
  const toolComponent = !toolActive || !selectedFile ? (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Zone */}
      <ModernUploadZone
        onFilesSelected={handleFileSelect}
        accept="application/pdf"
        acceptedTypes={['application/pdf']}
        multiple={false} // Only single file for protection
        maxSize={100 * 1024 * 1024} // 100MB limit
        disabled={false}
        title={t('pages.tools.protect.uploadTitle')}
        subtitle={t('pages.tools.protect.uploadSubtitle')}
        supportedFormats={t('pages.tools.protect.supportedFormats')}
      />
      
      {/* Selected File Preview */}
      {selectedFile && (
        <div 
          ref={selectedFileRef}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📄
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                {t('pages.tools.protect.selectedFile')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Ready to protect with password
              </p>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center text-xl">
                📄
              </div>
              <div>
                <p className="font-black text-gray-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title={t('pages.tools.protect.removeFile')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
          
          {/* File Size Warning */}
          {fileSizeWarning && fileSizeWarning.level !== 'safe' && fileSizeWarning.warning && (
            <div className={`p-4 rounded-xl border-2 ${
              fileSizeWarning.level === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
              fileSizeWarning.level === 'large' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600' :
              'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  fileSizeWarning.level === 'medium' ? 'bg-yellow-500' :
                  fileSizeWarning.level === 'large' ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    fileSizeWarning.level === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                    fileSizeWarning.level === 'large' ? 'text-orange-800 dark:text-orange-200' :
                    'text-red-800 dark:text-red-200'
                  }`}>
                    {fileSizeWarning.level === 'medium' ? `⚠️ ${t('pages.tools.protect.fileSizeWarnings.mediumFile')}` :
                     fileSizeWarning.level === 'large' ? `⚠️ ${t('pages.tools.protect.fileSizeWarnings.largeFile')}` :
                     `🚨 ${t('pages.tools.protect.fileSizeWarnings.criticalFile')}`}
                  </h4>
                  <p className={`text-sm ${
                    fileSizeWarning.level === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                    fileSizeWarning.level === 'large' ? 'text-orange-700 dark:text-orange-300' :
                    'text-red-700 dark:text-red-300'
                  }`}>
                    {fileSizeWarning.warning?.startsWith('pages.tools.protect') ? t(fileSizeWarning.warning) : fileSizeWarning.warning}
                  </p>
                  {fileSizeWarning.level === 'critical' && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      <p>💡 <strong>{t('pages.tools.protect.fileSizeWarnings.tips')}</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>{t('pages.tools.protect.fileSizeWarnings.tipCloseOtherTabs')}</li>
                        <li>{t('pages.tools.protect.fileSizeWarnings.tipEnsureRAM')}</li>
                        <li>{t('pages.tools.protect.fileSizeWarnings.tipCompressFirst')}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setToolActive(true);
                // Прокрутка к началу инструмента с небольшой задержкой
                setTimeout(() => {
                  toolSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }, 150);
              }}
              className="btn-privacy-modern text-lg px-8 py-4 min-w-[250px] ripple-effect btn-press"
            >
              {t('pages.tools.protect.protectButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div ref={toolSectionRef}>
      <ModernProtectTool
        file={selectedFile}
        onComplete={handleToolComplete}
        onClose={handleToolClose}
      />
    </div>
  );

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="protect-pdf"
      pageTitle={t('pages.tools.protect.pageTitle')}
      pageDescription={t('pages.tools.protect.pageDescription')}
      toolComponent={toolComponent}
      breadcrumbKey="protect-pdf"
      howToSection={
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('pages.tools.protect.quickSteps.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                  {step}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t(`pages.tools.protect.quickSteps.step${step}.title`)}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`pages.tools.protect.quickSteps.step${step}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      faqSection={
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('pages.tools.protect.benefits.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['privacy', 'control', 'compliance', 'professional'].map((benefit) => (
              <div key={benefit} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500/20 to-ocean-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t(`pages.tools.protect.benefits.${benefit}.title`)}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`pages.tools.protect.benefits.${benefit}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
};

export default ProtectPDFPage;