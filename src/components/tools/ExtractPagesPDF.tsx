import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Minimize2, Shield, Stamp, Layers } from 'lucide-react';

export const ExtractPagesPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [pagesToExtract, setPagesToExtract] = useState('');

  useEffect(() => {
    if (sharedFile && !file && !result) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}`,
        file: sharedFileObj,
        name: sharedFile.name,
        size: sharedFileObj.size,
        status: 'pending',
      };
      setFile(uploadedFile);
      setLoadedFromShared(true);
      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) => prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null);
      });
      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_extracted_pages.pdf') || 'extracted_pages.pdf';
      setSharedFile(result, fileName, 'extract-pages-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;
    const uploadedFile: UploadedFile = {
      id: `${Date.now()}`,
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      status: 'pending',
    };
    setFile(uploadedFile);
    setResult(null);
    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch {
      // Ignore error as we just won't show preview
      setFile((prev) => prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null);
    }
  };

  const parsePageNumbers = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',').map(p => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) pages.add(i);
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) pages.add(pageNum);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleExtract = async () => {
    if (!file) return;
    const maxPages = file.info?.pages || 0;
    const pageNumbers = parsePageNumbers(pagesToExtract, maxPages);
    if (pageNumbers.length === 0) {
      alert(t('extractPages.invalidPages'));
      return;
    }
    setIsProcessing(true);
    setResult(null);
    setResultSaved(false);
    try {
      const extractResult = await pdfService.extractPDF(file.file, pageNumbers, () => { });
      if (extractResult.success && extractResult.data) {
        setResult(extractResult.data);
      } else {
        alert(t('extractPages.failed'));
      }
    } catch (error) {
      alert(t('extractPages.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const filename = file.name.replace('.pdf', '_extracted.pdf');
    pdfService.downloadFile(result, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setLoadedFromShared(false);
    setPagesToExtract('');
  };

  const handleQuickAction = async (toolId: Tool) => {
    if (!result || !file) return;
    const filename = file.name.replace('.pdf', '_extracted.pdf');
    setSharedFile(result, filename, 'extract-pages-pdf');
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const maxPages = file?.info?.pages || 1;

  const renderContent = () => {
    if (!file) return null;
    if (result) {
      return (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">{t('extractPages.success')}</h2>
          <p className="text-gray-500">{t('extractPages.successDescription')}</p>

          <div className="flex justify-center gap-4">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700">{t('common.download')}</Button>
            <Button onClick={handleReset} variant="outline" size="lg">{t('extractPages.extractAnother')}</Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Button onClick={() => handleQuickAction('compress-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Minimize2 className="h-5 w-5" /><span>{t('tools.compress-pdf.name')}</span></Button>
            <Button onClick={() => handleQuickAction('protect-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Shield className="h-5 w-5" /><span>{t('tools.protect-pdf.name')}</span></Button>
            <Button onClick={() => handleQuickAction('watermark-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Stamp className="h-5 w-5" /><span>{t('tools.watermark-pdf.name')}</span></Button>
            <Button onClick={() => handleQuickAction('merge-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Layers className="h-5 w-5" /><span>{t('tools.merge-pdf.name')}</span></Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4">
        {loadedFromShared && (
          <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4 w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-ocean-700 dark:text-ocean-300">
              <span className="text-xl">✨</span>
              <span className="font-medium">{t('common.autoLoaded')}</span>
            </div>
          </div>
        )}
        <div className="relative shadow-lg border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <PDFPreview file={file.file} width={300} height={400} />
        </div>
        <div className="text-center">
          <h3 className="font-medium">{file.name}</h3>
          <p className="text-sm text-gray-500">{file.info?.pages} pages • {pdfService.formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t('extractPages.pagesToExtract')}</Label>
        <Input
          value={pagesToExtract}
          onChange={(e) => setPagesToExtract(e.target.value)}
          placeholder="e.g. 1,3,5-7"
        />
        <p className="text-xs text-gray-500">{t('extractPages.hint', { total: String(maxPages) })}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium mb-1">ℹ️ {t('extractPages.info')}</p>
        <p>{t('extractPages.infoDescription')}</p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title={t('tools.extract-pages-pdf.name')}
      description={t('tools.extract-pages-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      acceptedTypes=".pdf"
      settings={!result && file ? renderSettings() : null}
      actions={!result && file ? (
        <Button onClick={handleExtract} disabled={isProcessing || !pagesToExtract} className="w-full py-6 text-lg font-bold">
          {isProcessing ? t('common.processing') : t('extractPages.extractButton')}
        </Button>
      ) : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
