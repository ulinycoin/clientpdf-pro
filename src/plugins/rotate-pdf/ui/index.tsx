import { useState } from 'react';

interface RotatePdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function RotatePdfConfig({ inputFiles, onStart, onBack }: RotatePdfConfigProps) {
  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);

  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">
        Rotate all pages in <strong>{inputFiles.length}</strong> PDF file{inputFiles.length === 1 ? '' : 's'}.
      </p>

      <div className="tool-config-card">
        <div className="tool-config-options">
          {[90, 180, 270].map((value) => (
            <label key={value} className="tool-config-option">
              <input
                type="radio"
                name="degrees"
                value={value}
                checked={degrees === value}
                onChange={() => setDegrees(value as 90 | 180 | 270)}
              />
              {value}°
            </label>
          ))}
        </div>
      </div>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => onStart({ degrees })}>
          Run Rotate
        </button>
      </div>
    </div>
  );
}
