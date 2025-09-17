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
      title: t('footer.sections.company.title'),
      links: [
        { name: t('footer.sections.company.about'), href: getLocalizedPath('/faq'), internal: true },
        { name: t('footer.links.privacy'), href: getLocalizedPath('/privacy'), internal: true },
        { name: t('footer.sections.company.terms'), href: getLocalizedPath('/terms'), internal: true },
        { name: 'GDPR', href: getLocalizedPath('/gdpr'), internal: true }
      ]
    },
    {
      title: t('footer.sections.developers.title'),
      links: [
        { name: 'GitHub', href: 'https://github.com/ulinycoin/clientpdf-pro', internal: false },
        { name: t('footer.sections.developers.apiDocs'), href: 'https://github.com/ulinycoin/clientpdf-pro#api', internal: false },
        { name: t('footer.sections.developers.contribute'), href: 'https://github.com/ulinycoin/clientpdf-pro/contributing', internal: false },
        { name: t('footer.sections.developers.license'), href: 'https://github.com/ulinycoin/clientpdf-pro/license', internal: false }
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
    <footer className="relative bg-gradient-to-br from-privacy-50 via-white to-seafoam-50 dark:from-privacy-950 dark:via-privacy-900 dark:to-ocean-950 border-t border-privacy-200 dark:border-privacy-700 mt-20">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-seafoam-200/10 to-ocean-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-privacy-200/10 to-seafoam-200/10 rounded-full blur-2xl"></div>
        
        {/* Floating particles */}
        {shouldAnimate && (
          <>
            <div className="absolute w-1 h-1 bg-seafoam-400/20 rounded-full gentle-float" style={{left: '20%', top: '30%', animationDelay: '0s'}}></div>
            <div className="absolute w-1 h-1 bg-ocean-400/20 rounded-full gentle-float" style={{left: '80%', top: '60%', animationDelay: '2s'}}></div>
            <div className="absolute w-1 h-1 bg-privacy-accent/20 rounded-full gentle-float" style={{left: '60%', top: '80%', animationDelay: '1s'}}></div>
          </>
        )}
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
                  <path d="M14 8h4l-4-4v4z" opacity="0.7"/>
                  <circle cx="12" cy="15" r="2" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gradient-ocean">LocalPDF</h3>
            </div>
            
            <p className="text-gray-700 dark:text-privacy-400 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>

          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold text-privacy-900 dark:text-privacy-100 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-gray-700 dark:text-privacy-400 hover:text-seafoam-600 dark:hover:text-seafoam-400 transition-colors text-sm font-medium group"
                      >
                        <span className="border-b border-transparent group-hover:border-seafoam-400 transition-colors">
                          {link.name}
                        </span>
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-privacy-400 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors text-sm font-medium group flex items-center gap-1"
                      >
                        <span className="border-b border-transparent group-hover:border-ocean-400 transition-colors">
                          {link.name}
                        </span>
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
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


        {/* Bottom Section */}
        <div className="border-t border-privacy-200 dark:border-privacy-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            
            {/* Copyright & Tech Stack */}
            <div className="text-center md:text-left">
              <div className="text-gray-700 dark:text-privacy-400 text-sm mb-2">
                {t('footer.copyright', { year: currentYear })}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-privacy-500">
                <span>{t('footer.builtWith')}</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <span>React</span>
                </div>
                <span>+</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <span>TypeScript</span>
                </div>
                <span>+</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                  <span>pdf-lib</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-privacy-400 font-medium">
                {t('footer.followProject')}
              </span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/60 dark:bg-privacy-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-700 dark:text-privacy-400 hover:text-privacy-900 dark:hover:text-privacy-100 hover:bg-white/80 dark:hover:bg-privacy-800/60 border border-white/20 dark:border-privacy-700/30 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <div className={`transform ${shouldAnimate ? 'group-hover:scale-110' : ''} transition-transform`}>
                      {social.icon}
                    </div>
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