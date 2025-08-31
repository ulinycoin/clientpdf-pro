/**
 * Extract Text tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractText = {
  // Basic properties for tools grid
  title: 'Извлечь текст',
  description: 'Извлечь текстовое содержимое из PDF-файлов',
  
  // Page metadata (SEO)
  pageTitle: 'Извлечь текст из PDF бесплатно - LocalPDF',
  pageDescription: 'Извлекайте текстовое содержимое из PDF файлов бесплатно. Получите простой текст из PDF документов с умным форматированием.',
  
  // Upload section (for ExtractTextPDFPage)
  uploadTitle: 'Извлечь текст из PDF',
  uploadSubtitle: 'Извлечение всего текстового содержимого из PDF документов одним кликом',
  supportedFormats: 'PDF файлы до 100МБ',
  selectedFile: 'Выбранный файл',
  readyToExtract: 'Готов для извлечения текста',
  removeFile: 'Удалить файл',
  extractTextButton: 'Извлечь текст 📄',
  
  // Main ExtractTextTool interface
  tool: {
    title: 'Инструмент извлечения текста',
    description: 'Настройте параметры извлечения текста из вашего PDF документа',
    fileToExtract: 'Файл для извлечения текста',
    
    // Extraction options section
    extractionOptions: 'Параметры извлечения',
    smartFormatting: 'Умное форматирование',
    smartFormattingDesc: 'Автоматически улучшает структуру и читаемость извлечённого текста',
    
    formattingLevel: 'Уровень форматирования',
    levels: {
      minimal: {
        title: 'Минимальный',
        desc: 'Базовая очистка лишних пробелов и переносов строк'
      },
      standard: {
        title: 'Стандартный',
        desc: 'Восстановление абзацев и базовой структуры документа'
      },
      advanced: {
        title: 'Продвинутый',
        desc: 'Интеллектуальное восстановление заголовков, списков и форматирования'
      }
    },
    
    includeMetadata: 'Включить метаданные документа',
    preserveFormatting: 'Сохранить исходное форматирование',
    pageRange: 'Извлечь только определённые страницы',
    
    pageRangeFields: {
      startPage: 'Начальная страница',
      endPage: 'Конечная страница',
      note: 'Оставьте пустым для извлечения всего документа'
    },
    
    // Progress states
    extracting: 'Извлечение текста ({progress}%)',
    
    // Success results section
    success: {
      title: 'Текст успешно извлечён!',
      pagesProcessed: 'Обработано страниц: {count}',
      textLength: 'Символов извлечено: {length}',
      documentTitle: 'Название документа: {title}',
      author: 'Автор: {author}',
      smartFormattingApplied: 'Применено умное форматирование: {level}',
      fileDownloaded: 'Файл автоматически скачан',
      noTextWarning: 'В документе не найдено извлекаемого текста',
      
      // Before/after comparison
      comparisonPreview: 'Предварительный просмотр улучшений',
      before: 'До обработки',
      after: 'После обработки',
      notice: 'Показаны первые 200 символов для предварительного просмотра',
      
      // Regular text preview
      textPreview: 'Предварительный просмотр текста'
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Пожалуйста, выберите PDF файл для извлечения текста'
    },
    
    // Info and privacy sections
    infoBox: {
      title: 'Интеллектуальное извлечение',
      description: 'Наши алгоритмы автоматически определяют и сохраняют структуру документа для максимально читаемого результата.'
    },
    
    privacy: {
      title: 'Защита конфиденциальности',
      description: 'Ваши файлы обрабатываются локально в браузере. Никакие данные не отправляются на серверы.'
    },
    
    // Button actions
    buttons: {
      extractText: 'Извлечь текст',
      extracting: 'Извлечение...'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Назад к инструментам',
  fileSizeUnit: 'МБ',
  buttons: {
    extractText: 'Извлечь текст 📄',
    extracting: 'Извлечение текста...',
    download: 'Скачать текстовый файл',
    backToTools: 'Назад к инструментам'
  },
  
  messages: {
    processing: 'Извлечение текста из вашего PDF...',
    progress: 'Обработка страницы {current} из {total}',
    success: 'Извлечение текста завершено успешно!',
    downloadReady: 'Ваш текстовый файл готов к скачиванию',
    error: 'Ошибка извлечения текста из PDF',
    noFileSelected: 'Пожалуйста, выберите PDF файл для извлечения текста',
    noTextFound: 'Текст в данном PDF файле не найден'
  }
};