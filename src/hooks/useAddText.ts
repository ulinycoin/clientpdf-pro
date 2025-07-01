import { useState, useCallback, useRef } from 'react';
import { AddTextService } from '../services/addTextService';
import { 
  TextElement, 
  AddTextOptions, 
  AddTextResult, 
  UndoRedoState,
  TextEditingState,
  CanvasInteraction,
  PageDimensions 
} from '../types/addText.types';

interface UseAddTextReturn {
  // Processing state
  isProcessing: boolean;
  progress: number;
  error: string | null;
  result: AddTextResult | null;

  // Text elements management
  textElements: TextElement[];
  selectedElementId: string | null;
  
  // Editing state
  editingState: TextEditingState;
  
  // Undo/Redo
  undoRedoState: UndoRedoState;
  canUndo: boolean;
  canRedo: boolean;

  // Canvas interaction
  canvasInteraction: CanvasInteraction;

  // PDF preview
  currentPage: number;
  totalPages: number;
  pageScale: number;
  pageDimensions: PageDimensions | null;

  // Actions
  addTextElement: (x: number, y: number, text?: string) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  duplicateElement: (id: string) => void;

  // Text editing
  startEditing: (id: string, position: { x: number; y: number }) => void;
  finishEditing: (text: string) => void;
  cancelEditing: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Canvas interaction
  startDragging: (elementId: string, startPos: { x: number; y: number }) => void;
  updateDragging: (currentPos: { x: number; y: number }) => void;
  stopDragging: () => void;

  // PDF navigation
  goToPage: (page: number) => void;
  setPageScale: (scale: number) => void;
  setPageDimensions: (dimensions: PageDimensions) => void;

  // Processing
  processFile: (file: File) => Promise<void>;
  resetState: () => void;

  // Utilities
  getDefaultOptions: () => AddTextOptions;
  validateElements: () => { isValid: boolean; errors: string[] };
  exportElements: () => TextElement[];
  importElements: (elements: TextElement[]) => void;
}

