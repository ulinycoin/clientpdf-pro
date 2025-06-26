/**
 * LivePreviewEditor.tsx
 * Основной интерактивный редактор CSV to PDF с живым предпросмотром
 * Интегрируется с существующей архитектурой ClientPDF Pro
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit3, 
  Palette, 
  Download, 
  Settings, 
  Languages,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Maximize2,
  Minimize2,
  Split,
  Type,
  ArrowLeft,
  Save,
  Share2
} from 'lucide-react';

// Импорты типов
import { 
  EnhancedCSVEditorState, 
  EnhancedCsvToPdfOptions,
  LivePreviewState,
  DataTableState,
  LanguageDetectionResult,
  FontRecommendation,
  DEFAULT_ENHANCED_OPTIONS
} from '../../types/enhanced-csv-pdf.types';

import { CsvParseResult } from '../../services/converters/CsvToPdfConverter';

// Импорты сервисов
import { MultiLanguageFontService } from '../../services/fontManager/MultiLanguageFontService';
import { EnhancedUnicodeFontService } from '../../services/EnhancedUnicodeFontService';

// Компоненты UI
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';

interface LivePreviewEditorProps {
  csvFile: File;
  parseResult: CsvParseResult;
  onBack: () => void;
  onExport: (pdfBlob: Blob, filename: string) => void;
  className?: string;
}

export const LivePreviewEditor: React.FC<LivePreviewEditorProps> = ({
  csvFile,
  parseResult,
  onBack,
  onExport,
  className = ''
}) => {
  // 🎯 Основное состояние редактора
  const [editorState, setEditorState] = useState<EnhancedCSVEditorState>(() => ({
    csvFile,
    parseResult,
    currentView: 'edit',
    isLoading: false,
    dataTableState: {
      editableCells: new Map(),
      selectedCells: new Set(),
      columnOrder: parseResult.headers,
      hiddenColumns: new Set(),
      columnWidths: new Map(),
      sortConfig: null,
      filterConfig: new Map()
    },
    pdfOptions: DEFAULT_ENHANCED_OPTIONS,
    previewState: {
      isGenerating: false,
      lastGenerated: null,
      pdfBlob: null,
      pdfPages: 0,
      generationTime: 0,
      error: null,
      warnings: []
    },
    selectedTemplate: null,
    availableTemplates: {
      featured: [],
      categories: {},
      userTemplates: [],
      recentlyUsed: []
    },
    languageDetection: null,
    fontRecommendations: [],
    recommendations: [],
    metrics: null,
    i18nConfig: {
      currentLanguage: 'en',
      availableLanguages: ['en', 'ru', 'lv', 'lt', 'de'],
      translations: {},
      dateFormats: {},
      numberFormats: {},
      rtlLanguages: ['ar', 'he']
    },
    viewportConfig: {
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      splitViewEnabled: window.innerWidth >= 1024,
      previewPanelWidth: 50
    },
    advancedConfig: {
      performance: {
        enableWebWorkers: true,
        chunkSize: 1000,
        maxMemoryUsage: 512 * 1024 * 1024, // 512MB
        enableCaching: true
      },
      accessibility: {
        enableHighContrast: false,
        fontSize: 'medium',
        enableScreenReader: false,
        keyboardNavigation: true
      },
      debugging: {
        enableConsoleLogging: true,
        showPerformanceMetrics: false,
        enableErrorBoundaries: true
      }
    }
  }));

  // 🌍 Автоматическая детекция языка при загрузке
  useEffect(() => {
    const detectLanguage = async () => {
      if (!parseResult.data.length) return;

      try {
        setEditorState(prev => ({ ...prev, isLoading: true }));

        // Конвертируем данные в формат для анализа
        const csvData = parseResult.data.map(row => 
          parseResult.headers.map(header => String(row[header] || ''))
        );

        // Детектируем язык
        const languageResult = MultiLanguageFontService.detectLanguageFromCSV(csvData);
        
        // Получаем рекомендации шрифтов
        const fontRecommendations = MultiLanguageFontService.getFontRecommendations(languageResult, csvData);

        // Обновляем состояние
        setEditorState(prev => ({
          ...prev,
          languageDetection: languageResult,
          fontRecommendations,
          pdfOptions: {
            ...prev.pdfOptions,
            language: languageResult.detectedLanguage,
            textDirection: languageResult.direction,
            fontConfig: {
              ...prev.pdfOptions.fontConfig,
              family: fontRecommendations[0]?.primary || 'Roboto'
            }
          },
          isLoading: false
        }));

        console.log('🎯 Language detection completed:', {
          language: languageResult.detectedLanguage,
          confidence: languageResult.confidence,
          recommendedFont: fontRecommendations[0]?.primary
        });

      } catch (error) {
        console.error('❌ Language detection failed:', error);
        setEditorState(prev => ({ 
          ...prev, 
          isLoading: false,
          previewState: {
            ...prev.previewState,
            error: `Language detection failed: ${error}`
          }
        }));
      }
    };

    detectLanguage();
  }, [parseResult]);

  // 🔄 Автоматическая генерация PDF при изменениях
  const generatePreview = useCallback(async (force = false) => {
    if (editorState.previewState.isGenerating && !force) return;

    try {
      setEditorState(prev => ({
        ...prev,
        previewState: {
          ...prev.previewState,
          isGenerating: true,
          error: null
        }
      }));

      const startTime = performance.now();

      // Тут будет логика генерации PDF с использованием существующих сервисов
      // Пока заглушка для демонстрации архитектуры
      await new Promise(resolve => setTimeout(resolve, 1000));

      const endTime = performance.now();
      const generationTime = endTime - startTime;

      setEditorState(prev => ({
        ...prev,
        previewState: {
          ...prev.previewState,
          isGenerating: false,
          lastGenerated: new Date(),
          generationTime,
          pdfPages: Math.ceil(parseResult.rowCount / 50), // примерная оценка
          warnings: editorState.languageDetection?.confidence < 70 ? 
            ['Низкая уверенность в детекции языка'] : []
        }
      }));

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      setEditorState(prev => ({
        ...prev,
        previewState: {
          ...prev.previewState,
          isGenerating: false,
          error: `PDF generation failed: ${error}`
        }
      }));
    }
  }, [editorState.previewState.isGenerating, parseResult.rowCount, editorState.languageDetection]);

  // 🎨 Изменение настроек PDF
  const updatePdfOptions = useCallback((updates: Partial<EnhancedCsvToPdfOptions>) => {
    setEditorState(prev => ({
      ...prev,
      pdfOptions: { ...prev.pdfOptions, ...updates }
    }));
    
    // Автоматическая регенерация превью
    setTimeout(() => generatePreview(), 300);
  }, [generatePreview]);

  // 📱 Отзывчивая верстка
  const layoutClasses = useMemo(() => {
    const { isMobile, isTablet, splitViewEnabled } = editorState.viewportConfig;
    
    if (isMobile) {
      return 'flex flex-col min-h-screen';
    }
    
    if (isTablet) {
      return 'flex flex-col lg:flex-row min-h-screen';
    }
    
    return splitViewEnabled 
      ? 'flex flex-row min-h-screen' 
      : 'flex flex-col min-h-screen';
  }, [editorState.viewportConfig]);

  // 🎭 Навигация между вкладками
  const renderTabNavigation = () => (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
      {[
        { id: 'edit', label: 'Edit Data', icon: Edit3 },
        { id: 'style', label: 'Style PDF', icon: Palette },
        { id: 'preview', label: 'Preview', icon: Eye },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setEditorState(prev => ({ ...prev, currentView: tab.id as any }))}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${editorState.currentView === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // 🌍 Языковая панель информации
  const renderLanguageInfo = () => {
    const { languageDetection, fontRecommendations } = editorState;
    
    if (!languageDetection) return null;

    return (
      <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Detected Language: {MultiLanguageFontService.getLanguageDisplayName(languageDetection.detectedLanguage)}
              </h3>
              <p className="text-sm text-gray-600">
                Confidence: {languageDetection.confidence.toFixed(1)}% • 
                Script: {languageDetection.script} • 
                Direction: {languageDetection.direction.toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={languageDetection.confidence > 80 ? 'success' : 'warning'}
              className="text-xs"
            >
              {languageDetection.confidence > 80 ? 'High Confidence' : 'Medium Confidence'}
            </Badge>
            
            {fontRecommendations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Type className="w-3 h-3 mr-1" />
                {fontRecommendations[0].primary}
              </Badge>
            )}
          </div>
        </div>

        {fontRecommendations.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Font Recommendations:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fontRecommendations.slice(0, 3).map((rec, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">{rec.primary}</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Badge 
                        variant={rec.qualityRating === 'excellent' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.qualityRating}
                      </Badge>
                      {rec.unicodeSupport && (
                        <Badge variant="secondary" className="text-xs">
                          Unicode
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => updatePdfOptions({ 
                      fontConfig: { 
                        ...editorState.pdfOptions.fontConfig, 
                        family: rec.primary 
                      } 
                    })}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // 📊 Панель статистики
  const renderStatsPanel = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{parseResult.rowCount.toLocaleString()}</div>
        <div className="text-sm text-gray-500">Rows</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{parseResult.columnCount}</div>
        <div className="text-sm text-gray-500">Columns</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">
          {editorState.previewState.pdfPages || '~' + Math.ceil(parseResult.rowCount / 50)}
        </div>
        <div className="text-sm text-gray-500">PDF Pages</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">
          {editorState.previewState.generationTime ? 
            `${editorState.previewState.generationTime.toFixed(0)}ms` : 
            '—'
          }
        </div>
        <div className="text-sm text-gray-500">Generation Time</div>
      </Card>
    </div>
  );

  // 🎨 Панель быстрых настроек стиля
  const renderQuickStylePanel = () => (
    <Card className="mb-6 p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Palette className="w-5 h-5 mr-2 text-purple-600" />
        Quick Style Options
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Темы */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={editorState.pdfOptions.theme}
            onChange={(e) => updatePdfOptions({ theme: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="colorful">Colorful</option>
          </select>
        </div>

        {/* Размер шрифта */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size: {editorState.pdfOptions.fontConfig.size}pt
          </label>
          <input
            type="range"
            min="6"
            max="16"
            value={editorState.pdfOptions.fontConfig.size}
            onChange={(e) => updatePdfOptions({
              fontConfig: {
                ...editorState.pdfOptions.fontConfig,
                size: parseInt(e.target.value)
              }
            })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Ориентация */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
          <div className="flex space-x-2">
            {['portrait', 'landscape'].map(orientation => (
              <button
                key={orientation}
                onClick={() => updatePdfOptions({ orientation: orientation as any })}
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
      </div>

      {/* Цветовая схема */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
        <div className="flex space-x-3">
          {[
            { name: 'Blue', primary: '#3B82F6', secondary: '#EBF8FF' },
            { name: 'Green', primary: '#10B981', secondary: '#F0FDF4' },
            { name: 'Purple', primary: '#8B5CF6', secondary: '#FAF5FF' },
            { name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' },
          ].map(scheme => (
            <button
              key={scheme.name}
              onClick={() => updatePdfOptions({
                colorScheme: {
                  ...editorState.pdfOptions.colorScheme,
                  primary: scheme.primary,
                  headerBg: scheme.secondary
                }
              })}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50"
            >
              <div 
                className="w-8 h-8 rounded-full mb-1"
                style={{ backgroundColor: scheme.primary }}
              />
              <span className="text-xs text-gray-600">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );

  // 🎯 Основной рендер контента
  const renderMainContent = () => {
    switch (editorState.currentView) {
      case 'edit':
        return (
          <div className="space-y-6">
            {renderStatsPanel()}
            {renderLanguageInfo()}
            
            {/* Таблица данных будет здесь */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Data Table (Preview)</h3>
              <div className="text-gray-600 text-center py-12">
                📝 Interactive data table editor will be implemented here
                <br />
                <span className="text-sm">Features: inline editing, drag & drop columns, sorting, filtering</span>
              </div>
            </Card>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-6">
            {renderLanguageInfo()}
            {renderQuickStylePanel()}
            
            {/* Расширенные настройки стиля */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Advanced Styling</h3>
              <div className="text-gray-600 text-center py-12">
                🎨 Advanced styling controls will be implemented here
                <br />
                <span className="text-sm">Features: custom themes, branding, advanced typography</span>
              </div>
            </Card>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {/* Предпросмотр PDF */}
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
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-gray-600 py-12">
                    👁️ Live PDF preview will be rendered here
                    <br />
                    <span className="text-sm">Using PDF.js for in-browser rendering</span>
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
                Interactive CSV to PDF Editor
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
              onClick={() => {
                // Логика экспорта будет здесь
                console.log('Exporting PDF...');
              }}
              disabled={editorState.previewState.isGenerating || !editorState.previewState.lastGenerated}
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
