import {
  useReadsControllerGetReadsAggregates,
  Aggregate,
} from '@energyweb/origin-energy-api-react-query-client';
import dayjs from 'dayjs';

export enum ReadingsWindowEnum {
  Day = '1d',
  Week = '1w',
  Month = '1mo',
  Year = '1y',
}

type TUseSmartMeterReadsArgs = {
  meterId: string;
  start: Date;
  end: Date;
  window: ReadingsWindowEnum;
};

export const useSmartMeterReads = ({
  meterId,
  start,
  end,
  window,
}: TUseSmartMeterReadsArgs) => {
  const { data, isLoading } = useReadsControllerGetReadsAggregates(meterId, {
    start: dayjs(start).toISOString(),
    end: dayjs(end).toISOString(),
    window,
    aggregate: Aggregate.sum,
    difference: false,
  });

  const reads = data || [];

  return { reads, isLoading };
};
