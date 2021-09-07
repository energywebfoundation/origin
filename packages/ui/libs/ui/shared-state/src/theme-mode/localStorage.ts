import { THEME_MODE } from '../utils';
import { TGetThemeModeFromLS, TSaveThemeModeToLS } from './types';

export const saveThemeModeToLS: TSaveThemeModeToLS = (mode) => {
  localStorage.setItem(THEME_MODE, mode);
};

export const getThemeModeFromLS: TGetThemeModeFromLS = () => {
  return localStorage.getItem(THEME_MODE) as 'dark' | 'light';
};
