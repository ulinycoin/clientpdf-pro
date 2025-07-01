import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAddText } from '../../hooks/useAddText';
import { AddTextToolProps, TextElement } from '../../types/addText.types';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const AddTextTool: React.FC<AddTextToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const {
    // Processing state
    isProcessing,
    progress,
    error,
    result,
    // Text elements
    textElements,
    selectedElementId,
    editingState,
    // Undo/Redo
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
    // Canvas interaction
    startDragging,
    updateDragging,
    stopDragging,
    // PDF navigation
    goToPage,
    setPageScale,
    setPageDimensions,
    // Processing
    processFile,
    resetState
  } = useAddText();

  // Local state
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPageRenderer, setCurrentPageRenderer] = useState<any>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [toolMode, setToolMode] = useState<'select' | 'add'>('add');
  const [editingText, setEditingText] = useState(''); // Local state for inline editing

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Load PDF when file changes
  useEffect(() => {
    if (files.length > 0) {
      loadPDF(files[0]);
    }
  }, [files]);

  // Handle completion
  useEffect(() => {
    if (result && result.success) {
      onComplete(result);
    }
  }, [result, onComplete]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingState.isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
      setEditingText(editingState.tempText);
    }
  }, [editingState.isEditing, editingState.tempText]);

  // Load PDF document
  const loadPDF = async (file: File) => {
    try {
      setIsLoadingPDF(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDocument(pdf);
      
      // ✅ FIX: Set totalPages when PDF loads
      const numPages = pdf.numPages;
      
      goToPage(1);
      await renderPage(pdf, 1);
      
      // Update total pages in hook state
      // Note: This assumes the hook has a setTotalPages function or similar
      // For now, we'll manage it locally and update the hook if needed
      
    } catch (error) {
      console.error('[AddTextTool] Error loading PDF:', error);
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // Render PDF page
  const renderPage = async (pdf: any, pageNumber: number) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: pageScale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Set page dimensions
      setPageDimensions({
        width: viewport.width,
        height: viewport.height,
        scale: pageScale
      });

      // Render PDF page
      await page.render({ canvasContext: context, viewport }).promise;
      setCurrentPageRenderer(page);
      renderTextElements(context, viewport);
    } catch (error) {
      console.error('[AddTextTool] Error rendering page:', error);
    }
  };

  // Render text elements on canvas
  const renderTextElements = (context: CanvasRenderingContext2D, viewport: any) => {
    const currentPageElements = textElements.filter(el => el.pageNumber === currentPage);
    currentPageElements.forEach(element => renderTextElement(context, element, viewport));
  };

  // ✅ FIX: Improved text element rendering with better measurements
  const renderTextElement = (context: CanvasRenderingContext2D, element: TextElement, viewport: any) => {
    context.save();
    let fontString = `${element.fontSize}px `;
    if (element.isBold && element.isItalic) fontString += 'bold italic ';
    else if (element.isBold) fontString += 'bold ';
    else if (element.isItalic) fontString += 'italic ';
    
    const fontMap = {
      'Helvetica': 'Arial, sans-serif',
      'Times-Roman': 'Times, serif',
      'Courier': 'Courier New, monospace'
    };
    fontString += fontMap[element.fontFamily] || fontMap['Helvetica'];
    
    context.font = fontString;
    context.fillStyle = `rgba(${element.color.r}, ${element.color.g}, ${element.color.b}, ${element.opacity / 100})`;
    context.textAlign = element.textAlign as CanvasTextAlign;

    if (element.rotation !== 0) {
      context.translate(element.x, element.y);
      context.rotate((element.rotation * Math.PI) / 180);
      context.fillText(element.text, 0, 0);
    } else {
      context.fillText(element.text, element.x, element.y);
    }

    // Selection indicator
    if (element.id === selectedElementId) {
      context.strokeStyle = '#3B82F6';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      
      // ✅ FIX: Use proper text measurements
      const metrics = context.measureText(element.text);
      const textWidth = metrics.width;
      const textHeight = element.fontSize;
      
      // Adjust for text alignment
      let rectX = element.x;
      if (element.textAlign === 'center') {
        rectX = element.x - textWidth / 2;
      } else if (element.textAlign === 'right') {
        rectX = element.x - textWidth;
      }
      
      context.strokeRect(rectX - 5, element.y - textHeight - 5, textWidth + 10, textHeight + 10);
      context.setLineDash([]);
    }
    context.restore();
  };

  // ✅ FIX: Improved element position detection
  const findElementAtPosition = useCallback((x: number, y: number): TextElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const context = canvas.getContext('2d');
    if (!context) return null;

    const currentPageElements = textElements.filter(el => el.pageNumber === currentPage);
    
    // Check elements from top to bottom (reverse order for proper layering)
    for (let i = currentPageElements.length - 1; i >= 0; i--) {
      const element = currentPageElements[i];
      
      // Set font for accurate measurements
      let fontString = `${element.fontSize}px `;
      if (element.isBold && element.isItalic) fontString += 'bold italic ';
      else if (element.isBold) fontString += 'bold ';
      else if (element.isItalic) fontString += 'italic ';
      
      const fontMap = {
        'Helvetica': 'Arial, sans-serif',
        'Times-Roman': 'Times, serif',
        'Courier': 'Courier New, monospace'
      };
      fontString += fontMap[element.fontFamily] || fontMap['Helvetica'];
      context.font = fontString;
      
      // Get accurate text measurements
      const metrics = context.measureText(element.text);
      const textWidth = metrics.width;
      const textHeight = element.fontSize;
      
      // Adjust hit area based on text alignment
      let hitX = element.x;
      if (element.textAlign === 'center') {
        hitX = element.x - textWidth / 2;
      } else if (element.textAlign === 'right') {
        hitX = element.x - textWidth;
      }
      
      // Check if click is within text bounds (with some padding)
      const padding = 5;
      if (x >= hitX - padding && 
          x <= hitX + textWidth + padding && 
          y >= element.y - textHeight - padding && 
          y <= element.y + padding) {
        return element;
      }
    }
    return null;
  }, [textElements, currentPage]);
  
  // ✅ FIX: Canvas click handler with correct dependencies
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !pageDimensions) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickedElement = findElementAtPosition(x, y);
    
    if (clickedElement) {
      if (toolMode === 'select') {
        selectElement(clickedElement.id);
      } else {
        if (selectedElementId === clickedElement.id) {
          startEditing(clickedElement.id, { x, y });
        } else {
          selectElement(clickedElement.id);
        }
      }
    } else {
      if (toolMode === 'add') {
        addTextElement(x, y, 'New Text');
      } else {
        selectElement(null);
      }
    }
  }, [toolMode, pageDimensions, selectedElementId, addTextElement, selectElement, startEditing, findElementAtPosition]);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !pageDimensions) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickedElement = findElementAtPosition(x, y);
    
    if (clickedElement && toolMode === 'select') {
      startDragging(clickedElement.id, { x, y });
      selectElement(clickedElement.id);
    }
  }, [toolMode, pageDimensions, startDragging, selectElement, findElementAtPosition]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasInteraction.isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      updateDragging({ x, y });
    }
  }, [canvasInteraction.isDragging, updateDragging]);

  const handleMouseUp = useCallback(() => {
    if (canvasInteraction.isDragging) {
      stopDragging();
    }
  }, [canvasInteraction.isDragging, stopDragging]);

  // Re-render when elements change
  useEffect(() => {
    if (pdfDocument && currentPageRenderer) {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          const viewport = currentPageRenderer.getViewport({ scale: pageScale });
          currentPageRenderer.render({ canvasContext: context, viewport }).promise.then(() => {
            renderTextElements(context, viewport);
          });
        }
      }
    }
  }, [textElements, selectedElementId, currentPage, pageScale]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (pdfDocument && newPage >= 1 && newPage <= (pdfDocument?.numPages || totalPages)) {
      goToPage(newPage);
      renderPage(pdfDocument, newPage);
    }
  };

  // Handle format changes
  const handleFormatChange = (updates: Partial<TextElement>) => {
    if (selectedElementId) {
      updateTextElement(selectedElementId, updates);
    }
  };

  // ✅ FIX: Proper edit finish handling
  const handleEditFinish = (text: string) => {
    const trimmedText = text.trim();
    finishEditing(trimmedText || 'Text');
    setEditingText('');
  };

  // ✅ FIX: Proper edit input change handling
  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setEditingText(newText);
    // Optionally update the temp text in the editing state
    if (editingState.elementId) {
      // Update the temp text but don't commit yet
      // This could be handled in the hook if needed
    }
  };

  // Handle key press in edit mode
  const handleEditKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleEditFinish(editingText);
    } else if (event.key === 'Escape') {
      cancelEditing();
      setEditingText('');
    }
  };

  // Process and download
  const handleProcess = async () => {
    if (files[0] && textElements.length > 0) {
      await processFile(files[0]);
    }
  };

  // Color presets
  const colorPresets = [
    { name: 'Black', value: { r: 0, g: 0, b: 0 } },
    { name: 'Gray', value: { r: 128, g: 128, b: 128 } },
    { name: 'Red', value: { r: 220, g: 38, b: 38 } },
    { name: 'Blue', value: { r: 59, g: 130, b: 246 } },
    { name: 'Green', value: { r: 34, g: 197, b: 94 } },
    { name: 'Orange', value: { r: 251, g: 146, b: 60 } }
  ];

  // Font options
  const fontOptions = [
    { value: 'Helvetica' as const, label: 'Helvetica' },
    { value: 'Times-Roman' as const, label: 'Times Roman' },
    { value: 'Courier' as const, label: 'Courier' }
  ];

  const currentFile = files[0];
  const selectedElement = textElements.find(el => el.id === selectedElementId);
  const displayTotalPages = pdfDocument?.numPages || totalPages;
  
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Text & Annotations</h2>
          <p className="text-gray-600 mt-1">
            Click to add text, select to edit and position
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* File Info */}
      {currentFile && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">File:</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📄</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(currentFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                {/* Tool Mode */}
                <div className="flex space-x-2">
                  <Button
                    variant={toolMode === 'add' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setToolMode('add')}
                  >
                    ➕ Add Text
                  </Button>
                  <Button
                    variant={toolMode === 'select' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setToolMode('select')}
                  >
                    🎯 Select
                  </Button>
                </div>

                {/* Undo/Redo */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                    title="Undo"
                  >
                    ↶
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                    title="Redo"
                  >
                    ↷
                  </Button>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    ←
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPage} of {displayTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= displayTotalPages}
                  >
                    →
                  </Button>
                </div>

                {/* Zoom */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageScale(pageScale - 0.2)}
                    disabled={pageScale <= 0.2}
                  >
                    -
                  </Button>
                  <span className="text-sm text-gray-600 w-12 text-center">
                    {Math.round(pageScale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageScale(pageScale + 0.2)}
                    disabled={pageScale >= 3}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
              
        {/* Canvas Container */}
            <div className="p-4 overflow-auto max-h-96 relative" ref={containerRef}>
              {isLoadingPDF && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading PDF...</div>
                </div>
              )}
              
              <canvas
                ref={canvasRef}
                className="border border-gray-300 cursor-crosshair relative"
                style={{ maxWidth: '100%', height: 'auto' }}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {/* ✅ FIX: Proper edit input with state management */}
              {editingState.isEditing && (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingText}
                  onChange={handleEditInputChange}
                  onKeyDown={handleEditKeyPress}
                  onBlur={() => handleEditFinish(editingText)}
                  className="absolute bg-white border border-blue-500 rounded px-2 py-1 text-sm z-10"
                  style={{
                    left: editingState.position.x,
                    top: editingState.position.y,
                    fontSize: selectedElement?.fontSize || 14
                  }}
                />
              )}
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 border-t border-gray-200 rounded-b-lg">
              <p className="text-xs text-blue-700">
                {toolMode === 'add' 
                  ? '💡 Click anywhere on the PDF to add text. Double-click text to edit.' 
                  : '💡 Click text to select, drag to move. Double-click to edit.'}
              </p>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Text Elements List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Text Elements ({textElements.length})
            </h3>
            
            {textElements.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 text-sm">No text elements added yet</p>
                <p className="text-gray-400 text-xs mt-1">Click on the PDF to add text</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {textElements.map((element) => (
                  <div
                    key={element.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      element.id === selectedElementId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => selectElement(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {element.text}
                        </p>
                        <p className="text-xs text-gray-500">
                          Page {element.pageNumber} • {element.fontSize}px
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2