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
import { Clock, CheckCircle, AlertCircle, FileImage, Download, Trash2, GripVertical, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';

interface ImagesToPDFProcessorProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
  onReorderFiles?: (files: File[]) => void;
}

interface ConversionSettings {
  pageSize: 'auto' | 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: number;
  quality: 'low' | 'medium' | 'high';
  fitToPage: boolean;
}

interface ImageStatus {
  file: File;
  status: 'idle' | 'processing' | 'success' | 'error';
  error?: string;
  preview?: string;
}

export const ImagesToPDFProcessor: React.FC<ImagesToPDFProcessorProps> = ({ 
  files, 
  onRemoveFile,
  onReorderFiles 
}) => {
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([]);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [conversionMessage, setConversionMessage] = useState('');
  const [showSettings, setShowSettings] = useState(true); // Show settings by default
  const [settings, setSettings] = useState<ConversionSettings>({
    pageSize: 'a4', // Changed from 'auto' to 'a4' by default
    orientation: 'portrait',
    margin: 20,
    quality: 'medium',
    fitToPage: true,
  });

  // Update image statuses when files prop changes
  React.useEffect(() => {
    const newStatuses = files.map(file => ({ file, status: 'idle' as const }));
    setImageStatuses(newStatuses);
    setConversionStatus('idle');
    setConversionProgress(0);
    setConversionMessage('');
    
    // Generate previews
    generatePreviews(newStatuses);
  }, [files]);

  const generatePreviews = async (statuses: ImageStatus[]) => {
    for (let i = 0; i < statuses.length; i++) {
      const file = statuses[i].file;
      
      try {
        const preview = await createImagePreview(file);
        setImageStatuses(prev => prev.map((status, idx) => 
          idx === i ? { ...status, preview } : status
        ));
      } catch (error) {
        console.error('Error generating preview for', file.name, error);
      }
    }
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Create thumbnail
          const maxSize = 150;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const loadImageAsArrayBuffer = (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const getPageDimensions = (imgWidth: number, imgHeight: number) => {
    // Standard page sizes in points (72 points = 1 inch)
    const pageSizes = {
      a4: { width: 595, height: 842 },
      letter: { width: 612, height: 792 },
      legal: { width: 612, height: 1008 },
      auto: { width: imgWidth, height: imgHeight }
    };

    let { width, height } = pageSizes[settings.pageSize];
    
    if (settings.orientation === 'landscape' && settings.pageSize !== 'auto') {
      [width, height] = [height, width];
    }

    return { width, height };
  };

  const convertToPDF = async () => {
    try {
      setConversionStatus('processing');
      setConversionProgress(5);
      setConversionMessage('Loading PDF library...');

      // Dynamically import PDF-lib
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      setConversionProgress(15);
      setConversionMessage('Creating PDF document...');

      const pdfDoc = await PDFDocument.create();
      
      setConversionProgress(25);

      // Process each image
      for (let i = 0; i < imageStatuses.length; i++) {
        const imageStatus = imageStatuses[i];
        
        try {
          setConversionMessage(`Processing ${imageStatus.file.name}...`);
          setConversionProgress(25 + (i / imageStatuses.length) * 60);
          
          // Update individual image status
          setImageStatuses(prev => prev.map((status, idx) => 
            idx === i ? { ...status, status: 'processing' } : status
          ));

          // Load image
          const imageBytes = await loadImageAsArrayBuffer(imageStatus.file);
          
          let image;
          const fileType = imageStatus.file.type.toLowerCase();
          
          if (fileType.includes('jpeg') || fileType.includes('jpg')) {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (fileType.includes('png')) {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            throw new Error(`Unsupported image format: ${fileType}`);
          }

          // Calculate page dimensions
          const { width: imgWidth, height: imgHeight } = image.scaleToFit(image.width, image.height);
          const { width: pageWidth, height: pageHeight } = getPageDimensions(imgWidth, imgHeight);

          // Create new page
          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          // Calculate image position and size
          let drawWidth = imgWidth;
          let drawHeight = imgHeight;
          let x = settings.margin;
          let y = settings.margin;

          if (settings.fitToPage && settings.pageSize !== 'auto') {
            const availableWidth = pageWidth - (settings.margin * 2);
            const availableHeight = pageHeight - (settings.margin * 2);
            
            const scaleX = availableWidth / imgWidth;
            const scaleY = availableHeight / imgHeight;
            const scale = Math.min(scaleX, scaleY);
            
            drawWidth = imgWidth * scale;
            drawHeight = imgHeight * scale;
            
            // Center the image
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
          }

          // Draw image on page
          page.drawImage(image, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          });

          // Mark image as successful
          setImageStatuses(prev => prev.map((status, idx) => 
            idx === i ? { ...status, status: 'success' } : status
          ));
          
        } catch (error: any) {
          console.error(`Error processing ${imageStatus.file.name}:`, error);
          
          // Mark image as error
          setImageStatuses(prev => prev.map((status, idx) => 
            idx === i ? { ...status, status: 'error', error: error.message } : status
          ));
          
          // Continue with other images
          continue;
        }
      }

      setConversionProgress(90);
      setConversionMessage('Finalizing PDF...');

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      setConversionProgress(95);
      setConversionMessage('Preparing download...');

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `images-to-pdf-${timestamp}.pdf`);

      setConversionProgress(100);
      setConversionStatus('success');
      setConversionMessage(`Successfully converted ${files.length} images to PDF!`);
      
    } catch (error: any) {
      console.error('Error converting images to PDF:', error);
      setConversionStatus('error');
      setConversionProgress(0);
      setConversionMessage(`Error converting images: ${error.message}`);
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
  const canConvert = files.length > 0 && conversionStatus !== 'processing';

  return (
    <div className="space-y-6">
      {/* Images List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileImage className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                Images ({files.length})
              </h3>
            </div>
            <div className="text-sm text-gray-600">
              Total size: {formatFileSize(totalSize)}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {imageStatuses.map((imageStatus, index) => (
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

              {/* Preview */}
              <div className="flex-shrink-0">
                {imageStatus.preview ? (
                  <img
                    src={imageStatus.preview}
                    alt={imageStatus.file.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    <FileImage className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {imageStatus.file.name}
                  </p>
                  {getStatusIcon(imageStatus.status)}
                </div>
                <p className="text-xs text-gray-500">
                  {formatFileSize(imageStatus.file.size)}
                </p>
                {imageStatus.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {imageStatus.error}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFile(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings - Always visible */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Conversion Settings</h4>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4 mr-1" />
            {showSettings ? 'Hide' : 'Show'} Settings
          </button>
        </div>

        {showSettings && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Size
                </label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    pageSize: e.target.value as ConversionSettings['pageSize'] 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">Auto (image size)</option>
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientation
                </label>
                <select
                  value={settings.orientation}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    orientation: e.target.value as 'portrait' | 'landscape' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={settings.pageSize === 'auto'}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
                {settings.pageSize === 'auto' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Orientation follows image dimensions when using Auto page size
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.fitToPage}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    fitToPage: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={settings.pageSize === 'auto'}
                />
                <span className="ml-2 text-sm text-gray-700">Fit images to page</span>
              </label>
              {settings.pageSize === 'auto' && (
                <p className="text-xs text-gray-500">
                  Not applicable with Auto page size
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margin: {settings.margin}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={settings.margin}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  margin: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={settings.pageSize === 'auto'}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>25px</span>
                <span>50px</span>
              </div>
              {settings.pageSize === 'auto' && (
                <p className="text-xs text-gray-500 mt-1">
                  Margins don't apply with Auto page size
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conversion Status */}
      {conversionStatus !== 'idle' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={clsx(
              'flex-shrink-0',
              conversionStatus === 'processing' && 'text-blue-600',
              conversionStatus === 'success' && 'text-green-600',
              conversionStatus === 'error' && 'text-red-600'
            )}>
              {conversionStatus === 'processing' && <Clock className="w-6 h-6 animate-spin" />}
              {conversionStatus === 'success' && <CheckCircle className="w-6 h-6" />}
              {conversionStatus === 'error' && <AlertCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className={clsx(
                'font-medium',
                conversionStatus === 'processing' && 'text-blue-900',
                conversionStatus === 'success' && 'text-green-900',
                conversionStatus === 'error' && 'text-red-900'
              )}>
                {conversionStatus === 'processing' && 'Converting to PDF...'}
                {conversionStatus === 'success' && 'Conversion Complete!'}
                {conversionStatus === 'error' && 'Conversion Failed'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {conversionMessage}
              </p>
            </div>
          </div>

          {conversionStatus === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${conversionProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Convert Button */}
      <div className="text-center">
        <Button
          onClick={convertToPDF}
          disabled={!canConvert}
          variant="primary"
          size="lg"
          icon={FileImage}
          className="px-8"
        >
          {conversionStatus === 'processing' ? 'Converting...' : `Convert ${files.length} Images to PDF`}
        </Button>
        
        {!canConvert && files.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Add images to start conversion
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <h4 className="font-medium text-purple-900 mb-2">Image to PDF Conversion</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Supports JPG, PNG image formats</li>
          <li>• Each image becomes a separate page in the PDF</li>
          <li>• Images are arranged in the order shown above</li>
          <li>• Original image quality is preserved</li>
          <li>• Settings apply to all images in the PDF</li>
        </ul>
      </div>
    </div>
  );
};
