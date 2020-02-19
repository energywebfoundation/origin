import en from './languages/en.json';
import pl from './languages/pl.json';

export const ORIGIN_LANGUAGES = { en, pl } as const;

export const AVAILABLE_ORIGIN_LANGUAGES = Object.keys(ORIGIN_LANGUAGES);

export type ORIGIN_LANGUAGE = keyof typeof ORIGIN_LANGUAGES;
