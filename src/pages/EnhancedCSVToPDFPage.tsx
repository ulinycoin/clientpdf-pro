import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Sparkles, ArrowRight, ChevronDown, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

// Импорты существующих компонентов
import { CsvToPdfConverter, CsvToPdfOptions, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';

// Импорты новых компонентов
import LivePreviewEditor from '../components/enhanced/LivePreviewEditor';
import { EnhancedCsvToPdfOptions } from '../types/enhanced-csv-pdf.types';
import { LanguageDetectionService } from '../services/language/LanguageDetectionService';

// Импорт исходной страницы для fallback
import { CSVToPDFPage as OriginalCSVToPDFPage } from './CSVToPDFPage';

type EditorMode = 'classic' | 'enhanced';

export const EnhancedCSVToPDFPage: React.FC = () => {
  const location = useLocation();
  const [editorMode, setEditorMode] = useState<EditorMode>('enhanced');
  const [csvData, setCsvData] = useState<CsvParseResult | null>(null);
  const [enhancedOptions, setEnhancedOptions] = useState<EnhancedCsvToPdfOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);

  // Проверяем URL параметры для режима
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const modeParam = urlParams.get('mode');
    
    if (modeParam === 'classic' || modeParam === 'enhanced') {
      setEditorMode(modeParam);
      setShowModeSelector(false);
    }
  }, [location]);

  // Обработчики для нового редактора
  const handleDataChange = (newData: CsvParseResult) => {
    setCsvData(newData);
  };

  const handleOptionsChange = (newOptions: EnhancedCsvToPdfOptions) => {
    setEnhancedOptions(newOptions);
  };

  const handleExport = async (format: 'pdf' | 'preview') => {
    if (!csvData || !enhancedOptions) {
      toast.error('No data to export');
      return;
    }

    setIsLoading(true);
    
    try {
      // Конвертируем enhanced опции в стандартные
      const standardOptions: CsvToPdfOptions = {
        orientation: enhancedOptions.orientation,
        pageSize: enhancedOptions.pageSize,
        fontSize: enhancedOptions.fontSize,
        tableStyle: enhancedOptions.tableStyle as any,
        headerStyle: enhancedOptions.headerStyle as any,
        fitToPage: enhancedOptions.fitToPage,
        includeRowNumbers: enhancedOptions.includeRowNumbers,
        marginTop: enhancedOptions.marginTop,
        marginBottom: enhancedOptions.marginBottom,
        marginLeft: enhancedOptions.marginLeft,
        marginRight: enhancedOptions.marginRight,
        title: enhancedOptions.title,
        fontFamily: enhancedOptions.fontFamily
      };

      if (format === 'pdf') {
        const pdfBytes = await CsvToPdfConverter.convertToPDF(csvData, standardOptions);
        
        // Создание blob и скачивание
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${csvData.reportTitle || 'converted'}_enhanced.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        toast.success('Enhanced PDF generated successfully!');
      } else {
        toast.success('Preview updated');
      }
      
    } catch (error) {
      toast.error(`Export failed: ${error}`);
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop для файлов
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = CsvToPdfConverter.validateCSV(file);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    await handleFileUpload(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt', '.tsv'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Загрузка данных из файла
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const result = await CsvToPdfConverter.parseCSV(file);
      setCsvData(result);
      
      // Автоматическая детекция языка
      const detection = LanguageDetectionService.detectLanguageFromCSV(result);
      
      const defaultOptions: EnhancedCsvToPdfOptions = {
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
        fontFamily: LanguageDetectionService.getOptimalFont(detection.detectedLanguage),
        
        // Расширенные настройки
        language: detection.detectedLanguage,
        autoDetectLanguage: true,
        fontFallbackChain: ['Roboto', 'Arial', 'sans-serif'],
        colorScheme: 'default',
        showFooter: false,
        enableHover: true,
        showRowHighlight: true,
        compactMode: false
      };
      
      setEnhancedOptions(defaultOptions);
      setShowModeSelector(false);
      
      toast.success(`File parsed successfully! Detected language: ${detection.detectedLanguage}`);
      
    } catch (error) {
      toast.error(`Failed to parse file: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Рендер в зависимости от режима
  if (editorMode === 'classic') {
    return <OriginalCSVToPDFPage />;
  }

  // Селектор режима
  if (showModeSelector && !csvData) {
    return (
      <>
        <Helmet>
          <title>Enhanced CSV to PDF Editor - Multi-Language Support | ClientPDF Pro</title>
          <meta 
            name="description" 
            content="Advanced CSV to PDF converter with live preview, multi-language support, and interactive editing. Support for 10+ languages including Russian, Latvian, Lithuanian, and more." 
          />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Enhanced CSV to PDF Editor
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Interactive editing with live preview and multi-language support
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              {/* Enhanced Mode */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="relative p-8 h-full hover:shadow-lg transition-shadow">
                  <div className="absolute top-4 right-4">
                    <Badge variant="primary" className="flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      ENHANCED
                    </Badge>
                  </div>
                  
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Live Preview Editor
                    </h3>
                    <p className="text-gray-600">
                      Interactive editing with real-time PDF preview and advanced multi-language support
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Live PDF preview as you edit
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Inline data editing with validation
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      10+ language auto-detection
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Advanced styling templates
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Smart font selection
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Classic Mode */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="relative p-8 h-full hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => setEditorMode('classic')}>
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Classic Step-by-Step
                    </h3>
                    <p className="text-gray-600">
                      Traditional workflow with preview and configuration steps
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Step-by-step process
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Static preview
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Basic configuration
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Familiar interface
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Stable and reliable
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* File Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="p-8">
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                    ${isLoading ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="w-16 h-16 text-blue-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {isDragActive ? 'Drop your CSV file here' : 'Upload CSV to Start'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Drag and drop or click to select your CSV, TSV, or TXT file
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <Badge variant="secondary">.csv</Badge>
                      <Badge variant="secondary">.tsv</Badge>
                      <Badge variant="secondary">.txt</Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      Maximum file size: 100MB • All processing happens locally
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Switch to Classic Mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-8"
            >
              <button
                onClick={() => setEditorMode('classic')}
                className="text-gray-600 hover:text-gray-900 text-sm flex items-center mx-auto"
              >
                Prefer the classic step-by-step interface?
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Главный enhanced редактор
  if (csvData && enhancedOptions) {
    return (
      <>
        <Helmet>
          <title>Enhanced CSV Editor - Live Preview | ClientPDF Pro</title>
        </Helmet>
        
        <LivePreviewEditor
          csvData={csvData}
          onDataChange={handleDataChange}
          onOptionsChange={handleOptionsChange}
          onExport={handleExport}
        />
      </>
    );
  }

  // Fallback
  return <OriginalCSVToPDFPage />;
};

export default EnhancedCSVToPDFPage;
