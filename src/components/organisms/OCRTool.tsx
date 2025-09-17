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
    <div className="max-w-4xl mx-auto p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-black dark:text-white mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FileText className="w-5 h-5" />
          </div>
          OCR Text Recognition
        </h2>
        <p className="text-gray-800 dark:text-gray-100 font-medium">
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
        <div className="mb-6 p-8 bg-seafoam-50/90 dark:bg-seafoam-900/20 backdrop-blur-lg border border-seafoam-200/50 dark:border-seafoam-600/30 rounded-2xl text-center shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          </div>
          <h3 className="text-lg font-black text-seafoam-800 dark:text-seafoam-200 mb-2">
            {isAnalyzing ? 'Analyzing Document Content...' : 'Processing File...'}
          </h3>
          <p className="text-seafoam-700 dark:text-seafoam-300 font-medium">
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
        <div className="mb-6 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-black dark:text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">
                📄
              </div>
              Selected File
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg transition-colors"
            >
              Change File
            </Button>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-100 font-medium mb-2">
            <strong className="text-black dark:text-white">Name:</strong> {selectedFile.name}
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-100 font-medium mb-2">
            <strong className="text-black dark:text-white">Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
          </p>

          {/* Enhanced Language Detection Info */}
          <div className="mb-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-brain-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                <Brain className="w-3 h-3" />
              </div>
              <span className="text-sm font-black text-black dark:text-white">Language Detection:</span>

              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-seafoam-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="px-3 py-1 bg-seafoam-100/90 dark:bg-seafoam-900/30 text-seafoam-800 dark:text-seafoam-200 rounded-lg text-sm font-medium backdrop-blur-sm">
                    Analyzing content...
                  </span>
                </div>
              ) : (
                <>
                  <span className="px-3 py-1 bg-ocean-100/90 dark:bg-ocean-900/30 text-ocean-800 dark:text-ocean-200 rounded-lg text-sm font-medium backdrop-blur-sm">
                    {supportedLanguages.find(lang => lang.code === options.language)?.name || 'English'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm ${
                    languageDetection?.confidence === 'high' ? 'bg-green-100/90 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    languageDetection?.confidence === 'medium' ? 'bg-yellow-100/90 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    'bg-red-100/90 dark:bg-red-900/30 text-red-700 dark:text-red-300'
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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Settings className="w-4 h-4" />
          </div>
          <span className="font-black text-black dark:text-white">OCR Settings</span>
          <div className={`w-4 h-4 transform transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showSettings && (
          <div className="mt-4 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg space-y-6">
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
            <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl p-4">
              <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded flex items-center justify-center text-xs">
                  🌐
                </div>
                OCR Recognition Language
              </label>
              <select
                value={options.language}
                onChange={(e) => updateOptions({ language: e.target.value })}
                className="w-full px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/30 dark:border-gray-600/30 rounded-xl focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-300 font-medium text-black dark:text-white"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-2">
                Choose the primary language of your document. Correct language selection significantly improves OCR accuracy.
              </p>
            </div>

            {/* Output Format */}
            <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl p-4">
              <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded flex items-center justify-center text-xs">
                  📄
                </div>
                Output Format
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="text"
                    checked={options.outputFormat === 'text'}
                    onChange={(e) => updateOptions({ outputFormat: e.target.value as any })}
                    className="w-4 h-4 text-seafoam-500 bg-white/90 border-gray-300 focus:ring-seafoam-500 focus:ring-2 mr-3"
                  />
                  <span className="text-sm font-medium text-black dark:text-white">Plain Text (.txt)</span>
                </label>
                <label className="flex items-center p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="searchable-pdf"
                    checked={options.outputFormat === 'searchable-pdf'}
                    onChange={(e) => updateOptions({ outputFormat: e.target.value as any })}
                    className="w-4 h-4 text-seafoam-500 bg-white/90 border-gray-300 focus:ring-seafoam-500 focus:ring-2 mr-3"
                  />
                  <span className="text-sm font-medium text-black dark:text-white">Searchable PDF (with text layer)</span>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl p-4">
              <label className="block text-sm font-black text-black dark:text-white mb-3 flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded flex items-center justify-center text-xs">
                  ⚙️
                </div>
                Advanced Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.preserveLayout}
                    onChange={(e) => updateOptions({ preserveLayout: e.target.checked })}
                    className="w-4 h-4 text-seafoam-500 bg-white/90 border-gray-300 focus:ring-seafoam-500 focus:ring-2 mr-3 rounded"
                  />
                  <span className="text-sm font-medium text-black dark:text-white">Preserve Layout</span>
                </label>
                <label className="flex items-center p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.imagePreprocessing}
                    onChange={(e) => updateOptions({ imagePreprocessing: e.target.checked })}
                    className="w-4 h-4 text-seafoam-500 bg-white/90 border-gray-300 focus:ring-seafoam-500 focus:ring-2 mr-3 rounded"
                  />
                  <span className="text-sm font-medium text-black dark:text-white">Image Preprocessing</span>
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
