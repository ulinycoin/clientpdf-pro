import React, { useState, useCallback } from 'react';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import { SmartMergePanel } from '@/components/smart/SmartMergePanel';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { toast } from 'sonner';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Files, Scissors, Minimize2, Shield, Stamp } from 'lucide-react';

export const MergePDF: React.FC = () => {
  const { t } = useI18n();
  const { setSharedFile, sharedFiles, clearSharedFiles } = useSharedFile();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasLoadedSharedFiles, setHasLoadedSharedFiles] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const handleFilesSelected = useCallback(async (selectedFiles: File[], replaceExisting = false) => {
    const uploadedFiles: UploadedFile[] = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending' as const,
    }));

    setFiles((prev) => replaceExisting ? uploadedFiles : [...prev, ...uploadedFiles]);

    // Get PDF info for each file
    for (const uploadedFile of uploadedFiles) {
      try {
        const info = await pdfService.getPDFInfo(uploadedFile.file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, info, status: 'completed' as const } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'error' as const, error: 'Failed to read PDF' }
              : f
          )
        );
      }
    }
  }, []);

  // Auto-load shared files from WelcomeScreen
  React.useEffect(() => {
    if (sharedFiles && sharedFiles.files.length > 0 && !hasLoadedSharedFiles) {
      const loadedFiles = sharedFiles.files.map(sf =>
        new File([sf.blob], sf.name, { type: sf.blob.type })
      );
      handleFilesSelected(loadedFiles, true); // true = replace existing files
      clearSharedFiles();
      setHasLoadedSharedFiles(true);
    }
  }, [sharedFiles, hasLoadedSharedFiles, clearSharedFiles, handleFilesSelected]);

  // Auto-save result to sharedFile when processing is complete
  React.useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      setSharedFile(result.blob, 'merged.pdf', 'merge-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, setSharedFile]);

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error(t('merge.errors.minFiles'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const fileObjects = files.map((f) => f.file);
      const result = await pdfService.mergePDFs(fileObjects, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
        toast.success(t('merge.success.title'));
      } else {
        toast.error(result.error?.message || 'Merge failed');
      }
    } catch (error) {
      toast.error('An error occurred during merge');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      pdfService.downloadFile(result.blob, 'merged.pdf');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = (toolId: Tool) => {
    // Save the merged PDF to shared state for the next tool
    if (result?.blob) {
      setSharedFile(result.blob, 'merged.pdf', 'merge-pdf');
    }
    // Navigate to the selected tool
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder files
    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Smart Merge: Apply sort order from AI suggestions
  const handleApplySmartSort = (newOrder: string[]) => {
    const fileMap = new Map(files.map(f => [f.id, f]));
    const sortedFiles = newOrder
      .map(id => fileMap.get(id))
      .filter((f): f is UploadedFile => f !== undefined);
    setFiles(sortedFiles);
    toast.success(t('smartMerge.sortApplied') || 'Sort applied');
  };

  // Smart Merge: Remove duplicate files
  const handleRemoveDuplicates = (fileIds: string[]) => {
    setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
    toast.success(t('smartMerge.duplicatesRemoved') || `${fileIds.length} duplicate(s) removed`);
  };

  // Success view
  if (result) {
    return (
      <ToolLayout
        title={t('tools.merge-pdf.name')}
        description={t('tools.merge-pdf.description')}
        hasFiles={true}
        onUpload={handleFilesSelected}
        actions={
          <div className="flex flex-col gap-3 w-full">
            <Button onClick={handleDownload} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
              {t('common.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full">
              {t('merge.mergeAnother')}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl mb-4 animate-scale-in">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('merge.success.title')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>{t('merge.success.pages')}: <span className="font-semibold">{result.metadata?.pageCount}</span></p>
                <p>{t('merge.success.size')}: <span className="font-semibold">{pdfService.formatFileSize(result.metadata?.processedSize || 0)}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => handleQuickAction('compress-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10">
              <Minimize2 className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.compress-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('protect-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10">
              <Shield className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.protect-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('watermark-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10">
              <Stamp className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.watermark-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('split-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/10">
              <Scissors className="h-6 w-6 text-ocean-500" />
              <span>{t('tools.split-pdf.name')}</span>
            </Button>
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title={t('tools.merge-pdf.name')}
      description={t('tools.merge-pdf.description')}
      hasFiles={files.length > 0}
      isProcessing={isProcessing}
      onUpload={(newFiles) => handleFilesSelected(newFiles, false)}
      settings={
        files.length >= 2 ? (
          <div className="space-y-6 animate-slide-up">
            <SmartMergePanel
              files={files.map(f => ({ id: f.id, file: f.file, name: f.name }))}
              onApplySort={handleApplySmartSort}
              onRemoveDuplicates={handleRemoveDuplicates}
            />
          </div>
        ) : null
      }
      actions={
        <div className="space-y-4">
          <Button
            onClick={handleMerge}
            disabled={isProcessing || files.length < 2}
            className="w-full text-lg py-6 shadow-lg shadow-ocean-500/20 bg-ocean-500 hover:bg-ocean-600 text-white"
            size="lg"
          >
            {t('merge.mergeButton')}
          </Button>
          {files.length > 0 && files.length < 2 && (
            <p className="text-sm text-center text-gray-500 animate-pulse">
              {t('merge.minFilesHint')}
            </p>
          )}
        </div>
      }
    >
      {/* Files List */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable={!isProcessing}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group ${!isProcessing ? 'cursor-move' : ''} ${draggedIndex === index ? 'opacity-50' : ''
              }`}
          >
            <Card className="p-4 hover:shadow-medium transition-all duration-200 relative group h-full border-transparent hover:border-ocean-200 dark:hover:border-ocean-800 bg-white dark:bg-privacy-800">
              <div className="mb-4 flex justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <PDFPreview file={file.file} width={180} height={240} />
              </div>

              {/* Drag Handle & Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="w-8 h-8 p-0 flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm text-sm">
                    {index + 1}
                  </Badge>
                  {file.info && (
                    <span className="text-sm text-gray-500 font-medium">{file.info.pages} pages</span>
                  )}
                </div>
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100" title={file.name}>
                  {file.name}
                </p>
              </div>

              {/* Hover Actions */}
              {!isProcessing && (
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/50 rounded-lg p-1 backdrop-blur-sm shadow-sm">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                  >
                    <span className="sr-only">Remove</span>
                    <Scissors className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        ))}

        {/* Add More Button */}
        <div className="h-full min-h-[200px]">
          <label className="cursor-pointer h-full border-2 border-dashed border-gray-200 dark:border-privacy-700 hover:border-ocean-400 dark:hover:border-ocean-500 rounded-xl flex flex-col items-center justify-center p-4 transition-all hover:bg-ocean-50/50 dark:hover:bg-ocean-900/10 group">
            <input
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files), false)}
            />
            <div className="w-12 h-12 rounded-full bg-ocean-100 dark:bg-ocean-900/50 flex items-center justify-center mb-2 text-ocean-600 dark:text-ocean-400 text-2xl group-hover:scale-110 transition-transform">
              <Files className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add File</span>
          </label>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-8">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}
    </ToolLayout>
  );
};
