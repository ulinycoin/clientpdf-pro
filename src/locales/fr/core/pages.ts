/**
 * Static pages translations for FR language
 * Contains: FAQ, privacy policy, terms, other static pages
 */

export const pages = {
  faq: {
    title: 'Questions Fréquemment Posées',
    subtitle: 'Trouvez des réponses aux questions courantes sur LocalPDF',
    sections: {
      general: {
        title: 'Questions Générales',
        questions: {
          whatIs: {
            question: 'Qu\'est-ce que LocalPDF ?',
            answer: 'LocalPDF est une collection d\'outils PDF axés sur la confidentialité qui fonctionnent entièrement dans votre navigateur. Aucun téléchargement, aucun suivi, confidentialité complète.'
          },
          free: {
            question: 'LocalPDF est-il vraiment gratuit ?',
            answer: 'Oui ! Tous les outils sont entièrement gratuits à utiliser sans inscription requise. Aucun coût caché, aucun niveau premium.'
          },
          account: {
            question: 'Dois-je créer un compte ?',
            answer: 'Aucun compte requis ! Visitez simplement le site web et commencez à utiliser n\'importe quel outil immédiatement.'
          }
        }
      },
      privacy: {
        title: 'Confidentialité & Sécurité',
        questions: {
          uploaded: {
            question: 'Mes fichiers sont-ils téléchargés sur vos serveurs ?',
            answer: 'Non ! Tout le traitement se fait localement dans votre navigateur. Vos fichiers ne quittent jamais votre appareil.'
          },
          afterUse: {
            question: 'Que se passe-t-il avec mes fichiers après utilisation des outils ?',
            answer: 'Rien ! Puisque les fichiers sont traités localement, ils restent uniquement sur votre appareil. Nous ne voyons ni ne stockons jamais vos fichiers.'
          },
          confidential: {
            question: 'Puis-je utiliser ceci pour des documents confidentiels ?',
            answer: 'Absolument ! Puisque tout se passe localement, vos documents confidentiels restent complètement privés.'
          }
        }
      },
      technical: {
        title: 'Questions Techniques',
        questions: {
          browsers: {
            question: 'Quels navigateurs sont pris en charge ?',
            answer: 'LocalPDF fonctionne sur tous les navigateurs modernes :',
            browsers: [
              'Google Chrome (recommandé)',
              'Mozilla Firefox',
              'Apple Safari',
              'Microsoft Edge',
              'Opera'
            ]
          },
          offline: {
            question: 'Puis-je utiliser LocalPDF hors ligne ?',
            answer: 'Oui ! Après le chargement initial de la page, vous pouvez traiter des fichiers même sans connexion internet.'
          },
          fileSize: {
            question: 'Y a-t-il des limites de taille de fichier ?',
            answer: 'Les seules limites sont basées sur la mémoire et la puissance de traitement de votre appareil. Nous n\'imposons aucune limite artificielle.'
          }
        }
      },
      tools: {
        title: 'Outils PDF',
        editText: {
          question: 'Puis-je éditer le texte dans des PDF existants ?',
          answer: 'LocalPDF se concentre sur la manipulation de documents plutôt que sur l\'\u00e9dition de contenu. Vous pouvez ajouter du texte, des filigranes, fusionner, diviser et faire tourner des PDF, mais l\'édition de texte existant nécessite un logiciel spécialisé d\'édition PDF.'
        }
      },
      support: {
        title: 'Support & Contact',
        gettingSupport: {
          title: 'Comment obtenir de l\'aide',
          items: [
            'Consultez notre section FAQ pour les questions courantes',
            'Signalez les bugs et problèmes sur notre page GitHub',
            'Contactez-nous par e-mail pour le support technique',
            'Suivez-nous sur les réseaux sociaux pour les mises à jour'
          ]
        },
        contact: {
          title: 'Informations de contact',
          github: '🐛 Signaler des problèmes sur GitHub',
          discussions: '💬 Rejoindre les discussions GitHub'
        }
      }
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
        github: 'Support & Problèmes',
        website: 'Site Web'
      }
    }
  },
  
  // Tools section (for FAQ tools section compatibility)
  tools: {}
};