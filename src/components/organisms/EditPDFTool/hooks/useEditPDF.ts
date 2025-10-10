import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { EditPDFState, PageState, PageOperation } from '../../../../types/editPDF.types';
import { editService } from '../../../../services/editService';

const initialState: EditPDFState = {
  originalFile: null,
  pdfDoc: null,
  pages: [],
  operations: [],
  annotations: [],
  selectedAnnotationId: null,
  watermark: {
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 30,
    angle: 45,
    color: '#ff0000',
    fontSize: 48,
    position: 'diagonal',
    applyToPages: 'all',
  },
  pageNumbers: {
    enabled: false,
    format: 'Page {n} of {total}',
    position: 'bottom-center',
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#000000',
    startNumber: 1,
    applyToPages: 'all',
  },
  background: {
    enabled: false,
    type: 'color',
    color: '#ffffff',
    applyToPages: 'all',
  },
  metadata: {},
  currentTab: 'pages',
  currentPage: 0,
  zoom: 1,
  history: [],
  historyIndex: -1,
  isProcessing: false,
};

export const useEditPDF = () => {
  const [state, setState] = useState<EditPDFState>(initialState);

  const loadFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Loading PDF...' }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Create pages without automatic rotation correction
      // PDF pages don't have rotation metadata - they are drawn upside-down in the PDF itself
      // User must manually rotate pages using the Rotate button if needed
      const pages: PageState[] = Array.from({ length: pageCount }, (_, i) => ({
        index: i,
        originalIndex: i,
        rotation: 0, // No initial rotation - user applies manually
        isSelected: false,
        isDeleted: false,
      }));

      // Extract metadata
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const subject = pdfDoc.getSubject();
      const keywords = pdfDoc.getKeywords();

      setState(prev => ({
        ...prev,
        originalFile: file,
        pdfDoc,
        pages,
        metadata: {
          title: title || '',
          author: author || '',
          subject: subject || '',
          keywords: keywords || '',
        },
        isProcessing: false,
        processingMessage: undefined,
      }));
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: undefined,
        error: 'Failed to load PDF file',
      }));
    }
  }, []);

  const addOperation = useCallback((operation: Omit<PageOperation, 'id' | 'timestamp'>) => {
    const newOperation: PageOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      operations: [...prev.operations, newOperation],
    }));
  }, []);

  const rotatePage = useCallback((pageIndex: number, rotation: 90 | 180 | 270) => {
    setState(prev => {
      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        rotation: (newPages[pageIndex].rotation + rotation) % 360,
      };
      return { ...prev, pages: newPages };
    });

    addOperation({ type: 'rotate', pageIndex, rotation });
  }, [addOperation]);

  const deletePage = useCallback((pageIndex: number) => {
    setState(prev => {
      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        isDeleted: true,
      };
      return { ...prev, pages: newPages };
    });

    addOperation({ type: 'delete', pageIndex });
  }, [addOperation]);

  const togglePageSelection = useCallback((pageIndex: number) => {
    setState(prev => {
      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        isSelected: !newPages[pageIndex].isSelected,
      };
      return { ...prev, pages: newPages };
    });
  }, []);

  const selectAllPages = useCallback(() => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => ({ ...page, isSelected: !page.isDeleted })),
    }));
  }, []);

  const deselectAllPages = useCallback(() => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(page => ({ ...page, isSelected: false })),
    }));
  }, []);

  const deleteSelectedPages = useCallback(() => {
    state.pages.forEach((page, index) => {
      if (page.isSelected && !page.isDeleted) {
        deletePage(index);
      }
    });
    deselectAllPages();
  }, [state.pages, deletePage, deselectAllPages]);

  const rotateSelectedPages = useCallback((rotation: 90 | 180 | 270) => {
    state.pages.forEach((page, index) => {
      if (page.isSelected && !page.isDeleted) {
        rotatePage(index, rotation);
      }
    });
  }, [state.pages, rotatePage]);

  const reorderPages = useCallback((oldIndex: number, newIndex: number) => {
    setState(prev => {
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(oldIndex, 1);
      newPages.splice(newIndex, 0, movedPage);

      // Update indices
      const updatedPages = newPages.map((page, idx) => ({
        ...page,
        index: idx,
      }));

      return { ...prev, pages: updatedPages };
    });

    addOperation({ type: 'reorder', pageIndex: oldIndex, targetIndex: newIndex });
  }, [addOperation]);

  const duplicatePage = useCallback((pageIndex: number) => {
    setState(prev => {
      const pageToDuplicate = prev.pages[pageIndex];
      const newPage: PageState = {
        ...pageToDuplicate,
        index: pageIndex + 1,
        originalIndex: pageToDuplicate.originalIndex,
        isSelected: false,
      };

      const newPages = [...prev.pages];
      newPages.splice(pageIndex + 1, 0, newPage);

      // Update indices
      const updatedPages = newPages.map((page, idx) => ({
        ...page,
        index: idx,
      }));

      return { ...prev, pages: updatedPages };
    });

    addOperation({ type: 'duplicate', pageIndex });
  }, [addOperation]);

  const processAndSave = useCallback(async (): Promise<Blob> => {
    setState(prev => ({ ...prev, isProcessing: true, processingMessage: 'Processing PDF...' }));

    try {
      // Get selected page indices (not deleted)
      const selectedPageIndices = state.pages
        .map((page, index) => ({ page, index }))
        .filter(({ page }) => page.isSelected && !page.isDeleted)
        .map(({ index }) => index);

      const result = await editService.processDocument(
        state.originalFile!,
        {
          pageOperations: state.operations,
          annotations: state.annotations,
          watermark: state.watermark,
          pageNumbers: state.pageNumbers,
          background: state.background,
          metadata: state.metadata,
          selectedPages: selectedPageIndices.length > 0 ? selectedPageIndices : undefined,
          pages: state.pages, // Pass pages for blank page support
        }
      );

      setState(prev => ({ ...prev, isProcessing: false, processingMessage: undefined }));
      return result;
    } catch (error) {
      console.error('Failed to process PDF:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: undefined,
        error: 'Failed to process PDF',
      }));
      throw error;
    }
  }, [state]);

  const undo = useCallback(() => {
    // Simple undo implementation - remove last operation
    setState(prev => {
      if (prev.operations.length === 0) return prev;
      return {
        ...prev,
        operations: prev.operations.slice(0, -1),
      };
    });
  }, []);

  const redo = useCallback(() => {
    // TODO: Implement proper redo with history
  }, []);

  const updateWatermark = useCallback((config: Partial<typeof initialState.watermark>) => {
    setState(prev => ({
      ...prev,
      watermark: { ...prev.watermark, ...config },
    }));
  }, []);

  const updatePageNumbers = useCallback((config: Partial<typeof initialState.pageNumbers>) => {
    setState(prev => ({
      ...prev,
      pageNumbers: { ...prev.pageNumbers, ...config },
    }));
  }, []);

  const updateBackground = useCallback((config: Partial<typeof initialState.background>) => {
    setState(prev => ({
      ...prev,
      background: { ...prev.background, ...config },
    }));
  }, []);

  const updateMetadata = useCallback((config: Partial<typeof initialState.metadata>) => {
    setState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...config },
    }));
  }, []);

  const insertBlankPage = useCallback((afterIndex?: number) => {
    setState(prev => {
      // Insert at the end if no index specified, or after the last selected page
      let insertIndex = prev.pages.length;

      if (afterIndex !== undefined) {
        insertIndex = afterIndex + 1;
      } else {
        // Find last selected page
        const selectedIndices = prev.pages
          .map((page, idx) => ({ page, idx }))
          .filter(({ page }) => page.isSelected && !page.isDeleted)
          .map(({ idx }) => idx);

        if (selectedIndices.length > 0) {
          insertIndex = Math.max(...selectedIndices) + 1;
        }
      }

      // Create new blank page
      const newPage: PageState = {
        index: insertIndex,
        originalIndex: -1, // -1 indicates this is a blank page
        rotation: 0,
        isSelected: false,
        isDeleted: false,
      };

      const newPages = [...prev.pages];
      newPages.splice(insertIndex, 0, newPage);

      // Update indices
      const updatedPages = newPages.map((page, idx) => ({
        ...page,
        index: idx,
      }));

      return { ...prev, pages: updatedPages };
    });

    addOperation({ type: 'insertBlank', pageIndex: afterIndex ?? state.pages.length });
  }, [addOperation, state.pages.length]);

  const insertPagesFromPDF = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      processingMessage: `Loading ${file.name}...`
    }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Find insertion point (after last selected page, or at the end)
      let insertIndex = state.pages.length;
      const selectedIndices = state.pages
        .map((page, idx) => ({ page, idx }))
        .filter(({ page }) => page.isSelected && !page.isDeleted)
        .map(({ idx }) => idx);

      if (selectedIndices.length > 0) {
        insertIndex = Math.max(...selectedIndices) + 1;
      }

      // Create pages from the new PDF
      // Use negative indices to indicate these are from external PDF
      const externalPDFId = Date.now(); // Unique ID for this PDF
      const newPages: PageState[] = Array.from({ length: pageCount }, (_, i) => ({
        index: insertIndex + i,
        originalIndex: -2 - externalPDFId - i, // Negative index for external PDF pages
        rotation: 0,
        isSelected: false,
        isDeleted: false,
        externalPDF: { file, pageIndex: i }, // Store reference to external PDF
      }));

      setState(prev => {
        const allPages = [...prev.pages];
        allPages.splice(insertIndex, 0, ...newPages);

        // Update indices
        const updatedPages = allPages.map((page, idx) => ({
          ...page,
          index: idx,
        }));

        return {
          ...prev,
          pages: updatedPages,
          isProcessing: false,
          processingMessage: undefined,
        };
      });
    } catch (error) {
      console.error('Failed to load PDF for merging:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: undefined,
        error: 'Failed to load PDF file',
      }));
    }
  }, [state.pages]);

  const canUndo = state.operations.length > 0;
  const canRedo = false; // TODO: Implement with history

  return {
    state,
    loadFile,
    rotatePage,
    deletePage,
    togglePageSelection,
    selectAllPages,
    deselectAllPages,
    deleteSelectedPages,
    rotateSelectedPages,
    reorderPages,
    duplicatePage,
    insertBlankPage,
    insertPagesFromPDF,
    updateWatermark,
    updatePageNumbers,
    updateBackground,
    updateMetadata,
    processAndSave,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
