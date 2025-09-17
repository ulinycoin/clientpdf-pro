import React, { useState, useCallback, useEffect } from 'react';
import { useImageToPDF } from '../../hooks/useImageToPDF';
import { ImageToPDFOptions } from '../../services/imageToPDFService';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import { useI18n } from '../../hooks/useI18n';

// Image Preview Component with error handling
const ImagePreview: React.FC<{ file: File; onError?: () => void }> = ({ file, onError }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Cleanup on unmount
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    // Image loaded successfully
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-2xl mb-1">🖼️</div>
          <div className="text-xs">Error loading</div>
        </div>
      </div>
    );
  }

  return imageUrl ? (
    <img
      src={imageUrl}
      alt={file.name}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
      onLoad={handleLoad}
      onError={handleError}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-seafoam-500 border-t-transparent"></div>
    </div>
  );
};

interface ImageToPDFToolProps {
  files?: File[];
  onComplete?: (result: any) => void;
  onClose?: () => void;
  className?: string;
}

const ImageToPDFTool: React.FC<ImageToPDFToolProps> = ({
  files: initialFiles = [],
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useI18n();
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);

  // Synchronize with props when files change
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setSelectedFiles(initialFiles);
    }
  }, [initialFiles]);
  const [options, setOptions] = useState<ImageToPDFOptions>({
    pageSize: 'A4',
    orientation: 'Portrait',
    layout: 'FitToPage',
    margin: 36,
    quality: 0.8,
    backgroundColor: 'white'
  });

  const {
    convertImages,
    isProcessing,
    progress,
    error,
    clearError,
    reset
  } = useImageToPDF();

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => {
      // More strict image validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      return validTypes.includes(file.type.toLowerCase()) && file.size > 0;
    });
    
    if (imageFiles.length !== files.length) {
      const invalidFiles = files.length - imageFiles.length;
      console.warn(`Filtered out ${invalidFiles} invalid or empty files`);
    }
    
    setSelectedFiles(imageFiles);
    clearError();
  }, [clearError]);

  // Handle conversion
  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Additional validation before conversion
      const validFiles = selectedFiles.filter(file => file.size > 0);
      if (validFiles.length === 0) {
        throw new Error('No valid image files selected');
      }

      const result = await convertImages(validFiles, options);

      if (result.success && result.data) {
        const filename = generateFilename('images', 'converted', 'pdf');
        downloadBlob(result.data, filename);
        onComplete?.(result);
        console.log('Images to PDF conversion completed successfully!');
      } else {
        console.error('Conversion failed:', result.error?.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Conversion failed:', err);
      // Error will be shown via the hook's error state
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={`max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 ${className} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-white">{t('pages.tools.imageToPdf.tool.title') || 'Convert Images to PDF'}</h2>
          <p className="text-gray-800 dark:text-gray-100 font-medium mt-2">
            {t('pages.tools.imageToPdf.tool.description') || 'Transform multiple images into a single PDF document'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>←</span>
            <span className="font-medium text-black dark:text-white">Back to Tools</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-sm border border-red-200/60 dark:border-red-600/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white mr-4">
              ⚠️
            </div>
            <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <>
          {/* Selected Files */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-black dark:text-white">
                {t('pages.tools.imageToPdf.tool.selectedImages', { count: selectedFiles.length.toString() }) || `Selected Images (${selectedFiles.length})`}
              </h3>
              <button
                onClick={() => setSelectedFiles([])}
                disabled={isProcessing}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-lg text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {t('pages.tools.imageToPdf.tool.clearAll') || 'Clear All'}
              </button>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative group">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl p-3 hover:border-seafoam-400 hover:shadow-xl hover:scale-105 transition-all duration-200">
                      <div className="aspect-square bg-gradient-to-br from-seafoam-50 to-ocean-50 dark:from-seafoam-900/20 dark:to-ocean-900/20 rounded-lg mb-3 overflow-hidden shadow-lg flex items-center justify-center">
                        <ImagePreview 
                          file={file} 
                          onError={() => {
                            console.warn(`Failed to load image preview for: ${file.name}`);
                            // Could show a fallback icon or remove the problematic file
                          }}
                        />
                      </div>
                      <p className="text-xs font-black text-black dark:text-white truncate mb-1" title={file.name}>{file.name}</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{formatFileSize(file.size)}</p>

                      {!isProcessing && (
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options Panel */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-black dark:text-white mb-6">{t('pages.tools.imageToPdf.tool.pdfSettings') || 'PDF Settings'}</h3>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Page Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black dark:text-white mb-3">{t('pages.tools.imageToPdf.tool.pageSize') || 'Page Size'}</label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  >
                    <option value="A4">{t('pages.tools.imageToPdf.tool.pageSizeOptions.a4')}</option>
                    <option value="Letter">{t('pages.tools.imageToPdf.tool.pageSizeOptions.letter')}</option>
                    <option value="Auto">{t('pages.tools.imageToPdf.tool.pageSizeOptions.auto')}</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black dark:text-white mb-3">{t('pages.tools.imageToPdf.tool.orientation') || 'Orientation'}</label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  >
                    <option value="Portrait">{t('pages.tools.imageToPdf.tool.orientationOptions.portrait')}</option>
                    <option value="Landscape">{t('pages.tools.imageToPdf.tool.orientationOptions.landscape')}</option>
                  </select>
                </div>

                {/* Layout */}
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black dark:text-white mb-3">{t('pages.tools.imageToPdf.tool.imageLayout') || 'Image Layout'}</label>
                  <select
                    value={options.layout}
                    onChange={(e) => setOptions(prev => ({ ...prev, layout: e.target.value as any }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  >
                    <option value="FitToPage">{t('pages.tools.imageToPdf.tool.layoutOptions.fitToPage')}</option>
                    <option value="ActualSize">{t('pages.tools.imageToPdf.tool.layoutOptions.actualSize')}</option>
                    <option value="FitWidth">{t('pages.tools.imageToPdf.tool.layoutOptions.fitWidth')}</option>
                    <option value="FitHeight">{t('pages.tools.imageToPdf.tool.layoutOptions.fitHeight')}</option>
                  </select>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black dark:text-white mb-3">
                    {t('pages.tools.imageToPdf.tool.imageQuality', { quality: Math.round(options.quality * 100).toString() }) || `Image Quality (${Math.round(options.quality * 100)}%)`}
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={options.quality}
                      onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                      disabled={isProcessing}
                      className="w-full h-3 bg-gradient-to-r from-gray-300 to-seafoam-300 dark:from-gray-700 dark:to-seafoam-700 rounded-lg appearance-none cursor-pointer slider focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200"
                    />
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-medium mt-2">
                      <span>{t('pages.tools.imageToPdf.tool.qualitySlider.lowerSize') || 'Lower Size'}</span>
                      <span>{t('pages.tools.imageToPdf.tool.qualitySlider.higherQuality') || 'Higher Quality'}</span>
                    </div>
                  </div>
                </div>

                {/* Margin */}
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black dark:text-white mb-3">
                    {t('pages.tools.imageToPdf.tool.pageMargin', { margin: (Math.round(options.margin / 72 * 100) / 100).toString() }) || `Page Margin (${(Math.round(options.margin / 72 * 100) / 100)}")`}
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="144"
                      step="18"
                      value={options.margin}
                      onChange={(e) => setOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                      disabled={isProcessing}
                      className="w-full h-3 bg-gradient-to-r from-gray-300 to-seafoam-300 dark:from-gray-700 dark:to-seafoam-700 rounded-lg appearance-none cursor-pointer slider focus:ring-2 focus:ring-seafoam-500/50 transition-all duration-200"
                    />
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-medium mt-2">
                      <span>{t('pages.tools.imageToPdf.tool.marginSlider.noMargin') || 'No Margin'}</span>
                      <span>{t('pages.tools.imageToPdf.tool.marginSlider.twoInch') || '2 Inch'}</span>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black dark:text-white mb-3">{t('pages.tools.imageToPdf.tool.background') || 'Background'}</label>
                  <select
                    value={options.backgroundColor}
                    onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 disabled:opacity-50 transition-all duration-200 shadow-sm"
                  >
                    <option value="white">{t('pages.tools.imageToPdf.tool.backgroundOptions.white')}</option>
                    <option value="lightgray">{t('pages.tools.imageToPdf.tool.backgroundOptions.lightGray')}</option>
                    <option value="gray">{t('pages.tools.imageToPdf.tool.backgroundOptions.gray')}</option>
                    <option value="black">{t('pages.tools.imageToPdf.tool.backgroundOptions.black')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-black dark:text-white">Converting images...</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} animated={true} />
            <p className="text-sm text-gray-800 dark:text-gray-100 font-medium text-center mt-3">
              {t('pages.tools.imageToPdf.tool.converting', { progress: Math.round(progress).toString() }) || `Converting... ${Math.round(progress)}%`}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {selectedFiles.length > 0 && (
            <span>
              {t('pages.tools.imageToPdf.tool.fileInfo', {
                count: selectedFiles.length.toString(),
                plural: selectedFiles.length !== 1 ? 'я' : '',
                size: formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))
              }) || `${selectedFiles.length} files • ${formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}`}
            </span>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              setSelectedFiles([]);
              reset();
            }}
            disabled={isProcessing}
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {t('pages.tools.imageToPdf.tool.buttons.reset') || 'Reset'}
          </button>

          <button
            onClick={handleConvert}
            disabled={selectedFiles.length === 0 || isProcessing}
            className="btn-privacy-modern text-lg px-8 py-3 min-w-[200px] ripple-effect btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                {t('pages.tools.imageToPdf.tool.buttons.converting') || 'Converting...'}
              </>
            ) : (
              <>
                🖼️ {t('pages.tools.imageToPdf.tool.buttons.createPdf') || 'Create PDF'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-600/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mr-4 shadow-lg">
            💡
          </div>
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-black mb-4">{t('pages.tools.imageToPdf.tool.help.title') || 'Tips for Image to PDF Conversion:'}</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium space-y-2">
              <p>• <strong>Drag & Drop:</strong> {t('pages.tools.imageToPdf.tool.help.dragDrop') || 'Simply drag images directly into the upload area'}</p>
              <p>• <strong>Multiple Formats:</strong> {t('pages.tools.imageToPdf.tool.help.formats') || 'Supports JPG, PNG, GIF, BMP, and WebP formats'}</p>
              <p>• <strong>Custom Layout:</strong> {t('pages.tools.imageToPdf.tool.help.layout') || 'Choose how images fit on PDF pages (fit to page, actual size, etc.)'}</p>
              <p>• <strong>Quality Control:</strong> {t('pages.tools.imageToPdf.tool.help.quality') || 'Adjust image quality to balance file size and visual quality'}</p>
              <p>• <strong>Privacy:</strong> {t('pages.tools.imageToPdf.tool.help.privacy') || 'All processing happens locally - your images never leave your device'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDFTool;
