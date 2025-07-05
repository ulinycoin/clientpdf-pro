import { useState, useEffect, useCallback } from 'react';

// Supported languages
export type Language = 'en' | 'ru';

// Language detection
function detectLanguage(): Language {
  // Check localStorage first
  const saved = localStorage.getItem('localpdf-language') as Language;
  if (saved && ['en', 'ru'].includes(saved)) {
    return saved;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) {
    return 'ru';
  }

  // Default to English
  return 'en';
}

// Translation cache
interface TranslationCache {
  [language: string]: {
    [namespace: string]: any;
  };
}

const translationCache: TranslationCache = {};

// Load translations
async function loadTranslations(language: Language, namespace: string): Promise<any> {
  const cacheKey = `${language}-${namespace}`;
  
  if (translationCache[language]?.[namespace]) {
    return translationCache[language][namespace];
  }

  try {
    const response = await import(`../locales/${language}/${namespace}.json`);
    
    if (!translationCache[language]) {
      translationCache[language] = {};
    }
    
    translationCache[language][namespace] = response.default || response;
    return translationCache[language][namespace];
  } catch (error) {
    console.warn(`Failed to load translations for ${language}/${namespace}:`, error);
    
    // Fallback to English if current language fails
    if (language !== 'en') {
      try {
        const fallbackResponse = await import(`../locales/en/${namespace}.json`);
        return fallbackResponse.default || fallbackResponse;
      } catch (fallbackError) {
        console.error(`Failed to load fallback translations:`, fallbackError);
        return {};
      }
    }
    
    return {};
  }
}

// Translation hook
export function useLocalization(namespace: string = 'common') {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [translations, setTranslations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language or namespace changes
  useEffect(() => {
    let isMounted = true;
    
    async function loadAndSetTranslations() {
      setIsLoading(true);
      
      try {
        const newTranslations = await loadTranslations(language, namespace);
        
        if (isMounted) {
          setTranslations(newTranslations);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAndSetTranslations();
    
    return () => {
      isMounted = false;
    };
  }, [language, namespace]);

  // Change language
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('localpdf-language', newLanguage);
    
    // Clear cache to force reload
    if (translationCache[newLanguage]) {
      delete translationCache[newLanguage];
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      current = current?.[k];
      if (current === undefined) {
        break;
      }
    }
    
    if (typeof current === 'string') {
      return current;
    }
    
    // Return fallback or key if translation not found
    return fallback || key;
  }, [translations]);

  // Check if translation exists
  const hasTranslation = useCallback((key: string): boolean => {
    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      current = current?.[k];
      if (current === undefined) {
        return false;
      }
    }
    
    return typeof current === 'string';
  }, [translations]);

  return {
    language,
    changeLanguage,
    t,
    hasTranslation,
    isLoading,
    translations
  };
}

// Multiple namespace hook
export function useMultipleNamespaces(namespaces: string[]) {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [allTranslations, setAllTranslations] = useState<{[namespace: string]: any}>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load all translations
  useEffect(() => {
    let isMounted = true;
    
    async function loadAllTranslations() {
      setIsLoading(true);
      
      try {
        const promises = namespaces.map(namespace => 
          loadTranslations(language, namespace).then(translations => ({ namespace, translations }))
        );
        
        const results = await Promise.all(promises);
        
        if (isMounted) {
          const newTranslations: {[namespace: string]: any} = {};
          results.forEach(({ namespace, translations }) => {
            newTranslations[namespace] = translations;
          });
          setAllTranslations(newTranslations);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAllTranslations();
    
    return () => {
      isMounted = false;
    };
  }, [language, namespaces]);

  // Change language
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('localpdf-language', newLanguage);
    
    // Clear cache to force reload
    if (translationCache[newLanguage]) {
      delete translationCache[newLanguage];
    }
  }, []);

  // Translation function with namespace
  const t = useCallback((namespace: string, key: string, fallback?: string): string => {
    const translations = allTranslations[namespace];
    if (!translations) {
      return fallback || key;
    }

    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      current = current?.[k];
      if (current === undefined) {
        break;
      }
    }
    
    if (typeof current === 'string') {
      return current;
    }
    
    return fallback || key;
  }, [allTranslations]);

  return {
    language,
    changeLanguage,
    t,
    isLoading,
    translations: allTranslations
  };
}

// Language display names
export const LANGUAGE_NAMES = {
  en: 'English',
  ru: 'Русский'
} as const;

// Language flags/icons
export const LANGUAGE_FLAGS = {
  en: '🇺🇸',
  ru: '🇷🇺'
} as const;

// Export singleton for global access
let globalLanguage: Language = detectLanguage();
let globalChangeLanguage: ((lang: Language) => void) | null = null;

export function setGlobalLanguageChanger(changer: (lang: Language) => void) {
  globalChangeLanguage = changer;
}

export function getGlobalLanguage(): Language {
  return globalLanguage;
}

export function changeGlobalLanguage(language: Language) {
  globalLanguage = language;
  if (globalChangeLanguage) {
    globalChangeLanguage(language);
  }
}