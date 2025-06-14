import React, { useState } from 'react';
import { FileText, Upload, Download, Settings } from 'lucide-react';
import { Button } from './components/atoms/Button';
import { FileUploadZone } from './components/molecules/FileUploadZone';
import { PDFPreview } from './components/molecules/PDFPreview';
import { PDFProcessor } from './components/organisms/PDFProcessor';
import { Footer } from './components/molecules/Footer'; // Добавляем импорт футера

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);
    setSelectedFiles(files);
    
    // Автоматически показываем первый PDF файл
    const firstPDF = files.find(file => file.type === 'application/pdf');
    if (firstPDF) {
      setCurrentPDF(firstPDF);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                LocalPDF
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Local PDF Processing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Process PDFs instantly in your browser. No uploads, no servers, your files never leave your device.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="card card-hover p-6">
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drag & Drop Upload
            </h3>
            <p className="text-gray-600">
              Simply drag and drop your files or click to browse. Supports multiple file formats.
            </p>
          </div>

          <div className="card card-hover p-6">
            <FileText className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Preview
            </h3>
            <p className="text-gray-600">
              Preview your PDFs with interactive page thumbnails. Reorder, split, or merge with ease.
            </p>
          </div>

          <div className="card card-hover p-6">
            <Download className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Instant Download
            </h3>
            <p className="text-gray-600">
              Process and download your files instantly. No server uploads, complete privacy guaranteed.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <FileUploadZone 
          onFilesSelected={handleFilesSelected}
          className="max-w-2xl mx-auto"
        />

        {/* PDF Operations */}
        {selectedFiles.length > 0 && (
          <div className="mt-8">
            <PDFProcessor files={selectedFiles} />
          </div>
        )}

        {/* PDF Preview */}
        {currentPDF && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                PDF Preview: {currentPDF.name}
              </h3>
              {selectedFiles.length > 1 && (
                <div className="flex space-x-2">
                  {selectedFiles
                    .filter(file => file.type === 'application/pdf')
                    .map((file, index) => (
                      <Button
                        key={index}
                        variant={file === currentPDF ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCurrentPDF(file)}
                      >
                        {file.name.substring(0, 20)}...
                      </Button>
                    ))}
                </div>
              )}
            </div>
            
            <PDFPreview
              file={currentPDF}
              className="h-96 lg:h-[600px]"
              onPagesLoaded={(count) => console.log(`PDF loaded with ${count} pages`)}
            />
          </div>
        )}
      </main>

      {/* Footer - добавляем в конец */}
      <Footer />
    </div>
  );
}

export default App;