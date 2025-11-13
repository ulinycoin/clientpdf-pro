import React, { useState, useRef } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import * as pdfjsLib from 'pdfjs-dist';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface TextOccurrence {
  id: string; // Unique ID for managing multiple selections
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number; // Detected font size from PDF
  pageNumber: number; // Page number this selection belongs to
  // New properties
  mode: 'text' | 'cover'; // 'text' = replace with text, 'cover' = just paint over
  textAlign?: 'left' | 'center' | 'right'; // Text alignment within selection
}

export const EditTextPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // File state
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);

  // Selection state - now supports multiple selections
  const [selections, setSelections] = useState<TextOccurrence[]>([]);
  const [activeSelectionId, setActiveSelectionId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [isEditingSelection, setIsEditingSelection] = useState(false);
  const [editMode, setEditMode] = useState<'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null>(null);
  const [editStart, setEditStart] = useState<{ x: number; y: number } | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);

  // UI state
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textOffsetX, setTextOffsetX] = useState(0);
  const [textOffsetY, setTextOffsetY] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [editMode_type, setEditModeType] = useState<'text' | 'cover'>('text'); // Renamed to avoid conflict
  const [canvasScale, setCanvasScale] = useState(1.5); // Scale for canvas rendering (1.0 - 3.0)

  // Helper function to build font string with styles
  const getFontString = React.useCallback((size: number, family: string) => {
    const styles = [];
    if (isItalic) styles.push('italic');
    if (isBold) styles.push('bold');
    return `${styles.join(' ')} ${size}px ${family}`.trim();
  }, [isBold, isItalic]);

  // Helper function to draw multiline text with word wrap
  const drawMultilineText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    alignment: 'left' | 'center' | 'right'
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const lines: string[] = [];

    // Build lines with word wrapping
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Draw each line with alignment
    for (let i = 0; i < lines.length; i++) {
      let lineX = x;
      const lineText = lines[i].trim();
      const lineWidth = context.measureText(lineText).width;

      if (alignment === 'center') {
        lineX = x + (maxWidth - lineWidth) / 2;
      } else if (alignment === 'right') {
        lineX = x + maxWidth - lineWidth;
      }

      context.fillText(lineText, lineX, currentY);
      currentY += lineHeight;
    }
  };

  const renderPagePreview = React.useCallback(async (
    pdf: any,
    pageNumber: number,
    tempSelection?: TextOccurrence | null
  ) => {
    if (!pdf || !canvasRef.current) {
      return;
    }

    // Cancel previous render task if exists
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        // Ignore cancellation errors
      }
      renderTaskRef.current = null;
    }

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: canvasScale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Store render task for cancellation
      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      // Draw all selections for current page (existing + temp)
      const pageSelections = selections.filter(s => s.pageNumber === pageNumber);
      const allSelections = tempSelection ? [...pageSelections, tempSelection] : pageSelections;

      for (const sel of allSelections) {
        const isActive = sel.id === activeSelectionId;

        if (showPreview) {
          // Preview mode: show actual changes
          context.fillStyle = backgroundColor;
          context.fillRect(sel.x, sel.y, sel.width, sel.height);

          // Draw new text with styles (if not in cover-only mode)
          if (sel.mode === 'text' && sel.text) {
            context.fillStyle = textColor;
            // Use fontSize scaled to canvas resolution to match final PDF appearance
            const previewFontSize = fontSize * canvasScale;
            context.font = getFontString(previewFontSize, fontFamily);
            context.textBaseline = 'top';

            // Calculate line height
            const lineHeight = previewFontSize * 1.2;
            const maxWidth = sel.width - (textOffsetX * canvasScale);

            // Draw multiline text with alignment
            drawMultilineText(
              context,
              sel.text,
              sel.x + (textOffsetX * canvasScale),
              sel.y + (textOffsetY * canvasScale),
              maxWidth,
              lineHeight,
              sel.textAlign || textAlign
            );
          }

          // Draw green border to indicate preview mode
          context.strokeStyle = isActive ? 'rgba(0, 255, 0, 0.9)' : 'rgba(0, 200, 0, 0.5)';
          context.lineWidth = isActive ? 3 : 2;
          context.strokeRect(sel.x, sel.y, sel.width, sel.height);
        } else {
          // Selection mode: show red highlight
          context.fillStyle = isActive ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 100, 100, 0.2)';
          context.fillRect(sel.x, sel.y, sel.width, sel.height);

          context.strokeStyle = isActive ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 100, 100, 0.6)';
          context.lineWidth = isActive ? 3 : 2;
          context.strokeRect(sel.x, sel.y, sel.width, sel.height);

          // Draw resize handles only for active selection
          if (isActive) {
            const handleSize = 10;
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.strokeStyle = 'rgba(255, 0, 0, 1)';
            context.lineWidth = 2;

            // Top-left
            context.fillRect(sel.x - handleSize/2, sel.y - handleSize/2, handleSize, handleSize);
            context.strokeRect(sel.x - handleSize/2, sel.y - handleSize/2, handleSize, handleSize);

            // Top-right
            context.fillRect(sel.x + sel.width - handleSize/2, sel.y - handleSize/2, handleSize, handleSize);
            context.strokeRect(sel.x + sel.width - handleSize/2, sel.y - handleSize/2, handleSize, handleSize);

            // Bottom-left
            context.fillRect(sel.x - handleSize/2, sel.y + sel.height - handleSize/2, handleSize, handleSize);
            context.strokeRect(sel.x - handleSize/2, sel.y + sel.height - handleSize/2, handleSize, handleSize);

            // Bottom-right
            context.fillRect(sel.x + sel.width - handleSize/2, sel.y + sel.height - handleSize/2, handleSize, handleSize);
            context.strokeRect(sel.x + sel.width - handleSize/2, sel.y + sel.height - handleSize/2, handleSize, handleSize);
          }

          // Draw mode indicator
          if (sel.mode === 'cover') {
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.font = 'bold 12px Arial';
            context.fillText('🎨', sel.x + 5, sel.y + 5);
          }
        }
      }
    } catch (error: any) {
      // Ignore rendering cancellation - it's expected when user is moving selection
      if (error?.name === 'RenderingCancelledException') {
        return;
      }
      console.error('Error rendering preview:', error);
    }
  }, [selections, activeSelectionId, showPreview, backgroundColor, textColor, fontSize, fontFamily, textOffsetX, textOffsetY, textAlign, canvasScale, getFontString]);

  const loadPDF = React.useCallback(async (pdfFile: File) => {
    console.log('Loading PDF:', pdfFile.name);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      console.log('PDF loaded, pages:', pdf.numPages);

      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setSelectedPage(1);

      // Render first page preview after state updates
      setTimeout(() => {
        renderPagePreview(pdf, 1);
      }, 100);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF');
    }
  }, [renderPagePreview]);

  // Auto-load shared file
  React.useEffect(() => {
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
      loadPDF(sharedFileObj);
      clearSharedFile();
    }

    // Cleanup: cancel render task on unmount
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore
        }
        renderTaskRef.current = null;
      }
    };
  }, [sharedFile, file, result, clearSharedFile, loadPDF]);

  // Auto-update preview when settings change OR when selections change
  React.useEffect(() => {
    if (pdfDocument && selections.length > 0) {
      renderPagePreview(pdfDocument, selectedPage);
    }
  }, [pdfDocument, selections, selectedPage, showPreview, fontSize, fontFamily, textColor, backgroundColor, textOffsetX, textOffsetY, isBold, isItalic, textAlign, renderPagePreview]);

  // Helper function to detect which part of selection was clicked
  const getClickTarget = (x: number, y: number, selection: TextOccurrence): 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null => {
    if (!selection) return null;

    const handleSize = 10;
    const tolerance = handleSize / 2;

    // Check corners (resize handles)
    if (Math.abs(x - selection.x) < tolerance && Math.abs(y - selection.y) < tolerance) {
      return 'resize-nw'; // top-left
    }
    if (Math.abs(x - (selection.x + selection.width)) < tolerance && Math.abs(y - selection.y) < tolerance) {
      return 'resize-ne'; // top-right
    }
    if (Math.abs(x - selection.x) < tolerance && Math.abs(y - (selection.y + selection.height)) < tolerance) {
      return 'resize-sw'; // bottom-left
    }
    if (Math.abs(x - (selection.x + selection.width)) < tolerance && Math.abs(y - (selection.y + selection.height)) < tolerance) {
      return 'resize-se'; // bottom-right
    }

    // Check if inside selection (move)
    if (x >= selection.x && x <= selection.x + selection.width &&
        y >= selection.y && y <= selection.y + selection.height) {
      return 'move';
    }

    return null;
  };

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
    setSelections([]);
    setActiveSelectionId(null);

    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      await loadPDF(selectedFile);
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setPdfDocument(null);
    setSelections([]);
    setActiveSelectionId(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on any existing selection (prioritize active, then others)
    if (!showPreview) {
      // First check active selection
      if (activeSelectionId) {
        const activeSelection = selections.find(s => s.id === activeSelectionId);
        if (activeSelection) {
          const clickTarget = getClickTarget(x, y, activeSelection);
          if (clickTarget) {
            setIsEditingSelection(true);
            setEditMode(clickTarget);
            setEditStart({ x, y });
            return;
          }
        }
      }

      // Then check other selections to activate them
      for (const selection of selections) {
        const clickTarget = getClickTarget(x, y, selection);
        if (clickTarget) {
          setActiveSelectionId(selection.id);
          setIsEditingSelection(true);
          setEditMode(clickTarget);
          setEditStart({ x, y });
          return;
        }
      }
    }

    // Start new selection
    setIsSelecting(true);
    setSelectionStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfDocument) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Handle editing existing selection
    if (isEditingSelection && editStart && activeSelectionId && editMode) {
      const activeSelection = selections.find(s => s.id === activeSelectionId);
      if (!activeSelection) return;

      const dx = x - editStart.x;
      const dy = y - editStart.y;

      let updatedSelection = { ...activeSelection };

      switch (editMode) {
        case 'move':
          updatedSelection.x = activeSelection.x + dx;
          updatedSelection.y = activeSelection.y + dy;
          break;
        case 'resize-nw':
          updatedSelection.x = activeSelection.x + dx;
          updatedSelection.y = activeSelection.y + dy;
          updatedSelection.width = activeSelection.width - dx;
          updatedSelection.height = activeSelection.height - dy;
          break;
        case 'resize-ne':
          updatedSelection.y = activeSelection.y + dy;
          updatedSelection.width = activeSelection.width + dx;
          updatedSelection.height = activeSelection.height - dy;
          break;
        case 'resize-sw':
          updatedSelection.x = activeSelection.x + dx;
          updatedSelection.width = activeSelection.width - dx;
          updatedSelection.height = activeSelection.height + dy;
          break;
        case 'resize-se':
          updatedSelection.width = activeSelection.width + dx;
          updatedSelection.height = activeSelection.height + dy;
          break;
      }

      // Prevent negative dimensions
      if (updatedSelection.width < 10) updatedSelection.width = 10;
      if (updatedSelection.height < 10) updatedSelection.height = 10;

      // Update the selection in the array
      setSelections(prev => prev.map(s => s.id === activeSelectionId ? updatedSelection : s));
      setEditStart({ x, y });
      return;
    }

    // Handle creating new selection
    if (isSelecting && selectionStart) {
      const tempSelection: TextOccurrence = {
        id: 'temp',
        text: '',
        x: Math.min(selectionStart.x, x),
        y: Math.min(selectionStart.y, y),
        width: Math.abs(x - selectionStart.x),
        height: Math.abs(y - selectionStart.y),
        pageNumber: selectedPage,
        mode: editMode_type,
        textAlign: textAlign,
      };

      renderPagePreview(pdfDocument, selectedPage, tempSelection);
      return;
    }

    // Update cursor based on hover position
    if (!showPreview && !isSelecting && !isEditingSelection) {
      let cursorSet = false;

      // Check active selection first
      if (activeSelectionId) {
        const activeSelection = selections.find(s => s.id === activeSelectionId);
        if (activeSelection) {
          const target = getClickTarget(x, y, activeSelection);
          if (target) {
            if (target === 'move') {
              canvas.style.cursor = 'move';
            } else if (target === 'resize-nw' || target === 'resize-se') {
              canvas.style.cursor = 'nwse-resize';
            } else if (target === 'resize-ne' || target === 'resize-sw') {
              canvas.style.cursor = 'nesw-resize';
            }
            cursorSet = true;
          }
        }
      }

      // Check other selections
      if (!cursorSet) {
        for (const selection of selections) {
          const target = getClickTarget(x, y, selection);
          if (target) {
            canvas.style.cursor = 'pointer';
            cursorSet = true;
            break;
          }
        }
      }

      if (!cursorSet) {
        canvas.style.cursor = 'crosshair';
      }
    }
  };

  // Helper function to extract text from selection area
  const extractTextFromSelection = async (selection: TextOccurrence) => {
    if (!pdfDocument) return;

    try {
      const page = await pdfDocument.getPage(selectedPage);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.5 });

      let extractedText = '';
      let detectedFontSize = 0;
      let fontSizeCount = 0;

      // Helper function to calculate intersection area percentage
      const getIntersectionPercentage = (
        itemX: number, itemY: number, itemW: number, itemH: number,
        selX: number, selY: number, selW: number, selH: number
      ) => {
        const x1 = Math.max(itemX, selX);
        const y1 = Math.max(itemY, selY);
        const x2 = Math.min(itemX + itemW, selX + selW);
        const y2 = Math.min(itemY + itemH, selY + selH);

        if (x2 > x1 && y2 > y1) {
          const intersectionArea = (x2 - x1) * (y2 - y1);
          const itemArea = itemW * itemH;
          return intersectionArea / itemArea;
        }
        return 0;
      };

      console.log('Selection bounds:', selection.x, selection.y, selection.width, selection.height);
      console.log('Viewport:', viewport.width, viewport.height);
      console.log('Total text items:', textContent.items.length);

      // Log first few items for debugging
      let debugCount = 0;
      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const transform = item.transform;
          const itemFontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
          const height = item.height || itemFontSize;
          const itemX = transform[4];
          const itemY = viewport.height - transform[5] - height;
          const width = item.width || (item.str.length * itemFontSize * 0.6);

          // Debug first 5 items
          if (debugCount < 5) {
            console.log(`Item ${debugCount}: "${item.str}" at (${itemX.toFixed(0)}, ${itemY.toFixed(0)}) size:${width.toFixed(0)}x${height.toFixed(0)}`);
            debugCount++;
          }

          // Check if text item intersects with selection (at least 50% overlap)
          const intersectionPercent = getIntersectionPercentage(
            itemX, itemY, width, height,
            selection.x, selection.y, selection.width, selection.height
          );

          if (intersectionPercent > 0.5) {
            extractedText += item.str;
            detectedFontSize += itemFontSize;
            fontSizeCount++;
            console.log(`✓ Matched text: "${item.str}" at (${itemX.toFixed(0)}, ${itemY.toFixed(0)}) size:${itemFontSize.toFixed(1)} overlap:${(intersectionPercent*100).toFixed(0)}%`);
          }
        }
      }

      console.log(`Total matched: ${fontSizeCount} items, text: "${extractedText}"`);

      // Calculate average font size
      if (fontSizeCount > 0) {
        const avgFontSize = Math.round(detectedFontSize / fontSizeCount);
        selection.fontSize = avgFontSize;
        // Auto-set the font size slider
        setFontSize(Math.max(8, Math.min(72, avgFontSize)));
        console.log('Detected font size:', avgFontSize, 'from', fontSizeCount, 'text items');
      }

      selection.text = extractedText;

      // Update the selection in the array
      setSelections(prev => prev.map(s => s.id === selection.id ? { ...selection } : s));

      // Don't call renderPagePreview here - it will be called by useEffect or caller
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Handle editing mode
    if (isEditingSelection) {
      setIsEditingSelection(false);
      setEditMode(null);
      setEditStart(null);

      // Re-extract text from new selection area (only if text mode)
      if (activeSelectionId && pdfDocument) {
        const activeSelection = selections.find(s => s.id === activeSelectionId);
        if (activeSelection && activeSelection.mode === 'text') {
          await extractTextFromSelection(activeSelection);
        }
      }
      return;
    }

    if (!isSelecting || !selectionStart || !canvasRef.current || !pdfDocument) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Create final selection with unique ID
    const newSelection: TextOccurrence = {
      id: `sel-${Date.now()}-${Math.random()}`,
      text: '',
      x: Math.min(selectionStart.x, x),
      y: Math.min(selectionStart.y, y),
      width: Math.abs(x - selectionStart.x),
      height: Math.abs(y - selectionStart.y),
      pageNumber: selectedPage,
      mode: editMode_type,
      textAlign: textAlign,
    };

    // Extract text using helper function (only if text mode)
    if (newSelection.mode === 'text') {
      await extractTextFromSelection(newSelection);
    }

    // Add to selections array
    setSelections(prev => [...prev, newSelection]);
    setActiveSelectionId(newSelection.id);

    setIsSelecting(false);
    setSelectionStart(null);
  };

  const handlePageChange = React.useCallback((page: number) => {
    console.log('Changing to page:', page);
    setSelectedPage(page);
    // Don't clear selections - they are stored per-page
    // Clear active selection to avoid confusion
    setActiveSelectionId(null);
    setShowPreview(false);
    if (pdfDocument) {
      renderPagePreview(pdfDocument, page);
    }
  }, [pdfDocument, renderPagePreview]);


  const handleReplaceText = async () => {
    if (!file || !pdfDocument || selections.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Group selections by page
      const selectionsByPage = new Map<number, TextOccurrence[]>();
      for (const selection of selections) {
        if (!selectionsByPage.has(selection.pageNumber)) {
          selectionsByPage.set(selection.pageNumber, []);
        }
        selectionsByPage.get(selection.pageNumber)!.push(selection);
      }

      setProgressMessage('Loading PDF...');
      setProgress(10);

      // Load original PDF with pdf-lib
      const arrayBuffer = await file.file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pagesToProcess = Array.from(selectionsByPage.keys()).sort((a, b) => a - b);
      let processedPages = 0;

      // Process each page that has selections
      for (const pageNum of pagesToProcess) {
        const pageSelections = selectionsByPage.get(pageNum)!;

        setProgressMessage(`Processing page ${pageNum} (${processedPages + 1}/${pagesToProcess.length})...`);
        setProgress(10 + (processedPages / pagesToProcess.length) * 70);

        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 }); // Higher resolution for better quality

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render original page
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Scale factor for high-res viewport
        const scale = viewport.scale;

        // Apply all selections for this page
        for (const selection of pageSelections) {
        // Scale coordinates to match high-res viewport
        const scaledSelection = {
          x: selection.x * (scale / 1.5),
          y: selection.y * (scale / 1.5),
          width: selection.width * (scale / 1.5),
          height: selection.height * (scale / 1.5),
        };

        // Draw background rectangle to cover old text/image
        context.fillStyle = backgroundColor;
        context.fillRect(scaledSelection.x, scaledSelection.y, scaledSelection.width, scaledSelection.height);

        // Draw new text with offsets and styles (only if text mode)
        if (selection.mode === 'text' && selection.text) {
          context.fillStyle = textColor;
          context.font = getFontString(fontSize * scale, fontFamily);
          context.textBaseline = 'top';

          // Calculate line height and max width
          const lineHeight = (fontSize * scale) * 1.2;
          const maxWidth = scaledSelection.width - (textOffsetX * scale / 1.5 * 2);
          const textX = scaledSelection.x + (textOffsetX * scale / 1.5);
          const textY = scaledSelection.y + (textOffsetY * scale / 1.5);

          // Draw multiline text with alignment
          const words = selection.text.split(' ');
          let line = '';
          let currentY = textY;
          const lines: string[] = [];

          // Build lines with word wrapping
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
              lines.push(line);
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          // Draw each line with alignment
          for (let i = 0; i < lines.length; i++) {
            let lineX = textX;
            const lineText = lines[i].trim();
            const lineWidth = context.measureText(lineText).width;

            if (selection.textAlign === 'center') {
              lineX = textX + (maxWidth - lineWidth) / 2;
            } else if (selection.textAlign === 'right') {
              lineX = textX + maxWidth - lineWidth;
            }

            context.fillText(lineText, lineX, currentY);
            currentY += lineHeight;
          }
        }
      } // End of for (const selection of pageSelections)

        // Convert canvas to image
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const imageBytes = Uint8Array.from(
          atob(imageDataUrl.split(',')[1]),
          (c) => c.charCodeAt(0)
        );

        // Embed the modified page image
        const image = await pdfDoc.embedJpg(imageBytes);
        const modifiedPage = pdfDoc.getPage(pageNum - 1);
        const { width: pageWidth, height: pageHeight } = modifiedPage.getSize();

        // Clear the page and draw the image
        modifiedPage.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: { type: 'RGB', red: 1, green: 1, blue: 1 },
        });

        modifiedPage.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });

        processedPages++;
      }

      setProgressMessage('Saving PDF...');
      setProgress(90);

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const resultBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      setProgress(100);
      setResult(resultBlob);

      // Auto-save to shared file
      const fileName = file.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
      setSharedFile(resultBlob, fileName, 'edit-text-pdf');
    } catch (error) {
      console.error('Error replacing text:', error);
      alert(t('editText.replaceError') || 'Failed to replace text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUseInTool = (targetTool: Tool) => {
    if (!result) return;
    const fileName = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
    setSharedFile(result, fileName, 'edit-text-pdf');
    window.location.hash = HASH_TOOL_MAP[targetTool];
  };

  const hasFile = !!file && !!pdfDocument;
  const hasResult = !!result;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.edit-text-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.edit-text-pdf.description')}
        </p>
      </div>

      {/* File Upload */}
      {!hasFile && !hasResult && (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept=".pdf"
          maxFiles={1}
          title={t('common.uploadFile')}
          description={t('common.uploadDescription')}
        />
      )}

      {/* Main Interface */}
      {hasFile && !hasResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* File Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common.page')} {selectedPage} / {totalPages}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('common.remove')}
                </button>
              </div>
            </div>

            {/* Page Selector with Text Position Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Page to Edit
              </label>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => handlePageChange(Math.max(1, selectedPage - 1))}
                  disabled={selectedPage === 1}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  ←
                </button>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={selectedPage}
                  onChange={(e) => handlePageChange(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, selectedPage + 1))}
                  disabled={selectedPage === totalPages}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  →
                </button>
              </div>

              {/* Text Position Controls */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Position (for selected area)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      X: {textOffsetX}px
                    </label>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={textOffsetX}
                      onChange={(e) => setTextOffsetX(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Y: {textOffsetY}px
                    </label>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={textOffsetY}
                      onChange={(e) => setTextOffsetY(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Page Preview
                </h3>
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.25))}
                    className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                    {Math.round(canvasScale * 100)}%
                  </span>
                  <button
                    onClick={() => setCanvasScale(Math.min(3.0, canvasScale + 0.25))}
                    className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setCanvasScale(1.0)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[70vh] border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="mx-auto cursor-crosshair"
                  style={{ display: 'block', minWidth: '100px', minHeight: '100px' }}
                />
              </div>
              {(() => {
                const pageSelections = selections.filter(s => s.pageNumber === selectedPage);
                const totalSelections = selections.length;
                return pageSelections.length > 0 || totalSelections > 0 ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ {pageSelections.length} selection{pageSelections.length !== 1 ? 's' : ''} on this page
                      {totalSelections > pageSelections.length && ` (${totalSelections} total across all pages)`}
                    </p>
                  {activeSelectionId && (() => {
                    const activeSel = selections.find(s => s.id === activeSelectionId);
                    return activeSel ? (
                      <>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Active: {activeSel.width.toFixed(0)}x{activeSel.height.toFixed(0)} px
                          {activeSel.mode === 'cover' ? ' (Cover mode 🎨)' : ''}
                          {activeSel.text && activeSel.mode === 'text' && ` - "${activeSel.text.substring(0, 30)}${activeSel.text.length > 30 ? '...' : ''}"`}
                        </p>
                        {activeSel.fontSize && (
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            🔍 Auto-detected font size: {activeSel.fontSize}px
                          </p>
                        )}
                      </>
                    ) : null;
                  })()}
                    {showPreview && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        👁️ Preview mode active - showing all changes in real-time
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    💡 Click and drag to select text area or image to cover on the PDF
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selection Mode
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEditModeType('text')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    editMode_type === 'text'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">✏️</div>
                  <div className="text-sm font-medium">Replace Text</div>
                </button>
                <button
                  onClick={() => setEditModeType('cover')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    editMode_type === 'cover'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-sm font-medium">Cover Only</div>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {editMode_type === 'text' ? 'Draw and add replacement text' : 'Draw to cover text/images without adding new text'}
              </p>
            </div>

            {/* Selections List */}
            {selections.length > 0 && (() => {
              const pageSelections = selections.filter(s => s.pageNumber === selectedPage);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Selections ({pageSelections.length} on page {selectedPage})
                    </h3>
                    <div className="flex gap-2">
                      {pageSelections.length > 0 && (
                        <button
                          onClick={() => {
                            setSelections(prev => prev.filter(s => s.pageNumber !== selectedPage));
                            setActiveSelectionId(null);
                          }}
                          className="text-sm text-orange-500 hover:text-orange-600"
                        >
                          Clear Page
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelections([]);
                          setActiveSelectionId(null);
                        }}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  {pageSelections.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {pageSelections.map((sel, idx) => (
                        <div
                          key={sel.id}
                          onClick={() => {
                            setActiveSelectionId(sel.id);
                            if (sel.pageNumber !== selectedPage) {
                              setSelectedPage(sel.pageNumber);
                            }
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            sel.id === activeSelectionId
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {sel.mode === 'cover' ? '🎨' : '✏️'} Selection #{idx + 1}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {sel.width.toFixed(0)}x{sel.height.toFixed(0)} px
                                {sel.mode === 'text' && sel.text && ` - "${sel.text.substring(0, 20)}..."`}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelections(prev => prev.filter(s => s.id !== sel.id));
                                if (activeSelectionId === sel.id) {
                                  const remaining = pageSelections.filter(s => s.id !== sel.id);
                                  setActiveSelectionId(remaining.length > 0 ? remaining[0].id : null);
                                }
                              }}
                              className="ml-2 text-red-500 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No selections on this page. Total: {selections.length} across all pages.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Edit Active Selection */}
            {activeSelectionId && (() => {
              const activeSel = selections.find(s => s.id === activeSelectionId);
              if (!activeSel) return null;

              return (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Edit Active Selection
                  </h3>

                  <div className="space-y-4">
                    {activeSel.mode === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Replacement Text
                        </label>
                        <textarea
                          value={activeSel.text}
                          onChange={(e) => {
                            setSelections(prev => prev.map(s =>
                              s.id === activeSelectionId ? { ...s, text: e.target.value } : s
                            ));
                          }}
                          placeholder="Enter replacement text (multiline supported)..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                      </div>
                    )}

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Background
                        </label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      {activeSel.mode === 'text' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {activeSel.mode === 'text' && (
                      <>

                        {/* Font Settings - Compact Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Size: {fontSize}px
                            </label>
                            <input
                              type="range"
                              min={8}
                              max={72}
                              value={fontSize}
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Font
                            </label>
                            <select
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times</option>
                              <option value="Courier New">Courier</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                        </div>

                        {/* Text Style - Compact */}
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={isBold}
                              onChange={(e) => setIsBold(e.target.checked)}
                              className="w-3 h-3"
                            />
                            <span className="text-xs font-bold">B</span>
                          </label>
                          <label className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={isItalic}
                              onChange={(e) => setIsItalic(e.target.checked)}
                              className="w-3 h-3"
                            />
                            <span className="text-xs italic">I</span>
                          </label>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <input
                        type="checkbox"
                        id="showPreview"
                        checked={showPreview}
                        onChange={(e) => setShowPreview(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="showPreview" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        Show live preview
                      </label>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Apply All Button */}
            {selections.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <button
                  onClick={handleReplaceText}
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Apply {selections.length} Change{selections.length > 1 ? 's' : ''}</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  All selections will be applied to the PDF
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.processing')}
          </h3>
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* Result */}
      {hasResult && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('common.success')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Text replaced successfully!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
                >
                  {t('common.download')}
                </button>
                <button
                  onClick={handleRemoveFile}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('common.processAnother')}
                </button>
              </div>

              {/* Use in other tools */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('common.useInOtherTools')}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(['merge-pdf', 'compress-pdf', 'protect-pdf', 'watermark-pdf'] as Tool[]).map(
                    (tool) => (
                      <button
                        key={tool}
                        onClick={() => handleUseInTool(tool)}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t(`tools.${tool}.name`)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
