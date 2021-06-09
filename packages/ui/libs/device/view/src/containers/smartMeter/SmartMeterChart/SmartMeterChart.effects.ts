import {
  ReadingsWindowEnum,
  useSmartMeterReads,
} from '@energyweb/origin-ui-device-data';
import { useSmartMeterChartSelectors } from '@energyweb/origin-ui-device-logic';
import dayjs from 'dayjs';
import { useState } from 'react';

export const useSmartMeterChartsEffects = (meterId: string) => {
  const [window, setWindow] = useState(ReadingsWindowEnum.Day);
  const [startDate, setStartDate] = useState(dayjs().startOf('day').toDate());
  const [endDate, setEndDate] = useState(dayjs().endOf('day').toDate());

  const { reads, isLoading } = useSmartMeterReads({
    meterId,
    start: startDate,
    end: endDate,
    window,
  });

  const { windowButtons, displayDate } = useSmartMeterChartSelectors({
    startDate,
    endDate,
    selectedWindow: window,
  });

  return { reads, windowButtons, displayDate, isLoading, window, setWindow };
};
