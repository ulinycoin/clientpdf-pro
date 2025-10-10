export const edit = {
  // Basic properties for tools grid
  title: 'Редактировать PDF',
  description: 'Универсальный редактор PDF со страницами, аннотациями и инструментами дизайна',

  // Page metadata (SEO)
  pageTitle: 'Редактировать PDF - Универсальный редактор PDF - LocalPDF',
  pageDescription: 'Редактируйте PDF документы с мощными инструментами: управление страницами, добавление аннотаций, водяные знаки и многое другое. 100% конфиденциально и бесплатно.',

  // Upload zone
  uploadTitle: 'Редактировать PDF',
  uploadSubtitle: 'Загрузите ваш PDF для начала редактирования',
  supportedFormats: 'PDF файлы до 100MB',

  // Features
  features: {
    title: 'Что вы можете сделать',
    pages: 'Управление страницами - поворот, удаление, изменение порядка и извлечение',
    annotate: 'Добавление аннотаций - текст, фигуры, штампы и рисунки',
    design: 'Применение дизайна - водяные знаки, номера страниц и фоны',
    tools: 'Инструменты документа - редактирование метаданных и оптимизация',
  },

  // Tabs
  tabs: {
    pages: 'Страницы',
    annotate: 'Аннотации',
    design: 'Дизайн',
    tools: 'Инструменты',
  },

  // Common
  pages: {
    count: 'страниц',
    selected: 'выбрано',
    noPages: 'Нет страниц для отображения',

    toolbar: {
      selectAll: 'Выбрать все',
      deselectAll: 'Снять выделение',
      deleteSelected: 'Удалить выбранные',
      rotateSelected: 'Повернуть выбранные',
      addBlankPage: 'Добавить пустую страницу',
      insertFromPDF: 'Вставить из PDF',
    },

    thumbnail: {
      page: 'Страница {number}',
      rotate: 'Повернуть',
      delete: 'Удалить',
      duplicate: 'Дублировать',
      selected: 'Выбрано',
    },

    dialogs: {
      deleteConfirm: 'Удалить {count} страниц(ы)?',
      insertPDF: 'Выберите PDF для вставки',
      blankPageFormat: 'Выберите формат страницы',
    },
  },

  annotate: {
    toolbar: {
      text: 'Текст',
      line: 'Линия',
      arrow: 'Стрелка',
      rectangle: 'Прямоугольник',
      circle: 'Круг',
      highlight: 'Выделение',
      stamp: 'Штамп',
      freeDraw: 'Свободное рисование',
    },

    properties: {
      fontSize: 'Размер шрифта',
      fontFamily: 'Шрифт',
      color: 'Цвет',
      strokeWidth: 'Толщина линии',
      opacity: 'Прозрачность',
      position: 'Позиция',
    },

    stamps: {
      approved: 'УТВЕРЖДЕНО',
      confidential: 'КОНФИДЕНЦИАЛЬНО',
      draft: 'ЧЕРНОВИК',
      reviewed: 'ПРОВЕРЕНО',
      rejected: 'ОТКЛОНЕНО',
    },
  },

  design: {
    watermark: {
      title: 'Водяной знак',
      enabled: 'Добавить водяной знак',
      text: 'Текст водяного знака',
      opacity: 'Прозрачность',
      angle: 'Угол',
      color: 'Цвет',
    },

    pageNumbers: {
      title: 'Номера страниц',
      enabled: 'Показать номера страниц',
      format: 'Формат',
      position: 'Позиция',
      startNumber: 'Начать с',
    },

    background: {
      title: 'Фон',
      none: 'Нет',
      color: 'Сплошной цвет',
      gradient: 'Градиент',
      image: 'Изображение',
    },

    preview: {
      info: 'Изменения будут применены при сохранении документа',
      noDocument: 'Загрузите документ для предпросмотра',
      selectedPage: 'Выбранная страница',
      firstPage: 'Первая страница',
    },
  },

  tools: {
    documentInfo: 'Информация о документе',
    metadata: 'Метаданные',
    pages: 'Страницы',
    fileSize: 'Размер файла',
    fileName: 'Имя файла',
    title: 'Заголовок',
    author: 'Автор',
    subject: 'Тема',
    keywords: 'Ключевые слова',
  },

  // AI Assistant
  ai: {
    analyzing: 'Анализ документа...',
    suggestions: '{count} рекомендаций',
    applyAll: 'Применить все',

    pages: {
      blankPages: {
        title: 'Обнаружено {count} пустых страниц',
        description: 'Страницы: {pages}',
        reasoning: 'Пустые страницы увеличивают размер файла без необходимости',
        action: 'Удалить пустые страницы',
      },

      rotatedPages: {
        title: '{count} страниц требуют поворота',
        description: 'Страницы повернуты боком',
        action: 'Автоповорот',
      },
    },

    design: {
      watermark: {
        title: 'Рекомендуется добавить водяной знак',
        reasoning: 'Документ содержит конфиденциальную информацию',
      },

      pageNumbers: {
        title: 'Добавить номера страниц',
        reasoning: 'В документе {pages} страниц - нумерация улучшит навигацию',
      },
    },
  },
};
