/**
 * Smart Merge AI tool translations for ES language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Merge features
 */

export const smartMerge = {
  // Basic tool properties
  title: 'Fusión inteligente de PDF',
  description: 'Fusión inteligente de PDF impulsada por IA con recomendaciones de optimización',

  // Page metadata (SEO)
  pageTitle: 'Fusión inteligente de PDF con IA - LocalPDF',
  pageDescription: 'Fusione PDFs inteligentemente con recomendaciones impulsadas por IA. Obtenga orden óptimo de archivos, predicciones de calidad y sugerencias inteligentes de metadatos.',

  // AI Analysis states
  analysis: {
    analyzing: 'Analizando documentos...',
    analyzingDescription: 'La IA está analizando {count} documentos para proporcionar recomendaciones inteligentes',
    failed: 'Análisis fallido',
    retry: 'Reintentar',
    available: 'Análisis inteligente disponible',
    availableDescription: 'Agregue 2 o más archivos PDF para obtener recomendaciones de fusión impulsadas por IA',
    analyzeButton: 'Analizar documentos',
    refreshAnalysis: '🔄 Actualizar análisis',
    completed: 'Análisis completado a las {time} • Smart Merge v{version}',
    startMessage: 'Análisis de fusión inteligente iniciado para {count} archivos',
    completedMessage: 'Análisis de fusión inteligente completado en {time}ms',
    failedMessage: 'Falló el análisis de fusión inteligente',
    errorPrefix: 'Falló el análisis de fusión inteligente:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Recomendaciones de fusión inteligente',
    confidence: '{percent}% de confianza',
    documentsAnalyzed: '{count} documentos analizados',
    hideDetails: 'Ocultar detalles',
    showDetails: 'Mostrar detalles'
  },

  // Prediction metrics
  predictions: {
    processingTime: {
      label: 'Tiempo de procesamiento',
      estimated: '{time}s',
      range: 'rango {min}-{max}s'
    },
    resultSize: {
      label: 'Tamaño del resultado',
      compression: '{percent}% vs entrada'
    },
    quality: {
      label: 'Calidad',
      score: 'puntuación {score}/100',
      levels: {
        excellent: 'excelente',
        good: 'buena',
        acceptable: 'aceptable',
        poor: 'pobre'
      }
    },
    performance: {
      label: 'Rendimiento',
      browserLoad: '{percent}% carga del navegador',
      memoryUsage: {
        low: 'bajo',
        medium: 'medio',
        high: 'alto'
      }
    }
  },

  // Suggested order section
  order: {
    title: 'Orden recomendado',
    reasoning: 'Orden optimizado basado en contenido y relaciones de documentos',
    applyButton: 'Aplicar orden sugerido',
    navigationScore: 'Puntuación de navegación: {score}/100',
    algorithms: {
      'content-based': 'basado en contenido',
      'chronological': 'cronológico',
      'alphabetical': 'alfabético',
      'size-based': 'basado en tamaño'
    },
    reasoningTexts: {
      contentBased: 'Orden optimizado basado en contenido y relaciones de documentos',
      chronological: 'Documentos ordenados cronológicamente por fecha de creación',
      alphabetical: 'Documentos ordenados alfabéticamente por nombre de archivo',
      sizeBased: 'Documentos ordenados por tamaño de archivo para procesamiento óptimo'
    }
  },

  // Warning messages
  warnings: {
    sizeMismatch: {
      title: 'Los documentos tienen diferentes tamaños de página',
      suggestion: 'Considere la normalización de tamaños o verifique la compatibilidad de documentos'
    },
    orientationMismatch: {
      title: 'Los documentos tienen diferentes orientaciones (vertical/horizontal)',
      suggestion: 'Las orientaciones mixtas pueden afectar la legibilidad del documento fusionado'
    },
    qualityVariance: {
      title: 'Diferencias significativas de calidad entre documentos',
      suggestion: 'Considere mejorar la calidad de documentos de baja calidad antes de fusionar'
    },
    largeFile: {
      title: 'Se espera un gran tamaño de archivo fusionado',
      suggestion: 'Considere comprimir documentos o procesar en lotes más pequeños'
    },
    autoFix: 'Corregir automáticamente este problema'
  },

  // Metadata section
  metadata: {
    title: 'Metadatos inteligentes',
    confidence: '{percent}% de confianza',
    applyButton: 'Aplicar metadatos',
    fields: {
      title: 'Título',
      subject: 'Asunto',
      keywords: 'Palabras clave',
      author: 'Autor'
    },
    generated: {
      defaultTitle: 'Documento fusionado',
      completeDocument: '{name} - Documento completo',
      mergedCollection: '{name} - Colección fusionada',
      subjectCollection: 'Colección de documentos {types}',
      subjectDefault: 'Colección de documentos PDF fusionados',
      authorDefault: 'LocalPDF Fusión inteligente',
      reasoningRelated: 'Generado basado en {count} documentos con contenido relacionado',
      reasoningMixed: 'Generado basado en {count} documentos con contenido mixto',
      keywordMerged: 'fusionado',
      keywordCollection: 'colección',
      keywordMultiDocument: 'multi-documento',
      keywordDocument: 'documento'
    }
  },

  // Advanced settings
  settings: {
    title: 'Configuraciones optimizadas',
    applyButton: 'Aplicar configuraciones optimizadas',
    fields: {
      bookmarks: 'Marcadores:',
      quality: 'Calidad:',
      pageNumbers: 'Números de página:',
      annotations: 'Anotaciones:'
    },
    values: {
      preserve: 'Preservar',
      remove: 'Eliminar',
      continuous: 'continuo',
      separate: 'separado',
      merge: 'fusionar',
      qualityBalance: 'equilibrio',
      qualityPreserveBest: 'preservar mejor'
    }
  },

  // Document analysis results
  documentAnalysis: {
    analyzing: 'Analizando documento {current}/{total}: {name}',
    analyzingFailed: 'Falló el análisis de {name}',
    fallbackCreated: 'Análisis de respaldo creado para {name}',
    orientation: {
      portrait: 'vertical',
      landscape: 'horizontal',
      mixed: 'mixto'
    },
    quality: {
      high: 'alta',
      medium: 'media',
      low: 'baja'
    },
    type: {
      text: 'texto',
      scanned: 'escaneado',
      mixed: 'mixto',
      presentation: 'presentación'
    },
    compression: {
      none: 'ninguna',
      low: 'baja',
      medium: 'media',
      high: 'alta'
    },
    textDensity: {
      low: 'baja',
      medium: 'media',
      high: 'alta'
    }
  },

  // Compatibility analysis
  compatibility: {
    pageSizeConsistency: {
      uniform: 'uniforme',
      similar: 'similar',
      mixed: 'mixto'
    },
    qualityVariance: {
      low: 'baja',
      medium: 'media',
      high: 'alta'
    },
    formatConsistency: {
      identical: 'idéntico',
      compatible: 'compatible',
      problematic: 'problemático'
    }
  },

  // Content analysis
  contentAnalysis: {
    documentTypes: {
      contract: 'contrato',
      invoice: 'factura',
      report: 'informe',
      presentation: 'presentación',
      manual: 'manual',
      form: 'formulario'
    },
    relatedDocuments: 'Documentos relacionados detectados',
    duplicateContent: 'Contenido potencialmente duplicado encontrado'
  },

  // Performance predictions
  performancePredictions: {
    processingStrategy: {
      parallel: 'paralelo',
      sequential: 'secuencial',
      hybrid: 'híbrido'
    },
    recommendations: {
      batchSize: 'Tamaño de lote recomendado: {size} archivos',
      sequentialProcessing: 'Procesamiento secuencial recomendado para archivos grandes',
      hybridProcessing: 'Procesamiento híbrido recomendado',
      parallelProcessing: 'Procesamiento paralelo adecuado'
    }
  },

  // Error messages
  errors: {
    analysisError: 'Error durante el análisis de fusión inteligente',
    noFiles: 'No se proporcionaron archivos para análisis',
    insufficientFiles: 'Se requieren al menos 2 archivos para análisis de fusión inteligente',
    processingFailed: 'Falló el procesamiento de fusión inteligente',
    unknownError: 'Ocurrió un error desconocido durante el análisis',
    timeoutError: 'Tiempo de análisis agotado - intente con menos archivos'
  },

  // Success messages
  success: {
    analysisComplete: 'Análisis de fusión inteligente completado exitosamente',
    recommendationsApplied: 'Recomendaciones aplicadas exitosamente',
    orderApplied: 'Orden sugerido aplicado',
    metadataApplied: 'Metadatos inteligentes aplicados',
    settingsApplied: 'Configuraciones optimizadas aplicadas'
  },

  // Progress indicators
  progress: {
    analyzing: 'Analizando...',
    generatingRecommendations: 'Generando recomendaciones...',
    calculatingPredictions: 'Calculando predicciones...',
    optimizingSettings: 'Optimizando configuraciones...',
    preparingResults: 'Preparando resultados...'
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
    aiPowered: 'Análisis impulsado por IA',
    privacyFirst: 'Procesamiento centrado en privacidad',
    accuratePredictions: 'Predicciones precisas',
    optimizedResults: 'Resultados optimizados'
  }
};