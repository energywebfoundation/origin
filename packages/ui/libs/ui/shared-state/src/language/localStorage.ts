import {
  AvailableOriginLanguages,
  TOriginLanguage,
} from '@energyweb/origin-ui-localization';
import { ORIGIN_LANGUAGE } from '../utils';
import { TGetOriginLanguage, TSetOriginLanguage } from './types';

export const setOriginLanguage: TSetOriginLanguage = (language) => {
  localStorage.setItem(ORIGIN_LANGUAGE, language);
  location.reload();
};

export const getOriginLanguage: TGetOriginLanguage = () => {
  const storedLanguage = localStorage.getItem(ORIGIN_LANGUAGE);

  if (AvailableOriginLanguages.includes(storedLanguage)) {
    return storedLanguage as TOriginLanguage;
  }

  return 'en';
};
