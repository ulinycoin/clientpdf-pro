// src/locales/index.ts
import { SupportedLanguage, Translations } from '../types/i18n';
import { en } from './en/index';
import { de } from './de/index';
import { fr } from './fr/index';
import { es } from './es/index';
import { ru } from './ru/index';

// Экспорт всех переводов
export const translations: Record<SupportedLanguage, Translations> = {
  en,
  de,
  fr,
  es,
  ru,
};

// Функция для получения переводов по языку
export const getTranslations = (language: SupportedLanguage): Translations => {
  return translations[language] || translations.en;
};

// Экспорт отдельных языков для lazy loading если понадобится
export { en, de, fr, es, ru };
