/**
 * Home page translations for ES language
 * Contains: hero section, tools grid, privacy section, upload area
 */

export const home = {
  whyChooseTitle: '¿Por qué elegir LocalPDF?',
  whyChooseSubtitle: 'Enfoque moderno al procesamiento PDF con máxima protección de datos',
  hero: {
    title: 'LocalPDF',
    subtitle: 'Herramientas PDF centradas en la privacidad',
    description: 'Herramientas profesionales de procesamiento PDF que funcionan completamente en tu navegador',
    descriptionSecondary: 'Sin subidas • Sin seguimiento • Sin límites • Completamente gratis para siempre',
    badges: [
      { icon: '🔐', text: 'Procesamiento local', description: 'Tus archivos nunca salen de tu dispositivo' },
      { icon: '⚡', text: 'Resultados instantáneos', description: 'No se requieren subidas al servidor' },
      { icon: '🌐', text: 'Funciona sin conexión', description: 'Internet solo necesario para la primera carga' },
      { icon: '🔓', text: 'Sin registro', description: 'Empieza a usar ahora mismo' }
    ],
    getStarted: 'Empezar',
    learnMore: 'Saber más',
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
    categories: {
      core: {
        title: 'Herramientas básicas',
        description: 'Las operaciones PDF más populares'
      },
      advanced: {
        title: 'Funciones avanzadas',
        description: 'Herramientas potentes para trabajo profesional'
      },
      conversion: {
        title: 'Conversión de archivos',
        description: 'Conversión entre diferentes formatos'
      },
      enhancement: {
        title: 'Mejora de documentos',
        description: 'Agregar texto, marcas de agua y otros elementos'
      }
    },
    trustIndicators: {
      private: '100% Privado',
      noUploads: 'Sin subidas',
      unlimited: 'Ilimitado'
    },
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
    stats: {
      tools: 'Herramientas',
      toolsDescription: 'Todas las funciones necesarias',
    },
  },
  // Trust signals section
  trustSignals: {
    title: 'Millones de usuarios confían en LocalPDF',
    subtitle: 'Únete a la comunidad de profesionales que valoran la privacidad y la velocidad',
    stats: {
      filesProcessed: 'Archivos procesados',
      filesDescription: 'Documentos PDF procesados sin una sola filtración de datos',
      happyUsers: 'Usuarios satisfechos',
      usersDescription: 'Los profesionales nos confían sus documentos',
      countriesUsing: 'Países usando',
      countriesDescription: 'LocalPDF funciona en todo el mundo',
    },
    security: {
      title: 'Seguridad y cumplimiento',
      sslSecured: 'SSL Seguro',
      gdprCompliant: 'Compatible GDPR',
      localProcessing: 'Procesamiento local',
      openSource: 'Código abierto',
    },
  },
  // Quick start section
  quickStart: {
    title: '¿Cómo funciona?',
    subtitle: 'Tres pasos simples hacia resultados perfectos',
    steps: {
      step1: {
        title: 'Elegir herramienta',
        description: 'Encuentra la herramienta PDF que necesitas de nuestra colección',
      },
      step2: {
        title: 'Subir archivos',
        description: 'Arrastra y suelta archivos o haz clic para seleccionar',
      },
      step3: {
        title: 'Descargar resultado',
        description: 'Obtén instantáneamente tus archivos procesados',
      },
    },
    stats: {
      averageTime: 'Tiempo promedio de procesamiento',
      dataSentToServers: 'Datos enviados a servidores',
      privacyGuaranteed: 'Privacidad garantizada',
    },
  },
  // Privacy benefits section
  privacyBenefits: {
    benefits: {
      privacy: {
        title: 'Privacidad completa',
        description: 'Tus archivos se procesan localmente en el navegador y nunca salen de tu dispositivo',
      },
      speed: {
        title: 'Velocidad instantánea',
        description: 'El procesamiento de archivos ocurre instantáneamente sin subir a servidores',
      },
      offline: {
        title: 'Funciona sin conexión',
        description: 'Después de la primera carga, el sitio funciona sin conexión a internet',
      },
      unlimited: {
        title: 'Sin límites',
        description: '{{toolsCount}} herramientas para cualquier tarea. Procesa archivos ilimitados',
      },
    },
    cta: '¿Listo para empezar? Elige entre {{toolsCount}} herramientas abajo',
  },
};