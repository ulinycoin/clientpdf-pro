import React, { useEffect } from 'react';
import { useI18n } from '../../../../hooks/useI18n';
import { Trash2, CheckSquare, Square, Copy, GripVertical, FilePlus, FileUp } from 'lucide-react';
import { useEditPDFContext } from '../EditPDFTool';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageThumbnailProps {
  page: any;
  actualIndex: number;
  displayIndex: number;
  pdfFile: File | null;
  onRotate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleSelect: () => void;
}

const SortablePageThumbnail: React.FC<PageThumbnailProps> = ({
  page,
  actualIndex,
  displayIndex,
  pdfFile,
  onRotate,
  onDelete,
  onDuplicate,
  onToggleSelect,
}) => {
  const { t } = useI18n();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [thumbnailLoaded, setThumbnailLoaded] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `page-${actualIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Render PDF thumbnail
  useEffect(() => {
    if (!canvasRef.current || page.originalIndex === -1) {
      setThumbnailLoaded(true); // Skip for blank pages
      return;
    }

    // Determine which PDF file to use
    const sourceFile = page.externalPDF ? page.externalPDF.file : pdfFile;
    const sourcePageIndex = page.externalPDF ? page.externalPDF.pageIndex : page.originalIndex;

    if (!sourceFile) {
      setThumbnailLoaded(true);
      return;
    }

    let cancelled = false;
    let renderTask: any = null;

    const renderThumbnail = async () => {
      try {
        const arrayBuffer = await sourceFile.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const pdfPage = await pdf.getPage(sourcePageIndex + 1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Get page rotation and calculate viewport
        // page.rotation contains USER-APPLIED rotation (0, 90, 180, 270)
        const viewport = pdfPage.getViewport({ scale: 1, rotation: page.rotation });

        // Target size for thumbnail (fit into container)
        const maxDimension = 200;
        const scale = Math.min(
          maxDimension / viewport.width,
          maxDimension / viewport.height
        );

        const scaledViewport = pdfPage.getViewport({ scale, rotation: page.rotation });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (cancelled) return;

        renderTask = pdfPage.render({
          canvasContext: context,
          viewport: scaledViewport,
        });

        await renderTask.promise;

        if (!cancelled) {
          setThumbnailLoaded(true);
        }
      } catch (error: any) {
        if (error?.name !== 'RenderingCancelledException' && !cancelled) {
          console.error('Failed to render thumbnail:', error);
        }
        if (!cancelled) {
          setThumbnailLoaded(true);
        }
      }
    };

    renderThumbnail();

    // Cleanup: cancel render task on unmount or dependency change
    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
    };
  }, [pdfFile, page.originalIndex, page.rotation, page.externalPDF]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group rounded-lg border-2 transition-all
        ${page.isSelected
          ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-ocean-300'
        }
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-grab active:cursor-grabbing flex items-center justify-center z-20 opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </div>

      {/* Thumbnail */}
      <div
        className={`min-h-[250px] max-h-[300px] rounded-t-lg flex items-center justify-center overflow-hidden relative cursor-pointer ${
          page.originalIndex === -1
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
        onClick={onToggleSelect}
      >
        {page.originalIndex === -1 ? (
          <FilePlus className="w-16 h-16 text-blue-400 dark:text-blue-500" />
        ) : (
          <>
            {!thumbnailLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain pointer-events-none"
              style={{ opacity: thumbnailLoaded ? 1 : 0 }}
            />
          </>
        )}
      </div>

      {/* Page Info */}
      <div className="p-2 bg-white dark:bg-gray-800">
        <div className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
          {page.originalIndex === -1
            ? `Blank Page ${displayIndex + 1}`
            : t('tools.edit.pages.thumbnail.page').replace('{number}', String(displayIndex + 1))}
        </div>
        {page.rotation !== 0 && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            {page.rotation}°
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          title={t('tools.edit.pages.thumbnail.duplicate')}
        >
          <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(t('tools.edit.pages.dialogs.deleteConfirm').replace('{count}', '1'))) {
              onDelete();
            }
          }}
          className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title={t('tools.edit.pages.thumbnail.delete')}
        >
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>

      {/* Selection Indicator */}
      {page.isSelected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-ocean-500 rounded-full flex items-center justify-center z-10">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

const PagesTab: React.FC = () => {
  const { t } = useI18n();
  const {
    state,
    rotatePage,
    deletePage,
    duplicatePage,
    insertBlankPage,
    togglePageSelection,
    selectAllPages,
    deselectAllPages,
    deleteSelectedPages,
    rotateSelectedPages,
    reorderPages,
    insertPagesFromPDF,
  } = useEditPDFContext();

  const visiblePages = state.pages.filter(page => !page.isDeleted);
  const selectedCount = visiblePages.filter(page => page.isSelected).length;
  const hasSelection = selectedCount > 0;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleInsertPDF = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Validate all files are PDFs
    const invalidFiles = fileArray.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      alert(`Please select only PDF files. Found ${invalidFiles.length} non-PDF file(s).`);
      return;
    }

    // Show progress message
    if (fileArray.length > 1) {
      console.log(`Loading ${fileArray.length} PDF files...`);
    }

    // Insert PDFs sequentially
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      console.log(`Loading ${i + 1}/${fileArray.length}: ${file.name}`);
      await insertPagesFromPDF(file);
    }

    console.log(`✓ Successfully loaded ${fileArray.length} PDF file(s)`);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visiblePages.findIndex(
        (_, i) => `page-${state.pages.indexOf(visiblePages[i])}` === active.id
      );
      const newIndex = visiblePages.findIndex(
        (_, i) => `page-${state.pages.indexOf(visiblePages[i])}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const oldActualIndex = state.pages.indexOf(visiblePages[oldIndex]);
        const newActualIndex = state.pages.indexOf(visiblePages[newIndex]);
        reorderPages(oldActualIndex, newActualIndex);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={selectedCount === visiblePages.length ? deselectAllPages : selectAllPages}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {selectedCount === visiblePages.length ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {selectedCount === visiblePages.length
            ? t('tools.edit.pages.toolbar.deselectAll')
            : t('tools.edit.pages.toolbar.selectAll')}
        </button>

        <button
          onClick={() => insertBlankPage()}
          className="px-4 py-2 rounded-lg border border-ocean-300 dark:border-ocean-600 text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition-colors flex items-center gap-2"
        >
          <FilePlus className="w-4 h-4" />
          {t('tools.edit.pages.toolbar.addBlankPage')}
        </button>

        <button
          onClick={handleInsertPDF}
          className="px-4 py-2 rounded-lg border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-2"
        >
          <FileUp className="w-4 h-4" />
          {t('tools.edit.pages.toolbar.insertFromPDF')}
        </button>

        {/* Hidden file input - multiple files supported */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {hasSelection && (
          <>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} {t('tools.edit.pages.selected')}
            </span>
            <button
              onClick={deleteSelectedPages}
              className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('tools.edit.pages.toolbar.deleteSelected')}
            </button>
          </>
        )}
      </div>

      {/* Pages Grid with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visiblePages.map((_, i) => `page-${state.pages.indexOf(visiblePages[i])}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {visiblePages.map((page, displayIndex) => {
              const actualIndex = state.pages.indexOf(page);
              return (
                <SortablePageThumbnail
                  key={actualIndex}
                  page={page}
                  actualIndex={actualIndex}
                  displayIndex={displayIndex}
                  pdfFile={state.originalFile}
                  onRotate={() => rotatePage(actualIndex, 90)}
                  onDelete={() => deletePage(actualIndex)}
                  onDuplicate={() => duplicatePage(actualIndex)}
                  onToggleSelect={() => togglePageSelection(actualIndex)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {visiblePages.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {t('tools.edit.pages.noPages')}
        </div>
      )}
    </div>
  );
};

export default PagesTab;
