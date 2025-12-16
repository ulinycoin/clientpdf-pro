import React, { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { useAddTextTool } from '@/hooks/useAddTextTool';
import { Canvas } from './AddTextPDF/Canvas';
import { Toolbar } from './AddTextPDF/Toolbar';
import { FormatPanel } from './AddTextPDF/FormatPanel';
import type { UploadedFile } from '@/types/pdf';
import type { Tool } from '@/types';
import { HASH_TOOL_MAP } from '@/types';
import { CheckCircle2 } from 'lucide-react';

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
      addTextElement(x, y, t('addText.clickToEdit'));
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
      alert(t('common.error') + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    link.download = file?.name.replace('.pdf', '_with_text.pdf') || t('addText.defaultFileName');
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

  const handleQuickAction = async (toolId: Tool) => {
    if (result) {
      setSharedFile(result, file?.name.replace('.pdf', '_with_text.pdf') || t('addText.defaultFileName'), 'add-text-pdf');
    }
    // Small delay to ensure state is updated before navigation
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.hash = HASH_TOOL_MAP[toolId];
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('common.success')}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 space-y-1">
                <p>{t('addText.addedCount', { count: textElements.length })}</p>
                <p>{t('addText.newSize')}: <span className="font-semibold">{(result.size / 1024).toFixed(2)} KB</span></p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              {t('common.processAnother')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Toolbar - Pagination / Zoom / Undo / Redo */}
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
            // Hide save button in toolbar as it's in actions now
            hideSave={true}
          />
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-xl relative border border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 overflow-auto flex items-center justify-center p-4">
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
        </div>

        {/* Status Bar */}
        <div className="text-xs text-center text-gray-500">
          {toolMode === 'add' ? t('addText.modeAdd') : t('addText.modeSelect')}
          {selectedElement && ` | ${t('addText.selected', { text: selectedElement.text.slice(0, 20) + (selectedElement.text.length > 20 ? '...' : '') })}`}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <FormatPanel
        selectedElement={selectedElement}
        onElementUpdate={updateTextElement}
      />
    );
  };

  const renderActions = () => {
    return (
      <Button
        onClick={handleSave}
        disabled={isProcessing || !file}
        className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
      >
        {isProcessing ? t('common.processing') : t('common.save')}
      </Button>
    );
  };

  return (
    <ToolLayout
      title={t('tools.add-text-pdf.name')}
      description={t('tools.add-text-pdf.description')}
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
