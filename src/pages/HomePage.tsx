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
  ExtractPagesTool,
  OCRTool
} from '../components/organisms';
import ImageToPDFTool from '../components/organisms/ImageToPDFTool';
import { WordToPDFTool } from '../features/word-to-pdf';
import FileUploadZone from '../components/molecules/FileUploadZone';
import PrivacyBadge from '../components/molecules/PrivacyBadge';
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
      scrollToTop(100);
    }
  }, [selectedTool]);

  const handleFileSelect = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
  };

  const handleToolSelect = (toolType: string) => {
    setSelectedTool(toolType);
  };

  const handleCloseTool = () => {
    setSelectedTool(null);
    scrollToTop(150);
  };

  const handleToolComplete = (result: PDFProcessingResult | PDFProcessingResult[]) => {
    if (Array.isArray(result)) {
      result.forEach((res, index) => {
        if (res.success && res.data) {
          const filename = generateFilename(
            files[0]?.name || 'processed',
            `${selectedTool}_part_${index + 1}`,
            'pdf'
          );
          downloadBlob(res.data, filename);
        }
      });
    } else {
      if (result.success && result.data) {
        if (selectedTool !== 'extract-text' &&
            selectedTool !== 'pdf-to-image' &&
            selectedTool !== 'extract-pages' &&
            selectedTool !== 'add-text' &&
            selectedTool !== 'images-to-pdf') {
          const toolName = selectedTool || 'processed';
          const filename = generateFilename(
            files[0]?.name || 'processed',
            toolName,
            'pdf'
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
        return <AddTextTool files={files} onComplete={handleToolComplete} onClose={handleCloseTool} />;
      case 'pdf-to-image':
        return <PdfToImageTool onClose={handleCloseTool} initialFile={files[0]} />;
      case 'extract-pages':
        return <ExtractPagesTool {...props} />;
      case 'images-to-pdf':
        return <ImageToPDFTool {...props} />;
      case 'word-to-pdf':
        return <WordToPDFTool />;
      case 'ocr-pdf':
        return <OCRTool />;
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
    <div className="min-h-screen bg-gradient-mesh">
      <Header />

      <main className="flex-grow pt-20">
        {/* Enhanced Hero Section - only show when no tool is selected */}
        {!selectedTool && (
          <>
            {/* Floating particles background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
              <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute -bottom-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-20">
              {/* Main Hero Section */}
              <div className="text-center mb-20">
                {/* Animated badge */}
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full px-6 py-2 mb-8 animate-fade-in">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">100% Приватная обработка • Без загрузки на сервер</span>
                </div>

                {/* Main title with enhanced styling */}
                <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-glow">
                    LocalPDF
                  </span>
                  <span className="block text-4xl md:text-5xl font-bold text-secondary-700 mt-4">
                    Профессиональные PDF инструменты
                  </span>
                </h1>

                {/* Enhanced description */}
                <div className="max-w-4xl mx-auto mb-12">
                  <p className="text-xl md:text-2xl text-secondary-600 mb-6 leading-relaxed">
                    Мощные инструменты для работы с PDF, которые работают <br/>
                    <span className="font-bold text-blue-600">полностью в вашем браузере</span>
                  </p>
                  
                  {/* Feature highlights with icons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-center space-x-3 p-4 glass rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                        🔒
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-secondary-800">Полная приватность</div>
                        <div className="text-sm text-secondary-600">Файлы не покидают ваше устройство</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3 p-4 glass rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                        ⚡
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-secondary-800">Мгновенная обработка</div>
                        <div className="text-sm text-secondary-600">Без задержек сервера</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3 p-4 glass rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                        💎
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-secondary-800">Полностью бесплатно</div>
                        <div className="text-sm text-secondary-600">Без ограничений навсегда</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button 
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
                    <span className="relative">Начать работу</span>
                    <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  <a 
                    href="https://github.com/ulinycoin/clientpdf-pro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 text-secondary-700 hover:text-secondary-900 font-medium rounded-xl hover:bg-white/50 transition-all duration-200"
                  >
                    <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Открытый код
                  </a>
                </div>
              </div>

              {/* File Upload Section */}
              <div id="upload-section" className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-secondary-800 mb-4">
                    🚀 Загрузите файлы для начала работы
                  </h2>
                  <p className="text-lg text-secondary-600">
                    Поддерживаются PDF файлы до 100MB • Обработка происходит локально
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
                <div className="mb-16">
                  <div className="glass rounded-3xl shadow-large border border-white/30 p-8 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-secondary-800 flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">✓</span>
                        </div>
                        <span>Готово к обработке ({files.length} файл{files.length !== 1 ? (files.length < 5 ? 'а' : 'ов') : ''})</span>
                      </h3>
                      <button
                        onClick={clearFiles}
                        className="px-4 py-2 text-error-600 hover:text-white hover:bg-error-600 border border-error-300 hover:border-error-600 rounded-xl transition-all duration-200 font-medium"
                      >
                        Очистить все
                      </button>
                    </div>
                    <div className="space-y-4">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-white/60 rounded-2xl border border-white/40 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <span className="text-white text-2xl">📄</span>
                            </div>
                            <div>
                              <p className="font-semibold text-secondary-900 text-lg">{file.name}</p>
                              <p className="text-secondary-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF документ
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="px-4 py-2 text-error-600 hover:text-white hover:bg-error-600 border border-error-200 hover:border-error-600 rounded-xl transition-all duration-200"
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tool Interface */}
        {selectedTool && (
          <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
            {renderSelectedTool()}
          </div>
        )}

        {/* Enhanced Tools Grid */}
        {!selectedTool && (
          <div className="relative max-w-7xl mx-auto px-4 pb-20">
            <ToolsGrid
              onToolSelect={handleToolSelect}
              disabledTools={[]}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;