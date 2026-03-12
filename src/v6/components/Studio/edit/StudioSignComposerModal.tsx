import { useEffect, useMemo, useRef, useState } from 'react';

type SignTab = 'type' | 'draw' | 'upload';

interface SignatureImagePayload {
    dataUrl: string;
    width: number;
    height: number;
}

interface StudioSignComposerModalProps {
    open: boolean;
    ui: any;
    onClose: () => void;
    onInsertText: (payload: { value: string; fontSize: number }) => void;
    onInsertImage: (payload: SignatureImagePayload) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
        image.onerror = () => reject(new Error('Failed to decode image'));
        image.src = dataUrl;
    });
}

function extractDrawnRegion(canvas: HTMLCanvasElement): SignatureImagePayload | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 5) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) return null;

    const pad = 8;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
    const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);

    const out = document.createElement('canvas');
    out.width = Math.max(1, cropW);
    out.height = Math.max(1, cropH);
    const outCtx = out.getContext('2d');
    if (!outCtx) return null;
    outCtx.putImageData(ctx.getImageData(cropX, cropY, cropW, cropH), 0, 0);
    return {
        dataUrl: out.toDataURL('image/png'),
        width: out.width,
        height: out.height,
    };
}

export function StudioSignComposerModal({ open, ui, onClose, onInsertText, onInsertImage }: StudioSignComposerModalProps) {
    const [tab, setTab] = useState<SignTab>('type');
    const [typedSignature, setTypedSignature] = useState('');
    const [typedFontSize, setTypedFontSize] = useState(30);
    const [drawColor, setDrawColor] = useState('#111827');
    const [uploadedImage, setUploadedImage] = useState<SignatureImagePayload | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const undoStackRef = useRef<ImageData[]>([]);
    const [canUndoDraw, setCanUndoDraw] = useState(false);

    useEffect(() => {
        if (!open) return;
        setTab('type');
        setTypedFontSize(30);
    }, [open]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = drawColor;
    }, [drawColor, open]);

    const tabTitle = useMemo(() => ui?.sign || 'Sign', [ui]);

    const syncUndoState = () => {
        setCanUndoDraw(undoStackRef.current.length > 1);
    };

    const seedCanvasUndo = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        undoStackRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
        syncUndoState();
    };

    const pushCanvasSnapshot = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStackRef.current.length > 30) {
            undoStackRef.current.shift();
        }
        syncUndoState();
    };

    const undoLastDraw = () => {
        if (undoStackRef.current.length <= 1) return;
        undoStackRef.current.pop();
        const snapshot = undoStackRef.current[undoStackRef.current.length - 1];
        const canvas = canvasRef.current;
        if (!canvas || !snapshot) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.putImageData(snapshot, 0, 0);
        syncUndoState();
    };

    const getWorldPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
        const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
        return { x, y };
    };

    const onDrawPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawingRef.current = true;
        const point = getWorldPoint(event);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    };

    const onDrawPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const point = getWorldPoint(event);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const wasDrawing = drawingRef.current;
        drawingRef.current = false;
        if (wasDrawing) {
            pushCanvasSnapshot();
        }
    };

    const clearDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        seedCanvasUndo();
    };

    useEffect(() => {
        if (!open || tab !== 'draw') return;
        const timer = window.setTimeout(() => seedCanvasUndo(), 0);
        return () => window.clearTimeout(timer);
    }, [open, tab]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (tab !== 'draw') return;
            const key = event.key.toLowerCase();
            if ((event.ctrlKey || event.metaKey) && key === 'z') {
                event.preventDefault();
                undoLastDraw();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, tab]);

    const onUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        if (!dataUrl.startsWith('data:image/')) return;
        const dims = await loadImageDimensions(dataUrl);
        setUploadedImage({ dataUrl, width: dims.width, height: dims.height });
    };

    const applyCurrentTab = () => {
        if (tab === 'type') {
            onInsertText({ value: (typedSignature || 'Signature').trim(), fontSize: typedFontSize });
            onClose();
            return;
        }
        if (tab === 'draw') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const payload = extractDrawnRegion(canvas);
            if (!payload) return;
            onInsertImage(payload);
            onClose();
            return;
        }
        if (uploadedImage) {
            onInsertImage(uploadedImage);
            onClose();
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div className="studio-sign-modal-backdrop" onClick={onClose}>
            <div className="studio-sign-modal" onClick={(event) => event.stopPropagation()}>
                <div className="studio-sign-modal-head">
                    <h3>{tabTitle}</h3>
                    <div className="studio-sign-head-actions">
                        {tab === 'draw' && (
                            <button type="button" className="btn-ghost studio-sign-undo-btn" onClick={undoLastDraw} disabled={!canUndoDraw}>
                                Undo
                            </button>
                        )}
                        <button type="button" className="studio-sign-close" onClick={onClose} aria-label="Close">
                            ×
                        </button>
                    </div>
                </div>
                <div className="ocr-concept-tabs studio-sign-tabs">
                    <button type="button" className={`ocr-concept-tab ${tab === 'type' ? 'active' : ''}`} onClick={() => setTab('type')}>Type</button>
                    <button type="button" className={`ocr-concept-tab ${tab === 'draw' ? 'active' : ''}`} onClick={() => setTab('draw')}>Draw</button>
                    <button type="button" className={`ocr-concept-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>Upload Image</button>
                </div>

                <div className="studio-sign-content">
                    {tab === 'type' && (
                        <div className="studio-sign-type-pane">
                            <label htmlFor="studio-sign-type-input">Signature text</label>
                            <input
                                id="studio-sign-type-input"
                                className="tool-config-input"
                                value={typedSignature}
                                onChange={(event) => setTypedSignature(event.target.value)}
                                placeholder="Type your signature"
                            />
                            <label htmlFor="studio-sign-type-size">Text size</label>
                            <div className="studio-sign-type-size">
                                <input
                                    id="studio-sign-type-size"
                                    type="range"
                                    min={12}
                                    max={96}
                                    value={typedFontSize}
                                    onChange={(event) => setTypedFontSize(Number(event.target.value) || 30)}
                                />
                                <input
                                    type="number"
                                    className="tool-config-input"
                                    min={12}
                                    max={96}
                                    value={typedFontSize}
                                    onChange={(event) => setTypedFontSize(Number(event.target.value) || 30)}
                                />
                            </div>
                        </div>
                    )}

                    {tab === 'draw' && (
                        <div className="studio-sign-draw-pane">
                            <div className="studio-sign-draw-actions">
                                <input type="color" value={drawColor} onChange={(event) => setDrawColor(event.target.value)} />
                                <button type="button" className="btn-ghost" onClick={clearDrawing}>Clear</button>
                            </div>
                            <canvas
                                ref={canvasRef}
                                width={900}
                                height={260}
                                className="studio-sign-canvas"
                                onPointerDown={onDrawPointerDown}
                                onPointerMove={onDrawPointerMove}
                                onPointerUp={stopDrawing}
                                onPointerLeave={stopDrawing}
                            />
                        </div>
                    )}

                    {tab === 'upload' && (
                        <div className="studio-sign-upload-pane">
                            <input className="tool-config-input" type="file" accept="image/png,image/jpeg,image/jpg" onChange={onUploadChange} />
                            {uploadedImage && <img src={uploadedImage.dataUrl} alt="Signature preview" className="studio-sign-upload-preview" />}
                        </div>
                    )}
                </div>

                <div className="studio-sign-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={applyCurrentTab}>Insert</button>
                </div>
            </div>
        </div>
    );
}
