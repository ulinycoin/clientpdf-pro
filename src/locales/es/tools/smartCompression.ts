/**
 * Smart Compression AI tool translations for ES language
 * Contains: AI recommendations, predictions, analysis messages, and all Smart Compression features
 */

export const smartCompression = {
  // Basic tool properties
  title: 'Compresión PDF Inteligente',
  description: 'Compresión PDF inteligente impulsada por IA con recomendaciones de optimización',

  // Page metadata (SEO)
  pageTitle: 'Compresión PDF Inteligente con IA - LocalPDF',
  pageDescription: 'Comprima PDFs inteligentemente con recomendaciones basadas en IA. Obtenga configuraciones de compresión óptimas, predicciones de tamaño y pronósticos de calidad.',

  // AI Analysis states
  analysis: {
    analyzing: 'Analizando documento...',
    analyzingDescription: 'IA está analizando {count} documento(s) para proporcionar recomendaciones inteligentes de compresión',
    failed: 'Análisis falló',
    retry: 'Reintentar',
    available: 'Análisis inteligente disponible',
    availableDescription: 'Suba un archivo PDF para obtener recomendaciones de compresión basadas en IA',
    analyzeButton: 'Analizar documento',
    refreshAnalysis: '🔄 Actualizar análisis',
    completed: 'Análisis completado a las {time} • Compresión Inteligente v{version}',
    startMessage: 'Análisis de compresión inteligente iniciado para {count} archivo(s)',
    completedMessage: 'Análisis de compresión inteligente completado en {time}ms',
    failedMessage: 'Análisis de compresión inteligente falló',
    errorPrefix: 'Análisis de compresión inteligente falló:'
  },

  // Main recommendations panel
  recommendations: {
    title: 'Recomendaciones de Compresión Inteligente',
    confidence: '{percent}% de confianza',
    potential: '{percent}% de potencial de compresión',
    hideDetails: 'Ocultar detalles',
    showDetails: 'Mostrar detalles',
    strategies: {
      conservative: 'Minimizar pérdida de calidad con compresión moderada',
      balanced: 'Balance entre reducción de tamaño y preservación de calidad',
      aggressive: 'Compresión máxima con compromisos de calidad aceptables'
    },
    reasoning: {
      qualityFirst: 'Enfoque que prioriza la calidad recomendado para preservar la integridad del documento',
      balanced: 'El enfoque equilibrado ofrece buena compresión con pérdida mínima de calidad',
      sizeFirst: 'El enfoque que prioriza el tamaño maximiza la compresión para eficiencia de almacenamiento'
    }
  },

  // Prediction metrics
  predictions: {
    sizeReduction: {
      label: 'Reducción de tamaño',
      estimated: 'Nuevo tamaño: {size}'
    },
    processingTime: {
      label: 'Tiempo de procesamiento',
      range: 'rango {min}-{max}s'
    },
    quality: {
      label: 'Pronóstico de calidad',
      impact: '{percent}% de impacto en calidad',
      levels: {
        excellent: 'excelente',
        good: 'buena',
        acceptable: 'aceptable',
        degraded: 'degradada',
        poor: 'pobre'
      },
      risks: {
        imageQuality: 'La calidad de imagen podría reducirse',
        downsampling: 'La resolución de imagen será disminuida',
        fonts: 'El renderizado de fuentes podría verse afectado'
      }
    },
    performance: {
      label: 'Rendimiento',
      cpuIntensive: 'Intensivo en CPU: {intensive}',
      memoryUsage: {
        low: 'memoria baja',
        medium: 'memoria media',
        high: 'memoria alta'
      }
    }
  },

  // Compression strategy section
  strategy: {
    title: 'Estrategia Recomendada',
    applyButton: 'Aplicar estrategia',
    expectedSavings: 'Ahorros esperados: {savings}',
    levels: {
      conservative: 'conservador',
      balanced: 'equilibrado',
      aggressive: 'agresivo'
    }
  },

  // Compression presets
  presets: {
    title: 'Preajustes de Compresión',
    names: {
      'web-optimized': 'Optimizado Web',
      'print-quality': 'Calidad Impresión',
      'maximum-compression': 'Compresión Máxima'
    },
    descriptions: {
      'web-optimized': 'Carga rápida para visualización web',
      'print-quality': 'Alta calidad para impresión',
      'maximum-compression': 'Tamaño de archivo mínimo'
    },
    qualityImpact: {
      minimal: 'Mínimo',
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto'
    }
  },

  // Content analysis details
  contentAnalysis: {
    title: 'Análisis de Contenido',
    text: 'Contenido de Texto',
    images: 'Contenido de Imagen',
    vectors: 'Gráficos Vectoriales',
    quality: 'Calidad Actual',
    complexity: 'Complejidad de Páginas',
    currentCompression: 'Compresión Actual',
    embeddedFonts: 'Fuentes Incrustadas',
    qualityLevels: {
      high: 'alta',
      medium: 'media',
      low: 'baja'
    },
    complexityLevels: {
      simple: 'simple',
      moderate: 'moderada',
      complex: 'compleja'
    },
    compressionLevels: {
      none: 'ninguna',
      low: 'baja',
      medium: 'media',
      high: 'alta'
    }
  },

  // Warning messages
  warnings: {
    qualityLoss: {
      title: 'Pérdida potencial de calidad detectada',
      suggestion: 'Considere usar un nivel de compresión más conservador para preservar la calidad de imagen'
    },
    largeFile: {
      title: 'Archivo grande - el procesamiento podría tomar más tiempo',
      suggestion: 'Considere dividir en secciones más pequeñas o reducir el nivel de compresión'
    },
    fonts: {
      title: 'Se aplicará subconjunto de fuentes',
      suggestion: 'Las fuentes incrustadas serán optimizadas. Verifique el renderizado de texto después de la compresión'
    },
    metadata: {
      title: 'Los metadatos del documento serán eliminados',
      suggestion: 'Autor, título y otros metadatos serán eliminados para reducir el tamaño del archivo'
    },
    impact: {
      low: 'Impacto Bajo',
      medium: 'Impacto Medio',
      high: 'Impacto Alto'
    },
    affectedAreas: 'Áreas afectadas',
    autoFix: 'Corrección automática disponible'
  },

  // Error messages
  errors: {
    analysisError: 'Falló al analizar documento para compresión',
    unknownError: 'Ocurrió un error desconocido',
    invalidFile: 'Archivo PDF inválido o corrupto',
    fileTooLarge: 'Archivo demasiado grande para análisis',
    processingFailed: 'El procesamiento de compresión falló'
  }
};