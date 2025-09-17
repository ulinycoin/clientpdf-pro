import React, { useState } from 'react';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useOCR } from '../../hooks/useOCR';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import { ModernUploadZone } from '../molecules';
import { createTestFile, OCR_TEST_CASES } from '../../utils/createTestImage';

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

  // Create test image for debugging OCR
  const handleCreateTestImage = async (language: 'eng' | 'rus' = 'eng') => {
    try {
      console.log('🧪 Creating test image for OCR debugging...', { language });
      
      const testText = language === 'rus' ? 'simpleRussian' : 'simpleEnglish';
      const testFile = await createTestFile(testText as keyof typeof OCR_TEST_CASES, language);
      
      console.log('✅ Test image created:', {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type
      });
      
      // Auto-select the test file
      setSelectedFile(testFile);
      updateOptions({ language });
      
    } catch (error) {
      console.error('❌ Failed to create test image:', error);
    }
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile) : null;
  const currentLanguage = supportedLanguages.find(lang => lang.code === options.language);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Section */}
      {!selectedFile && (
        <div className="max-w-2xl mx-auto mb-8">
          <ModernUploadZone
            onFilesSelected={handleFileSelect}
            accept="application/pdf,image/*"
            acceptedTypes={['application/pdf', 'image/*']}
            maxSize={50 * 1024 * 1024}
            multiple={false}
            disabled={isProcessing}
            title="Загрузить PDF или изображение для OCR"
            subtitle="Извлекайте текст из отсканированных документов и изображений с помощью передовой технологии OCR"
            supportedFormats="PDF, JPG, PNG, WebP файлы до 50МБ"
            icon="🔍"
          />
          
          {/* Debug Test Buttons */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-600/20 rounded-xl backdrop-blur-sm">
            <h4 className="text-sm font-black text-amber-700 dark:text-amber-300 mb-3">🧪 OCR Debug Mode</h4>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleCreateTestImage('eng')}
                disabled={isProcessing}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-amber-300/80 dark:border-amber-600/20 rounded-lg text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                📝 Test English
              </button>
              <button
                onClick={() => handleCreateTestImage('rus')}
                disabled={isProcessing}
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-amber-300/80 dark:border-amber-600/20 rounded-lg text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                🇷🇺 Test Russian
              </button>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Use these buttons to create test images with clear text for debugging OCR functionality
            </p>
          </div>
        </div>
      )}

      {/* File Selected */}
      {selectedFile && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-black dark:text-white">Selected File</h3>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-red-300/80 dark:border-red-600/20 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-lg"
            >
              Change File
            </button>
          </div>

          <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                📄
              </div>
              <div>
                <p className="text-sm font-black text-black dark:text-white truncate max-w-md" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                🌍
              </div>
              <span className="font-black text-black dark:text-white">OCR Language:</span>
              <span className="px-4 py-2 bg-gradient-to-br from-seafoam-100 to-ocean-100 dark:from-seafoam-900/40 dark:to-ocean-900/40 text-seafoam-700 dark:text-seafoam-300 rounded-xl text-sm font-black shadow-sm">
                {currentLanguage?.name || 'English'}
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-black text-black dark:text-white mb-3">
                Select Document Language:
              </label>
              <select
                value={options.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/20 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg text-black dark:text-white font-medium focus:ring-2 focus:ring-seafoam-500/50 focus:border-seafoam-500 transition-all duration-200 shadow-sm"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-lg p-3 border border-blue-200/60 dark:border-blue-600/20">
              {selectedFile.type.startsWith('image/') ? (
                <>🖼️ Image detected - Russian set as default. Change if needed.</>
              ) : (
                <>📄 PDF detected - English set as default. Change if needed.</>
              )}
            </div>
          </div>

          {/* Output Format */}
          <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <label className="block text-sm font-black text-black dark:text-white mb-4">
              Output Format:
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="outputFormat"
                  value="text"
                  checked={options.outputFormat === 'text'}
                  onChange={(e) => updateOptions({ outputFormat: 'text' })}
                  className="mr-3 w-4 h-4 text-seafoam-500 border-gray-300 focus:ring-seafoam-500 focus:ring-2"
                />
                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-seafoam-600 dark:group-hover:text-seafoam-400 transition-colors duration-200">
                  📝 Plain Text (.txt)
                </span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="outputFormat"
                  value="searchable-pdf"
                  checked={options.outputFormat === 'searchable-pdf'}
                  onChange={(e) => updateOptions({ outputFormat: 'searchable-pdf' })}
                  className="mr-3 w-4 h-4 text-seafoam-500 border-gray-300 focus:ring-seafoam-500 focus:ring-2"
                />
                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-seafoam-600 dark:group-hover:text-seafoam-400 transition-colors duration-200">
                  🔍 Searchable PDF
                </span>
              </label>
            </div>
          </div>

          {/* File Info */}
          {fileInfo && (
            <div className={`flex items-center gap-3 text-sm mb-6 p-4 rounded-xl backdrop-blur-sm border shadow-lg ${
              fileInfo.isSupported 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/60 dark:border-green-600/20 text-green-800 dark:text-green-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200/60 dark:border-red-600/20 text-red-800 dark:text-red-200'
            }`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm ${
                fileInfo.isSupported ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                {fileInfo.isSupported ? '✅' : '⚠️'}
              </div>
              <span className="font-medium">{fileInfo.message}</span>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing || !selectedFile}
            className="btn-privacy-modern text-lg px-8 py-4 w-full ripple-effect btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Processing OCR...
              </>
            ) : (
              <>
                🔍 Extract Text with OCR
              </>
            )}
          </button>
        </div>
      )}

      {/* Progress */}
      {isProcessing && progress && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              🚀
            </div>
            <h3 className="text-lg font-black text-black dark:text-white">Processing OCR...</h3>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
            <ProgressBar
              progress={progress.progress}
              status={progress.status}
              message={progress.message}
            />
            {progress.currentPage && progress.totalPages && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-3 text-center">
                Page {progress.currentPage} of {progress.totalPages}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-sm border border-red-200/60 dark:border-red-600/20 rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-red-800 dark:text-red-200">OCR Error</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 font-medium mb-6">{error.message}</p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-2xl p-8 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                ✅
              </div>
              <h3 className="text-lg font-black text-black dark:text-white">OCR Results</h3>
            </div>
            <div className="flex gap-4">
              <button
                onClick={downloadResult}
                className="btn-privacy-modern text-lg px-6 py-3 ripple-effect btn-press"
              >
                📥 Download {options.outputFormat === 'text' ? 'Text' : 'PDF'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-300/80 dark:border-gray-600/20 rounded-xl text-black dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg"
              >
                Process Another File
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl mx-auto mb-3 shadow-lg">
                ⏱️
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {(result.processingTime / 1000).toFixed(1)}s
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Time</div>
            </div>
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl mx-auto mb-3 shadow-lg">
                🎯
              </div>
              <div className="text-2xl font-black text-green-600 dark:text-green-400">
                {result.result?.confidence ? result.result.confidence.toFixed(0) : '0'}%
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</div>
            </div>
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl mx-auto mb-3 shadow-lg">
                📝
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {result.result.words?.length || 0}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Words Found</div>
            </div>
          </div>

          {/* Text Preview */}
          <div>
            <h4 className="font-black text-black dark:text-white mb-4 flex items-center gap-2">
              <span>📝</span>
              Extracted Text Preview:
            </h4>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 rounded-xl p-6 shadow-lg">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200/60 dark:border-gray-600/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-medium text-gray-800 dark:text-gray-100">
                  {result.result?.text ? result.result.text.substring(0, 1000) : 'No text extracted'}
                  {result.result?.text && result.result.text.length > 1000 && '...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOCRTool;
