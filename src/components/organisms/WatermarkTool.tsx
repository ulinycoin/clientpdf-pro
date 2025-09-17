import React, { useState, useEffect } from 'react';
import { useWatermark } from '../../hooks/useWatermark';
import { WatermarkOptions, WatermarkService } from '../../services/watermarkService';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
import { useI18n } from '../../hooks/useI18n';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

interface WatermarkToolProps {
  files: File[];
  onComplete: (result: any) => void;
  onClose: () => void;
  className?: string;
}

const WatermarkTool: React.FC<WatermarkToolProps> = ({
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
    addWatermark,
    resetState,
    getDefaultOptions,
    validateOptions,
    getPreview
  } = useWatermark();

  const watermarkService = WatermarkService.getInstance();

  const [options, setOptions] = useState<WatermarkOptions>(getDefaultOptions());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [nonAsciiWarning, setNonAsciiWarning] = useState<string | null>(null);
  const [availableFonts, setAvailableFonts] = useState(() => watermarkService.getAvailableFonts());

  // Validate options and check for non-ASCII characters on change
  useEffect(() => {
    const validation = validateOptions(options);
    setValidationErrors(validation.errors);
    
    // Check for non-ASCII characters with current font selection
    const warning = watermarkService.getNonAsciiWarning(options.text, options.fontName);
    setNonAsciiWarning(warning);
  }, [options, validateOptions, watermarkService]);

  // Handle completion
  useEffect(() => {
    if (result && result.success) {
      onComplete(result);
    }
  }, [result, onComplete]);

  const handleAddWatermark = async () => {
    if (files.length === 0) {
      setValidationErrors([t('tools.watermark.tool.fileErrors.noFileSelected')]);
      return;
    }

    if (validationErrors.length > 0) {
      return;
    }

    const file = files[0]; // Process first file
    await addWatermark(file, options);
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', t('tools.watermark.tool.fileSizeUnit'), 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const currentFile = files[0];

  // Color presets
  const colorPresets = [
    { name: t('tools.watermark.tool.settings.textColor.colors.gray'), value: { r: 128, g: 128, b: 128 } },
    { name: t('tools.watermark.tool.settings.textColor.colors.red'), value: { r: 220, g: 38, b: 38 } },
    { name: t('tools.watermark.tool.settings.textColor.colors.blue'), value: { r: 59, g: 130, b: 246 } },
    { name: t('tools.watermark.tool.settings.textColor.colors.green'), value: { r: 34, g: 197, b: 94 } },
    { name: t('tools.watermark.tool.settings.textColor.colors.black'), value: { r: 0, g: 0, b: 0 } },
    { name: t('tools.watermark.tool.settings.textColor.colors.orange'), value: { r: 251, g: 146, b: 60 } }
  ];

  // Position presets
  const positionPresets: Array<{ name: string; value: WatermarkOptions['position'] }> = [
    { name: t('tools.watermark.tool.settings.position.positions.center'), value: 'center' },
    { name: t('tools.watermark.tool.settings.position.positions.topLeft'), value: 'top-left' },
    { name: t('tools.watermark.tool.settings.position.positions.topRight'), value: 'top-right' },
    { name: t('tools.watermark.tool.settings.position.positions.bottomLeft'), value: 'bottom-left' },
    { name: t('tools.watermark.tool.settings.position.positions.bottomRight'), value: 'bottom-right' }
  ];

  // Get position style for preview (optimized for new larger preview)
  const getPositionStyle = (position: WatermarkOptions['position'], rotation: number) => {
    const baseStyle = {
      color: `rgb(${options.color.r}, ${options.color.g}, ${options.color.b})`,
      opacity: options.opacity / 100,
      fontSize: `${Math.max(12, options.fontSize / 3)}px`, // Larger size for better visibility
      fontWeight: 'bold',
      userSelect: 'none' as const,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: '10px',
          left: '10px',
          transform: `rotate(${rotation}deg)`
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: '10px',
          right: '10px',
          transform: `rotate(${rotation}deg)`
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: '10px',
          left: '10px',
          transform: `rotate(${rotation}deg)`
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: '10px',
          right: '10px',
          transform: `rotate(${rotation}deg)`
        };
      default:
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        };
    }
  };

  // Get position style for image preview
  const getImagePositionStyle = (position: WatermarkOptions['position'], rotation: number) => {
    const width = Math.max(20, (options.imageWidth || 100) / 4); // Scale down for preview
    const height = Math.max(20, (options.imageHeight || 100) / 4); // Scale down for preview
    
    const baseStyle = {
      opacity: options.opacity / 100,
      width: `${width}px`,
      height: `${height}px`,
      userSelect: 'none' as const,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: '10px',
          left: '10px',
          transform: `rotate(${rotation}deg)`
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: '10px',
          right: '10px',
          transform: `rotate(${rotation}deg)`
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: '10px',
          left: '10px',
          transform: `rotate(${rotation}deg)`
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: '10px',
          right: '10px',
          transform: `rotate(${rotation}deg)`
        };
      default:
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        };
    }
  };

  return (
    <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-600/20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-t-2xl">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              💧
            </div>
            {t('tools.watermark.tool.toolTitle')}
          </h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mt-1">
            {t('tools.watermark.tool.toolDescription')}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 min-h-[600px]">
        
        {/* Left Column - Preview */}
        <div className="space-y-6 lg:border-r lg:border-white/20 dark:border-gray-600/20 lg:pr-6">
          {/* File Info */}
          {currentFile && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-black text-black dark:text-white mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs">
                  📄
                </div>
                {t('tools.watermark.tool.fileInfo.pdfPreview')}
              </h3>
              
              <div className="p-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📄</div>
                  <div className="flex-1">
                    <p className="font-black text-black dark:text-white">{currentFile.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                      {formatFileSize(currentFile.size)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Preview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-black text-black dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
                  👁️
                </div>
                {t('tools.watermark.tool.preview.title')}
              </h4>
              {!options.text.trim() && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('tools.watermark.tool.preview.enterTextPrompt')}</span>
              )}
            </div>
            
            {/* Always show preview container */}
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg border border-white/30 dark:border-gray-600/30 rounded-2xl shadow-lg p-8">
              <div className="flex justify-center">
                <div 
                  className="relative bg-white dark:bg-gray-100 border border-gray-300 dark:border-gray-400 rounded-xl shadow-xl"
                  style={{ 
                    width: '280px', 
                    height: '360px',
                    aspectRatio: '210/297' // A4 aspect ratio
                  }}
                >
                  {/* Page representation */}
                  <div className="absolute inset-2 border border-gray-100 rounded">
                    {/* Grid pattern to simulate page content */}
                    <div className="absolute inset-4 opacity-20">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div 
                          key={i}
                          className="h-2 bg-gray-200 rounded mb-2"
                          style={{ width: `${Math.random() * 60 + 40}%` }}
                        />
                      ))}
                    </div>
                    
                    {/* Watermark overlay */}
                    {options.type === 'text' && options.text.trim() && (
                      <div
                        className="absolute pointer-events-none select-none font-bold"
                        style={getPositionStyle(options.position, options.rotation)}
                      >
                        {options.text}
                      </div>
                    )}
                    {options.type === 'image' && options.imageFile && (
                      <div
                        className="absolute pointer-events-none select-none bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600"
                        style={getImagePositionStyle(options.position, options.rotation)}
                      >
                        🖼️ Image
                      </div>
                    )}
                  </div>
                  
                  {/* Page label */}
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                    {t('tools.watermark.tool.preview.pageLabel')}
                  </div>
                </div>
              </div>
              
              {(options.type === 'text' && options.text.trim()) || (options.type === 'image' && options.imageFile) ? (
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-4 text-center">
                  {t('tools.watermark.tool.preview.livePreviewDescription')}
                </p>
              ) : (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 text-center">
                  {options.type === 'text' 
                    ? t('tools.watermark.tool.preview.enterTextPrompt')
                    : t('tools.watermark.tool.preview.selectImagePrompt')
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6 lg:pl-2">
          <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm">
                ⚙️
              </div>
              {t('tools.watermark.tool.settings.title')}
            </h3>
        
          <div className="space-y-6">
            {/* Watermark Type Selector */}
            <div>
              <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded flex items-center justify-center text-xs">
                  🎯
                </span>
                {t('tools.watermark.tool.settings.type.label')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOptions(prev => ({ ...prev, type: 'text' }))}
                  disabled={isProcessing}
                  className={`px-4 py-3 text-sm font-medium border rounded-xl transition-all duration-300 flex items-center gap-2 justify-center ${
                    options.type === 'text'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg scale-105'
                      : 'bg-white/50 dark:bg-gray-700/50 text-black dark:text-white border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-105'
                  }`}
                >
                  <span>📝</span>
                  {t('tools.watermark.tool.settings.type.text')}
                </button>
                <button
                  onClick={() => setOptions(prev => ({ ...prev, type: 'image' }))}
                  disabled={isProcessing}
                  className={`px-4 py-3 text-sm font-medium border rounded-xl transition-all duration-300 flex items-center gap-2 justify-center ${
                    options.type === 'image'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg scale-105'
                      : 'bg-white/50 dark:bg-gray-700/50 text-black dark:text-white border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-105'
                  }`}
                >
                  <span>🖼️</span>
                  {t('tools.watermark.tool.settings.type.image')}
                </button>
              </div>
            </div>

            {/* Text Watermark Settings */}
            {options.type === 'text' && (
              <>
                {/* Watermark Text */}
                <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                ✏️
              </span>
              {t('tools.watermark.tool.settings.watermarkText.label')}
            </label>
            <input
              type="text"
              value={options.text}
              onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
              disabled={isProcessing}
              placeholder={t('tools.watermark.tool.settings.watermarkText.placeholder')}
              className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/80 dark:border-gray-600/30 rounded-xl focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-300 font-medium text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {options.text.length}/50 {t('tools.watermark.tool.settings.watermarkText.charactersRemaining')}
            </p>
            
            {/* Non-ASCII Character Warning */}
            {nonAsciiWarning && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-blue-400 mr-2 mt-0.5">💡</div>
                  <div>
                    <h4 className="text-blue-800 font-medium text-sm">{t('tools.watermark.tool.settings.fontRecommendation.title')}</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      {nonAsciiWarning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Font Selection */}
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded flex items-center justify-center text-xs">
                🔤
              </span>
              {t('tools.watermark.tool.settings.fontFamily.label')}
            </label>
            <select
              value={options.fontName || 'Helvetica'}
              onChange={(e) => setOptions(prev => ({ ...prev, fontName: e.target.value }))}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/80 dark:border-gray-600/30 rounded-xl focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-300 font-medium text-black dark:text-white appearance-none cursor-pointer shadow-sm"
            >
              {availableFonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.displayName} {font.supportsCyrillic ? t('tools.watermark.tool.settings.fontRecommendation.supportsCyrillic') : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {watermarkService.fontSupportsText(options.fontName || 'Helvetica', options.text) 
                ? t('tools.watermark.tool.settings.fontSupport.supported') 
                : t('tools.watermark.tool.settings.fontSupport.mayNotSupport')}
            </p>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded flex items-center justify-center text-xs">
                📏
              </span>
              {t('tools.watermark.tool.settings.fontSize.label')}: <span className="text-blue-600 dark:text-blue-400 font-black">{options.fontSize}px</span>
            </label>
            <input
              type="range"
              min="8"
              max="144"
              step="4"
              value={options.fontSize}
              onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-4 bg-gradient-to-r from-seafoam-300 to-ocean-300 dark:from-blue-600 dark:to-blue-700 rounded-lg appearance-none cursor-pointer slider-thumb shadow-lg border-2 border-white dark:border-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('tools.watermark.tool.settings.fontSize.rangeLabels.small')}</span>
              <span>{t('tools.watermark.tool.settings.fontSize.rangeLabels.large')}</span>
            </div>
          </div>
              </>
            )}

            {/* Image Watermark Settings */}
            {options.type === 'image' && (
              <>
                {/* Image File Upload */}
                <div>
                  <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                      📁
                    </span>
                    {t('tools.watermark.tool.settings.imageFile.label')}
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setOptions(prev => ({ ...prev, imageFile: file }));
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/80 dark:border-gray-600/30 rounded-xl focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-300 font-medium text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-seafoam-50 file:text-seafoam-700 hover:file:bg-seafoam-100 cursor-pointer shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('tools.watermark.tool.settings.imageFile.supportedFormats')}
                  </p>
                  {options.imageFile && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-green-700 text-sm font-medium">{options.imageFile.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded flex items-center justify-center text-xs">
                        📐
                      </span>
                      {t('tools.watermark.tool.settings.imageWidth.label')}
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={options.imageWidth || 100}
                      onChange={(e) => setOptions(prev => ({ ...prev, imageWidth: parseInt(e.target.value) || 100 }))}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/80 dark:border-gray-600/30 rounded-xl focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-300 font-medium text-black dark:text-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded flex items-center justify-center text-xs">
                        📏
                      </span>
                      {t('tools.watermark.tool.settings.imageHeight.label')}
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={options.imageHeight || 100}
                      onChange={(e) => setOptions(prev => ({ ...prev, imageHeight: parseInt(e.target.value) || 100 }))}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 bg-white/90 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/80 dark:border-gray-600/30 rounded-xl focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-300 font-medium text-black dark:text-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Maintain Aspect Ratio */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.maintainAspectRatio !== false}
                      onChange={(e) => setOptions(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                      disabled={isProcessing}
                      className="w-5 h-5 text-seafoam-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-seafoam-500 dark:focus:ring-seafoam-600 focus:ring-2"
                    />
                    <span className="text-sm font-black text-black dark:text-white">
                      {t('tools.watermark.tool.settings.maintainAspectRatio.label')}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    {t('tools.watermark.tool.settings.maintainAspectRatio.description')}
                  </p>
                </div>
              </>
            )}

          {/* Opacity */}
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded flex items-center justify-center text-xs">
                🎭
              </span>
              {t('tools.watermark.tool.settings.opacity.label')}: <span className="text-blue-600 dark:text-blue-400 font-black">{options.opacity}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={options.opacity}
              onChange={(e) => setOptions(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-4 bg-gradient-to-r from-yellow-300 to-orange-300 dark:from-yellow-600 dark:to-orange-600 rounded-lg appearance-none cursor-pointer slider-thumb shadow-lg border-2 border-white dark:border-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('tools.watermark.tool.settings.opacity.rangeLabels.transparent')}</span>
              <span>{t('tools.watermark.tool.settings.opacity.rangeLabels.opaque')}</span>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded flex items-center justify-center text-xs">
                🔄
              </span>
              {t('tools.watermark.tool.settings.rotation.label')}: <span className="text-blue-600 dark:text-blue-400 font-black">{options.rotation}°</span>
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              step="15"
              value={options.rotation}
              onChange={(e) => setOptions(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-4 bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600 rounded-lg appearance-none cursor-pointer slider-thumb shadow-lg border-2 border-white dark:border-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-90°</span>
              <span>0°</span>
              <span>90°</span>
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 rounded flex items-center justify-center text-xs">
                📍
              </span>
              {t('tools.watermark.tool.settings.position.label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {positionPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setOptions(prev => ({ ...prev, position: preset.value }))}
                  disabled={isProcessing}
                  className={`px-4 py-3 text-sm font-medium border rounded-xl transition-all duration-300 ${
                    options.position === preset.value
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg scale-105'
                      : 'bg-white/50 dark:bg-gray-700/50 text-black dark:text-white border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-105'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color - только для текстовых водяных знаков */}
          {options.type === 'text' && (
          <div>
            <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800 dark:to-pink-700 rounded flex items-center justify-center text-xs">
                🎨
              </span>
              {t('tools.watermark.tool.settings.textColor.label')}
            </label>
            <div className="grid grid-cols-6 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setOptions(prev => ({ ...prev, color: preset.value }))}
                  disabled={isProcessing}
                  className={`relative w-14 h-10 border-2 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg ${
                    options.color.r === preset.value.r && 
                    options.color.g === preset.value.g && 
                    options.color.b === preset.value.b
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-400 scale-110'
                      : 'border-white/50 dark:border-gray-600/50 hover:border-blue-300'
                  }`}
                  style={{ backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})` }}
                  title={preset.name}
                >
                  {options.color.r === preset.value.r && 
                   options.color.g === preset.value.g && 
                   options.color.b === preset.value.b && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-lg drop-shadow-lg">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mx-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm animate-pulse">
              ⏳
            </div>
            <h4 className="text-lg font-black text-black dark:text-white">
              {t('tools.watermark.tool.progress.addingWatermark')}
            </h4>
          </div>
          <ProgressBar
            value={progress}
            className="mb-3"
            animated={true}
          />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
            {Math.round(progress)}% {t('tools.watermark.tool.progress.completed')}
          </p>
        </div>
      )}

      {/* Errors */}
      {(error || validationErrors.length > 0) && (
        <div className="mx-6 mb-6 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-lg border border-red-200/50 dark:border-red-600/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
              ⚠️
            </div>
            <div>
              <h4 className="text-red-800 dark:text-red-300 font-black text-lg">{t('tools.watermark.tool.error.title')}</h4>
              {error && <p className="text-red-700 dark:text-red-400 text-sm font-medium mt-2">{error}</p>}
              {validationErrors.map((err, index) => (
                <p key={index} className="text-red-700 dark:text-red-400 text-sm font-medium mt-2">{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mx-6 mb-6 bg-blue-50/90 dark:bg-blue-900/20 backdrop-blur-lg border border-blue-200/50 dark:border-blue-600/30 rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
            🔒
          </div>
          <div>
            <h4 className="text-blue-800 dark:text-blue-300 font-black text-lg">{t('tools.watermark.tool.privacy.title')}</h4>
            <p className="text-blue-700 dark:text-blue-400 text-sm font-medium mt-2">
              {t('tools.watermark.tool.privacy.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Success Result */}
      {result && result.success && result.data && (
        <div className="mx-6 mb-6 bg-green-50/90 dark:bg-green-900/20 backdrop-blur-lg border border-green-200/50 dark:border-green-600/30 rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
              ✅
            </div>
            <div className="flex-1">
              <h4 className="text-green-800 dark:text-green-300 font-black text-lg">{t('tools.watermark.tool.success.title')}</h4>
              <p className="text-green-700 dark:text-green-400 text-sm font-medium mt-2">
                {t('tools.watermark.tool.success.description')}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => {
                    const filename = generateFilename(
                      currentFile?.name || 'watermarked',
                      'watermarked',
                      'pdf'
                    );
                    downloadBlob(result.data!, filename);
                  }}
                  className="btn-privacy-modern text-sm px-6 py-3 flex items-center gap-2"
                >
                  {t('tools.watermark.tool.success.download')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mx-6 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg p-6">
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="btn-ocean-modern px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {result && result.success ? t('tools.watermark.tool.actions.processAnother') : t('tools.watermark.tool.actions.cancel')}
          </button>
          {(!result || !result.success) && (
            <button
              onClick={handleAddWatermark}
              disabled={files.length === 0 || isProcessing || validationErrors.length > 0 || 
                       (options.type === 'text' && !options.text.trim()) ||
                       (options.type === 'image' && !options.imageFile)}
              className="btn-privacy-modern px-8 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('tools.watermark.tool.actions.adding')}
                </>
              ) : (
                <>
                  {t('tools.watermark.tool.actions.addWatermark')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatermarkTool;