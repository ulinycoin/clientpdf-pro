import React, { useState, useEffect } from 'react';
import { PDFProcessingResult } from '../types';
import { 
  Header, 
  Footer, 
  ToolsGrid, 
  MergeTool, 
  CompressionTool, 
  SplitTool, 
  RotateTool, 
  WatermarkTool, 
  ExtractTextTool, 
  AddTextTool, 
  PdfToImageTool, 
  ExtractPagesTool 
} from '../components/organisms';
import FileUploadZone from '../components/molecules/FileUploadZone';
import { useFileUpload } from '../hooks/useFileUpload';
import { downloadBlob, generateFilename } from '../utils/fileHelpers';
import { scrollToTop } from '../utils/scrollHelpers';

const HomePage: React.FC = () => {
  const {
    files,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useFileUpload();

  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Smooth scroll to top when tool changes
  useEffect(() => {
    if (selectedTool) {
      // Scroll to top when opening a tool
      scrollToTop(100);
    }
  }, [selectedTool]);

  const handleFileSelect = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
  };

  const handleToolSelect = (toolType: string) => {
    // All tools now require files to be uploaded first
    if (files.length === 0) {
      alert('Please upload some PDF files first!');
      return;
    }

    setSelectedTool(toolType);
  };

  const handleCloseTool = () => {
    setSelectedTool(null);
    // Smooth scroll to top when returning to main page
    scrollToTop(150);
  };

  const handleToolComplete = (result: PDFProcessingResult | PDFProcessingResult[]) => {
    if (Array.isArray(result)) {
      // Handle multiple results (e.g., from split tool)
      result.forEach((res, index) => {
        if (res.success && res.data) {
          const filename = generateFilename(
            files[0]?.name || 'processed',
            `${selectedTool}_part_${index + 1}`,
            'pdf' // ✅ ИСПРАВЛЕНО: передаем правильное расширение
          );
          downloadBlob(res.data, filename);
        }
      });
    } else {
      // Handle single result
      if (result.success && result.data) {
        // For extract-text tool, pdf-to-image tool, extract-pages tool, and add-text tool,
        // the download is handled within the component
        if (selectedTool !== 'extract-text' && 
            selectedTool !== 'pdf-to-image' && 
            selectedTool !== 'extract-pages' &&
            selectedTool !== 'add-text') {
          const toolName = selectedTool || 'processed';
          const filename = generateFilename(
            files[0]?.name || 'processed',
            toolName,
            'pdf' // ✅ ИСПРАВЛЕНО: передаем правильное расширение
          );
          downloadBlob(result.data, filename);
        }
      }
    }
    
    setSelectedTool(null);
  };

  const renderSelectedTool = () => {
    if (!selectedTool) return null;

    const props = {
      files: files,
      onComplete: handleToolComplete,
      onClose: handleCloseTool
    };

    switch (selectedTool) {
      case 'merge':
        return <MergeTool {...props} />;
      case 'compress':
        return <CompressionTool {...props} />;
      case 'split':
        return <SplitTool {...props} />;
      case 'rotate':
        return <RotateTool {...props} />;
      case 'watermark':
        return <WatermarkTool {...props} />;
      case 'extract-text':
        return <ExtractTextTool {...props} />;
      case 'add-text':
        return <AddTextTool {...props} />;
      case 'pdf-to-image':
        // Pass the first file to PdfToImageTool for consistency
        return <PdfToImageTool onClose={handleCloseTool} initialFile={files[0]} />;
      case 'extract-pages':
        // ExtractPagesTool now receives files like other tools
        return <ExtractPagesTool {...props} />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Tool
            </h2>
            <p className="text-gray-600 mb-4">
              This tool is coming soon! We are working hard to bring you this feature.
            </p>
            <button
              onClick={handleCloseTool}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Enhanced Hero Section - only show when no tool is selected */}
        {!selectedTool && (
          <div className="max-w-5xl mx-auto px-4 py-16">
            {/* Enhanced Hero Header */}
            <div className="text-center mb-16 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
              </div>
              
              {/* Main hero content */}
              <div className="relative bg-gray-50 px-8 py-8">
                {/* Main title with gradient */}
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    LocalPDF
                  </span>
                  <br />
                  <span className="text-gray-800 text-3xl md:text-4xl font-semibold">
                    Privacy-First PDF Tools
                  </span>
                </h1>
                
                {/* Enhanced description */}
                <div className="max-w-4xl mx-auto mb-8">
                  <p className="text-xl md:text-2xl text-gray-700 mb-4 leading-relaxed">
                    Professional PDF processing tools that work <span className="font-semibold text-blue-600">entirely in your browser</span>
                  </p>
                  <p className="text-lg text-gray-600">
                    No uploads • No tracking • No limits • Completely free forever
                  </p>
                </div>
                
                {/* Enhanced feature highlights */}
                <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                  <div className="flex items-center space-x-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-base font-medium shadow-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🔒</span>
                    </div>
                    <span>Your files never leave your device</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-base font-medium shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                    <span>Lightning fast local processing</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-xl text-base font-medium shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🆓</span>
                    </div>
                    <span>Completely free, no limits</span>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>No registration required</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Open source</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced File Upload Zone */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Get Started in Seconds
                </h2>
                <p className="text-gray-600">
                  Upload your PDF files to begin processing with our professional tools
                </p>
              </div>
              <FileUploadZone
                onFilesSelected={handleFileSelect}
                accept="application/pdf"
                multiple={true}
                maxSize={100 * 1024 * 1024}
                disabled={false}
                className="mb-6"
              />
            </div>

            {/* Enhanced Uploaded Files List */}
            {files.length > 0 && (
              <div className="mb-12">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                      <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">📁</span>
                      </span>
                      <span>Ready to Process ({files.length} file{files.length !== 1 ? 's' : ''})</span>
                    </h3>
                    <button
                      onClick={clearFiles}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-lg">📄</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tool Interface - positioned at top when tool is selected */}
        {selectedTool && (
          <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
            {renderSelectedTool()}
          </div>
        )}

        {/* Tools Grid - only show when no tool is selected */}
        {!selectedTool && (
          <div className="max-w-7xl mx-auto px-4 pb-16">
            <ToolsGrid 
              onToolSelect={handleToolSelect}
              disabledTools={files.length === 0 ? ['merge', 'compress', 'split', 'rotate', 'watermark', 'extract-text', 'pdf-to-image', 'extract-pages', 'add-text'] : []}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;