// src/locales/index.ts
import { SupportedLanguage, Translations } from '../types/i18n';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';
import { ru } from './ru';

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
