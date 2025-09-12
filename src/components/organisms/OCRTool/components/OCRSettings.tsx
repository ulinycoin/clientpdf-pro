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
  onDownload: () => void;
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

        {/* Output Format */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            {t('tools.ocr.settings.outputFormat') || 'Output Format'}
          </h4>
          
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="outputFormat"
                value="text"
                checked={options.outputFormat === 'text'}
                onChange={(e) => onOptionsChange({ outputFormat: 'text' })}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{t('tools.ocr.settings.plainText') || 'Plain Text (.txt)'}</div>
                <div className="text-xs text-gray-500">{t('tools.ocr.settings.plainTextDesc') || 'Extract text only'}</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="outputFormat"
                value="searchable-pdf"
                checked={options.outputFormat === 'searchable-pdf'}
                onChange={(e) => onOptionsChange({ outputFormat: 'searchable-pdf' })}
                className="mr-3"
              />
              <div>
                <div className="font-medium">{t('tools.ocr.settings.searchablePdf') || 'Searchable PDF'}</div>
                <div className="text-xs text-gray-500">{t('tools.ocr.settings.searchablePdfDesc') || 'PDF with searchable text layer'}</div>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="outputFormat"
                value="docx"
                checked={options.outputFormat === 'docx'}
                onChange={(e) => onOptionsChange({ outputFormat: 'docx' })}
                className="mr-3"
              />
              <div>
                <div className="font-medium">📄 Word Document (.docx)</div>
                <div className="text-xs text-gray-500">Microsoft Word format with formatting</div>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="outputFormat"
                value="rtf"
                checked={options.outputFormat === 'rtf'}
                onChange={(e) => onOptionsChange({ outputFormat: 'rtf' })}
                className="mr-3"
              />
              <div>
                <div className="font-medium">📝 Rich Text (.rtf)</div>
                <div className="text-xs text-gray-500">Universal format for all text editors</div>
              </div>
            </label>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            {t('tools.ocr.settings.advancedOptions') || 'Advanced Options'}
          </h4>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.preserveLayout}
                onChange={(e) => onOptionsChange({ preserveLayout: e.target.checked })}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">{t('tools.ocr.settings.preserveLayout') || 'Preserve Layout'}</div>
                <div className="text-xs text-gray-500">{t('tools.ocr.settings.preserveLayoutDesc') || 'Maintain document structure'}</div>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.imagePreprocessing}
                onChange={(e) => onOptionsChange({ imagePreprocessing: e.target.checked })}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">{t('tools.ocr.settings.imagePreprocessing') || 'Image Preprocessing'}</div>
                <div className="text-xs text-gray-500">{t('tools.ocr.settings.imagePreprocessingDesc') || 'Enhance image quality'}</div>
              </div>
            </label>

            {/* Selection-only processing option removed - simplified interface */}
          </div>
        </div>

        {/* Results Summary */}
        {result && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">{t('tools.ocr.results.title') || 'Results Summary'}</h4>
            
            <div className="bg-green-50 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-800">{t('tools.ocr.results.processingTime') || 'Processing Time'}</div>
                  <div className="text-green-600">{((result.processingTime || 0) / 1000).toFixed(1)}s</div>
                </div>
                <div>
                  <div className="font-medium text-green-800">{t('tools.ocr.results.confidence') || 'Confidence'}</div>
                  <div className="text-green-600">{(result.result.confidence || 0).toFixed(1)}%</div>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-green-800">{t('tools.ocr.results.wordsFound') || 'Words Found'}</div>
                <div className="text-green-600">{result.result.words?.length || 0}</div>
              </div>
            </div>
          </div>
        )}
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

        {/* Download Button */}
        {result && (
          <Button
            onClick={onDownload}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
{(() => {
              switch (options.outputFormat) {
                case 'text':
                  return t('tools.ocr.buttons.downloadText') || 'Download Text';
                case 'searchable-pdf':
                  return t('tools.ocr.buttons.downloadPdf') || 'Download PDF';
                case 'docx':
                  return t('tools.ocr.buttons.downloadDocx') || 'Download Word';
                case 'rtf':
                  return t('tools.ocr.buttons.downloadRtf') || 'Download RTF';
                default:
                  return t('tools.ocr.buttons.downloadFile') || 'Download';
              }
            })()}
          </Button>
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