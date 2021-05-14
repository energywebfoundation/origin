import { TimeFrame } from '@energyweb/utils-general';
import { TFunction } from 'i18next';

export const configureTimeFrame = (
  timeframe: TimeFrame,
  translate: TFunction,
  ending = true
): string => {
  if (ending) {
    switch (timeframe) {
      case TimeFrame.Daily:
        return translate('demand.properties.periodOptions.daily');
      case TimeFrame.Weekly:
        return translate('demand.properties.periodOptions.weekly');
      case TimeFrame.Monthly:
        return translate('demand.properties.periodOptions.monthly');
      case TimeFrame.Yearly:
        return translate('demand.properties.periodOptions.yearly');
    }
  } else {
    switch (timeframe) {
      case TimeFrame.Daily:
        return translate('demand.properties.periodOptions.day');
      case TimeFrame.Weekly:
        return translate('demand.properties.periodOptions.week');
      case TimeFrame.Monthly:
        return translate('demand.properties.periodOptions.month');
      case TimeFrame.Yearly:
        return translate('demand.properties.periodOptions.year');
    }
  }
};
