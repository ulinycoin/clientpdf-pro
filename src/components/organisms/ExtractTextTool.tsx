import React, { useState, useEffect } from 'react';
import { useExtractText } from '../../hooks/useExtractText';
import { ExtractTextOptions } from '../../services/extractTextService';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import { useI18n } from '../../hooks/useI18n';

interface ExtractTextToolProps {
  files: File[];
  onComplete: (result: any) => void;
  onClose: () => void;
  className?: string;
}

const ExtractTextTool: React.FC<ExtractTextToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useI18n();
  const {
    isProcessing,
    progress,
    error,
    result,
    extractText,
    resetState,
    getDefaultOptions,
    validateOptions,
    downloadAsTextFile
  } = useExtractText();

  const [options, setOptions] = useState<ExtractTextOptions>(getDefaultOptions());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showRangeOptions, setShowRangeOptions] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Validate options on change
  useEffect(() => {
    const validation = validateOptions(options);
    setValidationErrors(validation.errors);
  }, [options, validateOptions]);

  // Handle completion
  useEffect(() => {
    if (result && result.success && !hasDownloaded) {
      // For text extraction, we might want to show the text in a modal or download it
      // For now, we'll automatically download as .txt file
      downloadAsTextFile(result.data, files[0]?.name || 'document.pdf');
      setHasDownloaded(true);
      onComplete(result);
    }
  }, [result, onComplete, downloadAsTextFile, files, hasDownloaded]);

  const handleExtractText = async () => {
    if (files.length === 0) {
      setValidationErrors(['Please select a PDF file to extract text from']);
      return;
    }

    if (validationErrors.length > 0) {
      return;
    }

    // Reset download flag for new extraction
    setHasDownloaded(false);

    const file = files[0]; // Process first file
    await extractText(file, options);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const currentFile = files[0];

  // Helper to show before/after comparison if both exist
  const showComparison = result?.success && result.data?.formattedText && result.data?.text !== result.data?.formattedText;

  return (
    <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 ${className} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white">{t('pages.tools.extractText.tool.title')}</h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mt-2">
            {t('pages.tools.extractText.tool.description')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <span>←</span>
          <span className="font-medium text-black dark:text-white">Back to Tools</span>
        </button>
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="mb-8">
          <h3 className="text-lg font-black text-black dark:text-white mb-4">{t('pages.tools.extractText.tool.fileToExtract')}</h3>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                📄
              </div>
              <div className="flex-1">
                <p className="font-black text-black dark:text-white">{currentFile.name}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extraction Options */}
      <div className="mb-8">
        <h3 className="text-lg font-black text-black dark:text-white mb-6">{t('pages.tools.extractText.tool.extractionOptions')}</h3>

        <div className="space-y-6">
          {/* Smart Formatting Toggle */}
          <div className="bg-gradient-to-br from-seafoam-50 to-ocean-50 dark:from-seafoam-900/20 dark:to-ocean-900/20 backdrop-blur-sm border border-seafoam-200/60 dark:border-seafoam-600/20 rounded-xl p-6 shadow-lg">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.enableSmartFormatting}
                onChange={(e) => setOptions(prev => ({ ...prev, enableSmartFormatting: e.target.checked }))}
                disabled={isProcessing}
                className="w-5 h-5 text-seafoam-600 bg-white/90 border-seafoam-300/80 rounded focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200"
              />
              <span className="ml-4 text-base font-black text-black dark:text-white">
                ✨ {t('pages.tools.extractText.tool.smartFormatting')}
              </span>
            </label>
            <p className="ml-9 text-sm font-medium text-gray-800 dark:text-gray-100 mt-2">
              {t('pages.tools.extractText.tool.smartFormattingDesc')}
            </p>
          </div>

          {/* Formatting Level */}
          {options.enableSmartFormatting && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 ml-4 shadow-lg">
              <label className="block text-sm font-black text-black dark:text-white mb-4">
                {t('pages.tools.extractText.tool.formattingLevel')}
              </label>
              <div className="space-y-4">
                {[
                  { value: 'minimal', label: t('pages.tools.extractText.tool.levels.minimal.title'), desc: t('pages.tools.extractText.tool.levels.minimal.desc') },
                  { value: 'standard', label: t('pages.tools.extractText.tool.levels.standard.title'), desc: t('pages.tools.extractText.tool.levels.standard.desc') },
                  { value: 'advanced', label: t('pages.tools.extractText.tool.levels.advanced.title'), desc: t('pages.tools.extractText.tool.levels.advanced.desc') }
                ].map((level) => (
                  <label key={level.value} className="flex items-start cursor-pointer hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 p-3 rounded-lg transition-all duration-200">
                    <input
                      type="radio"
                      name="formattingLevel"
                      value={level.value}
                      checked={options.formattingLevel === level.value}
                      onChange={(e) => setOptions(prev => ({ ...prev, formattingLevel: e.target.value as any }))}
                      disabled={isProcessing}
                      className="w-5 h-5 text-seafoam-600 bg-white/90 border-seafoam-300/80 focus:ring-2 focus:ring-seafoam-500/50 mt-0.5 transition-all duration-200"
                    />
                    <div className="ml-4">
                      <span className="text-sm font-black text-black dark:text-white">{level.label}</span>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{level.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Include Metadata */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                disabled={isProcessing}
                className="w-5 h-5 text-seafoam-600 bg-white/90 border-seafoam-300/80 rounded focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200"
              />
              <span className="ml-4 text-sm font-black text-black dark:text-white">
                {t('pages.tools.extractText.tool.includeMetadata')}
              </span>
            </label>
          </div>

          {/* Preserve Formatting */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={options.preserveFormatting}
                onChange={(e) => setOptions(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
                disabled={isProcessing}
                className="w-5 h-5 text-seafoam-600 bg-white/90 border-seafoam-300/80 rounded focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200"
              />
              <span className="ml-4 text-sm font-black text-black dark:text-white">
                {t('pages.tools.extractText.tool.preserveFormatting')}
              </span>
            </label>
          </div>

          {/* Page Range Toggle */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showRangeOptions}
                onChange={(e) => {
                  setShowRangeOptions(e.target.checked);
                  if (!e.target.checked) {
                    setOptions(prev => ({ ...prev, pageRange: undefined }));
                  }
                }}
                disabled={isProcessing}
                className="w-5 h-5 text-seafoam-600 bg-white/90 border-seafoam-300/80 rounded focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200"
              />
              <span className="ml-4 text-sm font-black text-black dark:text-white">
                {t('pages.tools.extractText.tool.pageRange')}
              </span>
            </label>
          </div>

          {/* Page Range Options */}
          {showRangeOptions && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 ml-4 shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-3">
                    {t('pages.tools.extractText.tool.pageRangeFields.startPage')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={options.pageRange?.start || 1}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      pageRange: {
                        start: parseInt(e.target.value) || 1,
                        end: prev.pageRange?.end || parseInt(e.target.value) || 1
                      }
                    }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-3">
                    {t('pages.tools.extractText.tool.pageRangeFields.endPage')}
                  </label>
                  <input
                    type="number"
                    min={options.pageRange?.start || 1}
                    value={options.pageRange?.end || 1}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      pageRange: {
                        start: prev.pageRange?.start || 1,
                        end: parseInt(e.target.value) || 1
                      }
                    }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-4">
                {t('pages.tools.extractText.tool.pageRangeFields.note')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mb-6">
          <ProgressBar
            value={progress}
            className="mb-2"
            animated={true}
          />
          <p className="text-sm text-gray-600 text-center">
            {t('pages.tools.extractText.tool.extracting', { progress: Math.round(progress).toString() })}
          </p>
        </div>
      )}

      {/* Result Preview */}
      {result && result.success && result.data && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-green-400 mr-2 mt-0.5">✅</div>
            <div className="flex-1">
              <h4 className="text-green-800 font-medium">{t('pages.tools.extractText.tool.success.title')}</h4>
              <div className="text-green-700 text-sm mt-2 space-y-1">
                <p>📄 {t('pages.tools.extractText.tool.success.pagesProcessed', { count: result.data.pageCount.toString() })}</p>
                <p>📝 {t('pages.tools.extractText.tool.success.textLength', { length: result.data.text.length.toLocaleString() })}</p>
                {result.data.metadata?.title && (
                  <p>📋 {t('pages.tools.extractText.tool.success.documentTitle', { title: result.data.metadata.title })}</p>
                )}
                {result.data.metadata?.author && (
                  <p>👤 {t('pages.tools.extractText.tool.success.author', { author: result.data.metadata.author })}</p>
                )}
                {result.data.formatting?.applied && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 font-medium text-xs">✨ {t('pages.tools.extractText.tool.success.smartFormattingApplied', { level: result.data.formatting.level })}</p>
                    <p className="text-blue-700 text-xs">{result.data.formatting.changes.join(', ')}</p>
                  </div>
                )}
                <p>💾 {t('pages.tools.extractText.tool.success.fileDownloaded')}</p>
                {result.metadata?.hasText === false && (
                  <p className="text-orange-600">⚠️ {t('pages.tools.extractText.tool.success.noTextWarning')}</p>
                )}
              </div>

              {/* Before/After Comparison Preview */}
              {showComparison && (
                <div className="mt-4 p-4 bg-white border border-green-300 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">🔍 {t('pages.tools.extractText.tool.success.comparisonPreview')}</h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-2">❌ {t('pages.tools.extractText.tool.success.before')}</p>
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <pre className="whitespace-pre-wrap font-mono text-gray-700">
                          {result.data.formattedText!.substring(0, 200)}...
                        </pre>
                      </div>
                    </div>

                    {/* After */}
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-2">✅ {t('pages.tools.extractText.tool.success.after')}</p>
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                        <pre className="whitespace-pre-wrap font-mono text-gray-700">
                          {result.data.text.substring(0, 200)}...
                        </pre>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {t('pages.tools.extractText.tool.success.notice')}
                  </p>
                </div>
              )}

              {/* Regular preview for non-formatted text */}
              {!showComparison && result.data.text && result.data.text.length > 50 && (
                <div className="mt-3 p-3 bg-white border border-green-200 rounded text-xs">
                  <p className="font-medium text-gray-700 mb-2">📄 {t('pages.tools.extractText.tool.success.textPreview')}</p>
                  <p className="text-gray-600 font-mono whitespace-pre-wrap">
                    {result.data.text.substring(0, 400)}
                    {result.data.text.length > 400 && '...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {(error || validationErrors.length > 0) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-red-400 mr-2 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium">{t('common.error')}</h4>
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              {validationErrors.map((err, index) => (
                <p key={index} className="text-red-600 text-sm mt-1">{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-400 mr-2 mt-0.5">🧠</div>
          <div>
            <h4 className="text-blue-800 font-medium">{t('pages.tools.extractText.tool.infoBox.title')}</h4>
            <p className="text-blue-700 text-sm mt-1">
              {t('pages.tools.extractText.tool.infoBox.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-green-400 mr-2 mt-0.5">🔒</div>
          <div>
            <h4 className="text-green-800 font-medium">{t('pages.tools.extractText.tool.privacy.title')}</h4>
            <p className="text-green-700 text-sm mt-1">
              {t('pages.tools.extractText.tool.privacy.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleExtractText}
          disabled={files.length === 0 || isProcessing || validationErrors.length > 0}
          className="btn-privacy-modern text-lg px-8 py-3 min-w-[200px] ripple-effect btn-press disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? t('pages.tools.extractText.tool.buttons.extracting') : t('pages.tools.extractText.tool.buttons.extractText')} 📄
        </button>
      </div>
    </div>
  );
};

export default ExtractTextTool;
