export const rotate = {
  // Basic properties for tools grid
  title: 'Повернуть страницы',
  description: 'Повернуть страницы на 90, 180 или 270 градусов',
  
  // Page metadata (SEO)
  pageTitle: 'Повернуть PDF страницы бесплатно - LocalPDF',
  pageDescription: 'Поворачивайте PDF страницы на 90°, 180° или 270°. Быстрый и безопасный поворот PDF в браузере. 100% приватно.',
  
  // Upload zone translations
  uploadTitle: 'Повернуть PDF страницы',
  uploadSubtitle: 'Поворот страниц в правильную ориентацию',
  supportedFormats: 'PDF файлы до 100МБ',
  
  // Upload section - for selected files and actions
  upload: {
    title: 'Повернуть PDF страницы',
    description: 'Поворот страниц в правильную ориентацию',
    supportedFormats: 'PDF файлы до 100МБ',
    selectedFile: 'Выбранный файл ({count})',
    readyToRotate: 'Готов к повороту',
    removeFile: 'Удалить файл',
    startRotating: 'Повернуть страницы 🔄'
  },
  
  // Results section - for completed operations  
  results: {
    successTitle: 'Страницы успешно повернуты!',
    successDescription: 'Ваш PDF файл готов к скачиванию',
    downloadTitle: 'Скачать повернутый PDF',
    rotateAnother: 'Повернуть другой файл',
    fileSizeReduced: 'Файл готов'
  },
  
  // Legacy structure for backwards compatibility
  selectedFile: 'Выбранный файл',
  readyToRotate: 'Готов к повороту',
  removeFile: 'Удалить файл',
  fileSizeUnit: 'МБ',
  
  buttons: {
    startRotating: 'Повернуть страницы 🔄',
    processing: 'Поворот страниц...',
    download: 'Скачать повернутый PDF'
  },
  
  messages: {
    processing: 'Поворот ваших PDF страниц...',
    success: 'Страницы успешно повернуты!',
    error: 'Ошибка поворота PDF страниц'
  },

  // ModernRotateTool translations
  tool: {
    fileSizeUnit: 'МБ',
    pageCount: '{count} страниц',
    fileNotSelected: 'Файл не выбран',
    fileNotSelectedDescription: 'Пожалуйста, выберите PDF файл для поворота',
    toolTitle: 'Повернуть PDF страницы',
    
    trustIndicators: {
      private: 'Приватная обработка',
      quality: 'Высокое качество'
    },
    
    rotationAngle: {
      title: 'Выберите угол поворота',
      description: 'Выберите на сколько градусов повернуть страницы'
    },
    
    rotationOptions: {
      clockwise: {
        label: '90° по часовой стрелке',
        description: 'Поворот на 90 градусов по часовой стрелке'
      },
      flip: {
        label: '180° переворот',
        description: 'Переворот на 180 градусов'
      },
      counterclockwise: {
        label: '270° против часовой стрелки',
        description: 'Поворот на 270 градусов против часовой стрелки'
      }
    },
    
    pageSelection: {
      title: 'Выбор страниц',
      description: 'Выберите какие страницы повернуть',
      allPages: {
        label: 'Все страницы',
        description: 'Повернуть все страницы документа',
        descriptionWithCount: 'Повернуть все {count} страниц'
      },
      specificPages: {
        label: 'Определенные страницы',
        description: 'Выберите определенные страницы для поворота'
      }
    },
    
    specificPages: {
      inputLabel: 'Номера страниц',
      placeholder: 'например: 1, 3, 5-8',
      helpText: 'Введите номера страниц через запятую или диапазоны через дефис'
    },
    
    pageOverview: {
      title: 'Обзор страниц',
      description: 'Предварительный просмотр ориентации страниц в документе',
      pageTooltip: 'Страница {pageNumber}: {orientation}',
      portrait: 'портретная',
      landscape: 'альбомная',
      portraitOrientation: 'Портретные страницы',
      landscapeOrientation: 'Альбомные страницы'
    },
    
    processing: {
      title: 'Поворот страниц...',
      analyzing: 'Анализ документа...',
      rotating: 'Поворот страниц...'
    },
    
    errors: {
      invalidPageNumbers: 'Неверные номера страниц',
      rotationFailed: 'Ошибка поворота',
      unknownError: 'Неизвестная ошибка',
      processingError: 'Ошибка обработки'
    },
    
    infoBox: {
      title: 'Полезная информация',
      description: 'PDF страницы будут повернуты с сохранением качества и всех элементов документа.'
    },
    
    buttons: {
      rotate: 'Повернуть на {degrees}°',
      processing: 'Обработка...'
    }
  }
};