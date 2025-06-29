import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Globe, Shield, Zap, FileSpreadsheet, 
  Upload, Download, Eye, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Импортируем существующие сервисы
import { CsvToPdfConverter, CsvParseResult } from '../../services/converters/CsvToPdfConverter';
import { detectLanguage } from '../../services/elegantLanguageDetection';

// Импортируем новый интерактивный редактор
import { InteractiveCSVToPDFEditor } from './InteractiveCSVToPDFEditor';
import { EditableCSVData } from '../../types/enhanced-editor.types';

// Интеграционные компоненты
import ElegantCSVConverter from './ElegantCSVConverter';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';

interface Props {
  className?: string;
}

interface ConversionStep {
  id: 'upload' | 'edit' | 'export';
  title: string;
  completed: boolean;
}

type EditorMode = 'legacy' | 'interactive';

export const EnhancedCSVToPDFPageIntegration: React.FC<Props> = ({ className = '' }) => {
  // 📊 Состояние системы
  const [currentStep, setCurrentStep] = useState<ConversionStep['id']>('upload');
  const [editorMode, setEditorMode] = useState<EditorMode>('interactive');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [editableData, setEditableData] = useState<EditableCSVData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const steps: ConversionStep[] = [
    { id: 'upload', title: 'Upload & Parse', completed: csvFile !== null },
    { id: 'edit', title: 'Interactive Edit', completed: editableData !== null },
    { id: 'export', title: 'Export PDF', completed: false },
  ];

  // 📁 Обработка загрузки файла
  const handleFileUpload = useCallback(async (file: File) => {
    const validation = CsvToPdfConverter.validateCSV(file);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setCsvFile(file);
    setIsParsing(true);
    
    try {
      console.log('🔍 Starting enhanced CSV parsing for interactive editor...');
      
      const result = await CsvToPdfConverter.parseCSV(file);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => 
          toast.error(`Parse warning: ${error.message}`)
        );
      }
      
      if (result.rowCount === 0) {
        toast.error('CSV file appears to be empty or has no valid data');
        return;
      }

      // 🌍 Автодетекция языка для новых данных
      const csvRows = result.data.map(row => 
        result.headers.map(header => String(row[header] || ''))
      );
      
      const detectedLanguage = detectLanguage(csvRows);

      // 📊 Преобразуем в формат для интерактивного редактора
      const enhancedData: EditableCSVData = {
        headers: result.headers,
        rows: csvRows,
        metadata: {
          rowCount: result.rowCount,
          columnCount: result.columnCount,
          title: result.reportTitle || file.name.replace(/\.[^/.]+$/, ''),
          language: detectedLanguage,
          originalFilename: file.name,
          encoding: result.encoding,
          delimiter: result.delimiter
        }
      };

      // Сохраняем оба формата для совместимости
      setParseResult(result);
      setEditableData(enhancedData);
      setCurrentStep('edit');
      
      console.log('✅ Enhanced CSV parsing completed:', {
        mode: editorMode,
        rows: result.rowCount,
        columns: result.columnCount,
        language: detectedLanguage.displayName,
        confidence: Math.round(detectedLanguage.confidence * 100) + '%',
        filename: file.name
      });
      
      toast.success(
        `🎉 Successfully parsed ${result.rowCount} rows with ${result.columnCount} columns`,
        { duration: 4000 }
      );
      
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error}`);
      console.error('❌ Enhanced CSV parsing failed:', error);
    } finally {
      setIsParsing(false);
    }
  }, [editorMode]);

  // 📤 Обработка экспорта
  const handleExport = useCallback((blob: Blob, filename?: string) => {
    if (!csvFile || !editableData) return;

    setIsExporting(true);
    
    try {
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Генерируем имя файла с timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const baseName = filename || editableData.metadata.title || 'interactive-csv';
      const exportFilename = `${baseName}_enhanced_${timestamp}.pdf`;
      
      link.download = exportFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setCurrentStep('export');
      
      toast.success(
        `✨ PDF exported successfully as ${exportFilename}!`,
        { duration: 5000 }
      );
      
      console.log('📄 Enhanced PDF export completed:', {
        mode: editorMode,
        fileName: exportFilename,
        fileSize: `${(blob.size / 1024).toFixed(1)}KB`,
        originalRows: editableData.metadata.rowCount,
        language: editableData.metadata.language?.displayName
      });
      
    } catch (error) {
      toast.error(`Export failed: ${error}`);
      console.error('❌ Enhanced PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [csvFile, editableData, editorMode]);

  // 🔄 Переключение режимов редактора
  const switchEditorMode = useCallback((mode: EditorMode) => {
    setEditorMode(mode);
    console.log(`🔄 Switched to ${mode} editor mode`);
    
    if (mode === 'interactive') {
      toast.success('🚀 Interactive editor mode activated!');
    } else {
      toast.success('✨ Legacy editor mode activated!');
    }
  }, []);

  // 🔄 Сброс состояния
  const resetConverter = useCallback(() => {
    setCsvFile(null);
    setParseResult(null);
    setEditableData(null);
    setCurrentStep('upload');
    setIsParsing(false);
    setIsExporting(false);
    console.log('🔄 Converter state reset');
  }, []);

  // 📊 Обработка изменений данных в интерактивном режиме
  const handleDataChange = useCallback((newData: EditableCSVData) => {
    setEditableData(newData);
    console.log('📊 Data updated in interactive editor:', {
      rows: newData.metadata.rowCount,
      columns: newData.metadata.columnCount
    });
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <div className="container-modern py-8">
        {/* 🎯 Элегантная шапка с выбором режима */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <FileSpreadsheet className="w-12 h-12 text-blue-600 mr-3" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced CSV to PDF
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Transform your CSV data into beautiful PDF tables with our next-generation editor featuring 
            <span className="text-blue-600 font-semibold"> interactive editing</span>, 
            <span className="text-green-600 font-semibold"> live preview</span>, and 
            <span className="text-purple-600 font-semibold"> smart language detection</span>
          </p>

          {/* 🎛️ Переключатель режимов */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              <button
                onClick={() => switchEditorMode('interactive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  editorMode === 'interactive'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🚀 Interactive Editor
              </button>
              <button
                onClick={() => switchEditorMode('legacy')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  editorMode === 'legacy'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✨ Legacy Editor
              </button>
            </div>
          </div>
          
          {/* 📊 Информация о режиме */}
          <div className="flex justify-center mb-6">
            {editorMode === 'interactive' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl"
              >
                <div className="flex items-center text-blue-800 mb-2">
                  <Zap className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Interactive Editor Mode</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Full-featured editor with live preview, drag & drop editing, 
                  advanced themes, and real-time PDF generation
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl"
              >
                <div className="flex items-center text-green-800 mb-2">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Legacy Editor Mode</span>
                </div>
                <p className="text-green-700 text-sm">
                  Reliable and stable conversion with elegant styling and 
                  smart language detection
                </p>
              </motion.div>
            )}
          </div>

          {/* 🏷️ Функциональные бейджи */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="primary" className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              15+ Languages
            </Badge>
            <Badge variant="secondary">Live Preview</Badge>
            <Badge variant="success">Beautiful Themes</Badge>
            <Badge variant="warning">Auto Optimization</Badge>
            {editorMode === 'interactive' && (
              <Badge variant="info" className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Interactive Editing
              </Badge>
            )}
          </div>
        </motion.div>

        {/* 📈 Прогресс шагов */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                  ${currentStep === step.id 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110'
                    : step.completed 
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }
                `}>
                  {step.completed && currentStep !== step.id ? '✓' : index + 1}
                </div>
                <div className="ml-3">
                  <div className={`
                    text-sm font-medium
                    ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 🎬 Основной контент */}
        <div className="max-w-7xl mx-auto">
          {currentStep === 'upload' && (
            <UploadStep
              onFileSelect={handleFileUpload}
              isParsing={isParsing}
              editorMode={editorMode}
            />
          )}

          {currentStep === 'edit' && editableData && (
            <EditStep
              editorMode={editorMode}
              editableData={editableData}
              parseResult={parseResult}
              onDataChange={handleDataChange}
              onExport={handleExport}
              isExporting={isExporting}
            />
          )}

          {currentStep === 'export' && (
            <ExportCompleteStep
              editorMode={editorMode}
              exportedData={editableData}
              onReset={resetConverter}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 📁 Компонент загрузки файла
const UploadStep: React.FC<{
  onFileSelect: (file: File) => void;
  isParsing: boolean;
  editorMode: EditorMode;
}> = ({ onFileSelect, isParsing, editorMode }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => 
      file.type === 'text/csv' || 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.tsv') || 
      file.name.endsWith('.txt')
    );
    
    if (csvFile) {
      onFileSelect(csvFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="p-8 glass-card hover-lift">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${isParsing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileInput}
            className="hidden"
            id="csv-file-input"
          />
          
          {isParsing ? (
            <div className="flex flex-col items-center">
              <Spinner size="lg" className="mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Preparing {editorMode === 'interactive' ? 'Interactive' : 'Enhanced'} Experience...
              </h3>
              <p className="text-gray-500">
                Analyzing data structure, detecting language, and optimizing for beauty
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <Upload className="w-20 h-20 text-blue-500 mx-auto" />
                <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                {isDragActive ? 'Drop your CSV file here' : 'Upload CSV for Enhanced Processing'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Drag and drop or click to select your CSV, TSV, or TXT file. 
                Our {editorMode} engine will automatically detect language and apply beautiful formatting.
              </p>
              <label htmlFor="csv-file-input">
                <Button className="cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </Button>
              </label>
              <div className="flex flex-wrap gap-2 justify-center mt-4 mb-4">
                <Badge variant="secondary">.csv</Badge>
                <Badge variant="secondary">.tsv</Badge>
                <Badge variant="secondary">.txt</Badge>
              </div>
              <p className="text-sm text-gray-400">
                Maximum file size: 100MB • Smart detection • Beautiful results
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// ✏️ Компонент редактирования
const EditStep: React.FC<{
  editorMode: EditorMode;
  editableData: EditableCSVData;
  parseResult: CsvParseResult | null;
  onDataChange: (data: EditableCSVData) => void;
  onExport: (blob: Blob, filename?: string) => void;
  isExporting: boolean;
}> = ({ editorMode, editableData, parseResult, onDataChange, onExport, isExporting }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-300px)]"
    >
      {editorMode === 'interactive' ? (
        <InteractiveCSVToPDFEditor
          initialData={editableData}
          onDataChange={onDataChange}
          onExport={onExport}
          className="h-full"
        />
      ) : parseResult && (
        <ElegantCSVConverter
          parseResult={{
            data: editableData.rows,
            headers: editableData.headers,
            rowCount: editableData.metadata.rowCount,
            columnCount: editableData.metadata.columnCount,
            reportTitle: editableData.metadata.title,
            delimiter: editableData.metadata.delimiter || ',',
            errors: []
          }}
          onExport={onExport}
          className="h-full"
        />
      )}
    </motion.div>
  );
};

// ✅ Компонент завершения экспорта
const ExportCompleteStep: React.FC<{
  editorMode: EditorMode;
  exportedData: EditableCSVData | null;
  onReset: () => void;
}> = ({ editorMode, exportedData, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <Card className="p-8 glass-card">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          ✨ Enhanced PDF Created!
        </h3>
        <p className="text-gray-600 mb-6">
          Your CSV has been transformed into a beautiful PDF using our {editorMode} editor 
          with smart formatting, optimized fonts, and elegant design.
          {exportedData?.metadata.language && (
            <span className="block mt-2 text-sm">
              Language detected: {exportedData.metadata.language.displayName} 
              ({Math.round(exportedData.metadata.language.confidence * 100)}% confidence)
            </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onReset}
            variant="secondary"
            className="btn-secondary-modern"
          >
            Create Another Enhanced PDF
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default EnhancedCSVToPDFPageIntegration;