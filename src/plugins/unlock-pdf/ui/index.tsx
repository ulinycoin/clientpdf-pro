import { useState } from 'react';

interface UnlockPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function UnlockPdfConfig({ onStart, onBack }: UnlockPdfConfigProps) {
  const [password, setPassword] = useState('');

  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">
        Enter the current password if the PDF is protected. Leave empty for files that are already unlocked.
      </p>

      <div className="tool-config-card">
        <label className="tool-config-label">Current Password (optional)</label>
        <input
          className="tool-config-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password used to open this PDF"
        />
      </div>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => onStart({ password })}>
          Run Unlock
        </button>
      </div>
    </div>
  );
}
