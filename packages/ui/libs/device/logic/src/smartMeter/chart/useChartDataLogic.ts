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
  const datasets = useGenerateChartDataset(reads);

  const { multiplier, format } = intervalData[window];
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
