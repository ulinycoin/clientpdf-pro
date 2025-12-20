import React, { useState } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, FileText, Download, Archive, Loader2, X, AlertCircle, Eye, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import JSZip from 'jszip';

type ConversionMode = 'formatted' | 'text';
type Quality = 1 | 2 | 3;

interface FileStatus {
  file: File;
  id: string;
  isProcessing: boolean;
  isCompleted: boolean;
  error?: string;
  progress: number;
  result?: {
    blob: Blob;
    originalSize: number;
    processedSize: number;
  };
}

export const WordToPDF: React.FC = () => {
  const { t } = useI18n();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [conversionMode, setConversionMode] = useState<ConversionMode>('formatted');
  const [quality, setQuality] = useState<Quality>(2);

  // Preview state
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handleFileSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles
      .filter(file => file.name.toLowerCase().endsWith('.docx'))
      .map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        isProcessing: false,
        isCompleted: false,
        progress: 0
      }));

    if (newFiles.length < selectedFiles.length) {
      alert(t('wordToPdf.errors.invalidFormat'));
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFile = async (fileStatus: FileStatus): Promise<FileStatus> => {
    try {
      const result = await pdfService.wordToPDF(
        fileStatus.file,
        (progress) => {
          setFiles(prev => prev.map(f => f.id === fileStatus.id ? { ...f, progress } : f));
        },
        { mode: conversionMode, quality }
      );

      if (result.success && result.data) {
        return {
          ...fileStatus,
          isProcessing: false,
          isCompleted: true,
          progress: 100,
          result: {
            blob: result.data,
            originalSize: result.metadata?.originalSize || 0,
            processedSize: result.metadata?.processedSize || 0,
          }
        };
      } else {
        return {
          ...fileStatus,
          isProcessing: false,
          error: result.error?.message || t('wordToPdf.errors.conversionFailed')
        };
      }
    } catch {
      return {
        ...fileStatus,
        isProcessing: false,
        error: t('wordToPdf.errors.conversionFailed')
      };
    }
  };

  const handleConvertAll = async () => {
    setIsProcessingAll(true);

    // Reset statuses for non-completed files
    setFiles(prev => prev.map(f => f.isCompleted ? f : { ...f, isProcessing: true, error: undefined, progress: 0 }));

    const updatedFiles = [...files];
    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].isCompleted) continue;

      const processed = await processFile(updatedFiles[i]);
      updatedFiles[i] = processed;

      // Update state after each file to show real-time progress
      setFiles([...updatedFiles]);
    }

    setIsProcessingAll(false);
  };

  const downloadFile = (fileStatus: FileStatus) => {
    if (fileStatus.result?.blob) {
      const fileName = fileStatus.file.name.replace(/\.docx$/i, '.pdf');
      pdfService.downloadFile(fileStatus.result.blob, fileName);
    }
  };

  const downloadAllAsZip = async () => {
    const completedFiles = files.filter(f => f.isCompleted && f.result?.blob);
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    completedFiles.forEach(f => {
      const fileName = f.file.name.replace(/\.docx$/i, '.pdf');
      zip.file(fileName, f.result!.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    pdfService.downloadFile(content, 'converted_files.zip');
  };

  const handleReset = () => {
    setFiles([]);
    setIsProcessingAll(false);
  };

  const handlePreview = async (status: FileStatus) => {
    try {
      setIsPreviewLoading(true);
      setPreviewFileName(status.file.name);
      const html = await pdfService.getWordPreviewHTML(status.file);
      setPreviewContent(html);
    } catch (error) {
      console.error('Preview error:', error);
      alert(t('common.errors.previewFailed') || 'Failed to load preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const renderContent = () => {
    if (files.length === 0) return null;

    return (
      <div className="space-y-4">
        {files.map((f) => (
          <div key={f.id} className="bg-white dark:bg-gray-900 border rounded-xl p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg ${f.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {f.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate text-sm">{f.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(f.file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {f.error && (
                  <div className="flex items-center text-red-500 text-xs px-2 py-1 bg-red-50 rounded-md">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {f.error}
                  </div>
                )}
                {f.isProcessing && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}

                {!isProcessingAll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(f)}
                    disabled={isPreviewLoading}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-ocean-500"
                    title={t('common.preview') || 'Preview'}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}

                {f.isCompleted && (
                  <Button variant="ghost" size="sm" onClick={() => downloadFile(f)} className="h-8 w-8 p-0 text-green-600">
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                {!isProcessingAll && !f.isCompleted && (
                  <Button variant="ghost" size="sm" onClick={() => removeFile(f.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            {(f.isProcessing || (f.progress > 0 && f.progress < 100)) && (
              <Progress value={f.progress} className="h-1 mt-3" />
            )}
            {f.isCompleted && f.result && (
              <div className="mt-2 text-[10px] text-green-600 font-medium">
                {t('common.success')}: {formatFileSize(f.result.processedSize)}
              </div>
            )}
          </div>
        ))}
        {files.some(f => f.isCompleted) && files.length > 1 && (
          <div className="flex justify-center pt-4">
            <Button onClick={downloadAllAsZip} className="bg-ocean-600 hover:bg-ocean-700">
              <Archive className="w-4 h-4 mr-2" />
              {t('common.downloadAll') || 'Download all as ZIP'}
            </Button>
          </div>
        )}
        {!isProcessingAll && files.length < 10 && (
          <div className="flex justify-center pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) handleFileSelected(Array.from(e.target.files));
                e.target.value = '';
              }}
              accept=".docx"
              multiple
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-dashed border-2 hover:border-ocean-500 hover:text-ocean-600 h-12 w-full rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('common.addFiles') || 'Add more files'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>{t('wordToPdf.conversionMode')}</Label>
        <div className="grid grid-cols-1 gap-3">
          <div onClick={() => !isProcessingAll && setConversionMode('formatted')} className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${conversionMode === 'formatted' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'} ${isProcessingAll ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="font-semibold text-sm">{t('wordToPdf.withFormatting')}</div>
            <div className="text-[10px] text-gray-500 mt-1">{t('wordToPdf.formattingDescription')}</div>
          </div>
          <div onClick={() => !isProcessingAll && setConversionMode('text')} className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${conversionMode === 'text' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'} ${isProcessingAll ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="font-semibold text-sm">{t('wordToPdf.textOnly')}</div>
            <div className="text-[10px] text-gray-500 mt-1">{t('wordToPdf.textDescription')}</div>
          </div>
        </div>
      </div>

      {conversionMode === 'formatted' && (
        <div className="space-y-2">
          <Label className="text-sm">{t('wordToPdf.quality')}</Label>
          <Select disabled={isProcessingAll} value={quality.toString()} onValueChange={(v) => setQuality(parseInt(v) as Quality)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('wordToPdf.qualityStandard')}</SelectItem>
              <SelectItem value="2">{t('wordToPdf.qualityHigh')}</SelectItem>
              <SelectItem value="3">{t('wordToPdf.qualityMax')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <div className="space-y-3">
      <Button
        onClick={handleConvertAll}
        disabled={isProcessingAll || files.length === 0 || files.every(f => f.isCompleted)}
        className="w-full py-6 text-lg font-bold shadow-lg"
      >
        {isProcessingAll ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('common.processing')}</>
        ) : (
          t('wordToPdf.convert')
        )}
      </Button>
      {files.some(f => f.isCompleted) && !isProcessingAll && (
        <Button variant="outline" onClick={handleReset} className="w-full">
          {t('common.convertAnother')}
        </Button>
      )}
    </div>
  );

  return (
    <ToolLayout
      title={t('tools.word-to-pdf.name')}
      description={t('tools.word-to-pdf.description')}
      hasFiles={files.length > 0}
      onUpload={handleFileSelected}
      isProcessing={isProcessingAll}
      maxFiles={10}
      uploadTitle={t('common.selectFiles') || 'Select Word Files'}
      uploadDescription={t('upload.multipleFilesAllowed') || 'Supports up to 10 .docx files'}
      acceptedTypes=".docx"
      settings={files.length > 0 ? renderSettings() : null}
      actions={files.length > 0 ? renderActions() : null}
    >
      {renderContent()}

      <Dialog open={isPreviewLoading || !!previewContent} onOpenChange={(open) => {
        if (!open) {
          setPreviewContent(null);
          setIsPreviewLoading(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-ocean-600" />
              {previewFileName}
            </DialogTitle>
            <DialogDescription>
              {t('common.filePreview') || 'File preview'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50 rounded-lg p-4 sm:p-8 relative min-h-[400px]">
            {isPreviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 z-10 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-ocean-600" />
              </div>
            )}
            <div
              className="preview-paper bg-white dark:bg-gray-900 shadow-xl mx-auto p-8 sm:p-12 min-h-full max-w-[210mm] prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: previewContent || '' }}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.6',
              }}
            />
          </div>

          <style>{`
            .preview-paper img { max-width: 100%; height: auto; border-radius: 4px; }
            .preview-paper table { width: 100%; border-collapse: collapse; margin: 1em 0; }
            .preview-paper td, .preview-paper th { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .preview-paper h1, .preview-paper h2, .preview-paper h3 { color: inherit; margin-top: 1.5em; }
          `}</style>
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
};
