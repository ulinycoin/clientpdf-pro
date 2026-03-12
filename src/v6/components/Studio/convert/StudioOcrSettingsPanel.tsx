import type { StudioOcrSettings } from './use-studio-convert-controller';

interface StudioOcrSettingsPanelProps {
  settings: StudioOcrSettings;
  onChange: (next: StudioOcrSettings) => void;
}

export function StudioOcrSettingsPanel({ settings, onChange }: StudioOcrSettingsPanelProps) {
  return (
    <div className="studio-forms-quickbar-wrap" style={{ width: 260 }}>
      <div className="tool-config-card" style={{ display: 'grid', gap: 10 }}>
        <div>
          <label className="tool-config-label" htmlFor="studio-ocr-language-mode">Language mode</label>
          <select
            id="studio-ocr-language-mode"
            className="tool-config-select"
            value={settings.languageMode}
            onChange={(event) => onChange({
              ...settings,
              languageMode: event.target.value === 'manual' ? 'manual' : 'auto',
            })}
          >
            <option value="auto">Auto detect</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="tool-config-label" htmlFor="studio-ocr-language">OCR language</label>
          <select
            id="studio-ocr-language"
            className="tool-config-select"
            value={settings.language}
            disabled={settings.languageMode !== 'manual'}
            onChange={(event) => onChange({ ...settings, language: event.target.value })}
          >
            <option value="rus+eng">Russian + English</option>
            <option value="eng">English</option>
            <option value="rus">Russian</option>
            <option value="ukr">Ukrainian</option>
            <option value="deu">German</option>
            <option value="fra">French</option>
            <option value="spa">Spanish</option>
            <option value="ita">Italian</option>
            <option value="por">Portuguese</option>
            <option value="jpn">Japanese</option>
            <option value="chi_sim">Chinese (Simplified)</option>
            <option value="hin">Hindi</option>
            <option value="ara">Arabic</option>
          </select>
        </div>

        <div>
          <span className="tool-config-label">Mode</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className={settings.mode === 'accurate' ? 'btn-primary' : 'btn-ghost'}
              onClick={() => onChange({ ...settings, mode: 'accurate' })}
            >
              Accurate
            </button>
            <button
              type="button"
              className={settings.mode === 'fast' ? 'btn-primary' : 'btn-ghost'}
              onClick={() => onChange({ ...settings, mode: 'fast' })}
            >
              Fast
            </button>
          </div>
        </div>

        <label className="tool-config-label" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <input
            type="checkbox"
            checked={settings.preserveFormatting}
            onChange={(event) => onChange({ ...settings, preserveFormatting: event.target.checked })}
          />
          Preserve formatting
        </label>
        <label className="tool-config-label" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <input
            type="checkbox"
            checked={settings.detectTables}
            onChange={(event) => onChange({ ...settings, detectTables: event.target.checked })}
          />
          Detect tables
        </label>

        <div>
          <label className="tool-config-label" htmlFor="studio-ocr-output-format">Output format</label>
          <select
            id="studio-ocr-output-format"
            className="tool-config-select"
            value={settings.outputFormat}
            onChange={(event) => {
              const next = event.target.value;
              onChange({
                ...settings,
                outputFormat: next === 'json' ? 'json' : next === 'searchable-pdf' ? 'searchable-pdf' : 'txt',
              });
            }}
          >
            <option value="txt">TXT</option>
            <option value="searchable-pdf">Searchable PDF</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
    </div>
  );
}
