import React, { useState, useCallback } from 'react';
import { CompressionToolProps, PDFProcessingResult, CompressionOptions } from '../../types';
import { compressionService } from '../../services/compressionService';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

const CompressionTool: React.FC<CompressionToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
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

  const handleCompress = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to compress');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting compression...');
    setError(null);

    try {
      const file = files[0]; // For now, compress only the first file
      
      const result = await compressionService.compressPDF(
        file,
        options,
        (progress, message) => {
          setProgress(progress);
          setProgressMessage(message || '');
        }
      );

      if (result.success) {
        onComplete(result);
      } else {
        setError(result.error?.message || 'Compression failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const estimatedSavings = files.length > 0 
    ? compressionService.estimateCompressionPotential(files[0])
    : 0;

  const currentFile = files[0];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compress PDF</h2>
          <p className="text-gray-600 mt-1">
            Reduce file size while maintaining quality
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">File to compress:</h3>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📄</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
              {estimatedSavings > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    ~{estimatedSavings}% smaller
                  </p>
                  <p className="text-xs text-gray-500">estimated</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compression Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compression Settings:</h3>
        
        <div className="space-y-4">
          {/* Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Level: {Math.round(options.quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={options.quality}
              onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.imageCompression || false}
                onChange={(e) => setOptions(prev => ({ ...prev, imageCompression: e.target.checked }))}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Compress images (can significantly reduce file size)
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.removeMetadata || false}
                onChange={(e) => setOptions(prev => ({ ...prev, removeMetadata: e.target.checked }))}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Remove metadata (author, title, creation date)
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.optimizeForWeb || false}
                onChange={(e) => setOptions(prev => ({ ...prev, optimizeForWeb: e.target.checked }))}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Optimize for web viewing (faster loading)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mb-6">
          <ProgressBar
            value={progress}
            className="mb-2"
            animated={true}
          />
          <p className="text-sm text-gray-600 text-center">
            {progressMessage}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-400 mr-2">⚠️</div>
            <div>
              <h4 className="text-red-800 font-medium">Compression Failed</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-400 mr-2 mt-0.5">ℹ️</div>
          <div>
            <h4 className="text-blue-800 font-medium">How it works</h4>
            <p className="text-blue-700 text-sm mt-1">
              PDF compression removes redundant data and optimizes content structure. 
              Lower quality settings provide smaller files but may affect visual fidelity.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCompress}
          disabled={files.length === 0 || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Compressing...' : 'Compress PDF'}
        </Button>
      </div>
    </div>
  );
};

export default CompressionTool;