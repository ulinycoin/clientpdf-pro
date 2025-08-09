import React, { useState, useEffect } from 'react';
import { useWatermark } from '../../hooks/useWatermark';
import { WatermarkOptions, WatermarkService } from '../../services/watermarkService';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
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
      setValidationErrors(['Please select a PDF file to add watermark']);
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
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const currentFile = files[0];

  // Color presets
  const colorPresets = [
    { name: 'Gray', value: { r: 128, g: 128, b: 128 } },
    { name: 'Red', value: { r: 220, g: 38, b: 38 } },
    { name: 'Blue', value: { r: 59, g: 130, b: 246 } },
    { name: 'Green', value: { r: 34, g: 197, b: 94 } },
    { name: 'Black', value: { r: 0, g: 0, b: 0 } },
    { name: 'Orange', value: { r: 251, g: 146, b: 60 } }
  ];

  // Position presets
  const positionPresets: Array<{ name: string; value: WatermarkOptions['position'] }> = [
    { name: 'Center', value: 'center' },
    { name: 'Top Left', value: 'top-left' },
    { name: 'Top Right', value: 'top-right' },
    { name: 'Bottom Left', value: 'bottom-left' },
    { name: 'Bottom Right', value: 'bottom-right' }
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

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Watermark</h2>
          <p className="text-gray-600 mt-1">
            Add text watermarks to protect your documents
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 min-h-[600px]">
        
        {/* Left Column - Preview */}
        <div className="space-y-6 lg:border-r lg:border-gray-200 lg:pr-6">
          {/* File Info */}
          {currentFile && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">PDF Preview</h3>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📄</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{currentFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(currentFile.size)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Watermark Preview</h4>
              {!options.text.trim() && (
                <span className="text-sm text-gray-500">Enter text to see preview</span>
              )}
            </div>
            
            {/* Always show preview container */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6">
              <div className="flex justify-center">
                <div 
                  className="relative bg-white border border-gray-300 rounded-lg shadow-sm"
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
                    {options.text.trim() && (
                      <div
                        className="absolute pointer-events-none select-none font-bold"
                        style={getPositionStyle(options.position, options.rotation)}
                      >
                        {options.text}
                      </div>
                    )}
                  </div>
                  
                  {/* Page label */}
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                    Page 1
                  </div>
                </div>
              </div>
              
              {options.text.trim() ? (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Live preview of watermark placement and styling
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-4 text-center">
                  Preview will appear when you enter watermark text
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6 lg:pl-2">
          <h3 className="text-lg font-medium text-gray-900">Watermark Settings</h3>
        
          <div className="space-y-6">
            {/* Watermark Text */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Watermark Text *
            </label>
            <input
              type="text"
              value={options.text}
              onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
              disabled={isProcessing}
              placeholder="Enter watermark text (e.g., CONFIDENTIAL, DRAFT)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {options.text.length}/50 characters
            </p>
            
            {/* Non-ASCII Character Warning */}
            {nonAsciiWarning && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-blue-400 mr-2 mt-0.5">💡</div>
                  <div>
                    <h4 className="text-blue-800 font-medium text-sm">Font Recommendation</h4>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={options.fontName || 'Helvetica'}
              onChange={(e) => setOptions(prev => ({ ...prev, fontName: e.target.value }))}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {availableFonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.displayName} {font.supportsCyrillic ? '(Supports Cyrillic)' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {watermarkService.fontSupportsText(options.fontName || 'Helvetica', options.text) 
                ? '✅ This font supports your text' 
                : '⚠️ This font may not support all characters in your text'}
            </p>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size: {options.fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="144"
              step="4"
              value={options.fontSize}
              onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small (8px)</span>
              <span>Large (144px)</span>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity: {options.opacity}%
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={options.opacity}
              onChange={(e) => setOptions(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Transparent (5%)</span>
              <span>Opaque (100%)</span>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotation: {options.rotation}°
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              step="15"
              value={options.rotation}
              onChange={(e) => setOptions(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-90°</span>
              <span>0°</span>
              <span>90°</span>
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {positionPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setOptions(prev => ({ ...prev, position: preset.value }))}
                  disabled={isProcessing}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    options.position === preset.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setOptions(prev => ({ ...prev, color: preset.value }))}
                  disabled={isProcessing}
                  className={`relative w-12 h-8 border-2 rounded-lg transition-transform hover:scale-105 ${
                    options.color.r === preset.value.r && 
                    options.color.g === preset.value.g && 
                    options.color.b === preset.value.b
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})` }}
                  title={preset.name}
                >
                  {options.color.r === preset.value.r && 
                   options.color.g === preset.value.g && 
                   options.color.b === preset.value.b && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="px-6 mb-6">
          <ProgressBar
            value={progress}
            className="mb-2"
            animated={true}
          />
          <p className="text-sm text-gray-600 text-center">
            Adding watermark... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Errors */}
      {(error || validationErrors.length > 0) && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-red-400 mr-2 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              {validationErrors.map((err, index) => (
                <p key={index} className="text-red-600 text-sm mt-1">{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-400 mr-2 mt-0.5">ℹ️</div>
          <div>
            <h4 className="text-blue-800 font-medium">Privacy & Security</h4>
            <p className="text-blue-700 text-sm mt-1">
              Watermarks are added locally in your browser. Your PDF never leaves your device, 
              ensuring complete privacy and security.
            </p>
          </div>
        </div>
      </div>

      {/* Success Result */}
      {result && result.success && result.data && (
        <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-green-400 mr-2 mt-0.5">✅</div>
            <div className="flex-1">
              <h4 className="text-green-800 font-medium">Watermark Added Successfully!</h4>
              <p className="text-green-700 text-sm mt-1">
                Your watermarked PDF has been downloaded automatically.
              </p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const filename = generateFilename(
                      currentFile?.name || 'watermarked',
                      'watermarked',
                      'pdf'
                    );
                    downloadBlob(result.data!, filename);
                  }}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  📥 Download Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 px-6 pb-6 border-t border-gray-200 pt-6">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          {result && result.success ? 'Process Another File' : 'Cancel'}
        </Button>
        {(!result || !result.success) && (
          <Button
            variant="primary"
            onClick={handleAddWatermark}
            disabled={files.length === 0 || isProcessing || validationErrors.length > 0 || !options.text.trim()}
            loading={isProcessing}
          >
            {isProcessing ? 'Adding Watermark...' : 'Add Watermark'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WatermarkTool;