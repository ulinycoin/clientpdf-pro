import { WordParser } from './wordParser';
import { PDFGenerator } from './pdfGenerator';
import { ConversionSettings, ConversionResult } from '../types/wordToPdf.types';

export class ConversionService {
  private wordParser: WordParser;
  private pdfGenerator: PDFGenerator;

  constructor() {
    this.wordParser = new WordParser();
    this.pdfGenerator = new PDFGenerator();
  }

  async convertWordToPDF(
    file: File,
    settings: ConversionSettings = {
      pageSize: 'A4',
      embedFonts: true,
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      fontSize: 12,
      compression: false
    }
  ): Promise<ConversionResult> {
    try {
      // Validate file
      if (!this.isValidWordFile(file)) {
        return {
          success: false,
          error: 'Please select a valid Word document (.docx, .doc)'
        };
      }

      // Step 1: Parse Word document
      const documentContent = await this.wordParser.parseDocument(file);

      // Step 2: Generate PDF
      const pdfBytes = await this.pdfGenerator.createPDF(documentContent, settings);

      return {
        success: true,
        pdfBytes,
        metadata: documentContent.metadata
      };

    } catch (error) {
      console.error('Conversion error:', error);
      return {
        success: false,
        error: error.message || 'Conversion failed'
      };
    }
  }

  private isValidWordFile(file: File): boolean {
    const validExtensions = ['.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  }

  async downloadPDF(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/\.[^/.]+$/, '') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
