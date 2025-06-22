import Papa from 'papaparse';

/**
 * Специальный препроцессор для сложных CSV файлов
 */
export class CsvPreprocessor {
  /**
   * Анализирует и очищает CSV файл от заголовков отчетов
   */
  static preprocessCSV(csvText: string): {
    cleanedText: string;
    headerRowIndex: number;
    reportTitle?: string;
    structure: {
      delimiter: string;
      hasHeader: boolean;
      quoteChar: string;
      totalLines: number;
      dataStartLine: number;
    };
  } {
    const lines = csvText.split(/\r?\n/);
    
    // Определяем разделитель
    const delimiter = this.detectDelimiter(lines);
    console.log('Detected delimiter:', JSON.stringify(delimiter));
    
    // Ищем строку с заголовками столбцов
    const headerInfo = this.findHeaderRow(lines, delimiter);
    console.log('Header analysis:', headerInfo);
    
    // Извлекаем заголовок отчета если есть
    const reportTitle = this.extractReportTitle(lines.slice(0, headerInfo.headerRowIndex));
    
    // Создаем очищенный CSV начиная со строки заголовков
    const cleanLines = lines.slice(headerInfo.headerRowIndex);
    const cleanedText = cleanLines.join('\n');
    
    return {
      cleanedText,
      headerRowIndex: headerInfo.headerRowIndex,
      reportTitle,
      structure: {
        delimiter,
        hasHeader: headerInfo.hasValidHeader,
        quoteChar: '"',
        totalLines: lines.length,
        dataStartLine: headerInfo.headerRowIndex + (headerInfo.hasValidHeader ? 1 : 0)
      }
    };
  }

  /**
   * Определение разделителя
   */
  private static detectDelimiter(lines: string[]): string {
    const candidates = [';', ',', '\t', '|'];
    const testLines = lines.slice(0, Math.min(10, lines.length));
    
    let bestDelimiter = ';';
    let maxScore = 0;
    
    for (const delimiter of candidates) {
      let totalScore = 0;
      let validLines = 0;
      
      for (const line of testLines) {
        const count = this.countDelimitersInLine(line, delimiter);
        if (count > 1) {
          totalScore += count;
          validLines++;
        }
      }
      
      const avgScore = validLines > 0 ? totalScore / validLines : 0;
      
      if (avgScore > maxScore) {
        maxScore = avgScore;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  /**
   * Подсчет разделителей в строке с учетом кавычек
   */
  private static countDelimitersInLine(line: string, delimiter: string): number {
    let count = 0;
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Поиск строки с заголовками столбцов
   */
  private static findHeaderRow(lines: string[], delimiter: string): {
    headerRowIndex: number;
    hasValidHeader: boolean;
    columnCount: number;
  } {
    const headerIndicators = [
      'MU NR.', 'DATUMS', 'VALŪTA', 'SUMMA', 'KODS',
      'MAKSĀJUMA', 'PARTNERA', 'TRANSAKCIJAS', 'REFERENCE',
      'ID', 'DATE', 'AMOUNT', 'NAME', 'VALUE', 'TYPE'
    ];
    
    let bestHeaderIndex = -1;
    let maxIndicators = 0;
    let maxColumns = 0;
    
    // Анализируем первые 5 строк
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      const upperLine = line.toUpperCase();
      
      // Подсчитываем индикаторы заголовков
      const indicatorCount = headerIndicators.filter(indicator => 
        upperLine.includes(indicator.toUpperCase())
      ).length;
      
      // Подсчитываем количество колонок
      const columnCount = this.splitCSVLine(line, delimiter).length;
      
      console.log(`Line ${i + 1}: ${indicatorCount} indicators, ${columnCount} columns`);
      
      // Выбираем строку с максимальным количеством индикаторов
      // При равенстве - строку с большим количеством колонок
      if (indicatorCount > maxIndicators || 
          (indicatorCount === maxIndicators && columnCount > maxColumns)) {
        maxIndicators = indicatorCount;
        maxColumns = columnCount;
        bestHeaderIndex = i;
      }
    }
    
    return {
      headerRowIndex: bestHeaderIndex >= 0 ? bestHeaderIndex : 0,
      hasValidHeader: maxIndicators >= 2,
      columnCount: maxColumns
    };
  }

  /**
   * Разделение CSV строки с учетом кавычек
   */
  private static splitCSVLine(line: string, delimiter: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          currentField += '"';
          i++; // Пропускаем экранированную кавычку
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField.trim());
    return fields.map(field => field.replace(/^"|"$/g, '')); // Убираем внешние кавычки
  }

  /**
   * Извлечение заголовка отчета
   */
  private static extractReportTitle(headerLines: string[]): string | undefined {
    for (const line of headerLines) {
      const cleanLine = line.replace(/[";]/g, ' ').trim();
      if (cleanLine.length > 10 && (
        cleanLine.includes('PĀRSKATS') || 
        cleanLine.includes('KONTAA') ||
        cleanLine.includes('PERIODU')
      )) {
        return cleanLine;
      }
    }
    return undefined;
  }

  /**
   * Тестирование препроцессора
   */
  static testPreprocessor(csvText: string): void {
    console.log('=== CSV PREPROCESSOR TEST ===');
    const result = this.preprocessCSV(csvText);
    
    console.log('Report title:', result.reportTitle);
    console.log('Header row index:', result.headerRowIndex);
    console.log('Structure:', result.structure);
    
    console.log('\n=== CLEANED CSV PREVIEW ===');
    const cleanedLines = result.cleanedText.split('\n');
    cleanedLines.slice(0, 5).forEach((line, index) => {
      console.log(`Line ${index + 1}: ${line.substring(0, 100)}...`);
    });
    
    // Парсим очищенный CSV
    console.log('\n=== PARSING CLEANED CSV ===');
    Papa.parse(result.cleanedText, {
      header: result.structure.hasHeader,
      delimiter: result.structure.delimiter,
      skipEmptyLines: true,
      complete: (parseResult) => {
        console.log('Parsed fields:', parseResult.meta.fields);
        console.log('Column count:', parseResult.meta.fields?.length || 'unknown');
        console.log('Row count:', parseResult.data.length);
        
        if (parseResult.data.length > 0) {
          const firstRow = parseResult.data[0] as any;
          console.log('First row keys:', Object.keys(firstRow));
          console.log('Sample data:', Object.entries(firstRow).slice(0, 3));
        }
      }
    });
  }
}