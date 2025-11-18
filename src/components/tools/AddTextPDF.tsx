import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '@/components/common/FileUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { useAddTextTool } from '@/hooks/useAddTextTool';
import { Canvas } from './AddTextPDF/Canvas';
import { Toolbar } from './AddTextPDF/Toolbar';
import { FormatPanel } from './AddTextPDF/FormatPanel';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';

export const AddTextPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  const {
    textElements,
    selectedElementId,
    currentPage,
    totalPages,
    scale,
    toolMode,
    isProcessing,
    canUndo,
    canRedo,
    addTextElement,
    updateTextElement,
    deleteTextElement,
    selectElement,
    moveElement,
    goToPage,
    setTotalPages,
    setScale,
    setToolMode,
    undo,
    redo,
    savePDF,
    reset,
  } = useAddTextTool();

  // Auto-load shared file
  useEffect(() => {
    if (sharedFile && !file) {
      const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFilesSelected([sharedFileObj]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_with_text.pdf') || 'with_text.pdf';
      setSharedFile(result, fileName, 'add-text-pdf');
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
    reset();
  };

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
    if (!file?.file) return;

    try {
      const resultBlob = await savePDF(file.file);
      setResult(resultBlob);
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [file, savePDF]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementId) {
          event.preventDefault();
          deleteTextElement(selectedElementId);
        }
      }

      if (event.key === 'Escape') {
        selectElement('');
        setToolMode('add');
      }

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

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name.replace('.pdf', '_with_text.pdf') || 'document_with_text.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    reset();
  };

  const handleQuickAction = (toolId: Tool) => {
    // Save the processed PDF to shared state for the next tool
    if (result) {
      setSharedFile(result, file?.name.replace('.pdf', '_with_text.pdf') || 'document_with_text.pdf', 'add-text-pdf');
    }
    // Navigate to the selected tool
    window.location.hash = HASH_TOOL_MAP[toolId];
  };

  // If no file, show upload zone
  if (!file) {
    return (
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Add Text to PDF
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add custom text to your PDF pages with full control over position, style, and formatting
        </p>

        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
        />
      </Card>
    );
  }

  // If result, show success and download
  if (result) {
    return (
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Add Text to PDF
        </h2>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              ✓ Success
            </h3>
            <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <p>Text elements added: {textElements.length}</p>
              <p>Original size: {(file.size / 1024).toFixed(2)} KB</p>
              <p>New size: {(result.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleDownload}
              className="flex-1"
            >
              Download
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              Process Another
            </Button>
          </div>
        </div>

          {/* Quick Actions */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's next?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Continue working with your PDF using these tools:
            </p>

            {/* Action buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Compress */}
              <Button
                onClick={() => handleQuickAction('compress-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">🗜️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.compress-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reduce file size
                  </p>
                </div>
              </Button>

              {/* Protect */}
              <Button
                onClick={() => handleQuickAction('protect-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.protect-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add password
                  </p>
                </div>
              </Button>

              {/* Watermark */}
              <Button
                onClick={() => handleQuickAction('watermark-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">💧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.watermark-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add watermark
                  </p>
                </div>
              </Button>

              {/* Split */}
              <Button
                onClick={() => handleQuickAction('split-pdf')}
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:border-ocean-500 dark:hover:border-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 group"
              >
                <span className="text-3xl">✂️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-ocean-600 dark:group-hover:text-ocean-400">
                    {t('tools.split-pdf.name')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Extract pages
                  </p>
                </div>
              </Button>
            </div>
          </Card>
      </Card>
    );
  }

  // Main editor interface
  return (
    <div className="card flex flex-col" style={{ height: 'calc(100vh - 120px)', minHeight: '800px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Add Text to PDF
        </h2>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
          <div className="text-xs font-medium text-gray-900 dark:text-white">
            {textElements.length} text element{textElements.length !== 1 ? 's' : ''}
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
              pdfFile={file?.file || null}
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
          <div className="p-2 border-t bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 flex justify-between flex-shrink-0">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-6"></div>
            <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">Processing PDF</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Adding text elements to your PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
};
