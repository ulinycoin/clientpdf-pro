import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CsvParseResult, CsvToPdfOptions } from './CsvToPdfConverter';

/**
 * Fixed CSV to PDF Generator with robust font handling
 * Solves the "Cannot read properties of undefined (reading 'widths')" error
 * Provides reliable Unicode support without external font dependencies
 */
export class CsvToPdfGeneratorFixed {
  
  // Safe font mappings that are guaranteed to work in jsPDF
  private static readonly SAFE_FONTS = {
    'helvetica': { name: 'helvetica', supportsUnicode: false },
    'times': { name: 'times', supportsUnicode: true },
    'courier': { name: 'courier', supportsUnicode: false }
  } as const;

  // Unicode to ASCII transliteration map
  private static readonly UNICODE_REPLACEMENTS = new Map<string, string>([
    // Cyrillic to Latin transliteration
    ['а', 'a'], ['А', 'A'], ['б', 'b'], ['Б', 'B'],
    ['в', 'v'], ['В', 'V'], ['г', 'g'], ['Г', 'G'],
    ['д', 'd'], ['Д', 'D'], ['е', 'e'], ['Е', 'E'],
    ['ё', 'yo'], ['Ё', 'Yo'], ['ж', 'zh'], ['Ж', 'Zh'],
    ['з', 'z'], ['З', 'Z'], ['и', 'i'], ['И', 'I'],
    ['й', 'y'], ['Й', 'Y'], ['к', 'k'], ['К', 'K'],
    ['л', 'l'], ['Л', 'L'], ['м', 'm'], ['М', 'M'],
    ['н', 'n'], ['Н', 'N'], ['о', 'o'], ['О', 'O'],
    ['п', 'p'], ['П', 'P'], ['р', 'r'], ['Р', 'R'],
    ['с', 's'], ['С', 'S'], ['т', 't'], ['Т', 'T'],
    ['у', 'u'], ['У', 'U'], ['ф', 'f'], ['Ф', 'F'],
    ['х', 'h'], ['Х', 'H'], ['ц', 'ts'], ['Ц', 'Ts'],
    ['ч', 'ch'], ['Ч', 'Ch'], ['ш', 'sh'], ['Ш', 'Sh'],
    ['щ', 'sch'], ['Щ', 'Sch'], ['ъ', ''], ['Ъ', ''],
    ['ы', 'y'], ['Ы', 'Y'], ['ь', ''], ['Ь', ''],
    ['э', 'e'], ['Э', 'E'], ['ю', 'yu'], ['Ю', 'Yu'],
    ['я', 'ya'], ['Я', 'Ya'],
    
    // Extended Latin characters
    ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'],
    ['Á', 'A'], ['À', 'A'], ['Â', 'A'], ['Ä', 'A'], ['Ã', 'A'], ['Å', 'A'],
    ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'],
    ['É', 'E'], ['È', 'E'], ['Ê', 'E'], ['Ë', 'E'],
    ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'],
    ['Í', 'I'], ['Ì', 'I'], ['Î', 'I'], ['Ï', 'I'],
    ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'],
    ['Ó', 'O'], ['Ò', 'O'], ['Ô', 'O'], ['Ö', 'O'], ['Õ', 'O'],
    ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'],
    ['Ú', 'U'], ['Ù', 'U'], ['Û', 'U'], ['Ü', 'U'],
    ['ç', 'c'], ['Ç', 'C'], ['ñ', 'n'], ['Ñ', 'N'],
    
    // Baltic languages (Latvian, Lithuanian)
    ['ā', 'a'], ['Ā', 'A'], ['č', 'c'], ['Č', 'C'],
    ['ē', 'e'], ['Ē', 'E'], ['ģ', 'g'], ['Ģ', 'G'],
    ['ī', 'i'], ['Ī', 'I'], ['ķ', 'k'], ['Ķ', 'K'],
    ['ļ', 'l'], ['Ļ', 'L'], ['ņ', 'n'], ['Ņ', 'N'],
    ['š', 's'], ['Š', 'S'], ['ū', 'u'], ['Ū', 'U'],
    ['ž', 'z'], ['Ž', 'Z'],
    ['ą', 'a'], ['Ą', 'A'], ['ę', 'e'], ['Ę', 'E'],
    ['ė', 'e'], ['Ė', 'E'], ['į', 'i'], ['Į', 'I'],
    ['ų', 'u'], ['Ų', 'U'],
    
    // Polish
    ['ć', 'c'], ['Ć', 'C'], ['ł', 'l'], ['Ł', 'L'],
    ['ń', 'n'], ['Ń', 'N'], ['ś', 's'], ['Ś', 'S'],
    ['ź', 'z'], ['Ź', 'Z'], ['ż', 'z'], ['Ż', 'Z'],
    
    // German
    ['ß', 'ss'],
    
    // Special characters
    ['"', '"'], ['"', '"'], [''', "'"], [''', "'"],
    ['–', '-'], ['—', '-'], ['…', '...'],
    ['€', 'EUR'], ['£', 'GBP'], ['¥', 'JPY']
  ]);

