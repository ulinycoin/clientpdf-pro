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

// Функция для определения языка браузера
const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang) 
    ? browserLang 
    : DEFAULT_LANGUAGE;
};

// Функция для загрузки сохраненного языка
const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage;
    return SUPPORTED_LANGUAGES.some(lang => lang.code === saved) 
      ? saved 
      : getBrowserLanguage();
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

// Экспорт типов и утилит
export type { I18nContextType };
