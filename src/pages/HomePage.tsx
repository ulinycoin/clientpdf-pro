import React, { useState, useEffect } from 'react';
import { PDFProcessingResult } from '../types';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import FileUploadZone from '../components/molecules/FileUploadZone';
import ToolsGrid from '../components/organisms/ToolsGrid';
import MergeTool from '../components/organisms/MergeTool';
import CompressionTool from '../components/organisms/CompressionTool';
import SplitTool from '../components/organisms/SplitTool';
import RotateTool from '../components/organisms/RotateTool';
import WatermarkTool from '../components/organisms/WatermarkTool';
import ExtractTextTool from '../components/organisms/ExtractTextTool';
import { PdfToImageTool } from '../components/organisms/PdfToImageTool';
import { useFileUpload } from '../hooks/useFileUpload';
import { downloadBlob, generateFilename } from '../utils/fileHelpers';

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

  // Scroll to top when tool changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // Scroll to top when returning to main page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleToolComplete = (result: PDFProcessingResult | PDFProcessingResult[]) => {
    if (Array.isArray(result)) {
      // Handle multiple results (e.g., from split tool)
      result.forEach((res, index) => {
        if (res.success && res.data) {
          const filename = generateFilename(
            `${selectedTool}_part_${index + 1}`,
            files[0]?.name,
            true
          );
          downloadBlob(res.data, filename);
        }
      });
    } else {
      // Handle single result
      if (result.success && result.data) {
        // For extract-text tool and pdf-to-image tool, the download is handled within the component
        if (selectedTool !== 'extract-text' && selectedTool !== 'pdf-to-image') {
          const toolName = selectedTool || 'processed';
          const filename = generateFilename(
            toolName,
            files[0]?.name,
            true
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
      case 'pdf-to-image':
        // Pass the first file to PdfToImageTool for consistency
        return <PdfToImageTool onClose={handleCloseTool} initialFile={files[0]} />;
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
                Free PDF Tools
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Convert, merge, split, rotate and compress PDFs - all locally in your browser
              </p>
              <p className="text-sm text-gray-500">
                Your files never leave your device - Fast processing - Completely free
              </p>
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
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={clearFiles}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tool Interface - full width when tool is selected */}
        {selectedTool && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            {renderSelectedTool()}
          </div>
        )}

        {/* Tools Grid - only show when no tool is selected */}
        {!selectedTool && (
          <div className="max-w-7xl mx-auto px-4 pb-16">
            <ToolsGrid 
              onToolSelect={handleToolSelect}
              disabledTools={files.length === 0 ? ['merge', 'compress', 'split', 'rotate', 'watermark', 'extract-text', 'pdf-to-image'] : []}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;