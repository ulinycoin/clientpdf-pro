/**
 * Add Text tool translations for RU language
 * Contains: page metadata, upload zone, editor interface, toolbar, format panel
 * Complete localization following rotate-pdf methodology
 */

export const addText = {
  // Basic properties for tools grid
  title: 'Добавить текст',
  description: 'Добавить текстовые аннотации в PDF',
  
  // Page metadata (SEO)
  pageTitle: 'Добавить текст в PDF бесплатно - LocalPDF',
  pageDescription: 'Добавляйте текст, подписи и аннотации в PDF файлы бесплатно. Полная настройка шрифтов, цветов и размеров. Приватное редактирование PDF в браузере.',
  
  // Upload zone translations (for AddTextPDFPage)
  uploadTitle: 'Добавить текст в PDF',
  uploadSubtitle: 'Добавьте текстовые аннотации в любое место вашего PDF',
  supportedFormats: 'PDF файлы до 100МБ',
  selectedFile: 'Выбранный файл',
  readyForEditing: 'Готов к редактированию',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  editPdf: 'Редактировать PDF ✏️',
  
  // Main AddTextTool interface
  addTextToPdf: 'Добавление текста в PDF',
  backToTools: 'Назад к инструментам',
  noFileSelected: 'Файл не выбран',
  noFileDescription: 'Пожалуйста, выберите PDF файл для добавления текста',
  
  textElements: {
    single: 'элемент',
    multiple: 'элементов'
  },
  
  // Toolbar translations
  toolbar: {
    addText: 'Добавить текст',
    select: 'Выбрать',
    undo: 'Отменить',
    redo: 'Повторить',
    page: 'Стр.',
    of: 'из',
    savePdf: 'Сохранить PDF'
  },
  
  // Format Panel translations
  formatPanel: {
    title: 'Форматирование',
    selectElementPrompt: 'Выберите текстовый элемент для редактирования',
    textContent: 'Содержание текста',
    textPlaceholder: 'Введите ваш текст...',
    fontFamily: 'Шрифт',
    fontSize: 'Размер шрифта',
    textColor: 'Цвет текста',
    position: 'Позиция',
    preview: 'Предварительный просмотр',
    sampleText: 'Образец текста'
  },
  
  // Status bar and interaction messages
  status: {
    mode: 'Режим',
    addTextMode: 'Добавление текста',
    selectMode: 'Выбор элементов',
    selected: 'Выбрано',
    zoom: 'Масштаб',
    clickToEdit: 'Нажмите для редактирования'
  },
  
  // Processing overlay
  processingTitle: 'Сохранение PDF',
  processingDescription: 'Добавление текста и создание нового PDF файла...',
  
  // Canvas translations
  canvas: {
    loadingPdf: 'Загрузка PDF...'
  },
  
  // Legacy compatibility
  buttons: {
    startEditing: 'Добавить текст ✏️',
    processing: 'Добавление текста...',
    download: 'Скачать PDF с текстом',
    backToTools: 'Назад к инструментам'
  },
  
  messages: {
    processing: 'Добавление текста в ваш PDF...',
    success: 'Текст успешно добавлен!',
    downloadReady: 'Ваш PDF с добавленным текстом готов',
    error: 'Ошибка добавления текста в PDF',
    noFileSelected: 'Пожалуйста, выберите PDF файл'
  },
  
  errors: {
    invalidFile: 'Неверный формат PDF файла',
    fileTooLarge: 'Размер файла превышает лимит 100МБ',
    processingFailed: 'Ошибка добавления текста в PDF'
  }
};