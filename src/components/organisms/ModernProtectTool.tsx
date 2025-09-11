import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shield, Lock, Unlock, Settings, FileText, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProtectPDF } from '../../hooks/useProtectPDF';
import { useI18n } from '../../hooks/useI18n';
import { useCelebration } from '../../hooks/useCelebration';
import { PasswordInput } from '../molecules/PasswordInput';
import { PermissionsPanel } from '../molecules/PermissionsPanel';
import { SECURITY_PRESETS } from '../../services/protectService';
import type { SecurityPreset } from '../../types/protect.types';

interface ModernProtectToolProps {
  file: File;
  onComplete?: () => void;
  onClose?: () => void;
  className?: string;
}

export const ModernProtectTool: React.FC<ModernProtectToolProps> = ({
  file,
  onComplete,
  onClose,
  className = ''
}) => {
  const { t } = useI18n();
  const { celebrate } = useCelebration();
  
  const {
    protectionSettings,
    isProcessing,
    progress,
    result,
    error,
    showAdvanced,
    passwordStrength,
    securityInfo,
    setPassword,
    generatePassword,
    updateSettings,
    updatePermissions,
    applyPreset,
    toggleAdvanced,
    processProtection,
    downloadProtected,
    clearError,
    canProcess,
    hasResult,
    presets
  } = useProtectPDF();

  const [selectedPreset, setSelectedPreset] = useState<keyof typeof SECURITY_PRESETS>('basic');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [protectionMode, setProtectionMode] = useState<'document' | 'permissions'>('document');
  
  // Ref для прокрутки к секции успеха (скачивания)
  const successSectionRef = useRef<HTMLDivElement>(null);

  // Initialize file
  React.useEffect(() => {
    if (file) {
      // Set file in hook if needed - for now we pass it directly to processProtection
    }
  }, [file]);

  const passwordsMatch = useMemo(() => {
    return protectionSettings.userPassword === confirmPassword;
  }, [protectionSettings.userPassword, confirmPassword]);

  const canProtect = useMemo(() => {
    if (protectionMode === 'permissions') {
      // For permissions-only mode, user password is optional
      return !isProcessing && (
        !protectionSettings.userPassword || // No user password needed
        (protectionSettings.userPassword && passwordsMatch && passwordStrength?.isValid)
      );
    } else {
      // For document mode, user password is required
      return !!(
        protectionSettings.userPassword &&
        passwordsMatch &&
        passwordStrength?.isValid &&
        !isProcessing
      );
    }
  }, [protectionMode, protectionSettings.userPassword, passwordsMatch, passwordStrength?.isValid, isProcessing]);

  const handlePresetChange = (presetId: keyof typeof SECURITY_PRESETS) => {
    setSelectedPreset(presetId);
    applyPreset(presetId);
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setConfirmPassword(newPassword);
  };

  const handleProtect = async () => {
    if (!canProtect) return;
    
    // Validation for document mode
    if (protectionMode === 'document' && !protectionSettings.userPassword) {
      clearError();
      // This will be handled by the existing UI validation
      return;
    }
    
    try {
      // For permissions-only mode, ensure we don't set user password but set owner password
      if (protectionMode === 'permissions') {
        // Temporarily clear user password and ensure owner password is set
        const originalUserPassword = protectionSettings.userPassword;
        const originalOwnerPassword = protectionSettings.ownerPassword;
        
        updateSettings({ 
          userPassword: '', // Clear user password for permissions-only
          ownerPassword: originalOwnerPassword || 'LocalPDF-Owner-' + Date.now() // Ensure owner password exists
        });
        
        await processProtection(file);
        
        // Restore original passwords after processing
        updateSettings({ 
          userPassword: originalUserPassword,
          ownerPassword: originalOwnerPassword
        });
      } else {
        await processProtection(file);
      }
      
      celebrate();
    } catch (err) {
      console.error('Protection failed:', err);
    }
  };

  const handleDownload = () => {
    downloadProtected();
    onComplete?.();
  };

  // Автоматическая прокрутка к секции успеха когда обработка завершена
  useEffect(() => {
    if (hasResult && result && successSectionRef.current) {
      // Добавляем задержку для плавности появления
      setTimeout(() => {
        successSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 200);
    }
  }, [hasResult, result]);

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Render success state
  if (hasResult && result) {
    return (
      <div ref={successSectionRef} className={`space-y-8 ${className}`}>
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {t('pages.tools.protect.complete')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('pages.tools.protect.success.protected')}
            </p>
          </div>
        </div>

        {/* File Info */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatFileSize(file.size)} • {t('pages.tools.protect.securityInfo')}
              </p>
            </div>
            <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            className="btn-privacy-modern flex-1 text-lg ripple-effect btn-press"
          >
            {t('pages.tools.protect.downloadProtected')}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            {t('common.startOver')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            {t('pages.tools.protect.pageTitle')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('pages.tools.protect.pageDescription')}
          </p>
        </div>
      </div>

      {/* Protection Mode Selector */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('pages.tools.protect.protectionMode')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setProtectionMode('document')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              protectionMode === 'document'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {t('pages.tools.protect.fullProtection')}
              </h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('pages.tools.protect.fullProtectionDesc')}
            </p>
          </button>

          <button
            onClick={() => setProtectionMode('permissions')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              protectionMode === 'permissions'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Unlock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {t('pages.tools.protect.smartProtection')}
              </h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('pages.tools.protect.smartProtectionDesc')}
            </p>
          </button>
        </div>
      </div>

      {/* Selected File */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {file.name}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {formatFileSize(file.size)}
              {securityInfo?.isProtected && (
                <span className="ml-2 text-orange-600 dark:text-orange-400">
                  • {t('pages.tools.protect.existingProtection')}
                </span>
              )}
            </p>
          </div>
          {securityInfo?.isProtected ? (
            <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          ) : (
            <Unlock className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      {/* Security Presets */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('pages.tools.protect.securityPresets')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key as keyof typeof SECURITY_PRESETS)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedPreset === key
                  ? 'border-seafoam-500 bg-seafoam-50 dark:bg-seafoam-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-seafoam-300 dark:hover:border-seafoam-700'
              }`}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t(`pages.tools.protect.preset${preset.id.charAt(0).toUpperCase() + preset.id.slice(1)}`)}
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                {t(`pages.tools.protect.preset${preset.id.charAt(0).toUpperCase() + preset.id.slice(1)}Desc`)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Password Configuration */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('pages.tools.protect.passwordProtection')}
          </h3>
          <button
            onClick={handleGeneratePassword}
            className="text-sm text-seafoam-600 dark:text-seafoam-400 hover:text-seafoam-700 dark:hover:text-seafoam-300 transition-colors duration-200"
          >
            {t('pages.tools.protect.generatePassword')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PasswordInput
            label={protectionMode === 'document' ? t('pages.tools.protect.userPassword') : t('pages.tools.protect.documentPasswordOptional')}
            value={protectionSettings.userPassword || ''}
            onChange={(value) => setPassword(value, 'user')}
            placeholder={protectionMode === 'document' ? t('pages.tools.protect.passwordPlaceholder') : t('pages.tools.protect.leaveEmptyForPermissions')}
            strength={passwordStrength}
            showStrength={true}
            showGenerator={false}
            required={protectionMode === 'document'}
          />

          <PasswordInput
            label={t('pages.tools.protect.confirmPassword')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={protectionMode === 'permissions' && !protectionSettings.userPassword ? t('pages.tools.protect.notNeededForPermissions') : t('pages.tools.protect.confirmPlaceholder')}
            required={protectionMode === 'document' || !!protectionSettings.userPassword}
          />
        </div>

        {/* Password Match Warning */}
        {protectionSettings.userPassword && confirmPassword && !passwordsMatch && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{t('pages.tools.protect.passwordMismatch')}</span>
          </div>
        )}

        {/* Real Encryption Notice */}
        <div className="bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                {t('pages.tools.protect.realPDFEncryptionTitle')}
              </h5>
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('pages.tools.protect.realPDFEncryptionDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Security Confirmation */}
        {protectionSettings.userPassword && passwordsMatch && (
          <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('pages.tools.protect.securityLevelLabel')}:</strong> {protectionSettings.encryption === 'aes256' ? '256-bit AES' : '128-bit AES'} encryption
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {t('pages.tools.protect.passwordWillBeRequired')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Panel */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-600/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('pages.tools.protect.documentRestrictions')}
          </h3>
          <button
            onClick={toggleAdvanced}
            className="flex items-center gap-2 text-sm text-seafoam-600 dark:text-seafoam-400 hover:text-seafoam-700 dark:hover:text-seafoam-300 transition-colors duration-200"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? t('pages.tools.protect.simpleView') : t('pages.tools.protect.toggleAdvanced')}
          </button>
        </div>

        <PermissionsPanel
          permissions={protectionSettings.permissions}
          onChange={updatePermissions}
          showAdvanced={showAdvanced}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1"
              >
                {t('pages.tools.protect.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {isProcessing && progress && (
        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                {progress.message}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {progress.stage} - {progress.progress}%
              </p>
            </div>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleProtect}
          disabled={!canProtect}
          className={`btn-privacy-modern text-lg px-8 py-4 min-w-[250px] ripple-effect btn-press ${
            !canProtect ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {t('pages.tools.protect.protectButton')}
        </button>
      </div>
    </div>
  );
};