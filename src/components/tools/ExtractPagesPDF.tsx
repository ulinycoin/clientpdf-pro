import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { usePDFThumbnails } from '@/hooks/usePDFThumbnails';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Minimize2,
  Shield,
  Stamp,
  Layers,
  ZoomIn,
  CheckSquare,
  Square,
  X,
  Loader2,
  FileStack
} from 'lucide-react';
import { toast } from 'sonner';

export const ExtractPagesPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  // Selection state
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pagesToExtractInput, setPagesToExtractInput] = useState('');

  // Zoom state
  const [zoomedPageNumber, setZoomedPageNumber] = useState<number | null>(null);
  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);
  const [isZoomLoading, setIsZoomLoading] = useState(false);

  // Thumbnails hook
  const { thumbnails, isLoading: thumbnailsLoading } = usePDFThumbnails({
    file: file?.file,
    thumbnailWidth: 200,
    thumbnailHeight: 280,
  });

  useEffect(() => {
    if (sharedFile && !file && !result) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}`,
        file: sharedFileObj,
        name: sharedFile.name,
        size: sharedFileObj.size,
        status: 'pending',
      };
      setFile(uploadedFile);
      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) => prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null);
      });
      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_extracted_pages.pdf') || 'extracted_pages.pdf';
      saveSharedFile(result, fileName, 'extract-pages-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, saveSharedFile]);

  // Sync input with selection
  useEffect(() => {
    const sortedSelection = Array.from(selectedPages).sort((a, b) => a - b);
    if (sortedSelection.length > 0) {
      setPagesToExtractInput(sortedSelection.join(', '));
    } else {
      setPagesToExtractInput('');
    }
  }, [selectedPages]);

  // Load zoomed image
  useEffect(() => {
    const loadZoomedImage = async () => {
      if (zoomedPageNumber !== null && file?.file) {
        setIsZoomLoading(true);
        setZoomedImageSrc(null);
        try {
          const dataUrl = await pdfService.renderPageAsImage(file.file, zoomedPageNumber, 2.5);
          setZoomedImageSrc(dataUrl);
        } catch (err) {
          console.error('Failed to load zoomed image', err);
          toast.error(t('common.error'));
        } finally {
          setIsZoomLoading(false);
        }
      }
    };
    loadZoomedImage();
  }, [zoomedPageNumber, file, t]);

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
    setResult(null);
    setSelectedPages(new Set());
    setPagesToExtractInput('');
    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch {
      setFile((prev) => prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const pageCount = file?.info?.pages || 0;
    if (selectedPages.size === pageCount) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
    }
  };

  const handleSelectOdd = () => {
    const pageCount = file?.info?.pages || 0;
    const oddPages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(n => n % 2 !== 0);
    setSelectedPages(new Set(oddPages));
  };

  const handleSelectEven = () => {
    const pageCount = file?.info?.pages || 0;
    const evenPages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(n => n % 2 === 0);
    setSelectedPages(new Set(evenPages));
  };

  const parsePageNumbers = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(/[, ]+/).map(p => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) pages.add(i);
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) pages.add(pageNum);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleExtract = async () => {
    if (!file) return;
    const maxPages = file.info?.pages || 0;
    const pageNumbers = parsePageNumbers(pagesToExtractInput, maxPages);
    if (pageNumbers.length === 0) {
      toast.error(t('extractPages.invalidPages'));
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);
    try {
      const extractResult = await pdfService.extractPDF(file.file, pageNumbers, (prog, msg) => {
        setProgress(prog);
        setProgressMessage(msg);
      });
      if (extractResult.success && extractResult.data) {
        setResult(extractResult.data);
        toast.success(t('extractPages.success'));
      } else {
        toast.error(t('extractPages.failed'));
      }
    } catch (error) {
      toast.error(t('extractPages.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const filename = file.name.replace(/\.pdf$/i, '_extracted.pdf');
    pdfService.downloadFile(result, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setPagesToExtractInput('');
    setSelectedPages(new Set());
    setProgress(0);
    setProgressMessage('');
  };

  const handleQuickAction = async (toolId: Tool) => {
    if (!result || !file) return;
    const filename = file.name.replace(/\.pdf$/i, '_extracted.pdf');
    saveSharedFile(result, filename, 'extract-pages-pdf');
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const maxPages = file?.info?.pages || 1;

  const renderContent = () => {
    if (!file) return null;
    if (result) {
      return (
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">{t('extractPages.success')}</h2>
          <p className="text-gray-500">{t('extractPages.successDescription')}</p>

          <div className="flex justify-center gap-4">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all">{t('common.download')}</Button>
            <Button onClick={handleReset} variant="outline" size="lg">{t('extractPages.extractAnother')}</Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            <Button onClick={() => handleQuickAction('compress-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Minimize2 className="h-5 w-5" /><span>{t('tools.compress-pdf.name')}</span></Button>
            <Button onClick={() => handleQuickAction('protect-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Shield className="h-5 w-5" /><span>{t('tools.protect-pdf.name')}</span></Button>
            <Button onClick={() => handleQuickAction('watermark-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Stamp className="h-5 w-5" /><span>{t('tools.watermark-pdf.name')}</span></Button>
            <Button onClick={() => handleQuickAction('merge-pdf')} variant="outline" className="h-auto py-4 flex flex-col gap-2"><Layers className="h-5 w-5" /><span>{t('tools.merge-pdf.name')}</span></Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Selection Options Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/80 dark:bg-gray-800/80">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-9 gap-2">
              {selectedPages.size === maxPages ? <CheckSquare className="w-4 h-4 text-ocean-500" /> : <Square className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('common.selectAll')}</span>
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSelectOdd} className="h-9 px-3 text-xs">
                {t('pageEditor.odd') || 'Odd'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSelectEven} className="h-9 px-3 text-xs">
                {t('pageEditor.even') || 'Even'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedPages.size > 0 && (
              <Badge variant="secondary" className="bg-ocean-100 text-ocean-700 dark:bg-ocean-900/30 dark:text-ocean-300 font-medium">
                {selectedPages.size} {t('common.pages')} {t('common.selected') || 'selected'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPages(new Set())}
              disabled={selectedPages.size === 0}
              className="text-gray-500 hover:text-red-500"
            >
              {t('common.reset')}
            </Button>
          </div>
        </div>

        {/* Page Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {thumbnailsLoading ? (
            Array.from({ length: maxPages }).map((_, i) => (
              <Card key={i} className="aspect-[1/1.4] animate-pulse bg-gray-100 dark:bg-gray-800 border-none" />
            ))
          ) : (
            thumbnails.map((thumb) => {
              const isSelected = selectedPages.has(thumb.pageNumber);
              return (
                <Card
                  key={thumb.pageNumber}
                  className={`
                    relative group overflow-hidden cursor-pointer transition-all duration-200 border-2
                    ${isSelected ? 'border-ocean-500 shadow-md ring-1 ring-ocean-500/20' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}
                  `}
                  onClick={() => togglePageSelection(thumb.pageNumber)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePageSelection(thumb.pageNumber)}
                      className={`
                        w-5 h-5 bg-white/90 backdrop-blur-sm data-[state=checked]:bg-ocean-500 data-[state=checked]:border-ocean-500
                        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        transition-opacity duration-200
                      `}
                    />
                  </div>

                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 bg-white/90 dark:bg-black/50 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedPageNumber(thumb.pageNumber);
                      }}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-1 aspect-[1/1.4] flex items-center justify-center bg-gray-50 dark:bg-gray-900 group-hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={thumb.dataUrl}
                      alt={`Page ${thumb.pageNumber}`}
                      className="max-w-full max-h-full object-contain shadow-sm"
                    />
                  </div>

                  <div className="py-1 text-center text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 uppercase tracking-wider">
                    {t('common.page')} {thumb.pageNumber}
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-ocean-500/5 mix-blend-multiply pointer-events-none" />
                  )}
                </Card>
              );
            })
          )}
        </div>

        {isProcessing && (
          <div className="mt-8">
            <ProgressBar progress={progress} message={progressMessage} />
          </div>
        )}

        {/* Zoom Overlay */}
        {zoomedPageNumber !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="font-bold text-lg">{t('common.page')} {zoomedPageNumber}</span>
                <Button variant="ghost" size="icon" onClick={() => setZoomedPageNumber(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-0">
                {isZoomLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
                    <span className="text-sm text-gray-500">{t('common.loading')}</span>
                  </div>
                ) : zoomedImageSrc ? (
                  <img src={zoomedImageSrc} alt="Zoomed page" className="max-w-full h-auto shadow-lg rounded-lg" />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('extractPages.pagesToExtract')}</Label>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <Input
            value={pagesToExtractInput}
            onChange={(e) => setPagesToExtractInput(e.target.value)}
            placeholder="e.g. 1, 3, 5-7"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
          <p className="text-xs text-gray-500 mt-2">{t('extractPages.hint', { total: String(maxPages) })}</p>
        </div>
      </div>

      <div className="bg-ocean-50 dark:bg-ocean-900/20 p-4 rounded-xl text-sm text-ocean-700 dark:text-ocean-300 border border-ocean-100 dark:border-ocean-900/50">
        <p className="font-semibold mb-1 flex items-center gap-2">
          <FileStack className="w-4 h-4" />
          {t('extractPages.info')}
        </p>
        <p className="opacity-80">{t('extractPages.infoDescription')}</p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title={t('tools.extract-pages-pdf.name')}
      description={t('tools.extract-pages-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      acceptedTypes=".pdf"
      settings={!result && file ? renderSettings() : null}
      actions={!result && file ? (
        <Button
          onClick={handleExtract}
          disabled={isProcessing || !pagesToExtractInput}
          className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('common.processing')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileStack className="w-5 h-5" />
              {t('extractPages.extractButton')}
              {selectedPages.size > 0 && ` (${selectedPages.size})`}
            </span>
          )}
        </Button>
      ) : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
