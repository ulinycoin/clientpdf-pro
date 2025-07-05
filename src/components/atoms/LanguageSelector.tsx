import React from 'react';
import { useGlobalLocalization } from '../context/LocalizationProvider';
import { Language, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '../../hooks/useLocalization';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'compact';
  showFlags?: boolean;
  showNames?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'dropdown',
  showFlags = true,
  showNames = true
}) => {
  const { language, changeLanguage } = useGlobalLocalization();
  
  const languages: Language[] = ['en', 'ru'];

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {languages.map((lang) => {
          const isActive = language === lang;
          return (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              title={LANGUAGE_NAMES[lang]}
            >
              <span className="flex items-center space-x-1">
                {showFlags && (
                  <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                )}
                {showNames && (
                  <span>{LANGUAGE_NAMES[lang]}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {languages.map((lang) => {
          const isActive = language === lang;
          return (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-blue-100 ring-2 ring-blue-300' 
                  : 'hover:bg-gray-100'
                }
              `}
              title={LANGUAGE_NAMES[lang]}
            >
              {LANGUAGE_FLAGS[lang]}
            </button>
          );
        })}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as Language)}
        className="
          appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8
          text-sm font-medium text-gray-700 cursor-pointer
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
        "
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {showFlags ? `${LANGUAGE_FLAGS[lang]} ` : ''}
            {showNames ? LANGUAGE_NAMES[lang] : lang.toUpperCase()}
          </option>
        ))}
      </select>
      
      {/* Dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;