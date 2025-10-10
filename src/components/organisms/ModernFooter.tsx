import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
// Cache bust v1

const ModernFooter: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const { shouldAnimate } = useMotionPreferences();
  const currentYear = new Date().getFullYear(); // Cache bust

  // Helper function to create localized paths
  const getLocalizedPath = (path: string) => {
    if (currentLanguage === 'en') {
      return path;
    }
    return `/${currentLanguage}${path}`;
  };

  const footerLinks = [
    {
      title: t('footer.sections.product.title'),
      links: [
        { name: t('footer.sections.product.allTools'), href: getLocalizedPath('/#tools-section'), internal: true },
        { name: t('tools.merge.title'), href: getLocalizedPath('/merge-pdf'), internal: true },
        { name: t('tools.split.title'), href: getLocalizedPath('/split-pdf'), internal: true },
        { name: t('tools.compress.title'), href: getLocalizedPath('/compress-pdf'), internal: true }
      ]
    },
    {
      title: t('footer.sections.resources.title', 'Resources'),
      links: [
        { name: t('footer.sections.resources.pdfHub', 'PDF Learning Center'), href: getLocalizedPath('/pdf-hub'), internal: true },
        { name: t('footer.sections.resources.guides', 'PDF Guides'), href: getLocalizedPath('/pdf-hub/guides'), internal: true },
        { name: t('footer.sections.resources.workflows', 'Workflows'), href: getLocalizedPath('/pdf-hub/workflows'), internal: true },
        { name: t('footer.sections.resources.comparison', 'Tool Comparison'), href: getLocalizedPath('/pdf-hub/comparison'), internal: true }
      ]
    },
    {
      title: t('footer.sections.company.title'),
      links: [
        { name: t('footer.sections.company.about'), href: getLocalizedPath('/faq'), internal: true },
        { name: t('header.navigation.docs'), href: getLocalizedPath('/docs'), internal: true },
        { name: t('footer.links.privacy'), href: getLocalizedPath('/privacy'), internal: true },
        { name: t('footer.sections.company.terms'), href: getLocalizedPath('/terms'), internal: true }
      ]
    },
    {
      title: t('footer.sections.developers.title'),
      links: [
        { name: 'GitHub', href: 'https://github.com/ulinycoin/clientpdf-pro', internal: false },
        { name: t('footer.links.browserExtension'), href: 'https://chromewebstore.google.com/detail/localpdf/mjidkeobnlijdjmioniboflmoelmckfl', internal: false },
        { name: t('footer.sections.developers.apiDocs'), href: 'https://github.com/ulinycoin/clientpdf-pro#api', internal: false },
        { name: t('footer.sections.developers.contribute'), href: 'https://github.com/ulinycoin/clientpdf-pro/contributing', internal: false },
        { name: 'GDPR', href: getLocalizedPath('/gdpr'), internal: true }
      ]
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/ulinycoin/clientpdf-pro',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
        </svg>
      )
    },
    {
      name: 'Twitter/X',
      href: 'https://x.com/LocalPDF',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        </svg>
      )
    },
    {
      name: 'Reddit',
      href: 'https://www.reddit.com/user/Salt_Apartment5489/',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      )
    },
    {
      name: 'Website',
      href: 'https://localpdf.online',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8Z" />
        </svg>
      )
    }
  ];

  return (
    <footer className="relative bg-white dark:bg-privacy-900 border-t border-gray-200 dark:border-privacy-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {footerLinks.map((section, index) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        {link.name}
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                        </svg>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section - Compact */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">

            {/* Copyright */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
              {t('footer.copyright', { year: currentYear })}
            </div>

            {/* Tech Stack & Social */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Built with React + TypeScript</span>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;