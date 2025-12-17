import React, { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { protectPDF, getPDFInfo } from '@/services/pdfService';
import type { ProtectionSettings, PasswordStrength, UploadedFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Shield, Eye, EyeOff, FileCheck, FileText } from 'lucide-react';


export const ProtectPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile } = useSharedFile();

  // State
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showOwnerPasswordToggle, setShowOwnerPasswordToggle] = useState(false);
  const [permissionsOnly, setPermissionsOnly] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState<'aes128' | 'aes256'>('aes256');
  const [permissions, setPermissions] = useState({
    printing: 'highResolution' as 'none' | 'lowResolution' | 'highResolution',
    modifying: false,
    copying: false,
    annotating: false,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: false,
  });
  const [securityPreset, setSecurityPreset] = useState<'basic' | 'business' | 'confidential' | 'custom'>('business');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; metadata: Record<string, unknown> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sharedFile && !file) {
      const loadedFile = new File([sharedFile.blob], sharedFile.name, { type: 'application/pdf' });
      handleFileSelect([loadedFile]);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Security presets logic
  const applyPreset = (preset: typeof securityPreset) => {
    setSecurityPreset(preset);
    if (preset === 'custom') return;

    // Reset permissions based on preset
    const defaults = {
      basic: { printing: 'highResolution', modifying: false, copying: true, annotating: true, fillingForms: true, level: 'aes128' },
      business: { printing: 'highResolution', modifying: false, copying: false, annotating: false, fillingForms: true, level: 'aes256' },
      confidential: { printing: 'none', modifying: false, copying: false, annotating: false, fillingForms: false, level: 'aes256' }
    } as const;

    const s = defaults[preset];
    setPermissions(p => ({
      ...p,
      printing: s.printing as 'none' | 'lowResolution' | 'highResolution',
      modifying: s.modifying,
      copying: s.copying,
      annotating: s.annotating,
      fillingForms: s.fillingForms,
    }));
    setEncryptionLevel(s.level as 'aes128' | 'aes256');
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];
    if (password.length >= 8) score++; else feedback.push('tooShort');
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return { score: Math.min(4, Math.floor(score)), feedback, isValid: password.length >= 6 };
  };

  useEffect(() => {
    if (userPassword) setPasswordStrength(checkPasswordStrength(userPassword));
    else setPasswordStrength(null);
  }, [userPassword]);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      let info = undefined;
      try { info = await getPDFInfo(selectedFile); } catch { /* ignore */ }

      setFile({
        id: Date.now().toString(),
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        status: 'completed',
        info
      });
      setError(null);
      setResult(null);
    }
  };

  const handleProtect = async () => {
    if (!file) return;
    if (!permissionsOnly && !userPassword) {
      setError(t('protect.errors.passwordRequired'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const settings: ProtectionSettings = {
        userPassword: permissionsOnly ? '' : userPassword,
        ownerPassword: permissionsOnly ? 'owner-only-restrictions' : (showOwnerPasswordToggle && ownerPassword ? ownerPassword : userPassword),
        encryption: encryptionLevel,
        permissions,
      };

      const protectedPdf = await protectPDF(file.file, settings, () => { });
      const blob = new Blob([protectedPdf as BlobPart], { type: 'application/pdf' });

      setResult({
        blob,
        filename: file.name.replace('.pdf', '_protected.pdf'),
        metadata: {
          encryption: encryptionLevel,
          hasPassword: !permissionsOnly
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Protection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setUserPassword('');
    setOwnerPassword('');
    setError(null);
  };

  const renderPasswordInput = () => (
    <div className="space-y-4 pt-2">
      <div>
        <Label>{t('protect.userPassword')}</Label>
        <div className="relative mt-1">
          <Input
            type={showUserPassword ? 'text' : 'password'}
            value={userPassword}
            onChange={e => setUserPassword(e.target.value)}
            className="pr-10"
          />
          <button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordStrength && (
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`h-1 flex-1 rounded-full ${l <= passwordStrength.score ? (passwordStrength.score < 2 ? 'bg-red-500' : passwordStrength.score < 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          <Checkbox id="owner" checked={showOwnerPasswordToggle} onCheckedChange={(c) => setShowOwnerPasswordToggle(c as boolean)} />
          <Label htmlFor="owner">{t('protect.useOwnerPassword')}</Label>
        </div>
        {showOwnerPasswordToggle && (
          <div className="relative">
            <Input
              type={showOwnerPassword ? 'text' : 'password'}
              value={ownerPassword}
              onChange={e => setOwnerPassword(e.target.value)}
              placeholder={t('protect.ownerPasswordPlaceholder')}
            />
            <button type="button" onClick={() => setShowOwnerPassword(!showOwnerPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2"><Shield className="w-4 h-4" /> {t('protect.securityLevel')}</Label>
        <div className="grid grid-cols-1 gap-2">
          {(['basic', 'business', 'confidential'] as const).map(preset => (
            <div key={preset} onClick={() => applyPreset(preset)} className={`cursor-pointer border rounded-lg p-3 transition-colors ${securityPreset === preset ? 'bg-ocean-50 border-ocean-500 dark:bg-ocean-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <div className="font-medium text-sm capitalize">{t(`protect.presets.${preset}.name`)}</div>
              <div className="text-xs text-gray-500 mt-1">{t(`protect.presets.${preset}.description`)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Only Toggle */}
      <div className="flex items-center gap-2 py-2 border-t border-b border-gray-100 dark:border-gray-800">
        <Checkbox id="perm-only" checked={permissionsOnly} onCheckedChange={(c) => {
          setPermissionsOnly(c as boolean);
          if (c) { setUserPassword(''); setOwnerPassword(''); }
        }} />
        <div>
          <Label htmlFor="perm-only" className="cursor-pointer">{t('protect.permissionsOnly')}</Label>
          <p className="text-xs text-gray-500">{t('protect.permissionsOnlyHint')}</p>
        </div>
      </div>

      {/* Passwords */}
      {!permissionsOnly && renderPasswordInput()}

      {/* Advanced Button */}
      <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? t('common.hide') : t('common.show')} {t('protect.advancedSettings')}
      </Button>

      {showAdvanced && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
          <Label className="text-xs uppercase text-gray-500 font-bold">Permissions</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label>Printing</Label><select value={permissions.printing} onChange={e => setPermissions({ ...permissions, printing: e.target.value as 'none' | 'lowResolution' | 'highResolution' })} className="text-sm border rounded"><option value="none">None</option><option value="lowResolution">Low</option><option value="highResolution">High</option></select></div>
            <div className="flex items-center justify-between"><Label>Copying</Label><Checkbox checked={permissions.copying} onCheckedChange={c => setPermissions({ ...permissions, copying: !!c })} /></div>
            <div className="flex items-center justify-between"><Label>Modifying</Label><Checkbox checked={permissions.modifying} onCheckedChange={c => setPermissions({ ...permissions, modifying: !!c })} /></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (!file) return null;
    if (result) {
      return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600">
            <FileCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">{t('protect.success.title')}</h2>
          <p className="text-gray-500">{t('protect.success.encryption')}: {result.metadata.encryption}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700">{t('common.download')}</Button>
            <Button onClick={handleReset} variant="outline" size="lg">{t('protect.protectAnother')}</Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
          <FileText className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold">{file.name}</h3>
          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          {file.info && <p className="text-sm text-gray-500">{file.info.pages} pages</p>}
        </div>
        {error && <div className="text-red-500 bg-red-50 px-4 py-2 rounded">{error}</div>}
      </div>
    );
  };

  const renderActions = () => (
    <Button onClick={handleProtect} disabled={isProcessing || (!permissionsOnly && !userPassword)} className="w-full py-6 text-lg font-bold">
      {isProcessing ? t('common.processing') : t('protect.protectButton')}
    </Button>
  );

  return (
    <ToolLayout
      title={t('tools.protect-pdf.name')}
      description={t('tools.protect-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelect}
      isProcessing={isProcessing}
      maxFiles={1}
      uploadTitle={t('common.selectFile')}
      uploadDescription={t('upload.singleFileAllowed')}
      acceptedTypes=".pdf"
      settings={!result ? renderSettings() : null}
      actions={!result ? renderActions() : null}
    >
      {renderContent()}
    </ToolLayout>
  );
};
