import { TIntervalData } from '../types';

export const intervalData: TIntervalData = {
  '1d': { label: 'Day', multiplier: 60, format: 'HH:mm' },
  '1w': { label: 'Week', multiplier: 60 * 24, format: 'DD MMM' },
  '1mo': { label: 'Month', multiplier: 60 * 24, format: 'DD MMM' },
  '1y': { label: 'Year', multiplier: 60 * 24 * 30, format: 'MMMM' },
};
