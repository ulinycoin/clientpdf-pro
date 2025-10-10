/**
 * Static pages translations for FR language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Questions Fréquemment Posées',
    subtitle: 'Tout ce que vous devez savoir sur LocalPDF - outils PDF axés sur la confidentialité',
    searchPlaceholder: 'Rechercher des réponses...',
    searchNoResults: 'Aucune question trouvée. Essayez d\'autres mots-clés ou',
    searchContactLink: 'contactez notre support',

    // Popular questions section (Top 4-5 most important)
    popular: {
      title: 'Questions les plus populaires',
      subtitle: 'Réponses rapides aux questions les plus fréquentes'
    },

    // Categories with questions
    categories: {
      privacy: {
        id: 'privacy',
        title: 'Confidentialité & Sécurité',
        icon: '🔒',
        description: 'Découvrez comment nous protégeons vos données et assurons une confidentialité totale',
        questions: [
          {
            id: 'files-uploaded',
            question: 'Mes fichiers PDF sont-ils téléchargés sur vos serveurs ?',
            answer: 'Non, absolument pas ! Tout le traitement PDF se fait <strong>100% localement dans votre navigateur</strong>. Vos fichiers ne quittent jamais votre appareil - ils ne sont pas téléchargés sur nos serveurs ou services cloud. Cela garantit une confidentialité et une sécurité totales pour vos documents sensibles.',
            keywords: ['télécharger', 'serveur', 'cloud', 'confidentialité', 'local'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf'],
            relatedPages: ['/privacy', '/gdpr'],
            popular: true
          },
          {
            id: 'data-collection',
            question: 'Quelles données collectez-vous sur moi ?',
            answer: 'Nous collectons des <strong>analyses anonymes minimales</strong> pour améliorer notre service : vues de pages, type de navigateur et localisation au niveau du pays. Nous ne collectons <strong>jamais</strong> : noms de fichiers, contenus de fichiers, informations personnelles ou historique de traitement. Lisez notre <a href="/privacy">Politique de confidentialité</a> complète pour plus de détails.',
            keywords: ['données', 'collecter', 'analyses', 'suivi', 'rgpd'],
            relatedPages: ['/privacy', '/gdpr', '/terms'],
            popular: true
          },
          {
            id: 'confidential-docs',
            question: 'Puis-je traiter des documents confidentiels ou sensibles ?',
            answer: 'Oui ! LocalPDF est <strong>parfait pour les documents confidentiels</strong> car tout est traité localement. Vos fichiers sensibles (contrats, rapports financiers, documents juridiques) ne quittent jamais votre ordinateur. Contrairement aux services en ligne qui téléchargent les fichiers sur des serveurs, nous traitons tout dans votre navigateur.',
            keywords: ['confidentiel', 'sensible', 'sécurisé', 'juridique', 'financier'],
            relatedTools: ['/protect-pdf', '/watermark-pdf'],
            relatedPages: ['/privacy', '/gdpr']
          },
          {
            id: 'after-processing',
            question: 'Qu\'arrive-t-il à mes fichiers après le traitement ?',
            answer: 'Les fichiers sont <strong>automatiquement effacés de la mémoire du navigateur</strong> lorsque vous fermez la page ou naviguez ailleurs. Comme le traitement est local, aucun fichier n\'est stocké sur des serveurs. Vous avez le contrôle total - téléchargez vos résultats et fermez la page quand vous avez terminé.',
            keywords: ['supprimer', 'effacer', 'stockage', 'cache'],
            relatedPages: ['/privacy']
          },
          {
            id: 'internet-required',
            question: 'Ai-je besoin d\'une connexion Internet pour utiliser LocalPDF ?',
            answer: 'Seulement pour le <strong>chargement initial de la page</strong>. Après cela, vous pouvez traiter des PDF complètement hors ligne ! Les bibliothèques de traitement sont chargées dans votre navigateur, vous pouvez donc travailler sans Internet. Parfait pour travailler avec des documents sensibles en avion ou dans des environnements sécurisés.',
            keywords: ['hors ligne', 'internet', 'connexion', 'réseau'],
            popular: true
          }
        ]
      },

      features: {
        id: 'features',
        title: 'Fonctionnalités & Outils',
        icon: '🛠️',
        description: 'Explorez nos outils PDF et leurs capacités',
        questions: [
          {
            id: 'available-tools',
            question: 'Quels outils PDF sont disponibles ?',
            answer: 'LocalPDF offre <strong>plus de 15 outils PDF professionnels</strong> : <a href="/merge-pdf">Fusionner PDF</a>, <a href="/split-pdf">Diviser PDF</a>, <a href="/compress-pdf">Compresser PDF</a>, <a href="/protect-pdf">Protection par mot de passe</a>, <a href="/watermark-pdf">Ajouter un filigrane</a>, <a href="/add-text-pdf">Ajouter du texte</a>, <a href="/rotate-pdf">Pivoter les pages</a>, <a href="/ocr-pdf">Reconnaissance de texte OCR</a>, <a href="/extract-pages-pdf">Extraire des pages</a>, <a href="/extract-text-pdf">Extraire du texte</a>, <a href="/extract-images-from-pdf">Extraire des images</a>, <a href="/pdf-to-image">PDF vers Image</a>, <a href="/image-to-pdf">Image vers PDF</a>, <a href="/word-to-pdf">Word vers PDF</a>, et plus !',
            keywords: ['outils', 'fonctionnalités', 'disponibles', 'liste', 'capacités'],
            relatedTools: ['/merge-pdf', '/split-pdf', '/compress-pdf', '/ocr-pdf'],
            popular: true
          },
          {
            id: 'edit-existing-text',
            question: 'Puis-je éditer le texte existant dans mes PDF ?',
            answer: 'LocalPDF se concentre sur la <strong>manipulation de documents</strong> (fusion, division, compression) plutôt que sur l\'édition de contenu. Vous pouvez <a href="/add-text-pdf">ajouter du nouveau texte</a>, <a href="/watermark-pdf">ajouter des filigranes</a> et <a href="/ocr-pdf">extraire du texte avec OCR</a>, mais l\'édition de texte existant nécessite des éditeurs PDF spécialisés. Nous recommandons des outils comme Adobe Acrobat ou PDF-XChange Editor pour l\'édition de texte.',
            keywords: ['éditer', 'texte', 'modifier', 'contenu'],
            relatedTools: ['/add-text-pdf', '/watermark-pdf', '/ocr-pdf']
          },
          {
            id: 'browser-extension',
            question: 'Y a-t-il une extension de navigateur pour LocalPDF ?',
            answer: 'Oui ! Installez notre <strong>extension Chrome gratuite</strong> pour un accès rapide aux outils PDF directement depuis votre navigateur. Clic droit sur n\'importe quel PDF → "Ouvrir avec LocalPDF" → Traiter instantanément. <a href="https://chromewebstore.google.com/detail/localpdf/mjidkeobnlijdjmioniboflmoelmckfl" target="_blank" rel="noopener noreferrer">Télécharger l\'extension Chrome →</a>',
            keywords: ['extension', 'chrome', 'navigateur', 'plugin', 'addon'],
            relatedPages: ['/how-to-use'],
            popular: true
          },
          {
            id: 'file-size-limits',
            question: 'Y a-t-il des limites de taille de fichier ?',
            answer: 'Aucune limite artificielle ! Les seules contraintes sont la <strong>RAM et la puissance de traitement de votre appareil</strong>. La plupart des ordinateurs modernes peuvent gérer des PDF jusqu\'à 100-200 Mo facilement. Les gros fichiers (500+ Mo) peuvent prendre plus de temps. Comme tout est local, il n\'y a pas de limites de téléchargement serveur.',
            keywords: ['limite', 'taille', 'maximum', 'grand'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'batch-processing',
            question: 'Puis-je traiter plusieurs PDF à la fois ?',
            answer: 'Oui ! La plupart des outils supportent le <strong>traitement par lots</strong>. Par exemple, <a href="/merge-pdf">Fusionner PDF</a> peut combiner des dizaines de fichiers, <a href="/compress-pdf">Compresser PDF</a> peut optimiser plusieurs PDF, et <a href="/protect-pdf">Protéger PDF</a> peut protéger par mot de passe plusieurs fichiers simultanément. Téléchargez plusieurs fichiers et traitez-les tous en une fois.',
            keywords: ['lot', 'plusieurs', 'bulk', 'nombreux'],
            relatedTools: ['/merge-pdf', '/compress-pdf', '/protect-pdf']
          }
        ]
      },

      technical: {
        id: 'technical',
        title: 'Questions Techniques',
        icon: '💻',
        description: 'Compatibilité des navigateurs, performances et détails techniques',
        questions: [
          {
            id: 'supported-browsers',
            question: 'Quels navigateurs sont pris en charge ?',
            answer: 'LocalPDF fonctionne sur <strong>tous les navigateurs modernes</strong> : <ul><li><strong>Google Chrome</strong> (recommandé - meilleures performances)</li><li><strong>Mozilla Firefox</strong></li><li><strong>Microsoft Edge</strong></li><li><strong>Apple Safari</strong></li><li><strong>Opera</strong></li></ul>Nous recommandons la mise à jour vers la dernière version du navigateur pour des performances optimales.',
            keywords: ['navigateur', 'chrome', 'firefox', 'safari', 'edge'],
            relatedPages: ['/how-to-use']
          },
          {
            id: 'processing-speed',
            question: 'Pourquoi le traitement des gros PDF est-il lent ?',
            answer: 'La vitesse de traitement dépend du <strong>matériel de votre appareil</strong> et de la <strong>complexité du PDF</strong>. Les gros fichiers (100+ Mo) ou les PDF avec beaucoup d\'images nécessitent plus de RAM et de CPU. Conseils pour un traitement plus rapide : <ul><li>Fermez les autres onglets du navigateur</li><li>Utilisez d\'abord <a href="/compress-pdf">Compresser PDF</a> pour réduire la taille</li><li>Traitez moins de fichiers à la fois</li><li>Mettez à jour le navigateur vers la dernière version</li></ul>',
            keywords: ['lent', 'performance', 'vitesse', 'rapide', 'optimiser'],
            relatedTools: ['/compress-pdf']
          },
          {
            id: 'mobile-support',
            question: 'Puis-je utiliser LocalPDF sur des appareils mobiles ?',
            answer: 'Oui ! LocalPDF fonctionne sur les <strong>navigateurs mobiles</strong> (iOS Safari, Chrome Android), mais les performances peuvent être limitées en raison de la RAM de l\'appareil. Pour une meilleure expérience sur mobile : <ul><li>Traitez des fichiers plus petits (< 50 Mo)</li><li>Utilisez des outils plus simples (<a href="/rotate-pdf">Pivoter</a>, <a href="/extract-pages-pdf">Extraire des pages</a>)</li><li>Évitez les outils lourds (OCR, grandes fusions) sur les anciens téléphones</li></ul>',
            keywords: ['mobile', 'téléphone', 'tablette', 'ios', 'android'],
            relatedTools: ['/rotate-pdf', '/extract-pages-pdf']
          },
          {
            id: 'file-formats',
            question: 'Quels formats de fichiers sont pris en charge ?',
            answer: 'LocalPDF prend en charge : <ul><li><strong>Fichiers PDF</strong> - toutes versions, PDF chiffrés (avec mot de passe)</li><li><strong>Images</strong> - JPG, PNG, WebP, TIFF (<a href="/image-to-pdf">Image vers PDF</a>)</li><li><strong>Documents</strong> - DOCX, DOC (<a href="/word-to-pdf">Word vers PDF</a>), XLSX (<a href="/excel-to-pdf">Excel vers PDF</a>)</li></ul>Toutes les conversions se font localement sans téléchargement de fichiers.',
            keywords: ['format', 'type', 'pris en charge', 'convertir', 'compatibilité'],
            relatedTools: ['/image-to-pdf', '/word-to-pdf', '/pdf-to-image']
          }
        ]
      },

      account: {
        id: 'account',
        title: 'Compte & Tarification',
        icon: '💰',
        description: 'Gratuit à utiliser, aucune inscription requise',
        questions: [
          {
            id: 'is-free',
            question: 'LocalPDF est-il vraiment gratuit ?',
            answer: '<strong>Oui, 100% gratuit !</strong> Tous les outils sont complètement gratuits sans coûts cachés, sans niveaux premium, sans abonnements. Nous croyons que les outils axés sur la confidentialité devraient être accessibles à tous. Notre projet est <strong>open source</strong> et soutenu par la communauté. <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">Voir le code source sur GitHub →</a>',
            keywords: ['gratuit', 'coût', 'prix', 'premium', 'abonnement'],
            popular: true
          },
          {
            id: 'account-required',
            question: 'Dois-je créer un compte ?',
            answer: 'Non ! <strong>Zéro inscription requise</strong>. Visitez simplement n\'importe quelle page d\'outil et commencez à traiter des PDF immédiatement. Pas d\'email, pas de mot de passe, pas d\'informations personnelles nécessaires. C\'est partie de notre philosophie axée sur la confidentialité - nous ne voulons pas vos données car nous ne les collectons pas.',
            keywords: ['compte', 'inscription', 'connexion', 'email']
          },
          {
            id: 'how-we-make-money',
            question: 'Comment LocalPDF gagne-t-il de l\'argent s\'il est gratuit ?',
            answer: 'LocalPDF est un <strong>projet open source</strong> avec des coûts serveur minimaux (car le traitement est local). Nous pourrions ajouter des fonctionnalités optionnelles à l\'avenir (comme la synchronisation cloud des paramètres), mais tous les outils PDF de base resteront gratuits pour toujours. Le projet est soutenu par la communauté et axé sur la fourniture d\'outils respectueux de la vie privée.',
            keywords: ['argent', 'revenus', 'affaires', 'monétisation', 'publicités']
          }
        ]
      },

      support: {
        id: 'support',
        title: 'Support & Contact',
        icon: '📞',
        description: 'Obtenez de l\'aide et contactez notre équipe',
        questions: [
          {
            id: 'get-support',
            question: 'Comment obtenir du support ou signaler des bugs ?',
            answer: 'Plusieurs façons d\'obtenir de l\'aide : <ul><li><strong>Email</strong> : <a href="mailto:support@localpdf.online">support@localpdf.online</a> (support technique)</li><li><strong>GitHub</strong> : <a href="https://github.com/ulinycoin/clientpdf-pro/issues" target="_blank" rel="noopener noreferrer">Signaler des bugs et problèmes</a></li><li><strong>Discussions GitHub</strong> : <a href="https://github.com/ulinycoin/clientpdf-pro/discussions" target="_blank" rel="noopener noreferrer">Poser des questions et partager des retours</a></li></ul>',
            keywords: ['support', 'aide', 'bug', 'problème', 'contact'],
            relatedPages: ['/terms']
          },
          {
            id: 'contribute',
            question: 'Puis-je contribuer à LocalPDF ?',
            answer: 'Absolument ! LocalPDF est <strong>open source</strong>. Façons de contribuer : <ul><li><strong>Code</strong> : Soumettre des pull requests sur <a href="https://github.com/ulinycoin/clientpdf-pro" target="_blank" rel="noopener noreferrer">GitHub</a></li><li><strong>Traductions</strong> : Aider à traduire dans plus de langues</li><li><strong>Rapports de bugs</strong> : Signaler les problèmes que vous trouvez</li><li><strong>Idées de fonctionnalités</strong> : Suggérer de nouveaux outils</li><li><strong>Documentation</strong> : Améliorer les guides et docs</li></ul>',
            keywords: ['contribuer', 'open source', 'github', 'développeur', 'aide']
          }
        ]
      }
    },

    // Related links section
    relatedLinks: {
      title: 'Vous avez encore des questions ?',
      subtitle: 'Explorez plus de ressources',
      links: {
        privacy: {
          title: 'Politique de confidentialité',
          description: 'Découvrez comment nous protégeons vos données',
          url: '/privacy'
        },
        gdpr: {
          title: 'Conformité RGPD',
          description: 'Notre engagement en matière de protection des données',
          url: '/gdpr'
        },
        terms: {
          title: 'Conditions d\'Utilisation',
          description: 'Directives d\'utilisation et politiques',
          url: '/terms'
        },
        docs: {
          title: 'Documentation',
          description: 'Guides détaillés et tutoriels',
          url: '/docs'
        }
      }
    },

    // Contact section
    contact: {
      title: 'Informations de contact',
      description: 'Besoin d\'aide personnalisée ? Contactez notre équipe',
      company: 'SIA "Ul-coin"',
      regNumber: 'Reg.Nr. 50203429241',
      email: 'support@localpdf.online',
      emailContact: 'contact@localpdf.online',
      github: 'GitHub Issues',
      website: 'localpdf.online'
    }
  },
  privacy: {
    title: 'Politique de confidentialité',
    subtitle: 'Votre vie privée est notre priorité absolue. Découvrez comment LocalPDF protège vos données.',
    lastUpdated: 'Dernière mise à jour : 30 août 2025',
    sections: {
      commitment: {
        title: 'Notre engagement en matière de confidentialité',
        content: 'Chez LocalPDF, la confidentialité n\'est pas seulement une fonctionnalité – c\'est le fondement de tout ce que nous construisons. Vos fichiers sont entièrement traités dans votre navigateur, garantissant une confidentialité et une sécurité complètes.'
      },
      simpleAnswer: {
        title: 'La réponse simple',
        main: 'Vos fichiers ne quittent JAMAIS votre appareil. Tout se passe localement dans votre navigateur.',
        sub: 'Pas de téléchargements, pas de serveurs, pas de collecte de données. Vos documents restent toujours privés.'
      },
      whatWeDont: {
        title: 'Ce que nous ne faisons PAS',
        noDataCollection: {
          title: 'Aucune collecte de données',
          items: [
            'Nous ne collectons aucune information personnelle',
            'Nous ne suivons pas vos activités',
            'Nous ne stockons aucune analyse d\'utilisation',
            'Nous ne créons aucun profil utilisateur',
            'Nous n\'utilisons aucun cookie de suivi'
          ]
        },
        noFileAccess: {
          title: 'Aucun accès aux fichiers',
          items: [
            'Nous ne voyons jamais vos fichiers',
            'Les fichiers ne sont pas téléchargés sur des serveurs',
            'Aucun stockage temporaire chez nous',
            'Les documents ne quittent jamais votre appareil',
            'Zéro accès au contenu des fichiers'
          ]
        }
      },
      howItWorks: {
        title: 'Comment LocalPDF fonctionne réellement',
        clientSide: {
          title: 'Traitement côté client',
          description: 'Toutes les opérations PDF se déroulent directement dans votre navigateur web en utilisant des bibliothèques JavaScript avancées.',
          items: [
            'Les fichiers sont traités avec PDF.js (la bibliothèque PDF de Mozilla)',
            'Toutes les opérations s\'exécutent dans la mémoire de votre navigateur',
            'Aucune transmission de données vers des serveurs externes',
            'Les résultats sont générés localement sur votre appareil'
          ]
        },
        process: {
          title: 'Processus étape par étape',
          steps: [
            'Vous sélectionnez des fichiers depuis votre appareil',
            'Les fichiers sont uniquement chargés dans la mémoire du navigateur',
            'JavaScript traite vos PDF localement',
            'Les résultats sont générés et mis à disposition pour téléchargement',
            'Les fichiers sont automatiquement supprimés quand vous quittez la page'
          ]
        }
      },
      analytics: {
        title: 'Analyses et suivi',
        description: 'Nous utilisons des analyses minimales et respectueuses de la vie privée pour améliorer notre service. Voici exactement ce que nous suivons :',
        whatWeTrack: {
          title: 'Ce que nous suivons (anonyme uniquement)',
          items: [
            'Pages vues (quels outils sont populaires)',
            'Informations générales du navigateur (pour la compatibilité)',
            'Localisation approximative (niveau pays uniquement)',
            'Aucune donnée d\'identification personnelle',
            'Aucune donnée de traitement de fichiers'
          ]
        },
        protections: {
          title: 'Protections de la vie privée',
          items: [
            'Toutes les analyses sont anonymisées',
            'Aucune journalisation d\'adresse IP',
            'Aucun suivi inter-sites',
            'Aucun réseau publicitaire tiers',
            'Vous pouvez vous désinscrire via les paramètres du navigateur'
          ]
        }
      },
      compliance: {
        title: 'Conformité internationale',
        gdpr: {
          title: 'Conforme RGPD',
          description: 'Entièrement conforme aux réglementations européennes sur la protection des données'
        },
        ccpa: {
          title: 'Conforme CCPA',
          description: 'Respecte les normes de confidentialité de la Californie'
        },
        global: {
          title: 'Confidentialité mondiale',
          description: 'Adhère aux meilleures pratiques internationales en matière de confidentialité'
        }
      },
      summary: {
        title: 'En résumé',
        main: 'LocalPDF vous donne un contrôle total sur vos données. Nous l\'avons conçu ainsi parce que nous croyons que la vie privée est un droit fondamental.',
        sub: 'Des questions sur la confidentialité ? Nous serions heureux d\'expliquer notre approche en détail.'
      }
    }
  },
  terms: {
    title: 'Conditions d\'Utilisation',
    subtitle: 'Conditions simples et transparentes pour utiliser les outils LocalPDF',
    lastUpdated: 'Dernière mise à jour : 30 août 2025',
    sections: {
      introduction: {
        title: 'Bienvenue chez LocalPDF',
        content: 'En utilisant LocalPDF, vous acceptez ces conditions. Nous les gardons simples et équitables car la confidentialité et la transparence nous importent.'
      },
      acceptance: {
        title: 'Acceptation des Conditions',
        content: 'En accédant et en utilisant LocalPDF, vous acceptez d\'être lié par ces Conditions d\'Utilisation. Si vous n\'êtes pas d\'accord, veuillez ne pas utiliser notre service.'
      },
      serviceDescription: {
        title: 'Notre Service',
        content: 'LocalPDF fournit des outils PDF gratuits basés sur navigateur qui traitent vos documents entièrement sur votre appareil.',
        features: {
          title: 'Ce que nous proposons :',
          list: [
            'Fusion, division et compression de PDF',
            'Ajout de texte et de filigrane',
            'Rotation PDF et extraction de pages',
            'Outils de conversion de format',
            'Traitement complet côté client'
          ]
        }
      },
      usageRules: {
        title: 'Règles d\'Utilisation',
        allowed: {
          title: 'Utilisations Autorisées',
          items: [
            'Traitement de documents personnels',
            'Usage commercial et professionnel',
            'Objectifs éducatifs',
            'Toute manipulation légale de documents'
          ]
        },
        prohibited: {
          title: 'Utilisations Interdites',
          items: [
            'Traitement de contenu illégal',
            'Tentatives de rétro-ingénierie',
            'Surcharge de notre infrastructure',
            'Violation des lois applicables'
          ]
        }
      },
      privacy: {
        title: 'Confidentialité & Vos Données',
        localProcessing: 'Tous vos documents sont traités localement dans votre navigateur - ils ne quittent jamais votre appareil.',
        noDataCollection: 'Nous ne collectons, stockons ou n\'avons pas accès à vos fichiers ou données personnelles.',
        privacyPolicyLink: 'Lisez notre Politique de Confidentialité complète →'
      },
      intellectualProperty: {
        title: 'Propriété Intellectuelle',
        openSource: {
          title: 'Open Source',
          content: 'LocalPDF est un logiciel open source. Vous pouvez voir, contribuer et forker notre code.',
          githubLink: 'Voir le code source sur GitHub →'
        },
        userContent: {
          title: 'Votre Contenu',
          content: 'Vous conservez tous les droits sur vos documents. Nous ne revendiquons jamais la propriété ou l\'accès à vos fichiers.'
        }
      },
      disclaimers: {
        title: 'Avertissements',
        asIs: 'LocalPDF est fourni "tel quel" sans garanties ou assurances.',
        noWarranties: 'Bien que nous nous efforcions d\'assurer la fiabilité, nous ne pouvons garantir un service ininterrompu ou un fonctionnement sans erreur.',
        limitations: [
          'Aucune garantie de qualité marchande ou d\'adéquation',
          'Aucune garantie de précision ou d\'intégrité des données',
          'Le service peut être temporairement indisponible',
          'Les fonctionnalités peuvent changer ou être interrompues'
        ]
      },
      liability: {
        title: 'Limitation de Responsabilité',
        limitation: 'Nous ne sommes pas responsables des dommages résultant de votre utilisation de LocalPDF.',
        maxLiability: 'Notre responsabilité maximale est limitée au montant que vous avez payé pour le service (qui est zéro, puisqu\'il est gratuit).'
      },
      changes: {
        title: 'Modifications des Conditions',
        notification: 'Nous pouvons mettre à jour ces conditions occasionnellement. Les changements significatifs seront communiqués via notre site web.',
        effective: 'L\'utilisation continue de LocalPDF après les modifications constitue l\'acceptation des nouvelles conditions.'
      },
      contact: {
        title: 'Nous Contacter',
        description: 'Questions sur ces conditions ? Nous sommes là pour vous aider.',
        company: 'SIA "Ul-coin"',
        regNumber: 'Reg.Nr. 50203429241',
        email: 'support@localpdf.online',
        emailContact: 'contact@localpdf.online',
        github: 'Support & Problèmes',
        website: 'Site Web'
      }
    }
  },

  howToUse: {
    title: 'Comment utiliser LocalPDF',
    subtitle: 'Guide complet pour utiliser les puissants outils PDF de LocalPDF. Apprenez à fusionner, diviser, compresser, éditer et convertir des PDF avec une confidentialité et une sécurité complètes.',
    quickStart: {
      title: 'Guide de démarrage rapide',
      steps: {
        upload: { title: 'Télécharger des fichiers', description: 'Glissez-déposez ou cliquez pour sélectionner vos fichiers PDF' },
        choose: { title: 'Choisir un outil', description: 'Sélectionnez parmi plus de 15 outils de traitement PDF puissants' },
        configure: { title: 'Configurer', description: 'Ajustez les paramètres et options selon vos besoins' },
        download: { title: 'Télécharger', description: 'Traitez et téléchargez votre résultat instantanément' }
      },
      keyBenefits: {
        title: 'Avantages clés',
        description: 'Tout le traitement se fait dans votre navigateur - pas de téléchargements, pas d\'inscription, pas de suivi. Vos fichiers ne quittent jamais votre appareil, garantissant une confidentialité et une sécurité complètes.'
      }
    },
    tools: {
      title: 'Guide des outils PDF',
      merge: {
        title: 'Fusionner des fichiers PDF',
        description: 'Combinez plusieurs fichiers PDF en un seul document.',
        steps: [
          'Téléchargez plusieurs fichiers PDF (glissez-déposez ou cliquez pour sélectionner)',
          'Réorganisez les fichiers en les faisant glisser dans la liste',
          'Cliquez sur "Fusionner les PDF" pour les combiner',
          'Téléchargez votre fichier PDF fusionné'
        ],
        tip: 'Vous pouvez fusionner jusqu\'à 20 fichiers PDF à la fois. L\'ordre final correspondra à votre arrangement dans la liste de fichiers.'
      },
      split: {
        title: 'Diviser des fichiers PDF',
        description: 'Extrayez des pages spécifiques ou divisez des PDF en fichiers séparés.',
        steps: [
          'Téléchargez un seul fichier PDF',
          'Choisissez la méthode de division (par plage de pages, toutes les X pages ou plages personnalisées)',
          'Spécifiez les numéros de pages ou plages (par ex., "1-5, 8, 10-12")',
          'Cliquez sur "Diviser le PDF" et téléchargez les fichiers individuels'
        ],
        tip: 'Utilisez le mode aperçu pour voir les miniatures de pages avant de diviser. Prend en charge les plages complexes comme "1-3, 7, 15-20".'
      },
      compress: {
        title: 'Compresser des fichiers PDF',
        description: 'Réduisez la taille du fichier PDF tout en maintenant la qualité.',
        steps: [
          'Téléchargez un fichier PDF',
          'Ajustez le niveau de qualité (10%-100%)',
          'Activez la compression d\'image, la suppression de métadonnées ou l\'optimisation web',
          'Cliquez sur "Compresser le PDF" et téléchargez le fichier réduit'
        ],
        tip: 'La qualité à 80% offre généralement le meilleur équilibre entre la taille du fichier et la qualité visuelle. Activez la compression d\'image pour des économies maximales.'
      },
      addText: {
        title: 'Ajouter du texte aux PDF',
        description: 'Insérez du texte personnalisé, des signatures et des annotations.',
        steps: [
          'Téléchargez un fichier PDF',
          'Cliquez sur l\'aperçu PDF où vous souhaitez ajouter du texte',
          'Tapez votre texte et ajustez la police, la taille et la couleur',
          'Positionnez et redimensionnez les zones de texte selon vos besoins',
          'Enregistrez votre PDF modifié'
        ],
        tip: 'Utilisez différentes couleurs et polices pour les signatures, tampons ou annotations. Les zones de texte peuvent être déplacées et redimensionnées après création.'
      },
      additional: {
        title: 'Ajouter des filigranes et plus',
        description: 'LocalPDF comprend 5 outils puissants supplémentaires pour une édition PDF complète.',
        features: {
          watermarks: 'Ajouter des filigranes texte ou image',
          rotate: 'Corriger l\'orientation des pages',
          extract: 'Créer de nouveaux PDF à partir de pages sélectionnées',
          extractText: 'Obtenir le contenu textuel des PDF',
          convert: 'Convertir les pages en PNG/JPEG'
        },
        tip: 'Tous les outils fonctionnent de la même manière : Télécharger → Configurer → Traiter → Télécharger. Chaque outil a des options spécifiques adaptées à sa fonction.'
      }
    },
    tips: {
      title: 'Astuces et conseils avancés',
      performance: {
        title: 'Conseils de performance',
        items: [
          'Fermez les autres onglets du navigateur pour les gros fichiers (>50Mo)',
          'Utilisez Chrome ou Firefox pour de meilleures performances',
          'Activez l\'accélération matérielle dans les paramètres du navigateur',
          'Traitez les très gros fichiers en lots plus petits'
        ]
      },
      keyboard: {
        title: 'Raccourcis clavier',
        items: [
          'Ctrl+O - Ouvrir la boîte de dialogue de fichier',
          'Ctrl+S - Enregistrer/télécharger le résultat',
          'Ctrl+Z - Annuler la dernière action',
          'Tab - Naviguer entre les éléments de l\'interface'
        ]
      },
      mobile: {
        title: 'Utilisation mobile',
        items: [
          'Tous les outils fonctionnent sur smartphones et tablettes',
          'Utilisez l\'orientation paysage pour une meilleure interface',
          'Les gestes tactiles et de pincement sont pris en charge',
          'Les fichiers peuvent être ouverts depuis les applications de stockage cloud'
        ]
      },
      troubleshooting: {
        title: 'Dépannage',
        items: [
          'Actualisez la page si l\'outil ne répond plus',
          'Videz le cache du navigateur pour les problèmes persistants',
          'Assurez-vous que JavaScript est activé',
          'Mettez à jour le navigateur vers la dernière version'
        ]
      }
    },
    formats: {
      title: 'Prise en charge des formats de fichiers',
      input: {
        title: 'Entrée prise en charge',
        items: [
          'Fichiers PDF (toute version)',
          'Documents multipages',
          'PDF texte et image',
          'Formulaires et annotations',
          'Fichiers jusqu\'à 100Mo'
        ]
      },
      output: {
        title: 'Formats de sortie',
        items: [
          'PDF (documents traités)',
          'PNG (images haute qualité)',
          'JPEG (images compressées)',
          'WEBP (format moderne)',
          'TXT (texte extrait)'
        ]
      },
      limitations: {
        title: 'Limitations',
        items: [
          'Taille maximale de fichier : 100Mo',
          'Les fichiers protégés par mot de passe ne sont pas pris en charge',
          'Certaines structures PDF complexes peuvent échouer',
          'PDF numérisés : extraction de texte limitée'
        ]
      }
    },
    privacy: {
      title: 'Guide de confidentialité et sécurité',
      whatWeDo: {
        title: 'Ce que fait LocalPDF',
        items: [
          'Traite les fichiers entièrement dans votre navigateur',
          'Utilise JavaScript côté client pour toutes les opérations',
          'Efface automatiquement les fichiers de la mémoire',
          'Fonctionne complètement hors ligne après le premier chargement',
          'Open source et transparent'
        ]
      },
      whatWeNeverDo: {
        title: 'Ce que LocalPDF ne fait jamais',
        items: [
          'Télécharger des fichiers sur des serveurs',
          'Stocker ou mettre en cache vos documents',
          'Suivre le comportement des utilisateurs ou collecter des analyses',
          'Exiger des comptes ou une inscription',
          'Utiliser des cookies pour le suivi'
        ]
      },
      perfectFor: 'Parfait pour les documents confidentiels : Comme tout le traitement est local, LocalPDF est idéal pour les documents sensibles, les fichiers juridiques, les dossiers financiers ou tout PDF confidentiel.'
    },
    help: {
      title: 'Besoin d\'aide supplémentaire ?',
      documentation: {
        title: 'Documentation',
        description: 'Guides complets et tutoriels pour tous les outils PDF',
        link: 'Voir la FAQ'
      },
      community: {
        title: 'Support communautaire',
        description: 'Obtenez de l\'aide de la communauté LocalPDF',
        link: 'Rejoindre les discussions'
      },
      issues: {
        title: 'Signaler des problèmes',
        description: 'Trouvé un bug ou avez une suggestion ?',
        link: 'Signaler un problème'
      },
      footer: 'LocalPDF est un logiciel open source maintenu par la communauté. Vos retours nous aident à améliorer les outils pour tout le monde.'
    }
  },

  notFound: {
    title: 'Page non trouvée',
    subtitle: 'La page que vous recherchez n\'existe pas',
    description: 'La page demandée n\'a pas pu être trouvée. Veuillez vérifier l\'URL et réessayer, ou explorez nos outils PDF populaires ci-dessous.',
    message: 'La page demandée n\'a pas pu être trouvée. Veuillez vérifier l\'URL et réessayer.',
    backHome: 'Retour à l\'accueil',
    backToTools: 'Parcourir les outils PDF',
    suggestions: {
      title: 'Outils PDF populaires :',
      merge: 'Fusionner les PDF',
      split: 'Diviser les PDF',
      compress: 'Compresser les PDF',
      convert: 'Convertir des images en PDF'
    }
  },

  // Tools section (for FAQ tools section compatibility)
  tools: {}
};