/**
 * Static pages translations for ES language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber sobre LocalPDF - herramientas PDF centradas en la privacidad',
    searchPlaceholder: 'Buscar respuestas...',
    searchNoResults: 'No se encontraron preguntas. Prueba con otras palabras clave o',
    searchContactLink: 'contacta con nuestro soporte',

    // Popular questions section (Top 4-5 most important)
    popular: {
      title: 'Preguntas más populares',
      subtitle: 'Respuestas rápidas a lo que más preguntan los usuarios'
    },

    // Categories with questions
    categories: {
      privacy: {
        id: 'privacy',
        title: 'Privacidad y Seguridad',
        icon: '🔒',
        description: 'Descubre cómo protegemos tus datos y garantizamos privacidad completa',
        questions: [
          {
            id: 'files-uploaded',
            question: '¿Se suben mis archivos PDF a sus servidores?',
            answer: '¡No, absolutamente no! Todo el procesamiento de PDF ocurre <strong>100% localmente en tu navegador</strong>. Tus archivos nunca dejan tu dispositivo - no se suben a nuestros servidores ni a servicios en la nube. Esto garantiza privacidad y seguridad completas para tus documentos confidenciales.',
            keywords: ['subir', 'servidor', 'nube', 'privacidad', 'local'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf'],
            relatedPages: ['/privacy', '/gdpr'],
            popular: true
          },
          {
            id: 'data-collection',
            question: '¿Qué datos recopilan sobre mí?',
            answer: 'Recopilamos <strong>análisis anónimos mínimos</strong> para mejorar nuestro servicio: vistas de páginas, tipo de navegador y ubicación a nivel de país. <strong>Nunca recopilamos</strong>: nombres de archivos, contenidos de archivos, información personal o historial de procesamiento. Lee nuestra <a href="/privacy">Política de Privacidad</a> completa para más detalles.',
            keywords: ['datos', 'recopilar', 'análisis', 'seguimiento', 'gdpr'],
            relatedPages: ['/privacy', '/gdpr', '/terms'],
            popular: true
          },
          {
            id: 'confidential-docs',
            question: '¿Puedo procesar documentos confidenciales o sensibles?',
            answer: '¡Sí! LocalPDF es <strong>perfecto para documentos confidenciales</strong> porque todo se procesa localmente. Tus archivos sensibles (contratos, informes financieros, documentos legales) nunca dejan tu computadora. A diferencia de los servicios en línea que suben archivos a servidores, procesamos todo en tu navegador.',
            keywords: ['confidencial', 'sensible', 'seguro', 'legal', 'financiero'],
            relatedTools: ['/protect-pdf', '/watermark-pdf'],
            relatedPages: ['/privacy', '/gdpr']
          },
          {
            id: 'after-processing',
            question: '¿Qué sucede con mis archivos después del procesamiento?',
            answer: 'Los archivos se <strong>borran automáticamente de la memoria del navegador</strong> cuando cierras la página o navegas a otra parte. Como el procesamiento es local, no hay archivos almacenados en servidores. Tienes control total - descarga tus resultados y cierra la página cuando termines.',
            keywords: ['eliminar', 'borrar', 'almacenamiento', 'caché'],
            relatedPages: ['/privacy']
          },
          {
            id: 'internet-required',
            question: '¿Necesito conexión a internet para usar LocalPDF?',
            answer: 'Solo para la <strong>carga inicial de la página</strong>. Después de eso, ¡puedes procesar PDFs completamente sin conexión! Las bibliotecas de procesamiento se cargan en tu navegador, así que puedes trabajar sin internet. Perfecto para trabajar con documentos sensibles en aviones o en entornos seguros.',
            keywords: ['sin conexión', 'internet', 'conexión', 'red'],
            popular: true
          }
        ]
      },

      features: {
        id: 'features',
        title: 'Funciones y Herramientas',
        icon: '🛠️',
        description: 'Explora nuestras herramientas PDF y sus capacidades',
        questions: [
          {
            id: 'available-tools',
            question: '¿Qué herramientas PDF están disponibles?',
            answer: 'LocalPDF ofrece <strong>más de 15 herramientas PDF profesionales</strong>: <a href="/merge-pdf">Combinar PDF</a>, <a href="/split-pdf">Dividir PDF</a>, <a href="/compress-pdf">Comprimir PDF</a>, <a href="/protect-pdf">Proteger con contraseña</a>, <a href="/watermark-pdf">Añadir marca de agua</a>, <a href="/add-text-pdf">Añadir texto</a>, <a href="/rotate-pdf">Rotar páginas</a>, <a href="/ocr-pdf">Reconocimiento de texto OCR</a>, <a href="/extract-pages-pdf">Extraer páginas</a>, <a href="/extract-text-pdf">Extraer texto</a>, <a href="/extract-images-from-pdf">Extraer imágenes</a>, <a href="/pdf-to-image">PDF a Imagen</a>, <a href="/image-to-pdf">Imagen a PDF</a>, <a href="/word-to-pdf">Word a PDF</a>, ¡y más!',
            keywords: ['herramientas', 'funciones', 'disponibles', 'lista', 'capacidades'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf', '/ocr-pdf'],
            popular: true
          },
          {
            id: 'edit-existing-text',
            question: '¿Puedo editar el texto existente en mis PDF?',
            answer: 'LocalPDF se centra en la <strong>manipulación de documentos</strong> (combinar, dividir, comprimir) en lugar de la edición de contenido. Puedes <a href="/add-text-pdf">añadir texto nuevo</a>, <a href="/watermark-pdf">añadir marcas de agua</a> y <a href="/ocr-pdf">extraer texto con OCR</a>, pero editar texto existente requiere editores PDF especializados. Recomendamos herramientas como Adobe Acrobat o PDF-XChange Editor para edición de texto.',
            keywords: ['editar', 'texto', 'modificar', 'contenido'],
            relatedTools: ['/add-text-pdf', '/watermark-pdf', '/ocr-pdf']
          },
          {
            id: 'browser-extension',
            question: '¿Hay una extensión de navegador para LocalPDF?',
            answer: '¡Sí! Instala nuestra <strong>extensión gratuita de Chrome</strong> para acceso rápido a las herramientas PDF directamente desde tu navegador. Clic derecho en cualquier PDF → "Abrir con LocalPDF" → Procesar instantáneamente. <a href="https://chromewebstore.google.com/detail/localpdf/mjidkeobnlijdjmioniboflmoelmckfl" target="_blank" rel="noopener noreferrer">Descargar extensión de Chrome →</a>',
            keywords: ['extensión', 'chrome', 'navegador', 'plugin', 'complemento'],
            relatedPages: ['/how-to-use'],
            popular: true
          },
          {
            id: 'file-size-limits',
            question: '¿Hay límites de tamaño de archivo?',
            answer: '¡Sin límites artificiales! Las únicas restricciones son la <strong>RAM y potencia de procesamiento de tu dispositivo</strong>. La mayoría de las computadoras modernas pueden manejar PDFs de hasta 100-200 MB fácilmente. Los archivos grandes (500+ MB) pueden tardar más. Como todo es local, no hay límites de subida al servidor.',
            keywords: ['límite', 'tamaño', 'máximo', 'grande'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'batch-processing',
            question: '¿Puedo procesar varios PDF a la vez?',
            answer: '¡Sí! La mayoría de las herramientas admiten <strong>procesamiento por lotes</strong>. Por ejemplo, <a href="/merge-pdf">Combinar PDF</a> puede combinar docenas de archivos, <a href="/compress-pdf">Comprimir PDF</a> puede optimizar varios PDF, y <a href="/protect-pdf">Proteger PDF</a> puede proteger con contraseña varios archivos simultáneamente. Sube varios archivos y procésalos todos a la vez.',
            keywords: ['lote', 'varios', 'masivo', 'múltiples'],
            relatedTools: ['/merge-pdf', '/compress-pdf', '/protect-pdf']
          }
        ]
      },

      technical: {
        id: 'technical',
        title: 'Preguntas Técnicas',
        icon: '💻',
        description: 'Compatibilidad de navegadores, rendimiento y detalles técnicos',
        questions: [
          {
            id: 'supported-browsers',
            question: '¿Qué navegadores son compatibles?',
            answer: 'LocalPDF funciona en <strong>todos los navegadores modernos</strong>: <ul><li><strong>Google Chrome</strong> (recomendado - mejor rendimiento)</li><li><strong>Mozilla Firefox</strong></li><li><strong>Microsoft Edge</strong></li><li><strong>Apple Safari</strong></li><li><strong>Opera</strong></li></ul>Recomendamos actualizar a la última versión del navegador para un rendimiento óptimo.',
            keywords: ['navegador', 'chrome', 'firefox', 'safari', 'edge'],
            relatedPages: ['/how-to-use']
          },
          {
            id: 'processing-speed',
            question: '¿Por qué el procesamiento de PDFs grandes es lento?',
            answer: 'La velocidad de procesamiento depende del <strong>hardware de tu dispositivo</strong> y la <strong>complejidad del PDF</strong>. Los archivos grandes (100+ MB) o PDFs con muchas imágenes requieren más RAM y CPU. Consejos para procesamiento más rápido: <ul><li>Cierra otras pestañas del navegador</li><li>Usa <a href="/compress-pdf">Comprimir PDF</a> primero para reducir el tamaño</li><li>Procesa menos archivos a la vez</li><li>Actualiza el navegador a la última versión</li></ul>',
            keywords: ['lento', 'rendimiento', 'velocidad', 'rápido', 'optimizar'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'mobile-support',
            question: '¿Puedo usar LocalPDF en dispositivos móviles?',
            answer: '¡Sí! LocalPDF funciona en <strong>navegadores móviles</strong> (iOS Safari, Chrome Android), pero el rendimiento puede ser limitado debido a la RAM del dispositivo. Para mejor experiencia en móviles: <ul><li>Procesa archivos más pequeños (< 50 MB)</li><li>Usa herramientas más simples (<a href="/rotate-pdf">Rotar</a>, <a href="/extract-pages-pdf">Extraer páginas</a>)</li><li>Evita herramientas pesadas (OCR, combinaciones grandes) en teléfonos antiguos</li></ul>',
            keywords: ['móvil', 'teléfono', 'tableta', 'ios', 'android'],
            relatedTools: ['/rotate-pdf', '/extract-pages-pdf']
          },
          {
            id: 'file-formats',
            question: '¿Qué formatos de archivo son compatibles?',
            answer: 'LocalPDF admite: <ul><li><strong>Archivos PDF</strong> - todas las versiones, PDFs cifrados (con contraseña)</li><li><strong>Imágenes</strong> - JPG, PNG, WebP, TIFF (<a href="/image-to-pdf">Imagen a PDF</a>)</li><li><strong>Documentos</strong> - DOCX, DOC (<a href="/word-to-pdf">Word a PDF</a>), XLSX (<a href="/excel-to-pdf">Excel a PDF</a>)</li></ul>Todas las conversiones ocurren localmente sin subir archivos.',
            keywords: ['formato', 'tipo', 'compatible', 'convertir', 'compatibilidad'],
            relatedTools: ['/image-to-pdf', '/word-to-pdf', '/pdf-to-image']
          }
        ]
      },

      account: {
        id: 'account',
        title: 'Cuenta y Precios',
        icon: '💰',
        description: 'Gratis de usar, sin registro necesario',
        questions: [
          {
            id: 'is-free',
            question: '¿LocalPDF es realmente gratis?',
            answer: '<strong>¡Sí, 100% gratis!</strong> Todas las herramientas son completamente gratuitas sin costos ocultos, sin niveles premium, sin suscripciones. Creemos que las herramientas centradas en la privacidad deben ser accesibles para todos. Nuestro proyecto es <strong>código abierto</strong> y apoyado por la comunidad. <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">Ver código fuente en GitHub →</a>',
            keywords: ['gratis', 'costo', 'precio', 'premium', 'suscripción'],
            popular: true
          },
          {
            id: 'account-required',
            question: '¿Necesito crear una cuenta?',
            answer: '¡No! <strong>Cero registro requerido</strong>. Simplemente visita cualquier página de herramienta y comienza a procesar PDFs inmediatamente. No se necesita email, contraseña ni información personal. Esto es parte de nuestra filosofía centrada en la privacidad - no queremos tus datos porque no los recopilamos.',
            keywords: ['cuenta', 'registro', 'inicio de sesión', 'email']
          },
          {
            id: 'how-we-make-money',
            question: '¿Cómo gana dinero LocalPDF si es gratis?',
            answer: 'LocalPDF es un <strong>proyecto de código abierto</strong> con costos mínimos de servidor (ya que el procesamiento es local). Podríamos agregar funciones opcionales en el futuro (como sincronización en la nube de configuraciones), pero todas las herramientas PDF principales permanecerán gratis para siempre. El proyecto es apoyado por la comunidad y se centra en proporcionar herramientas centradas en la privacidad.',
            keywords: ['dinero', 'ingresos', 'negocio', 'monetización', 'anuncios']
          }
        ]
      },

      support: {
        id: 'support',
        title: 'Soporte y Contacto',
        icon: '📞',
        description: 'Obtén ayuda y contacta con nuestro equipo',
        questions: [
          {
            id: 'get-support',
            question: '¿Cómo obtengo soporte o reporto errores?',
            answer: 'Múltiples formas de obtener ayuda: <ul><li><strong>Email</strong>: <a href="mailto:support@localpdf.online">support@localpdf.online</a> (soporte técnico)</li><li><strong>GitHub</strong>: <a href="https://github.com/ulinycoin/clientpdf-pro/issues" target="_blank" rel="noopener noreferrer">Reportar errores y problemas</a></li><li><strong>Discusiones GitHub</strong>: <a href="https://github.com/ulinycoin/clientpdf-pro/discussions" target="_blank" rel="noopener noreferrer">Hacer preguntas y compartir comentarios</a></li></ul>',
            keywords: ['soporte', 'ayuda', 'error', 'problema', 'contacto'],
            relatedPages: ['/terms']
          },
          {
            id: 'contribute',
            question: '¿Puedo contribuir a LocalPDF?',
            answer: '¡Absolutamente! LocalPDF es <strong>código abierto</strong>. Formas de contribuir: <ul><li><strong>Código</strong>: Enviar pull requests en <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">GitHub</a></li><li><strong>Traducciones</strong>: Ayudar a traducir a más idiomas</li><li><strong>Informes de errores</strong>: Reportar problemas que encuentres</li><li><strong>Ideas de funciones</strong>: Sugerir nuevas herramientas</li><li><strong>Documentación</strong>: Mejorar guías y documentos</li></ul>',
            keywords: ['contribuir', 'código abierto', 'github', 'desarrollador', 'ayuda']
          }
        ]
      }
    },

    // Related links section
    relatedLinks: {
      title: '¿Todavía tienes preguntas?',
      subtitle: 'Explora más recursos',
      links: {
        privacy: {
          title: 'Política de Privacidad',
          description: 'Descubre cómo protegemos tus datos',
          url: '/privacy'
        },
        gdpr: {
          title: 'Cumplimiento GDPR',
          description: 'Nuestro compromiso con la protección de datos',
          url: '/gdpr'
        },
        terms: {
          title: 'Términos de Servicio',
          description: 'Directrices de uso y políticas',
          url: '/terms'
        },
        docs: {
          title: 'Documentación',
          description: 'Guías detalladas y tutoriales',
          url: '/docs'
        }
      }
    },

    // Contact section
    contact: {
      title: 'Información de contacto',
      description: '¿Necesitas ayuda personalizada? Contacta con nuestro equipo',
      company: 'SIA "Ul-coin"',
      regNumber: 'Reg.Nr. 50203429241',
      email: 'support@localpdf.online',
      emailContact: 'contact@localpdf.online',
      github: 'GitHub Issues',
      website: 'localpdf.online'
    }
  },
  privacy: {
    title: 'Política de Privacidad',
    subtitle: 'Su privacidad es nuestra máxima prioridad. Descubra cómo LocalPDF protege sus datos.',
    lastUpdated: 'Última actualización: 30 de agosto de 2025',
    sections: {
      commitment: {
        title: 'Nuestro compromiso con la privacidad',
        content: 'En LocalPDF, la privacidad no es solo una característica – es la base de todo lo que construimos. Sus archivos se procesan completamente en su navegador, garantizando privacidad y seguridad completas.'
      },
      simpleAnswer: {
        title: 'La respuesta simple',
        main: 'Sus archivos NUNCA salen de su dispositivo. Todo sucede localmente en su navegador.',
        sub: 'Sin cargas, sin servidores, sin recopilación de datos. Sus documentos siempre permanecen privados.'
      },
      whatWeDont: {
        title: 'Lo que NO hacemos',
        noDataCollection: {
          title: 'Sin recopilación de datos',
          items: [
            'No recopilamos información personal',
            'No rastreamos sus actividades',
            'No almacenamos análisis de uso',
            'No creamos perfiles de usuario',
            'No utilizamos cookies de seguimiento'
          ]
        },
        noFileAccess: {
          title: 'Sin acceso a archivos',
          items: [
            'Nunca vemos sus archivos',
            'Los archivos no se suben a servidores',
            'Sin almacenamiento temporal en nuestros sistemas',
            'Los documentos nunca salen de su dispositivo',
            'Cero acceso al contenido de archivos'
          ]
        }
      },
      howItWorks: {
        title: 'Cómo funciona realmente LocalPDF',
        clientSide: {
          title: 'Procesamiento del lado del cliente',
          description: 'Todas las operaciones PDF ocurren directamente en su navegador web usando bibliotecas JavaScript avanzadas.',
          items: [
            'Los archivos se procesan con PDF.js (biblioteca PDF de Mozilla)',
            'Todas las operaciones se ejecutan en la memoria de su navegador',
            'Sin transmisión de datos a servidores externos',
            'Los resultados se generan localmente en su dispositivo'
          ]
        },
        process: {
          title: 'Proceso paso a paso',
          steps: [
            'Selecciona archivos desde su dispositivo',
            'Los archivos solo se cargan en la memoria del navegador',
            'JavaScript procesa sus PDF localmente',
            'Los resultados se generan y están disponibles para descarga',
            'Los archivos se eliminan automáticamente al salir de la página'
          ]
        }
      },
      analytics: {
        title: 'Análisis y seguimiento',
        description: 'Utilizamos análisis mínimos y respetuosos con la privacidad para mejorar nuestro servicio. Esto es exactamente lo que rastreamos:',
        whatWeTrack: {
          title: 'Lo que rastreamos (solo anónimo)',
          items: [
            'Vistas de página (qué herramientas son populares)',
            'Información general del navegador (para compatibilidad)',
            'Ubicación aproximada (solo nivel de país)',
            'Sin datos de identificación personal',
            'Sin datos de procesamiento de archivos'
          ]
        },
        protections: {
          title: 'Protecciones de privacidad',
          items: [
            'Todos los análisis son anonimizados',
            'Sin registro de direcciones IP',
            'Sin seguimiento entre sitios',
            'Sin redes publicitarias de terceros',
            'Puede optar por no participar a través de la configuración del navegador'
          ]
        }
      },
      compliance: {
        title: 'Cumplimiento internacional',
        gdpr: {
          title: 'Cumple con GDPR',
          description: 'Completamente conforme con las regulaciones europeas de protección de datos'
        },
        ccpa: {
          title: 'Cumple con CCPA',
          description: 'Cumple con los estándares de privacidad de California'
        },
        global: {
          title: 'Privacidad global',
          description: 'Adhiere a las mejores prácticas internacionales de privacidad'
        }
      },
      summary: {
        title: 'En resumen',
        main: 'LocalPDF le da control total sobre sus datos. Lo diseñamos así porque creemos que la privacidad es un derecho fundamental.',
        sub: '¿Preguntas sobre privacidad? Estaremos encantados de explicar nuestro enfoque en detalle.'
      }
    }
  },
  terms: {
    title: 'Términos de Servicio',
    subtitle: 'Términos simples y transparentes para usar las herramientas LocalPDF',
    lastUpdated: 'Última actualización: 30 de agosto de 2025',
    sections: {
      introduction: {
        title: 'Bienvenido a LocalPDF',
        content: 'Al usar LocalPDF, acepta estos términos. Los mantenemos simples y justos porque la privacidad y transparencia nos importan.'
      },
      acceptance: {
        title: 'Aceptación de Términos',
        content: 'Al acceder y usar LocalPDF, acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo, por favor no use nuestro servicio.'
      },
      serviceDescription: {
        title: 'Nuestro Servicio',
        content: 'LocalPDF proporciona herramientas PDF gratuitas basadas en navegador que procesan sus documentos completamente en su dispositivo.',
        features: {
          title: 'Lo que ofrecemos:',
          list: [
            'Fusión, división y compresión de PDF',
            'Adición de texto y marca de agua',
            'Rotación PDF y extracción de páginas',
            'Herramientas de conversión de formato',
            'Procesamiento completo del lado del cliente'
          ]
        }
      },
      usageRules: {
        title: 'Pautas de Uso',
        allowed: {
          title: 'Usos Permitidos',
          items: [
            'Procesamiento de documentos personales',
            'Uso comercial y empresarial',
            'Propósitos educativos',
            'Cualquier manipulación legal de documentos'
          ]
        },
        prohibited: {
          title: 'Usos Prohibidos',
          items: [
            'Procesamiento de contenido ilegal',
            'Intentos de ingeniería inversa',
            'Sobrecarga de nuestra infraestructura',
            'Violación de leyes aplicables'
          ]
        }
      },
      privacy: {
        title: 'Privacidad y Sus Datos',
        localProcessing: 'Todos sus documentos se procesan localmente en su navegador - nunca salen de su dispositivo.',
        noDataCollection: 'No recopilamos, almacenamos ni tenemos acceso a sus archivos o datos personales.',
        privacyPolicyLink: 'Lea nuestra Política de Privacidad completa →'
      },
      intellectualProperty: {
        title: 'Propiedad Intelectual',
        openSource: {
          title: 'Código Abierto',
          content: 'LocalPDF es software de código abierto. Puede ver, contribuir y bifurcar nuestro código.',
          githubLink: 'Ver código fuente en GitHub →'
        },
        userContent: {
          title: 'Su Contenido',
          content: 'Conserva todos los derechos sobre sus documentos. Nunca reclamamos propiedad o acceso a sus archivos.'
        }
      },
      disclaimers: {
        title: 'Descargos de Responsabilidad',
        asIs: 'LocalPDF se proporciona "tal como está" sin garantías o aseguranzas.',
        noWarranties: 'Aunque nos esforzamos por la confiabilidad, no podemos garantizar servicio ininterrumpido u operación libre de errores.',
        limitations: [
          'Sin garantía de comerciabilidad o idoneidad',
          'Sin garantía de precisión o integridad de datos',
          'El servicio puede estar temporalmente no disponible',
          'Las características pueden cambiar o discontinuarse'
        ]
      },
      liability: {
        title: 'Limitación de Responsabilidad',
        limitation: 'No somos responsables por daños que surjan de su uso de LocalPDF.',
        maxLiability: 'Nuestra responsabilidad máxima está limitada a la cantidad que pagó por el servicio (que es cero, ya que es gratuito).'
      },
      changes: {
        title: 'Cambios en los Términos',
        notification: 'Podemos actualizar estos términos ocasionalmente. Los cambios significativos se comunicarán a través de nuestro sitio web.',
        effective: 'El uso continuado de LocalPDF después de los cambios constituye aceptación de los nuevos términos.'
      },
      contact: {
        title: 'Contáctanos',
        description: '¿Preguntas sobre estos términos? Estamos aquí para ayudar.',
        company: 'SIA "Ul-coin"',
        regNumber: 'Reg.Nr. 50203429241',
        email: 'support@localpdf.online',
        emailContact: 'contact@localpdf.online',
        github: 'Soporte y Problemas',
        website: 'Sitio Web'
      }
    }
  },

  howToUse: {
    title: 'Cómo usar LocalPDF',
    subtitle: 'Guía completa para usar las potentes herramientas PDF de LocalPDF. Aprende a combinar, dividir, comprimir, editar y convertir PDFs con total privacidad y seguridad.',
    quickStart: {
      title: 'Guía de inicio rápido',
      steps: {
        upload: { title: 'Subir archivos', description: 'Arrastra y suelta o haz clic para seleccionar tus archivos PDF' },
        choose: { title: 'Elegir herramienta', description: 'Selecciona entre más de 15 potentes herramientas de procesamiento PDF' },
        configure: { title: 'Configurar', description: 'Ajusta configuraciones y opciones según sea necesario' },
        download: { title: 'Descargar', description: 'Procesa y descarga tu resultado al instante' }
      },
      keyBenefits: {
        title: 'Beneficios clave',
        description: 'Todo el procesamiento ocurre en tu navegador - sin subidas, sin registro, sin seguimiento. Tus archivos nunca dejan tu dispositivo, garantizando total privacidad y seguridad.'
      }
    },
    tools: {
      title: 'Guía de herramientas PDF',
      merge: {
        title: 'Combinar archivos PDF',
        description: 'Combina múltiples archivos PDF en un solo documento.',
        steps: [
          'Sube múltiples archivos PDF (arrastra y suelta o haz clic para seleccionar)',
          'Reordena los archivos arrastrándolos en la lista',
          'Haz clic en "Combinar PDFs" para unirlos',
          'Descarga tu archivo PDF combinado'
        ],
        tip: 'Puedes combinar hasta 20 archivos PDF a la vez. El orden final coincidirá con tu disposición en la lista de archivos.'
      },
      split: {
        title: 'Dividir archivos PDF',
        description: 'Extrae páginas específicas o divide PDFs en archivos separados.',
        steps: [
          'Sube un solo archivo PDF',
          'Elige el método de división (por rango de páginas, cada X páginas o rangos personalizados)',
          'Especifica números de página o rangos (ej., "1-5, 8, 10-12")',
          'Haz clic en "Dividir PDF" y descarga los archivos individuales'
        ],
        tip: 'Usa el modo de vista previa para ver miniaturas de páginas antes de dividir. Admite rangos complejos como "1-3, 7, 15-20".'
      },
      compress: {
        title: 'Comprimir archivos PDF',
        description: 'Reduce el tamaño del archivo PDF mientras mantienes la calidad.',
        steps: [
          'Sube un archivo PDF',
          'Ajusta el nivel de calidad (10%-100%)',
          'Habilita compresión de imagen, eliminación de metadatos u optimización web',
          'Haz clic en "Comprimir PDF" y descarga el archivo más pequeño'
        ],
        tip: 'La calidad al 80% generalmente proporciona el mejor equilibrio entre tamaño de archivo y calidad visual. Habilita la compresión de imagen para máximo ahorro.'
      },
      addText: {
        title: 'Añadir texto a PDFs',
        description: 'Inserta texto personalizado, firmas y anotaciones.',
        steps: [
          'Sube un archivo PDF',
          'Haz clic en la vista previa del PDF donde quieres añadir texto',
          'Escribe tu texto y ajusta fuente, tamaño y color',
          'Posiciona y cambia el tamaño de las cajas de texto según sea necesario',
          'Guarda tu PDF modificado'
        ],
        tip: 'Usa diferentes colores y fuentes para firmas, sellos o anotaciones. Las cajas de texto pueden moverse y redimensionarse después de la creación.'
      },
      additional: {
        title: 'Añadir marcas de agua y más',
        description: 'LocalPDF incluye 5 herramientas poderosas adicionales para edición PDF completa.',
        features: {
          watermarks: 'Añade marcas de agua de texto o imagen',
          rotate: 'Corrige la orientación de la página',
          extract: 'Crea nuevos PDFs de páginas seleccionadas',
          extractText: 'Obtén contenido de texto de PDFs',
          convert: 'Convierte páginas a PNG/JPEG'
        },
        tip: 'Todas las herramientas funcionan igual: Subir → Configurar → Procesar → Descargar. Cada herramienta tiene opciones específicas adaptadas a su función.'
      }
    },
    tips: {
      title: 'Consejos y trucos avanzados',
      performance: {
        title: 'Consejos de rendimiento',
        items: [
          'Cierra otras pestañas del navegador para archivos grandes (>50MB)',
          'Usa Chrome o Firefox para mejor rendimiento',
          'Habilita la aceleración por hardware en la configuración del navegador',
          'Procesa archivos muy grandes en lotes más pequeños'
        ]
      },
      keyboard: {
        title: 'Atajos de teclado',
        items: [
          'Ctrl+O - Abrir diálogo de archivo',
          'Ctrl+S - Guardar/descargar resultado',
          'Ctrl+Z - Deshacer última acción',
          'Tab - Navegar elementos de la interfaz'
        ]
      },
      mobile: {
        title: 'Uso móvil',
        items: [
          'Todas las herramientas funcionan en smartphones y tablets',
          'Usa orientación horizontal para mejor interfaz',
          'Gestos táctiles y de pellizco compatibles',
          'Los archivos se pueden abrir desde apps de almacenamiento en la nube'
        ]
      },
      troubleshooting: {
        title: 'Solución de problemas',
        items: [
          'Actualiza la página si la herramienta no responde',
          'Limpia la caché del navegador para problemas persistentes',
          'Asegúrate de que JavaScript esté habilitado',
          'Actualiza el navegador a la última versión'
        ]
      }
    },
    formats: {
      title: 'Compatibilidad de formatos de archivo',
      input: {
        title: 'Entrada compatible',
        items: [
          'Archivos PDF (cualquier versión)',
          'Documentos multipágina',
          'PDFs de texto e imagen',
          'Formularios y anotaciones',
          'Archivos de hasta 100MB'
        ]
      },
      output: {
        title: 'Formatos de salida',
        items: [
          'PDF (documentos procesados)',
          'PNG (imágenes de alta calidad)',
          'JPEG (imágenes comprimidas)',
          'WEBP (formato moderno)',
          'TXT (texto extraído)'
        ]
      },
      limitations: {
        title: 'Limitaciones',
        items: [
          'Tamaño máximo de archivo: 100MB',
          'Archivos protegidos con contraseña no compatibles',
          'Algunas estructuras PDF complejas pueden fallar',
          'PDFs escaneados: extracción de texto limitada'
        ]
      }
    },
    privacy: {
      title: 'Guía de privacidad y seguridad',
      whatWeDo: {
        title: 'Lo que hace LocalPDF',
        items: [
          'Procesa archivos completamente en tu navegador',
          'Usa JavaScript del lado del cliente para todas las operaciones',
          'Borra archivos automáticamente de la memoria',
          'Funciona completamente sin conexión después de la primera carga',
          'Código abierto y transparente'
        ]
      },
      whatWeNeverDo: {
        title: 'Lo que LocalPDF nunca hace',
        items: [
          'Subir archivos a servidores',
          'Almacenar o guardar en caché tus documentos',
          'Rastrear comportamiento de usuario o recopilar análisis',
          'Requerir cuentas o registro',
          'Usar cookies para rastreo'
        ]
      },
      perfectFor: 'Perfecto para documentos confidenciales: Como todo el procesamiento es local, LocalPDF es ideal para documentos sensibles, archivos legales, registros financieros o cualquier PDF confidencial.'
    },
    help: {
      title: '¿Necesitas ayuda adicional?',
      documentation: {
        title: 'Documentación',
        description: 'Guías completas y tutoriales para todas las herramientas PDF',
        link: 'Ver FAQ'
      },
      community: {
        title: 'Soporte comunitario',
        description: 'Obtén ayuda de la comunidad LocalPDF',
        link: 'Unirse a las discusiones'
      },
      issues: {
        title: 'Reportar problemas',
        description: '¿Encontraste un error o tienes una sugerencia?',
        link: 'Reportar problema'
      },
      footer: 'LocalPDF es software de código abierto mantenido por la comunidad. Tus comentarios nos ayudan a mejorar las herramientas para todos.'
    }
  },

  notFound: {
    title: 'Página no encontrada',
    subtitle: 'La página que buscas no existe',
    description: 'La página solicitada no se pudo encontrar. Por favor verifica la URL e intenta de nuevo, o explora nuestras herramientas PDF populares a continuación.',
    message: 'La página solicitada no se pudo encontrar. Por favor verifica la URL e intenta de nuevo.',
    backHome: 'Volver al Inicio',
    backToTools: 'Explorar Herramientas PDF',
    suggestions: {
      title: 'Herramientas PDF Populares:',
      merge: 'Combinar PDFs',
      split: 'Dividir PDFs',
      compress: 'Comprimir PDFs',
      convert: 'Convertir Imágenes a PDF'
    }
  },

  // Tools section (for FAQ tools section compatibility)
  tools: {}
};
