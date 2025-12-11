import { useI18nContext } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Language } from '@/types';

const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  ru: '🇷🇺',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
  pt: '🇵🇹',
  it: '🇮🇹',
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ja: '日本語',
  zh: '中文',
  pt: 'Português',
  it: 'Italiano',
};

export const LanguageSelector = () => {
  const { language, setLanguage } = useI18nContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100 dark:hover:bg-privacy-800"
          aria-label="Select language"
        >
          <span className="text-xl">{LANGUAGE_FLAGS[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(LANGUAGE_FLAGS) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`cursor-pointer ${language === lang
                ? 'bg-ocean-50 dark:bg-ocean-900/20 font-medium'
                : ''
              }`}
          >
            <span className="mr-2">{LANGUAGE_FLAGS[lang]}</span>
            <span>{LANGUAGE_NAMES[lang]}</span>
            {language === lang && (
              <span className="ml-auto text-ocean-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