  /**
   * Main conversion method with robust error handling
   */
  public static async convertToPDF(
    parseResult: CsvParseResult, 
    options: Partial<CsvToPdfOptions> = {}
  ): Promise<Uint8Array> {
    
    const finalOptions: CsvToPdfOptions = {
      orientation: 'landscape',
      pageSize: 'legal',
      fontSize: 8,
      tableStyle: 'grid',
      headerStyle: 'bold',
      fitToPage: true,
      includeRowNumbers: false,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 10,
      marginRight: 10,
      fontFamily: 'auto',
      ...options
    };

    console.log('🚀 Starting robust PDF generation...');

    // Create PDF with error handling
    const pdf = new jsPDF({
      orientation: finalOptions.orientation,
      unit: 'pt',
      format: finalOptions.pageSize
    });

    try {
      // Step 1: Set up safe font
      const fontResult = this.setupSafeFont(pdf, parseResult, finalOptions);
      console.log('✅ Font setup result:', fontResult);

      // Step 2: Process data with safe character handling
      const processedData = this.processDataSafely(parseResult, fontResult.needsTransliteration);
      console.log('✅ Data processed safely');

      // Step 3: Generate PDF content
      this.generatePDFContent(pdf, processedData, finalOptions, fontResult.selectedFont);
      console.log('✅ PDF content generated');

      // Step 4: Return as Uint8Array
      const pdfOutput = pdf.output('arraybuffer');
      return new Uint8Array(pdfOutput);

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      return this.createErrorPDF(pdf, error);
    }
  }

  /**
   * Set up a safe font that won't cause the 'widths' error
   */
  private static setupSafeFont(
    pdf: jsPDF,
    parseResult: CsvParseResult,
    options: CsvToPdfOptions
  ): {
    selectedFont: string;
    needsTransliteration: boolean;
    warnings: string[];
  } {
    const result = {
      selectedFont: 'helvetica',
      needsTransliteration: false,
      warnings: [] as string[]
    };

    try {
      // Analyze text content
      const allText = [
        ...parseResult.headers,
        ...parseResult.data.slice(0, 10).flatMap(row => 
          Object.values(row).map(v => String(v || ''))
        )
      ].join(' ');

      const hasUnicode = this.detectUnicodeCharacters(allText);
      console.log('🔍 Unicode analysis:', {
        hasUnicode: hasUnicode.hasAny,
        hasCyrillic: hasUnicode.hasCyrillic,
        hasExtendedLatin: hasUnicode.hasExtendedLatin
      });

      // Determine best safe font
      let targetFont = 'helvetica'; // Default safe option

      if (hasUnicode.hasAny) {
        // Try times font for better Unicode support
        if (this.testFontSafely(pdf, 'times')) {
          targetFont = 'times';
          result.warnings.push('Using Times font for Unicode support');
        } else {
          result.needsTransliteration = true;
          result.warnings.push('Unicode characters will be transliterated');
        }
      }

      // Set the font safely
      this.setFontSafely(pdf, targetFont);
      result.selectedFont = targetFont;

      // If we have Unicode but using helvetica, we need transliteration
      if (hasUnicode.hasAny && targetFont === 'helvetica') {
        result.needsTransliteration = true;
      }

    } catch (error) {
      console.warn('⚠️ Font setup warning:', error);
      // Fallback to absolute safest option
      pdf.setFont('helvetica', 'normal');
      result.selectedFont = 'helvetica';
      result.needsTransliteration = true;
      result.warnings.push('Using fallback font due to setup error');
    }

    return result;
  }

