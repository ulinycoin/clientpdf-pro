/**
 * EnhancedCSVToPDFPage.tsx  
 * Модернизированная страница CSV to PDF с интерактивным редактором
 * Сохраняет существующий функционал + добавляет новые возможности
 * Улучшенная стилизация с fallback для стабильного отображения
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Settings, Eye, AlertCircle, Zap, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

import { CsvToPdfConverter, CsvToPdfOptions, CsvParseResult } from '../services/converters/CsvToPdfConverter';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';

// Динамический импорт для избежания проблем с циклическими зависимостями
const LivePreviewEditor = React.lazy(() => import('../components/enhanced/LivePreviewEditor'));

interface ConversionStep {
  id: 'upload' | 'preview' | 'options' | 'convert' | 'interactive';
  title: string;
  completed: boolean;
}

type EditorMode = 'classic' | 'interactive';

export const EnhancedCSVToPDFPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ConversionStep['id']>('upload');
  const [editorMode, setEditorMode] = useState<EditorMode>('interactive');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<CsvToPdfOptions>({
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
  });

  const steps: ConversionStep[] = [
    { id: 'upload', title: 'Upload CSV', completed: csvFile !== null },
    { id: 'preview', title: 'Preview Data', completed: parseResult !== null },
    { id: 'interactive', title: 'Interactive Editor', completed: false },
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
      
      // 🆕 Автоматически переходим в интерактивный режим для больших файлов
      if (editorMode === 'interactive' || result.rowCount > 100) {
        setCurrentStep('interactive');
        toast.success(`🎉 Interactive editor ready! ${result.rowCount} rows with ${result.columnCount} columns`);
      } else {
        setCurrentStep('preview');
        toast.success(`Successfully parsed ${result.rowCount} rows with ${result.columnCount} columns`);
      }
      
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error}`);
      console.error('CSV parsing error:', error);
    } finally {
      setIsParsing(false);
    }
  }, [editorMode]);

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

  const handleInteractiveExport = (pdfBlob: Blob, filename: string) => {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('PDF exported successfully!');
  };

  // Inline стили для надежности отображения
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    fontFamily: 'Inter, sans-serif'
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#111827',
    margin: '1rem 0',
    lineHeight: '2.5rem'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: '#4b5563',
    maxWidth: '42rem',
    margin: '0 auto',
    lineHeight: '1.75rem'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease'
  };

  const uploadZoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragActive ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '0.5rem',
    padding: '3rem',
    textAlign: 'center',
    cursor: isParsing ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isDragActive ? '#f0f9ff' : 'transparent',
    opacity: isParsing ? 0.5 : 1
  };

  const stepIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  };

  // 🆕 Переключатель режимов с улучшенными стилями
  const renderModeToggle = () => (
    <div style={{
      marginBottom: '1.5rem',
      padding: '1rem',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
      borderRadius: '0.5rem',
      border: '1px solid #e9d5ff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            padding: '0.5rem', 
            backgroundColor: '#e9d5ff', 
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} style={{ color: '#9333ea' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '1rem' }}>
              Editor Mode
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0.25rem 0 0 0' }}>
              Choose between classic step-by-step or interactive live-preview editing
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: editorMode === 'classic' ? '#111827' : '#6b7280'
            }}>
              Classic
            </span>
            <button
              onClick={() => setEditorMode(editorMode === 'classic' ? 'interactive' : 'classic')}
              style={{ 
                padding: '0.25rem', 
                color: '#9333ea', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {editorMode === 'classic' ? <ToggleLeft size={32} /> : <ToggleRight size={32} />}
            </button>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: editorMode === 'interactive' ? '#111827' : '#6b7280'
            }}>
              Interactive
            </span>
          </div>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: editorMode === 'interactive' ? '#d1fae5' : '#f3f4f6',
            color: editorMode === 'interactive' ? '#065f46' : '#374151'
          }}>
            {editorMode === 'interactive' ? (
              <>
                <Zap size={12} style={{ marginRight: '0.25rem' }} />
                Live Preview
              </>
            ) : (
              'Step-by-Step'
            )}
          </div>
        </div>
      </div>

      {editorMode === 'interactive' && (
        <div style={{ 
          marginTop: '0.75rem', 
          padding: '0.75rem', 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          border: '1px solid #e9d5ff' 
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: '#9333ea', marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem' }}>
              <span style={{ fontWeight: '500', color: '#7c3aed' }}>Interactive Mode Features:</span>
              <span style={{ color: '#8b5cf6', marginLeft: '0.25rem' }}>
                Live PDF preview • Inline data editing • Smart font detection • Real-time styling • Template gallery
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 🎯 Рендер интерактивного редактора
  if (currentStep === 'interactive' && parseResult && csvFile && editorMode === 'interactive') {
    return (
      <React.Suspense 
        fallback={
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ color: '#4b5563', fontSize: '1rem' }}>Loading Interactive Editor...</span>
          </div>
        }
      >
        <LivePreviewEditor
          csvFile={csvFile}
          parseResult={parseResult}
          onBack={() => setCurrentStep('upload')}
          onExport={handleInteractiveExport}
        />
      </React.Suspense>
    );
  }

  // Основные стили для таблицы (сохраняем из оригинала)
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
    overflowY: 'auto',
    maxHeight: '500px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    WebkitOverflowScrolling: 'touch'
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <Helmet>
        <title>Enhanced CSV to PDF Converter - Interactive Editor | ClientPDF Pro</title>
        <meta 
          name="description" 
          content="Convert CSV files to PDF with our interactive editor featuring live preview, multi-language support, and professional styling options. Real-time editing and smart font detection." 
        />
        <meta name="keywords" content="CSV to PDF, interactive editor, live preview, multi-language, font detection, real-time editing" />
        <link rel="canonical" href="https://localpdf.online/enhanced-csv-to-pdf" />
        <meta property="og:title" content="Enhanced CSV to PDF Converter - Interactive Live Preview Editor" />
        <meta property="og:description" content="Transform CSV data into professional PDFs with our interactive editor featuring live preview, smart language detection, and real-time styling." />
      </Helmet>

      <div style={containerStyle}>
        <div style={contentStyle}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={headerStyle}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ animation: 'float 3s ease-in-out infinite' }}>
                <FileSpreadsheet size={48} style={{ color: '#2563eb' }} />
              </div>
              <h1 style={titleStyle}>Enhanced CSV to PDF</h1>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: '#d1fae5',
                color: '#065f46'
              }}>
                <Sparkles size={16} style={{ marginRight: '0.25rem' }} />
                New!
              </div>
            </div>
            <p style={subtitleStyle}>
              Interactive editor with live preview, smart language detection, and professional styling
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={stepIndicatorStyle}
          >
            {steps.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: currentStep === step.id ? '#2563eb' : step.completed ? '#10b981' : '#d1d5db',
                  backgroundColor: currentStep === step.id ? '#2563eb' : step.completed ? '#10b981' : 'white',
                  color: currentStep === step.id || step.completed ? 'white' : '#9ca3af',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: currentStep === step.id ? '#2563eb' : '#6b7280'
                }}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div style={{ width: '2rem', height: '1px', backgroundColor: '#d1d5db', margin: '0 1rem' }} />
                )}
              </div>
            ))}
          </motion.div>

          {/* Main Content */}
          <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderModeToggle()}
                
                <div style={cardStyle}>
                  <div
                    {...getRootProps()}
                    style={uploadZoneStyle}
                  >
                    <input {...getInputProps()} />
                    {isParsing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          border: '4px solid #e5e7eb',
                          borderTop: '4px solid #3b82f6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', margin: '0' }}>
                          Parsing CSV File...
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0', textAlign: 'center' }}>
                          Analyzing data structure, detecting language, and validating content
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <FileSpreadsheet size={64} style={{ color: '#3b82f6' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', margin: '0' }}>
                          {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0', textAlign: 'center' }}>
                          Drag and drop or click to select your CSV, TSV, or TXT file
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {['.csv', '.tsv', '.txt'].map(ext => (
                            <span key={ext} style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: '#f3f4f6',
                              color: '#374151'
                            }}>
                              {ext}
                            </span>
                          ))}
                        </div>
                        
                        {editorMode === 'interactive' && (
                          <div style={{ 
                            marginTop: '1rem', 
                            padding: '1rem', 
                            background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)', 
                            borderRadius: '0.5rem', 
                            border: '1px solid #e9d5ff',
                            maxWidth: '32rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Zap size={20} style={{ color: '#9333ea' }} />
                              <span style={{ fontWeight: '500', color: '#7c3aed' }}>Interactive Mode Ready</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#8b5cf6' }}>
                              Your file will open in the advanced editor with live preview, language detection, and real-time styling
                            </div>
                          </div>
                        )}
                        
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '1rem 0 0 0', textAlign: 'center' }}>
                          Maximum file size: 50MB • All processing happens locally • 15+ languages supported
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Здесь можно добавить остальные этапы при необходимости */}
            
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

export default EnhancedCSVToPDFPage;