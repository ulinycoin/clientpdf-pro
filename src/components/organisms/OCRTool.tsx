import React, { useState } from 'react';
import { FileText, Eye, Download, Settings, AlertCircle, CheckCircle, Loader2, Brain, Zap } from 'lucide-react';
import { useOCR } from '../../hooks/useOCR';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import FileUploadZone from '../molecules/FileUploadZone';
import {
  detectLanguageAdvanced,
  getLanguageConfidence,
  getLanguageConfidenceMessage,
  type LanguageDetectionResult
} from '../../utils/languageDetector';
import { QuickOCR } from '../../utils/quickOCR';

interface OCRToolProps {
  onFileSelect?: (files: File[]) => void;
}

const OCRTool: React.FC<OCRToolProps> = ({ onFileSelect }) => {
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
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [languageDetection, setLanguageDetection] = useState<LanguageDetectionResult | null>(null);

  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    if (file && canProcess(file)) {
      setIsLoadingFile(true);
      try {
        setSelectedFile(file);
        onFileSelect?.(files);

        // Step 1: Quick filename-based detection
        const filenameDetection = detectLanguageAdvanced(file.name);
        setLanguageDetection(filenameDetection);
        updateOptions({ language: filenameDetection.language });

        // Step 2: Enhanced content analysis for better detection
        // ALWAYS analyze content for images since filenames rarely indicate language
        // For PDFs, only analyze if filename confidence is not high
        const shouldAnalyzeContent = file.type.startsWith('image/') ||
                                   (file.type === 'application/pdf' && filenameDetection.confidence !== 'high');

        console.log('🔍 OCR: Analysis decision - File type:', file.type, 'Filename confidence:', filenameDetection.confidence, 'Will analyze:', shouldAnalyzeContent);

        if (shouldAnalyzeContent) {
          setIsAnalyzing(true);
          try {
            console.log('🚀 OCR: Starting content analysis for file:', file.name, 'type:', file.type);
            const contentDetection = await QuickOCR.quickAnalyzeForLanguage(file);
            console.log('📊 OCR: Content detection result:', contentDetection);

            // For images, ALWAYS prefer content detection over filename detection
            // For PDFs, use content detection if it has higher or equal confidence
            const shouldUseContentDetection = file.type.startsWith('image/') ||
                                            contentDetection.confidence === 'high' ||
                                            (contentDetection.confidence === 'medium' && filenameDetection.confidence === 'low');

            if (shouldUseContentDetection) {
              console.log('✅ OCR: Using content detection result');
              setLanguageDetection(contentDetection);
              updateOptions({ language: contentDetection.language });
            } else {
              console.log('⚠️ OCR: Keeping filename detection result');
            }
          } catch (error) {
            console.error('❌ OCR: Content analysis failed:', error);
            // Keep the filename-based detection
          } finally {
            setIsAnalyzing(false);
          }
        } else {
          console.log('⏭️ OCR: Skipping content analysis - high confidence filename detection');
        }

        // Show settings if confidence is still not high
        const finalDetection = languageDetection || filenameDetection;
        if (finalDetection.confidence !== 'high') {
          setShowSettings(true);
        }

      } finally {
        setIsLoadingFile(false);
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setLanguageDetection(null);
    resetState();
    setShowPreview(false);
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile) : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          OCR Text Recognition
        </h2>
        <p className="text-gray-600">
          Extract text from PDFs and images using advanced OCR technology.
          All processing happens locally in your browser.
        </p>
      </div>

      {/* File Upload Section */}
      {!selectedFile && !isLoadingFile && (
        <FileUploadZone
          onFilesSelected={handleFileSelect}
          accept="application/pdf,image/*"
          acceptedTypes={['application/pdf', 'image/*']}
          maxSize={50 * 1024 * 1024} // 50MB
          multiple={false}
          className="mb-6"
        >
          {/* Custom OCR upload content */}
          <div className="text-center">
            <div className="text-6xl mb-4">
              🔍
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Upload PDF or Image for OCR
            </h3>
            <p className="text-gray-500 mb-6">
              Extract text from scanned documents, images, or PDFs
            </p>
            <Button
              variant="primary"
              size="lg"
              type="button"
              aria-label="Select file for OCR processing"
              title="Click to select PDF or image file"
              onClick={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
                // Trigger the file input directly
                const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                if (fileInput) {
                  fileInput.click();
                } else {
                  console.error('File input not found');
                }
              }}
            >
              Select File
            </Button>
            <p className="text-sm text-gray-400 mt-4">
              Supported: PDF, JPG, PNG, BMP, TIFF, WebP • Max 50MB
            </p>
          </div>
        </FileUploadZone>
      )}

      {/* Loading state for file processing and analysis */}
      {(isLoadingFile || isAnalyzing) && (
        <div className="mb-6 p-8 bg-blue-50 rounded-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            {isAnalyzing ? 'Analyzing Document Content...' : 'Processing File...'}
          </h3>
          <p className="text-blue-600">
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Smart language detection in progress
              </span>
            ) : (
              'Analyzing file and detecting language'
            )}
          </p>
          {isAnalyzing && (
            <p className="text-xs text-blue-500 mt-2">
              Performing quick OCR sample to determine document language
            </p>
          )}
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Selected File</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700"
            >
              Change File
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Name:</strong> {selectedFile.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
          </p>

          {/* Enhanced Language Detection Info */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Language Detection:</span>

              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    Analyzing content...
                  </span>
                </div>
              ) : (
                <>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {supportedLanguages.find(lang => lang.code === options.language)?.name || 'English'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    languageDetection?.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    languageDetection?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {languageDetection?.confidence === 'high' ? 'High Confidence' :
                     languageDetection?.confidence === 'medium' ? 'Medium Confidence' :
                     'Low Confidence'}
                  </span>
                </>
              )}
            </div>

            {languageDetection && !isAnalyzing && (
              <div className="text-xs text-gray-600 mb-2">
                <strong>Detection Details:</strong> {languageDetection.details}
              </div>
            )}

            {languageDetection?.detectionMethods && languageDetection.detectionMethods.length > 0 && !isAnalyzing && (
              <div className="text-xs text-gray-500">
                <strong>Methods Used:</strong> {languageDetection.detectionMethods.join(', ').replace(/_/g, ' ')}
              </div>
            )}

            {!isAnalyzing && (
              <div className="mt-2 text-xs text-gray-500">
                {languageDetection?.confidence === 'low' ?
                  '⚠️ Please verify language in settings for better OCR accuracy' :
                  languageDetection?.confidence === 'medium' ?
                  '💡 Language detected with medium confidence - verify if needed' :
                  '✅ Language detected with high confidence'
                }
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-2 text-xs text-blue-600">
                🔍 Analyzing document content to improve language detection...
              </div>
            )}
          </div>

          {fileInfo && (
            <div className={`flex items-center gap-2 text-sm ${
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
        </div>
      )}

      {/* Settings Panel */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          OCR Settings
        </Button>

        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            {/* Enhanced Language Selection Warning */}
            <div className={`p-3 border rounded-lg ${
              languageDetection?.confidence === 'high' ? 'bg-green-50 border-green-200' :
              languageDetection?.confidence === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className={`w-4 h-4 ${
                  languageDetection?.confidence === 'high' ? 'text-green-600' :
                  languageDetection?.confidence === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <span className={`text-sm font-medium ${
                  languageDetection?.confidence === 'high' ? 'text-green-800' :
                  languageDetection?.confidence === 'medium' ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  Smart Language Detection Results
                </span>
              </div>

              {languageDetection && (
                <div className={`text-xs mb-2 ${
                  languageDetection.confidence === 'high' ? 'text-green-700' :
                  languageDetection.confidence === 'medium' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  <div className="mb-1">
                    <strong>Analysis:</strong> {languageDetection.details}
                  </div>
                  {languageDetection.detectionMethods.length > 0 && (
                    <div>
                      <strong>Detection methods:</strong> {languageDetection.detectionMethods.join(', ').replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              )}

              <p className={`text-xs ${
                languageDetection?.confidence === 'high' ? 'text-green-700' :
                languageDetection?.confidence === 'medium' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {languageDetection?.confidence === 'high' ?
                  'Language detected with high confidence. OCR should work well with the selected language.' :
                  languageDetection?.confidence === 'medium' ?
                  'Language detected with medium confidence. Please verify the selection below for optimal results.' :
                  'Language detection has low confidence. Please carefully select the correct language for your document.'
                }
              </p>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OCR Recognition Language
              </label>
              <select
                value={options.language}
                onChange={(e) => updateOptions({ language: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the primary language of your document. Correct language selection significantly improves OCR accuracy.
              </p>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="text"
                    checked={options.outputFormat === 'text'}
                    onChange={(e) => updateOptions({ outputFormat: e.target.value as any })}
                    className="mr-2"
                  />
                  <span className="text-sm">Plain Text (.txt)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="searchable-pdf"
                    checked={options.outputFormat === 'searchable-pdf'}
                    onChange={(e) => updateOptions({ outputFormat: e.target.value as any })}
                    className="mr-2"
                  />
                  <span className="text-sm">Searchable PDF (with text layer)</span>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advanced Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.preserveLayout}
                    onChange={(e) => updateOptions({ preserveLayout: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Preserve Layout</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.imagePreprocessing}
                    onChange={(e) => updateOptions({ imagePreprocessing: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Image Preprocessing</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Process Button */}
      {selectedFile && fileInfo?.isSupported && !isProcessing && !result && (
        <div className="mb-6">
          <Button
            onClick={handleProcess}
            disabled={!selectedFile || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <FileText className="w-5 h-5 mr-2" />
            Extract Text with OCR
          </Button>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && progress && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="font-medium text-blue-800">Processing OCR...</span>
          </div>

          <ProgressBar
            progress={progress.progress}
            className="mb-2"
          />

          <div className="text-sm text-blue-600">
            <div className="mb-1">
              <strong>Status:</strong> {progress.status}
            </div>
            {progress.currentPage && progress.totalPages && (
              <div>
                <strong>Progress:</strong> Page {progress.currentPage} of {progress.totalPages}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">OCR Error</span>
          </div>
          <p className="text-red-700 mb-2">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Success Message */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">OCR Completed Successfully!</span>
            </div>
            <div className="text-sm text-green-700">
              <p><strong>Processing Time:</strong> {(result.processingTime / 1000).toFixed(1)} seconds</p>
              <p><strong>Text Confidence:</strong> {result.result.confidence.toFixed(1)}%</p>
              <p><strong>Words Found:</strong> {result.result.words.length}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={downloadResult}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download {options.outputFormat === 'text' ? 'Text' : 'Searchable PDF'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>

          {/* Text Preview */}
          {showPreview && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Extracted Text Preview</h3>
              <div className="max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {result.result.text.slice(0, 2000)}
                  {result.result.text.length > 2000 && '...'}
                </pre>
              </div>
              {result.result.text.length > 2000 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 2000 characters. Download full text for complete content.
                </p>
              )}
            </div>
          )}

          {/* Process Another File */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              Process Another File
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Info Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Enhanced OCR with Smart Language Detection
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Smart Detection:</strong> Advanced algorithm analyzes filename and content</p>
          <p>• <strong>Multiple Methods:</strong> Keyword analysis, script detection, city recognition</p>
          <p>• <strong>Content Analysis:</strong> Quick OCR sample for accurate language identification</p>
          <p>• <strong>Supported Files:</strong> PDF, JPG, PNG, BMP, TIFF, WebP (max 50MB)</p>
          <p>• <strong>Languages:</strong> {supportedLanguages.length}+ languages with native script support</p>
          <p>• <strong>Privacy:</strong> All processing happens locally in your browser</p>
          <p>• <strong>Quality:</strong> Language accuracy directly improves OCR text recognition</p>
        </div>
      </div>
    </div>
  );
};

export default OCRTool;
