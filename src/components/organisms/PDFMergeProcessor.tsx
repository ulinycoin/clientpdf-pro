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
import { Clock, CheckCircle, AlertCircle, Combine, Download, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';

interface PDFMergeProcessorProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
  onReorderFiles?: (files: File[]) => void;
}

interface FileStatus {
  file: File;
  status: 'idle' | 'processing' | 'success' | 'error';
  error?: string;
}

export const PDFMergeProcessor: React.FC<PDFMergeProcessorProps> = ({ 
  files, 
  onRemoveFile,
  onReorderFiles 
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
        <div className="px-6 py-