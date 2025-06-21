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
import { Clock, CheckCircle, AlertCircle, Combine, Download, Trash2, GripVertical, ArrowUp, ArrowDown, FileText, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';

interface PDFMergeProcessorProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
  onReorderFiles?: (files: File[]) => void;
  onAddMoreFiles?: () => void;
}

interface FileStatus {
  file: File;
  status: 'idle' | 'processing' | 'success' | 'error';
  error?: string;
}

export const PDFMergeProcessor: React.FC<PDFMergeProcessorProps> = ({ 
  files, 
  onRemoveFile,
  onReorderFiles,
  onAddMoreFiles
}) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>(
    files.map(file => ({ file, status: 'idle' }))
  );
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStatus, setMergeStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [mergeMessage, setMergeMessage] = useState('');

  // Update file statuses when files prop changes
  React.useEffect(() => {
    setFileStatuses(files.map(file => ({ file, status: 'idle' })));
    setMergeStatus('idle');
    setMergeProgress(0);
    setMergeMessage('');
  }, [files]);

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

  // File upload handler for additional files
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length > 0 && onReorderFiles) {
      onReorderFiles([...files, ...newFiles]);
    }
    // Reset input
    event.target.value = '';
  }, [files, onReorderFiles]);

  const mergePDFs = async () => {
    try {
      setMergeStatus('processing');
      setMergeProgress(5);
      setMergeMessage('Loading PDF library...');

      // Dynamically import PDF-lib to avoid including it in main bundle
      const { PDFDocument } = await import('pdf-lib');
      
      setMergeProgress(15);
      setMergeMessage('Creating merged document...');

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      setMergeProgress(25);
      
      // Process each file
      for (let i = 0; i < fileStatuses.length; i++) {
        const fileStatus = fileStatuses[i];
        
        try {
          setMergeMessage(`Processing ${fileStatus.file.name}...`);
          setMergeProgress(25 + (i / fileStatuses.length) * 60);
          
          // Update individual file status
          setFileStatuses(prev => prev.map((fs, idx) => 
            idx === i ? { ...fs, status: 'processing' } : fs
          ));

          // Read and load the PDF
          const arrayBuffer = await readFileAsArrayBuffer(fileStatus.file);
          const pdf = await PDFDocument.load(arrayBuffer);
          
          // Copy pages from this PDF to the merged document
          const pageIndices = pdf.getPageIndices();
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          
          // Add pages to merged document
          copiedPages.forEach((page) => mergedPdf.addPage(page));
          
          // Mark file as successful
          setFileStatuses(prev => prev.map((fs, idx) => 
            idx === i ? { ...fs, status: 'success' } : fs
          ));
          
        } catch (error: any) {
          console.error(`Error processing ${fileStatus.file.name}:`, error);
          
          // Mark file as error
          setFileStatuses(prev => prev.map((fs, idx) => 
            idx === i ? { ...fs, status: 'error', error: error.message } : fs
          ));
          
          // Continue with other files
          continue;
        }
      }
      
      setMergeProgress(90);
      setMergeMessage('Finalizing merged PDF...');
      
      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      setMergeProgress(95);
      setMergeMessage('Preparing download...');
      
      // Create blob and download
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `merged-pdf-${timestamp}.pdf`);
      
      setMergeProgress(100);
      setMergeStatus('success');
      setMergeMessage(`Successfully merged ${files.length} PDF files!`);
      
    } catch (error: any) {
      console.error('Error merging PDFs:', error);
      setMergeStatus('error');
      setMergeProgress(0);
      setMergeMessage(`Error merging PDFs: ${error.message}`);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (!onReorderFiles) return;
    
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      onReorderFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    if (onRemoveFile) {
      onRemoveFile(index);
    }
  };

  const getStatusIcon = (status: 'idle' | 'processing' | 'success' | 'error') => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const canMerge = files.length >= 2 && mergeStatus !== 'processing';

  return (
    <div className="space-y-6">
      {/* Files List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                PDF Files ({files.length})
              </h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Total size: {formatFileSize(totalSize)}
              </div>
              
              {/* Add More Files Button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  className="relative"
                >
                  Add More
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {fileStatuses.map((fileStatus, index) => (
            <div key={index} className="p-4 flex items-center space-x-4">
              {/* Drag handle */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => moveFile(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <GripVertical className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => moveFile(index, 'down')}
                  disabled={index === files.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileStatus.file.name}
                  </p>
                  {getStatusIcon(fileStatus.status)}
                </div>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileStatus.file.size)}
                </p>
                {fileStatus.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {fileStatus.error}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFile(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Merge Status */}
      {mergeStatus !== 'idle' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={clsx(
              'flex-shrink-0',
              mergeStatus === 'processing' && 'text-blue-600',
              mergeStatus === 'success' && 'text-green-600',
              mergeStatus === 'error' && 'text-red-600'
            )}>
              {mergeStatus === 'processing' && <Clock className="w-6 h-6 animate-spin" />}
              {mergeStatus === 'success' && <CheckCircle className="w-6 h-6" />}
              {mergeStatus === 'error' && <AlertCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className={clsx(
                'font-medium',
                mergeStatus === 'processing' && 'text-blue-900',
                mergeStatus === 'success' && 'text-green-900',
                mergeStatus === 'error' && 'text-red-900'
              )}>
                {mergeStatus === 'processing' && 'Merging PDFs...'}
                {mergeStatus === 'success' && 'Merge Complete!'}
                {mergeStatus === 'error' && 'Merge Failed'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {mergeMessage}
              </p>
            </div>
          </div>

          {mergeStatus === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mergeProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Merge Button */}
      <div className="text-center">
        <Button
          onClick={mergePDFs}
          disabled={!canMerge}
          variant="primary"
          size="lg"
          icon={Combine}
          className="px-8"
        >
          {mergeStatus === 'processing' ? 'Merging...' : `Merge ${files.length} PDFs`}
        </Button>
        
        {!canMerge && files.length < 2 && (
          <p className="text-sm text-gray-500 mt-2">
            Add at least 2 PDF files to start merging
          </p>
        )}
      </div>

      {/* Merge Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Merge Process</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Files will be merged in the order shown above</li>
          <li>• All pages from each PDF will be included</li>
          <li>• Original quality and formatting will be preserved</li>
          <li>• The merged file will be downloaded automatically</li>
        </ul>
      </div>
    </div>
  );
};