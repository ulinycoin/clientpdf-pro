/**
 * Watermark tool translations for RU language
 * Contains: page metadata, upload zone, tool interface, settings, preview, progress
 * Complete localization following rotate-pdf methodology
 */

export const watermark = {
  // Basic properties for tools grid
  title: 'Добавить водяной знак',
  description: 'Добавить текстовые водяные знаки для защиты документов',
  
  // Page metadata (SEO)
  pageTitle: 'Добавить водяной знак в PDF бесплатно - LocalPDF',
  pageDescription: 'Добавляйте водяные знаки в PDF файлы для защиты. Бесплатный инструмент водяных знаков с приватностью.',
  
  // Upload section (for WatermarkPDFPage)
  upload: {
    title: 'Добавить водяной знак',
    description: 'Защитите ваши документы пользовательскими водяными знаками',
    supportedFormats: 'PDF файлы до 100МБ',
    selectedFile: 'Выбранный файл',
    readyToWatermark: 'Готов к добавлению водяного знака',
    removeFile: 'Удалить файл',
    startWatermarking: 'Добавить водяной знак 💧'
  },

  // Results section (for completion state)
  results: {
    successTitle: 'Водяной знак добавлен успешно!',
    successDescription: 'Ваш PDF защищён водяным знаком',
    downloadTitle: 'Скачать защищённый файл',
    readyToDownload: 'Готов к скачиванию',
    addAnotherWatermark: 'Добавить водяной знак в другой PDF'
  },
  
  // Main WatermarkTool interface
  tool: {
    toolTitle: 'Инструмент водяных знаков',
    toolDescription: 'Настройте и добавьте водяной знак в ваш PDF документ',
    fileSizeUnit: 'МБ',
    
    fileInfo: {
      pdfPreview: 'Предварительный просмотр PDF'
    },
    
    preview: {
      title: 'Предварительный просмотр',
      enterTextPrompt: 'Введите текст водяного знака',
      pageLabel: 'Страница 1',
      livePreviewDescription: 'Превью показывает примерное расположение водяного знака',
      previewWillAppear: 'Предварительный просмотр появится после ввода текста'
    },
    
    settings: {
      title: 'Настройки водяного знака',
      
      watermarkText: {
        label: 'Текст водяного знака',
        placeholder: 'Введите текст водяного знака...',
        charactersRemaining: 'символов осталось'
      },
      
      fontFamily: {
        label: 'Семейство шрифтов'
      },
      
      fontSize: {
        label: 'Размер шрифта',
        rangeLabels: {
          small: 'Маленький',
          large: 'Большой'
        }
      },
      
      opacity: {
        label: 'Прозрачность',
        rangeLabels: {
          transparent: 'Прозрачный',
          opaque: 'Непрозрачный'
        }
      },
      
      rotation: {
        label: 'Поворот'
      },
      
      position: {
        label: 'Позиция',
        positions: {
          center: 'По центру',
          topLeft: 'Верх слева',
          topRight: 'Верх справа',
          bottomLeft: 'Низ слева',
          bottomRight: 'Низ справа'
        }
      },
      
      textColor: {
        label: 'Цвет текста',
        colors: {
          gray: 'Серый',
          red: 'Красный',
          blue: 'Синий',
          green: 'Зелёный',
          black: 'Чёрный',
          orange: 'Оранжевый'
        }
      },
      
      fontRecommendation: {
        title: 'Рекомендация по шрифту',
        supportsCyrillic: '(поддерживает кириллицу)'
      },
      
      fontSupport: {
        supported: 'Выбранный шрифт поддерживает ваш текст',
        mayNotSupport: 'Шрифт может не полностью поддерживать введённые символы'
      }
    },
    
    progress: {
      addingWatermark: 'Добавление водяного знака',
      completed: 'завершено'
    },
    
    error: {
      title: 'Ошибка'
    },
    
    privacy: {
      title: 'Защита конфиденциальности',
      description: 'Ваши файлы обрабатываются локально в браузере. Никакие данные не отправляются на серверы.'
    },
    
    success: {
      title: 'Водяной знак добавлен успешно!',
      description: 'Ваш PDF документ теперь защищён водяным знаком',
      downloadAgain: 'Скачать ещё раз'
    },
    
    actions: {
      addWatermark: 'Добавить водяной знак',
      adding: 'Добавление...',
      cancel: 'Отменить',
      processAnother: 'Обработать другой файл'
    },
    
    fileErrors: {
      noFileSelected: 'Пожалуйста, выберите PDF файл для добавления водяного знака'
    }
  },
  
  // Legacy compatibility
  uploadTitle: 'Добавить водяной знак в PDF',
  uploadSubtitle: 'Защитите ваши документы пользовательскими водяными знаками',
  supportedFormats: 'PDF файлы до 100МБ',
  selectedFile: 'Выбранный файл',
  readyToWatermark: 'Готов к добавлению водяного знака',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  
  buttons: {
    startWatermarking: 'Добавить водяной знак 💧',
    processing: 'Добавление водяного знака...',
    download: 'Скачать PDF с водяным знаком',
    backToTools: 'Назад к инструментам'
  },
  
  messages: {
    processing: 'Добавление водяного знака в ваш PDF...',
    success: 'Водяной знак успешно добавлен!',
    downloadReady: 'Ваш PDF с водяным знаком готов',
    error: 'Ошибка добавления водяного знака в PDF',
    noFileSelected: 'Пожалуйста, выберите PDF файл'
  },
  
  errors: {
    invalidFile: 'Неверный формат PDF файла',
    fileTooLarge: 'Размер файла превышает лимит 100МБ',
    processingFailed: 'Ошибка добавления водяного знака в PDF'
  }
};