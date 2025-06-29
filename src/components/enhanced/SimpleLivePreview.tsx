import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet, Eye, Download, Loader, AlertCircle,
  Settings, RefreshCw, CheckCircle
} from 'lucide-react';

interface Props {
  parseResult: {
    data: string[][];
    headers: string[];
    rowCount: number;
    columnCount: number;
    reportTitle?: string;
    delimiter?: string;
    errors: any[];
  };
  onExport: (blob: Blob) => void;
  className?: string;
}

interface PreviewOptions {
  orientation: 'landscape' | 'portrait';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  fontSize: number;
}

const SimpleLivePreview: React.FC<Props> = ({
  parseResult,
  onExport,
  className = ''
}) => {
  const [previewState, setPreviewState] = useState({
    isGenerating: false,
    pdfUrl: null as string | null,
    error: null as string | null
  });

  const [options, setOptions] = useState<PreviewOptions>({
    orientation: 'landscape',
    pageSize: 'a4',
    fontSize: 10
  });

  const [showSettings, setShowSettings] = useState(false);

  // Простая генерация PDF
  const generatePDF = useCallback(async () => {
    setPreviewState(prev => ({ ...prev, isGenerating: true, error: null }));
    
    try {
      const { CsvToPdfConverter } = await import('../../services/converters/CsvToPdfConverter');
      
      console.log('🎯 Generating simple PDF preview:', {
        rows: parseResult.rowCount,
        columns: parseResult.columnCount,
        options: options
      });
      
      // Преобразуем данные в нужный формат
      const formattedData = parseResult.data.map(row => {
        const obj: Record<string, any> = {};
        parseResult.headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      const csvData = {
        data: formattedData,
        headers: parseResult.headers,
        rowCount: parseResult.rowCount,
        columnCount: parseResult.columnCount,
        reportTitle: parseResult.reportTitle || 'CSV Report',
        delimiter: parseResult.delimiter || ',',
        errors: [],
        encoding: 'UTF-8' as const,
        columnTypes: parseResult.headers.reduce((acc, header) => {
          acc[header] = 'text';
          return acc;
        }, {} as Record<string, string>),
        preview: []
      };

      const pdfOptions = {
        orientation: options.orientation,
        pageSize: options.pageSize,
        fontSize: options.fontSize,
        tableStyle: 'grid' as const,
        headerStyle: 'bold' as const,
        fitToPage: true,
        includeRowNumbers: false,
        title: parseResult.reportTitle || 'CSV Report',
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10
      };

      console.log('⚙️ Using PDF options:', pdfOptions);

      const pdfResult = await CsvToPdfConverter.convertToPDF(csvData, pdfOptions);
      const pdfData = Array.isArray(pdfResult) ? pdfResult[0] : pdfResult;
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setPreviewState({
        isGenerating: false,
        pdfUrl,
        error: null
      });

      console.log('✅ PDF generated successfully:', {
        size: `${(pdfBlob.size / 1024).toFixed(1)}KB`,
        url: pdfUrl
      });

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      setPreviewState({
        isGenerating: false,
        pdfUrl: null,
        error: `Failed to generate PDF: ${error}`
      });
    }
  }, [parseResult, options]);

  // Экспорт PDF
  const handleExport = useCallback(async () => {
    if (!previewState.pdfUrl) {
      await generatePDF();
      return;
    }

    try {
      const response = await fetch(previewState.pdfUrl);
      const blob = await response.blob();
      onExport(blob);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [previewState.pdfUrl, generatePDF, onExport]);

  // Превью данных (первые 10 строк)
  const previewRows = parseResult.data.slice(0, 10);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {parseResult.reportTitle || 'CSV Preview'}
              </h2>
              <p className="text-sm text-gray-600">
                {parseResult.rowCount} rows × {parseResult.columnCount} columns
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </button>
            
            {!previewState.pdfUrl && (
              <button
                onClick={generatePDF}
                disabled={previewState.isGenerating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {previewState.isGenerating ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Generate Preview
              </button>
            )}
            
            {previewState.pdfUrl && (
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Простые настройки */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Page Size
                </label>
                <select
                  value={options.pageSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as any }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="a4">A4</option>
                  <option value="a3">A3</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Orientation
                </label>
                <select
                  value={options.orientation}
                  onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={options.fontSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="8">8pt</option>
                  <option value="9">9pt</option>
                  <option value="10">10pt</option>
                  <option value="11">11pt</option>
                  <option value="12">12pt</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPreviewState(prev => ({ ...prev, pdfUrl: null }));
                    generatePDF();
                  }}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Левая панель - превью данных */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Data Preview</h3>
          <div className="bg-white rounded border overflow-auto h-full">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {parseResult.headers.map((header, index) => (
                    <th key={index} className="px-2 py-1 text-left border-b border-gray-200 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {parseResult.headers.map((_, colIndex) => (
                      <td key={colIndex} className="px-2 py-1 border-b border-gray-100">
                        {row[colIndex] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parseResult.rowCount > 10 && (
              <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                ... and {parseResult.rowCount - 10} more rows
              </div>
            )}
          </div>
        </div>

        {/* Правая панель - PDF превью */}
        <div className="w-1/2 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">PDF Preview</h3>
          <div className="bg-white rounded border h-full">
            {previewState.error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-4">{previewState.error}</p>
                  <button
                    onClick={generatePDF}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : previewState.isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-600">Generating PDF...</p>
                </div>
              </div>
            ) : previewState.pdfUrl ? (
              <iframe
                src={previewState.pdfUrl}
                className="w-full h-full rounded"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">Click "Generate Preview" to see PDF</p>
                  <button
                    onClick={generatePDF}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mx-auto"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Статус бар */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {parseResult.reportTitle || 'CSV to PDF Converter'}
          </span>
          <div className="flex items-center space-x-4">
            <span>{parseResult.rowCount} rows × {parseResult.columnCount} columns</span>
            <span>{options.orientation} • {options.pageSize.toUpperCase()} • {options.fontSize}pt</span>
            {previewState.pdfUrl && (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLivePreview;