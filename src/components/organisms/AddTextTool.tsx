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
      }
    }, [editingState.isEditing]);

    // Load PDF document
    const loadPDF = async (file: File) => {
      try {
        setIsLoadingPDF(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDocument(pdf);
        goToPage(1);
        await renderPage(pdf, 1);
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

	  // Render single text element
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
	      const metrics = context.measureText(element.text);
	      const textWidth = metrics.width;
	      const textHeight = element.fontSize;
	      context.strokeRect(element.x - 5, element.y - textHeight - 5, textWidth + 10, textHeight + 10);
	      context.setLineDash([]);
	    }
	    context.restore();
	  };

	  // Find text element at position
	  const findElementAtPosition = (x: number, y: number): TextElement | null => {
	    const currentPageElements = textElements.filter(el => el.pageNumber === currentPage);
	    for (let i = currentPageElements.length - 1; i >= 0; i--) {
	      const element = currentPageElements[i];
	      const textWidth = element.text.length * element.fontSize * 0.6;
	      const textHeight = element.fontSize;
	      if (x >= element.x - 5 && x <= element.x + textWidth + 5 && 
	          y >= element.y - textHeight - 5 && y <= element.y + 5) {
	        return element;
	      }
	    }
	    return null;
	  };
	  
	  // Handle canvas click
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
		    if (pdfDocument && newPage >= 1 && newPage <= totalPages) {
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

		  // Handle edit finish
		  const handleEditFinish = (text: string) => {
		    finishEditing(text);
		  };

		  // Handle key press in edit mode
		  const handleEditKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		    if (event.key === 'Enter') {
		      handleEditFinish(event.currentTarget.value);
		    } else if (event.key === 'Escape') {
		      cancelEditing();
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
		                      {currentPage} of {totalPages}
		                    </span>
		                    <Button
		                      variant="outline"
		                      size="sm"
		                      onClick={() => handlePageChange(currentPage + 1)}
		                      disabled={currentPage >= totalPages}
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

				              {/* Edit Input Overlay */}
				              {editingState.isEditing && (
				                <input
				                  ref={editInputRef}
				                  type="text"
				                  value={editingState.tempText}
				                  onChange={(e) => {
				                    // Note: You'll need to manage this state properly in the hook
				                    // For now, this is a placeholder
				                  }}
				                  onKeyDown={handleEditKeyPress}
				                  onBlur={() => handleEditFinish(editingState.tempText)}
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
				                      <div className="flex space-x-1 ml-2">
				                        <Button
				                          variant="ghost"
				                          size="sm"
				                          onClick={(e) => {
				                            e.stopPropagation();
				                            duplicateElement(element.id);
				                          }}
				                          title="Duplicate"
				                        >
				                          📋
				                        </Button>
				                        <Button
				                          variant="ghost"
				                          size="sm"
				                          onClick={(e) => {
				                            e.stopPropagation();
				                            deleteTextElement(element.id);
				                          }}
				                          title="Delete"
				                        >
				                          🗑️
				                        </Button>
				                      </div>
				                    </div>
				                  </div>
				                ))}
				              </div>
				            )}
				          </div>
						  
						  {/* Format Panel - Only show when element is selected */}
						            {selectedElement && (
						              <div>
						                <h3 className="text-lg font-medium text-gray-900 mb-3">Format Text</h3>
              
						                <div className="space-y-4">
						                  {/* Text Content */}
						                  <div>
						                    <label className="block text-sm font-medium text-gray-700 mb-2">
						                      Text Content
						                    </label>
						                    <input
						                      type="text"
						                      value={selectedElement.text}
						                      onChange={(e) => handleFormatChange({ text: e.target.value })}
						                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						                      placeholder="Enter text..."
						                    />
						                  </div>

						                  {/* Font Family */}
						                  <div>
						                    <label className="block text-sm font-medium text-gray-700 mb-2">
						                      Font Family
						                    </label>
						                    <select
						                      value={selectedElement.fontFamily}
						                      onChange={(e) => handleFormatChange({ 
						                        fontFamily: e.target.value as 'Helvetica' | 'Times-Roman' | 'Courier' 
						                      })}
						                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						                    >
						                      {fontOptions.map(font => (
						                        <option key={font.value} value={font.value}>
						                          {font.label}
						                        </option>
						                      ))}
						                    </select>
						                  </div>

						                  {/* Font Size */}
						                  <div>
						                    <label className="block text-sm font-medium text-gray-700 mb-2">
						                      Font Size: {selectedElement.fontSize}px
						                    </label>
						                    <input
						                      type="range"
						                      min="8"
						                      max="72"
						                      step="1"
						                      value={selectedElement.fontSize}
						                      onChange={(e) => handleFormatChange({ fontSize: parseInt(e.target.value) })}
						                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
						                    />
						                  </div>

						                  {/* Font Style */}
						                  <div>
						                    <label className="block text-sm font-medium text-gray-700 mb-2">
						                      Font Style
						                    </label>
						                    <div className="flex space-x-2">
						                      <Button
						                        variant={selectedElement.isBold ? 'primary' : 'outline'}
						                        size="sm"
						                        onClick={() => handleFormatChange({ isBold: !selectedElement.isBold })}
						                      >
						                        <strong>B</strong>
						                      </Button>
						                      <Button
						                        variant={selectedElement.isItalic ? 'primary' : 'outline'}
						                        size="sm"
						                        onClick={() => handleFormatChange({ isItalic: !selectedElement.isItalic })}
						                      >
						                        <em>I</em>
						                      </Button>
						                    </div>
						                  </div>
										  
					{/* Color */}
					                <div>
					                  <label className="block text-sm font-medium text-gray-700 mb-2">
					                    Text Color
					                  </label>
					                  <div className="grid grid-cols-3 gap-2">
					                    {colorPresets.map((preset) => (
					                      <button
					                        key={preset.name}
					                        onClick={() => handleFormatChange({ color: preset.value })}
					                        className={`w-full h-8 border-2 rounded-lg transition-transform hover:scale-105 ${
					                          selectedElement.color.r === preset.value.r && 
					                          selectedElement.color.g === preset.value.g && 
					                          selectedElement.color.b === preset.value.b
					                            ? 'border-blue-500 ring-2 ring-blue-200'
					                            : 'border-gray-300'
					                        }`}
					                        style={{ backgroundColor: `rgb(${preset.value.r}, ${preset.value.g}, ${preset.value.b})` }}
					                        title={preset.name}
					                      />
					                    ))}
					                  </div>
					                </div>

					                {/* Opacity */}
					                <div>
					                  <label className="block text-sm font-medium text-gray-700 mb-2">
					                    Opacity: {selectedElement.opacity}%
					                  </label>
					                  <input
					                    type="range"
					                    min="10"
					                    max="100"
					                    step="5"
					                    value={selectedElement.opacity}
					                    onChange={(e) => handleFormatChange({ opacity: parseInt(e.target.value) })}
					                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					                  />
					                </div>

					                {/* Rotation */}
					                <div>
					                  <label className="block text-sm font-medium text-gray-700 mb-2">
					                    Rotation: {selectedElement.rotation}°
					                  </label>
					                  <input
					                    type="range"
					                    min="-90"
					                    max="90"
					                    step="15"
					                    value={selectedElement.rotation}
					                    onChange={(e) => handleFormatChange({ rotation: parseInt(e.target.value) })}
					                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					                  />
					                  <div className="flex justify-between text-xs text-gray-500 mt-1">
					                    <span>-90°</span>
					                    <span>0°</span>
					                    <span>90°</span>
					                  </div>
					                </div>
					              </div>
					            </div>
					          )}
					        </div>
					      </div>
						  
				{/* Progress */}
				      {isProcessing && (
				        <div className="mt-6">
				          <ProgressBar
				            value={progress}
				            className="mb-2"
				            animated={true}
				          />
				          <p className="text-sm text-gray-600 text-center">
				            Adding text to PDF... {Math.round(progress)}%
				          </p>
				        </div>
				      )}

				      {/* Errors */}
				      {error && (
				        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				          <div className="flex items-start">
				            <div className="text-red-400 mr-2 mt-0.5">⚠️</div>
				            <div>
				              <h4 className="text-red-800 font-medium">Error</h4>
				              <p className="text-red-600 text-sm mt-1">{error}</p>
				            </div>
				          </div>
				        </div>
				      )}

				      {/* Info Box */}
				      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				        <div className="flex items-start">
				          <div className="text-blue-400 mr-2 mt-0.5">ℹ️</div>
				          <div>
				            <h4 className="text-blue-800 font-medium">Privacy & Security</h4>
				            <p className="text-blue-700 text-sm mt-1">
				              Text is added locally in your browser. Your PDF never leaves your device, 
				              ensuring complete privacy and security.
				            </p>
				          </div>
				        </div>
				      </div>

				      {/* Usage Tips */}
				      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
				        <div className="flex items-start">
				          <div className="text-green-400 mr-2 mt-0.5">💡</div>
				          <div>
				            <h4 className="text-green-800 font-medium">Quick Tips</h4>
				            <ul className="text-green-700 text-sm mt-1 space-y-1">
				              <li>• Use "Add Text" mode to place new text elements</li>
				              <li>• Switch to "Select" mode to move and edit existing text</li>
				              <li>• Double-click any text to edit it inline</li>
				              <li>• Use Ctrl+Z / Ctrl+Y for undo/redo (or toolbar buttons)</li>
				              <li>• Drag text elements to reposition them precisely</li>
				            </ul>
				          </div>
				        </div>
				      </div>
					  
					  {/* Actions */}
					        <div className="flex justify-between items-center mt-6">
					          <div className="flex space-x-3">
					            <Button
					              variant="outline"
					              onClick={onClose}
					              disabled={isProcessing}
					            >
					              Cancel
					            </Button>
          
					            {textElements.length > 0 && (
					              <Button
					                variant="outline"
					                onClick={() => {
					                  if (window.confirm('Are you sure you want to clear all text elements?')) {
					                    resetState();
					                  }
					                }}
					                disabled={isProcessing}
					              >
					                Clear All
					              </Button>
					            )}
					          </div>

					          <div className="flex items-center space-x-3">
					            {/* Element Count */}
					            {textElements.length > 0 && (
					              <span className="text-sm text-gray-600">
					                {textElements.length} text element{textElements.length !== 1 ? 's' : ''} added
					              </span>
					            )}

					            {/* Process Button */}
					            <Button
					              variant="primary"
					              onClick={handleProcess}
					              disabled={isProcessing || textElements.length === 0}
					              loading={isProcessing}
					            >
					              {isProcessing 
					                ? 'Adding Text...' 
					                : textElements.length === 0 
					                  ? 'Add Text First' 
					                  : `Apply Text (${textElements.length})`
					              }
					            </Button>
					          </div>
					        </div>
					      </div>
					    );
					  };

					  export default AddTextTool;		  					  	  