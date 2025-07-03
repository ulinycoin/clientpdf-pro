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
        {/* Hero Section - only show when no tool is selected */}
        {!selectedTool && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                LocalPDF - Free Privacy-First PDF Tools
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                9 powerful PDF tools that work entirely in your browser. No uploads, no tracking, completely free.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🔒</span>
                  <span>Your files never leave your device</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">⚡</span>
                  <span>Fast local processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">🆓</span>
                  <span>Completely free</span>
                </div>
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="mb-8">
              <FileUploadZone
                onFilesSelected={handleFileSelect}
                accept="application/pdf"
                multiple={true}
                maxSize={100 * 1024 * 1024}
                disabled={false}
                className="mb-6"
              />
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-4">Uploaded Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="text-red-500">📄</div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={clearFiles}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Clear All
                    </button>
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