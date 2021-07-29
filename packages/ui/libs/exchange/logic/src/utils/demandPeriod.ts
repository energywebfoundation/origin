import { TimeFrame } from '@energyweb/utils-general';
import { TFunction } from 'i18next';

interface IPeriodOption {
  value: TimeFrame;
  label: string;
}

export const periodTypeOptions = (
  t: TFunction,
  ending = true
): IPeriodOption[] => {
  if (ending) {
    return [
      {
        value: TimeFrame.Daily,
        label: t('exchange.properties.period.daily'),
      },
      {
        value: TimeFrame.Weekly,
        label: t('exchange.properties.period.weekly'),
      },
      {
        value: TimeFrame.Monthly,
        label: t('exchange.properties.period.monthly'),
      },
      {
        value: TimeFrame.Yearly,
        label: t('exchange.properties.period.yearly'),
      },
    ];
  } else {
    return [
      {
        value: TimeFrame.Daily,
        label: t('demand.properties.period.day'),
      },
      {
        value: TimeFrame.Weekly,
        label: t('demand.properties.period.week'),
      },
      {
        value: TimeFrame.Monthly,
        label: t('demand.properties.period.month'),
      },
      {
        value: TimeFrame.Yearly,
        label: t('demand.properties.period.year'),
      },
    ];
  }
};
