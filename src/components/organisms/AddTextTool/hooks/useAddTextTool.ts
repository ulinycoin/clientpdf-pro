import { useState, useCallback, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Define TextElement locally if not available in main types
interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isSelected: boolean;
  pageNumber: number;
}

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
      fontFamily: 'Open Sans', // Default to Unicode-compatible font
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

  // Helper function to prepare text for PDF (preserve Unicode)
  const prepareTextForPDF = (text: string) => {
    // Only replace problematic punctuation, keep all Unicode characters
    return text
      .replace(/[""]/g, '"')  // Smart quotes to regular quotes
      .replace(/['']/g, "'")  // Smart apostrophes to regular apostrophes
      .replace(/[–—]/g, '-')  // Em/en dashes to hyphens
      .replace(/[…]/g, '...')  // Ellipsis to three dots
      // Keep all other characters including Cyrillic
      ;
  };

  // Helper function to draw multiline text with Unicode font
  const drawMultilineText = (page: any, text: string, x: number, y: number, options: any) => {
    const lines = text.split('\n');
    const lineHeight = options.size * 1.2; // 120% line height

    lines.forEach((line, index) => {
      if (line.trim()) { // Only draw non-empty lines
        const lineY = y - (index * lineHeight);
        
        try {
          // With proper Unicode font, this should work directly
          page.drawText(line, {
            ...options,
            x,
            y: lineY,
          });
          
          // If we got here, the text was drawn successfully
          console.log(`✅ Successfully drew line: "${line}"`);
          
        } catch (error) {
          console.warn(`❌ Failed to draw line "${line}":`, error);
          
          // Fallback: Try with cleaned text (remove problematic punctuation)
          try {
            const cleanedLine = prepareTextForPDF(line);
            page.drawText(cleanedLine, {
              ...options,
              x,
              y: lineY,
            });
            console.log(`⚠️ Drew cleaned line: "${cleanedLine}"`);
          } catch (secondError) {
            console.error(`❌ Even cleaned text failed for "${line}":`, secondError);
            
            // Final fallback: Replace with '?'
            const fallbackLine = line.replace(/[^\x00-\x7F]/g, '?');
            try {
              page.drawText(fallbackLine, {
                ...options,
                x,
                y: lineY,
              });
              console.warn(`⚠️ Used ASCII fallback: "${fallbackLine}"`);
            } catch (finalError) {
              console.error('Complete failure to draw text:', finalError);
            }
          }
        }
      }
    });
  };

  // Function to download font from URL
  const downloadFont = async (url: string): Promise<ArrayBuffer> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download font: ${response.statusText}`);
    }
    return response.arrayBuffer();
  };

  // Function to get fonts with REAL Unicode support
  const getCyrillicFonts = async (pdfDoc: any) => {
    // Register fontkit for custom font support
    pdfDoc.registerFontkit(fontkit);
    
    // Standard fonts as base
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
    
    // Try to load actual Unicode fonts that support Cyrillic
    const fonts: Record<string, any> = {};
    
    // Reliable CDN sources for Unicode fonts
    const fontSources = [
      {
        name: 'DejaVu Sans',
        url: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'
      },
      {
        name: 'Liberation Sans', 
        url: 'https://github.com/liberationfonts/liberation-fonts/releases/download/2.1.5/liberation-fonts-ttf-2.1.5.tar.gz'
      },
      {
        name: 'Noto Sans',
        url: 'https://fonts.gstatic.com/s/notosans/v28/o-0IIpQlx3QUlC5A4PNr5TRASf6M7VBj.woff2'
      }
    ];

    // Try to load the first available Unicode font
    let unicodeFont = helveticaFont;
    
    for (const fontSource of fontSources) {
      try {
        console.log(`Attempting to load Unicode font: ${fontSource.name}`);
        const response = await fetch(fontSource.url);
        if (response.ok) {
          const fontBytes = await response.arrayBuffer();
          unicodeFont = await pdfDoc.embedFont(fontBytes);
          fonts['Unicode'] = unicodeFont;
          console.log(`✅ Successfully loaded Unicode font: ${fontSource.name}`);
          break;
        }
      } catch (error) {
        console.warn(`❌ Failed to load ${fontSource.name}:`, error);
        continue;
      }
    }

    // If no Unicode font loaded, use Helvetica with a warning
    if (!fonts['Unicode']) {
      console.warn('⚠️ No Unicode fonts available - Cyrillic text may not display correctly');
      fonts['Unicode'] = helveticaFont;
    }

    // Font mapping prioritizing Unicode font
    const defaultFont = fonts['Unicode'] || helveticaFont;
    
    return {
      'Arial': defaultFont,
      'Helvetica': defaultFont,
      'Open Sans': defaultFont,
      'Roboto': defaultFont,
      'PT Sans': defaultFont,
      'Noto Sans': defaultFont,
      'Times': timesRomanFont,
      'Times New Roman': timesRomanFont,
      'Courier': courierFont,
      'Courier New': courierFont,
      // Ensure we always have a fallback
      '__default__': defaultFont,
    };
  };

  // Save PDF with text elements
  const savePDF = useCallback(async (originalFile: File): Promise<Blob> => {
    setIsProcessing(true);
    try {
      // Load original PDF
      const arrayBuffer = await originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get fonts with Cyrillic support
      const fontMap = await getCyrillicFonts(pdfDoc);

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
          const font = fontMap[element.fontFamily] || fontMap['Helvetica'] || fontMap['__default__'];

          // Draw multiline text with Unicode support
          console.log(`🎨 Drawing text "${element.text}" with font: ${element.fontFamily}`);
          drawMultilineText(page, element.text, element.x, height - element.y - element.fontSize, {
            size: element.fontSize,
            color: rgb(color.r, color.g, color.b),
            font: font,
          });
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
