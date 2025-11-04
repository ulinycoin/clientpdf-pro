import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectedText extends TextItem {
  pageNumber: number;
}

export const EditTextPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null); // Track current render task
  const isRenderingRef = useRef<boolean>(false); // Prevent concurrent renders

  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // Force canvas re-creation

  // Text editing state
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [newText, setNewText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(12);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  // Auto-load file from shared state
  useEffect(() => {
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

      pdfService.getPDFInfo(sharedFileObj).then((info) => {
        setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
      }).catch(() => {
        setFile((prev) =>
          prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
        );
      });

      clearSharedFile();
    }
  }, [sharedFile, file, result, clearSharedFile]);

  // Auto-save result to sharedFile when processing is complete
  useEffect(() => {
    if (result && !isProcessing && !resultSaved) {
      const fileName = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
      setSharedFile(result, fileName, 'edit-text-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

  // Load PDF and render page
  const loadPDF = useCallback(async (pdfFile: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);

      // DON'T call renderPage here - let the useEffect handle it
      // This prevents double rendering race condition
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Render PDF page on canvas
  const renderPage = useCallback(async (pdf: any, pageNumber: number) => {
    // Cancel any existing render task FIRST
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {
        // Ignore cancellation errors
      }
      renderTaskRef.current = null;
    }

    // Force canvas re-creation by updating key
    setCanvasKey(prev => prev + 1);

    // Wait for React to create the new canvas
    await new Promise(resolve => setTimeout(resolve, 10));

    if (!pdf || !canvasRef.current) return;

    // Wait if another render is in progress
    if (isRenderingRef.current) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    isRenderingRef.current = true;

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas) {
        isRenderingRef.current = false;
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        isRenderingRef.current = false;
        return;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page and store the task reference
      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null; // Clear after successful render

      // Get text content for click detection
      const textContent = await page.getTextContent();
      const items: TextItem[] = [];

      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const transform = item.transform;
          const x = transform[4] * scale;
          const y = (viewport.height - transform[5]) * scale;
          const width = (item.width || 100) * scale;
          const height = (item.height || 20) * scale;

          items.push({
            text: item.str,
            x,
            y: y - height, // Adjust to top-left origin
            width,
            height,
          });

          // Draw semi-transparent overlay for debugging (optional)
          // context.strokeStyle = 'rgba(255, 0, 0, 0.3)';
          // context.strokeRect(x, y - height, width, height);
        }
      }

      setTextItems(items);
    } catch (error) {
      // Ignore cancellation errors
      if (error && typeof error === 'object' && 'name' in error && error.name === 'RenderingCancelledException') {
        return;
      }
      console.error('Error rendering page:', error);
    } finally {
      isRenderingRef.current = false;
    }
  }, [scale]);

  // Load PDF when file is selected
  useEffect(() => {
    if (file?.file) {
      loadPDF(file.file);
    }
  }, [file, loadPDF]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDocument) {
      renderPage(pdfDocument, currentPage);
    }

    // Cleanup: cancel render task when component unmounts or dependencies change
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocument, currentPage, scale, renderPage]);

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
    setResultSaved(false);
    setSelectedText(null);

    try {
      const info = await pdfService.getPDFInfo(selectedFile);
      setFile((prev) => (prev ? { ...prev, info, status: 'completed' } : null));
    } catch (error) {
      setFile((prev) =>
        prev ? { ...prev, status: 'error', error: 'Failed to read PDF' } : null
      );
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setResultSaved(false);
    setPdfDocument(null);
    setSelectedText(null);
    setTextItems([]);
  };

  // Handle canvas click to select text
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked text item
    const clickedItem = textItems.find(
      (item) =>
        x >= item.x &&
        x <= item.x + item.width &&
        y >= item.y &&
        y <= item.y + item.height
    );

    if (clickedItem) {
      setSelectedText({
        ...clickedItem,
        pageNumber: currentPage,
      });
      setNewText(clickedItem.text);
    } else {
      setSelectedText(null);
    }
  };

  const handleReplaceText = async () => {
    if (!file || !selectedText || !newText.trim()) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    setResultSaved(false);

    try {
      const occurrences = [{
        pageNumber: selectedText.pageNumber,
        text: selectedText.text,
        x: selectedText.x / scale,
        y: selectedText.y / scale,
        width: selectedText.width / scale,
        height: selectedText.height / scale,
      }];

      const replaceResult = await pdfService.replaceTextInPDF(
        file.file,
        occurrences,
        newText,
        {
          backgroundColor,
          textColor,
          fontSize,
          dpi: 150,
        },
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      if (replaceResult.success && replaceResult.data) {
        setResult(replaceResult.data);
        setSelectedText(null);
        setNewText('');

        // Reload PDF to show changes
        await loadPDF(new File([replaceResult.data], file.name, { type: 'application/pdf' }));
      } else {
        throw new Error(replaceResult.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error replacing text:', error);
      alert(t('editText.replaceError'));
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

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    setSelectedText(null);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setScale(Math.min(scale + 0.2, 3));
    } else {
      setScale(Math.max(scale - 0.2, 0.5));
    }
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
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {t('editText.rasterizationWarning')}
          </p>
        </div>
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

      {/* Main Editing Interface */}
      {hasFile && !hasResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {/* File Info & Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common.page')} {currentPage} / {totalPages}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Zoom controls */}
                  <button
                    onClick={() => handleZoom('out')}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Zoom out"
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom('in')}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Zoom in"
                  >
                    +
                  </button>

                  {/* Page navigation */}
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>

                  <button
                    onClick={handleRemoveFile}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div
                ref={containerRef}
                className="overflow-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500 dark:text-gray-400">
                      Loading PDF...
                    </div>
                  </div>
                ) : (
                  <canvas
                    key={canvasKey}
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="cursor-crosshair"
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                Click on any text to edit it
              </p>
            </div>
          </div>

          {/* Right Panel - Edit Controls */}
          <div className="space-y-4">
            {selectedText ? (
              <>
                {/* Selected Text Info */}
                <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-ocean-900 dark:text-ocean-100 mb-2">
                    Selected Text
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3">
                    <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                      "{selectedText.text}"
                    </p>
                  </div>
                  <p className="text-xs text-ocean-700 dark:text-ocean-300">
                    Page {selectedText.pageNumber} • Position: ({Math.round(selectedText.x)}, {Math.round(selectedText.y)})
                  </p>
                </div>

                {/* Edit Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Edit Text
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editText.newText')}
                      </label>
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder={t('editText.enterNewText')}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('editText.backgroundColor')}
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
                          {t('editText.textColor')}
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
                        {t('editText.fontSize')}: {fontSize}px
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

                    <button
                      onClick={handleReplaceText}
                      disabled={!newText.trim() || isProcessing}
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('editText.replaceText')}
                    </button>

                    <button
                      onClick={() => setSelectedText(null)}
                      className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <p className="text-sm">
                    Click on any text in the PDF to start editing
                  </p>
                </div>
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
                {t('editText.successMessage')}
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
