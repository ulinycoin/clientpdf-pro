import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import ImageToPDFTool from './ImageToPDFTool';
import FileUploadZone from '../molecules/FileUploadZone';

const ImageToPDFToolWrapper: React.FC = () => {
  const { t } = useI18n();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTool, setShowTool] = useState(false);

  const handleFileSelect = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      setSelectedFiles(imageFiles);
      setShowTool(true);
    }
  };

  const handleComplete = () => {
    setShowTool(false);
    setSelectedFiles([]);
  };

  const handleClose = () => {
    setShowTool(false);
    setSelectedFiles([]);
  };

  if (showTool) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ImageToPDFTool
          files={selectedFiles}
          onComplete={handleComplete}
          onClose={handleClose}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <FileUploadZone
          onFilesSelected={handleFileSelect}
          acceptedTypes={['image/*']}
          multiple={true}
          maxFiles={100}
          title={t('imagesToPdf.uploadTitle')}
          subtitle={t('imagesToPdf.uploadDescription')}
          buttonText={t('imagesToPdf.selectFiles')}
          supportedFormats={t('imagesToPdf.supportedFiles')}
          icon="🖼️"
        />
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {t('imagesToPdf.howToTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('imagesToPdf.howTo.uploadImages.title')}
            </h3>
            <p className="text-gray-600">
              {t('imagesToPdf.howTo.uploadImages.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('imagesToPdf.howTo.configureSettings.title')}
            </h3>
            <p className="text-gray-600">
              {t('imagesToPdf.howTo.configureSettings.description')}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('imagesToPdf.howTo.generatePdf.title')}
            </h3>
            <p className="text-gray-600">
              {t('imagesToPdf.howTo.generatePdf.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDFToolWrapper;