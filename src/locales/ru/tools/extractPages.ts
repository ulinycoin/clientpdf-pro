/**
 * Extract Pages tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, selection modes, progress, results
 * Complete localization following established methodology
 */

export const extractPages = {
  // Basic properties for tools grid
  title: 'Извлечь страницы',
  description: 'Извлечь определенные страницы в новый документ',
  
  // Page metadata (SEO)
  pageTitle: 'Извлечь страницы PDF бесплатно - LocalPDF',
  pageDescription: 'Извлекайте определенные страницы из PDF документов в новые файлы. Быстро и безопасно в вашем браузере.',
  
  // Upload section (for ExtractPagesPDFPage)
  uploadTitle: 'Извлечь страницы из PDF',
  uploadSubtitle: 'Выберите конкретные страницы из PDF документа для создания нового файла',
  supportedFormats: 'PDF файлы до 100MB',
  selectedFile: 'Выбранный файл',
  readyToExtract: 'Готов к извлечению страниц',
  removeFile: 'Удалить файл',
  extractPagesButton: 'Извлечь страницы 📑',
  
  // Main ExtractPagesTool interface
  tool: {
    title: 'Извлечь страницы PDF',
    titleLoading: 'Извлечь страницы PDF',
    description: 'Выберите страницы для извлечения из:',
    fileInfo: {
      totalPages: 'Всего страниц:',
      selected: 'Выбрано:',
      loadingFile: 'Загрузка PDF файла...',
      noFileAvailable: 'PDF файл недоступен для извлечения страниц.',
      goBack: 'Вернуться'
    },
    
    // Selection modes
    selectionModes: {
      individual: 'Отдельные',
      range: 'Диапазон',
      all: 'Все',
      custom: 'Произвольные'
    },
    
    // Selection controls
    individual: {
      description: 'Нажмите на номера страниц ниже, чтобы выбрать отдельные страницы:',
      selected: 'Выбрано:',
      clearAll: 'Очистить всё'
    },
    
    range: {
      from: 'С:',
      to: 'По:',
      selectRange: 'Выбрать диапазон',
      clear: 'Очистить'
    },
    
    all: {
      description: 'Извлечь все {count} страниц (скопировать весь документ)',
      selectAllPages: 'Выбрать все страницы',
      clear: 'Очистить'
    },
    
    custom: {
      label: 'Диапазон страниц (напр., "1-5, 8, 10-12"):',
      placeholder: '1-5, 8, 10-12',
      parseRange: 'Обработать диапазон',
      selected: 'Выбрано:',
      clearAll: 'Очистить всё'
    },
    
    // Page grid
    pagesPreview: 'Предварительный просмотр страниц',
    pageTooltip: 'Страница {number}',
    pageSelected: 'Страница {number} (выбрана)',
    
    // Progress and results
    progress: {
      extracting: 'Извлечение страниц...',
      percentage: '{progress}%'
    },
    
    success: {
      title: 'Страницы успешно извлечены!',
      extracted: 'Извлечено {extracted} из {total} страниц',
      timing: 'за {time}с'
    },
    
    // Action buttons
    actions: {
      clearSelection: 'Очистить выбор',
      extractPages: 'Извлечь страницы',
      extracting: 'Извлечение...',
      readyToExtract: 'Готово к извлечению {count} {pages}'
    },
    
    // Tips section
    tips: {
      title: '💡 Советы по извлечению страниц:',
      items: [
        'Используйте режим "Диапазон" для непрерывных страниц (напр., страницы 1-10)',
        'Используйте режим "Произвольные" для сложных выборов (напр., "1-5, 8, 10-12")',
        'Нажимайте на отдельные номера страниц для переключения выбора',
        'Всё исходное форматирование и качество будет сохранено'
      ]
    },
    
    // Error handling
    errors: {
      noFileSelected: 'Пожалуйста, выберите PDF файл для извлечения страниц'
    }
  },
  
  // Legacy compatibility
  backToTools: 'Назад к инструментам',
  fileSizeUnit: 'МБ',
  buttons: {
    startExtracting: 'Извлечь страницы 📑',
    processing: 'Извлечение страниц...',
    download: 'Скачать извлеченные страницы',
    backToTools: 'Назад к инструментам'
  },
  
  messages: {
    processing: 'Извлечение выбранных страниц...',
    success: 'Страницы успешно извлечены!',
    error: 'Ошибка извлечения страниц из PDF'
  }
};