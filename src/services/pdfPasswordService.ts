import { PDFDocument, PDFDict, PDFName, PDFString } from 'pdf-lib';
import { 
  PDFProcessingResult, 
  ProgressCallback, 
  PDFError 
} from '../types';
import { 
  PasswordProtectionOptions, 
  PDFSecurityInfo, 
  PasswordValidationResult,
  SecurityService,
  SecurityError,
  PDFPermissions
} from '../types/security.types';

export class PDFPasswordService implements SecurityService {
  name = 'PDFPasswordService';
  version = '1.1.0';
  
  private static instance: PDFPasswordService;

  static getInstance(): PDFPasswordService {
    if (!this.instance) {
      this.instance = new PDFPasswordService();
    }
    return this.instance;
  }

  /**
   * Check if the service is supported by the browser
   */
  isSupported(): boolean {
    return typeof PDFDocument !== 'undefined' && 
           typeof File !== 'undefined' && 
           typeof Blob !== 'undefined' &&
           typeof crypto !== 'undefined';
  }

  /**
   * Protect PDF with password using Web Crypto API for additional encryption
   */
  async protectPDF(
    file: File,
    options: PasswordProtectionOptions,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    const startTime = performance.now();
    
    try {
      onProgress?.(0, 'Starting password protection...');

      // Validate password
      if (options.action === 'protect' && !options.password) {
        throw new Error('Password is required for protection');
      }

      if (options.action === 'protect') {
        const validation = this.validatePassword(options.password!);
        if (!validation.isValid) {
          throw new Error('Password does not meet security requirements');
        }
      }

      onProgress?.(20, 'Loading PDF document...');

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      let pdfDoc: PDFDocument;

      try {
        // Try loading without password first
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (error) {
        // If loading fails and we're trying to remove password, try with old password
        if (options.action === 'remove' && options.oldPassword) {
          try {
            pdfDoc = await PDFDocument.load(arrayBuffer, { 
              ignoreEncryption: false 
            });
          } catch (passwordError) {
            throw new Error('Invalid password or corrupted PDF file');
          }
        } else {
          throw error;
        }
      }

      onProgress?.(40, 'Processing security settings...');

      if (options.action === 'protect') {
        // Add password protection with additional encryption
        return await this.addAdvancedPasswordProtection(
          file,
          pdfDoc, 
          options.password!, 
          options.permissions,
          onProgress,
          startTime
        );
      } else if (options.action === 'remove') {
        // Remove password protection
        return await this.removePasswordProtection(
          pdfDoc,
          onProgress,
          startTime,
          file.size
        );
      } else {
        throw new Error('Invalid action specified');
      }

    } catch (error) {
      return {
        success: false,
        error: this.createSecurityError(error, 'Password protection failed')
      };
    }
  }

  /**
   * Remove PDF password protection
   */
  async removePDFPassword(
    file: File,
    password: string,
    onProgress?: ProgressCallback
  ): Promise<PDFProcessingResult> {
    return this.protectPDF(file, {
      action: 'remove',
      oldPassword: password
    }, onProgress);
  }

  /**
   * Analyze PDF security information
   */
  async analyzePDFSecurity(file: File): Promise<PDFSecurityInfo> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to load without password
      let pdfDoc: PDFDocument;
      let isPasswordProtected = false;
      
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (error) {
        // If loading fails, it might be password protected
        isPasswordProtected = true;
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer, { 
            ignoreEncryption: true 
          });
        } catch (encryptionError) {
          throw new Error('Unable to analyze encrypted PDF');
        }
      }

      // Analyze document structure
      const catalog = pdfDoc.catalog;
      const context = pdfDoc.context;
      
      // Get encryption information
      const encryptDict = context.lookup(context.trailerInfo.Encrypt);
      const hasEncryption = encryptDict !== undefined;

      // Extract metadata
      const metadata = this.extractMetadata(pdfDoc);

      // Default permissions (assuming no restrictions if not encrypted)
      const permissions: PDFPermissions = {
        printing: true,
        modifying: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };

      // If encrypted, try to get actual permissions
      if (hasEncryption && encryptDict) {
        // Note: pdf-lib doesn't expose detailed permission parsing
        // This would require more advanced PDF parsing
      }

      return {
        isPasswordProtected,
        hasUserPassword: isPasswordProtected,
        hasOwnerPassword: isPasswordProtected,
        permissions,
        encryption: hasEncryption ? {
          version: 'Unknown', // Would need deeper PDF parsing
          keyLength: 128 // Default assumption
        } : undefined,
        metadata
      };

    } catch (error) {
      throw this.createSecurityError(error, 'Security analysis failed');
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): PasswordValidationResult {
    const suggestions: string[] = [];
    let isValid = true;
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    // Length check
    if (password.length < 8) {
      isValid = false;
      suggestions.push('Password should be at least 8 characters long');
    }

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let varietyScore = 0;
    if (hasLowercase) varietyScore++;
    if (hasUppercase) varietyScore++;
    if (hasNumbers) varietyScore++;
    if (hasSpecialChars) varietyScore++;

    if (varietyScore < 3) {
      suggestions.push('Include a mix of uppercase, lowercase, numbers, and special characters');
    }

    // Common patterns check
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        suggestions.push('Avoid common patterns and dictionary words');
        break;
      }
    }

    // Determine strength
    if (password.length >= 12 && varietyScore >= 3) {
      strength = 'strong';
    } else if (password.length >= 8 && varietyScore >= 2) {
      strength = 'medium';
    }

    // Final validation
    if (suggestions.length > 0) {
      isValid = false;
    }

    return {
      isValid,
      strength,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Add advanced password protection using Web Crypto API + PDF processing
   */
  private async addAdvancedPasswordProtection(
    originalFile: File,
    pdfDoc: PDFDocument,
    password: string,
    permissions?: PDFPermissions,
    onProgress?: ProgressCallback,
    startTime?: number
  ): Promise<PDFProcessingResult> {
    try {
      onProgress?.(50, 'Applying encryption...');

      // Step 1: Get the original PDF data
      const originalData = await originalFile.arrayBuffer();
      
      // Step 2: Create password hash for verification
      const passwordHash = await this.createPasswordHash(password);
      
      // Step 3: Create encrypted content using Web Crypto API
      const encryptedData = await this.encryptWithWebCrypto(originalData, password);
      
      onProgress?.(70, 'Creating protected PDF...');
      
      // Step 4: Create a new PDF with encrypted content embedded
      const protectedDoc = await this.createProtectedPDFWrapper(
        encryptedData, 
        passwordHash,
        originalFile.name,
        pdfDoc.getPageCount()
      );

      onProgress?.(90, 'Finalizing protection...');

      const pdfBytes = await protectedDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const processingTime = startTime ? performance.now() - startTime : 0;

      onProgress?.(100, 'Password protection applied!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount: pdfDoc.getPageCount(),
          originalSize: originalFile.size,
          processedSize: blob.size,
          processingTime,
          securityApplied: true,
          encryptionMethod: 'Web Crypto API + PDF Wrapper'
        }
      };

    } catch (error) {
      throw this.createSecurityError(error, 'Failed to apply password protection');
    }
  }

  /**
   * Create password hash using Web Crypto API
   */
  private async createPasswordHash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt data using Web Crypto API
   */
  private async encryptWithWebCrypto(data: ArrayBuffer, password: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Create key from password
    const key = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Generate salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive encryption key
    const encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      encryptionKey,
      data
    );

    // Combine salt + iv + encrypted data
    const result = new ArrayBuffer(salt.length + iv.length + encryptedData.byteLength);
    const resultView = new Uint8Array(result);
    resultView.set(salt, 0);
    resultView.set(iv, salt.length);
    resultView.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    return result;
  }

  /**
   * Create a PDF wrapper that contains encrypted data and requires password
   */
  private async createProtectedPDFWrapper(
    encryptedData: ArrayBuffer,
    passwordHash: string,
    originalName: string,
    pageCount: number
  ): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    
    // Add a protection page that explains the document is encrypted
    const page = doc.addPage([612, 792]); // Standard letter size
    
    // Add protection notice
    page.drawText('🔒 PROTECTED DOCUMENT', {
      x: 50,
      y: 700,
      size: 24,
      color: { r: 0.8, g: 0.2, b: 0.2 }
    });
    
    page.drawText(`Document: ${originalName}`, {
      x: 50,
      y: 650,
      size: 14
    });
    
    page.drawText(`Pages: ${pageCount}`, {
      x: 50,
      y: 625,
      size: 14
    });
    
    page.drawText('This PDF has been protected with LocalPDF.', {
      x: 50,
      y: 580,
      size: 12
    });
    
    page.drawText('To access the original content:', {
      x: 50,
      y: 550,
      size: 12
    });
    
    page.drawText('1. Go to https://localpdf.online/password-pdf', {
      x: 70,
      y: 525,
      size: 11
    });
    
    page.drawText('2. Upload this protected file', {
      x: 70,
      y: 505,
      size: 11
    });
    
    page.drawText('3. Enter your password to decrypt', {
      x: 70,
      y: 485,
      size: 11
    });
    
    page.drawText('⚠️ Warning: This document cannot be opened', {
      x: 50,
      y: 450,
      size: 11,
      color: { r: 0.8, g: 0.4, b: 0.2 }
    });
    
    page.drawText('with standard PDF viewers without decryption.', {
      x: 50,
      y: 435,
      size: 11,
      color: { r: 0.8, g: 0.4, b: 0.2 }
    });

    // Embed encrypted data as metadata (not visible but accessible)
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    const hashBase64 = btoa(passwordHash);
    
    // Store in custom metadata
    doc.setTitle('LocalPDF Protected Document');
    doc.setAuthor('LocalPDF Security Tool');
    doc.setSubject(`Protected: ${originalName}`);
    doc.setKeywords(`encrypted:${hashBase64}:${encryptedBase64}`);
    
    return doc;
  }

  /**
   * Remove password protection from PDF
   */
  private async removePasswordProtection(
    pdfDoc: PDFDocument,
    onProgress?: ProgressCallback,
    startTime?: number,
    originalSize?: number
  ): Promise<PDFProcessingResult> {
    try {
      onProgress?.(60, 'Checking for LocalPDF protection...');

      // Check if this is a LocalPDF protected document
      const keywords = pdfDoc.getKeywords();
      if (keywords && keywords.startsWith('encrypted:')) {
        // This is our protected document, we need to decrypt it
        throw new Error('LocalPDF protected documents require password verification through the web interface. Please use the "Remove Password" feature on the website.');
      }

      onProgress?.(70, 'Removing password protection...');

      // Create new unprotected document
      const unprotectedDoc = await PDFDocument.create();
      
      // Copy metadata
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const subject = pdfDoc.getSubject();
      
      if (title) unprotectedDoc.setTitle(title);
      if (author) unprotectedDoc.setAuthor(author);
      if (subject) unprotectedDoc.setSubject(subject);

      // Copy all pages
      const pageCount = pdfDoc.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await unprotectedDoc.copyPages(pdfDoc, pageIndices);
      
      copiedPages.forEach(page => {
        unprotectedDoc.addPage(page);
      });

      onProgress?.(90, 'Saving unprotected PDF...');

      // Save without encryption
      const pdfBytes = await unprotectedDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const processingTime = startTime ? performance.now() - startTime : 0;

      onProgress?.(100, 'Password protection removed!');

      return {
        success: true,
        data: blob,
        metadata: {
          pageCount,
          originalSize: originalSize || 0,
          processedSize: blob.size,
          processingTime,
          securityRemoved: true
        }
      };

    } catch (error) {
      throw this.createSecurityError(error, 'Failed to remove password protection');
    }
  }

  /**
   * Extract metadata from PDF for privacy analysis
   */
  private extractMetadata(pdfDoc: PDFDocument): {
    hasPersonalInfo: boolean;
    metadataFields: string[];
    potentialPrivacyRisks: string[];
  } {
    const metadataFields: string[] = [];
    const potentialPrivacyRisks: string[] = [];

    // Check standard metadata fields
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const creator = pdfDoc.getCreator();
    const producer = pdfDoc.getProducer();

    if (title) {
      metadataFields.push('Title');
      if (this.containsPersonalInfo(title)) {
        potentialPrivacyRisks.push('Title may contain personal information');
      }
    }

    if (author) {
      metadataFields.push('Author');
      potentialPrivacyRisks.push('Author information is present');
    }

    if (subject) metadataFields.push('Subject');
    if (creator) metadataFields.push('Creator');
    if (producer) metadataFields.push('Producer');

    const hasPersonalInfo = potentialPrivacyRisks.length > 0;

    return {
      hasPersonalInfo,
      metadataFields,
      potentialPrivacyRisks
    };
  }

  /**
   * Check if text contains potential personal information
   */
  private containsPersonalInfo(text: string): boolean {
    const personalPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone pattern
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/ // Credit card pattern
    ];

    return personalPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Create a standardized security error
   */
  private createSecurityError(error: any, context: string = 'Security operation'): SecurityError {
    let message = 'An error occurred during security operation';
    let code: SecurityError['code'] = 'SECURITY_ERROR';
    
    if (error instanceof Error) {
      message = error.message;
      
      const errorText = message.toLowerCase();
      
      if (errorText.includes('password') || errorText.includes('invalid')) {
        code = 'INVALID_PASSWORD';
        message = 'Invalid password provided';
      } else if (errorText.includes('encrypt')) {
        code = 'ENCRYPTION_FAILED';
        message = 'Failed to encrypt PDF file';
      } else if (errorText.includes('decrypt')) {
        code = 'DECRYPTION_FAILED';
        message = 'Failed to decrypt PDF file';
      } else if (errorText.includes('permission')) {
        code = 'PERMISSION_DENIED';
        message = 'Permission denied for this operation';
      }
    }
    
    return {
      code,
      message: `${context}: ${message}`,
      cause: error instanceof Error ? error.stack : String(error)
    };
  }
}

// Export singleton instance
const pdfPasswordService = PDFPasswordService.getInstance();
export default pdfPasswordService;

// Named exports for compatibility
export { pdfPasswordService };
export type { PDFSecurityInfo, PasswordProtectionOptions };