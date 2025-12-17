import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, FileText, FileType2 } from 'lucide-react';


export const PDFToWord: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; processedSize: number } | null>(null);

  // Conversion options
  const [smartHeadings, setSmartHeadings] = useState(true);

  useEffect(() => {
    if (sharedFile && !file) {
      setFile(new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' }));
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  const handleFileSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      const isValid = await pdfService.validatePDF(selectedFile);
      if (!isValid) {
        alert(t('pdfToWord.errors.invalidPdf'));
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const conversionResult = await pdfService.pdfToWord(
        file,
        () => { }, // Progress
        { includeImages: false, smartHeadings }
      );

      if (conversionResult.success && conversionResult.blob) {
        setResult({
          blob: conversionResult.blob,
          originalSize: conversionResult.originalSize || 0,
          processedSize: conversionResult.processedSize || 0,
        });
      } else {
        alert(conversionResult.error?.message || t('pdfToWord.errors.conversionFailed'));
      }
    } catch {
      alert(t('pdfToWord.errors.conversionFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const fileName = file?.name.replace(/\.pdf$/i, '.docx') || 'converted.docx';
      pdfService.downloadFile(result.blob, fileName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const renderContent = () => {
    if (!file) return null;

    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('common.success')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p className="flex items-center justify-center gap-2">
                  <FileType2 className="w-5 h-5" />
                  {t('pdfToWord.readyToDownload') || 'Word document ready'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              {t('common.convertAnother')}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <FileText className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold">{file.name}</h3>
          <p className="text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">{t('pdfToWord.smartHeadings') || 'Smart Headings'}</Label>
            <p className="text-xs text-gray-500">{t('pdfToWord.smartHeadingsDescription') || 'Detect headings by font size'}</p>
          </div>
          <input
            type="checkbox"
            className="toggle"
            checked={smartHeadings}
            onChange={(e) => setSmartHeadings(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderActions = () => (
    <Button
      onClick={handleConvert}
      disabled={isProcessing || !file}
      className="w-full py-6 text-lg font-bold"
    >
      {isProcessing ? t('common.processing') : t('pdfToWord.convert')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.pdf-to-word.name')}
      description={t('tools.pdf-to-word.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      accept=".pdf"
      settings={!result && file ? renderSettings() : null}
      actions={!result && file ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
