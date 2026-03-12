import { FontFamilyId, clamp } from '../inline-text-utils';
import { LinearIcon } from '../../icons/linear-icon';

interface StudioTextSettingsPanelProps {
    title: string;
    fontFamilyLabel: string;
    fontSizeLabel: string;
    textColorLabel: string;
    bgColorLabel: string;
    fontFamily: FontFamilyId;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    lineHeight: number;
    letterSpacing: number;
    color: string;
    backgroundColor: string;
    onStyleChange: (style: {
        fontFamily?: FontFamilyId;
        fontSize?: number;
        fontWeight?: 'normal' | 'bold';
        fontStyle?: 'normal' | 'italic';
        lineHeight?: number;
        letterSpacing?: number;
        color?: string;
        backgroundColor?: string
    }) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

export function StudioTextSettingsPanel({
    title,
    fontFamilyLabel,
    fontSizeLabel,
    textColorLabel,
    bgColorLabel,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    color,
    backgroundColor,
    onStyleChange,
    onDelete,
    onDuplicate,
}: StudioTextSettingsPanelProps) {
    return (
        <div className="studio-annotate-quickbar-wrap">
            <div className="studio-annotate-quickbar">
                <span className="studio-annotate-quickbar-label" style={{ marginRight: 12 }}>{title}</span>

                {/* Font Family Select */}
                <div style={{ marginRight: 16 }}>
                    <select
                        className="studio-floating-select font-family"
                        aria-label={fontFamilyLabel}
                        title={fontFamilyLabel}
                        value={fontFamily}
                        onChange={(e) => onStyleChange({ fontFamily: e.target.value as FontFamilyId })}
                        style={{ height: 32, padding: '0 8px', borderRadius: 4, background: 'var(--studio-surface)', color: 'var(--studio-text)', border: '1px solid var(--studio-border)' }}
                    >
                        <option value="roboto" style={{ fontWeight: 600 }}>Roboto (Latin/Cyrillic)</option>
                        <option value="noto">Noto Sans (International)</option>
                        <option value="noto-arabic">Noto Sans Arabic</option>
                        <option value="noto-cjk">Noto Sans CJK</option>
                        <option value="noto-devanagari">Noto Sans Devanagari</option>
                        <option value="sora">Helvetica</option>
                        <option value="times">Times New Roman</option>
                        <option value="mono">Courier</option>
                    </select>
                </div>

                {/* Font Size Input */}
                <div className="studio-annotate-quickbar-custom-color" style={{ marginRight: 16 }}>
                    <span>{fontSizeLabel}</span>
                    <input
                        type="number"
                        min={8}
                        max={96}
                        value={fontSize}
                        onChange={(e) => onStyleChange({ fontSize: clamp(Number(e.target.value) || 16, 8, 96) })}
                        style={{ width: 50, height: 28, padding: '0 8px', borderRadius: 4, background: 'var(--studio-surface)', color: 'var(--studio-text)', border: '1px solid var(--studio-border)' }}
                    />
                </div>

                {/* Bold/Italic */}
                <div className="studio-floating-group" style={{ marginRight: 16 }}>
                    <button
                        type="button"
                        className={`studio-floating-btn ${fontWeight === 'bold' ? 'active' : ''}`}
                        onClick={() => onStyleChange({ fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })}
                        title="Bold"
                        style={{ width: 32, height: 32 }}
                    >
                        <span style={{ fontWeight: 700 }}>B</span>
                    </button>
                    <button
                        type="button"
                        className={`studio-floating-btn ${fontStyle === 'italic' ? 'active' : ''}`}
                        onClick={() => onStyleChange({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
                        title="Italic"
                        style={{ width: 32, height: 32 }}
                    >
                        <span style={{ fontStyle: 'italic' }}>I</span>
                    </button>
                </div>

                {/* Spacing Controls */}
                <div className="studio-annotate-quickbar-custom-color" style={{ marginRight: 16 }} title="Line height">
                    <LinearIcon name="move-vertical" size={14} />
                    <input
                        type="number"
                        min={0.8}
                        max={3}
                        step={0.1}
                        value={lineHeight}
                        onChange={(e) => onStyleChange({ lineHeight: Number(e.target.value) || 1.2 })}
                        style={{ width: 45, height: 28, padding: '0 4px', borderRadius: 4, background: 'transparent', color: 'var(--studio-text)', border: 'none' }}
                    />
                </div>

                <div className="studio-annotate-quickbar-custom-color" style={{ marginRight: 16 }} title="Letter spacing">
                    <LinearIcon name="move-horizontal" size={14} />
                    <input
                        type="number"
                        min={-2}
                        max={10}
                        step={0.5}
                        value={letterSpacing}
                        onChange={(e) => onStyleChange({ letterSpacing: Number(e.target.value) || 0 })}
                        style={{ width: 45, height: 28, padding: '0 4px', borderRadius: 4, background: 'transparent', color: 'var(--studio-text)', border: 'none' }}
                    />
                </div>

                {/* Text Color Picker */}
                <label className="studio-annotate-quickbar-custom-color" title={textColorLabel} style={{ marginRight: 16 }}>
                    <span>{textColorLabel}</span>
                    <input type="color" value={color} onChange={(event) => onStyleChange({ color: event.target.value })} />
                </label>

                {/* Background Color Picker */}
                <label className="studio-annotate-quickbar-custom-color" title={bgColorLabel}>
                    <span>{bgColorLabel}</span>
                    <input type="color" value={backgroundColor} onChange={(event) => onStyleChange({ backgroundColor: event.target.value })} />
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
