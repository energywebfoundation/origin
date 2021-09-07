import { THEME_MODE } from '../utils';
import { ThemeModeEnum } from './ThemeModeEnum';
import { TGetThemeModeFromLS, TSaveThemeModeToLS } from './types';

export const saveThemeModeToLS: TSaveThemeModeToLS = (mode) => {
  localStorage.setItem(THEME_MODE, mode);
};

export const getThemeModeFromLS: TGetThemeModeFromLS = () => {
  return localStorage.getItem(THEME_MODE) as ThemeModeEnum;
};
