import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, WifiOff, Loader2 } from 'lucide-react';
import { useOCR } from '../../../hooks/useOCR';
import { useTranslation } from '../../../hooks/useI18n';
import Button from '../../atoms/Button';
import FileUploadZone from '../../molecules/FileUploadZone';
// OCRCanvas removed - simplified interface without area selection
import OCRSettings from './components/OCRSettings';
import OCRToolbar from './components/OCRToolbar';
import {
  detectLanguageAdvanced,
  type LanguageDetectionResult
} from '../../../utils/languageDetector';
import { QuickOCR } from '../../../utils/quickOCR';

// SelectionArea interface removed - simplified OCR without area selection

interface ModernOCRToolProps {
  onFileSelect?: (files: File[]) => void;
  onClose?: () => void;
  className?: string;
}

const ModernOCRTool: React.FC<ModernOCRToolProps> = ({
  onFileSelect,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
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

  // UI State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [languageDetection, setLanguageDetection] = useState<LanguageDetectionResult | null>(null);
  const [tesseractSupported, setTesseractSupported] = useState<boolean | null>(null);

  // Check Tesseract.js support on component mount
  useEffect(() => {
    const checkTesseractSupport = async () => {
      try {
        const hasWorker = typeof Worker !== 'undefined';
        const hasWasm = typeof WebAssembly !== 'undefined';
        const hasCanvas = typeof HTMLCanvasElement !== 'undefined';
        
        if (!hasWorker || !hasWasm || !hasCanvas) {
          setTesseractSupported(false);
          return;
        }

        const tesseract = await import('tesseract.js');
        setTesseractSupported(true);
      } catch (error) {
        console.error('Tesseract.js not supported:', error);
        setTesseractSupported(false);
      }
    };

    checkTesseractSupport();
  }, []);

  // Handle file selection
  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    if (file && canProcess(file)) {
      setIsLoadingFile(true);
      try {
        setSelectedFile(file);
        onFileSelect?.(files);
        setCurrentPage(1);

        // Language detection
        const filenameDetection = detectLanguageAdvanced(file.name);
        setLanguageDetection(filenameDetection);
        updateOptions({ language: filenameDetection.language });

        // Enhanced content analysis for images - try smart language detection
        const shouldAnalyzeContent = file.type.startsWith('image/') ||
                                   (file.type === 'application/pdf' && filenameDetection.confidence !== 'high');

        if (shouldAnalyzeContent) {
          setIsAnalyzing(true);
          try {
            // For images, start with filename-based detection but try Russian first for better coverage
            let bestDetection = filenameDetection;
            
            // If filename suggests Russian or we're not confident, try Russian first
            if (file.type.startsWith('image/') && (filenameDetection.language === 'rus' || filenameDetection.confidence === 'low')) {
              console.log('🇷🇺 Starting with Russian-optimized detection for image');
              bestDetection = {
                language: 'rus',
                confidence: 'medium',
                details: 'Smart fallback to Russian for image content',
                detectionMethods: ['image_heuristic']
              };
            }
            
            const contentDetection = await QuickOCR.quickAnalyzeForLanguage(file);
            
            // Use content detection if it's reliable or if it's for images
            const shouldUseContentDetection = file.type.startsWith('image/') ||
                                            contentDetection.confidence === 'high' ||
                                            (contentDetection.confidence === 'medium' && filenameDetection.confidence === 'low');

            if (shouldUseContentDetection) {
              setLanguageDetection(contentDetection);
              updateOptions({ language: contentDetection.language });
            } else {
              setLanguageDetection(bestDetection);
              updateOptions({ language: bestDetection.language });
            }
          } catch (error) {
            console.error('Content analysis failed:', error);
            // Fallback to Russian for images if analysis fails
            if (file.type.startsWith('image/')) {
              const fallbackDetection = {
                language: 'rus',
                confidence: 'low' as const,
                details: 'Fallback to Russian after analysis failure',
                detectionMethods: ['fallback']
              };
              setLanguageDetection(fallbackDetection);
              updateOptions({ language: fallbackDetection.language });
            }
          } finally {
            setIsAnalyzing(false);
          }
        }
      } finally {
        setIsLoadingFile(false);
      }
    }
  };

  // Handle processing - simplified for full document only
  const handleProcess = async () => {
    if (!selectedFile) return;

    console.log('📄 Processing full document:', {
      fileName: selectedFile?.name,
      outputFormat: options.outputFormat
    });
    
    await processFile(selectedFile);
  };

  // Crop functionality removed - simplified interface for full document processing only


  // Handle reset
  const handleReset = () => {
    setSelectedFile(null);
    setLanguageDetection(null);
    setCurrentPage(1);
    setTotalPages(1);
    resetState();
  };

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile) : null;

  // Show loading state while checking Tesseract support
  if (tesseractSupported === null) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`} style={{ height: 'calc(100vh - 60px)', minHeight: '800px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('tools.ocr.loading.title') || 'Initializing OCR Engine...'}
            </h3>
            <p className="text-gray-600">
              {t('tools.ocr.loading.description') || 'Checking browser compatibility and loading OCR components...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if Tesseract is not supported
  if (tesseractSupported === false) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`} style={{ height: 'calc(100vh - 60px)', minHeight: '800px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-800 mb-4">
              {t('tools.ocr.unsupported.title') || 'OCR Not Available'}
            </h3>
            <div className="text-gray-700 space-y-3 mb-6">
              <p>
                {t('tools.ocr.unsupported.description') || 
                 'OCR functionality requires modern browser features that are not available in your current browser.'}
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              {t('common.retry') || 'Retry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show file upload if no file selected
  if (!selectedFile && !isLoadingFile) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`} style={{ height: 'calc(100vh - 60px)', minHeight: '800px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Tools</span>
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {t('tools.ocr.title') || 'OCR Text Recognition'}
          </h2>
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Upload Area */}
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-2xl w-full">
            <FileUploadZone
              onFilesSelected={handleFileSelect}
              accept="application/pdf,image/*"
              acceptedTypes={['application/pdf', 'image/*']}
              maxSize={50 * 1024 * 1024}
              multiple={false}
            >
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('tools.ocr.upload.title') || 'Upload PDF or Image for OCR'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('tools.ocr.upload.description') || 'Extract text from scanned documents, images, or PDFs'}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {t('tools.ocr.upload.selectFile') || 'Select File'}
                </Button>
                <p className="text-sm text-gray-400 mt-4">
                  {t('tools.ocr.upload.supportedFormats') || 'Supported: PDF, JPG, PNG, BMP, TIFF, WebP • Max 50MB'}
                </p>
              </div>
            </FileUploadZone>
          </div>
        </div>
      </div>
    );
  }

  // Main OCR interface
  return (
    <div className={`bg-white rounded-lg shadow-lg flex flex-col ${className}`} style={{ height: 'calc(100vh - 60px)', minHeight: '800px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Tools</span>
          </button>
        )}
        <h2 className="text-xl font-bold text-gray-900">
          {t('tools.ocr.title') || 'OCR Text Recognition'}
        </h2>
        <div className="text-sm text-gray-500">
          Full Document Processing
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <OCRToolbar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          scale={scale}
          onScaleChange={setScale}
          showResults={false}
          onToggleResults={() => {}}
          isProcessing={isProcessing}
          progress={progress}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Panel */}
        <OCRSettings
          selectedFile={selectedFile}
          fileInfo={fileInfo}
          options={options}
          supportedLanguages={supportedLanguages}
          onOptionsChange={updateOptions}
          languageDetection={languageDetection}
          isAnalyzing={isAnalyzing}
          isProcessing={isProcessing}
          progress={progress}
          result={result}
          error={error}
          onProcess={handleProcess}
          onDownload={downloadResult}
          onReset={handleReset}
        />

        {/* Results and Preview area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden m-4">
            {result ? (
              // OCR Results Display
              <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg">
                {/* Results Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      OCR Results
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Confidence: {(result.result.confidence || 0).toFixed(1)}%</span>
                      <span>Words: {result.result.words?.length || 0}</span>
                      <span>Time: {((result.processingTime || 0) / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Text Content */}
                <div className="flex-1 overflow-auto p-4">
                  {result.result.text && result.result.text.trim() ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Text:</h4>
                        <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                          {result.result.text}
                        </div>
                      </div>
                      
                      {/* Character and word count */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>Characters: {result.result.text.length}</div>
                        <div>Lines: {result.result.text.split('\n').length}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8 max-w-md">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Text Found
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                          OCR processing completed but no text was detected in the document.
                        </p>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                          <h4 className="font-medium text-yellow-800 mb-2">💡 Troubleshooting Tips:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            <li>Check if the correct language is selected (Russian for Cyrillic text)</li>
                            <li>Ensure the document contains readable text (not handwritten)</li>
                            <li>Try enabling "Image Preprocessing" in Advanced Options</li>
                            <li>Verify the image quality is clear and high resolution</li>
                          </ul>
                        </div>

                        {/* Diagnostic Information */}
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                          <h4 className="font-medium text-gray-700 mb-2">🔍 Diagnostic Info:</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Language: {options.language}</div>
                            <div>Output Format: {options.outputFormat}</div>
                            <div>Confidence: {(result.result.confidence || 0).toFixed(1)}%</div>
                            <div>Words Found: {result.result.words?.length || 0}</div>
                            <div>Processing Time: {((result.processingTime || 0) / 1000).toFixed(1)}s</div>
                          </div>
                        </div>

                        {/* Quick retry button */}
                        <div className="mt-4">
                          <Button
                            onClick={() => {
                              // Reset result and try again
                              resetState();
                              setTimeout(() => handleProcess(), 100);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300"
                          >
                            🔄 Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : isProcessing ? (
              // Processing State
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Processing Document...
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {progress?.status === 'recognizing text' 
                      ? `Recognizing text... ${Math.round(progress?.progress || 0)}%`
                      : progress?.status || 'Initializing OCR engine...'
                    }
                  </p>
                  {progress?.progress && (
                    <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedFile ? (
              // File Ready State
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Document Ready for OCR
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Configure OCR settings and click "Extract Text with OCR" to begin
                  </p>
                </div>
              </div>
            ) : (
              // No File State
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Document Selected
                  </h3>
                  <p className="text-gray-500">
                    Upload a PDF or image file to begin OCR processing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernOCRTool;