import * as mammoth from 'mammoth';
import { DocumentContent, Paragraph, DocumentMetadata } from '../types/wordToPdf.types';
import { LanguageDetector } from './languageDetector';

export class WordParser {
  private languageDetector: LanguageDetector;

  constructor() {
    this.languageDetector = LanguageDetector.getInstance();
  }

  private validateFile(file: File): void {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum file size is 50MB.');
    }

    if (file.size === 0) {
      throw new Error('The uploaded file is empty.');
    }

    // Check file extension - only .docx is supported
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx')) {
      throw new Error('Only .docx files are supported. Please convert .doc files to .docx format first.');
    }

    // Check MIME type if available
    if (file.type && !file.type.includes('openxmlformats-officedocument.wordprocessingml')) {
      console.warn(`Unexpected MIME type: ${file.type}. Expected .docx format.`);
    }
  }
  async parseDocument(file: File): Promise<DocumentContent> {
    try {
      // Validate file first
      this.validateFile(file);

      const arrayBuffer = await file.arrayBuffer();

      // Validate that the file has content
      if (arrayBuffer.byteLength === 0) {
        throw new Error('The uploaded file is empty.');
      }

      console.log(`📁 File info:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        arrayBufferSize: arrayBuffer.byteLength
      });

      // Try different parsing approaches
      let textResult, htmlResult;

      try {
        // First attempt with standard options
        textResult = await mammoth.extractRawText({
          arrayBuffer: arrayBuffer
        });

        htmlResult = await mammoth.convertToHtml({
          arrayBuffer: arrayBuffer
        });
      } catch (firstError) {
        console.warn('Standard parsing failed, trying with alternative options:', firstError.message);

        // Try with more permissive options
        try {
          textResult = await mammoth.extractRawText({
            arrayBuffer: arrayBuffer,
            ignoreEmptyParagraphs: false
          });

          htmlResult = await mammoth.convertToHtml({
            arrayBuffer: arrayBuffer,
            ignoreEmptyParagraphs: false
          });
        } catch (secondError) {
          // If both fail, provide specific error message
          if (firstError.message.includes('body element')) {
            throw new Error('This file does not appear to be a valid Word document. Please ensure you are uploading a .docx file created by Microsoft Word or a compatible application.');
          }
          throw firstError; // Re-throw the original error
        }
      }

      // Check for parsing warnings
      if (textResult.messages && textResult.messages.length > 0) {
        console.warn('Mammoth text parsing warnings:', textResult.messages);
      }
      if (htmlResult.messages && htmlResult.messages.length > 0) {
        console.warn('Mammoth HTML parsing warnings:', htmlResult.messages);
      }

      // Extract text content
      const text = textResult.value || '';
      const htmlContent = htmlResult.value || '';

      if (!text.trim()) {
        throw new Error('No text content found in the document. The file may be empty or corrupted.');
      }

      console.log(`📄 Extracted text preview:`, {
        length: text.length,
        firstChars: text.substring(0, 100),
        hasCyrillic: /[\u0400-\u04FF]/.test(text),
        hasHtml: htmlContent.length > text.length
      });

      // Detect document language
      const languageResult = this.languageDetector.getPrimaryLanguage(text);
      console.log('🌍 Detected language:', languageResult);

      // Split into paragraphs and clean up
      const paragraphTexts = text
        .split(/\n+/) // Split on one or more newlines
        .map(line => line.trim()) // Remove leading/trailing whitespace
        .filter(line => line.length > 0); // Remove empty lines

      if (paragraphTexts.length === 0) {
        throw new Error('No readable text found in the document.');
      }

      // Convert to structured paragraphs with language info
      const paragraphs: Paragraph[] = paragraphTexts.map(text => ({
        text: text,
        language: languageResult.language,
        formatting: {
          fontFamily: languageResult.recommendedFont,
          fontSize: 12,
          bold: false,
          italic: false,
          underline: false,
          color: '#000000'
        },
        alignment: 'left' as const
      }));

      // Extract enhanced metadata
      const metadata: DocumentMetadata = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        pageCount: Math.ceil(paragraphs.length / 20), // Better estimate
        language: languageResult.language,
        isCyrillic: languageResult.isCyrillic,
        detectedLanguages: this.languageDetector.detectMixedLanguages(text).map(l => l.language)
      };

      return {
        paragraphs,
        metadata
      };

    } catch (error) {
      console.error('Error parsing Word document:', error);

      // Provide more specific error messages based on error type
      const errorMessage = error.message || 'Unknown error';

      if (errorMessage.includes('Could not find the body element')) {
        throw new Error('This file does not appear to be a valid .docx document. Only modern Word format (.docx) is supported. If you have a .doc file, please save it as .docx first.');
      } else if (errorMessage.includes('Only .docx files are supported')) {
        throw new Error(errorMessage);
      } else if (errorMessage.includes('signature')) {
        throw new Error('Invalid Word document format. The file may be corrupted or not a genuine .docx document.');
      } else if (errorMessage.includes('No text content found')) {
        throw new Error(errorMessage);
      } else if (errorMessage.includes('File is too large')) {
        throw new Error(errorMessage);
      } else if (errorMessage.includes('Invalid file format')) {
        throw new Error(errorMessage);
      } else if (errorMessage.includes('empty')) {
        throw new Error('The uploaded file is empty or corrupted.');
      } else {
        // For any other error, provide a generic helpful message
        throw new Error(`Unable to process this Word document. Please ensure it's a valid .docx file. Error details: ${errorMessage}`);
      }
    }
  }
}
