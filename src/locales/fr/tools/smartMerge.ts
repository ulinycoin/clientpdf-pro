/**
 * Smart Merge AI tool translations for FR language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Merge features
 */

export const smartMerge = {
  // Basic tool properties
  title: 'Fusion intelligente de PDF',
  description: 'Fusion intelligente de PDF alimentée par IA avec recommandations d\'optimisation',

  // Page metadata (SEO)
  pageTitle: 'Fusion intelligente de PDF avec IA - LocalPDF',
  pageDescription: 'Fusionnez intelligemment des PDF avec des recommandations alimentées par IA. Obtenez un ordre optimal des fichiers, des prédictions de qualité et des suggestions de métadonnées intelligentes.',

  // AI Analysis states
  analysis: {
    analyzing: 'Analyse des documents...',
    analyzingDescription: 'L\'IA analyse {count} documents pour fournir des recommandations intelligentes',
    failed: 'Échec de l\'analyse',
    retry: 'Réessayer',
    available: 'Analyse intelligente disponible',
    availableDescription: 'Ajoutez 2 fichiers PDF ou plus pour obtenir des recommandations de fusion alimentées par IA',
    analyzeButton: 'Analyser les documents',
    refreshAnalysis: '🔄 Actualiser l\'analyse',
    completed: 'Analyse terminée à {time} • Smart Merge v{version}',
    startMessage: 'Analyse de fusion intelligente démarrée pour {count} fichiers',
    completedMessage: 'Analyse de fusion intelligente terminée en {time}ms',
    failedMessage: 'Échec de l\'analyse de fusion intelligente',
    errorPrefix: 'Échec de l\'analyse de fusion intelligente:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Recommandations de fusion intelligente',
    confidence: '{percent}% de confiance',
    documentsAnalyzed: '{count} documents analysés',
    hideDetails: 'Masquer les détails',
    showDetails: 'Afficher les détails'
  },

  // Prediction metrics
  predictions: {
    processingTime: {
      label: 'Temps de traitement',
      estimated: '{time}s',
      range: 'plage {min}-{max}s'
    },
    resultSize: {
      label: 'Taille du résultat',
      compression: '{percent}% vs entrée'
    },
    quality: {
      label: 'Qualité',
      score: 'score {score}/100',
      levels: {
        excellent: 'excellent',
        good: 'bon',
        acceptable: 'acceptable',
        poor: 'mauvais'
      }
    },
    performance: {
      label: 'Performance',
      browserLoad: '{percent}% charge navigateur',
      memoryUsage: {
        low: 'faible',
        medium: 'moyen',
        high: 'élevé'
      }
    }
  },

  // Suggested order section
  order: {
    title: 'Ordre recommandé',
    reasoning: 'Ordre optimisé basé sur le contenu et les relations des documents',
    applyButton: 'Appliquer l\'ordre suggéré',
    navigationScore: 'Score de navigation: {score}/100',
    algorithms: {
      'content-based': 'basé sur le contenu',
      'chronological': 'chronologique',
      'alphabetical': 'alphabétique',
      'size-based': 'basé sur la taille'
    },
    reasoningTexts: {
      contentBased: 'Ordre optimisé basé sur le contenu et les relations des documents',
      chronological: 'Documents arrangés chronologiquement par date de création',
      alphabetical: 'Documents arrangés alphabétiquement par nom de fichier',
      sizeBased: 'Documents arrangés par taille de fichier pour un traitement optimal'
    }
  },

  // Warning messages
  warnings: {
    sizeMismatch: {
      title: 'Les documents ont des tailles de page différentes',
      suggestion: 'Considérez la normalisation des tailles ou vérifiez la compatibilité des documents'
    },
    orientationMismatch: {
      title: 'Les documents ont des orientations différentes (portrait/paysage)',
      suggestion: 'Les orientations mixtes peuvent affecter la lisibilité du document fusionné'
    },
    qualityVariance: {
      title: 'Différences de qualité significatives entre les documents',
      suggestion: 'Considérez l\'amélioration de la qualité des documents de faible qualité avant la fusion'
    },
    largeFile: {
      title: 'Grande taille de fichier fusionné attendue',
      suggestion: 'Considérez la compression des documents ou le traitement par plus petits lots'
    },
    autoFix: 'Corriger automatiquement ce problème'
  },

  // Metadata section
  metadata: {
    title: 'Métadonnées intelligentes',
    confidence: '{percent}% de confiance',
    applyButton: 'Appliquer les métadonnées',
    fields: {
      title: 'Titre',
      subject: 'Sujet',
      keywords: 'Mots-clés',
      author: 'Auteur'
    },
    generated: {
      defaultTitle: 'Document fusionné',
      completeDocument: '{name} - Document complet',
      mergedCollection: '{name} - Collection fusionnée',
      subjectCollection: 'Collection de documents {types}',
      subjectDefault: 'Collection de documents PDF fusionnés',
      authorDefault: 'LocalPDF Fusion intelligente',
      reasoningRelated: 'Généré basé sur {count} documents avec contenu lié',
      reasoningMixed: 'Généré basé sur {count} documents avec contenu mixte',
      keywordMerged: 'fusionné',
      keywordCollection: 'collection',
      keywordMultiDocument: 'multi-document',
      keywordDocument: 'document'
    }
  },

  // Advanced settings
  settings: {
    title: 'Paramètres optimisés',
    applyButton: 'Appliquer les paramètres optimisés',
    fields: {
      bookmarks: 'Signets:',
      quality: 'Qualité:',
      pageNumbers: 'Numéros de page:',
      annotations: 'Annotations:'
    },
    values: {
      preserve: 'Préserver',
      remove: 'Supprimer',
      continuous: 'continu',
      separate: 'séparé',
      merge: 'fusionner',
      qualityBalance: 'équilibré',
      qualityPreserveBest: 'préserver le meilleur'
    }
  },

  // Document analysis results
  documentAnalysis: {
    analyzing: 'Analyse du document {current}/{total}: {name}',
    analyzingFailed: 'Échec de l\'analyse de {name}',
    fallbackCreated: 'Analyse de secours créée pour {name}',
    orientation: {
      portrait: 'portrait',
      landscape: 'paysage',
      mixed: 'mixte'
    },
    quality: {
      high: 'élevée',
      medium: 'moyenne',
      low: 'faible'
    },
    type: {
      text: 'texte',
      scanned: 'numérisé',
      mixed: 'mixte',
      presentation: 'présentation'
    },
    compression: {
      none: 'aucune',
      low: 'faible',
      medium: 'moyenne',
      high: 'élevée'
    },
    textDensity: {
      low: 'faible',
      medium: 'moyenne',
      high: 'élevée'
    }
  },

  // Compatibility analysis
  compatibility: {
    pageSizeConsistency: {
      uniform: 'uniforme',
      similar: 'similaire',
      mixed: 'mixte'
    },
    qualityVariance: {
      low: 'faible',
      medium: 'moyenne',
      high: 'élevée'
    },
    formatConsistency: {
      identical: 'identique',
      compatible: 'compatible',
      problematic: 'problématique'
    }
  },

  // Content analysis
  contentAnalysis: {
    documentTypes: {
      contract: 'contrat',
      invoice: 'facture',
      report: 'rapport',
      presentation: 'présentation',
      manual: 'manuel',
      form: 'formulaire'
    },
    relatedDocuments: 'Documents liés détectés',
    duplicateContent: 'Contenu potentiellement dupliqué trouvé'
  },

  // Performance predictions
  performancePredictions: {
    processingStrategy: {
      parallel: 'parallèle',
      sequential: 'séquentiel',
      hybrid: 'hybride'
    },
    recommendations: {
      batchSize: 'Taille de lot recommandée: {size} fichiers',
      sequentialProcessing: 'Traitement séquentiel recommandé pour les gros fichiers',
      hybridProcessing: 'Traitement hybride recommandé',
      parallelProcessing: 'Traitement parallèle approprié'
    }
  },

  // Error messages
  errors: {
    analysisError: 'Erreur pendant l\'analyse de fusion intelligente',
    noFiles: 'Aucun fichier fourni pour l\'analyse',
    insufficientFiles: 'Au moins 2 fichiers requis pour l\'analyse de fusion intelligente',
    processingFailed: 'Échec du traitement de fusion intelligente',
    unknownError: 'Une erreur inconnue s\'est produite pendant l\'analyse',
    timeoutError: 'Délai d\'analyse dépassé - essayez avec moins de fichiers'
  },

  // Success messages
  success: {
    analysisComplete: 'Analyse de fusion intelligente terminée avec succès',
    recommendationsApplied: 'Recommandations appliquées avec succès',
    orderApplied: 'Ordre suggéré appliqué',
    metadataApplied: 'Métadonnées intelligentes appliquées',
    settingsApplied: 'Paramètres optimisés appliqués'
  },

  // Progress indicators
  progress: {
    analyzing: 'Analyse...',
    generatingRecommendations: 'Génération des recommandations...',
    calculatingPredictions: 'Calcul des prédictions...',
    optimizingSettings: 'Optimisation des paramètres...',
    preparingResults: 'Préparation des résultats...'
  },

  // File size formatting
  fileSize: {
    bytes: 'o',
    kilobytes: 'Ko',
    megabytes: 'Mo',
    gigabytes: 'Go'
  },

  // Trust indicators
  trustIndicators: {
    aiPowered: 'Analyse alimentée par IA',
    privacyFirst: 'Traitement axé sur la confidentialité',
    accuratePredictions: 'Prédictions précises',
    optimizedResults: 'Résultats optimisés'
  }
};