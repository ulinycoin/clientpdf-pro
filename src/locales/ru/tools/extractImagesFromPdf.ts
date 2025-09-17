/**
 * Extract Images from PDF tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, options, progress, results
 * Complete localization following established methodology
 */

export const extractImagesFromPdf = {
  // Basic properties for tools grid
  title: 'Извлечь изображения',
  description: 'Извлечь все изображения из PDF-документов в оригинальном качестве',
  
  // Page metadata (SEO)
  pageTitle: 'Извлечь изображения из PDF бесплатно - LocalPDF',
  pageDescription: 'Извлекайте все изображения из PDF-файлов бесплатно. Скачивайте изображения в оригинальном качестве с пакетным выбором и опциями фильтрации.',
  
  // Upload section (for ExtractImagesFromPDFPage)
  upload: {
    title: 'Извлечь изображения из PDF',
    subtitle: 'Извлечь все встроенные изображения из PDF-документов с расширенными опциями фильтрации',
    supportedFormats: 'PDF-файлы до 100МБ',
    dragAndDrop: 'Перетащите PDF-файл сюда или нажмите для выбора'
  },
  
  // Main ExtractImagesFromPdfTool interface
  uploadPrompt: 'Перетащите PDF-файл сюда или нажмите для выбора',
  uploadSubtitle: 'Извлечь все изображения из вашего PDF-документа',
  
  // Settings section
  settings: {
    pageSelection: 'Выбор страниц',
    allPages: 'Все страницы',
    specificPages: 'Определённые страницы',
    pageRange: 'Диапазон страниц',
    minSize: 'Минимальный размер изображения',
    minSizeDescription: 'Извлекать только изображения больше указанного размера (пиксели)',
    outputFormat: 'Формат вывода',
    original: 'Сохранить оригинальный формат',
    png: 'Конвертировать в PNG',
    jpeg: 'Конвертировать в JPEG',
    jpegQuality: 'Качество JPEG',
    deduplicateImages: 'Удалить дублированные изображения',
    includeVectorImages: 'Включить векторные изображения'
  },
  
  // Progress section
  progress: {
    preparing: 'Загрузка PDF-документа...',
    extracting: 'Извлечение изображений со страницы {current} из {total}...',
    processing: 'Обработка и фильтрация изображений...',
    finalizing: 'Завершение извлечения...',
    complete: 'Извлечение завершено!'
  },
  
  // Results section
  results: {
    imagesFound: 'изображений найдено',
    totalSize: 'Общий размер',
    selectedCount: 'выбрано {selected} из {total}',
    selectAll: 'Выбрать всё',
    deselectAll: 'Отменить выбор',
    downloadSelected: 'Скачать выбранные',
    downloadAll: 'Скачать всё как ZIP',
    imageInfo: 'Страница {pageNumber} • {width}×{height} • {size} • {format}',
    duplicatesRemoved: '{count} дубликатов удалено',
    gridView: 'Вид сеткой',
    listView: 'Вид списком'
  },
  
  // Success messages
  success: {
    title: 'Изображения успешно извлечены!',
    description: 'Найдено {count} изображений общим размером {size} МБ',
    extractedInfo: 'Извлечено {count} изображений с {pages} страниц'
  },
  
  // Error handling
  errors: {
    noImages: 'В этом PDF не найдено изображений',
    noImagesDescription: 'Этот PDF не содержит извлекаемых изображений, соответствующих вашим критериям.',
    extractionFailed: 'Не удалось извлечь изображения',
    loadingFailed: 'Не удалось загрузить PDF-документ',
    noFileSelected: 'Пожалуйста, выберите PDF-файл для извлечения изображений',
    processingError: 'Произошла ошибка при обработке PDF'
  },
  
  // Buttons
  buttons: {
    extractImages: 'Извлечь изображения',
    extracting: 'Извлечение изображений...',
    extractAnother: 'Извлечь из другого PDF',
    tryAgain: 'Попробовать другой файл',
    showSettings: 'Показать настройки',
    hideSettings: 'Скрыть настройки'
  },
  
  // Quick steps for StandardToolPageTemplate
  quickSteps: {
    step1: {
      title: 'Загрузить PDF',
      description: 'Выберите или перетащите PDF-файл для начала извлечения изображений'
    },
    step2: {
      title: 'Настроить параметры',
      description: 'Установите минимальный размер изображения, формат вывода и другие настройки извлечения'
    },
    step3: {
      title: 'Скачать изображения',
      description: 'Просмотрите, выберите и скачайте извлечённые изображения по отдельности или как ZIP'
    }
  },
  
  // Benefits for StandardToolPageTemplate
  benefits: {
    privacy: {
      title: 'Полная конфиденциальность',
      description: 'Вся обработка происходит локально в вашем браузере. Никакие файлы не загружаются на серверы.'
    },
    quality: {
      title: 'Оригинальное качество',
      description: 'Извлекайте изображения в их оригинальном разрешении и формате без потери качества.'
    },
    formats: {
      title: 'Множество форматов',
      description: 'Поддержка JPEG, PNG и других форматов изображений с опциями конвертации.'
    },
    batch: {
      title: 'Пакетные операции',
      description: 'Выберите несколько изображений и скачайте их как удобный ZIP-архив.'
    }
  },
  
  // Legacy compatibility for existing components
  fileSelected: 'Файл выбран',
  readyToExtract: 'Готов к извлечению изображений',
  removeFile: 'Удалить файл',
  backToTools: 'Назад к инструментам',
  processing: 'Извлечение изображений из вашего PDF...',
  downloadReady: 'Ваши изображения готовы к скачиванию'
};