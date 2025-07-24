import React, { useRef } from 'react';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useWordToPDF } from '../hooks/useWordToPDF';

export const WordToPDFTool: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConverting, result, convertFile, reset } = useWordToPDF();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      convertFile(file);
    }
  };

  const handleClick = () => {
    reset();
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
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
          ) : (
            'Choose Word Document'
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mb-4">
          {result.success ? (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-green-800 font-medium">Conversion successful!</p>
                <p className="text-green-600 text-sm">PDF downloaded automatically</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
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
  );
};
