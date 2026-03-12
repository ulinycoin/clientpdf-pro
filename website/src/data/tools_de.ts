import { ICONS, type Category } from './tools';

export const CATEGORIES_DE: Category[] = [
    {
        name: "Inhalte bearbeiten",
        icon: "catEdit",
        tools: [
            { id: 'edit-text-pdf', name: 'Smart Editor', desc: 'Text ersetzen und Infos pixelgenau schwärzen.', icon: 'pen', hash: 'edit-text' },
            { id: 'add-text-pdf', name: 'Text hinzufügen', desc: 'Anmerkungen und Beschriftungen einfügen.', icon: 'type', hash: 'add-text' },
            { id: 'sign-pdf', name: 'E-Signatur', desc: 'Dokumente rechtssicher im privaten Sandbox signieren.', icon: 'feather', hash: 'sign' },
            { id: 'add-form-fields-pdf', name: 'Formularfelder', desc: 'Interaktive PDF-Formulare erstellen.', icon: 'fileInput', hash: 'add-form-fields' },
            { id: 'watermark-pdf', name: 'Wasserzeichen', desc: 'Sichere Stempel und Kopierschutz hinzufügen.', icon: 'stamp', hash: 'watermark' },
            { id: 'flatten-pdf', name: 'PDF glätten', desc: 'Ebenen zusammenführen und Formulare fixieren.', icon: 'layers', hash: 'flatten' }
        ]
    },
    {
        name: "Organisieren & Optimieren",
        icon: "catOrganize",
        tools: [
            { id: 'merge-pdf', name: 'PDF zusammenfügen', desc: 'Mehrere Dokumente zu einer Datei verbinden.', icon: 'files', hash: 'merge' },
            { id: 'split-pdf', name: 'PDF teilen', desc: 'Dokumente aufteilen oder Bereiche extrahieren.', icon: 'scissors', hash: 'split' },
            { id: 'compress-pdf', name: 'Komprimieren', desc: 'Dateigröße ohne Qualitätsverlust reduzieren.', icon: 'minimize', hash: 'compress' },
            { id: 'organize-pdf', name: 'Organisieren', desc: 'Seiten neu anordnen, drehen und verwalten.', icon: 'layout', hash: 'pages' },
            { id: 'rotate-pdf', name: 'Drehen', desc: 'Ausrichtung einzelner Seiten korrigieren.', icon: 'rotate', hash: 'rotate' },
            { id: 'delete-pages-pdf', name: 'Seiten löschen', desc: 'Unerwünschte Seiten sofort entfernen.', icon: 'trash', hash: 'delete-pages' },
            { id: 'extract-pages-pdf', name: 'Seiten extrahieren', desc: 'Neue PDFs aus ausgewählten Seiten erstellen.', icon: 'fileStack', hash: 'extract-pages' }
        ]
    },
    {
        name: "Daten & Konvertierung",
        icon: "catData",
        tools: [
            { id: 'tables-pdf', name: 'Tabellen Pro', desc: 'Excel/CSV in strukturierte PDF-Tabellen umwandeln.', icon: 'table', hash: 'tables' },
            { id: 'ocr-pdf', name: 'Smart OCR', desc: 'Text aus Scans mit Tesseract extrahieren.', icon: 'scanText', hash: 'ocr' },
            { id: 'pdf-to-word', name: 'PDF zu Word', desc: 'PDFs in bearbeitbare DOCX-Dateien umwandeln.', icon: 'fileText', hash: 'pdf-to-word' },
            { id: 'word-to-pdf', name: 'Word zu PDF', desc: 'PDFs aus Microsoft Word-Dokumenten erstellen.', icon: 'fileOutput', hash: 'word-to-pdf' },
            { id: 'images-to-pdf', name: 'Bilder zu PDF', desc: 'JPG/PNG in PDF-Dokumente konvertieren.', icon: 'images', hash: 'images-to-pdf' },
            { id: 'pdf-to-images', name: 'PDF zu Bilder', desc: 'Seiten als hochwertige Bilder speichern.', icon: 'image', hash: 'pdf-to-images' },
            { id: 'extract-images-pdf', name: 'Bilder extrahieren', desc: 'Alle Bilder aus einer PDF-Datei ziehen.', icon: 'extract', hash: 'extract-images' }
        ]
    },
    {
        name: "Sicherheit",
        icon: "catSecurity",
        tools: [
            { id: 'protect-pdf', name: 'PDF schützen', desc: 'Dokumente mit AES-256 Standard verschlüsseln.', icon: 'shield', hash: 'protect' }
        ]
    }
];
export const UI_LABELS_DE = {
    freeBadge: "Kostenlose Sandbox Beta",
    launchStudio: "LocalPDF öffnen",
    keyFeatures: "Hauptmerkmale",
    howItWorks: "So funktioniert es",
    privacyTitle: "Lokale private Verarbeitung:",
    privacyDesc: "Ihre Dateien bleiben während der Verarbeitung auf Ihrem Gerät. LocalPDF vermeidet einen upload-zentrierten Ablauf für zentrale PDF-Aufgaben.",
    faqHeader: "Häufig gestellte Fragen",
    techHeader: "Technische Architektur: So funktioniert es",
    relatedHeader: "Ähnliche PDF-Tools",
    viewAll: "Alle Tools anzeigen →",
    homeLabel: "Startseite",
    toolsLabel: "Tools",
    defaultFaqs: [
        {
            question: "Werden meine Dateien auf einen Server hochgeladen?",
            answer: "<strong>Niemals.</strong> Die gesamte Verarbeitung erfolgt zu 100% lokal in Ihrem Browser. Ihre Dateien bleiben auf Ihrem Gerät, was absolute Privatsphäre und Sicherheit garantiert."
        },
        {
            question: "Gibt es ein Limit für die Dateigröße?",
            answer: "Es gibt keine künstlichen Limits. Die einzige Einschränkung ist der verfügbare Arbeitsspeicher Ihres Geräts. Die meisten modernen Computer и Mobiltelefone können große PDF-Dateien problemlos verarbeiten."
        },
        {
            question: "Funktioniert es auf mobilen Geräten?",
            answer: "Ja. LocalPDF funktioniert auf Desktop- und Mobilgeräten in modernen Browsern. Bei großen Dateien hängen Leistung und Grenzen von Arbeitsspeicher und CPU des Geräts ab."
        }
    ],
    defaultTechInfo: [
        {
            title: "Zero-Knowledge-Architektur",
            description: "Unser System ist so konzipiert, dass Ihre Daten niemals von anderen gesehen werden. Die Verarbeitung erfolgt im sicheren Speicher des Browsers."
        },
        {
            title: "WebAssembly-Leistung",
            description: "Wir verwenden leistungsstarke WebAssembly-Module, um PDF-Verarbeitungsgeschwindigkeiten auf Desktop-Niveau direkt in Ihrem Webbrowser zu erreichen."
        }
    ]
};
