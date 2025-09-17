import React, { useState } from 'react';
import { PDFProcessingResult } from '../../types';
import SplitTool from './SplitTool';
import FileUploadZone from '../molecules/FileUploadZone';
import { Download, CheckCircle } from 'lucide-react';
import Button from '../atoms/Button';
import { useTranslation } from '../../hooks/useI18n';

const SplitToolWrapper: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<PDFProcessingResult[] | null>(null);
  const [showTool, setShowTool] = useState(false);
  const [useZip, setUseZip] = useState(false);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setShowTool(true);
    setResults(null);
  };

  const handleComplete = (processedResults: PDFProcessingResult[], options?: { useZip?: boolean }) => {
    setResults(processedResults);
    setUseZip(options?.useZip || false);
    setShowTool(false);
  };

  const handleClose = () => {
    setShowTool(false);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResults(null);
    setShowTool(false);
    setUseZip(false);
  };

  const downloadFile = (result: PDFProcessingResult) => {
    if (result.downloadUrl && result.success) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName || 'split-page.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAllAsZip = async () => {
    if (!results || results.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    results.filter(r => r.success).forEach((result, index) => {
      if (result.blob) {
        zip.file(`page-${index + 1}.pdf`, result.blob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = 'split-pdf-pages.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(zipUrl);
  };

  if (showTool && selectedFiles.length > 0) {
    return (
      <SplitTool
        files={selectedFiles}
        onComplete={handleComplete}
        onClose={handleClose}
      />
    );
  }

  if (results && results.length > 0) {
    const successResults = results.filter(r => r.success);
    
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-green-800">{t('tools.split.successTitle')}</h2>
          </div>
          <p className="text-gray-600">
            {t('tools.split.successDescription', { count: successResults.length })}
          </p>
        </div>

        {useZip ? (
          <div className="mb-6">
            <Button
              onClick={downloadAllAsZip}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              <Download className="w-5 h-5 mr-2" />
{t('tools.split.downloadAllZip', { count: successResults.length })}
            </Button>
          </div>
        ) : (
          <div className="mb-6 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">{t('tools.split.downloadIndividual')}</h3>
            <div className="grid gap-2">
              {successResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">
                    {t('tools.split.pageNumber', { page: index + 1 })} - {result.fileName || `page-${index + 1}.pdf`}
                  </span>
                  <Button
                    onClick={() => downloadFile(result)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full"
        >
{t('tools.split.splitAnother')}
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <FileUploadZone
          onFilesSelected={handleFileSelect}
          accept="application/pdf"
          acceptedTypes={['application/pdf']}
          maxSize={100 * 1024 * 1024} // 100MB
          multiple={false}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">
              ✂️
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t('tools.split.uploadTitle')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('tools.split.uploadDescription')}
            </p>
            <Button
              variant="primary"
              size="lg"
              type="button"
            >
{t('tools.split.selectFile')}
            </Button>
            <p className="text-sm text-gray-400 mt-4">
              {t('tools.split.supportedFiles')}
            </p>
          </div>
          </FileUploadZone>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">{t('tools.split.howToTitle')}</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>{t('tools.split.howTo.individualPages.title')}:</strong> {t('tools.split.howTo.individualPages.description')}</p>
          <p>• <strong>{t('tools.split.howTo.pageRange.title')}:</strong> {t('tools.split.howTo.pageRange.description')}</p>
          <p>• <strong>{t('tools.split.howTo.specificPages.title')}:</strong> {t('tools.split.howTo.specificPages.description')}</p>
          <p>• <strong>{t('tools.split.howTo.zipOption.title')}:</strong> {t('tools.split.howTo.zipOption.description')}</p>
          <p>• <strong>{t('tools.split.howTo.privacy.title')}:</strong> {t('tools.split.howTo.privacy.description')}</p>
        </div>
      </div>
    </div>
  );
};

export default SplitToolWrapper;