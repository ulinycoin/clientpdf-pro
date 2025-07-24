import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Zap, Github, Menu, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useI18n';
import LanguageSwitcher from '../molecules/LanguageSwitcher';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = 'LocalPDF',
  showLogo = true,
  actions,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        fixed top-0 left-0 right-0 z-50 transition-all duration-200
        ${isScrolled ? 'pdf-processing-card shadow-soft' : 'bg-transparent'}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-4 group">
            {showLogo && (
              <div className="relative">
                {/* Pulse ring effect for trust */}
                <div className="absolute inset-0 bg-primary-400 rounded-xl animate-pulse-slow opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl transform group-hover:scale-105 transition-transform duration-200 shadow-soft">
                  📄
                </div>
              </div>
            )}
            <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gradient-blue group-hover:scale-105 transition-transform duration-200">
            {title}
            </h1>
            <p className="text-sm text-secondary-600 font-medium hidden sm:block">
            {t('header.subtitle')}
            </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-secondary-700 hover:text-primary-600 transition-colors font-medium relative group"
              >
                {t('header.navigation.privacy')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link
                to="/faq"
                className="text-secondary-700 hover:text-primary-600 transition-colors font-medium relative group"
              >
                {t('header.navigation.faq')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <a
                href="https://github.com/ulinycoin/clientpdf-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-700 hover:text-primary-600 transition-colors font-medium relative group flex items-center space-x-1"
              >
                <Github className="w-4 h-4" />
                <span>{t('header.navigation.github')}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-200"></span>
              </a>
            </nav>

            {/* Trust-First Status Badges */}
            <div className="flex items-center space-x-3">
              {/* Active Tools Badge */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-success-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                <div className="relative flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-success-700 px-3 py-2 rounded-xl text-sm font-medium border border-success-200 shadow-soft">
                  <div className="w-2 h-2 bg-success-500 rounded-full pdf-status-indicator"></div>
                  <span>{t('header.badges.tools')}</span>
                </div>
              </div>

              {/* Privacy Badge */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                <div className="relative flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-primary-700 px-3 py-2 rounded-xl text-sm font-medium border border-primary-200 shadow-soft trust-badge">
                  <Shield className="w-4 h-4" />
                  <span>{t('header.badges.private')}</span>
                </div>
              </div>

              {/* Language Switcher */}
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
            className="md:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-white/50 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={t('header.mobileMenu.toggle')}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 transition-transform duration-200" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="py-4 space-y-4 border-t border-white/20 backdrop-blur-sm">
            <Link
              to="/privacy"
              className="block px-4 py-3 text-secondary-700 hover:text-primary-600 hover:bg-white/50 rounded-xl transition-colors font-medium progressive-reveal"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('header.mobileMenu.privacyPolicy')}
            </Link>
            <Link
              to="/faq"
              className="block px-4 py-3 text-secondary-700 hover:text-primary-600 hover:bg-white/50 rounded-xl transition-colors font-medium progressive-reveal"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('header.navigation.faq')}
            </Link>
            <a
              href="https://github.com/ulinycoin/clientpdf-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-secondary-700 hover:text-primary-600 hover:bg-white/50 rounded-xl transition-colors font-medium progressive-reveal flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Github className="w-4 h-4" />
              <span>{t('header.mobileMenu.githubRepository')}</span>
            </a>

            {/* Mobile Trust Badges */}
            <div className="px-4 space-y-3">
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm text-success-700 px-3 py-2 rounded-xl text-sm font-medium border border-success-200">
                <div className="w-2 h-2 bg-success-500 rounded-full pdf-status-indicator"></div>
                <span>{t('header.badges.activeTools')}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm text-primary-700 px-3 py-2 rounded-xl text-sm font-medium border border-primary-200">
                <Shield className="w-4 h-4" />
                <span>{t('header.badges.privateProcessing')}</span>
              </div>
              
              {/* Mobile Language Switcher */}
              <div className="pt-2">
                <LanguageSwitcher variant="mobile" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
