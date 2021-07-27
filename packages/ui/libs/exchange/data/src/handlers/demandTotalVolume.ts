import {
  demandControllerSummary,
  TimeFrame,
} from '@energyweb/exchange-irec-react-query-client';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { Dayjs } from 'dayjs';

type CreateBundleFormValues = {
  period: TimeFrame;
  volume: number;
  startDate: Dayjs;
  endDate: Dayjs;
  price: number;
};

export const calculateDemandTotalVolume = async (
  values: Omit<CreateBundleFormValues, 'price'>
) => {
  const { volume, period, startDate, endDate } = values;

  if (volume > 0 && period && startDate && endDate) {
    const summary = await demandControllerSummary({
      volumePerPeriod:
        PowerFormatter.getBaseValueFromValueInDisplayUnit(volume).toString(),
      periodTimeFrame: period,
      start: startDate.toISOString(),
      end: endDate.toISOString(),

      price: 1 * 100,
      product: {},
      boundToGenerationTime: false,
      excludeEnd: false,
    });
    return PowerFormatter.format(Number(summary?.volume)).split(',').join('');
  }
  return '';
};
