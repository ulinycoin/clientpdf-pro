/**
 * Static pages translations for DE language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Häufig gestellte Fragen',
    subtitle: 'Alles, was Sie über LocalPDF wissen müssen - datenschutzorientierte PDF-Tools',
    searchPlaceholder: 'Antworten suchen...',
    searchNoResults: 'Keine Fragen gefunden. Versuchen Sie andere Suchbegriffe oder',
    searchContactLink: 'kontaktieren Sie unseren Support',

    // Popular questions section (Top 4-5 most important)
    popular: {
      title: 'Die beliebtesten Fragen',
      subtitle: 'Schnelle Antworten auf die häufigsten Nutzerfragen'
    },

    // Categories with questions
    categories: {
      privacy: {
        id: 'privacy',
        title: 'Datenschutz & Sicherheit',
        icon: '🔒',
        description: 'Erfahren Sie, wie wir Ihre Daten schützen und vollständigen Datenschutz gewährleisten',
        questions: [
          {
            id: 'files-uploaded',
            question: 'Werden meine PDF-Dateien auf Ihre Server hochgeladen?',
            answer: 'Nein, absolut nicht! Die gesamte PDF-Verarbeitung erfolgt <strong>100% lokal in Ihrem Browser</strong>. Ihre Dateien verlassen niemals Ihr Gerät - sie werden nicht auf unsere Server oder Cloud-Dienste hochgeladen. Dies gewährleistet vollständigen Datenschutz und Sicherheit für Ihre vertraulichen Dokumente.',
            keywords: ['hochladen', 'server', 'cloud', 'datenschutz', 'lokal'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf'],
            relatedPages: ['/privacy', '/gdpr'],
            popular: true
          },
          {
            id: 'data-collection',
            question: 'Welche Daten sammeln Sie über mich?',
            answer: 'Wir sammeln <strong>minimale anonyme Analytik</strong> zur Verbesserung unseres Services: Seitenaufrufe, Browser-Typ und Standort auf Länderebene. Wir sammeln <strong>niemals</strong>: Dateinamen, Dateiinhalte, persönliche Informationen oder Verarbeitungshistorie. Lesen Sie unsere vollständige <a href="/privacy">Datenschutzrichtlinie</a> für Details.',
            keywords: ['daten', 'sammeln', 'analytik', 'tracking', 'dsgvo'],
            relatedPages: ['/privacy', '/gdpr', '/terms'],
            popular: true
          },
          {
            id: 'confidential-docs',
            question: 'Kann ich vertrauliche oder sensible Dokumente verarbeiten?',
            answer: 'Ja! LocalPDF ist <strong>perfekt für vertrauliche Dokumente</strong>, da alles lokal verarbeitet wird. Ihre sensiblen Dateien (Verträge, Finanzberichte, juristische Dokumente) verlassen niemals Ihren Computer. Im Gegensatz zu Online-Diensten, die Dateien auf Server hochladen, verarbeiten wir alles in Ihrem Browser.',
            keywords: ['vertraulich', 'sensibel', 'sicher', 'juristisch', 'finanziell'],
            relatedTools: ['/protect-pdf', '/watermark-pdf'],
            relatedPages: ['/privacy', '/gdpr']
          },
          {
            id: 'after-processing',
            question: 'Was passiert mit meinen Dateien nach der Verarbeitung?',
            answer: 'Dateien werden <strong>automatisch aus dem Browser-Speicher gelöscht</strong>, wenn Sie die Seite schließen oder wegnavigieren. Da die Verarbeitung lokal erfolgt, werden keine Dateien auf Servern gespeichert. Sie haben die volle Kontrolle - laden Sie Ihre Ergebnisse herunter und schließen Sie die Seite, wenn Sie fertig sind.',
            keywords: ['löschen', 'entfernen', 'speicher', 'cache'],
            relatedPages: ['/privacy']
          },
          {
            id: 'internet-required',
            question: 'Benötige ich eine Internetverbindung für LocalPDF?',
            answer: 'Nur für das <strong>erste Laden der Seite</strong>. Danach können Sie PDFs vollständig offline verarbeiten! Die Verarbeitungsbibliotheken werden in Ihren Browser geladen, sodass Sie ohne Internet arbeiten können. Perfekt für die Arbeit mit sensiblen Dokumenten im Flugzeug oder in sicheren Umgebungen.',
            keywords: ['offline', 'internet', 'verbindung', 'netzwerk'],
            popular: true
          }
        ]
      },

      features: {
        id: 'features',
        title: 'Funktionen & Tools',
        icon: '🛠️',
        description: 'Entdecken Sie unsere PDF-Tools und ihre Möglichkeiten',
        questions: [
          {
            id: 'available-tools',
            question: 'Welche PDF-Tools sind verfügbar?',
            answer: 'LocalPDF bietet <strong>über 15 professionelle PDF-Tools</strong>: <a href="/merge-pdf">PDF zusammenführen</a>, <a href="/split-pdf">PDF aufteilen</a>, <a href="/compress-pdf">PDF komprimieren</a>, <a href="/protect-pdf">Passwortschutz</a>, <a href="/watermark-pdf">Wasserzeichen hinzufügen</a>, <a href="/add-text-pdf">Text hinzufügen</a>, <a href="/rotate-pdf">Seiten drehen</a>, <a href="/ocr-pdf">OCR-Texterkennung</a>, <a href="/extract-pages-pdf">Seiten extrahieren</a>, <a href="/extract-text-pdf">Text extrahieren</a>, <a href="/extract-images-from-pdf">Bilder extrahieren</a>, <a href="/pdf-to-image">PDF zu Bild</a>, <a href="/image-to-pdf">Bild zu PDF</a>, <a href="/word-to-pdf">Word zu PDF</a> und mehr!',
            keywords: ['tools', 'funktionen', 'verfügbar', 'liste', 'möglichkeiten'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf', '/ocr-pdf'],
            popular: true
          },
          {
            id: 'edit-existing-text',
            question: 'Kann ich vorhandenen Text in meinen PDFs bearbeiten?',
            answer: 'LocalPDF konzentriert sich auf <strong>Dokumentmanipulation</strong> (Zusammenführen, Aufteilen, Komprimieren) statt auf Inhaltsbearbeitung. Sie können <a href="/add-text-pdf">neuen Text hinzufügen</a>, <a href="/watermark-pdf">Wasserzeichen hinzufügen</a> und <a href="/ocr-pdf">Text mit OCR extrahieren</a>, aber die Bearbeitung vorhandenen Texts erfordert spezialisierte PDF-Editoren. Wir empfehlen Tools wie Adobe Acrobat oder PDF-XChange Editor für Textbearbeitung.',
            keywords: ['bearbeiten', 'text', 'ändern', 'inhalt'],
            relatedTools: ['/add-text-pdf', '/watermark-pdf', '/ocr-pdf']
          },
          {
            id: 'browser-extension',
            question: 'Gibt es eine Browser-Erweiterung für LocalPDF?',
            answer: 'Ja! Installieren Sie unsere <strong>kostenlose Chrome-Erweiterung</strong> für schnellen Zugriff auf PDF-Tools direkt aus Ihrem Browser. Rechtsklick auf ein PDF → "Mit LocalPDF öffnen" → Sofort verarbeiten. <a href="https://chromewebstore.google.com/detail/localpdf/mjidkeobnlijdjmioniboflmoelmckfl" target="_blank" rel="noopener noreferrer">Chrome-Erweiterung herunterladen →</a>',
            keywords: ['erweiterung', 'chrome', 'browser', 'plugin', 'addon'],
            relatedPages: ['/how-to-use'],
            popular: true
          },
          {
            id: 'file-size-limits',
            question: 'Gibt es Dateigrößenbeschränkungen?',
            answer: 'Keine künstlichen Limits! Die einzigen Einschränkungen sind der <strong>RAM und die Verarbeitungsleistung Ihres Geräts</strong>. Die meisten modernen Computer können PDFs bis 100-200 MB problemlos verarbeiten. Große Dateien (500+ MB) können länger dauern. Da alles lokal ist, gibt es keine Server-Upload-Limits.',
            keywords: ['limit', 'größe', 'maximum', 'groß'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'batch-processing',
            question: 'Kann ich mehrere PDFs gleichzeitig verarbeiten?',
            answer: 'Ja! Die meisten Tools unterstützen <strong>Stapelverarbeitung</strong>. Zum Beispiel kann <a href="/merge-pdf">PDF zusammenführen</a> Dutzende Dateien kombinieren, <a href="/compress-pdf">PDF komprimieren</a> kann mehrere PDFs optimieren, und <a href="/protect-pdf">PDF schützen</a> kann mehrere Dateien gleichzeitig mit einem Passwort versehen. Laden Sie mehrere Dateien hoch und verarbeiten Sie sie alle auf einmal.',
            keywords: ['stapel', 'mehrere', 'bulk', 'viele'],
            relatedTools: ['/merge-pdf', '/compress-pdf', '/protect-pdf']
          }
        ]
      },

      technical: {
        id: 'technical',
        title: 'Technische Fragen',
        icon: '💻',
        description: 'Browser-Kompatibilität, Leistung und technische Details',
        questions: [
          {
            id: 'supported-browsers',
            question: 'Welche Browser werden unterstützt?',
            answer: 'LocalPDF funktioniert in <strong>allen modernen Browsern</strong>: <ul><li><strong>Google Chrome</strong> (empfohlen - beste Leistung)</li><li><strong>Mozilla Firefox</strong></li><li><strong>Microsoft Edge</strong></li><li><strong>Apple Safari</strong></li><li><strong>Opera</strong></li></ul>Wir empfehlen die Aktualisierung auf die neueste Browser-Version für optimale Leistung.',
            keywords: ['browser', 'chrome', 'firefox', 'safari', 'edge'],
            relatedPages: ['/how-to-use']
          },
          {
            id: 'processing-speed',
            question: 'Warum ist die Verarbeitung großer PDFs langsam?',
            answer: 'Die Verarbeitungsgeschwindigkeit hängt von Ihrer <strong>Geräte-Hardware</strong> und der <strong>PDF-Komplexität</strong> ab. Große Dateien (100+ MB) oder PDFs mit vielen Bildern benötigen mehr RAM und CPU. Tipps für schnellere Verarbeitung: <ul><li>Schließen Sie andere Browser-Tabs</li><li>Verwenden Sie zuerst <a href="/compress-pdf">PDF komprimieren</a>, um die Dateigröße zu reduzieren</li><li>Verarbeiten Sie weniger Dateien gleichzeitig</li><li>Aktualisieren Sie den Browser auf die neueste Version</li></ul>',
            keywords: ['langsam', 'leistung', 'geschwindigkeit', 'schnell', 'optimieren'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'mobile-support',
            question: 'Kann ich LocalPDF auf Mobilgeräten verwenden?',
            answer: 'Ja! LocalPDF funktioniert in <strong>mobilen Browsern</strong> (iOS Safari, Chrome Android), aber die Leistung kann aufgrund des Geräte-RAMs eingeschränkt sein. Für beste Erfahrung auf Mobilgeräten: <ul><li>Verarbeiten Sie kleinere Dateien (< 50 MB)</li><li>Verwenden Sie einfachere Tools (<a href="/rotate-pdf">Drehen</a>, <a href="/extract-pages-pdf">Seiten extrahieren</a>)</li><li>Vermeiden Sie schwere Tools (OCR, große Zusammenführungen) auf älteren Handys</li></ul>',
            keywords: ['mobil', 'handy', 'tablet', 'ios', 'android'],
            relatedTools: ['/rotate-pdf', '/extract-pages-pdf']
          },
          {
            id: 'file-formats',
            question: 'Welche Dateiformate werden unterstützt?',
            answer: 'LocalPDF unterstützt: <ul><li><strong>PDF-Dateien</strong> - alle Versionen, verschlüsselte PDFs (mit Passwort)</li><li><strong>Bilder</strong> - JPG, PNG, WebP, TIFF (<a href="/image-to-pdf">Bild zu PDF</a>)</li><li><strong>Dokumente</strong> - DOCX, DOC (<a href="/word-to-pdf">Word zu PDF</a>), XLSX (<a href="/excel-to-pdf">Excel zu PDF</a>)</li></ul>Alle Konvertierungen erfolgen lokal ohne Datei-Uploads.',
            keywords: ['format', 'typ', 'unterstützt', 'konvertieren', 'kompatibilität'],
            relatedTools: ['/image-to-pdf', '/word-to-pdf', '/pdf-to-image']
          }
        ]
      },

      account: {
        id: 'account',
        title: 'Konto & Preise',
        icon: '💰',
        description: 'Kostenlos nutzbar, keine Registrierung erforderlich',
        questions: [
          {
            id: 'is-free',
            question: 'Ist LocalPDF wirklich kostenlos?',
            answer: '<strong>Ja, 100% kostenlos!</strong> Alle Tools sind vollständig kostenlos ohne versteckte Kosten, ohne Premium-Stufen, ohne Abonnements. Wir glauben, dass datenschutzorientierte Tools für alle zugänglich sein sollten. Unser Projekt ist <strong>Open Source</strong> und wird von der Community unterstützt. <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">Quellcode auf GitHub ansehen →</a>',
            keywords: ['kostenlos', 'preis', 'premium', 'abonnement'],
            popular: true
          },
          {
            id: 'account-required',
            question: 'Muss ich ein Konto erstellen?',
            answer: 'Nein! <strong>Keine Registrierung erforderlich</strong>. Besuchen Sie einfach eine beliebige Tool-Seite und beginnen Sie sofort mit der PDF-Verarbeitung. Keine E-Mail, kein Passwort, keine persönlichen Informationen nötig. Das ist Teil unserer Datenschutz-Philosophie - wir wollen Ihre Daten nicht, weil wir sie nicht sammeln.',
            keywords: ['konto', 'registrierung', 'anmeldung', 'login', 'email']
          },
          {
            id: 'how-we-make-money',
            question: 'Wie verdient LocalPDF Geld, wenn es kostenlos ist?',
            answer: 'LocalPDF ist ein <strong>Open-Source-Projekt</strong> mit minimalen Serverkosten (da die Verarbeitung lokal erfolgt). Wir könnten in Zukunft optionale Funktionen hinzufügen (wie Cloud-Sync für Einstellungen), aber alle Kern-PDF-Tools bleiben für immer kostenlos. Das Projekt wird von der Community unterstützt und konzentriert sich auf datenschutzorientierte Tools.',
            keywords: ['geld', 'einnahmen', 'geschäft', 'monetarisierung', 'werbung']
          }
        ]
      },

      support: {
        id: 'support',
        title: 'Support & Kontakt',
        icon: '📞',
        description: 'Erhalten Sie Hilfe und kontaktieren Sie unser Team',
        questions: [
          {
            id: 'get-support',
            question: 'Wie erhalte ich Support oder melde Fehler?',
            answer: 'Mehrere Möglichkeiten, Hilfe zu bekommen: <ul><li><strong>E-Mail</strong>: <a href="mailto:support@localpdf.online">support@localpdf.online</a> (technischer Support)</li><li><strong>GitHub</strong>: <a href="https://github.com/ulinycoin/clientpdf-pro/issues" target="_blank" rel="noopener noreferrer">Fehler und Probleme melden</a></li><li><strong>GitHub-Diskussionen</strong>: <a href="https://github.com/ulinycoin/clientpdf-pro/discussions" target="_blank" rel="noopener noreferrer">Fragen stellen und Feedback teilen</a></li></ul>',
            keywords: ['support', 'hilfe', 'fehler', 'problem', 'kontakt'],
            relatedPages: ['/terms']
          },
          {
            id: 'contribute',
            question: 'Kann ich zu LocalPDF beitragen?',
            answer: 'Auf jeden Fall! LocalPDF ist <strong>Open Source</strong>. Möglichkeiten beizutragen: <ul><li><strong>Code</strong>: Pull Requests auf <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">GitHub</a> einreichen</li><li><strong>Übersetzungen</strong>: Helfen Sie bei der Übersetzung in weitere Sprachen</li><li><strong>Fehlerberichte</strong>: Gefundene Probleme melden</li><li><strong>Feature-Ideen</strong>: Neue Tools vorschlagen</li><li><strong>Dokumentation</strong>: Anleitungen und Docs verbessern</li></ul>',
            keywords: ['beitragen', 'open source', 'github', 'entwickler', 'hilfe']
          }
        ]
      }
    },

    // Related links section
    relatedLinks: {
      title: 'Noch Fragen?',
      subtitle: 'Weitere Ressourcen erkunden',
      links: {
        privacy: {
          title: 'Datenschutzrichtlinie',
          description: 'Erfahren Sie, wie wir Ihre Daten schützen',
          url: '/privacy'
        },
        gdpr: {
          title: 'DSGVO-Konformität',
          description: 'Unser Engagement für Datenschutz',
          url: '/gdpr'
        },
        terms: {
          title: 'Nutzungsbedingungen',
          description: 'Nutzungsrichtlinien und Richtlinien',
          url: '/terms'
        },
        docs: {
          title: 'Dokumentation',
          description: 'Detaillierte Anleitungen und Tutorials',
          url: '/docs'
        }
      }
    },

    // Contact section
    contact: {
      title: 'Kontaktinformationen',
      description: 'Benötigen Sie persönliche Hilfe? Kontaktieren Sie unser Team',
      company: 'SIA "Ul-coin"',
      regNumber: 'Reg.Nr. 50203429241',
      email: 'support@localpdf.online',
      emailContact: 'contact@localpdf.online',
      github: 'GitHub Issues',
      website: 'localpdf.online'
    }
  },
  privacy: {
    title: 'Datenschutzrichtlinie',
    subtitle: 'Ihr Datenschutz ist unsere oberste Priorität. Erfahren Sie, wie LocalPDF Ihre Daten schützt.',
    lastUpdated: 'Zuletzt aktualisiert: 30. August 2025',
    sections: {
      commitment: {
        title: 'Unser Datenschutz-Versprechen',
        content: 'Bei LocalPDF ist Datenschutz nicht nur ein Feature – es ist das Fundament von allem, was wir entwickeln. Ihre Dateien werden vollständig in Ihrem Browser verarbeitet und gewährleisten so kompletten Datenschutz und Sicherheit.'
      },
      simpleAnswer: {
        title: 'Die einfache Antwort',
        main: 'Ihre Dateien verlassen NIEMALS Ihr Gerät. Alles passiert lokal in Ihrem Browser.',
        sub: 'Keine Uploads, keine Server, keine Datensammlung. Ihre Dokumente bleiben immer privat.'
      },
      whatWeDont: {
        title: 'Was wir NICHT tun',
        noDataCollection: {
          title: 'Keine Datensammlung',
          items: [
            'Wir sammeln keine persönlichen Informationen',
            'Wir verfolgen Ihre Aktivitäten nicht',
            'Wir speichern keine Nutzungsanalytik',
            'Wir erstellen keine Benutzerprofile',
            'Wir verwenden keine Tracking-Cookies'
          ]
        },
        noFileAccess: {
          title: 'Kein Dateizugriff',
          items: [
            'Wir sehen Ihre Dateien niemals',
            'Dateien werden nicht auf Server hochgeladen',
            'Keine temporäre Speicherung bei uns',
            'Dokumente verlassen nie Ihr Gerät',
            'Null Zugriff auf Dateiinhalte'
          ]
        }
      },
      howItWorks: {
        title: 'Wie LocalPDF tatsächlich funktioniert',
        clientSide: {
          title: 'Client-seitige Verarbeitung',
          description: 'Alle PDF-Operationen finden direkt in Ihrem Webbrowser mit fortschrittlichen JavaScript-Bibliotheken statt.',
          items: [
            'Dateien werden mit PDF.js (Mozilla\'s PDF-Bibliothek) verarbeitet',
            'Alle Operationen laufen im Speicher Ihres Browsers',
            'Keine Datenübertragung an externe Server',
            'Ergebnisse werden lokal auf Ihrem Gerät generiert'
          ]
        },
        process: {
          title: 'Schritt-für-Schritt-Prozess',
          steps: [
            'Sie wählen Dateien von Ihrem Gerät aus',
            'Dateien werden nur in den Browser-Speicher geladen',
            'JavaScript verarbeitet Ihre PDFs lokal',
            'Ergebnisse werden generiert und zum Download bereitgestellt',
            'Dateien werden automatisch gelöscht, wenn Sie die Seite verlassen'
          ]
        }
      },
      analytics: {
        title: 'Analytik & Tracking',
        description: 'Wir verwenden minimale, datenschutzfreundliche Analytik zur Verbesserung unseres Services. Hier ist genau das, was wir verfolgen:',
        whatWeTrack: {
          title: 'Was wir verfolgen (nur anonym)',
          items: [
            'Seitenaufrufe (welche Tools beliebt sind)',
            'Allgemeine Browser-Informationen (für Kompatibilität)',
            'Ungefährer Standort (nur auf Länderebene)',
            'Keine persönlichen Identifikationsdaten',
            'Keine Dateiverarbeitungsdaten'
          ]
        },
        protections: {
          title: 'Datenschutz-Schutzmaßnahmen',
          items: [
            'Alle Analytik ist anonymisiert',
            'Keine IP-Adressen-Protokollierung',
            'Kein websiteübergreifendes Tracking',
            'Keine Drittanbieter-Werbenetzwerke',
            'Sie können sich über Browser-Einstellungen abmelden'
          ]
        }
      },
      compliance: {
        title: 'Internationale Compliance',
        gdpr: {
          title: 'DSGVO-konform',
          description: 'Vollständig konform mit EU-Datenschutzbestimmungen'
        },
        ccpa: {
          title: 'CCPA-konform',
          description: 'Entspricht kalifornischen Datenschutzstandards'
        },
        global: {
          title: 'Globaler Datenschutz',
          description: 'Entspricht internationalen Datenschutz-Best-Practices'
        }
      },
      summary: {
        title: 'Das Fazit',
        main: 'LocalPDF gibt Ihnen die vollständige Kontrolle über Ihre Daten. Wir haben es so entwickelt, weil wir glauben, dass Datenschutz ein Grundrecht ist.',
        sub: 'Fragen zum Datenschutz? Wir erklären gerne unseren Ansatz im Detail.'
      }
    }
  },
  terms: {
    title: 'Nutzungsbedingungen',
    subtitle: 'Einfache und transparente Bedingungen für die Nutzung von LocalPDF-Tools',
    lastUpdated: 'Zuletzt aktualisiert: 30. August 2025',
    sections: {
      introduction: {
        title: 'Willkommen bei LocalPDF',
        content: 'Durch die Nutzung von LocalPDF stimmen Sie diesen Bedingungen zu. Wir halten sie einfach und fair, weil uns Datenschutz und Transparenz wichtig sind.'
      },
      acceptance: {
        title: 'Annahme der Bedingungen',
        content: 'Durch den Zugriff auf und die Nutzung von LocalPDF akzeptieren Sie diese Nutzungsbedingungen. Wenn Sie nicht zustimmen, nutzen Sie bitte unseren Service nicht.'
      },
      serviceDescription: {
        title: 'Unser Service',
        content: 'LocalPDF bietet kostenlose, browserbasierte PDF-Tools, die Ihre Dokumente vollständig auf Ihrem Gerät verarbeiten.',
        features: {
          title: 'Was wir anbieten:',
          list: [
            'PDF-Zusammenführung, -Aufteilung und -Komprimierung',
            'Text- und Wasserzeichen-Hinzufügung',
            'PDF-Rotation und Seitenextraktion',
            'Format-Konvertierungs-Tools',
            'Vollständige client-seitige Verarbeitung'
          ]
        }
      },
      usageRules: {
        title: 'Nutzungsrichtlinien',
        allowed: {
          title: 'Erlaubte Nutzung',
          items: [
            'Persönliche Dokumentverarbeitung',
            'Kommerzielle und geschäftliche Nutzung',
            'Bildungszwecke',
            'Jede legale Dokumentmanipulation'
          ]
        },
        prohibited: {
          title: 'Verbotene Nutzung',
          items: [
            'Verarbeitung illegaler Inhalte',
            'Reverse-Engineering-Versuche',
            'Überlastung unserer Infrastruktur',
            'Verletzung geltender Gesetze'
          ]
        }
      },
      privacy: {
        title: 'Datenschutz & Ihre Daten',
        localProcessing: 'Alle Ihre Dokumente werden lokal in Ihrem Browser verarbeitet - sie verlassen niemals Ihr Gerät.',
        noDataCollection: 'Wir sammeln, speichern oder haben keinen Zugriff auf Ihre Dateien oder persönlichen Daten.',
        privacyPolicyLink: 'Lesen Sie unsere vollständige Datenschutzrichtlinie →'
      },
      intellectualProperty: {
        title: 'Geistiges Eigentum',
        openSource: {
          title: 'Open Source',
          content: 'LocalPDF ist Open-Source-Software. Sie können unseren Code einsehen, dazu beitragen und forken.',
          githubLink: 'Quellcode auf GitHub ansehen →'
        },
        userContent: {
          title: 'Ihr Inhalt',
          content: 'Sie behalten alle Rechte an Ihren Dokumenten. Wir beanspruchen niemals Eigentum oder Zugriff auf Ihre Dateien.'
        }
      },
      disclaimers: {
        title: 'Haftungsausschlüsse',
        asIs: 'LocalPDF wird "wie besehen" ohne jegliche Garantien oder Gewährleistungen bereitgestellt.',
        noWarranties: 'Obwohl wir uns um Zuverlässigkeit bemühen, können wir keinen ununterbrochenen Service oder fehlerfreien Betrieb garantieren.',
        limitations: [
          'Keine Gewährleistung der Marktgängigkeit oder Eignung',
          'Keine Garantie für Datengenauigkeit oder -integrität',
          'Service kann vorübergehend nicht verfügbar sein',
          'Funktionen können sich ändern oder eingestellt werden'
        ]
      },
      liability: {
        title: 'Haftungsbeschränkung',
        limitation: 'Wir haften nicht für Schäden, die durch Ihre Nutzung von LocalPDF entstehen.',
        maxLiability: 'Unsere maximale Haftung ist auf den Betrag begrenzt, den Sie für den Service bezahlt haben (das ist null, da er kostenlos ist).'
      },
      changes: {
        title: 'Änderungen der Bedingungen',
        notification: 'Wir können diese Bedingungen gelegentlich aktualisieren. Wesentliche Änderungen werden über unsere Website kommuniziert.',
        effective: 'Die fortgesetzte Nutzung von LocalPDF nach Änderungen stellt die Annahme neuer Bedingungen dar.'
      },
      contact: {
        title: 'Kontakt',
        description: 'Fragen zu diesen Bedingungen? Wir helfen gerne.',
        company: 'SIA "Ul-coin"',
        regNumber: 'Reg.Nr. 50203429241',
        email: 'support@localpdf.online',
        emailContact: 'contact@localpdf.online',
        github: 'Support & Probleme',
        website: 'Website'
      }
    }
  },

  howToUse: {
    title: 'So verwenden Sie LocalPDF',
    subtitle: 'Vollständige Anleitung zur Verwendung der leistungsstarken PDF-Tools von LocalPDF. Lernen Sie, wie Sie PDFs zusammenführen, aufteilen, komprimieren, bearbeiten und konvertieren - mit vollständigem Datenschutz und Sicherheit.',
    quickStart: {
      title: 'Schnellstart-Anleitung',
      steps: {
        upload: { title: 'Dateien hochladen', description: 'Ziehen Sie Dateien per Drag & Drop oder klicken Sie zum Auswählen Ihrer PDF-Dateien' },
        choose: { title: 'Tool auswählen', description: 'Wählen Sie aus über 15 leistungsstarken PDF-Verarbeitungstools' },
        configure: { title: 'Konfigurieren', description: 'Passen Sie Einstellungen und Optionen nach Bedarf an' },
        download: { title: 'Herunterladen', description: 'Verarbeiten und laden Sie Ihr Ergebnis sofort herunter' }
      },
      keyBenefits: {
        title: 'Hauptvorteile',
        description: 'Die gesamte Verarbeitung erfolgt in Ihrem Browser - keine Uploads, keine Registrierung, kein Tracking. Ihre Dateien verlassen niemals Ihr Gerät und gewährleisten so vollständigen Datenschutz und Sicherheit.'
      }
    },
    tools: {
      title: 'PDF-Tools-Anleitung',
      merge: {
        title: 'PDF-Dateien zusammenführen',
        description: 'Kombinieren Sie mehrere PDF-Dateien zu einem Dokument.',
        steps: [
          'Laden Sie mehrere PDF-Dateien hoch (Drag & Drop oder Klicken zum Auswählen)',
          'Ordnen Sie Dateien durch Ziehen in der Liste neu an',
          'Klicken Sie auf "PDFs zusammenführen", um sie zu kombinieren',
          'Laden Sie Ihre zusammengeführte PDF-Datei herunter'
        ],
        tip: 'Sie können bis zu 20 PDF-Dateien gleichzeitig zusammenführen. Die endgültige Reihenfolge entspricht Ihrer Anordnung in der Dateiliste.'
      },
      split: {
        title: 'PDF-Dateien aufteilen',
        description: 'Extrahieren Sie bestimmte Seiten oder teilen Sie PDFs in separate Dateien auf.',
        steps: [
          'Laden Sie eine einzelne PDF-Datei hoch',
          'Wählen Sie die Aufteilungsmethode (nach Seitenbereich, alle X Seiten oder benutzerdefinierte Bereiche)',
          'Geben Sie Seitenzahlen oder Bereiche an (z.B. "1-5, 8, 10-12")',
          'Klicken Sie auf "PDF aufteilen" und laden Sie einzelne Dateien herunter'
        ],
        tip: 'Verwenden Sie den Vorschaumodus, um Seitenminiaturansichten vor dem Aufteilen zu sehen. Unterstützt komplexe Bereiche wie "1-3, 7, 15-20".'
      },
      compress: {
        title: 'PDF-Dateien komprimieren',
        description: 'Reduzieren Sie die PDF-Dateigröße bei gleichbleibender Qualität.',
        steps: [
          'Laden Sie eine PDF-Datei hoch',
          'Passen Sie das Qualitätsniveau an (10%-100%)',
          'Aktivieren Sie Bildkomprimierung, Metadatenentfernung oder Web-Optimierung',
          'Klicken Sie auf "PDF komprimieren" und laden Sie die kleinere Datei herunter'
        ],
        tip: '80% Qualität bietet normalerweise das beste Gleichgewicht zwischen Dateigröße und visueller Qualität. Aktivieren Sie Bildkomprimierung für maximale Einsparungen.'
      },
      addText: {
        title: 'Text zu PDFs hinzufügen',
        description: 'Fügen Sie benutzerdefinierten Text, Signaturen und Anmerkungen ein.',
        steps: [
          'Laden Sie eine PDF-Datei hoch',
          'Klicken Sie in der PDF-Vorschau an die Stelle, wo Sie Text hinzufügen möchten',
          'Geben Sie Ihren Text ein und passen Sie Schriftart, Größe und Farbe an',
          'Positionieren und ändern Sie die Größe von Textfeldern nach Bedarf',
          'Speichern Sie Ihr modifiziertes PDF'
        ],
        tip: 'Verwenden Sie verschiedene Farben und Schriftarten für Signaturen, Stempel oder Anmerkungen. Textfelder können nach der Erstellung verschoben und in der Größe geändert werden.'
      },
      additional: {
        title: 'Wasserzeichen hinzufügen & mehr',
        description: 'LocalPDF umfasst 5 zusätzliche leistungsstarke Tools für umfassende PDF-Bearbeitung.',
        features: {
          watermarks: 'Text- oder Bildwasserzeichen hinzufügen',
          rotate: 'Seitenausrichtung korrigieren',
          extract: 'Neue PDFs aus ausgewählten Seiten erstellen',
          extractText: 'Textinhalt aus PDFs extrahieren',
          convert: 'Seiten in PNG/JPEG konvertieren'
        },
        tip: 'Alle Tools funktionieren gleich: Hochladen → Konfigurieren → Verarbeiten → Herunterladen. Jedes Tool hat spezifische Optionen, die auf seine Funktion zugeschnitten sind.'
      }
    },
    tips: {
      title: 'Erweiterte Tipps & Tricks',
      performance: {
        title: 'Leistungstipps',
        items: [
          'Schließen Sie andere Browser-Tabs für große Dateien (>50MB)',
          'Verwenden Sie Chrome oder Firefox für beste Leistung',
          'Aktivieren Sie Hardware-Beschleunigung in den Browser-Einstellungen',
          'Verarbeiten Sie sehr große Dateien in kleineren Stapeln'
        ]
      },
      keyboard: {
        title: 'Tastaturkürzel',
        items: [
          'Strg+O - Dateiauswahl-Dialog öffnen',
          'Strg+S - Ergebnis speichern/herunterladen',
          'Strg+Z - Letzte Aktion rückgängig machen',
          'Tab - Durch Oberflächenelemente navigieren'
        ]
      },
      mobile: {
        title: 'Mobile Nutzung',
        items: [
          'Alle Tools funktionieren auf Smartphones und Tablets',
          'Verwenden Sie Querformat für bessere Benutzeroberfläche',
          'Touch- und Pinch-Gesten werden unterstützt',
          'Dateien können aus Cloud-Speicher-Apps geöffnet werden'
        ]
      },
      troubleshooting: {
        title: 'Fehlerbehebung',
        items: [
          'Aktualisieren Sie die Seite, wenn das Tool nicht reagiert',
          'Löschen Sie den Browser-Cache bei anhaltenden Problemen',
          'Stellen Sie sicher, dass JavaScript aktiviert ist',
          'Aktualisieren Sie den Browser auf die neueste Version'
        ]
      }
    },
    formats: {
      title: 'Dateiformatunterstützung',
      input: {
        title: 'Unterstützte Eingabe',
        items: [
          'PDF-Dateien (jede Version)',
          'Mehrseitige Dokumente',
          'Text- und Bild-PDFs',
          'Formulare und Anmerkungen',
          'Dateien bis zu 100MB'
        ]
      },
      output: {
        title: 'Ausgabeformate',
        items: [
          'PDF (verarbeitete Dokumente)',
          'PNG (hochwertige Bilder)',
          'JPEG (komprimierte Bilder)',
          'WEBP (modernes Format)',
          'TXT (extrahierter Text)'
        ]
      },
      limitations: {
        title: 'Einschränkungen',
        items: [
          'Maximale Dateigröße: 100MB',
          'Passwortgeschützte Dateien werden nicht unterstützt',
          'Einige komplexe PDF-Strukturen können fehlschlagen',
          'Gescannte PDFs: eingeschränkte Textextraktion'
        ]
      }
    },
    privacy: {
      title: 'Datenschutz & Sicherheitsleitfaden',
      whatWeDo: {
        title: 'Was LocalPDF macht',
        items: [
          'Verarbeitet Dateien vollständig in Ihrem Browser',
          'Verwendet client-seitiges JavaScript für alle Operationen',
          'Löscht Dateien automatisch aus dem Speicher',
          'Funktioniert nach dem ersten Laden vollständig offline',
          'Open Source und transparent'
        ]
      },
      whatWeNeverDo: {
        title: 'Was LocalPDF niemals macht',
        items: [
          'Dateien auf Server hochladen',
          'Ihre Dokumente speichern oder cachen',
          'Nutzerverhalten verfolgen oder Analysen sammeln',
          'Konten oder Registrierung verlangen',
          'Cookies für Tracking verwenden'
        ]
      },
      perfectFor: 'Perfekt für vertrauliche Dokumente: Da die gesamte Verarbeitung lokal erfolgt, ist LocalPDF ideal für sensible Dokumente, juristische Dateien, Finanzunterlagen oder beliebige vertrauliche PDFs.'
    },
    help: {
      title: 'Benötigen Sie zusätzliche Hilfe?',
      documentation: {
        title: 'Dokumentation',
        description: 'Umfassende Anleitungen und Tutorials für alle PDF-Tools',
        link: 'FAQ anzeigen'
      },
      community: {
        title: 'Community-Support',
        description: 'Erhalten Sie Hilfe von der LocalPDF-Community',
        link: 'An Diskussionen teilnehmen'
      },
      issues: {
        title: 'Probleme melden',
        description: 'Einen Fehler gefunden oder einen Vorschlag?',
        link: 'Problem melden'
      },
      footer: 'LocalPDF ist Open-Source-Software, die von der Community gepflegt wird. Ihr Feedback hilft uns, die Tools für alle zu verbessern.'
    }
  },

  notFound: {
    title: 'Seite nicht gefunden',
    subtitle: 'Die Seite, die Sie suchen, existiert nicht',
    description: 'Die angeforderte Seite konnte nicht gefunden werden. Bitte überprüfen Sie die URL und versuchen Sie es erneut, oder erkunden Sie unsere beliebten PDF-Tools unten.',
    message: 'Die angeforderte Seite konnte nicht gefunden werden. Bitte überprüfen Sie die URL und versuchen Sie es erneut.',
    backHome: 'Zurück zur Startseite',
    backToTools: 'PDF-Tools durchsuchen',
    suggestions: {
      title: 'Beliebte PDF-Tools:',
      merge: 'PDFs zusammenführen',
      split: 'PDFs aufteilen',
      compress: 'PDFs komprimieren',
      convert: 'Bilder in PDF konvertieren'
    }
  },

  // Tools section (for FAQ tools section compatibility)
  tools: {}
};