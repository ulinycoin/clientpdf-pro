/**
 * Split PDF tool translations for RU language
 * Contains: page metadata, upload zone, split options, processing messages
 * Complete localization following rotate-pdf methodology
 */

export const split = {
  // Basic properties for tools grid
  title: 'Разделить PDF',
  description: 'Разделить PDF на отдельные страницы или диапазоны',
  
  // Page metadata (SEO)
  pageTitle: 'Разделить PDF файлы бесплатно - LocalPDF',
  pageDescription: 'Разделяйте PDF файлы по страницам или диапазонам бесплатно. Извлекайте определенные страницы из PDF документов. Приватное и безопасное разделение PDF в вашем браузере.',
  
  // Upload section (like rotate had)
  upload: {
    title: 'Разделить PDF файл',
    description: 'Разделите PDF на отдельные страницы',
    supportedFormats: 'PDF файлы до 100МБ',
    selectedFile: 'Выбранный файл',
    readyToSplit: 'Готов к разделению',
    removeFile: 'Удалить файл',
    startSplitting: 'Начать разделение ✂️'
  },
  
  // Upload zone translations (for SplitPDFPage)
  uploadTitle: 'Разделить PDF файл',
  uploadSubtitle: 'Разделите PDF на отдельные страницы', 
  supportedFormats: 'PDF файлы до 100МБ',
  selectedFile: 'Выбранный файл',
  readyToSplit: 'Готов к разделению',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  
  // Results section (comprehensive results handling)
  results: {
    successTitle: 'Разделение PDF завершено!',
    successDescription: 'Создано {count} файлов',
    downloadAllZip: 'Скачать все как ZIP',
    downloadAllZipDescription: 'Скачать {count} файлов как ZIP архив',
    downloadIndividually: 'Скачать по отдельности',
    pageFileName: 'Страница {pageNumber}.pdf',
    rangeFileName: 'Страницы {startPage}-{endPage}.pdf', 
    genericFileName: 'Разделенный файл {index}.pdf',
    fileReady: 'Готов к скачиванию',
    splitAnother: 'Разделить другой PDF'
  },
  
  // Modern tool-specific section (comprehensive like ModernSplitTool)
  tool: {
    toolTitle: 'Инструмент разделения PDF',
    fileNotSelected: 'Файл не выбран',
    fileNotSelectedDescription: 'Пожалуйста, выберите PDF файл для разделения',
    fileSizeUnit: 'МБ',
    
    trustIndicators: {
      private: 'Приватная обработка',
      quality: 'Сохранение качества'
    },
    
    modes: {
      title: 'Способ разделения',
      description: 'Выберите как разделить ваш PDF документ',
      all: {
        title: 'Все страницы',
        description: 'Каждая страница в отдельный PDF файл',
        shortDescription: 'Каждая страница отдельно'
      },
      range: {
        title: 'Диапазон страниц',
        description: 'Извлечь определенный диапазон страниц',
        shortDescription: 'Страницы с {startPage} по {endPage}'
      },
      specific: {
        title: 'Конкретные страницы',
        description: 'Выбрать определенные страницы для извлечения',
        shortDescription: 'Выбранные страницы отдельно'
      }
    },
    
    rangeInputs: {
      title: 'Настройка диапазона',
      description: 'Укажите какие страницы извлечь',
      fromPage: 'С страницы',
      toPage: 'По страницу'
    },
    
    specificInputs: {
      title: 'Конкретные страницы',
      description: 'Введите номера страниц через запятую',
      placeholder: 'Например: 1, 3, 5-7, 10',
      helpText: 'Используйте запятые для разделения и дефисы для диапазонов'
    },
    
    zipOption: {
      title: 'Скачать как ZIP архив',
      description: 'Объединить все файлы в один ZIP архив для удобства'
    },
    
    processingTitle: 'Разделение PDF',
    processingAnalyzing: 'Анализ структуры PDF...',
    processingSplitting: 'Создание отдельных файлов...',
    
    progress: {
      label: 'Прогресс'
    },
    
    buttons: {
      split: 'Разделить PDF',
      processing: 'Разделение...',
      cancel: 'Отменить',
      back: 'Назад',
      close: 'Закрыть'
    },
    
    errors: {
      startPageTooLarge: 'Начальная страница не может быть больше конечной',
      invalidPageNumbers: 'Пожалуйста, введите корректные номера страниц',
      splittingFailed: 'Ошибка разделения: {error}',
      unknownError: 'Произошла неожиданная ошибка',
      processingError: 'Ошибка обработки'
    }
  },
  
  // Legacy compatibility
  buttons: {
    startSplitting: 'Начать разделение',
    splitting: 'Разделение PDF...',
    downloadFiles: 'Скачать разделенные файлы',
    downloadZip: 'Скачать как ZIP',
    backToTools: 'Назад к инструментам'
  },
  
  messages: {
    processing: 'Разделение вашего PDF файла...',
    progress: 'Обработка страницы {current} из {total}',
    success: 'PDF успешно разделен!',
    downloadReady: 'Ваши разделенные файлы готовы к скачиванию',
    error: 'Ошибка разделения PDF файла',
    noFileSelected: 'Пожалуйста, выберите PDF файл для разделения',
    invalidRange: 'Указан неверный диапазон страниц',
    filesCreated: '{count} файлов создано из вашего PDF'
  },
  
  options: {
    title: 'Параметры разделения',
    splitByPages: 'Разделить по страницам',
    splitByRanges: 'Разделить по диапазонам',
    allPages: 'Каждая страница отдельным файлом',
    customRanges: 'Пользовательские диапазоны страниц',
    pageRange: 'Диапазон страниц (например: 1-5, 7, 10-12)',
    rangeHelp: 'Введите диапазоны как: 1-3, 5, 7-10'
  },
  
  howItWorks: {
    title: 'Как работает разделение PDF',
    description: 'Наш инструмент разделения выделяет страницы PDF с сохранением исходного качества и форматирования',
    steps: [
      'Загрузите ваш PDF файл с устройства',
      'Выберите как вы хотите разделить документ',
      'Укажите диапазоны страниц или выберите все страницы',
      'Скачайте отдельные файлы или как ZIP архив'
    ]
  },
  
  errors: {
    invalidFile: 'Неверный формат PDF файла',
    fileTooLarge: 'Размер файла превышает лимит 100МБ',
    processingFailed: 'Ошибка обработки PDF файла',
    invalidPageRange: 'Неверный формат диапазона страниц',
    pageOutOfRange: 'Номер страницы превышает длину документа'
  }
};