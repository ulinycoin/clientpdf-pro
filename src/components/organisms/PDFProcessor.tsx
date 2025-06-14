import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Scissors, Combine, Settings, Play, Image, Minimize2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

interface PDFProcessorProps {
  files: File[];
  className?: string;
}

export const PDFProcessor: React.FC<PDFProcessorProps> = ({
  files,
  className,
}) => {
  const [operation, setOperation] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const pdfFiles = files.filter(file => file.type === 'application/pdf');
  const imageFiles = files.filter(file => file.type.startsWith('image/'));

  console.log('PDFProcessor render:', { pdfFiles: pdfFiles.length, imageFiles: imageFiles.length });

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setOperation('merge')}
          className="p-4 border-2 rounded-lg border-blue-500 bg-blue-50"
        >
          <Combine className="h-8 w-8 text-blue-600 mb-2" />
          <h4 className="font-medium text-gray-900">Merge PDFs</h4>
          <p className="text-sm text-gray-600">Combine multiple PDF files</p>
        </button>

        <button
          onClick={() => setOperation('imageToPdf')}
          className="p-4 border-2 rounded-lg border-purple-500 bg-purple-50"
        >
          <Image className="h-8 w-8 text-purple-600 mb-2" />
          <h4 className="font-medium text-gray-900">Images to PDF</h4>
          <p className="text-sm text-gray-600">Convert images to PDF</p>
        </button>
      </div>

      {operation && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={() => alert(`Selected: ${operation}`)}
            disabled={processing}
          >
            Execute {operation}
          </Button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p>PDF Files: {pdfFiles.length}</p>
        <p>Image Files: {imageFiles.length}</p>
      </div>
    </div>
  );
};