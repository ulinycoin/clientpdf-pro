import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { flushSync } from 'react-dom';
import { useStudioEditController } from './edit/use-studio-edit-controller';
import { StudioEditToolbar } from './edit/StudioEditToolbar';
import { StudioAnnotateSettingsPanel } from './edit/StudioAnnotateSettingsPanel';
import { StudioFormsQuickBar } from './edit/StudioFormsQuickBar';
import { StudioProtectSettingsPanel } from './edit/StudioProtectSettingsPanel';
import { StudioWatermarkSettingsPanel } from './edit/StudioWatermarkSettingsPanel';
import { StudioWhiteoutSettingsPanel } from './edit/StudioWhiteoutSettingsPanel';
import { StudioTextSettingsPanel } from './edit/StudioTextSettingsPanel';
import { StudioSignSettingsPanel } from './edit/StudioSignSettingsPanel';
import { LinearIcon } from '../icons/linear-icon';
import { getStudioEditMessages } from './studio-edit-i18n';
import { StudioPageEditor, type StudioPageEditorHandle } from './StudioPageEditor';
import { clampScale, useStudioEditZoom } from './edit/use-studio-edit-zoom';
import type { FormFieldElement, WatermarkElement } from './editor-types';
import type { FontFamilyId } from './inline-text-utils';

