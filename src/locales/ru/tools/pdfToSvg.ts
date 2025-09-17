/**
 * PDF to SVG tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, conversion options, progress, results
 * Complete localization following established methodology
 */

export const pdfToSvg = {
  // Basic properties for tools grid
  title: 'PDF в SVG',
  description: 'Конвертировать страницы PDF в масштабируемые векторные графики (SVG)',
  
  // Page metadata (SEO)
  pageTitle: 'Конвертировать PDF в SVG бесплатно - LocalPDF',
  pageDescription: 'Конвертация страниц PDF в векторы SVG. Высококачественная конвертация PDF в SVG с масштабируемыми графиками.',
  
  // Upload zone (for PDFToSvgPage)
  uploadTitle: 'Загрузите PDF файл для конвертации в SVG',
  uploadSubtitle: 'Преобразование страниц PDF в масштабируемые векторные графики',
  supportedFormats: 'PDF файлы',
  selectedFile: 'Выбранный файл ({count})',
  readyToConvert: 'Готов к конвертации в SVG',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  
  // Results section
  results: {
    successTitle: 'PDF успешно конвертирован в SVG!',
    successDescription: 'Все страницы PDF конвертированы в масштабируемые векторные графики',
    convertAnotherFile: 'Конвертировать другой файл',
    conversionComplete: 'Конвертация SVG успешно завершена!',
    processingTitle: 'Конвертация SVG в процессе',
    processingMessage: 'Обработка страницы {current} из {total}',
    pagesConverted: 'Страницы конвертированы',
    format: 'Формат',
    totalSize: 'Общий размер',
    processingTime: 'Время обработки',
    preview: 'Предпросмотр',
    downloadSvgs: 'Скачать SVG файлы',
    downloadAll: 'Скачать все SVG файлы ({count})',
    downloadIndividual: 'Скачать отдельные SVG файлы',
    pageLabel: 'Страница {number}',
    seconds: 'с'
  },
  
  // Tool interface (for PdfToSvgTool)
  tool: {
    title: 'Конвертер PDF в SVG',
    description: 'Конвертировать страницы PDF в масштабируемые векторные графики',
    noFileSelected: 'PDF файл не выбран',
    noFileDescription: 'Пожалуйста, выберите PDF файл для конвертации в SVG',
    selectFile: 'Выбрать PDF файл',
    conversionSettingsTitle: 'Настройки конвертации',
    
    // Quality settings
    qualityTitle: 'Качество и разрешение',
    qualityDescription: 'Более высокое качество создает лучшие векторы, но большие файлы',
    qualities: {
      low: 'Базовое качество, меньшие файлы',
      medium: 'Сбалансированное качество и размер',
      high: 'Высокое качество, детальные векторы',
      maximum: 'Максимальное качество, самые большие файлы'
    },
    
    // Conversion method
    methodTitle: 'Метод конвертации',
    methodDescription: 'Выберите между быстрым canvas или извлечением векторов',
    methods: {
      canvas: 'Конвертация на основе canvas - быстро, но растеризованный контент',
      vector: 'Извлечение векторов - медленнее, но настоящие масштабируемые векторы (будущая функция)'
    },
    
    // Advanced options
    advancedTitle: 'Расширенные настройки',
    includeText: 'Включить текстовые элементы',
    includeTextDesc: 'Сохранить текст как выделяемые элементы',
    includeImages: 'Включить изображения',
    includeImagesDesc: 'Встроить изображения в SVG вывод',
    
    // Page selection
    pageSelectionTitle: 'Страницы для конвертации',
    pageSelection: {
      all: 'Все страницы',
      range: 'Диапазон страниц',
      specific: 'Конкретные страницы'
    },
    pageRangeFrom: 'Со страницы',
    pageRangeTo: 'До страницы',
    specificPagesPlaceholder: 'напр. 1,3,5-10',
    specificPagesHelp: 'Введите номера страниц через запятую',
    
    // Background color
    backgroundTitle: 'Цвет фона',
    backgroundDescription: 'Цвет фона для прозрачных областей',
    
    // Progress and actions
    startConversion: 'Конвертировать в SVG 📐',
    converting: 'Конвертация...',
    cancel: 'Отмена',
    close: 'Закрыть',
    backToUpload: 'Назад к загрузке',
    supportInfo: 'Поддерживаются файлы до 100МБ • Формат SVG • Масштабируемые векторы'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Анализ PDF файла...',
    converting: 'Конвертация страниц в SVG...',
    page: 'Страница {current} из {total}',
    finalizing: 'Завершение конвертации SVG...',
    complete: 'Конвертация SVG завершена!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Конвертировать в SVG 📐',
    processing: 'Конвертация в SVG...',
    downloadZip: 'Скачать SVG файлы (ZIP)'
  },
  
  messages: {
    processing: 'Конвертация страниц PDF в SVG...',
    success: 'Конвертация SVG успешно завершена!',
    error: 'Ошибка конвертации PDF в SVG'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Неверный формат PDF файла',
    fileTooLarge: 'Размер файла превышает лимит в 100МБ',
    conversionFailed: 'Ошибка конвертации PDF в SVG',
    noPages: 'Страницы не найдены в PDF',
    invalidPageRange: 'Указан неверный диапазон страниц',
    invalidOptions: 'Неверные опции конвертации',
    processingError: 'Ошибка при обработке SVG'
  }
};