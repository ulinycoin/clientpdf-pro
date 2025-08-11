// src/hooks/useI18n.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, Translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, TranslationParams } from '../types/i18n';
import { getTranslations } from '../locales';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  translations: Translations;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: TranslationParams) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

// Константы для localStorage
const LANGUAGE_KEY = 'localpdf-language';

// Функция для определения языка браузера с расширенной поддержкой
const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  // Получаем все языки браузера в порядке предпочтения
  const browserLanguages = navigator.languages || [navigator.language];

  // Проверяем каждый язык браузера
  for (const lang of browserLanguages) {
    // Извлекаем код языка (например, 'en' из 'en-US')
    const languageCode = lang.split('-')[0].toLowerCase() as SupportedLanguage;

    // Проверяем, поддерживается ли этот язык
    if (SUPPORTED_LANGUAGES.some(supportedLang => supportedLang.code === languageCode)) {
      return languageCode;
    }
  }

  return DEFAULT_LANGUAGE;
};

// Функция для определения языка из URL path
const getLanguageFromURL = (): SupportedLanguage | null => {
  if (typeof window === 'undefined') return null;

  // Проверяем URL параметр в query string
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang') as SupportedLanguage;
  
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === langParam)) {
    return langParam;
  }

  // Проверяем путь URL (например, /de/, /fr/, etc.)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length > 0) {
    const possibleLang = pathParts[0] as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === possibleLang)) {
      return possibleLang;
    }
  }

  return null;
};

// Функция для загрузки сохраненного языка с приоритетом
const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    // 1. Проверяем URL параметр (высший приоритет)
    const urlLang = getLanguageFromURL();
    if (urlLang) return urlLang;

    // 2. Проверяем localStorage
    const saved = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
      return saved;
    }

    // 3. Fallback на язык браузера
    return getBrowserLanguage();
  } catch {
    return getBrowserLanguage();
  }
};

// Функция для интерполяции параметров в переводах
const interpolate = (text: string, params?: TranslationParams): string => {
  if (!params) return text;

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, text);
};

// Функция для получения вложенного значения по ключу (например, "common.loading")
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getSavedLanguage);
  const [translations, setTranslations] = useState<Translations>(getTranslations(currentLanguage));

  // Функция для смены языка
  const setLanguage = (language: SupportedLanguage) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === language)) {
      setCurrentLanguage(language);
      setTranslations(getTranslations(language));

      // Сохраняем выбор в localStorage
      try {
        localStorage.setItem(LANGUAGE_KEY, language);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }

      // Обновляем lang атрибут HTML
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    }
  };

  // Функция перевода с поддержкой интерполяции
  const t = (key: string, params?: TranslationParams): string => {
    const value = getNestedValue(translations, key);

    if (value === undefined) {
      console.warn(`Translation missing for key: "${key}" in language: "${currentLanguage}"`);
      return key; // Возвращаем ключ как fallback
    }

    return interpolate(value, params);
  };

  // Устанавливаем начальный язык при монтировании
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, []);

  // Обновляем переводы при смене языка
  useEffect(() => {
    setTranslations(getTranslations(currentLanguage));
  }, [currentLanguage]);

  const contextValue: I18nContextType = {
    currentLanguage,
    translations,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Хук для использования контекста интернационализации
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
};

// Хук только для функции перевода (более легковесный)
export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};

// Утилитарные функции для экспорта
export const detectBrowserLanguage = (): SupportedLanguage => getBrowserLanguage();
export const getLanguageFromUrl = (): SupportedLanguage | null => getLanguageFromURL();
export const isLanguageSupported = (language: string): language is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === language);
};

// Хук для автоматического определения языка (полезен для отладки)
export const useLanguageDetection = () => {
  return {
    browserLanguage: detectBrowserLanguage(),
    urlLanguage: getLanguageFromUrl(),
    savedLanguage: typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) : null,
    isSupported: isLanguageSupported,
  };
};

// Экспорт типов и утилит
export type { I18nContextType };
