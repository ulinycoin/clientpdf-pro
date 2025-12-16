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
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { usePDFThumbnails, type PageThumbnail } from '@/hooks/usePDFThumbnails';
import pdfService from '@/services/pdfService';
import { SmartOrganizePanel } from '@/components/smart/SmartOrganizePanel';
import type { UploadedFile } from '@/types/pdf';
import { toast } from 'sonner';
import { RotateCw, Trash2, Download } from 'lucide-react';

interface PageItem extends PageThumbnail {
  id: string;
  rotation: number; // 0, 90, 180, 270
  isDeleted: boolean;
}

// Sortable page thumbnail component
const SortablePage: React.FC<{
  page: PageItem;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}> = ({ page, onRotate, onDelete, onRestore }) => {
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
      <Card className="p-2 hover:shadow-lg transition-shadow">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-move mb-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 ${page.isDeleted ? 'cursor-not-allowed' : ''
            }`}
        >
          ☰ {t('pageEditor.pageNumber', { number: page.pageNumber })}
        </div>

        {/* Thumbnail */}
        <div className="relative">
          <img
            src={page.dataUrl}
            alt={`Page ${page.pageNumber}`}
            className="w-full h-auto rounded"
            style={{
              transform: `rotate(${page.rotation}deg)`,
              transition: 'transform 0.3s ease',
            }}
          />

          {page.isDeleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
              <span className="text-white text-sm font-bold">{t('pageEditor.deleted')}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 mt-2">
          {!page.isDeleted ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRotate(page.id)}
                className="flex-1 text-xs"
                title={t('pageEditor.rotate90')}
              >
                <RotateCw className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(page.id)}
                className="flex-1 text-xs text-error-600 hover:text-error-700"
                title={t('pageEditor.deletePage')}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestore(page.id)}
              className="flex-1 text-xs text-success-600 hover:text-success-700"
              title={t('pageEditor.restorePage')}
            >
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
  const { sharedFile, clearSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Generate thumbnails
  const {
    thumbnails,
    isLoading: thumbnailsLoading,
    error: thumbnailsError,
    pageCount,
  } = usePDFThumbnails({
    file: file?.file,
    thumbnailWidth: 150,
    thumbnailHeight: 200,
    onProgress: (current, total) => {
      setProgressMessage(`${t('common.generatingThumbnails')} ${current}/${total}`);
    },
  });

  // Convert thumbnails to PageItems
  useEffect(() => {
    if (thumbnails.length > 0) {
      const pageItems: PageItem[] = thumbnails.map((thumb) => ({
        ...thumb,
        id: `page-${thumb.pageNumber}`,
        rotation: 0,
        isDeleted: false,
      }));
      setPages(pageItems);
    }
  }, [thumbnails]);

  // Auto-load file from shared state
  useEffect(() => {
    if (sharedFile && !file) {
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
      });

      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
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

    try {
      const info = await pdfService.getPDFInfo(pdfFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: t('pageEditor.failedRead') } : null
      );
      toast.error(t('pageEditor.failedRead'));
    }
  };

  // Rotate page
  const handleRotate = (id: string) => {
    setPages((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    );
  };

  // Delete page
  const handleDelete = (id: string) => {
    setPages((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isDeleted: true } : item
      )
    );
  };

  // Restore page
  const handleRestore = (id: string) => {
    setPages((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isDeleted: false } : item
      )
    );
  };

  // Smart Organize: Delete multiple pages by page number
  const handleSmartDelete = (pageNumbers: number[]) => {
    setPages((items) =>
      items.map((item) =>
        pageNumbers.includes(item.pageNumber) ? { ...item, isDeleted: true } : item
      )
    );
    toast.success(`${pageNumbers.length} page(s) marked for deletion`);
  };

  // Smart Organize: Rotate multiple pages
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

  // Smart Organize: Reorder pages
  const handleSmartReorder = (newOrder: number[]) => {
    setPages((items) => {
      const itemMap = new Map(items.map(item => [item.pageNumber, item]));
      const reordered = newOrder
        .map(pageNum => itemMap.get(pageNum))
        .filter((item): item is PageItem => item !== undefined);
      // Add any pages not in newOrder at the end
      const remaining = items.filter(item => !newOrder.includes(item.pageNumber));
      return [...reordered, ...remaining];
    });
    toast.success('Pages reordered');
  };

  // Smart Organize: Highlight pages (scroll into view)
  const handleHighlightPages = (pageNumbers: number[]) => {
    // Scroll first highlighted page into view
    if (pageNumbers.length > 0) {
      const firstPage = pages.find(p => p.pageNumber === pageNumbers[0]);
      if (firstPage) {
        const element = document.getElementById(`page-${firstPage.pageNumber}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Process and download
  const handleProcess = async () => {
    if (!file?.file) return;

    // Filter out deleted pages
    const activePages = pages.filter((p) => !p.isDeleted);

    if (activePages.length === 0) {
      toast.error(t('pageEditor.noPages'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Prepare page operations
      const pageOperations = activePages.map((page, index) => ({
        originalPageNumber: page.pageNumber,
        newPosition: index + 1,
        rotation: page.rotation,
      }));

      // Call PDFService to organize pages
      const result = await pdfService.organizePDF(
        file.file,
        pageOperations,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (result.success && result.data) {
        // Download result
        const url = URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '_organized.pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(t('pageEditor.successOrganized'));
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

  // Reset
  const handleReset = () => {
    setFile(null);
    setPages([]);
    setProgress(0);
    setProgressMessage('');
  };

  const hasChanges =
    pages.some((p) => p.rotation !== 0 || p.isDeleted) ||
    pages.map((p) => p.pageNumber).join(',') !==
    thumbnails.map((t) => t.pageNumber).join(',');

  return (
    <div className="page-editor-pdf space-y-6">
      <div className="pl-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.organize-pdf.name') || 'Organize PDF Pages'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.organize-pdf.description') ||
            'Reorder, rotate, and delete pages in your PDF'}
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <FileUpload
          onFilesSelected={handleFileUpload}
          accept=".pdf"
          maxFiles={1}
          multiple={false}
          title={t('common.selectFile') || 'Select PDF file'}
        />
      )}

      {/* Loading thumbnails */}
      {file && thumbnailsLoading && (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-500 dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {progressMessage || 'Generating thumbnails...'}
            </p>
          </div>
        </Card>
      )}

      {/* Error */}
      {thumbnailsError && (
        <Card className="p-8 bg-black/5 dark:bg-white/5 border-red-500/20">
          <p className="text-red-600 dark:text-red-400">{thumbnailsError}</p>
        </Card>
      )}

      {/* Page Editor */}
      {file && pages.length > 0 && !thumbnailsLoading && (
        <>
          {/* Info */}
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{file.name}</span>
                <span className="mx-2">•</span>
                <span>{t('pageEditor.pageCount', { count: pageCount })}</span>
                <span className="mx-2">•</span>
                <span>
                  {t('pageEditor.pagesAfter', { count: pages.filter((p) => !p.isDeleted).length })}
                </span>
              </div>
              <Button variant="outline" onClick={handleReset}>
                {t('pageEditor.uploadNew')}
              </Button>
            </div>
          </Card>

          {/* Smart Organize Panel */}
          <div className="mb-4">
            <SmartOrganizePanel
              file={file?.file || null}
              onDeletePages={handleSmartDelete}
              onRotatePages={handleSmartRotate}
              onReorderPages={handleSmartReorder}
              onHighlightPages={handleHighlightPages}
            />
          </div>

          {/* Instructions */}
          <Card className="p-4 mb-4 bg-black/5 dark:bg-white/5 border-transparent">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>{t('pageEditor.dragDrop')}</strong> {t('pageEditor.reorderPages')} •{' '}
              <strong>{t('pageEditor.clickRotate')}</strong> {t('pageEditor.toRotate')} •{' '}
              <strong>{t('pageEditor.clickDelete')}</strong> {t('pageEditor.toRemove')}
            </p>
          </Card>

          {/* Pages Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {pages.map((page) => (
                  <SortablePage
                    key={page.id}
                    page={page}
                    onRotate={handleRotate}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Process Button */}
          {isProcessing && (
            <ProgressBar progress={progress} message={progressMessage} />
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleProcess}
              disabled={isProcessing || !hasChanges}
              size="lg"
              className="flex-1"
            >
              <Download className="w-5 h-5 mr-2" />
              {isProcessing
                ? t('pageEditor.processing')
                : hasChanges
                  ? t('pageEditor.downloadOrganized')
                  : t('pageEditor.noChanges')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
