import React, { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { usePDFThumbnails } from '@/hooks/usePDFThumbnails';
import pdfService from '@/services/pdfService';
import type { UploadedFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ZoomIn,
  CheckSquare,
  Square,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export const DeletePagesPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  // Selection state
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pagesToDeleteInput, setPagesToDeleteInput] = useState('');

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

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && !result) {
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

      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  // Auto-save result to sharedFile
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_deleted_pages.pdf') || 'deleted_pages.pdf';
      setSharedFile(result, fileName, 'delete-pages-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  // Sync input with selection
  useEffect(() => {
    const sortedSelection = Array.from(selectedPages).sort((a, b) => a - b);
    if (sortedSelection.length > 0) {
      // Create ranges for better readability (simplified for now)
      setPagesToDeleteInput(sortedSelection.join(', '));
    } else {
      setPagesToDeleteInput('');
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
    setSelectedPages(new Set());
    setPagesToDeleteInput('');

    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
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
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleDelete = async () => {
    if (!file) return;

    const maxPages = file.info?.pages || 0;
    const pageNumbersToDelete = parsePageNumbers(pagesToDeleteInput, maxPages);

    if (pageNumbersToDelete.length === 0) {
      toast.error(t('deletePages.invalidPages'));
      return;
    }

    if (pageNumbersToDelete.length >= maxPages) {
      toast.error(t('deletePages.cannotDeleteAll'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const deleteResult = await pdfService.deletePDF(
        file.file,
        pageNumbersToDelete,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (deleteResult.success && deleteResult.data) {
        setResult(deleteResult.data);
        toast.success(t('deletePages.success'));
      } else {
        toast.error(t('deletePages.failed'));
      }
    } catch (error) {
      toast.error(t('deletePages.failed'));
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const filename = file.name.replace(/\.pdf$/i, '_pages-deleted.pdf');
    pdfService.downloadFile(result, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setProgress(0);
    setProgressMessage('');
    setPagesToDeleteInput('');
    setSelectedPages(new Set());
  };

  const maxPages = file?.info?.pages || 1;

  const renderContent = () => {
    if (!file) return null;

    if (result) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('deletePages.success')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('deletePages.successDescription')}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              {t('deletePages.deleteAnother')}
            </Button>
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
                    ${isSelected ? 'border-red-500 shadow-md ring-1 ring-red-500/20' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}
                  `}
                  onClick={() => togglePageSelection(thumb.pageNumber)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePageSelection(thumb.pageNumber)}
                      className={`
                        w-5 h-5 bg-white/90 backdrop-blur-sm data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500
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
                    <div className="absolute inset-0 bg-red-500/5 mix-blend-multiply pointer-events-none" />
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

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          {t('deletePages.selectPages')}
        </h3>

        {/* Pages Input */}
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              {t('deletePages.pagesToDelete')}
            </Label>
            <Input
              type="text"
              value={pagesToDeleteInput}
              onChange={(e) => setPagesToDeleteInput(e.target.value)}
              placeholder="e.g. 1, 3, 5-7"
              disabled={isProcessing}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('deletePages.hint', { total: String(maxPages) })}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
                {t('deletePages.warning')}
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs">
                {t('deletePages.warningDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    const selectedCount = parsePageNumbers(pagesToDeleteInput, maxPages).length;
    return (
      <Button
        onClick={handleDelete}
        disabled={isProcessing || !file || selectedCount === 0}
        className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all !bg-red-600 hover:!bg-red-700 text-white"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('common.processing')}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {t('deletePages.deleteButton')}
            {selectedCount > 0 && ` (${selectedCount})`}
          </span>
        )}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.delete-pages-pdf.name')}
      description={t('tools.delete-pages-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      settings={!result && file ? renderSettings() : null}
      actions={!result && file ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
