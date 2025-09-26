/**
 * Smart Compression AI tool translations for DE language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Compression features
 */

export const smartCompression = {
  // Basic tool properties
  title: 'Intelligente PDF-Komprimierung',
  description: 'KI-gestützte intelligente PDF-Komprimierung mit Optimierungsempfehlungen',

  // Page metadata (SEO)
  pageTitle: 'Intelligente PDF-Komprimierung mit KI - LocalPDF',
  pageDescription: 'Komprimieren Sie PDFs intelligent mit KI-gestützten Empfehlungen. Erhalten Sie optimale Komprimierungseinstellungen, Größenvorhersagen und Qualitätsprognosen.',

  // AI Analysis states
  analysis: {
    analyzing: 'Dokument wird analysiert...',
    analyzingDescription: 'KI analysiert {count} Dokument(e), um intelligente Komprimierungsempfehlungen zu geben',
    failed: 'Analyse fehlgeschlagen',
    retry: 'Wiederholen',
    available: 'Intelligente Analyse verfügbar',
    availableDescription: 'Laden Sie eine PDF-Datei hoch, um KI-gestützte Komprimierungsempfehlungen zu erhalten',
    analyzeButton: 'Dokument analysieren',
    refreshAnalysis: '🔄 Analyse aktualisieren',
    completed: 'Analyse abgeschlossen um {time} • Intelligente Komprimierung v{version}',
    startMessage: 'Intelligente Komprimierungsanalyse für {count} Datei(en) gestartet',
    completedMessage: 'Intelligente Komprimierungsanalyse in {time}ms abgeschlossen',
    failedMessage: 'Intelligente Komprimierungsanalyse fehlgeschlagen',
    errorPrefix: 'Intelligente Komprimierungsanalyse fehlgeschlagen:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Intelligente Komprimierungsempfehlungen',
    confidence: '{percent}% Sicherheit',
    potential: '{percent}% Komprimierungspotenzial',
    hideDetails: 'Details ausblenden',
    showDetails: 'Details anzeigen',
    strategies: {
      conservative: 'Qualitätsverlust minimieren mit moderater Komprimierung',
      balanced: 'Balance zwischen Größenreduzierung und Qualitätserhaltung',
      aggressive: 'Maximale Komprimierung mit akzeptablen Qualitätsabstrichen'
    },
    reasoning: {
      qualityFirst: 'Qualitätspriorisierter Ansatz empfohlen zur Erhaltung der Dokumentintegrität',
      balanced: 'Ausgewogener Ansatz bietet gute Komprimierung mit minimalem Qualitätsverlust',
      sizeFirst: 'Größenpriorisierter Ansatz maximiert Komprimierung für Speichereffizienz'
    }
  },

  // Prediction metrics
  predictions: {
    sizeReduction: {
      label: 'Größenreduzierung',
      estimated: 'Neue Größe: {size}'
    },
    processingTime: {
      label: 'Verarbeitungszeit',
      range: '{min}-{max}s Bereich'
    },
    quality: {
      label: 'Qualitätsprognose',
      impact: '{percent}% Qualitätsauswirkung',
      levels: {
        excellent: 'ausgezeichnet',
        good: 'gut',
        acceptable: 'akzeptabel',
        degraded: 'verschlechtert',
        poor: 'schlecht'
      },
      risks: {
        imageQuality: 'Bildqualität könnte reduziert werden',
        downsampling: 'Bildauflösung wird verringert',
        fonts: 'Schrift-Rendering könnte beeinträchtigt werden'
      }
    },
    performance: {
      label: 'Leistung',
      cpuIntensive: 'CPU-intensiv: {intensive}',
      memoryUsage: {
        low: 'geringer Speicher',
        medium: 'mittlerer Speicher',
        high: 'hoher Speicher'
      }
    }
  },

  // Compression strategy section
  strategy: {
    title: 'Empfohlene Strategie',
    applyButton: 'Strategie anwenden',
    expectedSavings: 'Erwartete Einsparung: {savings}',
    levels: {
      conservative: 'konservativ',
      balanced: 'ausgewogen',
      aggressive: 'aggressiv'
    }
  },

  // Compression presets
  presets: {
    title: 'Komprimierungsvoreinstellungen',
    names: {
      'web-optimized': 'Web-optimiert',
      'print-quality': 'Druckqualität',
      'maximum-compression': 'Maximale Komprimierung'
    },
    descriptions: {
      'web-optimized': 'Schnelles Laden für Web-Anzeige',
      'print-quality': 'Hohe Qualität zum Drucken',
      'maximum-compression': 'Kleinste Dateigröße'
    },
    qualityImpact: {
      minimal: 'Minimal',
      low: 'Gering',
      medium: 'Mittel',
      high: 'Hoch'
    }
  },

  // Content analysis details
  contentAnalysis: {
    title: 'Inhaltsanalyse',
    text: 'Textinhalt',
    images: 'Bildinhalt',
    vectors: 'Vektorgrafiken',
    quality: 'Aktuelle Qualität',
    complexity: 'Seitenkomplexität',
    currentCompression: 'Aktuelle Komprimierung',
    embeddedFonts: 'Eingebettete Schriften',
    qualityLevels: {
      high: 'hoch',
      medium: 'mittel',
      low: 'niedrig'
    },
    complexityLevels: {
      simple: 'einfach',
      moderate: 'moderat',
      complex: 'komplex'
    },
    compressionLevels: {
      none: 'keine',
      low: 'niedrig',
      medium: 'mittel',
      high: 'hoch'
    }
  },

  // Warning messages
  warnings: {
    qualityLoss: {
      title: 'Potenzieller Qualitätsverlust erkannt',
      suggestion: 'Erwägen Sie einen konservativeren Komprimierungsgrad zur Erhaltung der Bildqualität'
    },
    largeFile: {
      title: 'Große Datei - Verarbeitung könnte länger dauern',
      suggestion: 'Erwägen Sie eine Aufteilung in kleinere Abschnitte oder reduzierte Komprimierung'
    },
    fonts: {
      title: 'Schrift-Subsetting wird angewendet',
      suggestion: 'Eingebettete Schriften werden optimiert. Prüfen Sie die Textdarstellung nach der Komprimierung'
    },
    metadata: {
      title: 'Dokument-Metadaten werden entfernt',
      suggestion: 'Autor, Titel und andere Metadaten werden entfernt, um die Dateigröße zu reduzieren'
    },
    impact: {
      low: 'Geringe Auswirkung',
      medium: 'Mittlere Auswirkung',
      high: 'Hohe Auswirkung'
    },
    affectedAreas: 'Betroffene Bereiche',
    autoFix: 'Auto-Korrektur verfügbar'
  },

  // Error messages
  errors: {
    analysisError: 'Dokument konnte nicht zur Komprimierung analysiert werden',
    unknownError: 'Ein unbekannter Fehler ist aufgetreten',
    invalidFile: 'Ungültige oder beschädigte PDF-Datei',
    fileTooLarge: 'Datei zu groß für die Analyse',
    processingFailed: 'Komprimierungsverarbeitung fehlgeschlagen'
  }
};