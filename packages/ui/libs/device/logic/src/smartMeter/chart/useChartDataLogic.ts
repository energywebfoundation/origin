import { TUseChartDataLogicArgs } from '../types';
import { intervalData } from './intervalData';
import { useGenerateChartDataset } from './useGenerateChartDataset';
import { useGenerateChartLabels } from './useGenerateChartLabels';

export const useChartDataLogic = ({
  reads,
  startDate,
  endDate,
  window,
}: TUseChartDataLogicArgs) => {
  const { multiplier, format } = intervalData[window];

  const dateFormat = 'YYYY-MM-DDTHH:mm';
  const datasets = useGenerateChartDataset(
    reads,
    startDate,
    endDate,
    multiplier,
    dateFormat
  );

  const labels = useGenerateChartLabels({
    start: startDate,
    end: endDate,
    multiplier,
    format,
  });

  return {
    datasets,
    labels,
  };
};
