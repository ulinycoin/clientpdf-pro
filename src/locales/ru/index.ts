/**
 * Russian (RU) language module - main export
 * Combines all translation modules into final RU object
 */

// Import core modules
import { common, header, footer } from './core/common';
import { home } from './core/home';
import { pages } from './core/pages';
import { components } from './core/components';
import { gdpr } from './core/gdpr';
import { relatedTools } from './core/relatedTools';

// Import template module
import { toolTemplate } from './template/toolTemplate';

// Import tool modules
import { merge } from './tools/merge';
import { split } from './tools/split';
import { compress } from './tools/compress';
import { addText } from './tools/addText';
import { watermark } from './tools/watermark';
import { rotate } from './tools/rotate';
import { extractPages } from './tools/extractPages';
import { extractText } from './tools/extractText';
import { ocr } from './tools/ocr';
import { pdfToImage } from './tools/pdfToImage';
import { pdfToSvg } from './tools/pdfToSvg';
import { imageToPdf } from './tools/imageToPdf';
import { wordToPdf } from './tools/wordToPdf';
import { excelToPdf } from './tools/excelToPdf';

// Construct the complete RU translations object
export const ru = {
  // Core UI elements
  common,
  header,
  footer,
  
  // Component translations
  components,
  
  // Related Tools section
  relatedTools,
  
  // Template translations (StandardToolPageTemplate)
  toolTemplate,
  
  // Home page translations
  home,
  
  // Basic tool information (for tools grid)
  tools: {
    merge,
    split,
    compress,
    addText,
    watermark,
    rotate,
    extractPages,
    extractText,
    ocr,
    pdfToImage,
    pdfToSvg,
    imageToPdf,
    wordToPdf,
    excelToPdf
  },
  
  // Page-specific translations
  pages: {
    // Static pages (faq, privacy, terms)
    ...pages,
    
    // GDPR page
    gdpr,
    
    // Tool pages (nested under pages.tools.* for individual tools)
    tools: {
      ...pages.tools, // Preserve existing tools section from pages (FAQ tools section)
      merge,
      split,
      compress,
      addText,
      watermark,
      rotate,
      extractPages,
      extractText,
      ocr,
      pdfToImage,
      pdfToSvg,
      imageToPdf,
      wordToPdf,
      excelToPdf
    }
  }
};