export function StudioEditWorkspace() {
    const ui = useMemo(() => getStudioEditMessages(), []);

    const ctrl = useStudioEditController(ui);
    const zoom = useStudioEditZoom(ctrl.runId || 'unknown', 1);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<StudioPageEditorHandle | null>(null);
    const autoFitPreviewKeyRef = useRef<string | null>(null);
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 620, height: 840 });
    const [floatingPanelLayout, setFloatingPanelLayout] = useState<{ left: number; width: number } | null>(null);
    const [hasPendingDrawnSignature, setHasPendingDrawnSignature] = useState(false);
    const [hasPendingAnnotatePenDraft, setHasPendingAnnotatePenDraft] = useState(false);
    const hasFloatingTopPanel = ctrl.tool !== null
        && ['text', 'forms', 'sign', 'protect', 'watermark', 'whiteout', 'annotate'].includes(ctrl.tool);

    useEffect(() => {
        if (!ctrl.message) {
            return;
        }
        const timeoutId = window.setTimeout(() => {
            ctrl.setMessage(null);
        }, 5000);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [ctrl.message, ctrl.setMessage]);

    useEffect(() => {
        if (!ctrl.preview) {
            ctrl.clearEditSession();
            ctrl.navigate('/studio');
        }
    }, [ctrl.clearEditSession, ctrl.navigate, ctrl.preview]);

    useEffect(() => {
        const url = ctrl.preview?.page.thumbnailUrl;
        if (!url) {
            setCanvasSize({ width: 620, height: 840 });
            return;
        }
        const img = new Image();
        img.onload = () => {
            const naturalWidth = img.naturalWidth || 620;
            const naturalHeight = img.naturalHeight || 840;
            const maxWidth = 620;
            const maxHeight = 840;
            const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
            const width = Math.max(240, Math.round(naturalWidth * scale));
            const height = Math.max(320, Math.round(naturalHeight * scale));
            setCanvasSize({ width, height });
        };
        img.onerror = () => {
            setCanvasSize({ width: 620, height: 840 });
        };
        img.src = url;
    }, [ctrl.preview?.page.thumbnailUrl]);

    useEffect(() => {
        const previewId = ctrl.preview?.page.id;
        if (!previewId) {
            autoFitPreviewKeyRef.current = null;
            return;
        }
        const autoFitKey = `${previewId}:${canvasSize.width}`;
        if (autoFitPreviewKeyRef.current === autoFitKey) {
            return;
        }
        let frameId = window.requestAnimationFrame(() => {
            zoom.fitToWidth(canvasSize.width);
            autoFitPreviewKeyRef.current = autoFitKey;
        });
        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [canvasSize.width, ctrl.preview?.page.id, zoom]);

    useEffect(() => {
        if (!hasFloatingTopPanel) {
            setFloatingPanelLayout(null);
            return;
        }

        let frameId = 0;
        const refreshLayout = () => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
            frameId = window.requestAnimationFrame(() => {
                const surfaceEl = surfaceRef.current;
                if (!surfaceEl) {
                    setFloatingPanelLayout(null);
                    return;
                }
                const rect = surfaceEl.getBoundingClientRect();
                const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
                const safeViewportWidth = Math.max(0, viewportWidth - 24);
                const containerRect = zoom.containerRef.current?.getBoundingClientRect();
                const fitWidthScale = containerRect
                    ? clampScale(Math.max(1, containerRect.width - 96) / canvasSize.width)
                    : zoom.zoomLevel;
                const fitWidthWidth = Math.max(280, Math.min(canvasSize.width * fitWidthScale, safeViewportWidth));
                const desiredWidth = Math.min(
                    safeViewportWidth,
                    fitWidthWidth,
                );
                const centerX = rect.left + rect.width / 2;
                const minCenter = desiredWidth / 2 + 12;
                const maxCenter = Math.max(minCenter, viewportWidth - desiredWidth / 2 - 12);
                const clampedCenter = Math.min(maxCenter, Math.max(minCenter, centerX));
                setFloatingPanelLayout((prev) => {
                    if (prev && Math.abs(prev.left - clampedCenter) < 0.5 && Math.abs(prev.width - desiredWidth) < 0.5) {
                        return prev;
                    }
                    return { left: clampedCenter, width: desiredWidth };
                });
            });
        };

        refreshLayout();

        const onResize = () => refreshLayout();
        window.addEventListener('resize', onResize);
        const scrollHost = zoom.containerRef.current;
        const onScroll = () => refreshLayout();
        scrollHost?.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
            window.removeEventListener('resize', onResize);
            scrollHost?.removeEventListener('scroll', onScroll);
        };
    }, [hasFloatingTopPanel, zoom.containerRef, zoom.zoomLevel, canvasSize.width, canvasSize.height, ctrl.tool, ctrl.preview?.page.id]);

    const selectedFormField = ctrl.selectedElementId
        ? ctrl.elements.find(
            (element): element is FormFieldElement => element.id === ctrl.selectedElementId && element.type === 'form-field',
        ) ?? null
        : null;

    const updateSelectedFormField = (patch: Partial<FormFieldElement>) => {
        if (!selectedFormField) return;
        const next = ctrl.elements.map((element) => (
            element.id === selectedFormField.id && element.type === 'form-field'
                ? { ...element, ...patch }
                : element
        ));
        ctrl.setElements(next);
        ctrl.pushHistory(next);
    };

    const protectPermissionsOnly = ctrl.protectOptions?.permissionsOnly === true;
    const protectUserPassword = typeof ctrl.protectOptions?.userPassword === 'string'
        ? ctrl.protectOptions.userPassword
        : '';

    const selectedWatermark = ctrl.selectedElementId
        ? ctrl.elements.find(
            (element): element is WatermarkElement => element.id === ctrl.selectedElementId && element.type === 'watermark',
        ) ?? null
        : null;

    const handleWatermarkOptionsChange = (next: typeof ctrl.watermarkOptions) => {
        ctrl.setWatermarkOptions(next);
        if (!selectedWatermark) return;
        const patched = ctrl.elements.map((element) => (
            element.id === selectedWatermark.id && element.type === 'watermark'
                ? { ...element, ...next }
                : element
        ));
        ctrl.setElements(patched);
        ctrl.pushHistory(patched);
    };

    if (!ctrl.preview) {
        return null;
    }

    // Calculation for canvas wrapper sizing
    const scaledWidth = canvasSize.width * zoom.zoomLevel;
    const scaledHeight = canvasSize.height * zoom.zoomLevel;
    const selectedTextElement = ctrl.selectedElementId
        ? ctrl.elements.find(e => e.id === ctrl.selectedElementId && e.type === 'text') as import('./editor-types').TextElement | undefined
        : undefined;

    const selectedRectElement = ctrl.selectedElementId
        ? ctrl.elements.find(e => e.id === ctrl.selectedElementId && e.type === 'rect') as import('./editor-types').RectElement | undefined
        : undefined;

    const selectedStrokeElement = ctrl.selectedElementId
        ? ctrl.elements.find(e => e.id === ctrl.selectedElementId && e.type === 'stroke') as import('./editor-types').StrokeElement | undefined
        : undefined;
    const selectedImageElement = ctrl.selectedElementId
        ? ctrl.elements.find(e => e.id === ctrl.selectedElementId && e.type === 'image') as import('./editor-types').ImageElement | undefined
        : undefined;
    const selectedTypedSignature = selectedImageElement?.signatureSource === 'typed' && selectedImageElement.typedSignatureMeta
        ? selectedImageElement
        : undefined;

    const hasPendingChanges = ctrl.historyIndex > 0 || ctrl.hasDirtyChanges || hasPendingDrawnSignature || hasPendingAnnotatePenDraft;

    const commitPendingSignIfNeeded = useCallback(() => {
        if (ctrl.tool === 'sign' && ctrl.signMode === 'draw') {
            flushSync(() => {
                editorRef.current?.commitPendingSignDraft();
            });
        }
    }, [ctrl.signMode, ctrl.tool]);

    const commitPendingAnnotatePenIfNeeded = useCallback(() => {
        if (ctrl.tool === 'annotate' && ctrl.annotateMode === 'pen') {
            flushSync(() => {
                editorRef.current?.commitPendingAnnotatePenDraft();
            });
        }
    }, [ctrl.annotateMode, ctrl.tool]);

    const handleSave = useCallback(() => {
        commitPendingSignIfNeeded();
        commitPendingAnnotatePenIfNeeded();
        void ctrl.applyChanges();
    }, [commitPendingAnnotatePenIfNeeded, commitPendingSignIfNeeded, ctrl.applyChanges]);

    const handleBackToCanvas = useCallback(() => {
        if (ctrl.hasDirtyChanges && !window.confirm(ui.unsavedConfirm)) {
            return;
        }
        ctrl.clearEditSession();
        ctrl.navigate('/studio');
    }, [ctrl, ui.unsavedConfirm]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (!(event.ctrlKey || event.metaKey) || key !== 's') {
                return;
            }
            if (ctrl.tool === 'protect' || ctrl.isApplying || !hasPendingChanges) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            handleSave();
        };
        window.addEventListener('keydown', onKeyDown, true);
        return () => window.removeEventListener('keydown', onKeyDown, true);
    }, [ctrl.isApplying, ctrl.tool, handleSave, hasPendingChanges]);

    useEffect(() => {
        if (ctrl.tool !== 'sign' || ctrl.signMode !== 'type' || !selectedTypedSignature?.typedSignatureMeta) {
            return;
        }
        const meta = selectedTypedSignature.typedSignatureMeta;
        const widthScale = selectedTypedSignature.w / Math.max(0.0001, 0.28);
        const nextSize = Math.max(12, Math.min(96, Math.round(meta.baseFontSize * widthScale)));
        if (nextSize !== ctrl.signTypedFontSize) {
            ctrl.setSignTypedFontSize(nextSize);
        }
    }, [ctrl, selectedTypedSignature]);

    const topSettingsPanel = ctrl.tool === 'text'
        ? (
            <StudioTextSettingsPanel
                title={ui.text}
                fontFamilyLabel={ui.textFontFamily}
                fontSizeLabel={ui.textFontSize}
                textColorLabel={ui.textColor}
                bgColorLabel={ui.textBackgroundColor}
                fontFamily={selectedTextElement?.fontFamily ?? ctrl.textStyle.fontFamily}
                fontSize={selectedTextElement?.fontSize ?? ctrl.textStyle.fontSize}
                fontWeight={selectedTextElement?.fontWeight ?? ctrl.textStyle.fontWeight}
                fontStyle={selectedTextElement?.fontStyle ?? ctrl.textStyle.fontStyle}
                lineHeight={selectedTextElement?.lineHeight ?? ctrl.textStyle.lineHeight}
                letterSpacing={selectedTextElement?.letterSpacing ?? ctrl.textStyle.letterSpacing}
                color={selectedTextElement?.color ?? ctrl.textStyle.color}
                backgroundColor={(() => {
                    const bgId = `${ctrl.selectedElementId}_bg`;
                    const bg = ctrl.elements.find(e => e.id === bgId && e.type === 'rect') as import('./editor-types').RectElement | undefined;
                    return bg?.fill ?? ctrl.textStyle.backgroundColor;
                })()}
                onStyleChange={(patch) => {
                    if (ctrl.selectedElementId) {
                        ctrl.handleElementAction(ctrl.selectedElementId, 'update', patch);
                        // If color/background changed, and it's color specifically, we might need to handle the bg link here.
                        if (patch.backgroundColor) {
                            const newFill = patch.backgroundColor as string;
                            const bgId = `${ctrl.selectedElementId}_bg`;
                            const next = ctrl.elements.map(e => e.id === bgId && e.type === 'rect' ? { ...e, fill: newFill } : e);
                            ctrl.setElements(next);
                        }
                    } else {
                        ctrl.setTextStyle({ ...ctrl.textStyle, ...patch });
                    }
                }}
                onDelete={ctrl.selectedElementId ? () => {
                    const bgId = `${ctrl.selectedElementId}_bg`;
                    const hasBg = ctrl.elements.some(e => e.id === bgId);
                    if (hasBg) {
                        const next = ctrl.elements.filter(e => e.id !== ctrl.selectedElementId && e.id !== bgId);
                        ctrl.setElements(next);
                        ctrl.pushHistory(next);
                        ctrl.setSelectedElementId(null);
                    } else {
                        ctrl.handleElementAction(ctrl.selectedElementId!, 'delete');
                    }
                } : undefined}
                onDuplicate={ctrl.selectedElementId ? () => {
                    const original = ctrl.elements.find(e => e.id === ctrl.selectedElementId);
                    if (!original) return;
                    const newId = crypto.randomUUID();
                    const x = 'x' in original ? original.x + 0.05 : 0.05;
                    const y = 'y' in original ? original.y + 0.05 : 0.05;
                    const next = [...ctrl.elements, { ...original, id: newId, x, y } as any];
                    ctrl.setElements(next);
                    ctrl.pushHistory(next);
                    ctrl.setSelectedElementId(newId);
                } : undefined}
            />
        )
        : ctrl.tool === 'forms'
            ? (
                <StudioFormsQuickBar
                    onAddField={ctrl.addFormField}
                    selectedField={selectedFormField}
                    onUpdateSelectedField={updateSelectedFormField}
                    canvasWidth={canvasSize.width}
                    canvasHeight={canvasSize.height}
                    onDelete={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'delete') : undefined}
                    onDuplicate={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'duplicate') : undefined}
                />
            )
            : ctrl.tool === 'sign'
                ? (
                    <StudioSignSettingsPanel
                        title={ui.sign}
                        mode={ctrl.signMode}
                        typedValue={ctrl.signTypedValue}
                        typedFontSize={ctrl.signTypedFontSize}
                        drawColor={ctrl.signDrawColor}
                        drawStrokeWidth={ctrl.signDrawStrokeWidth}
                        onModeChange={ctrl.setSignMode}
                        onTypedValueChange={ctrl.setSignTypedValue}
                        onTypedFontSizeChange={(next) => {
                            const normalized = Math.max(12, Math.min(96, Math.round(next || 30)));
                            if (ctrl.signMode === 'type' && selectedTypedSignature?.typedSignatureMeta) {
                                const prevSize = Math.max(12, Math.min(96, Math.round(ctrl.signTypedFontSize || 30)));
                                const scale = normalized / prevSize;
                                const aspect = Math.max(0.05, selectedTypedSignature.w / Math.max(0.01, selectedTypedSignature.h));
                                const maxW = Math.max(0.04, 1 - selectedTypedSignature.x);
                                const maxH = Math.max(0.02, 1 - selectedTypedSignature.y);

                                let nextW = Math.max(0.04, selectedTypedSignature.w * scale);
                                let nextH = nextW / aspect;

                                if (nextH > maxH) {
                                    nextH = maxH;
                                    nextW = nextH * aspect;
                                }
                                if (nextW > maxW) {
                                    nextW = maxW;
                                    nextH = nextW / aspect;
                                }
                                if (nextH < 0.02) {
                                    nextH = 0.02;
                                    nextW = nextH * aspect;
                                }
                                if (nextW < 0.04) {
                                    nextW = 0.04;
                                    nextH = nextW / aspect;
                                }

                                ctrl.handleElementAction(selectedTypedSignature.id, 'update', { w: nextW, h: nextH });
                            }
                            ctrl.setSignTypedFontSize(normalized);
                        }}
                        onDrawColorChange={ctrl.setSignDrawColor}
                        onDrawStrokeWidthChange={ctrl.setSignDrawStrokeWidth}
                        onInsertTyped={ctrl.insertTypedSignature}
                        onInsertDrawn={() => {
                            commitPendingSignIfNeeded();
                        }}
                        onClearDrawn={() => {
                            editorRef.current?.clearPendingSignDraft();
                        }}
                        onUploadImage={ctrl.addImageSignature}
                        hasPendingDrawnSignature={hasPendingDrawnSignature}
                        onDelete={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'delete') : undefined}
                        onDuplicate={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'duplicate') : undefined}
                    />
                )
            : ctrl.tool === 'protect'
                ? (
                    <StudioProtectSettingsPanel
                        ui={ui}
                        onOptionsChange={ctrl.setProtectOptions}
                    />
                )
                : ctrl.tool === 'watermark'
                    ? (
                        <StudioWatermarkSettingsPanel
                            options={ctrl.watermarkOptions}
                            onOptionsChange={handleWatermarkOptionsChange}
                        />
                    )
                    : ctrl.tool === 'whiteout'
                        ? (
                            <StudioWhiteoutSettingsPanel
                                title={ui.whiteout}
                                customColorLabel={ui.whiteoutCustomColor}
                                color={selectedRectElement?.fill ?? ctrl.whiteoutColor}
                                onColorChange={(next) => {
                                    if (selectedRectElement) {
                                        ctrl.handleElementAction(selectedRectElement.id, 'update', { fill: next });
                                    } else {
                                        ctrl.setWhiteoutColor(next);
                                    }
                                }}
                                onDelete={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'delete') : undefined}
                                onDuplicate={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'duplicate') : undefined}
                            />
                        )
                        : ctrl.tool === 'annotate'
                            ? (
                                <StudioAnnotateSettingsPanel
                                    title={ui.annotate}
                                    highlightLabel={ui.annotateHighlight}
                                    markerLabel={ui.annotateMarker}
                                    penLabel={ui.annotatePen}
                                    shapesLabel={ui.shapes}
                                    shapeLabel={ui.shapeRectangle}
                                    lineLabel={ui.shapeLine}
                                    arrowLabel={ui.shapeArrow}
                                    shapeThicknessLabel={ui.shapeThickness}
                                    penSizeLabel={ui.annotatePenSize}
                                    customColorLabel={ui.annotateCustomColor}
                                    color={(() => {
                                        if (selectedRectElement) return selectedRectElement.fill || selectedRectElement.stroke;
                                        if (selectedStrokeElement) return selectedStrokeElement.color;
                                        return ctrl.annotateMode === 'shapes' ? ctrl.shapeColor : ctrl.annotateColor;
                                    })()}
                                    mode={ctrl.annotateMode}
                                    shapePreset={ctrl.shapePreset}
                                    strokeWidth={(() => {
                                        if (selectedRectElement) return selectedRectElement.strokeWidth;
                                        if (selectedStrokeElement) return selectedStrokeElement.width;
                                        return ctrl.annotateMode === 'shapes' ? ctrl.shapeStrokeWidth : ctrl.annotateStrokeWidth;
                                    })()}
                                    onColorChange={(next) => {
                                        if (selectedRectElement) {
                                            ctrl.handleElementAction(selectedRectElement.id, 'update', { fill: selectedRectElement.fill !== 'transparent' ? next : 'transparent', stroke: selectedRectElement.stroke !== 'transparent' ? next : 'transparent' });
                                            return;
                                        }
                                        if (selectedStrokeElement) {
                                            ctrl.handleElementAction(selectedStrokeElement.id, 'update', { color: next });
                                            return;
                                        }
                                        if (ctrl.annotateMode === 'shapes') {
                                            ctrl.setShapeColor(next);
                                            return;
                                        }
                                        ctrl.setAnnotateColor(next);
                                    }}
                                    onModeChange={ctrl.setAnnotateMode}
                                    onShapePresetChange={ctrl.setShapePreset}
                                    onStrokeWidthChange={(next) => {
                                        if (selectedRectElement) {
                                            ctrl.handleElementAction(selectedRectElement.id, 'update', { strokeWidth: next });
                                            return;
                                        }
                                        if (selectedStrokeElement) {
                                            ctrl.handleElementAction(selectedStrokeElement.id, 'update', { width: next });
                                            return;
                                        }
                                        if (ctrl.annotateMode === 'shapes') {
                                            ctrl.setShapeStrokeWidth(next);
                                            return;
                                        }
                                        ctrl.setAnnotateStrokeWidth(next);
                                    }}
                                    onInsertPen={() => {
                                        commitPendingAnnotatePenIfNeeded();
                                    }}
                                    onClearPen={() => {
                                        editorRef.current?.clearPendingAnnotatePenDraft();
                                    }}
                                    hasPendingPenDraft={hasPendingAnnotatePenDraft}
                                    onDelete={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'delete') : undefined}
                                    onDuplicate={ctrl.selectedElementId ? () => ctrl.handleElementAction(ctrl.selectedElementId!, 'duplicate') : undefined}
                                />
                            )
                            : null;

    return (
        <section className="studio-edit-shell" translate="no" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Area */}
            <div className="studio-edit-meta" style={{ padding: '8px 16px', background: 'rgba(15,23,42,0.4)', borderRadius: '0 0 12px 12px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center' }}>
                    <button
                        type="button"
                        className="studio-edit-back-btn"
                        onClick={handleBackToCanvas}
                        title={ui.backToCanvas}
                        style={{ padding: '6px 12px' }}
                    >
                        <LinearIcon name="chevron-left" size={18} />
                        <span>{ui.backToCanvas}</span>
                    </button>

                    <div style={{ display: 'flex', gap: 8, padding: '0 8px', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <button type="button" data-testid="studio-edit-undo-btn" className="studio-edit-btn-cancel" onClick={ctrl.undo} disabled={ctrl.isApplying || ctrl.historyIndex <= 0} title={ui.undo} style={{ padding: '4px 8px', fontSize: 13, background: 'transparent' }}>
                            {ui.undo}
                        </button>
                        <button type="button" data-testid="studio-edit-redo-btn" className="studio-edit-btn-cancel" onClick={ctrl.redo} disabled={ctrl.isApplying || ctrl.historyIndex >= ctrl.history.length - 1} title={ui.redo} style={{ padding: '4px 8px', fontSize: 13, background: 'transparent' }}>
                            {ui.redo}
                        </button>
                    </div>

                    <span className="studio-edit-page-badge">{ctrl.preview.docName}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>

                    <div className="studio-edit-zoom-controls" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 8 }}>
                        <button type="button" className="studio-floating-btn" style={{ width: 24, height: 24 }} onClick={() => zoom.zoomOut()} title="Zoom Out">
                            <LinearIcon name="minus" size={14} />
                        </button>
                        <span style={{ fontSize: 13, minWidth: 44, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>{Math.round(zoom.zoomLevel * 100)}%</span>
                        <button type="button" className="studio-floating-btn" style={{ width: 24, height: 24 }} onClick={() => zoom.zoomIn()} title="Zoom In">
                            <LinearIcon name="plus" size={14} />
                        </button>
                        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                        <button type="button" className="studio-floating-btn" style={{ padding: '0 8px', height: 24, fontSize: 12 }} onClick={() => zoom.zoomToHundred()} title="100%">1:1</button>
                        <button type="button" className="studio-floating-btn" style={{ width: 24, height: 24 }} onClick={() => zoom.fitToPage(canvasSize.width, canvasSize.height)} title="Fit to Page">
                            <LinearIcon name="maximize" size={14} />
                        </button>
                        <button type="button" className="studio-floating-btn" style={{ width: 24, height: 24 }} onClick={() => zoom.fitToWidth(canvasSize.width)} title="Fit to Width">
                            <LinearIcon name="move-horizontal" size={14} />
                        </button>
                    </div>

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

                    {ctrl.saveUndoStack.length > 0 && (
                        <button type="button" className="studio-edit-btn-cancel" onClick={ctrl.undoLastSave} disabled={ctrl.isApplying} aria-label={ui.undoSave} style={{ padding: '6px 12px' }}>
                            {ui.undoSave}
                        </button>
                    )}
                    {ctrl.saveRedoStack.length > 0 && (
                        <button type="button" className="studio-edit-btn-cancel" onClick={ctrl.redoLastSave} disabled={ctrl.isApplying} aria-label={ui.redoSave} style={{ padding: '6px 12px' }}>
                            {ui.redoSave}
                        </button>
                    )}

                </div>
            </div>
            {/* Main Workspace Area (Toolbar + Canvas) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div style={{ padding: '0 16px', zIndex: 10 }}>
                    <StudioEditToolbar
                        ui={ui}
                        tool={ctrl.tool}
                        onSelectTool={ctrl.setTool}
                    />
                </div>

                <div
                    ref={zoom.containerRef}
                    className="studio-edit-canvas-wrap custom-scrollbar"
                    style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}
                >
                    <div style={{
                        // Provide enough space to keep it centered when zoom is small, but scrollable when big
                        minWidth: '100%',
                        minHeight: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px' // Add some padding so we can scroll past edges
                    }}>
                        <div
                            ref={surfaceRef}
                            className="studio-edit-canvas-surface"
                            style={{
                                width: canvasSize.width,
                                height: canvasSize.height,
                                position: 'relative',
                                transform: `scale(${zoom.zoomLevel})`,
                                transformOrigin: 'center center',
                                flexShrink: 0,
                                // These margins keep the flexing box aware of the transform size constraints
                                margin: `${Math.max(0, (scaledHeight - canvasSize.height) / 2)}px ${Math.max(0, (scaledWidth - canvasSize.width) / 2)}px`,
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={ctrl.preview.page.thumbnailUrl}
                                alt={`Page ${ctrl.preview.page.pageIndex + 1}`}
                                className="studio-edit-page-image"
                                crossOrigin="anonymous"
                                draggable={false}
                                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                            />
                            <StudioPageEditor
                                ref={editorRef}
                                page={ctrl.preview.page}
                                width={canvasSize.width}
                                height={canvasSize.height}
                                activeTool={ctrl.tool}
                                onActiveToolChange={ctrl.setTool}
                                textLayerSpans={ctrl.textLayerSpans}
                                isSelectMode={ctrl.isSelectMode}
                                setIsSelectMode={ctrl.setIsSelectMode}
                                textSelectionMode={ctrl.textSelectionMode}
                                onTextSelectionModeChange={ctrl.setTextSelectionMode}
                                annotateColor={ctrl.annotateColor}
                                annotateMode={ctrl.annotateMode}
                                annotateStrokeWidth={ctrl.annotateMode === 'shapes' ? ctrl.shapeStrokeWidth : ctrl.annotateStrokeWidth}
                                signMode={ctrl.signMode}
                                signColor={ctrl.signDrawColor}
                                signStrokeWidth={ctrl.signDrawStrokeWidth}
                                onPendingSignDraftChange={setHasPendingDrawnSignature}
                                onPendingAnnotatePenDraftChange={setHasPendingAnnotatePenDraft}
                                shapePreset={ctrl.shapePreset}
                                shapeColor={ctrl.shapeColor}
                                shapeStrokeWidth={ctrl.shapeStrokeWidth}
                                whiteoutColor={ctrl.whiteoutColor}
                                watermarkOptions={ctrl.watermarkOptions}
                                elements={ctrl.elements}
                                onElementsChange={ctrl.setElements}
                                onPushHistory={ctrl.pushHistory}
                                selectedElementId={ctrl.selectedElementId}
                                onSelectedElementIdChange={ctrl.setSelectedElementId}
                                textEditor={ctrl.textEditor}
                                onTextEditorChange={ctrl.setTextEditor}
                                onInlineUiStateChange={ctrl.setInlineUiState}
                                onMessageChange={ctrl.setMessage}
                                onFinish={() => {
                                    if (ctrl.textEditor) ctrl.commitTextEditor();
                                    handleSave();
                                }}
                                onDiscard={() => {
                                    if (ctrl.hasDirtyChanges && !window.confirm(ui.unsavedConfirm)) return;
                                    ctrl.navigate('/studio');
                                }}
                            />


                        </div>
                    </div>
                </div>

                {ctrl.message && (
                    <div className="studio-edit-message-overlay">
                        <p className="studio-edit-message-text">{ctrl.message}</p>
                        <button type="button" className="studio-edit-message-close" onClick={() => ctrl.setMessage(null)}>
                            &times;
                        </button>
                    </div>
                )}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <div className="studio-edit-bottom-save-wrap">
                    <button
                        type="button"
                        data-testid="studio-edit-save-btn"
                        className="studio-edit-btn-apply studio-edit-fixed-save-btn"
                        onClick={ctrl.tool === 'protect'
                            ? () => { void ctrl.protectAndReturnToStudio(ctrl.protectOptions); }
                            : handleSave}
                        disabled={ctrl.isApplying || (
                            ctrl.tool === 'protect'
                                ? (!protectPermissionsOnly && !protectUserPassword.trim())
                                : !hasPendingChanges
                        )}
                    >
                        {ctrl.isApplying
                            ? (ctrl.tool === 'protect' ? 'Protecting...' : ui.saving)
                            : (ctrl.tool === 'protect' ? ui.protect : ui.save)}
                    </button>
                </div>,
                document.body
            )}

            {topSettingsPanel && typeof document !== 'undefined' && createPortal(
                <div
                    className="studio-edit-floating-top-panel"
                    style={floatingPanelLayout
                        ? { left: `${floatingPanelLayout.left}px`, width: `${floatingPanelLayout.width}px`, transform: 'translateX(-50%)' }
                        : undefined}
                >
                    {topSettingsPanel}
                </div>,
                document.body
            )}
        </section>
    );
}
