/**
 * Static pages translations for DE language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Häufig gestellte Fragen',
    subtitle: 'Finden Sie Antworten auf häufige Fragen über LocalPDF',
    sections: {
      general: {
        title: 'Allgemeine Fragen',
        questions: {
          whatIs: {
            question: 'Was ist LocalPDF?',
            answer: 'LocalPDF ist eine Sammlung datenschutzorientierter PDF-Tools, die vollständig in Ihrem Browser funktionieren. Keine Uploads, kein Tracking, komplette Privatsphäre.'
          },
          free: {
            question: 'Ist LocalPDF wirklich kostenlos?',
            answer: 'Ja! Alle Tools sind vollständig kostenlos und ohne Registrierung nutzbar. Keine versteckten Kosten, keine Premium-Stufen.'
          },
          account: {
            question: 'Muss ich ein Konto erstellen?',
            answer: 'Kein Konto erforderlich! Besuchen Sie einfach die Website und beginnen Sie sofort mit der Nutzung eines beliebigen Tools.'
          }
        }
      },
      privacy: {
        title: 'Datenschutz & Sicherheit',
        questions: {
          uploaded: {
            question: 'Werden meine Dateien auf Ihre Server hochgeladen?',
            answer: 'Nein! Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser. Ihre Dateien verlassen niemals Ihr Gerät.'
          },
          afterUse: {
            question: 'Was passiert mit meinen Dateien nach der Nutzung der Tools?',
            answer: 'Nichts! Da die Dateien lokal verarbeitet werden, bleiben sie nur auf Ihrem Gerät. Wir sehen oder speichern Ihre Dateien niemals.'
          },
          confidential: {
            question: 'Kann ich dies für vertrauliche Dokumente verwenden?',
            answer: 'Absolut! Da alles lokal abläuft, bleiben Ihre vertraulichen Dokumente vollständig privat.'
          }
        }
      },
      technical: {
        title: 'Technische Fragen',
        questions: {
          browsers: {
            question: 'Welche Browser werden unterstützt?',
            answer: 'LocalPDF funktioniert in allen modernen Browsern:',
            browsers: [
              'Google Chrome (empfohlen)',
              'Mozilla Firefox',
              'Apple Safari',
              'Microsoft Edge',
              'Opera'
            ]
          },
          offline: {
            question: 'Kann ich LocalPDF offline verwenden?',
            answer: 'Ja! Nach dem ersten Laden der Seite können Sie Dateien auch ohne Internetverbindung verarbeiten.'
          },
          fileSize: {
            question: 'Gibt es Dateigrößenbeschränkungen?',
            answer: 'Die einzigen Grenzen basieren auf dem Arbeitsspeicher und der Verarbeitungsleistung Ihres Geräts. Wir setzen keine künstlichen Grenzen.'
          }
        }
      },
      tools: {
        title: 'PDF-Tools',
        editText: {
          question: 'Kann ich Text in bestehenden PDFs bearbeiten?',
          answer: 'LocalPDF konzentriert sich auf Dokumentmanipulation statt auf Inhaltsbearbeitung. Sie können Text hinzufügen, Wasserzeichen einfügen, PDFs zusammenführen, aufteilen und drehen, aber die Bearbeitung von vorhandenem Text erfordert spezialisierte PDF-Bearbeitungssoftware.'
        }
      },
      support: {
        title: 'Support & Kontakt',
        gettingSupport: {
          title: 'Wie Sie Support erhalten',
          items: [
            'Überprüfen Sie unseren FAQ-Bereich für häufige Fragen',
            'Melden Sie Fehler und Probleme auf unserer GitHub-Seite',
            'Kontaktieren Sie uns per E-Mail für technischen Support',
            'Folgen Sie uns in sozialen Medien für Updates'
          ]
        },
        contact: {
          title: 'Kontaktinformationen',
          company: 'SIA "Ul-coin"',
          regNumber: 'Reg.Nr. 50203429241',
          email: 'support@localpdf.online',
          emailContact: 'contact@localpdf.online',
          github: '🐛 Probleme auf GitHub melden',
          discussions: '💬 An GitHub-Diskussionen teilnehmen'
        }
      }
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
  
  // Tools section (for FAQ tools section compatibility)
  tools: {}
};