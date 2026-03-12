import type { StudioCompressPdfSettings } from './use-studio-convert-controller';

interface StudioCompressPdfSettingsPanelProps {
  settings: StudioCompressPdfSettings;
  onChange: (next: StudioCompressPdfSettings) => void;
}

const QUALITY_OPTIONS: Array<{
  value: StudioCompressPdfSettings['quality'];
  label: string;
  hint: string;
}> = [
  { value: 'low', label: 'Low compression', hint: 'Higher quality, larger file size.' },
  { value: 'medium', label: 'Balanced', hint: 'Good default for most documents.' },
  { value: 'high', label: 'High compression', hint: 'Smaller file size, more aggressive optimization.' },
];

export function StudioCompressPdfSettingsPanel({
  settings,
  onChange,
}: StudioCompressPdfSettingsPanelProps) {
  return (
    <div className="studio-forms-quickbar-wrap" style={{ width: 260 }}>
      <div className="tool-config-card" style={{ display: 'grid', gap: 10 }}>
        <p className="tool-config-copy" style={{ margin: 0 }}>
          Compress the entire active PDF document using the selected optimization level.
        </p>

        <div style={{ display: 'grid', gap: 8 }}>
          {QUALITY_OPTIONS.map((option) => {
            const isActive = settings.quality === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={isActive ? 'btn-primary' : 'btn-ghost'}
                onClick={() => onChange({ quality: option.value })}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <span>
                  {option.label}
                  <span style={{ display: 'block', fontSize: 12, opacity: 0.8, fontWeight: 400 }}>
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