export const useAddText = (): UseAddTextReturn => {
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AddTextResult | null>(null);

  // Text elements
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Editing state
  const [editingState, setEditingState] = useState<TextEditingState>({
    isEditing: false,
    elementId: null,
    tempText: '',
    position: { x: 0, y: 0 }
  });

  // Undo/Redo state
  const [undoRedoState, setUndoRedoState] = useState<UndoRedoState>({
    history: [[]],
    currentIndex: 0,
    maxHistorySize: 50
  });

  // Canvas interaction
  const [canvasInteraction, setCanvasInteraction] = useState<CanvasInteraction>({
    isDragging: false,
    dragElementId: null,
    dragStartPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 }
  });

  // PDF preview state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageScale, setPageScale] = useState(1);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null);

  // Service instance
  const addTextService = AddTextService.getInstance();

  // Save state to history for undo/redo
  const saveToHistory = useCallback((elements: TextElement[]) => {
    setUndoRedoState(prev => {
      const newHistory = prev.history.slice(0, prev.currentIndex + 1);
      newHistory.push([...elements]);
      
      // Limit history size
      if (newHistory.length > prev.maxHistorySize) {
        newHistory.shift();
      } else {
        // Only increment index if we didn't remove from beginning
        return {
          ...prev,
          history: newHistory,
          currentIndex: newHistory.length - 1
        };
      }
      
      return {
        ...prev,
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, []);

  // Add text element
  const addTextElement = useCallback((x: number, y: number, text: string = 'New Text') => {
    const newElement = addTextService.createTextElement(
      text,
      x,
      y,
      currentPage
    );
    
    const newElements = [...textElements, newElement];
    setTextElements(newElements);
    setSelectedElementId(newElement.id);
    saveToHistory(newElements);
  }, [textElements, currentPage, addTextService, saveToHistory]);

  // Update text element
  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    const newElements = textElements.map(element =>
      element.id === id ? { ...element, ...updates } : element
    );
    setTextElements(newElements);
    saveToHistory(newElements);
  }, [textElements, saveToHistory]);

  // Delete text element
  const deleteTextElement = useCallback((id: string) => {
    const newElements = textElements.filter(element => element.id !== id);
    setTextElements(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    saveToHistory(newElements);
  }, [textElements, selectedElementId, saveToHistory]);

  // Select element
  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    const newElement = addTextService.createTextElement(
      element.text,
      element.x + 20, // Offset slightly
      element.y + 20,
      element.pageNumber,
      {
        fontSize: element.fontSize,
        color: element.color,
        fontFamily: element.fontFamily,
        opacity: element.opacity,
        rotation: element.rotation,
        isBold: element.isBold,
        isItalic: element.isItalic,
        textAlign: element.textAlign,
        maxWidth: element.maxWidth
      }
    );

    const newElements = [...textElements, newElement];
    setTextElements(newElements);
    setSelectedElementId(newElement.id);
    saveToHistory(newElements);
  }, [textElements, addTextService, saveToHistory]);

  // Text editing functions
  const startEditing = useCallback((id: string, position: { x: number; y: number }) => {
    const element = textElements.find(el => el.id === id);
    if (!element) return;

    setEditingState({
      isEditing: true,
      elementId: id,
      tempText: element.text,
      position
    });
  }, [textElements]);

  const finishEditing = useCallback((text: string) => {
    if (editingState.elementId) {
      updateTextElement(editingState.elementId, { text: text.trim() || 'Text' });
    }
    setEditingState({
      isEditing: false,
      elementId: null,
      tempText: '',
      position: { x: 0, y: 0 }
    });
  }, [editingState.elementId, updateTextElement]);

  const cancelEditing = useCallback(() => {
    setEditingState({
      isEditing: false,
      elementId: null,
      tempText: '',
      position: { x: 0, y: 0 }
    });
  }, []);

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (undoRedoState.currentIndex > 0) {
      const newIndex = undoRedoState.currentIndex - 1;
      const elements = undoRedoState.history[newIndex];
      setTextElements([...elements]);
      setUndoRedoState(prev => ({ ...prev, currentIndex: newIndex }));
      setSelectedElementId(null);
    }
  }, [undoRedoState]);

  const redo = useCallback(() => {
    if (undoRedoState.currentIndex < undoRedoState.history.length - 1) {
      const newIndex = undoRedoState.currentIndex + 1;
      const elements = undoRedoState.history[newIndex];
      setTextElements([...elements]);
      setUndoRedoState(prev => ({ ...prev, currentIndex: newIndex }));
      setSelectedElementId(null);
    }
  }, [undoRedoState]);

  const clearHistory = useCallback(() => {
    setUndoRedoState({
      history: [textElements],
      currentIndex: 0,
      maxHistorySize: 50
    });
  }, [textElements]);

  // Canvas interaction functions
  const startDragging = useCallback((elementId: string, startPos: { x: number; y: number }) => {
    const element = textElements.find(el => el.id === elementId);
    if (!element) return;

    setCanvasInteraction({
      isDragging: true,
      dragElementId: elementId,
      dragStartPos: startPos,
      dragOffset: {
        x: startPos.x - element.x,
        y: startPos.y - element.y
      }
    });
  }, [textElements]);

  const updateDragging = useCallback((currentPos: { x: number; y: number }) => {
    if (canvasInteraction.isDragging && canvasInteraction.dragElementId) {
      const newX = currentPos.x - canvasInteraction.dragOffset.x;
      const newY = currentPos.y - canvasInteraction.dragOffset.y;
      
      updateTextElement(canvasInteraction.dragElementId, { x: newX, y: newY });
    }
  }, [canvasInteraction, updateTextElement]);

  const stopDragging = useCallback(() => {
    setCanvasInteraction({
      isDragging: false,
      dragElementId: null,
      dragStartPos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 }
    });
  }, []);

  // PDF navigation
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const setPageScaleValue = useCallback((scale: number) => {
    setPageScale(Math.max(0.1, Math.min(3, scale)));
  }, []);

  const setPageDimensionsValue = useCallback((dimensions: PageDimensions) => {
    setPageDimensions(dimensions);
  }, []);

  // Process file
  const processFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setResult(null);

      if (textElements.length === 0) {
        throw new Error('No text elements to add');
      }

      const options: AddTextOptions = {
        elements: textElements,
        defaultFontSize: 14,
        defaultColor: { r: 0, g: 0, b: 0 },
        defaultFont: 'Helvetica',
        defaultOpacity: 100
      };

      const result = await addTextService.addTextToPDF(
        file,
        options,
        (progressValue) => setProgress(progressValue)
      );

      if (result.success) {
        setResult(result);
      } else {
        setError(result.error || 'Failed to add text to PDF');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      console.error('[useAddText] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [textElements, addTextService]);

  // Reset state
  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResult(null);
    setTextElements([]);
    setSelectedElementId(null);
    setEditingState({
      isEditing: false,
      elementId: null,
      tempText: '',
      position: { x: 0, y: 0 }
    });
    setUndoRedoState({
      history: [[]],
      currentIndex: 0,
      maxHistorySize: 50
    });
    setCanvasInteraction({
      isDragging: false,
      dragElementId: null,
      dragStartPos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 }
    });
    setCurrentPage(1);
    setTotalPages(1);
    setPageScale(1);
    setPageDimensions(null);
  }, []);

  // Utilities
  const getDefaultOptions = useCallback(() => {
    return addTextService.getDefaultOptions();
  }, [addTextService]);

  const validateElements = useCallback(() => {
    const errors: string[] = [];
    
    if (textElements.length === 0) {
      errors.push('No text elements added');
    }

    for (const element of textElements) {
      const validation = addTextService.validateTextElement(element, totalPages);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [textElements, totalPages, addTextService]);

  const exportElements = useCallback(() => {
    return [...textElements];
  }, [textElements]);

  const importElements = useCallback((elements: TextElement[]) => {
    setTextElements([...elements]);
    saveToHistory(elements);
    setSelectedElementId(null);
  }, [saveToHistory]);

  // Computed values
  const canUndo = undoRedoState.currentIndex > 0;
  const canRedo = undoRedoState.currentIndex < undoRedoState.history.length - 1;

  return {
    // Processing state
    isProcessing,
    progress,
    error,
    result,

    // Text elements management
    textElements,
    selectedElementId,
    
    // Editing state
    editingState,
    
    // Undo/Redo
    undoRedoState,
    canUndo,
    canRedo,

    // Canvas interaction
    canvasInteraction,

    // PDF preview
    currentPage,
    totalPages,
    pageScale,
    pageDimensions,

    // Actions
    addTextElement,
    updateTextElement,
    deleteTextElement,
    selectElement,
    duplicateElement,

    // Text editing
    startEditing,
    finishEditing,
    cancelEditing,

    // Undo/Redo
    undo,
    redo,
    clearHistory,

    // Canvas interaction
    startDragging,
    updateDragging,
    stopDragging,

    // PDF navigation
    goToPage,
    setPageScale: setPageScaleValue,
    setPageDimensions: setPageDimensionsValue,

    // Processing
    processFile,
    resetState,

    // Utilities
    getDefaultOptions,
    validateElements,
    exportElements,
    importElements
  };
};