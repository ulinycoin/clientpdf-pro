/**
 * Blog translations for FR language
 * Contains all blog-related UI text and messages
 */

export const blog = {
  // Blog header
  header: {
    title: 'Blog Expert PDF',
    description: 'Guides professionnels, tutoriels et aperçus sur les outils PDF et la gestion de documents.',
    searchPlaceholder: 'Rechercher des articles...',
    searchHint: 'Rechercher par titre, catégorie ou tags'
  },

  // Blog cards
  card: {
    featured: 'Mis en avant',
    minRead: 'min de lecture',
    readMore: 'Lire la suite'
  },

  // Blog sidebar
  sidebar: {
    categories: 'Catégories',
    recentPosts: 'Articles récents',
    popularTags: 'Tags populaires',
    newsletter: {
      title: 'Restez informé',
      description: 'Recevez les derniers conseils PDF et tutoriels directement dans votre boîte mail.',
      placeholder: 'Entrez votre email',
      subscribe: 'S\'abonner',
      privacy: 'Pas de spam, désabonnement à tout moment.'
    }
  },

  // Blog search
  search: {
    placeholder: 'Rechercher des articles par titre, contenu ou tags...',
    recentSearches: 'Recherches récentes',
    searching: 'Recherche...',
    results: '{count} résultats trouvés pour "{query}"',
    viewAll: 'Voir tous les {count} résultats',
    noResults: 'Aucun article trouvé pour "{query}"',
    noResultsHint: 'Essayez d\'autres mots-clés ou vérifiez l\'orthographe',
    tips: {
      title: 'Conseils de recherche',
      keywords: 'Utilisez des mots-clés spécifiques comme "fusionner PDF" ou "compression"',
      tags: 'Recherchez par tags en utilisant #tutorial ou #guide',
      categories: 'Essayez les noms de catégories comme "tutorials" ou "conseils"'
    }
  },

  // Blog pagination
  pagination: {
    previous: 'Précédent',
    next: 'Suivant',
    showing: 'Page {current} sur {total}'
  },

  // Blog layout
  layout: {
    title: 'Blog Expert PDF',
    description: 'Guides professionnels, tutoriels et aperçus sur les outils PDF et la gestion de documents.',
    featured: 'Articles mis en avant',
    latestArticles: 'Derniers articles',
    results: 'Résultats',
    loading: 'Chargement des articles...',
    searchTitle: 'Recherche : "{query}"',
    searchDescription: '{count} articles trouvés correspondant à votre recherche',
    categoryTitle: 'Articles {category}',
    categoryDescription: 'Explorez les articles et tutoriels {category}',
    tagTitle: 'Articles avec le tag "{tag}"',
    tagDescription: 'Tous les articles liés à {tag}',
    searchResults: '{count} résultats pour "{query}"',
    categoryResults: '{count} articles dans {category}',
    tagResults: '{count} articles avec le tag "{tag}"',
    clearFilters: 'Effacer les filtres',
    noArticles: 'Aucun article trouvé',
    noSearchResults: 'Essayez d\'autres mots-clés ou parcourez nos catégories',
    noArticlesInCategory: 'Aucun article disponible dans cette catégorie pour le moment'
  },

  // Blog post page
  post: {
    loading: 'Chargement de l\'article...',
    minRead: 'min de lecture',
    updated: 'Mis à jour le {date}',
    publishedBy: 'Publié par',
    lastUpdated: 'Mis à jour le {date}',
    relatedArticles: 'Articles similaires',
    backToBlog: 'Retour au blog',
    breadcrumbs: {
      blog: 'Blog'
    }
  },

  // Blog category page
  category: {
    title: 'Articles de la catégorie {category}',
    loading: 'Chargement de la catégorie...',
    articlesCount: '{count} articles',
    noArticles: 'Aucun article dans cette catégorie pour le moment',
    noArticlesDescription: 'Revenez bientôt pour du nouveau contenu ou parcourez d\'autres catégories',
    browseBlog: 'Parcourir tous les articles',
    backToBlog: 'Retour à tous les articles',
    breadcrumbs: {
      blog: 'Blog'
    },
    pageTitle: 'Articles {category}',
    seo: {
      title: 'Articles {category} - Blog LocalPDF',
      description: 'Découvrez {count} articles professionnels {category} sur les outils PDF et la gestion de documents.',
      keywords: '{category}, PDF {category}, {slug}, tutoriels'
    }
  },

  // Blog page SEO
  page: {
    title: 'Blog Expert PDF',
    description: 'Guides professionnels, tutoriels et aperçus sur les outils PDF',
    seo: {
      title: 'Blog Expert PDF - Conseils, Tutoriels & Guides | LocalPDF',
      description: 'Tutoriels PDF professionnels, conseils d\'experts et guides complets. Apprenez les techniques PDF avancées, flux de travail et meilleures pratiques.',
      keywords: 'tutoriels PDF, conseils PDF, guides PDF, gestion documents, outils PDF, compression, fusion, conversion, sécurité'
    },
    categoryTitle: 'Articles {category}',
    categoryDescription: 'Découvrez des articles et tutoriels professionnels {category}',
    tagTitle: 'Articles avec le tag "{tag}"',
    tagDescription: 'Tous les articles liés à {tag}',
    searchTitle: 'Recherche : "{query}"',
    searchDescription: 'Résultats de recherche pour "{query}"'
  }
};