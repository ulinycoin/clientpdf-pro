import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation, useI18n } from '../../hooks/useI18n';
import { useMotionPreferences } from '../../hooks/useAccessibilityPreferences';
import LanguageSwitcher from '../molecules/LanguageSwitcher';
import DarkModeToggle from '../molecules/DarkModeToggle';

interface ModernHeaderProps {
  title?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  title = 'LocalPDF',
  showLogo = true,
  actions,
  className = ''
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const { shouldAnimate } = useMotionPreferences();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper function to create localized paths
  const getLocalizedPath = (path: string) => {
    if (currentLanguage === 'en') {
      return path;
    }
    return `/${currentLanguage}${path}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-white/80 dark:bg-privacy-900/80 backdrop-blur-lg border-b border-privacy-200/50 dark:border-privacy-700/50 shadow-lg' 
          : 'bg-transparent'
        }
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Modern Logo */}
          <Link to={getLocalizedPath("/")} className="flex items-center space-x-4 group">
            {showLogo && (
              <div className="relative">
                {/* Floating glow effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br from-seafoam-400/20 to-ocean-400/20 rounded-2xl blur-sm 
                  ${shouldAnimate ? 'animate-pulse' : ''} 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `}></div>
                
                {/* Logo container */}
                <div className="relative w-12 h-12 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
                    <path d="M14 8h4l-4-4v4z" opacity="0.7"/>
                    <circle cx="12" cy="15" r="2" fill="white"/>
                    <path d="M10 17h4M10 19h2" stroke="white" strokeWidth="1" fill="none"/>
                  </svg>
                </div>
              </div>
            )}
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gradient-ocean group-hover:scale-105 transition-transform duration-200">
                {title}
              </h1>
              <p className="text-sm text-gray-700 dark:text-privacy-400 font-medium hidden sm:block">
                {t('header.subtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              
              {/* Navigation Links */}
              <Link
                to={getLocalizedPath("/privacy")}
                className="relative text-privacy-700 dark:text-privacy-300 hover:text-seafoam-600 dark:hover:text-seafoam-400 transition-colors font-medium group py-2"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z" />
                  </svg>
                  {t('header.navigation.privacy')}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-seafoam-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <Link
                to={getLocalizedPath("/faq")}
                className="relative text-privacy-700 dark:text-privacy-300 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors font-medium group py-2"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  {t('header.navigation.faq')}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ocean-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <a
                href="https://github.com/ulinycoin/clientpdf-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-privacy-700 dark:text-privacy-300 hover:text-privacy-900 dark:hover:text-privacy-100 transition-colors font-medium group py-2"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  GitHub
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-privacy-accent group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <DarkModeToggle variant="icon-only" />
              <LanguageSwitcher variant="compact" />
            </div>
          </div>

          {/* Custom Actions */}
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 text-gray-700 dark:text-privacy-400 hover:text-privacy-900 dark:hover:text-privacy-100 transition-colors rounded-xl hover:bg-white/50 dark:hover:bg-privacy-800/50 backdrop-blur-sm"
            aria-label={t('header.mobileMenu.toggle')}
          >
            <div className="relative w-5 h-5">
              <span className={`absolute block h-0.5 w-full bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'}`}></span>
              <span className={`absolute block h-0.5 w-full bg-current transform transition-all duration-300 translate-y-2 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute block h-0.5 w-full bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 translate-y-2' : 'translate-y-4'}`}></span>
            </div>
          </button>
        </div>

        {/* Modern Mobile Menu */}
        <div className={`
          lg:hidden overflow-hidden transition-all duration-300 ease-out
          ${isMobileMenuOpen ? 'max-h-screen opacity-100 pb-6' : 'max-h-0 opacity-0'}
        `}>
          <div className="pt-4 space-y-3 border-t border-privacy-200/50 dark:border-privacy-700/50 backdrop-blur-sm">
            
            {/* Mobile Navigation Links */}
            <Link
              to={getLocalizedPath("/privacy")}
              className="flex items-center gap-3 px-4 py-3 text-privacy-700 dark:text-privacy-300 hover:text-seafoam-600 dark:hover:text-seafoam-400 hover:bg-white/50 dark:hover:bg-privacy-800/50 rounded-xl transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z" />
              </svg>
{t('header.navigation.privacy')}
            </Link>
            
            <Link
              to={getLocalizedPath("/faq")}
              className="flex items-center gap-3 px-4 py-3 text-privacy-700 dark:text-privacy-300 hover:text-ocean-600 dark:hover:text-ocean-400 hover:bg-white/50 dark:hover:bg-privacy-800/50 rounded-xl transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
{t('header.navigation.faq')}
            </Link>
            
            <a
              href="https://github.com/ulinycoin/clientpdf-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-privacy-700 dark:text-privacy-300 hover:text-privacy-900 dark:hover:text-privacy-100 hover:bg-white/50 dark:hover:bg-privacy-800/50 rounded-xl transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
              </svg>
{t('header.mobileMenu.githubRepository')}
            </a>

            {/* Mobile Controls */}
            <div className="px-4 pt-4 border-t border-privacy-200/30 dark:border-privacy-700/30 space-y-4">
              <DarkModeToggle variant="compact" />
              <LanguageSwitcher variant="mobile" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;