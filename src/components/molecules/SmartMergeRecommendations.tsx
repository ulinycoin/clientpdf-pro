import React, { useState, useEffect } from 'react';
import { smartMergeService } from '../../services/smartMergeService';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import {
  SmartMergeAnalysis,
  SmartMergeRecommendationsProps,
  MergeWarning,
  SuggestedMetadata,
  MergeSettings
} from '../../types/smartMerge.types';

/**
 * Smart Merge Recommendations Component
 * Displays AI-powered analysis and recommendations for PDF merging
 */
const SmartMergeRecommendations: React.FC<SmartMergeRecommendationsProps> = ({
  files,
  analysis,
  onApplyOrder,
  onApplyMetadata,
  onApplySettings,
  isProcessing = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [localAnalysis, setLocalAnalysis] = useState<SmartMergeAnalysis | undefined>(analysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Run analysis when files change (if not provided externally)
  useEffect(() => {
    if (!analysis && files.length >= 2 && !isAnalyzing) {
      runAnalysis();
    }
  }, [files, analysis]);

  // Re-run analysis when language changes
  useEffect(() => {
    if (localAnalysis && files.length >= 2) {
      console.log('🌍 Language changed to:', currentLanguage, '- re-running analysis');
      runAnalysis();
    }
  }, [currentLanguage]);

  const runAnalysis = async () => {
    if (files.length < 2) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Set language for service translations
      console.log('🌍 Setting service language to:', currentLanguage);
      smartMergeService.setLanguage(currentLanguage);
      const result = await smartMergeService.analyzeForMerge(files);
      setLocalAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.smartMerge.errors.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentAnalysis = analysis || localAnalysis;

  if (isAnalyzing) {
    return (
      <div className={`smart-merge-recommendations analyzing ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                🧠 {t('tools.smartMerge.analysis.analyzing')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('tools.smartMerge.analysis.analyzingDescription', { count: files.length })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`smart-merge-recommendations error ${className}`}>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  {t('tools.smartMerge.analysis.failed')}
                </h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              {t('tools.smartMerge.analysis.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAnalysis) {
    return (
      <div className={`smart-merge-recommendations empty ${className}`}>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-xl">🧠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('tools.smartMerge.analysis.available')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('tools.smartMerge.analysis.availableDescription')}
            </p>
            {files.length >= 2 && (
              <button
                onClick={runAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t('tools.smartMerge.analysis.analyzeButton')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { recommendations, predictions } = currentAnalysis;

  return (
    <div className={`smart-merge-recommendations ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🧠</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t('tools.smartMerge.recommendations.title')}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>{t('tools.smartMerge.recommendations.confidence', { percent: recommendations.suggestedOrder.confidence })}</span>
                </span>
                <span>•</span>
                <span>{t('tools.smartMerge.recommendations.documentsAnalyzed', { count: currentAnalysis.documents.length })}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all"
          >
            {showDetails ? t('tools.smartMerge.recommendations.hideDetails') : t('tools.smartMerge.recommendations.showDetails')}
          </button>
        </div>

        {/* Quick Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartMerge.predictions.processingTime.label')}</div>
            <div className="font-semibold text-gray-800">
              {Math.round(predictions.processingTime.estimated)}s
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartMerge.predictions.processingTime.range', { min: Math.round(predictions.processingTime.range.min), max: Math.round(predictions.processingTime.range.max) })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartMerge.predictions.resultSize.label')}</div>
            <div className="font-semibold text-gray-800">
              {formatBytes(predictions.resultSize.estimated)}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartMerge.predictions.resultSize.compression', { percent: (predictions.resultSize.compression > 0 ? '+' : '') + predictions.resultSize.compression })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartMerge.predictions.quality.label')}</div>
            <div className="font-semibold text-gray-800 capitalize">
              {t(`tools.smartMerge.predictions.quality.levels.${predictions.qualityForecast.overall}`)}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartMerge.predictions.quality.score', { score: predictions.qualityForecast.score })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartMerge.predictions.performance.label')}</div>
            <div className="font-semibold text-gray-800 capitalize">
              {t(`tools.smartMerge.predictions.performance.memoryUsage.${predictions.performanceImpact.memoryUsage}`)}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartMerge.predictions.performance.browserLoad', { percent: predictions.performanceImpact.browserLoad })}
            </div>
          </div>
        </div>

        {/* Main Recommendations */}
        <div className="space-y-4">

          {/* Suggested Order */}
          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center mr-2">
                  📋
                </span>
                {t('tools.smartMerge.order.title')}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {t(`tools.smartMerge.order.algorithms.${recommendations.suggestedOrder.algorithm}`)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {recommendations.suggestedOrder.reasoning}
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onApplyOrder(recommendations.suggestedOrder.fileIds)}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {t('tools.smartMerge.order.applyButton')}
              </button>
              <div className="text-xs text-gray-500">
                {t('tools.smartMerge.order.navigationScore', { score: recommendations.suggestedOrder.score })}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {recommendations.warnings.length > 0 && (
            <div className="space-y-2">
              {recommendations.warnings.map((warning, index) => (
                <WarningCard key={index} warning={warning} />
              ))}
            </div>
          )}

          {/* Suggested Metadata */}
          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800 flex items-center">
                <span className="w-5 h-5 bg-purple-100 rounded text-purple-600 text-xs flex items-center justify-center mr-2">
                  📝
                </span>
                {t('tools.smartMerge.metadata.title')}
              </h4>
              <span className="text-xs text-gray-500">
                {t('tools.smartMerge.metadata.confidence', { percent: recommendations.suggestedMetadata.confidence })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500">{t('tools.smartMerge.metadata.fields.title')}</div>
                <div className="text-sm font-medium text-gray-800">
                  {recommendations.suggestedMetadata.title}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">{t('tools.smartMerge.metadata.fields.subject')}</div>
                <div className="text-sm text-gray-700">
                  {recommendations.suggestedMetadata.subject}
                </div>
              </div>
            </div>

            {recommendations.suggestedMetadata.keywords.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">{t('tools.smartMerge.metadata.fields.keywords')}</div>
                <div className="flex flex-wrap gap-1">
                  {recommendations.suggestedMetadata.keywords.map((keyword, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => onApplyMetadata(recommendations.suggestedMetadata)}
              disabled={isProcessing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {t('tools.smartMerge.metadata.applyButton')}
            </button>
          </div>

          {/* Advanced Settings */}
          {showDetails && (
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
              <h4 className="font-medium text-gray-800 flex items-center mb-3">
                <span className="w-5 h-5 bg-green-100 rounded text-green-600 text-xs flex items-center justify-center mr-2">
                  ⚙️
                </span>
                {t('tools.smartMerge.settings.title')}
              </h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('tools.smartMerge.settings.fields.bookmarks')}</span>
                  <span className="ml-2 font-medium">
                    {recommendations.mergeSettings.preserveBookmarks ? t('tools.smartMerge.settings.values.preserve') : t('tools.smartMerge.settings.values.remove')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tools.smartMerge.settings.fields.quality')}</span>
                  <span className="ml-2 font-medium capitalize">
                    {recommendations.mergeSettings.qualityOptimization === 'balance'
                      ? t('tools.smartMerge.settings.values.qualityBalance')
                      : t('tools.smartMerge.settings.values.qualityPreserveBest')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tools.smartMerge.settings.fields.pageNumbers')}</span>
                  <span className="ml-2 font-medium capitalize">
                    {t(`tools.smartMerge.settings.values.${recommendations.mergeSettings.pageNumbering}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tools.smartMerge.settings.fields.annotations')}</span>
                  <span className="ml-2 font-medium capitalize">
                    {t(`tools.smartMerge.settings.values.${recommendations.mergeSettings.handleAnnotations}`)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onApplySettings(recommendations.mergeSettings)}
                disabled={isProcessing}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {t('tools.smartMerge.settings.applyButton')}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white border-opacity-30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t('tools.smartMerge.analysis.completed', { time: new Date().toLocaleTimeString(), version: currentAnalysis.version })}
            </span>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || isProcessing}
              className="hover:text-gray-700 transition-colors"
            >
              {t('tools.smartMerge.analysis.refreshAnalysis')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Warning Card Component
 */
const WarningCard: React.FC<{ warning: MergeWarning }> = ({ warning }) => {
  const { t } = useTranslation();
  const getWarningStyle = (severity: MergeWarning['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getWarningIcon = (severity: MergeWarning['severity']) => {
    switch (severity) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`rounded-lg p-3 border ${getWarningStyle(warning.severity)}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getWarningIcon(warning.severity)}</span>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-sm">{warning.message}</h5>
          <p className="text-xs opacity-90 mt-1">{warning.suggestion}</p>
          {warning.autoFix && (
            <button className="text-xs underline mt-2 hover:no-underline">
              {t('tools.smartMerge.warnings.autoFix')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default SmartMergeRecommendations;