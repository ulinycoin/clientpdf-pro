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
    console.log('🔧 ConversionService: Starting Word to PDF conversion...', { 
      fileName: file.name, 
      fileSize: file.size, 
      settings 
    });

    try {
      // Validate file
      if (!this.isValidWordFile(file)) {
        console.log('❌ ConversionService: Invalid file type');
        return {
          success: false,
          error: 'Please select a valid Word document (.docx, .doc)'
        };
      }

      console.log('✅ ConversionService: File validation passed');

      // Step 1: Parse Word document
      console.log('📖 ConversionService: Starting document parsing...');
      const documentContent = await this.wordParser.parseDocument(file);
      console.log('✅ ConversionService: Document parsed successfully', { 
        paragraphs: documentContent.paragraphs?.length,
        metadata: documentContent.metadata 
      });

      // Step 2: Generate PDF
      console.log('🎨 ConversionService: Starting PDF generation...');
      const pdfBytes = await this.pdfGenerator.createPDF(documentContent, settings);
      console.log('✅ ConversionService: PDF generated successfully', { 
        pdfSizeBytes: pdfBytes?.length 
      });

      return {
        success: true,
        pdfBytes,
        metadata: documentContent.metadata
      };

    } catch (error) {
      console.error('❌ ConversionService: Conversion failed:', error);
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
