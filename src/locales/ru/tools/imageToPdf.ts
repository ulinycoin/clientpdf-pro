/**
 * Images to PDF tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, settings, progress
 * Complete localization following established methodology
 */

export const imageToPdf = {
  // Basic properties for tools grid
  title: 'Изображения в PDF',
  description: 'Объединить несколько изображений в PDF-документ',
  
  // Page metadata (SEO)
  pageTitle: 'Конвертер изображений в PDF бесплатно - LocalPDF',
  pageDescription: 'Конвертируйте несколько изображений в один PDF документ. Поддержка PNG, JPEG и других форматов.',
  
  // Upload section (for ImageToPDFToolWrapper)
  uploadTitle: 'Изображения в PDF',
  uploadSubtitle: 'Объединение нескольких изображений в один PDF документ',
  supportedFormats: 'PNG, JPEG, GIF, BMP, TIFF файлы',
  
  // Upload section (for ImageToPDFTool)
  uploadSection: {
    title: 'Загрузить изображения',
    subtitle: 'Конвертировать несколько изображений в один PDF документ',
    supportedFormats: 'JPG, PNG, GIF, BMP, WebP файлы до 50МБ каждый'
  },
  
  // Tool interface (for ImageToPDFTool)
  tool: {
    title: 'Конвертировать изображения в PDF',
    description: 'Преобразовать несколько изображений в один PDF документ',
    
    // File management
    selectedImages: 'Выбранные изображения ({count})',
    clearAll: 'Очистить все',
    fileInfo: '{count} файлов • {size}',
    
    // PDF Settings
    pdfSettings: 'Настройки PDF',
    pageSize: 'Размер страницы',
    pageSizeOptions: {
      a4: 'A4 (210 × 297 мм)',
      letter: 'Letter (8,5 × 11 дюймов)',
      auto: 'Авто (подогнать изображения)'
    },
    
    orientation: 'Ориентация',
    orientationOptions: {
      portrait: 'Портретная',
      landscape: 'Альбомная'
    },
    
    imageLayout: 'Расположение изображений',
    layoutOptions: {
      fitToPage: 'Подогнать к странице',
      actualSize: 'Реальный размер',
      fitWidth: 'По ширине',
      fitHeight: 'По высоте'
    },
    
    imageQuality: 'Качество изображения ({quality}%)',
    qualitySlider: {
      lowerSize: 'Меньший размер',
      higherQuality: 'Лучшее качество'
    },
    
    pageMargin: 'Поля страницы ({margin}")',
    marginSlider: {
      noMargin: 'Без полей',
      twoInch: '2 дюйма'
    },
    
    background: 'Фон',
    backgroundOptions: {
      white: 'Белый',
      lightGray: 'Светло-серый',
      gray: 'Серый',
      black: 'Черный'
    },
    
    // Progress and conversion
    converting: 'Конвертация... {progress}%',
    
    // Buttons
    buttons: {
      selectImages: 'Выбрать изображения',
      reset: 'Сбросить',
      converting: 'Конвертация...',
      createPdf: 'Создать PDF'
    },
    
    // Help section
    help: {
      title: 'Советы по конвертации изображений в PDF:',
      dragDrop: 'Просто перетащите изображения прямо в область загрузки',
      formats: 'Поддерживает форматы JPG, PNG, GIF, BMP и WebP',
      layout: 'Выберите, как изображения размещаются на страницах PDF (подогнать к странице, реальный размер и т.д.)',
      quality: 'Настройте качество изображения для баланса между размером файла и визуальным качеством',
      privacy: 'Вся обработка происходит локально - ваши изображения никогда не покидают устройство'
    }
  },
  
  // Legacy compatibility (from original structure)
  buttons: {
    startConverting: 'Конвертировать в PDF 📄',
    processing: 'Конвертация изображений...',
    download: 'Скачать PDF'
  },
  
  messages: {
    processing: 'Конвертация изображений в PDF...',
    success: 'Изображения успешно сконвертированы!',
    error: 'Ошибка конвертации изображений в PDF'
  }
};