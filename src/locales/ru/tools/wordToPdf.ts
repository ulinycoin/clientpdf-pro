/**
 * Word to PDF tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, settings, processing messages
 */

export const wordToPdf = {
  // Basic properties for tools grid
  title: 'Word в PDF',
  description: 'Конвертация документов Word в PDF формат',
  
  // Page metadata (SEO)
  pageTitle: 'Конвертировать Word в PDF бесплатно - LocalPDF',
  pageDescription: 'Преобразуйте документы Word в PDF с сохранением форматирования. Поддержка DOCX файлов, полная конфиденциальность и безопасность.',
  
  // Upload zone translations  
  uploadTitle: 'Конвертация Word в PDF',
  uploadSubtitle: 'Загрузите DOCX документы для конвертации в PDF формат',
  supportedFormats: 'DOCX файлы до 100МБ',
  
  // Tool interface translations
  tool: {
    title: 'Конвертер Word в PDF',
    uploadTitle: 'Выберите документ Word',
    uploadSubtitle: 'Выберите DOCX файл для конвертации в PDF',
    supportedFormats: 'Поддерживаются DOCX файлы (до 100МБ)',
    
    compatibility: {
      msWord: 'Microsoft Word 2007+ (.docx)',
      googleDocs: 'Google Docs экспортированный как DOCX',
      docWarning: 'Устаревшие .doc файлы не поддерживаются - используйте .docx',
      localProcessing: 'Обрабатывается локально в вашем браузере'
    },
    
    preview: {
      title: 'Предпросмотр PDF',
      description: 'Конвертируйте документ для просмотра PDF',
      generating: 'Генерация предпросмотра PDF...',
      waitMessage: 'Пожалуйста, подождите, пока мы подготовим ваш документ',
      placeholder: 'Предпросмотр PDF появится здесь',
      uploadPrompt: 'Загрузите документ Word для начала работы',
      error: 'Не удалось сгенерировать предпросмотр',
      errorTitle: 'Ошибка предпросмотра',
      tryAgain: 'Попробовать снова',
      zoomOut: 'Уменьшить',
      zoomIn: 'Увеличить'
    },
    
    settings: {
      title: 'Настройки конвертации',
      hide: 'Скрыть',
      show: 'Показать',
      pageSetup: {
        title: 'Настройка страницы',
        pageSize: 'Размер страницы',
        pageSizeOptions: {
          a4: 'A4 (210 × 297 мм)',
          letter: 'Letter (8.5 × 11 дюйм)',
          a3: 'A3 (297 × 420 мм)'
        }
      },
      margins: {
        title: 'Поля (мм)',
        top: 'Сверху',
        right: 'Справа',
        bottom: 'Снизу',
        left: 'Слева'
      },
      typography: {
        title: 'Типографика',
        fontSize: 'Размер шрифта',
        fontSizeOptions: {
          small: '10pt (Мелкий)',
          normal11: '11pt',
          normal12: '12pt (Обычный)',
          large: '14pt (Крупный)',
          extraLarge: '16pt (Оч. крупный)'
        }
      },
      advanced: {
        title: 'Расширенные опции',
        embedFonts: 'Встроить шрифты для лучшей совместимости',
        compression: 'Сжать PDF (меньший размер файла)',
        resetDefaults: 'Сбросить по умолчанию'
      }
    },
    
    fileInfo: {
      title: 'Информация о документе',
      fileName: 'Имя файла',
      fileSize: 'Размер файла',
      fileType: 'Тип файла',
      microsoftWord: 'Microsoft Word',
      privacyNote: 'Ваш документ обрабатывается локально - никогда не загружается'
    },
    
    buttons: {
      convertToPdf: 'Конвертировать в PDF',
      converting: 'Конвертация...',
      download: 'Скачать PDF',
      chooseDifferent: 'Выбрать другой файл',
      hidePreview: 'Скрыть предпросмотр',
      showPreview: 'Показать предпросмотр и скачать'
    },
    
    messages: {
      conversionCompleted: 'Конвертация завершена!',
      conversionFailed: 'Ошибка конвертации',
      processing: 'Конвертация документа Word в PDF...',
      noFile: 'Документ Word не выбран',
      converting: 'Конвертация документа в PDF...',
      downloadHint: 'После конвертации используйте кнопку Скачать в панели предпросмотра',
      processingDescription: 'Обработка вашего документа Word...',
      progress: 'Прогресс',
      unknownError: 'Произошла неожиданная ошибка при конвертации'
    }
  },
  
  // Processing buttons and states
  buttons: {
    startConverting: 'Конвертировать в PDF 📄',
    converting: 'Конвертация Word...',
    download: 'Скачать PDF',
    backToTools: 'Назад к инструментам',
    selectNewFile: 'Выбрать новый файл'
  },
  
  // Processing messages
  messages: {
    processing: 'Конвертация документа Word в PDF...',
    success: 'Документ успешно конвертирован!',
    downloadReady: 'Ваш PDF готов для скачивания',
    error: 'Не удалось конвертировать Word в PDF',
    noFileSelected: 'Пожалуйста, выберите документ Word для конвертации',
    invalidFormat: 'Пожалуйста, выберите действительный DOCX файл'
  },
  
  // Tool-specific content
  howItWorks: {
    title: 'Как работает конвертация Word в PDF',
    description: 'Наш конвертер преобразует документы Word в профессиональные PDF файлы с сохранением форматирования',
    steps: [
      'Загрузите DOCX файл с вашего устройства',
      'Настройте параметры конвертации при необходимости', 
      'Нажмите конвертировать для создания PDF',
      'Скачайте конвертированный PDF файл'
    ]
  },
  
  // Benefits specific to word to pdf tool
  benefits: {
    title: 'Почему стоит использовать наш конвертер Word в PDF?',
    features: [
      'Идеальное сохранение форматирования',
      'Поддержание структуры и стилизации документа',
      'Настраиваемые параметры конвертации',
      'Мгновенная обработка в вашем браузере'
    ]
  },
  
  // Error handling
  errors: {
    invalidFile: 'Неверный формат документа Word',
    fileTooLarge: 'Размер файла превышает лимит 100МБ',
    conversionFailed: 'Не удалось конвертировать документ',
    noFileUploaded: 'Документ Word не выбран',
    corruptedFile: 'Документ поврежден',
    unsupportedVersion: 'Пожалуйста, используйте формат DOCX (Word 2007+)'
  }
};