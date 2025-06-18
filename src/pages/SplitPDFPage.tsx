import React, { useState } from 'react';
import { Scissors, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';
import { useSEO } from '../hooks/useSEO';

export const SplitPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // SEO optimization for split PDF page
  useSEO({
    title: 'Split PDF Online Free - Extract PDF Pages | LocalPDF',
    description: 'Split PDF files into separate pages or extract specific page ranges. Secure client-side processing with no file uploads required.',
    keywords: 'split pdf, extract pdf pages, divide pdf, separate pdf pages, pdf splitter',
    canonical: 'https://localpdf.online/split-pdf',
    ogImage: 'https://localpdf.online/og-image.png',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'PDF Splitter - LocalPDF',
      'description': 'Split PDF files into individual pages or custom ranges',
      'url': 'https://localpdf.online/split-pdf',
      'applicationCategory': 'Productivity',
      'operatingSystem': 'Web Browser',
      'isAccessibleForFree': true,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'Split into individual pages',
        'Extract page ranges',
        'Preview before splitting',
        'No file uploads required',
        'Privacy-first processing'
      ]
    }
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Split PDF</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Scissors className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Split PDF Files
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract pages from PDF documents or split them into separate files. 
          Choose specific pages or ranges to create new PDF documents.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-green-50 rounded-lg p-6 mb-8 border border-green-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">How PDF Splitting Works</h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>• Upload a PDF file using the upload zone below</p>
              <p>• Preview all pages and select which ones to extract</p>
              <p>• Choose to split into individual pages or custom ranges</p>
              <p>• Download your extracted pages as separate PDF files</p>
              <p>• Your files are processed locally - never uploaded to servers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <FileUploadZone 
        onFilesSelected={handleFilesSelected}
        acceptedTypes={['.pdf']}
        className="mb-8"
      />

      {/* Processor */}
      {selectedFiles.length > 0 && (
        <PDFProcessor files={selectedFiles} />
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">✂️ Split Options</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Extract individual pages</li>
            <li>• Split by page ranges (e.g., pages 1-5)</li>
            <li>• Remove unwanted pages</li>
            <li>• Maintain original quality and formatting</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">🔒 Privacy & Security</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 100% privacy - files never leave your device</li>
            <li>• No file size limits (browser dependent)</li>
            <li>• Works with password-protected PDFs</li>
            <li>• No registration required</li>
          </ul>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-gray max-w-none">
        <h2>About PDF Splitting</h2>
        <p>
          PDF splitting allows you to extract specific pages or sections from a larger PDF document. 
          This is useful when you need to share only certain pages, reduce file size, or organize 
          content into separate documents. Our tool processes everything locally in your browser 
          for maximum privacy and security.
        </p>
        
        <h3>Common Use Cases for PDF Splitting</h3>
        <ul>
          <li>Extracting specific pages from reports or presentations</li>
          <li>Separating chapters from large documents</li>
          <li>Removing sensitive pages before sharing</li>
          <li>Creating smaller files for easier email sharing</li>
          <li>Organizing multi-page scans into individual documents</li>
        </ul>

        <h3>How to Split PDF Files Online</h3>
        <ol>
          <li><strong>Upload your PDF:</strong> Click the upload area above or drag and drop your PDF file</li>
          <li><strong>Preview pages:</strong> View thumbnails of all pages in your document</li>
          <li><strong>Select pages:</strong> Choose which pages to extract or split</li>
          <li><strong>Process file:</strong> Click split to create your new PDF files</li>
          <li><strong>Download results:</strong> Save the extracted pages to your device</li>
        </ol>

        <h3>Benefits of Browser-Based PDF Splitting</h3>
        <p>
          Traditional online PDF tools require uploading your files to remote servers, which can be 
          slow and pose security risks. LocalPDF processes everything locally in your browser, meaning:
        </p>
        <ul>
          <li><strong>Privacy:</strong> Your files never leave your device</li>
          <li><strong>Speed:</strong> No upload/download time required</li>
          <li><strong>Security:</strong> No risk of data breaches or unauthorized access</li>
          <li><strong>Offline capability:</strong> Works without internet after initial load</li>
        </ul>
      </div>

      {/* Back to Home */}
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