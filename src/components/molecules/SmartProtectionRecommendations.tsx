import React, { useState, useEffect } from 'react';
import { smartPDFService, ProtectionRecommendations, SecurityLevel } from '../../services/smartPDFService';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Smart Protection Recommendations Component
 * Displays AI-powered analysis and recommendations for PDF protection
 */
interface SmartProtectionRecommendationsProps {
  file: File;
  onApplyLevel?: (level: SecurityLevel) => void;
  isProcessing?: boolean;
  className?: string;
}

const SmartProtectionRecommendations: React.FC<SmartProtectionRecommendationsProps> = ({
  file,
  onApplyLevel,
  isProcessing = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [analysis, setAnalysis] = useState<ProtectionRecommendations | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('medium');
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
      console.log('🌍 Language changed to:', currentLanguage, '- re-running protection analysis');
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
      const result = await smartPDFService.analyzePDFForProtection(file);
      setAnalysis(result);
      // Set default selected level to recommended
      if (result.recommendedLevel) {
        setSelectedLevel(result.recommendedLevel.level);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.protect.ai.errors.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyLevel = (level: SecurityLevel) => {
    setSelectedLevel(level.level);
    onApplyLevel?.(level);
  };

  if (isAnalyzing) {
    return (
      <div className={`smart-protection-recommendations analyzing ${className}`}>
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                🛡️ {t('tools.protect.ai.analysis.analyzing')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.protect.ai.analysis.analyzingDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`smart-protection-recommendations error ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  {t('tools.protect.ai.analysis.failed')}
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-700/50 transition-colors text-sm font-medium"
            >
              {t('tools.protect.ai.analysis.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { securityLevels, warnings, suggestions, recommendedLevel } = analysis;

  return (
    <div className={`smart-protection-recommendations ${className}`}>
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t('tools.protect.ai.recommendations.title')}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-red-400 dark:bg-red-500 rounded-full"></span>
                  <span>{t('tools.protect.ai.recommendations.confidence', { percent: recommendedLevel.confidence })}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 bg-opacity-60 rounded-lg hover:bg-opacity-80 transition-all"
          >
            {showDetails ? t('tools.protect.ai.recommendations.hideDetails') : t('tools.protect.ai.recommendations.showDetails')}
          </button>
        </div>

        {/* Recommended Security Level Badge */}
        <div className="mb-6 bg-white dark:bg-gray-800/50 bg-opacity-70 rounded-lg p-4 border border-white dark:border-gray-700 border-opacity-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {t('tools.protect.ai.recommendations.recommended')}
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {recommendedLevel.title}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {recommendedLevel.reasoning}
              </p>
            </div>
            <button
              onClick={() => handleApplyLevel(recommendedLevel)}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
            >
              {t('tools.protect.ai.recommendations.applyButton')}
            </button>
          </div>
        </div>

        {/* Security Levels */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm flex items-center">
            <span className="w-5 h-5 bg-blue-100 dark:bg-blue-800/50 rounded text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center mr-2">
              🔒
            </span>
            {t('tools.protect.ai.securityLevels.title')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {securityLevels.map((level) => (
              <SecurityLevelCard
                key={level.level}
                level={level}
                isSelected={selectedLevel === level.level}
                isRecommended={recommendedLevel.level === level.level}
                onSelect={() => handleApplyLevel(level)}
                disabled={isProcessing}
              />
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800/50 bg-opacity-70 rounded-lg p-4 border border-white dark:border-gray-700 border-opacity-50 mb-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm flex items-center mb-3">
              <span className="w-5 h-5 bg-green-100 dark:bg-green-800/50 rounded text-green-600 dark:text-green-400 text-xs flex items-center justify-center mr-2">
                💡
              </span>
              {t('tools.protect.ai.suggestions.title')}
            </h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2 mb-4">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 border flex items-start space-x-3 ${
                  warning.severity === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : warning.severity === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  warning.severity === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : warning.severity === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    warning.severity === 'error'
                      ? 'text-red-800 dark:text-red-200'
                      : warning.severity === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {warning.message}
                  </p>
                  {warning.suggestion && (
                    <p className={`text-xs mt-1 ${
                      warning.severity === 'error'
                        ? 'text-red-700 dark:text-red-300'
                        : warning.severity === 'warning'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      💡 {warning.suggestion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Information */}
        {showDetails && (
          <div className="bg-white dark:bg-gray-800/50 bg-opacity-70 rounded-lg p-4 border border-white dark:border-gray-700 border-opacity-50">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center mb-3">
              <span className="w-5 h-5 bg-purple-100 dark:bg-purple-800/50 rounded text-purple-600 dark:text-purple-400 text-xs flex items-center justify-center mr-2">
                📊
              </span>
              {t('tools.protect.ai.details.title')}
            </h4>

            <div className="space-y-4">
              {securityLevels.map((level) => (
                <div key={level.level} className="border-t border-gray-200 dark:border-gray-700 pt-3 first:border-t-0 first:pt-0">
                  <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">
                    {level.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {level.description}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('tools.protect.ai.details.permissions')}:
                      </div>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        {level.permissions.map((perm, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 dark:text-green-400 mr-1">✓</span>
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('tools.protect.ai.details.restrictions')}:
                      </div>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        {level.restrictions.map((rest, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 dark:text-red-400 mr-1">✗</span>
                            {rest}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('tools.protect.ai.details.passwordStrength')}:
                    </span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {level.passwordStrengthRequired}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white dark:border-gray-700 border-opacity-30">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {t('tools.protect.ai.analysis.completed', { time: new Date().toLocaleTimeString() })}
            </span>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || isProcessing}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {t('tools.protect.ai.analysis.refresh')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Security Level Card Component
 */
const SecurityLevelCard: React.FC<{
  level: SecurityLevel;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  disabled?: boolean;
}> = ({ level, isSelected, isRecommended, onSelect, disabled = false }) => {
  const { t } = useTranslation();

  const getLevelColor = (levelType: string) => {
    switch (levelType) {
      case 'basic':
        return 'from-green-500 to-emerald-500';
      case 'medium':
        return 'from-yellow-500 to-orange-500';
      case 'high':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`p-4 rounded-lg border-2 transition-all text-left relative ${
        isSelected
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
          ⭐ {t('tools.protect.ai.recommendations.recommended')}
        </div>
      )}

      <div className={`w-10 h-10 bg-gradient-to-br ${getLevelColor(level.level)} rounded-lg flex items-center justify-center mb-3`}>
        <Lock className="w-5 h-5 text-white" />
      </div>

      <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">
        {level.title}
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {level.description}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded capitalize ${
          level.level === 'basic'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : level.level === 'medium'
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {level.passwordStrengthRequired}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {level.confidence}% {t('tools.protect.ai.recommendations.confidence', { percent: '' }).replace(/\d+%\s*/, '')}
        </span>
      </div>
    </button>
  );
};

export default SmartProtectionRecommendations;