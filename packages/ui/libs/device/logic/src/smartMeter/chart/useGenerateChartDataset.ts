import { AggregatedReadDTO } from '@energyweb/origin-energy-api-react-query-client';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { DayJsTimeMultiplier } from '../../utils';

export const useGenerateChartDataset = (
  reads: AggregatedReadDTO[],
  start: Date,
  end: Date,
  multiplier: DayJsTimeMultiplier,
  format: string
) => {
  const theme = useTheme();
  const currentData: number[] = [];

  for (
    let current = start;
    current < end;
    current = dayjs(current).add(1, multiplier).toDate()
  ) {
    const currentRead = reads.find((read) => {
      return (
        dayjs(current).format(format) >= dayjs.utc(read.start).format(format) &&
        dayjs(current).format(format) < dayjs.utc(read.stop).format(format)
      );
    });
    currentData.push(currentRead?.value || 0);
  }

  return [
    {
      data: currentData,
      backgroundColor: theme.palette.primary.main,
      label: 'Energy (MWh)',
    },
  ];
};
