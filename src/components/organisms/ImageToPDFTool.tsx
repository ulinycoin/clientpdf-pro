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
    <div className={`bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Images to PDF Converter</h2>
          <p className="text-gray-600 mt-1">
            Combine multiple images into a single PDF document with custom layout options
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
                Selected Images ({selectedFiles.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFiles([])}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative group">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                    {!isProcessing && (
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">PDF Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                <select
                  value={options.pageSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Auto">Auto (fit content)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                <select
                  value={options.orientation}
                  onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="Portrait">Portrait</option>
                  <option value="Landscape">Landscape</option>
                </select>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Layout</label>
                <select
                  value={options.layout}
                  onChange={(e) => setOptions(prev => ({ ...prev, layout: e.target.value as any }))}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="FitToPage">Fit to Page</option>
                  <option value="ActualSize">Actual Size</option>
                  <option value="FitWidth">Fit Width</option>
                  <option value="FitHeight">Fit Height</option>
                </select>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Quality ({Math.round(options.quality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={options.quality}
                  onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                  disabled={isProcessing}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower size</span>
                  <span>Higher quality</span>
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Margin ({Math.round(options.margin / 72 * 100) / 100} inch)
                </label>
                <input
                  type="range"
                  min="0"
                  max="144"
                  step="18"
                  value={options.margin}
                  onChange={(e) => setOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  disabled={isProcessing}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No margin</span>
                  <span>2 inch</span>
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <select
                  value={options.backgroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="white">White</option>
                  <option value="lightgray">Light Gray</option>
                  <option value="gray">Gray</option>
                  <option value="black">Black</option>
                </select>
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
            Converting images to PDF... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedFiles.length > 0 && (
            <>
              {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected •
              Total size: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
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
            Reset
          </Button>

          <Button
            variant="primary"
            onClick={handleConvert}
            disabled={selectedFiles.length === 0 || isProcessing}
            loading={isProcessing}
          >
            {isProcessing ? 'Converting...' : 'Create PDF'}
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
            <h4 className="text-blue-800 font-medium mb-1">How to Use Images to PDF</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Drag & Drop:</strong> Simply drag your images into the upload area or click to browse</p>
              <p>• <strong>Multiple Formats:</strong> Supports JPEG, PNG, GIF, and WebP image formats</p>
              <p>• <strong>Custom Layout:</strong> Choose page size, orientation, and how images fit on each page</p>
              <p>• <strong>Quality Control:</strong> Adjust image quality to balance file size and visual quality</p>
              <p>• <strong>Privacy:</strong> All processing happens locally - your images never leave your device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDFTool;
