import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Download, 
  Settings, 
  Eye, 
  AlertCircle,
  Languages,
  Zap,
  Split,
  Maximize2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { CsvToPdfConverter, CsvToPdfOptions, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import { EnhancedUnicodeFontService, TextAnalysis } from '../services/EnhancedUnicodeFontService';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';
import { LivePreviewEditor } from '../components/organisms/LivePreviewEditor/LivePreviewEditor';

interface EnhancedConversionState {
  step: 'upload' | 'edit' | 'export';
  csvFile: File | null;
  parseResult: CsvParseResult | null;
  options: CsvToPdfOptions;
  fontAnalysis: TextAnalysis | null;
  isProcessing: boolean;
  viewMode: 'split' | 'editor' | 'preview';
  errors: string[];
}

export const EnhancedCSVToPDFPage: React.FC = () => {
  const [state, setState] = useState<EnhancedConversionState>({
    step: 'upload',
    csvFile: null,
    parseResult: null,
    options: {
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
      fontFamily: 'auto', // 🆕 Автовыбор шрифта
    },
    fontAnalysis: null,
    isProcessing: false,
    viewMode: 'split',
    errors: []
  });

  // 🎯 SMART FONT ANALYSIS - автоматически анализируем текст для выбора шрифта
  const fontAnalysis = useMemo(() => {
    if (!state.parseResult) return null;
    
    const combinedText = state.parseResult.data
      .slice(0, 100) // Анализируем первые 100 строк для производительности
      .map(row => Object.values(row).join(' '))
      .join(' ');
    
    return EnhancedUnicodeFontService.analyzeText(combinedText);
  }, [state.parseResult]);

  // Обновляем fontAnalysis в state при изменении
  useEffect(() => {
    if (fontAnalysis && fontAnalysis !== state.fontAnalysis) {
      setState(prev => ({
        ...prev,
        fontAnalysis,
        options: {
          ...prev.options,
          fontFamily: fontAnalysis.recommendedFont as any
        }
      }));
    }
  }, [fontAnalysis, state.fontAnalysis]);

  // 📁 FILE UPLOAD HANDLER с улучшенной обработкой
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setState(prev => ({ ...prev, isProcessing: true, errors: [] }));

    try {
      // Валидация файла
      const validation = CsvToPdfConverter.validateCSV(file);
      if (!validation.isValid) {
        setState(prev => ({ ...prev, errors: validation.errors, isProcessing: false }));
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      // Парсинг CSV
      const result = await CsvToPdfConverter.parseCSV(file);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => 
          toast.error(`Parse warning: ${error.message}`)
        );
      }
      
      if (result.rowCount === 0) {
        toast.error('CSV file appears to be empty or has no valid data');
        setState(prev => ({ ...prev, isProcessing: false }));
        return;
      }

      // 🎯 Успешная загрузка - переходим в режим редактирования
      setState(prev => ({
        ...prev,
        csvFile: file,
        parseResult: result,
        step: 'edit',
        isProcessing: false,
        viewMode: 'split' // Автоматически показываем split view
      }));

      toast.success(
        `Successfully parsed ${result.rowCount} rows with ${result.columnCount} columns`
      );
      
    } catch (error) {
      const errorMessage = `Failed to parse CSV: ${error}`;
      setState(prev => ({ ...prev, errors: [errorMessage], isProcessing: false }));
      toast.error(errorMessage);
      console.error('CSV parsing error:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt', '.tsv'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // 🔄 DATA CHANGE HANDLER - для обновлений из LivePreviewEditor
  const handleDataChange = useCallback((newParseResult: CsvParseResult) => {
    setState(prev => ({
      ...prev,
      parseResult: newParseResult
    }));
  }, []);

  // ⚙️ OPTIONS CHANGE HANDLER
  const handleOptionsChange = useCallback((newOptions: CsvToPdfOptions) => {
    setState(prev => ({
      ...prev,
      options: newOptions
    }));
  }, []);

  // 📄 VIEW MODE HANDLERS
  const setViewMode = useCallback((mode: 'split' | 'editor' | 'preview') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  // 🔄 RESET HANDLER
  const resetConverter = useCallback(() => {
    setState({
      step: 'upload',
      csvFile: null,
      parseResult: null,
      options: {
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
      },
      fontAnalysis: null,
      isProcessing: false,
      viewMode: 'split',
      errors: []
    });
  }, []);

  // 💾 EXPORT HANDLER
  const handleExport = useCallback(async () => {
    if (!state.parseResult) return;

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const pdfBytes = await CsvToPdfConverter.convertToPDF(
        state.parseResult, 
        state.options
      );
      
      // Создание и скачивание файла
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.csvFile?.name.replace(/\.[^/.]+$/, '') || 'converted'}_enhanced.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('PDF exported successfully!');
      
    } catch (error) {
      toast.error(`Export failed: ${error}`);
      console.error('Export error:', error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.parseResult, state.options, state.csvFile]);

  // 🎨 ANIMATION VARIANTS
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <Helmet>
        <title>Enhanced CSV to PDF Converter - Live Preview & Multi-Language Support | ClientPDF Pro</title>
        <meta 
          name="description" 
          content="Advanced CSV to PDF converter with live preview, real-time editing, and automatic language detection. Support for 15+ languages including Russian, Latvian, Lithuanian." 
        />
        <meta name="keywords" content="CSV to PDF, live preview, multi-language, interactive editor, real-time conversion, Unicode support" />
        <link rel="canonical" href="https://localpdf.online/csv-to-pdf-enhanced" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container-modern py-6">
          
          {/* 🎯 ENHANCED HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <FileSpreadsheet className="w-12 h-12 text-blue-600 mr-3" />
                <Zap className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Enhanced CSV to PDF
                </h1>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Badge variant="primary" className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Live Preview
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    <Languages className="w-3 h-3 mr-1" />
                    15+ Languages
                  </Badge>
                  <Badge variant="success" className="flex items-center">
                    <Split className="w-3 h-3 mr-1" />
                    Interactive
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform your CSV data with live preview, real-time editing, and intelligent font selection for multiple languages
            </p>
          </motion.div>

          {/* 🆕 SMART PROGRESS INDICATOR */}
          {state.step !== 'upload' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className="p-4 glass-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      {state.parseResult?.rowCount.toLocaleString()} rows × {state.parseResult?.columnCount} columns
                    </div>
                    {state.fontAnalysis && (
                      <div className="flex items-center text-sm text-green-600">
                        <Languages className="w-4 h-4 mr-2" />
                        {state.fontAnalysis.detectedLanguages.join(', ')} detected
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetConverter}
                      className="flex items-center"
                    >
                      Upload New File
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={state.isProcessing || !state.parseResult}
                      className="flex items-center"
                      size="sm"
                    >
                      {state.isProcessing ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* 📁 UPLOAD STEP */}
          {state.step === 'upload' && (
            <motion.div
              key="upload"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 glass-card hover-lift max-w-4xl mx-auto">
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                    ${state.isProcessing ? 'pointer-events-none opacity-50' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  {state.isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Spinner size="lg" className="mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Processing CSV File...
                      </h3>
                      <p className="text-gray-500">
                        Analyzing structure, detecting language, and preparing preview
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-6">
                        <FileSpreadsheet className="w-20 h-20 text-blue-500" />
                        <Zap className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                        {isDragActive ? 'Drop your CSV file here' : 'Upload CSV for Live Preview'}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-lg">
                        Experience real-time editing and instant PDF preview with automatic language detection
                      </p>
                      
                      {/* 🆕 ENHANCED FEATURES PREVIEW */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-2xl">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-700">Live Preview</h4>
                          <p className="text-sm text-gray-500">See changes instantly</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <Languages className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-700">Smart Fonts</h4>
                          <p className="text-sm text-gray-500">Auto language detection</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <Maximize2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <h4 className="font-medium text-gray-700">Interactive</h4>
                          <p className="text-sm text-gray-500">Edit data directly</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        <Badge variant="secondary">.csv</Badge>
                        <Badge variant="secondary">.tsv</Badge>
                        <Badge variant="secondary">.txt</Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        Maximum file size: 100MB • All processing happens locally • Privacy protected
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {state.errors.length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <h4 className="text-red-700 font-medium">Upload Errors</h4>
                    </div>
                    <ul className="text-red-600 text-sm space-y-1">
                      {state.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* 🎯 LIVE EDITING STEP */}
          {state.step === 'edit' && state.parseResult && (
            <motion.div
              key="edit"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* 🎛️ VIEW MODE CONTROLS */}
              <Card className="p-4 glass-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-semibold text-gray-700">View Mode:</h3>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setViewMode('editor')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          state.viewMode === 'editor'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Data Editor
                      </button>
                      <button
                        onClick={() => setViewMode('split')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          state.viewMode === 'split'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Split View
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          state.viewMode === 'preview'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        PDF Preview
                      </button>
                    </div>
                  </div>

                  {/* 🆕 FONT INFO DISPLAY */}
                  {state.fontAnalysis && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Languages className="w-4 h-4 mr-1" />
                        Languages: {state.fontAnalysis.detectedLanguages.join(', ')}
                      </div>
                      <div className="flex items-center">
                        Font: {state.fontAnalysis.recommendedFont}
                      </div>
                      {state.fontAnalysis.needsTransliteration && (
                        <Badge variant="warning" className="text-xs">
                          {state.fontAnalysis.problemChars.length} chars need transliteration
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* 🚀 MAIN LIVE PREVIEW EDITOR */}
              <LivePreviewEditor
                parseResult={state.parseResult}
                options={state.options}
                fontAnalysis={state.fontAnalysis}
                viewMode={state.viewMode}
                onDataChange={handleDataChange}
                onOptionsChange={handleOptionsChange}
                isProcessing={state.isProcessing}
              />
            </motion.div>
          )}

          {/* 🆕 ENHANCED FEATURES SECTION - только на upload странице */}
          {state.step === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Next-Generation CSV to PDF Conversion
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Experience the future of data conversion with live preview, intelligent font selection, 
                  and support for 15+ languages including Cyrillic scripts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <Card className="p-6 text-center glass-card hover-lift">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                  <p className="text-gray-600 text-sm">
                    See your PDF update in real-time as you edit data and adjust styling options
                  </p>
                </Card>

                <Card className="p-6 text-center glass-card hover-lift">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Languages className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Language Detection</h3>
                  <p className="text-gray-600 text-sm">
                    Automatic detection and optimal font selection for Russian, Latvian, Lithuanian, and 12+ more languages
                  </p>
                </Card>

                <Card className="p-6 text-center glass-card hover-lift">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Maximize2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Interactive Editing</h3>
                  <p className="text-gray-600 text-sm">
                    Edit your data directly in the interface with drag & drop column reordering
                  </p>
                </Card>

                <Card className="p-6 text-center glass-card hover-lift">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Performance Optimized</h3>
                  <p className="text-gray-600 text-sm">
                    Handle large datasets with intelligent chunking and memory optimization
                  </p>
                </Card>

                <Card className="p-6 text-center glass-card hover-lift">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Advanced Styling</h3>
                  <p className="text-gray-600 text-sm">
                    Professional templates, custom themes, and fine-grained control over every aspect
                  </p>
                </Card>

                <Card className="p-6 text-center glass-card hover-lift">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
                  <p className="text-gray-600 text-sm">
                    All processing happens locally in your browser. Your data never leaves your device
                  </p>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedCSVToPDFPage;