export const ocr = {
  title: 'OCR PDF',
  aiTitle: 'ИИ-улучшенный OCR',
  description: 'Извлечение текста из сканированных PDF документов',
  pageTitle: 'OCR PDF бесплатно - LocalPDF',
  pageDescription: 'Извлекайте текст из сканированных PDF документов с помощью OCR технологии. Бесплатный OCR инструмент для PDF.',
  uploadTitle: 'OCR документ',
  uploadSubtitle: 'Извлечение текста из PDF и изображений',
  supportedFormats: 'PDF и изображения до 50МБ',
  buttons: {
    startOCR: 'Запустить OCR 🔍',
    processing: 'Выполнение OCR...',
    download: 'Скачать текстовый файл',
    extractText: 'Извлечь текст с помощью OCR',
    downloadText: 'Скачать текст',
    downloadPdf: 'Скачать PDF',
    downloadDocx: 'Скачать Word',
    downloadRtf: 'Скачать RTF',
    downloadJson: 'Данные JSON',
    downloadMarkdown: 'Markdown',
    downloadFile: 'Скачать',
    downloadFormat: 'Выберите формат скачивания',
    processAnother: 'Обработать еще раз',
    editText: 'Редактировать текст'
  },
  messages: {
    processing: 'Выполнение OCR вашего PDF...',
    success: 'OCR выполнен успешно!',
    error: 'Ошибка выполнения OCR'
  },
  settings: {
    title: 'Настройки OCR',
    language: 'Язык OCR',
    languageDescription: 'Выберите основной язык документа для лучшей точности',
    outputFormat: 'Формат вывода',
    plainText: 'Обычный текст (.txt)',
    plainTextDesc: 'Только извлечение текста',
    searchablePdf: 'Поисковый PDF',
    searchablePdfDesc: 'PDF с поисковым текстовым слоем',
    advancedOptions: 'Дополнительные настройки',
    preserveLayout: 'Сохранить макет',
    preserveLayoutDesc: 'Сохранить структуру документа',
    imagePreprocessing: 'Предобработка изображения',
    imagePreprocessingDesc: 'Улучшить качество изображения'
  },
  fileInfo: {
    title: 'Информация о файле',
    name: 'Имя',
    size: 'Размер',
    supported: 'Формат файла поддерживается',
    unsupported: 'Неподдерживаемый формат файла'
  },
  results: {
    title: 'Сводка результатов',
    processingTime: 'Время обработки',
    confidence: 'Уверенность',
    wordsFound: 'Найдено слов',
    successTitle: 'OCR выполнен успешно!',
    successDescription: 'Текст извлечен из вашего документа',
    downloadTitle: 'Скачать результаты',
    readyToDownload: 'Готов к скачиванию',
    rotateAnother: 'Обработать другой документ'
  },
  upload: {
    title: 'OCR документ',
    description: 'Извлечение текста из PDF и изображений',
    supportedFormats: 'PDF и изображения до 50МБ',
    selectedFile: 'Файл выбран для OCR',
    readyToProcess: 'Готов извлечь текст из вашего документа',
    removeFile: 'Удалить файл',
    startProcessing: 'Начать обработку OCR'
  },
  fileNotSelected: 'Файл не выбран',
  fileNotSelectedDescription: 'Пожалуйста, выберите файл для обработки с помощью OCR.',
  trustIndicators: {
    private: 'Приватно и безопасно',
    quality: 'Высококачественный OCR'
  },
  editor: {
    title: 'Редактор текста',
    stats: {
      confidence: 'Точность',
      words: 'слов',
      lines: 'строк',
      characters: 'символов',
      modified: 'Изменено'
    },
    editMode: 'Редактировать',
    viewMode: 'Просмотр',
    showPreview: 'Предпросмотр',
    hidePreview: 'Скрыть предпросмотр',
    preview: 'Предпросмотр',
    placeholder: 'Начните редактировать извлеченный текст...',
    noText: 'Нет текстового содержимого',
    undo: 'Отменить',
    redo: 'Повторить',
    copy: 'Копировать',
    save: 'Сохранить',
    saved: 'Сохранено',
    saveChanges: 'Сохранить изменения',
    allSaved: 'Всё сохранено',
    unsavedChanges: 'Несохраненные изменения',
    changesSaved: 'Сохранено',
    downloadTxt: 'Скачать .txt',
    downloadPdf: 'Скачать PDF'
  },
  ai: {
    strategies: {
      fast: {
        title: 'Быстрый режим',
        description: 'Быстрое распознавание с базовыми настройками',
        reasoning: 'Лучше всего для качественных документов с четким текстом',
        reasoningNeeded: 'Подходит для документов с отличным качеством'
      },
      balanced: {
        title: 'Сбалансированный режим',
        description: 'Хороший баланс скорости и точности',
        reasoning: 'Универсальный режим для большинства документов'
      },
      accurate: {
        title: 'Режим высокой точности',
        description: 'Максимальная точность с полной предобработкой',
        reasoning: 'Лучше всего для критичных документов',
        reasoningNeeded: 'Рекомендуется для документов низкого качества'
      },
      multilang: {
        title: 'Мультиязычный режим',
        description: 'Оптимизировано для документов на нескольких языках',
        reasoning: 'Документ содержит несколько языков'
      }
    },
    pros: {
      fast: 'Самая быстрая обработка',
      goodForClear: 'Подходит для четких документов',
      balanced: 'Хороший баланс точности и скорости',
      preprocessing: 'Включает предобработку',
      multiLang: 'Поддержка 2 языков',
      multiLang3: 'До 3 языков',
      highAccuracy: 'Высочайшая точность',
      fullPreprocessing: 'Полная предобработка',
      goodAccuracy: 'Хорошая точность'
    },
    cons: {
      lowerAccuracy: 'Ниже точность при плохом качестве',
      singleLanguage: 'Только один язык',
      mediumSpeed: 'Средняя скорость обработки',
      slowest: 'Самая медленная обработка',
      highCPU: 'Высокая нагрузка на ЦП',
      slowerProcessing: 'Медленнее быстрого режима',
      moreMemory: 'Использует больше памяти'
    },
    warnings: {
      lowClarity: {
        message: 'Обнаружена низкая четкость изображения',
        suggestion: 'Используйте режим высокой точности для лучших результатов'
      },
      noise: {
        message: 'Обнаружен шум на изображении',
        suggestion: 'Предобработка улучшит точность'
      },
      columns: {
        message: 'Обнаружена многоколоночная компоновка',
        suggestion: 'Включите сохранение макета'
      }
    }
  }
};