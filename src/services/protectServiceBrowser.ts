import { PDFDocument, StandardFonts } from 'pdf-lib-plus-encrypt';
import type { 
  ProtectionSettings, 
  PasswordStrength, 
  SecurityInfo, 
  ProtectionProgress 
} from '../types/protect.types';

/**
 * Protect PDF with real browser-compatible encryption using pdf-lib-plus-encrypt
 * This implementation provides genuine PDF encryption that works in the browser
 */
export const protectPDFInBrowser = async (
  file: File,
  settings: ProtectionSettings,
  onProgress?: (progress: ProtectionProgress) => void
): Promise<Uint8Array> => {
  try {
    onProgress?.({
      stage: 'analyzing',
      progress: 10,
      message: 'Loading PDF document...'
    });

    // Load the original PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    onProgress?.({
      stage: 'extracting',
      progress: 30,
      message: 'Preparing document for encryption...'
    });

    // Add metadata
    pdfDoc.setTitle(pdfDoc.getTitle() || 'Protected Document');
    pdfDoc.setSubject('Password Protected PDF created by LocalPDF');
    pdfDoc.setCreator('LocalPDF - Privacy-First PDF Tools');
    pdfDoc.setProducer('LocalPDF with pdf-lib-plus-encrypt');

    onProgress?.({
      stage: 'encrypting',
      progress: 60,
      message: 'Applying encryption and permissions...'
    });

    // Encrypt the PDF with password and permissions
    await pdfDoc.encrypt({
      userPassword: settings.userPassword || '',
      ownerPassword: settings.ownerPassword || settings.userPassword || '',
      permissions: {
        printing: mapPrintingPermission(settings.permissions.printing),
        modifying: settings.permissions.modifying || false,
        copying: settings.permissions.copying || false,
        annotating: settings.permissions.annotating || false,
        fillingForms: settings.permissions.fillingForms || false,
        contentAccessibility: settings.permissions.contentAccessibility !== false, // Default true
        documentAssembly: settings.permissions.documentAssembly || false
      }
    });

    onProgress?.({
      stage: 'finalizing',
      progress: 90,
      message: 'Finalizing encrypted document...'
    });

    // Save the encrypted PDF
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false }); // Required for encryption

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'PDF encryption completed successfully!'
    });

    return new Uint8Array(pdfBytes);

  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw new Error(`Failed to encrypt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Map our printing permission format to pdf-lib-plus-encrypt format
 */
const mapPrintingPermission = (printing: 'none' | 'lowResolution' | 'highResolution'): boolean => {
  // pdf-lib-plus-encrypt uses boolean for printing permission
  return printing !== 'none';
};

/**
 * Create a simple encrypted PDF with custom content (for testing)
 */
export const createSimpleEncryptedPDF = async (
  content: {
    title: string;
    text: string;
  },
  settings: ProtectionSettings,
  onProgress?: (progress: ProtectionProgress) => void
): Promise<Uint8Array> => {
  try {
    onProgress?.({
      stage: 'creating',
      progress: 20,
      message: 'Creating new PDF document...'
    });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add metadata
    pdfDoc.setTitle(content.title);
    pdfDoc.setSubject('Encrypted PDF created by LocalPDF');
    pdfDoc.setCreator('LocalPDF - Privacy-First PDF Tools');
    pdfDoc.setProducer('LocalPDF with pdf-lib-plus-encrypt');

    // Add a page with content
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Title
    page.drawText(content.title, {
      x: 50,
      y: 750,
      size: 20,
      font: font,
    });
    
    // Content
    page.drawText(content.text, {
      x: 50,
      y: 700,
      size: 12,
      font: font,
      maxWidth: 495,
    });

    // Protection info
    page.drawText('[PROTECTED] This PDF is password protected', {
      x: 50,
      y: 650,
      size: 14,
      font: font,
    });

    const restrictions = [];
    if (settings.permissions.printing === 'none') restrictions.push('No printing');
    if (!settings.permissions.copying) restrictions.push('No copying');
    if (!settings.permissions.modifying) restrictions.push('No editing');
    
    if (restrictions.length > 0) {
      page.drawText(`Restrictions: ${restrictions.join(', ')}`, {
        x: 50,
        y: 620,
        size: 10,
        font: font,
      });
    }

    onProgress?.({
      stage: 'encrypting',
      progress: 60,
      message: 'Applying password protection...'
    });

    // Encrypt the PDF
    await pdfDoc.encrypt({
      userPassword: settings.userPassword || '',
      ownerPassword: settings.ownerPassword || settings.userPassword || '',
      permissions: {
        printing: mapPrintingPermission(settings.permissions.printing),
        modifying: settings.permissions.modifying || false,
        copying: settings.permissions.copying || false,
        annotating: settings.permissions.annotating || false,
        fillingForms: settings.permissions.fillingForms || false,
        contentAccessibility: settings.permissions.contentAccessibility !== false,
        documentAssembly: settings.permissions.documentAssembly || false
      }
    });

    onProgress?.({
      stage: 'finalizing',
      progress: 90,
      message: 'Finalizing encrypted document...'
    });

    // Save the encrypted PDF
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Encrypted PDF created successfully!'
    });

    return new Uint8Array(pdfBytes);

  } catch (error) {
    console.error('Error creating encrypted PDF:', error);
    throw new Error(`Failed to create encrypted PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Re-export other functions from the original service
export {
  checkPasswordStrength,
  validatePDFProtection,
  generateSecurePassword,
  SECURITY_PRESETS
} from './protectService';