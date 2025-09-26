import React, { useState, useEffect } from 'react';
import { smartCompressionService } from '../../services/smartCompressionService';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import {
  SmartCompressionAnalysis,
  SmartCompressionRecommendationsProps,
  CompressionWarning,
  OptimizationSettings,
  CompressionRecommendations,
  CompressionPreset,
  DEFAULT_COMPRESSION_PRESETS
} from '../../types/smartCompression.types';

/**
 * Smart Compression Recommendations Component
 * Displays AI-powered analysis and recommendations for PDF compression
 */
const SmartCompressionRecommendations: React.FC<SmartCompressionRecommendationsProps> = ({
  files,
  analysis,
  onApplyRecommendations,
  onApplyStrategy,
  onCustomizeSettings,
  isProcessing = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [localAnalysis, setLocalAnalysis] = useState<SmartCompressionAnalysis | undefined>(analysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [error, setError] = useState<string | null>(null);

  // Run analysis when files change (if not provided externally)
  useEffect(() => {
    if (!analysis && files.length >= 1 && !isAnalyzing) {
      runAnalysis();
    }
  }, [files, analysis]);

  // Re-run analysis when language changes
  useEffect(() => {
    if (localAnalysis && files.length >= 1) {
      console.log('🌍 Language changed to:', currentLanguage, '- re-running analysis');
      runAnalysis();
    }
  }, [currentLanguage]);

  const runAnalysis = async () => {
    if (files.length < 1) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Set language for service translations
      console.log('🌍 Setting service language to:', currentLanguage);
      smartCompressionService.setLanguage(currentLanguage);
      const result = await smartCompressionService.analyzeForCompression(files);
      setLocalAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.smartCompression.errors.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePresetSelection = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = smartCompressionService.getCompressionPreset(presetName);
    if (preset) {
      onApplyRecommendations(preset.settings);
    }
  };

  const currentAnalysis = analysis || localAnalysis;

  if (isAnalyzing) {
    return (
      <div className={`smart-compression-recommendations analyzing ${className}`}>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                🗜️ {t('tools.smartCompression.analysis.analyzing')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('tools.smartCompression.analysis.analyzingDescription', { count: files.length })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`smart-compression-recommendations error ${className}`}>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  {t('tools.smartCompression.analysis.failed')}
                </h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              {t('tools.smartCompression.analysis.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAnalysis) {
    return (
      <div className={`smart-compression-recommendations empty ${className}`}>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-xl">🗜️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('tools.smartCompression.analysis.available')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('tools.smartCompression.analysis.availableDescription')}
            </p>
            {files.length >= 1 && (
              <button
                onClick={runAnalysis}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {t('tools.smartCompression.analysis.analyzeButton')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { recommendations, predictions, contentAnalysis } = currentAnalysis;

  return (
    <div className={`smart-compression-recommendations ${className}`}>
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">🗜️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t('tools.smartCompression.recommendations.title')}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>{t('tools.smartCompression.recommendations.confidence', { percent: recommendations.confidence })}</span>
                </span>
                <span>•</span>
                <span>{t('tools.smartCompression.recommendations.potential', { percent: contentAnalysis.compressionPotential })}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-white bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all"
          >
            {showDetails ? t('tools.smartCompression.recommendations.hideDetails') : t('tools.smartCompression.recommendations.showDetails')}
          </button>
        </div>

        {/* Quick Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartCompression.predictions.sizeReduction.label')}</div>
            <div className="font-semibold text-gray-800">
              -{recommendations.expectedSizeReduction}%
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartCompression.predictions.sizeReduction.estimated', { size: formatBytes(predictions.resultSize.resultSize) })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartCompression.predictions.processingTime.label')}</div>
            <div className="font-semibold text-gray-800">
              {Math.round(predictions.processingTime.estimated)}s
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartCompression.predictions.processingTime.range', { min: Math.round(predictions.processingTime.range.min), max: Math.round(predictions.processingTime.range.max) })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartCompression.predictions.quality.label')}</div>
            <div className="font-semibold text-gray-800 capitalize">
              {t(`tools.smartCompression.predictions.quality.levels.${predictions.qualityForecast.overall}`)}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartCompression.predictions.quality.impact', { percent: recommendations.qualityLossEstimate })}
            </div>
          </div>

          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-white border-opacity-50">
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('tools.smartCompression.predictions.performance.label')}</div>
            <div className="font-semibold text-gray-800 capitalize">
              {t(`tools.smartCompression.predictions.performance.memoryUsage.${predictions.performanceImpact.memoryUsage}`)}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.smartCompression.predictions.performance.cpuIntensive', { intensive: predictions.performanceImpact.cpuIntensive ? 'Yes' : 'No' })}
            </div>
          </div>
        </div>

        {/* Main Recommendations */}
        <div className="space-y-4">

          {/* Compression Strategy */}
          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800 flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded text-green-600 text-xs flex items-center justify-center mr-2">
                  🎯
                </span>
                {t('tools.smartCompression.strategy.title')}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                {t(`tools.smartCompression.strategy.levels.${recommendations.compressionLevel}`)}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {recommendations.reasoning}
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onApplyStrategy(recommendations)}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {t('tools.smartCompression.strategy.applyButton')}
              </button>
              <div className="text-xs text-gray-500">
                {t('tools.smartCompression.strategy.expectedSavings', { savings: formatBytes(predictions.resultSize.comparison.savings) })}
              </div>
            </div>
          </div>

          {/* Compression Presets */}
          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
            <div className="flex items-center mb-3">
              <h4 className="font-medium text-gray-800 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center mr-2">
                  ⚙️
                </span>
                {t('tools.smartCompression.presets.title')}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {DEFAULT_COMPRESSION_PRESETS.map((preset) => (
                <PresetCard
                  key={preset.name}
                  preset={preset}
                  isSelected={selectedPreset === preset.name}
                  onSelect={() => handlePresetSelection(preset.name)}
                  disabled={isProcessing}
                />
              ))}
            </div>
          </div>

          {/* Content Analysis Details */}
          {showDetails && (
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-white border-opacity-50">
              <h4 className="font-medium text-gray-800 flex items-center mb-3">
                <span className="w-5 h-5 bg-purple-100 rounded text-purple-600 text-xs flex items-center justify-center mr-2">
                  📊
                </span>
                {t('tools.smartCompression.contentAnalysis.title')}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{contentAnalysis.textPercentage}%</div>
                  <div className="text-xs text-gray-600">{t('tools.smartCompression.contentAnalysis.text')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{contentAnalysis.imagePercentage}%</div>
                  <div className="text-xs text-gray-600">{t('tools.smartCompression.contentAnalysis.images')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{contentAnalysis.vectorPercentage}%</div>
                  <div className="text-xs text-gray-600">{t('tools.smartCompression.contentAnalysis.vectors')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('tools.smartCompression.contentAnalysis.quality')}</span>
                  <span className="ml-2 font-medium capitalize">
                    {t(`tools.smartCompression.contentAnalysis.qualityLevels.${contentAnalysis.qualityAssessment}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tools.smartCompression.contentAnalysis.complexity')}</span>
                  <span className="ml-2 font-medium capitalize">
                    {t(`tools.smartCompression.contentAnalysis.complexityLevels.${contentAnalysis.pageComplexity}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tools.smartCompression.contentAnalysis.currentCompression')}</span>
                  <span className="ml-2 font-medium capitalize">
                    {t(`tools.smartCompression.contentAnalysis.compressionLevels.${contentAnalysis.currentCompression}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tools.smartCompression.contentAnalysis.embeddedFonts')}</span>
                  <span className="ml-2 font-medium">
                    {contentAnalysis.hasEmbeddedFonts ? t('common.yes') : t('common.no')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {currentAnalysis.warnings.length > 0 && (
            <div className="space-y-2">
              {currentAnalysis.warnings.map((warning, index) => (
                <WarningCard key={index} warning={warning} />
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white border-opacity-30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t('tools.smartCompression.analysis.completed', { time: new Date().toLocaleTimeString(), version: currentAnalysis.version })}
            </span>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || isProcessing}
              className="hover:text-gray-700 transition-colors"
            >
              {t('tools.smartCompression.analysis.refreshAnalysis')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Compression Preset Card Component
 */
const PresetCard: React.FC<{
  preset: CompressionPreset;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}> = ({ preset, isSelected, onSelect, disabled = false }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`p-3 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="font-medium text-sm text-gray-800 mb-1">
        {t(`tools.smartCompression.presets.names.${preset.name}`)}
      </div>
      <div className="text-xs text-gray-600 mb-2">
        {t(`tools.smartCompression.presets.descriptions.${preset.name}`)}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-green-600 font-medium">
          -{preset.targetSizeReduction}%
        </span>
        <span className={`px-2 py-1 rounded text-xs ${
          preset.qualityImpact === 'minimal' ? 'bg-green-100 text-green-800' :
          preset.qualityImpact === 'low' ? 'bg-yellow-100 text-yellow-800' :
          preset.qualityImpact === 'medium' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {t(`tools.smartCompression.presets.qualityImpact.${preset.qualityImpact}`)}
        </span>
      </div>
    </button>
  );
};

/**
 * Warning Card Component
 */
const WarningCard: React.FC<{ warning: CompressionWarning }> = ({ warning }) => {
  const { t } = useTranslation();

  const getWarningStyle = (severity: CompressionWarning['severity']) => {
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

  const getWarningIcon = (severity: CompressionWarning['severity']) => {
    switch (severity) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getImpactBadge = (impact: CompressionWarning['impact']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[impact]}`}>
        {t(`tools.smartCompression.warnings.impact.${impact}`)}
      </span>
    );
  };

  return (
    <div className={`rounded-lg p-3 border ${getWarningStyle(warning.severity)}`}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getWarningIcon(warning.severity)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h5 className="font-medium text-sm">{warning.message}</h5>
            {getImpactBadge(warning.impact)}
          </div>
          <p className="text-xs opacity-90 mb-2">{warning.suggestion}</p>
          {warning.affectedAreas.length > 0 && (
            <div className="text-xs opacity-75">
              {t('tools.smartCompression.warnings.affectedAreas')}: {warning.affectedAreas.join(', ')}
            </div>
          )}
          {warning.autoFix && (
            <button className="text-xs underline mt-2 hover:no-underline">
              {t('tools.smartCompression.warnings.autoFix')}
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

export default SmartCompressionRecommendations;