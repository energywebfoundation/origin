import { ReadingsWindowEnum } from '@energyweb/origin-ui-device-data';
import dayjs from 'dayjs';
import { TSetDateBasedOnWindowArgs } from '../types';
import { getTimeUnitOnWindow } from '../../utils';

export const setDateBasedOnWindow = ({
  window,
  setStartDate,
  setEndDate,
}: TSetDateBasedOnWindowArgs) => {
  const unit = getTimeUnitOnWindow(window);

  setStartDate(dayjs().startOf(unit).toDate());
  setEndDate(dayjs().endOf(unit).toDate());
};

const createDecrementFunc = (
  window: ReadingsWindowEnum,
  start: Date,
  end: Date,
  setStart: (value: Date) => void,
  setEnd: (value: Date) => void
) => {
  const unit = getTimeUnitOnWindow(window);
  return () => {
    setStart(dayjs(start).subtract(1, unit).toDate());
    setEnd(dayjs(end).subtract(1, unit).toDate());
  };
};
const createIncrementFunc = (
  window: ReadingsWindowEnum,
  start: Date,
  end: Date,
  setStart: (value: Date) => void,
  setEnd: (value: Date) => void
) => {
  const unit = getTimeUnitOnWindow(window);
  return () => {
    setStart(dayjs(start).add(1, unit).toDate());
    setEnd(dayjs(end).add(1, unit).toDate());
  };
};

type TUseDateArrowHandlers = {
  window: ReadingsWindowEnum;
  startDate: Date;
  endDate: Date;
  setStartDate: (value: Date) => void;
  setEndDate: (value: Date) => void;
};

export const useDateArrowHandlers = ({
  window,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: TUseDateArrowHandlers) => {
  return {
    incrementDate: createIncrementFunc(
      window,
      startDate,
      endDate,
      setStartDate,
      setEndDate
    ),
    decrementDate: createDecrementFunc(
      window,
      startDate,
      endDate,
      setStartDate,
      setEndDate
    ),
  };
};
