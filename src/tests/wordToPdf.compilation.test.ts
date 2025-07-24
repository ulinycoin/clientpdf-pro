// Simple compilation test for Word to PDF module
import { WordToPDFTool } from '../features/word-to-pdf';
import { ConversionService } from '../features/word-to-pdf/services/conversionService';
import { DocumentContent } from '../features/word-to-pdf/types/wordToPdf.types';

// This file tests that all imports compile correctly
export const testCompilation = () => {
  console.log('Word to PDF module compiles successfully');
  return {
    WordToPDFTool,
    ConversionService
  };
};

// Test type usage
const sampleContent: DocumentContent = {
  paragraphs: [],
  metadata: {
    title: 'Test Document'
  }
};

export { sampleContent };
