import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PDFPreview } from '@/components/common/PDFPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
            () => {} // No progress callback for individual chapters
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
    } finally{
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
        <Card>
          <CardContent className="p-6">
            <FileUpload
              accept=".pdf"
              multiple={false}
              onFilesSelected={handleFileSelected}
              maxSizeMB={100}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>
      )}

      {/* File preview and split options */}
      {file && results.length === 0 && (
        <div className="space-y-6">
          {/* Auto-loaded indicator */}
          {loadedFromShared && (
            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
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
                  className="text-ocean-600 dark:text-ocean-400 hover:text-ocean-800 dark:hover:text-ocean-200 font-semibold text-sm h-auto p-2"
                >
                  ✕ {t('common.close')}
                </Button>
              </div>
            </div>
          )}

          {/* File preview */}
          <Card>
            <CardContent className="p-6">
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
                  <Button
                    onClick={handleRemoveFile}
                    disabled={isProcessing}
                    variant="ghost"
                    className="mt-4 text-error-500 hover:text-error-600 h-auto p-0"
                  >
                    {t('split.changeFile')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split mode selector */}
          <Card>
            <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('split.selectMode')}
            </h2>

            <Tabs value={splitMode} onValueChange={(value) => setSplitMode(value as SplitMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 h-auto bg-transparent mb-6">
                {/* All pages mode */}
                <TabsTrigger
                  value="all"
                  disabled={isProcessing}
                  className="p-6 rounded-xl border-2 transition-all text-left data-[state=active]:border-ocean-500 data-[state=active]:bg-ocean-50 dark:data-[state=active]:bg-ocean-900/20 border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
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
                </TabsTrigger>

                {/* Range mode */}
                <TabsTrigger
                  value="range"
                  disabled={isProcessing}
                  className="p-6 rounded-xl border-2 transition-all text-left data-[state=active]:border-ocean-500 data-[state=active]:bg-ocean-50 dark:data-[state=active]:bg-ocean-900/20 border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
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
                </TabsTrigger>

                {/* Intervals mode */}
                <TabsTrigger
                  value="intervals"
                  disabled={isProcessing}
                  className="p-6 rounded-xl border-2 transition-all text-left data-[state=active]:border-ocean-500 data-[state=active]:bg-ocean-50 dark:data-[state=active]:bg-ocean-900/20 border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
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
                </TabsTrigger>

                {/* Custom pages mode */}
                <TabsTrigger
                  value="custom"
                  disabled={isProcessing}
                  className="p-6 rounded-xl border-2 transition-all text-left data-[state=active]:border-ocean-500 data-[state=active]:bg-ocean-50 dark:data-[state=active]:bg-ocean-900/20 border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
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
                </TabsTrigger>

                {/* By-structure mode */}
                <TabsTrigger
                  value="by-structure"
                  disabled={isProcessing}
                  className="p-6 rounded-xl border-2 transition-all text-left data-[state=active]:border-ocean-500 data-[state=active]:bg-ocean-50 dark:data-[state=active]:bg-ocean-900/20 border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">✨</span>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        splitMode === 'by-structure'
                          ? 'text-ocean-600 dark:text-ocean-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {t('split.mode.byStructure.name')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('split.mode.byStructure.description')}
                      </p>
                    </div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mode-specific settings */}
            {splitMode === 'range' && (
              <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('split.rangeSettings')}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('split.startPage')}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={maxPages}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                      disabled={isProcessing}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('split.endPage')}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={maxPages}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                      disabled={isProcessing}
                      className="w-full"
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
                  <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('split.pagesPerFile')}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={maxPages}
                    value={intervalSize}
                    onChange={(e) => setIntervalSize(Math.max(1, Math.min(maxPages, parseInt(e.target.value) || 1)))}
                    disabled={isProcessing}
                    className="w-full"
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
                  <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('split.pageNumbers')}
                  </Label>
                  <Input
                    type="text"
                    value={customPagesInput}
                    onChange={(e) => setCustomPagesInput(e.target.value)}
                    placeholder="1,3,5-7,10"
                    disabled={isProcessing}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('split.customHint')}
                </p>
              </div>
            )}

            {splitMode === 'by-structure' && (
              <div className="bg-gray-50 dark:bg-privacy-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t('split.structureSettings')}
                </h3>

                {detectedChapters.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('split.analyzeFirst')}
                    </p>
                    <Button
                      onClick={handleAnalyzeStructure}
                      disabled={isAnalyzing || isProcessing}
                      variant="outline"
                      size="lg"
                    >
                      {isAnalyzing ? t('split.analyzing') : t('split.analyzeButton')}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('split.chaptersDetected', { count: String(detectedChapters.length) })}
                      </p>
                      <Button
                        onClick={() => {
                          if (selectedChapters.size === detectedChapters.length) {
                            setSelectedChapters(new Set());
                          } else {
                            setSelectedChapters(new Set(detectedChapters.map((_, idx) => idx)));
                          }
                        }}
                        variant="ghost"
                        className="text-sm h-auto p-2"
                      >
                        {selectedChapters.size === detectedChapters.length
                          ? t('split.deselectAll')
                          : t('split.selectAll')}
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {detectedChapters.map((chapter, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const newSelection = new Set(selectedChapters);
                            if (newSelection.has(idx)) {
                              newSelection.delete(idx);
                            } else {
                              newSelection.add(idx);
                            }
                            setSelectedChapters(newSelection);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedChapters.has(idx)
                              ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                              : 'border-gray-200 dark:border-privacy-700 hover:border-ocean-300 dark:hover:border-ocean-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedChapters.has(idx)
                              ? 'bg-ocean-500 border-ocean-500'
                              : 'border-gray-300 dark:border-privacy-600'
                          }`}>
                            {selectedChapters.has(idx) && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {chapter.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('split.pageRange', {
                                start: String(chapter.startPage),
                                end: String(chapter.endPage || maxPages)
                              })}
                              {' • '}
                              {t('split.pageCount', {
                                count: String((chapter.endPage || maxPages) - chapter.startPage + 1)
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleAnalyzeStructure}
                      disabled={isAnalyzing || isProcessing}
                      variant="ghost"
                      className="w-full mt-3 text-sm"
                    >
                      {t('split.reanalyze')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Split button */}
            <Button
              onClick={handleSplit}
              disabled={isProcessing || !file || (splitMode === 'by-structure' && detectedChapters.length === 0)}
              className="w-full text-lg py-3"
              size="lg"
            >
              {isProcessing ? t('common.processing') : t('split.splitButton')}
            </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress */}
      {(isProcessing || isCreatingArchive) && (
        <Card>
          <CardContent className="p-6">
            <ProgressBar progress={progress} message={progressMessage} />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Success card */}
          <Card>
            <CardContent className="p-8">
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
                  <Button
                    onClick={handleDownloadAsZip}
                    disabled={isCreatingArchive}
                    size="lg"
                    className="px-8 !bg-green-600 hover:!bg-green-700 !text-white"
                  >
                    {isCreatingArchive ? 'Creating...' : t('split.downloadAsZip')}
                  </Button>
                  <Button
                    onClick={handleDownloadAll}
                    disabled={isCreatingArchive}
                    size="lg"
                    className="px-8 !bg-green-600 hover:!bg-green-700 !text-white"
                  >
                    {t('split.downloadAll')}
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={isCreatingArchive}
                    variant="outline"
                    size="lg"
                  >
                    {t('split.splitAnother')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual files */}
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('split.outputFiles')}
              </h3>
              <Button
                onClick={toggleSelectAll}
                variant="ghost"
                className="text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 font-medium h-auto p-2"
              >
                {selectedResults.size === results.length
                  ? t('split.deselectAll')
                  : t('split.selectAll')}
              </Button>
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
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(result);
                    }}
                    className="w-full text-sm"
                    size="sm"
                  >
                    {t('common.download')}
                  </Button>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
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
              <Button
                onClick={() => handleQuickAction('compress-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
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
              </Button>

              {/* Merge */}
              <Button
                onClick={() => handleQuickAction('merge-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
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
              </Button>

              {/* Protect */}
              <Button
                onClick={() => handleQuickAction('protect-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
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
              </Button>

              {/* Watermark */}
              <Button
                onClick={() => handleQuickAction('watermark-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto rounded-lg border-2 border-gray-200 dark:border-privacy-700 hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-all group"
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
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
