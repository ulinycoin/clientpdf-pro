import React, { useState, useMemo } from 'react';
import { MergeToolProps, MergeOptions } from '../../types';
import { pdfService } from '../../services/pdfService';
import { useToolState } from '../../hooks/useToolState';
import { useTranslation } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
import SmartMergeRecommendations from '../molecules/SmartMergeRecommendations';
import { SuggestedMetadata, MergeSettings } from '../../types/smartMerge.types';

const ModernMergeTool: React.FC<MergeToolProps> = React.memo(({
  files,
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

  const [options, setOptions] = useState<MergeOptions>({
    order: Array.from({ length: files.length }, (_, i) => i),
    metadata: {
      title: 'Merged PDF',
      author: 'LocalPDF',
      subject: 'Merged PDF Document'
    }
  });

  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  // Memoized computed values
  const orderedFiles = useMemo(() => {
    return options.order ?
      options.order.map(index => files[index]).filter(Boolean) :
      files;
  }, [files, options.order]);

  const canMerge = useMemo(() => {
    return files.length >= 2 && canProcess;
  }, [files.length, canProcess]);

  const totalSize = useMemo(() => {
    return files.reduce((sum, file) => sum + file.size, 0);
  }, [files]);

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ${t('common.fileSizeUnit')}`;
  };

  const getFileWord = (count: number): string => {
    if (count === 1) return t('tools.merge.fileCount.single');
    if (count > 1 && count <= 4) return t('tools.merge.fileCount.few');
    return t('tools.merge.fileCount.many');
  };

  const handleMerge = async () => {
    if (!canMerge) {
      setError(t('tools.merge.errors.minFiles'));
      return;
    }

    startProcessing(t('tools.merge.processing'));

    try {
      const result = await pdfService.mergePDFs(
        orderedFiles,
        updateProgress,
        options
      );

      if (result.success && result.data) {
        setResult(result);

        // Auto-download
        const filename = generateFilename(
          files[0]?.name || 'merged',
          'merged',
          'pdf'
        );
        downloadBlob(result.data, filename);

        // Notify parent
        onComplete(result);
      } else {
        setError(result.error?.message || t('tools.merge.errors.processingError'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.merge.errors.unknownError'));
    }
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (!canProcess || state.isProcessing) return;

    const newOrder = [...(options.order || [])];
    const item = newOrder.splice(fromIndex, 1)[0];
    newOrder.splice(toIndex, 0, item);

    setOptions(prev => ({ ...prev, order: newOrder }));
  };

  // AI Recommendation handlers
  const handleApplyOrder = (fileIds: string[]) => {
    const newOrder = fileIds.map(id => parseInt(id, 10));
    setOptions(prev => ({ ...prev, order: newOrder }));
  };

  const handleApplyMetadata = (metadata: SuggestedMetadata) => {
    setOptions(prev => ({
      ...prev,
      metadata: {
        title: metadata.title,
        author: metadata.author,
        subject: metadata.subject
      }
    }));
  };

  const handleApplySettings = (settings: MergeSettings) => {
    // For now, we'll just log the settings since the current merge tool
    // doesn't have all these advanced options implemented yet
    console.log('🧠 AI suggested settings:', settings);
    // TODO: Implement advanced merge settings in the future
  };

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Header */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              🔗
            </div>
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white">
                {t('tools.merge.toolTitle')}
              </h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {files.length} {getFileWord(files.length)} • {formatSize(totalSize)}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={state.isProcessing}
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
              {t('tools.merge.trustIndicators.private')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-seafoam-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('tools.merge.trustIndicators.quality')}
            </span>
          </div>
        </div>
      </div>

      {/* AI Smart Recommendations */}
      {files.length >= 2 && showAIRecommendations && (
        <div className="mb-8">
          <SmartMergeRecommendations
            files={files}
            onApplyOrder={handleApplyOrder}
            onApplyMetadata={handleApplyMetadata}
            onApplySettings={handleApplySettings}
            isProcessing={state.isProcessing}
          />
        </div>
      )}

      {/* Toggle AI Recommendations */}
      {files.length >= 2 && (
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowAIRecommendations(!showAIRecommendations)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-2 mx-auto px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-600/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
          >
            <span className="text-lg">{showAIRecommendations ? '🧠' : '🤖'}</span>
            <span>
              {showAIRecommendations ? 'Hide' : 'Show'} AI Recommendations
            </span>
          </button>
        </div>
      )}

      {/* File Reordering Section */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-seafoam-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            🔄
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-black dark:text-white">
                {t('tools.merge.orderTitle')}
              </h3>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                {orderedFiles.length} {t('tools.merge.fileCounter.label')}
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm mt-1">
              {t('tools.merge.orderDescription')}
              {orderedFiles.length > 5 && (
                <span className="text-blue-600 dark:text-blue-400 ml-1">
                  {t('tools.merge.fileCounter.scrollHint')}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {orderedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 transition-all duration-200 ${
                state.isProcessing ? 'opacity-60' : 'hover:shadow-md hover:scale-[1.01]'
              } ${shouldAnimate ? 'smooth-reveal' : ''}`}
              style={{ animationDelay: shouldAnimate ? `${index * 50}ms` : undefined }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center text-xl">
                    📄
                  </div>
                  <div>
                    <p className="font-black text-black dark:text-white">{file.name}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveFile(index, Math.max(0, index - 1))}
                    disabled={index === 0 || state.isProcessing}
                    className="p-2 text-gray-600 hover:text-seafoam-600 hover:bg-seafoam-50 dark:text-gray-400 dark:hover:text-seafoam-400 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('tools.merge.controls.moveUp')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveFile(index, Math.min(orderedFiles.length - 1, index + 1))}
                    disabled={index === orderedFiles.length - 1 || state.isProcessing}
                    className="p-2 text-gray-600 hover:text-seafoam-600 hover:bg-seafoam-50 dark:text-gray-400 dark:hover:text-seafoam-400 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('tools.merge.controls.moveDown')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Section - показывается только во время обработки */}
      {state.isProcessing && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
              ⚡
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">
              {t('tools.merge.processingTitle')}
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {state.progressMessage || t('tools.merge.processingDescription')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.merge.progress')}</span>
              <span className="text-sm font-bold text-seafoam-600 dark:text-seafoam-400">{Math.round(state.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-seafoam-500 to-ocean-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${state.progress}%` }}
              >
                {shouldAnimate && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Section */}
      {state.error && (
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">{t('tools.merge.errors.errorTitle')}</h4>
              <p className="text-red-700 dark:text-red-300 font-medium">{state.error}</p>
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

      {/* Actions */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleMerge}
            disabled={!canMerge || state.isProcessing}
            className={`
              btn-privacy-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]
              ${shouldAnimate ? 'ripple-effect btn-press' : ''}
              ${state.isProcessing ? 'animate-pulse' : ''}
            `}
          >
            {state.isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('tools.merge.actions.merging')}
              </div>
            ) : (
              t('tools.merge.actions.merge', { count: files.length, fileWord: getFileWord(files.length) })
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={state.isProcessing}
            className="btn-ocean-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]"
          >
            {state.isProcessing ? t('tools.merge.actions.cancel') : t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
});

ModernMergeTool.displayName = 'ModernMergeTool';

export default ModernMergeTool;