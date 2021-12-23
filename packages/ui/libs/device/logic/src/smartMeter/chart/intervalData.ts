import { TIntervalData } from '../types';
import { DayJsTimeMultiplier } from '../../utils';

export const intervalData: TIntervalData = {
  '1h': { label: 'Day', multiplier: DayJsTimeMultiplier.hour, format: 'HH:mm' },
  '1d': {
    label: 'Week',
    multiplier: DayJsTimeMultiplier.day,
    format: 'DD MMM',
  },
  '1w': {
    label: 'Month',
    multiplier: DayJsTimeMultiplier.week,
    format: 'DD MMM',
  },
  '1mo': {
    label: 'Year',
    multiplier: DayJsTimeMultiplier.month,
    format: 'MMMM',
  },
};
