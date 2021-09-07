import React, { FC, createContext, useContext, useState } from 'react';
import {
  getThemeModeFromLS,
  saveThemeModeToLS,
} from '@energyweb/origin-ui-shared-state';

export type ThemeModeType = 'dark' | 'light';

const ThemeModeStore = createContext<ThemeModeType>(null);
const ThemeModeDispatch = createContext<() => void>(null);

export const ThemeModeProvider: FC = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeModeType>(
    getThemeModeFromLS() || 'dark'
  );
  const setMode = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemeModeToLS(newMode);
  };

  return (
    <ThemeModeStore.Provider value={themeMode}>
      <ThemeModeDispatch.Provider value={setMode}>
        {children}
      </ThemeModeDispatch.Provider>
    </ThemeModeStore.Provider>
  );
};

export const useThemeModeStore = () => {
  return useContext(ThemeModeStore);
};

export const useThemeModeDispatch = () => {
  return useContext(ThemeModeDispatch);
};
