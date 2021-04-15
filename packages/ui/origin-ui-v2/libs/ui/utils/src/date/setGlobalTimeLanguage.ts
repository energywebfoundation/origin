import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { SupportedLanguagesEnum } from '@energyweb/origin-ui-localization';

dayjs.extend(utc);
dayjs.extend(timezone);

export enum DateFormatEnum {
  DATE_FORMAT_DMY = 'MMM Do, YYYY',
  DATE_FORMAT_MONTH_AND_YEAR = 'MMM, YYYY',
  DATE_FORMAT_FULL_YEAR = 'YYYY',
  DATE_FORMAT_INCLUDING_TIME = `MMM Do, YYYY hh:mm a`,
}

export function setGlobalTimeLanguage(
  language: SupportedLanguagesEnum = SupportedLanguagesEnum.en
) {
  import(`dayjs/locale/${language}`).then((value) => dayjs.locale(value));
}
