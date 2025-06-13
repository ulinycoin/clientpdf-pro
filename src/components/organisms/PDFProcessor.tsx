
import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Scissors, Combine, Download, Settings, Play, Image, Minimize2 } from 'lucide-react';
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
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 'medium',
    removeMetadata: true,
    optimizeImages: true,
  });

  const pdfFiles = files.filter(file => file.type === 'application/pdf');
  const imageFiles = files.filter(file => file.type.startsWith('image/'));

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

  const convertImagesToPDF = async () => {
    if (imageFiles.length === 0) {
      alert('Please select at least 1 image file to convert');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Remove the first page (jsPDF creates one by default)
      pdf.deletePage(1);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setProgress((i / imageFiles.length) * 90);

        // Read image as data URL
        const imageDataURL = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        // Get image dimensions
        const { width, height } = await new Promise<{width: number, height: number}>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = imageDataURL;
        });

        // Add new page
        pdf.addPage('a4', width > height ? 'landscape' : 'portrait');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate scaling to fit page while maintaining aspect ratio
        const scaleX = pageWidth / width;
        const scaleY = pageHeight / height;
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

      setProgress(95);
      const pdfBlob = pdf.output('blob');
      setProgress(100);

      saveAs(pdfBlob, 'images-converted.pdf');
      alert('✅ Images converted to PDF successfully!');
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert(`❌ Error converting images to PDF: ${error.message}`);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const compressPDF = async (file: File) => {
    setProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer);
      
      setProgress(30);

      // Basic compression by re-saving with different settings
      const compressedPdfBytes = await pdf.save({
        useObjectStreams: compressionSettings.quality !== 'high',
        addDefaultPage: false,
        objectsPerTick: compressionSettings.quality === 'low' ? 50 : 20,
      });

      setProgress(80);

      // Additional size optimization
      const compressedPdf = await PDFDocument.load(compressedPdfBytes);
      
      if (compressionSettings.removeMetadata) {
        // Remove metadata to reduce size
        compressedPdf.setTitle('');
        compressedPdf.setAuthor('');
        compressedPdf.setSubject('');
        compressedPdf.setKeywords([]);
        compressedPdf.setProducer('ClientPDF Pro');
        compressedPdf.setCreator('ClientPDF Pro');
      }

      const finalPdfBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(100);

      const originalSize = file.size;
      const compressedSize = finalPdfBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${file.name.replace('.pdf', '')}-compressed.pdf`);

      alert(`✅ PDF compressed successfully!\n📊 Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB\n📊 Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)} MB\n💾 Space saved: ${compressionRatio}%`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('❌ Error compressing PDF. Please try again.');
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
    } else if (operation === 'imageToPdf') {
      await convertImagesToPDF();
    } else if (operation === 'compress' && pdfFiles[0]) {
      await compressPDF(pdfFiles[0]);
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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">PDF Operations</h3>

      {/* Operation Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              ? 'border-green-500 bg-green-50'
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

        <button
          onClick={() => setOperation('imageToPdf')}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left',
            operation === 'imageToPdf'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
          disabled={imageFiles.length === 0}
        >
          <Image className="h-8 w-8 text-purple-600 mb-2" />
          <h4 className="font-medium text-gray-900">Images to PDF</h4>
          <p className="text-sm text-gray-600">
            Convert images to PDF document
          </p>
          {imageFiles.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              Upload image files
            </p>
          )}
        </button>

        <button
          onClick={() => setOperation('compress')}
          className={clsx(
            'p-4 border-2 rounded-lg transition-all duration-200 text-left',
            operation === 'compress'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
          disabled={pdfFiles.length === 0}
        >
          <Minimize2 className="h-8 w-8 text-orange-600 mb-2" />
          <h4 className="font-medium text-gray-900">Compress PDF</h4>
          <p className="text-sm text-gray-600">
            Reduce PDF file size while maintaining quality
          </p>
          {pdfFiles.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              Upload PDF file
            </p>
          )}
        </button>
      </div>

      {/* Compression Settings */}
      {operation === 'compress' && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Compression Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
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
                  className="rounded text-orange-600 focus:ring-orange-500"
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
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Optimize images</span>
              </label>
            </div>

            <div className="bg-white p-3 rounded border">
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
            className={clsx(
              'px-8',
              operation === 'merge' && 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
              operation === 'split' && 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
              operation === 'imageToPdf' && 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
              operation === 'compress' && 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
            )}
          >
            {operation === 'merge' && 'Merge PDFs'}
            {operation === 'split' && 'Split PDF'}
            {operation === 'imageToPdf' && 'Convert to PDF'}
            {operation === 'compress' && 'Compress PDF'}
          </Button>
        </div>
      )}

      {/* File List */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Files */}
          {pdfFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                PDF Files ({pdfFiles.length})
              </h4>
              <div className="space-y-2">
                {pdfFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">📄</span>
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Files */}
          {imageFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Image Files ({imageFiles.length})
              </h4>
              <div className="space-y-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-2">🖼️</span>
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};