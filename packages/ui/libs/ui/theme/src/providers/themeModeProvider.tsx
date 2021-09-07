import React, { FC, createContext, useContext, useState } from 'react';
import {
  getThemeModeFromLS,
  saveThemeModeToLS,
} from '@energyweb/origin-ui-shared-state';
import { ThemeModeEnum } from '../utils';

const ThemeModeStore = createContext<ThemeModeEnum>(null);
const ThemeModeDispatch = createContext<() => void>(null);

export const ThemeModeProvider: FC = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeModeEnum>(
    getThemeModeFromLS() || ThemeModeEnum.Dark
  );
  const setMode = () => {
    const newMode =
      themeMode === ThemeModeEnum.Dark
        ? ThemeModeEnum.Light
        : ThemeModeEnum.Dark;
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
