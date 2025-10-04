/**
 * Compress PDF tool translations for RU language
 * Contains: page metadata, upload zone, compression options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const compress = {
  // Basic properties for tools grid
  title: 'Сжать PDF',
  description: 'Уменьшить размер PDF-файла без потери качества',
  
  // Page metadata (SEO)
  pageTitle: 'Сжать PDF файлы бесплатно - LocalPDF',
  pageDescription: 'Уменьшите размер PDF файла без потери качества. Бесплатный инструмент сжатия PDF с защитой конфиденциальности. Умные алгоритмы сжатия.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'Сжать PDF файл',
    description: 'Уменьшите размер файла с сохранением качества',
    supportedFormats: 'PDF файлы до 100МБ',
    selectedFile: 'Выбранный файл',
    readyToCompress: 'Готов к сжатию',
    removeFile: 'Удалить файл',
    compressPdfFile: 'Сжать PDF файл 🗜️'
  },
  
  // Upload zone translations (for CompressPDFPage)
  uploadTitle: 'Сжать PDF файл',
  uploadSubtitle: 'Уменьшите размер файла с сохранением качества', 
  supportedFormats: 'PDF файлы до 100МБ',
  selectedFile: 'Выбранный файл',
  readyToCompress: 'Готов к сжатию',
  removeFile: 'Удалить файл',
  compressPdfFile: 'Сжать PDF файл 🗜️',
  fileSizeUnit: 'МБ',

  // Умные ИИ рекомендации
  smartRecommendations: {
    title: 'Умные ИИ рекомендации',
    description: 'Получите рекомендации по оптимизации на основе ИИ для лучших результатов сжатия'
  },
  
  // Results section (like rotate had)
  results: {
    successTitle: 'Сжатие PDF завершено!',
    downloadCompressed: 'Скачать сжатый PDF',
    download: 'Скачать',
    compressAnother: 'Сжать другой PDF',
    sizeReduced: 'Размер уменьшен с',
    to: 'до',
    readyForDownload: 'Ваш сжатый PDF готов к скачиванию'
  },
  
  // Modern tool-specific section (comprehensive like rotate.tool)
  toolTitle: 'Инструмент сжатия PDF',
  noFileTitle: 'Файл не выбран',
  noFileMessage: 'Пожалуйста, выберите PDF файл для сжатия',
  backButton: 'Назад',
  closeButton: 'Закрыть',
  currentSize: 'Текущий размер',
  estimatedSavings: 'ожидаемая экономия',
  forecastedSaving: 'оценка основана на анализе файла',
  
  trustIndicators: {
    privateProcessing: 'Приватная обработка',
    intelligentCompression: 'Интеллектуальное сжатие'
  },
  
  qualitySettings: {
    title: 'Настройки качества',
    subtitle: 'Выберите правильный баланс между качеством и размером файла',
    qualityLevel: 'Уровень качества',
    smallerSize: 'Меньший размер',
    betterQuality: 'Лучшее качество',
    qualityLabels: {
      maxCompression: 'Максимальное сжатие',
      highCompression: 'Высокое сжатие',
      mediumCompression: 'Среднее сжатие', 
      optimal: 'Оптимальное',
      highQuality: 'Высокое качество'
    }
  },
  
  previewCards: {
    maxCompression: {
      title: 'Максимальное сжатие',
      subtitle: 'Наименьший размер файла'
    },
    optimal: {
      title: 'Оптимальный баланс',
      subtitle: 'Лучшее соотношение качества и размера'
    },
    highQuality: {
      title: 'Высокое качество',
      subtitle: 'Наилучшее визуальное качество'
    }
  },
  
  advancedSettings: {
    title: 'Расширенные настройки',
    subtitle: 'Точная настройка параметров сжатия',
    compressImages: {
      title: 'Сжать изображения',
      description: 'Оптимизировать изображения для уменьшения размера файла'
    },
    removeMetadata: {
      title: 'Удалить метаданные',
      description: 'Удалить свойства документа и комментарии'
    },
    optimizeForWeb: {
      title: 'Оптимизировать для веб',
      description: 'Подготовить PDF для быстрого просмотра онлайн'
    }
  },
  
  processing: {
    title: 'Сжатие вашего PDF',
    startingMessage: 'Запуск процесса сжатия...',
    defaultMessage: 'Обработка вашего PDF файла...',
    progressLabel: 'Прогресс'
  },
  
  errors: {
    selectFile: 'Пожалуйста, выберите PDF файл для сжатия',
    compressionError: 'Не удалось сжать PDF файл',
    unknownError: 'Произошла неожиданная ошибка',
    processingError: 'Ошибка обработки'
  },
  
  infoBox: {
    title: 'Как это работает',
    description: 'Наши умные алгоритмы сжатия анализируют ваш PDF и применяют оптимальные настройки для уменьшения размера файла, сохраняя при этом визуальное качество. Ваши файлы обрабатываются локально для максимальной конфиденциальности.'
  },
  
  actions: {
    compress: 'Сжать PDF',
    compressing: 'Сжатие...',
    cancel: 'Отменить',
    back: 'Назад'
  },
  
  // Legacy compatibility keys (for old CompressionTool)
  starting: 'Запуск процесса сжатия...',
  failed: 'Не удалось сжать PDF файл',
  fileToCompress: 'Файл для сжатия',
  smaller: 'меньше',
  estimated: 'примерно',
  settings: {
    title: 'Настройки сжатия',
    qualityLevel: 'Уровень качества',
    smallerFile: 'Меньший файл',
    betterQuality: 'Лучшее качество',
    compressImages: 'Сжать изображения',
    removeMetadata: 'Удалить метаданные',
    optimizeForWeb: 'Оптимизировать для веб'
  },
  howItWorks: 'Как это работает',
  howItWorksDescription: 'Умные алгоритмы уменьшают размер файла путем оптимизации изображений, шрифтов и удаления ненужных данных',
  compressing: 'Сжатие PDF...',
  
  // Additional results keys used by CompressPDFPage
  successTitle: 'Сжатие PDF завершено!',
  downloadCompressed: 'Скачать сжатый PDF',
  download: 'Скачать',
  compressAnother: 'Сжать другой PDF',
  sizeReduced: 'Размер уменьшен с',
  to: 'до',
  readyForDownload: 'Ваш сжатый PDF готов к скачиванию',

  // Detailed unique content for this tool
  detailed: {
    title: 'Почему выбрать наш компрессор PDF?',
    functionality: {
      title: 'Умные алгоритмы сжатия',
      description1: 'Наш компрессор PDF использует интеллектуальные алгоритмы для анализа вашего документа и применения оптимальных методов сжатия. В отличие от базовых инструментов, которые просто уменьшают качество изображений, наша система интеллектуально обрабатывает изображения, шрифты и встроенные объекты, сохраняя визуальную точность. Передовые методы оптимизации включают downsampling изображений, подмножества шрифтов и сжатие потоков контента.',
      description2: 'Движок сжатия поддерживает множество уровней качества от максимального сжатия (минимальный размер) до высокого качества (минимальные визуальные изменения). Выберите оптимальный баланс для веб-просмотра, высокое сжатие для email-вложений или максимальное качество для печати. Вся обработка происходит в вашем браузере с использованием современных JavaScript библиотек сжатия, обеспечивая быстрое, безопасное и приватное сжатие.'
    },
    capabilities: {
      title: 'Продвинутое уменьшение размера файлов',
      description1: 'Уменьшайте размер PDF файлов на 40-90% в зависимости от типа контента и настроек качества. Инструмент автоматически определяет PDF с большим количеством изображений и применяет соответствующие стратегии сжатия. Удаляйте ненужные метаданные, оптимизируйте встроенные шрифты и сжимайте изображения высокого разрешения, сохраняя читаемость документа и профессиональный вид.',
      description2: 'Обрабатывайте большие PDF до 100МБ с отслеживанием прогресса в реальном времени и оценкой коэффициентов сжатия. Идеально для уменьшения email-вложений, ускорения загрузки с веб-сайтов, экономии места в облачном хранилище и улучшения рабочих процессов обмена документами. Всё сжатие без потерь, где возможно, с контролируемым сжатием с потерями для изображений на основе ваших предпочтений качества.'
    }
  }
};