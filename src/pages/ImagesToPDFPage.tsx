import React, { useState } from 'react';
import { Image, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';
import { useSEO } from '../hooks/useSEO';

export const ImagesToPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // SEO optimization for images to PDF page
  useSEO({
    title: 'Convert Images to PDF Free - JPG, PNG to PDF Converter | LocalPDF',
    description: 'Convert images (JPG, PNG, WebP, GIF) to PDF format for free. Batch image to PDF converter with custom sizing. No uploads, complete privacy.',
    keywords: 'convert images to pdf, jpg to pdf, png to pdf, image to pdf converter, photos to pdf',
    canonical: 'https://localpdf.online/images-to-pdf',
    ogImage: 'https://localpdf.online/og-image.png',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Image to PDF Converter - LocalPDF',
      'description': 'Convert multiple images to a single PDF document',
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
        'Convert multiple image formats',
        'Batch processing',
        'Custom page sizes',
        'Quality preservation',
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
        <span className="text-gray-900">Images to PDF</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Image className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Convert Images to PDF
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your images into professional PDF documents. Support for JPG, PNG, WebP, GIF, 
          and other popular image formats with batch processing capabilities.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">How Image to PDF Conversion Works</h3>
            <div className="space-y-2 text-sm text-purple-800">
              <p>• Upload one or more image files using the upload zone below</p>
              <p>• Supported formats: JPG, JPEG, PNG, WebP, GIF, BMP</p>
              <p>• Images will be arranged in the order you upload them</p>
              <p>• Choose page size and orientation options</p>
              <p>• Download your converted PDF document instantly</p>
              <p>• Your files are processed locally - never uploaded to servers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <FileUploadZone 
        onFilesSelected={handleFilesSelected}
        acceptedTypes={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']}
        className="mb-8"
      />

      {/* Processor */}
      {selectedFiles.length > 0 && (
        <PDFProcessor files={selectedFiles} />
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">🖼️ Supported Formats</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>JPG/JPEG:</strong> Most common photo format</li>
            <li>• <strong>PNG:</strong> High quality with transparency</li>
            <li>• <strong>WebP:</strong> Modern web format</li>
            <li>• <strong>GIF:</strong> Animated and static images</li>
            <li>• <strong>BMP:</strong> Uncompressed bitmap images</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">⚙️ Conversion Options</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Multiple page sizes (A4, Letter, Custom)</li>
            <li>• Portrait and landscape orientations</li>
            <li>• Quality preservation settings</li>
            <li>• Batch processing capabilities</li>
            <li>• Custom margins and spacing</li>
          </ul>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-gray max-w-none">
        <h2>About Image to PDF Conversion</h2>
        <p>
          Converting images to PDF format creates professional documents that are easy to share, 
          print, and archive. PDF files maintain image quality while providing a standardized 
          format that opens consistently across all devices and platforms.
        </p>
        
        <h3>Common Use Cases for Image to PDF Conversion</h3>
        <ul>
          <li>Creating photo albums and portfolios</li>
          <li>Compiling scanned documents into single files</li>
          <li>Converting screenshots for documentation</li>
          <li>Preparing images for professional presentations</li>
          <li>Archiving important visual documents</li>
          <li>Creating printable image collections</li>
        </ul>

        <h3>How to Convert Images to PDF Online</h3>
        <ol>
          <li><strong>Upload images:</strong> Click the upload area above or drag and drop your image files</li>
          <li><strong>Arrange order:</strong> Images will appear in the order you select them</li>
          <li><strong>Choose settings:</strong> Select page size, orientation, and quality options</li>
          <li><strong>Convert files:</strong> Click convert to create your PDF document</li>
          <li><strong>Download PDF:</strong> Save your converted document to your device</li>
        </ol>

        <h3>Image Formats Explained</h3>
        <p>
          Different image formats serve different purposes, and our converter supports all major types:
        </p>
        <ul>
          <li><strong>JPEG/JPG:</strong> Best for photographs with many colors</li>
          <li><strong>PNG:</strong> Ideal for graphics with transparency or sharp edges</li>
          <li><strong>WebP:</strong> Modern format offering excellent compression</li>
          <li><strong>GIF:</strong> Good for simple graphics and animations</li>
          <li><strong>BMP:</strong> Uncompressed format for maximum quality</li>
        </ul>

        <h3>Benefits of PDF Format for Images</h3>
        <p>
          Converting images to PDF offers several advantages over keeping them as individual files:
        </p>
        <ul>
          <li><strong>Universal compatibility:</strong> PDF opens on any device</li>
          <li><strong>Print-ready:</strong> Consistent printing results</li>
          <li><strong>Professional appearance:</strong> Clean, organized presentation</li>
          <li><strong>Easy sharing:</strong> Single file instead of multiple images</li>
          <li><strong>Security options:</strong> Password protection and permissions</li>
          <li><strong>Smaller file sizes:</strong> Efficient compression algorithms</li>
        </ul>

        <h3>Privacy and Security</h3>
        <p>
          LocalPDF processes all your images locally in your browser, meaning your photos and 
          documents never leave your device. This is especially important for:
        </p>
        <ul>
          <li>Personal photos and family documents</li>
          <li>Business-sensitive materials</li>
          <li>Legal or medical documents</li>
          <li>Confidential presentations or portfolios</li>
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