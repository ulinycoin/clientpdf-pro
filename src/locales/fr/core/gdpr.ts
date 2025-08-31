/**
 * GDPR page translations for FR language
 * Complete GDPR compliance page with all sections
 */

export const gdpr = {
  title: 'Votre vie privée est notre priorité. LocalPDF protège vos données',
  description: 'Découvrez la conformité RGPD de LocalPDF. Nous garantissons une protection complète des données avec un traitement 100% local, aucun téléchargement et une confidentialité totale des utilisateurs.',
  lastUpdated: 'Dernière mise à jour',
  sections: {
    introduction: {
      title: 'Introduction à la conformité RGPD',
      content: 'Le Règlement général sur la protection des données (RGPD) est une loi complète de protection des données qui est entrée en vigueur le 25 mai 2018. LocalPDF est conçu dès le départ pour dépasser les exigences du RGPD en garantissant une confidentialité complète des données grâce au traitement local.'
    },
    localProcessing: {
      title: 'Traitement local et protection des données',
      content: 'LocalPDF fonctionne entièrement dans votre navigateur, garantissant que vos documents et données personnelles ne quittent jamais votre appareil :',
      benefits: [
        'Aucun téléchargement de fichiers vers des serveurs externes',
        'Aucune collecte ou stockage de données personnelles',
        'Contrôle complet sur vos documents',
        'Traitement instantané sans dépendance internet'
      ]
    },
    rights: {
      title: 'Vos droits RGPD',
      content: 'Sous le RGPD, vous avez des droits spécifiques concernant vos données personnelles. Avec LocalPDF, la plupart de ces droits sont automatiquement protégés :',
      list: {
        access: {
          title: 'Droit d\'accès',
          description: 'Puisque nous ne collectons aucune donnée, il n\'y a rien à consulter.'
        },
        portability: {
          title: 'Portabilité des données',
          description: 'Vos données restent sur votre appareil et sont entièrement portables.'
        },
        erasure: {
          title: 'Droit à l\'oubli',
          description: 'Videz le cache de votre navigateur pour supprimer toute donnée temporaire.'
        },
        objection: {
          title: 'Droit d\'opposition',
          description: 'Vous contrôlez tout traitement - aucun traitement externe n\'a lieu.'
        }
      }
    },
    minimization: {
      title: 'Principe de minimisation des données',
      content: 'Le RGPD exige de traiter seulement les données minimales nécessaires. LocalPDF va plus loin en ne traitant AUCUNE donnée personnelle du tout.',
      emphasis: 'Nous collectons zéro information personnelle, suivons zéro comportement utilisateur et stockons zéro donnée utilisateur.'
    },
    legalBasis: {
      title: 'Base légale pour le traitement',
      content: 'Quand un traitement est requis, nous nous appuyons sur les bases légales suivantes conformes au RGPD :',
      bases: {
        consent: {
          title: 'Consentement',
          description: 'Quand vous choisissez d\'utiliser nos outils, vous donnez un consentement implicite pour le traitement local.'
        },
        legitimate: {
          title: 'Intérêt légitime',
          description: 'Fournir des outils PDF sans compromettre votre confidentialité sert notre intérêt commercial légitime.'
        }
      }
    },
    contact: {
      title: 'Contact du délégué à la protection des données',
      content: 'Pour toute question ou préoccupation liée au RGPD, veuillez nous contacter :'
    }
  }
};