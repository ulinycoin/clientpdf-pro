import React, { useEffect, useCallback } from 'react';
import { AddTextToolProps } from './types';
import { useAddTextTool } from './hooks/useAddTextTool';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import FormatPanel from './components/FormatPanel';
import FileUploadZone from '../../molecules/FileUploadZone';

const AddTextTool: React.FC<AddTextToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const {
    // State
    textElements,
    selectedElementId,
    currentPage,
    totalPages,
    scale,
    toolMode,
    isProcessing,
    
    // History
    canUndo,
    canRedo,
    
    // Actions
    addTextElement,
    updateTextElement,
    deleteTextElement,
    selectElement,
    moveElement,
    
    // Navigation
    goToPage,
    setTotalPages,
    setScale,
    setToolMode,
    
    // History
    undo,
    redo,
    
    // File operations
    savePDF,
    reset,
  } = useAddTextTool();

  // Get the first PDF file
  const pdfFile = files?.find(file => file.type === 'application/pdf') || null;
  
  // Get selected element
  const selectedElement = textElements.find(el => el.id === selectedElementId) || null;

  // Handle canvas click
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (toolMode === 'add') {
      addTextElement(x, y, 'Click to edit');
    }
  }, [toolMode, addTextElement]);

  // Handle element selection
  const handleElementSelect = useCallback((id: string) => {
    selectElement(id);
  }, [selectElement]);

  // Handle element movement
  const handleElementMove = useCallback((id: string, x: number, y: number) => {
    moveElement(id, x, y);
  }, [moveElement]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!pdfFile) return;
    
    try {
      const result = await savePDF(pdfFile);
      onComplete(result);
    } catch (error) {
      console.error('Error saving PDF:', error);
      // Could add toast notification here
    }
  }, [pdfFile, savePDF, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
          case 's':
            event.preventDefault();
            handleSave();
            break;
        }
      }

      // Delete selected element
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementId) {
          event.preventDefault();
          deleteTextElement(selectedElementId);
        }
      }

      // Escape to deselect
      if (event.key === 'Escape') {
        selectElement('');
        setToolMode('add');
      }

      // Zoom shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            setScale(scale + 0.25);
            break;
          case '-':
            event.preventDefault();
            setScale(scale - 0.25);
            break;
          case '0':
            event.preventDefault();
            setScale(1);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave, selectedElementId, deleteTextElement, selectElement, setToolMode, scale, setScale]);

  // Reset when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (!pdfFile) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Tools</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Add Text to PDF</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF File Selected</h3>
          <p className="text-gray-600 mb-6">Please upload a PDF file to add text</p>
          <FileUploadZone
            onFileUpload={(files) => {
              // This would need to be handled by parent component
              console.log('Files uploaded:', files);
            }}
            accept=".pdf"
            multiple={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`} style={{ height: '90vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Tools</span>
        </button>
        <h2 className="text-xl font-bold text-gray-900">Add Text to PDF</h2>
        <div className="text-sm text-gray-500">
          {textElements.length} text element{textElements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        canUndo={canUndo}
        canRedo={canRedo}
        toolMode={toolMode}
        onPageChange={goToPage}
        onScaleChange={setScale}
        onUndo={undo}
        onRedo={redo}
        onToolModeChange={setToolMode}
        onSave={handleSave}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Format panel */}
        <FormatPanel
          selectedElement={selectedElement}
          onElementUpdate={updateTextElement}
        />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          <Canvas
            pdfFile={pdfFile}
            currentPage={currentPage}
            textElements={textElements}
            selectedElementId={selectedElementId}
            scale={scale}
            onCanvasClick={handleCanvasClick}
            onElementSelect={handleElementSelect}
            onElementMove={handleElementMove}
            onPageChange={goToPage}
            onTotalPagesChange={setTotalPages}
          />
          
          {/* Status bar */}
          <div className="p-2 border-t bg-gray-50 text-xs text-gray-600 flex justify-between">
            <div>
              Mode: {toolMode === 'add' ? '✏️ Add Text' : '👆 Select'}
              {selectedElement && ` | Selected: "${selectedElement.text.slice(0, 20)}${selectedElement.text.length > 20 ? '...' : ''}"`}
            </div>
            <div>
              Zoom: {Math.round(scale * 100)}% | Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700">Processing PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTextTool;