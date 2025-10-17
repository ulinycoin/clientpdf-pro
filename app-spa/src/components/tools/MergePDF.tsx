import React, { useState } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';

export const MergePDF: React.FC = () => {
  const { t } = useI18n();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: any } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending' as const,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);

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
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert(t('merge.errors.minFiles'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const fileObjects = files.map((f) => f.file);
      const result = await pdfService.mergePDFs(fileObjects, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata });
      } else {
        alert(result.error?.message || 'Merge failed');
      }
    } catch (error) {
      alert('An error occurred during merge');
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
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = (toolId: string) => {
    // Save the merged PDF to a temporary state or pass it to the next tool
    // For now, we'll use URL hash to navigate and the file will be available for re-upload
    window.location.hash = toolId.replace('-pdf', '');
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
        <div className="card p-6">
          <FileUpload
            accept=".pdf"
            multiple={true}
            onFilesSelected={handleFilesSelected}
            maxSizeMB={100}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Files list with previews */}
      {files.length > 0 && !result && (
        <div className="card p-6">
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
                <div className="card p-3 hover:shadow-medium transition-all duration-200 relative">
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
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400 text-xs font-bold">
                        {index + 1}
                      </span>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(index);
                        }}
                        disabled={isProcessing}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-ocean-500 text-white hover:bg-ocean-600 disabled:opacity-50 shadow-md"
                        aria-label="Move up"
                        title="Move up"
                      >
                        <span className="text-sm">↑</span>
                      </button>
                    )}

                    {/* Move down */}
                    {index < files.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(index);
                        }}
                        disabled={isProcessing}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-ocean-500 text-white hover:bg-ocean-600 disabled:opacity-50 shadow-md"
                        aria-label="Move down"
                        title="Move down"
                      >
                        <span className="text-sm">↓</span>
                      </button>
                    )}

                    {/* Remove */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      disabled={isProcessing}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-error-500 text-white hover:bg-error-600 disabled:opacity-50 shadow-md"
                      aria-label="Remove file"
                      title="Remove file"
                    >
                      <span className="text-sm">×</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Merge button */}
          <div className="mt-6">
            <button
              onClick={handleMerge}
              disabled={isProcessing || files.length < 2}
              className="btn btn-primary w-full text-lg py-3"
            >
              {isProcessing ? t('common.processing') : t('merge.mergeButton')}
            </button>
            {files.length < 2 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                {t('merge.minFilesHint')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="card p-6">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Success card */}
          <div className="card p-8">
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
                <button onClick={handleDownload} className="btn btn-primary px-8">
                  📥 {t('common.download')}
                </button>
                <button onClick={handleReset} className="btn btn-secondary">
                  {t('merge.mergeAnother')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('merge.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('merge.quickActions.description')}
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Compress */}
              <button
                onClick={() => handleQuickAction('compress-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('merge.quickActions.compress')}
                  </p>
                </div>
              </button>

              {/* Protect */}
              <button
                onClick={() => handleQuickAction('protect-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('merge.quickActions.protect')}
                  </p>
                </div>
              </button>

              {/* Watermark */}
              <button
                onClick={() => handleQuickAction('watermark-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('merge.quickActions.watermark')}
                  </p>
                </div>
              </button>

              {/* Split */}
              <button
                onClick={() => handleQuickAction('split-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">✂️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.split-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('merge.quickActions.split')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
