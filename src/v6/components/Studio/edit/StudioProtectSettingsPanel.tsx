import { useEffect, useMemo, useState } from 'react';

interface StudioProtectSettingsPanelProps {
  onOptionsChange: (options: Record<string, unknown>) => void;
  ui: {
    protectPasswordRequired: string;
  };
}

type SecurityPreset = 'basic' | 'business' | 'confidential' | 'custom';
type PrintingPermission = 'none' | 'low' | 'full';

function ProtectToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'rgba(255,255,255,0.92)',
        whiteSpace: 'nowrap',
      }}
    >
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function StudioProtectSettingsPanel({ onOptionsChange, ui }: StudioProtectSettingsPanelProps) {
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

  const passwordError = useMemo(() => {
    if (!permissionsOnly && userPassword.trim().length === 0) {
      return ui.protectPasswordRequired;
    }
    return null;
  }, [permissionsOnly, ui.protectPasswordRequired, userPassword]);

  useEffect(() => {
    onOptionsChange({
      permissionsOnly,
      userPassword: permissionsOnly ? '' : userPassword.trim(),
      ownerPassword: useOwnerPassword ? ownerPassword.trim() : '',
      keyLength,
      printing,
      copying,
      modifying,
      annotating,
      fillingForms,
      contentAccessibility,
      documentAssembly,
    });
  }, [
    annotating,
    contentAccessibility,
    copying,
    documentAssembly,
    fillingForms,
    keyLength,
    modifying,
    onOptionsChange,
    ownerPassword,
    permissionsOnly,
    printing,
    useOwnerPassword,
    userPassword,
  ]);

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
      setContentAccessibility(true);
      setDocumentAssembly(false);
      setKeyLength(128);
      return;
    }
    if (preset === 'business') {
      setPrinting('full');
      setCopying(false);
      setModifying(false);
      setAnnotating(false);
      setFillingForms(true);
      setContentAccessibility(true);
      setDocumentAssembly(false);
      setKeyLength(256);
      return;
    }
    setPrinting('none');
    setCopying(false);
    setModifying(false);
    setAnnotating(false);
    setFillingForms(false);
    setContentAccessibility(true);
    setDocumentAssembly(false);
    setKeyLength(256);
  };

  const markCustom = () => setSecurityPreset('custom');

  return (
    <div className="studio-annotate-quickbar-wrap">
      <div
        className="studio-annotate-quickbar"
        style={{
          display: 'grid',
          gap: 12,
          alignItems: 'start',
          maxWidth: 'min(100%, 1040px)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span className="studio-annotate-quickbar-label" style={{ marginRight: 4 }}>Protect</span>
          <button type="button" className={securityPreset === 'basic' ? 'btn-primary' : 'btn-ghost'} onClick={() => applyPreset('basic')}>Basic</button>
          <button type="button" className={securityPreset === 'business' ? 'btn-primary' : 'btn-ghost'} onClick={() => applyPreset('business')}>Business</button>
          <button type="button" className={securityPreset === 'confidential' ? 'btn-primary' : 'btn-ghost'} onClick={() => applyPreset('confidential')}>Confidential</button>
          {securityPreset === 'custom' && <span style={{ fontSize: 12, opacity: 0.78 }}>Custom</span>}
          <button
            type="button"
            className="studio-floating-btn"
            onClick={() => setShowAdvanced((prev) => !prev)}
            style={{ width: 'auto', height: 32, padding: '0 12px' }}
          >
            {showAdvanced ? 'Hide advanced' : 'Advanced'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <ProtectToggle
            label="Restrictions only"
            checked={permissionsOnly}
            onChange={(checked) => {
              setPermissionsOnly(checked);
              if (checked) {
                setUserPassword('');
              }
            }}
          />
          <ProtectToggle
            label="Separate owner password"
            checked={useOwnerPassword}
            onChange={setUseOwnerPassword}
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ opacity: 0.8 }}>Encryption</span>
            <select
              className="studio-floating-select"
              value={keyLength}
              onChange={(event) => {
                markCustom();
                setKeyLength(Number(event.target.value) === 128 ? 128 : 256);
              }}
              style={{ height: 32, minWidth: 110 }}
            >
              <option value={256}>AES-256</option>
              <option value={128}>AES-128</option>
            </select>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ opacity: 0.8 }}>Printing</span>
            <select
              className="studio-floating-select"
              value={printing}
              onChange={(event) => {
                markCustom();
                const value = event.target.value;
                setPrinting(value === 'none' || value === 'low' ? value : 'full');
              }}
              style={{ height: 32, minWidth: 144 }}
            >
              <option value="none">No printing</option>
              <option value="low">Low resolution</option>
              <option value="full">High resolution</option>
            </select>
          </label>
        </div>

        {(!permissionsOnly || useOwnerPassword) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {!permissionsOnly && (
              <label style={{ display: 'grid', gap: 4, minWidth: 220 }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Open password</span>
                <input
                  className="tool-config-input"
                  type="password"
                  value={userPassword}
                  onChange={(event) => setUserPassword(event.target.value)}
                  placeholder="Required to open"
                  style={{ height: 32 }}
                />
              </label>
            )}
            {useOwnerPassword && (
              <label style={{ display: 'grid', gap: 4, minWidth: 220 }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Owner password</span>
                <input
                  className="tool-config-input"
                  type="password"
                  value={ownerPassword}
                  onChange={(event) => setOwnerPassword(event.target.value)}
                  placeholder="Required to change restrictions"
                  style={{ height: 32 }}
                />
              </label>
            )}
            {passwordError && <span style={{ color: '#fca5a5', fontSize: 12 }}>{passwordError}</span>}
          </div>
        )}

        {showAdvanced && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              paddingTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <ProtectToggle label="Copy" checked={copying} onChange={(checked) => { markCustom(); setCopying(checked); }} />
            <ProtectToggle label="Modify" checked={modifying} onChange={(checked) => { markCustom(); setModifying(checked); }} />
            <ProtectToggle label="Annotations" checked={annotating} onChange={(checked) => { markCustom(); setAnnotating(checked); }} />
            <ProtectToggle label="Forms" checked={fillingForms} onChange={(checked) => { markCustom(); setFillingForms(checked); }} />
            <ProtectToggle label="Accessibility" checked={contentAccessibility} onChange={(checked) => { markCustom(); setContentAccessibility(checked); }} />
            <ProtectToggle label="Assembly" checked={documentAssembly} onChange={(checked) => { markCustom(); setDocumentAssembly(checked); }} />
          </div>
        )}
      </div>
    </div>
  );
}
