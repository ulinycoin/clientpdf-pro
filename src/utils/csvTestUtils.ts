import { CsvToPdfConverter } from '../services/converters/CsvToPdfConverter';

/**
 * Простые тесты для CSV to PDF конвертера
 * Запускайте в dev mode для проверки функциональности
 */

// Создание тестового CSV файла
const createTestCSVFile = (content: string, filename: string = 'test.csv'): File => {
  const blob = new Blob([content], { type: 'text/csv' });
  return new File([blob], filename, { type: 'text/csv' });
};

// Тестовые данные
const simpleCSV = `Name,Age,City,Country
John Doe,30,New York,USA
Jane Smith,25,London,UK
Bob Johnson,35,Toronto,Canada
Alice Brown,28,Sydney,Australia`;

const complexCSV = `Product,Category,Price,Stock,Rating,Description
Laptop Pro,"Electronics & Computers",1299.99,50,4.5,"High-performance laptop with SSD"
Coffee Maker,"Home & Kitchen",89.99,100,4.2,"Automatic drip coffee maker"
Running Shoes,"Sports & Outdoors",129.99,75,4.7,"Lightweight running shoes for marathon"
Book Set,"Books & Media",45.99,200,4.8,"Complete collection of programming books"`;

const tsvData = `Name	Position	Salary	Department
Alice	Developer	75000	IT
Bob	Manager	95000	Sales
Carol	Designer	65000	Marketing
David	Analyst	70000	Finance`;

export const runCSVTests = async () => {
  console.log('🧪 Запуск тестов CSV to PDF конвертера...');

  try {
    // Тест 1: Валидация файлов
    console.log('\n📋 Тест 1: Валидация файлов');
    
    const validFile = createTestCSVFile(simpleCSV);
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
    const largeFile = new File([new Array(1000000).join('a')], 'large.csv', { type: 'text/csv' });

    const validationResults = [
      CsvToPdfConverter.validateCSV(validFile),
      CsvToPdfConverter.validateCSV(invalidFile),
      CsvToPdfConverter.validateCSV(largeFile)
    ];

    console.log('✅ Валидный CSV:', validationResults[0]);
    console.log('❌ Пустой файл:', validationResults[1]);
    console.log('⚠️ Большой файл:', validationResults[2]);

    // Тест 2: Парсинг простого CSV
    console.log('\n📊 Тест 2: Парсинг простого CSV');
    
    const simpleResult = await CsvToPdfConverter.parseCSV(validFile);
    console.log('Результат парсинга:', {
      rows: simpleResult.rowCount,
      columns: simpleResult.columnCount,
      delimiter: simpleResult.delimiter,
      headers: simpleResult.headers
    });

    // Тест 3: Парсинг TSV
    console.log('\n📊 Тест 3: Парсинг TSV');
    
    const tsvFile = createTestCSVFile(tsvData, 'test.tsv');
    const tsvResult = await CsvToPdfConverter.parseCSV(tsvFile);
    console.log('TSV результат:', {
      rows: tsvResult.rowCount,
      columns: tsvResult.columnCount,
      delimiter: tsvResult.delimiter,
      headers: tsvResult.headers
    });

    // Тест 4: Генерация PDF с разными стилями
    console.log('\n🎨 Тест 4: Генерация PDF');
    
    const complexFile = createTestCSVFile(complexCSV);
    const complexResult = await CsvToPdfConverter.parseCSV(complexFile);

    const testConfigs = [
      {
        name: 'Grid Style',
        options: {
          orientation: 'landscape' as const,
          pageSize: 'a4' as const,
          tableStyle: 'grid' as const,
          title: 'Test Grid Style PDF'
        }
      },
      {
        name: 'Striped Style',
        options: {
          orientation: 'portrait' as const,
          pageSize: 'a4' as const,
          tableStyle: 'striped' as const,
          includeRowNumbers: true,
          title: 'Test Striped Style PDF'
        }
      }
    ];

    for (const config of testConfigs) {
      try {
        const pdfBytes = await CsvToPdfConverter.convertToPDF(complexResult, config.options);
        console.log(`✅ ${config.name}: PDF сгенерирован (${pdfBytes.length} bytes)`);
      } catch (error) {
        console.error(`❌ ${config.name}: Ошибка генерации PDF:`, error);
      }
    }

    // Тест 5: Опции предварительного просмотра
    console.log('\n🔍 Тест 5: Опции предварительного просмотра');
    
    const previewOptions = CsvToPdfConverter.getPreviewOptions();
    console.log('Preview опции:', previewOptions);

    console.log('\n🎉 Все тесты завершены!');
    
    return {
      success: true,
      simpleResult,
      tsvResult,
      complexResult
    };

  } catch (error) {
    console.error('❌ Ошибка в тестах:', error);
    return {
      success: false,
      error
    };
  }
};

// Дополнительные утилиты для тестирования
export const downloadTestPDF = async (csvContent: string, filename: string = 'test-output.pdf') => {
  try {
    const file = createTestCSVFile(csvContent);
    const parseResult = await CsvToPdfConverter.parseCSV(file);
    const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult, {
      orientation: 'landscape',
      pageSize: 'a4',
      tableStyle: 'grid',
      title: `Test PDF - ${new Date().toLocaleDateString()}`,
      includeRowNumbers: true
    });

    // Создание blob и скачивание
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`✅ PDF скачан: ${filename}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка скачивания PDF:', error);
    return false;
  }
};

// Запуск тестов в dev mode
if (import.meta.env.DEV) {
  // Автоматический запуск тестов через 2 секунды после загрузки модуля
  setTimeout(() => {
    console.log('🚀 Автоматический запуск тестов CSV конвертера...');
    runCSVTests();
  }, 2000);
}

// Экспорт для ручного запуска
(window as any).csvTests = {
  runCSVTests,
  downloadTestPDF,
  simpleCSV,
  complexCSV,
  tsvData
};
