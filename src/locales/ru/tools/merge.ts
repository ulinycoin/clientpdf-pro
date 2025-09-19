/**
 * Merge PDF tool translations for RU language
 * Contains: page metadata, upload zone, file management, processing messages
 */

export const merge = {
  // Basic properties for tools grid
  title: 'Объединить PDF',
  description: 'Объединить несколько PDF-файлов в один документ',
  
  // Page metadata (SEO)
  pageTitle: 'Объединить PDF файлы бесплатно - LocalPDF',
  pageDescription: 'Объединяйте несколько PDF файлов в один документ бесплатно. Быстро и безопасно в браузере. Без загрузок, полная конфиденциальность.',
  
  // Upload zone translations
  uploadTitle: 'Объединить PDF файлы',
  uploadSubtitle: 'Объедините несколько PDF документов в один файл',
  supportedFormats: 'PDF файлы до 100МБ каждый',
  
  // File management
  selectedFiles: 'Выбранные файлы',
  readyToMerge: 'Готов к объединению',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  
  // Processing buttons and states
  buttons: {
    startMerging: 'Объединить {count} файлов 📄',
    merging: 'Объединение файлов...',
    download: 'Скачать объединенный PDF',
    backToTools: 'Назад к инструментам',
    selectMoreFiles: 'Выбрать больше файлов'
  },
  
  // Processing messages
  messages: {
    processing: 'Объединение ваших PDF файлов...',
    progress: 'Обработка файла {current} из {total}',
    success: 'PDF файлы успешно объединены!',
    downloadReady: 'Ваш объединенный PDF готов к скачиванию',
    error: 'Ошибка объединения PDF файлов',
    noFilesSelected: 'Пожалуйста, выберите минимум 2 PDF файла для объединения',
    singleFileWarning: 'Пожалуйста, выберите несколько файлов для объединения'
  },
  
  // ModernMergeTool specific translations
  toolTitle: 'Объединение PDF файлов',
  fileCount: {
    single: 'файл',
    few: 'файла', 
    many: 'файлов'
  },
  processing: 'Объединение файлов...',
  processingTitle: 'Объединение в процессе',
  processingDescription: 'Обработка файлов...',
  orderTitle: 'Порядок файлов',
  orderDescription: 'Используйте стрелки для изменения порядка',
  trustIndicators: {
    private: 'Приватная обработка',
    quality: 'Высокое качество'
  },
  controls: {
    moveUp: 'Переместить вверх',
    moveDown: 'Переместить вниз'
  },
  fileCounter: {
    label: 'файлов',
    scrollHint: '• Прокрутите для просмотра всех файлов'
  },
  actions: {
    merge: 'Объединить {count} {fileWord}',
    merging: 'Обработка...',
    cancel: 'Отменить',
    close: 'Закрыть'
  },
  progress: 'Прогресс',
  
  // Tool-specific content
  howItWorks: {
    title: 'Как работает объединение PDF',
    description: 'Наш инструмент объединения комбинирует несколько PDF документов с сохранением качества и форматирования',
    steps: [
      'Загрузите несколько PDF файлов с вашего устройства',
      'Расположите файлы в нужном порядке',
      'Нажмите объединить, чтобы скомбинировать все документы',
      'Скачайте ваш единый PDF файл'
    ]
  },
  
  // Benefits specific to merge tool
  benefits: {
    title: 'Почему стоит использовать наш объединитель PDF?',
    features: [
      'Сохранение оригинального качества и форматирования',
      'Сохранение метаданных документа и закладок',
      'Без ограничений размера или количества файлов',
      'Мгновенная обработка в вашем браузере'
    ]
  },
  
  // Error handling (consolidated)
  errors: {
    minFiles: 'Выберите минимум 2 файла для объединения',
    processingError: 'Ошибка при обработке файлов',
    unknownError: 'Неизвестная ошибка',
    errorTitle: 'Ошибка обработки',
    invalidFile: 'Неверный формат PDF файла',
    fileTooLarge: 'Размер файла превышает лимит в 100МБ',
    processingFailed: 'Ошибка обработки PDF файла',
    noFilesUploaded: 'Нет файлов для объединения'
  }
};