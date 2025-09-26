/**
 * Smart Compression AI tool translations for FR language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Compression features
 */

export const smartCompression = {
  // Basic tool properties
  title: 'Compression PDF Intelligente',
  description: 'Compression PDF intelligente alimentée par IA avec recommandations d\'optimisation',

  // Page metadata (SEO)
  pageTitle: 'Compression PDF Intelligente avec IA - LocalPDF',
  pageDescription: 'Compressez les PDF intelligemment avec des recommandations basées sur l\'IA. Obtenez des paramètres de compression optimaux, des prédictions de taille et des prévisions de qualité.',

  // AI Analysis states
  analysis: {
    analyzing: 'Analyse du document...',
    analyzingDescription: 'L\'IA analyse {count} document(s) pour fournir des recommandations de compression intelligentes',
    failed: 'Analyse échouée',
    retry: 'Réessayer',
    available: 'Analyse intelligente disponible',
    availableDescription: 'Téléchargez un fichier PDF pour obtenir des recommandations de compression basées sur l\'IA',
    analyzeButton: 'Analyser le document',
    refreshAnalysis: '🔄 Actualiser l\'analyse',
    completed: 'Analyse terminée à {time} • Compression Intelligente v{version}',
    startMessage: 'Analyse de compression intelligente démarrée pour {count} fichier(s)',
    completedMessage: 'Analyse de compression intelligente terminée en {time}ms',
    failedMessage: 'Analyse de compression intelligente échouée',
    errorPrefix: 'Analyse de compression intelligente échouée:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Recommandations de Compression Intelligente',
    confidence: '{percent}% de confiance',
    potential: '{percent}% de potentiel de compression',
    hideDetails: 'Masquer les détails',
    showDetails: 'Afficher les détails',
    strategies: {
      conservative: 'Minimiser la perte de qualité avec une compression modérée',
      balanced: 'Équilibre entre réduction de taille et préservation de qualité',
      aggressive: 'Compression maximale avec des compromis de qualité acceptables'
    },
    reasoning: {
      qualityFirst: 'Approche privilégiant la qualité recommandée pour préserver l\'intégrité du document',
      balanced: 'L\'approche équilibrée offre une bonne compression avec une perte de qualité minimale',
      sizeFirst: 'L\'approche privilégiant la taille maximise la compression pour l\'efficacité de stockage'
    }
  },

  // Prediction metrics
  predictions: {
    sizeReduction: {
      label: 'Réduction de taille',
      estimated: 'Nouvelle taille: {size}'
    },
    processingTime: {
      label: 'Temps de traitement',
      range: 'plage {min}-{max}s'
    },
    quality: {
      label: 'Prévision de qualité',
      impact: '{percent}% d\'impact sur la qualité',
      levels: {
        excellent: 'excellent',
        good: 'bon',
        acceptable: 'acceptable',
        degraded: 'dégradé',
        poor: 'mauvais'
      },
      risks: {
        imageQuality: 'La qualité des images pourrait être réduite',
        downsampling: 'La résolution des images sera diminuée',
        fonts: 'Le rendu des polices pourrait être affecté'
      }
    },
    performance: {
      label: 'Performance',
      cpuIntensive: 'Intensif CPU: {intensive}',
      memoryUsage: {
        low: 'mémoire faible',
        medium: 'mémoire moyenne',
        high: 'mémoire élevée'
      }
    }
  },

  // Compression strategy section
  strategy: {
    title: 'Stratégie Recommandée',
    applyButton: 'Appliquer la stratégie',
    expectedSavings: 'Économies attendues: {savings}',
    levels: {
      conservative: 'conservateur',
      balanced: 'équilibré',
      aggressive: 'agressif'
    }
  },

  // Compression presets
  presets: {
    title: 'Préréglages de Compression',
    names: {
      'web-optimized': 'Optimisé Web',
      'print-quality': 'Qualité Impression',
      'maximum-compression': 'Compression Maximale'
    },
    descriptions: {
      'web-optimized': 'Chargement rapide pour visualisation web',
      'print-quality': 'Haute qualité pour impression',
      'maximum-compression': 'Taille de fichier minimale'
    },
    qualityImpact: {
      minimal: 'Minimal',
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé'
    }
  },

  // Content analysis details
  contentAnalysis: {
    title: 'Analyse de Contenu',
    text: 'Contenu Textuel',
    images: 'Contenu Image',
    vectors: 'Graphiques Vectoriels',
    quality: 'Qualité Actuelle',
    complexity: 'Complexité des Pages',
    currentCompression: 'Compression Actuelle',
    embeddedFonts: 'Polices Intégrées',
    qualityLevels: {
      high: 'élevée',
      medium: 'moyenne',
      low: 'faible'
    },
    complexityLevels: {
      simple: 'simple',
      moderate: 'modérée',
      complex: 'complexe'
    },
    compressionLevels: {
      none: 'aucune',
      low: 'faible',
      medium: 'moyenne',
      high: 'élevée'
    }
  },

  // Warning messages
  warnings: {
    qualityLoss: {
      title: 'Perte de qualité potentielle détectée',
      suggestion: 'Considérez un niveau de compression plus conservateur pour préserver la qualité des images'
    },
    largeFile: {
      title: 'Fichier volumineux - le traitement pourrait prendre plus de temps',
      suggestion: 'Considérez diviser en sections plus petites ou réduire le niveau de compression'
    },
    fonts: {
      title: 'Le sous-ensemble de polices sera appliqué',
      suggestion: 'Les polices intégrées seront optimisées. Vérifiez le rendu du texte après compression'
    },
    metadata: {
      title: 'Les métadonnées du document seront supprimées',
      suggestion: 'L\'auteur, le titre et autres métadonnées seront supprimés pour réduire la taille du fichier'
    },
    impact: {
      low: 'Impact Faible',
      medium: 'Impact Moyen',
      high: 'Impact Élevé'
    },
    affectedAreas: 'Zones affectées',
    autoFix: 'Correction automatique disponible'
  },

  // Error messages
  errors: {
    analysisError: 'Échec de l\'analyse du document pour la compression',
    unknownError: 'Une erreur inconnue s\'est produite',
    invalidFile: 'Fichier PDF invalide ou corrompu',
    fileTooLarge: 'Fichier trop volumineux pour l\'analyse',
    processingFailed: 'Le traitement de compression a échoué'
  }
};