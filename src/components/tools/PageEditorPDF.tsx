import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { usePDFThumbnails, type PageThumbnail } from '@/hooks/usePDFThumbnails';
import pdfService from '@/services/pdfService';
import { SmartOrganizePanel } from '@/components/smart/SmartOrganizePanel';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { toast } from 'sonner';
import {
  RotateCw,
  Trash2,
  Download,
  RefreshCcw,
  CheckCircle2,
  Minimize2,
  Shield,
  ZoomIn,
  X,
  CheckSquare,
  Square,

  Plus
} from 'lucide-react';

interface PageItem extends PageThumbnail {
  id: string;
  rotation: number; // 0, 90, 180, 270
  isDeleted: boolean;
  sourceFile?: File; // Optional: if provided, page comes from this file
}

// Sortable page thumbnail component
const SortablePage: React.FC<{
  page: PageItem;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onZoom: (pageNumber: number) => void;
}> = ({ page, isSelected, onToggleSelection, onRotate, onDelete, onRestore, onZoom }) => {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id, disabled: page.isDeleted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : page.isDeleted ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${page.isDeleted ? 'grayscale' : ''}`}
    >
      <Card
        className={`p-2 hover:shadow-lg transition-all bg-white dark:bg-gray-800 border-2 ${isSelected
          ? 'border-ocean-500 shadow-md ring-1 ring-ocean-500/20'
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        onClick={(e) => {
          // If clicking the card background, toggle selection
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.thumbnail-container')) {
            onToggleSelection(page.id);
          }
        }}
      >
        {/* Selection Checkbox */}
        {!page.isDeleted && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(page.id)}
              className={`bg-white/90 backdrop-blur-sm data-[state=checked]:bg-ocean-500 border-gray-300 dark:border-gray-600 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}
            />
          </div>
        )}

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-move mb-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 ${page.isDeleted ? 'cursor-not-allowed' : ''
            }`}
        >
          {page.pageNumber}
        </div>

        {/* Thumbnail */}
        <div
          className="thumbnail-container relative aspect-[1/1.4] bg-gray-100 dark:bg-gray-900 rounded overflow-hidden flex items-center justify-center group/image cursor-pointer"
          onClick={() => !page.isDeleted && onToggleSelection(page.id)}
        >
          {page.dataUrl ? (
            <>
              <img
                src={page.dataUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-full object-contain select-none"
                style={{
                  transform: `rotate(${page.rotation}deg)`,
                  transition: 'transform 0.3s ease',
                }}
              />

              {/* Zoom Icon */}
              {!page.isDeleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoom(page.pageNumber);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover/image:opacity-100 transition-opacity"
                  title={t('common.zoom')}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-800 w-full h-full" />
          )}

          {page.isDeleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
              <span className="text-white text-xs font-bold uppercase tracking-wider">{t('pageEditor.deleted')}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!page.isDeleted ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onRotate(page.id); }}
                className="flex-1 h-7 text-xs px-0"
                title={t('pageEditor.rotate90')}
              >
                <RotateCw className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
                className="flex-1 h-7 text-xs px-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                title={t('pageEditor.deletePage')}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onRestore(page.id); }}
              className="flex-1 h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              title={t('pageEditor.restorePage')}
            >
              <RefreshCcw className="w-3 h-3 mr-1" />
              {t('pageEditor.restore')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export const PageEditorPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile: saveSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());

  const [isProcessing, setIsProcessing] = useState(false);
  const [, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; metadata: Record<string, unknown> } | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [zoomedPageNumber, setZoomedPageNumber] = useState<number | null>(null);
  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);
  const [isZoomLoading, setIsZoomLoading] = useState(false);

  // Generate thumbnails
  const {
    thumbnails,
    isLoading: thumbnailsLoading,
  } = usePDFThumbnails({
    file: file?.file,
    thumbnailWidth: 300,
    thumbnailHeight: 400,
    onProgress: (current, total) => {
      const percentage = Math.round((current / total) * 100);
      setProgress(percentage);
      setProgressMessage(`${t('common.generatingThumbnails')} ${percentage}%`);
    },
  });

  // Convert thumbnails to PageItems
  useEffect(() => {
    if (thumbnails.length > 0) {
      if (pages.length === 0) {
        const pageItems: PageItem[] = thumbnails.map((thumb) => ({
          ...thumb,
          id: `page-${thumb.pageNumber}`,
          rotation: 0,
          isDeleted: false,
        }));
        setPages(pageItems);
      } else {
        setPages(prev => prev.map(p => {
          const thumb = thumbnails.find(t => t.pageNumber === p.pageNumber);
          return thumb ? { ...p, dataUrl: thumb.dataUrl } : p;
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnails]);

  // Load zoomed image
  useEffect(() => {
    const loadZoomedImage = async () => {
      if (zoomedPageNumber !== null && file?.file) {
        setIsZoomLoading(true);
        setZoomedImageSrc(null);
        try {
          // Use a scale of 2 or 3 for high quality zoom
          const dataUrl = await pdfService.renderPageAsImage(file.file, zoomedPageNumber, 2.5);
          setZoomedImageSrc(dataUrl);
        } catch (err) {
          console.error('Failed to load zoomed image', err);
          toast.error(t('common.error'));
        } finally {
          setIsZoomLoading(false);
        }
      } else {
        setZoomedImageSrc(null);
      }
    };

    loadZoomedImage();
  }, [zoomedPageNumber, file, t]);

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file && !result) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, {
        type: 'application/pdf',
      });

      handleFileUpload([sharedFileObj]);
      clearSharedFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedFile, file, result, clearSharedFile]);

  // Auto-save result
  useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_organized.pdf') || 'organized.pdf';
      saveSharedFile(result.blob, fileName, 'organize-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, saveSharedFile]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const pdfFile = files[0];
    const uploadedFile: UploadedFile = {
      id: `${Date.now()}`,
      file: pdfFile,
      name: pdfFile.name,
      size: pdfFile.size,
      status: 'pending',
    };

    setFile(uploadedFile);
    setResult(null);
    setResultSaved(false);
    setPages([]);
    setSelectedPages(new Set());
    setProgress(0);

    try {
      const info = await pdfService.getPDFInfo(pdfFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: t('pageEditor.failedRead') } : null
      );
      toast.error(t('pageEditor.failedRead'));
    }
  };

  // Selection Handlers
  const handleToggleSelection = (id: string) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)));
    }
  };

  const handleSelectOdd = () => {
    const oddPages = pages.filter(p => p.pageNumber % 2 !== 0).map(p => p.id);
    setSelectedPages(new Set(oddPages));
  };

  const handleSelectEven = () => {
    const evenPages = pages.filter(p => p.pageNumber % 2 === 0).map(p => p.id);
    setSelectedPages(new Set(evenPages));
  };

  const handleRotate = (id: string) => {
    setPages((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setPages((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isDeleted: true } : item
      )
    );
    // Remove from selection if deleted
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleRestore = (id: string) => {
    setPages((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isDeleted: false } : item
      )
    );
  };

  const handleSmartDelete = (pageNumbers: number[]) => {
    setPages((items) =>
      items.map((item) =>
        pageNumbers.includes(item.pageNumber) ? { ...item, isDeleted: true } : item
      )
    );
    toast.success(`${pageNumbers.length} page(s) marked for deletion`);
  };

  const handleSmartRotate = (pageNumbers: number[], rotation: number) => {
    setPages((items) =>
      items.map((item) =>
        pageNumbers.includes(item.pageNumber)
          ? { ...item, rotation: (item.rotation + rotation) % 360 }
          : item
      )
    );
    toast.success(`${pageNumbers.length} page(s) rotated`);
  };

  const handleDeleteSelected = () => {
    setPages((items) =>
      items.map((item) =>
        selectedPages.has(item.id) ? { ...item, isDeleted: true } : item
      )
    );
    setSelectedPages(new Set());
    toast.success(`${selectedPages.size} ${t('pageEditor.pagesDeleted') || 'pages deleted'}`);
  };

  const handleExtractSelected = async () => {
    if (!file?.file || selectedPages.size === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage(t('pageEditor.extracting') || 'Extracting pages...');

    try {
      // Get page numbers from selected IDs
      const pagesToExtract = pages
        .filter(p => selectedPages.has(p.id))
        .map(p => p.pageNumber)
        .sort((a, b) => a - b);

      const result = await pdfService.splitPDF(
        file.file,
        'custom',
        { pages: pagesToExtract },
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (result.success && result.data && result.data[0]) {
        // Download immediately
        const fileName = file.name.replace(/\.pdf$/i, '_extracted.pdf');
        pdfService.downloadFile(result.data[0], fileName);
        toast.success(t('pageEditor.extractSuccess') || 'Pages extracted successfully');
      } else {
        toast.error(t('pageEditor.extractError') || 'Failed to extract pages');
      }
    } catch (error) {
      console.error('Error extracting pages:', error);
      toast.error(t('pageEditor.extractError') || 'Failed to extract pages');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleSmartReorder = (newOrder: number[]) => {
    setPages((items) => {
      const itemMap = new Map(items.map(item => [item.pageNumber, item]));
      const reordered = newOrder
        .map(pageNum => itemMap.get(pageNum))
        .filter((item): item is PageItem => item !== undefined);
      const remaining = items.filter(item => !newOrder.includes(item.pageNumber));
      return [...reordered, ...remaining];
    });
    toast.success('Pages reordered');
  };

  const handleHighlightPages = (pageNumbers: number[]) => {
    const idsToSelect = new Set<string>();
    pages.forEach(p => {
      if (pageNumbers.includes(p.pageNumber)) {
        idsToSelect.add(p.id);
      }
    });
    setSelectedPages(idsToSelect);
    toast.info(`Selected ${pageNumbers.length} pages`);
  };

  const handleInsertFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Processing new file...');

    try {
      const info = await pdfService.getPDFInfo(newFile);
      const pageCount = info.pages;
      // Use lower scale for thumbnails (0.5 is good for visualization)
      const newThumbnails = await pdfService.getPreviews(newFile, 0.5);

      const newPages: PageItem[] = newThumbnails.map((thumbnail, index) => ({
        id: crypto.randomUUID(),
        pageNumber: index + 1, // 1-based index from new file
        dataUrl: thumbnail,
        rotation: 0,
        isDeleted: false,
        width: 0, // Placeholder as getPreviews doesn't return dimensions
        height: 0, // Placeholder
        sourceFile: newFile
      }));

      setPages((prev) => [...prev, ...newPages]);
      toast.success(`Appended ${pageCount} pages`);
    } catch (error) {
      console.error('Error inserting file:', error);
      toast.error('Failed to insert file');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProcess = async () => {
    if (!file?.file) return;
    const activePages = pages.filter((p) => !p.isDeleted);
    if (activePages.length === 0) {
      toast.error(t('pageEditor.noPages'));
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Processing pages...');
    try {
      const pageOperations = activePages.map((page) => ({
        originalPageNumber: page.pageNumber,
        rotation: page.rotation,
        sourceFile: page.sourceFile
      }));
      const result = await pdfService.organizePDF(
        file.file,
        pageOperations,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );
      if (result.success && result.data) {
        setResult({ blob: result.data, metadata: result.metadata || { pageCount: activePages.length } });
      } else {
        toast.error(result.error?.message || t('pageEditor.failedOrganize'));
      }
    } catch (error) {
      console.error('Error organizing PDF:', error);
      toast.error(t('pageEditor.errorOrganize'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleDownload = () => {
    if (result?.blob) {
      const fileName = file?.name.replace(/\.pdf$/i, '_organized.pdf') || 'organized.pdf';
      pdfService.downloadFile(result.blob, fileName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPages([]);
    setSelectedPages(new Set());
    setProgress(0);
    setProgressMessage('');
    setResultSaved(false);
  };

  const handleQuickAction = (toolId: Tool) => {
    if (result?.blob) {
      saveSharedFile(result.blob, 'organized.pdf', 'organize-pdf');
    }
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  const hasChanges =
    pages.length > 0 &&
    (pages.some((p) => p.rotation !== 0 || p.isDeleted) ||
      pages.map((p) => p.pageNumber).join(',') !==
      thumbnails.map((t) => t.pageNumber).join(','));

  const renderContent = () => {
    if (!file) return null;

    if (thumbnailsLoading && pages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mb-4"></div>
          <p className="text-gray-500">{progressMessage || t('common.generatingThumbnails')}</p>
        </div>
      );
    }

    if (result) {
      return (
        <div className="text-center space-y-6 max-w-2xl mx-auto pt-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">{t('pageEditor.successOrganized')}</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">{t('common.originalSize')}</span>
              <span className="font-medium">{pdfService.formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('common.pages')}</span>
              <span className="font-medium">{(result.metadata?.pageCount as number) || pages.filter(p => !p.isDeleted).length}</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20">{t('common.download')}</Button>
            <Button onClick={handleReset} variant="outline" size="lg">{t('common.convertAnother')}</Button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button onClick={() => handleQuickAction('compress-pdf')} variant="ghost" className="h-auto py-3 flex flex-col gap-1 border hover:border-ocean-300 hover:bg-ocean-50 dark:hover:bg-ocean-900/10">
              <Minimize2 className="h-5 w-5 text-ocean-500" />
              <span className="text-sm font-medium">{t('tools.compress-pdf.name')}</span>
            </Button>
            <Button onClick={() => handleQuickAction('protect-pdf')} variant="ghost" className="h-auto py-3 flex flex-col gap-1 border hover:border-ocean-300 hover:bg-ocean-50 dark:hover:bg-ocean-900/10">
              <Shield className="h-5 w-5 text-ocean-500" />
              <span className="text-sm font-medium">{t('tools.protect-pdf.name')}</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Selection Toolbar */}
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 sticky top-0 z-10 shadow-sm min-h-[52px]">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 gap-2">
              {selectedPages.size === pages.length && pages.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {t('common.selectAll') || 'Select All'}
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSelectOdd} className="h-8 px-2 text-xs">
                {t('pageEditor.odd') || 'Odd'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSelectEven} className="h-8 px-2 text-xs">
                {t('pageEditor.even') || 'Even'}
              </Button>
            </div>
            {selectedPages.size > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-ocean-100 dark:bg-ocean-900/50 text-ocean-700 dark:text-ocean-300 rounded-full text-xs font-medium animate-in fade-in zoom-in">
                {selectedPages.size} selected
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {selectedPages.size > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={handleExtractSelected}
                  className="h-8 px-3 gap-2 bg-ocean-500 hover:bg-ocean-600 text-white shadow-sm animate-in fade-in slide-in-from-right-4"
                >
                  <Download className="w-4 h-4" />
                  {t('pageEditor.extract') || 'Extract'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  className="h-8 px-3 gap-2 shadow-sm animate-in fade-in slide-in-from-right-4"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('pageEditor.delete') || 'Delete'}
                </Button>
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPages(p => p.map(pg => ({ ...pg, rotation: 0, isDeleted: false })))}
              disabled={!hasChanges}
              className="h-8 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {t('common.reset')}
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="h-[calc(100vh-16rem)] min-h-[500px] overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 p-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                {pages.map((page) => (
                  <SortablePage
                    key={page.id}
                    page={page}
                    isSelected={selectedPages.has(page.id)}
                    onToggleSelection={handleToggleSelection}
                    onRotate={handleRotate}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onZoom={setZoomedPageNumber}
                  />
                ))}

                <Card
                  className="aspect-[3/4] flex flex-col items-center justify-center border-dashed border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 z-10">
                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-ocean-500 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-ocean-500 transition-colors z-10">{t('pageEditor.addPDF')}</span>
                  <span className="text-xs text-gray-400 mt-1 z-10">{t('pageEditor.appendPages')}</span>
                </Card>
              </div>
            </div>
          </SortableContext>
        </DndContext>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleInsertFile}
        />


      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <SmartOrganizePanel
        file={file?.file || null}
        onDeletePages={handleSmartDelete}
        onRotatePages={handleSmartRotate}
        onReorderPages={handleSmartReorder}
        onHighlightPages={handleHighlightPages}
      />
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
        <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">{t('pageEditor.tips.title')}</h4>
        <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
          <li>{t('pageEditor.tips.drag')}</li>
          <li>{t('pageEditor.tips.select')}</li>
          <li>{t('pageEditor.tips.rotateDelete')}</li>
          <li>{t('pageEditor.tips.extract')}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <ToolLayout
        title={t('tools.organize-pdf.name')}
        description={t('tools.organize-pdf.description')}
        hasFiles={!!file}
        onUpload={handleFileUpload}
        isProcessing={isProcessing}
        maxFiles={1}
        uploadTitle={t('common.selectFile')}
        uploadDescription={t('upload.singleFileAllowed')}
        acceptedTypes=".pdf"
        settings={!result && file ? renderSettings() : null}
        actions={
          !result && file ? (
            <Button
              onClick={handleProcess}
              disabled={isProcessing || !hasChanges}
              className="w-full py-6 text-lg font-bold shadow-lg shadow-ocean-500/20"
            >
              {isProcessing ? t('common.processing') : t('pageEditor.downloadOrganized')}
            </Button>
          ) : null
        }
      >
        {renderContent()}
      </ToolLayout>

      {/* Zoom Modal */}
      {zoomedPageNumber !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedPageNumber(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setZoomedPageNumber(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>

            {isZoomLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                <p className="text-white text-sm">{t('common.loading')}</p>
              </div>
            ) : zoomedImageSrc ? (
              <img
                src={zoomedImageSrc}
                alt={`Page ${zoomedPageNumber}`}
                className="max-w-full max-h-full object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

