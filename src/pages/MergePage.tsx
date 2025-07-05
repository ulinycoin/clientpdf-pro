import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocalizedText } from '../components/context/LocalizationProvider';
import LocalizedFileUpload from '../components/molecules/LocalizedFileUpload';
import LocalizedProgressBar from '../components/molecules/LocalizedProgressBar';
import LocalizedButton from '../components/molecules/LocalizedButton';
import { mergePDFs } from '../services/pdfService';
import SEOHead from '../components/SEO/SEOHead';

interface FileWithId {
  id: string;
  file: File;
  pages?: number;
}

const MergePage: React.FC = () => {
  const { t, language } = useLocalizedText('tools');
  const { t: tCommon } = useLocalizedText('common');
  
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const filesWithId = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      pages: undefined // Will be determined when processing
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
    setError(null);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const [removed] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, removed);
      return newFiles;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError(tCommon('messages.noFilesSelected'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const fileList = files.map(f => f.file);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const mergedPdf = await mergePDFs(fileList);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(mergedPdf);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('errors.processingError'));
    } finally {
      setIsProcessing(false);
    }
  }, [files, t, tCommon]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const reset = useCallback(() => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return (
    <>
      <SEOHead 
        title={language === 'ru' ? 'Объединить PDF - LocalPDF' : 'Merge PDF - LocalPDF'}
        description={language === 'ru'
          ? 'Объедините несколько PDF файлов в один документ быстро и безопасно. Без загрузки на сервер.'
          : 'Combine multiple PDF files into a single document quickly and securely. No server upload required.'
        }
        keywords={language === 'ru'
          ? 'объединить PDF, слить PDF, соединить PDF, бесплатно'
          : 'merge PDF, combine PDF, join PDF, free'
        }
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('merge.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('merge.description')}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">
            {language === 'ru' ? 'Как использовать:' : 'How to use:'}
          </h2>
          <p className="text-blue-800 text-sm">
            {t('merge.instructions')}
          </p>
        </div>

        {/* File Upload */}
        {files.length === 0 && (
          <LocalizedFileUpload
            onFilesSelected={handleFilesSelected}
            multiple={true}
            titleKey="merge.selectFiles"
            descriptionKey="messages.dragDropFiles"
            className="mb-8"
          />
        )}

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {tCommon('fileInfo.name')} ({files.length})
              </h3>
              <LocalizedButton
                textKey="actions.selectFiles"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '.pdf';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files) {
                      handleFilesSelected(Array.from(target.files));
                    }
                  };
                  input.click();
                }}
              />
            </div>
            
            <div className="space-y-3">
              {files.map((fileItem, index) => (
                <div 
                  key={fileItem.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {fileItem.file.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(fileItem.file.size / 1024)} KB
                        {fileItem.pages && ` • ${fileItem.pages} ${tCommon('fileInfo.pages')}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title={tCommon('actions.clear')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {files.length > 1 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  {t('merge.reorderHint')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="mb-8">
            <LocalizedProgressBar
              progress={progress}
              status="processing"
              showPercentage={true}
              showStatus={true}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!result && (
            <LocalizedButton
              textKey="merge.mergeButton"
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              loading={isProcessing}
              size="lg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />
          )}
          
          {result && (
            <>
              <LocalizedButton
                textKey="merge.downloadMerged"
                onClick={downloadResult}
                variant="success"
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              
              <LocalizedButton
                textKey="actions.reset"
                onClick={reset}
                variant="outline"
                size="lg"
              />
            </>
          )}
        </div>

        {/* Success Message */}
        {result && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-semibold">
                {tCommon('messages.processingComplete')}
              </span>
            </div>
            <p className="text-green-700 text-sm">
              {language === 'ru'
                ? `${files.length} файлов успешно объединены`
                : `${files.length} files successfully merged`
              }
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MergePage;