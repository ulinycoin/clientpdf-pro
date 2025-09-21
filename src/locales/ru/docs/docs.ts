/**
 * Documentation translations for RU language
 * Contains: navigation, sections, meta data, and content translations
 */

export const docs = {
  // Page meta and navigation
  title: 'Документация',
  description: 'Полная документация для LocalPDF - PDF-инструменты с защитой конфиденциальности, многоязычной поддержкой и ИИ-оптимизацией',

  meta: {
    title: 'Документация LocalPDF - {section}',
    description: 'Полная документация для LocalPDF - PDF-инструменты с защитой конфиденциальности, архитектура, библиотеки и руководство по ИИ-оптимизации',
    keywords: 'LocalPDF, документация, PDF инструменты, React, TypeScript, конфиденциальность, ИИ оптимизация, многоязычность'
  },

  // Navigation
  navigation: {
    title: 'Документация',
    quickLinks: 'Быстрые ссылки',
    github: 'GitHub репозиторий',
    website: 'Основной сайт'
  },

  // Section names
  sections: {
    overview: 'Обзор',
    tools: 'PDF инструменты',
    libraries: 'Библиотеки',
    architecture: 'Архитектура',
    aiOptimization: 'ИИ оптимизация',
    multilingual: 'Многоязычность'
  },

  // Overview section
  overview: {
    title: 'Обзор проекта',
    stats: {
      tools: 'PDF инструменты',
      languages: 'Языки',
      aiTraffic: 'ИИ трафик'
    }
  },

  // Tools section
  tools: {
    title: 'PDF инструменты',
    description: 'LocalPDF предлагает 16 комплексных инструментов обработки PDF, все работают на стороне клиента для полной конфиденциальности.',
    multilingual: 'Многоязычный',
    techStack: 'Технический стек',
    implementation: 'Реализация',
    tryTool: 'Попробовать инструмент',
    viewSource: 'Посмотреть исходный код'
  },

  // Libraries section
  libraries: {
    title: 'Основные библиотеки',
    description: 'LocalPDF построен на проверенных библиотеках с открытым исходным кодом для надежной обработки PDF.',
    purpose: 'Назначение',
    features: 'Функции',
    files: 'Файлы реализации'
  },

  // Architecture section
  architecture: {
    title: 'Архитектура системы',
    description: 'LocalPDF следует современной архитектуре, ориентированной на конфиденциальность, с обработкой на стороне клиента и нулевыми загрузками на сервер.',

    layers: {
      presentation: 'Слой представления',
      presentationDesc: 'React компоненты с дизайном glassmorphism',
      business: 'Бизнес-логика',
      businessDesc: 'Обработка PDF и ИИ функции',
      data: 'Слой данных',
      dataDesc: 'Локальное хранение браузера, без загрузки на сервер'
    },

    components: {
      title: 'Структура компонентов'
    },

    performance: {
      title: 'Метрики производительности',
      buildSystem: 'Система сборки',
      loadTime: 'Время загрузки',
      privacy: 'Уровень конфиденциальности'
    },

    techStack: {
      title: 'Технологический стек'
    },

    dataFlow: {
      title: 'Поток данных',
      upload: 'Загрузка файла',
      uploadDesc: 'Перетаскивание файлов в браузер',
      process: 'Обработка',
      processDesc: 'Манипуляция PDF на стороне клиента',
      manipulate: 'Манипуляция',
      manipulateDesc: 'Применение операций (слияние, разделение и т.д.)',
      download: 'Скачивание',
      downloadDesc: 'Скачивание обработанных файлов'
    },

    privacy: {
      title: 'Архитектура конфиденциальности',
      description: 'LocalPDF обрабатывает все в вашем браузере - файлы никогда не загружаются на серверы.',
      noUpload: 'Без загрузки на сервер',
      localProcessing: '100% локальная обработка',
      gdprCompliant: 'Соответствует GDPR'
    }
  },

  // AI Optimization section
  aiOptimization: {
    title: 'ИИ оптимизация',
    description: 'LocalPDF оптимизирован для эры поиска ИИ-first с 68.99% трафика, поступающего от ИИ краулеров, таких как ChatGPT.',

    stats: {
      indexedPages: 'Проиндексированные страницы',
      successRate: 'Уровень успеха',
      aiDominant: 'Доминирующий ИИ трафик'
    },

    crawlerStats: {
      title: 'Распределение трафика краулеров'
    },

    features: {
      title: 'ИИ-дружественные функции'
    },

    approach: {
      title: 'ИИ-first подход',
      description: 'Наша документация и структура контента специально оптимизированы для понимания и индексации ИИ.',
      tip: 'Весь контент включает структурированные данные для лучшего понимания ИИ'
    }
  },

  // Multilingual section
  multilingual: {
    title: 'Многоязычная поддержка',
    description: 'LocalPDF поддерживает 5 языков с полными переводами для всех инструментов и интерфейсов.',
    toolsTranslated: 'инструментов переведено',
    viewExample: 'Посмотреть пример'
  },

  // Error states
  notFound: {
    title: 'Раздел не найден',
    description: 'Запрошенный раздел документации не удалось найти.'
  }
};