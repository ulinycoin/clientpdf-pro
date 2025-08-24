// src/locales/de.ts
import { Translations } from '../types/i18n';

export const de: Translations = {
  common: {
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolgreich',
    cancel: 'Abbrechen',
    close: 'Schließen',
    save: 'Speichern',
    download: 'Herunterladen',
    upload: 'Hochladen',
    delete: 'Löschen',
    clear: 'Löschen',
    preview: 'Vorschau',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück',
    continue: 'Fortfahren',
    finish: 'Beenden',
    file: 'Datei',
    files: 'Dateien',
    size: 'Größe',
    name: 'Name',
    type: 'Typ',
    format: 'Format',
    quality: 'Qualität',
    pages: 'Seiten',
    page: 'Seite',
    processing: 'Verarbeitung',
    processed: 'Verarbeitet',
    ready: 'Bereit',
    complete: 'Abgeschlossen',
    remove: 'Entfernen',
    clearAll: 'Alle löschen',
    or: 'oder',
    selectFile: 'Bitte wählen Sie mindestens eine Datei aus',
    unexpectedError: 'Ein unerwarteter Fehler ist aufgetreten',
    pdfFiles: 'PDF-Dateien',
    faqTitle: 'Häufig gestellte Fragen',
    home: 'Startseite',
    readyToUse: 'Einsatzbereit',
    comingSoon: 'Demnächst',
    featured: 'Beliebt',
  },

  // Tool page template translations
  toolTemplate: {
    breadcrumbs: {
      home: 'Startseite'
    },
    quickSteps: {
      title: 'Drei einfache Schritte zum perfekten Ergebnis',
      subtitle: 'Schneller und intuitiver Dateiverarbeitungs-Workflow',
      steps: {
        upload: {
          title: 'Dateien hochladen',
          description: 'Dateien ziehen und ablegen oder zum Auswählen klicken'
        },
        process: {
          title: 'Dokument verarbeiten',
          description: 'Gewünschte Operation mit einem Klick starten'
        },
        download: {
          title: 'Ergebnis herunterladen',
          description: 'Verarbeitete Datei sofort erhalten'
        }
      }
    },
    benefits: {
      advantages: {
        title: 'Tool-Vorteile',
        items: {
          speed: 'Schnelle Verarbeitung: Sofortige Ergebnisse ohne Wartezeit',
          quality: 'Hohe Qualität: Behält ursprüngliche Auflösung bei',
          simplicity: 'Einfache Bedienung: Intuitive Benutzeroberfläche',
          universal: 'Universell: Unterstützt alle PDF-Standards'
        }
      },
      security: {
        title: 'Sicherheit und Datenschutz',
        items: {
          local: 'Lokale Verarbeitung: Dateien verlassen nie Ihren Browser',
          noUpload: 'Keine Server-Uploads: 100% Datenschutz',
          noRegistration: 'Keine Registrierung: Anonyme Nutzung',
          autoDelete: 'Auto-Löschung: Dateien werden beim Schließen der Seite entfernt'
        }
      },
      technical: {
        title: 'Wie das Tool funktioniert',
        items: {
          technology: 'PDF.js-Technologie: Moderne Mozilla-Bibliothek',
          crossplatform: 'Plattformübergreifend: Funktioniert in jedem Browser',
          quality: 'Qualitätserhaltung: Kein Auflösungsverlust',
          metadata: 'Metadaten-Unterstützung: Dokumenteigenschaften bleiben erhalten'
        }
      }
    },
    detailed: {
      title: 'Professionelle PDF-Dateiverarbeitung online',
      business: {
        title: 'Für Unternehmen und Arbeit',
        description1: 'Unser PDF-Tool ist perfekt für die Arbeit mit Dokumenten, Berichten und Präsentationen. Verarbeiten Sie Verträge, Rechnungen und technische Spezifikationen schnell und professionell.',
        description2: 'Dateien jeder Größe werden unterstützt, ursprüngliche Qualität und Dokumentformatierung bleiben erhalten.'
      },
      personal: {
        title: 'Für den persönlichen Gebrauch',
        description1: 'Verarbeiten Sie Dokumente für Anträge, Erstellung von Portfolios, Archivierung wichtiger Papiere. Das Tool funktioniert komplett offline und erfordert keine Software-Installation.',
        description2: 'Die intuitive Benutzeroberfläche macht es einfach, mit Dokumenten zu arbeiten und gewünschte Ergebnisse zu erzielen.'
      }
    }
  },

  header: {
    title: 'LocalPDF',
    subtitle: 'Datenschutzzentrierte PDF-Tools',
    navigation: {
      privacy: 'Datenschutz',
      faq: 'FAQ',
      github: 'GitHub',
    },
    badges: {
      tools: 'PDF Tools',
      private: '100% Privat',
      activeTools: 'Aktive Tools',
      privateProcessing: '100% private Verarbeitung',
    },
    mobileMenu: {
      toggle: 'Mobiles Menü umschalten',
      privacyPolicy: 'Datenschutzerklärung',
      githubRepository: 'GitHub Repository',
    },
  },

  home: {
    whyChooseTitle: 'Warum LocalPDF wählen?',
    whyChooseSubtitle: 'Moderner Ansatz zur PDF-Bearbeitung mit maximalem Datenschutz',
    hero: {
      title: 'LocalPDF',
      subtitle: 'Datenschutzzentrierte PDF-Tools',
      description: 'Professionelle PDF-Verarbeitungstools, die vollständig in Ihrem Browser funktionieren',
      descriptionSecondary: 'Keine Uploads • Kein Tracking • Keine Limits • Völlig kostenlos für immer',
      badges: [
        { icon: '🔐', text: 'Lokale Verarbeitung', description: 'Ihre Dateien verlassen niemals Ihr Gerät' },
        { icon: '⚡', text: 'Sofortige Ergebnisse', description: 'Keine Server-Uploads erforderlich' },
        { icon: '🌐', text: 'Funktioniert offline', description: 'Internet nur für ersten Download nötig' },
        { icon: '🔓', text: 'Keine Registrierung', description: 'Sofort loslegen' }
      ],
      getStarted: 'Loslegen',
      learnMore: 'Mehr erfahren',
      features: {
        privacy: {
          title: 'Ihre Dateien verlassen niemals Ihr Gerät',
          subtitle: '100% lokale Verarbeitung',
        },
        speed: {
          title: 'Blitzschnelle Verarbeitung',
          subtitle: 'Keine Server-Verzögerungen',
        },
        free: {
          title: 'Völlig kostenlos, keine Limits',
          subtitle: 'Open Source für immer',
        },
      },
      trustIndicators: {
        noRegistration: 'Keine Registrierung erforderlich',
        worksOffline: 'Funktioniert offline',
        openSource: 'Open Source',
      },
    },
    upload: {
      title: 'In Sekunden starten',
      description: 'Laden Sie Ihre PDF-Dateien hoch, um mit der Verarbeitung zu beginnen, oder wählen Sie "Bilder zu PDF", um Bilder zu konvertieren',
      dragDrop: 'Dateien hier hinziehen',
      selectFiles: 'Dateien auswählen',
      maxSize: 'Max. Dateigröße: 100MB',
      supportedFormats: 'Unterstützte Formate: PDF',
      ready: 'Bereit zur Verarbeitung',
      pdfDocument: 'PDF-Dokument',
    },
    tools: {
      title: 'Vollständiges PDF-Toolkit',
      subtitle: 'Wählen Sie das richtige Tool für Ihre Bedürfnisse. Alle Operationen werden lokal in Ihrem Browser durchgeführt.',
      categories: {
        core: {
          title: 'Grundlegende Tools',
          description: 'Die beliebtesten PDF-Operationen'
        },
        advanced: {
          title: 'Erweiterte Funktionen',
          description: 'Leistungsstarke Tools für professionelle Arbeit'
        },
        conversion: {
          title: 'Dateikonvertierung',
          description: 'Konvertierung zwischen verschiedenen Formaten'
        },
        enhancement: {
          title: 'Dokumentverbesserung',
          description: 'Hinzufügen von Text, Wasserzeichen und anderen Elementen'
        }
      },
      trustIndicators: {
        private: '100% Privat',
        noUploads: 'Keine Uploads',
        unlimited: 'Unbegrenzt'
      },
      whyChoose: {
        title: 'Warum LocalPDF wählen?',
        description: 'Entwickelt mit Fokus auf Datenschutz und Leistung',
        stats: {
          tools: 'PDF-Tools',
          toolsDesc: 'Vollständiges Toolkit',
          privacy: 'Datenschutz',
          privacyDesc: 'Lokale Verarbeitung',
          dataCollection: 'Datensammlung',
          dataCollectionDesc: 'Kein Tracking',
          usageLimits: 'Nutzungslimits',
          usageLimitsDesc: 'Kostenlos für immer',
        },
        features: {
          noRegistration: 'Keine Registrierung erforderlich',
          fastProcessing: 'Blitzschnelle Verarbeitung',
          secureProcessing: 'Sichere Verarbeitung',
          worksOffline: 'Funktioniert offline',
        },
      },
      trustMessage: 'Ihre Dateien verlassen niemals Ihr Gerät',
      stats: {
        tools: 'Tools',
        toolsDescription: 'Alle nötigen Funktionen',
      },
    },
    // Trust signals section
    trustSignals: {
      title: 'Millionen Nutzer vertrauen LocalPDF',
      subtitle: 'Werden Sie Teil der Gemeinschaft von Fachleuten, die Privatsphäre und Geschwindigkeit schätzen',
      stats: {
        filesProcessed: 'Verarbeitete Dateien',
        filesDescription: 'PDF-Dokumente ohne ein einziges Datenleck verarbeitet',
        happyUsers: 'Zufriedene Nutzer',
        usersDescription: 'Profis vertrauen uns ihre Dokumente an',
        countriesUsing: 'Länder nutzen',
        countriesDescription: 'LocalPDF funktioniert weltweit',
      },
      security: {
        title: 'Sicherheit und Compliance',
        sslSecured: 'SSL-gesichert',
        gdprCompliant: 'DSGVO-konform',
        localProcessing: 'Lokale Verarbeitung',
        openSource: 'Open Source',
      },
    },
    // Quick start section
    quickStart: {
      title: 'Wie es funktioniert?',
      subtitle: 'Drei einfache Schritte zum perfekten Ergebnis',
      steps: {
        step1: {
          title: 'Tool auswählen',
          description: 'Finden Sie das benötigte PDF-Tool aus unserer Sammlung',
        },
        step2: {
          title: 'Dateien hochladen',
          description: 'Ziehen Sie Dateien per Drag & Drop oder klicken Sie zum Auswählen',
        },
        step3: {
          title: 'Ergebnis herunterladen',
          description: 'Erhalten Sie sofort Ihre verarbeiteten Dateien',
        },
      },
      stats: {
        averageTime: 'Durchschnittliche Verarbeitungszeit',
        dataSentToServers: 'An Server gesendete Daten',
        privacyGuaranteed: 'Privatsphäre garantiert',
      },
    },
    // Privacy benefits section
    privacyBenefits: {
      benefits: {
        privacy: {
          title: 'Vollständige Privatsphäre',
          description: 'Ihre Dateien werden lokal im Browser verarbeitet und verlassen niemals Ihr Gerät',
        },
        speed: {
          title: 'Blitzgeschwindigkeit',
          description: 'Dateiverarbeitung erfolgt sofort ohne Upload auf Server',
        },
        offline: {
          title: 'Funktioniert offline',
          description: 'Nach dem ersten Laden funktioniert die Website ohne Internetverbindung',
        },
        unlimited: {
          title: 'Unbegrenzt',
          description: '{{toolsCount}} Tools für jede Aufgabe. Verarbeiten Sie unbegrenzt viele Dateien',
        },
      },
      cta: 'Bereit anzufangen? Wählen Sie aus {{toolsCount}} Tools unten',
    },
  },

  tools: {
    merge: {
      title: 'PDFs zusammenführen',
      description: 'Mehrere PDF-Dateien zu einem Dokument kombinieren',
    },
    compress: {
      title: 'PDF komprimieren',
      description: 'PDF-Dateigröße reduzieren bei gleichbleibender Qualität',
      starting: 'Komprimierung wird gestartet...',
      failed: 'Komprimierung fehlgeschlagen',
      fileToCompress: 'Zu komprimierende Datei',
      smaller: 'kleiner',
      estimated: 'geschätzt',
      compressing: 'Komprimierung läuft...',
      howItWorks: 'Wie es funktioniert',
      howItWorksDescription: 'PDF-Komprimierung entfernt redundante Daten und optimiert die Inhaltsstruktur. Niedrigere Qualitätseinstellungen ergeben kleinere Dateien, können aber die visuelle Qualität beeinträchtigen.',
      settings: {
        title: 'Komprimierungseinstellungen',
        qualityLevel: 'Qualitätsstufe',
        smallerFile: 'Kleinere Datei',
        betterQuality: 'Bessere Qualität',
        compressImages: 'Bilder komprimieren (kann die Dateigröße erheblich reduzieren)',
        removeMetadata: 'Metadaten entfernen (Autor, Titel, Erstellungsdatum)',
        optimizeForWeb: 'Für Web-Ansicht optimieren (schnelleres Laden)',
      },
    },
    addText: {
      title: 'Text hinzufügen',
      description: 'Textannotationen und Kommentare zu PDF hinzufügen',
    },
    watermark: {
      title: 'Wasserzeichen hinzufügen',
      description: 'Text-Wasserzeichen zum Schutz von Dokumenten hinzufügen',
    },
    rotate: {
      title: 'Seiten drehen',
      description: 'Seiten um 90, 180 oder 270 Grad drehen',
    },
    extractPages: {
      title: 'Seiten extrahieren',
      description: 'Bestimmte Seiten in ein neues Dokument extrahieren',
    },
    extractText: {
      title: 'Text extrahieren',
      description: 'Textinhalt aus PDF-Dateien extrahieren',
    },
    split: {
      title: 'PDF aufteilen',
      description: 'PDF-Dateien in separate Seiten oder Bereiche aufteilen',
      pageTitle: 'PDF-Dateien kostenlos aufteilen',
      pageDescription: 'Teilen Sie PDF-Dateien kostenlos nach Seiten oder Bereichen auf. Extrahieren Sie bestimmte Seiten aus PDF-Dokumenten. Private und sichere PDF-Aufteilung in Ihrem Browser.',
      uploadTitle: 'PDF zum Aufteilen hochladen',
      uploadDescription: 'Teilen Sie Ihr PDF in einzelne Seiten auf oder extrahieren Sie bestimmte Seitenbereiche',
      selectFile: 'PDF-Datei auswählen',
      supportedFiles: 'Unterstützt: PDF-Dateien bis zu 100MB',
      successTitle: 'PDF erfolgreich aufgeteilt!',
      successDescription: 'Ihr PDF wurde in {count} separate Dateien aufgeteilt.',
      downloadAllZip: 'Alle Seiten als ZIP herunterladen ({count} Dateien)',
      downloadIndividual: 'Einzelne Seiten herunterladen:',
      pageNumber: 'Seite {page}',
      splitAnother: 'Weitere PDF aufteilen',
      howToTitle: 'So teilen Sie PDF auf:',
      buttons: {
        startSplitting: 'Aufteilung starten',
      },
      seo: {
        title: 'PDF-Dateien kostenlos aufteilen - Seiten online extrahieren | LocalPDF',
        description: 'Teilen Sie PDF-Dateien kostenlos nach Seiten oder Bereichen auf. Extrahieren Sie bestimmte Seiten aus PDF-Dokumenten. Private und sichere PDF-Aufteilung in Ihrem Browser.',
        keywords: 'pdf aufteilen, pdf seiten extrahieren, pdf seitenextrakteur, pdf teiler kostenlos, pdf trennen',
      },
      breadcrumbs: {
        home: 'Startseite',
        split: 'PDF aufteilen',
      },
      howTo: {
        title: 'So teilen Sie PDF-Dateien auf',
        individualPages: {
          title: 'Einzelne Seiten',
          description: 'Jede Seite in separate PDF-Dateien aufteilen',
        },
        pageRange: {
          title: 'Seitenbereich',
          description: 'Einen bestimmten Bereich von Seiten extrahieren (z.B. Seiten 5-10)',
        },
        specificPages: {
          title: 'Bestimmte Seiten',
          description: 'Einzelne Seiten zum Extrahieren auswählen (z.B. 1, 3, 5-7, 10)',
        },
        zipOption: {
          title: 'ZIP-Option',
          description: 'Mehrere Dateien in einen einzigen ZIP-Download verpacken',
        },
        privacy: {
          title: 'Datenschutz',
          description: 'Alle Verarbeitung erfolgt lokal in Ihrem Browser',
        },
        steps: {
          upload: {
            title: 'PDF hochladen',
            description: 'Klicken Sie auf "Datei wählen" oder ziehen Sie Ihr PDF-Dokument in den Upload-Bereich.',
            icon: '📤',
          },
          configure: {
            title: 'Seiten auswählen',
            description: 'Wählen Sie aus, welche Seiten extrahiert werden sollen - einzelne Seiten, Seitenbereiche oder mehrere Abschnitte.',
            icon: '✂️',
          },
          download: {
            title: 'Seiten herunterladen',
            description: 'Ihre aufgeteilten PDF-Seiten sind sofort zum Download bereit.',
            icon: '📥',
          },
        },
      },
      features: {
        title: 'Warum unseren PDF-Teiler wählen?',
        privacy: {
          title: '100% Privat',
          description: 'Ihr PDF wird lokal in Ihrem Browser verarbeitet. Keine Uploads zu Servern, vollständige Privatsphäre garantiert.',
        },
        fast: {
          title: 'Blitzschnell',
          description: 'Sofortige PDF-Aufteilung mit unserer optimierten Engine. Kein Warten auf Uploads oder Verarbeitungsschlangen.',
        },
        quality: {
          title: 'Hohe Qualität',
          description: 'Bewahren Sie die ursprüngliche PDF-Qualität und -Formatierung. Aufgeteilte Seiten behalten perfekte Klarheit und Struktur.',
        },
        free: {
          title: 'Völlig kostenlos',
          description: 'Teilen Sie unbegrenzt PDFs kostenlos auf. Keine Registrierung, keine Wasserzeichen, keine versteckten Beschränkungen.',
        },
      },
      faqTitle: 'Häufig gestellte Fragen zur PDF-Aufteilung',
      seoContent: {
        title: 'Vollständiger Leitfaden zur PDF-Aufteilung',
        introduction: 'Das Aufteilen von PDF-Dateien ist eine grundlegende Aufgabe der Dokumentenverwaltung. Ob Sie bestimmte Seiten extrahieren, Kapitel trennen oder ein großes Dokument in kleinere, besser handhabbare Dateien aufteilen müssen - unser datenschutzorientierter PDF-Teiler bietet die perfekte Lösung. Im Gegensatz zu Online-Diensten, die Datei-Uploads erfordern, verarbeitet LocalPDF alles lokal in Ihrem Browser für maximale Sicherheit.',
        whyChoose: {
          title: 'Warum LocalPDF PDF-Teiler wählen?',
          privacy: {
            title: '100% Datenschutz garantiert',
            text: 'Ihr PDF wird vollständig in Ihrem Browser verarbeitet. Keine Server-Uploads, keine Datensammlung, vollständiger Datenschutz für sensible Dokumente.',
          },
          speed: {
            title: 'Blitzschnelle Verarbeitung',
            text: 'Sofortige PDF-Aufteilung mit unserer optimierten Browser-Engine. Kein Warten auf Uploads, Downloads oder Server-Verarbeitungsschlangen.',
          },
          quality: {
            title: 'Perfekte Qualitätserhaltung',
            text: 'Behalten Sie die ursprüngliche PDF-Qualität, Formatierung, Schriftarten und Struktur bei. Aufgeteilte Seiten behalten perfekte Klarheit und alle Dokumenteigenschaften.',
          },
          free: {
            title: 'Völlig kostenlos für immer',
            text: 'Teilen Sie unbegrenzt PDFs ohne Registrierung, Wasserzeichen, Dateigrößenbeschränkungen oder versteckte Gebühren auf. Professionelle Ergebnisse ohne Kosten.',
          },
        },
        compatibility: {
          title: 'Browser-Kompatibilität & Systemanforderungen',
          text: 'LocalPDF funktioniert auf allen modernen Browsern einschließlich Chrome 90+, Firefox 90+, Safari 14+ und Edge 90+. Kompatibel mit Windows, macOS, Linux, iOS und Android-Geräten. Keine Softwareinstallation erforderlich - öffnen Sie einfach Ihren Browser und beginnen Sie mit der PDF-Aufteilung.',
        },
        technical: {
          title: 'Fortschrittliche PDF-Verarbeitungstechnologie',
          text: 'Entwickelt mit modernsten JavaScript-PDF-Bibliotheken einschließlich PDF.js und pdf-lib, liefert LocalPDF professionelle PDF-Aufteilungsfunktionen direkt in Ihrem Browser. Unsere optimierten Algorithmen handhaben komplexe PDF-Strukturen, bewahren die Dokumentintegrität und unterstützen Dateien bis zu 100MB.',
        },
        security: {
          title: 'Unternehmensgerechte Sicherheit',
          text: 'DSGVO-konform, CCPA-konform und entspricht internationalen Datenschutzstandards. Ihre Dokumente verlassen niemals Ihr Gerät und gewährleisten vollständige Vertraulichkeit für Geschäfts-, Rechts- und persönliche Dateien.',
        },
      },
    },
    pdfToImage: {
      title: 'PDF zu Bildern',
      description: 'PDF-Seiten in PNG oder JPEG konvertieren',
    },
    imageToPdf: {
      title: 'Bilder zu PDF',
      description: 'Mehrere Bilder zu einem PDF-Dokument kombinieren',
    },
    wordToPdf: {
      title: 'Word zu PDF',
      description: 'Word-Dokumente (.docx) in PDF-Format konvertieren',
    },
    excelToPdf: {
      title: 'Excel zu PDF',
      description: 'Excel-Tabellen (.xlsx, .xls) in PDF-Format konvertieren',
      pageTitle: 'Excel zu PDF Konverter',
      pageDescription: 'Konvertieren Sie Ihre Excel-Dateien (.xlsx, .xls) in PDF-Format mit Unterstützung für mehrere Blätter, breite Tabellen und internationalen Text. Alle Verarbeitung erfolgt lokal.',
      howToTitle: 'Wie man Excel zu PDF konvertiert',
      uploadTitle: 'Excel-Datei hochladen',
      uploadDescription: 'Wählen Sie Ihre Excel-Datei (.xlsx oder .xls) von Ihrem Gerät aus. Dateien werden lokal für maximale Privatsphäre verarbeitet.',
      configureTitle: 'Einstellungen konfigurieren',
      configureDescription: 'Wählen Sie zu konvertierende Blätter aus, stellen Sie die Ausrichtung ein und passen Sie Formatierungsoptionen an Ihre Bedürfnisse an.',
      downloadTitle: 'PDF herunterladen',
      downloadDescription: 'Erhalten Sie Ihre konvertierten PDF-Dateien sofort. Jedes Blatt kann als separate PDF gespeichert oder zu einer kombiniert werden.',
      featuresTitle: 'Warum LocalPDF Excel Konverter wählen?',
      privacyTitle: '100% privat und sicher',
      privacyDescription: 'Ihre Excel-Dateien verlassen niemals Ihr Gerät. Alle Konvertierung erfolgt lokal in Ihrem Browser für maximale Privatsphäre und Sicherheit.',
      fastTitle: 'Blitzschnelle Verarbeitung',
      fastDescription: 'Konvertieren Sie Excel-Dateien sofort zu PDF ohne Warten auf Uploads oder Downloads. Funktioniert auch offline.',
      multiFormatTitle: 'Unterstützung mehrerer Formate',
      multiFormatDescription: 'Funktioniert mit .xlsx und .xls Dateien. Unterstützt mehrere Blätter, komplexe Formeln und internationalen Text.',
      freeTitle: 'Völlig kostenlos',
      freeDescription: 'Keine Limits, keine Wasserzeichen, keine versteckten Gebühren. Konvertieren Sie unbegrenzt Excel-Dateien zu PDF kostenlos, für immer.',
      // Tool component translations
      chooseExcelFile: 'Excel-Datei wählen',
      dragDropSubtitle: 'Hier klicken oder Ihre Excel-Tabelle hierher ziehen',
      supportedFormats: 'Unterstützt Excel-Dateien (.xlsx, .xls) bis zu 100MB',
      multipleSheets: 'Unterstützung mehrerer Blätter',
      complexFormulas: 'Komplexe Formeln und Formatierung',
      internationalText: 'Internationaler Text und Sprachen',
      localProcessing: 'Verarbeitung erfolgt lokal in Ihrem Browser',
      conversionCompleted: 'Konvertierung abgeschlossen!',
      pdfReady: 'PDF ist zum Download bereit',
      multipleFiles: '{count} PDF-Dateien erstellt',
      fileInformation: 'Dateiinformationen',
      file: 'Datei',
      size: 'Größe',
      sheets: 'Blätter',
      languages: 'Sprachen',
      multiLanguageNote: 'Mehrere Sprachen erkannt. Geeignete Schriftarten werden automatisch geladen.',
      chooseDifferentFile: 'Andere Datei wählen',
      conversionSettings: 'Konvertierungseinstellungen',
      selectSheets: 'Blätter auswählen',
      selectAll: 'Alle auswählen',
      deselectAll: 'Alle abwählen',
      rowsColumns: '{rows} Zeilen × {columns} Spalten',
      pageOrientation: 'Seitenausrichtung',
      portrait: 'Hochformat',
      landscape: 'Querformat',
      pageSize: 'Seitengröße',
      fontSize: 'Schriftgröße',
      outputFormat: 'Ausgabeformat',
      singlePdf: 'Eine PDF-Datei',
      separatePdfs: 'Separate PDF-Dateien',
      includeSheetNames: 'Blattnamen einschließen',
      convertToPdf: 'Zu PDF konvertieren',
      converting: 'Konvertierung...',
      faqTitle: 'Häufig gestellte Fragen zur Excel zu PDF Konvertierung',
    },
    ocr: {
      title: 'OCR-Erkennung',
      description: 'Text aus gescannten PDFs und Bildern extrahieren',
    },
  },

  imagesToPdf: {
    uploadTitle: 'Bilder zum Konvertieren hochladen',
    uploadDescription: 'Mehrere Bilder in ein einziges PDF-Dokument konvertieren',
    selectFiles: 'Bilddateien auswählen',
    supportedFiles: 'Unterstützt: JPG, PNG, WEBP, GIF Dateien bis zu 50MB je Datei',
    successTitle: 'PDF erfolgreich erstellt!',
    howToTitle: 'So konvertieren Sie Bilder zu PDF:',
    howTo: {
      uploadImages: {
        title: 'Bilder hochladen',
        description: 'Mehrere Bilddateien von Ihrem Gerät auswählen'
      },
      configureSettings: {
        title: 'Einstellungen konfigurieren',
        description: 'Seitengröße, Ausrichtung und Bildlayout-Optionen auswählen'
      },
      generatePdf: {
        title: 'PDF generieren',
        description: 'Klicken Sie auf Konvertieren, um Ihr PDF mit allen Bildern zu erstellen'
      }
    }
  },

  errors: {
    fileNotSupported: 'Dateiformat nicht unterstützt',
    fileTooLarge: 'Dateigröße überschreitet das maximale Limit',
    processingFailed: 'Verarbeitung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    noFilesSelected: 'Keine Dateien ausgewählt',
    invalidFormat: 'Ungültiges Dateiformat',
    networkError: 'Netzwerkfehler aufgetreten',
    unknownError: 'Ein unbekannter Fehler ist aufgetreten',
  },

  footer: {
    description: 'Kostenlose PDF-Tools. Völlig privat, schnell und sicher. Alle Operationen werden lokal in Ihrem Browser durchgeführt.',
    links: {
      privacy: 'Datenschutz',
      terms: 'AGB',
      faq: 'FAQ',
      github: 'GitHub',
    },
    sections: {
      product: {
        title: 'Produkt',
        allTools: 'Alle Tools'
      },
      company: {
        title: 'Unternehmen',
        about: 'Über das Projekt',
        terms: 'Nutzungsbedingungen'
      },
      developers: {
        title: 'Entwickler',
        apiDocs: 'API-Dokumentation',
        contribute: 'Beitragen',
        license: 'Lizenz'
      }
    },
    copyright: '© {year} LocalPDF. Open Source Projekt.',
    builtWith: 'Erstellt mit',
    followProject: 'Projekt folgen:'
  },

  components: {
    relatedTools: {
      title: 'Verwandte PDF-Tools',
      subtitle: 'Sie möchten vielleicht auch:',
      viewAllTools: 'Alle PDF-Tools anzeigen',
      toolNames: {
        merge: 'PDFs zusammenführen',
        split: 'PDF aufteilen',
        compress: 'PDF komprimieren',
        addText: 'Text hinzufügen',
        watermark: 'Wasserzeichen hinzufügen',
        rotate: 'Seiten drehen',
        extractPages: 'Seiten extrahieren',
        extractText: 'Text extrahieren',
        pdfToImage: 'PDF zu Bildern',
        'word-to-pdf': 'Word zu PDF',
        'excel-to-pdf': 'Excel zu PDF',
        'images-to-pdf': 'Bilder zu PDF',
      },
      toolDescriptions: {
        merge: 'Mehrere PDF-Dateien zu einer kombinieren',
        split: 'PDF in separate Dateien aufteilen',
        compress: 'PDF-Dateigröße reduzieren',
        addText: 'Text und Anmerkungen hinzufügen',
        watermark: 'Wasserzeichen zum Schutz von PDFs hinzufügen',
        rotate: 'PDF-Seiten drehen',
        extractPages: 'Bestimmte Seiten extrahieren',
        extractText: 'Textinhalt aus PDFs abrufen',
        pdfToImage: 'PDF in Bilder konvertieren',
        'word-to-pdf': 'Word-Dokumente zu PDF konvertieren',
        'excel-to-pdf': 'Excel-Tabellen zu PDF konvertieren',
        'images-to-pdf': 'Bilder zu PDF-Format konvertieren',
      },
      actions: {
        merge: {
          split: 'zusammengeführte PDF aufteilen',
          compress: 'zusammengeführte Datei komprimieren',
          extractPages: 'bestimmte Seiten extrahieren',
        },
        split: {
          merge: 'aufgeteilte Dateien wieder zusammenführen',
          rotate: 'aufgeteilte Seiten drehen',
          extractPages: 'mehr Seiten extrahieren',
        },
        compress: {
          merge: 'komprimierte Dateien zusammenführen',
          split: 'komprimierte PDF aufteilen',
          watermark: 'Wasserzeichen hinzufügen',
        },
        addText: {
          watermark: 'Wasserzeichen hinzufügen',
          rotate: 'annotierte Seiten drehen',
          extractText: 'gesamten Text extrahieren',
        },
        watermark: {
          addText: 'mehr Text hinzufügen',
          compress: 'PDF mit Wasserzeichen komprimieren',
          rotate: 'Seiten mit Wasserzeichen drehen',
        },
        rotate: {
          addText: 'Text zu gedrehten Seiten hinzufügen',
          watermark: 'Wasserzeichen hinzufügen',
          split: 'gedrehte PDF aufteilen',
        },
        extractPages: {
          merge: 'extrahierte Seiten zusammenführen',
          rotate: 'extrahierte Seiten drehen',
          pdfToImage: 'Seiten in Bilder konvertieren',
        },
        extractText: {
          addText: 'mehr Text hinzufügen',
          extractPages: 'bestimmte Seiten extrahieren',
          pdfToImage: 'in Bilder konvertieren',
        },
        pdfToImage: {
          extractPages: 'mehr Seiten extrahieren',
          extractText: 'Textinhalt abrufen',
          rotate: 'vor Konvertierung drehen',
        },
        'excel-to-pdf': {
          'word-to-pdf': 'Dokumente zu PDF konvertieren',
          'images-to-pdf': 'Bilder zu PDF konvertieren',
          merge: 'mehrere PDFs zusammenführen',
        },
      },
    },
    fileUploadZone: {
      dropActive: 'Dateien hier ablegen',
      chooseFiles: 'PDF-Dateien auswählen',
      dragAndDrop: 'Dateien hier hinziehen oder klicken zum Auswählen',
      maxFileSize: 'Max. {size} pro Datei',
      selectFiles: 'Dateien auswählen',
      trustFeatures: {
        private: '100% Privat',
        fast: 'Schnell',
        free: 'Kostenlos',
      },
      trustMessage: 'Dateien verlassen niemals Ihr Gerät • Verarbeitung erfolgt lokal im Browser',
      alerts: {
        unsupportedFiles: '{count} Datei(en) übersprungen aufgrund nicht unterstützten Formats. Unterstützte Formate: {formats}',
        fileLimit: 'Nur die ersten {count} Dateien ausgewählt.',
      },
      accessibility: {
        uploadArea: 'Datei-Upload-Bereich - klicken zum Auswählen von Dateien oder per Drag & Drop',
        selectFiles: 'Dateien zum Hochladen auswählen',
      },
    },
  },

  pages: {
    privacy: {
      title: 'Datenschutzerklärung',
      subtitle: 'Ihr Datenschutz ist unsere oberste Priorität',
      lastUpdated: 'Zuletzt aktualisiert: 20. Juli 2025',
      sections: {
        commitment: {
          title: 'Unser Datenschutz-Versprechen',
          content: 'LocalPDF ist mit Datenschutz als Grundlage entwickelt. Wir glauben, dass Ihre Dokumente und Daten Ihnen und nur Ihnen gehören sollten. Diese Datenschutzerklärung erklärt, wie LocalPDF Ihren Datenschutz schützt und sicherstellt, dass Ihre Daten niemals Ihr Gerät verlassen.'
        },
        simpleAnswer: {
          title: 'Die einfache Antwort',
          main: 'LocalPDF sammelt, speichert, überträgt oder hat keinen Zugriff auf Ihre Daten, Dateien oder persönlichen Informationen.',
          sub: 'Die gesamte PDF-Verarbeitung erfolgt vollständig in Ihrem Webbrowser. Ihre Dateien verlassen niemals Ihr Gerät.'
        },
        whatWeDont: {
          title: 'Was wir NICHT tun',
          noDataCollection: {
            title: 'Keine Datensammlung',
            items: ['Keine persönlichen Informationen', 'Keine Nutzungsverfolgung', 'Keine Analyse-Cookies', 'Keine Benutzerkonten']
          },
          noFileAccess: {
            title: 'Kein Dateizugriff',
            items: ['Keine Server-Uploads', 'Keine Dateispeicherung', 'Keine Dokumentkopien', 'Keine Verarbeitungshistorie']
          }
        },
        howItWorks: {
          title: 'Wie LocalPDF funktioniert',
          clientSide: {
            title: 'Client-seitige Verarbeitung',
            description: 'Alle PDF-Operationen erfolgen direkt in Ihrem Webbrowser mit:',
            items: ['JavaScript PDF-Bibliotheken (pdf-lib, PDF.js, jsPDF)', 'Web Workers für Leistungsoptimierung', 'Lokaler Speicher für temporäre Verarbeitung', 'Ausschließlich Ihre Geräteressourcen']
          },
          process: {
            title: 'Der vollständige Prozess',
            steps: [
              'Sie wählen eine PDF-Datei von Ihrem Gerät aus',
              'Datei wird in Browser-Speicher geladen (niemals hochgeladen)',
              'Verarbeitung erfolgt lokal mit JavaScript',
              'Ergebnis wird in Ihrem Browser generiert',
              'Sie laden die verarbeitete Datei direkt herunter',
              'Alle Daten werden aus dem Speicher gelöscht, wenn Sie die Seite schließen'
            ]
          }
        },
        analytics: {
          title: 'Datenschutz-erste Analytik',
          description: 'LocalPDF verwendet Vercel Analytics, um zu verstehen, wie unsere Tools verwendet werden und die Benutzererfahrung zu verbessern. Unser Analytik-Ansatz behält unsere Datenschutz-erste Philosophie bei:',
          whatWeTrack: {
            title: 'Was wir verfolgen (anonym)',
            items: ['Seitenbesuche - welche Tools am beliebtesten sind', 'Tool-Nutzung - grundlegende Metriken wie Dateiverarbeitungszahlen', 'Leistungsdaten - Ladezeiten und Fehler', 'Allgemeine Standort - nur Land/Region (für Sprachoptimierung)']
          },
          protections: {
            title: 'Datenschutz-Schutzmaßnahmen',
            items: ['Keine Cookies - Analytik funktioniert ohne Tracking-Cookies', 'Keine persönlichen Daten - wir sehen niemals Ihre Dateien oder persönlichen Informationen', 'IP-Anonymisierung - Ihre genaue IP-Adresse wird niemals gespeichert', 'DNT respektiert - wir ehren "Do Not Track" Browser-Einstellungen', 'DSGVO-konform - alle Analytik ist datenschutzrechtskonform']
          }
        },
        compliance: {
          title: 'Internationale Datenschutz-Compliance',
          gdpr: {
            title: 'DSGVO',
            description: 'Vollständig konform - keine persönlichen Daten verarbeitet'
          },
          ccpa: {
            title: 'CCPA',
            description: 'Konform - keine Datensammlung oder -verkauf'
          },
          global: {
            title: 'Global',
            description: 'Datenschutz-erstes Design gewährleistet weltweite Compliance'
          }
        },
        summary: {
          title: 'Zusammenfassung',
          main: 'LocalPDF ist so konzipiert, dass es standardmäßig vollständig privat ist. Ihre Dateien, Daten und Privatsphäre sind geschützt, weil wir einfach keine Ihrer Informationen sammeln, speichern oder übertragen.',
          sub: 'Das ist nicht nur ein Richtlinienversprechen - es ist in die grundlegende Architektur eingebaut, wie LocalPDF funktioniert.'
        }
      }
    },
    faq: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Alles, was Sie über LocalPDF wissen müssen',
      sections: {
        general: {
          title: 'Allgemeine Fragen',
          questions: {
            whatIs: {
              question: 'Was ist LocalPDF?',
              answer: 'LocalPDF ist eine kostenlose, datenschutz-erste Webanwendung, die 12 leistungsstarke PDF-Tools zum Zusammenführen, Aufteilen, Komprimieren, Bearbeiten und Konvertieren von PDF-Dateien bietet. Die gesamte Verarbeitung erfolgt vollständig in Ihrem Browser - keine Uploads, keine Registrierung, kein Tracking.'
            },
            free: {
              question: 'Ist LocalPDF wirklich kostenlos?',
              answer: 'Ja! LocalPDF ist vollständig kostenlos zu verwenden ohne Einschränkungen, Werbung oder versteckte Gebühren. Wir glauben, dass wesentliche PDF-Tools für jeden zugänglich sein sollten.'
            },
            account: {
              question: 'Muss ich ein Konto erstellen?',
              answer: 'Kein Konto erforderlich! Besuchen Sie einfach LocalPDF und beginnen Sie sofort mit der Nutzung jedes Tools.'
            }
          }
        },
        privacy: {
          title: 'Datenschutz & Sicherheit',
          questions: {
            uploaded: {
              question: 'Werden meine Dateien auf Ihre Server hochgeladen?',
              answer: 'Nein! Das ist LocalPDFs Kernfunktion - alle Verarbeitung erfolgt in Ihrem Browser. Ihre Dateien verlassen niemals Ihr Gerät. Wir können Ihre Dokumente nicht sehen, darauf zugreifen oder speichern.'
            },
            afterUse: {
              question: 'Was passiert mit meinen Dateien, nachdem ich LocalPDF verwendet habe?',
              answer: 'Ihre Dateien werden im Speicher Ihres Browsers verarbeitet und automatisch gelöscht, wenn Sie die Seite schließen oder wegnavigieren. Nichts wird dauerhaft gespeichert.'
            },
            confidential: {
              question: 'Ist LocalPDF sicher für vertrauliche Dokumente?',
              answer: 'Ja! Da alle Verarbeitung lokal ist und wir keine Daten sammeln, ist LocalPDF ideal für vertrauliche, sensible oder private Dokumente.'
            }
          }
        },
        technical: {
          title: 'Technische Fragen',
          questions: {
            browsers: {
              question: 'Welche Browser unterstützen LocalPDF?',
              answer: 'LocalPDF funktioniert in allen modernen Browsern:',
              browsers: ['Chrome 90+', 'Firefox 90+', 'Safari 14+', 'Edge 90+']
            },
            fileSize: {
              question: 'Was ist die maximale Dateigröße, die ich verarbeiten kann?',
              answer: 'LocalPDF kann Dateien bis zu 100MB verarbeiten. Bei sehr großen Dateien kann die Verarbeitung je nach Leistung Ihres Geräts länger dauern.'
            },
            offline: {
              question: 'Funktioniert LocalPDF offline?',
              answer: 'Ja! Nach Ihrem ersten Besuch funktioniert LocalPDF offline. Ihr Browser speichert die Anwendung zwischen, sodass Sie sie ohne Internetverbindung verwenden können.'
            }
          }
        },
        tools: {
          title: 'PDF-Tools',
          editText: {
            question: 'Kann ich vorhandenen Text in PDFs bearbeiten?',
            answer: 'Derzeit ermöglicht LocalPDF das Hinzufügen von neuem Text zu PDFs, aber nicht die Bearbeitung von vorhandenem Text. Sie können Text-Overlays, Signaturen, Notizen und Anmerkungen hinzufügen.'
          }
        },
        support: {
          title: 'Benötigen Sie noch Hilfe?',
          gettingSupport: {
            title: 'Support erhalten',
            items: ['GitHub Issues: Technische Probleme und Fehlerberichte', 'GitHub Discussions: Allgemeine Fragen und Community-Hilfe', 'Dokumentation: Vollständige Anleitungen und Tutorials']
          },
          contact: {
            title: 'Kontaktinformationen',
            github: 'Probleme auf GitHub melden',
            discussions: 'Community-Diskussionen beitreten'
          }
        }
      }
    },
    notFound: {
      title: 'Seite nicht gefunden',
      description: 'Die Seite, die Sie suchen, existiert nicht.',
      backHome: 'Zurück zur Startseite',
    },
    tools: {
      merge: {
        pageTitle: 'PDF-Dateien kostenlos zusammenführen',
        pageDescription: 'Kombinieren Sie mehrere PDF-Dateien kostenlos zu einem Dokument. Schnelles, sicheres und privates PDF-Zusammenführen in Ihrem Browser. Keine Uploads, keine Registrierung erforderlich.',
        uploadTitle: 'PDF-Dateien zum Zusammenführen hochladen',
        buttons: {
          remove: 'Entfernen',
          startMerging: 'Zusammenführung starten ({count} Dateien)',
        },
        features: {
          title: 'Warum das LocalPDF Zusammenführungs-Tool wählen?',
          private: {
            title: '🔒 100% Privat',
            description: 'Ihre Dateien verlassen niemals Ihr Gerät. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser für maximale Privatsphäre und Sicherheit.',
          },
          fast: {
            title: '⚡ Blitzschnell',
            description: 'Führen Sie PDFs sofort mit unserer optimierten Verarbeitungs-Engine zusammen. Kein Warten auf Uploads oder Downloads von Servern.',
          },
          free: {
            title: '🆓 Völlig kostenlos',
            description: 'Keine Limits, keine Wasserzeichen, keine versteckten Gebühren. Führen Sie unbegrenzt PDF-Dateien kostenlos zusammen, für immer.',
          },
        },
        howTo: {
          title: 'So führen Sie PDF-Dateien zusammen',
          steps: {
            upload: {
              title: 'PDF-Dateien hochladen',
              description: 'Klicken Sie auf "Dateien auswählen" oder ziehen Sie mehrere PDF-Dateien in den Upload-Bereich.',
            },
            arrange: {
              title: 'Reihenfolge ordnen',
              description: 'Ziehen Sie Dateien per Drag & Drop, um sie neu zu ordnen. Das finale PDF folgt dieser Reihenfolge.',
            },
            download: {
              title: 'Zusammenführen & Herunterladen',
              description: 'Klicken Sie auf "PDFs zusammenführen" und Ihr kombiniertes PDF ist sofort zum Download bereit.',
            },
          },
        },
      },
      compress: {
        pageTitle: 'PDF-Dateien kostenlos komprimieren',
        pageDescription: 'Komprimieren Sie PDF-Dateien, um die Größe ohne Qualitätsverlust zu reduzieren. Kostenloses PDF-Komprimierungstool, das in Ihrem Browser mit anpassbaren Qualitätseinstellungen funktioniert.',
        uploadTitle: 'PDF zum Komprimieren hochladen',
        uploadSubtitle: 'Wählen Sie eine PDF-Datei aus, um ihre Größe zu reduzieren',
        faqTitle: 'Häufig gestellte Fragen zur PDF-Komprimierung',
        buttons: {
          uploadDifferent: '← Andere PDF hochladen',
        },
        features: {
          title: '✨ Hauptfunktionen:',
          items: {
            qualitySettings: '• Einstellbare Qualitätseinstellungen (10% - 100%)',
            imageOptimization: '• Bildkomprimierungsoptimierung',
            removeMetadata: '• Metadaten für kleinere Dateien entfernen',
            webOptimization: '• Web-Optimierung für schnellere Ladezeiten',
          },
        },
        privacy: {
          title: '🔒 Datenschutz & Sicherheit:',
          items: {
            clientSide: '• 100% clientseitige Verarbeitung',
            noUploads: '• Keine Datei-Uploads auf Server',
            localProcessing: '• Ihre Daten verlassen niemals Ihr Gerät',
            instantProcessing: '• Sofortige Verarbeitung und Download',
          },
        },
        benefits: {
          title: 'Warum unseren PDF-Kompressor wählen?',
          smart: {
            title: 'Intelligente Komprimierung',
            description: 'Fortgeschrittene Algorithmen reduzieren die Dateigröße unter Beibehaltung der Dokumentqualität und Lesbarkeit',
          },
          control: {
            title: 'Vollständige Kontrolle',
            description: 'Passen Sie Qualitätsstufen, Bildkomprimierung und Web-Optimierung an Ihre Bedürfnisse an',
          },
          private: {
            title: '100% Privat',
            description: 'Ihre PDFs werden lokal in Ihrem Browser verarbeitet - niemals irgendwo hochgeladen',
          },
        },
        howTo: {
          title: 'So funktioniert PDF-Komprimierung',
          steps: {
            upload: {
              title: 'PDF hochladen',
              description: 'Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen',
            },
            settings: {
              title: 'Einstellungen anpassen',
              description: 'Wählen Sie Qualitätsstufe und Komprimierungsoptionen',
            },
            compress: {
              title: 'Komprimieren',
              description: 'Beobachten Sie den Echtzeit-Fortschritt während die Datei optimiert wird',
            },
            download: {
              title: 'Herunterladen',
              description: 'Erhalten Sie Ihr komprimiertes PDF mit reduzierter Dateigröße',
            },
          },
        },
        technical: {
          title: 'Komprimierungstechniken',
          compressed: {
            title: 'Was wird komprimiert:',
            images: '• **Bilder:** JPEG-Komprimierung mit Qualitätskontrolle',
            fonts: '• **Schriften:** Teilmengen ungenutzter Zeichen und Kodierungsoptimierung',
            streams: '• **Streams:** Redundante Daten entfernen und Inhalt komprimieren',
            metadata: '• **Metadaten:** Optionale Entfernung von Erstellungsinfos und Eigenschaften',
          },
          quality: {
            title: 'Qualität vs. Größe:',
            high: '• **90-100%:** Nahezu verlustfreie Qualität, moderate Komprimierung',
            good: '• **70-90%:** Gute Qualität, signifikante Größenreduzierung',
            acceptable: '• **50-70%:** Akzeptable Qualität, maximale Komprimierung',
            low: '• **Unter 50%:** Merklicher Qualitätsverlust, kleinste Dateien',
          },
        },
        faq: {
          items: [
            {
              id: 'compress-privacy',
              question: 'Ist PDF-Komprimierung sicher und privat?',
              answer: 'Ja, LocalPDFs Komprimierung ist vollständig privat und sicher. Die gesamte Komprimierung erfolgt direkt in Ihrem Browser - Ihre Dateien werden niemals auf einen Server hochgeladen. Dies gewährleistet, dass Ihre vertraulichen Dokumente privat bleiben, während eine optimale Dateigröße-Reduzierung erreicht wird.'
            },
            {
              id: 'compress-quality',
              question: 'Wie stark kann ich PDFs komprimieren, ohne Qualität zu verlieren?',
              answer: 'LocalPDF verwendet erweiterte Komprimierungsalgorithmen, die PDF-Dateigrößen um 50-90% reduzieren können, während eine ausgezeichnete visuelle Qualität beibehalten wird. Unsere intelligente Komprimierung analysiert jedes Dokument und wendet optimale Einstellungen für das beste Größe-zu-Qualität-Verhältnis an.'
            },
            {
              id: 'compress-vs-others',
              question: 'Warum LocalPDF für PDF-Komprimierung wählen?',
              answer: 'LocalPDF bietet überlegene Komprimierung: Keine Dateigrößen-Limits - Komprimieren Sie PDFs jeder Größe; Mehrere Komprimierungsstufen - Wählen Sie zwischen Qualität und Größe; Batch-Komprimierung - Verarbeiten Sie mehrere Dateien; 100% Privatsphäre - Keine Server-Uploads erforderlich; Komplett kostenlos - Keine Wasserzeichen oder Einschränkungen.'
            },
            {
              id: 'compress-algorithms',
              question: 'Welche Komprimierungstechnologie verwendet LocalPDF?',
              answer: 'LocalPDF verwendet branchenübliche PDF-Optimierungstechniken einschließlich Bildkomprimierung, Schriftarten-Optimierung und Metadaten-Entfernung. Die gesamte Verarbeitung erfolgt in Ihrem Browser mit erweiterten JavaScript-Bibliotheken für maximale Kompatibilität und Leistung.'
            }
          ]
        },
      },
      imageToPdf: {
        seo: {
          title: 'Bilder zu PDF Konverter - Kostenloses Online-Tool | LocalPDF',
          description: 'Konvertieren Sie mehrere Bilder (JPEG, PNG, GIF, WebP) sofort in PDF-Format. Datenschutzorientierter Bild-zu-PDF-Konverter, der vollständig in Ihrem Browser funktioniert.',
        },
        breadcrumbs: {
          home: 'Startseite',
          imageToPdf: 'Bilder zu PDF',
        },
        pageTitle: 'Bilder zu PDF Konverter',
        pageDescription: 'Konvertieren Sie mehrere Bilder in ein einziges PDF-Dokument mit anpassbaren Layout-Optionen. Unterstützt JPEG, PNG, GIF und WebP-Formate mit vollständigem Datenschutz.',
        uploadSection: {
          title: 'Bilder hier ablegen oder klicken zum Durchsuchen',
          subtitle: 'Mehrere Bilder in ein einziges PDF-Dokument kombinieren',
          supportedFormats: 'JPEG, PNG, GIF, WebP',
        },
        tool: {
          title: 'Bilder zu PDF Konverter',
          description: 'Mehrere Bilder in ein einziges PDF-Dokument mit anpassbaren Layout-Optionen kombinieren',
          selectedImages: 'Ausgewählte Bilder ({count})',
          clearAll: 'Alle Löschen',
          pdfSettings: 'PDF-Einstellungen',
          pageSize: 'Seitengröße',
          pageSizeOptions: {
            a4: 'A4 (210 × 297 mm)',
            letter: 'Letter (8.5 × 11 Zoll)',
            auto: 'Auto (Inhalt anpassen)'
          },
          orientation: 'Ausrichtung',
          orientationOptions: {
            portrait: 'Hochformat',
            landscape: 'Querformat'
          },
          imageLayout: 'Bild-Layout',
          layoutOptions: {
            fitToPage: 'An Seite anpassen',
            actualSize: 'Tatsächliche Größe',
            fitWidth: 'An Breite anpassen',
            fitHeight: 'An Höhe anpassen'
          },
          imageQuality: 'Bildqualität ({quality}%)',
          qualitySlider: {
            lowerSize: 'Kleinere Größe',
            higherQuality: 'Höhere Qualität'
          },
          pageMargin: 'Seitenrand ({margin} Zoll)',
          marginSlider: {
            noMargin: 'Kein Rand',
            twoInch: '2 Zoll'
          },
          background: 'Hintergrund',
          backgroundOptions: {
            white: 'Weiß',
            lightGray: 'Hellgrau',
            gray: 'Grau',
            black: 'Schwarz'
          },
          fileInfo: '{count} Bild{plural} ausgewählt • Gesamtgröße: {size}',
          converting: 'Bilder zu PDF konvertieren... {progress}%',
          buttons: {
            reset: 'Zurücksetzen',
            createPdf: 'PDF Erstellen',
            converting: 'Konvertieren...'
          },
          help: {
            title: 'So verwenden Sie Bilder zu PDF',
            dragDrop: 'Ziehen & Ablegen: Ziehen Sie einfach Ihre Bilder in den Upload-Bereich oder klicken Sie zum Durchsuchen',
            formats: 'Mehrere Formate: Unterstützt JPEG, PNG, GIF und WebP Bildformate',
            layout: 'Anpassbares Layout: Wählen Sie Seitengröße, Ausrichtung und wie Bilder auf jede Seite passen',
            quality: 'Qualitätskontrolle: Passen Sie die Bildqualität an, um Dateigröße und visuelle Qualität auszubalancieren',
            privacy: 'Datenschutz: Alle Verarbeitung erfolgt lokal - Ihre Bilder verlassen niemals Ihr Gerät'
          }
        },
        features: {
          title: 'Warum unseren Bilder zu PDF Konverter wählen?',
          private: {
            title: '100% Privat',
            description: 'Die gesamte Bildverarbeitung erfolgt lokal in Ihrem Browser. Ihre Bilder verlassen niemals Ihr Gerät.',
          },
          formats: {
            title: 'Mehrere Formate',
            description: 'Unterstützung für JPEG, PNG, GIF und WebP Bildformate mit hochwertiger Konvertierung.',
          },
          customizable: {
            title: 'Anpassbar',
            description: 'Kontrollieren Sie Seitengröße, Ausrichtung, Bildlayout, Qualität und Ränder für perfekte Ergebnisse.',
          },
          fast: {
            title: 'Schnelle Verarbeitung',
            description: 'Blitzschnelle Konvertierung mit moderner Browser-Technologie. Kein Warten auf Uploads.',
          },
          free: {
            title: 'Völlig kostenlos',
            description: 'Keine Registrierung, keine Limits, keine Wasserzeichen. Nutzen Sie unser Tool so oft Sie möchten.',
          },
          crossPlatform: {
            title: 'Plattformübergreifend',
            description: 'Funktioniert auf jedem Gerät mit modernem Browser. Desktop, Tablet oder Mobil - wir haben Sie abgedeckt.',
          },
        },
        howTo: {
          title: 'So konvertieren Sie Bilder zu PDF',
          steps: {
            upload: {
              title: 'Bilder hochladen',
              description: 'Ziehen Sie Ihre Bilder per Drag & Drop oder klicken Sie zum Durchsuchen. Wählen Sie mehrere Bilder in JPEG, PNG, GIF oder WebP Format.',
            },
            customize: {
              title: 'Einstellungen anpassen',
              description: 'Wählen Sie Seitengröße, Ausrichtung, Bildlayout, Qualität und Ränder, um das perfekte PDF zu erstellen.',
            },
            download: {
              title: 'PDF herunterladen',
              description: 'Klicken Sie auf "PDF erstellen" und Ihr konvertiertes Dokument ist in Sekunden zum Download bereit.',
            },
          },
        },
      },
      wordToPdf: {
        seo: {
          title: 'Word zu PDF Konverter - DOCX zu PDF Online Kostenlos Konvertieren | LocalPDF',
          description: 'Konvertieren Sie Word-Dokumente (.docx) kostenlos ins PDF-Format. Schnelle, sichere und private Word zu PDF Konvertierung, die vollständig in Ihrem Browser funktioniert.',
          keywords: 'word zu pdf, docx zu pdf, word zu pdf konvertieren, dokumentenkonverter, kostenloser pdf-konverter',
          structuredData: {
            name: 'Word zu PDF Konverter',
            description: 'Word-Dokumente (.docx) online kostenlos ins PDF-Format konvertieren',
            permissions: 'Kein Datei-Upload erforderlich',
          },
        },
        breadcrumbs: {
          home: 'Startseite',
          wordToPdf: 'Word zu PDF',
        },
        pageTitle: 'Word zu PDF Konverter',
        pageDescription: 'Konvertieren Sie Ihre Word-Dokumente (.docx) schnell und sicher ins PDF-Format. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser - kein Datei-Upload erforderlich.',
        howTo: {
          title: 'Wie man Word zu PDF konvertiert',
          steps: {
            choose: {
              title: 'Datei wählen',
              description: 'Wählen Sie Ihr Word-Dokument (.docx-Datei)',
            },
            convert: {
              title: 'Konvertieren',
              description: 'Die automatische Konvertierung startet sofort',
            },
            download: {
              title: 'Herunterladen',
              description: 'Ihre PDF-Datei wird automatisch heruntergeladen',
            },
          },
        },
        features: {
          title: 'Warum unseren Word zu PDF Konverter wählen?',
          privacy: {
            title: '🔒 Datenschutz zuerst',
            description: 'Ihre Dokumente verlassen niemals Ihr Gerät. Die gesamte Konvertierung erfolgt lokal in Ihrem Browser.',
          },
          fast: {
            title: '⚡ Schnell & kostenlos',
            description: 'Sofortige Konvertierung ohne Dateigrößenlimits oder Wasserzeichen. Völlig kostenlos zu verwenden.',
          },
          compatible: {
            title: '📱 Funktioniert überall',
            description: 'Kompatibel mit allen Geräten und Browsern. Keine Software-Installation erforderlich.',
          },
          quality: {
            title: '✨ Hohe Qualität',
            description: 'Bewahrt ursprüngliche Formatierung, Schriften und Layout für professionelle Ergebnisse.',
          },
        },
        tool: {
          uploadTitle: 'Word-Dokument auswählen',
          uploadSubtitle: 'Hier klicken oder .docx-Datei per Drag & Drop hinzufügen',
          supportedFormats: 'Unterstützt Microsoft Word (.docx) bis zu 50MB',
          compatibility: {
            msWord: '✓ Funktioniert mit .docx-Dateien von Microsoft Word',
            googleDocs: '✓ Funktioniert mit .docx-Dateien von Google Docs',
            docWarning: '⚠️ .doc-Dateien müssen zuerst in .docx konvertiert werden',
            localProcessing: '✓ Verarbeitung erfolgt lokal in Ihrem Browser'
          },
          messages: {
            conversionCompleted: 'Konvertierung abgeschlossen!',
            conversionFailed: 'Konvertierung fehlgeschlagen'
          },
          preview: {
            title: 'PDF-Vorschau',
            description: 'Konvertieren Sie Ihr Dokument, um die Vorschau hier zu sehen'
          },
          settings: {
            title: 'Konvertierungseinstellungen'
          },
          buttons: {
            converting: 'Konvertierung läuft...',
            convertToPdf: 'In PDF konvertieren',
            chooseDifferent: 'Andere Datei auswählen'
          },
          fileInfo: {
            title: 'Datei-Informationen',
            fileName: 'Datei',
            fileSize: 'Größe',
            fileType: 'Typ',
            microsoftWord: 'Microsoft Word (.docx)',
            privacyNote: 'Alle Verarbeitung erfolgt lokal in Ihrem Browser für maximale Privatsphäre'
          },
          faqTitle: 'Häufig gestellte Fragen zur Word-zu-PDF-Konvertierung'
        },
        faq: {
          items: [
            {
              id: 'word-to-pdf-privacy',
              question: 'Ist die Word-zu-PDF-Konvertierung sicher?',
              answer: 'Ja, vollständig sicher! LocalPDF konvertiert Word-Dokumente zu PDF vollständig in Ihrem Browser. Ihre Dokumente werden niemals auf einen Server hochgeladen, was vollständige Vertraulichkeit für Geschäftsdokumente, Lebensläufe, Verträge oder persönliche Dateien gewährleistet.'
            },
            {
              id: 'word-to-pdf-formatting',
              question: 'Bewahrt LocalPDF die Word-Dokumentformatierung?',
              answer: 'LocalPDF behält alle Formatierungen, Schriften, Bilder, Tabellen und das Layout Ihres ursprünglichen Word-Dokuments bei. Das resultierende PDF sieht genauso aus wie Ihr Word-Dokument und eignet sich perfekt für professionelle Dokumente und offizielle Einreichungen.'
            },
            {
              id: 'word-to-pdf-compatibility',
              question: 'Welche Word-Dokumentformate werden unterstützt?',
              answer: 'LocalPDF unterstützt moderne Word-Formate einschließlich: .docx (Word 2007 und neuer), .doc (Legacy-Word-Dokumente), .docm (Makro-aktivierte Dokumente). Alle Versionen behalten vollständige Kompatibilität und Formatierung bei.'
            }
          ]
        },
      },
      ocr: {
        seo: {
          title: 'OCR Texterkennung - Text aus PDF & Bildern Extrahieren | LocalPDF',
          description: 'Extrahieren Sie Text aus PDF-Dateien und Bildern mit fortschrittlicher OCR-Technologie. Verbesserte Unterstützung für Russisch und 10+ andere Sprachen mit vollständigem Datenschutz.',
          keywords: 'OCR, Texterkennung, PDF zu Text, Bild zu Text, Text extrahieren, Russisches OCR, Tesseract',
        },
        breadcrumbs: {
          home: 'Startseite',
          ocr: 'OCR Texterkennung',
        },
        pageTitle: 'OCR Texterkennung',
        pageDescription: 'Extrahieren Sie Text aus PDF-Dateien und Bildern mit fortschrittlicher OCR-Technologie. Verbesserte Unterstützung für Russisch und 10+ andere Sprachen mit automatischer Erkennung.',
        features: {
          private: {
            title: '100% Privat',
            description: 'Alle Verarbeitung erfolgt in Ihrem Browser',
          },
          russian: {
            title: 'Russische Unterstützung',
            description: 'Verbesserte Erkennung für kyrillischen Text',
          },
          fast: {
            title: 'Schnell & Genau',
            description: 'Fortschrittliche Tesseract.js Technologie',
          },
        },
        languages: {
          title: 'Unterstützte Sprachen',
          items: {
            russian: 'Russisch',
            english: 'Englisch',
            german: 'Deutsch',
            french: 'Französisch',
            spanish: 'Spanisch',
            italian: 'Italienisch',
            polish: 'Polnisch',
            ukrainian: 'Ukrainisch',
            dutch: 'Niederländisch',
            portuguese: 'Portugiesisch',
          },
        },
      },
      extractPages: {
        pageTitle: 'PDF-Seiten Kostenlos Extrahieren',
        pageDescription: 'Extrahieren Sie bestimmte Seiten aus PDF-Dokumenten kostenlos. Erstellen Sie neue PDFs aus ausgewählten Seiten mit vollständiger Kontrolle über die Seitenauswahl.',
        uploadTitle: 'PDF zum Extrahieren von Seiten Hochladen',
        uploadSubtitle: 'Wählen Sie eine PDF-Datei aus, um bestimmte Seiten zu extrahieren',
        buttons: {
          uploadDifferent: '← Andere PDF Hochladen',
        },
        features: {
          title: '✨ Hauptfunktionen:',
          items: {
            individual: '• Einzelne Seiten oder Seitenbereiche extrahieren',
            custom: '• Benutzerdefinierte Seitenauswahl (z.B. "1-5, 8, 10-12")',
            preview: '• Visuelle Seitenvorschau und -auswahl',
            quality: '• Original-PDF-Qualität beibehalten',
          },
        },
        privacy: {
          title: '🔒 Datenschutz & Sicherheit:',
          items: {
            clientSide: '• 100% clientseitige Verarbeitung',
            noUploads: '• Keine Datei-Uploads auf Server',
            localProcessing: '• Ihre Daten verlassen niemals Ihr Gerät',
            instantProcessing: '• Sofortige Verarbeitung und Download',
          },
        },
        benefits: {
          title: 'Warum Unseren PDF-Seitenextraktor Wählen?',
          fast: {
            title: 'Blitzschnell',
            description: 'Extrahieren Sie Seiten sofort mit unserer optimierten browser-basierten Verarbeitung',
          },
          precise: {
            title: 'Präzise Kontrolle',
            description: 'Wählen Sie genau die Seiten aus, die Sie benötigen mit unseren intuitiven Auswahltools',
          },
          private: {
            title: '100% Privat',
            description: 'Ihre PDFs werden lokal in Ihrem Browser verarbeitet - niemals irgendwo hochgeladen',
          },
        },
        howTo: {
          title: 'So Extrahieren Sie PDF-Seiten',
          steps: {
            upload: {
              title: 'PDF Hochladen',
              description: 'Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen',
            },
            select: {
              title: 'Seiten Auswählen',
              description: 'Wählen Sie einzelne Seiten oder Bereiche',
            },
            extract: {
              title: 'Extrahieren',
              description: 'Klicken Sie auf extrahieren, um Ihre Auswahl zu verarbeiten',
            },
            download: {
              title: 'Herunterladen',
              description: 'Erhalten Sie Ihr neues PDF mit den ausgewählten Seiten',
            },
          },
        },
      },
      extractText: {
        pageTitle: 'Text aus PDF Kostenlos Extrahieren',
        pageDescription: 'Extrahieren Sie Textinhalte aus PDF-Dateien kostenlos. Erhalten Sie Klartext aus PDF-Dokumenten mit intelligenter Formatierung. Datenschutzorientierte Textextraktion in Ihrem Browser.',
        steps: {
          upload: 'Schritt 1: Laden Sie Ihre PDF-Datei hoch',
          choose: 'Schritt 2: Wählen Sie Extraktionsoptionen (intelligente Formatierung empfohlen)',
          download: 'Schritt 3: Laden Sie den extrahierten Text als .txt-Datei herunter',
        },
        tool: {
          title: 'Text Extrahieren',
          description: 'Extrahieren und intelligent formatieren Sie Textinhalte aus Ihren PDFs',
          fileToExtract: 'Datei zum Extrahieren von Text:',
          extractionOptions: 'Extraktionsoptionen:',
          smartFormatting: 'Intelligente Formatierung Aktivieren (Empfohlen)',
          smartFormattingDesc: 'Automatisch Text aufräumen, Zeilenumbrüche korrigieren, Überschriften erkennen und Lesbarkeit verbessern',
          formattingLevel: 'Formatierungsebene:',
          levels: {
            minimal: {
              title: 'Minimal',
              desc: 'Grundreinigung - unterbrochene Wörter zusammenführen, zusätzliche Leerzeichen entfernen'
            },
            standard: {
              title: 'Standard',
              desc: 'Empfohlen - Absätze, Überschriften, Listen, saubere Formatierung'
            },
            advanced: {
              title: 'Erweitert',
              desc: 'Maximum - alle Funktionen plus verbesserte Strukturerkennung'
            }
          },
          includeMetadata: 'Dokumentmetadaten einschließen (Titel, Autor, Erstellungsdatum)',
          preserveFormatting: 'Seitenformatierung beibehalten (Seitenzahlen und Trennzeichen einschließen)',
          pageRange: 'Bestimmten Seitenbereich extrahieren (Standard: alle Seiten)',
          pageRangeFields: {
            startPage: 'Startseite',
            endPage: 'Endseite',
            note: 'Lassen Sie die Endseite leer oder gleich der Startseite, um eine einzelne Seite zu extrahieren'
          },
          extracting: 'Text extrahieren... {progress}%',
          success: {
            title: 'Textextraktion Abgeschlossen!',
            pagesProcessed: 'Seiten verarbeitet: {count}',
            textLength: 'Textlänge: {length} Zeichen',
            documentTitle: 'Dokumenttitel: {title}',
            author: 'Autor: {author}',
            smartFormattingApplied: 'Intelligente Formatierung Angewendet ({level})',
            fileDownloaded: 'Datei automatisch als .txt heruntergeladen',
            noTextWarning: 'Diese PDF könnte gescannte Bilder ohne extrahierbaren Text enthalten',
            comparisonPreview: 'Formatierungsverbesserungs-Vorschau:',
            before: 'Vorher (Roh):',
            after: 'Nachher (Intelligent Formatiert):',
            notice: '↑ Beachten Sie die verbesserte Formatierung, zusammengeführte Wörter und bessere Struktur!',
            textPreview: 'Extrahierter Text Vorschau:'
          },
          infoBox: {
            title: 'Intelligente Textextraktion',
            description: 'Verwendung von PDF.js mit intelligenter Formatierung zur Extraktion von sauberem, lesbarem Text. Intelligente Formatierung behebt automatisch häufige PDF-Textprobleme wie unterbrochene Wörter, unordentliche Zeilenumbrüche und schlechte Struktur.'
          },
          privacy: {
            title: 'Datenschutz & Sicherheit',
            description: 'Textextraktion und Formatierung erfolgen lokal in Ihrem Browser. Ihr PDF-Inhalt verlässt niemals Ihr Gerät und gewährleistet vollständigen Datenschutz und Sicherheit.'
          },
          buttons: {
            extractText: 'Text Extrahieren',
            extracting: 'Text Extrahieren...'
          }
        }
      },
      addText: {
        pageTitle: 'Text zu PDF Kostenlos Hinzufügen',
        pageDescription: 'Fügen Sie benutzerdefinierten Text kostenlos zu PDF-Dateien hinzu. Text, Signaturen und Anmerkungen einfügen. Datenschutzorientierter PDF-Texteditor, der in Ihrem Browser funktioniert.',
        steps: {
          upload: 'Schritt 1: Laden Sie Ihre PDF-Datei hoch',
          click: 'Schritt 2: Klicken Sie auf das PDF, um Text hinzuzufügen',
          save: 'Schritt 3: Speichern Sie Ihr verändertes PDF',
        },
      },
      rotate: {
        pageTitle: 'PDF-Seiten Kostenlos Drehen',
        pageDescription: 'Drehen Sie PDF-Seiten um 90°, 180° oder 270° kostenlos. Korrigieren Sie die Dokumentenausrichtung schnell und einfach mit unserem browser-basierten PDF-Rotationstool.',
        uploadTitle: 'PDF zum Drehen von Seiten Hochladen',
        uploadSubtitle: 'Wählen Sie eine PDF-Datei aus, um ihre Seiten zu drehen',
        buttons: {
          uploadDifferent: '← Andere PDF Hochladen',
        },
        features: {
          title: '✨ Hauptfunktionen:',
          items: {
            angles: '• Seiten um 90°, 180° oder 270° drehen',
            selection: '• Alle Seiten oder bestimmte Seiten drehen',
            preview: '• Seitenvorschau vor dem Drehen',
            quality: '• Original-PDF-Qualität beibehalten',
          },
        },
        privacy: {
          title: '🔒 Datenschutz & Sicherheit:',
          items: {
            clientSide: '• 100% clientseitige Verarbeitung',
            noUploads: '• Keine Datei-Uploads auf Server',
            localProcessing: '• Ihre Daten verlassen niemals Ihr Gerät',
            instantProcessing: '• Sofortige Verarbeitung und Download',
          },
        },
        benefits: {
          title: 'Warum Unseren PDF-Seitendreher Wählen?',
          instant: {
            title: 'Sofortige Drehung',
            description: 'Drehen Sie Seiten sofort mit unserer optimierten browser-basierten Verarbeitung',
          },
          precise: {
            title: 'Präzise Kontrolle',
            description: 'Wählen Sie exakte Drehwinkel und bestimmte Seiten zum Drehen',
          },
          private: {
            title: '100% Privat',
            description: 'Ihre PDFs werden lokal in Ihrem Browser verarbeitet - niemals irgendwo hochgeladen',
          },
        },
        howTo: {
          title: 'So Drehen Sie PDF-Seiten',
          steps: {
            upload: {
              title: 'PDF Hochladen',
              description: 'Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Durchsuchen',
            },
            select: {
              title: 'Seiten Auswählen',
              description: 'Wählen Sie, welche Seiten gedreht werden sollen',
            },
            angle: {
              title: 'Winkel Wählen',
              description: 'Drehung auswählen: 90°, 180° oder 270°',
            },
            download: {
              title: 'Herunterladen',
              description: 'Erhalten Sie Ihr PDF mit gedrehten Seiten',
            },
          },
        },
      },
      watermark: {
        pageTitle: 'Wasserzeichen zu PDF Kostenlos Hinzufügen',
        pageDescription: 'Fügen Sie Text- oder Bildwasserzeichen kostenlos zu PDF-Dateien hinzu. Schützen Sie Ihre Dokumente mit benutzerdefinierten Wasserzeichen. Sichere PDF-Wasserzeichen in Ihrem Browser.',
        steps: {
          upload: 'Schritt 1: Laden Sie Ihre PDF-Datei hoch',
          configure: 'Schritt 2: Konfigurieren Sie die Wasserzeichen-Einstellungen',
          download: 'Schritt 3: Laden Sie Ihr PDF mit Wasserzeichen herunter',
        },
      },
      pdfToImage: {
        pageTitle: 'PDF zu Bildern Kostenlos Konvertieren',
        pageDescription: 'Konvertieren Sie PDF-Seiten kostenlos zu Bildern. Exportieren Sie PDF als JPG, PNG oder WEBP. Hochwertige Konvertierung in Ihrem Browser.',
        steps: {
          upload: 'Schritt 1: Laden Sie Ihre PDF-Datei hoch',
          format: 'Schritt 2: Wählen Sie das Ausgabeformat (PNG, JPG, WEBP)',
          download: 'Schritt 3: Laden Sie Ihre konvertierten Bilder herunter',
        },
      },
      excelToPdf: {
        seo: {
          title: 'Excel zu PDF Konverter - XLSX zu PDF Online Kostenlos | LocalPDF',
          description: 'Konvertieren Sie Excel-Dateien (.xlsx, .xls) kostenlos zu PDF-Format. Unterstützung für mehrere Blätter, breite Tabellen und internationale Sprachen. Schnell, sicher und privat.',
          keywords: 'excel zu pdf, xlsx zu pdf, xls zu pdf, tabelle zu pdf, excel konverter',
          structuredData: {
            name: 'Excel zu PDF Konverter',
            description: 'Konvertieren Sie Excel-Tabellen kostenlos online zu PDF-Format',
            permissions: 'Kein Datei-Upload erforderlich',
          },
        },
        breadcrumbs: {
          home: 'Start',
          excelToPdf: 'Excel zu PDF',
        },
        pageTitle: 'Excel zu PDF Konverter',
        pageDescription: 'Konvertieren Sie Ihre Excel-Dateien (.xlsx, .xls) zu PDF-Format mit Unterstützung für mehrere Blätter, breite Tabellen und internationalen Text. Alle Verarbeitung erfolgt lokal.',
        howTo: {
          title: 'So Konvertieren Sie Excel zu PDF',
          steps: {
            upload: {
              title: 'Excel-Datei Hochladen',
              description: 'Wählen Sie Ihre Excel-Datei (.xlsx oder .xls) von Ihrem Gerät. Dateien werden lokal für maximale Privatsphäre verarbeitet.',
            },
            configure: {
              title: 'Einstellungen Konfigurieren',
              description: 'Wählen Sie Blätter zur Konvertierung, setzen Sie Ausrichtung und passen Sie Formatierungsoptionen an Ihre Bedürfnisse an.',
            },
            download: {
              title: 'PDF Herunterladen',
              description: 'Erhalten Sie Ihre konvertierten PDF-Dateien sofort. Jedes Blatt kann als separate PDF gespeichert oder zu einer kombiniert werden.',
            },
          },
        },
        features: {
          title: 'Warum LocalPDF Excel Konverter wählen?',
          privacy: {
            title: '100% Privat & Sicher',
            description: 'Ihre Excel-Dateien verlassen niemals Ihr Gerät. Alle Konvertierung erfolgt lokal in Ihrem Browser für maximale Privatsphäre und Sicherheit.',
          },
          fast: {
            title: 'Blitzschnelle Verarbeitung',
            description: 'Konvertieren Sie Excel-Dateien sofort zu PDF ohne Warten auf Uploads oder Downloads. Funktioniert auch offline.',
          },
          multiFormat: {
            title: 'Mehrere Formate Unterstützung',
            description: 'Funktioniert mit .xlsx und .xls Dateien. Unterstützt mehrere Blätter, komplexe Formeln und internationalen Text.',
          },
          free: {
            title: 'Völlig Kostenlos',
            description: 'Keine Limits, keine Wasserzeichen, keine versteckten Gebühren. Konvertieren Sie unbegrenzt Excel-Dateien zu PDF kostenlos, für immer.',
          },
        },
        steps: {
          upload: 'Schritt 1: Laden Sie Ihre Excel-Datei hoch (.xlsx oder .xls)',
          configure: 'Schritt 2: Wählen Sie Blätter und konfigurieren Sie Konvertierungseinstellungen',
          download: 'Schritt 3: Laden Sie Ihre konvertierten PDF-Dateien herunter',
        },
      },
    },
    gdpr: {
      title: 'DSGVO-Konformität - LocalPDF | Datenschutz-erste PDF-Verarbeitung',
      description: 'Erfahren Sie mehr über LocalPDFs DSGVO-Konformität. Wir gewährleisten vollständigen Datenschutz mit 100% lokaler Verarbeitung, ohne Uploads und mit vollständiger Benutzerprivatsphäre.',
      lastUpdated: 'Zuletzt aktualisiert',
      sections: {
        introduction: {
          title: 'Einführung in die DSGVO-Konformität',
          content: 'Die Datenschutz-Grundverordnung (DSGVO) ist ein umfassendes Datenschutzgesetz, das am 25. Mai 2018 in Kraft getreten ist. LocalPDF ist von Grund auf so konzipiert, dass es die DSGVO-Anforderungen übertrifft, indem es durch lokale Verarbeitung vollständigen Datenschutz gewährleistet.'
        },
        localProcessing: {
          title: 'Lokale Verarbeitung und Datenschutz',
          content: 'LocalPDF funktioniert vollständig in Ihrem Browser und gewährleistet, dass Ihre Dokumente und persönlichen Daten niemals Ihr Gerät verlassen:',
          benefits: [
            'Keine Datei-Uploads zu externen Servern',
            'Keine Sammlung oder Speicherung persönlicher Daten',
            'Vollständige Kontrolle über Ihre Dokumente',
            'Sofortige Verarbeitung ohne Internetabhängigkeit'
          ]
        },
        rights: {
          title: 'Ihre DSGVO-Rechte',
          content: 'Unter der DSGVO haben Sie spezifische Rechte bezüglich Ihrer persönlichen Daten. Mit LocalPDF sind die meisten dieser Rechte automatisch geschützt:',
          list: {
            access: {
              title: 'Recht auf Zugang',
              description: 'Da wir keine Daten sammeln, gibt es nichts, worauf zugegriffen werden könnte.'
            },
            portability: {
              title: 'Datenübertragbarkeit',
              description: 'Ihre Daten bleiben auf Ihrem Gerät und sind vollständig übertragbar.'
            },
            erasure: {
              title: 'Recht auf Löschung',
              description: 'Löschen Sie Ihren Browser-Cache, um alle temporären Daten zu entfernen.'
            },
            objection: {
              title: 'Widerspruchsrecht',
              description: 'Sie kontrollieren alle Verarbeitungen - keine externe Verarbeitung erfolgt.'
            }
          }
        },
        minimization: {
          title: 'Datenminimierungsprinzip',
          content: 'Die DSGVO erfordert die Verarbeitung nur der minimal notwendigen Daten. LocalPDF geht noch weiter, indem es KEINE persönlichen Daten verarbeitet.',
          emphasis: 'Wir sammeln null persönliche Informationen, verfolgen null Nutzerverhalten und speichern null Nutzerdaten.'
        },
        legalBasis: {
          title: 'Rechtsgrundlage für die Verarbeitung',
          content: 'Wenn eine Verarbeitung erforderlich ist, stützen wir uns auf die folgenden DSGVO-konformen Rechtsgrundlagen:',
          bases: {
            consent: {
              title: 'Einwilligung',
              description: 'Wenn Sie sich entscheiden, unsere Tools zu nutzen, geben Sie implizit Ihre Einwilligung zur lokalen Verarbeitung.'
            },
            legitimate: {
              title: 'Berechtigtes Interesse',
              description: 'Die Bereitstellung von PDF-Tools ohne Kompromittierung Ihrer Privatsphäre dient unserem berechtigten Geschäftsinteresse.'
            }
          }
        },
        contact: {
          title: 'Kontakt zum Datenschutzbeauftragten',
          content: 'Für alle DSGVO-bezogenen Fragen oder Bedenken kontaktieren Sie uns bitte:'
        }
      }
    },
    terms: {
      title: 'Nutzungsbedingungen',
      subtitle: 'Klare und faire Bedingungen für die Nutzung von LocalPDF',
      lastUpdated: 'Zuletzt aktualisiert: 15. Januar 2025',
      sections: {
        introduction: {
          title: 'Einführung',
          content: 'Willkommen bei LocalPDF, der datenschutzorientierten PDF-Verarbeitungsplattform. Diese Nutzungsbedingungen regeln Ihre Nutzung unserer kostenlosen Open-Source-PDF-Tools, die Dateien vollständig in Ihrem Browser verarbeiten für maximale Sicherheit und Privatsphäre.'
        },
        acceptance: {
          title: 'Annahme der Bedingungen',
          content: 'Durch den Zugriff auf oder die Nutzung von LocalPDF stimmen Sie zu, an diese Nutzungsbedingungen und unsere Datenschutzerklärung gebunden zu sein. Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie unseren Service bitte nicht.'
        },
        serviceDescription: {
          title: 'Service-Beschreibung',
          content: 'LocalPDF bietet kostenlose, browserbasierte PDF-Verarbeitungstools einschließlich Zusammenführen, Teilen, Komprimieren, Konvertieren und Bearbeitungsfunktionen. Alle Verarbeitung erfolgt lokal in Ihrem Browser ohne Datei-Uploads.',
          features: {
            title: 'Unsere Tools umfassen:',
            list: [
              'PDF Zusammenführen - Mehrere PDFs zu einer kombinieren',
              'PDF Teilen - Seiten extrahieren oder Dokumente aufteilen',
              'PDF Komprimieren - Dateigröße reduzieren bei Qualitätserhaltung',
              'Word zu PDF - Dokumente ins PDF-Format konvertieren',
              'Text & Wasserzeichen hinzufügen - Dokumente anpassen',
              'Bildkonvertierung - Zwischen PDF und Bildformaten konvertieren',
              'OCR Texterkennung - Text aus gescannten Dokumenten extrahieren',
              'Und mehr datenschutzorientierte PDF-Tools'
            ]
          }
        },
        usageRules: {
          title: 'Nutzungsregeln',
          allowed: {
            title: 'Sie dürfen:',
            items: [
              'Alle Tools für persönliche und kommerzielle Zwecke nutzen',
              'Unbegrenzte Dateien und Dateigrößen verarbeiten',
              'Von jedem Gerät oder Browser auf den Service zugreifen',
              'Zum Open-Source-Projekt auf GitHub beitragen',
              'Den Code unter unserer Lizenz forken und modifizieren',
              'Offline nutzen, wenn zuvor geladen'
            ]
          },
          prohibited: {
            title: 'Sie dürfen nicht:',
            items: [
              'Schädliche Dateien oder Malware hochladen',
              'Versuchen, unsere Verarbeitungsalgorithmen zurückzuentwickeln',
              'Den Service für illegale Aktivitäten nutzen',
              'Versuchen, unsere Infrastruktur zu überlasten oder anzugreifen',
              'Geltende Gesetze oder Vorschriften verletzen',
              'Rechte an geistigem Eigentum verletzen'
            ]
          }
        },
        privacy: {
          title: 'Datenschutz & Datenschutz',
          localProcessing: 'LocalPDF verarbeitet alle Dateien lokal in Ihrem Browser. Ihre Dateien verlassen niemals Ihr Gerät.',
          noDataCollection: 'Wir sammeln, speichern oder haben keinen Zugriff auf Ihre Dateien oder persönlichen Daten. Siehe unsere Datenschutzerklärung für vollständige Details.',
          privacyPolicyLink: 'Unsere vollständige Datenschutzerklärung lesen →'
        },
        intellectualProperty: {
          title: 'Geistiges Eigentum',
          openSource: {
            title: 'Open-Source-Lizenz',
            content: 'LocalPDF ist Open-Source-Software, verfügbar unter der MIT-Lizenz. Sie sind frei, den Code zu nutzen, zu modifizieren und zu verteilen.',
            githubLink: 'Quellcode auf GitHub ansehen →'
          },
          userContent: {
            title: 'Ihr Inhalt',
            content: 'Sie behalten alle Rechte an Dateien, die Sie mit LocalPDF verarbeiten. Da die Verarbeitung lokal erfolgt, greifen wir niemals auf Ihre Inhalte zu.'
          }
        },
        disclaimers: {
          title: 'Haftungsausschlüsse',
          asIs: 'LocalPDF wird "wie besehen" ohne jegliche Garantien bereitgestellt.',
          noWarranties: 'Obwohl wir uns um Zuverlässigkeit bemühen, können wir keinen unterbrechungsfreien oder fehlerfreien Service garantieren.',
          limitations: [
            'Service-Verfügbarkeit kann je nach Browser-Kompatibilität variieren',
            'Verarbeitungsgeschwindigkeit hängt von Ihren Geräteleistungen ab',
            'Große Dateien können Leistungsprobleme auf älteren Geräten verursachen',
            'Wir sind nicht verantwortlich für Dateibeschädigungen oder Datenverlust'
          ]
        },
        liability: {
          title: 'Haftungsbeschränkung',
          limitation: 'LocalPDF und seine Entwickler haften nicht für Schäden, die aus der Nutzung des Service entstehen.',
          maxLiability: 'Unsere Haftung ist im gesetzlich maximal zulässigen Umfang beschränkt.'
        },
        changes: {
          title: 'Änderungen der Bedingungen',
          notification: 'Wir können diese Bedingungen gelegentlich aktualisieren. Änderungen werden auf dieser Seite mit aktualisiertem Datum veröffentlicht.',
          effective: 'Die fortgesetzte Nutzung von LocalPDF nach Änderungen stellt die Annahme der neuen Bedingungen dar.'
        },
        contact: {
          title: 'Kontaktinformationen',
          description: 'Fragen zu diesen Bedingungen? Wir helfen gerne.',
          github: 'Issues & Support',
          website: 'Website'
        }
      }
    }
  },


};

export default de;
