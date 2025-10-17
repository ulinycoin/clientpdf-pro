import { useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES } from '@/types';
import type { Language } from '@/types';

// Import translations
import enTranslations from '@/locales/en.json';
import ruTranslations from '@/locales/ru.json';

type Translations = typeof enTranslations;

const translations: Record<Language, Translations> = {
  en: enTranslations,
  ru: ruTranslations,
  // Fallback to English for other languages (will be added later)
  de: enTranslations,
  fr: enTranslations,
  es: enTranslations,
};

export interface I18nReturn {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Helper to get nested translation value
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return key if not found
    }
  }

  return typeof value === 'string' ? value : path;
}

export const useI18n = (): I18nReturn => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Priority 1: URL parameter (from redirect)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const urlLang = urlParams.get('lang') as Language;
    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      return urlLang;
    }

    // Priority 2: localStorage (previous session)
    const storedLang = localStorage.getItem('preferred_language') as Language;
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }

    // Priority 3: Browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }

    // Fallback: English
    return 'en';
  });

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Language '${lang}' is not supported. Falling back to 'en'.`);
      lang = 'en';
    }

    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
    document.documentElement.lang = lang;

    // Track language change
    const event = new CustomEvent('language_changed', {
      detail: { from: language, to: lang }
    });
    window.dispatchEvent(event);
  }, [language]);

  // Translation function
  const t = useCallback((key: string): string => {
    const translation = translations[language];
    return getNestedValue(translation, key);
  }, [language]);

  return {
    language,
    setLanguage,
    t,
  };
};
