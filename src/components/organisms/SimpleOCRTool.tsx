import React, { useState } from 'react';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useOCR } from '../../hooks/useOCR';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import FileUploadZone from '../molecules/FileUploadZone';

interface SimpleOCRToolProps {
  onFileSelect?: (files: File[]) => void;
}

const SimpleOCRTool: React.FC<SimpleOCRToolProps> = ({ onFileSelect }) => {
  const {
    isProcessing,
    progress,
    result,
    error,
    options,
    supportedLanguages,
    processFile,
    updateOptions,
    resetState,
    downloadResult,
    canProcess,
    getFileTypeInfo,
  } = useOCR();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    if (file && canProcess(file)) {
      setSelectedFile(file);
      onFileSelect?.(files);

      // Простое правило: если это изображение, автоматически ставим русский
      if (file.type.startsWith('image/')) {
        updateOptions({ language: 'rus' });
      } else {
        updateOptions({ language: 'eng' });
      }
    }
  };

  const handleLanguageChange = (language: string) => {
    updateOptions({ language });
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    await processFile(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    resetState();
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile) : null;
  const currentLanguage = supportedLanguages.find(lang => lang.code === options.language);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Section */}
      {!selectedFile && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <FileUploadZone
              onFilesSelected={handleFileSelect}
              accept="application/pdf,image/*"
              acceptedTypes={['application/pdf', 'image/*']}
              maxSize={50 * 1024 * 1024}
              multiple={false}
            >
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Upload PDF or Image for OCR
              </h3>
              <p className="text-gray-500 mb-6">
                Extract text from scanned documents or images
              </p>
              <p className="text-sm text-gray-400">
                Supports PDF, JPG, PNG, WebP up to 50MB
              </p>
            </div>
            </FileUploadZone>
          </div>
        </div>
      )}

      {/* File Selected */}
      {selectedFile && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Selected File</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700"
            >
              Change File
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              <strong>Name:</strong> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>

          {/* Language Selection */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">OCR Language:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                {currentLanguage?.name || 'English'}
              </span>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document Language:
              </label>
              <select
                value={options.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-500">
              {selectedFile.type.startsWith('image/') ? (
                <>🖼️ Image detected - Russian set as default. Change if needed.</>
              ) : (
                <>📄 PDF detected - English set as default. Change if needed.</>
              )}
            </div>
          </div>

          {/* Output Format */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="outputFormat"
                  value="text"
                  checked={options.outputFormat === 'text'}
                  onChange={(e) => updateOptions({ outputFormat: 'text' })}
                  className="mr-2"
                />
                Plain Text (.txt)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="outputFormat"
                  value="searchable-pdf"
                  checked={options.outputFormat === 'searchable-pdf'}
                  onChange={(e) => updateOptions({ outputFormat: 'searchable-pdf' })}
                  className="mr-2"
                />
                Searchable PDF
              </label>
            </div>
          </div>

          {/* File Info */}
          {fileInfo && (
            <div className={`flex items-center gap-2 text-sm mb-4 ${
              fileInfo.isSupported ? 'text-green-600' : 'text-red-600'
            }`}>
              {fileInfo.isSupported ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {fileInfo.message}
            </div>
          )}

          {/* Process Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleProcess}
            disabled={isProcessing || !selectedFile}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing OCR...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Extract Text with OCR
              </>
            )}
          </Button>
        </div>
      )}

      {/* Progress */}
      {isProcessing && progress && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing...</h3>
          <ProgressBar
            progress={progress.progress}
            status={progress.status}
            message={progress.message}
          />
          {progress.currentPage && progress.totalPages && (
            <p className="text-sm text-gray-600 mt-2">
              Page {progress.currentPage} of {progress.totalPages}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">OCR Error</h3>
          </div>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <Button variant="secondary" onClick={handleReset}>
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">OCR Results</h3>
            <div className="flex gap-2">
              <Button variant="primary" onClick={downloadResult}>
                Download {options.outputFormat === 'text' ? 'Text' : 'PDF'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                Process Another File
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {(result.processingTime / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {result.result.confidence.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {result.result.words?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Words Found</div>
            </div>
          </div>

          {/* Text Preview */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Extracted Text Preview:</h4>
            <div className="bg-gray-50 border rounded p-4 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {result.result.text.substring(0, 1000)}
                {result.result.text.length > 1000 && '...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOCRTool;
