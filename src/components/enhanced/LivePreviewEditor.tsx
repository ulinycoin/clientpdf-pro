import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Edit3, Settings, Download, RefreshCw, Palette, Type, Globe,
  Maximize2, Minimize2, RotateCcw, Save, Share2, Copy
} from 'lucide-react';

// Импорты типов и сервисов
import { 
  EnhancedCsvToPdfOptions, 
  EditorState, 
  LivePreviewConfig, 
  SUPPORTED_LANGUAGES 
} from '../../types/enhanced-csv-pdf.types';
import { CsvParseResult } from '../../services/converters/CsvToPdfConverter';
import { LanguageDetectionService } from '../../services/language/LanguageDetectionService';

// Импорты компонентов
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';

interface LivePreviewEditorProps {
  csvData: CsvParseResult;
  onDataChange: (data: CsvParseResult) => void;
  onOptionsChange: (options: EnhancedCsvToPdfOptions) => void;
  onExport: (format: 'pdf' | 'preview') => Promise<void>;
  className?: string;
}

// Настройки по умолчанию
const DEFAULT_OPTIONS: EnhancedCsvToPdfOptions = {
  // Базовые настройки
  orientation: 'landscape',
  pageSize: 'legal',
  fontSize: 8,
  tableStyle: 'modern',
  headerStyle: 'gradient',
  fitToPage: true,
  includeRowNumbers: false,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 10,
  marginRight: 10,
  fontFamily: 'auto',
  
  // Расширенные настройки
  language: 'auto',
  autoDetectLanguage: true,
  fontFallbackChain: ['Roboto', 'Arial', 'sans-serif'],
  colorScheme: 'default',
  showFooter: false,
  enableHover: true,
  showRowHighlight: true,
  compactMode: false
};

const DEFAULT_PREVIEW_CONFIG: LivePreviewConfig = {
  autoRefresh: true,
  refreshInterval: 1000,
  maxPreviewRows: 50,
  showGridLines: true,
  highlightChanges: true,
  renderingQuality: 'balanced'
};

