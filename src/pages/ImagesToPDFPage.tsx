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
import { FileImage, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { useSEO } from '../hooks/useSEO';

// Lazy load Images to PDF processor
const ImagesToPDFProcessor = lazy(() => 
  import('../components/organisms/ImagesToPDFProcessor').then(module => ({
    default: module.ImagesToPDFProcessor
  }))
);

// Loading fallback component
const PDFProcessorLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
    <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
    <p className="text-gray-600 font-medium">Loading PDF processor...</p>
    <p className="text-sm text-gray-500 mt-1">Initializing image conversion tools</p>
  </div>
);

export const ImagesToPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // SEO optimization for images to PDF page
  useSEO({
    title: 'Convert Images to PDF Online Free - JPG, PNG to PDF | LocalPDF',
    description: 'Convert JPG, PNG and other images to PDF files online. Combine multiple images into one PDF document with custom page settings. Fast and secure.',
    keywords: 'convert images to pdf, jpg to pdf, png to pdf, image to pdf converter, photos to pdf',
    canonical: 'https://localpdf.online/images-to-pdf',
    ogImage: 'https://localpdf.online/og-image.png',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Images to PDF Converter - LocalPDF',
      'description': 'Convert images to PDF files with custom page settings',
      'url': 'https://localpdf.online/images-to-pdf',
      'applicationCategory': 'Productivity',
      'operatingSystem': 'Web Browser',
      'isAccessibleForFree': true,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        'Convert JPG, PNG to PDF',
        'Multiple page sizes',
        'Custom orientation settings',
        'No file uploads required',
        'Privacy-first processing'
      ]
    }
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleReorderFiles = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Images to PDF</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <FileImage className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Convert Images to PDF
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your JPG, PNG, and other image files into professional PDF documents. 
          Combine multiple images or convert them individually with custom settings.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">How Image to PDF Conversion Works</h3>
            <div className="space-y-2 text-sm text-purple-800">
              <p>• Upload your image files using the upload zone below</p>
              <p>• Arrange images in the desired order for your PDF</p>
              <p>• Choose page size, orientation, and other settings</p>
              <p>• Each image becomes a page in your PDF document</p>
              <p>• Your files are processed locally - never uploaded to servers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <FileUploadZone 
        onFilesSelected={handleFilesSelected}
        acceptedTypes={['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']}
        className="mb-8"
      />

      {/* Processor */}
      {selectedFiles.length > 0 && (
        <Suspense fallback={<PDFProcessorLoading />}>
          <ImagesToPDFProcessor 
            files={selectedFiles}
            onRemoveFile={handleRemoveFile}
            onReorderFiles={handleReorderFiles}
          />
        </Suspense>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">🖼️ Supported Formats</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• JPEG/JPG - Most common photo format</li>
            <li>• PNG - High quality with transparency</li>
            <li>• GIF - Animated and static images</li>
            <li>• BMP - Windows bitmap images</li>
            <li>• WebP - Modern web image format</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">⚙️ Conversion Options</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Multiple page sizes (A4, Letter, Legal, Auto)</li>
            <li>• Portrait and landscape orientation</li>
            <li>• Adjustable margins and spacing</li>
            <li>• Fit to page or preserve original size</li>
          </ul>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-gray max-w-none">
        <h2>About Image to PDF Conversion</h2>
        <p>
          Converting images to PDF format creates professional documents that are easy to share, 
          print, and archive. PDF files maintain image quality while providing a standardized 
          format that works across all devices and operating systems.
        </p>
        
        <h3>Common Use Cases for Image to PDF Conversion</h3>
        <ul>
          <li>Creating photo albums and portfolios</li>
          <li>Scanning and digitizing documents</li>
          <li>Combining multiple screenshots into one file</li>
          <li>Creating presentations from images</li>
          <li>Archiving important documents and photos</li>
          <li>Preparing images for professional printing</li>
        </ul>

        <h3>How to Convert Images to PDF Online</h3>
        <ol>
          <li><strong>Upload images:</strong> Select or drag and drop your image files</li>
          <li><strong>Arrange order:</strong> Reorder images as needed for your PDF</li>
          <li><strong>Configure settings:</strong> Choose page size, orientation, and margins</li>
          <li><strong>Convert:</strong> Click convert to create your PDF document</li>
          <li><strong>Download:</strong> Save the converted PDF to your device</li>
        </ol>

        <h3>Image Quality and Formats</h3>
        <p>
          Our converter supports all major image formats including JPEG, PNG, GIF, BMP, and WebP. 
          The original image quality is preserved during conversion, ensuring your PDF looks 
          exactly as intended.
        </p>

        <h4>Supported Image Formats:</h4>
        <ul>
          <li><strong>JPEG/JPG:</strong> Best for photographs and images with many colors</li>
          <li><strong>PNG:</strong> Ideal for images with transparency or text</li>
          <li><strong>GIF:</strong> Good for simple graphics and animations</li>
          <li><strong>BMP:</strong> Uncompressed format with high quality</li>
          <li><strong>WebP:</strong> Modern format with excellent compression</li>
        </ul>

        <h3>Privacy and Security</h3>
        <p>
          All image processing happens directly in your browser using JavaScript. Your images 
          never leave your device, ensuring complete privacy and security. No server uploads, 
          no data storage, and no risk of your personal photos being accessed by third parties.
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