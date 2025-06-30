import React, { useState, useEffect } from 'react';
import { useExtractText } from '../../hooks/useExtractText';
import { ExtractTextOptions } from '../../services/extractTextService';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

interface ExtractTextToolProps {
  files: File[];
  onComplete: (result: any) => void;
  onClose: () => void;
  className?: string;
}

const ExtractTextTool: React.FC<ExtractTextToolProps> = ({
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
    extractText,
    resetState,
    getDefaultOptions,
    validateOptions,
    downloadAsTextFile
  } = useExtractText();

  const [options, setOptions] = useState<ExtractTextOptions>(getDefaultOptions());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showRangeOptions, setShowRangeOptions] = useState(false);

  // Validate options on change
  useEffect(() => {
    const validation = validateOptions(options);
    setValidationErrors(validation.errors);
  }, [options, validateOptions]);

  // Handle completion
  useEffect(() => {
    if (result && result.success) {
      // For text extraction, we might want to show the text in a modal or download it
      // For now, we'll automatically download as .txt file
      downloadAsTextFile(result.data, files[0]?.name || 'document.pdf');
      onComplete(result);
    }
  }, [result, onComplete, downloadAsTextFile, files]);

  const handleExtractText = async () => {
    if (files.length === 0) {
      setValidationErrors(['Please select a PDF file to extract text from']);
      return;
    }

    if (validationErrors.length > 0) {
      return;
    }

    const file = files[0]; // Process first file
    await extractText(file, options);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const currentFile = files[0];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Extract Text</h2>
          <p className="text-gray-600 mt-1">
            Extract text content from your PDF document
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">File to extract text from:</h3>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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

      {/* Extraction Options */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Extraction Options:</h3>
        
        <div className="space-y-4">
          {/* Include Metadata */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeMetadata}
              onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
              disabled={isProcessing}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Include document metadata (title, author, creation date)
            </span>
          </label>

          {/* Preserve Formatting */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.preserveFormatting}
              onChange={(e) => setOptions(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
              disabled={isProcessing}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Preserve page formatting (include page numbers and separators)
            </span>
          </label>

          {/* Page Range Toggle */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showRangeOptions}
              onChange={(e) => {
                setShowRangeOptions(e.target.checked);
                if (!e.target.checked) {
                  setOptions(prev => ({ ...prev, pageRange: undefined }));
                }
              }}
              disabled={isProcessing}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Extract specific page range (default: all pages)
            </span>
          </label>

          {/* Page Range Options */}
          {showRangeOptions && (
            <div className="ml-7 space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={options.pageRange?.start || 1}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      pageRange: {
                        start: parseInt(e.target.value) || 1,
                        end: prev.pageRange?.end || parseInt(e.target.value) || 1
                      }
                    }))}
                    disabled={isProcessing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Page
                  </label>
                  <input
                    type="number"
                    min={options.pageRange?.start || 1}
                    value={options.pageRange?.end || 1}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      pageRange: {
                        start: prev.pageRange?.start || 1,
                        end: parseInt(e.target.value) || 1
                      }
                    }))}
                    disabled={isProcessing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Leave end page empty or equal to start page to extract a single page
              </p>
            </div>
          )}
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
            Extracting text... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Result Preview */}
      {result && result.success && result.data && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-green-400 mr-2 mt-0.5">✅</div>
            <div className="flex-1">
              <h4 className="text-green-800 font-medium">Text Extraction Complete!</h4>
              <div className="text-green-700 text-sm mt-2 space-y-1">
                <p>📄 Pages processed: {result.data.pageCount}</p>
                <p>📝 Text length: {result.data.text.length.toLocaleString()} characters</p>
                {result.data.metadata?.title && (
                  <p>📋 Document title: {result.data.metadata.title}</p>
                )}
                {result.data.metadata?.author && (
                  <p>👤 Author: {result.data.metadata.author}</p>
                )}
                <p>💾 File automatically downloaded as .txt</p>
                {result.metadata?.hasText === false && (
                  <p className="text-orange-600">⚠️ This PDF may contain scanned images without extractable text</p>
                )}
              </div>
              
              {/* Preview first 300 characters */}
              {result.data.text && result.data.text.length > 50 && (
                <div className="mt-3 p-3 bg-white border border-green-200 rounded text-xs">
                  <p className="font-medium text-gray-700 mb-2">Text Preview:</p>
                  <p className="text-gray-600 font-mono whitespace-pre-wrap">
                    {result.data.text.substring(0, 300)}
                    {result.data.text.length > 300 && '...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {(error || validationErrors.length > 0) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-400 mr-2 mt-0.5">ℹ️</div>
          <div>
            <h4 className="text-blue-800 font-medium">How Text Extraction Works</h4>
            <p className="text-blue-700 text-sm mt-1">
              Using PDF.js technology to extract actual text content from your PDF. 
              Works best with PDFs created from text documents. Scanned images or 
              image-based PDFs may have limited or no extractable text.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-green-400 mr-2 mt-0.5">🔒</div>
          <div>
            <h4 className="text-green-800 font-medium">Privacy & Security</h4>
            <p className="text-green-700 text-sm mt-1">
              Text extraction happens locally in your browser using PDF.js technology. 
              Your PDF content never leaves your device, ensuring complete privacy and security.
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
          onClick={handleExtractText}
          disabled={files.length === 0 || isProcessing || validationErrors.length > 0}
          loading={isProcessing}
        >
          {isProcessing ? 'Extracting Text...' : 'Extract Text'}
        </Button>
      </div>
    </div>
  );
};

export default ExtractTextTool;