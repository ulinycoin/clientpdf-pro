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
   * Convert PAGE markers to RTF-compatible format (plain text with dashes)
   */
  private convertPageMarkersForRTF(text: string): string {
    // Replace ═══ PAGE N ═══ with plain text ────── Page N ──────
    return text.replace(/═+\nPAGE (\d+)\n═+\n\n?/g, '\n\n────────── Page $1 ──────────\n\n');
  }

  /**
   * Convert PAGE markers to DOCX-compatible format
   */
  private convertPageMarkersForDOCX(text: string, fontSize: number, fontFamily: string): { paragraphs: Paragraph[], hasPages: boolean } {
    const pagePattern = /═+\nPAGE (\d+)\n═+\n\n?/g;
    const parts = text.split(pagePattern);
    const paragraphs: Paragraph[] = [];
    let hasPages = false;

    if (parts.length > 1) {
      hasPages = true;
      // Process parts: [text before first page, page1 number, page1 text, page2 number, page2 text, ...]
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
          // This is a page number
          const pageNum = parts[i];
          paragraphs.push(
            new Paragraph({
              text: `────────── Page ${pageNum} ──────────`,
              heading: HeadingLevel.HEADING_2,
              alignment: 'center',
              spacing: { before: 400, after: 200 }
            })
          );
        } else {
          // This is page content
          const content = parts[i].trim();
          if (content) {
            const lines = content.split('\n');
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine) {
                paragraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: trimmedLine,
                        size: fontSize * 2,
                        font: fontFamily
                      })
                    ],
                    spacing: { after: 120 }
                  })
                );
              } else {
                // Empty line
                paragraphs.push(
                  new Paragraph({
                    text: '',
                    spacing: { after: 120 }
                  })
                );
              }
            }
          }
        }
      }
    }

    return { paragraphs, hasPages };
  }

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

      // Check if text has PAGE markers
      const { paragraphs: pageParagraphs, hasPages } = this.convertPageMarkersForDOCX(text, fontSize, fontFamily);

      if (hasPages) {
        // Use converted paragraphs with page markers (already formatted)
        paragraphs.push(...pageParagraphs);
      } else {
        // Standard text processing (no PAGE markers)
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

      // Add main text content - handle PAGE markers
      const cleanedText = this.convertPageMarkersForRTF(text);
      const textParagraphs = cleanedText.split('\n');

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
   * Generate JSON document from OCR text
   */
  generateJSON(
    text: string,
    metadata?: OCRMetadata,
    options: DocumentGeneratorOptions = {}
  ): Blob {
    const {
      title = 'OCR Extracted Text',
      author = 'LocalPDF OCR Tool',
      includeMetadata = true
    } = options;

    console.log('📄 Generating JSON document:', {
      textLength: text.length,
      hasMetadata: !!metadata,
      includeMetadata
    });

    try {
      // Parse pages if PAGE markers exist
      const pagePattern = /═+\nPAGE (\d+)\n═+\n\n?/g;
      const parts = text.split(pagePattern);
      const pages: any[] = [];

      if (parts.length > 1) {
        // Has page markers
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 1) {
            // This is a page number
            const pageNum = parseInt(parts[i]);
            const pageContent = parts[i + 1]?.trim() || '';

            if (pageContent) {
              pages.push({
                number: pageNum,
                content: pageContent,
                lines: pageContent.split('\n').filter(l => l.trim()).length,
                characters: pageContent.length
              });
            }
          }
        }
      } else {
        // No page markers - single page
        pages.push({
          number: 1,
          content: text.trim(),
          lines: text.split('\n').filter(l => l.trim()).length,
          characters: text.length
        });
      }

      // Build JSON structure
      const jsonData: any = {
        document: {
          title,
          author,
          generatedAt: new Date().toISOString(),
          totalPages: pages.length,
          totalCharacters: text.length,
          totalLines: pages.reduce((sum, p) => sum + p.lines, 0)
        },
        pages
      };

      // Add metadata if requested
      if (includeMetadata && metadata) {
        jsonData.metadata = {
          originalFileName: metadata.originalFileName,
          language: metadata.language,
          confidence: metadata.confidence,
          wordsCount: metadata.wordsCount,
          processingTime: metadata.processingTime
        };
      }

      // Add full text for convenience
      jsonData.fullText = text;

      const jsonString = JSON.stringify(jsonData, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });

      console.log('✅ JSON document generated:', {
        size: jsonBlob.size,
        pages: pages.length
      });

      return jsonBlob;

    } catch (error) {
      console.error('❌ JSON generation failed:', error);
      throw new Error(`Failed to generate JSON: ${error.message}`);
    }
  }

  /**
   * Generate Markdown document from OCR text
   */
  generateMarkdown(
    text: string,
    metadata?: OCRMetadata,
    options: DocumentGeneratorOptions = {}
  ): Blob {
    const {
      title = 'OCR Extracted Text',
      author = 'LocalPDF OCR Tool',
      includeMetadata = true
    } = options;

    console.log('📄 Generating Markdown document:', {
      textLength: text.length,
      hasMetadata: !!metadata,
      includeMetadata
    });

    try {
      let markdown = '';

      // Add title
      if (title) {
        markdown += `# ${title}\n\n`;
      }

      // Add metadata section
      if (includeMetadata && metadata) {
        markdown += `## Document Information\n\n`;

        if (metadata.originalFileName) {
          markdown += `- **Source:** ${metadata.originalFileName}\n`;
        }
        if (metadata.language) {
          markdown += `- **Language:** ${metadata.language}\n`;
        }
        if (metadata.confidence !== undefined) {
          markdown += `- **Confidence:** ${metadata.confidence.toFixed(1)}%\n`;
        }
        if (metadata.wordsCount !== undefined) {
          markdown += `- **Words:** ${metadata.wordsCount}\n`;
        }
        if (metadata.processingTime !== undefined) {
          markdown += `- **Processing Time:** ${(metadata.processingTime / 1000).toFixed(1)}s\n`;
        }
        markdown += `- **Generated:** ${new Date().toLocaleString()}\n`;
        markdown += `- **Author:** ${author}\n\n`;
        markdown += `---\n\n`;
      }

      // Convert PAGE markers to markdown headers
      const pagePattern = /═+\nPAGE (\d+)\n═+\n\n?/g;
      let markdownText = text.replace(pagePattern, (match, pageNum) => {
        return `\n\n---\n\n## Page ${pageNum}\n\n`;
      });

      // Enhance text formatting for markdown
      markdownText = this.enhanceMarkdownFormatting(markdownText);

      markdown += markdownText;

      const markdownBlob = new Blob([markdown], { type: 'text/markdown' });

      console.log('✅ Markdown document generated:', {
        size: markdownBlob.size,
        contentLength: markdown.length
      });

      return markdownBlob;

    } catch (error) {
      console.error('❌ Markdown generation failed:', error);
      throw new Error(`Failed to generate Markdown: ${error.message}`);
    }
  }

  /**
   * Enhance text formatting for Markdown
   */
  private enhanceMarkdownFormatting(text: string): string {
    const lines = text.split('\n');
    const formatted: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim() || '';

      if (!line) {
        formatted.push('');
        inList = false;
        continue;
      }

      // Detect headings (short lines followed by longer text)
      const isHeading = (
        line.length < 60 &&
        nextLine.length > 60 &&
        !line.match(/^[\-•·●○▪▫\d]/)
      );

      // Detect subheadings (ALL CAPS or title case)
      const isSubheading = (
        line === line.toUpperCase() &&
        line.length > 3 &&
        line.length < 60
      );

      // Detect list items
      const listMatch = line.match(/^([\-•·●○▪▫]|\d+[\.\)])\s+(.+)/);

      if (isSubheading && line.length < 40) {
        formatted.push(`\n### ${line}\n`);
        inList = false;
      } else if (isHeading) {
        formatted.push(`\n#### ${line}\n`);
        inList = false;
      } else if (listMatch) {
        if (!inList) formatted.push('');
        formatted.push(`- ${listMatch[2]}`);
        inList = true;
      } else {
        formatted.push(line);
        inList = false;
      }
    }

    return formatted.join('\n');
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: 'docx' | 'rtf' | 'json' | 'markdown'): string {
    switch (format) {
      case 'docx': return 'docx';
      case 'rtf': return 'rtf';
      case 'json': return 'json';
      case 'markdown': return 'md';
      default: return 'txt';
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: 'docx' | 'rtf' | 'json' | 'markdown'): string {
    switch (format) {
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'rtf': return 'application/rtf';
      case 'json': return 'application/json';
      case 'markdown': return 'text/markdown';
      default: return 'text/plain';
    }
  }
}

// Export singleton instance
export const documentGenerator = new DocumentGenerator();