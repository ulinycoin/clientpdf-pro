import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Download, Settings, Eye } from 'lucide-react';
import { useWordToPDF } from '../../features/word-to-pdf/hooks/useWordToPDF';
import { ConversionSettings } from '../../features/word-to-pdf/types/wordToPdf.types';
import { ConversionSettingsPanel } from '../../features/word-to-pdf/components/ConversionSettingsPanel';
import { PDFPreview } from '../../features/word-to-pdf/components/PDFPreview';
import { useToolState } from '../../hooks/useToolState';
import { useTranslation } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';

interface ModernWordToPDFToolProps {
  initialFile?: File | null;
  onComplete: () => void;
  onClose: () => void;
  className?: string;
}

const ModernWordToPDFTool: React.FC<ModernWordToPDFToolProps> = React.memo(({
  initialFile,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
  const { shouldAnimate } = useMotionPreferences();
  const {
    state,
    startProcessing,
    updateProgress,
    setError,
    setResult,
    clearError,
    canProcess
  } = useToolState();

  const [currentFile, setCurrentFile] = useState<File | null>(initialFile || null);
  const [showSettings, setShowSettings] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    pageSize: 'A4',
    embedFonts: true,
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: 12,
    compression: false
  });

  // Use the existing Word to PDF hook
  const hookResult = useWordToPDF();
  const isConverting = hookResult.isConverting;
  const result = hookResult.result;
  const convertFile = hookResult.convertFile;
  const downloadPDF = hookResult.downloadPDF;
  const regenerateWithSettings = hookResult.regenerateWithSettings;
  const reset = hookResult.reset;

  // Sync useWordToPDF result with useToolState
  useEffect(() => {
    if (result !== null && !isConverting) {
      if (result.success) {
        setResult(result);
        console.log('🎯 Synced successful result to useToolState');
      } else {
        setError(result.error || 'Conversion failed');
        console.log('🎯 Synced error result to useToolState');
      }
    }
  }, [result, isConverting, setResult, setError]);

  // Memoized computed values
  const canConvert = useMemo(() => {
    return currentFile && canProcess && !state.isProcessing;
  }, [currentFile, canProcess, state.isProcessing]);

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ${t('common.fileSizeUnit')}`;
  };

  const handleConvert = async () => {
    if (!canConvert || !currentFile) {
      setError(t('pages.tools.wordToPdf.tool.messages.noFile'));
      return;
    }

    console.log('🚀 Starting Word to PDF conversion...', { 
      file: currentFile.name, 
      size: currentFile.size,
      settings 
    });

    clearError();
    startProcessing(t('pages.tools.wordToPdf.tool.messages.converting'));

    try {
      // Convert without auto-download to show preview first
      setShowPreview(true); // Show preview panel immediately
      await convertFile(currentFile, settings, false);
      
      console.log('✅ Conversion completed, result will be available via hook');
      
    } catch (err) {
      console.error('❌ Conversion failed:', err);
      setError(err instanceof Error ? err.message : t('pages.tools.wordToPdf.tool.messages.conversionFailed'));
    }
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
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };


  // Early return if no file
  if (!currentFile) {
    return (
      <div className={`max-w-5xl mx-auto ${className}`}>
        <div className="bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-red-800 dark:text-red-200 mb-2">
              {t('pages.tools.wordToPdf.tool.messages.noFile')}
            </h3>
            <button
              onClick={onClose}
              className="btn-privacy-modern text-lg px-8 py-4 mt-4"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              📝
            </div>
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white">
                {t('pages.tools.wordToPdf.tool.title')}
              </h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {currentFile.name} • {formatSize(currentFile.size)}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={state.isProcessing || isConverting}
            className="p-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <div className={`w-2 h-2 rounded-full bg-success-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('pages.tools.wordToPdf.tool.fileInfo.privacyNote')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('pages.tools.wordToPdf.tool.fileInfo.microsoftWord')}
            </span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {result?.success && (
        <div className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-600/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              ✅
            </div>
            <div>
              <h3 className="text-green-800 dark:text-green-200 font-black text-lg">
                {t('pages.tools.wordToPdf.tool.messages.conversionCompleted')}
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                PDF is ready for download ({result.pdfBytes ? Math.round(result.pdfBytes.length / 1024) : '0'} KB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(result && !result.success) || state.error && (
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">
                {t('pages.tools.wordToPdf.tool.messages.conversionFailed')}
              </h4>
              <p className="text-red-700 dark:text-red-300 font-medium">
                {state.error || result?.error || t('pages.tools.wordToPdf.tool.messages.unknownError')}
              </p>
            </div>
            <button
              onClick={clearError}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Preview and Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Panel - Preview */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl overflow-hidden min-h-[800px] transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          {showPreview ? (
            <PDFPreview
              pdfBytes={result?.success ? result.pdfBytes || null : null}
              fileName={currentFile.name || 'document.pdf'}
              onDownload={handleDownload}
              isGenerating={isConverting && !result?.success}
              onRegenerate={handleConvert}
            />
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-black dark:text-white mb-3">
                {t('pages.tools.wordToPdf.tool.preview.title')}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-6">
                {t('pages.tools.wordToPdf.tool.preview.description')}
              </p>
              {!result && (
                <button
                  onClick={handleConvert}
                  disabled={!canConvert}
                  className={`btn-privacy-modern bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:opacity-50 ${shouldAnimate ? 'ripple-effect' : ''}`}
                >
                  {isConverting || state.isProcessing ? (
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

        {/* Right Panel - Conversion Settings */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6 min-h-[800px] flex flex-col transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-black dark:text-white">
              {t('pages.tools.wordToPdf.tool.settings.title')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
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
              disabled={!canConvert}
              className={`w-full btn-privacy-modern bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 disabled:opacity-50 ${shouldAnimate ? 'ripple-effect' : ''}`}
            >
              {isConverting || state.isProcessing ? (
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
                💡 {t('pages.tools.wordToPdf.tool.messages.downloadHint')}
              </p>
              {result?.success && (
                <button
                  onClick={handlePreviewToggle}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-200"
                >
                  {showPreview ? 
                    t('pages.tools.wordToPdf.tool.buttons.hidePreview') : 
                    t('pages.tools.wordToPdf.tool.buttons.showPreview')
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Information - Full Width Below */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-black dark:text-white">
            {t('pages.tools.wordToPdf.tool.fileInfo.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('pages.tools.wordToPdf.tool.fileInfo.fileName')}
            </div>
            <div className="font-black text-black dark:text-white truncate" title={currentFile.name}>
              {currentFile.name}
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('pages.tools.wordToPdf.tool.fileInfo.fileSize')}
            </div>
            <div className="font-black text-black dark:text-white">
              {Math.round(currentFile.size / 1024)} KB
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('pages.tools.wordToPdf.tool.fileInfo.fileType')}
            </div>
            <div className="font-black text-black dark:text-white">
              {t('pages.tools.wordToPdf.tool.fileInfo.microsoftWord')}
            </div>
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
            onClick={onClose}
            className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-red-300/80 dark:border-red-600/20 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-lg disabled:opacity-50"
            disabled={isConverting || state.isProcessing}
          >
            {t('common.back')}
          </button>
        </div>
      </div>

      {/* Progress Section - показывается только во время обработки */}
      {(state.isProcessing || isConverting) && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
              ⚡
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">
              {t('pages.tools.wordToPdf.tool.messages.converting')}
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {state.progressMessage || t('pages.tools.wordToPdf.tool.messages.processingDescription')}
            </p>
          </div>

          {/* Progress Bar */}
          {state.progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('pages.tools.wordToPdf.tool.messages.progress')}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(state.progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${state.progress}%` }}
                >
                  {shouldAnimate && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ModernWordToPDFTool.displayName = 'ModernWordToPDFTool';

export default ModernWordToPDFTool;