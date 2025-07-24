import React, { useState, useMemo } from 'react';
import { MergeToolProps, MergeOptions } from '../../types';
import { pdfService } from '../../services/pdfService';
import { useToolState } from '../../hooks/useToolState';
import { useTranslation } from '../../hooks/useI18n';
import { downloadBlob, generateFilename } from '../../utils/fileHelpers';
import ToolContainer from '../shared/ToolContainer';

const MergeTool: React.FC<MergeToolProps> = React.memo(({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
  const {
    state,
    startProcessing,
    updateProgress,
    setError,
    setResult,
    clearError,
    canProcess
  } = useToolState();

  const [options, setOptions] = useState<MergeOptions>({
    order: Array.from({ length: files.length }, (_, i) => i),
    metadata: {
      title: 'Merged PDF',
      author: 'LocalPDF',
      subject: 'Merged PDF Document'
    }
  });

  // Memoized computed values
  const orderedFiles = useMemo(() => {
    return options.order ?
      options.order.map(index => files[index]).filter(Boolean) :
      files;
  }, [files, options.order]);

  const canMerge = useMemo(() => {
    return files.length >= 2 && canProcess;
  }, [files.length, canProcess]);

  const mergeDescription = useMemo(() => {
    return t('tools.merge.description') + ` (${files.length} ${t('common.files')})`;
  }, [files.length, t]);

  const handleMerge = async () => {
    if (!canMerge) {
      setError(t('errors.noFilesSelected'));
      return;
    }

    startProcessing(t('common.processing'));

    try {
      const result = await pdfService.mergePDFs(
        orderedFiles,
        updateProgress,
        options
      );

      if (result.success && result.data) {
        setResult(result);

        // Auto-download
        const filename = generateFilename(
          files[0]?.name || 'merged',
          'merged',
          'pdf'
        );
        downloadBlob(result.data, filename);

        // Notify parent
        onComplete(result);
      } else {
        setError(result.error?.message || t('errors.processingFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknownError'));
    }
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (!canProcess) return;

    const newOrder = [...(options.order || [])];
    const item = newOrder.splice(fromIndex, 1)[0];
    newOrder.splice(toIndex, 0, item);

    setOptions(prev => ({ ...prev, order: newOrder }));
  };

  const updateMetadata = (field: keyof NonNullable<MergeOptions['metadata']>, value: string) => {
    setOptions(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  return (
    <ToolContainer
      title={t('tools.merge.title')}
      description={mergeDescription}
      files={files}
      onClose={onClose}
      showFileList={false}
      isProcessing={state.isProcessing}
      progress={state.progress}
      progressMessage={state.progressMessage}
      error={state.error}
      onErrorDismiss={clearError}
      primaryAction={{
        label: state.isProcessing ? t('common.processing') : `${t('tools.merge.title')} ${files.length} ${t('common.files')}`,
        onClick: handleMerge,
        disabled: !canMerge,
        loading: state.isProcessing
      }}
      secondaryAction={{
        label: t('common.cancel'),
        onClick: onClose,
        disabled: state.isProcessing
      }}
      className={className}
    >
      {/* File Reordering Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              🔄
            </span>
            File Order (drag to reorder)
          </h3>

          <div className="space-y-3">
            {orderedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 pdf-processing-card rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="cursor-move text-secondary-400 hover:text-secondary-600 text-lg">
                    ⋮⋮
                  </div>
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center">
                    <span className="text-error-600">📄</span>
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{file.name}</p>
                    <p className="text-sm text-secondary-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveFile(index, Math.max(0, index - 1))}
                    disabled={index === 0 || state.isProcessing}
                    className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveFile(index, Math.min(orderedFiles.length - 1, index + 1))}
                    disabled={index === orderedFiles.length - 1 || state.isProcessing}
                    className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Options */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
            <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
              📋
            </span>
            Document Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={options.metadata?.title || ''}
                onChange={(e) => updateMetadata('title', e.target.value)}
                disabled={state.isProcessing}
                className="w-full px-3 py-2 pdf-processing-card border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Author
              </label>
              <input
                type="text"
                value={options.metadata?.author || ''}
                onChange={(e) => updateMetadata('author', e.target.value)}
                disabled={state.isProcessing}
                className="w-full px-3 py-2 pdf-processing-card border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={options.metadata?.subject || ''}
                onChange={(e) => updateMetadata('subject', e.target.value)}
                disabled={state.isProcessing}
                className="w-full px-3 py-2 pdf-processing-card border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Document subject"
              />
            </div>
          </div>
        </div>

        {/* Success State */}
        {state.result && (
          <div className="pdf-processing-card border-l-4 border-success-500 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-success-600">✅</span>
              </div>
              <div>
                <h4 className="text-success-800 font-semibold">
                  Success!
                </h4>
                <p className="text-success-700 text-sm">
                  PDF files merged successfully!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
});

MergeTool.displayName = 'MergeTool';

export default MergeTool;
