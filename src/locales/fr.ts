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
      tools: '12 outils',
      private: '100% Privé',
      activeTools: '12 outils actifs',
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
      title: '12 outils PDF puissants',
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
    },
    faq: {
      title: 'Questions fréquemment posées',
      subtitle: 'Tout ce que vous devez savoir sur LocalPDF',
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
      split: {
        pageTitle: 'Diviser des fichiers PDF gratuitement',
        pageDescription: 'Divisez des fichiers PDF par pages ou plages gratuitement. Extrayez des pages spécifiques de documents PDF. Division PDF privée et sécurisée dans votre navigateur.',
        uploadTitle: 'Téléverser un PDF à diviser',
        buttons: {
          startSplitting: 'Commencer la division',
        },
        features: {
          title: 'Fonctionnalités avancées de division PDF',
          pageRanges: {
            title: '📄 Plages de pages',
            description: 'Divisez par plages de pages spécifiques (ex. 1-5, 10-15) ou extrayez des pages individuelles avec précision.',
          },
          batchProcessing: {
            title: '⚡ Traitement par lots',
            description: 'Traitez plusieurs plages de pages à la fois. Créez plusieurs PDFs à partir d\'un document source efficacement.',
          },
          previewMode: {
            title: '👁️ Mode aperçu',
            description: 'Prévisualisez les pages avant de diviser pour vous assurer d\'extraire le bon contenu de votre PDF.',
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
    },
  },
};
