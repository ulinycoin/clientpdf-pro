/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */

import React, { useState, useCallback } from 'react';
import { Clock, CheckCircle, AlertCircle, Scissors, Download, Eye, FileText } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';

interface PDFSplitProcessorProps {
  file: File;
}

interface PageInfo {
  pageNumber: number;
  selected: boolean;
  thumbnail?: string;
}

export const PDFSplitProcessor: React.FC<PDFSplitProcessorProps> = ({ file }) => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitStatus, setSplitStatus] = useState<'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error'>('idle');
  const [splitMessage, setSplitMessage] = useState('');
  const [splitMode, setSplitMode] = useState<'all' | 'selected' | 'range'>('all');
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [isInitializing, setIsInitializing] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize PDF and load pages
  React.useEffect(() => {
    loadPDFPages();
  }, [file]);

  const loadPDFPages = async () => {
    try {
      setIsInitializing(true);
      setSplitStatus('loading');
      setSplitMessage('Loading PDF...');

      // Dynamically import PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setSplitMessage(`Found ${pdf.numPages} pages. Generating previews...`);

      const pageInfos: PageInfo[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        
        pageInfos.push({
          pageNumber: i,
          selected: false,
          thumbnail
        });

        setSplitMessage(`Generating preview ${i} of ${pdf.numPages}...`);
      }

      setPages(pageInfos);
      setPageRange({ start: 1, end: pdf.numPages });
      setSplitStatus('ready');
      setSplitMessage(`Ready to split ${pdf.numPages} pages`);
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      setSplitStatus('error');
      setSplitMessage(`Error loading PDF: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages(prev => prev.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, selected: !page.selected }
        : page
    ));
  };

  const selectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: false })));
  };

  const splitPDF = async () => {
    try {
      setSplitStatus('processing');
      setSplitProgress(10);
      setSplitMessage('Loading PDF library...');

      // Get pages to extract based on split mode
      let pagesToExtract: number[] = [];
      
      if (splitMode === 'all') {
        pagesToExtract = pages.map(p => p.pageNumber);
      } else if (splitMode === 'selected') {
        pagesToExtract = pages.filter(p => p.selected).map(p => p.pageNumber);
      } else if (splitMode === 'range') {
        for (let i = pageRange.start; i <= pageRange.end; i++) {
          if (i <= pages.length) {
            pagesToExtract.push(i);
          }
        }
      }

      if (pagesToExtract.length === 0) {
        throw new Error('No pages selected for extraction');
      }

      // Dynamically import PDF-lib
      const { PDFDocument } = await import('pdf-lib');
      
      setSplitProgress(20);
      setSplitMessage('Loading original PDF...');

      // Load original PDF
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const originalPdf = await PDFDocument.load(arrayBuffer);

      setSplitProgress(30);

      if (splitMode === 'all' && pagesToExtract.length > 1) {
        // Split into individual pages
        for (let i = 0; i < pagesToExtract.length; i++) {
          const pageNum = pagesToExtract[i];
          setSplitMessage(`Creating page ${pageNum}...`);
          setSplitProgress(30 + (i / pagesToExtract.length) * 60);

          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          const fileName = `${file.name.replace('.pdf', '')}-page-${pageNum}.pdf`;
          downloadBlob(blob, fileName);
        }
      } else {
        // Create single PDF with selected pages
        setSplitMessage('Creating extracted PDF...');
        setSplitProgress(50);

        const newPdf = await PDFDocument.create();
        const pageIndices = pagesToExtract.map(p => p - 1);
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        
        copiedPages.forEach(page => newPdf.addPage(page));

        setSplitProgress(80);
        setSplitMessage('Finalizing PDF...');

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const fileName = splitMode === 'range' 
          ? `${file.name.replace('.pdf', '')}-pages-${pageRange.start}-${pageRange.end}.pdf`
          : `${file.name.replace('.pdf', '')}-extracted.pdf`;
        
        downloadBlob(blob, fileName);
      }

      setSplitProgress(100);
      setSplitStatus('success');
      setSplitMessage(`Successfully extracted ${pagesToExtract.length} pages!`);
      
    } catch (error: any) {
      console.error('Error splitting PDF:', error);
      setSplitStatus('error');
      setSplitProgress(0);
      setSplitMessage(`Error splitting PDF: ${error.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (splitStatus) {
      case 'loading':
      case 'processing':
        return <Clock className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const selectedCount = pages.filter(p => p.selected).length;
  const canSplit = splitStatus === 'ready' && 
    ((splitMode === 'selected' && selectedCount > 0) || 
     (splitMode === 'range' && pageRange.start <= pageRange.end) ||
     (splitMode === 'all'));

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-500">
              Size: {formatFileSize(file.size)} • {pages.length} pages
            </p>
            {splitMessage && (
              <p className={clsx(
                'text-sm mt-1',
                splitStatus === 'error' ? 'text-red-600' : 
                splitStatus === 'success' ? 'text-green-600' : 'text-blue-600'
              )}>
                {splitMessage}
              </p>
            )}
          </div>
        </div>

        {(splitStatus === 'loading' || splitStatus === 'processing') && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${splitProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Split Mode Selection */}
      {splitStatus === 'ready' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Split Options</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="split-all"
                name="splitMode"
                checked={splitMode === 'all'}
                onChange={() => setSplitMode('all')}
                className="text-blue-600"
              />
              <label htmlFor="split-all" className="text-sm text-gray-700">
                Split into individual pages ({pages.length} files)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="split-selected"
                name="splitMode"
                checked={splitMode === 'selected'}
                onChange={() => setSplitMode('selected')}
                className="text-blue-600"
              />
              <label htmlFor="split-selected" className="text-sm text-gray-700">
                Extract selected pages ({selectedCount} selected)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="split-range"
                name="splitMode"
                checked={splitMode === 'range'}
                onChange={() => setSplitMode('range')}
                className="text-blue-600"
              />
              <label htmlFor="split-range" className="text-sm text-gray-700">
                Extract page range
              </label>
            </div>

            {splitMode === 'range' && (
              <div className="ml-6 flex items-center space-x-2">
                <span className="text-sm text-gray-600">From page</span>
                <input
                  type="number"
                  min="1"
                  max={pages.length}
                  value={pageRange.start}
                  onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">to</span>
                <input
                  type="number"
                  min="1"
                  max={pages.length}
                  value={pageRange.end}
                  onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || pages.length }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Selection */}
      {splitStatus === 'ready' && splitMode === 'selected' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Select Pages</h4>
            <div className="space-x-2">
              <Button
                onClick={selectAllPages}
                variant="secondary"
                size="sm"
              >
                Select All
              </Button>
              <Button
                onClick={deselectAllPages}
                variant="secondary"
                size="sm"
              >
                Deselect All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className={clsx(
                  'relative cursor-pointer rounded-lg border-2 transition-all',
                  page.selected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => togglePageSelection(page.pageNumber)}
              >
                {page.thumbnail && (
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full rounded-md"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <div className={clsx(
                    'w-4 h-4 rounded-full border-2',
                    page.selected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white border-gray-300'
                  )}>
                    {page.selected && (
                      <CheckCircle className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
                    )}
                  </div>
                </div>
                <div className="p-2 text-center">
                  <span className="text-xs font-medium text-gray-600">
                    Page {page.pageNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Button */}
      {splitStatus === 'ready' && (
        <div className="text-center">
          <Button
            onClick={splitPDF}
            disabled={!canSplit || splitStatus === 'processing'}
            variant="primary"
            size="lg"
            icon={Scissors}
            className="px-8"
          >
            {splitStatus === 'processing' ? 'Splitting...' : 'Split PDF'}
          </Button>
          
          {!canSplit && splitMode === 'selected' && selectedCount === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Select at least one page to extract
            </p>
          )}
        </div>
      )}
    </div>
  );
};