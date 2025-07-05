import React, { createContext, useContext, useEffect } from 'react';
import { useMultipleNamespaces, Language, setGlobalLanguageChanger } from '../../hooks/useLocalization';

interface LocalizationContextType {
  language: Language;
  changeLanguage: (language: Language) => void;
  t: (namespace: string, key: string, fallback?: string) => string;
  isLoading: boolean;
  translations: {[namespace: string]: any};
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

interface LocalizationProviderProps {
  children: React.ReactNode;
  namespaces?: string[];
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
  namespaces = ['common', 'tools']
}) => {
  const localization = useMultipleNamespaces(namespaces);

  // Set global language changer
  useEffect(() => {
    setGlobalLanguageChanger(localization.changeLanguage);
  }, [localization.changeLanguage]);

  return (
    <LocalizationContext.Provider value={localization}>
      {children}
    </LocalizationContext.Provider>
  );
};

export function useGlobalLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useGlobalLocalization must be used within a LocalizationProvider');
  }
  return context;
}

// Convenience hook for single namespace
export function useLocalizedText(namespace: string = 'common') {
  const { t, language, isLoading } = useGlobalLocalization();
  
  const translate = (key: string, fallback?: string) => {
    return t(namespace, key, fallback);
  };
  
  return {
    t: translate,
    language,
    isLoading
  };
}