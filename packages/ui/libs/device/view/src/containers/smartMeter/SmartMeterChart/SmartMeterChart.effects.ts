import {
  ReadingsWindowEnum,
  useSmartMeterReads,
} from '@energyweb/origin-ui-device-data';
import {
  setDateBasedOnWindow,
  useChartDataLogic,
  useDateArrowHandlers,
  useSmartMeterChartSelectors,
} from '@energyweb/origin-ui-device-logic';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

export const useSmartMeterChartsEffects = (meterId: string) => {
  const [window, setWindow] = useState(ReadingsWindowEnum.Day);
  const [startDate, setStartDate] = useState(dayjs().startOf('day').toDate());
  const [endDate, setEndDate] = useState(dayjs().endOf('day').toDate());

  useEffect(() => {
    setDateBasedOnWindow({ window, setStartDate, setEndDate });
  }, [window]);

  const { incrementDate, decrementDate } = useDateArrowHandlers({
    window,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  });

  const { reads } = useSmartMeterReads({
    meterId,
    start: startDate,
    end: endDate,
    window,
  });

  const chartData = useChartDataLogic({ reads, startDate, endDate, window });

  const { windowButtons, displayDate } = useSmartMeterChartSelectors({
    startDate,
    endDate,
    selectedWindow: window,
  });

  return {
    reads,
    windowButtons,
    displayDate,
    window,
    setWindow,
    incrementDate,
    decrementDate,
    chartData,
  };
};
