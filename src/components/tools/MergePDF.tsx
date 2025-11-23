import React, { useState, useCallback } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setFiles(newFiles);
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

  return (
    <div className="merge-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.merge-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.merge-pdf.description')}
        </p>
      </div>

      {/* Upload section */}
      {!result && (
        <Card>
          <CardContent className="p-6">
            <FileUpload
              accept=".pdf"
              multiple={true}
              onFilesSelected={handleFilesSelected}
              maxSizeMB={100}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>
      )}

      {/* Smart Merge Panel */}
      {files.length >= 2 && !result && !isProcessing && (
        <SmartMergePanel
          files={files.map(f => ({ id: f.id, file: f.file, name: f.name }))}
          onApplySort={handleApplySmartSort}
          onRemoveDuplicates={handleRemoveDuplicates}
        />
      )}

      {/* Files list with previews */}
      {files.length > 0 && !result && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('merge.fileList')} ({files.length})
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>💡</span>
              <span>{t('merge.reorderHint')}</span>
            </p>
          </div>

          {/* Grid layout for previews */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable={!isProcessing}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group ${!isProcessing ? 'cursor-move' : ''} ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {/* Preview card */}
                <Card className="p-3 hover:shadow-medium transition-all duration-200 relative">
                  {/* PDF Preview */}
                  <div className="mb-3">
                    <PDFPreview
                      file={file.file}
                      width={140}
                      height={180}
                    />
                  </div>

                  {/* Drag indicator */}
                  {!isProcessing && (
                    <div className="absolute top-2 left-2 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-lg">⋮⋮</span>
                    </div>
                  )}

                  {/* File info */}
                  <div className="space-y-1">
                    {/* File number badge */}
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400">
                        {index + 1}
                      </Badge>
                      {file.info && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {file.info.pages} {file.info.pages === 1 ? 'page' : 'pages'}
                        </span>
                      )}
                    </div>

                    {/* File name */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>

                    {/* File size */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pdfService.formatFileSize(file.size)}
                    </p>

                    {/* Error state */}
                    {file.status === 'error' && (
                      <p className="text-xs text-error-500 mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>

                  {/* Control buttons - visible on hover */}
                  <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Move up */}
                    {index > 0 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(index);
                        }}
                        disabled={isProcessing}
                        className="w-7 h-7 p-0 bg-ocean-500 text-white hover:bg-ocean-600 shadow-md"
                        aria-label="Move up"
                        title="Move up"
                        size="sm"
                      >
                        <span className="text-sm">↑</span>
                      </Button>
                    )}

                    {/* Move down */}
                    {index < files.length - 1 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(index);
                        }}
                        disabled={isProcessing}
                        className="w-7 h-7 p-0 bg-ocean-500 text-white hover:bg-ocean-600 shadow-md"
                        aria-label="Move down"
                        title="Move down"
                        size="sm"
                      >
                        <span className="text-sm">↓</span>
                      </Button>
                    )}

                    {/* Remove */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      disabled={isProcessing}
                      className="w-7 h-7 p-0 bg-error-500 text-white hover:bg-error-600 shadow-md"
                      aria-label="Remove file"
                      title="Remove file"
                      size="sm"
                    >
                      <span className="text-sm">×</span>
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>

            {/* Merge button */}
            <div className="mt-6">
              <Button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="w-full text-lg py-3"
                size="lg"
              >
                {isProcessing ? t('common.processing') : t('merge.mergeButton')}
              </Button>
              {files.length < 2 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  {t('merge.minFilesHint')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <ProgressBar progress={progress} message={progressMessage} />
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Success card */}
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('merge.success.title')}
                </h2>
                <div className="text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    {t('merge.success.pages')}: <span className="font-semibold">{result.metadata?.pageCount}</span>
                  </p>
                  <p>
                    {t('merge.success.size')}:{' '}
                    <span className="font-semibold">{pdfService.formatFileSize(result.metadata?.processedSize || 0)}</span>
                  </p>
                  <p>
                    {t('merge.success.time')}:{' '}
                    <span className="font-semibold">{pdfService.formatTime(result.metadata?.processingTime || 0)}</span>
                  </p>
                </div>

                {/* Primary actions */}
                <div className="flex gap-3 justify-center mt-6 pt-4">
                  <Button onClick={handleDownload} size="lg" className="px-8 !bg-green-600 hover:!bg-green-700 !text-white">
                    {t('common.download')}
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    {t('merge.mergeAnother')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('merge.quickActions.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('merge.quickActions.description')}
              </p>

              {/* Action buttons grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Compress */}
                <Button
                  onClick={() => handleQuickAction('compress-pdf')}
                  variant="outline"
                  className="h-auto justify-start p-4 border-2 hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
                >
                  <span className="text-3xl">🗜️</span>
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                      {t('tools.compress-pdf.name')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('merge.quickActions.compress')}
                    </p>
                  </div>
                </Button>

                {/* Protect */}
                <Button
                  onClick={() => handleQuickAction('protect-pdf')}
                  variant="outline"
                  className="h-auto justify-start p-4 border-2 hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
                >
                  <span className="text-3xl">🔒</span>
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                      {t('tools.protect-pdf.name')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('merge.quickActions.protect')}
                    </p>
                  </div>
                </Button>

                {/* Watermark */}
                <Button
                  onClick={() => handleQuickAction('watermark-pdf')}
                  variant="outline"
                  className="h-auto justify-start p-4 border-2 hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
                >
                  <span className="text-3xl">💧</span>
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                      {t('tools.watermark-pdf.name')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('merge.quickActions.watermark')}
                    </p>
                  </div>
                </Button>

                {/* Split */}
                <Button
                  onClick={() => handleQuickAction('split-pdf')}
                  variant="outline"
                  className="h-auto justify-start p-4 border-2 hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
                >
                  <span className="text-3xl">✂️</span>
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                      {t('tools.split-pdf.name')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('merge.quickActions.split')}
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
