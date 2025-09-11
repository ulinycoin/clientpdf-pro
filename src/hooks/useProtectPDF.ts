import { useState, useCallback } from 'react';
import type { 
  ProtectPDFState, 
  ProtectionSettings, 
  PasswordStrength,
  SecurityInfo,
  ProtectionProgress 
} from '../types/protect.types';
import { 
  protectPDF, 
  checkPasswordStrength, 
  validatePDFProtection,
  generateSecurePassword,
  SECURITY_PRESETS 
} from '../services/protectService';

const initialSettings: ProtectionSettings = {
  encryption: 'aes128',
  permissions: {
    printing: 'highResolution',
    modifying: true,
    copying: true,
    annotating: true,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: true
  }
};

export const useProtectPDF = () => {
  const [state, setState] = useState<ProtectPDFState>({
    file: null,
    protectionSettings: initialSettings,
    isProcessing: false,
    progress: null,
    result: null,
    error: null,
    showAdvanced: false,
    passwordStrength: null,
    securityInfo: null
  });

  // Set file
  const setFile = useCallback((file: File | null) => {
    setState(prev => ({
      ...prev,
      file,
      result: null,
      error: null,
      securityInfo: null
    }));

    // Analyze file security if provided
    if (file) {
      validatePDFProtection(file)
        .then(securityInfo => {
          setState(prev => ({ ...prev, securityInfo }));
        })
        .catch(error => {
          console.warn('Could not analyze PDF security:', error);
        });
    }
  }, []);

  // Update protection settings
  const updateSettings = useCallback((updates: Partial<ProtectionSettings>) => {
    setState(prev => ({
      ...prev,
      protectionSettings: { ...prev.protectionSettings, ...updates }
    }));
  }, []);

  // Update permissions
  const updatePermissions = useCallback((permissions: Partial<ProtectionSettings['permissions']>) => {
    setState(prev => ({
      ...prev,
      protectionSettings: {
        ...prev.protectionSettings,
        permissions: { ...prev.protectionSettings.permissions, ...permissions }
      }
    }));
  }, []);

  // Set password and check strength
  const setPassword = useCallback((password: string, type: 'user' | 'owner' = 'user') => {
    const passwordStrength = password ? checkPasswordStrength(password) : null;
    
    setState(prev => ({
      ...prev,
      protectionSettings: {
        ...prev.protectionSettings,
        [type === 'user' ? 'userPassword' : 'ownerPassword']: password
      },
      passwordStrength: type === 'user' ? passwordStrength : prev.passwordStrength
    }));
  }, []);

  // Generate secure password
  const generatePassword = useCallback((length: number = 12) => {
    const password = generateSecurePassword(length);
    setPassword(password, 'user');
    return password;
  }, [setPassword]);

  // Apply security preset
  const applyPreset = useCallback((presetId: keyof typeof SECURITY_PRESETS) => {
    const preset = SECURITY_PRESETS[presetId];
    if (preset.settings.encryption) {
      setState(prev => ({
        ...prev,
        protectionSettings: {
          ...prev.protectionSettings,
          encryption: preset.settings.encryption as ProtectionSettings['encryption']
        }
      }));
    }
    
    if (preset.settings.permissions) {
      updatePermissions(preset.settings.permissions);
    }
  }, [updatePermissions]);

  // Toggle advanced mode
  const toggleAdvanced = useCallback(() => {
    setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  }, []);

  // Process PDF protection
  const processProtection = useCallback(async (inputFile?: File) => {
    const fileToProcess = inputFile || state.file;
    const currentSettings = state.protectionSettings;
    
    if (!fileToProcess) {
      setState(prev => ({ ...prev, error: 'No file selected' }));
      return;
    }

    // Password validation moved to component level to support permissions-only mode

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null,
      progress: null 
    }));

    try {
      const result = await protectPDF(
        fileToProcess,
        currentSettings,
        (progress: ProtectionProgress) => {
          setState(prev => ({ ...prev, progress }));
        }
      );

      setState(prev => ({
        ...prev,
        result,
        isProcessing: false,
        progress: {
          stage: 'complete',
          progress: 100,
          message: 'PDF protection applied successfully!'
        }
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        progress: null
      }));
    }
  }, [state.file, state.protectionSettings]);

  // Download protected PDF
  const downloadProtected = useCallback((filename?: string) => {
    if (!state.result) return;

    const originalName = state.file?.name || 'document.pdf';
    const baseName = originalName.replace(/\.pdf$/i, '');
    const finalName = filename || `${baseName}_protected.pdf`;

    const blob = new Blob([state.result], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [state.result, state.file]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      file: null,
      protectionSettings: initialSettings,
      isProcessing: false,
      progress: null,
      result: null,
      error: null,
      showAdvanced: false,
      passwordStrength: null,
      securityInfo: null
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    file: state.file,
    protectionSettings: state.protectionSettings,
    isProcessing: state.isProcessing,
    progress: state.progress,
    result: state.result,
    error: state.error,
    showAdvanced: state.showAdvanced,
    passwordStrength: state.passwordStrength,
    securityInfo: state.securityInfo,

    // Actions
    setFile,
    updateSettings,
    updatePermissions,
    setPassword,
    generatePassword,
    applyPreset,
    toggleAdvanced,
    processProtection,
    downloadProtected,
    reset,
    clearError,

    // Computed
    canProcess: !!(state.file && state.protectionSettings.userPassword && !state.isProcessing),
    hasResult: !!state.result,

    // Constants
    presets: SECURITY_PRESETS
  };
};