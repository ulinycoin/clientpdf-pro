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
    split: {
      title: 'Dividir PDF',
      description: 'Dividir PDF en páginas separadas o rangos',
    },
    compress: {
      title: 'Comprimir PDF',
      description: 'Reducir el tamaño del archivo PDF manteniendo la calidad',
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
    ocr: {
      title: 'Reconocimiento OCR',
      description: 'Extraer texto de PDFs escaneados e imágenes',
    },
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
    },
    faq: {
      title: 'Preguntas frecuentes',
      subtitle: 'Todo lo que necesitas saber sobre LocalPDF',
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
      },
      split: {
        pageTitle: 'Dividir archivos PDF gratis',
        pageDescription: 'Divide archivos PDF por páginas o rangos gratis. Extrae páginas específicas de documentos PDF. División privada y segura de PDF en tu navegador.',
        uploadTitle: 'Subir PDF para dividir',
        buttons: {
          startSplitting: 'Comenzar división',
        },
        features: {
          title: 'Características avanzadas de división PDF',
          pageRanges: {
            title: '📄 Rangos de páginas',
            description: 'Divide por rangos de páginas específicos (ej. 1-5, 10-15) o extrae páginas individuales con precisión.',
          },
          batchProcessing: {
            title: '⚡ Procesamiento por lotes',
            description: 'Procesa múltiples rangos de páginas a la vez. Crea varios PDFs desde un documento fuente de manera eficiente.',
          },
          previewMode: {
            title: '👁️ Modo vista previa',
            description: 'Previsualiza las páginas antes de dividir para asegurar que extraes el contenido correcto de tu PDF.',
          },
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
    },
  },
};
