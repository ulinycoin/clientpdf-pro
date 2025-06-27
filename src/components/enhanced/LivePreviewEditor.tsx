import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Eye, 
  Settings, 
  Download, 
  RefreshCw, 
  Languages,
  Palette,
  Edit3,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  CheckCircle,
  Loader,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import existing services
import { CsvToPdfConverter, CsvParseResult, CsvToPdfOptions } from '../../services/converters/CsvToPdfConverter';
import { EnhancedUnicodeFontService } from '../../services/EnhancedUnicodeFontService';

// Enhanced types
interface EnhancedCsvToPdfOptions extends CsvToPdfOptions {
  language?: string;
  autoDetectLanguage?: boolean;
  preserveUnicode?: boolean;
  theme?: 'professional' | 'modern' | 'minimal' | 'colorful';
}

interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  script: 'latin' | 'cyrillic' | 'arabic' | 'cjk';
  direction: 'ltr' | 'rtl';
  recommendedFont: string;
  preserveUnicode: boolean;
}

interface PreviewState {
  isGenerating: boolean;
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  pageCount: number;
  currentPage: number;
  zoom: number;
  error: string | null;
}

interface Props {
  parseResult: CsvParseResult;
  onDataChange: (data: CsvParseResult) => void;
  onExport: (blob: Blob) => void;
  className?: string;
}

const SUPPORTED_LANGUAGES = {
  'auto': 'Auto-detect',
  'en': 'English',
  'ru': 'Русский',
  'lv': 'Latviešu', 
  'lt': 'Lietuvių',
  'et': 'Eesti',
  'pl': 'Polski',
  'de': 'Deutsch',
  'fr': 'Français',
  'es': 'Español'
};

const FONT_OPTIONS = [
  { id: 'auto', name: 'Auto-select', supportsUnicode: true },
  { id: 'times', name: 'Times Roman', supportsUnicode: true },
  { id: 'helvetica', name: 'Helvetica', supportsUnicode: false },
  { id: 'courier', name: 'Courier', supportsUnicode: true }
];

