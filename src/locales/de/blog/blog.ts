/**
 * Blog translations for DE language
 * Contains all blog-related UI text and messages
 */

export const blog = {
  // Blog header
  header: {
    title: 'PDF Experten Blog',
    description: 'Professionelle Anleitungen, Tutorials und Einblicke über PDF-Tools und Dokumentenmanagement.',
    searchPlaceholder: 'Artikel suchen...',
    searchHint: 'Nach Titel, Kategorie oder Tags suchen'
  },

  // Blog cards
  card: {
    featured: 'Empfohlen',
    minRead: 'Min. Lesezeit',
    readMore: 'Weiterlesen'
  },

  // Blog sidebar
  sidebar: {
    categories: 'Kategorien',
    recentPosts: 'Aktuelle Beiträge',
    popularTags: 'Beliebte Tags',
    newsletter: {
      title: 'Auf dem Laufenden bleiben',
      description: 'Erhalten Sie die neuesten PDF-Tipps und Tutorials direkt in Ihre Mailbox.',
      placeholder: 'E-Mail eingeben',
      subscribe: 'Abonnieren',
      privacy: 'Kein Spam, jederzeit abmelden.'
    }
  },

  // Blog search
  search: {
    placeholder: 'Artikel nach Titel, Inhalt oder Tags suchen...',
    recentSearches: 'Letzte Suchen',
    searching: 'Suche...',
    results: '{count} Ergebnisse für "{query}" gefunden',
    viewAll: 'Alle {count} Ergebnisse anzeigen',
    noResults: 'Keine Artikel für "{query}" gefunden',
    noResultsHint: 'Versuchen Sie andere Schlüsselwörter oder prüfen Sie die Rechtschreibung',
    tips: {
      title: 'Such-Tipps',
      keywords: 'Verwenden Sie spezifische Schlüsselwörter wie "PDF zusammenführen" oder "Komprimierung"',
      tags: 'Suchen Sie nach Tags mit #tutorial oder #anleitung',
      categories: 'Versuchen Sie Kategorienamen wie "tutorials" oder "tipps"'
    }
  },

  // Blog pagination
  pagination: {
    previous: 'Vorherige',
    next: 'Nächste',
    showing: 'Seite {current} von {total}'
  },

  // Blog layout
  layout: {
    title: 'PDF Experten Blog',
    description: 'Professionelle Anleitungen, Tutorials und Einblicke über PDF-Tools und Dokumentenmanagement.',
    featured: 'Empfohlene Artikel',
    latestArticles: 'Neueste Artikel',
    results: 'Ergebnisse',
    loading: 'Artikel werden geladen...',
    searchTitle: 'Suche: "{query}"',
    searchDescription: '{count} Artikel gefunden, die Ihrer Suche entsprechen',
    categoryTitle: '{category} Artikel',
    categoryDescription: 'Entdecken Sie {category} Artikel und Tutorials',
    tagTitle: 'Artikel mit Tag "{tag}"',
    tagDescription: 'Alle Artikel zu {tag}',
    searchResults: '{count} Ergebnisse für "{query}"',
    categoryResults: '{count} Artikel in {category}',
    tagResults: '{count} Artikel mit Tag "{tag}"',
    clearFilters: 'Filter löschen',
    noArticles: 'Keine Artikel gefunden',
    noSearchResults: 'Versuchen Sie andere Schlüsselwörter oder durchsuchen Sie unsere Kategorien',
    noArticlesInCategory: 'Noch keine Artikel in dieser Kategorie verfügbar'
  },

  // Blog post page
  post: {
    loading: 'Artikel wird geladen...',
    minRead: 'Min. Lesezeit',
    updated: 'Aktualisiert {date}',
    publishedBy: 'Veröffentlicht von',
    lastUpdated: 'Aktualisiert {date}',
    relatedArticles: 'Ähnliche Artikel',
    backToBlog: 'Zurück zum Blog',
    breadcrumbs: {
      blog: 'Blog'
    }
  },

  // Blog category page
  category: {
    title: 'Artikel der Kategorie {category}',
    loading: 'Kategorie wird geladen...',
    articlesCount: '{count} Artikel',
    noArticles: 'Noch keine Artikel in dieser Kategorie',
    noArticlesDescription: 'Schauen Sie bald wieder vorbei oder durchsuchen Sie andere Kategorien',
    browseBlog: 'Alle Artikel durchsuchen',
    backToBlog: 'Zurück zu allen Artikeln',
    breadcrumbs: {
      blog: 'Blog'
    },
    pageTitle: '{category} Artikel',
    seo: {
      title: '{category} Artikel - LocalPDF Blog',
      description: 'Entdecken Sie {count} professionelle {category} Artikel über PDF-Tools und Dokumentenmanagement.',
      keywords: '{category}, PDF {category}, {slug}, Tutorials'
    }
  },

  // Blog page SEO
  page: {
    title: 'PDF Experten Blog',
    description: 'Professionelle Anleitungen, Tutorials und Einblicke über PDF-Tools',
    seo: {
      title: 'PDF Experten Blog - Tipps, Tutorials & Anleitungen | LocalPDF',
      description: 'Professionelle PDF-Tutorials, Experten-Tipps und umfassende Anleitungen. Lernen Sie fortgeschrittene PDF-Techniken, Arbeitsabläufe und bewährte Praktiken.',
      keywords: 'PDF Tutorials, PDF Tipps, PDF Anleitungen, Dokumentenmanagement, PDF Tools, Komprimierung, Zusammenführen, Konvertierung, Sicherheit'
    },
    categoryTitle: '{category} Artikel',
    categoryDescription: 'Entdecken Sie professionelle {category} Artikel und Tutorials',
    tagTitle: 'Artikel mit Tag "{tag}"',
    tagDescription: 'Alle Artikel zu {tag}',
    searchTitle: 'Suche: "{query}"',
    searchDescription: 'Suchergebnisse für "{query}"'
  }
};