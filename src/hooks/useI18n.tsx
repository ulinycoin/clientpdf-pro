// src/hooks/useI18n.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SupportedLanguage, Translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, TranslationParams } from '../types/i18n';
import { getTranslations } from '../locales';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  translations: Translations;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: TranslationParams) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isInitialized: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

// Константы для localStorage
const LANGUAGE_KEY = 'localpdf-language';
const USER_LANGUAGE_PREFERENCE_KEY = 'localpdf-user-language-preference'; // Флаг явного выбора пользователя

// Функция для определения языка браузера с расширенной поддержкой
const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  // Получаем все языки браузера в порядке предпочтения
  const browserLanguages = navigator.languages || [navigator.language];

  // Проверяем каждый язык браузера
  for (const lang of browserLanguages) {
    // Извлекаем код языка (например, 'en' из 'en-US', 'ru' из 'ru-RU')
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

  // Проверяем путь URL в первую очередь (например, /de/, /fr/, etc.)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length > 0) {
    const possibleLang = pathParts[0] as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === possibleLang)) {
      return possibleLang;
    }
  }

  // Fallback: проверяем URL параметр в query string
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang') as SupportedLanguage;
  
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === langParam)) {
    return langParam;
  }

  return null;
};

// Проверяет, является ли путь нелокализованным (без языкового префикса)
const isNonLocalizedPath = (pathname: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Корневой путь '/' всегда считается нелокализованным
  if (pathParts.length === 0) return true;
  
  // Проверяем, начинается ли путь с языкового кода
  if (pathParts.length > 0) {
    const firstPart = pathParts[0];
    const isLanguageCode = SUPPORTED_LANGUAGES.some(lang => lang.code === firstPart);
    return !isLanguageCode; // Если первая часть НЕ языковой код, путь нелокализован
  }
  
  return false;
};

// Проверяет, установлен ли язык явно пользователем (не системой)
const hasUserLanguagePreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const userPreference = localStorage.getItem(USER_LANGUAGE_PREFERENCE_KEY);
    return userPreference === 'true';
  } catch {
    return false;
  }
};

// Сохраняет язык как явный выбор пользователя
const saveUserLanguagePreference = (language: SupportedLanguage): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
    localStorage.setItem(USER_LANGUAGE_PREFERENCE_KEY, 'true');
  } catch (error) {
    console.warn('Failed to save user language preference:', error);
  }
};

// Сохраняет язык как системный (без пользовательского предпочтения)
const saveSystemLanguage = (language: SupportedLanguage): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
    // НЕ устанавливаем USER_LANGUAGE_PREFERENCE_KEY, оставляем для будущего browser detection
  } catch (error) {
    console.warn('Failed to save system language:', error);
  }
};

// Функция для загрузки сохраненного языка (приоритет: явный выбор -> браузер -> default)
const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    // 1. Проверяем есть ли явный выбор пользователя
    if (hasUserLanguagePreference()) {
      const saved = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
        return saved;
      }
    }

    // 2. Если нет явного выбора - используем браузер (главная фича!)
    return getBrowserLanguage();
  } catch {
    // 3. В случае ошибки все равно пытаемся определить язык браузера
    return getBrowserLanguage();
  }
};

// Новая функция для получения начального языка при первом запуске
const getInitialLanguage = (): SupportedLanguage => {
  // 1. Проверяем URL первым делом (высший приоритет)
  const urlLang = getLanguageFromURL();
  if (urlLang) return urlLang;
  
  // 2. Для корневого пути без языкового префикса используем новую логику:
  return getSavedLanguage(); // Теперь правильно различает пользовательские и системные предпочтения
};

// Функция для экранирования специальных символов в регулярных выражениях
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Функция для интерполяции параметров в переводах
const interpolate = (text: string, params?: TranslationParams): string => {
  if (!params) return text;

  return Object.entries(params).reduce((result, [key, value]) => {
    const escapedKey = escapeRegExp(key);
    return result.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), String(value));
  }, text);
};