export const LivePreviewEditor: React.FC<Props> = ({ 
  parseResult, 
  onDataChange, 
  onExport,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'style' | 'preview'>('preview');
  const [options, setOptions] = useState<EnhancedCsvToPdfOptions>({
    orientation: 'landscape',
    pageSize: 'legal',
    fontSize: 8,
    tableStyle: 'grid',
    headerStyle: 'bold',
    fitToPage: true,
    includeRowNumbers: false,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    fontFamily: 'auto',
    language: 'auto',
    autoDetectLanguage: true,
    preserveUnicode: true
  });

  const [previewState, setPreviewState] = useState<PreviewState>({
    isGenerating: false,
    pdfBlob: null,
    pdfUrl: null,
    pageCount: 0,
    currentPage: 1,
    zoom: 1.0,
    error: null
  });

  const [languageDetection, setLanguageDetection] = useState<LanguageDetectionResult | null>(null);
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [localData, setLocalData] = useState(parseResult.data);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const detectLanguageFromData = useCallback(async () => {
    if (!options.autoDetectLanguage) return;

    try {
      console.log('🔍 Detecting language from CSV data...');
      
      const sampleTexts = [
        ...parseResult.headers,
        ...parseResult.data.slice(0, 5).flatMap(row => 
          Object.values(row).map(v => String(v || '')).filter(text => text.length > 2)
        )
      ];

      const combinedText = sampleTexts.join(' ').substring(0, 1000);
      const analysis = EnhancedUnicodeFontService.analyzeText(combinedText);
      
      let detectedLanguage = 'en';
      let script: 'latin' | 'cyrillic' | 'arabic' | 'cjk' = 'latin';
      let confidence = 0.5;

      if (analysis.hasCyrillic) {
        detectedLanguage = 'ru';
        script = 'cyrillic';
        confidence = 0.9;
      } else if (analysis.detectedLanguages.includes('lv')) {
        detectedLanguage = 'lv';
        confidence = 0.8;
      }

      const detection: LanguageDetectionResult = {
        detectedLanguage,
        confidence,
        script,
        direction: 'ltr',
        recommendedFont: analysis.recommendedFont,
        preserveUnicode: script === 'cyrillic' || analysis.hasLatinExtended
      };

      setLanguageDetection(detection);
      
      setOptions(prev => ({
        ...prev,
        language: detectedLanguage,
        fontFamily: analysis.recommendedFont,
        preserveUnicode: detection.preserveUnicode
      }));

      toast.success(`Language detected: ${SUPPORTED_LANGUAGES[detectedLanguage as keyof typeof SUPPORTED_LANGUAGES]}`);

    } catch (error) {
      console.error('❌ Language detection failed:', error);
    }
  }, [parseResult, options.autoDetectLanguage]);

  const generatePreview = useCallback(async () => {
    if (!parseResult.data.length) return;

    setPreviewState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));

    try {
      console.log('🎨 Generating PDF preview...');
      
      const pdfBytes = await CsvToPdfConverter.convertToPDF(
        { ...parseResult, data: localData },
        options
      );

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPreviewState(prev => ({
        ...prev,
        pdfBlob: blob,
        pdfUrl: url,
        isGenerating: false,
        pageCount: 1
      }));

      console.log('✅ PDF preview generated successfully');

    } catch (error) {
      console.error('❌ PDF preview generation failed:', error);
      setPreviewState(prev => ({
        ...prev,
        isGenerating: false,
        error: `Preview generation failed: ${error}`
      }));
      toast.error('Failed to generate preview');
    }
  }, [parseResult, localData, options]);

  const handleCellEdit = useCallback((rowIndex: number, columnKey: string, newValue: string) => {
    const updatedData = [...localData];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [columnKey]: newValue };
    setLocalData(updatedData);
    
    setTimeout(() => {
      onDataChange({ ...parseResult, data: updatedData });
    }, 500);
  }, [localData, parseResult, onDataChange]);

  const handleExport = useCallback(() => {
    if (previewState.pdfBlob) {
      onExport(previewState.pdfBlob);
      toast.success('PDF exported successfully!');
    } else {
      toast.error('No PDF available for export');
    }
  }, [previewState.pdfBlob, onExport]);

  useEffect(() => {
    detectLanguageFromData();
  }, [detectLanguageFromData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [localData, options]);

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex space-x-1">
            {[
              { id: 'edit', label: 'Edit Data', icon: Edit3 },
              { id: 'style', label: 'Style', icon: Palette },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {languageDetection && (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {SUPPORTED_LANGUAGES[languageDetection.detectedLanguage as keyof typeof SUPPORTED_LANGUAGES]}
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={!previewState.pdfBlob}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-6"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Data Editor
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on any cell to edit. Changes update the preview automatically.
                  </p>
                </div>
                <div className="overflow-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        {parseResult.headers.map((header, index) => (
                          <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {localData.slice(0, 20).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {parseResult.headers.map((header, colIndex) => (
                            <td key={colIndex} className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                              {editingCell?.row === rowIndex && editingCell?.col === header ? (
                                <input
                                  type="text"
                                  value={String(row[header] || '')}
                                  onChange={(e) => handleCellEdit(rowIndex, header, e.target.value)}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingCell(null);
                                  }}
                                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingCell({ row: rowIndex, col: header })}
                                  className="text-sm text-gray-900 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded min-h-[1.5rem]"
                                  title="Click to edit"
                                >
                                  {String(row[header] || '')}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-6 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Languages className="w-5 h-5 mr-2" />
                    Language & Font
                  </h3>
                  
                  {languageDetection && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">Auto-detected:</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        Language: <strong>{SUPPORTED_LANGUAGES[languageDetection.detectedLanguage as keyof typeof SUPPORTED_LANGUAGES]}</strong> 
                        ({Math.round(languageDetection.confidence * 100)}% confidence)
                      </p>
                      <p className="text-sm text-blue-800">
                        Script: <strong>{languageDetection.script}</strong>, 
                        Recommended font: <strong>{languageDetection.recommendedFont}</strong>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={options.language || 'auto'}
                        onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                          <option key={code} value={code}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={options.fontFamily || 'auto'}
                        onChange={(e) => setOptions(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.name} {font.supportsUnicode ? '(Unicode)' : '(Basic)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Palette className="w-5 h-5 mr-2" />
                    Table Style
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Table Style
                      </label>
                      <select
                        value={options.tableStyle}
                        onChange={(e) => setOptions(prev => ({ ...prev, tableStyle: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="grid">Grid (with borders)</option>
                        <option value="striped">Striped rows</option>
                        <option value="minimal">Minimal</option>
                        <option value="plain">Plain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size: {options.fontSize}pt
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="16"
                        value={options.fontSize}
                        onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Settings className="w-5 h-5 mr-2" />
                    Page Layout
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Orientation
                      </label>
                      <select
                        value={options.orientation}
                        onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="landscape">Landscape (Recommended)</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Size
                      </label>
                      <select
                        value={options.pageSize}
                        onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="a4">A4</option>
                        <option value="a3">A3</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal (Best for tables)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-6"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      PDF Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={generatePreview}
                        disabled={previewState.isGenerating}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {previewState.isGenerating ? (
                          <Loader className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-1" />
                        )}
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 h-full">
                  {previewState.error ? (
                    <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-red-800 font-medium">Preview Error</p>
                        <p className="text-red-600 text-sm mt-1">{previewState.error}</p>
                        <button
                          onClick={generatePreview}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : previewState.isGenerating ? (
                    <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-center">
                        <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-700 font-medium">Generating Preview...</p>
                        <p className="text-gray-600 text-sm mt-1">Processing with enhanced fonts</p>
                      </div>
                    </div>
                  ) : previewState.pdfUrl ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-full">
                      <iframe
                        src={previewState.pdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-center">
                        <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No preview available</p>
                        <button
                          onClick={generatePreview}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Generate Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {parseResult.reportTitle || 'Interactive CSV to PDF Editor'}
            </span>
            {languageDetection && (
              <span className="flex items-center">
                <Languages className="w-3 h-3 mr-1" />
                {languageDetection.detectedLanguage.toUpperCase()} 
                ({Math.round(languageDetection.confidence * 100)}%)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {previewState.isGenerating && (
              <span className="flex items-center text-blue-600">
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </span>
            )}
            <span>
              Font: {options.fontFamily === 'auto' ? 'Auto-selected' : options.fontFamily}
            </span>
            <span>
              {options.orientation} • {options.pageSize.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewEditor;