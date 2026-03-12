import { LinearIcon } from '../../icons/linear-icon';

interface StudioWhiteoutSettingsPanelProps {
    title: string;
    customColorLabel: string;
    color: string;
    onColorChange: (color: string) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

const WHITEOUT_PRESETS = [
    '#ffffff', // Pure white
    '#f8f9fa', // Off-white
    '#f1f3f5', // Light grey
    '#fff8e1', // Cream
    '#fef3c7', // Warm light
    '#000000', // Black
];

export function StudioWhiteoutSettingsPanel({
    title,
    customColorLabel,
    color = '#ffffff',
    onColorChange,
    onDelete,
    onDuplicate,
}: StudioWhiteoutSettingsPanelProps) {
    return (
        <div className="studio-annotate-quickbar-wrap">
            <div className="studio-annotate-quickbar">
                <span className="studio-annotate-quickbar-label">{title}</span>
                <div className="studio-annotate-quickbar-swatches">
                    {WHITEOUT_PRESETS.map((preset) => (
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
