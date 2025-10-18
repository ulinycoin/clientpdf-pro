import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

type SplitMode = 'all' | 'range' | 'intervals' | 'custom';

interface SplitResult {
  blob: Blob;
  pageNumbers: number[];
  index: number;
}

export const SplitPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [results, setResults] = useState<SplitResult[]>([]);
  const [loadedFromShared, setLoadedFromShared] = useState(false);
  const [isCreatingArchive, setIsCreatingArchive] = useState(false);

  // Range mode settings
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);

  // Intervals mode settings
  const [intervalSize, setIntervalSize] = useState(1);

  // Custom pages mode settings
  const [customPagesInput, setCustomPagesInput] = useState('');

  // Selection for continuing to other tools
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && results.length === 0) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, {
        type: 'application/pdf',
      });

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
        setRangeEnd(info.pages);
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      clearSharedFile();
    }
  }, [sharedFile, file, results, clearSharedFile]);

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

    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      setRangeEnd(info.pages);
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResults([]);
  };

  // Parse custom pages input (e.g., "1,3,5-7,10")
  const parseCustomPages = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        // Range: "5-7"
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        // Single page: "3"
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      let splitResults: SplitResult[] = [];

      if (splitMode === 'all') {
        // Split into individual pages
        const result = await pdfService.splitPDF(
          file.file,
          'pages',
          { pages: [] }, // Will split all pages
          (prog, msg) => {
            setProgress(prog);
            setProgressMessage(msg);
          }
        );

        if (result.success && result.data) {
          splitResults = result.data.map((blob, index) => ({
            blob,
            pageNumbers: [index + 1],
            index,
          }));
        }
      } else if (splitMode === 'range') {
        // Split by range
        const result = await pdfService.splitPDF(
          file.file,
          'range',
          { start: rangeStart, end: rangeEnd },
          (prog, msg) => {
            setProgress(prog);
            setProgressMessage(msg);
          }
        );

        if (result.success && result.data) {
          splitResults = [{
            blob: result.data[0],
            pageNumbers: Array.from(
              { length: rangeEnd - rangeStart + 1 },
              (_, i) => rangeStart + i
            ),
            index: 0,
          }];
        }
      } else if (splitMode === 'intervals') {
        // Split by intervals
        const result = await pdfService.splitPDF(
          file.file,
          'intervals',
          { interval: intervalSize },
          (prog, msg) => {
            setProgress(prog);
            setProgressMessage(msg);
          }
        );

        if (result.success && result.data) {
          const totalPages = file.info?.pages || 0;
          splitResults = result.data.map((blob, index) => {
            const startPage = index * intervalSize + 1;
            const endPage = Math.min((index + 1) * intervalSize, totalPages);
            return {
              blob,
              pageNumbers: Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i
              ),
              index,
            };
          });
        }
      } else if (splitMode === 'custom') {
        // Extract specific pages
        const maxPages = file.info?.pages || 0;
        const pagesToExtract = parseCustomPages(customPagesInput, maxPages);

        if (pagesToExtract.length === 0) {
          alert('Please enter valid page numbers');
          setIsProcessing(false);
          return;
        }

        setProgress(20);
        setProgressMessage(`Extracting ${pagesToExtract.length} pages...`);

        const result = await pdfService.splitPDF(
          file.file,
          'custom',
          { pages: pagesToExtract },
          (prog, msg) => {
            setProgress(prog);
            setProgressMessage(msg);
          }
        );

        if (result.success && result.data) {
          splitResults = result.data.map((blob, index) => ({
            blob,
            pageNumbers: [pagesToExtract[index]],
            index,
          }));
        }
      }

      setResults(splitResults);
    } catch (error) {
      alert('An error occurred during split');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (result: SplitResult) => {
    const pageRange = result.pageNumbers.length === 1
      ? `page-${result.pageNumbers[0]}`
      : `pages-${result.pageNumbers[0]}-${result.pageNumbers[result.pageNumbers.length - 1]}`;

    const filename = file?.name.replace('.pdf', `_${pageRange}.pdf`) || `split_${pageRange}.pdf`;
    pdfService.downloadFile(result.blob, filename);
  };

  const handleDownloadAll = () => {
    results.forEach((result, index) => {
      setTimeout(() => {
        handleDownload(result);
      }, index * 200); // Stagger downloads
    });
  };

  const handleDownloadAsZip = async () => {
    if (results.length === 0 || !file) return;

    setIsCreatingArchive(true);
    setProgress(0);

    try {
      // Prepare files for archiving
      const files = results.map((result) => {
        const pageRange = result.pageNumbers.length === 1
          ? `page-${result.pageNumbers[0]}`
          : `pages-${result.pageNumbers[0]}-${result.pageNumbers[result.pageNumbers.length - 1]}`;

        const filename = file.name.replace('.pdf', `_${pageRange}.pdf`) || `split_${pageRange}.pdf`;

        return {
          blob: result.blob,
          filename
        };
      });

      // Create and download ZIP
      const baseFilename = file.name.replace('.pdf', '') || 'split-pdf';
      const archiveName = `${baseFilename}_split.zip`;

      await pdfService.downloadAsZip(files, archiveName, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });
    } catch (error) {
      alert('Failed to create archive');
      console.error(error);
    } finally {
      setIsCreatingArchive(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults([]);
    setProgress(0);
    setProgressMessage('');
    setLoadedFromShared(false);
    setSelectedResults(new Set());
  };

  const toggleResultSelection = (index: number) => {
    const newSelection = new Set(selectedResults);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedResults(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedResults.size === results.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(results.map((_, index) => index)));
    }
  };

  const handleQuickAction = async (toolId: Tool) => {
    if (selectedResults.size === 0) {
      alert(t('split.selectPagesHint'));
      return;
    }

    // If only one page selected, share it directly
    if (selectedResults.size === 1) {
      const selectedIndex = Array.from(selectedResults)[0];
      const selectedResult = results[selectedIndex];
      const filename = file?.name.replace('.pdf', `_page-${selectedResult.pageNumbers[0]}.pdf`) || 'split-page.pdf';
      setSharedFile(selectedResult.blob, filename, 'split-pdf');
      window.location.hash = HASH_TOOL_MAP[toolId];
      return;
    }

    // If multiple pages selected, merge them first
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage(t('split.mergingSelected'));

    try {
      // Get selected results in order
      const selectedIndices = Array.from(selectedResults).sort((a, b) => a - b);
      const selectedBlobs = selectedIndices.map(index => results[index].blob);

      // Convert blobs to files for merging
      const filesToMerge = selectedBlobs.map((blob, i) =>
        new File([blob], `page-${i + 1}.pdf`, { type: 'application/pdf' })
      );

      // Merge selected pages
      const mergeResult = await pdfService.mergePDFs(filesToMerge, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (mergeResult.success && mergeResult.data) {
        const filename = file?.name.replace('.pdf', '_selected-pages.pdf') || 'selected-pages.pdf';
        setSharedFile(mergeResult.data, filename, 'split-pdf');
        window.location.hash = HASH_TOOL_MAP[toolId];
      } else {
        alert(t('split.mergeFailed'));
      }
    } catch (error) {
      console.error('Failed to merge selected pages:', error);
      alert(t('split.mergeFailed'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const maxPages = file?.info?.pages || 1;

  return (
    <div className="split-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.split-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.split-pdf.description')}
        </p>
      </div>

      {/* Upload section */}
      {!file && results.length === 0 && (
        <div className="card p-6">
          <FileUpload
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileSelected}
            maxSizeMB={100}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* File preview and split options */}
      {file && results.length === 0 && (
        <div className="space-y-6">
          {/* Auto-loaded indicator */}
          {loadedFromShared && (
            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-medium text-ocean-700 dark:text-ocean-300">
                    {t('split.autoLoaded.title')}
                  </p>
                  <p className="text-sm text-ocean-600 dark:text-ocean-400">
                    {t('split.autoLoaded.description')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File preview */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('split.filePreview')}
            </h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <PDFPreview file={file.file} width={160} height={220} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {file.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">{t('split.totalPages')}:</span>{' '}
                    {file.info?.pages || 0}
                  </p>
                  <p>
                    <span className="font-medium">{t('split.fileSize')}:</span>{' '}
                    {pdfService.formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="mt-4 text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                >
                  {t('split.changeFile')}
                </button>
              </div>
            </div>
          </div>

          {/* Split mode selector */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('split.selectMode')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* All pages mode */}
              <button
                onClick={() => setSplitMode('all')}
                disabled={isProcessing}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  splitMode === 'all'
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                    : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-4xl">📄</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      splitMode === 'all'
                        ? 'text-ocean-600 dark:text-ocean-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {t('split.mode.all.name')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('split.mode.all.description')}
                    </p>
                  </div>
                </div>
              </button>

              {/* Range mode */}
              <button
                onClick={() => setSplitMode('range')}
                disabled={isProcessing}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  splitMode === 'range'
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                    : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-4xl">📑</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      splitMode === 'range'
                        ? 'text-ocean-600 dark:text-ocean-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {t('split.mode.range.name')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('split.mode.range.description')}
                    </p>
                  </div>
                </div>
              </button>

              {/* Intervals mode */}
              <button
                onClick={() => setSplitMode('intervals')}
                disabled={isProcessing}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  splitMode === 'intervals'
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                    : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-4xl">📚</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      splitMode === 'intervals'
                        ? 'text-ocean-600 dark:text-ocean-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {t('split.mode.intervals.name')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('split.mode.intervals.description')}
                    </p>
                  </div>
                </div>
              </button>

              {/* Custom pages mode */}
              <button
                onClick={() => setSplitMode('custom')}
                disabled={isProcessing}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  splitMode === 'custom'
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                    : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-4xl">🎯</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      splitMode === 'custom'
                        ? 'text-ocean-600 dark:text-ocean-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {t('split.mode.custom.name')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('split.mode.custom.description')}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Mode-specific settings */}
            {splitMode === 'range' && (
              <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('split.rangeSettings')}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('split.startPage')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={maxPages}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-privacy-900 border border-gray-300 dark:border-privacy-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('split.endPage')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={maxPages}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-privacy-900 border border-gray-300 dark:border-privacy-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('split.rangeHint', { total: String(maxPages) })}
                </p>
              </div>
            )}

            {splitMode === 'intervals' && (
              <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('split.intervalSettings')}
                </h3>
                <div className="max-w-xs">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('split.pagesPerFile')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={maxPages}
                    value={intervalSize}
                    onChange={(e) => setIntervalSize(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                    disabled={isProcessing}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-privacy-900 border border-gray-300 dark:border-privacy-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('split.intervalHint', {
                    total: String(maxPages),
                    files: String(Math.ceil(maxPages / intervalSize))
                  })}
                </p>
              </div>
            )}

            {splitMode === 'custom' && (
              <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('split.customSettings')}
                </h3>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('split.pageNumbers')}
                  </label>
                  <input
                    type="text"
                    value={customPagesInput}
                    onChange={(e) => setCustomPagesInput(e.target.value)}
                    placeholder="1,3,5-7,10"
                    disabled={isProcessing}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-privacy-900 border border-gray-300 dark:border-privacy-600 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('split.customHint')}
                </p>
              </div>
            )}

            {/* Split button */}
            <button
              onClick={handleSplit}
              disabled={isProcessing || !file}
              className="btn btn-primary w-full text-lg py-3"
            >
              {isProcessing ? t('common.processing') : t('split.splitButton')}
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      {(isProcessing || isCreatingArchive) && (
        <div className="card p-6">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Success card */}
          <div className="card p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('split.success.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('split.success.filesCreated', { count: String(results.length) })}
              </p>

              {/* Download buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-4">
                <button
                  onClick={handleDownloadAsZip}
                  disabled={isCreatingArchive}
                  className="btn btn-primary px-8"
                >
                  {isCreatingArchive ? '⏳' : '📦'} {t('split.downloadAsZip')}
                </button>
                <button
                  onClick={handleDownloadAll}
                  disabled={isCreatingArchive}
                  className="btn btn-secondary px-8"
                >
                  📥 {t('split.downloadAll')}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isCreatingArchive}
                  className="btn btn-secondary"
                >
                  {t('split.splitAnother')}
                </button>
              </div>
            </div>
          </div>

          {/* Individual files */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('split.outputFiles')}
              </h3>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 font-medium"
              >
                {selectedResults.size === results.length
                  ? t('split.deselectAll')
                  : t('split.selectAll')}
              </button>
            </div>
            {selectedResults.size > 0 && (
              <div className="mb-4 px-4 py-2 bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg">
                <p className="text-sm text-ocean-700 dark:text-ocean-300">
                  {t('split.selectedCount', { count: String(selectedResults.size) })}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div
                  key={result.index}
                  onClick={() => toggleResultSelection(result.index)}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    selectedResults.has(result.index)
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedResults.has(result.index)
                          ? 'bg-ocean-500 border-ocean-500'
                          : 'border-gray-300 dark:border-privacy-600'
                      }`}>
                        {selectedResults.has(result.index) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span className="text-2xl">📄</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {pdfService.formatFileSize(result.blob.size)}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {result.pageNumbers.length === 1
                      ? t('split.pageNumber', { page: String(result.pageNumbers[0]) })
                      : t('split.pageRange', {
                          start: String(result.pageNumbers[0]),
                          end: String(result.pageNumbers[result.pageNumbers.length - 1])
                        })
                    }
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {result.pageNumbers.length === 1
                      ? t('split.pageCountSingle')
                      : t('split.pageCount', { count: String(result.pageNumbers.length) })
                    }
                  </p>
                  <button
                    onClick={() => handleDownload(result)}
                    className="btn btn-primary w-full text-sm py-2"
                  >
                    {t('common.download')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('split.quickActions.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedResults.size > 0
                ? t('split.quickActions.descriptionWithSelection', { count: String(selectedResults.size) })
                : t('split.quickActions.description')}
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
                    {t('split.quickActions.compress')}
                  </p>
                </div>
              </button>

              {/* Merge */}
              <button
                onClick={() => handleQuickAction('merge-pdf')}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
              >
                <span className="text-3xl">📎</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.merge-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('split.quickActions.merge')}
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
                    {t('split.quickActions.protect')}
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
                    {t('split.quickActions.watermark')}
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
