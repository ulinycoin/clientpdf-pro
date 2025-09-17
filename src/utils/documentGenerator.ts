import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface DocumentGeneratorOptions {
  title?: string;
  author?: string;
  subject?: string;
  fontSize?: number;
  fontFamily?: string;
  includeMetadata?: boolean;
}

export interface OCRMetadata {
  confidence?: number;
  processingTime?: number;
  wordsCount?: number;
  language?: string;
  originalFileName?: string;
}

export class DocumentGenerator {
  /**
   * Generate DOCX document from OCR text
   */
  async generateDOCX(
    text: string,
    metadata?: OCRMetadata,
    options: DocumentGeneratorOptions = {}
  ): Promise<Blob> {
    const {
      title = 'OCR Extracted Text',
      author = 'LocalPDF OCR Tool',
      subject = 'OCR Results',
      fontSize = 11,
      fontFamily = 'Times New Roman',
      includeMetadata = true
    } = options;

    console.log('📄 Generating DOCX document:', {
      textLength: text.length,
      hasMetadata: !!metadata,
      includeMetadata,
      fontSize,
      fontFamily
    });

    try {
      // Create paragraphs from text
      const paragraphs: Paragraph[] = [];

      // Add title if provided
      if (title) {
        paragraphs.push(
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          })
        );
      }

