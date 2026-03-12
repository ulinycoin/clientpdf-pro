import { useEffect, useState } from 'react';

export interface StudioExtractImagesSettings {
  format: 'png' | 'jpeg';
  jpegQuality: number;
  minWidth: number;
  minHeight: number;
  includeInlineImages: boolean;
  dedupe: boolean;
}

interface StudioExtractImagesSettingsPanelProps {
  settings: StudioExtractImagesSettings;
  onChange: (settings: StudioExtractImagesSettings) => void;
  foundCount: number;
  selectedCount: number;
}

export function StudioExtractImagesSettingsPanel({
  settings,
  onChange,
  foundCount,
  selectedCount,
}: StudioExtractImagesSettingsPanelProps) {
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  useEffect(() => {
    onChange(local);
  }, [local, onChange]);

  const set = <K extends keyof StudioExtractImagesSettings>(key: K, value: StudioExtractImagesSettings[K]) => {
    setLocal((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="studio-forms-quickbar-wrap" style={{ marginTop: 12, width: 260 }}>
      <div className="tool-config-card" style={{ display: 'grid', gap: '0.75rem' }}>
        <div>
          <label className="tool-config-label">Format</label>
          <select
            className="tool-config-select"
            value={local.format}
            onChange={(event) => set('format', event.target.value === 'jpeg' ? 'jpeg' : 'png')}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>

        {local.format === 'jpeg' && (
          <div>
            <label className="tool-config-label">JPEG quality</label>
            <input
              className="tool-config-input"
              type="number"
              min={30}
              max={100}
              value={Math.round(local.jpegQuality * 100)}
              onChange={(event) => {
                const next = Number(event.target.value);
                set('jpegQuality', Math.max(0.3, Math.min(1, (Number.isFinite(next) ? next : 92) / 100)));
              }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
          <div>
            <label className="tool-config-label">Min width</label>
            <input
              className="tool-config-input"
              type="number"
              min={1}
              value={local.minWidth}
              onChange={(event) => set('minWidth', Math.max(1, Math.round(Number(event.target.value) || 32)))}
            />
          </div>
          <div>
            <label className="tool-config-label">Min height</label>
            <input
              className="tool-config-input"
              type="number"
              min={1}
              value={local.minHeight}
              onChange={(event) => set('minHeight', Math.max(1, Math.round(Number(event.target.value) || 32)))}
            />
          </div>
        </div>

        <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          Include inline images
          <input
            type="checkbox"
            checked={local.includeInlineImages}
            onChange={(event) => set('includeInlineImages', event.target.checked)}
          />
        </label>

        <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          Remove duplicates
          <input
            type="checkbox"
            checked={local.dedupe}
            onChange={(event) => set('dedupe', event.target.checked)}
          />
        </label>

        <div style={{ display: 'grid', gap: '0.4rem', paddingTop: '0.25rem', borderTop: '1px solid rgba(148,163,184,0.16)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>Found images</span>
            <strong>{foundCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>Selected images</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 12, color: 'rgba(226,232,240,0.72)', lineHeight: 1.5 }}>
          Click highlighted image regions on the page previews to include or exclude them.
        </p>
      </div>
    </div>
  );
}
