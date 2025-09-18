export interface ProtectionSettings {
  userPassword?: string;      // Password to open document
  ownerPassword?: string;     // Password to change permissions
  encryption: 'aes128' | 'aes256';
  permissions: {
    printing: 'none' | 'lowResolution' | 'highResolution';
    modifying: boolean;
    copying: boolean;
    annotating: boolean;
    fillingForms: boolean;
    contentAccessibility: boolean;
    documentAssembly: boolean;
  };
}

export interface PasswordStrength {
  score: number;              // 0-4 (weak-strong)
  feedback: string[];         // Improvement recommendations
  isValid: boolean;           // Minimum requirements met
}

export interface SecurityInfo {
  isProtected: boolean;
  hasUserPassword: boolean;
  hasOwnerPassword: boolean;
  encryptionLevel?: string;
  restrictions: string[];
}

export interface ProtectionProgress {
  stage: 'analyzing' | 'encrypting' | 'finalizing' | 'complete' | 'preparing' | 'extracting' | 'creating' | 'copying';
  progress: number;           // 0-100
  message: string;
}

export interface SecurityPreset {
  id: 'basic' | 'business' | 'confidential' | 'custom';
  name: string;
  description: string;
  settings: Partial<ProtectionSettings>;
}

export interface ProtectPDFState {
  file: File | null;
  protectionSettings: ProtectionSettings;
  isProcessing: boolean;
  progress: ProtectionProgress | null;
  result: Uint8Array | null;
  error: string | null;
  showAdvanced: boolean;
  passwordStrength: PasswordStrength | null;
  securityInfo: SecurityInfo | null;
}