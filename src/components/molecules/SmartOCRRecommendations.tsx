import React, { useState, useEffect } from 'react';
import { smartPDFService, OCRRecommendationsAdvanced, OCRStrategyAdvanced } from '../../services/smartPDFService';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import { Sparkles, Zap, Target, Globe, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

/**
 * Smart OCR Recommendations Component
 * Displays AI-powered analysis and recommendations for OCR processing
 */
interface SmartOCRRecommendationsProps {
  file: File;
  onApplyStrategy?: (strategy: OCRStrategyAdvanced) => void;
  isProcessing?: boolean;
  className?: string;
}

const SmartOCRRecommendations: React.FC<SmartOCRRecommendationsProps> = ({
  file,
  onApplyStrategy,
  isProcessing = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [recommendations, setRecommendations] = useState<OCRRecommendationsAdvanced | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Run analysis when file changes
  useEffect(() => {
    if (file && !isAnalyzing) {
      runAnalysis();
    }
  }, [file]);

  // Re-run analysis when language changes
  useEffect(() => {
    if (recommendations && file) {
      console.log('🌍 Language changed to:', currentLanguage, '- re-running OCR analysis');
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
      const result = await smartPDFService.analyzePDFForOCR(file);
      setRecommendations(result);
      // Auto-expand recommended strategy
      setExpandedStrategy(result.recommendedStrategy);
    } catch (err) {
      console.error('OCR analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyStrategy = (strategy: OCRStrategyAdvanced) => {
    if (onApplyStrategy && !isProcessing) {
      onApplyStrategy(strategy);
    }
  };

  const toggleStrategyDetails = (strategyId: string) => {
    setExpandedStrategy(expandedStrategy === strategyId ? null : strategyId);
  };

  // Loading State
  if (isAnalyzing) {
    return (
      <div className={`smart-ocr-recommendations analyzing ${className}`}>
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-800 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                🧠 Analyzing Document
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Examining image quality, language, and structure...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`smart-ocr-recommendations error ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
                  Analysis Failed
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No analysis yet
  if (!recommendations) {
    return null;
  }

  const { confidence, strategies, predictions, warnings, imageQuality, languageDetection, documentStructure } = recommendations;
  const recommendedStrategy = strategies.find(s => s.id === recommendations.recommendedStrategy);

  return (
    <div className={`smart-ocr-recommendations ${className} space-y-6`}>
      {/* Header with Confidence */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                AI OCR Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Comprehensive document analysis complete
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
              {confidence}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Confidence
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Image Quality */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Clarity</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {imageQuality.clarity}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {imageQuality.clarity > 80 ? 'Excellent' : imageQuality.clarity > 60 ? 'Good' : 'Poor'}
            </div>
          </div>

          {/* Resolution */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resolution</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {imageQuality.resolution} DPI
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {imageQuality.isScanned ? 'Scanned' : 'Photo'}
            </div>
          </div>

          {/* Language */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Language</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white uppercase">
              {languageDetection.primary}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {languageDetection.confidence}% confidence
            </div>
          </div>

          {/* Processing Time */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-gray-600/20">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Est. Time</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(predictions.processingTime)}s
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {predictions.accuracy}% accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`
                rounded-lg p-4 border flex items-start space-x-3
                ${warning.severity === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'}
              `}
            >
              <div className={`
                w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                ${warning.severity === 'warning'
                  ? 'bg-yellow-100 dark:bg-yellow-800'
                  : 'bg-blue-100 dark:bg-blue-800'}
              `}>
                {warning.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${
                  warning.severity === 'warning'
                    ? 'text-yellow-900 dark:text-yellow-200'
                    : 'text-blue-900 dark:text-blue-200'
                }`}>
                  {warning.message}
                </p>
                <p className={`text-xs mt-1 ${
                  warning.severity === 'warning'
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  💡 {warning.suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OCR Strategies */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Recommended OCR Strategies</span>
        </h4>

        {strategies.map((strategy) => {
          const isRecommended = strategy.id === recommendations.recommendedStrategy;
          const isExpanded = expandedStrategy === strategy.id;

          return (
            <div
              key={strategy.id}
              className={`
                rounded-xl border-2 transition-all duration-200
                ${isRecommended
                  ? 'border-cyan-400 dark:border-cyan-600 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700'}
              `}
            >
              {/* Strategy Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => toggleStrategyDetails(strategy.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {strategy.id === 'fast' && <Zap className="w-5 h-5 text-yellow-500" />}
                      {strategy.id === 'balanced' && <Target className="w-5 h-5 text-blue-500" />}
                      {strategy.id === 'accurate' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {strategy.id === 'multilang' && <Globe className="w-5 h-5 text-purple-500" />}

                      <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                        {strategy.name}
                      </h5>

                      {isRecommended && (
                        <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                          ⭐ RECOMMENDED
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {strategy.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Accuracy:</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          {strategy.expectedAccuracy}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Time:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ~{Math.round(strategy.expectedTime)}s
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Languages:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          {strategy.settings.languages.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`
                      ml-4 px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex-shrink-0
                      ${isProcessing
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : isRecommended
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyStrategy(strategy);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {/* Pros */}
                    <div>
                      <h6 className="text-sm font-bold text-green-700 dark:text-green-400 mb-2 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Advantages</span>
                      </h6>
                      <ul className="space-y-1">
                        {strategy.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div>
                      <h6 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-2 flex items-center space-x-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Trade-offs</span>
                      </h6>
                      <ul className="space-y-1">
                        {strategy.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                            <span className="text-orange-500 mt-0.5">!</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Settings Preview */}
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <h6 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Technical Settings
                    </h6>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                          {strategy.settings.mode}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Layout:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                          {strategy.settings.preserveLayout ? 'Preserved' : 'Standard'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Preprocessing:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                          {strategy.settings.preprocessImage ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <span className="font-bold">Why this strategy?</span> {strategy.reasoning}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Document Analysis Details */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Document Analysis Details
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Image Quality */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Image Quality</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Contrast:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{imageQuality.contrast}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Noise:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {imageQuality.hasNoise ? 'Detected' : 'Clean'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Skew:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {imageQuality.skewAngle.toFixed(1)}°
                </span>
              </div>
            </div>
          </div>

          {/* Language Detection */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Language Detection</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Script:</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {languageDetection.script}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mixed:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {languageDetection.mixedLanguages ? 'Yes' : 'No'}
                </span>
              </div>
              {languageDetection.secondary && languageDetection.secondary.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Secondary:</span>
                  <span className="font-semibold text-gray-900 dark:text-white uppercase">
                    {languageDetection.secondary.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Document Structure */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Document Structure</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Layout:</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {documentStructure.layout}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Columns:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {documentStructure.hasColumns ? 'Multiple' : 'Single'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Text Density:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {documentStructure.textDensity}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartOCRRecommendations;