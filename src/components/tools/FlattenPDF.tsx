import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Layers } from 'lucide-react';

export const FlattenPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; metadata: Record<string, unknown> } | null>(null);

  useEffect(() => {
    if (sharedFile && !file) {
      const loadedFile = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFileSelected([loadedFile]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile({
        id: Date.now().toString(),
        file: files[0],
        name: files[0].name,
        size: files[0].size,
        status: 'completed'
      });
      setResult(null);
    }
  };

  const handleFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await pdfService.flattenPDF(file.file, () => { });
      if (res.success && res.data) {
        setResult({ blob: res.data, metadata: res.metadata });
      } else {
        alert(res.error?.message || 'Flattening failed');
      }
    } catch {
      alert('Flattening failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    pdfService.downloadFile(result.blob, file?.name.replace('.pdf', '_flattened.pdf') || 'flattened.pdf');
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  const renderContent = () => {
    if (!file) return null;
    if (result) {
      return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">{t('flatten.success.title')}</h2>
          <div className="text-gray-500 space-y-1">
            <p>{t('flatten.success.originalSize')}: {pdfService.formatFileSize(result.metadata.originalSize)}</p>
            <p>{t('flatten.success.processedSize')}: {pdfService.formatFileSize(result.metadata.processedSize)}</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700">{t('common.download')}</Button>
            <Button onClick={handleReset} variant="outline" size="lg">{t('flatten.flattenAnother')}</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
          <Layers className="w-12 h-12" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold">{file.name}</h3>
          <p className="text-gray-500">{pdfService.formatFileSize(file.size)}</p>
        </div>
        <div className="text-sm text-gray-500 max-w-md text-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          {t('flatten.description')}
        </div>
      </div>
    );
  };

  const renderActions = () => (
    <Button onClick={handleFlatten} disabled={isProcessing} className="w-full py-6 text-lg font-bold">
      {isProcessing ? t('common.processing') : t('flatten.flattenButton')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.flatten-pdf.name')}
      description={t('tools.flatten-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      accept=".pdf"
      actions={!result && file ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
