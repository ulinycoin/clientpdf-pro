/**
 * LivePreviewEditor.tsx
 * Интерактивный редактор CSV to PDF с живым предпросмотром
 * 🔧 ИСПРАВЛЕН: Правильная JSX структура без adjacent elements
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
  Zap
} from 'lucide-react';

import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';
import { CsvParseResult } from '../../services/converters/CsvToPdfConverter';

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
  pdfOptions: {
    orientation: 'portrait' | 'landscape';
    pageSize: 'a4' | 'letter' | 'legal';
    fontSize: number;
    fontFamily: string;
    colorScheme: {
      primary: string;
      secondary: string;
      headerBg: string;
      textColor: string;
    };
  };
  previewState: {
    isGenerating: boolean;
    lastGenerated: Date | null;
    error: string | null;
    warnings: string[];
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
      code: 'en',
      name: 'English',
      confidence: 0.95,
      script: 'latin'
    },
    pdfOptions: {
      orientation: 'landscape',
      pageSize: 'a4',
      fontSize: 10,
      fontFamily: 'Inter',
      colorScheme: {
        primary: '#3B82F6',
        secondary: '#EBF8FF',
        headerBg: '#F8FAFC',
        textColor: '#1F2937'
      }
    },
    previewState: {
      isGenerating: false,
      lastGenerated: null,
      error: null,
      warnings: []
    }
  });

  // 🔧 Обновление состояния редактора
  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  }, []);

  // 🔧 Обновление PDF опций
  const updatePdfOptions = useCallback((updates: Partial<EditorState['pdfOptions']>) => {
    setEditorState(prev => ({
      ...prev,
      pdfOptions: { ...prev.pdfOptions, ...updates }
    }));
  }, []);

  // 🔧 Генерация превью
  const generatePreview = useCallback((force = false) => {
    if (editorState.previewState.isGenerating && !force) return;

    updateEditorState({
      previewState: {
        ...editorState.previewState,
        isGenerating: true,
        error: null
      }
    });

    // Симуляция генерации PDF
    setTimeout(() => {
      updateEditorState({
        previewState: {
          isGenerating: false,
          lastGenerated: new Date(),
          error: null,
          warnings: parseResult.errors.map(e => e.message)
        }
      });
    }, 1500);
  }, [editorState.previewState, parseResult.errors, updateEditorState]);

  // 🔧 Инициализация компонента
  useEffect(() => {
    const initializeEditor = async () => {
      // Симуляция детекции языка
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      generatePreview();
    };

    initializeEditor();
  }, [generatePreview, updateEditorState]);

  // 🎨 Классы стилей
  const layoutClasses = 'min-h-screen bg-gray-50 flex flex-col';
  const tabClasses = (active: boolean) => `
    px-4 py-2 text-sm font-medium rounded-lg transition-all
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
        <Edit3 className="w-4 h-4 mr-2 inline" />
        Edit Data
      </button>
      <button
        onClick={() => updateEditorState({ currentView: 'style' })}
        className={tabClasses(editorState.currentView === 'style')}
      >
        <Palette className="w-4 h-4 mr-2 inline" />
        Style
      </button>
      <button
        onClick={() => updateEditorState({ currentView: 'preview' })}
        className={tabClasses(editorState.currentView === 'preview')}
      >
        <Eye className="w-4 h-4 mr-2 inline" />
        Preview
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
          <span className="text-sm font-medium text-blue-700">Live Preview Active</span>
        </div>
      </div>
    </Card>
  );

  // 🎯 Рендер информации о языке
  const renderLanguageInfo = () => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-medium text-gray-900">Language Detection</h3>
            <p className="text-sm text-gray-600">
              Detected: {editorState.detectedLanguage.name} 
              ({(editorState.detectedLanguage.confidence * 100).toFixed(0)}% confidence)
            </p>
          </div>
        </div>
        
        <Badge variant="success">
          <Type className="w-3 h-3 mr-1" />
          Auto Font
        </Badge>
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