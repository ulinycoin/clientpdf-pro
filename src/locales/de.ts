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
      title: 'Vollständiges PDF-Toolkit',
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
  },
};