export const LivePreviewEditor: React.FC<LivePreviewEditorProps> = ({
  csvData,
  onDataChange,
  onOptionsChange,
  onExport,
  className = ''
}) => {
  // State management
  const [editorState, setEditorState] = useState<EditorState>({
    activePanel: 'data',
    isGenerating: false,
    lastGenerated: null,
    unsavedChanges: false,
    selectedCells: [],
    currentTemplate: null
  });

  const [options, setOptions] = useState<EnhancedCsvToPdfOptions>(DEFAULT_OPTIONS);
  const [previewConfig, setPreviewConfig] = useState<LivePreviewConfig>(DEFAULT_PREVIEW_CONFIG);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastPreviewUpdate, setLastPreviewUpdate] = useState<Date>(new Date());

  // Автоматическая детекция языка при загрузке данных
  useEffect(() => {
    if (csvData && options.autoDetectLanguage) {
      const detection = LanguageDetectionService.detectLanguageFromCSV(csvData);
      
      if (detection.confidence > 0.7) {
        const newOptions = {
          ...options,
          language: detection.detectedLanguage,
          fontFamily: LanguageDetectionService.getOptimalFont(detection.detectedLanguage)
        };
        
        setOptions(newOptions);
        onOptionsChange(newOptions);
        
        console.log('🌍 Auto-detected language:', {
          language: detection.detectedLanguage,
          confidence: detection.confidence,
          font: newOptions.fontFamily
        });
      }
    }
  }, [csvData, options.autoDetectLanguage]);

  // Автоматическое обновление предпросмотра
  useEffect(() => {
    if (previewConfig.autoRefresh) {
      const timer = setInterval(() => {
        if (editorState.unsavedChanges) {
          handlePreviewUpdate();
        }
      }, previewConfig.refreshInterval);

      return () => clearInterval(timer);
    }
  }, [previewConfig.autoRefresh, previewConfig.refreshInterval, editorState.unsavedChanges]);

  // Обработчики событий
  const handlePreviewUpdate = useCallback(() => {
    setLastPreviewUpdate(new Date());
    setEditorState(prev => ({ ...prev, unsavedChanges: false }));
  }, []);

  const handleOptionsChange = useCallback((newOptions: Partial<EnhancedCsvToPdfOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    onOptionsChange(updatedOptions);
    setEditorState(prev => ({ ...prev, unsavedChanges: true }));
  }, [options, onOptionsChange]);

  const handlePanelChange = useCallback((panel: EditorState['activePanel']) => {
    setEditorState(prev => ({ ...prev, activePanel: panel }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setEditorState(prev => ({ ...prev, isGenerating: true }));
    try {
      await onExport('pdf');
      setEditorState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        lastGenerated: new Date(),
        unsavedChanges: false
      }));
    } catch (error) {
      console.error('Generation failed:', error);
      setEditorState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [onExport]);

  // Данные для рендеринга
  const displayData = useMemo(() => {
    const maxRows = previewConfig.maxPreviewRows;
    return csvData.data.slice(0, maxRows);
  }, [csvData.data, previewConfig.maxPreviewRows]);

  const languageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES[options.language] || SUPPORTED_LANGUAGES['en'];
  }, [options.language]);

  // Анимации
  const panelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <div className="container mx-auto p-4">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Live CSV Editor</h1>
              <Badge variant={editorState.unsavedChanges ? 'warning' : 'success'}>
                {editorState.unsavedChanges ? 'Unsaved Changes' : 'Saved'}
              </Badge>
              {languageInfo && (
                <Badge variant="secondary" className="flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  {languageInfo.nativeName}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePreviewUpdate}
                className="flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerate}
                disabled={editorState.isGenerating}
                className="flex items-center"
              >
                {editorState.isGenerating ? (
                  <Spinner size="sm" className="mr-1" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                Generate PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'data', label: 'Data Editor', icon: Edit3 },
              { id: 'style', label: 'Style & Layout', icon: Palette },
              { id: 'language', label: 'Language & Fonts', icon: Globe },
              { id: 'preview', label: 'Live Preview', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = editorState.activePanel === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handlePanelChange(tab.id as EditorState['activePanel'])}
                  className={`
                    flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-12'}`}>
          {/* Left Panel - Editor */}
          <div className={`${isFullscreen ? 'col-span-1' : 'col-span-7'}`}>
            <Card className="h-full">
              <AnimatePresence mode="wait">
                {editorState.activePanel === 'data' && (
                  <motion.div
                    key="data"
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6"
                  >
                    <DataEditorPanel
                      csvData={csvData}
                      onDataChange={onDataChange}
                      options={options}
                      displayData={displayData}
                    />
                  </motion.div>
                )}

                {editorState.activePanel === 'style' && (
                  <motion.div
                    key="style"
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6"
                  >
                    <StyleEditorPanel
                      options={options}
                      onOptionsChange={handleOptionsChange}
                    />
                  </motion.div>
                )}

                {editorState.activePanel === 'language' && (
                  <motion.div
                    key="language"
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6"
                  >
                    <LanguageEditorPanel
                      options={options}
                      csvData={csvData}
                      onOptionsChange={handleOptionsChange}
                    />
                  </motion.div>
                )}

                {editorState.activePanel === 'preview' && (
                  <motion.div
                    key="preview"
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-6"
                  >
                    <PreviewControlPanel
                      previewConfig={previewConfig}
                      onConfigChange={setPreviewConfig}
                      lastUpdate={lastPreviewUpdate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          {!isFullscreen && (
            <div className="col-span-5">
              <Card className="h-full">
                <div className="p-6">
                  <LivePreviewPanel
                    csvData={csvData}
                    options={options}
                    previewConfig={previewConfig}
                    lastUpdate={lastPreviewUpdate}
                  />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>{csvData.rowCount.toLocaleString()} rows</span>
                <span>{csvData.columnCount} columns</span>
                <span>Language: {languageInfo.name}</span>
                <span>Font: {options.fontFamily}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {editorState.lastGenerated && (
                  <span>
                    Last generated: {editorState.lastGenerated.toLocaleTimeString()}
                  </span>
                )}
                <span className={`flex items-center ${
                  previewConfig.autoRefresh ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Auto-refresh {previewConfig.autoRefresh ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Placeholder компоненты для панелей (будут реализованы в следующих файлах)
const DataEditorPanel: React.FC<{
  csvData: CsvParseResult;
  onDataChange: (data: CsvParseResult) => void;
  options: EnhancedCsvToPdfOptions;
  displayData: Record<string, any>[];
}> = ({ csvData, displayData }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Data Editor</h3>
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{csvData.rowCount}</div>
          <div className="text-gray-500">Rows</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{csvData.columnCount}</div>
          <div className="text-gray-500">Columns</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{displayData.length}</div>
          <div className="text-gray-500">Preview</div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Interactive data editing will be implemented here with inline editing,
          drag & drop column reordering, and real-time validation.
        </p>
      </div>
    </div>
  </div>
);

const StyleEditorPanel: React.FC<{
  options: EnhancedCsvToPdfOptions;
  onOptionsChange: (options: Partial<EnhancedCsvToPdfOptions>) => void;
}> = ({ options, onOptionsChange }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Style & Layout</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Table Style
        </label>
        <select
          value={options.tableStyle}
          onChange={(e) => onOptionsChange({ tableStyle: e.target.value as any })}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="modern">Modern</option>
          <option value="professional">Professional</option>
          <option value="minimal">Minimal</option>
          <option value="elegant">Elegant</option>
        </select>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Advanced styling controls with live preview will be implemented here.
        </p>
      </div>
    </div>
  </div>
);

const LanguageEditorPanel: React.FC<{
  options: EnhancedCsvToPdfOptions;
  csvData: CsvParseResult;
  onOptionsChange: (options: Partial<EnhancedCsvToPdfOptions>) => void;
}> = ({ options, csvData, onOptionsChange }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Language & Fonts</h3>
    <div className="space-y-4">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.autoDetectLanguage}
            onChange={(e) => onOptionsChange({ autoDetectLanguage: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Auto-detect language</span>
        </label>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Language detection and font selection controls will be implemented here.
        </p>
      </div>
    </div>
  </div>
);

const PreviewControlPanel: React.FC<{
  previewConfig: LivePreviewConfig;
  onConfigChange: (config: LivePreviewConfig) => void;
  lastUpdate: Date;
}> = ({ previewConfig, onConfigChange, lastUpdate }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Preview Settings</h3>
    <div className="space-y-4">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={previewConfig.autoRefresh}
            onChange={(e) => onConfigChange({ ...previewConfig, autoRefresh: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Auto-refresh preview</span>
        </label>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  </div>
);

const LivePreviewPanel: React.FC<{
  csvData: CsvParseResult;
  options: EnhancedCsvToPdfOptions;
  previewConfig: LivePreviewConfig;
  lastUpdate: Date;
}> = ({ csvData, options, lastUpdate }) => (
  <div className="h-full">
    <h3 className="text-lg font-semibold mb-4">Live PDF Preview</h3>
    <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
      <div className="text-center">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">PDF Preview will render here</p>
        <p className="text-sm text-gray-500 mt-2">
          Using PDF.js for real-time rendering
        </p>
      </div>
    </div>
  </div>
);

export default LivePreviewEditor;
