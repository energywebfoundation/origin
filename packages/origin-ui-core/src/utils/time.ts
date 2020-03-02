import moment from 'moment-timezone';
import 'moment/min/locales.min';

export function setTimeFormatLanguage(language: string) {
    if (moment.locales().includes(language)) {
        moment.locale(language);
    }
}

export { moment };
