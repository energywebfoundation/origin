import en from './languages/en.json';
import pl from './languages/pl.json';

export const enum SupportedLanguagesEnum {
  en = 'en',
  pl = 'pl',
}

export const ORIGIN_TRANSLATIONS = { en, pl } as const;

export const AvailableOriginLanguages = Object.keys(ORIGIN_TRANSLATIONS);

export type TOriginLanguage = keyof typeof ORIGIN_TRANSLATIONS;
