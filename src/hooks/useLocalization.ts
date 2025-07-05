import { useState, useEffect, useCallback, useMemo } from 'react';
import { LocaleData, SupportedLanguage, DEFAULT_LANGUAGE } from '@/types/localization.types';

// Import locale files
import enLocale from '@/locales/en.json';
import ruLocale from '@/locales/ru.json';

const LOCALE_STORAGE_KEY = 'localpdf-language';

// Locale data registry
const locales: Record<SupportedLanguage, LocaleData> = {
  en: enLocale as LocaleData,
  ru: ruLocale as LocaleData,
};

// Detect browser language
const detectBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  return Object.keys(locales).includes(browserLang) ? browserLang : DEFAULT_LANGUAGE;
};

// Get saved language from localStorage
const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLanguage;
    return saved && Object.keys(locales).includes(saved) ? saved : detectBrowserLanguage();
  } catch {
    return detectBrowserLanguage();
  }
};

// Save language to localStorage
const saveLanguage = (language: SupportedLanguage): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
};

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

// Get nested object value by dot notation key
const getNestedValue = (obj: any, key: string): string => {
  return key.split('.').reduce((current, prop) => current?.[prop], obj) || key;
};

// Replace parameters in translation string
const replaceParams = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, text);
};

export const useLocalization = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getSavedLanguage);

  // Get current locale data
  const locale = useMemo(() => locales[currentLanguage], [currentLanguage]);

  // Translation function
  const t: TranslationFunction = useCallback((key: string, params?: Record<string, string | number>) => {
    const value = getNestedValue(locale, key);
    return replaceParams(value, params);
  }, [locale]);

  // Change language function
  const changeLanguage = useCallback((language: SupportedLanguage) => {
    if (language !== currentLanguage && Object.keys(locales).includes(language)) {
      setCurrentLanguage(language);
      saveLanguage(language);
      
      // Update document language attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    }
  }, [currentLanguage]);

  // Initialize language on mount
  useEffect(() => {
    const savedLang = getSavedLanguage();
    if (savedLang !== currentLanguage) {
      setCurrentLanguage(savedLang);
    }
    
    // Set document language
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  // Get available languages
  const availableLanguages = useMemo(() => Object.keys(locales) as SupportedLanguage[], []);

  // Check if language is RTL (Right-to-Left)
  const isRTL = useMemo(() => {
    // Add RTL languages here if needed in the future
    const rtlLanguages: SupportedLanguage[] = [];
    return rtlLanguages.includes(currentLanguage);
  }, [currentLanguage]);

  return {
    // Current state
    currentLanguage,
    locale,
    isRTL,
    availableLanguages,
    
    // Functions
    t,
    changeLanguage,
    
    // Utility functions
    formatNumber: (num: number) => num.toLocaleString(currentLanguage),
    formatDate: (date: Date) => date.toLocaleDateString(currentLanguage),
    formatFileSize: (bytes: number) => {
      const units = currentLanguage === 'ru' 
        ? ['байт', 'КБ', 'МБ', 'ГБ'] 
        : ['bytes', 'KB', 'MB', 'GB'];
      
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
  };
};

// Export hook for use in components
export default useLocalization;