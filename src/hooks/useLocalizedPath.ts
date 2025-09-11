import { useTranslation } from './useI18n';
import { defaultLanguage } from '../config/routes';

/**
 * A hook that returns a function to generate a language-prefixed path.
 * This is crucial for ensuring internal links point to the correct language version of a page.
 *
 * @example
 * const getLocalizedPath = useLocalizedPath();
 * <Link to={getLocalizedPath('/privacy')}>Privacy</Link>
 * // returns '/ru/privacy' if current language is 'ru'
 * // returns '/privacy' if current language is 'en' (default)
 *
 * @returns A function that takes a base path and returns the localized path.
 */
export const useLocalizedPath = (): ((path: string) => string) => {
  const { language } = useTranslation();

  const getLocalizedPath = (path: string): string => {
    // For the default language, paths don't have a prefix.
    if (language === defaultLanguage) {
      return path;
    }

    // For other languages, prefix the path with the language code.
    // Handle the homepage case separately to ensure it becomes /<lang>/
    if (path === '/') {
        return `/${language}/`;
    }

    return `/${language}${path}`;
  };

  return getLocalizedPath;
};
