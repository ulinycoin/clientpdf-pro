import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES } from '@/types';
import type { Language } from '@/types';

// Import translations
import enTranslations from '@/locales/en.json';
import ruTranslations from '@/locales/ru.json';
import jaTranslations from '@/locales/ja.json';

type Translations = typeof enTranslations;

const translations: Record<Language, Translations> = {
  en: enTranslations,
  ru: ruTranslations,
  ja: jaTranslations,
  // Fallback to English for other languages (will be added later)
  de: enTranslations,
  fr: enTranslations,
  es: enTranslations,
};

export interface I18nReturn {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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

const I18nContext = createContext<I18nReturn | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
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

    // Priority 3: Browser language detection
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
    // Extract language code (e.g., 'en-US' -> 'en', 'ja-JP' -> 'ja')
    const langCode = browserLang.toLowerCase().split('-')[0] as Language;

    // Check if detected language is supported
    if (SUPPORTED_LANGUAGES.includes(langCode)) {
      console.log(`Auto-detected browser language: ${langCode} (from ${browserLang})`);
      return langCode;
    }

    // Default: English
    console.log(`Browser language ${browserLang} not supported, defaulting to English`);
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

  // Translation function with interpolation support
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language];
    let text = getNestedValue(translation, key);

    // Replace placeholders with actual values
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        const placeholder = `{${param}}`;
        text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
      });
    }

    return text;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18nContext = (): I18nReturn => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
};
