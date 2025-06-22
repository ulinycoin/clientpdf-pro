import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Settings, Eye, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { CsvToPdfConverter, CsvToPdfOptions, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';

interface ConversionStep {
  id: 'upload' | 'preview' | 'options' | 'convert';
  title: string;
  completed: boolean;
}

export const CSVToPDFPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ConversionStep['id']>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<CsvToPdfOptions>({
    orientation: 'landscape',
    pageSize: 'a4',
    fontSize: 8,
    tableStyle: 'grid',
    headerStyle: 'bold',
    fitToPage: true,
    includeRowNumbers: false,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  });

  const steps: ConversionStep[] = [
    { id: 'upload', title: 'Upload CSV', completed: csvFile !== null },
    { id: 'preview', title: 'Preview Data', completed: parseResult !== null },
    { id: 'options', title: 'Configure Options', completed: false },
    { id: 'convert', title: 'Generate PDF', completed: false },
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
      setCurrentStep('preview');
      toast.success(`Successfully parsed ${result.rowCount} rows with ${result.columnCount} columns`);
      
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error}`);
      console.error('CSV parsing error:', error);
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

  const handleConvert = async () => {
    if (!parseResult) return;

    setIsConverting(true);
    
    try {
      const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult, conversionOptions);
      
      // Создание blob и скачивание
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${csvFile?.name.replace(/\.[^/.]+$/, '') || 'converted'}_table.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('PDF generated successfully!');
      
    } catch (error) {
      toast.error(`Conversion failed: ${error}`);
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const resetConverter = () => {
    setCsvFile(null);
    setParseResult(null);
    setCurrentStep('upload');
    setIsConverting(false);
    setIsParsing(false);
  };

  // 🔥 КРИТИЧЕСКИ ВАЖНЫЕ ИНЛАЙН СТИЛИ для гарантированной работы прокрутки
  const tableContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    position: 'relative',
    marginTop: '1rem',
    marginBottom: '1rem'
  };

  const tableWrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    WebkitOverflowScrolling: 'touch'
  };

  const tableStyle: React.CSSProperties = {
    width: 'max-content',
    minWidth: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    whiteSpace: 'nowrap',
    fontSize: '14px'
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'top',
    width: '180px',
    minWidth: '150px',
    maxWidth: '250px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'keep-all'
  };

  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    color: '#374151',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const scrollIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '12px',
    color: '#6b7280',
    whiteSpace: 'nowrap',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb'
  };

  return (
    <>
      <Helmet>
        <title>CSV to PDF Converter - Convert CSV Files to PDF Tables | ClientPDF Pro</title>
        <meta 
          name="description" 
          content="Convert CSV files to beautifully formatted PDF tables. Support for custom styling, multiple orientations, and large datasets. Free online CSV to PDF converter with privacy protection." 
        />
        <meta name="keywords" content="CSV to PDF, convert CSV, table to PDF, spreadsheet converter, data visualization, CSV parser, online converter" />
        <link rel="canonical" href="https://localpdf.online/csv-to-pdf" />
        <meta property="og:title" content="CSV to PDF Converter - Professional Table Generation" />
        <meta property="og:description" content="Transform your CSV data into professional PDF tables with custom styling options. Fast, secure, and completely client-side processing." />
        <meta property="og:url" content="https://localpdf.online/csv-to-pdf" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CSV to PDF Converter | ClientPDF Pro" />
        <meta name="twitter:description" content="Convert CSV files to formatted PDF tables with professional styling options" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container-modern py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-12 h-12 text-blue-600 mr-3 float-animation" />
              <h1 className="text-4xl font-bold text-gray-900">CSV to PDF Converter</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your CSV data into professional PDF tables with custom styling and formatting options
            </p>
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
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${currentStep === step.id 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : step.completed 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span className={`
                    ml-2 text-sm font-medium
                    ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {currentStep === 'upload' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-8 glass-card hover-lift">
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                      ${isDragActive 
                        ? 'border-blue-500 bg-blue-50' 
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
                          Parsing CSV File...
                        </h3>
                        <p className="text-gray-500">
                          Analyzing data structure and validating content
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileSpreadsheet className="w-16 h-16 text-blue-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Drag and drop or click to select your CSV, TSV, or TXT file
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary">.csv</Badge>
                          <Badge variant="secondary">.tsv</Badge>
                          <Badge variant="secondary">.txt</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                          Maximum file size: 50MB • All processing happens locally
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStep === 'preview' && parseResult && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* File Info */}
                <Card className="p-6 glass-card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Data Preview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{parseResult.rowCount}</div>
                      <div className="text-sm text-gray-500">Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{parseResult.columnCount}</div>
                      <div className="text-sm text-gray-500">Columns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{parseResult.delimiter}</div>
                      <div className="text-sm text-gray-500">Delimiter</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{parseResult.encoding}</div>
                      <div className="text-sm text-gray-500">Encoding</div>
                    </div>
                  </div>

                  {/* 🚨 BULLETPROOF TABLE WITH INLINE STYLES - АБСОЛЮТНО ГАРАНТИРОВАННАЯ ПРОКРУТКА */}
                  <div style={tableContainerStyle}>
                    <div style={tableWrapperStyle}>
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            {parseResult.headers.map((header, index) => (
                              <th 
                                key={index} 
                                title={header}
                                style={{
                                  ...headerStyle,
                                  borderRight: index === parseResult.headers.length - 1 ? 'none' : '1px solid #e5e7eb'
                                }}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.data.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9fafb' }}>
                              {parseResult.headers.map((header, colIndex) => (
                                <td 
                                  key={colIndex} 
                                  title={String(row[header] || '')}
                                  style={{
                                    ...cellStyle,
                                    borderRight: colIndex === parseResult.headers.length - 1 ? 'none' : '1px solid #e5e7eb'
                                  }}
                                >
                                  {String(row[header] || '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={scrollIndicatorStyle}>
                      ← Scroll horizontally to see more columns →
                    </div>
                  </div>
                  
                  {parseResult.rowCount > 5 && (
                    <p className="text-sm text-gray-500 mt-6 text-center">
                      Showing first 5 rows of {parseResult.rowCount} total rows
                    </p>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary" onClick={resetConverter} className="btn-secondary-modern">
                      Upload Different File
                    </Button>
                    <Button onClick={() => setCurrentStep('options')} className="btn-primary-modern">
                      Configure PDF Options
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStep === 'options' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="p-6 glass-card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    PDF Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Page Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Orientation
                      </label>
                      <select
                        value={conversionOptions.orientation}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          orientation: e.target.value as 'portrait' | 'landscape'
                        }))}
                        className="modern-input"
                      >
                        <option value="landscape">Landscape (Recommended for tables)</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Size
                      </label>
                      <select
                        value={conversionOptions.pageSize}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          pageSize: e.target.value as any
                        }))}
                        className="modern-input"
                      >
                        <option value="a4">A4</option>
                        <option value="a3">A3</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal</option>
                      </select>
                    </div>

                    {/* Table Style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Table Style
                      </label>
                      <select
                        value={conversionOptions.tableStyle}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          tableStyle: e.target.value as any
                        }))}
                        className="modern-input"
                      >
                        <option value="grid">Grid (with borders)</option>
                        <option value="striped">Striped rows</option>
                        <option value="minimal">Minimal</option>
                        <option value="plain">Plain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size: {conversionOptions.fontSize}pt
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="16"
                        value={conversionOptions.fontSize}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          fontSize: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>

                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={conversionOptions.title || ''}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          title: e.target.value || undefined
                        }))}
                        placeholder="Enter a title for your PDF document"
                        className="modern-input"
                      />
                    </div>

                    {/* Options */}
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={conversionOptions.includeRowNumbers}
                          onChange={(e) => setConversionOptions(prev => ({
                            ...prev,
                            includeRowNumbers: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Include row numbers
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary" onClick={() => setCurrentStep('preview')} className="btn-secondary-modern">
                      Back to Preview
                    </Button>
                    <Button 
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="btn-primary-modern flex items-center"
                    >
                      {isConverting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose Our CSV to PDF Converter?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Transform your spreadsheet data into professional PDF documents with advanced formatting options
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Parsing</h3>
                <p className="text-gray-600 text-sm">
                  Automatically detects delimiters, encoding, and data types for accurate conversion
                </p>
              </Card>

              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Customizable Styling</h3>
                <p className="text-gray-600 text-sm">
                  Multiple table styles, fonts, orientations, and formatting options
                </p>
              </Card>

              <Card className="p-6 text-center glass-card hover-lift">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Privacy Protected</h3>
                <p className="text-gray-600 text-sm">
                  All processing happens locally in your browser. Your data never leaves your device
                </p>
              </Card>
            </div>
          </motion.div>

          {/* SEO Content Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <Card className="p-8 glass-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional CSV to PDF Conversion
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-4">
                  Convert your CSV (Comma-Separated Values) files into professionally formatted PDF tables with our advanced online converter. 
                  Perfect for creating reports, sharing data, or archiving spreadsheet information in a universal format.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features:</h3>
                <ul className="text-gray-600 space-y-1 mb-4">
                  <li>• Support for CSV, TSV, and TXT files with automatic delimiter detection</li>
                  <li>• Multiple PDF styling options including grid, striped, minimal, and plain formats</li>
                  <li>• Customizable page orientation (portrait/landscape) and sizes (A4, A3, Letter, Legal)</li>
                  <li>• Adjustable font sizes and table formatting options</li>
                  <li>• Optional row numbering and document titles</li>
                  <li>• Large file support up to 50MB with efficient processing</li>
                  <li>• Complete privacy protection - all processing happens locally</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect for:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Business reports and data presentations</li>
                  <li>• Academic research and documentation</li>
                  <li>• Financial statements and analytics</li>
                  <li>• Inventory lists and catalogs</li>
                  <li>• Survey results and statistical data</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CSVToPDFPage;