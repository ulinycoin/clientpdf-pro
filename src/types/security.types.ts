// Security Feature Types for LocalPDF

import { PDFProcessingResult, ProgressCallback } from '../types';

// Password Protection Types
export interface PasswordProtectionOptions {
  action: 'protect' | 'remove';
  password?: string;
  oldPassword?: string; // Required when removing password
  permissions?: PDFPermissions;
}

export interface PDFPermissions {
  printing?: boolean;
  modifying?: boolean;
  copying?: boolean;
  annotating?: boolean;
  fillingForms?: boolean;
  contentAccessibility?: boolean;
  documentAssembly?: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  strength?: 'weak' | 'medium' | 'strong';
  suggestions?: string[];
}

// Security Analysis Types
export interface PDFSecurityInfo {
  isPasswordProtected: boolean;
  hasUserPassword: boolean;
  hasOwnerPassword: boolean;
  permissions: PDFPermissions;
  encryption?: {
    version: string;
    keyLength: number;
  };
  metadata: {
    hasPersonalInfo: boolean;
    metadataFields: string[];
    potentialPrivacyRisks: string[];
  };
}

// Tool Component Props
export interface PasswordToolProps {
  files: File[];
  onComplete: (result: PDFProcessingResult) => void;
  onClose: () => void;
  className?: string;
}

// Password Form Component Props
export interface PasswordFormProps {
  action: 'protect' | 'remove';
  onSubmit: (options: PasswordProtectionOptions) => void;
  isProcessing: boolean;
  error?: string;
  className?: string;
}

// Password Input Component Props
export interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showStrength?: boolean;
  disabled?: boolean;
  className?: string;
}

// Security Service Interface
export interface SecurityService {
  protectPDF(
    file: File,
    options: PasswordProtectionOptions,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult>;
  
  removePDFPassword(
    file: File,
    password: string,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult>;
  
  analyzePDFSecurity(file: File): Promise<PDFSecurityInfo>;
  
  validatePassword(password: string): PasswordValidationResult;
}

// Error Types
export interface SecurityError {
  code: 'INVALID_PASSWORD' | 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED' | 'PERMISSION_DENIED' | 'SECURITY_ERROR';
  message: string;
  cause?: unknown;
}

// Hook Types - Extended with additional methods
export interface UsePasswordProtectionResult {
  protectPDF: (file: File, options: PasswordProtectionOptions) => Promise<PDFProcessingResult>;
  removePDFPassword: (file: File, password: string) => Promise<PDFProcessingResult>;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  securityInfo: PDFSecurityInfo | null;
  analyzeSecurityInfo: (file: File) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}