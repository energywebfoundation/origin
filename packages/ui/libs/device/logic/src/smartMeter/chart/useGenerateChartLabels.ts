import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { TimeUnitPluralEnum } from '../../utils';
import { TUseGenerateChartLabelsArgs } from '../types';

dayjs.extend(timezone);

export const useGenerateChartLabels = ({
  start,
  end,
  multiplier,
  format,
}: TUseGenerateChartLabelsArgs) => {
  const labels: string[] = [];
  let current = start;

  while (dayjs(current).isBefore(dayjs(end))) {
    const formatted = dayjs(current).tz(undefined, true).format(format);

    const date = dayjs(current)
      .add(multiplier, TimeUnitPluralEnum.minutes)
      .toDate();
    labels.push(formatted);
    current = date;
  }
  return labels;
};
