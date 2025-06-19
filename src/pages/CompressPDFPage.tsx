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
import { Archive, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';
import { useSEO } from '../hooks/useSEO';

export const CompressPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // SEO optimization for compress PDF page
  useSEO({
    title: 'Compress PDF Online Free - Reduce PDF File Size | LocalPDF',
    description: 'Compress PDF files to reduce size while maintaining quality. Free PDF compressor with multiple quality options. No uploads, works in browser.',
    keywords: 'compress pdf, reduce pdf size, optimize pdf, shrink pdf, pdf compressor, minimize pdf',
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
        'Maintain PDF quality',
        'Reduce file size',
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
        <span className="text-gray-900">Compress PDF</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Archive className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Compress PDF Files
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Reduce PDF file size while maintaining quality. Perfect for email attachments, 
          web uploads, or saving storage space.
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
              <p>• Choose compression level: Low, Medium, or High</p>
              <p>• Our algorithm optimizes images and removes unnecessary data</p>
              <p>• Download your compressed PDF with reduced file size</p>
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
          <h3 className="font-semibold text-gray-900 mb-3">🗜️ Compression Options</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Low:</strong> Minimal compression, best quality</li>
            <li>• <strong>Medium:</strong> Balanced compression and quality</li>
            <li>• <strong>High:</strong> Maximum compression, smaller file</li>
            <li>• Smart optimization algorithms</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">⚡ Optimization Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Image compression and optimization</li>
            <li>• Remove unnecessary metadata</li>
            <li>• Optimize fonts and resources</li>
            <li>• Maintain document structure</li>
          </ul>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-gray max-w-none">
        <h2>About PDF Compression</h2>
        <p>
          PDF compression reduces file size by optimizing images, removing unnecessary data, 
          and using efficient encoding methods. This makes files easier to share via email, 
          faster to upload to websites, and helps save storage space while maintaining 
          document quality and readability.
        </p>
        
        <h3>When to Compress PDF Files</h3>
        <ul>
          <li>Email attachments with size limits</li>
          <li>Web uploads with bandwidth constraints</li>
          <li>Archiving documents to save storage</li>
          <li>Improving document load times</li>
          <li>Meeting platform-specific file size requirements</li>
        </ul>

        <h3>How to Compress PDF Files Online</h3>
        <ol>
          <li><strong>Upload your PDF:</strong> Click the upload area above or drag and drop your PDF file</li>
          <li><strong>Choose compression level:</strong> Select the balance between file size and quality</li>
          <li><strong>Process file:</strong> Our algorithm optimizes your PDF</li>
          <li><strong>Compare results:</strong> See the original vs compressed file size</li>
          <li><strong>Download:</strong> Save your optimized PDF file</li>
        </ol>

        <h3>Compression vs Quality</h3>
        <p>
          The key to effective PDF compression is finding the right balance between file size 
          reduction and maintaining visual quality. Our compression levels offer different 
          trade-offs:
        </p>
        <ul>
          <li><strong>Low compression:</strong> 10-30% size reduction, excellent quality</li>
          <li><strong>Medium compression:</strong> 30-50% size reduction, good quality</li>
          <li><strong>High compression:</strong> 50-70% size reduction, acceptable quality</li>
        </ul>

        <h3>Why Choose Browser-Based PDF Compression?</h3>
        <p>
          LocalPDF processes your files entirely in your browser, offering several advantages 
          over traditional online compressors:
        </p>
        <ul>
          <li><strong>Privacy:</strong> Files never leave your device</li>
          <li><strong>Speed:</strong> No upload/download time</li>
          <li><strong>Security:</strong> No risk of data interception</li>
          <li><strong>Unlimited use:</strong> No file limits or restrictions</li>
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