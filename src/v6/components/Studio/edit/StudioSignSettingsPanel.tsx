import { useRef, type ChangeEvent } from 'react';
import { LinearIcon } from '../../icons/linear-icon';

interface StudioSignSettingsPanelProps {
    title: string;
    mode: 'type' | 'draw';
    typedValue: string;
    typedFontSize: number;
    drawColor: string;
    drawStrokeWidth: number;
    onModeChange: (mode: 'type' | 'draw') => void;
    onTypedValueChange: (value: string) => void;
    onTypedFontSizeChange: (size: number) => void;
    onDrawColorChange: (color: string) => void;
    onDrawStrokeWidthChange: (size: number) => void;
    onInsertTyped: () => void;
    onInsertDrawn: () => void;
    onClearDrawn: () => void;
    onUploadImage: (payload: { dataUrl: string; width: number; height: number }) => void;
    hasPendingDrawnSignature?: boolean;
    onDelete?: () => void;
    onDuplicate?: () => void;
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

export function StudioSignSettingsPanel({
    title,
    mode,
    typedValue,
    typedFontSize,
    drawColor,
    drawStrokeWidth,
    onModeChange,
    onTypedValueChange,
    onTypedFontSizeChange,
    onDrawColorChange,
    onDrawStrokeWidthChange,
    onInsertTyped,
    onInsertDrawn,
    onClearDrawn,
    onUploadImage,
    hasPendingDrawnSignature = false,
    onDelete,
    onDuplicate,
}: StudioSignSettingsPanelProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const onUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            const dataUrl = await readFileAsDataUrl(file);
            if (!dataUrl.startsWith('data:image/')) return;
            const dims = await loadImageDimensions(dataUrl);
            onUploadImage({ dataUrl, width: dims.width, height: dims.height });
        } catch {
            // Ignore invalid images and preserve current workspace state.
        }
    };

    return (
        <div className="studio-annotate-quickbar-wrap">
            <div className={`studio-annotate-quickbar studio-sign-quickbar ${mode === 'type' ? 'is-type' : 'is-draw'}`}>
                <div className="studio-sign-quickbar-left">
                    <span className="studio-annotate-quickbar-label">{title}</span>
                    <div className="studio-annotate-mode-toggle" role="group" aria-label="Type">
                        <button
                            type="button"
                            className={`studio-annotate-mode-btn ${mode === 'type' ? 'active' : ''}`}
                            onClick={() => onModeChange('type')}
                        >
                            Type
                        </button>
                        <button
                            type="button"
                            className={`studio-annotate-mode-btn ${mode === 'draw' ? 'active' : ''}`}
                            onClick={() => onModeChange('draw')}
                        >
                            Draw
                        </button>
                    </div>
                </div>

                <div className="studio-sign-quickbar-main">
                    {mode === 'type' ? (
                        <div className="studio-sign-type-toolbar">
                            <div className="studio-sign-type-toolbar-row">
                                <label className="studio-annotate-quickbar-custom-color">
                                    <span>Size</span>
                                    <input
                                        type="number"
                                        min={12}
                                        max={96}
                                        value={typedFontSize}
                                        onChange={(event) => onTypedFontSizeChange(Math.max(12, Math.min(96, Number(event.target.value) || 30)))}
                                        style={{ width: 56, height: 28, border: 'none', background: 'transparent', color: 'var(--studio-text)' }}
                                    />
                                </label>
                                <button
                                    type="button"
                                    className="studio-floating-btn"
                                    onClick={onInsertTyped}
                                    title="Insert typed signature"
                                    style={{ height: 32, padding: '0 10px', width: 'auto' }}
                                >
                                    Insert
                                </button>
                                <button
                                    type="button"
                                    className="studio-floating-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Upload image"
                                    style={{ width: 'auto', height: 32, padding: '0 10px', gap: 6 }}
                                >
                                    <LinearIcon name="upload" size={14} />
                                    <span>Upload image</span>
                                </button>
                            </div>
                            <input
                                type="text"
                                value={typedValue}
                                onChange={(event) => onTypedValueChange(event.target.value)}
                                placeholder="Type your signature"
                                className="studio-floating-select"
                                style={{ minWidth: 220, height: 32, width: '100%' }}
                            />
                        </div>
                    ) : (
                        <>
                            <label className="studio-annotate-quickbar-custom-color" title={drawColor}>
                                <span>Color</span>
                                <input type="color" value={drawColor} onChange={(event) => onDrawColorChange(event.target.value)} />
                            </label>
                            <label className="studio-annotate-quickbar-custom-color">
                                <span>Pen size</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={12}
                                    step={1}
                                    value={drawStrokeWidth}
                                    onChange={(event) => onDrawStrokeWidthChange(Math.max(1, Math.min(12, Number(event.target.value) || 3)))}
                                />
                            </label>
                            <button
                                type="button"
                                className="studio-floating-btn"
                                onClick={onInsertDrawn}
                                disabled={!hasPendingDrawnSignature}
                                title="Insert drawn signature"
                                style={{ height: 32, padding: '0 10px', width: 'auto' }}
                            >
                                Insert
                            </button>
                            <button
                                type="button"
                                className="studio-floating-btn"
                                onClick={onClearDrawn}
                                disabled={!hasPendingDrawnSignature}
                                title="Clear drawn signature"
                                style={{ height: 32, padding: '0 10px', width: 'auto' }}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className="studio-floating-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload image"
                                style={{ width: 'auto', height: 32, padding: '0 10px', gap: 6 }}
                            >
                                <LinearIcon name="upload" size={14} />
                                <span>Upload image</span>
                            </button>
                            <span className="studio-annotate-quickbar-caption">Draw directly on page</span>
                        </>
                    )}
                </div>

                <div className="studio-sign-quickbar-actions">
                    {onDuplicate && (
                        <button
                            type="button"
                            className="studio-floating-btn"
                            onClick={onDuplicate}
                            title="Duplicate"
                            style={{ width: 32, height: 32 }}
                        >
                            <LinearIcon name="copy" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            className="studio-floating-btn delete"
                            onClick={onDelete}
                            title="Delete"
                            style={{ width: 32, height: 32, color: '#ef4444' }}
                        >
                            <LinearIcon name="x" />
                        </button>
                    )}
                </div>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{ display: 'none' }}
                    aria-hidden="true"
                    tabIndex={-1}
                    onChange={onUploadChange}
                />
            </div>
        </div>
    );
}
