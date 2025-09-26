import React, { useState, useCallback, useMemo } from 'react';
import { CompressionToolProps, PDFProcessingResult, CompressionOptions } from '../../types';
import { compressionService } from '../../services/compressionService';
import { useTranslation } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import SmartCompressionRecommendations from '../molecules/SmartCompressionRecommendations';
import { OptimizationSettings, CompressionRecommendations } from '../../types/smartCompression.types';

const ModernCompressionTool: React.FC<CompressionToolProps> = React.memo(({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
  const { shouldAnimate } = useMotionPreferences();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSmartRecommendations, setShowSmartRecommendations] = useState(true);
  
  const [options, setOptions] = useState<CompressionOptions>(() => {
    // Get recommended settings for the first file
    if (files.length > 0) {
      return compressionService.getRecommendedSettings(files[0]);
    }
    return {
      quality: 0.8,
      imageCompression: true,
      removeMetadata: false,
      optimizeForWeb: true,
    };
  });

  const currentFile = files[0];

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ${t('tools.compress.fileSizeUnit')}`;
  };

  const clearError = () => setError(null);

  const estimatedSavings = useMemo(() => {
    return files.length > 0 
      ? compressionService.estimateCompressionPotential(files[0])
      : 0;
  }, [files]);

  const getQualityText = (quality: number) => {
    if (quality <= 0.3) return t('tools.compress.qualitySettings.qualityLabels.maxCompression');
    if (quality <= 0.5) return t('tools.compress.qualitySettings.qualityLabels.highCompression');
    if (quality <= 0.7) return t('tools.compress.qualitySettings.qualityLabels.mediumCompression');
    if (quality <= 0.8) return t('tools.compress.qualitySettings.qualityLabels.optimal');
    return t('tools.compress.qualitySettings.qualityLabels.highQuality');
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 0.3) return 'text-red-600 dark:text-red-400';
    if (quality <= 0.5) return 'text-orange-600 dark:text-orange-400';
    if (quality <= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    if (quality <= 0.8) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      setError(t('tools.compress.errors.selectFile'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage(t('tools.compress.processing.startingMessage'));
    setError(null);

    try {
      const file = files[0]; // For now, compress only the first file
      
      const result = await compressionService.compressPDF(
        file,
        options,
        (progress, message) => {
          setProgress(progress);
          setProgressMessage(message || t('tools.compress.processing.defaultMessage'));
        }
      );

      if (result.success) {
        onComplete(result);
      } else {
        setError(result.error?.message || t('tools.compress.errors.compressionError'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.compress.errors.unknownError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const canCompress = useMemo(() => {
    return files.length > 0 && !isProcessing;
  }, [files.length, isProcessing]);

  // Smart Compression handlers
  const handleApplyRecommendations = (smartSettings: OptimizationSettings) => {
    console.log('Applying smart compression recommendations:', smartSettings);

    // Map smart settings to compression options
    setOptions(prev => ({
      ...prev,
      quality: smartSettings.imageQuality / 100,
      imageCompression: smartSettings.imageCompression,
      removeMetadata: smartSettings.removeMetadata,
      optimizeForWeb: smartSettings.linearizeForWeb
    }));
  };

  const handleApplyStrategy = (strategy: CompressionRecommendations) => {
    console.log('Applying compression strategy:', strategy);

    // Apply strategy-based settings
    let qualityValue = 0.8; // default

    if (strategy.compressionLevel === 'conservative') {
      qualityValue = 0.9;
    } else if (strategy.compressionLevel === 'aggressive') {
      qualityValue = 0.6;
    } else { // balanced
      qualityValue = 0.8;
    }

    setOptions(prev => ({
      ...prev,
      quality: qualityValue,
      imageCompression: strategy.compressionLevel !== 'conservative',
      removeMetadata: strategy.compressionLevel === 'aggressive',
      optimizeForWeb: strategy.compressionLevel !== 'conservative'
    }));
  };

  const handleCustomizeSettings = (customSettings: Partial<OptimizationSettings>) => {
    console.log('Customizing settings:', customSettings);

    // Apply partial settings
    setOptions(prev => {
      const updated = { ...prev };

      if (customSettings.imageQuality !== undefined) {
        updated.quality = customSettings.imageQuality / 100;
      }
      if (customSettings.imageCompression !== undefined) {
        updated.imageCompression = customSettings.imageCompression;
      }
      if (customSettings.removeMetadata !== undefined) {
        updated.removeMetadata = customSettings.removeMetadata;
      }
      if (customSettings.linearizeForWeb !== undefined) {
        updated.optimizeForWeb = customSettings.linearizeForWeb;
      }

      return updated;
    });
  };

  if (!currentFile) {
    return (
      <div className={`max-w-3xl mx-auto ${className}`}>
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-8 text-center ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white mb-4">
            {t('tools.compress.noFileTitle')}
          </h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mb-6">
            {t('tools.compress.noFileMessage')}
          </p>
          <button
            onClick={onClose}
            className="btn-ocean-modern"
          >
            {t('tools.compress.backButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Header */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              🗜️
            </div>
            <div>
              <h2 className="text-2xl font-black text-black dark:text-white">
                {t('tools.compress.toolTitle')}
              </h2>
              <p className="text-gray-800 dark:text-gray-100 font-medium">
                {currentFile.name} • {formatSize(currentFile.size)}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
            aria-label={t('tools.compress.closeButton')}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        {/* File Info with Potential Savings */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-600/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-seafoam-100 to-ocean-100 dark:from-privacy-800 dark:to-privacy-700 rounded-xl flex items-center justify-center">
                <span className="text-seafoam-600 text-xl">📄</span>
              </div>
              <div>
                <p className="font-bold text-black dark:text-white">{currentFile.name}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tools.compress.currentSize')}: {formatSize(currentFile.size)}
                </p>
              </div>
            </div>
            {estimatedSavings > 0 && (
              <div className="text-right">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ~{estimatedSavings}% {t('tools.compress.estimatedSavings')}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('tools.compress.forecastedSaving')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <div className={`w-2 h-2 rounded-full bg-success-500 ${shouldAnimate ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('tools.compress.trustIndicators.privateProcessing')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-600/20">
            <svg className="w-4 h-4 text-seafoam-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {t('tools.compress.trustIndicators.intelligentCompression')}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Compression Recommendations */}
      {showSmartRecommendations && (
        <SmartCompressionRecommendations
          files={files}
          onApplyRecommendations={handleApplyRecommendations}
          onApplyStrategy={handleApplyStrategy}
          onCustomizeSettings={handleCustomizeSettings}
          isProcessing={isProcessing}
          className={`mb-8 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}
        />
      )}

      {/* AI Toggle */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6 mb-8 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg">
              🧠
            </div>
            <div>
              <h4 className="text-lg font-bold text-black dark:text-white">
                {t('tools.compress.smartRecommendations.title', 'Smart AI Recommendations')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('tools.compress.smartRecommendations.description', 'Get AI-powered optimization suggestions')}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showSmartRecommendations}
              onChange={(e) => setShowSmartRecommendations(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Quality Settings */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-seafoam-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            🎚️
          </div>
          <div>
            <h3 className="text-xl font-black text-black dark:text-white">
              {t('tools.compress.qualitySettings.title')}
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
              {t('tools.compress.qualitySettings.subtitle')}
            </p>
          </div>
        </div>

        {/* Quality Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-bold text-black dark:text-white">
              {t('tools.compress.qualitySettings.qualityLevel')}
            </label>
            <div className="text-right">
              <div className={`text-lg font-bold ${getQualityColor(options.quality)}`}>
                {Math.round(options.quality * 100)}%
              </div>
              <div className={`text-sm font-medium ${getQualityColor(options.quality)}`}>
                {getQualityText(options.quality)}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={options.quality}
              onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-4 bg-gradient-to-r from-red-300 via-yellow-300 via-green-300 to-blue-300 dark:from-red-600 dark:via-yellow-600 dark:via-green-600 dark:to-blue-600 rounded-lg appearance-none cursor-pointer focus:ring-4 focus:ring-seafoam-500/50 shadow-lg border-2 border-white dark:border-gray-700"
              style={{
                backgroundImage: `linear-gradient(to right, #f87171 0%, #fbbf24 25%, #34d399 50%, #60a5fa 75%, #3b82f6 100%)`,
                WebkitAppearance: 'none',
                outline: 'none'
              }}
            />
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
              <span>{t('tools.compress.qualitySettings.smallerSize')}</span>
              <span>{t('tools.compress.qualitySettings.betterQuality')}</span>
            </div>
          </div>
        </div>

        {/* Quality Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-600/30">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm">
                🗜️
              </div>
              <h4 className="font-bold text-black dark:text-white text-sm mb-1">
                {t('tools.compress.previewCards.maxCompression.title')}
              </h4>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('tools.compress.previewCards.maxCompression.subtitle')}
              </p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-600/30">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-sm">
                ⚖️
              </div>
              <h4 className="font-bold text-black dark:text-white text-sm mb-1">
                {t('tools.compress.previewCards.optimal.title')}
              </h4>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('tools.compress.previewCards.optimal.subtitle')}
              </p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-600/30">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                💎
              </div>
              <h4 className="font-bold text-black dark:text-white text-sm mb-1">
                {t('tools.compress.previewCards.highQuality.title')}
              </h4>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('tools.compress.previewCards.highQuality.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-privacy-500 to-privacy-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            ⚙️
          </div>
          <div>
            <h3 className="text-xl font-black text-black dark:text-white">
              {t('tools.compress.advancedSettings.title')}
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">
              {t('tools.compress.advancedSettings.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'imageCompression',
              label: t('tools.compress.advancedSettings.compressImages.title'),
              description: t('tools.compress.advancedSettings.compressImages.description'),
              icon: '🖼️',
              checked: options.imageCompression
            },
            {
              key: 'removeMetadata',
              label: t('tools.compress.advancedSettings.removeMetadata.title'),
              description: t('tools.compress.advancedSettings.removeMetadata.description'),
              icon: '🗑️',
              checked: options.removeMetadata
            },
            {
              key: 'optimizeForWeb',
              label: t('tools.compress.advancedSettings.optimizeForWeb.title'),
              description: t('tools.compress.advancedSettings.optimizeForWeb.description'),
              icon: '🌐',
              checked: options.optimizeForWeb
            }
          ].map((option, index) => (
            <label 
              key={option.key}
              className={`
                flex items-start gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl cursor-pointer transition-all duration-200
                ${option.checked ? 'ring-2 ring-seafoam-500 bg-seafoam-50/50 dark:bg-seafoam-900/20' : 'hover:shadow-md hover:scale-[1.01]'}
                ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                ${shouldAnimate ? 'smooth-reveal' : ''}
              `}
              style={{ animationDelay: shouldAnimate ? `${index * 100}ms` : undefined }}
            >
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                disabled={isProcessing}
                className="w-5 h-5 text-seafoam-600 bg-white border-gray-300 rounded focus:ring-seafoam-500 focus:ring-2 mt-0.5"
              />
              <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                {option.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-black dark:text-white mb-1">{option.label}</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      {isProcessing && (
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
              ⚡
            </div>
            <h3 className="text-xl font-black text-black dark:text-white mb-2">
              {t('tools.compress.processing.title')}
            </h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium">
              {progressMessage || t('tools.compress.processing.defaultMessage')}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tools.compress.processing.progressLabel')}</span>
              <span className="text-sm font-bold text-seafoam-600 dark:text-seafoam-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-seafoam-500 to-ocean-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
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
      {error && (
        <div className={`bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">{t('tools.compress.errors.processingError')}</h4>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
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

      {/* Info Box */}
      <div className={`bg-seafoam-50/90 dark:bg-seafoam-900/20 backdrop-blur-lg border border-seafoam-200/50 dark:border-seafoam-800/50 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-seafoam-500 rounded-xl flex items-center justify-center text-white text-xl">
            💡
          </div>
          <div>
            <h4 className="font-bold text-seafoam-800 dark:text-seafoam-200 mb-2">
              {t('tools.compress.infoBox.title')}
            </h4>
            <p className="text-seafoam-700 dark:text-seafoam-300 font-medium text-sm leading-relaxed">
              {t('tools.compress.infoBox.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 transition-all duration-300 ${shouldAnimate ? 'smooth-reveal staggered-reveal' : ''}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCompress}
            disabled={!canCompress}
            className={`
              btn-privacy-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]
              ${shouldAnimate ? 'ripple-effect btn-press' : ''}
              ${isProcessing ? 'animate-pulse' : ''}
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('tools.compress.actions.compressing')}
              </div>
            ) : (
              t('tools.compress.actions.compress')
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn-ocean-modern text-lg px-8 py-4 flex-1 sm:flex-none min-w-[200px]"
          >
            {isProcessing ? t('tools.compress.actions.cancel') : t('tools.compress.actions.back')}
          </button>
        </div>
      </div>
    </div>
  );
});

ModernCompressionTool.displayName = 'ModernCompressionTool';

export default ModernCompressionTool;