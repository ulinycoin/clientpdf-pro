// src/locales/es.ts
import { Translations } from '../types/i18n';

export const es: Translations = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    download: 'Descargar',
    upload: 'Subir',
    delete: 'Eliminar',
    clear: 'Limpiar',
    preview: 'Vista previa',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    continue: 'Continuar',
    finish: 'Finalizar',
    file: 'Archivo',
    files: 'Archivos',
    size: 'Tamaño',
    name: 'Nombre',
    type: 'Tipo',
    format: 'Formato',
    quality: 'Calidad',
    pages: 'Páginas',
    page: 'Página',
    processing: 'Procesando',
    processed: 'Procesado',
    ready: 'Listo',
    complete: 'Completado',
    remove: 'Eliminar',
    clearAll: 'Limpiar todo',
    or: 'o',
    selectFile: 'Por favor seleccione al menos un archivo',
    unexpectedError: 'Ocurrió un error inesperado',
    pdfFiles: 'Archivos PDF',
    faqTitle: 'Preguntas frecuentes',
  },

  header: {
    title: 'LocalPDF',
    subtitle: 'Herramientas PDF centradas en la privacidad',
    navigation: {
      privacy: 'Privacidad',
      faq: 'FAQ',
      github: 'GitHub',
    },
    badges: {
      tools: 'Herramientas PDF',
      private: '100% Privado',
      activeTools: 'Herramientas activas',
      privateProcessing: '100% procesamiento privado',
    },
    mobileMenu: {
      toggle: 'Alternar menú móvil',
      privacyPolicy: 'Política de privacidad',
      githubRepository: 'Repositorio GitHub',
    },
  },

  home: {
    hero: {
      title: 'LocalPDF',
      subtitle: 'Herramientas PDF centradas en la privacidad',
      description: 'Herramientas profesionales de procesamiento PDF que funcionan completamente en tu navegador',
      descriptionSecondary: 'Sin subidas • Sin seguimiento • Sin límites • Completamente gratis para siempre',
      features: {
        privacy: {
          title: 'Tus archivos nunca salen de tu dispositivo',
          subtitle: '100% procesamiento local',
        },
        speed: {
          title: 'Procesamiento ultrarrápido',
          subtitle: 'Sin retrasos del servidor',
        },
        free: {
          title: 'Completamente gratis, sin límites',
          subtitle: 'Código abierto para siempre',
        },
      },
      trustIndicators: {
        noRegistration: 'No se requiere registro',
        worksOffline: 'Funciona sin conexión',
        openSource: 'Código abierto',
      },
    },
    upload: {
      title: 'Comienza en segundos',
      description: 'Sube tus archivos PDF para comenzar el procesamiento, o elige "Imágenes a PDF" para convertir imágenes',
      dragDrop: 'Arrastra y suelta archivos aquí',
      selectFiles: 'Seleccionar archivos',
      maxSize: 'Tamaño máximo de archivo: 100MB',
      supportedFormats: 'Formatos soportados: PDF',
      ready: 'Listo para procesar',
      pdfDocument: 'Documento PDF',
    },
    tools: {
      title: 'Kit completo de herramientas PDF',
      subtitle: 'Elige la herramienta adecuada para tus necesidades. Todas las operaciones se realizan localmente en tu navegador.',
      whyChoose: {
        title: '¿Por qué elegir LocalPDF?',
        description: 'Construido con enfoque en privacidad y rendimiento',
        stats: {
          tools: 'Herramientas PDF',
          toolsDesc: 'Kit de herramientas completo',
          privacy: 'Privacidad',
          privacyDesc: 'Procesamiento local',
          dataCollection: 'Recolección de datos',
          dataCollectionDesc: 'Sin seguimiento',
          usageLimits: 'Límites de uso',
          usageLimitsDesc: 'Gratis para siempre',
        },
        features: {
          noRegistration: 'No se requiere registro',
          fastProcessing: 'Procesamiento ultrarrápido',
          secureProcessing: 'Procesamiento seguro',
          worksOffline: 'Funciona sin conexión',
        },
      },
      trustMessage: 'Tus archivos nunca salen de tu dispositivo',
    },
  },

  tools: {
    merge: {
      title: 'Combinar PDFs',
      description: 'Combinar múltiples archivos PDF en un solo documento',
    },
    compress: {
      title: 'Comprimir PDF',
      description: 'Reducir el tamaño del archivo PDF manteniendo la calidad',
      starting: 'Iniciando compresión...',
      failed: 'Compresión falló',
      fileToCompress: 'Archivo a comprimir',
      smaller: 'más pequeño',
      estimated: 'estimado',
      compressing: 'Comprimiendo...',
      howItWorks: 'Cómo funciona',
      howItWorksDescription: 'La compresión PDF elimina datos redundantes y optimiza la estructura del contenido. Configuraciones de calidad más bajas proporcionan archivos más pequeños pero pueden afectar la fidelidad visual.',
      settings: {
        title: 'Configuraciones de compresión',
        qualityLevel: 'Nivel de calidad',
        smallerFile: 'Archivo más pequeño',
        betterQuality: 'Mejor calidad',
        compressImages: 'Comprimir imágenes (puede reducir significativamente el tamaño del archivo)',
        removeMetadata: 'Eliminar metadatos (autor, título, fecha de creación)',
        optimizeForWeb: 'Optimizar para visualización web (carga más rápida)',
      },
    },
    addText: {
      title: 'Añadir texto',
      description: 'Añadir anotaciones de texto y comentarios al PDF',
    },
    watermark: {
      title: 'Añadir marca de agua',
      description: 'Añadir marcas de agua de texto para proteger documentos',
    },
    rotate: {
      title: 'Rotar páginas',
      description: 'Rotar páginas 90, 180 o 270 grados',
    },
    extractPages: {
      title: 'Extraer páginas',
      description: 'Extraer páginas específicas en un nuevo documento',
    },
    extractText: {
      title: 'Extraer texto',
      description: 'Extraer contenido de texto de archivos PDF',
    },
    split: {
      title: 'Dividir PDF',
      description: 'Dividir PDF en páginas o rangos separados',
      pageTitle: 'Dividir archivos PDF gratis',
      pageDescription: 'Divide archivos PDF por páginas o rangos gratis. Extrae páginas específicas de documentos PDF. División privada y segura de PDF en tu navegador.',
      uploadTitle: 'Subir PDF para dividir',
      uploadDescription: 'Divide tu PDF en páginas individuales o extrae rangos de páginas específicas',
      selectFile: 'Seleccionar archivo PDF',
      supportedFiles: 'Compatibles: archivos PDF hasta 100MB',
      successTitle: '¡PDF dividido exitosamente!',
      successDescription: 'Tu PDF ha sido dividido en {count} archivos separados.',
      downloadAllZip: 'Descargar todas las páginas en ZIP ({count} archivos)',
      downloadIndividual: 'Descargar páginas individuales:',
      pageNumber: 'Página {page}',
      splitAnother: 'Dividir otro PDF',
      howToTitle: 'Cómo dividir PDF:',
      buttons: {
        startSplitting: 'Comenzar división',
      },
      seo: {
        title: 'Dividir archivos PDF gratis - Extraer páginas online | LocalPDF',
        description: 'Divide archivos PDF por páginas o rangos gratis. Extrae páginas específicas de documentos PDF. División privada y segura de PDF en tu navegador.',
        keywords: 'dividir pdf, extraer páginas pdf, extractor de páginas pdf, divisor pdf gratis, separar pdf',
      },
      breadcrumbs: {
        home: 'Inicio',
        split: 'Dividir PDF',
      },
      howTo: {
        title: 'Cómo dividir archivos PDF',
        individualPages: {
          title: 'Páginas individuales',
          description: 'Dividir cada página en archivos PDF separados',
        },
        pageRange: {
          title: 'Rango de páginas',
          description: 'Extraer un rango específico de páginas (ej: páginas 5-10)',
        },
        specificPages: {
          title: 'Páginas específicas',
          description: 'Seleccionar páginas individuales para extraer (ej: 1, 3, 5-7, 10)',
        },
        zipOption: {
          title: 'Opción ZIP',
          description: 'Empaquetar múltiples archivos en una sola descarga ZIP',
        },
        privacy: {
          title: 'Privacidad',
          description: 'Todo el procesamiento ocurre localmente en tu navegador',
        },
        steps: {
          upload: {
            title: 'Subir PDF',
            description: 'Haz clic en "Elegir archivo" o arrastra y suelta tu documento PDF en el área de subida.',
            icon: '📤',
          },
          configure: {
            title: 'Seleccionar páginas',
            description: 'Elige qué páginas extraer - páginas individuales, rangos de páginas o múltiples secciones.',
            icon: '✂️',
          },
          download: {
            title: 'Descargar páginas',
            description: 'Tus páginas PDF divididas estarán listas para descargar instantáneamente.',
            icon: '📥',
          },
        },
      },
      features: {
        title: '¿Por qué elegir nuestro divisor PDF?',
        privacy: {
          title: '100% Privado',
          description: 'Tu PDF se procesa localmente en tu navegador. Sin subidas a servidores, privacidad completa garantizada.',
        },
        fast: {
          title: 'Ultra rápido',
          description: 'División PDF instantánea con nuestro motor optimizado. Sin esperas para subidas o colas de procesamiento.',
        },
        quality: {
          title: 'Alta calidad',
          description: 'Preserva la calidad y formato PDF original. Las páginas divididas mantienen claridad y estructura perfectas.',
        },
        free: {
          title: 'Completamente gratis',
          description: 'Divide PDFs ilimitados gratis. Sin registro, sin marcas de agua, sin limitaciones ocultas.',
        },
      },
      faqTitle: 'Preguntas frecuentes sobre división de PDF',
      seoContent: {
        title: 'Guía completa para dividir PDF',
        introduction: 'La división de archivos PDF es una tarea fundamental de la gestión documental. Ya sea que necesites extraer páginas específicas, separar capítulos o dividir un documento grande en archivos más pequeños y manejables, nuestro divisor PDF centrado en la privacidad ofrece la solución perfecta. A diferencia de los servicios en línea que requieren subir archivos, LocalPDF procesa todo localmente en tu navegador para máxima seguridad.',
        whyChoose: {
          title: '¿Por qué elegir el divisor PDF LocalPDF?',
          privacy: {
            title: '100% privacidad garantizada',
            text: 'Tu PDF se procesa completamente en tu navegador. Sin subidas a servidores, sin recolección de datos, protección completa de privacidad para documentos sensibles.',
          },
          speed: {
            title: 'Procesamiento ultrarrápido',
            text: 'División PDF instantánea con nuestro motor de navegador optimizado. Sin esperas para subidas, descargas o colas de procesamiento del servidor.',
          },
          quality: {
            title: 'Preservación perfecta de la calidad',
            text: 'Mantén la calidad, formato, fuentes y estructura PDF original. Las páginas divididas conservan claridad perfecta y todas las propiedades del documento.',
          },
          free: {
            title: 'Completamente gratis para siempre',
            text: 'Divide PDFs ilimitados sin registro, marcas de agua, limitaciones de tamaño de archivo o tarifas ocultas. Resultados profesionales sin costo.',
          },
        },
        compatibility: {
          title: 'Compatibilidad de navegador y requisitos del sistema',
          text: 'LocalPDF funciona en todos los navegadores modernos incluyendo Chrome 90+, Firefox 90+, Safari 14+ y Edge 90+. Compatible con dispositivos Windows, macOS, Linux, iOS y Android. No se requiere instalación de software - simplemente abre tu navegador y comienza a dividir PDFs.',
        },
        technical: {
          title: 'Tecnología avanzada de procesamiento PDF',
          text: 'Construido con bibliotecas PDF JavaScript de vanguardia incluyendo PDF.js y pdf-lib, LocalPDF ofrece capacidades de división PDF de grado profesional directamente en tu navegador. Nuestros algoritmos optimizados manejan estructuras PDF complejas, preservan la integridad del documento y soportan archivos hasta 100MB.',
        },
        security: {
          title: 'Seguridad de grado empresarial',
          text: 'Cumple con GDPR, cumple con CCPA y sigue estándares internacionales de privacidad. Tus documentos nunca salen de tu dispositivo, asegurando confidencialidad completa para archivos empresariales, legales y personales.',
        },
      },
    },
    pdfToImage: {
      title: 'PDF a imágenes',
      description: 'Convertir páginas PDF a PNG o JPEG',
    },
    imageToPdf: {
      title: 'Imágenes a PDF',
      description: 'Combinar múltiples imágenes en un documento PDF',
    },
    wordToPdf: {
      title: 'Word a PDF',
      description: 'Convertir documentos Word (.docx) a formato PDF',
    },
    excelToPdf: {
      title: 'Excel a PDF',
      description: 'Convertir hojas de cálculo Excel (.xlsx, .xls) a formato PDF',
      pageTitle: 'Convertidor Excel a PDF',
      pageDescription: 'Convierte tus archivos Excel (.xlsx, .xls) a formato PDF con soporte para múltiples hojas, tablas amplias y texto internacional. Todo el procesamiento ocurre localmente.',
      howToTitle: 'Cómo convertir Excel a PDF',
      uploadTitle: 'Subir archivo Excel',
      uploadDescription: 'Selecciona tu archivo Excel (.xlsx o .xls) desde tu dispositivo. Los archivos se procesan localmente para máxima privacidad.',
      configureTitle: 'Configurar ajustes',
      configureDescription: 'Elige qué hojas convertir, establece orientación y ajusta opciones de formato según tus necesidades.',
      downloadTitle: 'Descargar PDF',
      downloadDescription: 'Obtén tus archivos PDF convertidos instantáneamente. Cada hoja puede guardarse como PDF separado o combinarse en uno.',
      featuresTitle: '¿Por qué elegir el convertidor Excel LocalPDF?',
      privacyTitle: '100% privado y seguro',
      privacyDescription: 'Tus archivos Excel nunca salen de tu dispositivo. Toda la conversión ocurre localmente en tu navegador para máxima privacidad y seguridad.',
      fastTitle: 'Procesamiento ultrarrápido',
      fastDescription: 'Convierte archivos Excel a PDF instantáneamente sin esperar subidas o descargas. Funciona también sin conexión.',
      multiFormatTitle: 'Soporte de múltiples formatos',
      multiFormatDescription: 'Funciona con archivos .xlsx y .xls. Soporta múltiples hojas, fórmulas complejas y texto internacional.',
      freeTitle: 'Completamente gratis',
      freeDescription: 'Sin límites, sin marcas de agua, sin tarifas ocultas. Convierte archivos Excel a PDF ilimitados gratis, para siempre.',
      // Tool component translations
      chooseExcelFile: 'Elegir archivo Excel',
      dragDropSubtitle: 'Haz clic aquí o arrastra tus hojas de cálculo Excel',
      supportedFormats: 'Soporta archivos Excel (.xlsx, .xls) hasta 100MB',
      multipleSheets: 'Soporte para múltiples hojas',
      complexFormulas: 'Fórmulas complejas y formato',
      internationalText: 'Texto e idiomas internacionales',
      localProcessing: 'El procesamiento ocurre localmente en tu navegador',
      conversionCompleted: '¡Conversión completada!',
      pdfReady: 'PDF listo para descargar',
      multipleFiles: '{count} archivos PDF generados',
      fileInformation: 'Información del archivo',
      file: 'Archivo',
      size: 'Tamaño',
      sheets: 'Hojas',
      languages: 'Idiomas',
      multiLanguageNote: 'Múltiples idiomas detectados. Las fuentes apropiadas se cargarán automáticamente.',
      chooseDifferentFile: 'Elegir archivo diferente',
      conversionSettings: 'Configuración de conversión',
      selectSheets: 'Seleccionar hojas',
      selectAll: 'Seleccionar todo',
      deselectAll: 'Deseleccionar todo',
      rowsColumns: '{rows} filas × {columns} columnas',
      pageOrientation: 'Orientación de página',
      portrait: 'Vertical',
      landscape: 'Horizontal',
      pageSize: 'Tamaño de página',
      fontSize: 'Tamaño de fuente',
      outputFormat: 'Formato de salida',
      singlePdf: 'Archivo PDF único',
      separatePdfs: 'Archivos PDF separados',
      includeSheetNames: 'Incluir nombres de hojas',
      convertToPdf: 'Convertir a PDF',
      converting: 'Convirtiendo...',
      faqTitle: 'Preguntas frecuentes sobre conversión de Excel a PDF',
    },
    ocr: {
      title: 'Reconocimiento OCR',
      description: 'Extraer texto de PDFs escaneados e imágenes',
    },
  },

  imagesToPdf: {
    uploadTitle: 'Subir imágenes para convertir',
    uploadDescription: 'Convertir múltiples imágenes en un solo documento PDF',
    selectFiles: 'Seleccionar archivos de imagen',
    supportedFiles: 'Admitidos: archivos JPG, PNG, WEBP, GIF de hasta 50MB cada uno',
    successTitle: '¡PDF creado exitosamente!',
    howToTitle: 'Cómo convertir imágenes a PDF:',
    howTo: {
      uploadImages: {
        title: 'Subir imágenes',
        description: 'Seleccionar múltiples archivos de imagen desde su dispositivo'
      },
      configureSettings: {
        title: 'Configurar ajustes',
        description: 'Elegir tamaño de página, orientación y opciones de diseño de imagen'
      },
      generatePdf: {
        title: 'Generar PDF',
        description: 'Hacer clic en convertir para crear su PDF con todas las imágenes'
      }
    }
  },

  errors: {
    fileNotSupported: 'Formato de archivo no soportado',
    fileTooLarge: 'El tamaño del archivo excede el límite máximo',
    processingFailed: 'El procesamiento falló. Por favor, inténtalo de nuevo.',
    noFilesSelected: 'No se han seleccionado archivos',
    invalidFormat: 'Formato de archivo inválido',
    networkError: 'Error de red ocurrido',
    unknownError: 'Ha ocurrido un error desconocido',
  },

  footer: {
    description: 'Hecho con ❤️ para usuarios conscientes de la privacidad en todo el mundo',
    links: {
      privacy: 'Privacidad',
      terms: 'Términos',
      faq: 'FAQ',
      github: 'GitHub',
    },
    copyright: 'Sin seguimiento • Sin anuncios • Sin recolección de datos',
  },

  components: {
    relatedTools: {
      title: 'Herramientas PDF relacionadas',
      subtitle: 'También podrías querer:',
      viewAllTools: 'Ver todas las herramientas PDF',
      toolNames: {
        merge: 'Combinar PDFs',
        split: 'Dividir PDFs',
        compress: 'Comprimir PDFs',
        addText: 'Añadir texto',
        watermark: 'Añadir marca de agua',
        rotate: 'Rotar páginas',
        extractPages: 'Extraer páginas',
        extractText: 'Extraer texto',
        pdfToImage: 'PDF a imágenes',
        'word-to-pdf': 'Word a PDF',
        'excel-to-pdf': 'Excel a PDF',
        'images-to-pdf': 'Imágenes a PDF',
      },
      toolDescriptions: {
        merge: 'Combinar múltiples archivos PDF en uno',
        split: 'Dividir PDF en archivos separados',
        compress: 'Reducir el tamaño del archivo PDF',
        addText: 'Añadir texto y anotaciones',
        watermark: 'Añadir marcas de agua para proteger PDFs',
        rotate: 'Rotar páginas PDF',
        extractPages: 'Extraer páginas específicas',
        extractText: 'Obtener contenido de texto de PDFs',
        pdfToImage: 'Convertir PDF a imágenes',
        'word-to-pdf': 'Convertir documentos Word a PDF',
        'excel-to-pdf': 'Convertir hojas de cálculo Excel a PDF',
        'images-to-pdf': 'Convertir imágenes a formato PDF',
      },
      actions: {
        merge: {
          split: 'dividir tu PDF combinado',
          compress: 'comprimir el archivo combinado',
          extractPages: 'extraer páginas específicas',
        },
        split: {
          merge: 'combinar archivos divididos de nuevo',
          rotate: 'rotar páginas divididas',
          extractPages: 'extraer más páginas',
        },
        compress: {
          merge: 'combinar archivos comprimidos',
          split: 'dividir PDF comprimido',
          watermark: 'añadir marcas de agua',
        },
        addText: {
          watermark: 'añadir marcas de agua',
          rotate: 'rotar páginas anotadas',
          extractText: 'extraer todo el texto',
        },
        watermark: {
          addText: 'añadir más texto',
          compress: 'comprimir PDF con marca de agua',
          rotate: 'rotar páginas con marca de agua',
        },
        rotate: {
          addText: 'añadir texto a páginas rotadas',
          watermark: 'añadir marcas de agua',
          split: 'dividir PDF rotado',
        },
        extractPages: {
          merge: 'combinar páginas extraídas',
          rotate: 'rotar páginas extraídas',
          pdfToImage: 'convertir páginas a imágenes',
        },
        extractText: {
          addText: 'añadir más texto',
          extractPages: 'extraer páginas específicas',
          pdfToImage: 'convertir a imágenes',
        },
        pdfToImage: {
          extractPages: 'extraer más páginas',
          extractText: 'obtener contenido de texto',
          rotate: 'rotar antes de convertir',
        },
        'excel-to-pdf': {
          'word-to-pdf': 'convertir documentos a PDF',
          'images-to-pdf': 'convertir imágenes a PDF',
          merge: 'fusionar múltiples PDF',
        },
      },
    },
    fileUploadZone: {
      dropActive: 'Soltar archivos aquí',
      chooseFiles: 'Elegir archivos PDF',
      dragAndDrop: 'Arrastra y suelta archivos aquí o haz clic para seleccionar',
      maxFileSize: 'Máx. {size} por archivo',
      selectFiles: 'Seleccionar archivos',
      trustFeatures: {
        private: '100% Privado',
        fast: 'Rápido',
        free: 'Gratis',
      },
      trustMessage: 'Los archivos nunca salen de tu dispositivo • El procesamiento ocurre localmente en el navegador',
      alerts: {
        unsupportedFiles: '{count} archivo(s) omitidos debido a formato no soportado. Formatos soportados: {formats}',
        fileLimit: 'Solo se seleccionaron los primeros {count} archivos.',
      },
      accessibility: {
        uploadArea: 'Área de carga de archivos - haz clic para seleccionar archivos o arrastra y suelta',
        selectFiles: 'Seleccionar archivos para subir',
      },
    },
  },

  pages: {
    privacy: {
      title: 'Política de privacidad',
      subtitle: 'Tu privacidad es nuestra máxima prioridad',
      lastUpdated: 'Última actualización: 20 de julio de 2025',
      sections: {
        commitment: {
          title: 'Nuestro compromiso con la privacidad',
          content: 'LocalPDF está diseñado con la privacidad como base. Creemos que tus documentos y datos deben permanecer tuyos y solo tuyos. Esta Política de privacidad explica cómo LocalPDF protege tu privacidad y garantiza que tus datos nunca abandonen tu dispositivo.'
        },
        simpleAnswer: {
          title: 'La respuesta simple',
          main: 'LocalPDF no recopila, almacena, transmite ni tiene acceso a ninguno de tus datos, archivos o información personal.',
          sub: 'Todo el procesamiento de PDF ocurre completamente dentro de tu navegador web. Tus archivos nunca abandonan tu dispositivo.'
        },
        whatWeDont: {
          title: 'Lo que NO hacemos',
          noDataCollection: {
            title: 'Sin recopilación de datos',
            items: ['Sin información personal', 'Sin seguimiento de uso', 'Sin cookies analíticas', 'Sin cuentas de usuario']
          },
          noFileAccess: {
            title: 'Sin acceso a archivos',
            items: ['Sin subidas al servidor', 'Sin almacenamiento de archivos', 'Sin copias de documentos', 'Sin historial de procesamiento']
          }
        },
        howItWorks: {
          title: 'Cómo funciona LocalPDF',
          clientSide: {
            title: 'Procesamiento del lado del cliente',
            description: 'Todas las operaciones PDF ocurren directamente en tu navegador web usando:',
            items: ['Bibliotecas JavaScript PDF (pdf-lib, PDF.js, jsPDF)', 'Web Workers para optimización de rendimiento', 'Memoria local para procesamiento temporal', 'Exclusivamente los recursos de tu dispositivo']
          },
          process: {
            title: 'El proceso completo',
            steps: [
              'Seleccionas un archivo PDF desde tu dispositivo',
              'El archivo se carga en la memoria del navegador (nunca se sube)',
              'El procesamiento ocurre localmente usando JavaScript',
              'El resultado se genera en tu navegador',
              'Descargas el archivo procesado directamente',
              'Todos los datos se borran de la memoria cuando cierras la página'
            ]
          }
        },
        analytics: {
          title: 'Analíticas con privacidad primero',
          description: 'LocalPDF usa Vercel Analytics para entender cómo se usan nuestras herramientas y mejorar la experiencia del usuario. Nuestro enfoque de analíticas mantiene nuestra filosofía de privacidad primero:',
          whatWeTrack: {
            title: 'Lo que rastreamos (anónimamente)',
            items: ['Visitas a páginas - qué herramientas son más populares', 'Uso de herramientas - métricas básicas como conteos de procesamiento de archivos', 'Datos de rendimiento - tiempos de carga y errores', 'Ubicación general - solo país/región (para optimización de idioma)']
          },
          protections: {
            title: 'Protecciones de privacidad',
            items: ['Sin cookies - las analíticas funcionan sin cookies de seguimiento', 'Sin datos personales - nunca vemos tus archivos o información personal', 'Anonimización de IP - tu dirección IP exacta nunca se almacena', 'DNT respetado - respetamos las configuraciones del navegador "No rastrear"', 'Cumplimiento GDPR - todas las analíticas cumplen con las regulaciones de privacidad']
          }
        },
        compliance: {
          title: 'Cumplimiento internacional de privacidad',
          gdpr: {
            title: 'GDPR',
            description: 'Totalmente cumpliente - no se procesan datos personales'
          },
          ccpa: {
            title: 'CCPA',
            description: 'Cumpliente - sin recopilación o venta de datos'
          },
          global: {
            title: 'Global',
            description: 'El diseño con privacidad primero asegura cumplimiento mundial'
          }
        },
        summary: {
          title: 'Resumen',
          main: 'LocalPDF está diseñado para ser completamente privado por defecto. Tus archivos, datos y privacidad están protegidos porque simplemente no recopilamos, almacenamos o transmitimos ninguna de tu información.',
          sub: 'Esto no es solo una promesa de política: está integrado en la arquitectura fundamental de cómo funciona LocalPDF.'
        }
      }
    },
    faq: {
      title: 'Preguntas frecuentes',
      subtitle: 'Todo lo que necesitas saber sobre LocalPDF',
      sections: {
        general: {
          title: 'Preguntas generales',
          questions: {
            whatIs: {
              question: '¿Qué es LocalPDF?',
              answer: 'LocalPDF es una aplicación web gratuita con privacidad primero que proporciona 12 herramientas PDF poderosas para combinar, dividir, comprimir, editar y convertir archivos PDF. Todo el procesamiento ocurre completamente en tu navegador - sin subidas, sin registro, sin seguimiento.'
            },
            free: {
              question: '¿Es LocalPDF realmente gratis?',
              answer: '¡Sí! LocalPDF es completamente gratis de usar sin limitaciones, anuncios o tarifas ocultas. Creemos que las herramientas PDF esenciales deben ser accesibles para todos.'
            },
            account: {
              question: '¿Necesito crear una cuenta?',
              answer: '¡No se requiere cuenta! Simplemente visita LocalPDF y comienza a usar cualquier herramienta inmediatamente.'
            }
          }
        },
        privacy: {
          title: 'Privacidad y seguridad',
          questions: {
            uploaded: {
              question: '¿Se suben mis archivos a vuestros servidores?',
              answer: '¡No! Esta es la característica principal de LocalPDF - todo el procesamiento ocurre en tu navegador. Tus archivos nunca abandonan tu dispositivo. No podemos ver, acceder o almacenar tus documentos.'
            },
            afterUse: {
              question: '¿Qué pasa con mis archivos después de usar LocalPDF?',
              answer: 'Tus archivos se procesan en la memoria de tu navegador y se borran automáticamente cuando cierras la página o navegas fuera. Nada se almacena permanentemente.'
            },
            confidential: {
              question: '¿Es LocalPDF seguro para documentos confidenciales?',
              answer: '¡Sí! Dado que todo el procesamiento es local y no recopilamos ningún dato, LocalPDF es ideal para documentos confidenciales, sensibles o privados.'
            }
          }
        },
        technical: {
          title: 'Preguntas técnicas',
          questions: {
            browsers: {
              question: '¿Qué navegadores soportan LocalPDF?',
              answer: 'LocalPDF funciona en todos los navegadores modernos:',
              browsers: ['Chrome 90+', 'Firefox 90+', 'Safari 14+', 'Edge 90+']
            },
            fileSize: {
              question: '¿Cuál es el tamaño máximo de archivo que puedo procesar?',
              answer: 'LocalPDF puede manejar archivos de hasta 100MB. Para archivos muy grandes, el procesamiento puede tardar más dependiendo del rendimiento de tu dispositivo.'
            },
            offline: {
              question: '¿Funciona LocalPDF sin conexión?',
              answer: '¡Sí! Después de tu primera visita, LocalPDF funciona sin conexión. Tu navegador almacena en caché la aplicación, por lo que puedes usarla sin conexión a internet.'
            }
          }
        },
        tools: {
          title: 'Herramientas PDF',
          editText: {
            question: '¿Puedo editar texto existente en PDFs?',
            answer: 'Actualmente, LocalPDF permite agregar nuevo texto a PDFs pero no editar texto existente. Puedes agregar superposiciones de texto, firmas, notas y anotaciones.'
          }
        },
        support: {
          title: '¿Aún necesitas ayuda?',
          gettingSupport: {
            title: 'Obtener soporte',
            items: ['GitHub Issues: Problemas técnicos y reportes de errores', 'GitHub Discussions: Preguntas generales y ayuda de la comunidad', 'Documentación: Guías completas y tutoriales']
          },
          contact: {
            title: 'Información de contacto',
            github: 'Reportar problemas en GitHub',
            discussions: 'Unirse a las discusiones de la comunidad'
          }
        }
      }
    },
    notFound: {
      title: 'Página no encontrada',
      description: 'La página que buscas no existe.',
      backHome: 'Volver al inicio',
    },
    tools: {
      merge: {
        pageTitle: 'Combinar archivos PDF gratis',
        pageDescription: 'Combina múltiples archivos PDF en un solo documento gratis. Combinación rápida, segura y privada de PDF en tu navegador. Sin subidas, sin registro requerido.',
        uploadTitle: 'Subir archivos PDF para combinar',
        buttons: {
          remove: 'Eliminar',
          startMerging: 'Comenzar combinación ({count} archivos)',
        },
        features: {
          title: '¿Por qué elegir la herramienta de combinación LocalPDF?',
          private: {
            title: '🔒 100% Privado',
            description: 'Tus archivos nunca salen de tu dispositivo. Todo el procesamiento ocurre localmente en tu navegador para máxima privacidad y seguridad.',
          },
          fast: {
            title: '⚡ Ultrarrápido',
            description: 'Combina PDFs instantáneamente con nuestro motor de procesamiento optimizado. Sin esperas por subidas o descargas de servidores.',
          },
          free: {
            title: '🆓 Completamente gratis',
            description: 'Sin límites, sin marcas de agua, sin tarifas ocultas. Combina archivos PDF ilimitados gratis, para siempre.',
          },
        },
        howTo: {
          title: 'Cómo combinar archivos PDF',
          steps: {
            upload: {
              title: 'Subir archivos PDF',
              description: 'Haz clic en "Elegir archivos" o arrastra y suelta múltiples archivos PDF en el área de subida.',
            },
            arrange: {
              title: 'Ordenar secuencia',
              description: 'Arrastra y suelta archivos para reordenarlos. El PDF final seguirá este orden.',
            },
            download: {
              title: 'Combinar y descargar',
              description: 'Haz clic en "Combinar PDFs" y tu PDF combinado estará listo para descargar instantáneamente.',
            },
          },
        },
      },
      compress: {
        pageTitle: 'Comprimir archivos PDF gratis',
        pageDescription: 'Comprime archivos PDF para reducir el tamaño sin perder calidad. Herramienta gratuita de compresión PDF que funciona en tu navegador con configuraciones de calidad personalizables.',
        uploadTitle: 'Subir PDF para comprimir',
        uploadSubtitle: 'Selecciona un archivo PDF para reducir su tamaño',
        faqTitle: 'Preguntas frecuentes sobre compresión de PDF',
        buttons: {
          uploadDifferent: '← Subir PDF diferente',
        },
        features: {
          title: '✨ Características principales:',
          items: {
            qualitySettings: '• Configuraciones de calidad ajustables (10% - 100%)',
            imageOptimization: '• Optimización de compresión de imágenes',
            removeMetadata: '• Eliminar metadatos para archivos más pequeños',
            webOptimization: '• Optimización web para carga más rápida',
          },
        },
        privacy: {
          title: '🔒 Privacidad y seguridad:',
          items: {
            clientSide: '• 100% procesamiento del lado del cliente',
            noUploads: '• No hay subidas de archivos a servidores',
            localProcessing: '• Tus datos nunca salen de tu dispositivo',
            instantProcessing: '• Procesamiento y descarga instantáneos',
          },
        },
        benefits: {
          title: '¿Por qué elegir nuestro compresor PDF?',
          smart: {
            title: 'Compresión inteligente',
            description: 'Algoritmos avanzados reducen el tamaño del archivo mientras preservan la calidad del documento y la legibilidad',
          },
          control: {
            title: 'Control total',
            description: 'Ajusta niveles de calidad, compresión de imágenes y optimización web según tus necesidades',
          },
          private: {
            title: '100% Privado',
            description: 'Tus PDFs se procesan localmente en tu navegador - nunca se suben a ningún lugar',
          },
        },
        howTo: {
          title: 'Cómo funciona la compresión PDF',
          steps: {
            upload: {
              title: 'Subir PDF',
              description: 'Arrastra tu archivo PDF o haz clic para explorar',
            },
            settings: {
              title: 'Ajustar configuraciones',
              description: 'Elige el nivel de calidad y opciones de compresión',
            },
            compress: {
              title: 'Comprimir',
              description: 'Observa el progreso en tiempo real mientras se optimiza el archivo',
            },
            download: {
              title: 'Descargar',
              description: 'Obtén tu PDF comprimido con tamaño de archivo reducido',
            },
          },
        },
        technical: {
          title: 'Técnicas de compresión',
          compressed: {
            title: 'Qué se comprime:',
            images: '• **Imágenes:** Compresión JPEG con control de calidad',
            fonts: '• **Fuentes:** Subconjunto de caracteres no utilizados y optimización de codificación',
            streams: '• **Flujos:** Eliminar datos redundantes y comprimir contenido',
            metadata: '• **Metadatos:** Eliminación opcional de información de creación y propiedades',
          },
          quality: {
            title: 'Calidad vs. tamaño:',
            high: '• **90-100%:** Calidad casi sin pérdidas, compresión moderada',
            good: '• **70-90%:** Buena calidad, reducción significativa de tamaño',
            acceptable: '• **50-70%:** Calidad aceptable, compresión máxima',
            low: '• **Menos del 50%:** Pérdida notable de calidad, archivos más pequeños',
          },
        },
        faq: {
          items: [
            {
              id: 'compress-privacy',
              question: '¿Es segura y privada la compresión de PDF?',
              answer: 'Sí, la compresión de LocalPDF es completamente privada y segura. Toda la compresión ocurre directamente en tu navegador - tus archivos nunca se suben a ningún servidor. Esto asegura que tus documentos confidenciales permanezcan privados mientras logras una reducción óptima del tamaño del archivo.'
            },
            {
              id: 'compress-quality',
              question: '¿Cuánto puedo comprimir PDFs sin perder calidad?',
              answer: 'LocalPDF utiliza algoritmos de compresión avanzados que pueden reducir los tamaños de archivos PDF en un 50-90% mientras mantienen una excelente calidad visual. Nuestra compresión inteligente analiza cada documento y aplica configuraciones óptimas para la mejor relación tamaño-calidad.'
            },
            {
              id: 'compress-vs-others',
              question: '¿Por qué elegir LocalPDF para la compresión de PDF?',
              answer: 'LocalPDF ofrece compresión superior: Sin límites de tamaño de archivo - Comprime PDFs de cualquier tamaño; Múltiples niveles de compresión - Elige entre calidad y tamaño; Compresión por lotes - Procesa múltiples archivos; 100% Privacidad - No se requieren cargas de servidor; Completamente gratis - Sin marcas de agua o restricciones.'
            },
            {
              id: 'compress-algorithms',
              question: '¿Qué tecnología de compresión utiliza LocalPDF?',
              answer: 'LocalPDF utiliza técnicas de optimización PDF estándar de la industria incluyendo compresión de imágenes, optimización de fuentes y eliminación de metadatos. Todo el procesamiento ocurre en tu navegador usando bibliotecas JavaScript avanzadas para máxima compatibilidad y rendimiento.'
            }
          ]
        },
      },
      imageToPdf: {
        seo: {
          title: 'Conversor de Imágenes a PDF - Herramienta Online Gratuita | LocalPDF',
          description: 'Convierte múltiples imágenes (JPEG, PNG, GIF, WebP) a formato PDF instantáneamente. Conversor de imagen a PDF que prioriza la privacidad y funciona completamente en tu navegador.',
        },
        breadcrumbs: {
          home: 'Inicio',
          imageToPdf: 'Imágenes a PDF',
        },
        pageTitle: 'Conversor de Imágenes a PDF',
        pageDescription: 'Convierte múltiples imágenes en un solo documento PDF con opciones de diseño personalizables. Compatible con formatos JPEG, PNG, GIF y WebP con protección completa de privacidad.',
        uploadSection: {
          title: 'Arrastra imágenes aquí o haz clic para explorar',
          subtitle: 'Combina múltiples imágenes en un solo documento PDF',
          supportedFormats: 'JPEG, PNG, GIF, WebP',
        },
        tool: {
          title: 'Conversor de Imágenes a PDF',
          description: 'Combina múltiples imágenes en un solo documento PDF con opciones de diseño personalizadas',
          selectedImages: 'Imágenes Seleccionadas ({count})',
          clearAll: 'Limpiar Todo',
          pdfSettings: 'Configuración de PDF',
          pageSize: 'Tamaño de Página',
          pageSizeOptions: {
            a4: 'A4 (210 × 297 mm)',
            letter: 'Letter (8.5 × 11 pulgadas)',
            auto: 'Auto (ajustar contenido)'
          },
          orientation: 'Orientación',
          orientationOptions: {
            portrait: 'Vertical',
            landscape: 'Horizontal'
          },
          imageLayout: 'Diseño de Imagen',
          layoutOptions: {
            fitToPage: 'Ajustar a la página',
            actualSize: 'Tamaño real',
            fitWidth: 'Ajustar al ancho',
            fitHeight: 'Ajustar a la altura'
          },
          imageQuality: 'Calidad de Imagen ({quality}%)',
          qualitySlider: {
            lowerSize: 'Menor tamaño',
            higherQuality: 'Mayor calidad'
          },
          pageMargin: 'Margen de Página ({margin} pulgada)',
          marginSlider: {
            noMargin: 'Sin margen',
            twoInch: '2 pulgadas'
          },
          background: 'Fondo',
          backgroundOptions: {
            white: 'Blanco',
            lightGray: 'Gris claro',
            gray: 'Gris',
            black: 'Negro'
          },
          fileInfo: '{count} imagen{plural} seleccionada{plural} • Tamaño total: {size}',
          converting: 'Convirtiendo imágenes a PDF... {progress}%',
          buttons: {
            reset: 'Reiniciar',
            createPdf: 'Crear PDF',
            converting: 'Convirtiendo...'
          },
          help: {
            title: 'Cómo Usar Imágenes a PDF',
            dragDrop: 'Simplemente arrastra tus imágenes al área de carga o haz clic para navegar',
            formats: 'Soporta formatos de imagen JPEG, PNG, GIF y WebP',
            layout: 'Elige el tamaño de página, orientación y cómo las imágenes se ajustan en cada página',
            quality: 'Ajusta la calidad de imagen para equilibrar el tamaño del archivo y la calidad visual',
            privacy: 'Todo el procesamiento ocurre localmente - tus imágenes nunca dejan tu dispositivo'
          }
        },
        features: {
          title: '¿Por qué elegir nuestro conversor de imágenes a PDF?',
          private: {
            title: '100% Privado',
            description: 'Todo el procesamiento de imágenes ocurre localmente en tu navegador. Tus imágenes nunca salen de tu dispositivo.',
          },
          formats: {
            title: 'Múltiples formatos',
            description: 'Soporte para formatos de imagen JPEG, PNG, GIF y WebP con conversión de alta calidad.',
          },
          customizable: {
            title: 'Personalizable',
            description: 'Controla el tamaño de página, orientación, diseño de imagen, calidad y márgenes para resultados perfectos.',
          },
          fast: {
            title: 'Procesamiento rápido',
            description: 'Conversión ultrarrápida impulsada por tecnología de navegador moderna. Sin esperas por subidas.',
          },
          free: {
            title: 'Completamente gratis',
            description: 'Sin registro, sin límites, sin marcas de agua. Usa nuestra herramienta tantas veces como necesites.',
          },
          crossPlatform: {
            title: 'Multiplataforma',
            description: 'Funciona en cualquier dispositivo con un navegador moderno. Escritorio, tablet o móvil - te tenemos cubierto.',
          },
        },
        howTo: {
          title: 'Cómo convertir imágenes a PDF',
          steps: {
            upload: {
              title: 'Subir imágenes',
              description: 'Arrastra y suelta tus imágenes o haz clic para explorar. Selecciona múltiples imágenes en formato JPEG, PNG, GIF o WebP.',
            },
            customize: {
              title: 'Personalizar configuración',
              description: 'Elige tamaño de página, orientación, diseño de imagen, calidad y márgenes para crear el PDF perfecto.',
            },
            download: {
              title: 'Descargar PDF',
              description: 'Haz clic en "Crear PDF" y tu documento convertido estará listo para descargar en segundos.',
            },
          },
        },
      },
      wordToPdf: {
        seo: {
          title: 'Convertidor de Word a PDF - Convertir DOCX a PDF en Línea Gratis | LocalPDF',
          description: 'Convierte documentos de Word (.docx) a formato PDF gratis. Conversión de Word a PDF rápida, segura y privada que funciona completamente en tu navegador.',
          keywords: 'word a pdf, docx a pdf, convertir word a pdf, convertidor de documentos, convertidor pdf gratis',
          structuredData: {
            name: 'Convertidor de Word a PDF',
            description: 'Convertir documentos de Word (.docx) a formato PDF en línea gratis',
            permissions: 'No se requiere subida de archivos',
          },
        },
        breadcrumbs: {
          home: 'Inicio',
          wordToPdf: 'Word a PDF',
        },
        pageTitle: 'Convertidor de Word a PDF',
        pageDescription: 'Convierte tus documentos de Word (.docx) a formato PDF rápida y seguramente. Todo el procesamiento ocurre localmente en tu navegador - no se requiere subida de archivos.',
        howTo: {
          title: 'Cómo convertir Word a PDF',
          steps: {
            choose: {
              title: 'Elegir archivo',
              description: 'Selecciona tu documento de Word (archivo .docx)',
            },
            convert: {
              title: 'Convertir',
              description: 'La conversión automática comienza inmediatamente',
            },
            download: {
              title: 'Descargar',
              description: 'Tu archivo PDF se descarga automáticamente',
            },
          },
        },
        features: {
          title: '¿Por qué elegir nuestro convertidor de Word a PDF?',
          privacy: {
            title: '🔒 Privacidad primero',
            description: 'Tus documentos nunca salen de tu dispositivo. Toda la conversión ocurre localmente en tu navegador.',
          },
          fast: {
            title: '⚡ Rápido y gratis',
            description: 'Conversión instantánea sin límites de tamaño de archivo o marcas de agua. Completamente gratis de usar.',
          },
          compatible: {
            title: '📱 Funciona en todas partes',
            description: 'Compatible con todos los dispositivos y navegadores. No se requiere instalación de software.',
          },
          quality: {
            title: '✨ Alta calidad',
            description: 'Preserva el formato original, fuentes y diseño para resultados profesionales.',
          },
        },
        tool: {
          uploadTitle: 'Elegir documento Word',
          uploadSubtitle: 'Haz clic aquí o arrastra y suelta tu archivo .docx',
          supportedFormats: 'Soporta Microsoft Word (.docx) hasta 50MB',
          compatibility: {
            msWord: '✓ Funciona con archivos .docx de Microsoft Word',
            googleDocs: '✓ Funciona con archivos .docx de Google Docs',
            docWarning: '⚠️ Los archivos .doc necesitan ser convertidos a .docx primero',
            localProcessing: '✓ El procesamiento ocurre localmente en tu navegador'
          },
          messages: {
            conversionCompleted: '¡Conversión completada!',
            conversionFailed: 'Error en la conversión'
          },
          preview: {
            title: 'Vista previa del PDF',
            description: 'Convierte tu documento para ver la vista previa aquí'
          },
          settings: {
            title: 'Configuraciones de conversión'
          },
          buttons: {
            converting: 'Convirtiendo...',
            convertToPdf: 'Convertir a PDF',
            chooseDifferent: 'Elegir archivo diferente'
          },
          fileInfo: {
            title: 'Información del archivo',
            fileName: 'Archivo',
            fileSize: 'Tamaño',
            fileType: 'Tipo',
            microsoftWord: 'Microsoft Word (.docx)',
            privacyNote: 'Todo el procesamiento ocurre localmente en tu navegador para máxima privacidad'
          },
          faqTitle: 'Preguntas frecuentes sobre la conversión de Word a PDF'
        },
        faq: {
          items: [
            {
              id: 'word-to-pdf-privacy',
              question: '¿Es segura la conversión de Word a PDF?',
              answer: '¡Sí, completamente segura! LocalPDF convierte documentos Word a PDF completamente en tu navegador. Tus documentos nunca se suben a ningún servidor, garantizando confidencialidad completa para documentos comerciales, currículums, contratos o archivos personales.'
            },
            {
              id: 'word-to-pdf-formatting',
              question: '¿LocalPDF preserva el formato de los documentos Word?',
              answer: 'LocalPDF mantiene todo el formato, fuentes, imágenes, tablas y diseño de tu documento Word original. El PDF resultante se ve exactamente como tu documento Word, haciéndolo perfecto para documentos profesionales y presentaciones oficiales.'
            },
            {
              id: 'word-to-pdf-compatibility',
              question: '¿Qué formatos de documentos Word son compatibles?',
              answer: 'LocalPDF soporta formatos modernos de Word incluyendo: .docx (Word 2007 y más reciente), .doc (documentos Word heredados), .docm (documentos con macros habilitadas). Todas las versiones mantienen compatibilidad y formato completos.'
            }
          ]
        },
      },
      ocr: {
        seo: {
          title: 'Reconocimiento de Texto OCR - Extraer Texto de PDF e Imágenes | LocalPDF',
          description: 'Extrae texto de archivos PDF e imágenes usando tecnología OCR avanzada. Soporte mejorado para ruso y 10+ otros idiomas con protección completa de privacidad.',
          keywords: 'OCR, reconocimiento de texto, PDF a texto, imagen a texto, extraer texto, OCR ruso, Tesseract',
        },
        breadcrumbs: {
          home: 'Inicio',
          ocr: 'Reconocimiento de Texto OCR',
        },
        pageTitle: 'Reconocimiento de Texto OCR',
        pageDescription: 'Extrae texto de archivos PDF e imágenes usando tecnología OCR avanzada. Soporte mejorado para ruso y 10+ otros idiomas con detección automática.',
        features: {
          private: {
            title: '100% Privado',
            description: 'Todo el procesamiento ocurre en tu navegador',
          },
          russian: {
            title: 'Soporte Ruso',
            description: 'Reconocimiento mejorado para texto cirílico',
          },
          fast: {
            title: 'Rápido y Preciso',
            description: 'Tecnología avanzada Tesseract.js',
          },
        },
        languages: {
          title: 'Idiomas Soportados',
          items: {
            russian: 'Ruso',
            english: 'Inglés',
            german: 'Alemán',
            french: 'Francés',
            spanish: 'Español',
            italian: 'Italiano',
            polish: 'Polaco',
            ukrainian: 'Ucraniano',
            dutch: 'Holandés',
            portuguese: 'Portugués',
          },
        },
      },
      extractPages: {
        pageTitle: 'Extraer Páginas PDF Gratis',
        pageDescription: 'Extrae páginas específicas de documentos PDF gratis. Crea nuevos PDFs a partir de páginas seleccionadas con control total sobre la selección de páginas.',
        uploadTitle: 'Subir PDF para Extraer Páginas',
        uploadSubtitle: 'Selecciona un archivo PDF para extraer páginas específicas',
        buttons: {
          uploadDifferent: '← Subir PDF Diferente',
        },
        features: {
          title: '✨ Características Clave:',
          items: {
            individual: '• Extraer páginas individuales o rangos de páginas',
            custom: '• Selección de páginas personalizada (ej. "1-5, 8, 10-12")',
            preview: '• Vista previa visual y selección de páginas',
            quality: '• Preservar la calidad PDF original',
          },
        },
        privacy: {
          title: '🔒 Privacidad y Seguridad:',
          items: {
            clientSide: '• 100% procesamiento del lado del cliente',
            noUploads: '• No hay subidas de archivos a servidores',
            localProcessing: '• Tus datos nunca salen de tu dispositivo',
            instantProcessing: '• Procesamiento y descarga instantáneos',
          },
        },
        benefits: {
          title: '¿Por qué Elegir Nuestro Extractor de Páginas PDF?',
          fast: {
            title: 'Ultrarrápido',
            description: 'Extrae páginas instantáneamente con nuestro procesamiento optimizado basado en navegador',
          },
          precise: {
            title: 'Control Preciso',
            description: 'Selecciona exactamente las páginas que necesitas con nuestras herramientas de selección intuitivas',
          },
          private: {
            title: '100% Privado',
            description: 'Tus PDFs se procesan localmente en tu navegador - nunca se suben a ningún lugar',
          },
        },
        howTo: {
          title: 'Cómo Extraer Páginas PDF',
          steps: {
            upload: {
              title: 'Subir PDF',
              description: 'Arrastra tu archivo PDF o haz clic para explorar',
            },
            select: {
              title: 'Seleccionar Páginas',
              description: 'Elige páginas individuales o rangos',
            },
            extract: {
              title: 'Extraer',
              description: 'Haz clic en extraer para procesar tu selección',
            },
            download: {
              title: 'Descargar',
              description: 'Obtén tu nuevo PDF con las páginas seleccionadas',
            },
          },
        },
      },
      extractText: {
        pageTitle: 'Extraer Texto de PDF Gratis',
        pageDescription: 'Extrae contenido de texto de archivos PDF gratis. Obtén texto plano de documentos PDF con formato inteligente. Extracción de texto que prioriza la privacidad en tu navegador.',
        steps: {
          upload: 'Paso 1: Sube tu archivo PDF',
          choose: 'Paso 2: Elige opciones de extracción (formato inteligente recomendado)',
          download: 'Paso 3: Descarga el texto extraído como archivo .txt',
        },
        tool: {
          title: 'Extraer Texto',
          description: 'Extrae y formatea inteligentemente el contenido de texto de tus PDFs',
          fileToExtract: 'Archivo para extraer texto:',
          extractionOptions: 'Opciones de Extracción:',
          smartFormatting: 'Habilitar Formato Inteligente (Recomendado)',
          smartFormattingDesc: 'Limpiar automáticamente el texto, corregir saltos de línea, detectar títulos y mejorar la legibilidad',
          formattingLevel: 'Nivel de Formato:',
          levels: {
            minimal: {
              title: 'Mínimo',
              desc: 'Limpieza básica - fusionar palabras rotas, eliminar espacios extra'
            },
            standard: {
              title: 'Estándar',
              desc: 'Recomendado - párrafos, títulos, listas, formato limpio'
            },
            advanced: {
              title: 'Avanzado',
              desc: 'Máximo - todas las características más detección de estructura mejorada'
            }
          },
          includeMetadata: 'Incluir metadatos del documento (título, autor, fecha de creación)',
          preserveFormatting: 'Preservar formato de página (incluir números de página y separadores)',
          pageRange: 'Extraer rango de páginas específico (predeterminado: todas las páginas)',
          pageRangeFields: {
            startPage: 'Página de Inicio',
            endPage: 'Página Final',
            note: 'Deja la página final vacía o igual a la página de inicio para extraer una sola página'
          },
          extracting: 'Extrayendo texto... {progress}%',
          success: {
            title: '¡Extracción de Texto Completada!',
            pagesProcessed: 'Páginas procesadas: {count}',
            textLength: 'Longitud del texto: {length} caracteres',
            documentTitle: 'Título del documento: {title}',
            author: 'Autor: {author}',
            smartFormattingApplied: 'Formato Inteligente Aplicado ({level})',
            fileDownloaded: 'Archivo descargado automáticamente como .txt',
            noTextWarning: 'Este PDF puede contener imágenes escaneadas sin texto extraíble',
            comparisonPreview: 'Vista Previa de Mejoras de Formato:',
            before: 'Antes (Crudo):',
            after: 'Después (Formato Inteligente):',
            notice: '↑ ¡Nota el formato mejorado, palabras fusionadas y mejor estructura!',
            textPreview: 'Vista Previa del Texto Extraído:'
          },
          infoBox: {
            title: 'Extracción de Texto Inteligente',
            description: 'Usando PDF.js con formato inteligente para extraer texto limpio y legible. El formato inteligente corrige automáticamente problemas comunes del texto PDF como palabras rotas, saltos de línea desordenados y estructura pobre.'
          },
          privacy: {
            title: 'Privacidad y Seguridad',
            description: 'La extracción y formato de texto ocurren localmente en tu navegador. El contenido de tu PDF nunca deja tu dispositivo, asegurando completa privacidad y seguridad.'
          },
          buttons: {
            extractText: 'Extraer Texto',
            extracting: 'Extrayendo Texto...'
          }
        }
      },
      addText: {
        pageTitle: 'Agregar Texto a PDF Gratis',
        pageDescription: 'Agrega texto personalizado a archivos PDF gratis. Inserta texto, firmas y anotaciones. Editor de texto PDF que prioriza la privacidad y funciona en tu navegador.',
        steps: {
          upload: 'Paso 1: Sube tu archivo PDF',
          click: 'Paso 2: Haz clic en el PDF para agregar texto',
          save: 'Paso 3: Guarda tu PDF modificado',
        },
      },
      rotate: {
        pageTitle: 'Rotar Páginas PDF Gratis',
        pageDescription: 'Rota páginas PDF 90°, 180° o 270° gratis. Corrige la orientación de documentos rápida y fácilmente con nuestra herramienta de rotación PDF basada en navegador.',
        uploadTitle: 'Subir PDF para Rotar Páginas',
        uploadSubtitle: 'Selecciona un archivo PDF para rotar sus páginas',
        buttons: {
          uploadDifferent: '← Subir PDF Diferente',
        },
        features: {
          title: '✨ Características Clave:',
          items: {
            angles: '• Rotar páginas 90°, 180° o 270°',
            selection: '• Rotar todas las páginas o seleccionar específicas',
            preview: '• Vista previa de páginas antes de rotar',
            quality: '• Preservar calidad PDF original',
          },
        },
        privacy: {
          title: '🔒 Privacidad y Seguridad:',
          items: {
            clientSide: '• 100% procesamiento del lado del cliente',
            noUploads: '• No hay subidas de archivos a servidores',
            localProcessing: '• Tus datos nunca salen de tu dispositivo',
            instantProcessing: '• Procesamiento y descarga instantáneos',
          },
        },
        benefits: {
          title: '¿Por qué Elegir Nuestro Rotador de Páginas PDF?',
          instant: {
            title: 'Rotación Instantánea',
            description: 'Rota páginas instantáneamente con nuestro procesamiento optimizado basado en navegador',
          },
          precise: {
            title: 'Control Preciso',
            description: 'Elige ángulos de rotación exactos y selecciona páginas específicas para rotar',
          },
          private: {
            title: '100% Privado',
            description: 'Tus PDFs se procesan localmente en tu navegador - nunca se suben a ningún lugar',
          },
        },
        howTo: {
          title: 'Cómo Rotar Páginas PDF',
          steps: {
            upload: {
              title: 'Subir PDF',
              description: 'Arrastra tu archivo PDF o haz clic para explorar',
            },
            select: {
              title: 'Seleccionar Páginas',
              description: 'Elige qué páginas rotar',
            },
            angle: {
              title: 'Elegir Ángulo',
              description: 'Selecciona rotación: 90°, 180° o 270°',
            },
            download: {
              title: 'Descargar',
              description: 'Obtén tu PDF con páginas rotadas',
            },
          },
        },
      },
      watermark: {
        pageTitle: 'Agregar Marca de Agua a PDF Gratis',
        pageDescription: 'Agrega marcas de agua de texto o imagen a archivos PDF gratis. Protege tus documentos con marcas de agua personalizadas. Marca de agua PDF segura en tu navegador.',
        steps: {
          upload: 'Paso 1: Sube tu archivo PDF',
          configure: 'Paso 2: Configura las opciones de marca de agua',
          download: 'Paso 3: Descarga tu PDF con marca de agua',
        },
      },
      pdfToImage: {
        pageTitle: 'Convertir PDF a Imágenes Gratis',
        pageDescription: 'Convierte páginas PDF a imágenes gratis. Exporta PDF como JPG, PNG o WEBP. Conversión de alta calidad en tu navegador.',
        steps: {
          upload: 'Paso 1: Sube tu archivo PDF',
          format: 'Paso 2: Elige el formato de salida (PNG, JPG, WEBP)',
          download: 'Paso 3: Descarga tus imágenes convertidas',
        },
      },
      excelToPdf: {
        seo: {
          title: 'Convertidor Excel a PDF - Convertir XLSX a PDF Online Gratis | LocalPDF',
          description: 'Convierte archivos Excel (.xlsx, .xls) a formato PDF gratis. Soporte para múltiples hojas, tablas amplias e idiomas internacionales. Rápido, seguro y privado.',
          keywords: 'excel a pdf, xlsx a pdf, xls a pdf, hoja de cálculo a pdf, convertidor excel',
          structuredData: {
            name: 'Convertidor Excel a PDF',
            description: 'Convierte hojas de cálculo Excel a formato PDF online gratis',
            permissions: 'No requiere subida de archivos',
          },
        },
        breadcrumbs: {
          home: 'Inicio',
          excelToPdf: 'Excel a PDF',
        },
        pageTitle: 'Convertidor Excel a PDF',
        pageDescription: 'Convierte tus archivos Excel (.xlsx, .xls) a formato PDF con soporte para múltiples hojas, tablas amplias y texto internacional. Todo el procesamiento ocurre localmente.',
        howTo: {
          title: 'Cómo Convertir Excel a PDF',
          steps: {
            upload: {
              title: 'Subir Archivo Excel',
              description: 'Selecciona tu archivo Excel (.xlsx o .xls) desde tu dispositivo. Los archivos se procesan localmente para máxima privacidad.',
            },
            configure: {
              title: 'Configurar Ajustes',
              description: 'Elige qué hojas convertir, establece orientación y ajusta opciones de formato según tus necesidades.',
            },
            download: {
              title: 'Descargar PDF',
              description: 'Obtén tus archivos PDF convertidos instantáneamente. Cada hoja puede guardarse como PDF separado o combinarse en uno.',
            },
          },
        },
        features: {
          title: '¿Por Qué Elegir el Convertidor Excel LocalPDF?',
          privacy: {
            title: '100% Privado y Seguro',
            description: 'Tus archivos Excel nunca salen de tu dispositivo. Toda la conversión ocurre localmente en tu navegador para máxima privacidad y seguridad.',
          },
          fast: {
            title: 'Procesamiento Ultra Rápido',
            description: 'Convierte archivos Excel a PDF instantáneamente sin esperar subidas o descargas. Funciona también sin conexión.',
          },
          multiFormat: {
            title: 'Soporte de Múltiples Formatos',
            description: 'Funciona con archivos .xlsx y .xls. Soporta múltiples hojas, fórmulas complejas y texto internacional.',
          },
          free: {
            title: 'Completamente Gratis',
            description: 'Sin límites, sin marcas de agua, sin tarifas ocultas. Convierte archivos Excel a PDF ilimitados gratis, para siempre.',
          },
        },
        steps: {
          upload: 'Paso 1: Sube tu archivo Excel (.xlsx o .xls)',
          configure: 'Paso 2: Selecciona hojas y configura ajustes de conversión',
          download: 'Paso 3: Descarga tus archivos PDF convertidos',
        },
      },
    },
    gdpr: {
      title: 'Cumplimiento GDPR - LocalPDF | Procesamiento PDF centrado en privacidad',
      description: 'Conozca el cumplimiento GDPR de LocalPDF. Garantizamos protección completa de datos con procesamiento 100% local, sin cargas y con privacidad completa del usuario.',
      lastUpdated: 'Última actualización',
      sections: {
        introduction: {
          title: 'Introducción al Cumplimiento GDPR',
          content: 'El Reglamento General de Protección de Datos (GDPR) es una ley integral de protección de datos que entró en vigor el 25 de mayo de 2018. LocalPDF está diseñado desde cero para superar los requisitos del GDPR garantizando privacidad completa de datos a través del procesamiento local.'
        },
        localProcessing: {
          title: 'Procesamiento Local y Protección de Datos',
          content: 'LocalPDF opera completamente dentro de su navegador, garantizando que sus documentos y datos personales nunca salgan de su dispositivo:',
          benefits: [
            'No hay cargas de archivos a servidores externos',
            'No hay recolección o almacenamiento de datos personales',
            'Control completo sobre sus documentos',
            'Procesamiento instantáneo sin dependencia de internet'
          ]
        },
        rights: {
          title: 'Sus Derechos GDPR',
          content: 'Bajo el GDPR, tiene derechos específicos respecto a sus datos personales. Con LocalPDF, la mayoría de estos derechos están automáticamente protegidos:',
          list: {
            access: {
              title: 'Derecho de Acceso',
              description: 'Como no recopilamos datos, no hay nada a lo que acceder.'
            },
            portability: {
              title: 'Portabilidad de Datos',
              description: 'Sus datos permanecen en su dispositivo y son completamente portables.'
            },
            erasure: {
              title: 'Derecho al Olvido',
              description: 'Limpie la caché de su navegador para eliminar cualquier dato temporal.'
            },
            objection: {
              title: 'Derecho de Oposición',
              description: 'Usted controla todo el procesamiento - no ocurre procesamiento externo.'
            }
          }
        },
        minimization: {
          title: 'Principio de Minimización de Datos',
          content: 'El GDPR requiere procesar solo los datos mínimos necesarios. LocalPDF va más allá al no procesar NINGÚN dato personal.',
          emphasis: 'Recopilamos cero información personal, rastreamos cero comportamiento de usuario y almacenamos cero datos de usuario.'
        },
        legalBasis: {
          title: 'Base Legal para el Procesamiento',
          content: 'Cuando se requiere procesamiento, nos basamos en las siguientes bases legales compatibles con GDPR:',
          bases: {
            consent: {
              title: 'Consentimiento',
              description: 'Cuando elige usar nuestras herramientas, proporciona consentimiento implícito para el procesamiento local.'
            },
            legitimate: {
              title: 'Interés Legítimo',
              description: 'Proporcionar herramientas PDF sin comprometer su privacidad sirve a nuestro interés comercial legítimo.'
            }
          }
        },
        contact: {
          title: 'Contacto del Oficial de Protección de Datos',
          content: 'Para cualquier pregunta o inquietud relacionada con GDPR, por favor contáctenos:'
        }
      }
    },
    terms: {
      title: 'Términos de Servicio',
      subtitle: 'Términos claros y justos para usar LocalPDF',
      lastUpdated: 'Última actualización: 15 de enero de 2025',
      sections: {
        introduction: {
          title: 'Introducción',
          content: 'Bienvenido a LocalPDF, la plataforma de procesamiento PDF centrada en la privacidad. Estos Términos de Servicio rigen su uso de nuestras herramientas PDF gratuitas y de código abierto que procesan archivos completamente dentro de su navegador para máxima seguridad y privacidad.'
        },
        acceptance: {
          title: 'Aceptación de Términos',
          content: 'Al acceder o usar LocalPDF, usted acepta estar obligado por estos Términos de Servicio y nuestra Política de Privacidad. Si no está de acuerdo con estos términos, por favor no use nuestro servicio.'
        },
        serviceDescription: {
          title: 'Descripción del Servicio',
          content: 'LocalPDF proporciona herramientas gratuitas de procesamiento PDF basadas en navegador incluyendo fusión, división, compresión, conversión y funcionalidades de edición. Todo el procesamiento ocurre localmente en su navegador sin cargas de archivos.',
          features: {
            title: 'Nuestras Herramientas Incluyen:',
            list: [
              'Fusión PDF - Combinar múltiples PDFs en uno',
              'División PDF - Extraer páginas o dividir documentos',
              'Compresión PDF - Reducir tamaño de archivo manteniendo calidad',
              'Word a PDF - Convertir documentos a formato PDF',
              'Agregar Texto y Marcas de Agua - Personalizar sus documentos',
              'Conversión de Imágenes - Convertir entre PDF y formatos de imagen',
              'Reconocimiento de Texto OCR - Extraer texto de documentos escaneados',
              'Y más herramientas PDF centradas en privacidad'
            ]
          }
        },
        usageRules: {
          title: 'Reglas de Uso',
          allowed: {
            title: 'Usted Puede:',
            items: [
              'Usar todas las herramientas para propósitos personales y comerciales',
              'Procesar archivos y tamaños de archivo ilimitados',
              'Acceder al servicio desde cualquier dispositivo o navegador',
              'Contribuir al proyecto de código abierto en GitHub',
              'Bifurcar y modificar el código bajo nuestra licencia',
              'Usar sin conexión cuando se haya cargado previamente'
            ]
          },
          prohibited: {
            title: 'No Debe:',
            items: [
              'Cargar archivos maliciosos o malware',
              'Intentar ingeniería inversa de nuestros algoritmos de procesamiento',
              'Usar el servicio para actividades ilegales',
              'Intentar sobrecargar o atacar nuestra infraestructura',
              'Violar cualquier ley o regulación aplicable',
              'Infringir derechos de propiedad intelectual'
            ]
          }
        },
        privacy: {
          title: 'Privacidad y Protección de Datos',
          localProcessing: 'LocalPDF procesa todos los archivos localmente en su navegador. Sus archivos nunca abandonan su dispositivo.',
          noDataCollection: 'No recopilamos, almacenamos ni tenemos acceso a sus archivos o datos personales. Vea nuestra Política de Privacidad para detalles completos.',
          privacyPolicyLink: 'Leer nuestra Política de Privacidad completa →'
        },
        intellectualProperty: {
          title: 'Propiedad Intelectual',
          openSource: {
            title: 'Licencia de Código Abierto',
            content: 'LocalPDF es software de código abierto disponible bajo la licencia MIT. Usted es libre de usar, modificar y distribuir el código.',
            githubLink: 'Ver código fuente en GitHub →'
          },
          userContent: {
            title: 'Su Contenido',
            content: 'Usted mantiene todos los derechos sobre los archivos que procesa con LocalPDF. Dado que el procesamiento ocurre localmente, nunca accedemos a su contenido.'
          }
        },
        disclaimers: {
          title: 'Descargos de Responsabilidad',
          asIs: 'LocalPDF se proporciona "tal como está" sin garantías de ningún tipo.',
          noWarranties: 'Aunque nos esforzamos por la confiabilidad, no podemos garantizar servicio ininterrumpido o libre de errores.',
          limitations: [
            'La disponibilidad del servicio puede variar según la compatibilidad del navegador',
            'La velocidad de procesamiento depende de las capacidades de su dispositivo',
            'Los archivos grandes pueden causar problemas de rendimiento en dispositivos más antiguos',
            'No somos responsables por corrupción de archivos o pérdida de datos'
          ]
        },
        liability: {
          title: 'Limitación de Responsabilidad',
          limitation: 'LocalPDF y sus desarrolladores no serán responsables por ningún daño que surja del uso del servicio.',
          maxLiability: 'Nuestra responsabilidad está limitada al máximo permitido por la ley.'
        },
        changes: {
          title: 'Cambios a los Términos',
          notification: 'Podemos actualizar estos términos ocasionalmente. Los cambios se publicarán en esta página con una fecha actualizada.',
          effective: 'El uso continuo de LocalPDF después de los cambios constituye aceptación de los nuevos términos.'
        },
        contact: {
          title: 'Información de Contacto',
          description: '¿Preguntas sobre estos términos? Estamos aquí para ayudar.',
          github: 'Problemas y Soporte',
          website: 'Sitio Web'
        }
      }
    }
  },
};

export default es;
