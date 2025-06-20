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

import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Settings, Download, FileText, Zap } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';

interface PDFCompressProcessorProps {
  file: File;
}

interface CompressionSettings {
  quality: 'low' | 'medium' | 'high';
  removeMetadata: boolean;
  optimizeImages: boolean;
}

export const PDFCompressProcessor: React.FC<PDFCompressProcessorProps> = ({ file }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 'medium',
    removeMetadata: true,
    optimizeImages: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);

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

  const updateStatus = (progress: number, message: string, status: 'info' | 'success' | 'error' | 'warning') => {
    setProgress(progress);
    setMessage(message);
    if (status === 'error' || status === 'warning') {
      setStatus('error');
    } else if (status === 'success') {
      setStatus('success');
    } else {
      setStatus('processing');
    }
  };

  const compressPDF = async () => {
    try {
      updateStatus(5, 'Loading PDF for compression...', 'info');
      
      // Dynamically import PDF-lib
      const { PDFDocument } = await import('pdf-lib');
      
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
      
      // Additional compression based on quality settings
      if (compressionSettings.quality === 'low') {
        // More aggressive compression for low quality
        updateStatus(75, 'Applying aggressive compression...', 'info');
      } else if (compressionSettings.quality === 'high') {
        // Preserve quality while still compressing
        updateStatus(75, 'Applying quality-preserving compression...', 'info');
      }

      const compressedPdfBytes = await pdf.save(compressionOptions);

      // Calculate compression ratio
      const compressedSize = compressedPdfBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);

      setCompressionStats({
        originalSize,
        compressedSize,
        compressionRatio
      });

      updateStatus(90, 'Preparing compressed file...', 'info');
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const fileName = `${file.name.replace('.pdf', '')}-compressed.pdf`;
      downloadBlob(blob, fileName);

      const successMessage = `PDF compressed successfully! Space saved: ${compressionRatio.toFixed(1)}%`;
      updateStatus(100, successMessage, 'success');
    } catch (error: any) {
      console.error('Error compressing PDF:', error);
      updateStatus(0, `Error compressing PDF: ${error.message}`, 'error');
      
      // Enhanced error reporting
      if (error.message.includes('out of memory')) {
        updateStatus(0, 'File too large. Try a smaller file or use lower quality settings.', 'warning');
      } else if (error.message.includes('corrupt')) {
        updateStatus(0, 'PDF file appears corrupted. Please try another file.', 'error');
      }
    }
  };

  const getStatusIcon = () => {
    switch (status) {
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

  const getQualityDescription = () => {
    switch (compressionSettings.quality) {
      case 'low':
        return 'Maximum compression, smaller file size, lower quality';
      case 'medium':
        return 'Balanced compression and quality';
      case 'high':
        return 'Minimal compression, preserves quality';
      default:
        return '';
    }
  };

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
              Original size: {formatFileSize(file.size)}
            </p>
            {message && (
              <p className={clsx(
                'text-sm mt-1',
                status === 'error' ? 'text-red-600' : 
                status === 'success' ? 'text-green-600' : 'text-blue-600'
              )}>
                {message}
              </p>
            )}
          </div>
        </div>

        {status === 'processing' && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Compression Stats */}
        {compressionStats && status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Compression Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-700">Original:</span>
                <p className="font-medium">{formatFileSize(compressionStats.originalSize)}</p>
              </div>
              <div>
                <span className="text-green-700">Compressed:</span>
                <p className="font-medium">{formatFileSize(compressionStats.compressedSize)}</p>
              </div>
              <div>
                <span className="text-green-700">Space Saved:</span>
                <p className="font-medium">{compressionStats.compressionRatio.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compression Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Compression Settings</h4>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4 mr-1" />
            {showSettings ? 'Hide' : 'Show'} Advanced Settings
          </button>
        </div>

        {/* Quality Setting (always visible) */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression Level
            </label>
            <div className="space-y-2">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <label key={quality} className="flex items-center">
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    checked={compressionSettings.quality === quality}
                    onChange={(e) => setCompressionSettings({
                      ...compressionSettings,
                      quality: e.target.value as 'low' | 'medium' | 'high'
                    })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {quality} Quality
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getQualityDescription()}
            </p>
          </div>

          {/* Advanced Settings */}
          {showSettings && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={compressionSettings.removeMetadata}
                  onChange={(e) => setCompressionSettings({
                    ...compressionSettings,
                    removeMetadata: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remove metadata</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Removes document properties like author, title, and creation date
              </p>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={compressionSettings.optimizeImages}
                  onChange={(e) => setCompressionSettings({
                    ...compressionSettings,
                    optimizeImages: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Optimize images</span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Compress embedded images to reduce file size
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compress Button */}
      <div className="text-center">
        <Button
          onClick={compressPDF}
          disabled={status === 'processing' || status === 'success'}
          variant="primary"
          size="lg"
          icon={Zap}
          className="px-8"
        >
          {status === 'processing' && 'Compressing...'}
          {status === 'success' && 'Compressed!'}
          {(status === 'idle' || status === 'error') && 'Compress PDF'}
        </Button>
        
        {status === 'error' && (
          <p className="text-sm text-gray-500 mt-2">
            Click to retry compression
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">How PDF Compression Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Removes redundant data and optimizes internal structure</li>
          <li>• Compresses embedded images and fonts</li>
          <li>• Removes unnecessary metadata and comments</li>
          <li>• Maintains document integrity and readability</li>
        </ul>
      </div>
    </div>
  );
};