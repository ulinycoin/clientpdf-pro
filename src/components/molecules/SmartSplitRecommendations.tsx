import React, { useState, useEffect } from 'react';
import { smartPDFService, SplitRecommendations } from '../../services/smartPDFService';
import { useTranslation, useI18n } from '../../hooks/useI18n';

/**
 * Smart Split Recommendations Component
 * Displays AI-powered analysis and recommendations for PDF splitting
 */
interface SmartSplitRecommendationsProps {
  file: File;
  onApplyStrategy?: (strategy: any) => void;
  isProcessing?: boolean;
  className?: string;
}

const SmartSplitRecommendations: React.FC<SmartSplitRecommendationsProps> = ({
  file,
  onApplyStrategy,
  isProcessing = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [analysis, setAnalysis] = useState<SplitRecommendations | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Run analysis when file changes
  useEffect(() => {
    if (file && !isAnalyzing) {
      runAnalysis();
    }
  }, [file]);

  // Re-run analysis when language changes
  useEffect(() => {
    if (analysis && file) {
      console.log('🌍 Language changed to:', currentLanguage, '- re-running split analysis');
      runAnalysis();
    }
  }, [currentLanguage]);

  const runAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('🌍 Setting service language to:', currentLanguage);
      smartPDFService.setLanguage(currentLanguage);
      const result = await smartPDFService.analyzePDFForSplit(file);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.split.ai.errors.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className={`smart-split-recommendations analyzing ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                🧠 {t('tools.split.ai.analysis.analyzing')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('tools.split.ai.analysis.analyzingDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`smart-split-recommendations error ${className}`}>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  {t('tools.split.ai.analysis.failed')}
                </h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              {t('tools.split.ai.analysis.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`smart-split-recommendations empty ${className}`}>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-xl">🧠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('tools.split.ai.analysis.available')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('tools.split.ai.analysis.availableDescription')}
            </p>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t('tools.split.ai.analysis.analyzeButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { strategies, predictions, warnings } = analysis;

  return (
    <div className={`smart-split-recommendations ${className}`}>
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">🧠</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t('tools.split.ai.recommendations.title')}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>{t('tools.split.ai.recommendations.confidence', { percent: strategies[0]?.confidence || 0 })}</span>
                </span>
                <span>•</span>
                <span>{t('tools.split.ai.recommendations.strategiesFound', { count: strategies.length })}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all"
          >
            {showDetails ? t('tools.split.ai.recommendations.hideDetails') : t('tools.split.ai.recommendations.showDetails')}
          </button>
        </div>

        {/* Quick Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.split.ai.predictions.outputFiles.label')}</div>
            <div className="font-semibold text-gray-800">
              {predictions.outputFiles} {t('tools.split.ai.predictions.outputFiles.unit')}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.split.ai.predictions.avgSize', { size: formatBytes(predictions.avgFileSize) })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.split.ai.predictions.processingTime.label')}</div>
            <div className="font-semibold text-gray-800">
              {Math.round(predictions.processingTime)}s
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.split.ai.predictions.processingTime.description')}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.split.ai.predictions.confidence.label')}</div>
            <div className="font-semibold text-gray-800">
              {predictions.confidence}%
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.split.ai.predictions.confidence.description')}
            </div>
          </div>
        </div>

        {/* Main Strategies */}
        <div className="space-y-4">
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <span className="w-5 h-5 bg-green-100 rounded text-green-600 text-xs flex items-center justify-center mr-2">
                    {getStrategyIcon(strategy.type)}
                  </span>
                  {strategy.title}
                </h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {t('tools.split.ai.strategies.confidence', { percent: strategy.confidence })}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {strategy.description}
              </p>

              {showDetails && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-2">{t('tools.split.ai.strategies.ranges')}:</div>
                  <div className="flex flex-wrap gap-1">
                    {strategy.ranges.slice(0, 5).map((range, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {range.label}: {range.start}-{range.end}
                      </span>
                    ))}
                    {strategy.ranges.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{strategy.ranges.length - 5} {t('tools.split.ai.strategies.moreRanges')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onApplyStrategy?.(strategy)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {t('tools.split.ai.strategies.applyButton')}
                </button>
                <div className="text-xs text-gray-500">
                  {strategy.reasoning}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">{t('tools.split.ai.warnings.title')}</h4>
            {warnings.map((warning, index) => (
              <WarningCard key={index} warning={warning} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white border-opacity-30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t('tools.split.ai.analysis.completed', { time: new Date().toLocaleTimeString(), version: analysis.version })}
            </span>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || isProcessing}
              className="hover:text-gray-700 transition-colors"
            >
              {t('tools.split.ai.analysis.refreshAnalysis')}
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
const WarningCard: React.FC<{ warning: any }> = ({ warning }) => {
  const { t } = useTranslation();
  const getWarningStyle = (severity: string) => {
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

  const getWarningIcon = (severity: string) => {
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
        </div>
      </div>
    </div>
  );
};

// Utility functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getStrategyIcon = (type: string): string => {
  switch (type) {
    case 'chapters': return '📖';
    case 'equal': return '📊';
    case 'single': return '📄';
    case 'custom': return '⚙️';
    default: return '📋';
  }
};

export default SmartSplitRecommendations;