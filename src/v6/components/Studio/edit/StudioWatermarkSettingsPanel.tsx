import type { FontFamilyId } from '../inline-text-utils';

interface WatermarkOptions {
    text: string;
    color: string;
    fontSize: number;
    fontFamily: FontFamilyId;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    opacity: number;
    rotation: number;
    repeatEnabled: boolean;
    repeatCols: number;
    repeatRows: number;
    repeatGapX: number;
    repeatGapY: number;
}

interface StudioWatermarkSettingsPanelProps {
    options: WatermarkOptions;
    onOptionsChange: (next: WatermarkOptions) => void;
}

export function StudioWatermarkSettingsPanel({ options, onOptionsChange }: StudioWatermarkSettingsPanelProps) {
    const set = <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) => {
        onOptionsChange({ ...options, [key]: value });
    };

    return (
        <div className="studio-text-style-panel" style={{ marginTop: 12 }}>
            <label className="studio-text-style-field" style={{ minWidth: 210 }}>
                <span>Watermark text</span>
                <input
                    type="text"
                    value={options.text}
                    onChange={(event) => set('text', event.target.value)}
                    placeholder="CONFIDENTIAL"
                />
            </label>

            <label className="studio-text-style-field">
                <span>Color</span>
                <input type="color" value={options.color} onChange={(event) => set('color', event.target.value)} />
            </label>

            <label className="studio-text-style-field">
                <span>Size</span>
                <input
                    type="number"
                    min={8}
                    max={120}
                    value={options.fontSize}
                    onChange={(event) => set('fontSize', Math.max(8, Math.min(120, Number(event.target.value) || 30)))}
                />
            </label>

            <label className="studio-text-style-field">
                <span>Opacity</span>
                <input
                    type="number"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={options.opacity}
                    onChange={(event) => set('opacity', Math.max(0.05, Math.min(1, Number(event.target.value) || 0.25)))}
                />
            </label>

            <label className="studio-text-style-field">
                <span>Rotation (deg)</span>
                <input
                    type="number"
                    min={-180}
                    max={180}
                    value={options.rotation}
                    onChange={(event) => set('rotation', Math.max(-180, Math.min(180, Number(event.target.value) || 0)))}
                />
            </label>

            <label className="studio-text-style-field">
                <span>Font</span>
                <select
                    value={options.fontFamily}
                    onChange={(event) => set('fontFamily', event.target.value as FontFamilyId)}
                >
                    <option value="sora">Helvetica</option>
                    <option value="times">Times</option>
                    <option value="mono">Courier</option>
                    <option value="roboto">Roboto</option>
                    <option value="noto">Noto Sans</option>
                    <option value="noto-arabic">Noto Arabic</option>
                    <option value="noto-cjk">Noto CJK</option>
                    <option value="noto-devanagari">Noto Devanagari</option>
                </select>
            </label>

            <button
                type="button"
                className={`studio-text-style-toggle ${options.fontWeight === 'bold' ? 'active' : ''}`}
                onClick={() => set('fontWeight', options.fontWeight === 'bold' ? 'normal' : 'bold')}
            >
                Bold
            </button>

            <button
                type="button"
                className={`studio-text-style-toggle ${options.fontStyle === 'italic' ? 'active' : ''}`}
                onClick={() => set('fontStyle', options.fontStyle === 'italic' ? 'normal' : 'italic')}
            >
                Italic
            </button>

            <label className="studio-text-style-field" style={{ minWidth: 120 }}>
                <span>Repeat</span>
                <select
                    value={options.repeatEnabled ? 'on' : 'off'}
                    onChange={(event) => set('repeatEnabled', event.target.value === 'on')}
                >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                </select>
            </label>
        </div>
    );
}
