import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Scissors, Combine, Download, Settings, Play } from 'lucide-react';
import { Button } from '../atoms/Button';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface PDFProcessorProps {
  files: File[];
  className?: string;
}

type OperationType = 'merge' | 'split' | 'extract' | '';

interface SplitSettings {
  splitType: 'pages' | 'range';
  pageNumber?: number;
  startPage?: number;
  endPage?: number;
}

export const PDFProcessor: React.FC<PDFProcessorProps> = ({
  files,
  className,
}) => {
  const [operation, setOperation] = useState<OperationType>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitSettings, setSplitSettings] = useState<SplitSettings>({
    splitType: 'pages',
    pageNumber: 1,
    startPage: 1,
    endPage: 1,
  });

  const pdfFiles = files.filter(file => file.type === 'application/pdf');

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      alert('Please select at least 2 PDF files to merge');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        setProgress((i / pdfFiles.length) * 80);
        
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      setProgress(90);
      const mergedPdfBytes = await mergedPdf.save();
      setProgress(100);

      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'merged-document.pdf');

      alert('✅ PDFs merged successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert(`❌ Error merging PDFs: ${error.message}`);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const splitPDF = async (file: File) => {
    setProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      setProgress(20);

      if (splitSettings.splitType === 'pages') {
        // Split each page into separate PDF
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          saveAs(blob, `${file.name.replace('.pdf', '')}-page-${i + 1}.pdf`);

          setProgress(20 + (i / totalPages) * 70);
        }
      } else if (splitSettings.splitType === 'range') {
        // Extract page range
        const startIdx = (splitSettings.startPage || 1) - 1;
        const endIdx = Math.min((splitSettings.endPage || 1) - 1, totalPages - 1);
        
        if (startIdx <= endIdx && startIdx >= 0) {
          const newPdf = await PDFDocument.create();
          const pageIndices = [];
          
          for (let i = startIdx; i <= endIdx; i++) {
            pageIndices.push(i);
          }
          
          const pages = await newPdf.copyPages(pdf, pageIndices);
          pages.forEach((page) => newPdf.addPage(page));

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          saveAs(blob, `${file.name.replace('.pdf', '')}-pages-${startIdx + 1}-to-${endIdx + 1}.pdf`);
        } else {
          throw new Error('Invalid page range');
        }
      }

      setProgress(100);
      alert('✅ PDF split successfully!');
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('❌ Error splitting PDF. Please check your settings and try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const executeOperation = async () => {
    if (operation === 'merge') {
      await mergePDFs();
    } else if (operation === 'split' && pdfFiles[0]) {
      await splitPDF(pdfFiles[0]);
    }
  };

  if (pdfFiles.length === 0) {
    return (
      <div className={clsx('text-center p-8 text-gray-500', className)}>
        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Upload PDF files to see processing options</p>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">PDF Operations</h3>

      {/* Operation Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setOperation('merge')}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left',
            operation === 'merge'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
          disabled={pdfFiles.length < 2}
        >
          <Combine className="h-8 w-8 text-blue-600 mb-2" />
          <h4 className="font-medium text-gray-900">Merge PDFs</h4>
          <p className="text-sm text-gray-600">
            Combine multiple PDF files into one
          </p>
          {pdfFiles.length < 2 && (
            <p className="text-xs text-orange-600 mt-1">
              Need at least 2 PDF files
            </p>
          )}
        </button>

        <button
          onClick={() => setOperation('split')}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left',
            operation === 'split'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
          disabled={pdfFiles.length === 0}
        >
          <Scissors className="h-8 w-8 text-green-600 mb-2" />
          <h4 className="font-medium text-gray-900">Split PDF</h4>
          <p className="text-sm text-gray-600">
            Split PDF into separate pages or extract range
          </p>
        </button>
      </div>

      {/* Split Settings */}
      {operation === 'split' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Split Options</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={splitSettings.splitType === 'pages'}
                  onChange={() => setSplitSettings(prev => ({ ...prev, splitType: 'pages' }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Split into individual pages</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={splitSettings.splitType === 'range'}
                  onChange={() => setSplitSettings(prev => ({ ...prev, splitType: 'range' }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Extract page range</span>
              </label>
            </div>

            {splitSettings.splitType === 'range' && (
              <div className="ml-6 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="number"
                    min="1"
                    value={splitSettings.startPage}
                    onChange={(e) => setSplitSettings(prev => ({ 
                      ...prev, 
                      startPage: parseInt(e.target.value) || 1 
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">To:</label>
                  <input
                    type="number"
                    min="1"
                    value={splitSettings.endPage}
                    onChange={(e) => setSplitSettings(prev => ({ 
                      ...prev, 
                      endPage: parseInt(e.target.value) || 1 
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {processing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Processing...</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Execute Button */}
      {operation && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={executeOperation}
            disabled={processing}
            loading={processing}
            className="px-8"
          >
            {operation === 'merge' ? 'Merge PDFs' : 'Split PDF'}
          </Button>
        </div>
      )}

      {/* File List */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Selected Files ({pdfFiles.length})
        </h4>
        <div className="space-y-2">
          {pdfFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};