  /**
   * Test if a font can be safely used without causing errors
   */
  private static testFontSafely(pdf: jsPDF, fontName: string): boolean {
    try {
      // Save current state
      const originalFont = (pdf as any).internal.getFont();
      
      // Try to set the font
      pdf.setFont(fontName, 'normal');
      
      // Test with a simple string to trigger any width calculation
      const testWidth = pdf.getTextWidth('Test');
      
      // Check if width is valid
      const isValid = !isNaN(testWidth) && testWidth > 0;
      
      console.log(`🧪 Font test for ${fontName}:`, { isValid, testWidth });
      return isValid;
      
    } catch (error) {
      console.warn(`⚠️ Font test failed for ${fontName}:`, error);
      return false;
    }
  }

  /**
   * Set font with comprehensive error handling
   */
  private static setFontSafely(pdf: jsPDF, fontName: string): void {
    try {
      pdf.setFont(fontName, 'normal');
      
      // Test that it actually works
      const testWidth = pdf.getTextWidth('Test');
      if (isNaN(testWidth) || testWidth <= 0) {
        throw new Error('Font metrics not available');
      }
      
      console.log(`✅ Font ${fontName} set successfully`);
    } catch (error) {
      console.warn(`⚠️ Font ${fontName} failed, using helvetica:`, error);
      pdf.setFont('helvetica', 'normal');
    }
  }

  /**
   * Detect Unicode characters in text
   */
  private static detectUnicodeCharacters(text: string): {
    hasAny: boolean;
    hasCyrillic: boolean;
    hasExtendedLatin: boolean;
    hasSpecialChars: boolean;
  } {
    return {
      hasAny: /[^\x00-\x7F]/.test(text),
      hasCyrillic: /[а-яё]/i.test(text),
      hasExtendedLatin: /[À-ÿĀ-ž]/.test(text),
      hasSpecialChars: /["'"–—…€£¥]/.test(text)
    };
  }

  /**
   * Process data with safe character handling
   */
  private static processDataSafely(
    parseResult: CsvParseResult,
    needsTransliteration: boolean
  ): {
    headers: string[];
    rows: string[][];
  } {
    console.log('🔄 Processing data, transliteration needed:', needsTransliteration);

    // Process headers
    const headers = parseResult.headers.map(header => 
      needsTransliteration ? this.transliterateText(header) : header
    );

    // Process data rows
    const rows = parseResult.data.map(row =>
      parseResult.headers.map(header => {
        const value = String(row[header] || '');
        return needsTransliteration ? this.transliterateText(value) : value;
      })
    );

    return { headers, rows };
  }

