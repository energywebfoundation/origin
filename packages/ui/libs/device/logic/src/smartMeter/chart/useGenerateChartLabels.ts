import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TUseGenerateChartLabelsArgs } from '../types';

dayjs.extend(utc);
dayjs.extend(timezone);

export const useGenerateChartLabels = ({
  start,
  end,
  multiplier,
  format,
}: TUseGenerateChartLabelsArgs) => {
  const labels: string[] = [];
  for (
    let current = start;
    current < end;
    current = dayjs(current).add(1, multiplier).toDate()
  ) {
    const formatted = dayjs(current).format(format);
    labels.push(formatted);
  }
  return labels;
};