// Функция для получения вложенного значения по ключу (например, "common.loading")
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Track initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize language with proper browser detection
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    return getInitialLanguage();
  });
  
  const [translations, setTranslations] = useState<Translations>(() => {
    return getTranslations(currentLanguage);
  });

  // Effect for initial language-based redirect
  useEffect(() => {
    // Only run on initial load to check for redirection.
    const urlLang = getLanguageFromURL();
    const savedLang = localStorage.getItem(LANGUAGE_KEY);

    // Conditions for redirection:
    // 1. There is no language specified in the URL.
    // 2. The user has not manually set a language in a previous session.
    if (!urlLang && !savedLang) {
      const browserLang = getBrowserLanguage();

      // 3. The detected browser language is supported by the site, but it's not the default language.
      if (browserLang !== DEFAULT_LANGUAGE && SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
        // Construct the new path with the language prefix.
        // Ensure the homepage ('/') redirects to '/<lang>/' correctly and directly.
        const newPath = location.pathname === '/'
          ? `/${browserLang}/`
          : `/${browserLang}${location.pathname}`;

        navigate(newPath, { replace: true });
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  // Функция для смены языка
  const setLanguage = (language: SupportedLanguage) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === language)) {
      setCurrentLanguage(language);
      setTranslations(getTranslations(language));

      // Сохраняем выбор как явное предпочтение пользователя
      saveUserLanguagePreference(language);

      // Обновляем lang атрибут HTML
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }

      // Навигация к правильному URL
      const currentPath = location.pathname;
      const currentLangPrefix = getLanguageFromURL();
      
      let newPath: string;
      if (language === DEFAULT_LANGUAGE) {
        // Для английского убираем языковой префикс
        if (currentLangPrefix) {
          newPath = currentPath.replace(`/${currentLangPrefix}`, '') || '/';
        } else {
          newPath = currentPath;
        }
      } else {
        // Для других языков добавляем/заменяем префикс
        if (currentLangPrefix) {
          newPath = currentPath.replace(`/${currentLangPrefix}`, `/${language}`);
        } else {
          newPath = `/${language}${currentPath === '/' ? '' : currentPath}`;
        }
      }
      
      // Навигация к новому URL
      if (newPath !== currentPath) {
        navigate(newPath);
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

  // Устанавливаем начальный язык при монтировании и обрабатываем редирект
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }

    // Особая логика для автоматического перенаправления на основе языка браузера
    const handleBrowserLanguageRedirect = () => {
      // Проверяем, является ли текущий путь нелокализованным (без языкового префикса)
      if (!isNonLocalizedPath(location.pathname)) {
        setIsInitialized(true);
        return; // Если путь уже локализован (/de/tool, /ru/tool), не редиректим
      }
      
      // Проверяем, есть ли явное предпочтение пользователя (не системное сохранение)
      if (hasUserLanguagePreference()) {
        setIsInitialized(true);
        return; // Если есть явный выбор пользователя, не редиректим
      }
      
      // Определяем язык браузера
      const browserLanguage = getBrowserLanguage();
      
      // Если язык браузера не английский, делаем редирект с сохранением пути
      if (browserLanguage !== DEFAULT_LANGUAGE) {
        const currentPath = location.pathname;
        const newPath = `/${browserLanguage}${currentPath === '/' ? '' : currentPath}`;
        navigate(newPath, { replace: true });
      }
      
      // Помечаем как инициализированный после всех проверок
      setIsInitialized(true);
    };

    // Выполняем проверку только при первом рендере
    handleBrowserLanguageRedirect();
  }, []); // Только при монтировании

  // Отслеживаем изменения URL через React Router для автоматического определения языка
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    let urlLang: SupportedLanguage;
    
    if (pathParts.length > 0 && SUPPORTED_LANGUAGES.some(lang => lang.code === pathParts[0])) {
      // URL содержит языковой префикс
      urlLang = pathParts[0] as SupportedLanguage;
    } else {
      // URL не содержит языковой префикс, используем DEFAULT_LANGUAGE (английский)
      urlLang = DEFAULT_LANGUAGE;
    }
    
    // Обновляем язык только если он действительно изменился
    if (urlLang !== currentLanguage) {
      setCurrentLanguage(urlLang);
      setTranslations(getTranslations(urlLang));
      
      // Обновляем HTML lang атрибут
      if (typeof document !== 'undefined') {
        document.documentElement.lang = urlLang;
      }
      
      // Сохраняем новый язык как системное изменение (не пользовательское предпочтение)
      saveSystemLanguage(urlLang);
    }
    
    // Убеждаемся что мы инициализированы после обработки URL
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [location.pathname, currentLanguage, isInitialized]);

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
    isInitialized,
  };

  // Show loading spinner while context initializes to prevent hook access errors
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 text-lg">Initializing LocalPDF...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Хук для использования контекста интернационализации
export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  // Добавляем alias для совместимости
  return {
    ...context,
    language: context.currentLanguage, // Добавляем alias
  };
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
  const browserLanguages = typeof window !== 'undefined' ? 
    (navigator.languages || [navigator.language]).join(', ') : 'N/A';
  
  return {
    browserLanguage: detectBrowserLanguage(),
    browserLanguages,
    urlLanguage: getLanguageFromUrl(),
    savedLanguage: typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) : null,
    isSupported: isLanguageSupported,
    initialLanguage: typeof window !== 'undefined' ? getInitialLanguage() : DEFAULT_LANGUAGE,
  };
};

// Экспорт типов и утилит
export type { I18nContextType };
