import React, { useState, useEffect, useCallback } from 'react';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { useHashRouter } from '@/hooks/useHashRouter';
import { useContentEditor } from '@/hooks/useContentEditor';
import { Canvas } from './ContentEditorPDF/Canvas';
import { Toolbar } from './ContentEditorPDF/Toolbar';
import { FormatPanel } from './ContentEditorPDF/FormatPanel';
import { FloatingToolbar } from './ContentEditorPDF/FloatingToolbar';
import type { UploadedFile } from '@/types/pdf';
import type { TextElement } from '@/types/contentEditor';
import { CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const ContentEditorPDF: React.FC = () => {
    const { t } = useI18n();
    const { currentTool } = useHashRouter();
    const { sharedFile, clearSharedFile, setSharedFile } = useSharedFile();
    const [file, setFile] = useState<UploadedFile | null>(null);
    const [result, setResult] = useState<Blob | null>(null);
    const [resultSaved, setResultSaved] = useState(false);
    const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileDrawer, setShowMobileDrawer] = useState(false);
    const [isDocumentLoading, setIsDocumentLoading] = useState(false);

    const {
        textElements,
        selectedElementId,
        currentPage,
        totalPages,
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
        setToolMode,
        undo,
        redo,
        detectTextAt,
        savePDF,
        reset,
        finishMovement,
    } = useContentEditor();

    // Set initial mode based on URL hash or default to 'edit'
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('add-text')) {
            setToolMode('add');
        } else {
            setToolMode('edit');
        }
    }, [setToolMode]);

    // Handle mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Keyboard Shortcuts (Undo/Redo)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input, textarea or contentEditable
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    redo();
                } else {
                    e.preventDefault();
                    undo();
                }
            } else if (modifier && e.key.toLowerCase() === 'y') {
                // Ctrl+Y for Windows Redo
                e.preventDefault();
                redo();
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
                e.preventDefault();
                deleteTextElement(selectedElementId);
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementId) {
                const element = textElements.find(el => el.id === selectedElementId);
                if (element) {
                    e.preventDefault();
                    const step = e.shiftKey ? 1.0 : 0.1;
                    let { x, y } = element;

                    if (e.key === 'ArrowUp') y -= step;
                    if (e.key === 'ArrowDown') y += step;
                    if (e.key === 'ArrowLeft') x -= step;
                    if (e.key === 'ArrowRight') x += step;

                    moveElement(selectedElementId, x, y);
                    // We need to trigger history save for keyboard movement
                    // since it's "finished" on each press (different from drag)
                    finishMovement();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedElementId, deleteTextElement, textElements, moveElement, finishMovement]);

    // Set document for hook
    const handlePdfLoad = useCallback(async (selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (!selectedFile) return;

        setIsDocumentLoading(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPdfDocument(pdf);

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
        } catch (error) {
            console.error('Error loading PDF:', error);
        } finally {
            setIsDocumentLoading(false);
        }
    }, [reset]);

    // Handle Smart Detection
    const handleSmartDetect = useCallback(async (x: number, y: number, textColor?: string, bgColor?: string) => {
        if (!pdfDocument) return;

        // Check if there's already an element at this position
        const existing = textElements.find(el => {
            if (el.pageNumber !== currentPage) return false;
            // Check distance to center anchor
            const dist = Math.sqrt(Math.pow(el.x - x, 2) + Math.pow(el.y - y, 2));
            return dist < 3; // Tightened threshold
        });

        if (existing) {
            selectElement(existing.id);
            return;
        }

        const detected = await detectTextAt(pdfDocument, currentPage, x, y);
        if (detected) {
            // Create an element covering this text immediately with correct properties
            // We use textAlign: 'left' and x as left edge for maximum stability
            const leftX = detected.x - detected.width / 2;
            addTextElement(leftX, detected.y, detected.text, {
                fontSize: detected.fontSize,
                fontFamily: detected.fontFamily,
                bold: detected.bold,
                italic: detected.italic,
                color: textColor || '#000000',
                textAlign: 'left',
                originalRect: {
                    x: detected.x - detected.width / 2,
                    y: detected.y - detected.height / 2,
                    w: detected.width,
                    h: detected.height
                },
                backgroundColor: bgColor || '#FFFFFF'
            });
        }
    }, [pdfDocument, currentPage, detectTextAt, addTextElement, textElements, selectElement]);

    // Auto-load shared file
    useEffect(() => {
        if (sharedFile && !file) {
            const sharedFileObj = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
            handlePdfLoad([sharedFileObj]);
            clearSharedFile();
        }
    }, [sharedFile, file, clearSharedFile, handlePdfLoad]);

    // Auto-save result
    useEffect(() => {
        if (result && !isProcessing && !resultSaved) {
            const fileName = file?.name.replace(/\.pdf$/i, '_edited.pdf') || 'edited.pdf';
            setSharedFile(result, fileName, 'content-editor-pdf');
            setResultSaved(true);
        }
    }, [result, isProcessing, resultSaved, file?.name, setSharedFile]);

    const selectedElement = textElements.find((el: TextElement) => el.id === selectedElementId) || null;

    const handleSave = useCallback(async () => {
        if (!file?.file) return;
        try {
            const resultBlob = await savePDF(file.file);
            setResult(resultBlob);
        } catch (error) {
            console.error('Error saving PDF:', error);
        }
    }, [file, savePDF]);

    if (!file) {
        return (
            <ToolLayout
                title={t(`tools.${currentTool}.name`)}
                description={t(`tools.${currentTool}.description`)}
                hasFiles={false}
                onUpload={handlePdfLoad}
                isProcessing={false}
                maxFiles={1}
            />
        );
    }

    if (result) {
        return (
            <ToolLayout
                title={t(`tools.${currentTool}.name`)}
                description={t(`tools.${currentTool}.description`)}
                hasFiles={true}
                onUpload={handlePdfLoad}
            >
                <div className="space-y-6 max-w-2xl mx-auto py-12">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-3xl p-10 text-center shadow-xl">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('common.success')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t('addText.addedCount', { count: textElements.length })}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => {
                            const url = URL.createObjectURL(result);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name.replace('.pdf', '_edited.pdf');
                            a.click();
                        }} size="lg" className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all">
                            {t('common.download')}
                        </Button>
                        <Button variant="outline" onClick={() => { setFile(null); setResult(null); clearSharedFile(); reset(); }} size="lg" className="h-14 px-8 rounded-2xl font-bold border-2">
                            {t('common.processAnother')}
                        </Button>
                    </div>
                </div>
            </ToolLayout>
        );
    }

    return (
        <ToolLayout
            title={t(`tools.${currentTool}.name`)}
            description={t(`tools.${currentTool}.description`)}
            hasFiles={true}
            onUpload={handlePdfLoad}
            isProcessing={isProcessing}
            settings={!isMobile ? <FormatPanel selectedElement={selectedElement} onElementUpdate={updateTextElement} onDelete={deleteTextElement} /> : null}
            actions={!isMobile ? <Button onClick={handleSave} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold bg-ocean-500 text-white">{t('common.save')}</Button> : null}
        >
            <div className="flex flex-col h-full space-y-4 relative">
                <Toolbar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    toolMode={toolMode}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onPageChange={goToPage}
                    onUndo={undo}
                    onRedo={redo}
                    onToolModeChange={setToolMode}
                    onReset={reset}
                    onSave={handleSave}
                />

                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl relative border border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
                    <Canvas
                        pdfDocument={pdfDocument} isDocumentLoading={isDocumentLoading}
                        currentPage={currentPage}
                        textElements={textElements}
                        selectedElementId={selectedElementId}
                        toolMode={toolMode}
                        onCanvasClick={(x, y) => {
                            if (toolMode === 'add') {
                                addTextElement(x, y, t('addText.clickToEdit'));
                                setToolMode('select');
                            } else selectElement(null);
                        }}
                        onElementSelect={selectElement}
                        onElementMove={(id, x, y) => {
                            moveElement(id, x, y);
                            if (isMobile) setShowMobileDrawer(true);
                        }}
                        onElementUpdate={updateTextElement}
                        onTotalPagesChange={setTotalPages}
                        onSmartDetect={handleSmartDetect}
                    />

                    {selectedElement && (
                        <FloatingToolbar
                            element={selectedElement}
                            onUpdate={updateTextElement}
                            isMobile={isMobile}
                        />
                    )}
                </div>

                {/* Mobile Format Toggle */}
                {isMobile && selectedElement && (
                    <Button
                        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-ocean-500 text-white z-[60] p-0"
                        onClick={() => setShowMobileDrawer(!showMobileDrawer)}
                    >
                        {showMobileDrawer ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                    </Button>
                )}

                {/* Mobile Drawer (Simplied Sheet) */}
                {isMobile && showMobileDrawer && (
                    <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 z-[55] border-t border-gray-200 dark:border-gray-800 p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6" onClick={() => setShowMobileDrawer(false)} />
                        <FormatPanel
                            selectedElement={selectedElement}
                            onElementUpdate={updateTextElement}
                            onDelete={deleteTextElement}
                        />
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};
