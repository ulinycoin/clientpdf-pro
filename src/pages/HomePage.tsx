import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Download, Settings, ArrowRight, Shield, Zap, Lock, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { InternalLinkSection } from '../components/molecules/InternalLinkSection';

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

  useEffect(() => {
    document.title = 'LocalPDF - Free Online PDF Tools | Privacy-First PDF Processing';
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
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Free Online PDF Tools
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Process PDFs instantly in your browser. No uploads, no servers, your files never leave your device.
        </p>
        
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

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className={clsx(
              'block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg group',
              tool.color === 'blue' && 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
              tool.color === 'green' && 'border-green-200 hover:border-green-300 hover:bg-green-50',
              tool.color === 'orange' && 'border-orange-200 hover:border-orange-300 hover:bg-orange-50',
              tool.color === 'purple' && 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
            )}
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {tool.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {tool.description}
            </p>
            <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
              Get Started
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Start Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Try It Now
          </h2>
          <p className="text-gray-600">
            Upload a PDF or image file to get started with any tool
          </p>
        </div>

        <FileUploadZone
          onFilesSelected={handleFilesSelected}
          acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.gif']}
          maxFiles={5}
          maxSize={100 * 1024 * 1024}
          className="mb-6"
        />

        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Files ({selectedFiles.length})
              </h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <Button
                    key={index}
                    variant={currentPDF === file ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setCurrentPDF(file);
                      setShowPDFTools(true);
                    }}
                  >
                    {file.name.substring(0, 20)}...
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Lazy loaded PDF Preview */}
            {showPDFTools && currentPDF && (
              <Suspense 
                fallback={
                  <PDFLoadingFallback message="Loading PDF preview..." />
                }
              >
                <PDFPreview
                  file={currentPDF}
                  className="h-96 lg:h-[600px]"
                  onPagesLoaded={(count) => console.log(`PDF loaded with ${count} pages`)}
                />
              </Suspense>
            )}
          </div>
        )}
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

      {/* Internal Links */}
      <InternalLinkSection className="mb-8" />
    </div>
  );
};
