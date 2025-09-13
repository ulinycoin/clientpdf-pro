/**
 * Blog translations for RU language
 * Contains all blog-related UI text and messages
 */

export const blog = {
  // Blog header
  header: {
    title: 'Блог экспертов PDF',
    description: 'Профессиональные руководства, обучающие материалы и insights об инструментах PDF и управлении документами.',
    searchPlaceholder: 'Поиск статей...',
    searchHint: 'Поиск по названию, категории или тегам'
  },

  // Blog cards
  card: {
    featured: 'Рекомендуемые',
    minRead: 'мин чтения',
    readMore: 'Читать далее'
  },

  // Blog sidebar
  sidebar: {
    categories: 'Категории',
    recentPosts: 'Последние статьи',
    popularTags: 'Популярные теги',
    newsletter: {
      title: 'Будьте в курсе',
      description: 'Получайте последние советы по PDF и обучающие материалы прямо на почту.',
      placeholder: 'Введите ваш email',
      subscribe: 'Подписаться',
      privacy: 'Никакого спама, отписаться можно в любое время.'
    }
  },

  // Blog search
  search: {
    placeholder: 'Поиск статей по названию, содержанию или тегам...',
    recentSearches: 'Последние поиски',
    searching: 'Поиск...',
    results: 'Найдено {count} результатов для "{query}"',
    viewAll: 'Показать все {count} результатов',
    noResults: 'Статьи не найдены для "{query}"',
    noResultsHint: 'Попробуйте другие ключевые слова или проверьте правописание',
    tips: {
      title: 'Советы по поиску',
      keywords: 'Используйте конкретные ключевые слова как "объединить PDF" или "сжатие"',
      tags: 'Ищите по тегам используя #урок или #руководство',
      categories: 'Попробуйте названия категорий как "уроки" или "советы"'
    }
  },

  // Blog pagination
  pagination: {
    previous: 'Предыдущая',
    next: 'Следующая',
    showing: 'Страница {current} из {total}'
  },

  // Blog layout
  layout: {
    title: 'Блог экспертов PDF',
    description: 'Профессиональные руководства, обучающие материалы и insights об инструментах PDF и управлении документами.',
    featured: 'Рекомендуемые статьи',
    latestArticles: 'Последние статьи',
    results: 'Результаты',
    loading: 'Загрузка статей...',
    searchTitle: 'Поиск: "{query}"',
    searchDescription: 'Найдено {count} статей, соответствующих вашему поиску',
    categoryTitle: 'Статьи категории {category}',
    categoryDescription: 'Изучите статьи и обучающие материалы по категории {category}',
    tagTitle: 'Статьи с тегом "{tag}"',
    tagDescription: 'Все статьи по теме {tag}',
    searchResults: '{count} результатов для "{query}"',
    categoryResults: '{count} статей в категории {category}',
    tagResults: '{count} статей с тегом "{tag}"',
    clearFilters: 'Очистить фильтры',
    noArticles: 'Статьи не найдены',
    noSearchResults: 'Попробуйте другие ключевые слова или просмотрите наши категории',
    noArticlesInCategory: 'В этой категории пока нет доступных статей'
  },

  // Blog post page
  post: {
    loading: 'Загрузка статьи...',
    minRead: 'мин чтения',
    updated: 'Обновлено {date}',
    publishedBy: 'Опубликовано',
    lastUpdated: 'Обновлено {date}',
    relatedArticles: 'Похожие статьи',
    backToBlog: 'Вернуться к блогу',
    breadcrumbs: {
      blog: 'Блог'
    }
  },

  // Blog category page
  category: {
    title: 'Статьи категории {category}',
    loading: 'Загрузка категории...',
    articlesCount: '{count} статей',
    noArticles: 'В этой категории пока нет статей',
    noArticlesDescription: 'Загляните позже за новым контентом или просмотрите другие категории',
    browseBlog: 'Просмотреть все статьи',
    backToBlog: 'Вернуться ко всем статьям',
    breadcrumbs: {
      blog: 'Блог'
    },
    pageTitle: 'Статьи категории {category}',
    seo: {
      title: 'Статьи категории {category} - Блог LocalPDF',
      description: 'Откройте для себя {count} профессиональных статей категории {category} об инструментах PDF и управлении документами.',
      keywords: '{category}, PDF {category}, {slug}, обучающие материалы'
    }
  },

  // Blog page SEO
  page: {
    title: 'Блог экспертов PDF',
    description: 'Профессиональные руководства, обучающие материалы и insights об инструментах PDF',
    seo: {
      title: 'Блог экспертов PDF - Советы, Уроки и Руководства | LocalPDF',
      description: 'Профессиональные обучающие материалы по PDF, экспертные советы и полные руководства. Изучите продвинутые техники работы с PDF, рабочие процессы и лучшие практики.',
      keywords: 'уроки PDF, советы PDF, руководства PDF, управление документами, инструменты PDF, сжатие, объединение, конвертация, безопасность'
    },
    categoryTitle: 'Статьи категории {category}',
    categoryDescription: 'Откройте для себя профессиональные статьи и обучающие материалы категории {category}',
    tagTitle: 'Статьи с тегом "{tag}"',
    tagDescription: 'Все статьи по теме {tag}',
    searchTitle: 'Поиск: "{query}"',
    searchDescription: 'Результаты поиска для "{query}"'
  }
};