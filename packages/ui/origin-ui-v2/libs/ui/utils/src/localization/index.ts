import {
  TOriginLanguage,
  ORIGIN_TRANSLATIONS,
} from '@energyweb/origin-ui-localization';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import ICU from 'i18next-icu';

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
