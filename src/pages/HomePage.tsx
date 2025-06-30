import React, { useState } from 'react';
import { FileItem, PDFOperationType, PDFProcessingResult } from '../types';
import Header from '../components/organisms/Header';
import FileUploadZone from '../components/molecules/FileUploadZone';
import FileList from '../components/molecules/FileList';
import ToolsGrid from '../components/organisms/ToolsGrid';
import MergeTool from '../components/organisms/MergeTool';
import CompressionTool from '../components/organisms/CompressionTool';
import { useFileUpload } from '../hooks/useFileUpload';
import { downloadBlob, generateFilename } from '../utils/fileHelpers';

const HomePage: React.FC = () => {
  const {
    files,
    isDragActive,
    isUploading,
    addFiles,
    removeFile,
    retryFile,
    getRootProps,
    getInputProps
  } = useFileUpload({
    maxFiles: 10,
    maxSizeBytes: 100 * 1024 * 1024, // 100MB
    acceptedTypes: ['application/pdf'],
    autoProcess: true
  });

  const [selectedTool, setSelectedTool] = useState<PDFOperationType | null>(null);

  const handleFileSelect = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
  };

  const handleToolSelect = (toolType: PDFOperationType) => {
    const completedFiles = files
      .filter(f => f.status === 'completed')
      .map(f => f.file);
    
    if (completedFiles.length === 0) {
      alert('Please upload some PDF files first!');
      return;
    }

    setSelectedTool(toolType);
  };

  const handleCloseTool = () => {
    setSelectedTool(null);
  };

  const handleToolComplete = (result: PDFProcessingResult | PDFProcessingResult[]) => {
    if (Array.isArray(result)) {
      // Handle multiple results (e.g., from split operation)
      result.forEach((res, index) => {
        if (res.success && res.data) {
          const filename = generateFilename(
            `split_part_${index + 1}`,
            'processed',
            'pdf'
          );
          downloadBlob(res.data, filename);
        }
      });
    } else {
      // Handle single result
      if (result.success && result.data) {
        const toolName = selectedTool || 'processed';
        const filename = generateFilename(
          `${toolName}_result`,
          'processed',
          'pdf'
        );
        downloadBlob(result.data, filename);
      }
    }
    
    setSelectedTool(null);
  };

  const completedFiles = files
    .filter(f => f.status === 'completed')
    .map(f => f.file);

  const renderSelectedTool = () => {
    if (!selectedTool) return null;

    const props = {
      files: completedFiles,
      onComplete: handleToolComplete,
      onClose: handleCloseTool
    };

    switch (selectedTool) {
      case PDFOperationType.MERGE:
        return <MergeTool {...props} />;
      case PDFOperationType.COMPRESS:
        return <CompressionTool {...props} />;
      // Add other tools as they're implemented
      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Tool
            </h2>
            <p className="text-gray-600 mb-4">
              This tool is coming soon! We're working hard to bring you this feature.
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
    <div className="min-h-screen bg-gray-50" {...getRootProps()}>
      <input {...getInputProps()} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free PDF Tools
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Convert, merge, split and compress PDFs - all locally in your browser
            </p>
            <p className="text-sm text-gray-500">
              🔒 Your files never leave your device • 🚀 Fast processing • 💯 Completely free
            </p>
          </div>

          {/* File Upload Zone */}
          <div className="mb-8">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              dragActive={isDragActive}
              uploading={isUploading}
              maxFiles={10}
              maxSizeBytes={100 * 1024 * 1024}
              className="mb-6"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-8">
              <FileList
                files={files}
                onRemoveFile={removeFile}
                onRetryFile={retryFile}
                showProgress={true}
              />
            </div>
          )}
        </div>

        {/* Selected Tool */}
        {selectedTool && (
          <div className="max-w-4xl mx-auto px-4 mb-16">
            {renderSelectedTool()}
          </div>
        )}

        {/* Tools Section */}
        {!selectedTool && (
          <div className="max-w-7xl mx-auto px-4 pb-16">
            <ToolsGrid 
              onToolSelect={handleToolSelect}
              disabledTools={completedFiles.length === 0 ? [
                PDFOperationType.MERGE,
                PDFOperationType.COMPRESS,
                PDFOperationType.SPLIT,
                PDFOperationType.ROTATE,
                PDFOperationType.WATERMARK
              ] : []}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;