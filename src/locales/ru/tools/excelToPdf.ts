/**
 * Excel to PDF tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress
 * Complete localization following established methodology
 */

export const excelToPdf = {
  // Basic properties for tools grid
  title: 'Excel в PDF',
  description: 'Конвертировать таблицы Excel в PDF-документы',
  
  // Page metadata (SEO)
  pageTitle: 'Конвертер Excel в PDF бесплатно - LocalPDF',
  pageDescription: 'Конвертируйте таблицы Excel в PDF-документы с сохранением макета.',
  
  // Upload section
  uploadSection: {
    title: 'Загрузить файл Excel',
    subtitle: 'Конвертируйте таблицы Excel в PDF с полным сохранением форматирования и данных',
    supportedFormats: 'Файлы XLSX, XLS до 100МБ'
  },
  
  // Tool interface
  tool: {
    title: 'Конвертер Excel в PDF',
    description: 'Конвертировать таблицы Excel в PDF-документы',
    
    // Features
    features: {
      title: 'Возможности конвертации:',
      multipleSheets: 'Поддержка выбора нескольких листов',
      preserveFormatting: 'Сохранение всего форматирования и стилей',
      customSettings: 'Гибкие настройки конвертации',
      highQuality: 'Высококачественный вывод PDF'
    },
    
    // Sheet selection
    sheetSelection: {
      title: 'Выберите листы для конвертации',
      selectAll: 'Выбрать все',
      deselectAll: 'Снять выделение',
      selectedSheets: 'Выбрано листов ({count})'
    },
    
    // Conversion options
    pageSize: 'Размер страницы',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 мм)',
      letter: 'Letter (8.5 × 11 дюймов)',
      a3: 'A3 (297 × 420 мм)'
    },
    
    orientation: 'Ориентация',
    orientationOptions: {
      portrait: 'Книжная',
      landscape: 'Альбомная'
    },
    
    includeSheetNames: 'Включить названия листов в PDF',
    
    // Actions
    convertToPdf: 'Конвертировать в PDF 📊',
    converting: 'Конвертация...',
    
    // Progress
    analyzing: 'Анализ файла Excel...',
    convertingSheet: 'Конвертация листа {current} из {total}...'
  },
  
  // Direct tool interface translations (used by ExcelToPDFTool component)
  conversionSettings: 'Настройки конвертации',
  fileInformation: 'Информация о файле',
  selectSheets: 'Выберите листы для конвертации',
  
  // Settings sections
  pageSetup: 'Настройки страницы',
  formatting: 'Форматирование',
  margins: 'Поля',
  options: 'Опции',
  selectAll: 'Выбрать все',
  deselectAll: 'Снять выделение',
  rowsColumns: '{rows} строк × {cols} столбцов',
  pageOrientation: 'Ориентация страницы',
  portrait: 'Книжная',
  landscape: 'Альбомная',
  pageSize: 'Размер страницы',
  fontSize: 'Размер шрифта',
  outputFormat: 'Формат вывода',
  singlePdf: 'Один файл PDF',
  separatePdfs: 'Отдельный PDF для каждого листа',
  
  // Margin labels
  marginTop: 'Верхнее',
  marginBottom: 'Нижнее',
  marginLeft: 'Левое',
  marginRight: 'Правое',
  includeSheetNames: 'Включить названия листов в PDF',
  convertToPdf: 'Конвертировать в PDF 📊',
  converting: 'Конвертация...',
  conversionCompleted: 'Конвертация завершена!',
  pdfReady: 'Ваш PDF готов для скачивания',
  multipleFiles: 'Готово {count} файлов для скачивания',
  file: 'Файл',
  size: 'Размер',
  sheets: 'Листы',
  languages: 'Языки',
  multiLanguageNote: 'Этот файл содержит несколько языков и может потребовать специальной обработки',
  chooseDifferentFile: 'Выбрать другой файл',
  
  // Legacy compatibility
  uploadTitle: 'Excel в PDF',
  uploadSubtitle: 'Конвертация файлов XLSX в формат PDF',
  supportedFormats: 'XLSX файлы до 100МБ',
  
  buttons: {
    startConverting: 'Конвертировать в PDF 📊',
    processing: 'Конвертация Excel...',
    download: 'Скачать PDF'
  },
  
  messages: {
    processing: 'Конвертация таблицы Excel в PDF...',
    success: 'Таблица успешно сконвертирована!',
    error: 'Ошибка конвертации Excel в PDF'
  }
};