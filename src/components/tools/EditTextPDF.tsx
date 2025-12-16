import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
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
import { CheckCircle2, Type, PaintBucket, Move, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

// Configure PDF.js worker
// Worker configured in pdfService.ts (globally)

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

  // Selection state
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
  const [resultSaved, setResultSaved] = useState(false);

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
  const [editMode_type, setEditModeType] = useState<'replace' | 'cover'>('replace');
  const [canvasScale, setCanvasScale] = useState(1.5);

  // Helper function to build font string
  const getFontString = React.useCallback((size: number, family: string) => {
    const styles = [];
    if (isItalic) styles.push('italic');
    if (isBold) styles.push('bold');
    return `${styles.join(' ')} ${size}px ${family}`.trim();
  }, [isBold, isItalic]);

  // Helper function to draw multiline text
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
    currentMode: 'replace' | 'cover' | 'move' | null = null
  ) => {
    if (!pdf || !canvasRef.current) return;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) { /* ignore */ }
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

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      const pageSelections = selections.filter(s => s.pageNumber === pageNumber);
      const allSelections = tempSelection ? [...pageSelections, tempSelection] : pageSelections;

      for (const sel of allSelections) {
        const isActive = sel.id === activeSelectionId || (tempSelection && sel.id === tempSelection.id);

        if (showPreview) {
          context.fillStyle = backgroundColor;
          context.fillRect(sel.x, sel.y, sel.width, sel.height);

          if (sel.mode === 'replace' && sel.text) {
            context.fillStyle = textColor;
            const previewFontSize = fontSize * canvasScale;
            context.font = getFontString(previewFontSize, fontFamily);
            context.textBaseline = 'top';
            const lineHeight = previewFontSize * 1.2;
            const maxWidth = sel.width - (textOffsetX * canvasScale);

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
          context.strokeStyle = isActive ? 'rgba(0, 255, 0, 0.9)' : 'rgba(0, 200, 0, 0.5)';
          context.lineWidth = isActive ? 3 : 2;
          context.strokeRect(sel.x, sel.y, sel.width, sel.height);
        } else {
          // Selection mode
          context.fillStyle = isActive ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 100, 100, 0.2)';
          context.fillRect(sel.x, sel.y, sel.width, sel.height);
          context.strokeStyle = isActive ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 100, 100, 0.6)';
          context.lineWidth = isActive ? 3 : 2;
          context.strokeRect(sel.x, sel.y, sel.width, sel.height);

          if (currentMode === 'move' && isActive && tempSelection && tempSelection.id === sel.id && sel.originalX !== undefined) {
            context.strokeStyle = 'rgba(0, 0, 255, 0.6)';
            context.lineWidth = 2;
            context.setLineDash([5, 5]);
            context.strokeRect(sel.originalX, sel.originalY!, sel.originalWidth!, sel.originalHeight!);
            context.setLineDash([]);
          }

          if (isActive) {
            const handleSize = 10;
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.strokeStyle = 'rgba(255, 0, 0, 1)';
            context.lineWidth = 2;
            // Corners
            context.fillRect(sel.x - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);
            context.fillRect(sel.x + sel.width - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x + sel.width - handleSize / 2, sel.y - handleSize / 2, handleSize, handleSize);
            context.fillRect(sel.x - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
            context.fillRect(sel.x + sel.width - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
            context.strokeRect(sel.x + sel.width - handleSize / 2, sel.y + sel.height - handleSize / 2, handleSize, handleSize);
          }
          if (sel.mode === 'cover') {
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.font = 'bold 12px Arial';
            context.fillText('🎨', sel.x + 5, sel.y + 5);
          }
        }
      }
    } catch (error: any) {
      if (error?.name === 'RenderingCancelledException') return;
      console.error('Error rendering preview:', error);
    }
  }, [selections, activeSelectionId, showPreview, backgroundColor, textColor, fontSize, fontFamily, textOffsetX, textOffsetY, textAlign, canvasScale, getFontString, editMode_type]);

  const loadPDF = React.useCallback(async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setSelectedPage(1);
      setTimeout(() => renderPagePreview(pdf, 1), 100);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF');
    }
  }, [renderPagePreview]);

  // Auto-load shared file
  useEffect(() => {
    if (sharedFile && !file && !result) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
    return () => {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch (e) { };
        renderTaskRef.current = null;
      }
    };
  }, [sharedFile, file, result, clearSharedFile, loadPDF]);

  // Auto-update preview
  useEffect(() => {
    if (pdfDocument && selections.length > 0) {
      renderPagePreview(pdfDocument, selectedPage);
    }
  }, [pdfDocument, selections, selectedPage, showPreview, fontSize, fontFamily, textColor, backgroundColor, textOffsetX, textOffsetY, isBold, isItalic, textAlign, renderPagePreview]);

  // Auto-save result
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
      setSharedFile(result, fileName, 'edit-text-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    const uploadedFile: UploadedFile = {
      id: `${Date.now()}`,
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      status: 'completed',
    };
    setFile(uploadedFile);
    setResult(null);
    setResultSaved(false);
    setSelections([]);
    setActiveSelectionId(null);
    await loadPDF(selectedFile);
  };

  const getClickTarget = (x: number, y: number, selection: TextOccurrence): 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null => {
    if (!selection) return null;
    const handleSize = 10;
    const tolerance = handleSize / 2;
    if (Math.abs(x - selection.x) < tolerance && Math.abs(y - selection.y) < tolerance) return 'resize-nw';
    if (Math.abs(x - (selection.x + selection.width)) < tolerance && Math.abs(y - selection.y) < tolerance) return 'resize-ne';
    if (Math.abs(x - selection.x) < tolerance && Math.abs(y - (selection.y + selection.height)) < tolerance) return 'resize-sw';
    if (Math.abs(x - (selection.x + selection.width)) < tolerance && Math.abs(y - (selection.y + selection.height)) < tolerance) return 'resize-se';
    if (x >= selection.x && x <= selection.x + selection.width && y >= selection.y && y <= selection.y + selection.height) return 'move';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (!showPreview) {
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
      if (updatedSelection.width < 10) updatedSelection.width = 10;
      if (updatedSelection.height < 10) updatedSelection.height = 10;
      setSelections(prev => prev.map(s => s.id === activeSelectionId ? updatedSelection : s));
      setEditStart({ x, y });
      return;
    }

    if (isSelecting && selectionStart) {
      const tempX = Math.min(selectionStart.x, x);
      const tempY = Math.min(selectionStart.y, y);
      const tempWidth = Math.abs(x - selectionStart.x);
      const tempHeight = Math.abs(y - selectionStart.y);
      const tempSelection: TextOccurrence = {
        id: 'temp', text: '', x: tempX, y: tempY, width: tempWidth,
        height: tempHeight, pageNumber: selectedPage, mode: editMode_type, textAlign: textAlign
      };
      renderPagePreview(pdfDocument, selectedPage, tempSelection, editMode_type);
      return;
    }

    // Cursor logic
    if (!showPreview && !isSelecting && !isEditingSelection) {
      let cursorSet = false;
      if (activeSelectionId) {
        const activeSelection = selections.find(s => s.id === activeSelectionId);
        if (activeSelection) {
          const target = getClickTarget(x, y, activeSelection);
          if (target) {
            if (target === 'move') canvas.style.cursor = 'move';
            else if (target === 'resize-nw' || target === 'resize-se') canvas.style.cursor = 'nwse-resize';
            else if (target === 'resize-ne' || target === 'resize-sw') canvas.style.cursor = 'nesw-resize';
            cursorSet = true;
          }
        }
      }
      if (!cursorSet) {
        for (const selection of selections) {
          if (getClickTarget(x, y, selection)) {
            canvas.style.cursor = 'pointer';
            cursorSet = true;
            break;
          }
        }
      }
      if (!cursorSet) canvas.style.cursor = 'crosshair';
    }
  };

  const extractTextFromSelection = async (selection: TextOccurrence) => {
    if (!pdfDocument) return;
    try {
      const page = await pdfDocument.getPage(selectedPage);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: canvasScale });
      let extractedText = '';
      let detectedFontSize = 0;
      let fontSizeCount = 0;

      const getIntersectionPercentage = (itemX: number, itemY: number, itemW: number, itemH: number, selX: number, selY: number, selW: number, selH: number) => {
        const x1 = Math.max(itemX, selX);
        const y1 = Math.max(itemY, selY);
        const x2 = Math.min(itemX + itemW, selX + selW);
        const y2 = Math.min(itemY + itemH, selY + selH);
        if (x2 > x1 && y2 > y1) return ((x2 - x1) * (y2 - y1)) / (itemW * itemH);
        return 0;
      };

      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const transform = item.transform;
          const itemFontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
          const height = item.height || itemFontSize;
          const itemX = transform[4];
          const itemY = viewport.height - transform[5] - height;
          const width = item.width || (item.str.length * itemFontSize * 0.6);
          if (getIntersectionPercentage(itemX, itemY, width, height, selection.x, selection.y, selection.width, selection.height) > 0.5) {
            extractedText += item.str + ' ';
            detectedFontSize += itemFontSize;
            fontSizeCount++;
          }
        }
      }
      if (fontSizeCount > 0) {
        const avgFontSize = Math.round(detectedFontSize / fontSizeCount);
        selection.fontSize = avgFontSize;
        setFontSize(Math.max(8, Math.min(72, avgFontSize)));
      }
      selection.text = extractedText.trim();
      setSelections(prev => prev.map(s => s.id === selection.id ? { ...selection } : s));
    } catch (error) { console.error('Error extracting text:', error); }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isEditingSelection) {
      setIsEditingSelection(false);
      setEditMode(null);
      setEditStart(null);
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
    const selX = Math.min(selectionStart.x, x);
    const selY = Math.min(selectionStart.y, y);
    const selWidth = Math.abs(x - selectionStart.x);
    const selHeight = Math.abs(y - selectionStart.y);

    const newSelection: TextOccurrence = {
      id: `sel-${Date.now()}-${Math.random()}`,
      text: '', x: selX, y: selY, width: selWidth, height: selHeight,
      pageNumber: selectedPage, mode: editMode_type, textAlign: textAlign
    };

    if (newSelection.mode === 'replace') await extractTextFromSelection(newSelection);
    setSelections(prev => [...prev, newSelection]);
    setActiveSelectionId(newSelection.id);
    setIsSelecting(false);
    setSelectionStart(null);
  };

  const handleReplaceText = async () => {
    if (!file || selections.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const result = await pdfService.editTextInPDFVector(
        file.file,
        { selections, backgroundColor, textColor, fontSize, fontFamily: fontFamily as any, isBold, isItalic, textOffsetX, textOffsetY, canvasScale },
        (progress, message) => { setProgress(progress); setProgressMessage(message); }
      );
      if (result.success && result.data) {
        setResult(result.data);
      } else {
        throw result.error || new Error('Failed to edit PDF');
      }
    } catch (error: any) {
      console.error('Error replacing text:', error);
      if (error?.message?.includes('cannot encode') || error?.message?.includes('WinAnsi')) {
        alert('⚠️ Error: Selected font does not support non-Latin characters.');
      } else {
        alert(t('editText.replaceError') || 'Failed to replace text');
      }
    } finally { setIsProcessing(false); }
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

  const handleReset = () => {
    setFile(null); setResult(null); setResultSaved(false); setSelections([]); setActiveSelectionId(null);
  };

  const renderContent = () => {
    if (!file) return null;
    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.success')}</h2>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">{t('common.download')}</Button>
            <Button variant="outline" onClick={handleReset} size="lg">{t('common.processAnother')}</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Preview Toolbar */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              const newPage = Math.max(1, selectedPage - 1);
              setSelectedPage(newPage);
              renderPagePreview(pdfDocument, newPage);
            }} disabled={selectedPage <= 1}>Previous</Button>
            <span className="text-sm">Page {selectedPage} / {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => {
              const newPage = Math.min(totalPages, selectedPage + 1);
              setSelectedPage(newPage);
              renderPagePreview(pdfDocument, newPage);
            }} disabled={selectedPage >= totalPages}>Next</Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Preview</Label>
            <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} className="toggle" />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 rounded-xl relative border border-gray-200 dark:border-gray-700 flex justify-center p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="shadow-lg max-w-full"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          />
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" /> {t('editText.settings')}
        </h3>

        {/* Mode Selection */}
        <div className="space-y-3">
          <Label>Edit Mode</Label>
          <Select value={editMode_type} onValueChange={(v: any) => setEditModeType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="replace">Replace Text</SelectItem>
              <SelectItem value="cover">Redact / Cover</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Input (Only for Replace mode) */}
        {editMode_type === 'replace' && (
          <div className="space-y-3">
            <Label>Replacement Text</Label>
            <textarea
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              rows={3}
              placeholder="Enter text..."
              value={activeSelectionId ? selections.find(s => s.id === activeSelectionId)?.text || '' : ''}
              onChange={(e) => {
                if (activeSelectionId) {
                  setSelections(prev => prev.map(s => s.id === activeSelectionId ? { ...s, text: e.target.value } : s));
                }
              }}
            />
          </div>
        )}

        {/* Styling */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={isBold ? "default" : "outline"} size="icon" onClick={() => setIsBold(!isBold)}><Bold className="w-4 h-4" /></Button>
          <Button variant={isItalic ? "default" : "outline"} size="icon" onClick={() => setIsItalic(!isItalic)}><Italic className="w-4 h-4" /></Button>
          <div className="bg-gray-200 w-px mx-2"></div>
          <Button variant={textAlign === 'left' ? "default" : "outline"} size="icon" onClick={() => setTextAlign('left')}><AlignLeft className="w-4 h-4" /></Button>
          <Button variant={textAlign === 'center' ? "default" : "outline"} size="icon" onClick={() => setTextAlign('center')}><AlignCenter className="w-4 h-4" /></Button>
          <Button variant={textAlign === 'right' ? "default" : "outline"} size="icon" onClick={() => setTextAlign('right')}><AlignRight className="w-4 h-4" /></Button>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2">
            <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-10 p-1" />
            <Input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-12 h-10 p-1" />
            <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1" />
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    return (
      <Button onClick={handleReplaceText} disabled={isProcessing || !file || selections.length === 0} className="w-full py-6 text-lg font-bold">
        {isProcessing ? t('common.processing') : 'Apply Changes'}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.edit-text-pdf.name')}
      description={t('tools.edit-text-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFilesSelected}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      settings={!result ? renderSettings() : null}
      actions={!result ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
