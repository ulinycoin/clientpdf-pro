/**
 * Smart Merge AI tool translations for DE language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Merge features
 */

export const smartMerge = {
  // Basic tool properties
  title: 'Intelligente PDF-Zusammenführung',
  description: 'KI-gestützte intelligente PDF-Zusammenführung mit Optimierungsempfehlungen',

  // Page metadata (SEO)
  pageTitle: 'Intelligente PDF-Zusammenführung mit KI - LocalPDF',
  pageDescription: 'Führen Sie PDFs intelligent mit KI-gestützten Empfehlungen zusammen. Erhalten Sie optimale Dateireihenfolge, Qualitätsprognosen und intelligente Metadaten-Vorschläge.',

  // AI Analysis states
  analysis: {
    analyzing: 'Dokumente werden analysiert...',
    analyzingDescription: 'KI analysiert {count} Dokumente, um intelligente Empfehlungen zu geben',
    failed: 'Analyse fehlgeschlagen',
    retry: 'Wiederholen',
    available: 'Intelligente Analyse verfügbar',
    availableDescription: 'Fügen Sie 2 oder mehr PDF-Dateien hinzu, um KI-gestützte Zusammenführungsempfehlungen zu erhalten',
    analyzeButton: 'Dokumente analysieren',
    refreshAnalysis: '🔄 Analyse aktualisieren',
    completed: 'Analyse abgeschlossen um {time} • Smart Merge v{version}',
    startMessage: 'Intelligente Zusammenführungsanalyse für {count} Dateien gestartet',
    completedMessage: 'Intelligente Zusammenführungsanalyse in {time}ms abgeschlossen',
    failedMessage: 'Intelligente Zusammenführungsanalyse fehlgeschlagen',
    errorPrefix: 'Intelligente Zusammenführungsanalyse fehlgeschlagen:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Intelligente Zusammenführungsempfehlungen',
    confidence: '{percent}% Vertrauen',
    documentsAnalyzed: '{count} Dokumente analysiert',
    hideDetails: 'Details ausblenden',
    showDetails: 'Details anzeigen'
  },

  // Prediction metrics
  predictions: {
    processingTime: {
      label: 'Verarbeitungszeit',
      estimated: '{time}s',
      range: '{min}-{max}s Bereich'
    },
    resultSize: {
      label: 'Ergebnisgröße',
      compression: '{percent}% vs. Eingabe'
    },
    quality: {
      label: 'Qualität',
      score: '{score}/100 Punkte',
      levels: {
        excellent: 'ausgezeichnet',
        good: 'gut',
        acceptable: 'akzeptabel',
        poor: 'schlecht'
      }
    },
    performance: {
      label: 'Leistung',
      browserLoad: '{percent}% Browser-Last',
      memoryUsage: {
        low: 'niedrig',
        medium: 'mittel',
        high: 'hoch'
      }
    }
  },

  // Suggested order section
  order: {
    title: 'Empfohlene Reihenfolge',
    reasoning: 'Reihenfolge basierend auf Dokumentinhalt und -beziehungen optimiert',
    applyButton: 'Vorgeschlagene Reihenfolge anwenden',
    navigationScore: 'Navigationsbewertung: {score}/100',
    algorithms: {
      'content-based': 'inhaltsbasiert',
      'chronological': 'chronologisch',
      'alphabetical': 'alphabetisch',
      'size-based': 'größenbasiert'
    },
    reasoningTexts: {
      contentBased: 'Reihenfolge basierend auf Dokumentinhalt und -beziehungen optimiert',
      chronological: 'Dokumente chronologisch nach Erstellungsdatum angeordnet',
      alphabetical: 'Dokumente alphabetisch nach Dateiname angeordnet',
      sizeBased: 'Dokumente nach Dateigröße für optimale Verarbeitung angeordnet'
    }
  },

  // Warning messages
  warnings: {
    sizeMismatch: {
      title: 'Dokumente haben unterschiedliche Seitengrößen',
      suggestion: 'Erwägen Sie Größennormalisierung oder prüfen Sie Dokumentkompatibilität'
    },
    orientationMismatch: {
      title: 'Dokumente haben unterschiedliche Ausrichtungen (Hoch-/Querformat)',
      suggestion: 'Gemischte Ausrichtungen können die Lesbarkeit des zusammengeführten Dokuments beeinträchtigen'
    },
    qualityVariance: {
      title: 'Erhebliche Qualitätsunterschiede zwischen Dokumenten',
      suggestion: 'Erwägen Sie die Verbesserung der Qualität minderwertiger Dokumente vor der Zusammenführung'
    },
    largeFile: {
      title: 'Große zusammengeführte Dateigröße erwartet',
      suggestion: 'Erwägen Sie Dokumentkomprimierung oder Verarbeitung in kleineren Chargen'
    },
    autoFix: 'Dieses Problem automatisch beheben'
  },

  // Metadata section
  metadata: {
    title: 'Intelligente Metadaten',
    confidence: '{percent}% Vertrauen',
    applyButton: 'Metadaten anwenden',
    fields: {
      title: 'Titel',
      subject: 'Betreff',
      keywords: 'Schlüsselwörter',
      author: 'Autor'
    },
    generated: {
      defaultTitle: 'Zusammengeführtes Dokument',
      completeDocument: '{name} - Vollständiges Dokument',
      mergedCollection: '{name} - Zusammengeführte Sammlung',
      subjectCollection: 'Sammlung von {types} Dokumenten',
      subjectDefault: 'Zusammengeführte PDF-Dokumentsammlung',
      authorDefault: 'LocalPDF Intelligente Zusammenführung',
      reasoningRelated: 'Basierend auf {count} Dokumenten mit verwandtem Inhalt generiert',
      reasoningMixed: 'Basierend auf {count} Dokumenten mit gemischtem Inhalt generiert',
      keywordMerged: 'zusammengeführt',
      keywordCollection: 'sammlung',
      keywordMultiDocument: 'multi-dokument',
      keywordDocument: 'dokument'
    }
  },

  // Advanced settings
  settings: {
    title: 'Optimierte Einstellungen',
    applyButton: 'Optimierte Einstellungen anwenden',
    fields: {
      bookmarks: 'Lesezeichen:',
      quality: 'Qualität:',
      pageNumbers: 'Seitenzahlen:',
      annotations: 'Anmerkungen:'
    },
    values: {
      preserve: 'Beibehalten',
      remove: 'Entfernen',
      continuous: 'fortlaufend',
      separate: 'getrennt',
      merge: 'zusammenführen',
      qualityBalance: 'ausgewogen',
      qualityPreserveBest: 'beste beibehalten'
    }
  },

  // Document analysis results
  documentAnalysis: {
    analyzing: 'Dokument {current}/{total} wird analysiert: {name}',
    analyzingFailed: 'Analyse von {name} fehlgeschlagen',
    fallbackCreated: 'Fallback-Analyse für {name} erstellt',
    orientation: {
      portrait: 'hochformat',
      landscape: 'querformat',
      mixed: 'gemischt'
    },
    quality: {
      high: 'hoch',
      medium: 'mittel',
      low: 'niedrig'
    },
    type: {
      text: 'text',
      scanned: 'gescannt',
      mixed: 'gemischt',
      presentation: 'präsentation'
    },
    compression: {
      none: 'keine',
      low: 'niedrig',
      medium: 'mittel',
      high: 'hoch'
    },
    textDensity: {
      low: 'niedrig',
      medium: 'mittel',
      high: 'hoch'
    }
  },

  // Compatibility analysis
  compatibility: {
    pageSizeConsistency: {
      uniform: 'einheitlich',
      similar: 'ähnlich',
      mixed: 'gemischt'
    },
    qualityVariance: {
      low: 'niedrig',
      medium: 'mittel',
      high: 'hoch'
    },
    formatConsistency: {
      identical: 'identisch',
      compatible: 'kompatibel',
      problematic: 'problematisch'
    }
  },

  // Content analysis
  contentAnalysis: {
    documentTypes: {
      contract: 'vertrag',
      invoice: 'rechnung',
      report: 'bericht',
      presentation: 'präsentation',
      manual: 'handbuch',
      form: 'formular'
    },
    relatedDocuments: 'Verwandte Dokumente erkannt',
    duplicateContent: 'Potenziell doppelter Inhalt gefunden'
  },

  // Performance predictions
  performancePredictions: {
    processingStrategy: {
      parallel: 'parallel',
      sequential: 'sequenziell',
      hybrid: 'hybrid'
    },
    recommendations: {
      batchSize: 'Empfohlene Chargengröße: {size} Dateien',
      sequentialProcessing: 'Sequenzielle Verarbeitung für große Dateien empfohlen',
      hybridProcessing: 'Hybride Verarbeitung empfohlen',
      parallelProcessing: 'Parallele Verarbeitung geeignet'
    }
  },

  // Error messages
  errors: {
    analysisError: 'Fehler während der intelligenten Zusammenführungsanalyse',
    noFiles: 'Keine Dateien für Analyse bereitgestellt',
    insufficientFiles: 'Mindestens 2 Dateien für intelligente Zusammenführungsanalyse erforderlich',
    processingFailed: 'Intelligente Zusammenführungsverarbeitung fehlgeschlagen',
    unknownError: 'Ein unbekannter Fehler ist während der Analyse aufgetreten',
    timeoutError: 'Analyse-Timeout - versuchen Sie es mit weniger Dateien'
  },

  // Success messages
  success: {
    analysisComplete: 'Intelligente Zusammenführungsanalyse erfolgreich abgeschlossen',
    recommendationsApplied: 'Empfehlungen erfolgreich angewendet',
    orderApplied: 'Vorgeschlagene Reihenfolge angewendet',
    metadataApplied: 'Intelligente Metadaten angewendet',
    settingsApplied: 'Optimierte Einstellungen angewendet'
  },

  // Progress indicators
  progress: {
    analyzing: 'Analysiere...',
    generatingRecommendations: 'Empfehlungen werden generiert...',
    calculatingPredictions: 'Prognosen werden berechnet...',
    optimizingSettings: 'Einstellungen werden optimiert...',
    preparingResults: 'Ergebnisse werden vorbereitet...'
  },

  // File size formatting
  fileSize: {
    bytes: 'B',
    kilobytes: 'KB',
    megabytes: 'MB',
    gigabytes: 'GB'
  },

  // Trust indicators
  trustIndicators: {
    aiPowered: 'KI-gestützte Analyse',
    privacyFirst: 'Datenschutzorientierte Verarbeitung',
    accuratePredictions: 'Genaue Vorhersagen',
    optimizedResults: 'Optimierte Ergebnisse'
  }
};