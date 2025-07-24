import React from 'react';
import { useTranslation } from '../../hooks/useI18n';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Footer Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mb-6">
          
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © {currentYear} LocalPDF. Open Source Project.
          </div>

          {/* Tech Stack */}
          <div className="text-gray-400 text-sm">
            Built with React + TypeScript + pdf-lib
          </div>

          {/* Key Message */}
          <div className="text-green-400 text-sm font-medium">
            {t('footer.description')}
          </div>
        </div>

        {/* Trust Message & Links */}
        <div className="text-center border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-4">
            {t('footer.copyright')}
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a 
              href="/privacy" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t('footer.links.privacy')}
            </a>
            <span className="text-gray-600">•</span>
            <a 
              href="/faq" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t('footer.links.faq')}
            </a>
            <span className="text-gray-600">•</span>
            <a 
              href="https://github.com/ulinycoin/clientpdf-pro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t('footer.links.github')}
            </a>
            <span className="text-gray-600">•</span>
            <a 
              href="https://localpdf.online" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              localpdf.online
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;