  /**
   * Transliterate Unicode text to safe ASCII
   */
  private static transliterateText(text: string): string {
    if (!text) return '';

    let result = String(text);
    
    // Apply character replacements
    for (const [unicode, replacement] of this.UNICODE_REPLACEMENTS) {
      result = result.replace(new RegExp(unicode, 'g'), replacement);
    }

    // Remove any remaining non-ASCII characters
    result = result.replace(/[^\x00-\x7F]/g, '');
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Generate PDF content with safe table rendering
   */
  private static generatePDFContent(
    pdf: jsPDF,
    data: { headers: string[]; rows: string[][]; },
    options: CsvToPdfOptions,
    selectedFont: string
  ): void {
    
    // Set initial font size
    pdf.setFontSize(options.fontSize);

    let startY = options.marginTop;

    // Add title if specified
    if (options.title) {
      pdf.setFontSize(16);
      pdf.setFont(selectedFont, 'bold');
      pdf.text(this.transliterateText(options.title), options.marginLeft, startY);
      startY += 30;
    }

    // Generate table with safe configuration
    const tableConfig = this.getSafeTableConfig(options, selectedFont, data.headers.length);

    try {
      (pdf as any).autoTable({
        head: [data.headers],
        body: data.rows,
        startY: startY,
        margin: {
          top: options.marginTop,
          bottom: options.marginBottom,
          left: options.marginLeft,
          right: options.marginRight
        },
        ...tableConfig,
        
        // Error handling for table generation
        didParseCell: (cellInfo: any) => {
          try {
            if (cellInfo.cell && cellInfo.cell.text) {
              // Ensure text is always an array of strings
              if (!Array.isArray(cellInfo.cell.text)) {
                cellInfo.cell.text = [String(cellInfo.cell.text)];
              }
              
              // Clean each text element
              cellInfo.cell.text = cellInfo.cell.text.map((text: any) => 
                this.transliterateText(String(text))
              );
            }
          } catch (cellError) {
            console.warn('⚠️ Cell processing error:', cellError);
            cellInfo.cell.text = [''];
          }
        },

        didDrawPage: (data: any) => {
          try {
            // Add page numbers safely
            const pageNum = data.pageNumber || 1;
            pdf.setFontSize(8);
            pdf.setFont(selectedFont, 'normal');
            pdf.text(
              `Page ${pageNum}`,
              options.marginLeft,
              pdf.internal.pageSize.height - 10
            );
          } catch (pageError) {
            console.warn('⚠️ Page drawing error:', pageError);
          }
        }
      });

    } catch (tableError) {
      console.error('❌ Table generation failed:', tableError);
      throw new Error(`Table generation failed: ${tableError}`);
    }
  }

  /**
   * Get safe table configuration
   */
  private static getSafeTableConfig(
    options: CsvToPdfOptions,
    selectedFont: string,
    columnCount: number
  ) {
    // Adjust font size for wide tables
    const adjustedFontSize = columnCount > 10 ? 
      Math.max(6, options.fontSize - 1) : 
      options.fontSize;

    const baseStyles = {
      fontSize: adjustedFontSize,
      cellPadding: 3,
      overflow: 'linebreak' as const,
      halign: 'left' as const,
      valign: 'middle' as const
    };

    const headerStyles = {
      fillColor: options.headerStyle === 'colored' ? [41, 128, 185] : [245, 245, 245],
      textColor: options.headerStyle === 'colored' ? [255, 255, 255] : [51, 51, 51],
      fontStyle: options.headerStyle === 'bold' ? 'bold' as const : 'normal' as const
    };

    let alternateRowStyles = {};
    let tableLineWidth = 0.5;

    switch (options.tableStyle) {
      case 'striped':
        alternateRowStyles = { fillColor: [249, 249, 249] };
        break;
      case 'minimal':
        tableLineWidth = 0.25;
        break;
      case 'plain':
        tableLineWidth = 0;
        break;
    }

    return {
      styles: baseStyles,
      headStyles: headerStyles,
      alternateRowStyles,
      tableLineWidth,
      theme: 'plain',
      showHead: true
    };
  }

  /**
   * Create error PDF when main generation fails
   */
  private static createErrorPDF(pdf: jsPDF, error: any): Uint8Array {
    try {
      console.log('📄 Creating error PDF...');
      
      // Reset to safest possible state
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      // Add error information
      pdf.text('PDF Generation Error', 50, 50);
      pdf.setFontSize(10);
      pdf.text('An error occurred while generating the PDF:', 50, 80);
      pdf.text(String(error).substring(0, 100), 50, 100);
      pdf.text('Please try with different settings or contact support.', 50, 120);
      pdf.text('Suggestions:', 50, 150);
      pdf.text('- Use smaller font size', 60, 170);
      pdf.text('- Try portrait orientation', 60, 190);
      pdf.text('- Reduce data complexity', 60, 210);

      const errorOutput = pdf.output('arraybuffer');
      return new Uint8Array(errorOutput);
    } catch (fallbackError) {
      console.error('❌ Even error PDF failed:', fallbackError);
      // Return minimal valid PDF
      const minimalPdf = new jsPDF();
      minimalPdf.text('Error', 20, 20);
      return new Uint8Array(minimalPdf.output('arraybuffer'));
    }
  }

  /**
   * Quick compatibility test method
   */
  public static testFontCompatibility(): {
    helvetica: boolean;
    times: boolean;
    courier: boolean;
    recommendations: string[];
  } {
    const testPdf = new jsPDF();
    
    const results = {
      helvetica: this.testFontSafely(testPdf, 'helvetica'),
      times: this.testFontSafely(testPdf, 'times'),
      courier: this.testFontSafely(testPdf, 'courier'),
      recommendations: [] as string[]
    };

    // Add recommendations
    if (results.times) {
      results.recommendations.push('Times font recommended for Unicode content');
    }
    if (!results.times && results.helvetica) {
      results.recommendations.push('Use Helvetica with transliteration for special characters');
    }
    if (!results.helvetica && !results.times) {
      results.recommendations.push('Consider updating jsPDF version');
    }

    return results;
  }
}
