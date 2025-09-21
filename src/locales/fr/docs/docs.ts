/**
 * Documentation translations for FR language
 * Contains: navigation, sections, meta data, and content translations
 */

export const docs = {
  // Page meta and navigation
  title: 'Documentation',
  description: 'Documentation complète pour LocalPDF - Outils PDF respectueux de la vie privée avec support multilingue et optimisation IA',

  meta: {
    title: 'Documentation LocalPDF - {section}',
    description: 'Documentation complète pour LocalPDF - Outils PDF respectueux de la vie privée, architecture, bibliothèques et guide d\'optimisation IA',
    keywords: 'LocalPDF, documentation, outils PDF, React, TypeScript, respect vie privée, optimisation IA, multilingue'
  },

  // Navigation
  navigation: {
    title: 'Documentation',
    quickLinks: 'Liens rapides',
    github: 'Dépôt GitHub',
    website: 'Site principal'
  },

  // Section names
  sections: {
    overview: 'Aperçu',
    tools: 'Outils PDF',
    libraries: 'Bibliothèques',
    architecture: 'Architecture',
    aiOptimization: 'Optimisation IA',
    multilingual: 'Multilingue'
  },

  // Overview section
  overview: {
    title: 'Aperçu du projet',
    stats: {
      tools: 'Outils PDF',
      languages: 'Langues',
      aiTraffic: 'Trafic IA'
    }
  },

  // Tools section
  tools: {
    title: 'Outils PDF',
    description: 'LocalPDF offre 16 outils complets de traitement PDF, tous fonctionnant côté client pour une confidentialité totale.',
    multilingual: 'Multilingue',
    techStack: 'Stack technique',
    implementation: 'Implémentation',
    tryTool: 'Essayer l\'outil',
    viewSource: 'Voir le code source'
  },

  // Libraries section
  libraries: {
    title: 'Bibliothèques principales',
    description: 'LocalPDF est construit sur des bibliothèques open source éprouvées pour un traitement PDF fiable.',
    purpose: 'Objectif',
    features: 'Fonctionnalités',
    files: 'Fichiers d\'implémentation'
  },

  // Architecture section
  architecture: {
    title: 'Architecture système',
    description: 'LocalPDF suit une architecture moderne respectueuse de la vie privée avec traitement côté client et zéro téléchargement serveur.',

    layers: {
      presentation: 'Couche de présentation',
      presentationDesc: 'Composants React avec design glassmorphism',
      business: 'Logique métier',
      businessDesc: 'Traitement PDF et fonctionnalités IA',
      data: 'Couche de données',
      dataDesc: 'Stockage navigateur local, aucun téléchargement serveur'
    },

    components: {
      title: 'Structure des composants'
    },

    performance: {
      title: 'Métriques de performance',
      buildSystem: 'Système de build',
      loadTime: 'Temps de chargement',
      privacy: 'Niveau de confidentialité'
    },

    techStack: {
      title: 'Stack technologique'
    },

    dataFlow: {
      title: 'Flux de données',
      upload: 'Téléchargement fichier',
      uploadDesc: 'Glisser-déposer fichiers dans navigateur',
      process: 'Traitement',
      processDesc: 'Manipulation PDF côté client',
      manipulate: 'Manipulation',
      manipulateDesc: 'Appliquer opérations (fusionner, diviser, etc.)',
      download: 'Télécharger',
      downloadDesc: 'Télécharger fichiers traités'
    },

    privacy: {
      title: 'Architecture de confidentialité',
      description: 'LocalPDF traite tout dans votre navigateur - aucun fichier n\'est jamais téléchargé sur des serveurs.',
      noUpload: 'Aucun téléchargement serveur',
      localProcessing: '100% traitement local',
      gdprCompliant: 'Conforme RGPD'
    }
  },

  // AI Optimization section
  aiOptimization: {
    title: 'Optimisation IA',
    description: 'LocalPDF est optimisé pour l\'ère de recherche IA-first avec 68,99% du trafic provenant de crawlers IA comme ChatGPT.',

    stats: {
      indexedPages: 'Pages indexées',
      successRate: 'Taux de succès',
      aiDominant: 'Trafic IA dominant'
    },

    crawlerStats: {
      title: 'Distribution du trafic crawler'
    },

    features: {
      title: 'Fonctionnalités compatibles IA'
    },

    approach: {
      title: 'Approche IA-first',
      description: 'Notre documentation et structure de contenu sont spécifiquement optimisées pour la compréhension et l\'indexation IA.',
      tip: 'Tout le contenu inclut des données structurées pour une meilleure compréhension IA'
    }
  },

  // Multilingual section
  multilingual: {
    title: 'Support multilingue',
    description: 'LocalPDF supporte 5 langues avec des traductions complètes pour tous les outils et interfaces.',
    toolsTranslated: 'outils traduits',
    viewExample: 'Voir exemple'
  },

  // Error states
  notFound: {
    title: 'Section non trouvée',
    description: 'La section de documentation demandée n\'a pas pu être trouvée.'
  }
};