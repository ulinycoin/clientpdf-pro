import React, { useState } from 'react';
import { Combine, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';
import { useSEO } from '../hooks/useSEO';

export const MergePDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // SEO optimization for merge PDF page
  useSEO({
    title: 'Merge PDF Files Online Free - Combine Multiple PDFs | LocalPDF',
    description: 'Merge multiple PDF files into one document for free. Fast, secure PDF merger that works in your browser. No file uploads, complete privacy guaranteed.',
    keywords: 'merge pdf, combine pdf, join pdf files, merge pdf online, pdf merger, combine documents',
    canonical: 'https://localpdf.online/merge-pdf',
    ogImage: 'https://localpdf.online/og-image.png',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'PDF Merger - LocalPDF',
      'description': 'Merge multiple PDF files into a single document',
      'url': 'https://localpdf.online/merge-pdf',
      'applicationCategory': 'Productivity',
      'operatingSystem': 'Web Browser',
      'isAccessibleForFree': true,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'Merge up to 20 PDF files',
        'Drag and drop interface',
        'Custom page order',
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
        <span className="text-gray-900">Merge PDF</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Combine className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Merge PDF Files
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Combine multiple PDF documents into a single file. Maintain original quality and formatting 
          while organizing your documents efficiently.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How PDF Merging Works</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Upload 2 or more PDF files using the upload zone below</p>
              <p>• Files will be merged in the order you select them</p>
              <p>• All pages from each PDF will be combined sequentially</p>
              <p>• Download your merged PDF file instantly</p>
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
          <h3 className="font-semibold text-gray-900 mb-3">🔧 Advanced Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Preserve original PDF quality and formatting</li>
            <li>• Maintain bookmarks and metadata</li>
            <li>• Support for password-protected PDFs</li>
            <li>• No file size limits (browser dependent)</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">⚡ Why Choose LocalPDF</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 100% privacy - files never leave your device</li>
            <li>• No registration or email required</li>
            <li>• Unlimited usage - completely free</li>
            <li>• Works offline after initial page load</li>
          </ul>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-gray max-w-none">
        <h2>About PDF Merging</h2>
        <p>
          PDF merging is the process of combining multiple PDF documents into a single file. 
          This is particularly useful for organizing related documents, creating reports, 
          or consolidating paperwork. Our tool maintains the original quality and formatting 
          of your documents while ensuring complete privacy.
        </p>
        
        <h3>Common Use Cases</h3>
        <ul>
          <li>Combining multiple invoices or receipts</li>
          <li>Merging chapters of a book or report</li>
          <li>Consolidating multiple forms or applications</li>
          <li>Creating comprehensive documentation packages</li>
        </ul>

        <h3>How to Merge PDF Files Online</h3>
        <ol>
          <li><strong>Upload your PDFs:</strong> Click the upload area above or drag and drop your PDF files</li>
          <li><strong>Arrange order:</strong> Files will be merged in the order they're uploaded</li>
          <li><strong>Process files:</strong> Click merge to combine your PDFs</li>
          <li><strong>Download result:</strong> Save your merged PDF file to your device</li>
        </ol>

        <h3>Why Use Browser-Based PDF Merging?</h3>
        <p>
          Unlike traditional online PDF tools that upload your files to remote servers, LocalPDF 
          processes everything locally in your browser. This means your sensitive documents never 
          leave your device, ensuring maximum privacy and security. Plus, it's faster since there's 
          no upload or download time.
        </p>
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