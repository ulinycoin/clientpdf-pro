import { useState } from 'react';

interface ProtectPdfConfigProps {
  inputFiles: string[];
  onStart: (options: Record<string, unknown>) => void;
  onBack: () => void;
}

type SecurityPreset = 'basic' | 'business' | 'confidential' | 'custom';
type PrintingPermission = 'none' | 'low' | 'full';

export default function ProtectPdfConfig({ onStart, onBack }: ProtectPdfConfigProps) {
  const [permissionsOnly, setPermissionsOnly] = useState(true);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [useOwnerPassword, setUseOwnerPassword] = useState(false);
  const [keyLength, setKeyLength] = useState<128 | 256>(256);
  const [securityPreset, setSecurityPreset] = useState<SecurityPreset>('business');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [printing, setPrinting] = useState<PrintingPermission>('full');
  const [copying, setCopying] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [annotating, setAnnotating] = useState(false);
  const [fillingForms, setFillingForms] = useState(true);
  const [contentAccessibility, setContentAccessibility] = useState(true);
  const [documentAssembly, setDocumentAssembly] = useState(false);

  const applyPreset = (preset: SecurityPreset): void => {
    setSecurityPreset(preset);
    if (preset === 'custom') {
      return;
    }

    if (preset === 'basic') {
      setPrinting('full');
      setCopying(true);
      setModifying(false);
      setAnnotating(true);
      setFillingForms(true);
      setKeyLength(128);
      return;
    }

    if (preset === 'business') {
      setPrinting('full');
      setCopying(false);
      setModifying(false);
      setAnnotating(false);
      setFillingForms(true);
      setKeyLength(256);
      return;
    }

    setPrinting('none');
    setCopying(false);
    setModifying(false);
    setAnnotating(false);
    setFillingForms(false);
    setKeyLength(256);
  };

  const canRun = permissionsOnly || Boolean(userPassword.trim());
  const ownerToSend = useOwnerPassword ? ownerPassword.trim() : '';

  return (
    <div className="tool-config-root">
      <p className="tool-config-copy">
        Set passwords and restrictions to protect your document. Security enforcement depends on the target PDF viewer.
      </p>

      <div className="tool-config-card" style={{ display: 'grid', gap: '0.8rem' }}>
        <label className="tool-config-label">Security Preset</label>
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <button className={securityPreset === 'basic' ? 'btn-primary' : 'btn-ghost'} onClick={() => applyPreset('basic')}>Basic</button>
          <button className={securityPreset === 'business' ? 'btn-primary' : 'btn-ghost'} onClick={() => applyPreset('business')}>Business</button>
          <button className={securityPreset === 'confidential' ? 'btn-primary' : 'btn-ghost'} onClick={() => applyPreset('confidential')}>Confidential</button>
        </div>

        <label className="tool-config-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={permissionsOnly}
            onChange={(event) => {
              const next = event.target.checked;
              setPermissionsOnly(next);
              if (next) {
                setUserPassword('');
              }
            }}
          />
          Restrictions only (no password to open)
        </label>

        {!permissionsOnly && (
          <>
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

            <label className="tool-config-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={useOwnerPassword} onChange={(e) => setUseOwnerPassword(e.target.checked)} />
              Use different owner password
            </label>

            {useOwnerPassword && (
              <div>
                <label className="tool-config-label">Owner Password</label>
                <input
                  className="tool-config-input"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Used to change permissions"
                />
              </div>
            )}
          </>
        )}

        {permissionsOnly && (
          <div>
            <label className="tool-config-label">Owner Password (optional)</label>
            <input
              className="tool-config-input"
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="If empty, fallback owner password is generated"
            />
          </div>
        )}

        <div>
          <label className="tool-config-label">Encryption Strength</label>
          <select
            className="tool-config-select"
            value={keyLength}
            onChange={(e) => setKeyLength(Number(e.target.value) === 128 ? 128 : 256)}
          >
            <option value={256}>AES-256 Bit (Recommended)</option>
            <option value={128}>AES-128 Bit (Legacy)</option>
          </select>
        </div>

        <button className="btn-ghost" onClick={() => setShowAdvanced((value) => !value)}>
          {showAdvanced ? 'Hide' : 'Show'} Advanced Permissions
        </button>

        {showAdvanced && (
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            <div>
              <label className="tool-config-label">Printing</label>
              <select
                className="tool-config-select"
                value={printing}
                onChange={(e) => {
                  setSecurityPreset('custom');
                  const value = e.target.value;
                  setPrinting(value === 'none' || value === 'low' ? value : 'full');
                }}
              >
                <option value="none">None</option>
                <option value="low">Low Resolution</option>
                <option value="full">High Resolution</option>
              </select>
            </div>

            <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Allow copying
              <input type="checkbox" checked={copying} onChange={(e) => { setSecurityPreset('custom'); setCopying(e.target.checked); }} />
            </label>
            <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Allow modifying
              <input type="checkbox" checked={modifying} onChange={(e) => { setSecurityPreset('custom'); setModifying(e.target.checked); }} />
            </label>
            <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Allow annotations
              <input type="checkbox" checked={annotating} onChange={(e) => { setSecurityPreset('custom'); setAnnotating(e.target.checked); }} />
            </label>
            <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Allow filling forms
              <input type="checkbox" checked={fillingForms} onChange={(e) => { setSecurityPreset('custom'); setFillingForms(e.target.checked); }} />
            </label>
            <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Allow accessibility
              <input type="checkbox" checked={contentAccessibility} onChange={(e) => { setSecurityPreset('custom'); setContentAccessibility(e.target.checked); }} />
            </label>
            <label className="tool-config-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Allow document assembly
              <input type="checkbox" checked={documentAssembly} onChange={(e) => { setSecurityPreset('custom'); setDocumentAssembly(e.target.checked); }} />
            </label>
          </div>
        )}
      </div>

      <div className="tool-config-actions">
        <button className="btn-ghost" onClick={onBack}>
          Cancel
        </button>
        <button
          className="btn-primary"
          disabled={!canRun}
          onClick={() => onStart({
            permissionsOnly,
            userPassword: userPassword.trim(),
            ownerPassword: ownerToSend,
            keyLength,
            printing,
            copying,
            modifying,
            annotating,
            fillingForms,
            contentAccessibility,
            documentAssembly,
          })}
        >
          Run Protect
        </button>
      </div>
    </div>
  );
}
