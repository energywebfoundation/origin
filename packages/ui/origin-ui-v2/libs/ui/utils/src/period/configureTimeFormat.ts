import { TimeFrame } from '@energyweb/utils-general';
import dayjs from 'dayjs';

export const configureDateFormat = (date: Date, period: TimeFrame): string => {
  switch (period) {
    case TimeFrame.Daily || TimeFrame.Weekly:
      return dayjs(date).format('DD MMM, YYYY');
    case TimeFrame.Monthly:
      return dayjs(date).format('MMM, YYYY');
    case TimeFrame.Yearly:
      return dayjs(date).format('YYYY');
    default:
      return dayjs(date).format('DD MMM, YYYY');
  }
};
