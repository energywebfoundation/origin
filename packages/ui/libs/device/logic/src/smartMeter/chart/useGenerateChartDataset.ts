import { AggregatedReadDTO } from '@energyweb/origin-energy-api-react-query-client';
import { useTheme } from '@material-ui/core';

export const useGenerateChartDataset = (reads: AggregatedReadDTO[]) => {
  const theme = useTheme();
  const currentData = reads.map((read) => read.value);

  return [
    {
      data: currentData,
      backgroundColor: theme.palette.primary.main,
      label: 'Energy (MWh)',
    },
  ];
};
