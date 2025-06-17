import React, { useState } from 'react';
import { Minimize2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';

export const CompressPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Compress PDF</span>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Minimize2 className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Compress PDF Files
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Reduce PDF file size while maintaining quality. Choose compression level and optimization options.
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