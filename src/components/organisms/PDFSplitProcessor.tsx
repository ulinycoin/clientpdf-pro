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

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Scissors, FileText } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';
import {
  generatePDFThumbnails,
  fileToArrayBuffer,
  downloadBlob,
  formatFileSize,
  getPDFErrorMessage,
  validatePDFFile
} from '../../utils/staticPdfUtils';

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

  // Initialize PDF and load pages
  useEffect(() => {
    loadPDFPages();
  }, [file]);

  const loadPDFPages = async () => {
    try {
      setSplitStatus('loading');
      setSplitMessage('Initializing PDF viewer...');
      setSplitProgress(5);

      console.log('🚀 Starting PDF split processor with STATIC imports...');

      // Validate PDF file first
      const validation = await validatePDFFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid PDF file');
      }

      setSplitMessage('Loading PDF pages...');
      setSplitProgress(10);

      // Generate thumbnails with progress tracking
      const thumbnails = await generatePDFThumbnails(file, {
        scale: 0.3,
        onProgress: (current, total) => {
          const progress = 10 + (current / total) * 80; // 10-90% for thumbnails
          setSplitProgress(progress);
          setSplitMessage(`Generating preview ${current} of ${total}...`);
        }
      });

      // Convert to PageInfo format
      const pageInfos: PageInfo[] = thumbnails.map(({ pageNumber, thumbnail }) => ({
        pageNumber,
        selected: false,
        thumbnail: thumbnail || undefined
      }));

      setPages(pageInfos);
      setPageRange({ start: 1, end: pageInfos.length });
      setSplitStatus('ready');
      setSplitMessage(`✅ Ready to split ${pageInfos.length} pages`);
      setSplitProgress(100);
      
      console.log(`🎉 PDF split processor ready: ${pageInfos.length} pages loaded`);
      
    } catch (error: unknown) {
      console.error('❌ Error loading PDF in split processor:', error);
      setSplitStatus('error');
      setSplitProgress(0);
      setSplitMessage(getPDFErrorMessage(error));
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
      setSplitMessage('Preparing for PDF split...');

      console.log('🔄 Starting PDF split operation...');

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

      console.log(`📄 Extracting ${pagesToExtract.length} pages: ${pagesToExtract.join(', ')}`);

      // Dynamically import PDF-lib
      const { PDFDocument } = await import('pdf-lib');
      
      setSplitProgress(20);
      setSplitMessage('Loading original PDF...');

      // Load original PDF
      const arrayBuffer = await fileToArrayBuffer(file);
      const originalPdf = await PDFDocument.load(arrayBuffer);

      console.log(`📄 Original PDF loaded: ${originalPdf.getPageCount()} pages`);

      setSplitProgress(30);

      if (splitMode === 'all' && pagesToExtract.length > 1) {
        // Split into individual pages
        setSplitMessage('Creating individual page files...');
        console.log('📄 Splitting into individual pages...');
        
        for (let i = 0; i < pagesToExtract.length; i++) {
          const pageNum = pagesToExtract[i];
          setSplitMessage(`Creating page ${pageNum}...`);
          setSplitProgress(30 + (i / pagesToExtract.length) * 60);

          console.log(`📄 Creating individual page ${pageNum}...`);

          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          const fileName = `${file.name.replace('.pdf', '')}-page-${pageNum}.pdf`;
          downloadBlob(blob, fileName);
          
          console.log(`✅ Page ${pageNum} saved as ${fileName}`);
          
          // Small delay to prevent browser freezing
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      } else {
        // Create single PDF with selected pages
        setSplitMessage('Creating extracted PDF...');
        setSplitProgress(50);

        console.log('📄 Creating single PDF with selected pages...');

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
        console.log(`✅ PDF saved as ${fileName}`);
      }

      setSplitProgress(100);
      setSplitStatus('success');
      setSplitMessage(`🎉 Successfully extracted ${pagesToExtract.length} pages!`);
      
      console.log(`🎉 PDF split operation completed successfully!`);
      
    } catch (error: unknown) {
      console.error('❌ Error splitting PDF:', error);
      setSplitStatus('error');
      setSplitProgress(0);
      setSplitMessage(getPDFErrorMessage(error));
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
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full rounded-md"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
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

      {/* Error Recovery */}
      {splitStatus === 'error' && (
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            Check the browser console for detailed error information.
          </div>
          <div className="space-x-4">
            <Button
              onClick={loadPDFPages}
              variant="primary"
              size="lg"
              className="px-8"
            >
              Try Again
            </Button>
            {import.meta.env.DEV && (
              <Button
                onClick={() => window.open('/debug-pdf', '_blank')}
                variant="secondary"
                size="lg"
                className="px-4"
              >
                Debug Tools
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};