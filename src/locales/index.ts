// Centralized localization exports

export { useLocalization, useMultipleNamespaces, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '../hooks/useLocalization';
export { LocalizationProvider, useGlobalLocalization, useLocalizedText } from '../components/context/LocalizationProvider';
export type { Language } from '../hooks/useLocalization';
export type {
  CommonTranslations,
  ToolTranslations,
  CommonTranslationKey,
  ToolTranslationKey,
  LanguageInfo
} from '../types/localization';
export { SUPPORTED_LANGUAGES } from '../types/localization';

// Utility functions
export function getLanguageInfo(code: string) {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
}

export function isRTLLanguage(code: string): boolean {
  const info = getLanguageInfo(code);
  return info.rtl === true;
}

// Browser language detection
export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.split('-')[0].toLowerCase();
}

// Language switching with persistence
export function switchLanguage(code: string) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('localpdf-language', code);
  
  // Trigger custom event for components to listen
  window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: code } }));
}

// Get saved language
export function getSavedLanguage(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('localpdf-language');
}

// Translation helpers
export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

// Pluralization helper (basic implementation)
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

// Date/time localization helper
export function formatDate(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// Number localization helper
export function formatNumber(number: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch {
    return number.toString();
  }
}

// File size localization
export function formatFileSize(bytes: number, locale: string = 'en'): string {
  const units = locale === 'ru' 
    ? ['байт', 'КБ', 'МБ', 'ГБ'] 
    : ['bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return `0 ${units[0]}`;
  
  const k = 1024;
  const dm = 2;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${units[i]}`;
}