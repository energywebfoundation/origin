import moment, { Moment } from 'moment-timezone';
import 'moment/min/locales.min';

export const DATE_FORMAT_DMY = 'MMM Do, YYYY';
export const DATE_FORMAT_MY = 'MMM, YYYY';
export const DATE_FORMAT_Y = 'YYYY';
export const DATE_FORMAT_INCLUDING_TIME = `${DATE_FORMAT_DMY} hh:mm a`;

export function formatDate(date: Moment | number | string, includeTime = false, timezone?: string) {
    const formatToUse = includeTime ? DATE_FORMAT_INCLUDING_TIME : DATE_FORMAT_DMY;

    return moment.tz(date, timezone || moment.tz.guess()).format(formatToUse);
}

export function setTimeFormatLanguage(language: string) {
    if (moment.locales().includes(language)) {
        moment.locale(language);
    }
}

export function setMinTimeInMonth(date: Moment): Moment {
    return date.startOf('month');
}

export function setMaxTimeInMonth(date: Moment): Moment {
    return date.endOf('month');
}

export { moment, Moment };
