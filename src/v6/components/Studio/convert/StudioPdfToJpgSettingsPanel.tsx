import type { StudioPdfToJpgSettings } from './use-studio-convert-controller';

interface StudioPdfToJpgSettingsPanelProps {
  settings: StudioPdfToJpgSettings;
  onChange: (next: StudioPdfToJpgSettings) => void;
}

export function StudioPdfToJpgSettingsPanel({ settings, onChange }: StudioPdfToJpgSettingsPanelProps) {
  return (
    <div className="studio-forms-quickbar-wrap" style={{ width: 260 }}>
      <div className="tool-config-card" style={{ display: 'grid', gap: 10 }}>
        <p className="tool-config-copy" style={{ margin: 0 }}>
          Each PDF page will be exported as a separate JPG.
        </p>

        <div>
          <label className="tool-config-label" htmlFor="studio-jpg-quality">Quality</label>
          <input
            id="studio-jpg-quality"
            type="range"
            min={20}
            max={100}
            step={1}
            value={settings.quality}
            onChange={(event) => onChange({ ...settings, quality: Number(event.target.value) })}
          />
          <div style={{ fontSize: 12, opacity: 0.8 }}>{settings.quality}%</div>
        </div>

        <div>
          <label className="tool-config-label" htmlFor="studio-jpg-dpi">DPI</label>
          <input
            id="studio-jpg-dpi"
            type="range"
            min={72}
            max={300}
            step={1}
            value={settings.dpi}
            onChange={(event) => onChange({ ...settings, dpi: Number(event.target.value) })}
          />
          <div style={{ fontSize: 12, opacity: 0.8 }}>{settings.dpi} DPI</div>
        </div>
      </div>
    </div>
  );
}
