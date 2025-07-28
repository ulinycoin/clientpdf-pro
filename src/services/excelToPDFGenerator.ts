import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ExcelSheet, ConversionOptions, ConversionResult } from '../types/excelToPdf.types';

interface FontLoadResult {
  font: any;
  fontName: string;
  supportsCyrillic: boolean;
  needsTransliteration: boolean;
}

interface AutoTableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

interface AutoTableData {
  [key: string]: string;
}

export class ExcelToPDFGenerator {
  private fontCache = new Map<string, any>();
  private currentPdfDocId: string | null = null;

  // Clear font cache when starting with a new PDF document
  private clearFontCacheIfNeeded(pdfDoc: PDFDocument): void {
    // Create a unique identifier for this PDF document
    const pdfDocId = (pdfDoc as any)._id || `pdf_${Date.now()}_${Math.random()}`;

    if (this.currentPdfDocId !== pdfDocId) {
      console.log('🧹 Clearing font cache for new PDF document');
      this.fontCache.clear();
      this.currentPdfDocId = pdfDocId;
      // Store the ID on the document for future reference
      (pdfDoc as any)._id = pdfDocId;
    }
  }

  async loadCyrillicFont(pdfDoc: PDFDocument, language: string): Promise<any> {
    // Register fontkit for custom font support
    pdfDoc.registerFontkit(fontkit);

    // Try multiple font sources
    const fontUrls = [
      'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.ttf',
      'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr5TRASf6M7Q.woff2'
    ];

    for (const fontUrl of fontUrls) {
      try {
        console.log(`Trying to load font from: ${fontUrl}`);

        const response = await fetch(fontUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'application/font-woff2,application/font-woff,application/font-ttf,*/*'
          }
        });

        if (!response.ok) {
          console.warn(`Font fetch failed: ${response.status} ${response.statusText}`);
          continue;
        }

        const fontBytes = await response.arrayBuffer();

        // Validate that we got actual font data
        if (fontBytes.byteLength < 1000) {
          console.warn('Font data too small, probably not a valid font');
          continue;
        }

        const font = await pdfDoc.embedFont(fontBytes);
        console.log(`✅ Successfully loaded font for ${language} from ${fontUrl}`);
        return font;

      } catch (error) {
        console.warn(`Failed to load font from ${fontUrl}:`, error.message);
        continue;
      }
    }

    // If all external fonts fail, throw error to use fallback
    throw new Error(`Unable to load any Cyrillic fonts from external sources`);
  }

  async loadFont(pdfDoc: PDFDocument, language: string, isCyrillic: boolean = false): Promise<FontLoadResult> {
    console.log(`🔤 Loading font for language: ${language}, isCyrillic: ${isCyrillic}`);

    // Clear font cache if this is a new PDF document
    this.clearFontCacheIfNeeded(pdfDoc);

    try {
      // Check cache first with PDF document-specific key
      const pdfDocId = (pdfDoc as any)._id || this.currentPdfDocId;
      const cacheKey = `${pdfDocId}-${language}-${isCyrillic}`;

      if (this.fontCache.has(cacheKey)) {
        console.log(`💾 Using cached font for ${cacheKey}`);
        const cachedData = this.fontCache.get(cacheKey);
        return {
          font: cachedData.font,
          fontName: cachedData.fontName,
          supportsCyrillic: cachedData.supportsCyrillic,
          needsTransliteration: cachedData.needsTransliteration
        };
      }

      let font;
      let supportsCyrillic = false;
      let needsTransliteration = isCyrillic;
      let fontName = 'Helvetica';

      if (isCyrillic) {
        console.log('🌍 Attempting to load Cyrillic font...');
        try {
          font = await this.loadCyrillicFont(pdfDoc, language);
          supportsCyrillic = true;
          needsTransliteration = false;
          fontName = 'DejaVu Sans';
          console.log('✅ Cyrillic font (DejaVu Sans) loaded successfully');
        } catch (error) {
          console.warn(`⚠️ Failed to load Cyrillic font: ${error.message}`);
          console.log('🔄 Falling back to standard font with transliteration');

          // Try Times-Roman first as it has better Unicode support than Helvetica
          try {
            font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            fontName = 'Times-Roman';
            console.log('✅ Times-Roman font loaded as fallback');
          } catch (timesError) {
            console.warn('⚠️ Times-Roman also failed, using Helvetica');
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            fontName = 'Helvetica';
            console.log('✅ Helvetica font loaded as last resort');
          }
          supportsCyrillic = false;
          needsTransliteration = true;
        }
      } else {
        console.log('📝 Loading standard Helvetica font for Latin text');
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        supportsCyrillic = false;
        needsTransliteration = false;
        console.log('✅ Helvetica font loaded');
      }

      // Cache the loaded font with metadata using document-specific key
      this.fontCache.set(cacheKey, {
        font,
        fontName,
        supportsCyrillic,
        needsTransliteration
      });

      console.log(`💾 Font result cached: ${fontName} (key: ${cacheKey}, supportsCyrillic: ${supportsCyrillic}, needsTransliteration: ${needsTransliteration})`);

      return {
        font,
        fontName,
        supportsCyrillic,
        needsTransliteration
      };

    } catch (error) {
      console.warn(`Failed to load font for ${language}, using final fallback:`, error);
      // Try Times-Roman first, then Helvetica as last resort
      let fallbackFont;
      let fallbackName;
      try {
        fallbackFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        fallbackName = 'Times-Roman';
      } catch (timesError) {
        fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        fallbackName = 'Helvetica';
      }

      return {
        font: fallbackFont,
        fontName: fallbackName,
        supportsCyrillic: false,
        needsTransliteration: isCyrillic
      };
    }
  }

  async generatePDF(
    sheets: ExcelSheet[],
    options: ConversionOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConversionResult> {
    try {
      const selectedSheets = sheets.filter(sheet =>
        options.selectedSheets.includes(sheet.name)
      );

      if (selectedSheets.length === 0) {
        throw new Error('No sheets selected for conversion');
      }

      if (options.outputFormat === 'separate-pdfs') {
        return await this.generateSeparatePDFs(selectedSheets, options, onProgress);
      } else {
        return await this.generateSinglePDF(selectedSheets, options, onProgress);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      };
    }
  }

  private async generateSinglePDF(
    sheets: ExcelSheet[],
    options: ConversionOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConversionResult> {
    const pdfDoc = await PDFDocument.create();

    // Set PDF metadata for better compatibility
    pdfDoc.setTitle('Excel to PDF Conversion');
    pdfDoc.setAuthor('LocalPDF');
    pdfDoc.setSubject('Excel Spreadsheet Conversion');
    pdfDoc.setKeywords(['excel', 'pdf', 'conversion', 'localpdf']);
    pdfDoc.setProducer('LocalPDF - Privacy-first PDF tools');
    pdfDoc.setCreator('LocalPDF');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    // Detect if we need Cyrillic support
    const allText = this.extractAllTextFromSheets(sheets);
    const isCyrillic = this.containsCyrillic(allText);

    // Load appropriate font
    onProgress?.(10, 'Loading fonts...');
    const fontResult = await this.loadFont(pdfDoc, 'ru', isCyrillic);

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];

      onProgress?.(
        20 + (i / sheets.length) * 70,
        `Processing ${sheet.name}...`
      );

      await this.addSheetToPDFDocument(pdfDoc, sheet, options, fontResult);
    }

    onProgress?.(95, 'Finalizing PDF...');

    // Save with better compression and compatibility settings
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // Better compatibility with older PDF readers
      addDefaultPage: false,   // Don't add empty pages
      objectsPerTick: 50      // Optimize performance
    });

    return {
      success: true,
      pdfFiles: [{
        name: 'converted-excel.pdf',
        data: new Uint8Array(pdfBytes)
      }],
      metadata: {
        totalPages: pdfDoc.getPageCount(),
        fileSize: pdfBytes.length,
        processingTime: Date.now()
      }
    };
  }

  private async generateSeparatePDFs(
    sheets: ExcelSheet[],
    options: ConversionOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConversionResult> {
    const pdfFiles = [];

    // Detect if we need Cyrillic support
    const allText = this.extractAllTextFromSheets(sheets);
    const isCyrillic = this.containsCyrillic(allText);

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];

      onProgress?.(
        (i / sheets.length) * 90,
        `Generating ${sheet.name}.pdf...`
      );

      const pdfDoc = await PDFDocument.create();

      // Set PDF metadata for each file
      pdfDoc.setTitle(`${sheet.name} - Excel to PDF`);
      pdfDoc.setAuthor('LocalPDF');
      pdfDoc.setSubject(`Excel Sheet: ${sheet.name}`);
      pdfDoc.setKeywords(['excel', 'pdf', 'conversion', 'localpdf', sheet.name]);
      pdfDoc.setProducer('LocalPDF - Privacy-first PDF tools');
      pdfDoc.setCreator('LocalPDF');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      const fontResult = await this.loadFont(pdfDoc, 'ru', isCyrillic);

      await this.addSheetToPDFDocument(pdfDoc, sheet, options, fontResult);

      // Save with better compatibility settings
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false, // Better compatibility with older PDF readers
        addDefaultPage: false,   // Don't add empty pages
        objectsPerTick: 50      // Optimize performance
      });

      pdfFiles.push({
        name: `${this.sanitizeFileName(sheet.name)}.pdf`,
        data: new Uint8Array(pdfBytes),
        sheetName: sheet.name
      });
    }

    const totalSize = pdfFiles.reduce((sum, file) => sum + file.data.length, 0);

    return {
      success: true,
      pdfFiles,
      metadata: {
        totalPages: pdfFiles.length,
        fileSize: totalSize,
        processingTime: Date.now()
      }
    };
  }

  private createPDFDocument(options: ConversionOptions): jsPDF {
    const format = options.pageSize.toLowerCase() as 'a4' | 'a3' | 'letter' | 'legal';

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: format
    });

    // Add Cyrillic font support
    try {
      // Use Arial Unicode MS or fallback to helvetica
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(options.fontSize);
    } catch (error) {
      console.warn('Font setting failed, using default');
    }

    return pdf;
  }

  private addSheetTitle(pdf: jsPDF, sheetName: string, options: ConversionOptions): void {
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(16);
    pdf.setFont(options.fontFamily, 'bold');

    const textWidth = pdf.getTextWidth(sheetName);
    const x = (pageWidth - textWidth) / 2;

    pdf.text(sheetName, x, options.margins.top + 10);
  }

  private async addSheetToPDF(
    pdf: jsPDF,
    sheet: ExcelSheet,
    options: ConversionOptions
  ): Promise<void> {
    if (!sheet.data || sheet.data.length === 0) {
      return;
    }

    const { columns, tableData } = this.prepareTableData(sheet, options);

    if (columns.length === 0 || tableData.length === 0) {
      return;
    }

    const startY = options.includeSheetNames ?
      options.margins.top + 20 :
      options.margins.top;

    const tableOptions = {
      head: [columns.map(col => col.header)],
      body: tableData.map(row => columns.map(col => row[col.dataKey] || '')),
      startY,
      margin: {
        top: options.margins.top,
        right: options.margins.right,
        bottom: options.margins.bottom,
        left: options.margins.left
      },
      styles: {
        fontSize: options.fontSize,
        font: options.fontFamily,
        cellPadding: 2,
        overflow: options.handleWideTablesWith === 'overflow' ? 'visible' : 'linebreak'
      },
      columnStyles: this.getColumnStyles(sheet, options),
      theme: 'grid'
    };

    if (options.handleWideTablesWith === 'scale' && sheet.metadata?.hasWideTable) {
      tableOptions.styles.fontSize = Math.max(6, options.fontSize - 2);
    }

    // Simple text-based table for now (without autotable dependency)
    let yPosition = startY;
    const lineHeight = 8;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const usableWidth = pageWidth - options.margins.left - options.margins.right;

    // Calculate column widths based on content
    const columnWidths = this.calculateColumnWidths(columns, tableData, usableWidth);

    // Add table headers
    if (columns.length > 0) {
      let xPosition = options.margins.left;
      pdf.setFontSize(options.fontSize + 1);
      pdf.setFont('helvetica', 'bold');

      columns.forEach((col, index) => {
        const headerText = col.header.substring(0, 8); // Shorter headers
        pdf.text(headerText, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += lineHeight + 2;

      // Add header underline
      pdf.line(options.margins.left, yPosition - 1,
               options.margins.left + usableWidth, yPosition - 1);
      yPosition += 2;
    }

    // Reset font for data
    pdf.setFontSize(options.fontSize);
    pdf.setFont('helvetica', 'normal');

    // Add table data
    tableData.forEach(row => {
      let xPosition = options.margins.left;
      columns.forEach((col, index) => {
        const cellValue = row[col.dataKey] || '';
        const displayValue = this.sanitizeTextForPDF(cellValue.toString());
        const maxChars = Math.floor(columnWidths[index] / 3); // Rough char width estimate
        const truncatedText = displayValue.substring(0, Math.max(maxChars, 8));

        pdf.text(truncatedText, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += lineHeight;

      // Add new page if needed
      if (yPosition > pdf.internal.pageSize.getHeight() - options.margins.bottom - 20) {
        pdf.addPage();
        yPosition = options.margins.top;
      }
    });
  }

  private prepareTableData(sheet: ExcelSheet, options: ConversionOptions) {
    console.log(`🔍 prepareTableData - Processing sheet: ${sheet.name}`);
    console.log(`📊 Raw data length: ${sheet.data?.length || 0}`);

    const data = sheet.data;
    const columns: AutoTableColumn[] = [];
    const tableData: AutoTableData[] = [];

    if (!data || data.length === 0) {
      console.warn('⚠️ No data found in sheet');
      return { columns, tableData };
    }

    console.log(`📊 First row sample:`, data[0]?.slice(0, 3).map(cell => ({
      value: cell?.value,
      type: cell?.type
    })));

    const maxColumns = Math.max(...data.map(row => row?.length || 0));
    console.log(`📏 Max columns in sheet: ${maxColumns}`);

    // First, identify which columns have content
    const nonEmptyColumns: number[] = [];
    for (let col = 0; col < maxColumns; col++) {
      let hasContent = false;

      // Check if any cell in this column has non-empty content
      for (let row = 0; row < data.length; row++) {
        const cell = data[row]?.[col];
        if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
          hasContent = true;
          break;
        }
      }

      if (hasContent) {
        nonEmptyColumns.push(col);
      }
    }

    console.log(`📋 Non-empty columns: [${nonEmptyColumns.join(', ')}] (${nonEmptyColumns.length} total)`);

    // Create columns using first row as headers, or column numbers if first row is empty
    nonEmptyColumns.forEach((originalCol, newIndex) => {
      const columnWidth = sheet.columns?.[originalCol]?.width;

      // Try to use the first row cell as header
      let headerText = '';
      const firstRowCell = data[0]?.[originalCol];
      if (firstRowCell && firstRowCell.value !== null && firstRowCell.value !== undefined && firstRowCell.value !== '') {
        headerText = String(firstRowCell.value);
      } else {
        // Fallback to column number if first row is empty
        headerText = `Column ${newIndex + 1}`;
      }

      console.log(`📝 Column ${newIndex}: "${headerText}" (original col ${originalCol})`);

      columns.push({
        header: headerText,
        dataKey: `col_${newIndex}`,
        width: columnWidth ? columnWidth * 5 : undefined
      });
    });

    // Create table data starting from second row (skip header row)
    const startRow = data.length > 1 ? 1 : 0; // Skip first row if it's used as header
    console.log(`📊 Processing data rows from ${startRow} to ${data.length - 1}`);

    let processedRows = 0;
    for (let row = startRow; row < data.length; row++) {
      if (sheet.rows?.[row]?.hidden) {
        console.log(`⏭️ Skipping hidden row ${row}`);
        continue;
      }

      const rowData: AutoTableData = {};

      nonEmptyColumns.forEach((originalCol, newIndex) => {
        if (sheet.columns?.[originalCol]?.hidden) return;

        const cell = data[row]?.[originalCol];
        const cellValue = this.formatCellValue(cell);
        rowData[`col_${newIndex}`] = cellValue;
      });

      // Only add row if it has some content
      if (Object.values(rowData).some(value => value && value.trim() !== '')) {
        tableData.push(rowData);
        processedRows++;
      } else {
        console.log(`🚫 Skipping empty row ${row}`);
      }
    }

    console.log(`✅ Final result - Columns: ${columns.length}, Data rows: ${tableData.length} (processed ${processedRows})`);

    if (columns.length > 0) {
      console.log(`📋 Column headers: [${columns.map(c => `"${c.header}"`).join(', ')}]`);
    }

    if (tableData.length > 0) {
      console.log(`📊 First data row sample:`, Object.fromEntries(
        Object.entries(tableData[0]).slice(0, 3)
      ));
    }

    return { columns, tableData };
  }

  private getColumnStyles(sheet: ExcelSheet, options: ConversionOptions) {
    const columnStyles: Record<string, any> = {};

    if (sheet.columns) {
      sheet.columns.forEach((col, index) => {
        if (col.width) {
          columnStyles[`col_${index}`] = {
            cellWidth: Math.max(10, col.width * 3)
          };
        }
      });
    }

    return columnStyles;
  }

  private formatCellValue(cell: any): string {
    if (!cell || cell.value === null || cell.value === undefined) {
      return '';
    }

    if (cell.type === 'date' && cell.value instanceof Date) {
      return cell.value.toLocaleDateString();
    }

    if (cell.type === 'number' && typeof cell.value === 'number') {
      return cell.value.toString();
    }

    return String(cell.value);
  }

  private numberToColumnLetter(num: number): string {
    let result = '';
    while (num >= 0) {
      result = String.fromCharCode((num % 26) + 65) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  }

  private sanitizeTextForPDF(text: string): string {
    // Complete transliteration map for Cyrillic characters
    const cyrillicMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO',
      'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH',
      'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
    };

    return text.split('').map(char => {
      if (cyrillicMap.hasOwnProperty(char)) {
        return cyrillicMap[char];
      }
      return char;
    }).join('');
  }

  private calculateColumnWidths(columns: AutoTableColumn[], data: AutoTableData[], usableWidth: number): number[] {
    if (columns.length === 0) return [];

    // Calculate relative widths based on content
    const columnContentLengths = columns.map((col, index) => {
      const headerLength = col.header.length;
      const maxDataLength = Math.max(...data.map(row => {
        const cellValue = row[col.dataKey] || '';
        return cellValue.toString().length;
      }));
      return Math.max(headerLength, maxDataLength, 8); // Minimum width
    });

    const totalContentLength = columnContentLengths.reduce((sum, length) => sum + length, 0);

    // Distribute available width proportionally
    return columnContentLengths.map(length => {
      const proportionalWidth = (length / totalContentLength) * usableWidth;
      return Math.max(proportionalWidth, 25); // Minimum 25mm per column
    });
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  public analyzeTableLayout(
    sheet: ExcelSheet,
    options: ConversionOptions
  ): {
    isOverflowing: boolean;
    recommendedOrientation?: 'landscape' | 'portrait';
    recommendedPageSize?: string;
    columnCount: number;
    scaleFactor?: number;
    estimatedColumnWidths: number[];
  } {
    const { columns } = this.prepareTableData(sheet, options);
    const dimensions = this.getPageDimensions(options.pageSize, options.orientation);
    const [width] = dimensions;

    const pageMargins = 50;
    const columnPadding = 10;
    const usableWidth = width - (pageMargins * 2) - (columnPadding * Math.max(0, columns.length - 1));

    const estimatedColumnWidths = this.getOriginalColumnWidths(sheet, columns, usableWidth);
    const totalContentWidth = estimatedColumnWidths.reduce((sum, w) => sum + w, 0);

    const scaleFactor = totalContentWidth > usableWidth ? usableWidth / totalContentWidth : 1;
    const isOverflowing = scaleFactor < 0.8; // Consider overflowing if scaled below 80%

    let recommendedOrientation: 'landscape' | 'portrait' | undefined;
    let recommendedPageSize: string | undefined;

    // Analyze and recommend better settings
    if (isOverflowing) {
      if (options.orientation === 'portrait' && columns.length >= 5) {
        recommendedOrientation = 'landscape';
      } else if (options.orientation === 'landscape' && options.pageSize === 'A4' && columns.length >= 10) {
        recommendedPageSize = 'A3';
      }
    }

    return {
      isOverflowing,
      recommendedOrientation,
      recommendedPageSize,
      columnCount: columns.length,
      scaleFactor: scaleFactor < 1 ? scaleFactor : undefined,
      estimatedColumnWidths
    };
  }

  private extractAllTextFromSheets(sheets: ExcelSheet[]): string {
    return sheets.map(sheet =>
      sheet.data.flat().map(cell =>
        cell.value ? String(cell.value) : ''
      ).join(' ')
    ).join(' ');
  }

  private containsCyrillic(text: string): boolean {
    return /[\u0400-\u04FF]/.test(text);
  }

  private getPageDimensions(pageSize: string, orientation: string): [number, number] {
    const pageSizes = {
      'A4': { width: 595, height: 842 },
      'A3': { width: 842, height: 1191 },
      'Letter': { width: 612, height: 792 },
      'Legal': { width: 612, height: 1008 }
    };

    const size = pageSizes[pageSize as keyof typeof pageSizes] || pageSizes.A4;

    if (orientation === 'landscape') {
      return [size.height, size.width]; // Swap width and height for landscape
    }

    return [size.width, size.height];
  }

  private async addSheetToPDFDocument(
    pdfDoc: PDFDocument,
    sheet: ExcelSheet,
    options: ConversionOptions,
    fontResult: FontLoadResult
  ): Promise<void> {
    console.log(`🔍 Processing sheet: ${sheet.name}`);
    console.log(`📄 Options - PageSize: ${options.pageSize}, Orientation: ${options.orientation}`);

    // Create page with proper orientation and size
    const dimensions = this.getPageDimensions(options.pageSize, options.orientation);
    console.log(`📏 Page dimensions calculated: ${dimensions[0]} x ${dimensions[1]}`);

    // Create page with explicit dimensions for better compatibility
    const page = pdfDoc.addPage([dimensions[0], dimensions[1]]);
    const { width, height } = page.getSize();
    console.log(`✅ Page created with actual size: ${width} x ${height}`);

    // Verify dimensions match what we expect
    if (Math.abs(width - dimensions[0]) > 1 || Math.abs(height - dimensions[1]) > 1) {
      console.warn(`⚠️ Page size mismatch: expected ${dimensions[0]}x${dimensions[1]}, got ${width}x${height}`);
    }

    // Add sheet title if requested
    if (options.includeSheetNames) {
      const titleText = fontResult.needsTransliteration ?
        this.sanitizeTextForPDF(sheet.name) : sheet.name;

      console.log(`📝 Adding sheet title: "${titleText}"`);
      page.drawText(titleText, {
        x: 50,
        y: height - 50,
        size: 16,
        font: fontResult.font,
        color: rgb(0, 0, 0)
      });
    }

    const { columns, tableData } = this.prepareTableData(sheet, options);
    console.log(`📊 Data prepared - Columns: ${columns.length}, Rows: ${tableData.length}`);

    if (columns.length === 0) {
      console.warn('⚠️ No columns found - sheet will be empty');
    }
    if (tableData.length === 0) {
      console.warn('⚠️ No table data found - sheet will be empty');
    }

    if (columns.length === 0 || tableData.length === 0) {
      console.log('🚫 Exiting early - no data to display');
      return;
    }

    const startY = options.includeSheetNames ? height - 80 : height - 50;
    const columnPadding = 10;
    const pageMargins = 50; // Left and right margins
    const usableWidth = width - (pageMargins * 2) - (columnPadding * Math.max(0, columns.length - 1));

    console.log(`📐 Layout calculations:
      - Page width: ${width}
      - Page margins: ${pageMargins * 2}
      - Column padding total: ${columnPadding * Math.max(0, columns.length - 1)}
      - Usable width: ${usableWidth}`);

    // Calculate column widths with better error handling
    const columnWidths = this.getOriginalColumnWidths(sheet, columns, usableWidth);
    console.log(`📏 Column widths: [${columnWidths.map(w => Math.round(w)).join(', ')}]`);

    let currentY = startY;
    let currentPage = page;

    // Helper function to draw headers with proper positioning
    const drawHeaders = (targetPage: any, yPosition: number) => {
      let headerX = pageMargins;

      columns.forEach((col, index) => {
        const headerText = fontResult.needsTransliteration ?
          this.sanitizeTextForPDF(col.header) : col.header;

        // Calculate max characters that fit in this column
        const availableWidth = columnWidths[index];
        const avgCharWidth = (options.fontSize + 1) * 0.6;
        const maxChars = Math.floor(availableWidth / avgCharWidth);
        const displayHeader = headerText.length > maxChars ?
          headerText.substring(0, Math.max(1, maxChars - 3)) + '...' : headerText;

        console.log(`📝 Drawing header "${displayHeader}" at x=${headerX}, y=${yPosition}`);

        try {
          targetPage.drawText(displayHeader, {
            x: headerX,
            y: yPosition,
            size: options.fontSize + 1,
            font: fontResult.font,
            color: rgb(0, 0, 0)
          });
        } catch (error) {
          console.error(`Failed to draw header "${displayHeader}":`, error);
        }

        headerX += columnWidths[index] + columnPadding;
      });
    };

    // Draw initial headers
    console.log(`🎯 Drawing headers at y=${currentY}`);
    drawHeaders(currentPage, currentY);
    currentY -= 25;

    // Draw data rows with improved error handling and positioning
    tableData.forEach((row, rowIndex) => {
      console.log(`📊 Processing row ${rowIndex + 1}/${tableData.length}`);

      let maxLinesInRow = 1;
      const cellLines: string[][] = [];

      // First pass: prepare all cell content
      columns.forEach((col, colIndex) => {
        const cellValue = row[col.dataKey] || '';
        let displayValue = cellValue.toString();

        if (fontResult.needsTransliteration) {
          displayValue = this.sanitizeTextForPDF(displayValue);
        }

        // Calculate text wrapping
        const avgCharWidth = options.fontSize * 0.6;
        const availableWidth = columnWidths[colIndex];
        const maxChars = Math.floor(availableWidth / avgCharWidth);
        const lines = this.wrapText(displayValue, Math.max(1, maxChars));

        cellLines.push(lines);
        maxLinesInRow = Math.max(maxLinesInRow, lines.length);
      });

      // Second pass: render all lines for this row
      for (let lineIndex = 0; lineIndex < maxLinesInRow; lineIndex++) {
        let lineX = pageMargins;

        columns.forEach((col, colIndex) => {
          const lines = cellLines[colIndex];
          const textToRender = lines[lineIndex] || '';

          if (textToRender.trim()) {
            const yPos = currentY - (lineIndex * 12);

            try {
              currentPage.drawText(textToRender, {
                x: lineX,
                y: yPos,
                size: options.fontSize,
                font: fontResult.font,
                color: rgb(0, 0, 0)
              });
            } catch (error) {
              console.warn(`Text rendering failed for "${textToRender}", using fallback`);
              try {
                const safeText = this.sanitizeTextForPDF(textToRender);
                currentPage.drawText(safeText, {
                  x: lineX,
                  y: yPos,
                  size: options.fontSize,
                  font: fontResult.font,
                  color: rgb(0, 0, 0)
                });
              } catch (fallbackError) {
                console.error(`Even fallback text rendering failed:`, fallbackError);
              }
            }
          }

          lineX += columnWidths[colIndex] + columnPadding;
        });
      }

      // Move to next row position
      const rowHeight = Math.max(18, maxLinesInRow * 12 + 6);
      currentY -= rowHeight;

      // Check if we need a new page
      if (currentY < 70) { // Leave more margin at bottom
        console.log(`📄 Creating new page (currentY=${currentY})`);
        const newDimensions = this.getPageDimensions(options.pageSize, options.orientation);
        currentPage = pdfDoc.addPage([newDimensions[0], newDimensions[1]]);
        currentY = currentPage.getSize().height - 50;

        // Draw headers on new page
        drawHeaders(currentPage, currentY);
        currentY -= 25;
      }
    });

    console.log(`✅ Sheet "${sheet.name}" processed successfully`);
  }

  private wrapText(text: string, maxChars: number): string[] {
    if (!text) return [''];

    // Handle very small maxChars
    if (maxChars < 1) return [''];
    if (maxChars < 3) return [text.substring(0, maxChars)];

    if (text.length <= maxChars) {
      return [text];
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      // If single word is too long, truncate it appropriately
      if (word.length > maxChars) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }

        // For very long words, truncate with ellipsis if there's room
        if (maxChars > 3) {
          lines.push(word.substring(0, maxChars - 2) + '..');
        } else {
          lines.push(word.substring(0, maxChars));
        }
        continue;
      }

      // Check if adding this word would exceed maxChars
      const testLine = currentLine + word;
      if (testLine.length > maxChars) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = word + ' ';
      } else {
        currentLine = testLine + ' ';
      }
    }

    // Add the last line if it has content
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    // Return empty array if no content, otherwise limit to 2 lines max
    return lines.length > 0 ? lines.slice(0, 2) : [''];
  }

  private getOriginalColumnWidths(sheet: ExcelSheet, columns: AutoTableColumn[], usableWidth: number): number[] {
    const minColumnWidth = 60; // Minimum width for readability

    // Calculate content-based widths
    const contentWidths: number[] = [];

    // First, identify which original columns are non-empty (same logic as prepareTableData)
    const maxColumns = Math.max(...sheet.data.map(row => row.length));
    const nonEmptyColumns: number[] = [];
    for (let col = 0; col < maxColumns; col++) {
      let hasContent = false;
      for (let row = 0; row < sheet.data.length; row++) {
        const cell = sheet.data[row]?.[col];
        if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
          hasContent = true;
          break;
        }
      }
      if (hasContent) {
        nonEmptyColumns.push(col);
      }
    }

    columns.forEach((col, newIndex) => {
      // Start with header length
      let maxContentLength = col.header.length;

      // Get the original column index for this data
      const originalColIndex = nonEmptyColumns[newIndex];

      // Check data content lengths in this original column
      sheet.data.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row

        const cell = row[originalColIndex];
        if (cell && cell.value !== null && cell.value !== undefined) {
          const cellText = String(cell.value);
          maxContentLength = Math.max(maxContentLength, cellText.length);
        }
      });

      // Convert character length to approximate pixel width
      // Average character width is ~6-7 pixels for 10pt font
      const estimatedWidth = Math.max(minColumnWidth, maxContentLength * 7);
      contentWidths.push(estimatedWidth);
    });

    // Scale widths to fit available space if needed
    const totalContentWidth = contentWidths.reduce((sum, w) => sum + w, 0);

    if (totalContentWidth > usableWidth) {
      // Scale down proportionally
      const scaleFactor = usableWidth / totalContentWidth;
      return contentWidths.map(w => Math.max(minColumnWidth, w * scaleFactor));
    }

    // If we have extra space, distribute it proportionally
    if (totalContentWidth < usableWidth) {
      const extraSpace = usableWidth - totalContentWidth;
      const spacePerColumn = extraSpace / columns.length;
      return contentWidths.map(w => w + spacePerColumn);
    }

    return contentWidths;
  }
}

export const excelToPDFGenerator = new ExcelToPDFGenerator();
