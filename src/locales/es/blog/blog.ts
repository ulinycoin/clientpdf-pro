/**
 * Blog translations for ES language
 * Contains all blog-related UI text and messages
 */

export const blog = {
  // Blog header
  header: {
    title: 'Blog Experto PDF',
    description: 'Guías profesionales, tutoriales y perspectivas sobre herramientas PDF y gestión de documentos.',
    searchPlaceholder: 'Buscar artículos...',
    searchHint: 'Buscar por título, categoría o etiquetas'
  },

  // Blog cards
  card: {
    featured: 'Destacado',
    minRead: 'min de lectura',
    readMore: 'Leer más'
  },

  // Blog sidebar
  sidebar: {
    categories: 'Categorías',
    recentPosts: 'Artículos recientes',
    popularTags: 'Etiquetas populares',
    newsletter: {
      title: 'Mantente actualizado',
      description: 'Recibe los últimos consejos de PDF y tutoriales directamente en tu bandeja de entrada.',
      placeholder: 'Ingresa tu email',
      subscribe: 'Suscribirse',
      privacy: 'Sin spam, cancela cuando quieras.'
    }
  },

  // Blog search
  search: {
    placeholder: 'Buscar artículos por título, contenido o etiquetas...',
    recentSearches: 'Búsquedas recientes',
    searching: 'Buscando...',
    results: '{count} resultados encontrados para "{query}"',
    viewAll: 'Ver todos los {count} resultados',
    noResults: 'No se encontraron artículos para "{query}"',
    noResultsHint: 'Prueba con diferentes palabras clave o verifica la ortografía',
    tips: {
      title: 'Consejos de búsqueda',
      keywords: 'Usa palabras clave específicas como "fusionar PDF" o "compresión"',
      tags: 'Busca por etiquetas usando #tutorial o #guía',
      categories: 'Prueba nombres de categorías como "tutoriales" o "consejos"'
    }
  },

  // Blog pagination
  pagination: {
    previous: 'Anterior',
    next: 'Siguiente',
    showing: 'Página {current} de {total}'
  },

  // Blog layout
  layout: {
    title: 'Blog Experto PDF',
    description: 'Guías profesionales, tutoriales y perspectivas sobre herramientas PDF y gestión de documentos.',
    featured: 'Artículos destacados',
    latestArticles: 'Últimos artículos',
    results: 'Resultados',
    loading: 'Cargando artículos...',
    searchTitle: 'Búsqueda: "{query}"',
    searchDescription: '{count} artículos encontrados que coinciden con tu búsqueda',
    categoryTitle: 'Artículos de {category}',
    categoryDescription: 'Explora artículos y tutoriales de {category}',
    tagTitle: 'Artículos etiquetados con "{tag}"',
    tagDescription: 'Todos los artículos relacionados con {tag}',
    searchResults: '{count} resultados para "{query}"',
    categoryResults: '{count} artículos en {category}',
    tagResults: '{count} artículos etiquetados con "{tag}"',
    clearFilters: 'Limpiar filtros',
    noArticles: 'No se encontraron artículos',
    noSearchResults: 'Prueba con diferentes palabras clave o navega por nuestras categorías',
    noArticlesInCategory: 'Aún no hay artículos disponibles en esta categoría'
  },

  // Blog post page
  post: {
    loading: 'Cargando artículo...',
    minRead: 'min de lectura',
    updated: 'Actualizado {date}',
    publishedBy: 'Publicado por',
    lastUpdated: 'Actualizado {date}',
    relatedArticles: 'Artículos relacionados',
    backToBlog: 'Volver al blog',
    breadcrumbs: {
      blog: 'Blog'
    }
  },

  // Blog category page
  category: {
    title: 'Artículos de la categoría {category}',
    loading: 'Cargando categoría...',
    articlesCount: '{count} artículos',
    noArticles: 'Aún no hay artículos en esta categoría',
    noArticlesDescription: 'Vuelve pronto para nuevo contenido o navega por otras categorías',
    browseBlog: 'Explorar todos los artículos',
    backToBlog: 'Volver a todos los artículos',
    breadcrumbs: {
      blog: 'Blog'
    },
    pageTitle: 'Artículos de {category}',
    seo: {
      title: 'Artículos de {category} - Blog LocalPDF',
      description: 'Descubre {count} artículos profesionales de {category} sobre herramientas PDF y gestión de documentos.',
      keywords: '{category}, PDF {category}, {slug}, tutoriales'
    }
  },

  // Blog page SEO
  page: {
    title: 'Blog Experto PDF',
    description: 'Guías profesionales, tutoriales y perspectivas sobre herramientas PDF',
    seo: {
      title: 'Blog Experto PDF - Consejos, Tutoriales y Guías | LocalPDF',
      description: 'Tutoriales PDF profesionales, consejos de expertos y guías completas. Aprende técnicas PDF avanzadas, flujos de trabajo y mejores prácticas.',
      keywords: 'tutoriales PDF, consejos PDF, guías PDF, gestión documentos, herramientas PDF, compresión, fusión, conversión, seguridad'
    },
    categoryTitle: 'Artículos de {category}',
    categoryDescription: 'Descubre artículos y tutoriales profesionales de {category}',
    tagTitle: 'Artículos etiquetados con "{tag}"',
    tagDescription: 'Todos los artículos relacionados con {tag}',
    searchTitle: 'Búsqueda: "{query}"',
    searchDescription: 'Resultados de búsqueda para "{query}"'
  }
};