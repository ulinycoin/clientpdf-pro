import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit3, 
  Settings,
  Download,
  Maximize2,
  Minimize2,
  AlertCircle,
  Languages,
  Zap,
  Loader2
} from 'lucide-react';

import { CsvParseResult, CsvToPdfOptions } from '../../../services/converters/CsvToPdfConverter';
import { TextAnalysis } from '../../../services/EnhancedUnicodeFontService';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { DataTableEditor } from './DataTableEditor';
import { StyleControlPanel } from './StyleControlPanel';
import { PdfPreviewCanvas } from './PdfPreviewCanvas';
import { FontLanguageSelector } from './FontLanguageSelector';

interface LivePreviewEditorProps {
  parseResult: CsvParseResult;
  options: CsvToPdfOptions;
  fontAnalysis: TextAnalysis | null;
  viewMode: 'split' | 'editor' | 'preview';
  onDataChange: (data: CsvParseResult) => void;
  onOptionsChange: (options: CsvToPdfOptions) => void;
  isProcessing?: boolean;
}

interface EditorState {
  activeTab: 'data' | 'style' | 'font';
  isFullscreen: boolean;
  sidebarCollapsed: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  pdfGenerating: boolean;
  previewError: string | null;
}

export const LivePreviewEditor: React.FC<LivePreviewEditorProps> = ({
  parseResult,
  options,
  fontAnalysis,
  viewMode,
  onDataChange,
  onOptionsChange,
  isProcessing = false
}) => {
  const [editorState, setEditorState] = useState<EditorState>({
    activeTab: 'data',
    isFullscreen: false,
    sidebarCollapsed: false,
    isDirty: false,
    lastSaved: null,
    pdfGenerating: false,
    previewError: null
  });

  // Refs для управления компонентами
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // 🔄 DEBOUNCED PDF GENERATION
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const pdfGenerationTimer = useRef<NodeJS.Timeout | null>(null);

  // Генерация PDF с debouncing для performance
  const generatePDFPreview = useCallback(async () => {
    if (!parseResult) return;

    setEditorState(prev => ({ ...prev, pdfGenerating: true, previewError: null }));

    try {
      // Используем существующий конвертер
      const { CsvToPdfConverter } = await import('../../../services/converters/CsvToPdfConverter');
      const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult, options);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfBlob(blob);
      
      setEditorState(prev => ({ 
        ...prev, 
        pdfGenerating: false, 
        lastSaved: new Date(),
        isDirty: false 
      }));
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      setEditorState(prev => ({ 
        ...prev, 
        pdfGenerating: false,
        previewError: `PDF generation failed: ${error}`
      }));
    }
  }, [parseResult, options]);

  // Debounced PDF generation при изменениях
  useEffect(() => {
    // Очищаем предыдущий таймер
    if (pdfGenerationTimer.current) {
      clearTimeout(pdfGenerationTimer.current);
    }

    // Устанавливаем новый таймер
    pdfGenerationTimer.current = setTimeout(() => {
      generatePDFPreview();
    }, 500); // 500ms debounce

    // Отмечаем как dirty
    setEditorState(prev => ({ ...prev, isDirty: true }));

    return () => {
      if (pdfGenerationTimer.current) {
        clearTimeout(pdfGenerationTimer.current);
      }
    };
  }, [generatePDFPreview]);

  // Первоначальная генерация PDF
  useEffect(() => {
    generatePDFPreview();
  }, []); // Только при монтировании

  // 📝 DATA CHANGE HANDLERS
  const handleDataChange = useCallback((newData: CsvParseResult) => {
    onDataChange(newData);
    setEditorState(prev => ({ ...prev, isDirty: true }));
  }, [onDataChange]);

  const handleOptionsChange = useCallback((newOptions: CsvToPdfOptions) => {
    onOptionsChange(newOptions);
    setEditorState(prev => ({ ...prev, isDirty: true }));
  }, [onOptionsChange]);

  // 🎛️ UI STATE HANDLERS
  const setActiveTab = useCallback((tab: 'data' | 'style' | 'font') => {
    setEditorState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setEditorState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
    
    // Trigger resize event для PDF canvas
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  // 💾 MANUAL SAVE HANDLER
  const handleManualSave = useCallback(() => {
    generatePDFPreview();
  }, [generatePDFPreview]);

  // 🎨 LAYOUT CALCULATIONS
  const layoutClasses = useMemo(() => {
    const baseClasses = "transition-all duration-300 ease-in-out";
    
    switch (viewMode) {
      case 'editor':
        return {
          container: `${baseClasses} w-full`,
          editor: "w-full",
          preview: "hidden"
        };
      case 'preview':
        return {
          container: `${baseClasses} w-full`,
          editor: "hidden",
          preview: "w-full"
        };
      case 'split':
      default:
        return {
          container: `${baseClasses} w-full grid grid-cols-1 lg:grid-cols-2 gap-4`,
          editor: "w-full",
          preview: "w-full"
        };
    }
  }, [viewMode]);

  // 🎯 SIDEBAR CONTENT RENDERER
  const renderSidebarContent = useCallback(() => {
    switch (editorState.activeTab) {
      case 'data':
        return (
          <DataTableEditor
            parseResult={parseResult}
            onChange={handleDataChange}
            isProcessing={editorState.pdfGenerating}
          />
        );
      case 'style':
        return (
          <StyleControlPanel
            options={options}
            onChange={handleOptionsChange}
            isProcessing={editorState.pdfGenerating}
          />
        );
      case 'font':
        return (
          <FontLanguageSelector
            fontAnalysis={fontAnalysis}
            currentOptions={options}
            onChange={handleOptionsChange}
            isProcessing={editorState.pdfGenerating}
          />
        );
      default:
        return null;
    }
  }, [editorState.activeTab, parseResult, options, fontAnalysis, handleDataChange, handleOptionsChange, editorState.pdfGenerating]);

  return (
    <div className={`${layoutClasses.container} ${editorState.isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      
      {/* 📝 EDITOR PANEL */}
      <div className={`${layoutClasses.editor} flex flex-col`}>
        <Card className="flex-1 glass-card p-0 overflow-hidden">
          
          {/* 🎛️ EDITOR HEADER */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    editorState.activeTab === 'data'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Edit3 className="w-4 h-4 mr-2 inline" />
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('style')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    editorState.activeTab === 'style'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Style
                </button>
                <button
                  onClick={() => setActiveTab('font')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    editorState.activeTab === 'font'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Languages className="w-4 h-4 mr-2 inline" />
                  Fonts
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* 💾 STATUS INDICATORS */}
                {editorState.isDirty && (
                  <Badge variant="warning" className="text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Updating...
                  </Badge>
                )}
                
                {editorState.lastSaved && !editorState.isDirty && (
                  <Badge variant="success" className="text-xs">
                    ✓ Updated {editorState.lastSaved.toLocaleTimeString()}
                  </Badge>
                )}

                {/* 🔄 MANUAL REFRESH */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={editorState.pdfGenerating}
                  className="flex items-center"
                >
                  {editorState.pdfGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </Button>

                {/* 🖼️ FULLSCREEN TOGGLE */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="flex items-center"
                >
                  {editorState.isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 📝 EDITOR CONTENT */}
          <div ref={editorRef} className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={editorState.activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderSidebarContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* 📄 PDF PREVIEW PANEL */}
      <div className={`${layoutClasses.preview} flex flex-col`}>
        <Card className="flex-1 glass-card p-0 overflow-hidden">
          
          {/* 🎛️ PREVIEW HEADER */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-700">Live Preview</h3>
                
                {/* 📊 PREVIEW STATS */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{parseResult.rowCount} rows</span>
                  <span>•</span>
                  <span>{parseResult.columnCount} cols</span>
                  {fontAnalysis && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <Languages className="w-3 h-3 mr-1" />
                        {fontAnalysis.detectedLanguages[0]}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* 🚨 ERROR INDICATOR */}
                {editorState.previewError && (
                  <Badge variant="error" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                )}
                
                {/* ⚡ GENERATING INDICATOR */}
                {editorState.pdfGenerating && (
                  <Badge variant="secondary" className="text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 📄 PDF CANVAS */}
          <div ref={previewRef} className="flex-1 bg-gray-50">
            {editorState.previewError ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Preview Error</h4>
                  <p className="text-red-600 text-sm max-w-md">{editorState.previewError}</p>
                  <Button
                    onClick={handleManualSave}
                    className="mt-4"
                    size="sm"
                  >
                    Retry Preview
                  </Button>
                </div>
              </div>
            ) : (
              <PdfPreviewCanvas
                pdfBlob={pdfBlob}
                isGenerating={editorState.pdfGenerating}
                onError={(error) => setEditorState(prev => ({ 
                  ...prev, 
                  previewError: error 
                }))}
              />
            )}
          </div>
        </Card>
      </div>

      {/* 🔔 FULLSCREEN OVERLAY */}
      {editorState.isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={toggleFullscreen}
            variant="secondary"
            size="sm"
            className="shadow-lg"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
      )}
    </div>
  );
};

export default LivePreviewEditor;