      // Add metadata section if requested
      if (includeMetadata && metadata) {
        paragraphs.push(
          new Paragraph({
            text: 'Document Information',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );

        const metadataInfo: string[] = [];
        if (metadata.originalFileName) {
          metadataInfo.push(`Source: ${metadata.originalFileName}`);
        }
        if (metadata.language) {
          metadataInfo.push(`Language: ${metadata.language}`);
        }
        if (metadata.confidence !== undefined) {
          metadataInfo.push(`Confidence: ${metadata.confidence.toFixed(1)}%`);
        }
        if (metadata.wordsCount !== undefined) {
          metadataInfo.push(`Words: ${metadata.wordsCount}`);
        }
        if (metadata.processingTime !== undefined) {
          metadataInfo.push(`Processing Time: ${(metadata.processingTime / 1000).toFixed(1)}s`);
        }
        metadataInfo.push(`Generated: ${new Date().toLocaleString()}`);

        for (const info of metadataInfo) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: info,
                  size: (fontSize - 1) * 2, // Size in half-points
                  font: fontFamily,
                  color: '666666'
                })
              ],
              spacing: { after: 80 }
            })
          );
        }

        // Add separator
        paragraphs.push(
          new Paragraph({
            text: '',
            spacing: { before: 200, after: 200 }
          })
        );
      }

      // Split text into paragraphs and process each
      const textParagraphs = text.split('\n');
      
      for (let i = 0; i < textParagraphs.length; i++) {
        const paragraphText = textParagraphs[i].trim();
        
        if (paragraphText) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraphText,
                  size: fontSize * 2, // Size in half-points
                  font: fontFamily
                })
              ],
              spacing: { after: 120 }
            })
          );
        } else {
          // Empty line - add spacing
          paragraphs.push(
            new Paragraph({
              text: '',
              spacing: { after: 120 }
            })
          );
        }
      }

      // Create document
      const doc = new Document({
        creator: author,
        title: title,
        subject: subject,
        description: 'Text extracted using OCR technology',
        lastModifiedBy: author,
        revision: 1,
        sections: [
          {
            properties: {},
            children: paragraphs
          }
        ]
      });

      // Generate DOCX blob
      const docxBuffer = await Packer.toBlob(doc);
      
      console.log('✅ DOCX document generated:', {
        size: docxBuffer.size,
        paragraphs: paragraphs.length
      });

      return docxBuffer;

    } catch (error) {
      console.error('❌ DOCX generation failed:', error);
      throw new Error(`Failed to generate DOCX: ${error.message}`);
    }
  }

  /**
   * Generate RTF document from OCR text
   */
  generateRTF(
    text: string,
    metadata?: OCRMetadata,
    options: DocumentGeneratorOptions = {}
  ): Blob {
    const {
      title = 'OCR Extracted Text',
      author = 'LocalPDF OCR Tool',
      fontSize = 11,
      fontFamily = 'Times New Roman',
      includeMetadata = true
    } = options;

    console.log('📄 Generating RTF document:', {
      textLength: text.length,
      hasMetadata: !!metadata,
      includeMetadata,
      fontSize,
      fontFamily
    });

    try {
      // RTF header with font table and colors
      let rtfContent = '{\\rtf1\\ansi\\deff0';
      
      // Font table
      rtfContent += '{\\fonttbl{\\f0\\froman\\fprq2\\fcharset0 ' + fontFamily + ';}' +
                   '{\\f1\\fswiss\\fprq2\\fcharset0 Arial;}}';
      
      // Color table
      rtfContent += '{\\colortbl;\\red0\\green0\\blue0;\\red102\\green102\\blue102;}';
      
      // Document info
      rtfContent += '{\\info{\\title ' + this.escapeRTF(title) + '}' +
                   '{\\author ' + this.escapeRTF(author) + '}' +
                   '{\\subject OCR Results}' +
                   '{\\creatim\\yr' + new Date().getFullYear() + 
                   '\\mo' + (new Date().getMonth() + 1) + 
                   '\\dy' + new Date().getDate() + '}}';

      // Document formatting
      rtfContent += '\\viewkind4\\uc1\\pard\\f0\\fs' + (fontSize * 2); // Font size in half-points

      // Add title
      if (title) {
        rtfContent += '\\qc\\b\\fs' + ((fontSize + 4) * 2) + ' ' + this.escapeRTF(title) + '\\b0\\fs' + (fontSize * 2) + '\\par\\par';
      }

      // Add metadata
      if (includeMetadata && metadata) {
        rtfContent += '\\ql\\b\\fs' + ((fontSize + 2) * 2) + ' Document Information\\b0\\fs' + (fontSize * 2) + '\\par';
        
        const metadataInfo: string[] = [];
        if (metadata.originalFileName) {
          metadataInfo.push(`Source: ${metadata.originalFileName}`);
        }
        if (metadata.language) {
          metadataInfo.push(`Language: ${metadata.language}`);
        }
        if (metadata.confidence !== undefined) {
          metadataInfo.push(`Confidence: ${metadata.confidence.toFixed(1)}%`);
        }
        if (metadata.wordsCount !== undefined) {
          metadataInfo.push(`Words: ${metadata.wordsCount}`);
        }
        if (metadata.processingTime !== undefined) {
          metadataInfo.push(`Processing Time: ${(metadata.processingTime / 1000).toFixed(1)}s`);
        }
        metadataInfo.push(`Generated: ${new Date().toLocaleString()}`);

        for (const info of metadataInfo) {
          rtfContent += '\\cf2\\fs' + ((fontSize - 1) * 2) + ' ' + this.escapeRTF(info) + '\\cf1\\fs' + (fontSize * 2) + '\\par';
        }
        
        rtfContent += '\\par\\par'; // Separator
      }

      // Add main text content
      const textParagraphs = text.split('\n');
      
      for (const paragraph of textParagraphs) {
        const trimmedParagraph = paragraph.trim();
        
        if (trimmedParagraph) {
          rtfContent += this.escapeRTF(trimmedParagraph) + '\\par';
        } else {
          rtfContent += '\\par'; // Empty line
        }
      }

      // Close RTF document
      rtfContent += '}';

      // Create blob
      const rtfBlob = new Blob([rtfContent], { 
        type: 'application/rtf'
      });

      console.log('✅ RTF document generated:', {
        size: rtfBlob.size,
        contentLength: rtfContent.length
      });

      return rtfBlob;

    } catch (error) {
      console.error('❌ RTF generation failed:', error);
      throw new Error(`Failed to generate RTF: ${error.message}`);
    }
  }

  /**
   * Escape special RTF characters
   */
  private escapeRTF(text: string): string {
    return text
      .replace(/\\/g, '\\\\')      // Escape backslashes
      .replace(/{/g, '\\{')        // Escape opening braces
      .replace(/}/g, '\\}')        // Escape closing braces
      .replace(/[\u0080-\uffff]/g, (match) => {
        // Convert Unicode characters to RTF unicode notation
        return '\\u' + match.charCodeAt(0) + '?';
      });
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: 'docx' | 'rtf'): string {
    switch (format) {
      case 'docx': return 'docx';
      case 'rtf': return 'rtf';
      default: return 'txt';
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: 'docx' | 'rtf'): string {
    switch (format) {
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'rtf': return 'application/rtf';
      default: return 'text/plain';
    }
  }
}

// Export singleton instance
export const documentGenerator = new DocumentGenerator();