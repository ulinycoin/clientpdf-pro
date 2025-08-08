/**
 * Обертка для SplitTool для использования со стандартным шаблоном
 */
import React, { useState } from 'react';
import SplitTool from './SplitTool';
import UploadSection from '../molecules/UploadSection';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useI18n } from '../../hooks/useI18n';
import { PDFProcessingResult } from '../../types';
import { downloadBlob, generateFilename, createZipFromBlobs } from '../../utils/fileHelpers';

const SplitPDFToolWrapper: React.FC = () => {
  const { t } = useI18n();
  const [toolActive, setToolActive] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload();

  const handleFileSelect = (selectedFiles: File[]) => {
    addFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      setToolActive(true);
    }
  };

  const handleToolComplete = async (results: PDFProcessingResult[], options?: { useZip?: boolean }) => {
    // Download all successful split results
    const successfulResults = results.filter(result => result.success && result.data);

    if (successfulResults.length > 0) {
      // Check if should use ZIP (for many files or user preference)
      const shouldUseZip = options?.useZip || successfulResults.length > 5;

      if (shouldUseZip && successfulResults.length > 1) {
        // Prepare files for ZIP
        const filesForZip = successfulResults.map((result, index) => {
          const originalFilename = files[0]?.name || 'document.pdf';
          let filename: string;

          if (result.metadata?.pageNumber) {
            filename = generateFilename(originalFilename, `page_${result.metadata.pageNumber}`);
          } else if (result.metadata?.startPage && result.metadata?.endPage) {
            filename = generateFilename(originalFilename, `pages_${result.metadata.startPage}-${result.metadata.endPage}`);
          } else {
            filename = generateFilename(originalFilename, `split_${index + 1}`);
          }

          return { blob: result.data as Blob, filename };
        });

        try {
          const zipBlob = await createZipFromBlobs(filesForZip, 'split_pages.zip');
          const zipFilename = generateFilename(files[0]?.name || 'document.pdf', 'split_pages', 'zip');
          downloadBlob(zipBlob, zipFilename);
        } catch (error) {
          console.error('ZIP creation failed, falling back to individual downloads:', error);
          // Fallback to individual downloads
          successfulResults.forEach((result, index) => {
            if (result.data instanceof Blob) {
              const originalFilename = files[0]?.name || 'document.pdf';
              const filename = generateFilename(originalFilename, `page_${index + 1}`);
              setTimeout(() => downloadBlob(result.data as Blob, filename), index * 200);
            }
          });
        }
      } else {
        // Individual downloads
        successfulResults.forEach((result, index) => {
          if (result.data instanceof Blob) {
            const originalFilename = files[0]?.name || 'document.pdf';
            let filename: string;

            if (result.metadata?.pageNumber) {
              filename = generateFilename(originalFilename, `page_${result.metadata.pageNumber}`);
            } else if (result.metadata?.startPage && result.metadata?.endPage) {
              filename = generateFilename(originalFilename, `pages_${result.metadata.startPage}-${result.metadata.endPage}`);
            } else {
              filename = generateFilename(originalFilename, `split_${index + 1}`);
            }

            setTimeout(() => {
              downloadBlob(result.data as Blob, filename);
            }, index * 200);
          }
        });
      }
    }

    setToolActive(false);
    clearFiles();
  };

  const handleToolClose = () => {
    setToolActive(false);
  };

  if (!toolActive) {
    return (
      <div className="max-w-2xl mx-auto mb-8">
        <UploadSection
          onFilesSelected={handleFileSelect}
          accept="application/pdf"
          acceptedTypes={['application/pdf']}
          multiple={false}
          maxSize={100 * 1024 * 1024}
          disabled={false}
          title={t('tools.split.uploadTitle')}
          subtitle="Extract specific pages from your PDF document"
          emoji="✂️"
          supportedFormats="PDF files"
        />

        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">📄</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{files[0].name}</p>
                  <p className="text-sm text-gray-500">
                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setToolActive(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('tools.split.buttons.startSplitting')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <SplitTool
      files={files}
      onComplete={handleToolComplete}
      onClose={handleToolClose}
    />
  );
};

export default SplitPDFToolWrapper;
