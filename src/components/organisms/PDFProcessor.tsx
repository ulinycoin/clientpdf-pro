import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Trash2, Settings } from 'lucide-react';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

interface PDFProcessorProps {
  file: File;
  onRemove: () => void;
  type: 'compress' | 'convert' | 'merge';
}

interface CompressionSettings {
  quality: 'low' | 'medium' | 'high';
  removeMetadata: boolean;
}

const PDFProcessor: React.FC<PDFProcessorProps> = ({ file, onRemove, type }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 'medium',
    removeMetadata: true,
  });
  const [showSettings, setShowSettings] = useState(false);

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
    } catch (error: any) {
      console.error('Error compressing PDF:', error);
      updateStatus(0, `Error compressing PDF: ${error.message}`, 'error');
      
      // Enhanced error reporting
      if (error.message.includes('out of memory')) {
        updateStatus(0, 'File too large. Try a smaller file or compress in parts.', 'warning');
      } else if (error.message.includes('corrupt')) {
        updateStatus(0, 'PDF file appears corrupted. Please try another file.', 'error');
      }
    }
  };

  // Convert to JPG
  const convertToJPG = async (file: File) => {
    try {
      updateStatus(10, 'Loading PDF for conversion...', 'info');
      
      // Dynamic import for better code splitting
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      updateStatus(30, `Found ${pdf.numPages} pages to convert...`, 'info');
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        updateStatus(30 + (i / pdf.numPages) * 60, `Converting page ${i} of ${pdf.numPages}...`, 'info');
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${file.name.replace('.pdf', '')}-page-${i}.jpg`);
          }
        }, 'image/jpeg', 0.9);
      }
      
      updateStatus(100, `Successfully converted ${pdf.numPages} pages to JPG!`, 'success');
    } catch (error: any) {
      console.error('Error converting PDF:', error);
      updateStatus(0, `Error converting PDF: ${error.message}`, 'error');
    }
  };

  const handleProcess = () => {
    setStatus('processing');
    if (type === 'compress') {
      compressPDF(file);
    } else if (type === 'convert') {
      convertToJPG(file);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{file.name}</h3>
          <p className="text-sm text-gray-500">Size: {formatFileSize(file.size)}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-500 transition-colors"
          aria-label="Remove file"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {type === 'compress' && (
        <div className="mb-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4 mr-1" />
            Compression Settings
          </button>
          
          {showSettings && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Quality</label>
                <select
                  value={compressionSettings.quality}
                  onChange={(e) => setCompressionSettings({
                    ...compressionSettings,
                    quality: e.target.value as 'low' | 'medium' | 'high'
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="low">Low (Smaller file)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Better quality)</option>
                </select>
              </div>
              
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
            </div>
          )}
        </div>
      )}

      {status !== 'idle' && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className={clsx('mr-2', getStatusColor())}>
              {getStatusIcon()}
            </div>
            <p className={clsx('text-sm', getStatusColor())}>{message}</p>
          </div>
          
          {status === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleProcess}
        disabled={status === 'processing' || status === 'success'}
        variant="primary"
        size="md"
        className="w-full"
      >
        {status === 'idle' && (type === 'compress' ? 'Compress PDF' : 'Convert to JPG')}
        {status === 'processing' && 'Processing...'}
        {status === 'success' && 'Completed!'}
        {status === 'error' && 'Retry'}
      </Button>
    </div>
  );
};

export { PDFProcessor };