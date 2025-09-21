/**
 * Documentation translations for ES language
 * Contains: navigation, sections, meta data, and content translations
 */

export const docs = {
  // Page meta and navigation
  title: 'Documentación',
  description: 'Documentación completa para LocalPDF - Herramientas PDF que respetan la privacidad con soporte multiidioma y optimización IA',

  meta: {
    title: 'Documentación LocalPDF - {section}',
    description: 'Documentación completa para LocalPDF - Herramientas PDF que respetan la privacidad, arquitectura, bibliotecas y guía de optimización IA',
    keywords: 'LocalPDF, documentación, herramientas PDF, React, TypeScript, privacidad, optimización IA, multiidioma'
  },

  // Navigation
  navigation: {
    title: 'Documentación',
    quickLinks: 'Enlaces rápidos',
    github: 'Repositorio GitHub',
    website: 'Sitio web principal'
  },

  // Section names
  sections: {
    overview: 'Resumen',
    tools: 'Herramientas PDF',
    libraries: 'Bibliotecas',
    architecture: 'Arquitectura',
    aiOptimization: 'Optimización IA',
    multilingual: 'Multiidioma'
  },

  // Overview section
  overview: {
    title: 'Resumen del proyecto',
    stats: {
      tools: 'Herramientas PDF',
      languages: 'Idiomas',
      aiTraffic: 'Tráfico IA'
    }
  },

  // Tools section
  tools: {
    title: 'Herramientas PDF',
    description: 'LocalPDF ofrece 16 herramientas integrales de procesamiento PDF, todas funcionando del lado del cliente para privacidad completa.',
    multilingual: 'Multiidioma',
    techStack: 'Stack técnico',
    implementation: 'Implementación',
    tryTool: 'Probar herramienta',
    viewSource: 'Ver código fuente'
  },

  // Libraries section
  libraries: {
    title: 'Bibliotecas principales',
    description: 'LocalPDF está construido sobre bibliotecas de código abierto probadas para procesamiento PDF confiable.',
    purpose: 'Propósito',
    features: 'Características',
    files: 'Archivos de implementación'
  },

  // Architecture section
  architecture: {
    title: 'Arquitectura del sistema',
    description: 'LocalPDF sigue una arquitectura moderna que respeta la privacidad con procesamiento del lado del cliente y cero subidas al servidor.',

    layers: {
      presentation: 'Capa de presentación',
      presentationDesc: 'Componentes React con diseño glassmorphism',
      business: 'Lógica de negocio',
      businessDesc: 'Procesamiento PDF y características IA',
      data: 'Capa de datos',
      dataDesc: 'Almacenamiento local del navegador, sin subidas al servidor'
    },

    components: {
      title: 'Estructura de componentes'
    },

    performance: {
      title: 'Métricas de rendimiento',
      buildSystem: 'Sistema de construcción',
      loadTime: 'Tiempo de carga',
      privacy: 'Nivel de privacidad'
    },

    techStack: {
      title: 'Stack tecnológico'
    },

    dataFlow: {
      title: 'Flujo de datos',
      upload: 'Subida de archivo',
      uploadDesc: 'Arrastrar y soltar archivos al navegador',
      process: 'Procesamiento',
      processDesc: 'Manipulación PDF del lado del cliente',
      manipulate: 'Manipulación',
      manipulateDesc: 'Aplicar operaciones (fusionar, dividir, etc.)',
      download: 'Descargar',
      downloadDesc: 'Descargar archivos procesados'
    },

    privacy: {
      title: 'Arquitectura de privacidad',
      description: 'LocalPDF procesa todo en tu navegador - nunca se suben archivos a servidores.',
      noUpload: 'Sin subidas al servidor',
      localProcessing: '100% procesamiento local',
      gdprCompliant: 'Compatible con GDPR'
    }
  },

  // AI Optimization section
  aiOptimization: {
    title: 'Optimización IA',
    description: 'LocalPDF está optimizado para la era de búsqueda IA-first con 68.99% del tráfico viniendo de crawlers IA como ChatGPT.',

    stats: {
      indexedPages: 'Páginas indexadas',
      successRate: 'Tasa de éxito',
      aiDominant: 'Tráfico IA dominante'
    },

    crawlerStats: {
      title: 'Distribución del tráfico crawler'
    },

    features: {
      title: 'Características compatibles con IA'
    },

    approach: {
      title: 'Enfoque IA-first',
      description: 'Nuestra documentación y estructura de contenido está específicamente optimizada para comprensión e indexación IA.',
      tip: 'Todo el contenido incluye datos estructurados para mejor comprensión IA'
    }
  },

  // Multilingual section
  multilingual: {
    title: 'Soporte multiidioma',
    description: 'LocalPDF soporta 5 idiomas con traducciones completas para todas las herramientas e interfaces.',
    toolsTranslated: 'herramientas traducidas',
    viewExample: 'Ver ejemplo'
  },

  // Error states
  notFound: {
    title: 'Sección no encontrada',
    description: 'La sección de documentación solicitada no pudo ser encontrada.'
  }
};