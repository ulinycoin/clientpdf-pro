import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import smartOrganizeService from '@/services/smartOrganizeService';
import type { ChapterInfo } from '@/services/smartOrganizeService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { toast } from 'sonner';

type SplitMode = 'all' | 'range' | 'intervals' | 'custom' | 'by-structure';

interface SplitResult {
  blob: Blob;
  pageNumbers: number[];
  index: number;
  chapterTitle?: string; // Optional chapter title for by-structure mode
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

  // By-structure mode settings
  const [detectedChapters, setDetectedChapters] = useState<ChapterInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set());

  // Preview Zoom state
  const [previewResult, setPreviewResult] = useState<SplitResult | null>(null);

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
      // Reset state for new file
    };

    setFile(uploadedFile);
    setResults([]);
    setDetectedChapters([]);
    setSelectedChapters(new Set());
    setSelectedResults(new Set());

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
    setDetectedChapters([]);
    setSelectedChapters(new Set());
  };

  // Analyze document structure for chapter detection
  const handleAnalyzeStructure = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(0);
    setProgressMessage('');

    try {
      const analysis = await smartOrganizeService.analyzeDocument(
        file.file,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (analysis.chapters.length > 0) {
        setDetectedChapters(analysis.chapters);
        // Auto-select all chapters by default
        setSelectedChapters(new Set(analysis.chapters.map((_, idx) => idx)));
        toast.success(
          `${analysis.chapters.length} ${analysis.chapters.length === 1 ? 'chapter' : 'chapters'} detected!`
        );
      } else {
        toast.info('No chapters detected. Try another split mode.');
        setDetectedChapters([]);
      }
    } catch (error) {
      toast.error('Failed to analyze document structure');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage('');
    }
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
          toast.error('Please enter valid page numbers');
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
      } else if (splitMode === 'by-structure') {
        // Split by detected chapters
        if (selectedChapters.size === 0) {
          toast.error('Please select at least one chapter to split');
          setIsProcessing(false);
          return;
        }

        const selectedChaptersList = Array.from(selectedChapters)
          .sort((a, b) => a - b)
          .map(idx => detectedChapters[idx]);

        setProgress(10);
        setProgressMessage('Splitting by chapters...');

        // Process each selected chapter
        for (let i = 0; i < selectedChaptersList.length; i++) {
          const chapter = selectedChaptersList[i];
          const endPage = chapter.endPage || (file.info?.pages || 0);

          setProgress(10 + (i / selectedChaptersList.length) * 80);
          setProgressMessage(`Processing: ${chapter.title}`);

          // Extract pages for this chapter
          const chapterPages = Array.from(
            { length: endPage - chapter.startPage + 1 },
            (_, idx) => chapter.startPage + idx
          );

          const result = await pdfService.splitPDF(
            file.file,
            'custom',
            { pages: chapterPages },
            () => { } // No progress callback for individual chapters
          );

          if (result.success && result.data && result.data[0]) {
            splitResults.push({
              blob: result.data[0],
              pageNumbers: chapterPages,
              index: i,
              chapterTitle: chapter.title, // Store chapter title for filename
            } as any);
          }
        }

        setProgress(95);
      }

      setResults(splitResults);
      toast.success('PDF split successfully!');
    } catch (error) {
      toast.error('An error occurred during split');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (result: SplitResult) => {
    let filename: string;

    if (result.chapterTitle) {
      // Use chapter title for by-structure mode
      const sanitizedTitle = result.chapterTitle
        .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s-]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 50); // Limit filename length
      filename = file?.name.replace('.pdf', `_${sanitizedTitle}.pdf`) || `${sanitizedTitle}.pdf`;
    } else {
      // Use page numbers for other modes
      const pageRange = result.pageNumbers.length === 1
        ? `page-${result.pageNumbers[0]}`
        : `pages-${result.pageNumbers[0]}-${result.pageNumbers[result.pageNumbers.length - 1]}`;
      filename = file?.name.replace('.pdf', `_${pageRange}.pdf`) || `split_${pageRange}.pdf`;
    }

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
      toast.success('Archive downloaded successfully!');
    } catch (error) {
      toast.error('Failed to create archive');
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
    // Determine which results to share
    let resultsToShare: SplitResult[];

    if (selectedResults.size === 0) {
      // No selection - use all results
      resultsToShare = results;
    } else {
      // Use selected results
      const selectedIndices = Array.from(selectedResults).sort((a, b) => a - b);
      resultsToShare = selectedIndices.map(index => results[index]);
    }

    // If only one result, share it directly
    if (resultsToShare.length === 1) {
      const result = resultsToShare[0];
      const filename = file?.name.replace('.pdf', `_page-${result.pageNumbers[0]}.pdf`) || 'split-page.pdf';
      setSharedFile(result.blob, filename, 'split-pdf');

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.hash = HASH_TOOL_MAP[toolId];
      return;
    }

    // If multiple results, merge them first
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage(t('split.mergingSelected'));

    try {
      const selectedBlobs = resultsToShare.map(r => r.blob);

      // Convert blobs to files for merging
      const filesToMerge = selectedBlobs.map((blob, i) =>
        new File([blob], `page-${i + 1}.pdf`, { type: 'application/pdf' })
      );

      // Merge pages
      const mergeResult = await pdfService.mergePDFs(filesToMerge, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });

      if (mergeResult.success && mergeResult.data) {
        const filename = selectedResults.size === 0
          ? file?.name.replace('.pdf', '_all-pages.pdf') || 'all-pages.pdf'
          : file?.name.replace('.pdf', '_selected-pages.pdf') || 'selected-pages.pdf';
        setSharedFile(mergeResult.data, filename, 'split-pdf');

        // Small delay to ensure state is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.hash = HASH_TOOL_MAP[toolId];
      } else {
        toast.error(t('split.mergeFailed'));
      }
    } catch (error) {
      console.error('Failed to merge pages:', error);
      toast.error(t('split.mergeFailed'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const maxPages = file?.info?.pages || 1;

  // Pagination settings
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const currentResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset pagination when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results.length]);

  return (
    <ToolLayout
      title={t('tools.split-pdf.name')}
      description={t('tools.split-pdf.description')}
      hasFiles={!!file}
      isProcessing={isProcessing}
      onUpload={(files) => handleFileSelected(files)}
      uploadContent={
        <FileUpload
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          maxSizeMB={100}
          disabled={isProcessing}
          title={t('common.selectFile')}
          description={t('upload.singleFileAllowed')}
        />
      }
      settings={
        file && results.length === 0 ? (
          <div className="space-y-6 animate-slide-up">
            {/* Range Mode Settings */}
            {splitMode === 'range' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">📑</span> {t('split.rangeSettings')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('split.startPage')}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={maxPages}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('split.endPage')}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={maxPages}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('split.rangeHint', { total: String(maxPages) })}
                </p>
              </div>
            )}

            {/* Intervals Mode Settings */}
            {splitMode === 'intervals' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">📚</span> {t('split.intervalSettings')}
                </h3>
                <div className="space-y-2">
                  <Label>{t('split.pagesPerFile')}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={maxPages}
                    value={intervalSize}
                    onChange={(e) => setIntervalSize(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('split.intervalHint', {
                    files: Math.ceil(maxPages / intervalSize),
                    total: maxPages
                  })}
                </p>
              </div>
            )}

            {/* Custom Mode Settings */}
            {splitMode === 'custom' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">🎯</span> {t('split.customSettings')}
                </h3>
                <div className="space-y-2">
                  <Label>{t('split.pageNumbers')}</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 1,3,5-7,10"
                    value={customPagesInput}
                    onChange={(e) => setCustomPagesInput(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('split.customHint')}
                </p>
              </div>
            )}

            {/* By Structure Mode Settings */}
            {splitMode === 'by-structure' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">✨</span> {t('split.structureSettings')}
                </h3>

                {detectedChapters.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('split.analyzeFirst')}
                    </p>
                    <Button
                      onClick={handleAnalyzeStructure}
                      disabled={isAnalyzing}
                      variant="outline"
                      className="w-full"
                    >
                      {isAnalyzing ? t('split.analyzing') : t('split.analyzeButton')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t('split.chaptersDetected', { count: detectedChapters.length })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAnalyzeStructure}
                        className="h-auto p-0 text-ocean-600"
                      >
                        {t('split.reanalyze')}
                      </Button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                      {detectedChapters.map((chapter, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedChapters.has(index)
                            ? 'bg-ocean-50 border-ocean-200 dark:bg-ocean-900/20 dark:border-ocean-800'
                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          onClick={() => {
                            const newSelected = new Set(selectedChapters);
                            if (newSelected.has(index)) {
                              newSelected.delete(index);
                            } else {
                              newSelected.add(index);
                            }
                            setSelectedChapters(newSelected);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${selectedChapters.has(index)
                              ? 'bg-ocean-500 border-ocean-500'
                              : 'border-gray-400'
                              }`}>
                              {selectedChapters.has(index) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">
                                {chapter.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t('split.pageRange', { start: chapter.startPage, end: chapter.endPage || maxPages })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null
      }
      actions={
        file ? (
          <div className="space-y-3">
            {results.length === 0 ? (
              <Button
                onClick={handleSplit}
                disabled={isProcessing || (splitMode === 'by-structure' && selectedChapters.size === 0)}
                className="w-full text-lg py-6 shadow-lg shadow-ocean-500/20 bg-ocean-500 hover:bg-ocean-600 text-white"
                size="lg"
              >
                {isProcessing ? t('common.processing') : t('split.splitButton')}
              </Button>
            ) : (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-1">
                    <span className="text-xl">✓</span>
                    {t('split.success.title')}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {t('split.success.filesCreated', { count: results.length })}
                  </p>
                </div>

                <Button
                  onClick={handleDownloadAll}
                  className="w-full"
                  variant="default"
                >
                  {t('split.downloadAll')}
                </Button>

                {results.length > 1 && (
                  <Button
                    onClick={handleDownloadAsZip}
                    disabled={isCreatingArchive}
                    className="w-full"
                    variant="outline"
                  >
                    {isCreatingArchive ? t('common.processing') : t('split.downloadAsZip')}
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  className="w-full"
                  variant="ghost"
                >
                  {t('split.splitAnother')}
                </Button>
              </>
            )}
          </div>
        ) : null
      }
    >
      {/* Auto-Loaded Banner */}
      {loadedFromShared && file && (
        <div className="mb-6 bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4 flex items-center justify-between animate-fade-in">
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
          <Button
            onClick={() => {
              clearSharedFile();
              setFile(null);
              setLoadedFromShared(false);
            }}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {file && results.length === 0 ? (
        <div className="space-y-8 animate-slide-up">
          {/* File Preview */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-ocean-400 to-purple-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative p-6 min-w-[300px] flex flex-col items-center">
                <PDFPreview file={file.file} width={240} height={320} className="shadow-lg mb-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center max-w-[280px] truncate">
                  {file.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('split.totalPages')}: {file.info?.pages || 0} • {pdfService.formatFileSize(file.size)}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('split.changeFile')}
                </Button>
              </Card>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div>
            <Label className="text-lg font-semibold mb-4 block text-center">
              {t('split.selectMode')}
            </Label>
            <Tabs value={splitMode} onValueChange={(v) => setSplitMode(v as SplitMode)} className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent p-0">
                {[
                  { id: 'all', icon: '📄', label: t('split.mode.all.name') },
                  { id: 'range', icon: '📑', label: t('split.mode.range.name') },
                  { id: 'intervals', icon: '📚', label: t('split.mode.intervals.name') },
                  { id: 'custom', icon: '🎯', label: t('split.mode.custom.name') },
                  { id: 'by-structure', icon: '✨', label: t('split.mode.byStructure.name') },
                ].map((mode) => (
                  <TabsTrigger
                    key={mode.id}
                    value={mode.id}
                    disabled={isProcessing}
                    className={`
                               flex items-center gap-2 px-6 py-3 rounded-full border transition-all
                               data-[state=active]:bg-ocean-600 data-[state=active]:text-white data-[state=active]:border-ocean-600 data-[state=active]:shadow-lg
                               bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                               hover:border-ocean-300 dark:hover:border-ocean-700
                            `}
                  >
                    <span className="text-xl">{mode.icon}</span>
                    <span className="font-medium">{mode.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Description of current mode */}
              <div className="text-center mt-4 text-gray-500 dark:text-gray-400 min-h-[24px]">
                {splitMode === 'all' && t('split.mode.all.description')}
                {splitMode === 'range' && t('split.mode.range.description')}
                {splitMode === 'intervals' && t('split.mode.intervals.description')}
                {splitMode === 'custom' && t('split.mode.custom.description')}
                {splitMode === 'by-structure' && t('split.mode.byStructure.description')}
              </div>
            </Tabs>
          </div>
        </div>
      ) : results.length > 0 ? (
        /* Results View */
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('split.outputFiles')} ({results.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedResults.size === results.length ? t('split.deselectAll') : t('split.selectAll')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentResults.map((result, index) => (
              <Card
                key={result.index}
                className={`
                         group relative p-4 transition-all hover:shadow-md cursor-pointer border-2
                         ${selectedResults.has(result.index) ? 'border-ocean-500 bg-ocean-50/50 dark:bg-ocean-900/10' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}
                      `}
                onClick={() => toggleResultSelection(result.index)}
              >
                <div className="absolute top-3 left-3 z-10">
                  <div className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${selectedResults.has(result.index) ? 'bg-ocean-500 border-ocean-500' : 'bg-white/80 border-gray-400'}
                         `}>
                    {selectedResults.has(result.index) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full shadow-sm bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewResult(result);
                    }}
                  >
                    <span className="text-lg">🔍</span>
                  </Button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <PDFPreview blob={result.blob} width={120} height={160} />
                  </div>
                  <p className="font-medium text-center text-sm truncate w-full mb-1">
                    {result.chapterTitle ||
                      (result.pageNumbers.length === 1
                        ? `${t('split.pageNumber', { page: result.pageNumbers[0] })}`
                        : `${t('split.pageRange', { start: result.pageNumbers[0], end: result.pageNumbers[result.pageNumbers.length - 1] })}`
                      )
                    }
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {result.pageNumbers.length} {result.pageNumbers.length === 1 ? t('split.pageCountSingle') : t('split.pages')}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(result);
                    }}
                  >
                    {t('common.download')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← {t('common.previous')}
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t('common.next')} →
              </Button>
            </div>
          )}

          {/* Quick Actions for Selected Files */}
          {selectedResults.size > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2 animate-slide-up z-50">
              <div className="px-3 font-medium text-sm">
                {t('split.selectedCount', { count: selectedResults.size })}
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAction('merge-pdf')}
                className="rounded-full"
              >
                🔗 {t('split.quickActions.merge')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleQuickAction('compress-pdf')}
                className="rounded-full"
              >
                📉 {t('split.quickActions.compress')}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Zoom Preview Modal */}
      <Dialog open={!!previewResult} onOpenChange={(open) => !open && setPreviewResult(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewResult?.chapterTitle || t('split.previewTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {previewResult && (
              <PDFPreview
                blob={previewResult.blob}
                width={600}
                height={800}
                className="shadow-xl"
              />
            )}

            <div className="flex gap-4 mt-6 w-full max-w-sm">
              <Button
                className="flex-1"
                onClick={() => previewResult && handleDownload(previewResult)}
              >
                {t('common.download')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPreviewResult(null)}
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ToolLayout>
  );
};
