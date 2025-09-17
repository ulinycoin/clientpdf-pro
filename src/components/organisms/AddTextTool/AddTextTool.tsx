import React, { useEffect, useCallback } from 'react';
import { AddTextToolProps } from './types';
import { useAddTextTool } from './hooks/useAddTextTool';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import FormatPanel from './components/FormatPanel';
import FileUploadZone from '../../molecules/FileUploadZone';
import { useI18n } from '../../../hooks/useI18n';

const AddTextTool: React.FC<AddTextToolProps> = ({
  files,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useI18n();
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
      addTextElement(x, y, t('tools.addText.status.clickToEdit'));
    }
  }, [toolMode, addTextElement, t]);

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
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl p-8 ${className} transition-all duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>←</span>
            <span className="font-medium text-black dark:text-white">{t('tools.addText.backToTools')}</span>
          </button>
          <h2 className="text-2xl font-black text-black dark:text-white">{t('tools.addText.addTextToPdf')}</h2>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-6">
            📄
          </div>
          <h3 className="text-lg font-black text-black dark:text-white mb-2">{t('tools.addText.noFileSelected')}</h3>
          <p className="text-gray-800 dark:text-gray-100 font-medium mb-6">{t('tools.addText.noFileDescription')}</p>
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
    <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl shadow-lg hover:shadow-xl ${className} flex flex-col transition-all duration-300`} style={{ height: 'calc(100vh - 120px)', minHeight: '800px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/20 dark:border-gray-600/20 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="p-2 hover:bg-seafoam-50 dark:hover:bg-seafoam-900/20 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
        >
          <span>←</span>
          <span className="font-medium text-black dark:text-white">{t('tools.addText.backToTools')}</span>
        </button>
        <h2 className="text-lg font-black text-black dark:text-white">{t('tools.addText.addTextToPdf')}</h2>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-lg px-3 py-1">
          <div className="text-xs font-medium text-black dark:text-white">
            {textElements.length} {textElements.length === 1 ? t('tools.addText.textElements.single') : t('tools.addText.textElements.multiple')}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
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
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Format panel */}
        <div className="flex-shrink-0">
          <FormatPanel
            selectedElement={selectedElement}
            onElementUpdate={updateTextElement}
          />
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
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
          </div>

          {/* Status bar */}
          <div className="p-2 border-t bg-gray-50 text-xs text-gray-600 flex justify-between flex-shrink-0">
            <div>
              {t('tools.addText.status.mode')}: {toolMode === 'add' ? `✏️ ${t('tools.addText.status.addTextMode')}` : `👆 ${t('tools.addText.status.selectMode')}`}
              {selectedElement && ` | ${t('tools.addText.status.selected')}: "${selectedElement.text.slice(0, 20)}${selectedElement.text.length > 20 ? '...' : ''}"`}
            </div>
            <div>
              {t('tools.addText.status.zoom')}: {Math.round(scale * 100)}% | {t('tools.addText.toolbar.page')} {currentPage} {t('tools.addText.toolbar.of')} {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-seafoam-500 mx-auto mb-6"></div>
            <p className="text-black dark:text-white font-black text-lg mb-2">{t('tools.addText.processingTitle')}</p>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm">{t('tools.addText.processingDescription')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTextTool;
