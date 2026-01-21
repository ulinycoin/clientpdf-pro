import { PDFDocument } from 'pdf-lib';
import { PDFDocument as PDFDocumentEncrypt } from 'pdf-lib-plus-encrypt';
import type {
    PDFProcessingResult,
    ProgressCallback,
    ProtectionSettings,
    ProtectionProgress
} from '@/types/pdf';

/**
 * Service dedicated to PDF security and structural cleaning.
 * Extracted from the monolithic PDFService for better maintainability.
 */
export class SecurityService {
    /**
     * Protect PDF with password encryption
     */
    async protectPDF(
        file: File,
        settings: ProtectionSettings,
        onProgress?: (progress: ProtectionProgress) => void
    ): Promise<Uint8Array> {
        try {
            onProgress?.({
                stage: 'analyzing',
                progress: 10,
                message: 'Loading PDF document...'
            });

            // Load the original PDF
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocumentEncrypt.load(arrayBuffer);

            onProgress?.({
                stage: 'preparing',
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

            // Map printing permission to boolean (pdf-lib-plus-encrypt uses boolean)
            const printingAllowed = settings.permissions.printing !== 'none';

            // Encrypt the PDF with password and permissions
            await pdfDoc.encrypt({
                userPassword: settings.userPassword || '',
                ownerPassword: settings.ownerPassword || settings.userPassword || '',
                permissions: {
                    printing: printingAllowed,
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

            // Save the encrypted PDF (useObjectStreams must be false for encryption)
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

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
    }

    /**
     * Flatten PDF forms and annotations
     */
    async flattenPDF(
        file: File,
        onProgress?: ProgressCallback
    ): Promise<PDFProcessingResult<Blob>> {
        const startTime = performance.now();

        try {
            onProgress?.(0, 'Loading PDF...');

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            onProgress?.(20, 'Flattening form fields...');

            // Flatten form fields
            const form = pdfDoc.getForm();
            try {
                form.flatten();
            } catch {
                console.warn('Could not flatten form fields, maybe no form exists.');
            }

            onProgress?.(50, 'Flattening annotations...');

            // Flatten annotations on each page
            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (typeof (page as any).flatten === 'function') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (page as any).flatten();
                    }
                } catch {
                    console.warn(`Could not flatten annotations on page ${i + 1}.`);
                }
                const progress = 50 + (i / pages.length) * 30;
                onProgress?.(progress, `Processing page ${i + 1}/${pages.length}...`);
            }

            onProgress?.(80, 'Saving PDF...');

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const processingTime = performance.now() - startTime;
            onProgress?.(100, 'Completed!');

            return {
                success: true,
                data: blob,
                metadata: {
                    pageCount: pdfDoc.getPageCount(),
                    originalSize: file.size,
                    processedSize: blob.size,
                    processingTime
                }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'FLATTEN_FAILED',
                    message: error instanceof Error ? error.message : 'PDF flatten failed'
                }
            };
        }
    }
}

export const securityService = new SecurityService();
