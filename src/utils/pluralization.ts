// src/utils/pluralization.ts
import { SupportedLanguage } from '../types/i18n';

/**
 * Функция для получения правильной формы множественного числа
 * Особенно важно для русского языка с его сложными правилами склонения
 */
export const getPluralForm = (
  count: number, 
  language: SupportedLanguage,
  options: {
    singular: string;
    few?: string; // для языков с формой "несколько" (2-4 в русском)
    many: string; // множественное число
  }
): string => {
  if (count === 1) {
    return options.singular;
  }

  switch (language) {
    case 'ru':
      // Русские правила множественного числа
      if (count >= 10 && count <= 20) {
        return options.many; // 10-20: файлов
      }
      const lastDigit = count % 10;
      if (lastDigit >= 2 && lastDigit <= 4) {
        return options.few || options.many; // 2-4: файла
      }
      return options.many; // остальное: файлов

    case 'en':
      return options.many; // files

    case 'de':
      return options.many; // Dateien

    case 'fr':
      return options.many; // fichiers

    case 'es':
      return options.many; // archivos

    default:
      return options.many;
  }
};

/**
 * Предустановленные тексты для часто используемых слов
 */
export const getFilesText = (count: number, language: SupportedLanguage): string => {
  const options = {
    en: { singular: 'file', many: 'files' },
    de: { singular: 'Datei', many: 'Dateien' },
    fr: { singular: 'fichier', many: 'fichiers' },
    es: { singular: 'archivo', many: 'archivos' },
    ru: { singular: 'файл', few: 'файла', many: 'файлов' },
  };

  return getPluralForm(count, language, options[language]);
};

/**
 * Форматирование размера файла с учетом локали
 */
export const formatFileSize = (bytes: number, language: SupportedLanguage): string => {
  const mb = bytes / 1024 / 1024;
  const formatted = mb.toFixed(2);
  
  const units = {
    en: 'MB',
    de: 'MB',
    fr: 'Mo',
    es: 'MB',
    ru: 'МБ',
  };

  return `${formatted} ${units[language]}`;
};
