import React from 'react';
import { DarkModeContext, useDarkModeLogic } from '../../hooks/useDarkMode';

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const darkModeLogic = useDarkModeLogic();

  return (
    <DarkModeContext.Provider value={darkModeLogic}>
      {children}
    </DarkModeContext.Provider>
  );
};