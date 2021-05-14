import { TimeFrame } from '@energyweb/utils-general';

interface IPeriodOption {
  value: TimeFrame;
  label: string;
}

export const getPeriodTypeOptions = (
  translate: (string) => string,
  ending = true
): IPeriodOption[] => {
  if (ending) {
    return [
      {
        value: TimeFrame.Daily,
        label: translate('exchange.properties.periodOptions.daily'),
      },
      {
        value: TimeFrame.Weekly,
        label: translate('exchange.properties.periodOptions.weekly'),
      },
      {
        value: TimeFrame.Monthly,
        label: translate('exchange.properties.periodOptions.monthly'),
      },
      {
        value: TimeFrame.Yearly,
        label: translate('exchange.properties.periodOptions.yearly'),
      },
    ];
  } else {
    return [
      {
        value: TimeFrame.Daily,
        label: translate('demand.properties.periodOptions.day'),
      },
      {
        value: TimeFrame.Weekly,
        label: translate('demand.properties.periodOptions.week'),
      },
      {
        value: TimeFrame.Monthly,
        label: translate('demand.properties.periodOptions.month'),
      },
      {
        value: TimeFrame.Yearly,
        label: translate('demand.properties.periodOptions.year'),
      },
    ];
  }
};
