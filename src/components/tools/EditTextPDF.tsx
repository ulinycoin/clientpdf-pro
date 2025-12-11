import React, { useState, useRef } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import pdfService from '@/services/pdfService';
import * as pdfjsLib from 'pdfjs-dist';
import type { UploadedFile, TextOccurrence } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Configure PDF.js worker
// Worker configured in pdfService.ts



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
  const [editMode_type, setEditModeType] = useState<'replace' | 'cover'>('replace'); // Replace text or cover only
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
    tempSelection?: TextOccurrence | null,
    currentMode: 'replace' | 'cover' | 'move' | null = null // New parameter
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
        const isActive = sel.id === activeSelectionId || (tempSelection && sel.id === tempSelection.id);

        if (showPreview) {
          // Preview mode: show actual changes
          context.fillStyle = backgroundColor;
          context.fillRect(sel.x, sel.y, sel.width, sel.height);

          // Draw new text with styles (if not in cover-only mode)
          if (sel.mode === 'replace' && sel.text) {
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

          // If mode is 'move' and this is an active temporary selection, draw original position dashed
          if (currentMode === 'move' && isActive && tempSelection && tempSelection.id === sel.id && sel.originalX !== undefined) {
            context.strokeStyle = 'rgba(0, 0, 255, 0.6)'; // Blue dashed for original move
            context.lineWidth = 2;
            context.setLineDash([5, 5]); // Dashed line
            context.strokeRect(sel.originalX, sel.originalY!, sel.originalWidth!, sel.originalHeight!);
            context.setLineDash([]); // Reset line dash
          }

          // Draw resize handles only for active selection
          if (isActive) {
            const handleSize = 10;
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.strokeStyle = 'rgba(255, 0, 0, 1)';
            context.lineWidth = 2;

            // Top-left
            context.fillRect(sel.x - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);

            // Top-right
            context.fillRect(sel.x + sel.width - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x + sel.width - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);

            // Bottom-left
            context.fillRect(sel.x - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);

            // Bottom-right
            context.fillRect(sel.x + sel.width - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x + sel.width - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
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
  }, [selections, activeSelectionId, showPreview, backgroundColor, textColor, fontSize, fontFamily, textOffsetX, textOffsetY, textAlign, canvasScale, getFontString, editMode_type]);

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
      const tempX = Math.min(selectionStart.x, x);
      const tempY = Math.min(selectionStart.y, y);
      const tempWidth = Math.abs(x - selectionStart.x);
      const tempHeight = Math.abs(y - selectionStart.y);

      const tempSelection: TextOccurrence = {
        id: 'temp',
        text: '',
        x: tempX,
        y: tempY,
        width: tempWidth,
        height: tempHeight,
        pageNumber: selectedPage,
        mode: editMode_type,
        textAlign: textAlign,
      };

      renderPagePreview(pdfDocument, selectedPage, tempSelection, editMode_type);
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
      const viewport = page.getViewport({ scale: canvasScale });

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

      let debugCount = 0;

      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const transform = item.transform;
          const itemFontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
          const height = item.height || itemFontSize;
          const itemX = transform[4];
          const itemY = viewport.height - transform[5] - height;
          const width = item.width || (item.str.length * itemFontSize * 0.6);

          // Check if text item intersects with selection (at least 50% overlap)
          const intersectionPercent = getIntersectionPercentage(
            itemX, itemY, width, height,
            selection.x, selection.y, selection.width, selection.height
          );

          if (intersectionPercent > 0.5) {
            extractedText += item.str + ' ';
            detectedFontSize += itemFontSize;
            fontSizeCount++;
          }
        }
      }

      // Calculate average font size
      if (fontSizeCount > 0) {
        const avgFontSize = Math.round(detectedFontSize / fontSizeCount);
        selection.fontSize = avgFontSize;
        setFontSize(Math.max(8, Math.min(72, avgFontSize)));
      }

      selection.text = extractedText.trim(); // Trim extra space

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

      // Re-extract text from new selection area (only for replace mode)
      if (activeSelectionId && pdfDocument) {
        const activeSelection = selections.find(s => s.id === activeSelectionId);
        if (activeSelection && activeSelection.mode === 'replace') {
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
    const selX = Math.min(selectionStart.x, x);
    const selY = Math.min(selectionStart.y, y);
    const selWidth = Math.abs(x - selectionStart.x);
    const selHeight = Math.abs(y - selectionStart.y);

    const newSelection: TextOccurrence = {
      id: `sel-${Date.now()}-${Math.random()}`,
      text: '',
      x: selX,
      y: selY,
      width: selWidth,
      height: selHeight,
      pageNumber: selectedPage,
      mode: editMode_type,
      textAlign: textAlign,
    };

    // Extract text using helper function (only for replace mode)
    if (newSelection.mode === 'replace') {
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
    if (!file || selections.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await pdfService.editTextInPDFVector(
        file.file,
        {
          selections,
          backgroundColor,
          textColor,
          fontSize,
          fontFamily: fontFamily as any, // Cast because the type in service is more specific
          isBold,
          isItalic,
          textOffsetX,
          textOffsetY,
          canvasScale
        },
        (progress, message) => {
          setProgress(progress);
          setProgressMessage(message);
        }
      );

      if (result.success && result.data) {
        setResult(result.data);
        const fileName = file.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
        setSharedFile(result.data, fileName, 'edit-text-pdf');
      } else {
        throw result.error || new Error('Failed to edit PDF');
      }
    } catch (error: any) {
      console.error('Error replacing text:', error);

      // Check if error is due to encoding (non-Latin characters)
      if (error?.message?.includes('cannot encode') || error?.message?.includes('WinAnsi')) {
        alert('⚠️ Error: The selected font does not support non-Latin characters (Cyrillic, Asian, etc.).\n\n' +
          'Current limitation: Only Latin characters (A-Z, a-z, 0-9) are supported.\n\n' +
          'Please use only Latin text or try a different tool.');
      } else {
        alert(t('editText.replaceError') || 'Failed to replace text');
      }
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
    <div className="edit-text-pdf space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('tools.edit-text-pdf.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.edit-text-pdf.description')}
        </p>
      </div>

      {/* File Upload */}
      {!hasFile && !hasResult && (
        <Card>
          <CardContent className="p-6">
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              maxFiles={1}
              title={t('common.uploadFile')}
              description={t('common.uploadDescription')}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      {hasFile && !hasResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* File Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common.page')} {selectedPage} / {totalPages}
                  </p>
                </div>
                <Button
                  onClick={handleRemoveFile}
                  variant="destructive"
                  size="sm"
                >
                  {t('common.remove')}
                </Button>
              </div>
            </Card>

            {/* Page Selector with Text Position Controls */}
            <Card className="p-4">
              <Label className="mb-2">
                {t('editText.selectPageToEdit')}
              </Label>
              <div className="flex items-center gap-2 mb-3">
                <Button
                  onClick={() => handlePageChange(Math.max(1, selectedPage - 1))}
                  disabled={selectedPage === 1}
                  variant="outline"
                  size="sm"
                >
                  ←
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={selectedPage}
                  onChange={(e) => handlePageChange(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center"
                />
                <Button
                  onClick={() => handlePageChange(Math.min(totalPages, selectedPage + 1))}
                  disabled={selectedPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  →
                </Button>
              </div>

              {/* Text Position Controls */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Label className="block text-xs mb-2">
                  {t('editText.textPosition')}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {t('editText.xLabel')} {textOffsetX}px
                    </Label>
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
                    <Label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {t('editText.yLabel')} {textOffsetY}px
                    </Label>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={textOffsetY}
                      onChange={(e) => setTextOffsetX(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Canvas Preview */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('editText.pagePreview')}
                </h3>
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.25))}
                    variant="outline"
                    size="sm"
                    title="Zoom Out"
                  >
                    −
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                    {Math.round(canvasScale * 100)}%
                  </span>
                  <Button
                    onClick={() => setCanvasScale(Math.min(3.0, canvasScale + 0.25))}
                    variant="outline"
                    size="sm"
                    title="Zoom In"
                  >
                    +
                  </Button>
                  <Button
                    onClick={() => setCanvasScale(1.0)}
                    variant="outline"
                    size="sm"
                    title="Reset Zoom"
                  >
                    100%
                  </Button>
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
                      ✓ {t('editText.selectionsOnPage').replace('{count}', pageSelections.length.toString()).replace('{page}', selectedPage.toString())}
                    </p>
                    {activeSelectionId && (() => {
                      const activeSel = selections.find(s => s.id === activeSelectionId);
                      return activeSel ? (
                        <>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Active: {activeSel.width.toFixed(0)}x{activeSel.height.toFixed(0)} px
                            {activeSel.mode === 'cover' ? ` (${t('editText.coverMode')})` : ''}
                            {activeSel.text && activeSel.mode === 'replace' && ` - "${activeSel.text.substring(0, 30)}${activeSel.text.length > 30 ? '...' : ''}"`}
                          </p>
                          {activeSel.fontSize && (
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              {t('editText.autoDetectedFontSize').replace('{size}', activeSel.fontSize.toString())}
                            </p>
                          )}
                        </>
                      ) : null;
                    })()}
                    {showPreview && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {t('editText.previewModeActive')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t('editText.clickAndDrag')}
                  </p>
                );
              })()}
            </Card>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-4">
            {/* Mode Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('editText.selectionMode')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setEditModeType('replace')}
                  variant="outline"
                  className={`px-4 py-3 h-auto flex-col ${editMode_type === 'replace'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:border-blue-300'
                    }`}
                >
                  <div className="text-2xl mb-1">✏️</div>
                  <div className="text-sm font-medium">{t('editText.modeReplace')}</div>
                </Button>
                <Button
                  onClick={() => setEditModeType('cover')}
                  variant="outline"
                  className={`px-4 py-3 h-auto flex-col ${editMode_type === 'cover'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'hover:border-purple-300'
                    }`}
                >
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-sm font-medium">{t('editText.modeCover')}</div>
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {editMode_type === 'replace' ? t('editText.modeReplaceDesc') : t('editText.modeCoverDesc')}
              </p>
            </Card>

            {/* Selections List */}
            {selections.length > 0 && (() => {
              const pageSelections = selections.filter(s => s.pageNumber === selectedPage);
              return (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('editText.selectionsOnPage').replace('{count}', pageSelections.length.toString()).replace('{page}', selectedPage.toString())}
                    </h3>
                    <div className="flex gap-2">
                      {pageSelections.length > 0 && (
                        <Button
                          onClick={() => {
                            setSelections(prev => prev.filter(s => s.pageNumber !== selectedPage));
                            setActiveSelectionId(null);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-orange-500 hover:text-orange-600"
                        >
                          {t('editText.clearPage')}
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelections([]);
                          setActiveSelectionId(null);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                      >
                        {t('common.clearAll')}
                      </Button>
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
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${sel.id === activeSelectionId
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {sel.mode === 'cover' ? `🎨 ${t('editText.cover')}` : `✏️ ${t('editText.replace')}`} #{idx + 1}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {sel.width.toFixed(0)}x{sel.height.toFixed(0)} px
                                {sel.mode === 'replace' && sel.text && ` - "${sel.text.substring(0, 20)}..."`}
                              </div>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelections(prev => prev.filter(s => s.id !== sel.id));
                                if (activeSelectionId === sel.id) {
                                  const remaining = pageSelections.filter(s => s.id !== sel.id);
                                  setActiveSelectionId(remaining.length > 0 ? remaining[0].id : null);
                                }
                              }}
                              variant="ghost"
                              size="sm"
                              className="ml-2 text-red-500 hover:text-red-600 h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('editText.noSelections').replace('{total}', selections.length.toString())}
                    </p>
                  )}
                </Card>
              );
            })()}

            {/* Edit Active Selection */}
            {activeSelectionId && (() => {
              const activeSel = selections.find(s => s.id === activeSelectionId);
              if (!activeSel) return null;

              return (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('editText.editActiveSelection')}
                  </h3>

                  <div className="space-y-4">
                    {activeSel.mode === 'replace' && (
                      <>
                        <div>
                          <Label className="mb-2">
                            {t('editText.replacementText')}
                          </Label>
                          <textarea
                            value={activeSel.text}
                            onChange={(e) => {
                              setSelections(prev => prev.map(s =>
                                s.id === activeSelectionId ? { ...s, text: e.target.value } : s
                              ));
                            }}
                            placeholder={t('editText.enterReplacementText')}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {t('editText.latinCharactersOnly')}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="block text-xs mb-1">
                          {t('editText.backgroundColor')}
                        </Label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      {activeSel.mode === 'replace' && (
                        <div>
                          <Label className="block text-xs mb-1">
                            {t('editText.textColor')}
                          </Label>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {activeSel.mode === 'replace' && (
                      <>

                        {/* Font Settings - Compact Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="block text-xs mb-1">
                              {t('editText.fontSize')}: {fontSize}px
                            </Label>
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
                            <Label className="block text-xs mb-1">
                              {t('editText.font')}
                            </Label>
                            <Select value={fontFamily} onValueChange={setFontFamily}>
                              <SelectTrigger className="w-full h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Times New Roman">Times</SelectItem>
                                <SelectItem value="Courier New">Courier</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                              </SelectContent>
                            </Select>
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

                        {/* Text Alignment */}
                        <div>
                          <Label className="block text-xs mb-2">
                            {t('editText.textAlignment')}
                          </Label>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setTextAlign('left');
                                setSelections(prev => prev.map(s =>
                                  s.id === activeSelectionId ? { ...s, textAlign: 'left' } : s
                                ));
                              }}
                              variant="outline"
                              size="sm"
                              className={`flex-1 ${activeSel.textAlign === 'left' || !activeSel.textAlign ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''}`}
                            >
                              ←
                            </Button>
                            <Button
                              onClick={() => {
                                setTextAlign('center');
                                setSelections(prev => prev.map(s =>
                                  s.id === activeSelectionId ? { ...s, textAlign: 'center' } : s
                                ));
                              }}
                              variant="outline"
                              size="sm"
                              className={`flex-1 ${activeSel.textAlign === 'center' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''}`}
                            >
                              ═
                            </Button>
                            <Button
                              onClick={() => {
                                setTextAlign('right');
                                setSelections(prev => prev.map(s =>
                                  s.id === activeSelectionId ? { ...s, textAlign: 'right' } : s
                                ));
                              }}
                              variant="outline"
                              size="sm"
                              className={`flex-1 ${activeSel.textAlign === 'right' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''}`}
                            >
                              →
                            </Button>
                          </div>
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
                      <Label htmlFor="showPreview" className="text-sm font-medium cursor-pointer">
                        {t('editText.showLivePreview')}
                      </Label>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Apply All Button */}
            {selections.length > 0 && (
              <Card className="p-6">
                <Button
                  onClick={handleReplaceText}
                  disabled={isProcessing}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <span>{t('editText.applyChanges').replace('{count}', selections.length.toString())}</span>
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {t('editText.applyAllHint')}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <Card className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('common.processing')}
          </h3>
          <ProgressBar progress={progress} message={progressMessage} />
        </Card>
      )}

      {/* Result */}
      {hasResult && (
        <div className="space-y-6">
          <Card className="p-8">
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
                {t('editText.successMessage')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleDownload}
                  className="bg-ocean-500 hover:bg-ocean-600"
                >
                  {t('common.download')}
                </Button>
                <Button
                  onClick={handleRemoveFile}
                  variant="secondary"
                >
                  {t('common.processAnother')}
                </Button>
              </div>

              {/* Use in other tools */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('editText.useInOtherTools')}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(['merge-pdf', 'compress-pdf', 'protect-pdf', 'watermark-pdf'] as Tool[]).map(
                    (tool) => (
                      <Button
                        key={tool}
                        onClick={() => handleUseInTool(tool)}
                        variant="outline"
                        size="sm"
                      >
                        {t(`tools.${tool}.name`)}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
