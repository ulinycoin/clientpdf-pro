import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  FileText,
  Download,
  Archive,
  Loader2,
  X,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import JSZip from 'jszip';

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


export const PDFToWord: React.FC = () => {
  const { t } = useI18n();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  // Preview state
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Conversion options
  const [smartHeadings, setSmartHeadings] = useState(true);
  const [extractComments, setExtractComments] = useState(false);

  useEffect(() => {
    if (sharedFile && files.length === 0) {
      const newFile: FileStatus = {
        file: new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' }),
        id: Math.random().toString(36).substring(7),
        isProcessing: false,
        isCompleted: false,
        progress: 0
      };
      setFiles([newFile]);
      clearSharedFile();
    }
  }, [sharedFile, files.length, clearSharedFile]);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const newFiles: FileStatus[] = [];

    for (const file of selectedFiles) {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const isValid = await pdfService.validatePDF(file);
        if (isValid) {
          newFiles.push({
            file,
            id: Math.random().toString(36).substring(7),
            isProcessing: false,
            isCompleted: false,
            progress: 0
          });
        }
      }
    }

    if (newFiles.length < selectedFiles.length) {
      alert(t('pdfToWord.errors.invalidPdf'));
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const convertOne = async (status: FileStatus): Promise<FileStatus> => {
    try {
      setFiles(prev => prev.map(f => f.id === status.id ? { ...f, isProcessing: true, error: undefined } : f));

      const res = await pdfService.pdfToWord(
        status.file,
        (p) => {
          setFiles(prev => prev.map(f => f.id === status.id ? { ...f, progress: p } : f));
        },
        { includeImages: false, smartHeadings, extractComments }
      );

      if (res.success && res.data) {
        return {
          ...status,
          isProcessing: false,
          isCompleted: true,
          progress: 100,
          result: {
            blob: res.data,
            originalSize: res.metadata?.originalSize || status.file.size,
            processedSize: res.metadata?.processedSize || res.data.size
          }
        };
      } else {
        throw new Error(res.error?.message || t('pdfToWord.errors.conversionFailed'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      return {
        ...status,
        isProcessing: false,
        isCompleted: false,
        progress: 0,
        error: message
      };
    }
  };

  const handleConvertAll = async () => {
    setIsProcessingAll(true);
    const toProcess = files.filter(f => !f.isCompleted);

    for (const f of toProcess) {
      const updated = await convertOne(f);
      setFiles(prev => prev.map(curr => curr.id === f.id ? updated : curr));
    }

    setIsProcessingAll(false);
  };

  const downloadFile = (status: FileStatus) => {
    if (status.result?.blob) {
      const fileName = status.file.name.replace(/\.pdf$/i, '.docx');
      pdfService.downloadFile(status.result.blob, fileName);
    }
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const completed = files.filter(f => f.isCompleted && f.result?.blob);

    if (completed.length === 0) return;

    completed.forEach(f => {
      const fileName = f.file.name.replace(/\.pdf$/i, '.docx');
      zip.file(fileName, f.result!.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    pdfService.downloadFile(content, 'converted_word_documents.zip');
  };

  const handleReset = () => {
    setFiles([]);
    setIsProcessingAll(false);
  };

  const handlePreview = (status: FileStatus) => {
    setIsPreviewLoading(true);
    setPreviewFile(status.file);
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
                <div className={`p-2 rounded-lg ${f.isCompleted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
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
              accept=".pdf"
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
            disabled={isProcessingAll}
          />
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">{t('pdfToWord.extractComments') || 'Extract Comments'}</Label>
            <p className="text-xs text-gray-500">{t('pdfToWord.extractCommentsDescription') || 'Convert PDF sticky notes to Word comments'}</p>
          </div>
          <input
            type="checkbox"
            className="toggle"
            checked={extractComments}
            onChange={(e) => setExtractComments(e.target.checked)}
            disabled={isProcessingAll}
          />
        </div>
      </div>
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
          t('pdfToWord.convert')
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
      title={t('tools.pdf-to-word.name')}
      description={t('tools.pdf-to-word.description')}
      hasFiles={files.length > 0}
      onUpload={handleFileSelected}
      isProcessing={isProcessingAll}
      maxFiles={10}
      uploadTitle={t('common.selectFiles') || 'Select PDF Files'}
      uploadDescription={t('upload.multipleFilesAllowed') || 'Supports up to 10 PDF files'}
      acceptedTypes=".pdf"
      settings={files.length > 0 ? renderSettings() : null}
      actions={files.length > 0 ? renderActions() : null}
    >
      {renderContent()}

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              {previewFile?.name}
            </DialogTitle>
            <DialogDescription>
              {t('common.filePreview') || 'File preview'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 rounded-lg flex items-center justify-center p-4 relative min-h-[400px]">
            {isPreviewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-ocean-600" />
              </div>
            )}
            {previewFile && (
              <iframe
                src={URL.createObjectURL(previewFile) + '#toolbar=0&navpanes=0&scrollbar=0'}
                className="w-full h-full min-h-[600px] border-0 rounded-md shadow-inner bg-white"
                title="PDF Preview"
                onLoad={() => setIsPreviewLoading(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
};
