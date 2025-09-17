/**
 * Spanish translations for PDF Protection tool
 */

export const protect = {
  // Basic properties for tools grid
  title: 'Proteger PDF',
  description: 'Añadir protección por contraseña y restricciones de seguridad a archivos PDF',
  
  // Main page elements
  pageTitle: "Proteger PDF con contraseña",
  pageDescription: "Añada protección con contraseña y restricciones de seguridad a sus documentos PDF para mayor privacidad y control",
  breadcrumb: "Proteger PDF",
  
  // Tool interface
  uploadTitle: "Seleccionar PDF para proteger",
  uploadSubtitle: "Arrastra tu PDF aquí o haz clic para buscar",
  supportedFormats: "Admite archivos PDF de hasta 100MB",
  
  // Password fields
  userPassword: "Contraseña para abrir el documento",
  confirmPassword: "Confirmar contraseña",
  ownerPassword: "Contraseña para cambiar permisos (opcional)",
  passwordPlaceholder: "Ingresa una contraseña fuerte",
  confirmPlaceholder: "Vuelve a ingresar tu contraseña",
  
  // Encryption settings
  encryptionLevel: "Fuerza de encriptación",
  encryption128: "128-bit AES (Estándar)",
  encryption256: "256-bit AES (Alta seguridad)",
  
  // Security presets
  securityPresets: "Configuraciones de seguridad",
  presetBasic: "Protección básica",
  presetBasicDesc: "Protección con contraseña con restricciones básicas",
  presetBusiness: "Documento empresarial",
  presetBusinessDesc: "Seguridad de documento profesional",
  presetConfidential: "Confidencial",
  presetConfidentialDesc: "Restricciones de seguridad máximas",
  presetCustom: "Configuración personalizada",
  presetCustomDesc: "Configurar todas las opciones manualmente",
  
  // Permissions section
  permissions: "Restricciones del documento",
  permissionsDesc: "Controla qué pueden hacer los usuarios con el documento protegido",
  advancedPermissions: "Permisos avanzados",
  
  // Advanced permission controls
  permissionPrinting: "Impresión",
  permissionPrintingDesc: "Controlar permisos de impresión",
  permissionCopying: "Copia de texto",
  permissionCopyingDesc: "Permitir selección y copia de texto",
  permissionModifying: "Edición del documento",
  permissionModifyingDesc: "Permitir modificación del documento",
  permissionAnnotating: "Comentarios y Anotaciones",
  permissionAnnotatingDesc: "Permitir agregar comentarios y marcas",
  permissionFillingForms: "Llenado de formularios",
  permissionFillingFormsDesc: "Permitir llenado de formularios interactivos",
  permissionDocumentAssembly: "Extracción de páginas",
  permissionDocumentAssemblyDesc: "Permitir inserción, eliminación, rotación de páginas",
  permissionContentAccessibility: "Acceso de lector de pantalla",
  permissionContentAccessibilityDesc: "Permitir herramientas de accesibilidad (recomendado)",
  
  // Security notice
  securityNoteTitle: "Nota de seguridad",
  securityNoteDesc: "Estas restricciones son aplicadas por visores PDF que respetan el estándar PDF. Proporcionan protección razonable pero no deben considerarse como seguridad absoluta para documentos altamente sensibles.",
  
  // Permission types
  printing: "Impresión",
  printingNone: "No permitida",
  printingLow: "Solo baja resolución",
  printingHigh: "Alta resolución permitida",
  copying: "Copia y selección de texto",
  modifying: "Edición y modificación del documento",
  annotating: "Comentarios y anotaciones",
  fillingForms: "Llenado de formularios interactivos",
  contentAccessibility: "Acceso de lector de pantalla (recomendado)",
  documentAssembly: "Extracción y ensamblaje de páginas",
  
  // Progress and status messages
  analyzing: "Analizando seguridad del documento...",
  encrypting: "Aplicando protección con contraseña...",
  finalizing: "Finalizando documento protegido...",
  complete: "¡Protección aplicada exitosamente!",
  
  // Security info
  securityInfo: "Información de seguridad del documento",
  isProtected: "Este documento ya está protegido con contraseña",
  noProtection: "Este documento no tiene protección con contraseña",
  
  // Warnings and alerts
  passwordWarning: "⚠️ Importante: ¡Si olvida esta contraseña, el documento no se puede recuperar!",
  weakPassword: "La contraseña es muy débil. Considera usar:",
  passwordMismatch: "Las contraseñas no coinciden",
  existingProtection: "Este PDF ya tiene protección con contraseña. Puede necesitar la contraseña actual para modificarlo.",
  
  // Password strength
  strengthVeryWeak: "Muy débil",
  strengthWeak: "Débil",
  strengthFair: "Aceptable",
  strengthStrong: "Fuerte",
  strengthVeryStrong: "Muy fuerte",
  
  // Protection modes
  protectionMode: "Modo de protección",
  fullProtection: "Protección completa",
  smartProtection: "Protección inteligente",
  fullProtectionDesc: "Requiere contraseña para abrir el documento. Máxima seguridad para archivos confidenciales.",
  smartProtectionDesc: "Visualización libre, impresión/copia restringida. Perfecto para compartir documentos.",
  passwordProtection: "Protección con contraseña",
  documentRestrictions: "Restricciones del documento",
  realPDFEncryption: "Encriptación PDF real",
  securityLevel: "Nivel de seguridad",
  simpleView: "Vista simple",
  
  // Optional field labels
  documentPasswordOptional: "Contraseña del documento (Opcional)",
  leaveEmptyForPermissions: "Dejar vacío para protección solo por permisos",
  notNeededForPermissions: "No necesario para protección por permisos",

  // Encryption notices
  realPDFEncryptionTitle: "Encriptación PDF real",
  realPDFEncryptionDesc: "Esta herramienta aplica encriptación PDF estándar de la industria que funciona con todos los lectores PDF. Su documento estará verdaderamente protegido con contraseña y restringido según sus configuraciones.",
  securityLevelLabel: "Nivel de seguridad",
  passwordWillBeRequired: "Su PDF requerirá la contraseña para abrirse y respetará todas las configuraciones de permisos.",

  // Buttons and actions
  protectButton: "🛡️ Proteger PDF",
  downloadProtected: "Descargar PDF protegido",
  showPassword: "Mostrar contraseña",
  hidePassword: "Ocultar contraseña",
  generatePassword: "Generar contraseña segura",
  toggleAdvanced: "Configuración avanzada",
  applyPreset: "Aplicar configuración",
  dismiss: "Descartar",
  
  // File selection
  selectedFile: "Archivo seleccionado",
  fileSize: "Tamaño del archivo",
  removeFile: "Eliminar archivo",
  selectNewFile: "Seleccionar otro archivo",
  
  // Quick steps section
  quickSteps: {
    title: "Cómo proteger tu PDF",
    step1: {
      title: "Sube tu PDF",
      description: "Selecciona el documento PDF que quieres proteger"
    },
    step2: {
      title: "Establece una contraseña fuerte",
      description: "Crea una contraseña segura que puedas recordar"
    },
    step3: {
      title: "Elige restricciones",
      description: "Configura qué pueden hacer los usuarios con el documento"
    },
    step4: {
      title: "Descarga el archivo protegido",
      description: "Obtén tu documento PDF protegido con contraseña"
    }
  },
  
  // Benefits section
  benefits: {
    title: "¿Por qué proteger tus PDFs?",
    privacy: {
      title: "Mantener información privada",
      description: "Prevenir acceso no autorizado a documentos sensibles"
    },
    control: {
      title: "Controlar el uso del documento",
      description: "Decide quién puede imprimir, copiar o editar tu contenido"
    },
    compliance: {
      title: "Cumplir requisitos de seguridad",
      description: "Satisfacer estándares de seguridad regulatorios y empresariales"
    },
    professional: {
      title: "Seguridad profesional de documentos",
      description: "Añade protección de nivel empresarial a tus documentos"
    }
  },
  
  // File size warnings
  fileSizeWarnings: {
    mediumFile: "Advertencia archivo grande",
    largeFile: "Advertencia archivo muy grande",
    criticalFile: "Advertencia tamaño crítico",
    mediumFileDesc: "Este archivo es moderadamente grande y puede tardar 10-30 segundos en encriptarse.",
    largeFileDesc: "Este archivo es grande y puede tardar 1-2 minutos en encriptarse. Por favor sea paciente y no cierre la pestaña del navegador.",
    criticalFileDesc: "Este archivo es muy grande y puede tardar varios minutos en encriptarse. La pestaña del navegador puede volverse no responsiva durante el procesamiento.",
    tips: "Consejos:",
    tipCloseOtherTabs: "Cierre otras pestañas del navegador para liberar memoria",
    tipEnsureRAM: "Asegúrese de que su dispositivo tenga suficiente RAM",
    tipCompressFirst: "Considere comprimir el PDF primero"
  },
  
  // Error messages
  errors: {
    fileNotSelected: "Por favor selecciona primero un archivo PDF",
    invalidFile: "Formato de archivo PDF inválido",
    passwordRequired: "Se requiere contraseña",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    encryptionFailed: "Falló la encriptación del documento",
    fileTooLarge: "El archivo es demasiado grande para encriptación (máx 100MB)",
    processingError: "Error procesando PDF. Por favor intenta de nuevo.",
    unsupportedPDF: "Este formato PDF no es compatible para encriptación"
  },
  
  // Success messages
  success: {
    protected: "¡PDF protegido exitosamente con contraseña!",
    downloaded: "PDF protegido descargado exitosamente"
  }
};