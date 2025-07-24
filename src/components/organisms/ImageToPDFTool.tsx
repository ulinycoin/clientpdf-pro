import React, { useState, useCallback } from 'react';
import { useImageToPDF } from '../../hooks/useImageToPDF';
import { ImageToPDFOptions } from '../../services/imageToPDFService';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import UploadSection from '../molecules/UploadSection';
import { useI18n } from '../../hooks/useI18n';

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
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(imageFiles);
    clearError();
  }, [clearError]);

  // Handle conversion
  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const result = await convertImages(selectedFiles, options);

      if (result.success && result.data) {
        const filename = generateFilename('images', 'converted', 'pdf');
        downloadBlob(result.data, filename);
        onComplete?.(result);
        console.log('Images to PDF conversion completed successfully!');
      }
    } catch (err) {
      console.error('Conversion failed:', err);
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
    <div className={`bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('pages.tools.imageToPdf.tool.title')}</h2>
          <p className="text-gray-600 mt-1">
            {t('pages.tools.imageToPdf.tool.description')}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* File Upload Zone */}
      {selectedFiles.length === 0 ? (
        <div className="mb-6">
          <UploadSection
            onFilesSelected={handleFileSelect}
            acceptedTypes={['image/*']}
            multiple={true}
            maxFiles={100}
            title={t('pages.tools.imageToPdf.uploadSection.title')}
            subtitle={t('pages.tools.imageToPdf.uploadSection.subtitle')}
            emoji="🖼️"
            supportedFormats={t('pages.tools.imageToPdf.uploadSection.supportedFormats')}
          />
        </div>
      ) : (
        <>
          {/* Selected Files */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('pages.tools.imageToPdf.tool.selectedImages', { count: selectedFiles.length.toString() })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFiles([])}
                disabled={isProcessing}
              >
                {t('pages.tools.imageToPdf.tool.clearAll')}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative group">
                  <div className="bg-white rounded-xl p-3 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 overflow-hidden shadow-inner">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate mb-1" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatFileSize(file.size)}</p>

                    {!isProcessing && (
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
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

          {/* Options Panel */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('pages.tools.imageToPdf.tool.pdfSettings')}</h3>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Page Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('pages.tools.imageToPdf.tool.pageSize')}</label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white shadow-sm"
                  >
                    <option value="A4">{t('pages.tools.imageToPdf.tool.pageSizeOptions.a4')}</option>
                    <option value="Letter">{t('pages.tools.imageToPdf.tool.pageSizeOptions.letter')}</option>
                    <option value="Auto">{t('pages.tools.imageToPdf.tool.pageSizeOptions.auto')}</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('pages.tools.imageToPdf.tool.orientation')}</label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white shadow-sm"
                  >
                    <option value="Portrait">{t('pages.tools.imageToPdf.tool.orientationOptions.portrait')}</option>
                    <option value="Landscape">{t('pages.tools.imageToPdf.tool.orientationOptions.landscape')}</option>
                  </select>
                </div>

                {/* Layout */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('pages.tools.imageToPdf.tool.imageLayout')}</label>
                  <select
                    value={options.layout}
                    onChange={(e) => setOptions(prev => ({ ...prev, layout: e.target.value as any }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white shadow-sm"
                  >
                    <option value="FitToPage">{t('pages.tools.imageToPdf.tool.layoutOptions.fitToPage')}</option>
                    <option value="ActualSize">{t('pages.tools.imageToPdf.tool.layoutOptions.actualSize')}</option>
                    <option value="FitWidth">{t('pages.tools.imageToPdf.tool.layoutOptions.fitWidth')}</option>
                    <option value="FitHeight">{t('pages.tools.imageToPdf.tool.layoutOptions.fitHeight')}</option>
                  </select>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('pages.tools.imageToPdf.tool.imageQuality', { quality: Math.round(options.quality * 100).toString() })}
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{t('pages.tools.imageToPdf.tool.qualitySlider.lowerSize')}</span>
                      <span>{t('pages.tools.imageToPdf.tool.qualitySlider.higherQuality')}</span>
                    </div>
                  </div>
                </div>

                {/* Margin */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('pages.tools.imageToPdf.tool.pageMargin', { margin: (Math.round(options.margin / 72 * 100) / 100).toString() })}
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{t('pages.tools.imageToPdf.tool.marginSlider.noMargin')}</span>
                      <span>{t('pages.tools.imageToPdf.tool.marginSlider.twoInch')}</span>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('pages.tools.imageToPdf.tool.background')}</label>
                  <select
                    value={options.backgroundColor}
                    onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white shadow-sm"
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
        <div className="mb-6">
          <ProgressBar value={progress} animated={true} className="mb-2" />
          <p className="text-sm text-gray-600 text-center">
            {t('pages.tools.imageToPdf.tool.converting', { progress: Math.round(progress).toString() })}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedFiles.length > 0 && (
            <>
              {t('pages.tools.imageToPdf.tool.fileInfo', {
                count: selectedFiles.length.toString(),
                plural: selectedFiles.length !== 1 ? 'я' : '',
                size: formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))
              })}
            </>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFiles([]);
              reset();
            }}
            disabled={isProcessing}
          >
            {t('pages.tools.imageToPdf.tool.buttons.reset')}
          </Button>

          <Button
            variant="primary"
            onClick={handleConvert}
            disabled={selectedFiles.length === 0 || isProcessing}
            loading={isProcessing}
          >
            {isProcessing ? t('pages.tools.imageToPdf.tool.buttons.converting') : t('pages.tools.imageToPdf.tool.buttons.createPdf')}
          </Button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-blue-800 font-medium mb-1">{t('pages.tools.imageToPdf.tool.help.title')}</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Drag & Drop:</strong> {t('pages.tools.imageToPdf.tool.help.dragDrop')}</p>
              <p>• <strong>Multiple Formats:</strong> {t('pages.tools.imageToPdf.tool.help.formats')}</p>
              <p>• <strong>Custom Layout:</strong> {t('pages.tools.imageToPdf.tool.help.layout')}</p>
              <p>• <strong>Quality Control:</strong> {t('pages.tools.imageToPdf.tool.help.quality')}</p>
              <p>• <strong>Privacy:</strong> {t('pages.tools.imageToPdf.tool.help.privacy')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDFTool;
