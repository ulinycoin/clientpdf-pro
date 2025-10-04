/**
 * English translations for PDF Protection tool
 */

export const protect = {
  // Basic properties for tools grid
  title: 'Protect PDF',
  description: 'Add password protection and security restrictions to PDF files',
  
  // Main page elements
  pageTitle: "Protect PDF with Password",
  pageDescription: "Add password protection and security restrictions to your PDF documents for enhanced privacy and control",
  breadcrumb: "Protect PDF",
  
  // Tool interface
  uploadTitle: "Select PDF to Protect",
  uploadSubtitle: "Drop your PDF here or click to browse",
  supportedFormats: "Supports PDF files up to 100MB",
  
  // Password fields
  userPassword: "Password to open document",
  confirmPassword: "Confirm password",
  ownerPassword: "Password to change permissions (optional)",
  passwordPlaceholder: "Enter a strong password",
  confirmPlaceholder: "Re-enter your password",
  
  // Encryption settings
  encryptionLevel: "Encryption strength",
  encryption128: "128-bit AES (Standard)",
  encryption256: "256-bit AES (High Security)",
  
  // Security presets
  securityPresets: "Security presets",
  presetBasic: "Basic Protection",
  presetBasicDesc: "Password protection with basic restrictions",
  presetBusiness: "Business Document",
  presetBusinessDesc: "Professional document security",
  presetConfidential: "Confidential",
  presetConfidentialDesc: "Maximum security restrictions",
  presetCustom: "Custom Settings",
  presetCustomDesc: "Configure all options manually",
  
  // Permissions section
  permissions: "Document restrictions",
  permissionsDesc: "Control what users can do with the protected document",
  advancedPermissions: "Advanced Permissions",
  
  // Permission types with descriptions
  permissionPrinting: "Printing",
  permissionPrintingDesc: "Control printing permissions",
  permissionCopying: "Text Copying",
  permissionCopyingDesc: "Allow text selection and copying",
  permissionModifying: "Document Editing",
  permissionModifyingDesc: "Allow document modification",
  permissionAnnotating: "Comments & Annotations",
  permissionAnnotatingDesc: "Allow adding comments and markup",
  permissionFillingForms: "Form Filling",
  permissionFillingFormsDesc: "Allow filling interactive forms",
  permissionDocumentAssembly: "Page Extraction",
  permissionDocumentAssemblyDesc: "Allow page insertion, deletion, rotation",
  permissionContentAccessibility: "Screen Reader Access",
  permissionContentAccessibilityDesc: "Allow accessibility tools (recommended)",
  
  // Security note
  securityNoteTitle: "Security Note",
  securityNoteDesc: "These restrictions are enforced by PDF viewers that respect the PDF standard. They provide reasonable protection but should not be relied upon for highly sensitive documents.",
  
  // Permission types
  printing: "Printing",
  printingNone: "Not allowed",
  printingLow: "Low resolution only",
  printingHigh: "High resolution allowed",
  copying: "Text copying and selection",
  modifying: "Document editing and modification", 
  annotating: "Comments and annotations",
  fillingForms: "Interactive form filling",
  contentAccessibility: "Screen reader access (recommended)",
  documentAssembly: "Page extraction and assembly",
  
  // Progress and status messages
  analyzing: "Analyzing document security...",
  encrypting: "Applying password protection...",
  finalizing: "Finalizing protected document...",
  complete: "Protection applied successfully!",
  
  // Security info
  securityInfo: "Document Security Information",
  isProtected: "This document is already password protected",
  noProtection: "This document has no password protection",
  
  // Warnings and alerts
  passwordWarning: "⚠️ Important: If you forget this password, the document cannot be recovered!",
  weakPassword: "Password is too weak. Consider using:",
  passwordMismatch: "Passwords do not match",
  existingProtection: "This PDF already has password protection. You may need the current password to modify it.",
  
  // Password strength
  strengthVeryWeak: "Very Weak",
  strengthWeak: "Weak", 
  strengthFair: "Fair",
  strengthStrong: "Strong",
  strengthVeryStrong: "Very Strong",
  
  // Protection modes
  protectionMode: "Protection Mode",
  fullProtection: "Full Protection",
  smartProtection: "Smart Protection",
  fullProtectionDesc: "Requires password to open the document. Maximum security for confidential files.",
  smartProtectionDesc: "Free viewing, restricted printing/copying. Perfect for sharing documents.",
  passwordProtection: "Password Protection",
  documentRestrictions: "Document Restrictions",
  realPDFEncryption: "Real PDF Encryption",
  securityLevel: "Security Level",
  simpleView: "Simple View",
  showAI: "Show AI Recommendations",
  hideAI: "Hide AI Recommendations",
  
  // Optional field labels
  documentPasswordOptional: "Document Password (Optional)",
  leaveEmptyForPermissions: "Leave empty for permissions-only protection",
  notNeededForPermissions: "Not needed for permissions-only",
  
  // Encryption notices
  realPDFEncryptionTitle: "Real PDF Encryption",
  realPDFEncryptionDesc: "This tool applies industry-standard PDF encryption that works with all PDF readers. Your document will be genuinely password-protected and restricted according to your settings.",
  securityLevelLabel: "Security Level",
  passwordWillBeRequired: "Your PDF will require the password to open and will respect all permission settings.",

  // Buttons and actions
  protectButton: "🛡️ Protect PDF",
  downloadProtected: "Download Protected PDF",
  showPassword: "Show password",
  hidePassword: "Hide password",
  generatePassword: "Generate secure password",
  toggleAdvanced: "Advanced settings",
  applyPreset: "Apply preset",
  dismiss: "Dismiss",
  
  // File selection
  selectedFile: "Selected file",
  fileSize: "File size",
  removeFile: "Remove file",
  selectNewFile: "Select different file",
  
  // Quick steps section
  quickSteps: {
    title: "How to protect your PDF",
    step1: {
      title: "Upload your PDF",
      description: "Select the PDF document you want to protect"
    },
    step2: {
      title: "Set a strong password", 
      description: "Create a secure password that you'll remember"
    },
    step3: {
      title: "Choose restrictions",
      description: "Configure what users can do with the document"
    },
    step4: {
      title: "Download protected file",
      description: "Get your password-protected PDF document"
    }
  },
  
  // Benefits section
  benefits: {
    title: "Why protect your PDFs?",
    privacy: {
      title: "Keep information private",
      description: "Prevent unauthorized access to sensitive documents"
    },
    control: {
      title: "Control document usage",
      description: "Decide who can print, copy, or edit your content"
    },
    compliance: {
      title: "Meet security requirements", 
      description: "Satisfy regulatory and business security standards"
    },
    professional: {
      title: "Professional document security",
      description: "Add enterprise-level protection to your documents"
    }
  },
  
  // File size warnings
  fileSizeWarnings: {
    mediumFile: "Large File Warning",
    largeFile: "Very Large File Warning",
    criticalFile: "Critical Size Warning",
    mediumFileDesc: "This file is moderately large and may take 10-30 seconds to encrypt.",
    largeFileDesc: "This file is large and may take 1-2 minutes to encrypt. Please be patient and do not close the browser tab.",
    criticalFileDesc: "This file is very large and may take several minutes to encrypt. The browser tab may become unresponsive during processing.",
    tips: "Tips:",
    tipCloseOtherTabs: "Close other browser tabs to free up memory",
    tipEnsureRAM: "Ensure your device has sufficient RAM",
    tipCompressFirst: "Consider compressing the PDF first"
  },
  
  // Error messages
  errors: {
    fileNotSelected: "Please select a PDF file first",
    invalidFile: "Invalid PDF file format",
    passwordRequired: "Password is required",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    encryptionFailed: "Failed to encrypt document",
    fileTooLarge: "File is too large for encryption (max 100MB)",
    processingError: "Error processing PDF. Please try again.",
    unsupportedPDF: "This PDF format is not supported for encryption"
  },
  
  // Success messages
  success: {
    protected: "PDF successfully protected with password!",
    downloaded: "Protected PDF downloaded successfully"
  },

  // AI Recommendations
  ai: {
    analysis: {
      analyzing: "AI Security Analysis",
      analyzingDescription: "Analyzing document and recommending optimal security settings...",
      failed: "Analysis Failed",
      retry: "Retry Analysis",
      completed: "Analysis completed at {time}",
      refresh: "Refresh Analysis"
    },
    recommendations: {
      title: "🤖 AI Security Recommendations",
      confidence: "{percent}% Confidence",
      recommended: "Recommended",
      showDetails: "Show Details",
      hideDetails: "Hide Details",
      applyButton: "Apply Settings"
    },
    securityLevels: {
      title: "Security Level Options"
    },
    levels: {
      basic: {
        title: "Basic Protection",
        description: "Standard password protection with viewing restrictions",
        reasoning: "Good for general documents that need basic privacy"
      },
      medium: {
        title: "Medium Security",
        description: "Enhanced protection with comprehensive restrictions",
        reasoning: "Recommended for sensitive business documents"
      },
      high: {
        title: "Maximum Security",
        description: "Strongest encryption with all restrictions enabled",
        reasoning: "Best for confidential or highly sensitive documents"
      }
    },
    suggestions: {
      title: "AI Security Suggestions"
    },
    passwords: {
      suggestion1: "Use a combination of uppercase, lowercase, numbers, and symbols",
      suggestion2: "Make your password at least 12 characters long",
      suggestion3: "Avoid using common words or personal information",
      contractSuggestion: "For contracts, use a very strong password and share it securely"
    },
    details: {
      title: "Detailed Security Analysis",
      permissions: "Allowed Permissions",
      restrictions: "Restrictions",
      passwordStrength: "Required Password Strength"
    },
    errors: {
      analysisError: "Failed to analyze document security"
    }
  },

  // Detailed unique content for this tool (replaces generic template)
  detailed: {
    title: 'Why Choose Our PDF Protection Tool?',
    functionality: {
      title: 'Military-Grade PDF Encryption',
      description1: 'Our PDF protection tool implements industry-standard AES-256 encryption with RC4 fallback compatibility, the same encryption used by banks and government agencies. Every document is encrypted locally in your browser using PDF-lib\'s security module, ensuring your passwords and files never leave your device.',
      description2: 'The encryption engine supports dual-password systems: user passwords for viewing restrictions and owner passwords for editing permissions. Choose between full document protection or granular permission controls. Set specific restrictions for printing quality, text copying, content modification, form filling, annotations, and page assembly.'
    },
    capabilities: {
      title: 'Advanced Security Controls',
      description1: 'Protect confidential contracts, financial reports, legal documents, medical records, and proprietary business materials with customizable security presets. Our AI-powered security advisor analyzes document content and recommends optimal protection levels based on detected sensitivity markers.',
      description2: 'Four preset security levels provide instant configuration: Basic for general documents, Standard for business files, Professional for sensitive data, and Maximum for highly confidential materials. Each preset intelligently configures password strength requirements, encryption methods, and permission restrictions. Real-time password strength analysis ensures adequate security while preventing common vulnerabilities like dictionary words or predictable patterns.'
    }
  }
};