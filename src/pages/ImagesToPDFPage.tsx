import React, { useState, useEffect } from 'react';
import { FileImage, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import { FileUploadZone } from '../components/molecules/FileUploadZone';
import { PDFProcessor } from '../components/organisms/PDFProcessor';
import { InternalLinkSection } from '../components/molecules/InternalLinkSection';
import { usePageSchema, toolSchemas } from '../hooks/usePageSchema';

export const ImagesToPDFPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Добавляем structured data для этой страницы
  usePageSchema(toolSchemas.imagesToPdf, 'images-to-pdf');

  // Обновляем title и meta для SEO
  useEffect(() => {
    document.title = 'Convert Images to PDF Online Free - JPG, PNG to PDF';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Convert JPG, PNG, and other images to PDF format online. Free image to PDF converter that works in your browser. No uploads required.'
      );
    }
  }, []);

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
          <FileImage className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Convert Images to PDF
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform JPG, PNG, GIF, and other image formats into PDF documents. 
          Perfect for creating photo albums, portfolios, or document compilations.
        </p>
      </div>

      {/* Tool Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <FileUploadZone
          onFilesSelected={handleFilesSelected}
          acceptedTypes={['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']}
          maxFiles={20}
          maxSize={10 * 1024 * 1024} // 10MB per image
          className="mb-6"
        />
        
        {selectedFiles.length > 0 && (
          <PDFProcessor
            operation="imageToPdf"
            pdfFiles={[]}
            imageFiles={selectedFiles}
          />
        )}
      </div>

      {/* Supported Formats */}
      <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-200">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">
          Supported Image Formats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded border border-purple-200 text-center">
            <div className="text-2xl mb-1">📸</div>
            <h3 className="font-medium text-purple-900">JPEG/JPG</h3>
            <p className="text-xs text-purple-700">Most common photo format</p>
          </div>
          
          <div className="bg-white p-3 rounded border border-purple-200 text-center">
            <div className="text-2xl mb-1">🖼️</div>
            <h3 className="font-medium text-purple-900">PNG</h3>
            <p className="text-xs text-purple-700">Transparent backgrounds</p>
          </div>
          
          <div className="bg-white p-3 rounded border border-purple-200 text-center">
            <div className="text-2xl mb-1">🎞️</div>
            <h3 className="font-medium text-purple-900">GIF</h3>
            <p className="text-xs text-purple-700">Simple graphics</p>
          </div>
          
          <div className="bg-white p-3 rounded border border-purple-200 text-center">
            <div className="text-2xl mb-1">🌐</div>
            <h3 className="font-medium text-purple-900">WebP</h3>
            <p className="text-xs text-purple-700">Modern web format</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Image to PDF Conversion Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-purple-600">1.</span>
              Upload your images (up to 20 files, 10MB each)
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-purple-600">2.</span>
              Images are automatically arranged in upload order
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-purple-600">3.</span>
              Each image becomes a page in the PDF
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-purple-600">4.</span>
              Download your multi-page PDF document
            </li>
          </ol>
          
          <div className="space-y-3">
            <div className="bg-purple-50 p-4 rounded border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">📐 Smart Sizing</h4>
              <p className="text-sm text-purple-700">
                Images are automatically resized to fit PDF pages while maintaining aspect ratio
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">🎨 Quality Preserved</h4>
              <p className="text-sm text-purple-700">
                Original image quality is maintained in the PDF output
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📚 Document Scanning</h4>
            <p className="text-sm text-gray-600">
              Convert phone photos of documents into professional PDF files
            </p>
          </div>
          
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">🎨 Portfolio Creation</h4>
            <p className="text-sm text-gray-600">
              Combine artwork, designs, or photos into a single portfolio PDF
            </p>
          </div>
          
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">📄 Report Assembly</h4>
            <p className="text-sm text-gray-600">
              Include charts, graphs, and screenshots in business reports
            </p>
          </div>
        </div>
      </div>

      {/* Internal Links */}
      <InternalLinkSection currentTool="/images-to-pdf" className="mb-8" />

      {/* External Resources */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Format Resources</h3>
        <div className="space-y-2">
          <a 
            href="https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Web Image Formats Guide (MDN)
          </a>
          <a 
            href="https://www.w3.org/Graphics/JPEG/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            JPEG Standard Information (W3C)
          </a>
        </div>
      </div>
    </div>
  );
};