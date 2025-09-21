/**
 * Documentation translations for DE language
 * Contains: navigation, sections, meta data, and content translations
 */

export const docs = {
  // Page meta and navigation
  title: 'Dokumentation',
  description: 'Vollständige Dokumentation für LocalPDF - Datenschutz-orientierte PDF-Tools mit mehrsprachiger Unterstützung und KI-Optimierung',

  meta: {
    title: 'LocalPDF Dokumentation - {section}',
    description: 'Vollständige Dokumentation für LocalPDF - Datenschutz-orientierte PDF-Tools, Architektur, Bibliotheken und KI-Optimierungsleitfaden',
    keywords: 'LocalPDF, Dokumentation, PDF-Tools, React, TypeScript, datenschutzorientiert, KI-Optimierung, mehrsprachig'
  },

  // Navigation
  navigation: {
    title: 'Dokumentation',
    quickLinks: 'Schnellzugriff',
    github: 'GitHub Repository',
    website: 'Hauptwebsite'
  },

  // Section names
  sections: {
    overview: 'Überblick',
    tools: 'PDF-Tools',
    libraries: 'Bibliotheken',
    architecture: 'Architektur',
    aiOptimization: 'KI-Optimierung',
    multilingual: 'Mehrsprachig'
  },

  // Overview section
  overview: {
    title: 'Projektüberblick',
    stats: {
      tools: 'PDF-Tools',
      languages: 'Sprachen',
      aiTraffic: 'KI-Traffic'
    }
  },

  // Tools section
  tools: {
    title: 'PDF-Tools',
    description: 'LocalPDF bietet 16 umfassende PDF-Verarbeitungstools, die alle clientseitig für vollständige Privatsphäre arbeiten.',
    multilingual: 'Mehrsprachig',
    techStack: 'Tech Stack',
    implementation: 'Implementierung',
    tryTool: 'Tool ausprobieren',
    viewSource: 'Quellcode anzeigen'
  },

  // Libraries section
  libraries: {
    title: 'Kernbibliotheken',
    description: 'LocalPDF basiert auf bewährten Open-Source-Bibliotheken für zuverlässige PDF-Verarbeitung.',
    purpose: 'Zweck',
    features: 'Funktionen',
    files: 'Implementierungsdateien'
  },

  // Architecture section
  architecture: {
    title: 'Systemarchitektur',
    description: 'LocalPDF folgt einer modernen, datenschutzorientierten Architektur mit clientseitiger Verarbeitung und null Server-Uploads.',

    layers: {
      presentation: 'Präsentationsschicht',
      presentationDesc: 'React-Komponenten mit Glassmorphismus-Design',
      business: 'Geschäftslogik',
      businessDesc: 'PDF-Verarbeitung und KI-Features',
      data: 'Datenschicht',
      dataDesc: 'Lokaler Browser-Speicher, keine Server-Uploads'
    },

    components: {
      title: 'Komponentenstruktur'
    },

    performance: {
      title: 'Performance-Metriken',
      buildSystem: 'Build-System',
      loadTime: 'Ladezeit',
      privacy: 'Datenschutz-Level'
    },

    techStack: {
      title: 'Technologie-Stack'
    },

    dataFlow: {
      title: 'Datenfluss',
      upload: 'Datei-Upload',
      uploadDesc: 'Dateien per Drag & Drop in Browser',
      process: 'Verarbeitung',
      processDesc: 'Clientseitige PDF-Bearbeitung',
      manipulate: 'Manipulation',
      manipulateDesc: 'Operationen anwenden (zusammenführen, teilen, etc.)',
      download: 'Download',
      downloadDesc: 'Verarbeitete Dateien herunterladen'
    },

    privacy: {
      title: 'Datenschutz-Architektur',
      description: 'LocalPDF verarbeitet alles in Ihrem Browser - keine Dateien werden jemals auf Server hochgeladen.',
      noUpload: 'Keine Server-Uploads',
      localProcessing: '100% lokale Verarbeitung',
      gdprCompliant: 'DSGVO-konform'
    }
  },

  // AI Optimization section
  aiOptimization: {
    title: 'KI-Optimierung',
    description: 'LocalPDF ist für das KI-zentrierte Suchzeitalter optimiert, wobei 68,99% des Traffics von KI-Crawlern wie ChatGPT kommt.',

    stats: {
      indexedPages: 'Indexierte Seiten',
      successRate: 'Erfolgsrate',
      aiDominant: 'KI-Traffic dominant'
    },

    crawlerStats: {
      title: 'Crawler-Traffic-Verteilung'
    },

    features: {
      title: 'KI-freundliche Features'
    },

    approach: {
      title: 'KI-zentrierter Ansatz',
      description: 'Unsere Dokumentation und Inhaltsstruktur ist speziell für KI-Verständnis und -Indexierung optimiert.',
      tip: 'Alle Inhalte enthalten strukturierte Daten für besseres KI-Verständnis'
    }
  },

  // Multilingual section
  multilingual: {
    title: 'Mehrsprachige Unterstützung',
    description: 'LocalPDF unterstützt 5 Sprachen mit vollständigen Übersetzungen für alle Tools und Oberflächen.',
    toolsTranslated: 'Tools übersetzt',
    viewExample: 'Beispiel anzeigen'
  },

  // Error states
  notFound: {
    title: 'Abschnitt nicht gefunden',
    description: 'Der angeforderte Dokumentationsabschnitt konnte nicht gefunden werden.'
  }
};