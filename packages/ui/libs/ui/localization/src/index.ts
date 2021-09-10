import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import ICU from 'i18next-icu';

import en from './languages/en.json';
import pl from './languages/pl.json';

export enum SupportedLanguagesEnum {
  en = 'en',
  pl = 'pl',
}

export const ORIGIN_TRANSLATIONS = { en, pl } as const;

export const AvailableOriginLanguages = Object.keys(ORIGIN_TRANSLATIONS);

export type TOriginLanguage = keyof typeof ORIGIN_TRANSLATIONS;

export const initializeI18N = (
  language: TOriginLanguage = 'en',
  fallbackLanguage: TOriginLanguage = 'en'
) => {
  i18n
    .use(new ICU())
    .use(initReactI18next)
    .init({
      resources: ORIGIN_TRANSLATIONS,
      lng: language,
      fallbackLng: fallbackLanguage,

      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
};
