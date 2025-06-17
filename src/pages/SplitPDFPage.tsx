import React, { useState } from 'react';
import { Scissors, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';

export const SplitPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Split PDF</span>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Scissors className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Split PDF Files
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract pages or split PDF documents into separate files. Choose specific page ranges or split each page individually.
        </p>
      </div>

      <FileUploadZone 
        onFilesSelected={setSelectedFiles}
        acceptedTypes={['.pdf']}
        maxFiles={1}
        className="mb-8"
      />

      {selectedFiles.length > 0 && (
        <PDFProcessor files={selectedFiles} />
      )}

      <div className="mt-12 text-center">
        <Link to="/">
          <Button variant="secondary" icon={ArrowLeft} iconPosition="left">
            Back to All Tools
          </Button>
        </Link>
      </div>
    </div>
  );
};