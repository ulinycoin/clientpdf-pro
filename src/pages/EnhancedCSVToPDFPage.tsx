import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Upload, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { CsvToPdfConverter, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import ElegantCSVConverter from '../components/enhanced/ElegantCSVConverter';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';

interface ConversionStep {
  id: 'upload' | 'edit' | 'export';
  title: string;
  completed: boolean;
}

export const EnhancedCSVToPDFPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ConversionStep['id']>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const steps: ConversionStep[] = [
    { id: 'upload', title: 'Upload & Parse', completed: csvFile !== null },
    { id: 'edit', title: 'Preview & Style', completed: parseResult !== null },
    { id: 'export', title: 'Export PDF', completed: false },
  ];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = CsvToPdfConverter.validateCSV(file);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setCsvFile(file);
    setIsParsing(true);
    
    try {
      console.log('🔍 Starting elegant CSV parsing...');
      
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

      // Преобразуем результат для ElegantCSVConverter
      const elegantParseResult = {
        data: result.data.map(row => 
          result.headers.map(header => String(row[header] || ''))
        ),
        headers: result.headers,
        rowCount: result.rowCount,
        columnCount: result.columnCount,
        reportTitle: result.reportTitle,
        delimiter: result.delimiter,
        errors: result.errors
      };

      setParseResult(elegantParseResult);
      setCurrentStep('edit');
      
      console.log('✅ Elegant CSV parsing completed:', {
        rows: result.rowCount,
        columns: result.columnCount,
        reportTitle: result.reportTitle,
        delimiter: result.delimiter
      });
      
      toast.success(
        `🎉 Successfully parsed ${result.rowCount} rows with ${result.columnCount} columns`,
        { duration: 4000 }
      );
      
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error}`);
      console.error('❌ Elegant CSV parsing failed:', error);
    } finally {
      setIsParsing(false);
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

  const handleExport = useCallback((blob: Blob) => {
    if (!csvFile || !parseResult) return;

    setIsExporting(true);
    
    try {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate elegant filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const baseName = csvFile.name.replace(/\.[^/.]+$/, '');
      const fileName = `${baseName}_elegant_${timestamp}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setCurrentStep('export');
      
      toast.success(
        `✨ PDF exported elegantly as ${fileName}!`,
        { duration: 5000 }
      );
      
      console.log('📄 Elegant PDF export completed:', {
        fileName,
        fileSize: `${(blob.size / 1024).toFixed(1)}KB`,
        originalRows: parseResult.rowCount
      });
      
    } catch (error) {
      toast.error(`Export failed: ${error}`);
      console.error('❌ Elegant PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [csvFile, parseResult]);

  const resetConverter = () => {
    setCsvFile(null);
    setParseResult(null);
    setCurrentStep('upload');
    setIsParsing(false);
    setIsExporting(false);
  };

  return (
    <>
      <Helmet>
        <title>CSV to PDF Converter - Elegant Editor with Live Preview | LocalPDF</title>
        <meta 
          name="description" 
          content="Transform CSV files into beautiful PDF tables with our elegant editor. Features live preview, smart language detection, beautiful themes, and automatic optimization." 
        />
        <meta name="keywords" content="CSV to PDF, elegant editor, live preview, smart detection, beautiful themes, auto optimization, CSV converter" />
        <link rel="canonical" href="https://localpdf.online/csv-to-pdf" />
        <meta property="og:title" content="CSV to PDF Converter - Elegant Editor with Live Preview" />
        <meta property="og:description" content="Beautiful CSV to PDF conversion with live preview, smart language detection, and elegant themes. Simple workflow, maximum impact." />
        <meta property="og:url" content="https://localpdf.online/csv-to-pdf" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CSV to PDF Converter - Elegant Editor | LocalPDF" />
        <meta name="twitter:description" content="Elegant CSV to PDF editor with smart detection and beautiful themes. Simple but sophisticated." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container-modern py-8">
          {/* Elegant Header */}
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
                Elegant CSV to PDF
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your CSV data into beautiful PDF tables with our elegant editor featuring 
              <span className="text-blue-600 font-semibold"> smart detection</span>, 
              <span className="text-green-600 font-semibold"> live preview</span>, and 
              <span className="text-purple-600 font-semibold"> beautiful themes</span>
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="primary" className="flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                Smart Detection
              </Badge>
              <Badge variant="secondary">Live Preview</Badge>
              <Badge variant="success">Beautiful Themes</Badge>
              <Badge variant="warning">Auto Optimization</Badge>
            </div>
          </motion.div>

          {/* Progress Steps */}
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

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            {currentStep === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="p-8 glass-card hover-lift">
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                      ${isDragActive 
                        ? 'border-blue-500 bg-blue-50 scale-105' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }
                      ${isParsing ? 'pointer-events-none opacity-50' : ''}
                    `}
                  >
                    <input {...getInputProps()} />
                    {isParsing ? (
                      <div className="flex flex-col items-center">
                        <Spinner size="lg" className="mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          Preparing Elegant Experience...
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
                          {isDragActive ? 'Drop your CSV file here' : 'Upload CSV for Elegant Processing'}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                          Drag and drop or click to select your CSV, TSV, or TXT file. 
                          Our elegant engine will automatically detect language and apply beautiful formatting.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
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

                {/* Elegant Features Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                    ✨ Elegant Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center glass-card hover-lift">
                      <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">🧠 Smart Detection</h3>
                      <p className="text-gray-600 text-sm">
                        Automatically detects Русский, Latviešu, 中文, العربية and suggests perfect fonts and formatting
                      </p>
                    </Card>
                    <Card className="p-6 text-center glass-card hover-lift">
                      <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">👁️ Live Preview</h3>
                      <p className="text-gray-600 text-sm">
                        See your PDF update instantly as you adjust settings with real-time feedback
                      </p>
                    </Card>
                    <Card className="p-6 text-center glass-card hover-lift">
                      <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">🎨 Beautiful Themes</h3>
                      <p className="text-gray-600 text-sm">
                        Choose from Clean, Modern, or Minimal themes - all optimized for professional results
                      </p>
                    </Card>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 'edit' && parseResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[calc(100vh-300px)]"
              >
                <ElegantCSVConverter
                  parseResult={parseResult}
                  onExport={handleExport}
                  className="h-full"
                />
              </motion.div>
            )}

            {currentStep === 'export' && (
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
                    ✨ Beautiful PDF Created!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your CSV has been transformed into an elegant PDF with smart formatting, 
                    optimized fonts, and beautiful design.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={resetConverter}
                      variant="secondary"
                      className="btn-secondary-modern"
                    >
                      Create Another Beautiful PDF
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedCSVToPDFPage;