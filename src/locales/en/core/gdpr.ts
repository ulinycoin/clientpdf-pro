/**
 * GDPR page translations for EN language
 * Complete GDPR compliance page with all sections
 */

export const gdpr = {
  title: 'Your Privacy is Our Priority. LocalPDF Protects Your Data',
  description: 'Learn about LocalPDF\'s GDPR compliance. We guarantee complete data protection with 100% local processing, no uploads, and full user privacy.',
  lastUpdated: 'Last updated',
  sections: {
    introduction: {
      title: 'Introduction to GDPR Compliance',
      content: 'The General Data Protection Regulation (GDPR) is a comprehensive data protection law that took effect on May 25, 2018. LocalPDF is designed from the ground up to exceed GDPR requirements by ensuring complete data privacy through local processing.'
    },
    localProcessing: {
      title: 'Local Processing and Data Protection',
      content: 'LocalPDF operates entirely within your browser, ensuring that your documents and personal data never leave your device:',
      benefits: [
        'No file uploads to external servers',
        'No collection or storage of personal data',
        'Complete control over your documents',
        'Instant processing without internet dependency'
      ]
    },
    rights: {
      title: 'Your GDPR Rights',
      content: 'Under GDPR, you have specific rights regarding your personal data. With LocalPDF, most of these rights are automatically protected:',
      list: {
        access: {
          title: 'Right of Access',
          description: 'Since we collect no data, there is nothing to access.'
        },
        portability: {
          title: 'Data Portability',
          description: 'Your data remains on your device and is fully portable.'
        },
        erasure: {
          title: 'Right to be Forgotten',
          description: 'Clear your browser cache to remove any temporary data.'
        },
        objection: {
          title: 'Right to Object',
          description: 'You control all processing - no external processing occurs.'
        }
      }
    },
    minimization: {
      title: 'Data Minimization Principle',
      content: 'GDPR requires processing only the minimum data necessary. LocalPDF goes beyond this by processing NO personal data at all.',
      emphasis: 'We collect zero personal information, track zero user behavior, and store zero user data.'
    },
    legalBasis: {
      title: 'Legal Basis for Processing',
      content: 'When processing is required, we rely on the following GDPR-compliant legal bases:',
      bases: {
        consent: {
          title: 'Consent',
          description: 'When you choose to use our tools, you provide implicit consent for local processing.'
        },
        legitimate: {
          title: 'Legitimate Interest',
          description: 'Providing PDF tools without compromising your privacy serves our legitimate business interest.'
        }
      }
    },
    contact: {
      title: 'Data Protection Officer Contact',
      content: 'For any GDPR-related questions or concerns, please contact us:',
      company: 'SIA "Ul-coin"',
      regNumber: 'Reg.Nr. 50203429241',
      email: 'support@localpdf.online',
      emailContact: 'contact@localpdf.online'
    }
  }
};