import { useState } from 'react';

interface EncryptPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function EncryptPdfConfig({ onStart, onBack }: EncryptPdfConfigProps) {
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [keyLength, setKeyLength] = useState<128 | 256>(256);

  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">Set a password to protect your files.</p>

      <div className="tool-config-card" style={{ display: 'grid', gap: '0.7rem' }}>
        <div>
          <label className="tool-config-label">User Password</label>
          <input
            className="tool-config-input"
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Required to open the PDF"
          />
        </div>

        <div>
          <label className="tool-config-label">Owner Password (optional)</label>
          <input
            className="tool-config-input"
            type="password"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            placeholder="Required to change permissions"
          />
        </div>

        <div>
          <label className="tool-config-label">Encryption Strength</label>
          <select
            className="tool-config-select"
            value={keyLength}
            onChange={(e) => setKeyLength(Number(e.target.value) === 128 ? 128 : 256)}
          >
            <option value={256}>AES-256 Bit (High Security)</option>
            <option value={128}>AES-128 Bit (Legacy)</option>
          </select>
        </div>
      </div>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button className="btn-primary" onClick={() => onStart({ userPassword, ownerPassword, keyLength })} disabled={!userPassword}>
          Run Encrypt
        </button>
      </div>
    </div>
  );
}
