import moment, { Moment } from 'moment-timezone';
import 'moment/min/locales.min';

export const DATE_FORMAT_DMY = 'MMM Do, YYYY';
export const DATE_FORMAT_INCLUDING_TIME = `${DATE_FORMAT_DMY} hh:mm a`;

export function formatDate(date: Moment | number | string, includeTime?: boolean) {
    const formatToUse = includeTime ? DATE_FORMAT_INCLUDING_TIME : DATE_FORMAT_DMY;

    return moment(date).format(formatToUse);
}

export function setTimeFormatLanguage(language: string) {
    if (moment.locales().includes(language)) {
        moment.locale(language);
    }
}

export function setMinTimeInDay(date: Moment): Moment {
    return date.hours(0).minutes(0).seconds(0).milliseconds(0);
}

export function setMaxTimeInDay(date: Moment): Moment {
    return date.hours(23).minutes(59).seconds(59).milliseconds(999);
}

export function setMinTimeInMonth(date: Moment): Moment {
    return date.startOf('month');
}

export function setMaxTimeInMonth(date: Moment): Moment {
    return date.endOf('month');
}

export { moment, Moment };
