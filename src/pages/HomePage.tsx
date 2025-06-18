import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Download, Settings, ArrowRight } from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFPreview } from '../components/molecules/PDFPreview';
import { PDFProcessor } from '../components/organisms/PDFProcessor';

export const HomePage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);
    setSelectedFiles(files);
    
    // Автоматически показываем первый PDF файл
    const firstPDF = files.find(file => file.type === 'application/pdf');
    if (firstPDF) {
      setCurrentPDF(firstPDF);
    }
  };

  const scrollToUpload = () => {
    uploadZoneRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const tools = [
    {
      title: 'Merge PDF Files',
      description: 'Combine multiple PDF documents into a single file',
      icon: '🔗',
      href: '/merge-pdf',
      colorClasses: 'hover:border-blue-300'
    },
    {
      title: 'Split PDF',
      description: 'Extract pages or split PDF into separate documents',
      icon: '✂️',
      href: '/split-pdf',
      colorClasses: 'hover:border-green-300'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: '🗜️',
      href: '/compress-pdf',
      colorClasses: 'hover:border-orange-300'
    },
    {
      title: 'Images to PDF',
      description: 'Convert JPG, PNG and other images to PDF format',
      icon: '🖼️',
      href: '/images-to-pdf',
      colorClasses: 'hover:border-purple-300'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          LocalPDF - Free PDF Tools
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Process PDFs instantly in your browser. No uploads, no servers, your files never leave your device.
          <br />
          <span className="text-blue-600 font-medium">100% Privacy Guaranteed</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            icon={Upload}
            onClick={scrollToUpload}
            className="px-8"
          >
            Start Processing Files
          </Button>
          <Link to="/faq">
            <Button
              variant="secondary"
              size="lg"
              icon={FileText}
              className="px-8"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {tools.map((tool, index) => (
          <Link
            key={index}
            to={tool.href}
            className={`group p-6 bg-white rounded-xl border-2 border-gray-200 ${tool.colorClasses} hover:shadow-lg transition-all duration-200`}
          >
            <div className="text-4xl mb-4">{tool.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {tool.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {tool.description}
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <span>Try now</span>
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
          <Upload className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drag & Drop Upload
          </h3>
          <p className="text-gray-600">
            Simply drag and drop your files or click to browse. Supports multiple file formats.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
          <FileText className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Interactive Preview
          </h3>
          <p className="text-gray-600">
            Preview your PDFs with interactive page thumbnails. Reorder, split, or merge with ease.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
          <Download className="h-12 w-12 text-orange-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Instant Download
          </h3>
          <p className="text-gray-600">
            Process and download your files instantly. No server uploads, complete privacy guaranteed.
          </p>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quick Start
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your files below to get started, or choose a specific tool above for focused processing.
          </p>
        </div>

        {/* Upload Zone */}
        <div ref={uploadZoneRef}>
          <FileUploadZone 
            onFilesSelected={handleFilesSelected}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* PDF Operations */}
        {selectedFiles.length > 0 && (
          <div className="mt-8">
            <PDFProcessor files={selectedFiles} />
          </div>
        )}

        {/* PDF Preview */}
        {currentPDF && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                PDF Preview: {currentPDF.name}
              </h3>
              {selectedFiles.length > 1 && (
                <div className="flex space-x-2">
                  {selectedFiles
                    .filter(file => file.type === 'application/pdf')
                    .map((file, index) => (
                      <Button
                        key={index}
                        variant={file === currentPDF ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCurrentPDF(file)}
                      >
                        {file.name.substring(0, 20)}...
                      </Button>
                    ))}
                </div>
              )}
            </div>
            
            <PDFPreview
              file={currentPDF}
              className="h-96 lg:h-[600px]"
              onPagesLoaded={(count) => console.log(`PDF loaded with ${count} pages`)}
            />
          </div>
        )}
      </div>

      {/* Privacy Section */}
      <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
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