/**
 * LivePreviewEditor.tsx
 * Интерактивный редактор CSV to PDF с РЕАЛЬНЫМ живым предпросмотром
 * 🆕 ОБНОВЛЕНО: Интеграция FontLanguageSelector для улучшенной поддержки языков
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Save,
  RefreshCw,
  Eye,
  Edit3,
  Palette,
  Settings,
  AlertCircle,
  Globe,
  Type,
  Zap,
  FileText
} from 'lucide-react';

import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';
import { CsvToPdfConverter, CsvToPdfOptions, CsvParseResult } from '../../services/converters/CsvToPdfConverter';
import FontLanguageSelector from './FontLanguageSelector';

interface LivePreviewEditorProps {
  csvFile: File;
  parseResult: CsvParseResult;
  onBack: () => void;
  onExport: (pdfBlob: Blob, filename: string) => void;
  className?: string;
}

interface EditorState {
  currentView: 'edit' | 'style' | 'preview';
  isLoading: boolean;
  detectedLanguage: {
    code: string;
    name: string;
    confidence: number;
    script: string;
  };
  pdfOptions: CsvToPdfOptions & {
    selectedLanguage?: string;
    selectedFont?: string;
  };
  previewState: {
    isGenerating: boolean;
    lastGenerated: Date | null;
    error: string | null;
    warnings: string[];
    pdfUrl: string | null;
  };
}

export const LivePreviewEditor: React.FC<LivePreviewEditorProps> = ({
  csvFile,
  parseResult,
  onBack,
  onExport,
  className = ''
}) => {
  const [editorState, setEditorState] = useState<EditorState>({
    currentView: 'edit',
    isLoading: true,
    detectedLanguage: {
      code: 'auto',
      name: 'Auto-detect',
      confidence: 0.95,
      script: 'latin'
    },
    pdfOptions: {
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
      selectedLanguage: 'auto',
      selectedFont: 'helvetica',
      fontFamily: 'auto' as any
    },
    previewState: {
      isGenerating: false,
      lastGenerated: null,
      error: null,
      warnings: [],
      pdfUrl: null
    }
  });

  // 🔧 Обновление состояния редактора
  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  }, []);

  // 🔧 Обновление PDF опций
  const updatePdfOptions = useCallback((updates: Partial<CsvToPdfOptions & { selectedLanguage?: string; selectedFont?: string }>) => {
    setEditorState(prev => ({
      ...prev,
      pdfOptions: { ...prev.pdfOptions, ...updates }
    }));
    
    // Автоматически обновляем превью при изменении опций
    if (editorState.currentView === 'preview') {
      setTimeout(() => generatePreview(), 500);
    }
  }, [editorState.currentView]);

  // 🆕 Обработчики для FontLanguageSelector
  const handleLanguageChange = useCallback((language: string) => {
    updatePdfOptions({ 
      selectedLanguage: language,
      fontFamily: language === 'ru' ? 'DejaVu' : 'auto'
    });
    
    // Обновляем detected language для отображения
    const languageNames: Record<string, string> = {
      'auto': 'Auto-detect',
      'en': 'English',
      'ru': 'Russian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'pl': 'Polish',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish'
    };
    
    updateEditorState({
      detectedLanguage: {
        code: language,
        name: languageNames[language] || language,
        confidence: 0.95,
        script: language === 'ru' ? 'cyrillic' : 'latin'
      }
    });
  }, [updatePdfOptions, updateEditorState]);

  const handleFontChange = useCallback((font: string) => {
    updatePdfOptions({ 
      selectedFont: font,
      fontFamily: font as any
    });
  }, [updatePdfOptions]);

  // 🚀 РЕАЛЬНАЯ генерация PDF Preview
  const generatePreview = useCallback(async (force = false) => {
    if (editorState.previewState.isGenerating && !force) return;

    updateEditorState({
      previewState: {
        ...editorState.previewState,
        isGenerating: true,
        error: null
      }
    });

    try {
      console.log('🔄 Generating PDF preview with font settings:', {
        selectedLanguage: editorState.pdfOptions.selectedLanguage,
        selectedFont: editorState.pdfOptions.selectedFont,
        fontFamily: editorState.pdfOptions.fontFamily
      });
      
      // Используем реальный CsvToPdfConverter с улучшенными опциями
      const enhancedOptions = {
        ...editorState.pdfOptions,
        title: `${csvFile.name} - ${editorState.detectedLanguage.name}`,
        fontFamily: editorState.pdfOptions.selectedFont as any
      };
      
      const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult, enhancedOptions);
      
      // Создаем URL для предпросмотра
      const blob = new Blob([pdfBytes as Uint8Array], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      
      updateEditorState({
        previewState: {
          isGenerating: false,
          lastGenerated: new Date(),
          error: null,
          warnings: parseResult.errors.map(e => e.message),
          pdfUrl: pdfUrl
        }
      });

      console.log('✅ PDF preview generated successfully with enhanced fonts');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      updateEditorState({
        previewState: {
          ...editorState.previewState,
          isGenerating: false,
          error: `Failed to generate PDF: ${error}`
        }
      });
    }
  }, [editorState.previewState, editorState.pdfOptions, editorState.detectedLanguage, parseResult, updateEditorState, csvFile.name]);

  // 🚀 Экспорт PDF
  const handleExport = useCallback(async () => {
    try {
      const enhancedOptions = {
        ...editorState.pdfOptions,
        title: `${csvFile.name} - ${editorState.detectedLanguage.name}`,
        fontFamily: editorState.pdfOptions.selectedFont as any
      };
      
      const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult, enhancedOptions);
      const blob = new Blob([pdfBytes as Uint8Array], { type: 'application/pdf' });
      const filename = `${csvFile.name.replace(/\.[^/.]+$/, '')}_enhanced_${editorState.detectedLanguage.code}.pdf`;
      
      onExport(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [parseResult, editorState.pdfOptions, editorState.detectedLanguage, csvFile.name, onExport]);

  // 🔧 Инициализация компонента
  useEffect(() => {
    const initializeEditor = async () => {
      // Симуляция детекции языка
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateEditorState({
        isLoading: false,
        detectedLanguage: {
          code: 'auto',
          name: 'Auto-detected',
          confidence: 0.85,
          script: 'latin'
        }
      });

      // Автоматическая генерация первого превью
      setTimeout(() => generatePreview(), 500);
    };

    initializeEditor();
  }, [generatePreview, updateEditorState]);

  // 🔧 Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      if (editorState.previewState.pdfUrl) {
        URL.revokeObjectURL(editorState.previewState.pdfUrl);
      }
    };
  }, [editorState.previewState.pdfUrl]);

  // 🎨 Классы стилей
  const layoutClasses = 'min-h-screen bg-gray-50 flex flex-col';
  const tabClasses = (active: boolean) => `
    px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center
    ${active 
      ? 'bg-blue-600 text-white shadow-sm' 
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }
  `;

  // 🎯 Рендер навигации по табам
  const renderTabNavigation = () => (
    <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border border-gray-200">
      <button
        onClick={() => updateEditorState({ currentView: 'edit' })}
        className={tabClasses(editorState.currentView === 'edit')}
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Edit Data
      </button>
      <button
        onClick={() => updateEditorState({ currentView: 'style' })}
        className={tabClasses(editorState.currentView === 'style')}
      >
        <Palette className="w-4 h-4 mr-2" />
        Style
      </button>
      <button
        onClick={() => {
          updateEditorState({ currentView: 'preview' });
          // Генерируем превью при переходе на таб
          setTimeout(() => generatePreview(), 100);
        }}
        className={tabClasses(editorState.currentView === 'preview')}
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview
        {editorState.previewState.isGenerating && (
          <Spinner size="sm" className="ml-2 w-3 h-3" />
        )}
      </button>
    </div>
  );

  // 🎯 Рендер панели статистики
  const renderStatsPanel = () => (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-2xl font-bold text-blue-600">{parseResult.rowCount}</div>
            <div className="text-sm text-blue-700">Rows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{parseResult.columnCount}</div>
            <div className="text-sm text-blue-700">Columns</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.ceil(parseResult.rowCount / 20)}
            </div>
            <div className="text-sm text-blue-700">Est. Pages</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Live Preview Ready</span>
        </div>
      </div>
    </Card>
  );

  // 🆕 Рендер информации о языке (обновлено)
  const renderLanguageInfo = () => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-medium text-gray-900">Language Detection</h3>
            <p className="text-sm text-gray-600">
              Active: {editorState.detectedLanguage.name} 
              ({(editorState.detectedLanguage.confidence * 100).toFixed(0)}% confidence)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="success">
            <Type className="w-3 h-3 mr-1" />
            {editorState.pdfOptions.selectedFont || 'Auto Font'}
          </Badge>
        </div>
      </div>
    </Card>
  );

  // 🎯 Рендер быстрых настроек стиля
  const renderQuickStylePanel = () => (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Style Options</h3>
      
      {/* Ориентация страницы */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Page Orientation</label>
        <div className="flex space-x-2">
          {(['portrait', 'landscape'] as const).map(orientation => (
            <button
              key={orientation}
              onClick={() => updatePdfOptions({ orientation })}
              className={`
                flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all
                ${editorState.pdfOptions.orientation === orientation
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Размер страницы */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
        <div className="flex space-x-2">
          {(['a4', 'letter', 'legal'] as const).map(size => (
            <button
              key={size}
              onClick={() => updatePdfOptions({ pageSize: size })}
              className={`
                flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all
                ${editorState.pdfOptions.pageSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Размер шрифта */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
        <div className="flex space-x-2">
          {[6, 8, 10, 12].map(size => (
            <button
              key={size}
              onClick={() => updatePdfOptions({ fontSize: size })}
              className={`
                flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all
                ${editorState.pdfOptions.fontSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {size}pt
            </button>
          ))}
        </div>
      </div>
    </Card>
  );

  // 🔧 ИСПРАВЛЕННЫЙ рендер предпросмотра данных
  const renderDataPreview = () => {
    // Используем данные напрямую из parseResult
    const previewData = parseResult.preview && parseResult.preview.length > 0 
      ? parseResult.preview 
      : parseResult.data.slice(0, 5);

    const headers = parseResult.headers;

    if (!previewData || previewData.length === 0) {
      return (
        <div className="text-gray-600 text-center py-8">
          📄 No preview data available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[header] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {parseResult.rowCount > previewData.length && (
          <div className="mt-4 text-center text-sm text-gray-500">
            ... and {parseResult.rowCount - previewData.length} more rows
          </div>
        )}
      </div>
    );
  };

  // 🎯 Основной рендер контента
  const renderMainContent = () => {
    switch (editorState.currentView) {
      case 'edit':
        return (
          <div className="space-y-6">
            {renderStatsPanel()}
            {renderLanguageInfo()}
            
            {/* 🆕 Font & Language Selector */}
            <FontLanguageSelector
              csvData={parseResult.data}
              headers={parseResult.headers}
              selectedLanguage={editorState.pdfOptions.selectedLanguage}
              selectedFont={editorState.pdfOptions.selectedFont}
              onLanguageChange={handleLanguageChange}
              onFontChange={handleFontChange}
            />
            
            {/* Предпросмотр данных */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Data Preview</h3>
              {renderDataPreview()}
            </Card>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-6">
            {renderLanguageInfo()}
            
            {/* 🆕 Font & Language Selector in Style Tab */}
            <FontLanguageSelector
              csvData={parseResult.data}
              headers={parseResult.headers}
              selectedLanguage={editorState.pdfOptions.selectedLanguage}
              selectedFont={editorState.pdfOptions.selectedFont}
              onLanguageChange={handleLanguageChange}
              onFontChange={handleFontChange}
            />
            
            {renderQuickStylePanel()}
            
            {/* Расширенные настройки стиля */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Table Style</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Table Style</label>
                  <select 
                    value={editorState.pdfOptions.tableStyle}
                    onChange={(e) => updatePdfOptions({ tableStyle: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="grid">Grid</option>
                    <option value="striped">Striped</option>
                    <option value="plain">Plain</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                  <select 
                    value={editorState.pdfOptions.headerStyle}
                    onChange={(e) => updatePdfOptions({ headerStyle: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="bold">Bold</option>
                    <option value="colored">Colored</option>
                    <option value="simple">Simple</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="fitToPage"
                  checked={editorState.pdfOptions.fitToPage}
                  onChange={(e) => updatePdfOptions({ fitToPage: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="fitToPage" className="text-sm text-gray-700">
                  Fit table to page width
                </label>
              </div>
            </Card>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {/* PDF Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">PDF Preview</h3>
                <div className="flex items-center space-x-2">
                  {editorState.previewState.isGenerating && (
                    <Spinner size="sm" className="text-blue-600" />
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => generatePreview(true)}
                    disabled={editorState.previewState.isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {editorState.previewState.error ? (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-red-700">{editorState.previewState.error}</span>
                </div>
              ) : editorState.previewState.pdfUrl ? (
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={editorState.previewState.pdfUrl}
                    className="w-full h-96 border-0"
                    title="PDF Preview"
                  />
                </div>
              ) : editorState.previewState.isGenerating ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Spinner size="lg" className="text-blue-600" />
                    <div className="text-gray-600">
                      🔄 Generating PDF preview with {editorState.detectedLanguage.name} support...
                      <br />
                      <span className="text-sm">Font: {editorState.pdfOptions.selectedFont}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-gray-600 py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    Click "Refresh" to generate PDF preview
                    <br />
                    <span className="text-sm">Live preview will appear here</span>
                  </div>
                </div>
              )}

              {editorState.previewState.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {editorState.previewState.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // 🎯 Главный рендер
  return (
    <div className={`${layoutClasses} ${className}`}>
      {/* Заголовок с навигацией */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {csvFile.name}
              </h1>
              <p className="text-sm text-gray-500">
                Interactive CSV to PDF Editor • {editorState.detectedLanguage.name} • {editorState.pdfOptions.selectedFont}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {editorState.previewState.lastGenerated && (
              <div className="text-sm text-gray-500">
                Last updated: {editorState.previewState.lastGenerated.toLocaleTimeString()}
              </div>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              className="hidden md:flex"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={editorState.previewState.isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6">
        {editorState.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Analyzing CSV and detecting language...</span>
          </div>
        ) : (
          <>
            {renderTabNavigation()}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={editorState.currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default LivePreviewEditor;