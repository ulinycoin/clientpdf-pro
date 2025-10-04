import React from 'react';
import { Settings, FileText, Languages, Download, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../../atoms/Button';
import { useTranslation } from '../../../../hooks/useI18n';
import { OCROptions, SupportedLanguage, ProcessedOCRResult, OCRError } from '../../../../types/ocr.types';

// SelectionArea interface removed - no longer needed

interface LanguageDetectionResult {
  language: string;
  confidence: 'high' | 'medium' | 'low';
  details: string;
  detectionMethods: string[];
}

interface OCRSettingsProps {
  // File info
  selectedFile: File | null;
  fileInfo: { isSupported: boolean; type: string; message: string } | null;
  
  // OCR options
  options: OCROptions;
  supportedLanguages: SupportedLanguage[];
  onOptionsChange: (options: Partial<OCROptions>) => void;
  
  // Language detection
  languageDetection: LanguageDetectionResult | null;
  isAnalyzing: boolean;
  
  // Processing
  isProcessing: boolean;
  progress: any;
  result: ProcessedOCRResult | null;
  error: OCRError | null;
  
  // Actions
  onProcess: () => void;
  onDownload: (format?: string) => void;
  onReset: () => void;
  
  className?: string;
}

const OCRSettings: React.FC<OCRSettingsProps> = ({
  selectedFile,
  fileInfo,
  options,
  supportedLanguages,
  onOptionsChange,
  languageDetection,
  isAnalyzing,
  isProcessing,
  progress,
  result,
  error,
  onProcess,
  onDownload,
  onReset,
  className = ''
}) => {
  const { t } = useTranslation();

  const currentLanguage = supportedLanguages.find(lang => lang.code === options.language);

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full ${className}`} style={{ width: '320px' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          {t('tools.ocr.settings.title') || 'OCR Settings'}
        </h3>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* File Information */}
        {selectedFile && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('tools.ocr.fileInfo.title') || 'File Information'}
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">{t('tools.ocr.fileInfo.name') || 'Name'}:</span>
                <span className="ml-2 text-gray-600">{selectedFile.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t('tools.ocr.fileInfo.size') || 'Size'}:</span>
                <span className="ml-2 text-gray-600">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
              
              {fileInfo && (
                <div className={`flex items-center gap-2 text-sm ${
                  fileInfo.isSupported ? 'text-green-600' : 'text-red-600'
                }`}>
                  {fileInfo.isSupported ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {fileInfo.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selection Area section removed - simplified interface */}


        {/* Language Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {t('tools.ocr.settings.language') || 'OCR Language'}
          </h4>
          
          <select
            value={options.language}
            onChange={(e) => onOptionsChange({ language: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {t('tools.ocr.settings.languageDescription') || 'Choose the primary language of your document for better accuracy'}
          </p>
        </div>


        {/* Advanced Options section removed - these settings had no effect:
            - preserveLayout: Never used in Tesseract.js configuration
            - imagePreprocessing: Always enabled by default, checkbox was misleading
            Smart OCR handles everything automatically now. */}

      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Process Button */}
        {selectedFile && fileInfo?.isSupported && !isProcessing && !result && (
          <Button
            onClick={onProcess}
            disabled={!selectedFile || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <FileText className="w-5 h-5 mr-2" />
            {t('tools.ocr.buttons.extractText') || 'Extract Text with OCR'}
          </Button>
        )}

        {/* Download Dropdown */}
        {result && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tools.ocr.results.downloadTitle') || 'Download Results'}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onDownload(e.target.value);
                  e.target.value = ''; // Reset selection
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
              defaultValue=""
            >
              <option value="" disabled>
                📥 {t('tools.ocr.buttons.downloadFormat') || 'Choose Download Format'}
              </option>
              <option value="searchable-pdf">
                📄 {t('tools.ocr.buttons.downloadPdf') || 'PDF (Searchable)'}
              </option>
              <option value="text">
                📝 {t('tools.ocr.buttons.downloadText') || 'Text File (.txt)'}
              </option>
              <option value="docx">
                📘 {t('tools.ocr.buttons.downloadDocx') || 'Word Document (.docx)'}
              </option>
              <option value="rtf">
                📋 {t('tools.ocr.buttons.downloadRtf') || 'Rich Text (.rtf)'}
              </option>
              <option value="json">
                🔧 {t('tools.ocr.buttons.downloadJson') || 'JSON Data (.json)'}
              </option>
              <option value="markdown">
                ✍️ {t('tools.ocr.buttons.downloadMarkdown') || 'Markdown (.md)'}
              </option>
            </select>
          </div>
        )}

        {/* Reset Button */}
        {(selectedFile || result) && (
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            {t('tools.ocr.buttons.processAnother') || 'Process Another File'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OCRSettings;