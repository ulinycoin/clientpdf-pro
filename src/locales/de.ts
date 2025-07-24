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
      tools: '12 Tools',
      private: '100% Privat',
      activeTools: '12 aktive Tools',
      privateProcessing: '100% private Verarbeitung',
    },
    mobileMenu: {
      toggle: 'Mobiles Menü umschalten',
      privacyPolicy: 'Datenschutzerklärung',
      githubRepository: 'GitHub Repository',
    },
  },

  home: {
    hero: {
      title: 'LocalPDF',
      subtitle: 'Datenschutzzentrierte PDF-Tools',
      description: 'Professionelle PDF-Verarbeitungstools, die vollständig in Ihrem Browser funktionieren',
      descriptionSecondary: 'Keine Uploads • Kein Tracking • Keine Limits • Völlig kostenlos für immer',
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
      title: '12 leistungsstarke PDF-Tools',
      subtitle: 'Wählen Sie das richtige Tool für Ihre Bedürfnisse. Alle Operationen werden lokal in Ihrem Browser durchgeführt.',
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
    },
  },

  tools: {
    merge: {
      title: 'PDFs zusammenführen',
      description: 'Mehrere PDF-Dateien zu einem Dokument kombinieren',
    },
    split: {
      title: 'PDF aufteilen',
      description: 'PDF in separate Seiten oder Bereiche aufteilen',
    },
    compress: {
      title: 'PDF komprimieren',
      description: 'PDF-Dateigröße reduzieren bei gleichbleibender Qualität',
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
    ocr: {
      title: 'OCR-Erkennung',
      description: 'Text aus gescannten PDFs und Bildern extrahieren',
    },
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
    description: 'Mit ❤️ für datenschutzbewusste Nutzer weltweit gemacht',
    links: {
      privacy: 'Datenschutz',
      faq: 'FAQ',
      github: 'GitHub',
    },
    copyright: 'Kein Tracking • Keine Werbung • Keine Datensammlung',
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
    },
    faq: {
      title: 'Häufig gestellte Fragen',
      subtitle: 'Alles, was Sie über LocalPDF wissen müssen',
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
      },
      split: {
        pageTitle: 'PDF-Dateien kostenlos aufteilen',
        pageDescription: 'Teilen Sie PDF-Dateien kostenlos nach Seiten oder Bereichen auf. Extrahieren Sie bestimmte Seiten aus PDF-Dokumenten. Private und sichere PDF-Aufteilung in Ihrem Browser.',
        uploadTitle: 'PDF zum Aufteilen hochladen',
        buttons: {
          startSplitting: 'Aufteilung starten',
        },
        features: {
          title: 'Erweiterte PDF-Aufteilungsfunktionen',
          pageRanges: {
            title: '📄 Seitenbereiche',
            description: 'Teilen Sie nach bestimmten Seitenbereichen (z.B. 1-5, 10-15) auf oder extrahieren Sie einzelne Seiten mit Präzision.',
          },
          batchProcessing: {
            title: '⚡ Stapelverarbeitung',
            description: 'Verarbeiten Sie mehrere Seitenbereiche gleichzeitig. Erstellen Sie effizient mehrere PDFs aus einem Quelldokument.',
          },
          previewMode: {
            title: '👁️ Vorschaumodus',
            description: 'Vorschau der Seiten vor dem Aufteilen, um sicherzustellen, dass Sie den richtigen Inhalt aus Ihrem PDF extrahieren.',
          },
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
    },
  },
};
