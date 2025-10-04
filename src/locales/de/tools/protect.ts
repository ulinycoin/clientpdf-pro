/**
 * German translations for PDF Protection tool
 */

export const protect = {
  // Basic properties for tools grid
  title: 'PDF schützen',
  description: 'Passwort-Schutz und Sicherheitseinschränkungen zu PDF-Dateien hinzufügen',
  
  // Main page elements
  pageTitle: "PDF mit Passwort schützen",
  pageDescription: "Fügen Sie Passwortschutz und Sicherheitseinschränkungen zu Ihren PDF-Dokumenten für erweiterte Privatsphäre und Kontrolle hinzu",
  breadcrumb: "PDF schützen",
  
  // Tool interface
  uploadTitle: "PDF zum Schutz auswählen",
  uploadSubtitle: "Ziehen Sie Ihre PDF hierher oder klicken Sie zum Durchsuchen",
  supportedFormats: "Unterstützt PDF-Dateien bis zu 100MB",
  
  // Password fields
  userPassword: "Passwort zum Öffnen des Dokuments",
  confirmPassword: "Passwort bestätigen",
  ownerPassword: "Passwort zum Ändern von Berechtigungen (optional)",
  passwordPlaceholder: "Geben Sie ein starkes Passwort ein",
  confirmPlaceholder: "Passwort erneut eingeben",
  
  // Encryption settings
  encryptionLevel: "Verschlüsselungsstärke",
  encryption128: "128-bit AES (Standard)",
  encryption256: "256-bit AES (Hohe Sicherheit)",
  
  // Security presets
  securityPresets: "Sicherheitsvoreinstellungen",
  presetBasic: "Grundschutz",
  presetBasicDesc: "Passwortschutz mit grundlegenden Einschränkungen",
  presetBusiness: "Geschäftsdokument",
  presetBusinessDesc: "Professionelle Dokumentensicherheit",
  presetConfidential: "Vertraulich",
  presetConfidentialDesc: "Maximale Sicherheitseinschränkungen",
  presetCustom: "Benutzerdefinierte Einstellungen",
  presetCustomDesc: "Alle Optionen manuell konfigurieren",
  
  // Permissions section
  permissions: "Dokumenteinschränkungen",
  permissionsDesc: "Kontrollieren Sie, was Benutzer mit dem geschützten Dokument tun können",
  advancedPermissions: "Erweiterte Berechtigungen",
  
  // Advanced permission controls
  permissionPrinting: "Drucken",
  permissionPrintingDesc: "Druckberechtigungen kontrollieren",
  permissionCopying: "Textkopieren",
  permissionCopyingDesc: "Textauswahl und -kopieren erlauben",
  permissionModifying: "Dokumentbearbeitung",
  permissionModifyingDesc: "Dokumentänderung erlauben",
  permissionAnnotating: "Kommentare & Anmerkungen",
  permissionAnnotatingDesc: "Kommentare und Markup hinzufügen erlauben",
  permissionFillingForms: "Formularausfüllung",
  permissionFillingFormsDesc: "Ausfüllen interaktiver Formulare erlauben",
  permissionDocumentAssembly: "Seitenextraktion",
  permissionDocumentAssemblyDesc: "Seiten einfügen, löschen, drehen erlauben",
  permissionContentAccessibility: "Screenreader-Zugriff",
  permissionContentAccessibilityDesc: "Barrierefreiheits-Tools erlauben (empfohlen)",
  
  // Security notice
  securityNoteTitle: "Sicherheitshinweis",
  securityNoteDesc: "Diese Einschränkungen werden von PDF-Betrachtern durchgesetzt, die den PDF-Standard respektieren. Sie bieten angemessenen Schutz, sollten aber nicht für hochsensible Dokumente als einzige Sicherheitsmaßnahme verwendet werden.",
  
  // Permission types
  printing: "Drucken",
  printingNone: "Nicht erlaubt",
  printingLow: "Nur niedrige Auflösung",
  printingHigh: "Hohe Auflösung erlaubt",
  copying: "Textkopieren und -auswahl",
  modifying: "Dokumentbearbeitung und -änderung",
  annotating: "Kommentare und Anmerkungen",
  fillingForms: "Interaktives Formularausfüllen",
  contentAccessibility: "Screenreader-Zugriff (empfohlen)",
  documentAssembly: "Seitenextraktion und -zusammenstellung",
  
  // Progress and status messages
  analyzing: "Dokumentsicherheit wird analysiert...",
  encrypting: "Passwortschutz wird angewendet...",
  finalizing: "Geschütztes Dokument wird finalisiert...",
  complete: "Schutz erfolgreich angewendet!",
  
  // Security info
  securityInfo: "Dokumentsicherheitsinformationen",
  isProtected: "Dieses Dokument ist bereits passwortgeschützt",
  noProtection: "Dieses Dokument hat keinen Passwortschutz",
  
  // Warnings and alerts
  passwordWarning: "⚠️ Wichtig: Wenn Sie dieses Passwort vergessen, kann das Dokument nicht wiederhergestellt werden!",
  weakPassword: "Passwort ist zu schwach. Verwenden Sie:",
  passwordMismatch: "Passwörter stimmen nicht überein",
  existingProtection: "Diese PDF hat bereits Passwortschutz. Sie benötigen möglicherweise das aktuelle Passwort, um sie zu ändern.",
  
  // Password strength
  strengthVeryWeak: "Sehr schwach",
  strengthWeak: "Schwach",
  strengthFair: "Akzeptabel",
  strengthStrong: "Stark",
  strengthVeryStrong: "Sehr stark",
  
  // Protection modes
  protectionMode: "Schutzmodus",
  fullProtection: "Vollschutz",
  smartProtection: "Intelligenter Schutz",
  fullProtectionDesc: "Erfordert Passwort zum Öffnen des Dokuments. Maximale Sicherheit für vertrauliche Dateien.",
  smartProtectionDesc: "Kostenlose Anzeige, eingeschränktes Drucken/Kopieren. Perfekt zum Teilen von Dokumenten.",
  passwordProtection: "Passwortschutz",
  documentRestrictions: "Dokumenteinschränkungen",
  realPDFEncryption: "Echte PDF-Verschlüsselung",
  securityLevel: "Sicherheitsstufe",
  simpleView: "Einfache Ansicht",
  showAI: "KI-Empfehlungen anzeigen",
  hideAI: "KI-Empfehlungen ausblenden",  
  // Optional field labels
  documentPasswordOptional: "Dokumentpasswort (Optional)",
  leaveEmptyForPermissions: "Leer lassen für nur Berechtigungsschutz",
  notNeededForPermissions: "Nicht erforderlich für Berechtigungsschutz",

  // Encryption notices
  realPDFEncryptionTitle: "Echte PDF-Verschlüsselung",
  realPDFEncryptionDesc: "Dieses Tool wendet branchenübliche PDF-Verschlüsselung an, die mit allen PDF-Readern funktioniert. Ihr Dokument wird echten Passwortschutz haben und den Einschränkungen gemäß Ihren Einstellungen entsprechen.",
  securityLevelLabel: "Sicherheitsstufe",
  passwordWillBeRequired: "Ihre PDF benötigt das Passwort zum Öffnen und wird alle Berechtigungseinstellungen respektieren.",

  // Buttons and actions
  protectButton: "🛡️ PDF schützen",
  downloadProtected: "Geschützte PDF herunterladen",
  showPassword: "Passwort anzeigen",
  hidePassword: "Passwort verstecken",
  generatePassword: "Sicheres Passwort generieren",
  toggleAdvanced: "Erweiterte Einstellungen",
  applyPreset: "Voreinstellung anwenden",
  dismiss: "Ausblenden",
  
  // File selection
  selectedFile: "Ausgewählte Datei",
  fileSize: "Dateigröße",
  removeFile: "Datei entfernen",
  selectNewFile: "Andere Datei auswählen",
  
  // Quick steps section
  quickSteps: {
    title: "So schützen Sie Ihre PDF",
    step1: {
      title: "PDF hochladen",
      description: "Wählen Sie das PDF-Dokument aus, das Sie schützen möchten"
    },
    step2: {
      title: "Starkes Passwort setzen",
      description: "Erstellen Sie ein sicheres Passwort, das Sie sich merken können"
    },
    step3: {
      title: "Einschränkungen wählen",
      description: "Konfigurieren Sie, was Benutzer mit dem Dokument tun können"
    },
    step4: {
      title: "Geschützte Datei herunterladen",
      description: "Erhalten Sie Ihr passwortgeschütztes PDF-Dokument"
    }
  },
  
  // Benefits section
  benefits: {
    title: "Warum PDFs schützen?",
    privacy: {
      title: "Informationen privat halten",
      description: "Unbefugten Zugriff auf sensible Dokumente verhindern"
    },
    control: {
      title: "Dokumentennutzung kontrollieren",
      description: "Entscheiden Sie, wer Ihre Inhalte drucken, kopieren oder bearbeiten kann"
    },
    compliance: {
      title: "Sicherheitsanforderungen erfüllen",
      description: "Regulatorische und geschäftliche Sicherheitsstandards erfüllen"
    },
    professional: {
      title: "Professionelle Dokumentensicherheit",
      description: "Fügen Sie Ihren Dokumenten Schutz auf Unternehmensebene hinzu"
    }
  },
  
  // File size warnings
  fileSizeWarnings: {
    mediumFile: "Warnung für große Datei",
    largeFile: "Warnung für sehr große Datei",
    criticalFile: "Warnung für kritische Dateigröße",
    mediumFileDesc: "Diese Datei ist mittelgroß und die Verschlüsselung kann 10-30 Sekunden dauern.",
    largeFileDesc: "Diese Datei ist groß und die Verschlüsselung kann 1-2 Minuten dauern. Bitte haben Sie Geduld und schließen Sie den Browser-Tab nicht.",
    criticalFileDesc: "Diese Datei ist sehr groß und die Verschlüsselung kann mehrere Minuten dauern. Der Browser-Tab kann während der Verarbeitung nicht mehr reagieren.",
    tips: "Tipps:",
    tipCloseOtherTabs: "Schließen Sie andere Browser-Tabs, um Speicher freizugeben",
    tipEnsureRAM: "Stellen Sie sicher, dass Ihr Gerät über ausreichend Arbeitsspeicher verfügt",
    tipCompressFirst: "Erwägen Sie, das PDF zuerst zu komprimieren"
  },
  
  // Error messages
  errors: {
    fileNotSelected: "Bitte wählen Sie zuerst eine PDF-Datei aus",
    invalidFile: "Ungültiges PDF-Dateiformat",
    passwordRequired: "Passwort ist erforderlich",
    passwordTooShort: "Passwort muss mindestens 6 Zeichen lang sein",
    passwordsDoNotMatch: "Passwörter stimmen nicht überein",
    encryptionFailed: "Verschlüsselung des Dokuments fehlgeschlagen",
    fileTooLarge: "Datei ist zu groß für die Verschlüsselung (max. 100MB)",
    processingError: "Fehler beim Verarbeiten der PDF. Bitte versuchen Sie es erneut.",
    unsupportedPDF: "Dieses PDF-Format wird für die Verschlüsselung nicht unterstützt"
  },
  
  // Success messages
  success: {
    protected: "PDF erfolgreich mit Passwort geschützt!",
    downloaded: "Geschützte PDF erfolgreich heruntergeladen"
  },

  // AI Recommendations
  ai: {
    analysis: {
      analyzing: "KI-Sicherheitsanalyse",
      analyzingDescription: "Dokumentanalyse und Empfehlung optimaler Sicherheitseinstellungen...",
      failed: "Analyse fehlgeschlagen",
      retry: "Analyse wiederholen",
      completed: "Analyse abgeschlossen um {time}",
      refresh: "Analyse aktualisieren"
    },
    recommendations: {
      title: "🤖 KI-Sicherheitsempfehlungen",
      confidence: "{percent}% Sicherheit",
      recommended: "Empfohlen",
      showDetails: "Details anzeigen",
      hideDetails: "Details ausblenden",
      applyButton: "Einstellungen anwenden"
    },
    securityLevels: {
      title: "Sicherheitsstufenoptionen"
    },
    levels: {
      basic: {
        title: "Grundschutz",
        description: "Standard-Passwortschutz mit Anzeigebeschränkungen",
        reasoning: "Gut für allgemeine Dokumente mit grundlegendem Datenschutzbedarf"
      },
      medium: {
        title: "Mittlere Sicherheit",
        description: "Erweiterte Schutz mit umfassenden Einschränkungen",
        reasoning: "Empfohlen für sensible Geschäftsdokumente"
      },
      high: {
        title: "Maximale Sicherheit",
        description: "Stärkste Verschlüsselung mit allen Einschränkungen",
        reasoning: "Optimal für vertrauliche oder hochsensible Dokumente"
      }
    },
    suggestions: {
      title: "KI-Sicherheitsvorschläge"
    },
    passwords: {
      suggestion1: "Verwenden Sie eine Kombination aus Groß-, Kleinbuchstaben, Zahlen und Symbolen",
      suggestion2: "Machen Sie Ihr Passwort mindestens 12 Zeichen lang",
      suggestion3: "Vermeiden Sie gängige Wörter oder persönliche Informationen",
      contractSuggestion: "Für Verträge verwenden Sie ein sehr starkes Passwort und teilen Sie es sicher"
    },
    details: {
      title: "Detaillierte Sicherheitsanalyse",
      permissions: "Erlaubte Berechtigungen",
      restrictions: "Einschränkungen",
      passwordStrength: "Erforderliche Passwortstärke"
    },
    errors: {
      analysisError: "Dokumentsicherheit konnte nicht analysiert werden"
    }
  },

  // Detaillierter einzigartiger Inhalt für dieses Tool
  detailed: {
    title: 'Warum unser PDF-Schutztool wählen?',
    functionality: {
      title: 'Verschlüsselung auf militärischem Niveau',
      description1: 'Unser PDF-Schutztool implementiert die branchenübliche AES-256-Verschlüsselung mit RC4-Fallback-Kompatibilität – dieselbe Verschlüsselung, die von Banken und Regierungsbehörden verwendet wird. Jedes Dokument wird lokal in Ihrem Browser mit dem Sicherheitsmodul von PDF-lib verschlüsselt, sodass Ihre Passwörter und Dateien niemals Ihr Gerät verlassen.',
      description2: 'Die Verschlüsselungs-Engine unterstützt Dual-Passwort-Systeme: Benutzerpasswörter für Anzeigebeschränkungen und Eigentümerpasswörter für Bearbeitungsberechtigungen. Wählen Sie zwischen vollständigem Dokumentenschutz oder granularen Berechtigungskontrollen. Legen Sie spezifische Einschränkungen für Druckqualität, Textkopieren, Inhaltsänderung, Formularausfüllung, Anmerkungen und Seitenzusammenstellung fest.'
    },
    capabilities: {
      title: 'Erweiterte Sicherheitskontrollen',
      description1: 'Schützen Sie vertrauliche Verträge, Finanzberichte, Rechtsdokumente, Krankenakten und proprietäre Geschäftsmaterialien mit anpassbaren Sicherheitsvoreinstellungen. Unser KI-gestützter Sicherheitsberater analysiert Dokumentinhalte und empfiehlt optimale Schutzstufen basierend auf erkannten Sensibilitätsmarkern.',
      description2: 'Vier voreingestellte Sicherheitsstufen bieten sofortige Konfiguration: Basic für allgemeine Dokumente, Standard für Geschäftsdateien, Professional für sensible Daten und Maximum für hochvertrauliche Materialien. Jede Voreinstellung konfiguriert intelligent Anforderungen an die Passwortstärke, Verschlüsselungsmethoden und Berechtigungseinschränkungen. Die Echtzeit-Analyse der Passwortstärke gewährleistet angemessene Sicherheit und verhindert häufige Schwachstellen wie Wörterbuchwörter oder vorhersehbare Muster.'
    }
  }
};