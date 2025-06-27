/**
 * EnhancedCSVToPDFPage.tsx
 * 🚀 Революционный CSV to PDF конвертер с живым предпросмотром
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, Download, Zap, Sparkles, Globe, Palette, Eye, Upload,
  ArrowRight, RefreshCw, CheckCircle, RotateCcw, Users, Shield, Cpu
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { CsvToPdfConverter, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import { EnhancedUnicodeFontService } from '../services/EnhancedUnicodeFontService';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';
import LivePreviewEditor from '../components/enhanced/LivePreviewEditor';

interface EnhancedPageState {
  currentStep: 'upload' | 'edit' | 'export';
  csvFile: File | null;
  parseResult: CsvParseResult | null;
  detectedLanguage: {
    code: string;
    name: string;
    confidence: number;
    script: string;
  } | null;
  isAnalyzing: boolean;
  isParsing: boolean;
  isExporting: boolean;
}

export const EnhancedCSVToPDFPage: React.FC = () => {
  const [pageState, setPageState] = useState<EnhancedPageState>({
    currentStep: 'upload',
    csvFile: null,
    parseResult: null,
    detectedLanguage: null,
    isAnalyzing: false,
    isParsing: false,
    isExporting: false,
  });

  const updatePageState = useCallback((updates: Partial<EnhancedPageState>) => {
    setPageState(prev => ({ ...prev, ...updates }));
  }, []);

  const getLanguageName = (code: string): string => {
    const languageNames: Record<string, string> = {
      'auto': 'Auto-detect', 'en': 'English', 'ru': 'Русский', 'lv': 'Latviešu',
      'lt': 'Lietuvių', 'et': 'Eesti', 'pl': 'Polski', 'de': 'Deutsch',
      'fr': 'Français', 'es': 'Español', 'it': 'Italiano', 'zh': '中文',
      'ja': '日本語', 'ko': '한국어', 'ar': 'العربية', 'hi': 'हिन्दी'
    };
    return languageNames[code] || code.toUpperCase();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = CsvToPdfConverter.validateCSV(file);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    updatePageState({ csvFile: file, isParsing: true });

    try {
      const result = await CsvToPdfConverter.parseCSV(file);
      
      if (result.rowCount === 0) {
        toast.error('CSV file appears to be empty');
        updatePageState({ isParsing: false });
        return;
      }

      updatePageState({ isAnalyzing: true });
      
      const sampleTexts = result.data.slice(0, 10).flatMap(row => 
        Object.values(row).filter(val => val && typeof val === 'string')
      );
      
      const textAnalysis = EnhancedUnicodeFontService.analyzeText(sampleTexts.join(' '));
      
      const detectedLanguage = {
        code: textAnalysis.detectedLanguages[0] || 'en',
        name: getLanguageName(textAnalysis.detectedLanguages[0] || 'en'),
        confidence: 0.85,
        script: textAnalysis.hasCyrillic ? 'cyrillic' : 'latin'
      };

      updatePageState({
        parseResult: result,
        detectedLanguage: detectedLanguage,
        isParsing: false,
        isAnalyzing: false,
        currentStep: 'edit'
      });

      toast.success(`✅ Parsed ${result.rowCount} rows, detected ${detectedLanguage.name}`, { 
        duration: 4000, icon: '🌍' 
      });

    } catch (error) {
      console.error('CSV analysis failed:', error);
      toast.error(`Failed to analyze CSV: ${error}`);
      updatePageState({ isParsing: false, isAnalyzing: false });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt', '.tsv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleBackToUpload = useCallback(() => {
    updatePageState({
      currentStep: 'upload',
      csvFile: null,
      parseResult: null,
      detectedLanguage: null
    });
  }, [updatePageState]);

  const handleExportPDF = useCallback(async (pdfBlob: Blob, filename: string) => {
    updatePageState({ isExporting: true });
    
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('🎉 PDF exported successfully!', { duration: 3000, icon: '📄' });
      updatePageState({ currentStep: 'export' });
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error}`);
    } finally {
      updatePageState({ isExporting: false });
    }
  }, [updatePageState]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderUploadScreen = () => (
    <motion.div
      key="upload"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="relative">
            <FileSpreadsheet className="w-16 h-16 text-blue-600" />
            <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Enhanced CSV to PDF Converter
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto"
        >
          Transform your CSV data into professional PDF tables with live preview, 
          automatic language detection, and support for 15+ languages.
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900 mb-1">Live Preview</h3>
          <p className="text-sm text-blue-700">Real-time PDF updates</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900 mb-1">Auto Language</h3>
          <p className="text-sm text-green-700">15+ languages support</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900 mb-1">Smart Styling</h3>
          <p className="text-sm text-purple-700">Professional templates</p>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h3 className="font-semibold text-orange-900 mb-1">Lightning Fast</h3>
          <p className="text-sm text-orange-700">Client-side processing</p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-8 glass-card hover-lift">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
              ${(pageState.isParsing || pageState.isAnalyzing) ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            
            {pageState.isParsing || pageState.isAnalyzing ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Spinner size="lg" className="text-blue-600" />
                  <RefreshCw className="w-6 h-6 text-blue-400 absolute inset-0 m-auto animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {pageState.isParsing ? 'Parsing CSV File...' : 'Analyzing Language...'}
                </h3>
                <p className="text-gray-500">
                  {pageState.isParsing 
                    ? 'Reading data structure and validating content'
                    : 'Detecting language and selecting optimal fonts'
                  }
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <Upload className="w-16 h-16 text-blue-500" />
                  {isDragActive && (
                    <ArrowRight className="w-6 h-6 text-blue-600 absolute -right-8 top-5 animate-bounce" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragActive ? 'Drop your file here!' : 'Upload CSV File'}
                </h3>
                
                <p className="text-gray-500 mb-6">
                  Drag and drop or click to select your CSV, TSV, or Excel file
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge variant="secondary">.csv</Badge>
                  <Badge variant="secondary">.tsv</Badge>
                  <Badge variant="secondary">.txt</Badge>
                  <Badge variant="secondary">.xls</Badge>
                  <Badge variant="secondary">.xlsx</Badge>
                </div>
                
                <p className="text-sm text-gray-400">
                  Maximum file size: 50MB • All processing happens locally in your browser
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderEditScreen = () => {
    if (!pageState.csvFile || !pageState.parseResult) return null;

    return (
      <motion.div
        key="edit"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <LivePreviewEditor
          csvFile={pageState.csvFile}
          parseResult={pageState.parseResult}
          onBack={handleBackToUpload}
          onExport={handleExportPDF}
          className="h-full"
        />
      </motion.div>
    );
  };

  const renderExportScreen = () => (
    <motion.div
      key="export"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-12 h-12 text-green-600" />
      </motion.div>
      
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-gray-900 mb-4"
      >
        PDF Successfully Generated! 🎉
      </motion.h2>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-gray-600 mb-8"
      >
        Your CSV has been converted to a professional PDF with {pageState.detectedLanguage?.name} language support.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button onClick={handleBackToUpload} variant="secondary" className="flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" />
          Convert Another File
        </Button>
        
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          Download Again
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Enhanced CSV to PDF Converter - Live Preview & Multi-Language Support | ClientPDF Pro</title>
        <meta 
          name="description" 
          content="Advanced CSV to PDF converter with live preview, automatic language detection, and support for 15+ languages including Russian, Latvian, Lithuanian. Real-time editing with professional styling options." 
        />
        <meta name="keywords" content="CSV to PDF, live preview, multi-language, Russian CSV, Latvian CSV, Unicode support, real-time conversion, interactive editor, drag drop CSV, professional PDF tables" />
        <link rel="canonical" href="https://localpdf.online/enhanced-csv-to-pdf" />
        <meta property="og:title" content="Enhanced CSV to PDF Converter - Live Preview & Multi-Language" />
        <meta property="og:description" content="Convert CSV files to professional PDFs with live preview, automatic language detection, and support for 15+ languages. Interactive editing with real-time updates." />
        <meta property="og:url" content="https://localpdf.online/enhanced-csv-to-pdf" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Enhanced CSV to PDF Converter | ClientPDF Pro" />
        <meta name="twitter:description" content="Professional CSV to PDF conversion with live preview and multi-language support" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {pageState.currentStep !== 'edit' && (
          <div className="container-modern py-8">
            <AnimatePresence mode="wait">
              {pageState.currentStep === 'upload' && renderUploadScreen()}
              {pageState.currentStep === 'export' && renderExportScreen()}
            </AnimatePresence>
          </div>
        )}
        
        {pageState.currentStep === 'edit' && renderEditScreen()}

        {pageState.currentStep === 'upload' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="container-modern py-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Enhanced CSV to PDF?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the next generation of CSV to PDF conversion with cutting-edge features
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <Card className="p-8 text-center glass-card hover-lift">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                  <p className="text-gray-600">
                    See your PDF update in real-time as you make changes. No more guessing what the final result will look like.
                  </p>
                </Card>

                <Card className="p-8 text-center glass-card hover-lift">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Smart Language Detection</h3>
                  <p className="text-gray-600">
                    Automatically detects languages and selects optimal fonts for perfect rendering of international characters.
                  </p>
                </Card>

                <Card className="p-8 text-center glass-card hover-lift">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Palette className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Professional Styling</h3>
                  <p className="text-gray-600">
                    Choose from multiple table styles, fonts, and layouts to create professional-looking PDF documents.
                  </p>
                </Card>

                <Card className="p-8 text-center glass-card hover-lift">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Privacy Protected</h3>
                  <p className="text-gray-600">
                    All processing happens locally in your browser. Your data never leaves your device, ensuring complete privacy.
                  </p>
                </Card>

                <Card className="p-8 text-center glass-card hover-lift">
                  <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
                  <p className="text-gray-600">
                    Optimized performance with instant processing. Handle large CSV files with thousands of rows effortlessly.
                  </p>
                </Card>

                <Card className="p-8 text-center glass-card hover-lift">
                  <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">User-Friendly</h3>
                  <p className="text-gray-600">
                    Intuitive interface with drag & drop support. No technical knowledge required - just upload and convert.
                  </p>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white py-16"
            >
              <div className="container-modern">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Comprehensive Language Support
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Perfect rendering for international content with automatic language detection
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                    { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
                    { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
                    { code: 'et', name: 'Eesti', flag: '🇪🇪' },
                    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
                    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' },
                    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                    { code: 'zh', name: '中文', flag: '🇨🇳' },
                    { code: 'ja', name: '日本語', flag: '🇯🇵' },
                    { code: 'ko', name: '한국어', flag: '🇰🇷' },
                    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
                    { code: 'more', name: 'And more...', flag: '🌍' }
                  ].map((lang) => (
                    <Card key={lang.code} className="p-3 text-center hover-lift bg-gray-50 border-gray-200">
                      <div className="text-2xl mb-2">{lang.flag}</div>
                      <div className="text-sm font-medium text-gray-700">{lang.name}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
};

export default EnhancedCSVToPDFPage;