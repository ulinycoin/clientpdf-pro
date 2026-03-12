import { LinearIcon } from '../../icons/linear-icon';
import type { ShapePreset } from '../editor-types';

interface StudioAnnotateSettingsPanelProps {
    title: string;
    highlightLabel: string;
    markerLabel: string;
    penLabel: string;
    shapesLabel: string;
    shapeLabel: string;
    lineLabel: string;
    arrowLabel: string;
    shapeThicknessLabel: string;
    penSizeLabel: string;
    customColorLabel: string;
    color: string;
    mode: 'highlight' | 'pen' | 'shapes';
    shapePreset: ShapePreset;
    strokeWidth: number;
    onColorChange: (color: string) => void;
    onModeChange: (mode: 'highlight' | 'pen' | 'shapes') => void;
    onShapePresetChange: (preset: ShapePreset) => void;
    onStrokeWidthChange: (width: number) => void;
    onInsertPen?: () => void;
    onClearPen?: () => void;
    hasPendingPenDraft?: boolean;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

const MARKER_COLORS = [
    '#b9f86a',
    '#fff176',
    '#ffb74d',
    '#ff8a65',
    '#ff80ab',
    '#80deea',
];

export function StudioAnnotateSettingsPanel({
    title,
    highlightLabel,
    markerLabel,
    penLabel,
    shapesLabel,
    shapeLabel,
    lineLabel,
    arrowLabel,
    shapeThicknessLabel,
    penSizeLabel,
    customColorLabel,
    color,
    mode,
    shapePreset,
    strokeWidth,
    onColorChange,
    onModeChange,
    onShapePresetChange,
    onStrokeWidthChange,
    onInsertPen,
    onClearPen,
    hasPendingPenDraft = false,
    onDelete,
    onDuplicate,
}: StudioAnnotateSettingsPanelProps) {
    return (
        <div className="studio-annotate-quickbar-wrap">
            <div className="studio-annotate-quickbar">
                <span className="studio-annotate-quickbar-label">{title}</span>
                <span className="studio-annotate-quickbar-caption">{mode === 'shapes' ? shapesLabel : highlightLabel}</span>
                <div className="studio-annotate-mode-toggle" role="group" aria-label={title}>
                    <button
                        type="button"
                        className={`studio-annotate-mode-btn ${mode === 'highlight' ? 'active' : ''}`}
                        onClick={() => onModeChange('highlight')}
                    >
                        {markerLabel}
                    </button>
                    <button
                        type="button"
                        className={`studio-annotate-mode-btn ${mode === 'pen' ? 'active' : ''}`}
                        onClick={() => onModeChange('pen')}
                    >
                        {penLabel}
                    </button>
                    <button
                        type="button"
                        className={`studio-annotate-mode-btn ${mode === 'shapes' ? 'active' : ''}`}
                        onClick={() => onModeChange('shapes')}
                    >
                        {shapesLabel}
                    </button>
                </div>
                {mode === 'shapes' && (
                    <div className="studio-annotate-mode-toggle" role="group" aria-label={shapesLabel}>
                        <button
                            type="button"
                            className={`studio-annotate-mode-btn ${shapePreset === 'rectangle' ? 'active' : ''}`}
                            onClick={() => onShapePresetChange('rectangle')}
                            title={shapeLabel}
                        >
                            <LinearIcon name="shape" size={14} />
                            <span style={{ marginLeft: 6 }}>{shapeLabel}</span>
                        </button>
                        <button
                            type="button"
                            className={`studio-annotate-mode-btn ${shapePreset === 'line' ? 'active' : ''}`}
                            onClick={() => onShapePresetChange('line')}
                            title={lineLabel}
                        >
                            {lineLabel}
                        </button>
                        <button
                            type="button"
                            className={`studio-annotate-mode-btn ${shapePreset === 'arrow' ? 'active' : ''}`}
                            onClick={() => onShapePresetChange('arrow')}
                            title={arrowLabel}
                        >
                            {arrowLabel}
                        </button>
                    </div>
                )}
                <div className="studio-annotate-quickbar-swatches">
                    {MARKER_COLORS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => onColorChange(preset)}
                            title={preset}
                            className={`studio-annotate-swatch ${color.toLowerCase() === preset.toLowerCase() ? 'active' : ''}`}
                            style={{ background: preset }}
                        />
                    ))}
                </div>
                <label className="studio-annotate-quickbar-custom-color" title={color}>
                    <span>{customColorLabel}</span>
                    <input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} />
                </label>
                {(mode === 'pen' || mode === 'shapes') && (
                    <label className="studio-annotate-quickbar-custom-color">
                        <span>{mode === 'pen' ? penSizeLabel : shapeThicknessLabel}</span>
                        <input
                            type="range"
                            min={1}
                            max={18}
                            step={1}
                            value={strokeWidth}
                            onChange={(event) => onStrokeWidthChange(Math.max(1, Math.min(18, Number(event.target.value) || 5)))}
                        />
                    </label>
                )}
                {mode === 'pen' && (
                    <>
                        <button
                            type="button"
                            className="studio-floating-btn"
                            onClick={onInsertPen}
                            disabled={!hasPendingPenDraft}
                            title="Insert pen annotation"
                            style={{ height: 32, padding: '0 10px', width: 'auto' }}
                        >
                            Insert
                        </button>
                        <button
                            type="button"
                            className="studio-floating-btn"
                            onClick={onClearPen}
                            disabled={!hasPendingPenDraft}
                            title="Clear pen annotation"
                            style={{ height: 32, padding: '0 10px', width: 'auto' }}
                        >
                            Clear
                        </button>
                    </>
                )}

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
                    <>
                        <div className="studio-floating-divider" style={{ margin: '0 12px' }} />
                        <button
                            type="button"
                            className="studio-floating-btn delete"
                            onClick={onDelete}
                            title="Delete"
                            style={{ width: 32, height: 32, color: '#ef4444' }}
                        >
                            <LinearIcon name="x" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
