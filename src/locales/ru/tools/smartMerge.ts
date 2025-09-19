/**
 * Smart Merge AI tool translations for RU language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Merge features
 */

export const smartMerge = {
  // Basic tool properties
  title: 'Умное объединение PDF',
  description: 'Интеллектуальное объединение PDF с рекомендациями на основе ИИ',

  // Page metadata (SEO)
  pageTitle: 'Умное объединение PDF с ИИ - LocalPDF',
  pageDescription: 'Объединяйте PDF интеллектуально с рекомендациями на основе ИИ. Получите оптимальный порядок файлов, прогнозы качества и умные предложения метаданных.',

  // AI Analysis states
  analysis: {
    analyzing: 'Анализ документов...',
    analyzingDescription: 'ИИ анализирует {count} документов для предоставления умных рекомендаций',
    failed: 'Ошибка анализа',
    retry: 'Повторить',
    available: 'Доступен умный анализ',
    availableDescription: 'Добавьте 2 или более PDF файлов для получения рекомендаций на основе ИИ',
    analyzeButton: 'Анализировать документы',
    refreshAnalysis: '🔄 Обновить анализ',
    completed: 'Анализ завершен в {time} • Smart Merge v{version}',
    startMessage: 'Начат умный анализ объединения для {count} файлов',
    completedMessage: 'Умный анализ объединения завершен за {time}мс',
    failedMessage: 'Умный анализ объединения не удался',
    errorPrefix: 'Ошибка умного анализа объединения:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Умные рекомендации объединения',
    confidence: '{percent}% уверенности',
    documentsAnalyzed: 'Проанализировано {count} документов',
    hideDetails: 'Скрыть детали',
    showDetails: 'Показать детали'
  },

  // Prediction metrics
  predictions: {
    processingTime: {
      label: 'Время обработки',
      estimated: '{time}с',
      range: 'диапазон {min}-{max}с'
    },
    resultSize: {
      label: 'Размер результата',
      compression: '{percent}% от исходного'
    },
    quality: {
      label: 'Качество',
      score: 'оценка {score}/100',
      levels: {
        excellent: 'отличное',
        good: 'хорошее',
        acceptable: 'приемлемое',
        poor: 'плохое'
      }
    },
    performance: {
      label: 'Производительность',
      browserLoad: '{percent}% нагрузка браузера',
      memoryUsage: {
        low: 'низкое',
        medium: 'среднее',
        high: 'высокое'
      }
    }
  },

  // Suggested order section
  order: {
    title: 'Рекомендуемый порядок',
    reasoning: 'Порядок оптимизирован на основе содержания и связей документов',
    applyButton: 'Применить предложенный порядок',
    navigationScore: 'Оценка навигации: {score}/100',
    algorithms: {
      'content-based': 'на основе содержания',
      'chronological': 'хронологический',
      'alphabetical': 'алфавитный',
      'size-based': 'по размеру'
    },
    reasoningTexts: {
      contentBased: 'Порядок оптимизирован на основе содержания и связей документов',
      chronological: 'Документы расположены в хронологическом порядке по дате создания',
      alphabetical: 'Документы расположены в алфавитном порядке по имени файла',
      sizeBased: 'Документы расположены по размеру файла для оптимальной обработки'
    }
  },

  // Warning messages
  warnings: {
    sizeMismatch: {
      title: 'Документы имеют разные размеры страниц',
      suggestion: 'Рассмотрите нормализацию размеров или проверьте совместимость документов'
    },
    orientationMismatch: {
      title: 'Документы имеют разную ориентацию (книжная/альбомная)',
      suggestion: 'Смешанная ориентация может повлиять на читаемость объединенного документа'
    },
    qualityVariance: {
      title: 'Значительные различия в качестве между документами',
      suggestion: 'Рассмотрите улучшение качества низкокачественных документов перед объединением'
    },
    largeFile: {
      title: 'Ожидается большой размер объединенного файла',
      suggestion: 'Рассмотрите сжатие документов или обработку меньшими партиями'
    },
    autoFix: 'Автоматически исправить эту проблему'
  },

  // Metadata section
  metadata: {
    title: 'Умные метаданные',
    confidence: '{percent}% уверенности',
    applyButton: 'Применить метаданные',
    fields: {
      title: 'Заголовок',
      subject: 'Тема',
      keywords: 'Ключевые слова',
      author: 'Автор'
    },
    generated: {
      defaultTitle: 'Объединенный документ',
      completeDocument: '{name} - Полный документ',
      mergedCollection: '{name} - Объединенная коллекция',
      subjectCollection: 'Коллекция документов типа {types}',
      subjectDefault: 'Коллекция объединенных PDF документов',
      authorDefault: 'LocalPDF Умное объединение',
      reasoningRelated: 'Сгенерировано на основе {count} документов со связанным содержанием',
      reasoningMixed: 'Сгенерировано на основе {count} документов со смешанным содержанием',
      keywordMerged: 'объединенный',
      keywordCollection: 'коллекция',
      keywordMultiDocument: 'многодокументный',
      keywordDocument: 'документ'
    }
  },

  // Advanced settings
  settings: {
    title: 'Оптимизированные настройки',
    applyButton: 'Применить оптимизированные настройки',
    fields: {
      bookmarks: 'Закладки:',
      quality: 'Качество:',
      pageNumbers: 'Номера страниц:',
      annotations: 'Аннотации:'
    },
    values: {
      preserve: 'Сохранить',
      remove: 'Удалить',
      continuous: 'непрерывная',
      separate: 'раздельная',
      merge: 'объединить',
      qualityBalance: 'баланс',
      qualityPreserveBest: 'сохранить лучшее'
    }
  },

  // Document analysis results
  documentAnalysis: {
    analyzing: 'Анализ документа {current}/{total}: {name}',
    analyzingFailed: 'Не удалось проанализировать {name}',
    fallbackCreated: 'Создан резервный анализ для {name}',
    orientation: {
      portrait: 'книжная',
      landscape: 'альбомная',
      mixed: 'смешанная'
    },
    quality: {
      high: 'высокое',
      medium: 'среднее',
      low: 'низкое'
    },
    type: {
      text: 'текст',
      scanned: 'сканированный',
      mixed: 'смешанный',
      presentation: 'презентация'
    },
    compression: {
      none: 'нет',
      low: 'низкое',
      medium: 'среднее',
      high: 'высокое'
    },
    textDensity: {
      low: 'низкая',
      medium: 'средняя',
      high: 'высокая'
    }
  },

  // Compatibility analysis
  compatibility: {
    pageSizeConsistency: {
      uniform: 'единообразный',
      similar: 'похожий',
      mixed: 'смешанный'
    },
    qualityVariance: {
      low: 'низкая',
      medium: 'средняя',
      high: 'высокая'
    },
    formatConsistency: {
      identical: 'идентичный',
      compatible: 'совместимый',
      problematic: 'проблематичный'
    }
  },

  // Content analysis
  contentAnalysis: {
    documentTypes: {
      contract: 'договор',
      invoice: 'счет',
      report: 'отчет',
      presentation: 'презентация',
      manual: 'руководство',
      form: 'форма'
    },
    relatedDocuments: 'Обнаружены связанные документы',
    duplicateContent: 'Найдено возможное дублирующее содержание'
  },

  // Performance predictions
  performancePredictions: {
    processingStrategy: {
      parallel: 'параллельная',
      sequential: 'последовательная',
      hybrid: 'гибридная'
    },
    recommendations: {
      batchSize: 'Рекомендуемый размер пакета: {size} файлов',
      sequentialProcessing: 'Рекомендуется последовательная обработка для больших файлов',
      hybridProcessing: 'Рекомендуется гибридная обработка',
      parallelProcessing: 'Подходит параллельная обработка'
    }
  },

  // Error messages
  errors: {
    analysisError: 'Ошибка во время умного анализа объединения',
    noFiles: 'Не предоставлены файлы для анализа',
    insufficientFiles: 'Для умного анализа объединения требуется минимум 2 файла',
    processingFailed: 'Умная обработка объединения не удалась',
    unknownError: 'Произошла неизвестная ошибка во время анализа',
    timeoutError: 'Время анализа истекло - попробуйте с меньшим количеством файлов'
  },

  // Success messages
  success: {
    analysisComplete: 'Умный анализ объединения завершен успешно',
    recommendationsApplied: 'Рекомендации применены успешно',
    orderApplied: 'Предложенный порядок применен',
    metadataApplied: 'Умные метаданные применены',
    settingsApplied: 'Оптимизированные настройки применены'
  },

  // Progress indicators
  progress: {
    analyzing: 'Анализ...',
    generatingRecommendations: 'Генерация рекомендаций...',
    calculatingPredictions: 'Расчет прогнозов...',
    optimizingSettings: 'Оптимизация настроек...',
    preparingResults: 'Подготовка результатов...'
  },

  // File size formatting
  fileSize: {
    bytes: 'Б',
    kilobytes: 'КБ',
    megabytes: 'МБ',
    gigabytes: 'ГБ'
  },

  // Trust indicators
  trustIndicators: {
    aiPowered: 'Анализ на основе ИИ',
    privacyFirst: 'Конфиденциальная обработка',
    accuratePredictions: 'Точные прогнозы',
    optimizedResults: 'Оптимизированные результаты'
  }
};