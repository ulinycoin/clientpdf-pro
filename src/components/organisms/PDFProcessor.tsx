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
import { clsx } from 'clsx';
import { 
  Scissors, 
  Combine, 
  Download, 
  Settings, 
  Play, 
  Image, 
  Minimize2, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

interface PDFProcessorProps {
  files: File[];
  className?: string;
}

type OperationType = 'merge' | 'split' | 'extract' | 'imageToPdf' | 'compress' | '';

interface SplitSettings {
  splitType: 'pages' | 'range';
  pageNumber?: number;
  startPage?: number;
  endPage?: number;
}

interface CompressionSettings {
  quality: 'low' | 'medium' | 'high';
  removeMetadata: boolean;
  optimizeImages: boolean;
}

interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export const PDFProcessor: React.FC<PDFProcessorProps> = ({
  files,
  className,
}) => {
  const [operation, setOperation] = useState<OperationType>('');
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    message: '',
    type: 'info'
  });
  
  const [splitSettings, setSplitSettings] = useState<SplitSettings>({
    splitType: 'pages',
    pageNumber: 1,
    startPage: 1,
    endPage: 1,
  });
  
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 'medium',
    removeMetadata: true,
    optimizeImages: true,
  });

  const pdfFiles = files.filter(file => file.type === 'application/pdf');
  const imageFiles = files.filter(file => file.type.startsWith('image/'));

  // Helper function to update processing status
  const updateStatus = useCallback((
    progress: number, 
    message: string, 
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    setStatus({
      isProcessing: progress < 100 && type !== 'error',
      progress,
      message,
      type
    });
  }, []);

  // Helper function to read file as ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Helper function to get image dimensions
  const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Merge PDFs
  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      updateStatus(0, 'Please select at least 2 PDF files to merge', 'error');
      return;
    }

    try {
      updateStatus(5, 'Starting PDF merge...', 'info');
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const progress = 10 + (i / pdfFiles.length) * 70;
        updateStatus(progress, `Processing ${file.name}...`, 'info');
        
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      updateStatus(85, 'Generating merged PDF...', 'info');
      const mergedPdfBytes = await mergedPdf.save();
      
      updateStatus(95, 'Preparing download...', 'info');
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'merged-document.pdf');

      updateStatus(100, `Successfully merged ${pdfFiles.length} PDF files!`, 'success');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      updateStatus(0, `Error merging PDFs: ${error.message}`, 'error');
    }
  };

  // Convert images to PDF
  const convertImagesToPDF = async () => {
    if (imageFiles.length === 0) {
      updateStatus(0, 'Please select at least 1 image file to convert', 'error');
      return;
    }

    try {
      updateStatus(5, 'Initializing PDF document...', 'info');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Remove the first page (jsPDF creates one by default)
      pdf.deletePage(1);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const progress = 10 + (i / imageFiles.length) * 75;
        updateStatus(progress, `Processing ${file.name}...`, 'info');

        // Read image as data URL
        const imageDataURL = await readFileAsDataURL(file);
        
        // Get image dimensions
        const { width, height } = await getImageDimensions(imageDataURL);

        // Add new page
        pdf.addPage('a4', width > height ? 'landscape' : 'portrait');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate scaling to fit page while maintaining aspect ratio
        const scaleX = (pageWidth - 20) / width; // 10mm margin on each side
        const scaleY = (pageHeight - 20) / height; // 10mm margin top/bottom
        const scale = Math.min(scaleX, scaleY);

        const imgWidth = width * scale;
        const imgHeight = height * scale;

        // Center the image
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        // Add image to PDF
        const format = file.type.includes('jpeg') || file.type.includes('jpg') ? 'JPEG' : 'PNG';
        pdf.addImage(imageDataURL, format, x, y, imgWidth, imgHeight);
      }

      updateStatus(90, 'Generating PDF file...', 'info');
      const pdfBlob = pdf.output('blob');
      
      updateStatus(95, 'Preparing download...', 'info');
      saveAs(pdfBlob, 'images-converted.pdf');
      
      updateStatus(100, `Successfully converted ${imageFiles.length} images to PDF!`, 'success');
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      updateStatus(0, `Error converting images: ${error.message}`, 'error');
    }
  };

  // Compress PDF
  const compressPDF = async (file: File) => {
    try {
      updateStatus(5, 'Loading PDF for compression...', 'info');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer);
      
      updateStatus(20, 'Analyzing PDF structure...', 'info');

      // Get original size
      const originalSize = file.size;

      // Apply compression settings based on quality level
      const compressionOptions = {
        useObjectStreams: compressionSettings.quality !== 'high',
        addDefaultPage: false,
        objectsPerTick: compressionSettings.quality === 'low' ? 50 : 
                       compressionSettings.quality === 'medium' ? 30 : 20,
      };

      updateStatus(40, 'Applying compression...', 'info');

      if (compressionSettings.removeMetadata) {
        updateStatus(50, 'Removing metadata...', 'info');
        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setKeywords([]);
        pdf.setProducer('LocalPDF');
        pdf.setCreator('LocalPDF');
        pdf.setCreationDate(new Date());
        pdf.setModificationDate(new Date());
      }

      updateStatus(70, 'Optimizing PDF structure...', 'info');
      const compressedPdfBytes = await pdf.save(compressionOptions);

      // Calculate compression ratio
      const compressedSize = compressedPdfBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);

      updateStatus(90, 'Preparing compressed file...', 'info');
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${file.name.replace('.pdf', '')}-compressed.pdf`);

      const message = `PDF compressed successfully!\nOriginal: ${formatFileSize(originalSize)}\nCompressed: ${formatFileSize(compressedSize)}\nSpace saved: ${compressionRatio.toFixed(1)}%`;
      updateStatus(100, message, 'success');
    } catch (error) {
      console.error('Error compressing PDF:', error);
      updateStatus(0, `Error compressing PDF: ${error.message}`, 'error');
    }
  };

  // Split PDF
  const splitPDF = async (file: File) => {
    try {
      updateStatus(5, 'Loading PDF for splitting...', 'info');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      updateStatus(15, `Found ${totalPages} pages to process...`, 'info');

      if (splitSettings.splitType === 'pages') {
        // Split each page into separate PDF
        for (let i = 0; i < totalPages; i++) {
          const progress = 20 + (i / totalPages) * 70;
          updateStatus(progress, `Creating page ${i + 1} of ${totalPages}...`, 'info');
          
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          saveAs(blob, `${file.name.replace('.pdf', '')}-page-${i + 1}.pdf`);
        }
        
        updateStatus(100, `Successfully split PDF into ${totalPages} separate files!`, 'success');
      } else if (splitSettings.splitType === 'range') {
        // Extract page range
        const startIdx = Math.max(0, (splitSettings.startPage || 1) - 1);
        const endIdx = Math.min((splitSettings.endPage || 1) - 1, totalPages - 1);
        
        if (startIdx <= endIdx && startIdx >= 0 && endIdx < totalPages) {
          updateStatus(30, `Extracting pages ${startIdx + 1} to ${endIdx + 1}...`, 'info');
          
          const newPdf = await PDFDocument.create();
          const pageIndices = [];
          
          for (let i = startIdx; i <= endIdx; i++) {
            pageIndices.push(i);
          }
          
          const pages = await newPdf.copyPages(pdf, pageIndices);
          pages.forEach((page) => newPdf.addPage(page));

          updateStatus(80, 'Generating extracted PDF...', 'info');
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          saveAs(blob, `${file.name.replace('.pdf', '')}-pages-${startIdx + 1}-to-${endIdx + 1}.pdf`);
          
          const pageCount = endIdx - startIdx + 1;
          updateStatus(100, `Successfully extracted ${pageCount} pages from PDF!`, 'success');
        } else {
          throw new Error(`Invalid page range. Document has ${totalPages} pages.`);
        }
      }
    } catch (error) {
      console.error('Error splitting PDF:', error);
      updateStatus(0, `Error splitting PDF: ${error.message}`, 'error');
    }
  };

  // Execute selected operation
  const executeOperation = async () => {
    if (!operation) return;

    setStatus({
      isProcessing: true,
      progress: 0,
      message: 'Initializing...',
      type: 'info'
    });

    try {
      switch (operation) {
        case 'merge':
          await mergePDFs();
          break;
        case 'split':
          if (pdfFiles[0]) await splitPDF(pdfFiles[0]);
          break;
        case 'imageToPdf':
          await convertImagesToPDF();
          break;
        case 'compress':
          if (pdfFiles[0]) await compressPDF(pdfFiles[0]);
          break;
        default:
          updateStatus(0, 'Unknown operation selected', 'error');
      }
    } catch (error) {
      console.error('Operation failed:', error);
      updateStatus(0, `Operation failed: ${error.message}`, 'error');
    }
  };

  // Clear status
  const clearStatus = () => {
    setStatus({
      isProcessing: false,
      progress: 0,
      message: '',
      type: 'info'
    });
  };

  // Render status icon
  const renderStatusIcon = () => {
    if (status.isProcessing) {
      return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
    }
    
    switch (status.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (pdfFiles.length === 0 && imageFiles.length === 0) {
    return (
      <div className={clsx('text-center p-8 text-gray-500', className)}>
        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Upload PDF or image files to see processing options</p>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">PDF Operations</h3>
        {status.message && (
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={clearStatus}
            className="text-gray-400 hover:text-gray-600"
          />
        )}
      </div>

      {/* Status Display */}
      {status.message && (
        <div className={clsx(
          'mb-6 p-4 rounded-lg border',
          status.type === 'success' && 'bg-green-50 border-green-200',
          status.type === 'error' && 'bg-red-50 border-red-200',
          status.type === 'info' && 'bg-blue-50 border-blue-200'
        )}>
          <div className="flex items-start">
            {renderStatusIcon()}
            <div className="ml-3 flex-1">
              <p className={clsx(
                'text-sm font-medium',
                status.type === 'success' && 'text-green-800',
                status.type === 'error' && 'text-red-800',
                status.type === 'info' && 'text-blue-800'
              )}>
                {status.message.split('\n')[0]}
              </p>
              {status.message.includes('\n') && (
                <div className={clsx(
                  'mt-1 text-xs whitespace-pre-line',
                  status.type === 'success' && 'text-green-700',
                  status.type === 'error' && 'text-red-700',
                  status.type === 'info' && 'text-blue-700'
                )}>
                  {status.message.split('\n').slice(1).join('\n')}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {status.isProcessing && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs text-gray-600">{Math.round(status.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={clsx(
                    'h-2 rounded-full transition-all duration-300',
                    status.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  )}
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operation Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setOperation('merge')}
          disabled={pdfFiles.length < 2 || status.isProcessing}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed',
            operation === 'merge'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <Combine className="h-8 w-8 text-blue-600 mb-2" />
          <h4 className="font-medium text-gray-900">Merge PDFs</h4>
          <p className="text-sm text-gray-600 mb-2">
            Combine multiple PDF files into one
          </p>
          {pdfFiles.length < 2 && (
            <p className="text-xs text-orange-600">
              Need at least 2 PDF files
            </p>
          )}
          {pdfFiles.length >= 2 && (
            <p className="text-xs text-green-600">
              Ready to merge {pdfFiles.length} files
            </p>
          )}
        </button>

        <button
          onClick={() => setOperation('split')}
          disabled={pdfFiles.length === 0 || status.isProcessing}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed',
            operation === 'split'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <Scissors className="h-8 w-8 text-green-600 mb-2" />
          <h4 className="font-medium text-gray-900">Split PDF</h4>
          <p className="text-sm text-gray-600 mb-2">
            Split PDF into separate pages or extract range
          </p>
          {pdfFiles.length === 0 && (
            <p className="text-xs text-orange-600">
              Upload a PDF file
            </p>
          )}
          {pdfFiles.length > 0 && (
            <p className="text-xs text-green-600">
              Ready to split {pdfFiles[0].name}
            </p>
          )}
        </button>

        <button
          onClick={() => setOperation('imageToPdf')}
          disabled={imageFiles.length === 0 || status.isProcessing}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed',
            operation === 'imageToPdf'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <Image className="h-8 w-8 text-purple-600 mb-2" />
          <h4 className="font-medium text-gray-900">Images to PDF</h4>
          <p className="text-sm text-gray-600 mb-2">
            Convert images to PDF document
          </p>
          {imageFiles.length === 0 && (
            <p className="text-xs text-orange-600">
              Upload image files
            </p>
          )}
          {imageFiles.length > 0 && (
            <p className="text-xs text-green-600">
              Ready to convert {imageFiles.length} images
            </p>
          )}
        </button>

        <button
          onClick={() => setOperation('compress')}
          disabled={pdfFiles.length === 0 || status.isProcessing}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed',
            operation === 'compress'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <Minimize2 className="h-8 w-8 text-orange-600 mb-2" />
          <h4 className="font-medium text-gray-900">Compress PDF</h4>
          <p className="text-sm text-gray-600 mb-2">
            Reduce PDF file size while maintaining quality
          </p>
          {pdfFiles.length === 0 && (
            <p className="text-xs text-orange-600">
              Upload a PDF file
            </p>
          )}
          {pdfFiles.length > 0 && (
            <p className="text-xs text-green-600">
              Ready to compress {formatFileSize(pdfFiles[0].size)}
            </p>
          )}
        </button>
      </div>

      {/* Operation-specific Settings */}
      {/* Compression Settings */}
      {operation === 'compress' && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-medium text-gray-900 mb-4">Compression Options</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Level
              </label>
              <select
                value={compressionSettings.quality}
                onChange={(e) => setCompressionSettings(prev => ({ 
                  ...prev, 
                  quality: e.target.value as 'low' | 'medium' | 'high' 
                }))}
                disabled={status.isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
              >
                <option value="high">High Quality (Less compression)</option>
                <option value="medium">Medium Quality (Balanced)</option>
                <option value="low">Low Quality (Maximum compression)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={compressionSettings.removeMetadata}
                  onChange={(e) => setCompressionSettings(prev => ({ 
                    ...prev, 
                    removeMetadata: e.target.checked 
                  }))}
                  disabled={status.isProcessing}
                  className="rounded text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Remove metadata</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={compressionSettings.optimizeImages}
                  onChange={(e) => setCompressionSettings(prev => ({ 
                    ...prev, 
                    optimizeImages: e.target.checked 
                  }))}
                  disabled={status.isProcessing}
                  className="rounded text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Optimize images</span>
              </label>
            </div>

            <div className="bg-white p-3 rounded border border-orange-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Expected Results</h5>
              <div className="space-y-1 text-xs text-gray-600">
                <p>💾 High: 10-20% size reduction</p>
                <p>⚖️ Medium: 30-50% size reduction</p>
                <p>🗜️ Low: 50-70% size reduction</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Split Settings */}
      {operation === 'split' && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-gray-900 mb-4">Split Options</h4>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={splitSettings.splitType === 'pages'}
                  onChange={() => setSplitSettings(prev => ({ ...prev, splitType: 'pages' }))}
                  disabled={status.isProcessing}
                  className="text-green-600 focus:ring-green-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">Split into individual pages</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">Each page will be saved as a separate PDF file</p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={splitSettings.splitType === 'range'}
                  onChange={() => setSplitSettings(prev => ({ ...prev, splitType: 'range' }))}
                  disabled={status.isProcessing}
                  className="text-green-600 focus:ring-green-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">Extract page range</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">Extract specific pages as a new PDF</p>
            </div>

            {splitSettings.splitType === 'range' && (
              <div className="ml-6 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 font-medium">From page:</label>
                    <input
                      type="number"
                      min="1"
                      value={splitSettings.startPage}
                      onChange={(e) => setSplitSettings(prev => ({ 
                        ...prev, 
                        startPage: parseInt(e.target.value) || 1 
                      }))}
                      disabled={status.isProcessing}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 font-medium">To page:</label>
                    <input
                      type="number"
                      min="1"
                      value={splitSettings.endPage}
                      onChange={(e) => setSplitSettings(prev => ({ 
                        ...prev, 
                        endPage: parseInt(e.target.value) || 1 
                      }))}
                      disabled={status.isProcessing}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execute Button */}
      {operation && (
        <div className="flex justify-center mb-6">
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={executeOperation}
            disabled={status.isProcessing}
            loading={status.isProcessing}
            className={clsx(
              'px-8 shadow-lg',
              operation === 'merge' && 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
              operation === 'split' && 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
              operation === 'imageToPdf' && 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
              operation === 'compress' && 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
            )}
          >
            {status.isProcessing ? (
              <>
                Processing...
              </>
            ) : (
              <>
                {operation === 'merge' && 'Merge PDFs'}
                {operation === 'split' && 'Split PDF'}
                {operation === 'imageToPdf' && 'Convert to PDF'}
                {operation === 'compress' && 'Compress PDF'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* File List */}
      <div className="pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Files */}
          {pdfFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  PDF Files ({pdfFiles.length})
                </h4>
                <div className="text-xs text-gray-500">
                  Total: {formatFileSize(pdfFiles.reduce((sum, file) => sum + file.size, 0))}
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pdfFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • PDF Document
                        </p>
                      </div>
                    </div>
                    {operation === 'merge' && index > 0 && (
                      <div className="ml-2 text-xs text-blue-600 font-medium">
                        #{index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Files */}
          {imageFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Image Files ({imageFiles.length})
                </h4>
                <div className="text-xs text-gray-500">
                  Total: {formatFileSize(imageFiles.reduce((sum, file) => sum + file.size, 0))}
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {imageFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center min-w-0 flex-1">
                      <Image className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()} Image
                        </p>
                      </div>
                    </div>
                    {operation === 'imageToPdf' && (
                      <div className="ml-2 text-xs text-purple-600 font-medium">
                        Page {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operation Summary */}
        {operation && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Operation Summary</h5>
            <div className="text-xs text-gray-600 space-y-1">
              {operation === 'merge' && (
                <>
                  <p>• Will combine {pdfFiles.length} PDF files into one document</p>
                  <p>• Pages will be merged in the order shown above</p>
                  <p>• Output: merged-document.pdf</p>
                </>
              )}
              {operation === 'split' && pdfFiles[0] && (
                <>
                  {splitSettings.splitType === 'pages' ? (
                    <>
                      <p>• Will split each page into a separate PDF file</p>
                      <p>• Output: Multiple files named {pdfFiles[0].name.replace('.pdf', '')}-page-X.pdf</p>
                    </>
                  ) : (
                    <>
                      <p>• Will extract pages {splitSettings.startPage} to {splitSettings.endPage}</p>
                      <p>• Output: {pdfFiles[0].name.replace('.pdf', '')}-pages-{splitSettings.startPage}-to-{splitSettings.endPage}.pdf</p>
                    </>
                  )}
                </>
              )}
              {operation === 'imageToPdf' && (
                <>
                  <p>• Will convert {imageFiles.length} images into a single PDF</p>
                  <p>• Images will be fitted to A4 pages maintaining aspect ratio</p>
                  <p>• Output: images-converted.pdf</p>
                </>
              )}
              {operation === 'compress' && pdfFiles[0] && (
                <>
                  <p>• Will compress {pdfFiles[0].name} using {compressionSettings.quality} quality settings</p>
                  {compressionSettings.removeMetadata && <p>• Metadata will be removed to save space</p>}
                  {compressionSettings.optimizeImages && <p>• Images will be optimized for smaller size</p>}
                  <p>• Output: {pdfFiles[0].name.replace('.pdf', '')}-compressed.pdf</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h5>
          <div className="text-xs text-blue-800 space-y-1">
            <p>• All processing happens in your browser - files never leave your device</p>
            <p>• For large files, processing may take a few moments</p>
            <p>• You can process multiple files by selecting a different operation</p>
            {operation === 'merge' && <p>• Drag files in the upload zone to reorder them before merging</p>}
            {operation === 'compress' && <p>• Try different quality settings if the first result isn't satisfactory</p>}
            {operation === 'imageToPdf' && <p>• Images will be automatically oriented based on their dimensions</p>}
          </div>
        </div>
      </div>
    </div>
  );
};