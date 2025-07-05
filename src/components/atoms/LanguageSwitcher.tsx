import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import useLocalization from '@/hooks/useLocalization';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types/localization.types';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'toggle';
  showText?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
  showText = true,
}) => {
  const { currentLanguage, changeLanguage } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'toggle') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${currentLanguage === lang.code
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={lang.name}
          >
            <span className="text-lg">{lang.flag}</span>
            {showText && (
              <span className="hidden sm:inline">{lang.nativeName}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 
          text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        "
        whileTap={{ scale: 0.98 }}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLangData?.flag}</span>
        {showText && (
          <span className="text-sm font-medium hidden sm:inline">
            {currentLangData?.nativeName}
          </span>
        )}
        <ChevronDown 
          className={`
            w-4 h-4 transition-transform duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full right-0 mt-2 py-1 bg-white border border-gray-200 
              rounded-lg shadow-lg z-50 min-w-[150px]
            "
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                  transition-colors duration-150
                  ${currentLanguage === lang.code
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                whileHover={{ backgroundColor: currentLanguage === lang.code ? undefined : '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-gray-500">{lang.name}</span>
                </div>
                {currentLanguage === lang.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;