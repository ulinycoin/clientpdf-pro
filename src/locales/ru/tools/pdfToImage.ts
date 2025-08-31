/**
 * PDF to Image tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, format options, progress, results
 * Complete localization following established methodology
 */

export const pdfToImage = {
  // Basic properties for tools grid
  title: 'PDF в изображения',
  description: 'Конвертировать страницы PDF в файлы изображений (PNG, JPEG)',
  
  // Page metadata (SEO)
  pageTitle: 'Конвертер PDF в изображения бесплатно - LocalPDF',
  pageDescription: 'Конвертируйте страницы PDF в изображения PNG или JPEG. Высококачественная конвертация PDF в изображения.',
  
  // Upload zone (for PDFToImagePage)
  uploadTitle: 'Загрузить PDF файл для конвертации в изображения',
  uploadSubtitle: 'Преобразуйте страницы PDF в высококачественные изображения JPG, PNG или WebP',
  supportedFormats: 'PDF файлы',
  selectedFile: 'Выбранный файл ({count})',
  readyToConvert: 'Готов к конвертации в изображения',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  
  // Results section
  results: {
    successTitle: 'PDF успешно конвертирован в изображения!',
    successDescription: 'Все страницы PDF преобразованы в изображения',
    convertAnotherFile: 'Конвертировать другой файл',
    conversionComplete: 'Конвертация успешно завершена!',
    processingTitle: 'Конвертация в процессе',
    processingMessage: 'Обработка страницы {current} из {total}',
    pagesConverted: 'Конвертировано страниц',
    format: 'Формат',
    totalSize: 'Общий размер',
    processingTime: 'Время обработки',
    preview: 'Предпросмотр',
    downloadImages: 'Скачать изображения',
    downloadAll: 'Скачать все изображения ({count})',
    downloadIndividual: 'Скачать отдельные изображения',
    pageLabel: 'Страница {number}',
    seconds: 'с'
  },
  
  // Tool interface (for PdfToImageTool)
  tool: {
    title: 'Конвертер PDF в изображения',
    description: 'Конвертировать страницы PDF в высококачественные файлы изображений',
    noFileSelected: 'PDF файл не выбран',
    noFileDescription: 'Пожалуйста, выберите PDF файл для конвертации в изображения',
    selectFile: 'Выбрать PDF файл',
    conversionSettingsTitle: 'Настройки конвертации',
    
    // Format selection
    formatTitle: 'Формат изображения',
    formatDescription: 'Выберите выходной формат изображений',
    formats: {
      png: 'Высокое качество с поддержкой прозрачности (большие файлы)',
      jpeg: 'Меньшие размеры файлов, хорошо для фотографий (без прозрачности)',
      jpg: 'JPG - Меньший размер, хорошее качество',
      webp: 'WebP - Современный формат, отличное сжатие'
    },
    
    // Quality settings
    qualityTitle: 'Качество изображения',
    qualityDescription: 'Баланс между размером файла и качеством',
    qualities: {
      low: 'Минимальный размер файла, базовое качество',
      medium: 'Сбалансированные размер и качество',
      high: 'Высокое качество, большие файлы',
      maximum: 'Максимальное качество, самые большие файлы'
    },
    
    // Page selection
    pageSelectionTitle: 'Страницы для конвертации',
    pageSelection: {
      all: 'Все страницы',
      range: 'Диапазон страниц',
      specific: 'Определенные страницы'
    },
    pageRangeFrom: 'С страницы',
    pageRangeTo: 'По страницу',
    specificPagesPlaceholder: 'например, 1,3,5-10',
    specificPagesHelp: 'Введите номера страниц через запятую',
    
    // Background color
    backgroundTitle: 'Цвет фона',
    backgroundDescription: 'Цвет фона для прозрачных областей',
    
    // Progress and actions
    startConversion: 'Конвертировать в изображения 🖼️',
    converting: 'Конвертация...',
    cancel: 'Отменить',
    close: 'Закрыть',
    backToUpload: 'Назад к загрузке',
    supportInfo: 'Поддержка файлов до 100МБ • Форматы PNG, JPEG • Высокое качество'
  },
  
  // Processing messages
  progress: {
    analyzing: 'Анализ PDF файла...',
    converting: 'Конвертация страниц в изображения...',
    page: 'Страница {current} из {total}',
    finalizing: 'Завершение конвертации...',
    complete: 'Конвертация завершена!'
  },
  
  // Legacy compatibility
  buttons: {
    startConverting: 'Конвертировать в изображения 🖼️',
    processing: 'Конвертация в изображения...',
    downloadZip: 'Скачать изображения (ZIP)'
  },
  
  messages: {
    processing: 'Конвертация страниц PDF в изображения...',
    success: 'Конвертация завершена успешно!',
    error: 'Ошибка конвертации PDF в изображения'
  },
  
  // Error handling
  errors: {
    invalidFile: 'Неверный формат PDF файла',
    fileTooLarge: 'Размер файла превышает лимит в 100МБ',
    conversionFailed: 'Ошибка конвертации PDF в изображения',
    noPages: 'Страницы в PDF не найдены',
    invalidPageRange: 'Указан неверный диапазон страниц'
  }
};