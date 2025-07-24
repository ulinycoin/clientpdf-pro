import React, { useRef, useState } from 'react';
import { FileText, Download, AlertCircle, CheckCircle, Eye, Settings } from 'lucide-react';
import { useWordToPDF } from '../hooks/useWordToPDF';
import { ConversionSettings } from '../types/wordToPdf.types';
import { ConversionSettingsPanel } from './ConversionSettingsPanel';
import { PDFPreview } from './PDFPreview';

export const WordToPDFTool: React.FC = () => {
  // All useState hooks first, in consistent order - never change this order!
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    pageSize: 'A4',
    embedFonts: true,
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: 12,
    compression: false
  });

  // useRef hook - always in the same position
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom hook - always call in the same position, destructure all values safely
  const hookResult = useWordToPDF();
  const isConverting = hookResult.isConverting;
  const result = hookResult.result;
  const previewMode = hookResult.previewMode;
  const convertFile = hookResult.convertFile;
  const downloadPDF = hookResult.downloadPDF;
  const regenerateWithSettings = hookResult.regenerateWithSettings;
  const togglePreviewMode = hookResult.togglePreviewMode;
  const reset = hookResult.reset;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setShowPreview(false);
      reset();
    }
  };

  const handleClick = () => {
    reset();
    setCurrentFile(null);
    setShowPreview(false);
    fileInputRef.current?.click();
  };

  const handleConvert = async () => {
    if (!currentFile) return;

    // Convert without auto-download to show preview first
    await convertFile(currentFile, settings, false);
    setShowPreview(true);  // Автоматически показываем предпросмотр после конвертации
  };

  const handleDownload = async () => {
    if (currentFile) {
      await downloadPDF(currentFile.name);
    }
  };

  const handleSettingsChange = async (newSettings: ConversionSettings) => {
    setSettings(newSettings);

    // If we have a file and result, regenerate with new settings
    if (currentFile && result?.success) {
      await regenerateWithSettings(currentFile, newSettings);
      // Сохраняем состояние предпросмотра при регенерации
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Panel - Upload and Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Word to PDF</h2>
              <p className="text-gray-600">Convert Word documents to PDF format</p>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={handleClick}
                disabled={isConverting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isConverting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Converting...
                  </span>
                ) : currentFile ? (
                  `Change File (Current: ${currentFile.name.slice(0, 30)}${currentFile.name.length > 30 ? '...' : ''})`
                ) : (
                  'Choose Word Document (.docx)'
                )}
              </button>
            </div>

            {/* Selected File Info */}
            {currentFile && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{currentFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round(currentFile.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentFile(null);
                      setShowPreview(false);
                      reset();
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    disabled={isConverting}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Convert Button - Always visible */}
            <div className="mb-6">
              <button
                onClick={handleConvert}
                disabled={!currentFile || isConverting}
                className={`w-full py-3 px-4 font-medium rounded-lg transition-colors ${
                  !currentFile || isConverting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Converting...
                  </span>
                ) : !currentFile ? (
                  'Select a file to convert'
                ) : (
                  'Convert to PDF'
                )}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mb-6">
                {result.success ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                          <p className="text-green-800 font-medium">Conversion successful!</p>
                          <p className="text-green-600 text-sm">
                            PDF ready ({result.pdfBytes ? Math.round(result.pdfBytes.length / 1024) : '0'} KB)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePreviewToggle}
                          className="flex items-center gap-2 px-3 py-1.5 text-green-700 hover:bg-green-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {showPreview ? 'Hide' : 'Preview'}
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-red-800 font-medium">Conversion failed</p>
                      <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="text-sm text-gray-500 text-center space-y-2">
              <div>
                <p className="font-medium text-gray-700">Supported format:</p>
                <p>Microsoft Word (.docx only)</p>
                <p>Maximum file size: 50MB</p>
              </div>
              <div className="text-xs">
                <p>✓ Works with .docx files from Microsoft Word</p>
                <p>✓ Works with .docx files from Google Docs</p>
                <p>⚠️ .doc files need to be converted to .docx first</p>
                <p>✓ Processing happens locally in your browser</p>
              </div>
            </div>
          </div>

          {/* Conversion Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ConversionSettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              isVisible={showSettings}
              onToggle={() => setShowSettings(!showSettings)}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {showPreview ? (
              <PDFPreview
                pdfBytes={result?.success ? result.pdfBytes || null : null}
                fileName={currentFile?.name || 'document.pdf'}
                onDownload={handleDownload}
                isGenerating={isConverting}
                onRegenerate={currentFile ? () => handleConvert() : undefined}
              />
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">PDF Preview</p>
                <p className="text-sm">Convert a document to see preview here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
