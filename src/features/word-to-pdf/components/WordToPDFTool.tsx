import React, { useRef, useState } from 'react';
import { FileText, Download, AlertCircle, CheckCircle, Eye, Settings } from 'lucide-react';
import { useWordToPDF } from '../hooks/useWordToPDF';
import { ConversionSettings } from '../types/wordToPdf.types';
import { ConversionSettingsPanel } from './ConversionSettingsPanel';
import { PDFPreview } from './PDFPreview';
import { useTranslation } from '../../../hooks/useI18n';
import ModernUploadZone from '../../../components/molecules/ModernUploadZone';

export const WordToPDFTool: React.FC = () => {
  const { t } = useTranslation();
  
  // All useState hooks first, in consistent order - never change this order!
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(true); // Changed to true so settings are visible by default
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    pageSize: 'A4',
    embedFonts: true,
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: 12,
    compression: false
  });

  // Removed fileInputRef as we now use ModernUploadZone

  // Custom hook - always call in the same position, destructure all values safely
  const hookResult = useWordToPDF();
  const isConverting = hookResult.isConverting;
  const result = hookResult.result;
  const previewMode = hookResult.previewMode;
  const convertFile = hookResult.convertFile;
  const downloadPDF = hookResult.downloadPDF;
  const regenerateWithSettings = hookResult.regenerateWithSettings;
  const togglePreviewMode = hookResult.togglePreviewMode;
  const reset = hookResult.reset;

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      setCurrentFile(file);
      setShowPreview(false);
      reset();
    }
  };

  const handleConvert = async () => {
    if (!currentFile) return;

    // Convert without auto-download to show preview first
    await convertFile(currentFile, settings, false);
    setShowPreview(true);  // Автоматически показываем предпросмотр после конвертации
  };

  const handleDownload = async () => {
    if (currentFile) {
      await downloadPDF(currentFile.name);
    }
  };

  const handleSettingsChange = async (newSettings: ConversionSettings) => {
    setSettings(newSettings);

    // If we have a file and result, regenerate with new settings
    if (currentFile && result?.success) {
      await regenerateWithSettings(currentFile, newSettings);
      // Сохраняем состояние предпросмотра при регенерации
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {!currentFile ? (
        <div className="max-w-2xl mx-auto">
          <ModernUploadZone
            onFilesSelected={handleFilesSelected}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            acceptedTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx']}
            multiple={false}
            maxFiles={1}
            maxSize={100 * 1024 * 1024}
            title={t('pages.tools.wordToPdf.tool.uploadTitle')}
            subtitle={t('pages.tools.wordToPdf.tool.uploadSubtitle')}
            supportedFormats={t('pages.tools.wordToPdf.tool.supportedFormats')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          {result?.success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-600/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-green-800 dark:text-green-200 font-black text-lg">{t('pages.tools.wordToPdf.tool.messages.conversionCompleted')}</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    PDF is ready for download ({result.pdfBytes ? Math.round(result.pdfBytes.length / 1024) : '0'} KB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {result && !result.success && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/60 dark:border-red-600/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-black text-lg">{t('pages.tools.wordToPdf.tool.messages.conversionFailed')}</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">{result.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview and Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl overflow-hidden min-h-[600px] h-fit"> {/* Dynamic height */}
                {showPreview ? (
                  <PDFPreview
                    pdfBytes={result?.success ? result.pdfBytes || null : null}
                    fileName={currentFile?.name || 'document.pdf'}
                    onDownload={handleDownload}
                    isGenerating={isConverting}
                    onRegenerate={currentFile ? () => handleConvert() : undefined}
                  />
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
                      <Eye className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-black dark:text-white mb-3">{t('pages.tools.wordToPdf.tool.preview.title')}</h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-6">{t('pages.tools.wordToPdf.tool.preview.description')}</p>
                    {currentFile && !result && (
                      <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="btn-privacy-modern bg-gradient-to-br from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:opacity-50"
                      >
                        {isConverting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            {t('pages.tools.wordToPdf.tool.buttons.converting')}
                          </span>
                        ) : (
                          t('pages.tools.wordToPdf.tool.buttons.convertToPdf')
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Conversion Settings */}
            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6 min-h-[600px] h-fit flex flex-col"> {/* Dynamic height with flex */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.settings.title')}</h2>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px]"> {/* Limited scrollable content area */}
                  <ConversionSettingsPanel
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    isVisible={showSettings}
                    onToggle={() => setShowSettings(!showSettings)}
                  />
                </div>

                {/* Convert Button - Always at bottom */}
                <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/20 flex-shrink-0">
                  <button
                    onClick={handleConvert}
                    disabled={!currentFile || isConverting}
                    className="w-full btn-privacy-modern bg-gradient-to-br from-seafoam-500 to-ocean-500 hover:from-seafoam-600 hover:to-ocean-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:opacity-50"
                  >
                    {isConverting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {t('pages.tools.wordToPdf.tool.buttons.converting')}
                      </span>
                    ) : (
                      <>🔄 {t('pages.tools.wordToPdf.tool.buttons.convertToPdf')}</>
                    )}
                  </button>
                  
                  <div className="mt-3 text-center space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      💡 After conversion, use Download button in preview panel
                    </p>
                    {result?.success && (
                      <button
                        onClick={handlePreviewToggle}
                        className="text-xs font-medium text-seafoam-600 dark:text-seafoam-400 hover:text-seafoam-700 dark:hover:text-seafoam-300 underline transition-colors duration-200"
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview & Download'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Information - Full Width Below */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.fileInfo.title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('pages.tools.wordToPdf.tool.fileInfo.fileName')}</div>
                <div className="font-black text-black dark:text-white truncate" title={currentFile.name}>{currentFile.name}</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('pages.tools.wordToPdf.tool.fileInfo.fileSize')}</div>
                <div className="font-black text-black dark:text-white">{Math.round(currentFile.size / 1024)} KB</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('pages.tools.wordToPdf.tool.fileInfo.fileType')}</div>
                <div className="font-black text-black dark:text-white">{t('pages.tools.wordToPdf.tool.fileInfo.microsoftWord')}</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-600/20 rounded-xl p-4 backdrop-blur-sm flex-1 mr-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
                    🔒
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t('pages.tools.wordToPdf.tool.fileInfo.privacyNote')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentFile(null);
                  setShowPreview(false);
                  reset();
                }}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-red-300/80 dark:border-red-600/20 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-lg disabled:opacity-50"
                disabled={isConverting}
              >
                {t('pages.tools.wordToPdf.tool.buttons.chooseDifferent')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
