import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Upload, Download, Settings, ArrowRight, Shield, Zap, Lock, Loader2, Play, Scissors, Archive, ImageIcon, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { usePendingFile, useFileQuickActions, useFileRecommendations } from '../hooks/useFileTransfer';
import { useInstantFileSelection } from '../hooks/useInstantFileSelection';

// Lazy loading PDF компонентов для уменьшения размера основного bundle
const PDFPreview = lazy(() => 
  import('../components/molecules/PDFPreview').then(module => ({
    default: module.PDFPreview
  }))
);

const PDFProcessor = lazy(() => 
  import('../components/organisms/PDFProcessor').then(module => ({
    default: module.PDFProcessor
  }))
);

// Компонент загрузки для PDF функций
const PDFLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Loading PDF tools..." 
}) => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
    <p className="text-gray-600 font-medium">{message}</p>
    <p className="text-sm text-gray-500 mt-1">First time may take a moment</p>
  </div>
);

export const HomePage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);
  const [showPDFTools, setShowPDFTools] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();
  const { setPendingFile } = usePendingFile();
  const { getQuickActionForFile, getFileIcon, formatFileSize } = useFileQuickActions();
  const { getRecommendationsForFiles } = useFileRecommendations();

  // Instant file selection hook
  const { openFileDialog, isSupported, supportedFormats } = useInstantFileSelection({
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.csv', '.txt', '.tsv'],
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    onFilesSelected: (files) => {
      handleFilesSelected(files);
      setShowQuickStart(true);
      setError(''); // Clear any previous errors
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    }
  });

  useEffect(() => {
    document.title = 'LocalPDF - Free Online PDF Tools | Privacy-First PDF Processing | 5 Essential Tools';
  }, []);

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);
    setSelectedFiles(files);
    
    // Автоматически показываем первый PDF файл
    const firstPDF = files.find(file => file.type === 'application/pdf');
    if (firstPDF) {
      setCurrentPDF(firstPDF);
      setShowPDFTools(true); // Активируем lazy loading PDF компонентов
    }
  };

  // Функция для перехода к обработке файла
  const handleProcessFile = (file: File) => {
    const quickAction = getQuickActionForFile(file);
    setPendingFile(file);
    navigate(quickAction.route);
  };

  // Core PDF tools - including CSV to PDF
  const tools = [
    {
      title: 'Merge PDF Files',
      description: 'Combine multiple PDF documents into a single file',
      icon: '🔗',
      href: '/merge-pdf',
      color: 'blue'
    },
    {
      title: 'Split PDF',
      description: 'Extract pages or split PDF into separate documents',
      icon: '✂️',
      href: '/split-pdf',
      color: 'green'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: '🗜️',
      href: '/compress-pdf',
      color: 'orange'
    },
    {
      title: 'Images to PDF',
      description: 'Convert JPG, PNG and other images to PDF format',
      icon: '🖼️',
      href: '/images-to-pdf',
      color: 'purple'
    },
    {
      title: 'CSV to PDF',
      description: 'Convert CSV files to formatted PDF tables',
      icon: '📊',
      href: '/csv-to-pdf',
      color: 'cyan',
      isNew: true
    }
  ];

  // Get recommendations for uploaded files
  const recommendations = selectedFiles.length > 0 ? getRecommendationsForFiles(selectedFiles) : [];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Free Online PDF Tools
          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">5 Essential Tools</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Process PDFs and convert documents instantly in your browser. No uploads, no servers, your files never leave your device.
        </p>
        
        {/* Instant File Selection Button */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            icon={Upload}
            onClick={openFileDialog}
            disabled={!isSupported}
            className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-8 py-4 text-lg"
          >
            Choose Files
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            {isSupported 
              ? `Click to select files: ${supportedFormats.slice(0, 4).join(', ')}${supportedFormats.length > 4 ? ' and more' : ''}`
              : 'File selection not supported in this browser'
            }
          </p>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md max-w-lg mx-auto">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
        
        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1 text-green-500" />
            100% Private
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1 text-blue-500" />
            Instant Processing
          </div>
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-1 text-purple-500" />
            No Uploads
          </div>
        </div>
      </div>

      {/* Quick Start Section - Only show when files are selected */}
      {showQuickStart && selectedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12 shadow-sm animate-in slide-in-from-top duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎯 Ready to Process Your Files
            </h2>
            <p className="text-gray-600">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected • Choose an action below
            </p>
          </div>

          {/* Smart Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Recommended Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(rec.route)}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group text-left"
                  >
                    <h4 className="font-semibold text-blue-900 mb-2 group-hover:text-blue-700">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {rec.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-3">
                {selectedFiles.map((file, index) => {
                  const quickAction = getQuickActionForFile(file);
                  const fileIcon = getFileIcon(file);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="text-2xl mr-3">
                          {fileIcon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setCurrentPDF(file);
                            setShowPDFTools(true);
                          }}
                          className="text-xs"
                        >
                          Preview
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={quickAction.icon === 'ImageIcon' ? ImageIcon : 
                                quickAction.icon === 'BarChart3' ? BarChart3 : 
                                quickAction.icon === 'Scissors' ? Scissors : Play}
                          onClick={() => handleProcessFile(file)}
                          className="text-xs"
                        >
                          {quickAction.action}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Lazy loaded file preview */}
            {showPDFTools && currentPDF && (
              <Suspense 
                fallback={
                  <PDFLoadingFallback message="Loading file preview..." />
                }
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    File Preview
                  </h3>
                  {currentPDF.type === 'application/pdf' ? (
                    <PDFPreview
                      file={currentPDF}
                      className="h-96 lg:h-[500px] rounded-lg border"
                      onPagesLoaded={(count) => console.log(`PDF loaded with ${count} pages`)}
                    />
                  ) : (
                    <div className="h-96 lg:h-[500px] rounded-lg border bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">
                          {getFileIcon(currentPDF)}
                        </div>
                        <p className="text-gray-600 font-medium">{currentPDF.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {currentPDF.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) 
                            ? 'Image file ready for PDF conversion' 
                            : 'File ready for processing'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatFileSize(currentPDF.size)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Suspense>
            )}
          </div>

          {/* Action to add more files */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              icon={Upload}
              onClick={openFileDialog}
              className="mr-4"
            >
              Add More Files
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedFiles([]);
                setCurrentPDF(null);
                setShowPDFTools(false);
                setShowQuickStart(false);
                setError('');
              }}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Tools Grid - Square Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className={clsx(
              'group relative block aspect-square p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl transform-gpu',
              'flex flex-col items-center justify-center text-center',
              tool.color === 'blue' && 'border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
              tool.color === 'green' && 'border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
              tool.color === 'orange' && 'border-orange-200 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
              tool.color === 'purple' && 'border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
              tool.color === 'cyan' && 'border-cyan-200 hover:border-cyan-300 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200'
            )}
          >
            {tool.isNew && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                NEW
              </div>
            )}
            
            {/* Icon */}
            <div className="text-4xl md:text-5xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">
              {tool.icon}
            </div>
            
            {/* Title */}
            <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {tool.title}
            </h3>
            
            {/* Description - Hidden on mobile, shown on larger screens */}
            <p className="hidden md:block text-xs text-gray-600 mb-2 md:mb-3 line-clamp-2 px-1">
              {tool.description}
            </p>
            
            {/* Action indicator */}
            <div className="flex items-center justify-center text-xs font-medium text-blue-600 group-hover:text-blue-700 mt-auto">
              <span className="hidden md:inline">Get Started</span>
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 md:ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Alternative Upload Zone - Only show when no files selected */}
      {!showQuickStart && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Alternative: Drag & Drop Files
            </h2>
            <p className="text-gray-600">
              Or drag and drop multiple files here for batch processing
            </p>
          </div>

          <FileUploadZone
            onFilesSelected={(files) => {
              handleFilesSelected(files);
              setShowQuickStart(true);
            }}
            acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.txt', '.tsv']}
            maxFiles={5}
            maxSize={100 * 1024 * 1024}
            className="mb-6"
          />
        </div>
      )}

      {/* Features Section */}
      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Why Choose LocalPDF?
          </h2>
          <p className="text-blue-700 max-w-2xl mx-auto">
            Professional-grade PDF processing with complete privacy and instant results
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-blue-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-blue-700">Process files instantly without waiting for uploads or downloads</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="font-semibold text-blue-900 mb-2">100% Private</h3>
            <p className="text-sm text-blue-700">Your files never leave your device - complete privacy guaranteed</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-blue-900 mb-2">Professional Quality</h3>
            <p className="text-sm text-blue-700">Industry-standard PDF processing with reliable results</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-blue-900 mb-2">Document Conversion</h3>
            <p className="text-sm text-blue-700">Convert CSV, images, and more to professional PDFs</p>
          </div>
        </div>
      </div>

      {/* New CSV Feature Highlight */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-200 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📊</span>
              <div>
                <h2 className="text-2xl font-bold text-cyan-900 mb-2">
                  New: CSV to PDF Converter
                </h2>
                <p className="text-cyan-700">
                  Transform your spreadsheet data into professional PDF tables with custom styling, 
                  multiple layouts, and smart formatting options.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-cyan-900 text-sm mb-1">Smart Parsing</h4>
                <p className="text-xs text-cyan-700">Auto-detects delimiters and data types</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-cyan-900 text-sm mb-1">Custom Styling</h4>
                <p className="text-xs text-cyan-700">Multiple table formats and orientations</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-cyan-900 text-sm mb-1">Large Files</h4>
                <p className="text-xs text-cyan-700">Handle datasets up to 50MB</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 text-center">
            <Link
              to="/csv-to-pdf"
              className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Try CSV to PDF
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-green-50 rounded-2xl p-8 border border-green-200 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Settings className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            Your Privacy is Protected
          </h2>
          <p className="text-green-700 max-w-2xl mx-auto mb-6">
            All PDF processing happens locally in your browser. Your files are never uploaded to our servers, 
            ensuring complete privacy and security for your sensitive documents.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🔒 No Uploads</h3>
              <p className="text-sm text-green-700">Files never leave your device</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">⚡ Fast Processing</h3>
              <p className="text-sm text-green-700">No server delays or queues</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🌐 Works Offline</h3>
              <p className="text-sm text-green-700">Process files without internet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
