import React, { useRef, useState } from 'react';
import { FileText, Download, AlertCircle, CheckCircle, Eye, Settings } from 'lucide-react';
import { useWordToPDF } from '../hooks/useWordToPDF';
import { ConversionSettings } from '../types/wordToPdf.types';
import { ConversionSettingsPanel } from './ConversionSettingsPanel';
import { PDFPreview } from './PDFPreview';
import { useTranslation } from '../../../hooks/useI18n';

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

  // useRef hook - always in the same position
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setShowPreview(false);
      reset();
    }
  };

  const handleClick = () => {
    reset();
    setCurrentFile(null);
    setShowPreview(false);
    fileInputRef.current?.click();
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
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={handleClick}
              className="text-center cursor-pointer p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('pages.tools.wordToPdf.tool.uploadTitle')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('pages.tools.wordToPdf.tool.uploadSubtitle')}
              </p>

              <div className="mt-6 text-sm text-gray-400">
                <p>{t('pages.tools.wordToPdf.tool.supportedFormats')}</p>
              </div>

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>{t('pages.tools.wordToPdf.tool.compatibility.msWord')}</p>
                <p>{t('pages.tools.wordToPdf.tool.compatibility.googleDocs')}</p>
                <p>{t('pages.tools.wordToPdf.tool.compatibility.docWarning')}</p>
                <p>{t('pages.tools.wordToPdf.tool.compatibility.localProcessing')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          {result?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <h3 className="text-green-800 font-medium">{t('pages.tools.wordToPdf.tool.messages.conversionCompleted')}</h3>
                  <p className="text-green-700 text-sm">
                    PDF is ready for download ({result.pdfBytes ? Math.round(result.pdfBytes.length / 1024) : '0'} KB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {result && !result.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <h3 className="text-red-800 font-medium">{t('pages.tools.wordToPdf.tool.messages.conversionFailed')}</h3>
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview and Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px]"> {/* Fixed height */}
                {showPreview ? (
                  <PDFPreview
                    pdfBytes={result?.success ? result.pdfBytes || null : null}
                    fileName={currentFile?.name || 'document.pdf'}
                    onDownload={handleDownload}
                    isGenerating={isConverting}
                    onRegenerate={currentFile ? () => handleConvert() : undefined}
                  />
                ) : (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">{t('pages.tools.wordToPdf.tool.preview.title')}</h3>
                    <p className="text-sm mb-4">{t('pages.tools.wordToPdf.tool.preview.description')}</p>
                    {currentFile && !result && (
                      <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isConverting ? t('pages.tools.wordToPdf.tool.buttons.converting') : t('pages.tools.wordToPdf.tool.buttons.convertToPdf')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Conversion Settings */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col"> {/* Fixed height with flex */}
                <h2 className="text-xl font-semibold mb-4">{t('pages.tools.wordToPdf.tool.settings.title')}</h2>

                <div className="flex-1 overflow-y-auto"> {/* Scrollable content area */}
                  <ConversionSettingsPanel
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    isVisible={showSettings}
                    onToggle={() => setShowSettings(!showSettings)}
                  />
                </div>

                {/* Convert Button - Always at bottom */}
                <div className="mt-6 pt-6 border-t flex-shrink-0">
                  <button
                    onClick={handleConvert}
                    disabled={!currentFile || isConverting}
                    className={`w-full py-3 px-4 font-medium rounded-lg transition-colors ${
                      !currentFile || isConverting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isConverting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t('pages.tools.wordToPdf.tool.buttons.converting')}
                      </span>
                    ) : (
                      t('pages.tools.wordToPdf.tool.buttons.convertToPdf')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Information - Full Width Below */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('pages.tools.wordToPdf.tool.fileInfo.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><strong>{t('pages.tools.wordToPdf.tool.fileInfo.fileName')}:</strong> {currentFile.name}</div>
              <div><strong>{t('pages.tools.wordToPdf.tool.fileInfo.fileSize')}:</strong> {Math.round(currentFile.size / 1024)} KB</div>
              <div><strong>{t('pages.tools.wordToPdf.tool.fileInfo.fileType')}:</strong> {t('pages.tools.wordToPdf.tool.fileInfo.microsoftWord')}</div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {t('pages.tools.wordToPdf.tool.fileInfo.privacyNote')}
              </div>
              <button
                onClick={() => {
                  setCurrentFile(null);
                  setShowPreview(false);
                  reset();
                }}
                className="text-sm text-red-600 hover:text-red-800 underline"
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
