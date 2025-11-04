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
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface TextOccurrence {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number; // Detected font size from PDF
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

  // Selection state
  const [newText, setNewText] = useState('');
  const [selectedArea, setSelectedArea] = useState<TextOccurrence | null>(null);
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

  // Helper function to build font string with styles
  const getFontString = React.useCallback((size: number, family: string) => {
    const styles = [];
    if (isItalic) styles.push('italic');
    if (isBold) styles.push('bold');
    return `${styles.join(' ')} ${size}px ${family}`.trim();
  }, [isBold, isItalic]);

  const renderPagePreview = React.useCallback(async (
    pdf: any,
    pageNumber: number,
    selection?: TextOccurrence | null
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
      const viewport = page.getViewport({ scale: 1.5 });

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

      // Draw selection highlight
      const sel = selection !== undefined ? selection : selectedArea;
      if (sel) {
        if (showPreview && newText) {
          // Preview mode: show actual changes
          context.fillStyle = backgroundColor;
          context.fillRect(sel.x, sel.y, sel.width, sel.height);

          // Draw new text with styles
          context.fillStyle = textColor;
          context.font = getFontString(fontSize, fontFamily);
          context.textBaseline = 'top';
          context.fillText(newText, sel.x + textOffsetX, sel.y + textOffsetY);

          // Draw green border to indicate preview mode
          context.strokeStyle = 'rgba(0, 255, 0, 0.9)';
          context.lineWidth = 3;
          context.strokeRect(sel.x, sel.y, sel.width, sel.height);
        } else {
          // Selection mode: show red highlight
          context.fillStyle = 'rgba(255, 0, 0, 0.3)';
          context.fillRect(sel.x, sel.y, sel.width, sel.height);

          context.strokeStyle = 'rgba(255, 0, 0, 0.9)';
          context.lineWidth = 3;
          context.strokeRect(sel.x, sel.y, sel.width, sel.height);

          // Draw resize handles (small squares at corners)
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
      }
    } catch (error: any) {
      // Ignore rendering cancellation - it's expected when user is moving selection
      if (error?.name === 'RenderingCancelledException') {
        return;
      }
      console.error('Error rendering preview:', error);
    }
  }, [selectedArea, showPreview, newText, backgroundColor, textColor, fontSize, fontFamily, textOffsetX, textOffsetY, getFontString]);

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

  // Auto-update preview when settings change OR when selection changes
  React.useEffect(() => {
    if (pdfDocument && selectedArea) {
      renderPagePreview(pdfDocument, selectedPage);
    }
  }, [pdfDocument, selectedArea, selectedPage, showPreview, newText, fontSize, fontFamily, textColor, backgroundColor, textOffsetX, textOffsetY, isBold, isItalic, renderPagePreview]);

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
    setSelectedArea(null);

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
    setSelectedArea(null);
    setNewText('');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on existing selection
    if (selectedArea && !showPreview) {
      const clickTarget = getClickTarget(x, y, selectedArea);
      if (clickTarget) {
        // Start editing existing selection
        setIsEditingSelection(true);
        setEditMode(clickTarget);
        setEditStart({ x, y });
        return;
      }
    }

    // Start new selection
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectedArea(null);
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
    if (isEditingSelection && editStart && selectedArea && editMode) {
      const dx = x - editStart.x;
      const dy = y - editStart.y;

      let updatedSelection = { ...selectedArea };

      switch (editMode) {
        case 'move':
          updatedSelection.x = selectedArea.x + dx;
          updatedSelection.y = selectedArea.y + dy;
          break;
        case 'resize-nw':
          updatedSelection.x = selectedArea.x + dx;
          updatedSelection.y = selectedArea.y + dy;
          updatedSelection.width = selectedArea.width - dx;
          updatedSelection.height = selectedArea.height - dy;
          break;
        case 'resize-ne':
          updatedSelection.y = selectedArea.y + dy;
          updatedSelection.width = selectedArea.width + dx;
          updatedSelection.height = selectedArea.height - dy;
          break;
        case 'resize-sw':
          updatedSelection.x = selectedArea.x + dx;
          updatedSelection.width = selectedArea.width - dx;
          updatedSelection.height = selectedArea.height + dy;
          break;
        case 'resize-se':
          updatedSelection.width = selectedArea.width + dx;
          updatedSelection.height = selectedArea.height + dy;
          break;
      }

      // Prevent negative dimensions
      if (updatedSelection.width < 10) updatedSelection.width = 10;
      if (updatedSelection.height < 10) updatedSelection.height = 10;

      renderPagePreview(pdfDocument, selectedPage, updatedSelection);
      setEditStart({ x, y });
      setSelectedArea(updatedSelection);
      return;
    }

    // Handle creating new selection
    if (isSelecting && selectionStart) {
      const selection: TextOccurrence = {
        text: '',
        x: Math.min(selectionStart.x, x),
        y: Math.min(selectionStart.y, y),
        width: Math.abs(x - selectionStart.x),
        height: Math.abs(y - selectionStart.y),
      };

      renderPagePreview(pdfDocument, selectedPage, selection);
      return;
    }

    // Update cursor based on hover position
    if (selectedArea && !showPreview && !isSelecting && !isEditingSelection) {
      const target = getClickTarget(x, y, selectedArea);
      if (target === 'move') {
        canvas.style.cursor = 'move';
      } else if (target === 'resize-nw' || target === 'resize-se') {
        canvas.style.cursor = 'nwse-resize';
      } else if (target === 'resize-ne' || target === 'resize-sw') {
        canvas.style.cursor = 'nesw-resize';
      } else {
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
      setSelectedArea({ ...selection });
      setNewText(extractedText);

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

      // Re-extract text from new selection area
      if (selectedArea && pdfDocument) {
        await extractTextFromSelection(selectedArea);
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

    // Create final selection
    const selection: TextOccurrence = {
      text: '',
      x: Math.min(selectionStart.x, x),
      y: Math.min(selectionStart.y, y),
      width: Math.abs(x - selectionStart.x),
      height: Math.abs(y - selectionStart.y),
    };

    // Extract text using helper function
    await extractTextFromSelection(selection);

    setIsSelecting(false);
    setSelectionStart(null);
  };

  const handlePageChange = React.useCallback((page: number) => {
    console.log('Changing to page:', page);
    setSelectedPage(page);
    setSelectedArea(null);
    setNewText('');
    setShowPreview(false);
    if (pdfDocument) {
      renderPagePreview(pdfDocument, page);
    }
  }, [pdfDocument, renderPagePreview]);


  const handleReplaceText = async () => {
    if (!file || !pdfDocument || !selectedArea) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgressMessage('Rendering page with changes...');
      setProgress(20);

      const page = await pdfDocument.getPage(selectedPage);
      const viewport = page.getViewport({ scale: 2 }); // Higher resolution for better quality

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      setProgressMessage('Rendering original page...');
      setProgress(40);

      // Render original page
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      setProgressMessage('Applying text changes...');
      setProgress(60);

      // Get selected area
      const selection = selectedArea;

      // Scale coordinates to match high-res viewport
      const scale = viewport.scale;
      const scaledSelection = {
        x: selection.x * (scale / 1.5),
        y: selection.y * (scale / 1.5),
        width: selection.width * (scale / 1.5),
        height: selection.height * (scale / 1.5),
      };

      // Draw background rectangle to cover old text
      context.fillStyle = backgroundColor;
      context.fillRect(scaledSelection.x, scaledSelection.y, scaledSelection.width, scaledSelection.height);

      // Draw new text with offsets and styles
      context.fillStyle = textColor;
      context.font = getFontString(fontSize * scale, fontFamily);
      context.textBaseline = 'top';
      const textX = scaledSelection.x + (textOffsetX * scale / 1.5);
      const textY = scaledSelection.y + (textOffsetY * scale / 1.5);
      context.fillText(newText, textX, textY);

      setProgressMessage('Converting to image...');
      setProgress(70);

      // Convert canvas to image
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const imageBytes = Uint8Array.from(
        atob(imageDataUrl.split(',')[1]),
        (c) => c.charCodeAt(0)
      );

      setProgressMessage('Building final PDF...');
      setProgress(80);

      // Load original PDF with pdf-lib
      const arrayBuffer = await file.file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Embed the modified page image
      const image = await pdfDoc.embedJpg(imageBytes);
      const modifiedPage = pdfDoc.getPage(selectedPage - 1);
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

            {/* Page Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Page to Edit
              </label>
              <div className="flex items-center gap-2">
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
            </div>

            {/* Canvas Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Page Preview
              </h3>
              <div className="overflow-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="mx-auto cursor-crosshair"
                  style={{ display: 'block', minWidth: '100px', minHeight: '100px' }}
                />
              </div>
              {selectedArea ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Selected area: {selectedArea.width.toFixed(0)}x{selectedArea.height.toFixed(0)} px
                    {selectedArea.text && ` - "${selectedArea.text.substring(0, 30)}${selectedArea.text.length > 30 ? '...' : ''}"`}
                  </p>
                  {selectedArea.fontSize && (
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      🔍 Auto-detected font size: {selectedArea.fontSize}px
                    </p>
                  )}
                  {showPreview && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      👁️ Preview mode active - adjust settings to see changes in real-time
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  💡 Click and drag to select text area on the PDF
                </p>
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-4">
            {/* Edit Text */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Replace Text
              </h3>

              <div className="space-y-4">
                {selectedArea && (
                  <>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Text
                      </label>
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Enter replacement text..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Background
                        </label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Size: {fontSize}px
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Family
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <input
                          type="checkbox"
                          id="isBold"
                          checked={isBold}
                          onChange={(e) => setIsBold(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="isBold" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                          Bold
                        </label>
                      </div>
                      <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <input
                          type="checkbox"
                          id="isItalic"
                          checked={isItalic}
                          onChange={(e) => setIsItalic(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="isItalic" className="text-sm italic text-gray-700 dark:text-gray-300 cursor-pointer">
                          Italic
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Offset X: {textOffsetX}px
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Offset Y: {textOffsetY}px
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

                    <button
                      onClick={handleReplaceText}
                      disabled={!newText.trim() || isProcessing}
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Replace Text
                    </button>
                  </>
                )}
                {!selectedArea && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    Select an area on the PDF to start editing
                  </p>
                )}
              </div>
            </div>
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
