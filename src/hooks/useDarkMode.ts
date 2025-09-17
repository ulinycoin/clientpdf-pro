import { useState, useEffect, createContext, useContext } from 'react';

export interface DarkModeContextValue {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeContextValue | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

// Hook for dark mode functionality
export const useDarkModeLogic = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('localpdf_dark_mode');
    if (stored !== null) {
      return JSON.parse(stored);
    }
    
    // Default to light theme (instead of system preference)
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to document
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Save preference to localStorage
    localStorage.setItem('localpdf_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem('localpdf_dark_mode');
      if (stored === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode
  };
};