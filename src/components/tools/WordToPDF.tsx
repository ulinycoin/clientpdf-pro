import React, { useState } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, FileText } from 'lucide-react';

type ConversionMode = 'formatted' | 'text';
type Quality = 1 | 2 | 3;

export const WordToPDF: React.FC = () => {
  const { t } = useI18n();
  // const { setSharedFile: saveSharedFile } = useSharedFile(); // Unused
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; processedSize: number } | null>(null);

  // Conversion settings
  const [conversionMode, setConversionMode] = useState<ConversionMode>('formatted');
  const [quality, setQuality] = useState<Quality>(2);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
        alert(t('wordToPdf.errors.invalidFormat'));
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
      const conversionResult = await pdfService.wordToPDF(
        file,
        () => { }, // Progress handled by ToolLayout if we passed progress state, but simplified here
        { mode: conversionMode, quality }
      );

      if (conversionResult.success && conversionResult.data) {
        setResult({
          blob: conversionResult.data,
          originalSize: conversionResult.metadata?.originalSize || 0,
          processedSize: conversionResult.metadata?.processedSize || 0,
        });
      } else {
        alert(conversionResult.error?.message || t('wordToPdf.errors.conversionFailed'));
      }
    } catch {
      alert(t('wordToPdf.errors.conversionFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const fileName = file?.name.replace(/\.\w+$/, '.pdf') || 'converted.pdf';
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
                <p>{formatFileSize(result.originalSize)} → <strong>{formatFileSize(result.processedSize)}</strong></p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex justify-center border rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800 p-4">
            <PDFPreview blob={result.blob} width={400} />
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
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
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
      {/* Mode */}
      <div className="space-y-3">
        <Label>{t('wordToPdf.conversionMode') || 'Conversion Mode'}</Label>
        <div className="grid grid-cols-1 gap-3">
          <div onClick={() => setConversionMode('formatted')} className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${conversionMode === 'formatted' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
            <div className="font-semibold">{t('wordToPdf.withFormatting') || 'Formatted'}</div>
            <div className="text-xs text-gray-500 mt-1">Preserves layout & images</div>
          </div>
          <div onClick={() => setConversionMode('text')} className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${conversionMode === 'text' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
            <div className="font-semibold">{t('wordToPdf.textOnly') || 'Text Only'}</div>
            <div className="text-xs text-gray-500 mt-1">Fast, extract text only</div>
          </div>
        </div>
      </div>

      {/* Quality */}
      {conversionMode === 'formatted' && (
        <div className="space-y-2">
          <Label>{t('wordToPdf.quality') || 'Quality'}</Label>
          <Select value={quality.toString()} onValueChange={(v) => setQuality(parseInt(v) as Quality)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Standard</SelectItem>
              <SelectItem value="2">High</SelectItem>
              <SelectItem value="3">Maximum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <Button
      onClick={handleConvert}
      disabled={isProcessing || !file}
      className="w-full py-6 text-lg font-bold"
    >
      {isProcessing ? t('common.processing') : t('wordToPdf.convert')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.word-to-pdf.name')}
      description={t('tools.word-to-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      acceptedTypes=".docx"
      settings={!result && file ? renderSettings() : null}
      actions={!result && file ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
