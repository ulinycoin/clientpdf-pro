import React, { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { protectPDF } from '@/services/pdfService';
import type { ProtectionSettings, PasswordStrength, UploadedFile } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ToolLayout } from '@/components/common/ToolLayout';
import { Shield, Eye, EyeOff, Lock, Unlock, FileCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/common/ProgressBar';

export const ProtectPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, clearSharedFile, setSharedFile: saveSharedFile } = useSharedFile();

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
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ blob: Blob; filename: string; metadata: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  // Auto-load from shared file
  useEffect(() => {
    if (sharedFile && !file) {
      const loadedFile = new File([sharedFile.blob], sharedFile.name, {
        type: 'application/pdf',
      });

      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        file: loadedFile,
        name: sharedFile.name,
        size: loadedFile.size,
        status: 'pending'
      };

      setFile(uploadedFile);
      clearSharedFile();
    }
  }, [sharedFile, file, clearSharedFile]);

  // Auto-save result to sharedFile
  useEffect(() => {
    if (result?.blob && !isProcessing && !resultSaved) {
      // Encrypted PDFs usually shouldn't be auto-shared for next steps as they require password
      // But we maintain consistency - user might want to watermark the protected PDF (if they know the password)
      // saveSharedFile(result.blob, result.filename, 'protect-pdf');
      setResultSaved(true);
    }
  }, [result, isProcessing, resultSaved, saveSharedFile]);

  // Security presets
  const applyPreset = (preset: typeof securityPreset) => {
    setSecurityPreset(preset);

    switch (preset) {
      case 'basic':
        setPermissions({
          printing: 'highResolution',
          modifying: false,
          copying: true,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false,
        });
        setEncryptionLevel('aes128');
        break;
      case 'business':
        setPermissions({
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false,
        });
        setEncryptionLevel('aes256');
        break;
      case 'confidential':
        setPermissions({
          printing: 'none',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        });
        setEncryptionLevel('aes256');
        break;
    }
  };

  // Check password strength
  useEffect(() => {
    if (userPassword) {
      const strength = checkPasswordStrength(userPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [userPassword]);

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('tooShort');

    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) feedback.push('useUpperAndLower');
    if (!/[0-9]/.test(password)) feedback.push('useNumbers');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('useSpecialChars');

    const normalizedScore = Math.min(4, Math.floor(score / 1.5));

    return {
      score: normalizedScore,
      feedback,
      isValid: password.length >= 6,
    };
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        status: 'pending'
      };
      setFile(uploadedFile);
      setError(null);
      setResult(null);
      setResultSaved(false);
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
    setProgress(0);

    try {
      const settings: ProtectionSettings = {
        userPassword: permissionsOnly ? '' : userPassword,
        ownerPassword: permissionsOnly ? 'owner-only-restrictions' : (showOwnerPassword && ownerPassword ? ownerPassword : userPassword),
        encryption: encryptionLevel,
        permissions,
      };

      const protectedPdf = await protectPDF(
        file.file,
        settings,
        (progressData) => {
          setProgress(progressData.progress);
          setProgressMessage(progressData.message);
        }
      );

      const blob = new Blob([protectedPdf as any], { type: 'application/pdf' });
      const filename = file.name.replace('.pdf', '_protected.pdf');

      setResult({
        blob,
        filename,
        metadata: {
          originalName: file.name,
          encryption: encryptionLevel,
          hasPassword: true,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (err) {
      console.error('Error protecting PDF:', err);
      setError(err instanceof Error ? err.message : t('protect.errors.protectionFailed'));
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
    setUserPassword('');
    setOwnerPassword('');
    setResult(null);
    setResultSaved(false);
    setError(null);
    setProgress(0);
    setPasswordStrength(null);
    clearSharedFile();
  };

  // Render content
  const renderContent = () => {
    if (!file) return null;

    if (result) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('protect.success.title')}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6 text-sm">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-gray-400">{t('protect.success.encryption')}</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {result.metadata.encryption.toUpperCase()}
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-600 dark:text-gray-400">{t('protect.success.password')}</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {t('protect.success.passwordSet')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
              {t('common.download')}
            </Button>
            <Button variant="outline" onClick={handleReset} size="lg">
              {t('protect.protectAnother')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Controls - Left Column */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-ocean-500" />
                      {t('protect.securityLevel')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {(['basic', 'business', 'confidential'] as const).map((preset) => (
                      <div
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${securityPreset === preset
                          ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-ocean-300'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 p-2 rounded-lg ${securityPreset === preset ? 'bg-ocean-100 dark:bg-ocean-800' : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                            <Shield className={`w-5 h-5 ${securityPreset === preset ? 'text-ocean-600 dark:text-ocean-400' : 'text-gray-500'
                              }`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white mb-1">
                              {t(`protect.presets.${preset}.name`)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {t(`protect.presets.${preset}.description`)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Checkbox
                      id="permissions-only"
                      checked={permissionsOnly}
                      onCheckedChange={(checked) => {
                        setPermissionsOnly(checked as boolean);
                        if (checked) {
                          setUserPassword('');
                          setOwnerPassword('');
                          setShowOwnerPassword(false);
                        }
                      }}
                    />
                    <div>
                      <Label htmlFor="permissions-only" className="cursor-pointer font-medium">
                        {t('protect.permissionsOnly')}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('protect.permissionsOnlyHint')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <Button
              onClick={handleProtect}
              disabled={isProcessing || (!permissionsOnly && !userPassword)}
              className="w-full py-6 text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {isProcessing ? t('common.processing') : (
                <span className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t('protect.protectButton')}
                </span>
              )}
            </Button>
          </div>

          {/* Configuration - Right Column */}
          <div className="space-y-6">
            {!permissionsOnly && (
              <Card className="border-ocean-100 dark:border-ocean-900">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      {t('protect.userPassword')}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showUserPassword ? 'text' : 'password'}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder={t('protect.userPasswordPlaceholder')}
                        className="pl-10 pr-10 py-3 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-ocean-500"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowUserPassword(!showUserPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {passwordStrength && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('protect.passwordStrength.strength')}</span>
                          <span className={`text-xs font-bold ${passwordStrength.score >= 3 ? 'text-green-600' :
                            passwordStrength.score === 2 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {passwordStrength.score >= 3 ? t('protect.passwordStrength.strong') : passwordStrength.score === 2 ? t('protect.passwordStrength.medium') : t('protect.passwordStrength.weak')}
                          </span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[0, 1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.score
                                ? passwordStrength.score <= 1
                                  ? 'bg-red-500'
                                  : passwordStrength.score <= 2
                                    ? 'bg-yellow-500'
                                    : passwordStrength.score <= 3
                                      ? 'bg-blue-500'
                                      : 'bg-green-500'
                                : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            />
                          ))}
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="space-y-1">
                            {passwordStrength.feedback.map((msg, i) => (
                              <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                                <span className="text-amber-500 mt-0.5">•</span> {t(`protect.passwordStrength.${msg}`)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Unrecoverable Password Warning */}
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-amber-800 dark:text-amber-400">
                        {t('protect.passwordWarning.title')}
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mt-0.5 text-xs">
                        {t('protect.passwordWarning.message')}
                      </p>
                    </div>
                  </div>

                  {/* Owner password */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Checkbox
                        id="owner-password-toggle"
                        checked={showOwnerPasswordToggle}
                        onCheckedChange={(checked) => setShowOwnerPasswordToggle(checked as boolean)}
                      />
                      <Label htmlFor="owner-password-toggle" className="cursor-pointer text-sm font-medium">
                        {t('protect.useOwnerPassword')}
                      </Label>
                    </div>

                    {showOwnerPasswordToggle && (
                      <div className="relative animate-in slide-in-from-top-2 fade-in duration-200">
                        <Input
                          type={showOwnerPassword ? 'text' : 'password'}
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder={t('protect.ownerPasswordPlaceholder')}
                          className="pl-10 pr-10 py-3 rounded-xl border-gray-300 dark:border-gray-600"
                        />
                        <Unlock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                          {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permissions Summary Check */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-1">
                {t('protect.activePermissions')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className={`justify-center py-2 ${permissions.printing !== 'none' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                  {permissions.printing !== 'none' ? t('protect.badge.printingAllowed') : t('protect.badge.noPrinting')}
                </Badge>
                <Badge variant="outline" className={`justify-center py-2 ${permissions.copying ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                  {permissions.copying ? t('protect.badge.copyingAllowed') : t('protect.badge.noCopying')}
                </Badge>
                <Badge variant="outline" className={`justify-center py-2 ${permissions.modifying ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                  {permissions.modifying ? t('protect.badge.editingAllowed') : t('protect.badge.noEditing')}
                </Badge>
                <Badge variant="outline" className={`justify-center py-2 ${encryptionLevel === 'aes256' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'}`}>
                  {encryptionLevel === 'aes256' ? 'AES-256' : 'AES-128'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-xs text-gray-500 hover:text-ocean-600"
              >
                {t('protect.advancedSettings')} {showAdvanced ? '▲' : '▼'}
              </Button>
            </div>

            {/* Advanced Settings Panel */}
            {showAdvanced && (
              <Card className="bg-gray-50 dark:bg-gray-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold mb-2 block uppercase text-gray-500">Printing Rights</Label>
                      <select
                        value={permissions.printing}
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            printing: e.target.value as typeof permissions.printing,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      >
                        <option value="none">{t('protect.permissions.printingNone')}</option>
                        <option value="lowResolution">{t('protect.permissions.printingLow')}</option>
                        <option value="highResolution">{t('protect.permissions.printingHigh')}</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {['copying', 'modifying', 'annotating', 'fillingForms'].map((perm) => (
                        <div key={perm} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <Label htmlFor={`perm-${perm}`} className="text-sm cursor-pointer flex-1">
                            {t(`protect.permissions.${perm}`)}
                          </Label>
                          <Checkbox
                            id={`perm-${perm}`}
                            checked={permissions[perm as keyof typeof permissions] as boolean}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, [perm]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {
          isProcessing && (
            <div className="mt-8">
              <ProgressBar progress={progress} message={progressMessage} />
            </div>
          )
        }
      </div >
    );
  };

  return (
    <ToolLayout
      title={t('tools.protect-pdf.name')}
      description={t('tools.protect-pdf.description')}
      hasFiles={!!file}
      onUpload={handleFileSelect}
      isProcessing={isProcessing}
    >
      {renderContent()}
    </ToolLayout>
  );
};
