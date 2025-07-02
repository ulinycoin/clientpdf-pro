import { useState, useCallback, useRef } from 'react';
import { TextElement } from '../types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface UseAddTextToolReturn {
  // State
  textElements: TextElement[];
  selectedElementId: string | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  toolMode: 'select' | 'add';
  isProcessing: boolean;
  
  // History
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions
  addTextElement: (x: number, y: number, text?: string) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (id: string) => void;
  selectElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  
  // Navigation
  goToPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setScale: (scale: number) => void;
  setToolMode: (mode: 'select' | 'add') => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // File operations
  savePDF: (originalFile: File) => Promise<Blob>;
  reset: () => void;
}

export const useAddTextTool = (): UseAddTextToolReturn => {
  // State
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [toolMode, setToolMode] = useState<'select' | 'add'>('add');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // History management
  const [history, setHistory] = useState<TextElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const elementIdCounter = useRef(0);

  // Get selected element
  const selectedElement = textElements.find(el => el.id === selectedElementId) || null;

  // History helpers
  const saveToHistory = useCallback((elements: TextElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Add text element
  const addTextElement = useCallback((x: number, y: number, text: string = 'New Text') => {
    const newElement: TextElement = {
      id: `text-${Date.now()}-${++elementIdCounter.current}`,
      text,
      x,
      y,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      isSelected: false,
      pageNumber: currentPage
    };

    const newElements = [...textElements, newElement];
    setTextElements(newElements);
    setSelectedElementId(newElement.id);
    saveToHistory(newElements);
  }, [textElements, currentPage, saveToHistory]);

  // Update text element
  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    const newElements = textElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setTextElements(newElements);
    saveToHistory(newElements);
  }, [textElements, saveToHistory]);

  // Delete text element
  const deleteTextElement = useCallback((id: string) => {
    const newElements = textElements.filter(el => el.id !== id);
    setTextElements(newElements);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    saveToHistory(newElements);
  }, [textElements, selectedElementId, saveToHistory]);

  // Select element
  const selectElement = useCallback((id: string) => {
    setSelectedElementId(id);
    setToolMode('select');
  }, []);

  // Move element
  const moveElement = useCallback((id: string, x: number, y: number) => {
    updateTextElement(id, { x, y });
  }, [updateTextElement]);

  // Navigation
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedElementId(null); // Deselect when changing pages
    }
  }, [totalPages]);

  const handleSetTotalPages = useCallback((total: number) => {
    setTotalPages(total);
  }, []);

  const handleSetScale = useCallback((newScale: number) => {
    setScale(Math.max(0.25, Math.min(5, newScale)));
  }, []);

  const handleSetToolMode = useCallback((mode: 'select' | 'add') => {
    setToolMode(mode);
    if (mode === 'add') {
      setSelectedElementId(null);
    }
  }, []);

  // History operations
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setTextElements([...history[newIndex]]);
      setHistoryIndex(newIndex);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setTextElements([...history[newIndex]]);
      setHistoryIndex(newIndex);
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0, g: 0, b: 0 };
  };

  // Load Google Fonts with Cyrillic support
  const loadCyrillicFont = async (pdfDoc: any) => {
    try {
      // Try to load a font that supports Cyrillic from Google Fonts
      const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2';
      const fontResponse = await fetch(fontUrl);
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      
      // Register fontkit
      pdfDoc.registerFontkit(fontkit);
      
      // Embed the font
      const customFont = await pdfDoc.embedFont(fontArrayBuffer);
      return customFont;
    } catch (error) {
      console.warn('Could not load Cyrillic font, falling back to Helvetica');
      return null;
    }
  };

  // Helper function to check if text contains Cyrillic characters
  const containsCyrillic = (text: string) => {
    return /[\u0400-\u04FF]/.test(text);
  };

  // Helper function to draw multiline text on PDF
  const drawMultilineText = (page: any, text: string, x: number, y: number, options: any) => {
    const lines = text.split('\n');
    const lineHeight = options.size * 1.2; // 120% line height
    
    lines.forEach((line, index) => {
      if (line.trim()) { // Only draw non-empty lines
        const lineY = y - (index * lineHeight);
        try {
          page.drawText(line, {
            ...options,
            x,
            y: lineY,
          });
        } catch (error) {
          console.warn(`Could not draw line "${line}":`, error);
          // Try with basic ASCII fallback
          const asciiLine = line.replace(/[^\x00-\x7F]/g, '?');
          page.drawText(asciiLine, {
            ...options,
            x,
            y: lineY,
          });
        }
      }
    });
  };

  // Save PDF with text elements
  const savePDF = useCallback(async (originalFile: File): Promise<Blob> => {
    setIsProcessing(true);
    try {
      // Load original PDF
      const arrayBuffer = await originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Register fontkit for custom fonts
      pdfDoc.registerFontkit(fontkit);
      
      // Try to load Cyrillic-compatible font
      const cyrillicFont = await loadCyrillicFont(pdfDoc);
      
      // Embed standard fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
      
      // Font mapping - prefer Cyrillic font for Cyrillic text
      const getFontForText = (text: string, fontFamily: string) => {
        if (containsCyrillic(text) && cyrillicFont) {
          return cyrillicFont;
        }
        
        const fontMap: Record<string, any> = {
          'Arial': helveticaFont,
          'Helvetica': helveticaFont,
          'Times': timesRomanFont,
          'Times New Roman': timesRomanFont,
          'Courier': courierFont,
          'Courier New': courierFont,
        };
        
        return fontMap[fontFamily] || helveticaFont;
      };
      
      // Group elements by page
      const elementsByPage = textElements.reduce((acc, element) => {
        if (!acc[element.pageNumber]) {
          acc[element.pageNumber] = [];
        }
        acc[element.pageNumber].push(element);
        return acc;
      }, {} as Record<number, TextElement[]>);

      // Add text to each page
      Object.entries(elementsByPage).forEach(([pageNum, elements]) => {
        const pageIndex = parseInt(pageNum) - 1;
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) return;
        
        const page = pdfDoc.getPage(pageIndex);
        const { height } = page.getSize();

        elements.forEach(element => {
          const color = hexToRgb(element.color);
          const font = getFontForText(element.text, element.fontFamily);
          
          // Draw multiline text with error handling
          try {
            drawMultilineText(page, element.text, element.x, height - element.y - element.fontSize, {
              size: element.fontSize,
              color: rgb(color.r, color.g, color.b),
              font: font,
            });
          } catch (error) {
            console.error(`Error drawing text "${element.text}":`, error);
            // Fallback: try with ASCII only
            const asciiText = element.text.replace(/[^\x00-\x7F]/g, '?');
            drawMultilineText(page, asciiText, element.x, height - element.y - element.fontSize, {
              size: element.fontSize,
              color: rgb(color.r, color.g, color.b),
              font: helveticaFont,
            });
          }
        });
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [textElements]);

  // Reset all state
  const reset = useCallback(() => {
    setTextElements([]);
    setSelectedElementId(null);
    setCurrentPage(1);
    setTotalPages(1);
    setScale(1);
    setToolMode('add');
    setHistory([[]]);
    setHistoryIndex(0);
    elementIdCounter.current = 0;
  }, []);

  return {
    // State
    textElements,
    selectedElementId,
    currentPage,
    totalPages,
    scale,
    toolMode,
    isProcessing,
    
    // History
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    
    // Actions
    addTextElement,
    updateTextElement,
    deleteTextElement,
    selectElement,
    moveElement,
    
    // Navigation
    goToPage,
    setTotalPages: handleSetTotalPages,
    setScale: handleSetScale,
    setToolMode: handleSetToolMode,
    
    // History
    undo,
    redo,
    
    // File operations
    savePDF,
    reset,
  };
};