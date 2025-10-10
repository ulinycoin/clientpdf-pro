/**
 * Static pages translations for ES language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Preguntas Frecuentes',
    subtitle: 'Encuentra respuestas a preguntas comunes sobre LocalPDF',
    sections: {
      general: {
        title: 'Preguntas Generales',
        questions: {
          whatIs: {
            question: '¿Qué es LocalPDF?',
            answer: 'LocalPDF es una colección de herramientas PDF centradas en la privacidad que funcionan completamente en su navegador. Sin cargas, sin seguimiento, privacidad completa.'
          },
          free: {
            question: '¿LocalPDF es realmente gratis?',
            answer: '¡Sí! Todas las herramientas son completamente gratuitas sin registro requerido. Sin costos ocultos, sin niveles premium.'
          },
          account: {
            question: '¿Necesito crear una cuenta?',
            answer: '¡No se requiere cuenta! Simplemente visita el sitio web y comienza a usar cualquier herramienta inmediatamente.'
          }
        }
      },
      privacy: {
        title: 'Privacidad y Seguridad',
        questions: {
          uploaded: {
            question: '¿Se suben mis archivos a sus servidores?',
            answer: '¡No! Todo el procesamiento ocurre localmente en su navegador. Sus archivos nunca salen de su dispositivo.'
          },
          afterUse: {
            question: '¿Qué pasa con mis archivos después de usar las herramientas?',
            answer: '¡Nada! Como los archivos se procesan localmente, permanecen solo en su dispositivo. Nunca vemos ni almacenamos sus archivos.'
          },
          confidential: {
            question: '¿Puedo usar esto para documentos confidenciales?',
            answer: '¡Absolutamente! Como todo sucede localmente, sus documentos confidenciales permanecen completamente privados.'
          }
        }
      },
      technical: {
        title: 'Preguntas Técnicas',
        questions: {
          browsers: {
            question: '¿ Qué navegadores son compatibles?',
            answer: 'LocalPDF funciona en todos los navegadores modernos:',
            browsers: [
              'Google Chrome (recomendado)',
              'Mozilla Firefox',
              'Apple Safari',
              'Microsoft Edge',
              'Opera'
            ]
          },
          offline: {
            question: '¿Puedo usar LocalPDF sin conexión?',
            answer: '¡Sí! Después de la carga inicial de la página, puede procesar archivos incluso sin conexión a internet.'
          },
          fileSize: {
            question: '¿Hay límites de tamaño de archivo?',
            answer: 'Los únicos límites se basan en la memoria y potencia de procesamiento de su dispositivo. No imponemos límites artificiales.'
          }
        }
      },
      tools: {
        title: 'Herramientas PDF',
        editText: {
          question: '¿Puedo editar texto en PDF existentes?',
          answer: 'LocalPDF se enfoca en la manipulación de documentos en lugar de la edición de contenido. Puede agregar texto, marcas de agua, combinar, dividir y rotar PDF, pero editar texto existente requiere software especializado de edición de PDF.'
        }
      },
      support: {
        title: 'Soporte y Contacto',
        gettingSupport: {
          title: 'Cómo obtener soporte',
          items: [
            'Consulte nuestra sección de FAQ para preguntas comunes',
            'Reporte errores y problemas en nuestra página de GitHub',
            'Contáctenos por correo electrónico para soporte técnico',
            'Síganos en las redes sociales para actualizaciones'
          ]
        },
        contact: {
          title: 'Información de contacto',
          company: 'SIA "Ul-coin"',
          regNumber: 'Reg.Nr. 50203429241',
          email: 'support@localpdf.online',
          emailContact: 'contact@localpdf.online',
          github: '🐛 Reportar problemas en GitHub',
          discussions: '💬 Unirse a las discusiones de GitHub'
        }
      }
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
  
  // Tools section (for FAQ tools section compatibility)
  tools: {}
};