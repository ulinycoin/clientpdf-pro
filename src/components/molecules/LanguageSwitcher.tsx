// src/components/molecules/LanguageSwitcher.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'mobile';
  showFlag?: boolean;
  showText?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'default',
  showFlag = true,
  showText = true,
}) => {
  const { currentLanguage, setLanguage, supportedLanguages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие dropdown при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode as any);
    setIsOpen(false);
  };

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          button: 'px-2 py-1 text-sm',
          dropdown: 'min-w-[120px]',
          item: 'px-3 py-2 text-sm',
        };
      case 'mobile':
        return {
          button: 'px-4 py-3 text-base w-full justify-between',
          dropdown: 'w-full mt-2 left-0',
          item: 'px-4 py-3 text-base',
        };
      default:
        return {
          button: 'px-3 py-2',
          dropdown: 'min-w-[140px]',
          item: 'px-4 py-2',
        };
    }
  };

  const styles = getVariantStyles();

  // Мобильная версия - горизонтальные кнопки
  if (variant === 'mobile') {
    return (
      <div className={`${className}`}>
        {/* Заголовок */}
        <div className="flex items-center gap-2 mb-3 px-4">
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600 font-medium">Language</span>
        </div>
        
        {/* Горизонтальные кнопки языков */}
        <div className="flex gap-2 px-4">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 
                transition-all duration-200 min-w-0
                ${currentLanguage === language.code 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-25 text-gray-700'
                }
              `}
              aria-label={`Switch to ${language.name}`}
            >
              {/* Флаг */}
              <span className="text-lg" role="img" aria-label={language.name}>
                {language.flag}
              </span>
              
              {/* Код языка */}
              <span className="text-xs font-medium uppercase truncate w-full text-center">
                {language.code}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Обычная версия - dropdown
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Кнопка переключения языка */}
      <button
        onClick={handleToggleOpen}
        className={`
          flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 
          rounded-lg hover:bg-white/90 hover:border-gray-300 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20
          ${styles.button}
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >        
        {/* Флаг текущего языка */}
        {showFlag && currentLang && (
          <span className="text-lg" role="img" aria-label={currentLang.name}>
            {currentLang.flag}
          </span>
        )}
        
        {/* Название языка */}
        {showText && (
          <span className="text-gray-700 font-medium">
            {variant === 'compact' ? currentLang?.code.toUpperCase() : currentLang?.nativeName}
          </span>
        )}
        
        {/* Стрелка */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown меню */}
      {isOpen && (
        <div 
          className={`
            absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg 
            overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200
            ${styles.dropdown}
          `}
          role="listbox"
          aria-label="Language options"
        >
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`
                w-full flex items-center space-x-3 hover:bg-primary-50 
                transition-colors duration-150 text-left border-b border-gray-100 last:border-b-0
                ${currentLanguage === language.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                ${styles.item}
              `}
              role="option"
              aria-selected={currentLanguage === language.code}
            >
              {/* Флаг */}
              <span className="text-lg" role="img" aria-label={language.name}>
                {language.flag}
              </span>
              
              {/* Название языка */}
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                {variant !== 'compact' && (
                  <span className="text-xs text-gray-500">{language.name}</span>
                )}
              </div>
              
              {/* Индикатор активного языка */}
              {currentLanguage === language.code && (
                <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
