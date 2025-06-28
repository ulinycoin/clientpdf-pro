import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Upload, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { CsvToPdfConverter, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import LivePreviewEditor from '../components/enhanced/LivePreviewEditor';
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
    { id: 'edit', title: 'Edit & Style', completed: parseResult !== null },
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
      console.log('🔍 Starting enhanced CSV parsing...');
      
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

      setParseResult(result);
      setCurrentStep('edit');
      
      console.log('✅ Enhanced CSV parsing completed:', {
        rows: result.rowCount,
        columns: result.columnCount,
        reportTitle: result.reportTitle,
        delimiter: result.delimiter
      });
      
      toast.success(
        `Successfully parsed ${result.rowCount} rows with ${result.columnCount} columns`,
        { duration: 4000 }
      );
      
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error}`);
      console.error('❌ Enhanced CSV parsing failed:', error);
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

  const handleDataChange = useCallback((updatedData: CsvParseResult) => {
    setParseResult(updatedData);
    console.log('📝 Data updated in LivePreviewEditor:', {
      rows: updatedData.rowCount,
      columns: updatedData.columnCount
    });
  }, []);

  const handleExport = useCallback((blob: Blob) => {
    if (!csvFile || !parseResult) return;

    setIsExporting(true);
    
    try {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const baseName = csvFile.name.replace(/\.[^/.]+$/, '');
      const fileName = `${baseName}_enhanced_${timestamp}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setCurrentStep('export');
      
      toast.success(
        `PDF exported successfully as ${fileName}!`,
        { duration: 5000 }
      );
      
      console.log('📄 Enhanced PDF export completed:', {
        fileName,
        fileSize: `${(blob.size / 1024).toFixed(1)}KB`,
        originalRows: parseResult.rowCount
      });
      
    } catch (error) {
      toast.error(`Export failed: ${error}`);
      console.error('❌ Enhanced PDF export failed:', error);
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
        <title>CSV to PDF Converter - Interactive Editor with Live Preview | LocalPDF</title>
        <meta 
          name="description" 
          content="Transform CSV files into professional PDF tables with our enhanced interactive editor. Features live preview, multi-language support, real-time editing, and Unicode support." 
        />
        <meta name="keywords" content="CSV to PDF, interactive editor, live preview, multi-language, Unicode support, real-time editing, CSV converter, table generator" />
        <link rel="canonical" href="https://localpdf.online/csv-to-pdf" />
        <meta property="og:title" content="CSV to PDF Converter - Interactive Editor with Live Preview" />
        <meta property="og:description" content="Professional CSV to PDF conversion with live preview, multi-language support, and interactive editing capabilities. Process files locally in your browser." />
        <meta property="og:url" content="https://localpdf.online/csv-to-pdf" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CSV to PDF Converter - Interactive Editor | LocalPDF" />
        <meta name="twitter:description" content="Interactive CSV to PDF editor with live preview and multi-language support. Privacy-first processing in your browser." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container-modern py-8">
          {/* Enhanced Header */}
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
                CSV to PDF Converter
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your CSV data into professional PDF tables with our enhanced interactive editor featuring 
              <span className="text-blue-600 font-semibold"> live preview</span>, 
              <span className="text-green-600 font-semibold"> multi-language support</span>, and 
              <span className="text-purple-600 font-semibold"> real-time editing</span>
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="primary" className="flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                Multi-Language
              </Badge>
              <Badge variant="secondary">Live Preview</Badge>
              <Badge variant="success">Interactive Editing</Badge>
              <Badge variant="warning">Unicode Support</Badge>
            </div>
          </motion.div>

          {/* Enhanced Progress Steps */}
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
                          Processing CSV with Enhanced Engine...
                        </h3>
                        <p className="text-gray-500">
                          Analyzing data structure, detecting language, and preparing for editing
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
                          {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File for Enhanced Processing'}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                          Drag and drop or click to select your CSV, TSV, or TXT file. 
                          Our enhanced engine will automatically detect language and optimize formatting.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          <Badge variant="secondary">.csv</Badge>
                          <Badge variant="secondary">.tsv</Badge>
                          <Badge variant="secondary">.txt</Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Maximum file size: 100MB • Multi-language support • Privacy protected
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Enhanced Features Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                    Enhanced Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center glass-card hover-lift">
                      <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Auto Language Detection</h3>
                      <p className="text-gray-600 text-sm">
                        Automatically detects Русский, Latviešu, Lietuvių, Polski, and other languages with optimal font selection
                      </p>
                    </Card>
                    <Card className="p-6 text-center glass-card hover-lift">
                      <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                      <p className="text-gray-600 text-sm">
                        See your PDF in real-time as you edit data and adjust formatting options
                      </p>
                    </Card>
                    <Card className="p-6 text-center glass-card hover-lift">
                      <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Interactive Editor</h3>
                      <p className="text-gray-600 text-sm">
                        Edit data directly in the interface with professional styling and theme options
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
                <LivePreviewEditor
                  parseResult={parseResult}
                  onDataChange={handleDataChange}
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
                    PDF Successfully Generated!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your enhanced CSV has been converted to a professional PDF with optimized formatting and multi-language support.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={resetConverter}
                      variant="secondary"
                      className="btn-secondary-modern"
                    >
                      Convert Another File
                    </Button>
                    <Button 
                      onClick={() => parseResult && handleExport(new Blob())}
                      disabled={isExporting}
                      className="btn-primary-modern"
                    >
                      {isExporting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Again
                        </>
                      )}
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