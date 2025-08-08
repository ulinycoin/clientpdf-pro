// src/locales/fr.ts
import { Translations } from '../types/i18n';

export const fr: Translations = {
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    close: 'Fermer',
    save: 'Enregistrer',
    download: 'Télécharger',
    upload: 'Téléverser',
    delete: 'Supprimer',
    clear: 'Effacer',
    preview: 'Aperçu',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    continue: 'Continuer',
    finish: 'Terminer',
    file: 'Fichier',
    files: 'Fichiers',
    size: 'Taille',
    name: 'Nom',
    type: 'Type',
    format: 'Format',
    quality: 'Qualité',
    pages: 'Pages',
    page: 'Page',
    processing: 'Traitement',
    processed: 'Traité',
    ready: 'Prêt',
    complete: 'Terminé',
    remove: 'Supprimer',
    clearAll: 'Tout effacer',
    or: 'ou',
  },

  header: {
    title: 'LocalPDF',
    subtitle: 'Outils PDF axés sur la confidentialité',
    navigation: {
      privacy: 'Confidentialité',
      faq: 'FAQ',
      github: 'GitHub',
    },
    badges: {
      tools: 'Outils PDF',
      private: '100% Privé',
      activeTools: 'Outils actifs',
      privateProcessing: '100% traitement privé',
    },
    mobileMenu: {
      toggle: 'Basculer le menu mobile',
      privacyPolicy: 'Politique de confidentialité',
      githubRepository: 'Dépôt GitHub',
    },
  },

  home: {
    hero: {
      title: 'LocalPDF',
      subtitle: 'Outils PDF axés sur la confidentialité',
      description: 'Outils de traitement PDF professionnels qui fonctionnent entièrement dans votre navigateur',
      descriptionSecondary: 'Pas de téléversements • Pas de suivi • Pas de limites • Complètement gratuit pour toujours',
      features: {
        privacy: {
          title: 'Vos fichiers ne quittent jamais votre appareil',
          subtitle: '100% traitement local',
        },
        speed: {
          title: 'Traitement ultra-rapide',
          subtitle: 'Aucun délai serveur',
        },
        free: {
          title: 'Complètement gratuit, sans limites',
          subtitle: 'Open source pour toujours',
        },
      },
      trustIndicators: {
        noRegistration: 'Aucune inscription requise',
        worksOffline: 'Fonctionne hors ligne',
        openSource: 'Open source',
      },
    },
    upload: {
      title: 'Commencez en quelques secondes',
      description: 'Téléversez vos fichiers PDF pour commencer le traitement, ou choisissez "Images vers PDF" pour convertir des images',
      dragDrop: 'Glissez et déposez les fichiers ici',
      selectFiles: 'Sélectionner les fichiers',
      maxSize: 'Taille max du fichier : 100MB',
      supportedFormats: 'Formats supportés : PDF',
      ready: 'Prêt pour le traitement',
      pdfDocument: 'Document PDF',
    },
    tools: {
      title: 'Boîte à outils PDF complète',
      subtitle: 'Choisissez l\'outil adapté à vos besoins. Toutes les opérations sont effectuées localement dans votre navigateur.',
      whyChoose: {
        title: 'Pourquoi choisir LocalPDF ?',
        description: 'Conçu avec un focus sur la confidentialité et les performances',
        stats: {
          tools: 'Outils PDF',
          toolsDesc: 'Boîte à outils complète',
          privacy: 'Confidentialité',
          privacyDesc: 'Traitement local',
          dataCollection: 'Collecte de données',
          dataCollectionDesc: 'Aucun suivi',
          usageLimits: 'Limites d\'utilisation',
          usageLimitsDesc: 'Gratuit pour toujours',
        },
        features: {
          noRegistration: 'Aucune inscription requise',
          fastProcessing: 'Traitement ultra-rapide',
          secureProcessing: 'Traitement sécurisé',
          worksOffline: 'Fonctionne hors ligne',
        },
      },
      trustMessage: 'Vos fichiers ne quittent jamais votre appareil',
    },
  },

  tools: {
    merge: {
      title: 'Fusionner PDFs',
      description: 'Combiner plusieurs fichiers PDF en un seul document',
    },
    split: {
      title: 'Diviser PDF',
      description: 'Diviser un PDF en pages séparées ou par plages',
    },
    compress: {
      title: 'Compresser PDF',
      description: 'Réduire la taille du fichier PDF tout en maintenant la qualité',
    },
    addText: {
      title: 'Ajouter du texte',
      description: 'Ajouter des annotations texte et des commentaires au PDF',
    },
    watermark: {
      title: 'Ajouter un filigrane',
      description: 'Ajouter des filigranes texte pour protéger les documents',
    },
    rotate: {
      title: 'Faire pivoter les pages',
      description: 'Faire pivoter les pages de 90, 180 ou 270 degrés',
    },
    extractPages: {
      title: 'Extraire des pages',
      description: 'Extraire des pages spécifiques dans un nouveau document',
    },
    extractText: {
      title: 'Extraire le texte',
      description: 'Extraire le contenu textuel des fichiers PDF',
    },
    split: {
      title: 'Diviser PDF',
      description: 'Diviser des PDF en pages ou plages séparées',
      pageTitle: 'Diviser des fichiers PDF gratuitement',
      pageDescription: 'Divisez des fichiers PDF par pages ou plages gratuitement. Extrayez des pages spécifiques de documents PDF. Division PDF privée et sécurisée dans votre navigateur.',
      uploadTitle: 'Téléverser un PDF à diviser',
      buttons: {
        startSplitting: 'Commencer la division',
      },
      seo: {
        title: 'Diviser des fichiers PDF gratuit - Extraire des pages en ligne | LocalPDF',
        description: 'Divisez des fichiers PDF par pages ou plages gratuitement. Extrayez des pages spécifiques de documents PDF. Division PDF privée et sécurisée dans votre navigateur.',
        keywords: 'diviser pdf, extraire pages pdf, extracteur de pages pdf, diviseur pdf gratuit, séparer pdf',
      },
      breadcrumbs: {
        home: 'Accueil',
        split: 'Diviser PDF',
      },
      howTo: {
        title: 'Comment diviser des fichiers PDF',
        steps: {
          upload: {
            title: 'Téléverser PDF',
            description: 'Cliquez sur "Choisir fichier" ou glissez-déposez votre document PDF dans la zone de téléversement.',
            icon: '📤',
          },
          configure: {
            title: 'Sélectionner les pages',
            description: 'Choisissez quelles pages extraire - pages individuelles, plages de pages ou sections multiples.',
            icon: '✂️',
          },
          download: {
            title: 'Télécharger les pages',
            description: 'Vos pages PDF divisées seront prêtes au téléchargement instantanément.',
            icon: '📥',
          },
        },
      },
      features: {
        title: 'Pourquoi choisir notre diviseur PDF ?',
        privacy: {
          title: '100% Privé',
          description: 'Votre PDF est traité localement dans votre navigateur. Aucun téléversement vers des serveurs, confidentialité complète garantie.',
        },
        fast: {
          title: 'Ultra-rapide',
          description: 'Division PDF instantanée avec notre moteur optimisé. Aucune attente pour les téléversements ou files de traitement.',
        },
        quality: {
          title: 'Haute qualité',
          description: 'Préservez la qualité et la mise en forme PDF d\'origine. Les pages divisées conservent une clarté et structure parfaites.',
        },
        free: {
          title: 'Complètement gratuit',
          description: 'Divisez des PDFs illimités gratuitement. Aucune inscription, aucun filigrane, aucune limitation cachée.',
        },
      },
      faqTitle: 'Questions fréquemment posées sur la division PDF',
    },
    pdfToImage: {
      title: 'PDF vers Images',
      description: 'Convertir les pages PDF en PNG ou JPEG',
    },
    imageToPdf: {
      title: 'Images vers PDF',
      description: 'Combiner plusieurs images en un document PDF',
    },
    wordToPdf: {
      title: 'Word vers PDF',
      description: 'Convertir des documents Word (.docx) au format PDF',
    },
    excelToPdf: {
      title: 'Excel vers PDF',
      description: 'Convertir des feuilles de calcul Excel (.xlsx, .xls) au format PDF',
      pageTitle: 'Convertisseur Excel vers PDF',
      pageDescription: 'Convertissez vos fichiers Excel (.xlsx, .xls) au format PDF avec prise en charge de plusieurs feuilles, tableaux larges et texte international. Tout le traitement se fait localement.',
      howToTitle: 'Comment convertir Excel vers PDF',
      uploadTitle: 'Télécharger un fichier Excel',
      uploadDescription: 'Sélectionnez votre fichier Excel (.xlsx ou .xls) depuis votre appareil. Les fichiers sont traités localement pour une confidentialité maximale.',
      configureTitle: 'Configurer les paramètres',
      configureDescription: 'Choisissez les feuilles à convertir, définissez l\'orientation et ajustez les options de formatage selon vos besoins.',
      downloadTitle: 'Télécharger le PDF',
      downloadDescription: 'Obtenez vos fichiers PDF convertis instantanément. Chaque feuille peut être sauvegardée comme PDF séparé ou combinée en un seul.',
      featuresTitle: 'Pourquoi choisir le convertisseur Excel LocalPDF ?',
      privacyTitle: '100% privé et sécurisé',
      privacyDescription: 'Vos fichiers Excel ne quittent jamais votre appareil. Toute la conversion se fait localement dans votre navigateur pour une confidentialité et sécurité maximales.',
      fastTitle: 'Traitement ultra-rapide',
      fastDescription: 'Convertissez les fichiers Excel en PDF instantanément sans attendre les téléchargements. Fonctionne même hors ligne.',
      multiFormatTitle: 'Support de multiples formats',
      multiFormatDescription: 'Fonctionne avec les fichiers .xlsx et .xls. Supporte plusieurs feuilles, formules complexes et texte international.',
      freeTitle: 'Complètement gratuit',
      freeDescription: 'Aucune limite, pas de filigrane, aucun frais caché. Convertissez un nombre illimité de fichiers Excel en PDF gratuitement, pour toujours.',
      // Tool component translations
      chooseExcelFile: 'Choisir un fichier Excel',
      dragDropSubtitle: 'Cliquez ici ou glissez-déposez vos feuilles de calcul Excel',
      supportedFormats: 'Supporte les fichiers Excel (.xlsx, .xls) jusqu\'à 100MB',
      multipleSheets: 'Support de plusieurs feuilles',
      complexFormulas: 'Formules complexes et formatage',
      internationalText: 'Texte international et langues',
      localProcessing: 'Le traitement se fait localement dans votre navigateur',
      conversionCompleted: 'Conversion terminée !',
      pdfReady: 'PDF prêt pour le téléchargement',
      multipleFiles: '{count} fichiers PDF générés',
      fileInformation: 'Informations sur le fichier',
      file: 'Fichier',
      size: 'Taille',
      sheets: 'Feuilles',
      languages: 'Langues',
      multiLanguageNote: 'Plusieurs langues détectées. Les polices appropriées seront chargées automatiquement.',
      chooseDifferentFile: 'Choisir un autre fichier',
      conversionSettings: 'Paramètres de conversion',
      selectSheets: 'Sélectionner les feuilles',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      rowsColumns: '{rows} lignes × {columns} colonnes',
      pageOrientation: 'Orientation de la page',
      portrait: 'Portrait',
      landscape: 'Paysage',
      pageSize: 'Taille de page',
      fontSize: 'Taille de police',
      outputFormat: 'Format de sortie',
      singlePdf: 'Un seul fichier PDF',
      separatePdfs: 'Fichiers PDF séparés',
      includeSheetNames: 'Inclure les noms des feuilles',
      convertToPdf: 'Convertir en PDF',
      converting: 'Conversion...',
      faqTitle: 'Questions fréquemment posées sur la conversion Excel vers PDF',
    },
    ocr: {
      title: 'Reconnaissance OCR',
      description: 'Extraire le texte des PDFs scannés et des images',
    },
  },

  errors: {
    fileNotSupported: 'Format de fichier non supporté',
    fileTooLarge: 'La taille du fichier dépasse la limite maximale',
    processingFailed: 'Le traitement a échoué. Veuillez réessayer.',
    noFilesSelected: 'Aucun fichier sélectionné',
    invalidFormat: 'Format de fichier invalide',
    networkError: 'Erreur réseau survenue',
    unknownError: 'Une erreur inconnue s\'est produite',
  },

  footer: {
    description: 'Fait avec ❤️ pour les utilisateurs soucieux de leur confidentialité dans le monde entier',
    links: {
      privacy: 'Confidentialité',
      faq: 'FAQ',
      github: 'GitHub',
    },
    copyright: 'Pas de suivi • Pas de publicité • Pas de collecte de données',
  },

  components: {
    relatedTools: {
      title: 'Outils PDF connexes',
      subtitle: 'Vous pourriez aussi vouloir :',
      viewAllTools: 'Voir tous les outils PDF',
      toolNames: {
        merge: 'Fusionner PDFs',
        split: 'Diviser PDFs',
        compress: 'Compresser PDFs',
        addText: 'Ajouter du texte',
        watermark: 'Ajouter un filigrane',
        rotate: 'Faire pivoter les pages',
        extractPages: 'Extraire des pages',
        extractText: 'Extraire le texte',
        pdfToImage: 'PDF vers Images',
        'word-to-pdf': 'Word vers PDF',
        'excel-to-pdf': 'Excel vers PDF',
        'images-to-pdf': 'Images vers PDF',
      },
      toolDescriptions: {
        merge: 'Combiner plusieurs fichiers PDF en un seul',
        split: 'Diviser un PDF en fichiers séparés',
        compress: 'Réduire la taille du fichier PDF',
        addText: 'Ajouter du texte et des annotations',
        watermark: 'Ajouter des filigranes pour protéger les PDFs',
        rotate: 'Faire pivoter les pages PDF',
        extractPages: 'Extraire des pages spécifiques',
        extractText: 'Obtenir le contenu textuel des PDFs',
        pdfToImage: 'Convertir PDF en images',
        'word-to-pdf': 'Convertir des documents Word en PDF',
        'excel-to-pdf': 'Convertir des feuilles Excel en PDF',
        'images-to-pdf': 'Convertir des images au format PDF',
      },
      actions: {
        merge: {
          split: 'diviser votre PDF fusionné',
          compress: 'compresser le fichier fusionné',
          extractPages: 'extraire des pages spécifiques',
        },
        split: {
          merge: 'refusionner les fichiers divisés',
          rotate: 'faire pivoter les pages divisées',
          extractPages: 'extraire plus de pages',
        },
        compress: {
          merge: 'fusionner les fichiers compressés',
          split: 'diviser le PDF compressé',
          watermark: 'ajouter des filigranes',
        },
        addText: {
          watermark: 'ajouter des filigranes',
          rotate: 'faire pivoter les pages annotées',
          extractText: 'extraire tout le texte',
        },
        watermark: {
          addText: 'ajouter plus de texte',
          compress: 'compresser le PDF avec filigrane',
          rotate: 'faire pivoter les pages avec filigrane',
        },
        rotate: {
          addText: 'ajouter du texte aux pages pivotées',
          watermark: 'ajouter des filigranes',
          split: 'diviser le PDF pivoté',
        },
        extractPages: {
          merge: 'fusionner les pages extraites',
          rotate: 'faire pivoter les pages extraites',
          pdfToImage: 'convertir les pages en images',
        },
        extractText: {
          addText: 'ajouter plus de texte',
          extractPages: 'extraire des pages spécifiques',
          pdfToImage: 'convertir en images',
        },
        pdfToImage: {
          extractPages: 'extraire plus de pages',
          extractText: 'obtenir le contenu textuel',
          rotate: 'pivoter avant conversion',
        },
        'excel-to-pdf': {
          'word-to-pdf': 'convertir documents en PDF',
          'images-to-pdf': 'convertir images en PDF',
          merge: 'fusionner plusieurs PDF',
        },
      },
    },
    fileUploadZone: {
      dropActive: 'Déposer les fichiers ici',
      chooseFiles: 'Choisir des fichiers PDF',
      dragAndDrop: 'Glissez et déposez les fichiers ici ou cliquez pour sélectionner',
      maxFileSize: 'Max {size} par fichier',
      selectFiles: 'Sélectionner fichiers',
      trustFeatures: {
        private: '100% Privé',
        fast: 'Rapide',
        free: 'Gratuit',
      },
      trustMessage: 'Les fichiers ne quittent jamais votre appareil • Le traitement se fait localement dans le navigateur',
      alerts: {
        unsupportedFiles: '{count} fichier(s) ignoré(s) en raison d\'un format non supporté. Formats supportés : {formats}',
        fileLimit: 'Seuls les {count} premiers fichiers ont été sélectionnés.',
      },
      accessibility: {
        uploadArea: 'Zone de téléversement de fichiers - cliquez pour sélectionner des fichiers ou glissez-déposez',
        selectFiles: 'Sélectionner les fichiers à téléverser',
      },
    },
  },

  pages: {
    privacy: {
      title: 'Politique de confidentialité',
      subtitle: 'Votre confidentialité est notre priorité absolue',
      lastUpdated: 'Dernière mise à jour : 20 juillet 2025',
      sections: {
        commitment: {
          title: 'Notre engagement de confidentialité',
          content: 'LocalPDF est conçu avec la confidentialité comme fondement. Nous croyons que vos documents et données devraient rester les vôtres et seulement les vôtres. Cette Politique de confidentialité explique comment LocalPDF protège votre vie privée et assure que vos données ne quittent jamais votre appareil.'
        },
        simpleAnswer: {
          title: 'La réponse simple',
          main: 'LocalPDF ne collecte pas, ne stocke pas, ne transmet pas ou n\'a pas accès à vos données, fichiers ou informations personnelles.',
          sub: 'Tout le traitement PDF se fait entièrement dans votre navigateur web. Vos fichiers ne quittent jamais votre appareil.'
        },
        whatWeDont: {
          title: 'Ce que nous ne faisons PAS',
          noDataCollection: {
            title: 'Aucune collecte de données',
            items: ['Aucune information personnelle', 'Aucun suivi d\'utilisation', 'Aucun cookie analytique', 'Aucun compte utilisateur']
          },
          noFileAccess: {
            title: 'Aucun accès aux fichiers',
            items: ['Aucun téléversement sur serveur', 'Aucun stockage de fichiers', 'Aucune copie de documents', 'Aucun historique de traitement']
          }
        },
        howItWorks: {
          title: 'Comment fonctionne LocalPDF',
          clientSide: {
            title: 'Traitement côté client',
            description: 'Toutes les opérations PDF se déroulent directement dans votre navigateur web en utilisant :',
            items: ['Bibliothèques JavaScript PDF (pdf-lib, PDF.js, jsPDF)', 'Web Workers pour l\'optimisation des performances', 'Mémoire locale pour le traitement temporaire', 'Exclusivement les ressources de votre appareil']
          },
          process: {
            title: 'Le processus complet',
            steps: [
              'Vous sélectionnez un fichier PDF depuis votre appareil',
              'Le fichier se charge dans la mémoire du navigateur (jamais téléversé)',
              'Le traitement se fait localement avec JavaScript',
              'Le résultat est généré dans votre navigateur',
              'Vous téléchargez le fichier traité directement',
              'Toutes les données sont effacées de la mémoire quand vous fermez la page'
            ]
          }
        },
        analytics: {
          title: 'Analytique axée sur la confidentialité',
          description: 'LocalPDF utilise Vercel Analytics pour comprendre comment nos outils sont utilisés et améliorer l\'expérience utilisateur. Notre approche analytique maintient notre philosophie de confidentialité d\'abord :',
          whatWeTrack: {
            title: 'Ce que nous suivons (anonymement)',
            items: ['Visites de pages - quels outils sont les plus populaires', 'Utilisation des outils - métriques de base comme le nombre de fichiers traités', 'Données de performance - temps de chargement et erreurs', 'Localisation générale - pays/région seulement (pour l\'optimisation des langues)']
          },
          protections: {
            title: 'Protections de la confidentialité',
            items: ['Aucun cookie - l\'analytique fonctionne sans cookies de suivi', 'Aucune donnée personnelle - nous ne voyons jamais vos fichiers ou informations personnelles', 'Anonymisation IP - votre adresse IP exacte n\'est jamais stockée', 'DNT respecté - nous honorons les paramètres "Do Not Track" du navigateur', 'Conforme RGPD - toute l\'analytique est conforme aux réglementations de confidentialité']
          }
        },
        compliance: {
          title: 'Conformité internationale de confidentialité',
          gdpr: {
            title: 'RGPD',
            description: 'Entièrement conforme - aucune donnée personnelle traitée'
          },
          ccpa: {
            title: 'CCPA',
            description: 'Conforme - aucune collecte ou vente de données'
          },
          global: {
            title: 'Global',
            description: 'La conception axée sur la confidentialité assure la conformité mondiale'
          }
        },
        summary: {
          title: 'Résumé',
          main: 'LocalPDF est conçu pour être complètement privé par défaut. Vos fichiers, données et confidentialité sont protégés parce que nous ne collectons, stockons ou transmettons simplement aucune de vos informations.',
          sub: 'Ce n\'est pas juste une promesse de politique - c\'est intégré dans l\'architecture fondamentale de comment LocalPDF fonctionne.'
        }
      }
    },
    faq: {
      title: 'Questions fréquemment posées',
      subtitle: 'Tout ce que vous devez savoir sur LocalPDF',
      sections: {
        general: {
          title: 'Questions générales',
          questions: {
            whatIs: {
              question: 'Qu\'est-ce que LocalPDF ?',
              answer: 'LocalPDF est une application web gratuite, axée sur la confidentialité, qui fournit 12 outils PDF puissants pour fusionner, diviser, compresser, éditer et convertir des fichiers PDF. Tout le traitement se fait entièrement dans votre navigateur - pas de téléversements, pas d\'inscription, pas de suivi.'
            },
            free: {
              question: 'LocalPDF est-il vraiment gratuit ?',
              answer: 'Oui ! LocalPDF est complètement gratuit à utiliser sans limitations, publicités ou frais cachés. Nous croyons que les outils PDF essentiels devraient être accessibles à tous.'
            },
            account: {
              question: 'Dois-je créer un compte ?',
              answer: 'Aucun compte requis ! Visitez simplement LocalPDF et commencez à utiliser n\'importe quel outil immédiatement.'
            }
          }
        },
        privacy: {
          title: 'Confidentialité et sécurité',
          questions: {
            uploaded: {
              question: 'Mes fichiers sont-ils téléversés sur vos serveurs ?',
              answer: 'Non ! C\'est la fonctionnalité principale de LocalPDF - tout le traitement se fait dans votre navigateur. Vos fichiers ne quittent jamais votre appareil. Nous ne pouvons pas voir, accéder ou stocker vos documents.'
            },
            afterUse: {
              question: 'Qu\'arrive-t-il à mes fichiers après avoir utilisé LocalPDF ?',
              answer: 'Vos fichiers sont traités dans la mémoire de votre navigateur et automatiquement effacés quand vous fermez la page ou naviguez ailleurs. Rien n\'est stocké de façon permanente.'
            },
            confidential: {
              question: 'LocalPDF est-il sûr pour les documents confidentiels ?',
              answer: 'Oui ! Puisque tout le traitement est local et nous ne collectons aucune donnée, LocalPDF est idéal pour les documents confidentiels, sensibles ou privés.'
            }
          }
        },
        technical: {
          title: 'Questions techniques',
          questions: {
            browsers: {
              question: 'Quels navigateurs supportent LocalPDF ?',
              answer: 'LocalPDF fonctionne sur tous les navigateurs modernes :',
              browsers: ['Chrome 90+', 'Firefox 90+', 'Safari 14+', 'Edge 90+']
            },
            fileSize: {
              question: 'Quelle est la taille maximale de fichier que je peux traiter ?',
              answer: 'LocalPDF peut gérer des fichiers jusqu\'à 100MB. Pour de très gros fichiers, le traitement peut prendre plus de temps selon les performances de votre appareil.'
            },
            offline: {
              question: 'LocalPDF fonctionne-t-il hors ligne ?',
              answer: 'Oui ! Après votre première visite, LocalPDF fonctionne hors ligne. Votre navigateur met en cache l\'application, donc vous pouvez l\'utiliser sans connexion internet.'
            }
          }
        },
        tools: {
          title: 'Outils PDF',
          editText: {
            question: 'Puis-je éditer le texte existant dans les PDF ?',
            answer: 'Actuellement, LocalPDF permet d\'ajouter du nouveau texte aux PDF mais pas d\'éditer le texte existant. Vous pouvez ajouter des superpositions de texte, signatures, notes et annotations.'
          }
        },
        support: {
          title: 'Besoin d\'aide ?',
          gettingSupport: {
            title: 'Obtenir de l\'aide',
            items: ['GitHub Issues : Problèmes techniques et rapports de bugs', 'GitHub Discussions : Questions générales et aide communautaire', 'Documentation : Guides complets et tutoriels']
          },
          contact: {
            title: 'Informations de contact',
            github: 'Signaler des problèmes sur GitHub',
            discussions: 'Rejoindre les discussions communautaires'
          }
        }
      }
    },
    notFound: {
      title: 'Page non trouvée',
      description: 'La page que vous cherchez n\'existe pas.',
      backHome: 'Retour à l\'accueil',
    },
    tools: {
      merge: {
        pageTitle: 'Fusionner des fichiers PDF gratuitement',
        pageDescription: 'Combinez plusieurs fichiers PDF en un seul document gratuitement. Fusion PDF rapide, sécurisée et privée dans votre navigateur. Pas de téléversements, pas d\'inscription requise.',
        uploadTitle: 'Téléverser des fichiers PDF à fusionner',
        buttons: {
          remove: 'Supprimer',
          startMerging: 'Commencer la fusion ({count} fichiers)',
        },
        features: {
          title: 'Pourquoi choisir l\'outil de fusion LocalPDF ?',
          private: {
            title: '🔒 100% Privé',
            description: 'Vos fichiers ne quittent jamais votre appareil. Tout le traitement se fait localement dans votre navigateur pour une confidentialité et une sécurité maximales.',
          },
          fast: {
            title: '⚡ Ultra-rapide',
            description: 'Fusionnez des PDFs instantanément avec notre moteur de traitement optimisé. Pas d\'attente pour les téléversements ou téléchargements depuis les serveurs.',
          },
          free: {
            title: '🆓 Complètement gratuit',
            description: 'Pas de limites, pas de filigranes, pas de frais cachés. Fusionnez des fichiers PDF illimités gratuitement, pour toujours.',
          },
        },
        howTo: {
          title: 'Comment fusionner des fichiers PDF',
          steps: {
            upload: {
              title: 'Téléverser des fichiers PDF',
              description: 'Cliquez sur "Choisir des fichiers" ou glissez et déposez plusieurs fichiers PDF dans la zone de téléversement.',
            },
            arrange: {
              title: 'Organiser l\'ordre',
              description: 'Glissez et déposez les fichiers pour les réorganiser. Le PDF final suivra cet ordre.',
            },
            download: {
              title: 'Fusionner et télécharger',
              description: 'Cliquez sur "Fusionner les PDFs" et votre PDF combiné sera prêt à télécharger instantanément.',
            },
          },
        },
      },
      compress: {
        pageTitle: 'Compresser des fichiers PDF gratuitement',
        pageDescription: 'Compressez des fichiers PDF pour réduire la taille sans perte de qualité. Outil gratuit de compression PDF qui fonctionne dans votre navigateur avec des paramètres de qualité personnalisables.',
        uploadTitle: 'Téléverser un PDF à compresser',
        uploadSubtitle: 'Sélectionnez un fichier PDF pour réduire sa taille',
        buttons: {
          uploadDifferent: '← Téléverser un PDF différent',
        },
        features: {
          title: '✨ Caractéristiques clés :',
          items: {
            qualitySettings: '• Paramètres de qualité ajustables (10% - 100%)',
            imageOptimization: '• Optimisation de la compression d\'images',
            removeMetadata: '• Supprimer les métadonnées pour des fichiers plus petits',
            webOptimization: '• Optimisation web pour un chargement plus rapide',
          },
        },
        privacy: {
          title: '🔒 Confidentialité et sécurité :',
          items: {
            clientSide: '• 100% de traitement côté client',
            noUploads: '• Aucun téléversement de fichiers vers les serveurs',
            localProcessing: '• Vos données ne quittent jamais votre appareil',
            instantProcessing: '• Traitement et téléchargement instantanés',
          },
        },
        benefits: {
          title: 'Pourquoi choisir notre compresseur PDF ?',
          smart: {
            title: 'Compression intelligente',
            description: 'Des algorithmes avancés réduisent la taille du fichier tout en préservant la qualité du document et la lisibilité',
          },
          control: {
            title: 'Contrôle total',
            description: 'Ajustez les niveaux de qualité, la compression d\'images et l\'optimisation web selon vos besoins',
          },
          private: {
            title: '100% Privé',
            description: 'Vos PDFs sont traités localement dans votre navigateur - jamais téléversés nulle part',
          },
        },
        howTo: {
          title: 'Comment fonctionne la compression PDF',
          steps: {
            upload: {
              title: 'Téléverser le PDF',
              description: 'Glissez votre fichier PDF ou cliquez pour parcourir',
            },
            settings: {
              title: 'Ajuster les paramètres',
              description: 'Choisissez le niveau de qualité et les options de compression',
            },
            compress: {
              title: 'Compresser',
              description: 'Regardez le progrès en temps réel pendant que le fichier est optimisé',
            },
            download: {
              title: 'Télécharger',
              description: 'Obtenez votre PDF compressé avec une taille de fichier réduite',
            },
          },
        },
        technical: {
          title: 'Techniques de compression',
          compressed: {
            title: 'Ce qui est compressé :',
            images: '• **Images :** Compression JPEG avec contrôle de qualité',
            fonts: '• **Polices :** Sous-ensemble de caractères inutilisés et optimisation d\'encodage',
            streams: '• **Flux :** Supprimer les données redondantes et compresser le contenu',
            metadata: '• **Métadonnées :** Suppression optionnelle des infos de création et propriétés',
          },
          quality: {
            title: 'Qualité vs. taille :',
            high: '• **90-100% :** Qualité quasi sans perte, compression modérée',
            good: '• **70-90% :** Bonne qualité, réduction significative de la taille',
            acceptable: '• **50-70% :** Qualité acceptable, compression maximale',
            low: '• **Moins de 50% :** Perte notable de qualité, fichiers les plus petits',
          },
        },
      },
      imageToPdf: {
        seo: {
          title: 'Convertisseur d\'Images en PDF - Outil en Ligne Gratuit | LocalPDF',
          description: 'Convertissez plusieurs images (JPEG, PNG, GIF, WebP) au format PDF instantanément. Convertisseur d\'image en PDF respectueux de la confidentialité qui fonctionne entièrement dans votre navigateur.',
        },
        breadcrumbs: {
          home: 'Accueil',
          imageToPdf: 'Images vers PDF',
        },
        pageTitle: 'Convertisseur d\'Images en PDF',
        pageDescription: 'Convertissez plusieurs images en un seul document PDF avec des options de mise en page personnalisables. Prend en charge les formats JPEG, PNG, GIF et WebP avec une protection complète de la confidentialité.',
        uploadSection: {
          title: 'Déposez les images ici ou cliquez pour parcourir',
          subtitle: 'Combinez plusieurs images en un seul document PDF',
          supportedFormats: 'JPEG, PNG, GIF, WebP',
        },
        tool: {
          title: 'Convertisseur d\'Images en PDF',
          description: 'Combinez plusieurs images en un seul document PDF avec des options de mise en page personnalisées',
          selectedImages: 'Images Sélectionnées ({count})',
          clearAll: 'Tout Effacer',
          pdfSettings: 'Paramètres PDF',
          pageSize: 'Taille de Page',
          pageSizeOptions: {
            a4: 'A4 (210 × 297 mm)',
            letter: 'Letter (8.5 × 11 pouces)',
            auto: 'Auto (ajuster le contenu)'
          },
          orientation: 'Orientation',
          orientationOptions: {
            portrait: 'Portrait',
            landscape: 'Paysage'
          },
          imageLayout: 'Mise en Page d\'Image',
          layoutOptions: {
            fitToPage: 'Ajuster à la page',
            actualSize: 'Taille réelle',
            fitWidth: 'Ajuster à la largeur',
            fitHeight: 'Ajuster à la hauteur'
          },
          imageQuality: 'Qualité d\'Image ({quality}%)',
          qualitySlider: {
            lowerSize: 'Taille réduite',
            higherQuality: 'Qualité supérieure'
          },
          pageMargin: 'Marge de Page ({margin} pouce)',
          marginSlider: {
            noMargin: 'Sans marge',
            twoInch: '2 pouces'
          },
          background: 'Arrière-plan',
          backgroundOptions: {
            white: 'Blanc',
            lightGray: 'Gris clair',
            gray: 'Gris',
            black: 'Noir'
          },
          fileInfo: '{count} image{plural} sélectionnée{plural} • Taille totale : {size}',
          converting: 'Conversion des images en PDF... {progress}%',
          buttons: {
            reset: 'Réinitialiser',
            createPdf: 'Créer PDF',
            converting: 'Conversion...'
          },
          help: {
            title: 'Comment Utiliser Images en PDF',
            dragDrop: 'Glissez simplement vos images dans la zone de téléchargement ou cliquez pour parcourir',
            formats: 'Prend en charge les formats d\'images JPEG, PNG, GIF et WebP',
            layout: 'Choisissez la taille de page, l\'orientation et comment les images s\'adaptent sur chaque page',
            quality: 'Ajustez la qualité d\'image pour équilibrer la taille du fichier et la qualité visuelle',
            privacy: 'Tout le traitement se fait localement - vos images ne quittent jamais votre appareil'
          }
        },
        features: {
          title: 'Pourquoi choisir notre convertisseur d\'images en PDF ?',
          private: {
            title: '100% Privé',
            description: 'Tout le traitement d\'images se fait localement dans votre navigateur. Vos images ne quittent jamais votre appareil.',
          },
          formats: {
            title: 'Formats multiples',
            description: 'Support des formats d\'image JPEG, PNG, GIF et WebP avec conversion de haute qualité.',
          },
          customizable: {
            title: 'Personnalisable',
            description: 'Contrôlez la taille de page, l\'orientation, la mise en page des images, la qualité et les marges pour des résultats parfaits.',
          },
          fast: {
            title: 'Traitement rapide',
            description: 'Conversion ultra-rapide alimentée par la technologie de navigateur moderne. Pas d\'attente pour les téléversements.',
          },
          free: {
            title: 'Complètement gratuit',
            description: 'Pas d\'inscription, pas de limites, pas de filigranes. Utilisez notre outil autant de fois que nécessaire.',
          },
          crossPlatform: {
            title: 'Multi-plateforme',
            description: 'Fonctionne sur n\'importe quel appareil avec un navigateur moderne. Ordinateur, tablette ou mobile - nous vous couvrons.',
          },
        },
        howTo: {
          title: 'Comment convertir des images en PDF',
          steps: {
            upload: {
              title: 'Téléverser des images',
              description: 'Glissez et déposez vos images ou cliquez pour parcourir. Sélectionnez plusieurs images au format JPEG, PNG, GIF ou WebP.',
            },
            customize: {
              title: 'Personnaliser les paramètres',
              description: 'Choisissez la taille de page, l\'orientation, la mise en page des images, la qualité et les marges pour créer le PDF parfait.',
            },
            download: {
              title: 'Télécharger le PDF',
              description: 'Cliquez sur "Créer PDF" et votre document converti sera prêt à télécharger en quelques secondes.',
            },
          },
        },
      },
      wordToPdf: {
        seo: {
          title: 'Convertisseur Word en PDF - Convertir DOCX en PDF en Ligne Gratuit | LocalPDF',
          description: 'Convertissez des documents Word (.docx) au format PDF gratuitement. Conversion Word en PDF rapide, sécurisée et privée qui fonctionne entièrement dans votre navigateur.',
          keywords: 'word en pdf, docx en pdf, convertir word en pdf, convertisseur de documents, convertisseur pdf gratuit',
          structuredData: {
            name: 'Convertisseur Word en PDF',
            description: 'Convertir des documents Word (.docx) au format PDF en ligne gratuitement',
            permissions: 'Aucun téléversement de fichier requis',
          },
        },
        breadcrumbs: {
          home: 'Accueil',
          wordToPdf: 'Word en PDF',
        },
        pageTitle: 'Convertisseur Word en PDF',
        pageDescription: 'Convertissez vos documents Word (.docx) au format PDF rapidement et en toute sécurité. Tout le traitement se fait localement dans votre navigateur - aucun téléversement de fichier requis.',
        howTo: {
          title: 'Comment convertir Word en PDF',
          steps: {
            choose: {
              title: 'Choisir le fichier',
              description: 'Sélectionnez votre document Word (fichier .docx)',
            },
            convert: {
              title: 'Convertir',
              description: 'La conversion automatique commence immédiatement',
            },
            download: {
              title: 'Télécharger',
              description: 'Votre fichier PDF se télécharge automatiquement',
            },
          },
        },
        features: {
          title: 'Pourquoi choisir notre convertisseur Word en PDF ?',
          privacy: {
            title: '🔒 Confidentialité d\'abord',
            description: 'Vos documents ne quittent jamais votre appareil. Toute la conversion se fait localement dans votre navigateur.',
          },
          fast: {
            title: '⚡ Rapide et gratuit',
            description: 'Conversion instantanée sans limites de taille de fichier ou filigranes. Complètement gratuit à utiliser.',
          },
          compatible: {
            title: '📱 Fonctionne partout',
            description: 'Compatible avec tous les appareils et navigateurs. Aucune installation de logiciel requise.',
          },
          quality: {
            title: '✨ Haute qualité',
            description: 'Préserve le formatage original, les polices et la mise en page pour des résultats professionnels.',
          },
        },
      },
      ocr: {
        seo: {
          title: 'Reconnaissance de Texte OCR - Extraire du Texte PDF et Images | LocalPDF',
          description: 'Extrayez du texte de fichiers PDF et d\'images grâce à la technologie OCR avancée. Support amélioré pour le russe et 10+ autres langues avec protection complète de la confidentialité.',
          keywords: 'OCR, reconnaissance de texte, PDF vers texte, image vers texte, extraire texte, OCR russe, Tesseract',
        },
        breadcrumbs: {
          home: 'Accueil',
          ocr: 'Reconnaissance de Texte OCR',
        },
        pageTitle: 'Reconnaissance de Texte OCR',
        pageDescription: 'Extrayez du texte de fichiers PDF et d\'images grâce à la technologie OCR avancée. Support amélioré pour le russe et 10+ autres langues avec détection automatique.',
        features: {
          private: {
            title: '100% Privé',
            description: 'Tout le traitement se fait dans votre navigateur',
          },
          russian: {
            title: 'Support Russe',
            description: 'Reconnaissance améliorée pour le texte cyrillique',
          },
          fast: {
            title: 'Rapide et Précis',
            description: 'Technologie Tesseract.js avancée',
          },
        },
        languages: {
          title: 'Langues Supportées',
          items: {
            russian: 'Russe',
            english: 'Anglais',
            german: 'Allemand',
            french: 'Français',
            spanish: 'Espagnol',
            italian: 'Italien',
            polish: 'Polonais',
            ukrainian: 'Ukrainien',
            dutch: 'Néerlandais',
            portuguese: 'Portugais',
          },
        },
      },
      extractPages: {
        pageTitle: 'Extraire les Pages PDF Gratuitement',
        pageDescription: 'Extrayez des pages spécifiques de documents PDF gratuitement. Créez de nouveaux PDF à partir des pages sélectionnées avec un contrôle total sur la sélection des pages.',
        uploadTitle: 'Téléverser PDF pour Extraire les Pages',
        uploadSubtitle: 'Sélectionnez un fichier PDF pour extraire des pages spécifiques',
        buttons: {
          uploadDifferent: '← Téléverser un PDF Différent',
        },
        features: {
          title: '✨ Caractéristiques Clés :',
          items: {
            individual: '• Extraire des pages individuelles ou des plages de pages',
            custom: '• Sélection de pages personnalisée (ex. "1-5, 8, 10-12")',
            preview: '• Aperçu visuel et sélection des pages',
            quality: '• Préserver la qualité PDF originale',
          },
        },
        privacy: {
          title: '🔒 Confidentialité et Sécurité :',
          items: {
            clientSide: '• 100% de traitement côté client',
            noUploads: '• Aucun téléversement de fichiers vers les serveurs',
            localProcessing: '• Vos données ne quittent jamais votre appareil',
            instantProcessing: '• Traitement et téléchargement instantanés',
          },
        },
        benefits: {
          title: 'Pourquoi Choisir Notre Extracteur de Pages PDF ?',
          fast: {
            title: 'Ultra Rapide',
            description: 'Extrayez les pages instantanément avec notre traitement optimisé basé sur le navigateur',
          },
          precise: {
            title: 'Contrôle Précis',
            description: 'Sélectionnez exactement les pages dont vous avez besoin avec nos outils de sélection intuitifs',
          },
          private: {
            title: '100% Privé',
            description: 'Vos PDF sont traités localement dans votre navigateur - jamais téléversés nulle part',
          },
        },
        howTo: {
          title: 'Comment Extraire les Pages PDF',
          steps: {
            upload: {
              title: 'Téléverser PDF',
              description: 'Glissez votre fichier PDF ou cliquez pour parcourir',
            },
            select: {
              title: 'Sélectionner les Pages',
              description: 'Choisissez des pages individuelles ou des plages',
            },
            extract: {
              title: 'Extraire',
              description: 'Cliquez sur extraire pour traiter votre sélection',
            },
            download: {
              title: 'Télécharger',
              description: 'Obtenez votre nouveau PDF avec les pages sélectionnées',
            },
          },
        },
      },
      extractText: {
        pageTitle: 'Extraire le Texte du PDF Gratuitement',
        pageDescription: 'Extrayez le contenu textuel de fichiers PDF gratuitement. Obtenez du texte brut à partir de documents PDF avec un formatage intelligent. Extraction de texte axée sur la confidentialité dans votre navigateur.',
        steps: {
          upload: 'Étape 1 : Téléversez votre fichier PDF',
          choose: 'Étape 2 : Choisissez les options d\'extraction (formatage intelligent recommandé)',
          download: 'Étape 3 : Téléchargez le texte extrait en tant que fichier .txt',
        },
        tool: {
          title: 'Extraire le Texte',
          description: 'Extrayez et formatez intelligemment le contenu textuel de vos PDF',
          fileToExtract: 'Fichier pour extraire le texte :',
          extractionOptions: 'Options d\'Extraction :',
          smartFormatting: 'Activer le Formatage Intelligent (Recommandé)',
          smartFormattingDesc: 'Nettoyer automatiquement le texte, corriger les sauts de ligne, détecter les titres et améliorer la lisibilité',
          formattingLevel: 'Niveau de Formatage :',
          levels: {
            minimal: {
              title: 'Minimal',
              desc: 'Nettoyage de base - fusionner les mots cassés, supprimer les espaces supplémentaires'
            },
            standard: {
              title: 'Standard',
              desc: 'Recommandé - paragraphes, titres, listes, formatage propre'
            },
            advanced: {
              title: 'Avancé',
              desc: 'Maximum - toutes les fonctionnalités plus détection de structure améliorée'
            }
          },
          includeMetadata: 'Inclure les métadonnées du document (titre, auteur, date de création)',
          preserveFormatting: 'Préserver le formatage des pages (inclure les numéros de page et séparateurs)',
          pageRange: 'Extraire une plage de pages spécifique (par défaut : toutes les pages)',
          pageRangeFields: {
            startPage: 'Page de Début',
            endPage: 'Page de Fin',
            note: 'Laissez la page de fin vide ou égale à la page de début pour extraire une seule page'
          },
          extracting: 'Extraction du texte... {progress}%',
          success: {
            title: 'Extraction de Texte Terminée !',
            pagesProcessed: 'Pages traitées : {count}',
            textLength: 'Longueur du texte : {length} caractères',
            documentTitle: 'Titre du document : {title}',
            author: 'Auteur : {author}',
            smartFormattingApplied: 'Formatage Intelligent Appliqué ({level})',
            fileDownloaded: 'Fichier automatiquement téléchargé en .txt',
            noTextWarning: 'Ce PDF peut contenir des images scannées sans texte extractible',
            comparisonPreview: 'Aperçu des Améliorations de Formatage :',
            before: 'Avant (Brut) :',
            after: 'Après (Formaté Intelligemment) :',
            notice: '↑ Remarquez le formatage amélioré, les mots fusionnés et la meilleure structure !',
            textPreview: 'Aperçu du Texte Extrait :'
          },
          infoBox: {
            title: 'Extraction de Texte Intelligente',
            description: 'Utilisation de PDF.js avec formatage intelligent pour extraire un texte propre et lisible. Le formatage intelligent corrige automatiquement les problèmes courants du texte PDF comme les mots cassés, les sauts de ligne désordonnés et la mauvaise structure.'
          },
          privacy: {
            title: 'Confidentialité et Sécurité',
            description: 'L\'extraction et le formatage du texte se font localement dans votre navigateur. Le contenu de votre PDF ne quitte jamais votre appareil, assurant une confidentialité et sécurité complètes.'
          },
          buttons: {
            extractText: 'Extraire le Texte',
            extracting: 'Extraction du Texte...'
          }
        }
      },
      addText: {
        pageTitle: 'Ajouter du Texte au PDF Gratuitement',
        pageDescription: 'Ajoutez du texte personnalisé aux fichiers PDF gratuitement. Insérez du texte, des signatures et des annotations. Éditeur de texte PDF axé sur la confidentialité qui fonctionne dans votre navigateur.',
        steps: {
          upload: 'Étape 1 : Téléversez votre fichier PDF',
          click: 'Étape 2 : Cliquez sur le PDF pour ajouter du texte',
          save: 'Étape 3 : Enregistrez votre PDF modifié',
        },
      },
      rotate: {
        pageTitle: 'Faire Pivoter les Pages PDF Gratuitement',
        pageDescription: 'Faites pivoter les pages PDF de 90°, 180° ou 270° gratuitement. Corrigez l\'orientation des documents rapidement et facilement avec notre outil de rotation PDF basé sur le navigateur.',
        uploadTitle: 'Téléverser PDF pour Faire Pivoter les Pages',
        uploadSubtitle: 'Sélectionnez un fichier PDF pour faire pivoter ses pages',
        buttons: {
          uploadDifferent: '← Téléverser un PDF Différent',
        },
        features: {
          title: '✨ Caractéristiques Clés :',
          items: {
            angles: '• Faire pivoter les pages de 90°, 180° ou 270°',
            selection: '• Faire pivoter toutes les pages ou sélectionner des pages spécifiques',
            preview: '• Prévisualiser les pages avant de les faire pivoter',
            quality: '• Préserver la qualité PDF originale',
          },
        },
        privacy: {
          title: '🔒 Confidentialité et Sécurité :',
          items: {
            clientSide: '• 100% de traitement côté client',
            noUploads: '• Aucun téléversement de fichiers vers les serveurs',
            localProcessing: '• Vos données ne quittent jamais votre appareil',
            instantProcessing: '• Traitement et téléchargement instantanés',
          },
        },
        benefits: {
          title: 'Pourquoi Choisir Notre Rotateur de Pages PDF ?',
          instant: {
            title: 'Rotation Instantanée',
            description: 'Faites pivoter les pages instantanément avec notre traitement optimisé basé sur le navigateur',
          },
          precise: {
            title: 'Contrôle Précis',
            description: 'Choisissez des angles de rotation exacts et sélectionnez des pages spécifiques à faire pivoter',
          },
          private: {
            title: '100% Privé',
            description: 'Vos PDF sont traités localement dans votre navigateur - jamais téléversés nulle part',
          },
        },
        howTo: {
          title: 'Comment Faire Pivoter les Pages PDF',
          steps: {
            upload: {
              title: 'Téléverser PDF',
              description: 'Glissez votre fichier PDF ou cliquez pour parcourir',
            },
            select: {
              title: 'Sélectionner les Pages',
              description: 'Choisissez quelles pages faire pivoter',
            },
            angle: {
              title: 'Choisir l\'Angle',
              description: 'Sélectionnez la rotation : 90°, 180° ou 270°',
            },
            download: {
              title: 'Télécharger',
              description: 'Obtenez votre PDF avec les pages pivotées',
            },
          },
        },
      },
      watermark: {
        pageTitle: 'Ajouter un Filigrane au PDF Gratuitement',
        pageDescription: 'Ajoutez des filigranes de texte ou d\'image aux fichiers PDF gratuitement. Protégez vos documents avec des filigranes personnalisés. Filigrane PDF sécurisé dans votre navigateur.',
        steps: {
          upload: 'Étape 1 : Téléversez votre fichier PDF',
          configure: 'Étape 2 : Configurez les paramètres du filigrane',
          download: 'Étape 3 : Téléchargez votre PDF avec filigrane',
        },
      },
      pdfToImage: {
        pageTitle: 'Convertir PDF en Images Gratuitement',
        pageDescription: 'Convertissez les pages PDF en images gratuitement. Exportez le PDF au format JPG, PNG ou WEBP. Conversion de haute qualité dans votre navigateur.',
        steps: {
          upload: 'Étape 1 : Téléversez votre fichier PDF',
          format: 'Étape 2 : Choisissez le format de sortie (PNG, JPG, WEBP)',
          download: 'Étape 3 : Téléchargez vos images converties',
        },
      },
      excelToPdf: {
        seo: {
          title: 'Convertisseur Excel vers PDF - Convertir XLSX vers PDF en ligne gratuitement | LocalPDF',
          description: 'Convertissez les fichiers Excel (.xlsx, .xls) au format PDF gratuitement. Support pour plusieurs feuilles, tableaux larges et langues internationales. Rapide, sécurisé et privé.',
          keywords: 'excel vers pdf, xlsx vers pdf, xls vers pdf, tableur vers pdf, convertisseur excel',
          structuredData: {
            name: 'Convertisseur Excel vers PDF',
            description: 'Convertissez les feuilles de calcul Excel au format PDF en ligne gratuitement',
            permissions: 'Aucun téléversement de fichier requis',
          },
        },
        breadcrumbs: {
          home: 'Accueil',
          excelToPdf: 'Excel vers PDF',
        },
        pageTitle: 'Convertisseur Excel vers PDF',
        pageDescription: 'Convertissez vos fichiers Excel (.xlsx, .xls) au format PDF avec support pour plusieurs feuilles, tableaux larges et texte international. Tout le traitement se fait localement.',
        howTo: {
          title: 'Comment Convertir Excel vers PDF',
          steps: {
            upload: {
              title: 'Téléverser le Fichier Excel',
              description: 'Sélectionnez votre fichier Excel (.xlsx ou .xls) depuis votre appareil. Les fichiers sont traités localement pour une confidentialité maximale.',
            },
            configure: {
              title: 'Configurer les Paramètres',
              description: 'Choisissez les feuilles à convertir, définissez l\'orientation et ajustez les options de formatage selon vos besoins.',
            },
            download: {
              title: 'Télécharger PDF',
              description: 'Obtenez vos fichiers PDF convertis instantanément. Chaque feuille peut être sauvegardée comme PDF séparé ou combinée en un seul.',
            },
          },
        },
        features: {
          title: 'Pourquoi Choisir le Convertisseur Excel LocalPDF ?',
          privacy: {
            title: '100% Privé et Sécurisé',
            description: 'Vos fichiers Excel ne quittent jamais votre appareil. Toute la conversion se fait localement dans votre navigateur pour une confidentialité et sécurité maximales.',
          },
          fast: {
            title: 'Traitement Ultra-Rapide',
            description: 'Convertissez les fichiers Excel vers PDF instantanément sans attendre de téléversements ou téléchargements. Fonctionne aussi hors ligne.',
          },
          multiFormat: {
            title: 'Support de Multiples Formats',
            description: 'Fonctionne avec les fichiers .xlsx et .xls. Supporte plusieurs feuilles, formules complexes et texte international.',
          },
          free: {
            title: 'Complètement Gratuit',
            description: 'Aucune limite, aucun filigrane, aucun frais caché. Convertissez un nombre illimité de fichiers Excel vers PDF gratuitement, pour toujours.',
          },
        },
        steps: {
          upload: 'Étape 1 : Téléversez votre fichier Excel (.xlsx ou .xls)',
          configure: 'Étape 2 : Sélectionnez les feuilles et configurez les paramètres de conversion',
          download: 'Étape 3 : Téléchargez vos fichiers PDF convertis',
        },
      },
    },
  },

  // Erreurs et messages
  errors: {
    fileNotSupported: 'Format de fichier non supporté',
    fileTooLarge: 'Taille de fichier trop importante',
    processingFailed: 'Échec du traitement',
    noFilesSelected: 'Aucun fichier sélectionné',
    invalidFormat: 'Format de fichier invalide',
    networkError: 'Erreur réseau',
    unknownError: 'Erreur inconnue',
  },

  // Pied de page
  footer: {
    description: 'LocalPDF - Outils PDF axés sur la confidentialité qui fonctionnent entièrement dans votre navigateur',
    links: {
      privacy: 'Politique de Confidentialité',
      faq: 'FAQ',
      github: 'GitHub',
    },
    copyright: '© 2024 LocalPDF. Tous droits réservés.',
  },

  // Composants
  components: {
    relatedTools: {
      title: 'Outils Connexes',
      subtitle: 'Découvrez d\'autres outils PDF utiles pour améliorer votre flux de travail',
      viewAllTools: 'Voir Tous les Outils',
      toolNames: {
        merge: 'Fusionner PDF',
        split: 'Diviser PDF',
        compress: 'Compresser PDF',
        addText: 'Ajouter Texte',
        watermark: 'Filigrane',
        rotate: 'Faire Pivoter PDF',
        extractPages: 'Extraire Pages',
        extractText: 'Extraire Texte',
        pdfToImage: 'PDF vers Image',
        'word-to-pdf': 'Word vers PDF',
        'excel-to-pdf': 'Excel vers PDF',
        'images-to-pdf': 'Images vers PDF',
      },
      toolDescriptions: {
        merge: 'Combiner plusieurs fichiers PDF en un seul document',
        split: 'Diviser les fichiers PDF en pages ou sections séparées',
        compress: 'Réduire la taille du fichier PDF tout en maintenant la qualité',
        addText: 'Ajouter du texte personnalisé, des signatures et des annotations',
        watermark: 'Ajouter des filigranes de texte ou d\'image pour protéger les documents',
        rotate: 'Faire pivoter les pages PDF pour corriger l\'orientation',
        extractPages: 'Extraire des pages spécifiques des documents PDF',
        extractText: 'Extraire le contenu textuel des fichiers PDF',
        pdfToImage: 'Convertir les pages PDF en formats d\'image',
      },
      actions: {
        merge: {
          split: 'Besoin de diviser ? Essayez notre outil de division',
          compress: 'Fichier fusionné volumineux ? Compressez-le maintenant',
          extractPages: 'Extraire des pages spécifiques du PDF fusionné',
        },
        split: {
          merge: 'Voulez fusionner ? Utilisez notre outil de fusion',
          rotate: 'Faire pivoter les pages après division',
          extractPages: 'Extraire seulement des pages spécifiques',
        },
        compress: {
          merge: 'Fusionner les fichiers compressés ensemble',
          split: 'Diviser le PDF compressé en parties',
          watermark: 'Ajouter un filigrane au PDF compressé',
        },
        addText: {
          watermark: 'Ajouter un filigrane pour une protection supplémentaire',
          rotate: 'Faire pivoter les pages avec texte ajouté',
          extractText: 'Extraire le texte du PDF modifié',
        },
        watermark: {
          addText: 'Ajouter plus de texte au PDF avec filigrane',
          compress: 'Compresser le fichier PDF avec filigrane',
          rotate: 'Faire pivoter les pages avec filigrane',
        },
        rotate: {
          addText: 'Ajouter du texte aux pages pivotées',
          watermark: 'Ajouter un filigrane au PDF pivoté',
          split: 'Diviser le PDF pivoté en parties',
        },
        extractPages: {
          merge: 'Fusionner les pages extraites avec d\'autres PDFs',
          rotate: 'Faire pivoter les pages extraites',
          pdfToImage: 'Convertir les pages extraites en images',
        },
        extractText: {
          addText: 'Ajouter du nouveau texte au PDF',
          extractPages: 'Extraire seulement des pages spécifiques',
          pdfToImage: 'Convertir le PDF en images',
        },
        pdfToImage: {
          extractPages: 'Extraire d\'abord des pages spécifiques',
          extractText: 'Extraire le texte avant conversion',
          rotate: 'Faire pivoter les pages avant conversion',
        },
        'excel-to-pdf': {
          'word-to-pdf': 'Convertir aussi les documents Word',
          'images-to-pdf': 'Combiner avec des images',
          merge: 'Fusionner avec d\'autres PDFs',
        },
      },
    },
    fileUploadZone: {
      dropActive: 'Déposer les fichiers ici',
      chooseFiles: 'Choisir Fichiers',
      dragAndDrop: 'Glisser et déposer les fichiers ici',
      maxFileSize: 'Taille max fichier: 100MB',
      selectFiles: 'Sélectionner Fichiers',
      trustFeatures: {
        private: 'Privé',
        fast: 'Rapide',
        free: 'Gratuit',
      },
      trustMessage: '100% confidentialité • Pas d\'uploads • Pas de limites',
      alerts: {
        unsupportedFiles: 'Certains fichiers ne sont pas supportés',
        fileLimit: 'Limite de taille de fichier dépassée',
      },
      accessibility: {
        uploadArea: 'Zone de téléchargement de fichiers',
        selectFiles: 'Sélectionner des fichiers à télécharger',
      },
    },
  },
};
