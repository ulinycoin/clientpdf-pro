/**
 * French translations for PDF Protection tool
 */

export const protect = {
  // Basic properties for tools grid
  title: 'Protéger PDF',
  description: 'Ajouter une protection par mot de passe et des restrictions de sécurité aux fichiers PDF',
  
  // Main page elements
  pageTitle: "Protéger PDF avec mot de passe",
  pageDescription: "Ajoutez une protection par mot de passe et des restrictions de sécurité à vos documents PDF pour une confidentialité et un contrôle améliorés",
  breadcrumb: "Protéger PDF",
  
  // Tool interface
  uploadTitle: "Sélectionner PDF à protéger",
  uploadSubtitle: "Déposez votre PDF ici ou cliquez pour parcourir",
  supportedFormats: "Supporte les fichiers PDF jusqu'à 100MB",
  
  // Password fields
  userPassword: "Mot de passe pour ouvrir le document",
  confirmPassword: "Confirmer le mot de passe",
  ownerPassword: "Mot de passe pour modifier les permissions (optionnel)",
  passwordPlaceholder: "Entrez un mot de passe fort",
  confirmPlaceholder: "Re-saisissez votre mot de passe",
  
  // Encryption settings
  encryptionLevel: "Force de chiffrement",
  encryption128: "128-bit AES (Standard)",
  encryption256: "256-bit AES (Haute sécurité)",
  
  // Security presets
  securityPresets: "Préréglages de sécurité",
  presetBasic: "Protection de base",
  presetBasicDesc: "Protection par mot de passe avec restrictions de base",
  presetBusiness: "Document d'affaires",
  presetBusinessDesc: "Sécurité de document professionnelle",
  presetConfidential: "Confidentiel",
  presetConfidentialDesc: "Restrictions de sécurité maximales",
  presetCustom: "Paramètres personnalisés",
  presetCustomDesc: "Configurer toutes les options manuellement",
  
  // Permissions section
  permissions: "Restrictions du document",
  permissionsDesc: "Contrôlez ce que les utilisateurs peuvent faire avec le document protégé",
  advancedPermissions: "Permissions avancées",
  
  // Advanced permission controls
  permissionPrinting: "Impression",
  permissionPrintingDesc: "Contrôler les permissions d'impression",
  permissionCopying: "Copie de texte",
  permissionCopyingDesc: "Autoriser la sélection et copie de texte",
  permissionModifying: "Édition du document",
  permissionModifyingDesc: "Autoriser la modification du document",
  permissionAnnotating: "Commentaires & Annotations",
  permissionAnnotatingDesc: "Autoriser l'ajout de commentaires et annotations",
  permissionFillingForms: "Remplissage de formulaires",
  permissionFillingFormsDesc: "Autoriser le remplissage de formulaires interactifs",
  permissionDocumentAssembly: "Extraction de pages",
  permissionDocumentAssemblyDesc: "Autoriser l'insertion, suppression, rotation de pages",
  permissionContentAccessibility: "Accès lecteur d'écran",
  permissionContentAccessibilityDesc: "Autoriser les outils d'accessibilité (recommandé)",
  
  // Security notice
  securityNoteTitle: "Note de sécurité",
  securityNoteDesc: "Ces restrictions sont appliquées par les lecteurs PDF qui respectent la norme PDF. Elles offrent une protection raisonnable mais ne doivent pas être considérées comme une sécurité absolue pour les documents hautement sensibles.",
  
  // Permission types
  printing: "Impression",
  printingNone: "Non autorisée",
  printingLow: "Basse résolution uniquement",
  printingHigh: "Haute résolution autorisée",
  copying: "Copie et sélection de texte",
  modifying: "Édition et modification du document",
  annotating: "Commentaires et annotations",
  fillingForms: "Remplissage de formulaires interactifs",
  contentAccessibility: "Accès lecteur d'écran (recommandé)",
  documentAssembly: "Extraction et assemblage de pages",
  
  // Progress and status messages
  analyzing: "Analyse de la sécurité du document...",
  encrypting: "Application de la protection par mot de passe...",
  finalizing: "Finalisation du document protégé...",
  complete: "Protection appliquée avec succès!",
  
  // Security info
  securityInfo: "Informations de sécurité du document",
  isProtected: "Ce document est déjà protégé par mot de passe",
  noProtection: "Ce document n'a pas de protection par mot de passe",
  
  // Warnings and alerts
  passwordWarning: "⚠️ Important : Si vous oubliez ce mot de passe, le document ne peut pas être récupéré!",
  weakPassword: "Le mot de passe est trop faible. Considérez utiliser :",
  passwordMismatch: "Les mots de passe ne correspondent pas",
  existingProtection: "Ce PDF a déjà une protection par mot de passe. Vous pourriez avoir besoin du mot de passe actuel pour le modifier.",
  
  // Password strength
  strengthVeryWeak: "Très faible",
  strengthWeak: "Faible",
  strengthFair: "Acceptable",
  strengthStrong: "Fort",
  strengthVeryStrong: "Très fort",
  
  // Protection modes
  protectionMode: "Mode de protection",
  fullProtection: "Protection complète",
  smartProtection: "Protection intelligente",
  fullProtectionDesc: "Nécessite un mot de passe pour ouvrir le document. Sécurité maximale pour les fichiers confidentiels.",
  smartProtectionDesc: "Visualisation libre, impression/copie restreinte. Parfait pour partager des documents.",
  passwordProtection: "Protection par mot de passe",
  documentRestrictions: "Restrictions du document",
  realPDFEncryption: "Chiffrement PDF réel",
  securityLevel: "Niveau de sécurité",
  simpleView: "Vue simple",
  showAI: "Afficher les recommandations IA",
  hideAI: "Masquer les recommandations IA",  
  // Optional field labels
  documentPasswordOptional: "Mot de passe du document (Optionnel)",
  leaveEmptyForPermissions: "Laissez vide pour la protection par permissions uniquement",
  notNeededForPermissions: "Pas nécessaire pour la protection par permissions",

  // Encryption notices
  realPDFEncryptionTitle: "Chiffrement PDF réel",
  realPDFEncryptionDesc: "Cet outil applique un chiffrement PDF standard de l'industrie qui fonctionne avec tous les lecteurs PDF. Votre document sera véritablement protégé par mot de passe et restreint selon vos paramètres.",
  securityLevelLabel: "Niveau de sécurité",
  passwordWillBeRequired: "Votre PDF nécessitera le mot de passe pour s'ouvrir et respectera tous les paramètres de permissions.",

  // Buttons and actions
  protectButton: "🛡️ Protéger PDF",
  downloadProtected: "Télécharger PDF protégé",
  showPassword: "Afficher le mot de passe",
  hidePassword: "Masquer le mot de passe",
  generatePassword: "Générer un mot de passe sécurisé",
  toggleAdvanced: "Paramètres avancés",
  applyPreset: "Appliquer le préréglage",
  dismiss: "Ignorer",
  
  // File selection
  selectedFile: "Fichier sélectionné",
  fileSize: "Taille du fichier",
  removeFile: "Supprimer le fichier",
  selectNewFile: "Sélectionner un autre fichier",
  
  // Quick steps section
  quickSteps: {
    title: "Comment protéger votre PDF",
    step1: {
      title: "Télécharger votre PDF",
      description: "Sélectionnez le document PDF que vous voulez protéger"
    },
    step2: {
      title: "Définir un mot de passe fort",
      description: "Créez un mot de passe sécurisé dont vous vous souviendrez"
    },
    step3: {
      title: "Choisir les restrictions",
      description: "Configurez ce que les utilisateurs peuvent faire avec le document"
    },
    step4: {
      title: "Télécharger le fichier protégé",
      description: "Obtenez votre document PDF protégé par mot de passe"
    }
  },
  
  // Benefits section
  benefits: {
    title: "Pourquoi protéger vos PDFs?",
    privacy: {
      title: "Garder les informations privées",
      description: "Empêcher l'accès non autorisé aux documents sensibles"
    },
    control: {
      title: "Contrôler l'utilisation du document",
      description: "Décidez qui peut imprimer, copier ou modifier votre contenu"
    },
    compliance: {
      title: "Respecter les exigences de sécurité",
      description: "Satisfaire les standards de sécurité réglementaires et d'affaires"
    },
    professional: {
      title: "Sécurité professionnelle des documents",
      description: "Ajoutez une protection de niveau entreprise à vos documents"
    }
  },
  
  // File size warnings
  fileSizeWarnings: {
    mediumFile: "Avertissement fichier volumineux",
    largeFile: "Avertissement fichier très volumineux",
    criticalFile: "Avertissement taille critique",
    mediumFileDesc: "Ce fichier est modérément volumineux et peut prendre 10-30 secondes à chiffrer.",
    largeFileDesc: "Ce fichier est volumineux et peut prendre 1-2 minutes à chiffrer. Veuillez patienter et ne pas fermer l'onglet du navigateur.",
    criticalFileDesc: "Ce fichier est très volumineux et peut prendre plusieurs minutes à chiffrer. L'onglet du navigateur peut devenir non réactif pendant le traitement.",
    tips: "Conseils :",
    tipCloseOtherTabs: "Fermez les autres onglets du navigateur pour libérer de la mémoire",
    tipEnsureRAM: "Assurez-vous que votre appareil dispose de suffisamment de RAM",
    tipCompressFirst: "Considérez compresser le PDF d'abord"
  },
  
  // Error messages
  errors: {
    fileNotSelected: "Veuillez d'abord sélectionner un fichier PDF",
    invalidFile: "Format de fichier PDF invalide",
    passwordRequired: "Le mot de passe est requis",
    passwordTooShort: "Le mot de passe doit avoir au moins 6 caractères",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    encryptionFailed: "Échec du chiffrement du document",
    fileTooLarge: "Le fichier est trop volumineux pour le chiffrement (max 100MB)",
    processingError: "Erreur lors du traitement du PDF. Veuillez réessayer.",
    unsupportedPDF: "Ce format PDF n'est pas supporté pour le chiffrement"
  },
  
  // Success messages
  success: {
    protected: "PDF protégé avec succès par mot de passe!",
    downloaded: "PDF protégé téléchargé avec succès"
  },

  // AI Recommendations
  ai: {
    analysis: {
      analyzing: "Analyse de sécurité IA",
      analyzingDescription: "Analyse du document et recommandation des paramètres de sécurité optimaux...",
      failed: "Analyse échouée",
      retry: "Réessayer l'analyse",
      completed: "Analyse terminée à {time}",
      refresh: "Actualiser l'analyse"
    },
    recommendations: {
      title: "🤖 Recommandations de sécurité IA",
      confidence: "{percent}% de confiance",
      recommended: "Recommandé",
      showDetails: "Afficher les détails",
      hideDetails: "Masquer les détails",
      applyButton: "Appliquer les paramètres"
    },
    securityLevels: {
      title: "Options de niveau de sécurité"
    },
    levels: {
      basic: {
        title: "Protection de base",
        description: "Protection par mot de passe standard avec restrictions de visualisation",
        reasoning: "Convient aux documents généraux nécessitant une confidentialité de base"
      },
      medium: {
        title: "Sécurité moyenne",
        description: "Protection renforcée avec restrictions complètes",
        reasoning: "Recommandé pour les documents professionnels sensibles"
      },
      high: {
        title: "Sécurité maximale",
        description: "Chiffrement le plus fort avec toutes les restrictions activées",
        reasoning: "Idéal pour les documents confidentiels ou hautement sensibles"
      }
    },
    suggestions: {
      title: "Suggestions de sécurité IA"
    },
    passwords: {
      suggestion1: "Utilisez une combinaison de majuscules, minuscules, chiffres et symboles",
      suggestion2: "Faites un mot de passe d'au moins 12 caractères",
      suggestion3: "Évitez les mots courants ou les informations personnelles",
      contractSuggestion: "Pour les contrats, utilisez un mot de passe très fort et partagez-le en toute sécurité"
    },
    details: {
      title: "Analyse de sécurité détaillée",
      permissions: "Permissions autorisées",
      restrictions: "Restrictions",
      passwordStrength: "Force du mot de passe requise"
    },
    errors: {
      analysisError: "Impossible d'analyser la sécurité du document"
    }
  },

  // Contenu unique détaillé pour cet outil
  detailed: {
    title: 'Pourquoi choisir notre outil de protection PDF ?',
    functionality: {
      title: 'Chiffrement de niveau militaire',
      description1: 'Notre outil de protection PDF implémente le chiffrement AES-256 standard de l\'industrie avec compatibilité de secours RC4 – le même chiffrement utilisé par les banques et les agences gouvernementales. Chaque document est chiffré localement dans votre navigateur à l\'aide du module de sécurité PDF-lib, garantissant que vos mots de passe et fichiers ne quittent jamais votre appareil.',
      description2: 'Le moteur de chiffrement prend en charge les systèmes à double mot de passe : mots de passe utilisateur pour les restrictions d\'affichage et mots de passe propriétaire pour les autorisations de modification. Choisissez entre la protection complète du document ou des contrôles d\'autorisation granulaires. Définissez des restrictions spécifiques pour la qualité d\'impression, la copie de texte, la modification du contenu, le remplissage de formulaires, les annotations et l\'assemblage de pages.'
    },
    capabilities: {
      title: 'Contrôles de sécurité avancés',
      description1: 'Protégez les contrats confidentiels, les rapports financiers, les documents juridiques, les dossiers médicaux et les matériaux commerciaux propriétaires avec des préréglages de sécurité personnalisables. Notre conseiller en sécurité alimenté par IA analyse le contenu des documents et recommande des niveaux de protection optimaux basés sur des marqueurs de sensibilité détectés.',
      description2: 'Quatre niveaux de sécurité prédéfinis offrent une configuration instantanée : Basic pour les documents généraux, Standard pour les fichiers professionnels, Professional pour les données sensibles et Maximum pour les matériaux hautement confidentiels. Chaque préréglage configure intelligemment les exigences de force du mot de passe, les méthodes de chiffrement et les restrictions d\'autorisation. L\'analyse en temps réel de la force du mot de passe garantit une sécurité adéquate tout en prévenant les vulnérabilités courantes comme les mots du dictionnaire ou les motifs prévisibles.'
    }
  }
};