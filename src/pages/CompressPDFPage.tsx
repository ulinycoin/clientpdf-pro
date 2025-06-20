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


import React, { useState, lazy, Suspense } from 'react';
import { Zap, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { useSEO } from '../hooks/useSEO';

// Lazy load PDF compress processor
const PDFCompressProcessor = lazy(() => 
  import('../components/organisms/PDFCompressProcessor').then(module => ({
    default: module.PDFCompressProcessor
  }))
);

// Loading fallback component
const PDFProcessorLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
    <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
    <p className="text-gray-600 font-medium">Loading PDF processor...</p>
    <p className="text-sm text-gray-500 mt-1">Initializing compression tools</p>
  </div>
);

export const CompressPDFPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // SEO optimization for compress PDF page
  useSEO({
    title: 'Compress PDF Online Free - Reduce PDF File Size | LocalPDF',
    description: 'Compress PDF files to reduce file size without losing quality. Fast, secure PDF compression that works in your browser with complete privacy.',
    keywords: 'compress pdf, reduce pdf size, pdf compressor, optimize pdf, shrink pdf file',
    canonical: 'https://localpdf.online/compress-pdf',
    ogImage: 'https://localpdf.online/og-image.png',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'PDF Compressor - LocalPDF',
      'description': 'Compress PDF files to reduce file size while maintaining quality',
      'url': 'https://localpdf.online/compress-pdf',
      'applicationCategory': 'Productivity',
      'operatingSystem': 'Web Browser',
      'isAccessibleForFree': true,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'Multiple compression levels',
        'Preserve document quality',
        'Remove metadata',
        'No file uploads required',
        'Privacy-first processing'
      ]
    }
  });

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]); // Only take the first file for compression
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Compress PDF</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Zap className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Compress PDF Files
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Reduce PDF file sizes while maintaining document quality. 
          Perfect for email sharing, web uploads, and storage optimization.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-orange-50 rounded-lg p-6 mb-8 border border-orange-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">How PDF Compression Works</h3>
            <div className="space-y-2 text-sm text-orange-800">
              <p>• Upload your PDF file using the upload zone below</p>
              <p>• Choose your compression level (low, medium, or high quality)</p>
              <p>• Optionally remove metadata to save additional space</p>
              <p>• Download your optimized PDF with reduced file size</p>
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
        maxFiles={1}
      />

      {/* Processor */}
      {selectedFile && (
        <Suspense fallback={<PDFProcessorLoading />}>
          <PDFCompressProcessor file={selectedFile} />
        </Suspense>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">⚡ Compression Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Multiple quality levels to choose from</li>
            <li>• Smart optimization algorithms</li>
            <li>• Metadata removal option</li>
            <li>• Maintain document readability</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📊 Compression Benefits</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Faster email attachments</li>
            <li>• Reduced storage requirements</li>
            <li>• Quicker web page loading</li>
            <li>• Better mobile device performance</li>
          </ul>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-gray max-w-none">
        <h2>About PDF Compression</h2>
        <p>
          PDF compression reduces file sizes by optimizing the internal structure, removing redundant data, 
          and compressing embedded images. This process helps you create smaller files that are easier to 
          share, upload, and store while maintaining the document's visual quality and functionality.
        </p>
        
        <h3>Why Compress PDF Files?</h3>
        <ul>
          <li><strong>Email Limits:</strong> Many email providers limit attachment sizes to 25MB or less</li>
          <li><strong>Upload Speed:</strong> Smaller files upload faster to cloud storage and websites</li>
          <li><strong>Storage Space:</strong> Compressed PDFs take up less disk space</li>
          <li><strong>Mobile Performance:</strong> Smaller files load faster on mobile devices</li>
          <li><strong>Bandwidth Savings:</strong> Reduced data usage when sharing or downloading</li>
        </ul>

        <h3>Compression Quality Levels</h3>
        <p>Choose the right compression level based on your needs:</p>
        <ul>
          <li><strong>Low Quality:</strong> Maximum compression for the smallest file size</li>
          <li><strong>Medium Quality:</strong> Balanced compression and quality (recommended)</li>
          <li><strong>High Quality:</strong> Minimal compression to preserve maximum quality</li>
        </ul>

        <h3>How to Compress PDF Files Online</h3>
        <ol>
          <li><strong>Upload your PDF:</strong> Drag and drop or click to select your PDF file</li>
          <li><strong>Choose settings:</strong> Select compression level and optimization options</li>
          <li><strong>Process file:</strong> Click compress to optimize your PDF</li>
          <li><strong>Download result:</strong> Save the compressed PDF to your device</li>
        </ol>

        <h3>Privacy and Security</h3>
        <p>
          LocalPDF processes your files entirely in your browser using client-side JavaScript. 
          This means your PDF files never leave your device, ensuring complete privacy and security. 
          No server uploads, no data storage, and no risk of unauthorized access to your documents.
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