import React, { useState, useEffect } from 'react';
import { FileUpload } from '../common/FileUpload';
import { ProgressBar } from '../common/ProgressBar';
import { useI18n } from '@/hooks/useI18n';
import { useSharedFile } from '@/hooks/useSharedFile';
import { protectPDF } from '@/services/pdfService';
import type { ProtectionSettings, PasswordStrength } from '@/types/pdf';

export const ProtectPDF: React.FC = () => {
  const { t } = useI18n();
  const { sharedFile, setSharedFile } = useSharedFile();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
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

  // Auto-load from shared file
  useEffect(() => {
    if (sharedFile && !file) {
      // Convert SharedFile to File
      const loadedFile = new File([sharedFile.blob], sharedFile.name, {
        type: 'application/pdf',
      });
      setFile(loadedFile);
    }
  }, [sharedFile, file]);

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
    else feedback.push(t('protect.passwordStrength.tooShort'));

    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) feedback.push(t('protect.passwordStrength.useUpperAndLower'));
    if (!/[0-9]/.test(password)) feedback.push(t('protect.passwordStrength.useNumbers'));
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push(t('protect.passwordStrength.useSpecialChars'));

    // Normalize score to 0-4
    const normalizedScore = Math.min(4, Math.floor(score / 1.5));

    return {
      score: normalizedScore,
      feedback,
      isValid: password.length >= 6,
    };
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleProtect = async () => {
    if (!file) return;
    if (!userPassword) {
      setError(t('protect.errors.passwordRequired'));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const settings: ProtectionSettings = {
        userPassword,
        ownerPassword: showOwnerPassword && ownerPassword ? ownerPassword : userPassword,
        encryption: encryptionLevel,
        permissions,
      };

      const protectedPdf = await protectPDF(
        file,
        settings,
        (progressData) => {
          setProgress(progressData.progress);
          setProgressMessage(progressData.message);
        }
      );

      // Create result
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

      // Save to shared state for Quick Actions
      setSharedFile(blob, filename, 'protect-pdf');

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
    setError(null);
    setProgress(0);
    setPasswordStrength(null);
  };

  const handleQuickAction = (tool: string) => {
    // Navigate to another tool via hash
    window.location.hash = tool;
  };

  // Success screen
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success message */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔒</div>
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

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t('common.download')}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl transition-all duration-200"
          >
            {t('protect.protectAnother')}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('protect.quickActions.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('protect.quickActions.description')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickAction('compress')}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-left"
            >
              <span className="text-2xl">🗜️</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('tools.compress-pdf.name')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('protect.quickActions.compress')}
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('split')}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-left"
            >
              <span className="text-2xl">✂️</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('tools.split-pdf.name')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('protect.quickActions.split')}
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('watermark')}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-left"
            >
              <span className="text-2xl">💧</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('tools.watermark-pdf.name')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('protect.quickActions.watermark')}
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('merge')}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-left"
            >
              <span className="text-2xl">📑</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('tools.merge-pdf.name')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t('protect.quickActions.merge')}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* File upload */}
      {!file && (
        <FileUpload
          onFilesSelected={handleFileSelect}
          accept=".pdf"
          maxFiles={1}
          maxSizeMB={100}
        />
      )}

      {/* File loaded indicator */}
      {file && sharedFile && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {t('protect.autoLoaded.title')}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {t('protect.autoLoaded.description')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{file.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Security presets */}
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('protect.securityLevel')}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {(['basic', 'business', 'confidential'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    securityPreset === preset
                      ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-ocean-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {t(`protect.presets.${preset}.name`)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t(`protect.presets.${preset}.description`)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Password inputs */}
          <div className="space-y-4">
            {/* User password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('protect.userPassword')} *
              </label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder={t('protect.userPasswordPlaceholder')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-gray-900 dark:text-white"
              />
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 1
                              ? 'bg-red-500'
                              : passwordStrength.score <= 2
                              ? 'bg-yellow-500'
                              : passwordStrength.score <= 3
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {passwordStrength.feedback.join('. ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Owner password toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOwnerPassword}
                  onChange={(e) => setShowOwnerPassword(e.target.checked)}
                  className="w-4 h-4 text-ocean-500 bg-gray-100 border-gray-300 rounded focus:ring-ocean-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('protect.useOwnerPassword')}
                </span>
              </label>
            </div>

            {/* Owner password input */}
            {showOwnerPassword && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('protect.ownerPassword')}
                </label>
                <input
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder={t('protect.ownerPasswordPlaceholder')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Advanced settings toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-6 text-sm text-ocean-500 hover:text-ocean-600 font-semibold"
          >
            {showAdvanced ? '▼' : '▶'} {t('protect.advancedSettings')}
          </button>

          {/* Advanced settings */}
          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              {/* Encryption level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('protect.encryptionLevel')}
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="aes128"
                      checked={encryptionLevel === 'aes128'}
                      onChange={(e) => setEncryptionLevel(e.target.value as 'aes128' | 'aes256')}
                      className="w-4 h-4 text-ocean-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">AES-128</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="aes256"
                      checked={encryptionLevel === 'aes256'}
                      onChange={(e) => setEncryptionLevel(e.target.value as 'aes128' | 'aes256')}
                      className="w-4 h-4 text-ocean-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      AES-256 {t('protect.recommended')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t('protect.permissions')}
                </label>
                <div className="space-y-2">
                  {/* Printing */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {t('protect.permissions.printing')}
                    </label>
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

                  {/* Checkboxes */}
                  {[
                    'copying',
                    'modifying',
                    'annotating',
                    'fillingForms',
                    'contentAccessibility',
                  ].map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[perm as keyof typeof permissions] as boolean}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [perm]: e.target.checked })
                        }
                        className="w-4 h-4 text-ocean-500 bg-gray-100 border-gray-300 rounded focus:ring-ocean-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`protect.permissions.${perm}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Protect button */}
          <button
            onClick={handleProtect}
            disabled={isProcessing || !userPassword}
            className={`w-full mt-6 py-4 px-8 rounded-xl font-bold text-white transition-all duration-200 ${
              isProcessing || !userPassword
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? t('common.processing') : t('protect.protectButton')}
          </button>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar progress={progress} message={progressMessage} />
      )}
    </div>
  );
};
