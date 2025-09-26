/**
 * Smart Compression AI tool translations for RU language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Compression features
 */

export const smartCompression = {
  // Basic tool properties
  title: 'Умное сжатие PDF',
  description: 'Интеллектуальное сжатие PDF с рекомендациями на основе ИИ',

  // Page metadata (SEO)
  pageTitle: 'Умное сжатие PDF с ИИ - LocalPDF',
  pageDescription: 'Сжимайте PDF интеллектуально с рекомендациями на основе ИИ. Получайте оптимальные настройки сжатия, прогнозы размера и качества.',

  // AI Analysis states
  analysis: {
    analyzing: 'Анализ документа...',
    analyzingDescription: 'ИИ анализирует {count} документ(ов) для предоставления умных рекомендаций по сжатию',
    failed: 'Анализ не удался',
    retry: 'Повторить',
    available: 'Доступен умный анализ',
    availableDescription: 'Загрузите PDF файл, чтобы получить рекомендации по сжатию на основе ИИ',
    analyzeButton: 'Анализировать документ',
    refreshAnalysis: '🔄 Обновить анализ',
    completed: 'Анализ завершен в {time} • Умное сжатие v{version}',
    startMessage: 'Анализ умного сжатия начат для {count} файл(ов)',
    completedMessage: 'Анализ умного сжатия завершен за {time}мс',
    failedMessage: 'Анализ умного сжатия не удался',
    errorPrefix: 'Анализ умного сжатия не удался:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Рекомендации умного сжатия',
    confidence: '{percent}% уверенность',
    potential: '{percent}% потенциал сжатия',
    hideDetails: 'Скрыть детали',
    showDetails: 'Показать детали',
    strategies: {
      conservative: 'Минимизировать потерю качества с умеренным сжатием',
      balanced: 'Баланс между уменьшением размера и сохранением качества',
      aggressive: 'Максимальное сжатие с приемлемыми компромиссами качества'
    },
    reasoning: {
      qualityFirst: 'Подход с приоритетом качества рекомендован для сохранения целостности документа',
      balanced: 'Сбалансированный подход обеспечивает хорошее сжатие с минимальной потерей качества',
      sizeFirst: 'Подход с приоритетом размера максимизирует сжатие для эффективности хранения'
    }
  },

  // Prediction metrics
  predictions: {
    sizeReduction: {
      label: 'Уменьшение размера',
      estimated: 'Новый размер: {size}'
    },
    processingTime: {
      label: 'Время обработки',
      range: 'диапазон {min}-{max}с'
    },
    quality: {
      label: 'Прогноз качества',
      impact: '{percent}% влияние на качество',
      levels: {
        excellent: 'отличное',
        good: 'хорошее',
        acceptable: 'приемлемое',
        degraded: 'ухудшенное',
        poor: 'плохое'
      },
      risks: {
        imageQuality: 'Качество изображений может быть снижено',
        downsampling: 'Разрешение изображений будет понижено',
        fonts: 'Рендеринг шрифтов может быть затронут'
      }
    },
    performance: {
      label: 'Производительность',
      cpuIntensive: 'Нагрузка на ЦП: {intensive}',
      memoryUsage: {
        low: 'малая память',
        medium: 'средняя память',
        high: 'большая память'
      }
    }
  },

  // Compression strategy section
  strategy: {
    title: 'Рекомендуемая стратегия',
    applyButton: 'Применить стратегию',
    expectedSavings: 'Ожидаемая экономия: {savings}',
    levels: {
      conservative: 'консервативный',
      balanced: 'сбалансированный',
      aggressive: 'агрессивный'
    }
  },

  // Compression presets
  presets: {
    title: 'Пресеты сжатия',
    names: {
      'web-optimized': 'Для веб',
      'print-quality': 'Для печати',
      'maximum-compression': 'Максимальное сжатие'
    },
    descriptions: {
      'web-optimized': 'Быстрая загрузка для веб-просмотра',
      'print-quality': 'Высокое качество для печати',
      'maximum-compression': 'Наименьший размер файла'
    },
    qualityImpact: {
      minimal: 'Минимальное',
      low: 'Низкое',
      medium: 'Среднее',
      high: 'Высокое'
    }
  },

  // Content analysis details
  contentAnalysis: {
    title: 'Анализ содержимого',
    text: 'Текстовый контент',
    images: 'Изображения',
    vectors: 'Векторная графика',
    quality: 'Текущее качество',
    complexity: 'Сложность страниц',
    currentCompression: 'Текущее сжатие',
    embeddedFonts: 'Встроенные шрифты',
    qualityLevels: {
      high: 'высокое',
      medium: 'среднее',
      low: 'низкое'
    },
    complexityLevels: {
      simple: 'простая',
      moderate: 'умеренная',
      complex: 'сложная'
    },
    compressionLevels: {
      none: 'отсутствует',
      low: 'низкое',
      medium: 'среднее',
      high: 'высокое'
    }
  },

  // Warning messages
  warnings: {
    qualityLoss: {
      title: 'Обнаружена потенциальная потеря качества',
      suggestion: 'Рассмотрите использование более консервативного уровня сжатия для сохранения качества изображений'
    },
    largeFile: {
      title: 'Большой файл - обработка может занять больше времени',
      suggestion: 'Рассмотрите разбиение на меньшие разделы или снижение уровня сжатия'
    },
    fonts: {
      title: 'Будет применена оптимизация шрифтов',
      suggestion: 'Встроенные шрифты будут оптимизированы. Проверьте рендеринг текста после сжатия'
    },
    metadata: {
      title: 'Метаданные документа будут удалены',
      suggestion: 'Автор, заголовок и другие метаданные будут удалены для уменьшения размера файла'
    },
    impact: {
      low: 'Низкое влияние',
      medium: 'Среднее влияние',
      high: 'Высокое влияние'
    },
    affectedAreas: 'Затронутые области',
    autoFix: 'Доступно автоисправление'
  },

  // Error messages
  errors: {
    analysisError: 'Не удалось проанализировать документ для сжатия',
    unknownError: 'Произошла неизвестная ошибка',
    invalidFile: 'Недопустимый или поврежденный PDF файл',
    fileTooLarge: 'Файл слишком большой для анализа',
    processingFailed: 'Обработка сжатия не удалась'
  }
};